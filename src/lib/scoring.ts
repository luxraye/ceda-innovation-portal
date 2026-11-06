// Panel scoring maths. Raw scores are weighted per criterion; then each
// evaluator's scores are normalised so a harsh and a generous judge count equally.

export type ScoreRow = { evaluatorId: string; submissionId: string; criterionId: string; value: number };
export type CriterionLite = { id: string; weight: number; maxScore: number };

export function weightedTotal(scores: { criterionId: string; value: number }[], criteria: CriterionLite[]) {
  let total = 0;
  for (const c of criteria) {
    const s = scores.find((x) => x.criterionId === c.id);
    if (s) total += (s.value / c.maxScore) * c.weight;
  }
  return Math.round(total * 10) / 10; // 0..100
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const stdev = (xs: number[]) => {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};

export type Ranked = {
  submissionId: string;
  raw: number; // mean weighted score 0..100
  normalised: number; // mean z-score rescaled to 0..100 around 50
  spread: number; // stdev of evaluator totals
  reviewers: number;
  totals: { evaluatorId: string; total: number }[];
  flagged: boolean; // panel disagrees strongly
};

export function rankSubmissions(rows: ScoreRow[], criteria: CriterionLite[], spreadThreshold = 15): Ranked[] {
  // evaluator -> submission -> total
  const totals = new Map<string, Map<string, number>>();
  const byPair = new Map<string, ScoreRow[]>();
  for (const r of rows) {
    const k = `${r.evaluatorId}::${r.submissionId}`;
    byPair.set(k, [...(byPair.get(k) ?? []), r]);
  }
  for (const [k, list] of byPair) {
    const [ev, sub] = k.split("::");
    if (!totals.has(ev)) totals.set(ev, new Map());
    totals.get(ev)!.set(sub, weightedTotal(list, criteria));
  }
  // per-evaluator mean and stdev for z-scores
  const stats = new Map<string, { m: number; s: number }>();
  for (const [ev, subs] of totals) {
    const vals = [...subs.values()];
    stats.set(ev, { m: mean(vals), s: stdev(vals) });
  }
  const subs = new Set(rows.map((r) => r.submissionId));
  const out: Ranked[] = [];
  for (const sub of subs) {
    const t: { evaluatorId: string; total: number }[] = [];
    const z: number[] = [];
    for (const [ev, m] of totals) {
      const v = m.get(sub);
      if (v === undefined) continue;
      t.push({ evaluatorId: ev, total: v });
      const st = stats.get(ev)!;
      z.push(st.s > 0 ? (v - st.m) / st.s : 0);
    }
    const raw = Math.round(mean(t.map((x) => x.total)) * 10) / 10;
    const normalised = Math.max(0, Math.min(100, Math.round((50 + mean(z) * 15) * 10) / 10));
    const spread = Math.round(stdev(t.map((x) => x.total)) * 10) / 10;
    out.push({ submissionId: sub, raw, normalised, spread, reviewers: t.length, totals: t, flagged: spread >= spreadThreshold });
  }
  return out.sort((a, b) => b.normalised - a.normalised || b.raw - a.raw);
}
