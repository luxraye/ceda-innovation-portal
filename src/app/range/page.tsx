import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Flame, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { DIFFICULTY, TRACKS, getIndex, type Track } from "@/lib/arena";
import { TermLabel } from "@/components/arena-ui";
import { cn } from "@/lib/format";

export const metadata: Metadata = { title: "The Range" };
export const dynamic = "force-dynamic";

const DIFF_CLASS: Record<string, string> = {
  EASY: "text-emerald-300 ring-emerald-400/30 bg-emerald-400/10",
  MEDIUM: "text-amber-300 ring-amber-400/30 bg-amber-400/10",
  HARD: "text-rose-300 ring-rose-400/30 bg-rose-400/10",
};

export default async function RangePage() {
  const [session, challenges, rows] = await Promise.all([
    getSession(),
    prisma.challenge.findMany({
      orderBy: { order: "asc" },
      include: { solves: { where: { status: "SOLVED" }, orderBy: { solvedAt: "asc" }, select: { userId: true, first: true } } },
    }),
    getIndex(),
  ]);
  const names = new Map(rows.map((r) => [r.userId, r.display]));
  const mine = session?.role === "INNOVATOR" ? new Set(challenges.filter((c) => c.solves.some((s) => s.userId === session.sub)).map((c) => c.id)) : new Set<string>();
  const totalPts = challenges.reduce((a, c) => a + c.points, 0);
  const tracks = Object.keys(TRACKS) as Track[];
  return (
    <div className="night min-h-screen">
      <PublicHero
        eyebrow="The Range · challenge engine"
        title={
          <>
            Practise what panels <span className="text-sky-300">actually mark.</span>
          </>
        }
        body={`${challenges.length} short challenges across six tracks, worth ${totalPts} points. Quizzes are marked instantly. Evidence tasks are checked by the CEDA team. The first team to solve a challenge earns 20% extra.`}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={session?.role === "INNOVATOR" ? "/app/innovator/range" : "/register"} className="btn-primary btn-lg">
            {session?.role === "INNOVATOR" ? "Open my Range" : "Join to start solving"}
          </Link>
          <Link href="/leaderboard" className="btn-glass btn-lg">See the leaderboard</Link>
        </div>
      </PublicHero>
      <main className="mx-auto max-w-7xl space-y-12 px-4 pb-24 md:px-8">
        {tracks.map((t) => {
          const list = challenges.filter((c) => c.track === t);
          if (!list.length) return null;
          return (
            <section key={t}>
              <div className="flex items-baseline justify-between border-b border-white/[0.07] pb-3">
                <TermLabel>{TRACKS[t].label}</TermLabel>
                <span className="text-xs text-white/40">{TRACKS[t].hint}</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {list.map((c) => {
                  const firstBy = c.solves.find((s) => s.first);
                  const done = mine.has(c.id);
                  return (
                    <Link
                      key={c.id}
                      href={session?.role === "INNOVATOR" ? `/app/innovator/range/${c.slug}` : `/login?next=/app/innovator/range/${c.slug}`}
                      className={cn("card-dark group flex flex-col p-5 transition hover:bg-white/[0.06]", done && "glow-green")}
                    >
                      <div className="flex items-center justify-between">
                        <span className={cn("chip ring-1 ring-inset", DIFF_CLASS[c.difficulty])}>{DIFFICULTY[c.difficulty as keyof typeof DIFFICULTY].label}</span>
                        <span className="font-mono text-sm font-semibold text-sky-300">{c.points} pts</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 font-medium text-white group-hover:text-sky-200">
                        {done ? <CheckCircle2 className="h-4 w-4 text-sky-400" /> : !session && <Lock className="h-3.5 w-3.5 text-white/30" />}
                        {c.title}
                      </div>
                      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-white/50">{c.brief}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-3 text-[11.5px] text-white/40">
                        <span className="term">{c.kind === "QUIZ" ? "Auto-marked" : "Verified by CEDA"}</span>
                        <span>
                          {c.solves.length} solves
                          {firstBy && (
                            <span className="ml-2 inline-flex items-center gap-1 text-gold-300/80">
                              <Flame className="h-3 w-3" /> {names.get(firstBy.userId) ?? "Anonymous"}
                            </span>
                          )}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>
      <PublicFooter />
    </div>
  );
}
