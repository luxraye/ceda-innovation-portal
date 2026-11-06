import { prisma } from "./prisma";
import { rankSubmissions, type Ranked } from "./scoring";

/** Ranks every scored idea in a call, using completed panel scores from all panel stages. */
export async function callRanking(callId: string): Promise<Map<string, Ranked>> {
  const [criteria, scores] = await Promise.all([
    prisma.criterion.findMany({ where: { callId } }),
    prisma.score.findMany({
      where: { assignment: { status: "DONE", submission: { callId } } },
      include: { assignment: { select: { evaluatorId: true, submissionId: true } } },
    }),
  ]);
  const rows = scores.map((s) => ({ evaluatorId: s.assignment.evaluatorId, submissionId: s.assignment.submissionId, criterionId: s.criterionId, value: s.value }));
  return new Map(rankSubmissions(rows, criteria).map((r) => [r.submissionId, r]));
}
