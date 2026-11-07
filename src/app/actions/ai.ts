"use server";

import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { aiThrottle, panelBrief, pitchCoach, type BriefResult, type CoachResult } from "@/lib/ai";
import { parseJson } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import type { FormField } from "@/lib/domain";

// Sections that would reveal who the applicant is. Never sent for a blind review.
const IDENTITY_SECTIONS = ["Your team"];
const MAX_ANSWER = 6000;

type Err = { error: string };

function clean(values: Record<string, unknown>, fields: FormField[]) {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (v !== undefined && v !== null) out[f.key] = String(v).slice(0, f.maxLength ?? MAX_ANSWER);
  }
  return out;
}

/** Pitch Coach: the applicant's own draft, checked against the call rubric. */
export async function coachMyPitch(submissionId: string, values: Record<string, unknown>): Promise<CoachResult | Err> {
  const user = await assertRole("INNOVATOR");
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { call: { include: { criteria: { orderBy: { order: "asc" } } } } },
  });
  if (!sub || sub.ownerId !== user.id) return { error: "Submission not found" };
  if (!aiThrottle(user.id)) return { error: "You've asked a lot in the last minute. Try again shortly." };
  const fields = parseJson<FormField[]>(sub.call.formSchema, []);
  const result = await pitchCoach(fields, clean(values, fields), sub.call.criteria, sub.call.title);
  await audit({ actorId: user.id, actorRole: user.role, action: "ai.pitch_coach", entity: "Submission", entityId: sub.id, meta: { source: result.source, readiness: result.readiness } });
  return result;
}

/**
 * Panel Brief for reviewers. Evaluators only get it for an idea assigned to them,
 * after their conflict declaration, and only from the blind (identity-free) answers.
 */
export async function briefForPanel(submissionId: string): Promise<BriefResult | Err> {
  const user = await assertRole("EVALUATOR", "ADJUDICATOR", "ADMIN");
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { call: { include: { criteria: { orderBy: { order: "asc" } } } }, versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!sub || !sub.versions[0]) return { error: "Submission not found" };
  if (user.role === "EVALUATOR") {
    const a = await prisma.assignment.findFirst({ where: { submissionId, evaluatorId: user.id, coiDeclaredAt: { not: null }, status: { not: "CONFLICT" } } });
    if (!a) return { error: "This idea isn't assigned to you" };
  }
  if (!aiThrottle(user.id)) return { error: "You've asked a lot in the last minute. Try again shortly." };
  // Every brief is blind, even for the committee, so it can't colour a decision.
  const fields = parseJson<FormField[]>(sub.call.formSchema, []).filter((f) => !IDENTITY_SECTIONS.includes(f.section));
  const result = await panelBrief(fields, clean(answersOf(sub.versions[0].payload), fields), sub.call.criteria, sub.call.title);
  await audit({ actorId: user.id, actorRole: user.role, action: "ai.panel_brief", entity: "Submission", entityId: sub.id, meta: { source: result.source, version: sub.versions[0].version } });
  return result;
}
