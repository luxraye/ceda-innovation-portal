import Link from "next/link";
import { ArrowRight, MessageSquareWarning } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Empty, PageHeader, Req, StatusBadge, Stat } from "@/components/ui";
import { StageTracker } from "@/components/stage-tracker";
import { daysUntil, fmtDate, pula, timeAgo } from "@/lib/format";

export const metadata = { title: "My dashboard" };

export default async function InnovatorHome() {
  const user = await requireRole("INNOVATOR");
  const [subs, calls] = await Promise.all([
    prisma.submission.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { call: { include: { stages: true } }, events: { orderBy: { createdAt: "desc" }, take: 1 }, _count: { select: { feedback: { where: { visibility: "APPLICANT" } } } } },
    }),
    prisma.call.findMany({ where: { status: "OPEN" }, orderBy: { closesAt: "asc" } }),
  ]);
  const needsAction = subs.filter((s) => s.status === "CHANGES_REQUESTED" || s.status === "DRAFT");
  const active = subs.filter((s) => !["DRAFT", "WITHDRAWN"].includes(s.status));
  const awarded = subs.filter((s) => s.status === "AWARDED");
  return (
    <div>
      <PageHeader
        eyebrow={<><Req k="a" /><Req k="c" /></>}
        title={`Dumela, ${user.name.split(" ")[0]}`}
        subtitle={`${user.org?.name ?? ""} · Follow every idea you've submitted, and answer feedback when the panel asks.`}
        actions={<Link href="/calls" className="btn-primary">Start a new idea</Link>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Ideas in progress" value={active.length} hint="Submitted and being reviewed" accent />
        <Stat label="Need your attention" value={needsAction.length} hint="Drafts and feedback to answer" />
        <Stat label="Awarded" value={awarded.length} hint={awarded.length ? pula(awarded.reduce((a, s) => a + (s.awardAmount ?? 0), 0)) : "Your first win is coming"} />
      </div>

      {needsAction.filter((s) => s.status === "CHANGES_REQUESTED").map((s) => (
        <Link key={s.id} href={`/app/innovator/submissions/${s.id}`} className="mt-6 flex items-center gap-4 rounded-2xl border border-gold-400/60 bg-gold-300/20 p-5 hover:bg-gold-300/30">
          <MessageSquareWarning className="h-8 w-8 shrink-0 text-gold-600" />
          <div className="flex-1">
            <div className="font-semibold text-navy-900">The panel asked you to improve "{s.title}"</div>
            <div className="text-sm text-earth-700">Read their feedback, update your answers and resubmit. Your earlier version is kept.</div>
          </div>
          <ArrowRight className="h-5 w-5 text-earth-700" />
        </Link>
      ))}

      <h2 className="mt-10 mb-4 text-lg font-bold text-navy-900">My ideas</h2>
      {subs.length === 0 ? (
        <Empty title="No ideas yet" body="Pick an open call and start your first submission. Your draft saves as you go." action={<Link href="/calls" className="btn-primary">See open calls</Link>} />
      ) : (
        <div className="space-y-4">
          {subs.map((s) => (
            <Link key={s.id} href={s.status === "DRAFT" ? `/app/innovator/submissions/${s.id}/edit` : `/app/innovator/submissions/${s.id}`} className="card block p-6 transition hover:border-sky-300">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-slate-500">{s.reference} · {s.call.title}</div>
                  <div className="mt-1 text-lg font-bold text-navy-900">{s.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  {s._count.feedback > 0 && <span className="chip bg-sky-50 text-sky-700">{s._count.feedback} feedback</span>}
                  <StatusBadge status={s.status} />
                </div>
              </div>
              <div className="mt-6"><StageTracker stages={s.call.stages} currentStageId={s.stageId} status={s.status} /></div>
              <div className="mt-4 text-xs text-slate-500">
                {s.events[0] ? `Latest: ${s.events[0].label} · ${timeAgo(s.events[0].createdAt)}` : `Draft · last saved ${timeAgo(s.updatedAt)}`}
              </div>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-4 text-lg font-bold text-navy-900">Open calls</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {calls.map((c) => (
          <Link key={c.id} href={`/calls/${c.slug}`} className="card p-5 hover:border-sky-300">
            <div className="text-xs font-semibold text-sky-700 uppercase">{c.theme}</div>
            <div className="mt-1 font-semibold text-navy-900">{c.title}</div>
            <div className="mt-3 text-xs text-slate-500">Closes {fmtDate(c.closesAt)} · {daysUntil(c.closesAt)} days left</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
