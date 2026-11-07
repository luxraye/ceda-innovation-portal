import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { prisma } from "@/lib/prisma";
import { daysUntil, fmtDate, pula } from "@/lib/format";
import { Spotlight } from "@/components/motion";
import { AzurePhoto } from "@/components/photo";
import { PHOTOS, themePhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Open calls" };

export default async function Calls() {
  const calls = await prisma.call.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: [{ status: "asc" }, { closesAt: "asc" }],
    include: { _count: { select: { submissions: { where: { status: { not: "DRAFT" } } } } }, stages: true },
  });
  return (
    <div className="bg-slate-50">
      <PublicHero
        eyebrow="Open calls"
        title={
          <>
            Calls for <span className="font-serif text-[1.08em] text-sky-300 italic">innovation.</span>
          </>
        }
        body="Each call is a challenge CEDA wants young Batswana to solve. Read the criteria, then apply. You'll know exactly how you will be judged."
        photo={PHOTOS.team}
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-14 md:grid-cols-2 md:px-8">
        {calls.map((c) => {
          const d = daysUntil(c.closesAt);
          return (
            <Spotlight key={c.id} className="card group overflow-hidden">
              <Link href={`/calls/${c.slug}`} className="relative z-10 flex h-full flex-col">
                <div className="relative h-52 overflow-hidden">
                  <AzurePhoto src={themePhoto(c.theme)} alt="" sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
                  <span className="absolute bottom-4 left-7 font-serif text-3xl text-white italic md:left-8">{pula(c.prizePool)}</span>
                </div>
                <div className="flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-sky-700">{c.theme}</span>
                  <span
                    className={`chip ${c.status === "OPEN" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-slate-200"}`}
                  >
                    {c.status === "OPEN" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                    {c.status === "OPEN" ? "Open" : c.status === "REVIEW" ? "In review" : "Closed"}
                  </span>
                </div>
                <h2 className="mt-6 text-2xl leading-tight text-navy-950">{c.title}</h2>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">{c.tagline}</p>
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-100 pt-5 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Prize pool</dt>
                    <dd className="mt-0.5 font-semibold text-navy-950 tabular-nums">{pula(c.prizePool)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Closes</dt>
                    <dd className="mt-0.5 font-semibold text-navy-950">
                      {fmtDate(c.closesAt)}
                      {c.status === "OPEN" && d > 0 && <span className="block text-xs font-normal text-gold-600">{d} days left</span>}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <dt className="text-xs text-slate-500">Ideas so far</dt>
                      <dd className="mt-0.5 font-semibold text-navy-950 tabular-nums">{c._count.submissions}</dd>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-sky-600 group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </dl>
                </div>
              </Link>
            </Spotlight>
          );
        })}
      </div>
      <PublicFooter />
    </div>
  );
}
