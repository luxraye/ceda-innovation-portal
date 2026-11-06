import { prisma } from "./prisma";
import type { CurrentUser } from "./auth";

/**
 * Object-level access: who may see a given submission.
 * Innovators: their own. Evaluators: only if assigned and not conflicted.
 * Adjudicators and admins: all. DPO: all (for rights requests), always audited.
 */
export async function canViewSubmission(user: CurrentUser, submissionId: string) {
  const sub = await prisma.submission.findUnique({ where: { id: submissionId }, select: { ownerId: true } });
  if (!sub) return false;
  switch (user.role) {
    case "INNOVATOR":
      return sub.ownerId === user.id;
    case "EVALUATOR": {
      const a = await prisma.assignment.findFirst({ where: { submissionId, evaluatorId: user.id, status: { not: "CONFLICT" } } });
      return !!a;
    }
    case "ADJUDICATOR":
    case "ADMIN":
    case "DPO":
      return true;
    default:
      return false;
  }
}
