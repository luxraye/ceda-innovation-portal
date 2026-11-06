import { prisma } from "./prisma";
import { callRanking } from "./ranking";

export async function buildReport(callId?: string) {
  const where = { status: { not: "DRAFT" }, ...(callId ? { callId } : {}) };
  const subs = await prisma.submission.findMany({
    where,
    include: { org: true, owner: true, stage: true, events: { orderBy: { createdAt: "asc" } }, call: { include: { stages: { orderBy: { order: "asc" } } } } },
  });
  const count = (key: (s: (typeof subs)[number]) => string) => {
    const m = new Map<string, number>();
    for (const s of subs) m.set(key(s), (m.get(key(s)) ?? 0) + 1);
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  // Funnel: how many ideas reached each stage order (any call).
  const reached = (minOrder: number) => subs.filter((s) => (s.stage?.order ?? 1) >= minOrder || s.status === "AWARDED").length;
  const funnel = [
    { stage: "Submitted", count: subs.length },
    { stage: "Passed screening", count: reached(2) },
    { stage: "Reached committee", count: reached(3) },
    { stage: "Awarded", count: subs.filter((s) => s.status === "AWARDED").length },
  ];

  // Time in stage: gap between consecutive stage events.
  const durations = new Map<string, number[]>();
  for (const s of subs) {
    for (let i = 0; i < s.events.length - 1; i++) {
      const e = s.events[i];
      const days = (s.events[i + 1].createdAt.getTime() - e.createdAt.getTime()) / 86400000;
      durations.set(e.stageName, [...(durations.get(e.stageName) ?? []), days]);
    }
  }
  const stageOrder = ["Eligibility screening", "Panel evaluation", "Committee adjudication"];
  const timeInStage = stageOrder.map((name) => {
    const d = durations.get(name) ?? [];
    return { stage: name.split(" ")[0], days: d.length ? Math.round((d.reduce((a, b) => a + b, 0) / d.length) * 10) / 10 : 0 };
  });

  // Score distribution (normalised), across calls.
  const callIds = [...new Set(subs.map((s) => s.callId))];
  const rankings = await Promise.all(callIds.map((id) => callRanking(id)));
  const scores = rankings.flatMap((m) => [...m.values()].map((r) => r.raw));
  const bands = ["0-39", "40-49", "50-59", "60-69", "70-79", "80-100"];
  const bandOf = (x: number) => (x < 40 ? 0 : x < 50 ? 1 : x < 60 ? 2 : x < 70 ? 3 : x < 80 ? 4 : 5);
  const scoreBands = bands.map((b, i) => ({ band: b, ideas: scores.filter((x) => bandOf(x) === i).length }));

  // Submissions per week.
  const weeks = new Map<string, number>();
  for (const s of subs) {
    if (!s.submittedAt) continue;
    const d = new Date(s.submittedAt);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    const k = d.toISOString().slice(0, 10);
    weeks.set(k, (weeks.get(k) ?? 0) + 1);
  }
  const perWeek = [...weeks.entries()].sort().map(([week, ideas]) => ({ week: week.slice(5), ideas }));

  const awarded = subs.filter((s) => s.status === "AWARDED");
  return {
    total: subs.length,
    awardedCount: awarded.length,
    awardedSum: awarded.reduce((a, s) => a + (s.awardAmount ?? 0), 0),
    jobs: 0,
    femaleShare: subs.length ? Math.round((subs.filter((s) => s.owner.gender === "Female").length / subs.length) * 100) : 0,
    districts: count((s) => s.org.district),
    sectors: count((s) => s.sector || "Other"),
    gender: count((s) => s.owner.gender ?? "Not given"),
    status: count((s) => s.status),
    funnel,
    timeInStage,
    scoreBands,
    perWeek,
    avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
    subs,
  };
}
