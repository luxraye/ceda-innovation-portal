import Link from "next/link";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { prisma } from "@/lib/prisma";
import { daysUntil, fmtDate, pula } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { title: "Open calls" };

export default async function Calls() {
  const calls = await prisma.call.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: [{ status: "asc" }, { closesAt: "asc" }],
    include: { _count: { select: { submissions: { where: { status: { not: "DRAFT" } } } } }, stages: true },
  });
  return (
    <div>
      <section className="sky-gradient">
        <PublicHeader />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-14 md:px-8">
          <h1 className="text-4xl font-extrabold text-navy-900 md:text-5xl">Calls for innovation</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">Each call is a challenge CEDA wants young Batswana to solve. Read the criteria, then apply. You'll know exactly how you will be judged.</p>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-2 md:px-8">
        {calls.map((c) => {
          const d = daysUntil(c.closesAt);
          return (
            <Link key={c.id} href={`/calls/${c.slug}`} className="card group flex flex-col p-7 transition hover:-translate-y-0.5 hover:border-sky-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-sky-700 uppercase">{c.theme}</span>
                <span className={`chip ${c.status === "OPEN" ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800"}`}>
                  {c.status === "OPEN" ? "Open" : c.status === "REVIEW" ? "In review" : "Closed"}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-navy-900 group-hover:text-sky-700">{c.title}</h2>
              <p className="mt-2 flex-1 text-slate-600">{c.tagline}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 text-sm">
                <div><dt className="text-xs text-slate-500">Prize pool</dt><dd className="font-semibold text-navy-900">{pula(c.prizePool)}</dd></div>
                <div><dt className="text-xs text-slate-500">Closes</dt><dd className="font-semibold text-navy-900">{fmtDate(c.closesAt)}{c.status === "OPEN" && d > 0 && <span className="block text-xs font-normal text-gold-600">{d} days left</span>}</dd></div>
                <div><dt className="text-xs text-slate-500">Ideas so far</dt><dd className="font-semibold text-navy-900">{c._count.submissions}</dd></div>
              </dl>
            </Link>
          );
        })}
      </div>
      <PublicFooter />
    </div>
  );
}
