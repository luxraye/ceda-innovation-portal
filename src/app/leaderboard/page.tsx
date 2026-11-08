import type { Metadata } from "next";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { LeaderboardBoard } from "@/components/leaderboard-board";

export const metadata: Metadata = { title: "Leaderboard" };
export const dynamic = "force-dynamic";

export default async function Leaderboard({ searchParams }: { searchParams: Promise<{ sector?: string; district?: string }> }) {
  const sp = await searchParams;
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
        <LeaderboardBoard sp={sp} basePath="/leaderboard" />
      </main>
      <PublicFooter />
    </div>
  );
}
