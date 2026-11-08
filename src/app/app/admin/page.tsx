import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, Req, Stat } from "@/components/ui";
import { daysUntil, fmtDate, pula, timeAgo } from "@/lib/format";

export const metadata = { title: "Programme overview" };

export default async function AdminHome() {
  await requireRole("ADMIN");
  const [calls, submitted, inReview, awarded, unassigned, stuck, activity, conflicts] = await Promise.all([
    prisma.call.findMany({ orderBy: { closesAt: "asc" }, include: { _count: { select: { submissions: { where: { status: { not: "DRAFT" } } } } } } }),
    prisma.submission.count({ where: { status: { not: "DRAFT" } } }),
    prisma.submission.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] } } }),
    prisma.submission.aggregate({ where: { status: "AWARDED" }, _count: true, _sum: { awardAmount: true } }),
    prisma.submission.findMany({ where: { stage: { kind: "PANEL" }, status: { in: ["SUBMITTED", "IN_REVIEW"] }, assignments: { none: {} } }, include: { call: true }, take: 6 }),
    prisma.submission.findMany({ where: { status: { in: ["SUBMITTED", "IN_REVIEW"] }, updatedAt: { lt: new Date(Date.now() - 10 * 86400000) } }, include: { stage: true }, take: 6 }),
    prisma.auditLog.findMany({ orderBy: { seq: "desc" }, take: 8, include: { actor: true } }),
    prisma.assignment.findMany({ where: { status: "CONFLICT" }, include: { submission: true, evaluator: true }, take: 5 }),
  ]);
  const alerts = [
    ...unassigned.map((s) => ({ href: `/app/admin/submissions/${s.id}`, text: `${s.reference} is at panel stage with no evaluators` })),
    ...conflicts.map((c) => ({ href: `/app/admin/submissions/${c.submissionId}`, text: `${c.evaluator.name} declared a conflict on ${c.submission.reference}` })),
    ...stuck.map((s) => ({ href: `/app/admin/submissions/${s.id}`, text: `${s.reference} has been in ${s.stage?.name ?? "review"} for over 10 days` })),
  ];
  return (
    <div>
      <PageHeader eyebrow={<><Req k="c" /><Req k="f" /></>} title="Programme overview" subtitle="Everything moving through Arena right now." actions={<><Link href="/app/admin/pipeline" className="btn-primary">Pipeline board</Link><Link href="/app/admin/calls/new" className="btn-ghost">New call</Link></>} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Ideas submitted" value={submitted} accent />
        <Stat label="In review now" value={inReview} />
        <Stat label="Awarded" value={awarded._count} />
        <Stat label="Funding committed" value={pula(awarded._sum.awardAmount ?? 0)} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
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
