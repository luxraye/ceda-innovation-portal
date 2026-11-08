import Link from "next/link";
import { CheckCircle2, Clock, Flame, RotateCcw } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { DIFFICULTY, TRACKS, type Track } from "@/lib/arena";
import { cn } from "@/lib/format";
import { MyIndexCard } from "@/components/my-index";

export const metadata = { title: "The Range" };

const DIFF: Record<string, string> = {
  EASY: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  HARD: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default async function MyRange({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const user = await requireRole("INNOVATOR");
  const { track } = await searchParams;
  const challenges = await prisma.challenge.findMany({
    where: track ? { track } : undefined,
    orderBy: { order: "asc" },
    include: { solves: { where: { userId: user.id } }, _count: { select: { solves: { where: { status: "SOLVED" } } } } },
  });
  const all = await prisma.challengeSolve.findMany({ where: { userId: user.id }, select: { status: true, points: true } });
  const solved = all.filter((s) => s.status === "SOLVED");
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">Range · challenge engine</span>}
        title="The Range"
        subtitle="Short challenges on what CEDA panels look for. Each one solved adds points to your Innovator Index, up to 250."
      />
      <div className="mb-6">
        <MyIndexCard userId={user.id} />
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="seg">
          <Link href="/app/innovator/range" className={!track ? "seg-on" : "seg-item"}>All</Link>
          {(Object.keys(TRACKS) as Track[]).map((t) => (
            <Link key={t} href={`/app/innovator/range?track=${t}`} className={track === t ? "seg-on" : "seg-item"}>
              {TRACKS[t].label}
            </Link>
          ))}
        </div>
        <div className="text-sm text-slate-500">
          <span className="font-mono font-semibold text-navy-950">{solved.length}</span> solved ·{" "}
          <span className="font-mono font-semibold text-sky-700">{solved.reduce((a, s) => a + s.points, 0)}</span> points
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {challenges.map((c) => {
          const mine = c.solves[0];
          const state = mine?.status;
          return (
            <Link key={c.id} href={`/app/innovator/range/${c.slug}`} className={cn("card group flex items-start gap-4 p-5 transition hover:shadow-md", state === "SOLVED" && "ring-1 ring-sky-300")}>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-semibold",
                  state === "SOLVED" ? "bg-sky-500 text-navy-950" : "bg-navy-950 text-sky-300",
                )}
              >
                {state === "SOLVED" ? <CheckCircle2 className="h-5 w-5" /> : c.points}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-navy-950 group-hover:text-sky-700">{c.title}</span>
                  <span className={cn("chip", DIFF[c.difficulty])}>{DIFFICULTY[c.difficulty as keyof typeof DIFFICULTY].label}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">{c.brief}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="eyebrow text-slate-400">{TRACKS[c.track as Track].label}</span>
                  <span>{c._count.solves} solves</span>
                  {state === "SOLVED" && (
                    <span className="flex items-center gap-1 text-sky-700">
                      +{mine.points} pts {mine.first && <><Flame className="h-3 w-3 text-gold-600" /> first solve</>}
                    </span>
                  )}
                  {state === "PENDING" && <span className="flex items-center gap-1 text-amber-700"><Clock className="h-3 w-3" /> Waiting for CEDA to verify</span>}
                  {state === "FAILED" && <span className="flex items-center gap-1 text-rose-600"><RotateCcw className="h-3 w-3" /> Try again</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
