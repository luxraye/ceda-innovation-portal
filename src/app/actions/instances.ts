"use server";

import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { checkInstance, type InstanceCheck } from "@/lib/integrity";

/** Re-verify one idea instance end to end. Staff only, and every run is audited. */
export async function runTamperCheck(submissionId: string): Promise<InstanceCheck | { error: string }> {
  const user = await assertRole("ADMIN", "ADJUDICATOR", "DPO");
  const result = await checkInstance(submissionId);
  if (!result) return { error: "This idea has no sealed version yet." };
  await audit({
    actorId: user.id,
    actorRole: user.role,
    action: result.ok ? "instance.verified" : "instance.tamper_detected",
    entity: "Submission",
    entityId: submissionId,
    meta: { version: result.version, failed: result.checks.filter((c) => !c.ok).map((c) => c.label) },
  });
  return result;
}
