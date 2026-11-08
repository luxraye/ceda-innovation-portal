import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AzurePhoto } from "@/components/photo";
import { themePhoto } from "@/lib/photos";
import { daysUntil, fmtDate, pula } from "@/lib/format";

export const metadata = { title: "Open calls" };

export default async function AppCalls() {
  const user = await requireRole();
  const [calls, mine] = await Promise.all([
    prisma.call.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: [{ status: "asc" }, { closesAt: "asc" }],
      include: { criteria: { orderBy: { order: "asc" } }, _count: { select: { submissions: { where: { status: { not: "DRAFT" } } } } } },
    }),
    prisma.submission.findMany({ where: { ownerId: user.id }, select: { callId: true, id: true, status: true } }),
  ]);
  const innovator = user.role === "INNOVATOR";
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">Funding calls</span>}
        title="Open calls"
        subtitle="Each call is a challenge CEDA wants youth-owned companies to solve. The scoring criteria are published up front, so you know exactly how you'll be judged."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {calls.map((c) => {
          const d = daysUntil(c.closesAt);
          const sub = mine.find((m) => m.callId === c.id);
          const open = c.status === "OPEN";
          return (
            <article key={c.id} className="card group flex flex-col overflow-hidden">
              <div className="relative h-40 overflow-hidden">
                <AzurePhoto src={themePhoto(c.theme)} alt="" vivid sizes="(min-width: 1024px) 40vw, 100vw" className="absolute inset-0 transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/25 to-transparent" />
                <span className="absolute top-4 left-5 chip bg-white/90 text-navy-950 ring-white">{c.theme}</span>
                <span className={`absolute top-4 right-5 chip ${open ? "bg-sky-400 text-navy-950 ring-sky-300" : "bg-white/80 text-slate-700 ring-white"}`}>
                  {open ? `${d} days left` : c.status === "REVIEW" ? "In review" : "Closed"}
                </span>
                <span className="absolute bottom-4 left-5 font-mono text-2xl font-semibold text-white">{pula(c.prizePool)}</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-xl text-navy-950">{c.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.tagline}</p>
                <div className="mt-5">
                  <div className="eyebrow text-slate-400">How ideas are scored</div>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {c.criteria.map((cr) => (
                      <li key={cr.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                        <span className="truncate">{cr.name}</span>
                        <span className="font-mono font-semibold text-navy-950">{cr.weight}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarClock className="h-3.5 w-3.5" /> Closes {fmtDate(c.closesAt)} · {c._count.submissions} ideas so far
                  </span>
                  {innovator && sub ? (
                    <Link href={`/app/innovator/submissions/${sub.id}`} className="btn-ghost">
                      <CheckCircle2 className="h-4 w-4 text-sky-600" /> View my idea
                    </Link>
                  ) : innovator && open ? (
                    <Link href={`/app/innovator/apply/${c.id}`} className="btn-primary">
                      Apply <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
