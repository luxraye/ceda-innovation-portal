import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus, Radio } from "lucide-react";
import { AppShell, Empty, Stat } from "@/components/AppShell";
import { StageBadge, StageTracker } from "@/components/stage";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useEvents, useIdeas, useLiveUpdates, timeAgo, type Idea } from "@/lib/data";
import { isStaff, PIPELINE, STAGE_META, type Stage } from "@/lib/stages";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CEDA Innovation Portal" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, roles } = useAuth();
  useLiveUpdates("dashboard");
  const first = (
    (user?.user_metadata?.["full_name"] as string | undefined) ??
    user?.email ??
    ""
  ).split(/[\s@]/)[0];
  const staff = isStaff(roles);

  return (
    <AppShell
      title={`Dumela, ${first}`}
      subtitle={
        staff
          ? "Here's where the innovation pipeline stands right now."
          : "Track your ideas from submission to award."
      }
      actions={
        <Button asChild variant="hero">
          <Link to="/ideas/new">
            <Plus /> New idea
          </Link>
        </Button>
      }
    >
      {staff ? <StaffView /> : <InnovatorView />}
    </AppShell>
  );
}

function InnovatorView() {
  const { user } = useAuth();
  const { data, isLoading } = useIdeas();
  const mine = (data ?? []).filter((i) => i.owner_id === user?.id);
  const inReview = mine.filter((i) =>
    ["submitted", "screening", "evaluation", "adjudication"].includes(i.stage),
  ).length;
  const needs = mine.filter((i) => i.stage === "revision_requested").length;

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Your ideas" value={mine.length} accent />
        <Stat
          label="Drafts"
          value={mine.filter((i) => i.stage === "draft").length}
          hint="Not yet submitted"
        />
        <Stat label="In review" value={inReview} hint="With the CEDA panel" />
        <Stat
          label="Needs your action"
          value={needs}
          hint={needs ? "Revisions requested" : "All clear"}
        />
      </div>

      {mine.length === 0 ? (
        <Empty
          title="Your first idea starts here"
          body="Submissions take about 10 minutes. The AI Pitch Coach will score your readiness before you send it to the panel."
          action={
            <Button asChild variant="hero">
              <Link to="/ideas/new">
                Start an idea <ArrowRight />
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {mine.map((i, n) => (
            <IdeaCard key={i.id} idea={i} delay={n * 50} />
          ))}
        </div>
      )}
    </div>
  );
}

function IdeaCard({ idea, delay = 0 }: { idea: Idea; delay?: number }) {
  return (
    <Link
      to="/ideas/$id"
      params={{ id: idea.id }}
      className="animate-rise group block rounded-2xl border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elegant"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {idea.reference} · {idea.category}
          </p>
          <h3 className="mt-1 truncate text-lg font-bold group-hover:text-accent">{idea.title}</h3>
        </div>
        <StageBadge stage={idea.stage} />
      </div>
      <div className="mt-5">
        <StageTracker stage={idea.stage} compact />
      </div>
      <p className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Updated {timeAgo(idea.updated_at)}</span>
        {idea.stage === "revision_requested" ? (
          <span className="font-semibold text-accent">Action needed →</span>
        ) : (
          <span className="opacity-0 transition-opacity group-hover:opacity-100">Open →</span>
        )}
      </p>
    </Link>
  );
}

function StaffView() {
  const { data, isLoading } = useIdeas();
  const { data: events } = useEvents();
  const ideas = (data ?? []).filter((i) => i.stage !== "draft");
  const byId = new Map((data ?? []).map((i) => [i.id, i]));
  const count = (s: Stage) => ideas.filter((i) => i.stage === s).length;
  const scored = ideas.filter((i) => i.avg_score != null);
  const avg = scored.length
    ? (scored.reduce((a, i) => a + Number(i.avg_score), 0) / scored.length).toFixed(1)
    : "—";
  const max = Math.max(1, ...PIPELINE.map(count));
  const top = [...scored].sort((a, b) => Number(b.avg_score) - Number(a.avg_score)).slice(0, 5);

  if (isLoading) return <ListSkeleton />;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Submissions" value={ideas.length} accent hint="Across all sectors" />
        <Stat label="Awaiting screening" value={count("submitted")} hint="New in the queue" />
        <Stat
          label="With the panel"
          value={count("screening") + count("evaluation") + count("adjudication")}
          hint="Screening to adjudication"
        />
        <Stat
          label="Average score"
          value={avg}
          hint={`${scored.length} scored ideas, out of 100`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Pipeline</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/review">
                Open queue <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 space-y-3">
            {PIPELINE.map((s) => (
              <Link
                key={s}
                to="/review"
                search={{ stage: s }}
                className="grid grid-cols-[120px_1fr_32px] items-center gap-3 text-sm hover:opacity-80"
              >
                <span className="font-medium">{STAGE_META[s].label}</span>
                <span className="h-3 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-gradient-ember transition-all duration-700"
                    style={{ width: `${(count(s) / max) * 100}%` }}
                  />
                </span>
                <span className="text-right font-display font-bold">{count(s)}</span>
              </Link>
            ))}
            <div className="flex gap-4 border-t pt-3 text-xs text-muted-foreground">
              <span>
                Revisions requested:{" "}
                <b className="text-foreground">{count("revision_requested")}</b>
              </span>
              <span>
                Not progressed: <b className="text-foreground">{count("rejected")}</b>
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            Live activity <Radio className="size-4 animate-pulse text-success" />
          </h2>
          <ul className="mt-4 space-y-3">
            {(events ?? []).slice(0, 8).map((e) => {
              const idea = byId.get(e.idea_id);
              return (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <Link
                      to="/ideas/$id"
                      params={{ id: e.idea_id }}
                      className="font-semibold hover:text-accent"
                    >
                      {idea?.title ?? "An idea"}
                    </Link>
                    <span className="text-muted-foreground"> moved to </span>
                    <StageBadge stage={e.to_stage} />
                    <p className="text-xs text-muted-foreground">
                      {timeAgo(e.created_at)}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
            {!events?.length && <li className="text-sm text-muted-foreground">No activity yet.</li>}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <h2 className="text-xl font-bold">Leaderboard</h2>
        <p className="text-sm text-muted-foreground">Highest weighted scores so far.</p>
        <div className="mt-4 divide-y">
          {top.map((i, n) => (
            <Link
              key={i.id}
              to="/ideas/$id"
              params={{ id: i.id }}
              className="flex items-center gap-4 py-3 hover:bg-muted/40"
            >
              <span className="w-6 font-display text-lg font-extrabold text-muted-foreground">
                {n + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{i.title}</p>
                <p className="text-xs text-muted-foreground">
                  {i.company_name} · {i.category}
                </p>
              </div>
              <StageBadge stage={i.stage} />
              <span className="w-14 text-right font-display text-xl font-extrabold text-accent">
                {Number(i.avg_score).toFixed(0)}
              </span>
            </Link>
          ))}
          {!top.length && (
            <p className="py-4 text-sm text-muted-foreground">
              Scores appear here once evaluators start marking.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
