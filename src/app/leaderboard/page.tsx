import Link from "next/link";
import type { Metadata } from "next";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { INDEX_PARTS, TIERS, districtLeague, getIndex } from "@/lib/arena";
import { IndexLegend, LeagueTable, TermLabel } from "@/components/arena-ui";
import { SECTORS } from "@/lib/domain";
import { cn } from "@/lib/format";

export const metadata: Metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function Leaderboard({ searchParams }: { searchParams: Promise<{ sector?: string; district?: string }> }) {
  const sp = await searchParams;
  const all = await getIndex();
  const rows = all.filter((r) => (!sp.sector || r.sector === sp.sector) && (!sp.district || r.district === sp.district));
  const league = districtLeague(all);
  const sectors = SECTORS.filter((s) => all.some((r) => r.sector === s));
  const tierCounts = TIERS.map((t, i) => ({ ...t, count: all.filter((r) => r.score >= t.min && (i === 0 || r.score < TIERS[i - 1].min)).length }));
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...sp, ...o })) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/leaderboard?${s}` : "/leaderboard";
  };
  return (
    <div className="night min-h-screen">
      <PublicHero
        eyebrow="Live · National Innovation League · Season 2026"
        title={
          <>
            The <span className="text-sky-300">Innovator Index.</span>
          </>
        }
        body="Every youth-owned company on Arena, ranked out of 1000. Every point comes from something you can check: panel scores, pipeline progress, Range challenges and events."
      />
      <main className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="panel-dark min-w-0 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TermLabel>{rows.length} ranked{sp.sector ? ` · ${sp.sector}` : ""}{sp.district ? ` · ${sp.district}` : ""}</TermLabel>
              <IndexLegend dark />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Link href={q({ sector: undefined })} className={cn("rounded-full px-3 py-1 text-xs ring-1", !sp.sector ? "bg-sky-400/15 text-sky-200 ring-sky-400/40" : "text-white/55 ring-white/10 hover:text-white")}>
                All sectors
              </Link>
              {sectors.map((s) => (
                <Link key={s} href={q({ sector: s })} className={cn("rounded-full px-3 py-1 text-xs ring-1", sp.sector === s ? "bg-sky-400/15 text-sky-200 ring-sky-400/40" : "text-white/55 ring-white/10 hover:text-white")}>
                  {s}
                </Link>
              ))}
            </div>
            <div className="mt-5 hidden grid-cols-[44px_1.4fr_1fr_120px_90px] gap-3 border-b border-white/[0.07] pb-2 md:grid">
              {["#", "Company", "Index breakdown", "Range", "Score"].map((h, i) => (
                <span key={h} className={cn("term text-white/35", i === 4 && "text-right")}>{h}</span>
              ))}
            </div>
            {rows.length ? <LeagueTable rows={rows} /> : <p className="py-10 text-center text-sm text-white/50">No ranked companies match this filter yet.</p>}
            <p className="mt-5 border-t border-white/[0.07] pt-4 text-xs leading-relaxed text-white/40">
              Names in italics are anonymous: those companies haven't agreed to be showcased. Ranks are recalculated live. The Index guides
              innovators and helps CEDA find promising teams; funding decisions are always made by people, with a recorded reason.
            </p>
          </section>

          <aside className="space-y-6">
            <div className="panel-dark p-5">
              <TermLabel>District league</TermLabel>
              <ol className="mt-4 space-y-2">
                {league.map((l, i) => (
                  <li key={l.district}>
                    <Link href={q({ district: sp.district === l.district ? undefined : l.district })} className={cn("flex items-center justify-between rounded-lg px-2 py-1.5 text-[13px] transition hover:bg-white/[0.04]", sp.district === l.district && "bg-sky-400/10")}>
                      <span className="text-white/75">
                        <span className="mr-2 font-mono text-[11px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                        {l.district}
                        <span className="ml-1.5 text-[11px] text-white/35">({l.count})</span>
                      </span>
                      <span className="font-mono text-[12px] text-sky-300">{l.total.toLocaleString("en-BW")}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11.5px] text-white/35">District total = sum of its innovators' Index scores. Click a district to filter.</p>
            </div>
            <div className="panel-dark p-5">
              <TermLabel>Tiers</TermLabel>
              <ul className="mt-4 space-y-2 text-[13px]">
                {tierCounts.map((t) => (
                  <li key={t.name} className="flex items-center justify-between">
                    <span className={cn("chip ring-1 ring-inset", t.className)}>{t.name}</span>
                    <span className="font-mono text-xs text-white/50">
                      {t.min}+ · {t.count} {t.count === 1 ? "company" : "companies"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="panel-dark p-5">
              <TermLabel>How the Index works</TermLabel>
              <ul className="mt-4 space-y-3">
                {INDEX_PARTS.map((p) => (
                  <li key={p.key} className="text-[13px]">
                    <div className="flex justify-between text-white">
                      {p.label} <span className="font-mono text-sky-300">{p.max}</span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/45">{p.how}</p>
                  </li>
                ))}
              </ul>
              <Link href="/range" className="btn-primary mt-5 w-full">Start climbing on the Range</Link>
            </div>
          </aside>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
