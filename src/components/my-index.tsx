import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import { TIERS, getIndex, tierFor } from "@/lib/arena";
import { IndexBar, IndexLegend, TierBadge } from "./arena-ui";

/** Dark rank card for the signed-in innovator: score, rank, tier and the gap to the next tier. */
export async function MyIndexCard({ userId, showLink = true }: { userId: string; showLink?: boolean }) {
  const rows = await getIndex();
  const me = rows.find((r) => r.userId === userId);
  if (!me) return null;
  const tier = tierFor(me.score);
  const next = [...TIERS].reverse().find((t) => t.min > me.score);
  const above = rows[me.rank - 2];
  return (
    <section className="night relative isolate overflow-hidden rounded-2xl p-6 md:p-7">
      <div className="hex-grid absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_90%_at_100%_0%,rgb(10_168_92/0.25),transparent_70%)]" aria-hidden="true" />
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <div className="term flex items-center gap-2 text-sky-300/80">
            <span className="dot-live" /> Innovator Index
          </div>
          <div className="mt-3 flex items-end gap-3">
            <span className="font-mono text-5xl font-semibold tracking-tight text-white tabular-nums">{me.score}</span>
            <span className="mb-1.5 text-sm text-white/40">/ 1000</span>
            <TierBadge score={me.score} className="mb-2" />
          </div>
          <div className="mt-2 text-sm text-white/55">
            Rank <span className="font-mono text-white">#{me.rank}</span> of {rows.length} nationally
            {next && (
              <>
                {" · "}
                <span className="text-sky-300">{next.min - me.score} points</span> to {next.name}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-4 py-3 ring-1 ring-white/10">
          <Trophy className="h-5 w-5 text-gold-300" />
          <div className="text-xs text-white/55">
            {above ? (
              <>
                <span className="text-white">{above.score - me.score} points</span> behind #{above.rank}
                <div className="text-white/40">{above.display}</div>
              </>
            ) : (
              <span className="text-white">You lead the national league</span>
            )}
          </div>
        </div>
      </div>
      <IndexBar parts={me.parts} dark className="mt-6 h-2" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <IndexLegend dark />
        {showLink && (
          <Link href="/app/innovator/profile" className="term inline-flex items-center gap-1.5 text-sky-300 hover:text-sky-200">
            My profile <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      <span className="sr-only">Tier {tier.name}</span>
    </section>
  );
}
