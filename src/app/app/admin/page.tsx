import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NightEyebrow, Req, Stat, WorkspaceHero } from "@/components/ui";
import { OverviewCharts } from "@/components/overview-charts";
import { daysUntil, fmtDate, pula, timeAgo } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import { weightedTotal } from "@/lib/scoring";
import { PHOTOS } from "@/lib/photos";

export const metadata = { title: "Programme overview" };

export default async function AdminHome() {
  await requireRole("ADMIN");
  const [calls, submitted, inReview, awarded, unassigned, stuck, activity, conflicts, live, assignments, evaluatorCount] = await Promise.all([
    prisma.call.findMany({ orderBy: { closesAt: "asc" }, include: { _count: { select: { submissions: { where: { status: { not: "DRAFT" } } } } } } }),
    prisma.submission.count({ where: { status: { not: "DRAFT" } } }),
    prisma.submission.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } } }),
    prisma.submission.aggregate({ where: { status: "AWARDED" }, _count: true, _sum: { awardAmount: true } }),
    prisma.submission.findMany({ where: { stage: { kind: "PANEL" }, status: { in: ["SUBMITTED", "IN_REVIEW"] }, assignments: { none: {} } }, include: { call: true }, take: 6 }),
    prisma.submission.findMany({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] }, updatedAt: { lt: new Date(Date.now() - 10 * 86400000) } }, include: { stage: true }, take: 6 }),
    prisma.auditLog.findMany({ orderBy: { seq: "desc" }, take: 8, include: { actor: true } }),
    prisma.assignment.findMany({ where: { status: "CONFLICT" }, include: { submission: true, evaluator: true }, take: 5 }),
    prisma.submission.findMany({ where: { status: { not: "DRAFT" } }, select: { status: true, sector: true, stage: { select: { kind: true } }, versions: { orderBy: { version: "desc" }, take: 1, select: { payload: true } } } }),
    prisma.assignment.findMany({ where: { status: { not: "CONFLICT" } }, select: { status: true, createdAt: true, completedAt: true, scores: { select: { criterionId: true, value: true } }, submission: { select: { call: { select: { criteria: { select: { id: true, weight: true, maxScore: true } } } } } } } }),
    prisma.user.count({ where: { role: "EVALUATOR" } }),
  ]);
  // Headline numbers, worked out from live data.
  const openEvals = assignments.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS").length;
  const finished = assignments.filter((a) => a.status === "DONE");
  const avg = (xs: number[]) => (xs.length ? xs.reduce((x, y) => x + y, 0) / xs.length : 0);
  const avgScore = avg(finished.map((a) => weightedTotal(a.scores, a.submission.call.criteria)));
  const turnaround = avg(finished.filter((a) => a.completedAt).map((a) => (a.completedAt!.getTime() - a.createdAt.getTime()) / 86400000));
  const requested = live.reduce((t, x) => t + (Number(answersOf(x.versions[0]?.payload).funding) || 0), 0);
  const inPipeline = live.filter((x) => !["DECLINED", "AWARDED", "WITHDRAWN"].includes(x.status));
  const STAGE_LABELS: [string, string][] = [["SCREENING", "Screening"], ["PANEL", "Panel"], ["ADJUDICATION", "Committee"]];
  const stages = [
    ...STAGE_LABELS.map(([k, name]) => ({ name, value: inPipeline.filter((x) => (x.stage?.kind ?? "SCREENING") === k).length })),
    { name: "Not selected", value: live.filter((x) => x.status === "DECLINED").length },
    { name: "Awarded", value: live.filter((x) => x.status === "AWARDED").length },
  ];
  const sectorMap = new Map<string, number>();
  for (const x of live) sectorMap.set(x.sector || "Other", (sectorMap.get(x.sector || "Other") ?? 0) + 1);
  const sectors = [...sectorMap.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  const alerts = [
    ...unassigned.map((s) => ({ href: `/app/admin/submissions/${s.id}`, text: `${s.reference} is at panel stage with no evaluators` })),
    ...conflicts.map((c) => ({ href: `/app/admin/submissions/${c.submissionId}`, text: `${c.evaluator.name} declared a conflict on ${c.submission.reference}` })),
    ...stuck.map((s) => ({ href: `/app/admin/submissions/${s.id}`, text: `${s.reference} has been in ${s.stage?.name ?? "review"} for over 10 days` })),
  ];
  return (
    <div>
      <WorkspaceHero
        photo={PHOTOS.city}
        eyebrow={<><NightEyebrow>Programme overview</NightEyebrow><Req k="c" /><Req k="f" /></>}
        title={`${inPipeline.length} ideas in the pipeline,`}
        accent={`${openEvals} reviews open.`}
        subtitle={`${calls.filter((c) => c.status === "OPEN").length} calls taking ideas · ${alerts.length ? `${alerts.length} item${alerts.length === 1 ? "" : "s"} need your attention` : "nothing waiting on you"}. Click a chart to drill into the pipeline.`}
        actions={<><Link href="/app/admin/pipeline" className="btn-light">Pipeline board <ArrowRight className="h-4 w-4" /></Link><Link href="/app/admin/calls/new" className="btn-glass">New call</Link><Link href="/app/reports" className="btn-glass">Reports</Link></>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ideas submitted" value={submitted} hint={`${live.length - inPipeline.length} decided`} accent />
        <Stat label="In review now" value={inReview} hint="Screening, panel or committee" />
        <Stat label="Open reviews" value={openEvals} hint={`${evaluatorCount} evaluators on the panel`} />
        <Stat label="Average panel score" value={finished.length ? `${avgScore.toFixed(1)}` : "-"} hint={`out of 100 · ${finished.length} reviews done`} />
        <Stat label="Review turnaround" value={finished.length ? `${turnaround < 1 ? "<1" : Math.round(turnaround)} days` : "-"} hint="Assignment to scores in" />
        <Stat label="Funding requested" value={pula(requested)} hint="Across submitted ideas" />
        <Stat label="Awarded" value={awarded._count} hint={`${live.length ? Math.round((awarded._count / live.length) * 100) : 0}% of submitted ideas`} />
        <Stat label="Funding committed" value={pula(awarded._sum.awardAmount ?? 0)} hint={requested ? `${Math.round(((awarded._sum.awardAmount ?? 0) / requested) * 100)}% of the amount requested` : undefined} />
      </div>
      <OverviewCharts stages={stages} sectors={sectors} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-6">
          <h2 className="font-semibold text-navy-900">Calls</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {calls.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-navy-900">{c.title}</div>
                  <div className="text-xs text-slate-500">{c.status} · closes {fmtDate(c.closesAt)}{c.status === "OPEN" && ` (${daysUntil(c.closesAt)} days)`} · {c._count.submissions} ideas</div>
                </div>
                <Link href={`/app/admin/pipeline?call=${c.slug}`} className="text-sm font-medium text-sky-700 hover:underline">Pipeline</Link>
              </div>
            ))}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-navy-900"><AlertTriangle className="h-4 w-4 text-gold-500" /> Needs attention</h2>
          <ul className="mt-4 space-y-2">
            {alerts.length === 0 && <li className="text-sm text-slate-500">All clear.</li>}
            {alerts.map((a, i) => (
              <li key={i}><Link href={a.href} className="flex items-center justify-between gap-2 rounded-lg bg-gold-300/15 px-3 py-2 text-sm text-earth-700 hover:bg-gold-300/30">{a.text}<ArrowRight className="h-4 w-4 shrink-0" /></Link></li>
            ))}
          </ul>
        </section>
      </div>
      <section className="card mt-6 p-6">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-navy-900">Latest activity</h2><Link href="/app/admin/audit" className="text-sm font-medium text-sky-700 hover:underline">Full audit trail</Link></div>
        <ul className="mt-4 divide-y divide-slate-100 text-sm">
          {activity.map((a) => (
            <li key={a.id} className="flex justify-between gap-3 py-2.5"><span><span className="font-medium text-navy-900">{a.actor?.name ?? "System"}</span> <span className="text-slate-600">{a.action.replace(/[._]/g, " ")}</span></span><span className="shrink-0 text-xs text-slate-500">{timeAgo(a.createdAt)}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
