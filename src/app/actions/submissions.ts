"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notify, notifyMany } from "@/lib/notify";
import { encryptFile, sha256 } from "@/lib/crypto";
import { parseJson } from "@/lib/format";
import { ALLOWED_MIME, MAX_FILE_BYTES, nextReference, sealVersion, validatePayload, type Payload } from "@/lib/submission";
import type { FormField } from "@/lib/domain";

async function ownSubmission(userId: string, id: string) {
  const sub = await prisma.submission.findUnique({ where: { id }, include: { call: { include: { stages: true } }, files: true } });
  if (!sub || sub.ownerId !== userId) throw new Error("Submission not found");
  return sub;
}

export async function startApplication(callId: string) {
  const user = await assertRole("INNOVATOR");
  if (!user.orgId) throw new Error("Your account has no company");
  if (user.restricted) throw new Error("Processing of your data is restricted. Contact the DPO.");
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call || call.status !== "OPEN") throw new Error("This call is not open");
  const existing = await prisma.submission.findFirst({
    where: { callId, ownerId: user.id, status: { in: ["DRAFT", "CHANGES_REQUESTED"] } },
  });
  if (existing) redirect(`/app/innovator/submissions/${existing.id}/edit`);
  const sub = await prisma.submission.create({
    data: {
      reference: await nextReference(),
      callId,
      orgId: user.orgId,
      ownerId: user.id,
      title: "Untitled idea",
      summary: "",
      sector: user.org?.sector ?? "",
      draft: "{}",
    },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: "submission.started", entity: "Submission", entityId: sub.id, meta: { call: call.slug } });
  redirect(`/app/innovator/submissions/${sub.id}/edit`);
}

export async function saveDraft(id: string, payload: Payload) {
  const user = await assertRole("INNOVATOR");
  const sub = await ownSubmission(user.id, id);
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(sub.status)) throw new Error("This submission is locked");
  await prisma.submission.update({
    where: { id },
    data: {
      draft: JSON.stringify(payload),
      title: payload.title?.trim() || "Untitled idea",
      summary: payload.summary?.trim() ?? "",
      sector: payload.sector?.trim() || sub.sector,
    },
  });
  return { savedAt: new Date().toISOString() };
}

export async function uploadFile(form: FormData) {
  const user = await assertRole("INNOVATOR");
  const id = String(form.get("submissionId"));
  const slot = String(form.get("slot"));
  const file = form.get("file");
  const clientHash = String(form.get("clientHash") ?? "");
  const sub = await ownSubmission(user.id, id);
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(sub.status)) return { error: "This submission is locked" };
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file" };
  if (file.size > MAX_FILE_BYTES) return { error: "Files must be 8 MB or smaller" };
  if (!ALLOWED_MIME[file.type]) return { error: "Use PDF, PNG, JPEG, PowerPoint, Word or Excel" };
  const bytes = Buffer.from(await file.arrayBuffer());
  const hash = sha256(bytes);
  if (clientHash && clientHash !== hash) return { error: "The file changed in transit. Please try again." };
  const enc = encryptFile(bytes);
  await prisma.submissionFile.deleteMany({ where: { submissionId: id, slot } });
  const saved = await prisma.submissionFile.create({
    data: { submissionId: id, slot, fileName: file.name.slice(0, 120), mimeType: file.type, size: file.size, sha256: hash, iv: enc.iv, authTag: enc.authTag, data: enc.data },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: "file.uploaded", entity: "SubmissionFile", entityId: saved.id, meta: { slot, sha256: hash, size: file.size } });
  revalidatePath(`/app/innovator/submissions/${id}/edit`);
  return { ok: true, file: { id: saved.id, slot, fileName: saved.fileName, size: saved.size, sha256: hash } };
}

export async function submitApplication(id: string, payload: Payload) {
  const user = await assertRole("INNOVATOR");
  const sub = await ownSubmission(user.id, id);
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(sub.status)) return { errors: { _: "This submission is already submitted" } };
  if (sub.call.status !== "OPEN" && sub.status === "DRAFT") return { errors: { _: "This call has closed" } };
  const fields = parseJson<FormField[]>(sub.call.formSchema, []);
  const errors = validatePayload(fields, payload, new Set(sub.files.map((f) => f.slot)));
  if (Object.keys(errors).length) return { errors };

  await saveDraft(id, payload);
  const resubmission = sub.status === "CHANGES_REQUESTED";
  const v = await sealVersion(id, payload, resubmission ? "Resubmitted after feedback" : "First submission");
  const first = [...sub.call.stages].sort((a, b) => a.order - b.order)[0];
  const stageId = resubmission ? sub.stageId : first?.id;
  const stageName = sub.call.stages.find((s) => s.id === stageId)?.name ?? "Submitted";
  await prisma.$transaction([
    prisma.submission.update({
      where: { id },
      data: { status: resubmission ? "IN_REVIEW" : "SUBMITTED", stageId, currentVersion: v.version, submittedAt: sub.submittedAt ?? new Date() },
    }),
    prisma.stageEvent.create({
      data: {
        submissionId: id,
        stageName,
        status: resubmission ? "IN_REVIEW" : "SUBMITTED",
        label: resubmission ? `Version ${v.version} resubmitted` : "Idea submitted",
        note: `Sealed with SHA-256 ${v.sha256.slice(0, 12)}...`,
        actorId: user.id,
      },
    }),
    prisma.feedback.updateMany({ where: { submissionId: id, kind: "CHANGE_REQUEST", resolved: false }, data: { resolved: true } }),
  ]);
  await audit({ actorId: user.id, actorRole: user.role, action: resubmission ? "submission.resubmitted" : "submission.submitted", entity: "Submission", entityId: id, meta: { version: v.version, sha256: v.sha256 } });
  await notify({
    userId: user.id,
    title: resubmission ? `Version ${v.version} received` : "Submission received",
    body: `${sub.reference} is sealed. Your receipt is ready. We'll notify you at every stage.`,
    href: `/app/innovator/submissions/${id}`,
    kind: "SUCCESS",
    channels: ["IN_APP", "EMAIL", "SMS"],
  });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await notifyMany(admins.map((a) => a.id), {
    title: resubmission ? "Resubmission ready for review" : "New submission",
    body: `${sub.reference} · ${payload.title ?? sub.title}`,
    href: `/app/admin/submissions/${id}`,
    kind: "ACTION",
    channels: ["IN_APP"],
  });
  if (resubmission) {
    const panel = await prisma.assignment.findMany({ where: { submissionId: id, stageId: sub.stageId ?? "" }, select: { evaluatorId: true } });
    await notifyMany(panel.map((p) => p.evaluatorId), {
      title: "An idea you reviewed was updated",
      body: `${sub.reference} has a new version after feedback.`,
      href: `/app/evaluator`,
      kind: "INFO",
      channels: ["IN_APP"],
    });
  }
  revalidatePath("/app/innovator");
  return { ok: true, version: v.version };
}

export async function replyToFeedback(form: FormData) {
  const user = await assertRole("INNOVATOR");
  const id = String(form.get("submissionId"));
  const body = String(form.get("body") ?? "").trim();
  const criterionId = String(form.get("criterionId") ?? "") || null;
  if (body.length < 2) return;
  const sub = await ownSubmission(user.id, id);
  await prisma.feedback.create({ data: { submissionId: id, authorId: user.id, body: body.slice(0, 2000), kind: "RESPONSE", criterionId, visibility: "APPLICANT" } });
  await audit({ actorId: user.id, actorRole: user.role, action: "feedback.replied", entity: "Submission", entityId: id });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await notifyMany(admins.map((a) => a.id), { title: "Applicant replied to feedback", body: sub.reference, href: `/app/admin/submissions/${id}`, kind: "INFO", channels: ["IN_APP"] });
  revalidatePath(`/app/innovator/submissions/${id}`);
}

export async function withdrawSubmission(form: FormData) {
  const user = await assertRole("INNOVATOR");
  const id = String(form.get("submissionId"));
  const sub = await ownSubmission(user.id, id);
  if (["AWARDED", "DECLINED", "WITHDRAWN"].includes(sub.status)) return;
  await prisma.submission.update({ where: { id }, data: { status: "WITHDRAWN" } });
  await prisma.stageEvent.create({ data: { submissionId: id, stageName: "Withdrawn", status: "WITHDRAWN", label: "Withdrawn by applicant", actorId: user.id } });
  await audit({ actorId: user.id, actorRole: user.role, action: "submission.withdrawn", entity: "Submission", entityId: id });
  revalidatePath(`/app/innovator/submissions/${id}`);
}
