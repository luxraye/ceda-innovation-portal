import Link from "next/link";
import { Clock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callRanking } from "@/lib/ranking";
import { PageHeader, Req, StatusBadge } from "@/components/ui";

export const metadata = { title: "Pipeline board" };

export default async function Pipeline({ searchParams }: { searchParams: Promise<{ call?: string }> }) {
  await requireRole("ADMIN");
  const { call: slug } = await searchParams;
  const calls = await prisma.call.findMany({ where: { status: { not: "DRAFT" } }, orderBy: { closesAt: "asc" } });
  const call = calls.find((c) => c.slug === slug) ?? calls[0];
  if (!call) return <PageHeader title="Pipeline board" subtitle="Create a call first." />;
  const [stages, subs, ranking] = await Promise.all([
    prisma.stage.findMany({ where: { callId: call.id }, orderBy: { order: "asc" } }),
    prisma.submission.findMany({
      where: { callId: call.id, status: { not: "DRAFT" } },
      include: { org: true, assignments: true, events: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { updatedAt: "desc" },
    }),
    callRanking(call.id),
  ]);
  const closed = subs.filter((s) => s.status === "DECLINED" || s.status === "WITHDRAWN");
  const columns = stages.map((st) => ({ stage: st, items: subs.filter((s) => s.stageId === st.id && s.status !== "DECLINED" && s.status !== "WITHDRAWN") }));
  return (
    <div>
      <PageHeader
        eyebrow={<><Req k="c" /><Req k="b" /></>}
        title="Pipeline board"
        subtitle="Every idea in every stage. Cards turn amber after 7 days without movement."
        actions={<div className="seg">{calls.map((c) => <Link key={c.id} href={`/app/admin/pipeline?call=${c.slug}`} className={c.id === call.id ? "seg-on" : "seg-item"}>{c.title.replace(/ 2026$/, "").replace(/ (Challenge|Innovation Call)$/, "")}</Link>)}</div>}
      />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[...columns, { stage: { id: "closed", name: "Closed", kind: "CLOSED" }, items: closed }].map((col) => (
          <div key={col.stage.id} className="w-72 shrink-0 rounded-2xl bg-slate-100/80 p-3">
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-navy-900">{col.stage.name}</span>
              <span className="chip bg-white text-slate-600">{col.items.length}</span>
            </div>
            <div className="space-y-2.5">
              {col.items.map((s) => {
                const days = Math.floor((Date.now() - (s.events[0]?.createdAt ?? s.updatedAt).getTime()) / 86400000);
                const r = ranking.get(s.id);
                const done = s.assignments.filter((a) => a.status === "DONE").length;
                const total = s.assignments.filter((a) => a.status !== "CONFLICT").length;
                return (
                  <Link key={s.id} href={`/app/admin/submissions/${s.id}`} className={`block rounded-xl border bg-white p-3 shadow-sm transition hover:border-sky-300 ${days > 7 && !["AWARDED", "DECLINED", "WITHDRAWN"].includes(s.status) ? "border-gold-400" : "border-transparent"}`}>
                    <div className="font-mono text-[10.5px] text-slate-400">{s.reference}</div>
                    <div className="line-clamp-2 text-sm font-semibold text-navy-900">{s.title}</div>
                    <div className="mt-0.5 truncate text-xs text-slate-500">{s.org.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <StatusBadge status={s.status} />
                      {col.stage.kind === "PANEL" && <span className="chip bg-slate-100 text-slate-600">{total ? `${done}/${total} scored` : "No panel"}</span>}
                      {r && <span className="chip bg-sky-50 text-sky-700">{r.normalised}</span>}
                    </div>
                    <div className={`mt-2 flex items-center gap-1 text-[11px] ${days > 7 ? "font-semibold text-gold-600" : "text-slate-400"}`}><Clock className="h-3 w-3" /> {days} days in stage</div>
                  </Link>
                );
              })}
              {col.items.length === 0 && <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">Empty</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
