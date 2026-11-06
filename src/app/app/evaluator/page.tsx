import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Callout, Empty, PageHeader, Req, Stat, Tone } from "@/components/ui";
import { daysUntil, fmtDate } from "@/lib/format";

export const metadata = { title: "Review queue" };

const STATUS: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Not started", tone: "sky" },
  IN_PROGRESS: { label: "In progress", tone: "indigo" },
  DONE: { label: "Scored", tone: "emerald" },
  CONFLICT: { label: "Conflict declared", tone: "slate" },
};

export default async function EvaluatorHome({ searchParams }: { searchParams: Promise<{ conflict?: string }> }) {
  const user = await requireRole("EVALUATOR");
  const { conflict } = await searchParams;
  const list = await prisma.assignment.findMany({
    where: { evaluatorId: user.id },
    include: { submission: { include: { call: true } }, stage: true },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }],
  });
  const open = list.filter((a) => a.status === "PENDING" || a.status === "IN_PROGRESS");
  const done = list.filter((a) => a.status === "DONE");
  const overdue = open.filter((a) => a.dueAt && daysUntil(a.dueAt) < 0);
  return (
    <div>
      <PageHeader eyebrow={<><Req k="b" /><Req k="d" /></>} title="Your review queue" subtitle="Ideas assigned to you. Review is blind: you see the idea, not who submitted it. Declare any conflict of interest before you start." />
      {conflict && <div className="mb-6"><Callout tone="sky" title="Conflict recorded">Thank you. The programme team has been notified and will reassign this idea.</Callout></div>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="To review" value={open.length} accent />
        <Stat label="Overdue" value={overdue.length} hint={overdue.length ? "Past the due date" : "You're on time"} />
        <Stat label="Scored" value={done.length} />
      </div>
      <div className="mt-8">
        {list.length === 0 ? (
          <Empty title="Nothing assigned yet" body="When the programme team assigns ideas to you, they'll appear here and you'll get a notification." />
        ) : (
          <div className="card divide-y divide-slate-100">
            {list.map((a) => {
              const d = a.dueAt ? daysUntil(a.dueAt) : null;
              const s = STATUS[a.status];
              return (
                <div key={a.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-mono text-xs text-slate-500">{a.submission.reference} · {a.submission.call.title}</div>
                    <div className="truncate font-semibold text-navy-900">{a.submission.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <Tone tone={s.tone}>{s.label}</Tone>
                      <span>{a.stage.name}</span>
                      {a.dueAt && a.status !== "DONE" && <span className={d !== null && d < 0 ? "font-semibold text-rose-600" : d !== null && d <= 2 ? "font-semibold text-gold-600" : ""}>Due {fmtDate(a.dueAt)}{d !== null && (d < 0 ? ` (${-d} days late)` : ` (${d} days)`)}</span>}
                    </div>
                  </div>
                  {a.status !== "CONFLICT" && (
                    <Link href={`/app/evaluator/review/${a.id}`} className={a.status === "DONE" ? "btn-ghost" : "btn-primary"}>
                      {a.status === "DONE" ? "View my scores" : a.status === "IN_PROGRESS" ? "Continue scoring" : "Start review"}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
