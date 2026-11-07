import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpDown, Search } from "lucide-react";
import { AppShell, Empty } from "@/components/AppShell";
import { StageBadge } from "@/components/stage";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useIdeas, useLiveUpdates, timeAgo } from "@/lib/data";
import { CATEGORIES, isStaff, STAGE_META, type Stage } from "@/lib/stages";
import { cn } from "@/lib/utils";

const STAGES = Object.keys(STAGE_META).filter((s) => s !== "draft") as Stage[];

export const Route = createFileRoute("/review")({
  validateSearch: (s: Record<string, unknown>): { stage?: Stage | undefined } => ({
    stage: STAGES.includes(s["stage"] as Stage) ? (s["stage"] as Stage) : undefined,
  }),
  head: () => ({ meta: [{ title: "Review queue — CEDA Innovation Portal" }] }),
  component: Review,
});

type Sort = "newest" | "oldest" | "score";

function Review() {
  const { roles } = useAuth();
  const { stage } = Route.useSearch();
  const navigate = useNavigate({ from: "/review" });
  const { data, isLoading } = useIdeas();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  useLiveUpdates("review");

  const myFocus: Stage[] = roles.includes("admin")
    ? []
    : [
        ...(roles.includes("evaluator")
          ? (["submitted", "screening", "evaluation"] as Stage[])
          : []),
        ...(roles.includes("adjudicator") ? (["adjudication", "approved"] as Stage[]) : []),
      ];

  const all = (data ?? []).filter((i) => i.stage !== "draft");
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = all.filter(
      (i) =>
        (!stage || i.stage === stage) &&
        (sector === "all" || i.category === sector) &&
        (!term ||
          [i.title, i.company_name, i.reference].some((v) => v.toLowerCase().includes(term))),
    );
    return r.sort((a, b) =>
      sort === "score"
        ? Number(b.avg_score ?? -1) - Number(a.avg_score ?? -1)
        : (new Date(b.submitted_at ?? b.created_at).getTime() -
            new Date(a.submitted_at ?? a.created_at).getTime()) *
          (sort === "newest" ? 1 : -1),
    );
  }, [all, stage, sector, q, sort]);

  if (!isStaff(roles)) {
    return (
      <AppShell title="Review queue">
        <Empty
          title="Panel members only"
          body="Ask a CEDA administrator to give you the evaluator or adjudicator role."
        />
      </AppShell>
    );
  }

  const setStage = (s?: Stage) => navigate({ search: { stage: s } });

  return (
    <AppShell
      title="Review queue"
      subtitle="Every submission, live. Filter by stage and sector, then open an idea to score it or record a decision."
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Chip active={!stage} onClick={() => setStage(undefined)}>
          All <b>{all.length}</b>
        </Chip>
        {STAGES.map((s) => {
          const n = all.filter((i) => i.stage === s).length;
          return (
            <Chip
              key={s}
              active={stage === s}
              onClick={() => setStage(s)}
              highlight={myFocus.includes(s) && n > 0}
            >
              {STAGE_META[s].label} <b>{n}</b>
            </Chip>
          );
        })}
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_200px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search title, company or reference"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sectors</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
          <SelectTrigger>
            <ArrowUpDown className="size-4 opacity-60" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="score">Highest score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-80 rounded-2xl" />
      ) : rows.length === 0 ? (
        <Empty title="Nothing here" body="No submissions match these filters." />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <div className="hidden grid-cols-[110px_1fr_140px_130px_90px] gap-4 border-b bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Reference</span>
            <span>Idea</span>
            <span>Stage</span>
            <span>Submitted</span>
            <span className="text-right">Score</span>
          </div>
          <ul className="divide-y">
            {rows.map((i) => (
              <li key={i.id}>
                <Link
                  to="/ideas/$id"
                  params={{ id: i.id }}
                  className="grid gap-1 px-5 py-4 transition-colors hover:bg-secondary/60 md:grid-cols-[110px_1fr_140px_130px_90px] md:items-center md:gap-4"
                >
                  <span className="font-mono text-xs text-muted-foreground">{i.reference}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{i.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {i.company_name} · {i.category} · {i.youth_shareholding}% youth
                    </span>
                  </span>
                  <span>
                    <StageBadge stage={i.stage} />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {timeAgo(i.submitted_at ?? i.created_at)}
                  </span>
                  <span className="font-display text-xl font-extrabold md:text-right">
                    {i.avg_score == null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      Number(i.avg_score).toFixed(0)
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppShell>
  );
}

function Chip({
  active,
  highlight,
  onClick,
  children,
}: {
  active: boolean;
  highlight?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        active ? "border-transparent bg-ink text-ink-foreground" : "bg-card hover:bg-secondary",
      )}
    >
      {children}
      {highlight && !active && (
        <span
          className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background"
          title="Waiting for your role"
        />
      )}
    </button>
  );
}
