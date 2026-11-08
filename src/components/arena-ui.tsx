import Link from "next/link";
import { BadgeCheck, Crown } from "lucide-react";
import { cn } from "@/lib/format";
import { INDEX_PARTS, tierFor, type IndexRow } from "@/lib/arena";

export function TierBadge({ score, className }: { score: number; className?: string }) {
  const t = tierFor(score);
  return <span className={cn("chip ring-1 ring-inset", t.className, className)}>{t.name}</span>;
}

/** Light-surface tier chip for the workspace. */
export function TierChip({ score }: { score: number }) {
  const t = tierFor(score).name;
  const map: Record<string, string> = {
    Platinum: "bg-sky-50 text-sky-800 ring-sky-300",
    Gold: "bg-gold-300/25 text-earth-700 ring-gold-400/60",
    Silver: "bg-slate-100 text-slate-700 ring-slate-300",
    Bronze: "bg-[#fbeee4] text-[#8a4b22] ring-[#e2b393]",
  };
  return <span className={cn("chip", map[t])}>{t}</span>;
}

/** Segmented bar showing the four parts of an Index score out of 1000. */
export function IndexBar({ parts, dark = false, className }: { parts: IndexRow["parts"]; dark?: boolean; className?: string }) {
  const colours = ["bg-sky-400", "bg-sky-600", "bg-gold-400", "bg-[#8ab4ff]"];
  return (
    <div className={cn("flex h-1.5 w-full overflow-hidden rounded-full", dark ? "bg-white/[0.07]" : "bg-slate-100", className)}>
      {INDEX_PARTS.map((p, i) => (
        <div key={p.key} className={colours[i]} style={{ width: `${(parts[p.key] / 1000) * 100}%` }} title={`${p.label}: ${parts[p.key]}`} />
      ))}
    </div>
  );
}

export function IndexLegend({ dark = false }: { dark?: boolean }) {
  const colours = ["bg-sky-400", "bg-sky-600", "bg-gold-400", "bg-[#8ab4ff]"];
  return (
    <div className={cn("flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]", dark ? "text-white/50" : "text-slate-500")}>
      {INDEX_PARTS.map((p, i) => (
        <span key={p.key} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-sm", colours[i])} /> {p.label} <span className="font-mono opacity-70">/{p.max}</span>
        </span>
      ))}
    </div>
  );
}

/** Dark league table used on the landing page and the public leaderboard. */
export function LeagueTable({ rows, limit, compact = false }: { rows: IndexRow[]; limit?: number; compact?: boolean }) {
  const list = limit ? rows.slice(0, limit) : rows;
  return (
    <ol className="divide-y divide-white/[0.06]">
      {list.map((r) => (
        <li key={r.userId} className={cn("grid items-center gap-3", compact ? "grid-cols-[28px_1fr_auto] py-2.5" : "grid-cols-[36px_1fr_auto] py-3.5 md:grid-cols-[44px_1.4fr_1fr_120px_90px]")}>
          <span
            className={cn(
              "font-mono text-sm tabular-nums",
              r.rank === 1 ? "text-gold-300" : r.rank <= 3 ? "text-sky-300" : "text-white/40",
            )}
          >
            {r.rank === 1 ? <Crown className="h-4 w-4" /> : String(r.rank).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-[14px] font-medium text-white">
              <span className={cn("truncate", !r.public && "text-white/55 italic")}>{r.display}</span>
              {r.verified && r.public && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-label="CIPA verified" />}
            </div>
            <div className="truncate text-[11.5px] text-white/40">
              {r.district} · {r.sector}
            </div>
          </div>
          {!compact && (
            <div className="hidden md:block">
              <IndexBar parts={r.parts} dark />
            </div>
          )}
          {!compact && (
            <div className="hidden md:block">
              <span className="text-xs text-white/45">{r.solves} {r.solves === 1 ? "solve" : "solves"}</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            {!compact && <TierBadge score={r.score} className="hidden sm:inline-flex" />}
            <span className="w-12 text-right font-mono text-[15px] font-semibold text-sky-300 tabular-nums">{r.score}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TermLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("term flex items-center gap-2 text-sky-300/80", className)}>
      <span className="text-sky-400">&gt;</span> {children}
    </div>
  );
}

export function RangeLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="term inline-flex items-center gap-1.5 text-sky-300 transition hover:text-sky-200">
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}
