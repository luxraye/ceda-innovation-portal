import { prisma } from "./prisma";
import { audit } from "./audit";
import { notify } from "./notify";
import type { CurrentUser } from "./auth";
import { pula } from "./format";

export type Outcome = "ADVANCE" | "DECLINE" | "AWARD" | "REQUEST_CHANGES";

/** Which roles may decide at each kind of stage. Separation of duties: the committee alone decides awards. */
export const STAGE_DECIDERS: Record<string, string[]> = {
  SCREENING: ["ADMIN"],
  PANEL: ["ADMIN", "ADJUDICATOR"],
  ADJUDICATION: ["ADJUDICATOR"],
  AWARD: [],
};

export async function decide(user: CurrentUser, submissionId: string, outcome: Outcome, rationale: string, awardAmount?: number) {
  const sub = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { stage: true, call: { include: { stages: { orderBy: { order: "asc" } } } } },
  });
  const stage = sub.stage ?? sub.call.stages[0];
  if (!stage) throw new Error("This call has no stages");
  if (!STAGE_DECIDERS[stage.kind]?.includes(user.role)) throw new Error(`Your role cannot decide at the ${stage.name} stage`);
  if (["DRAFT", "WITHDRAWN", "DECLINED", "AWARDED"].includes(sub.status)) throw new Error("This submission is not open for decisions");
  if (rationale.trim().length < 10) throw new Error("Write a short reason (at least 10 characters). The applicant will see it.");

  const idx = sub.call.stages.findIndex((s) => s.id === stage.id);
  const next = sub.call.stages[idx + 1];
  let status = sub.status;
  let stageId = stage.id;
  let label = "";
  let ownerTitle = "";
  let ownerBody = "";

  if (outcome === "ADVANCE") {
    if (!next || next.kind === "AWARD") throw new Error("This is the last review stage. Award or decline instead.");
    stageId = next.id;
    status = "IN_REVIEW";
    label = `Advanced to ${next.name}`;
    ownerTitle = `Good news: ${sub.reference} moved to ${next.name}`;
    ownerBody = `Your idea "${sub.title}" passed ${stage.name}.`;
  } else if (outcome === "AWARD") {
    if (stage.kind !== "ADJUDICATION") throw new Error("Only the committee stage can award");
    const awardStage = sub.call.stages.find((s) => s.kind === "AWARD");
    if (!awardAmount || awardAmount <= 0) throw new Error("Enter the award amount");
    stageId = awardStage?.id ?? stage.id;
    status = "AWARDED";
    label = `Awarded ${pula(awardAmount)}`;
    ownerTitle = `You've been awarded ${pula(awardAmount)}`;
    ownerBody = `The CEDA innovation committee selected "${sub.title}".`;
  } else if (outcome === "DECLINE") {
    status = "DECLINED";
    label = `Not selected at ${stage.name}`;
    ownerTitle = `Decision on ${sub.reference}`;
    ownerBody = "Your idea was not selected this time. Read the feedback in Sky.";
  } else {
    status = "CHANGES_REQUESTED";
    label = "Changes requested";
    ownerTitle = `Action needed on ${sub.reference}`;
    ownerBody = "The panel asked you to improve your submission. Review the feedback and resubmit.";
  }

  await prisma.$transaction([
    prisma.decision.create({ data: { submissionId, stageId: stage.id, deciderId: user.id, outcome, rationale: rationale.trim(), awardAmount: outcome === "AWARD" ? awardAmount : null } }),
    prisma.submission.update({ where: { id: submissionId }, data: { status, stageId, awardAmount: outcome === "AWARD" ? awardAmount : sub.awardAmount } }),
    prisma.stageEvent.create({ data: { submissionId, stageName: outcome === "ADVANCE" && next ? next.name : stage.name, status, label, note: rationale.trim(), actorId: user.id } }),
    prisma.feedback.create({
      data: {
        submissionId,
        authorId: user.id,
        body: rationale.trim(),
        kind: outcome === "REQUEST_CHANGES" ? "CHANGE_REQUEST" : "COMMENT",
        visibility: "APPLICANT",
      },
    }),
  ]);
  await audit({ actorId: user.id, actorRole: user.role, action: `decision.${outcome.toLowerCase()}`, entity: "Submission", entityId: submissionId, meta: { stage: stage.name, awardAmount: awardAmount ?? null } });
  await notify({
    userId: sub.ownerId,
    title: ownerTitle,
    body: ownerBody,
    href: `/app/innovator/submissions/${submissionId}`,
    kind: outcome === "DECLINE" ? "WARNING" : outcome === "REQUEST_CHANGES" ? "ACTION" : "SUCCESS",
    channels: ["IN_APP", "EMAIL", "SMS"],
  });
  return { status, label };
}
