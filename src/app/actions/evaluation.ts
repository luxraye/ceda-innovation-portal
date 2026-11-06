"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notify, notifyMany } from "@/lib/notify";
import { decide, type Outcome } from "@/lib/workflow";

async function myAssignment(userId: string, id: string) {
  const a = await prisma.assignment.findUnique({ where: { id }, include: { submission: true, stage: true } });
  if (!a || a.evaluatorId !== userId) throw new Error("Assignment not found");
  return a;
}

export async function declareConflict(form: FormData) {
  const user = await assertRole("EVALUATOR");
  const id = String(form.get("assignmentId"));
  const conflict = form.get("conflict") === "yes";
  const note = String(form.get("note") ?? "").slice(0, 500);
  const a = await myAssignment(user.id, id);
  await prisma.assignment.update({
    where: { id },
    data: { coiDeclaredAt: new Date(), status: conflict ? "CONFLICT" : "IN_PROGRESS", conflictNote: conflict ? note || "Conflict declared" : null },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: conflict ? "coi.declared_conflict" : "coi.declared_none", entity: "Assignment", entityId: id, meta: { submission: a.submission.reference } });
  if (conflict) {
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
    await notifyMany(admins.map((x) => x.id), { title: "Evaluator declared a conflict", body: `${a.submission.reference} needs another evaluator.`, href: `/app/admin/submissions/${a.submissionId}`, kind: "ACTION", channels: ["IN_APP", "EMAIL"] });
    redirect("/app/evaluator?conflict=1");
  }
  revalidatePath(`/app/evaluator/review/${id}`);
}

export type ScoreInput = { criterionId: string; value: number; comment: string; share: boolean };

export async function saveScores(assignmentId: string, scores: ScoreInput[], overall: string, final: boolean) {
  const user = await assertRole("EVALUATOR");
  const a = await myAssignment(user.id, assignmentId);
  if (a.status === "CONFLICT") throw new Error("You declared a conflict on this idea");
  if (!a.coiDeclaredAt) throw new Error("Declare conflicts of interest first");
  if (a.status === "DONE") throw new Error("Scores already submitted");
  const criteria = await prisma.criterion.findMany({ where: { callId: a.submission.callId } });
  for (const s of scores) {
    const c = criteria.find((x) => x.id === s.criterionId);
    if (!c || !Number.isInteger(s.value) || s.value < 0 || s.value > c.maxScore) throw new Error("Invalid score");
  }
  if (final && scores.length !== criteria.length) throw new Error("Score every criterion before submitting");
  await prisma.$transaction([
    ...scores.map((s) =>
      prisma.score.upsert({
        where: { assignmentId_criterionId: { assignmentId, criterionId: s.criterionId } },
        update: { value: s.value, comment: s.comment.slice(0, 1000) || null },
        create: { assignmentId, criterionId: s.criterionId, value: s.value, comment: s.comment.slice(0, 1000) || null },
      }),
    ),
    prisma.assignment.update({ where: { id: assignmentId }, data: { overall: overall.slice(0, 2000) || null, status: final ? "DONE" : "IN_PROGRESS", completedAt: final ? new Date() : null } }),
  ]);
  if (final) {
    const shared = scores.filter((s) => s.share && s.comment.trim().length > 2);
    if (shared.length) {
      await prisma.feedback.createMany({ data: shared.map((s) => ({ submissionId: a.submissionId, authorId: user.id, criterionId: s.criterionId, body: s.comment.trim(), kind: "COMMENT", visibility: "APPLICANT" })) });
      await notify({ userId: a.submission.ownerId, title: "New feedback on your idea", body: `A panel evaluator commented on ${a.submission.reference}.`, href: `/app/innovator/submissions/${a.submissionId}#feedback`, kind: "INFO" });
    }
    if (overall.trim()) {
      await prisma.feedback.create({ data: { submissionId: a.submissionId, authorId: user.id, body: overall.trim(), kind: "COMMENT", visibility: "PANEL" } });
    }
    await audit({ actorId: user.id, actorRole: user.role, action: "scores.submitted", entity: "Assignment", entityId: assignmentId, meta: { submission: a.submission.reference, criteria: scores.length } });
    const remaining = await prisma.assignment.count({ where: { submissionId: a.submissionId, stageId: a.stageId, status: { in: ["PENDING", "IN_PROGRESS"] } } });
    if (remaining === 0) {
      const leads = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "ADJUDICATOR"] } }, select: { id: true } });
      await notifyMany(leads.map((x) => x.id), { title: "Panel review complete", body: `${a.submission.reference} has all scores in and is ready for a decision.`, href: `/app/adjudicator/submissions/${a.submissionId}`, kind: "ACTION", channels: ["IN_APP"] });
    }
  }
  revalidatePath("/app/evaluator");
  return { ok: true };
}

export async function makeDecision(form: FormData) {
  const user = await assertRole("ADMIN", "ADJUDICATOR");
  const id = String(form.get("submissionId"));
  const outcome = String(form.get("outcome")) as Outcome;
  const rationale = String(form.get("rationale") ?? "");
  const amount = Number(form.get("awardAmount") ?? 0) || undefined;
  const back = String(form.get("back") ?? "");
  if (!["ADVANCE", "DECLINE", "AWARD", "REQUEST_CHANGES"].includes(outcome)) throw new Error("Unknown outcome");
  try {
    await decide(user, id, outcome, rationale, amount);
  } catch (e) {
    redirect(`${back || "/app"}?error=${encodeURIComponent((e as Error).message)}`);
  }
  revalidatePath("/app", "layout");
  redirect(`${back || "/app"}?done=${outcome}`);
}

export async function assignEvaluators(form: FormData) {
  const user = await assertRole("ADMIN");
  const id = String(form.get("submissionId"));
  const evaluatorIds = form.getAll("evaluatorId").map(String);
  const days = Number(form.get("days") ?? 7);
  const sub = await prisma.submission.findUniqueOrThrow({ where: { id }, include: { stage: true } });
  if (!sub.stageId || sub.stage?.kind !== "PANEL") throw new Error("Assign evaluators when the idea is at a panel stage");
  const valid = await prisma.user.findMany({ where: { id: { in: evaluatorIds }, role: "EVALUATOR" } });
  for (const ev of valid) {
    await prisma.assignment.upsert({
      where: { submissionId_stageId_evaluatorId: { submissionId: id, stageId: sub.stageId, evaluatorId: ev.id } },
      update: {},
      create: { submissionId: id, stageId: sub.stageId, evaluatorId: ev.id, dueAt: new Date(Date.now() + days * 86400000) },
    });
    await notify({ userId: ev.id, title: "New idea to review", body: `${sub.reference} is waiting in your queue. Due in ${days} days.`, href: "/app/evaluator", kind: "ACTION", channels: ["IN_APP", "EMAIL"] });
  }
  await audit({ actorId: user.id, actorRole: user.role, action: "panel.assigned", entity: "Submission", entityId: id, meta: { evaluators: valid.map((v) => v.id) } });
  revalidatePath(`/app/admin/submissions/${id}`);
}

export async function addStaffComment(form: FormData) {
  const user = await assertRole("ADMIN", "ADJUDICATOR");
  const id = String(form.get("submissionId"));
  const body = String(form.get("body") ?? "").trim();
  const visibility = form.get("visibility") === "APPLICANT" ? "APPLICANT" : "PANEL";
  const back = String(form.get("back") ?? `/app/admin/submissions/${id}`);
  if (body.length < 2) return;
  const sub = await prisma.submission.findUniqueOrThrow({ where: { id } });
  await prisma.feedback.create({ data: { submissionId: id, authorId: user.id, body: body.slice(0, 2000), visibility } });
  if (visibility === "APPLICANT") await notify({ userId: sub.ownerId, title: "CEDA sent you a message", body: `About ${sub.reference}`, href: `/app/innovator/submissions/${id}#feedback`, kind: "INFO" });
  await audit({ actorId: user.id, actorRole: user.role, action: "feedback.staff_comment", entity: "Submission", entityId: id, meta: { visibility } });
  revalidatePath(back);
}
