import { requireRole } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { LeaderboardBoard } from "@/components/leaderboard-board";

export const metadata = { title: "Leaderboard" };

export default async function AppLeaderboard({ searchParams }: { searchParams: Promise<{ sector?: string; district?: string }> }) {
  const user = await requireRole();
  const sp = await searchParams;
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">National Innovation League · live</span>}
        title="Leaderboard"
        subtitle="Every youth-owned company on Arena, ranked by Innovator Index out of 1000. Companies that haven't agreed to be showcased appear anonymously."
      />
      <div className="night rounded-3xl p-3 md:p-5">
        <LeaderboardBoard sp={sp} basePath="/app/leaderboard" rangeHref={user.role === "INNOVATOR" ? "/app/innovator/range" : null} />
      </div>
    </div>
  );
}
