import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  Gavel,
  Loader2,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, Empty } from "@/components/AppShell";
import { IdeaForm, InsightView, type IdeaDraft } from "@/components/IdeaForm";
import { StageBadge, StageTracker } from "@/components/stage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import { analyzeIdea, type AiInsight } from "@/lib/ai.functions";
import { allowedTransitions, isStaff, STAGE_META, type Stage } from "@/lib/stages";
import {
  initials,
  timeAgo,
  useCriteria,
  useEvents,
  useFeedback,
  useIdea,
  useLiveUpdates,
  useScores,
  type Idea,
} from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ideas/$id")({
  head: () => ({ meta: [{ title: "Idea — CEDA Innovation Portal" }] }),
  component: IdeaPage,
});

function IdeaPage() {
  const { id } = Route.useParams();
  const { user, roles } = useAuth();
  const { data: idea, isLoading, refetch } = useIdea(id);
  const [editing, setEditing] = useState(false);
  useLiveUpdates("idea", { ideaId: id });

  const staff = isStaff(roles);
  const owner = idea?.owner_id === user?.id;
  const editable = owner && (idea?.stage === "draft" || idea?.stage === "revision_requested");

  if (isLoading) {
    return (
      <AppShell title="Loading…">
        <Skeleton className="h-64 rounded-2xl" />
      </AppShell>
    );
  }
  if (!idea) {
    return (
      <AppShell title="Idea not found">
        <Empty
          title="We couldn't find that idea"
          body="It may have been deleted, or you may not have access to it."
          action={
            <Button asChild variant="outline">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={idea.title}
      subtitle={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <Link
            to={staff ? "/review" : "/dashboard"}
            className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
          >
            <ArrowLeft className="size-3.5" /> Back
          </Link>
          <span className="font-mono text-xs">{idea.reference}</span>
          <span>{idea.category}</span>
          <StageBadge stage={idea.stage} />
        </span>
      }
      actions={
        editable && !editing ? (
          <>
            {idea.stage === "draft" && <DeleteDraft id={idea.id} />}
            <Button variant="hero" onClick={() => setEditing(true)}>
              <Pencil /> {idea.stage === "draft" ? "Continue editing" : "Revise & resubmit"}
            </Button>
          </>
        ) : undefined
      }
    >
      {editing ? (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            <ArrowLeft /> Back to idea
          </Button>
          <IdeaForm
            initial={toDraft(idea)}
            onDone={() => {
              setEditing(false);
              refetch();
            }}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <StageTracker stage={idea.stage} />
            </div>
            <Tabs defaultValue="overview">
              <TabsList className="flex-wrap">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                {staff && <TabsTrigger value="scoring">Scoring</TabsTrigger>}
              </TabsList>
              <TabsContent value="overview">
                <Overview idea={idea} />
              </TabsContent>
              <TabsContent value="timeline">
                <Timeline ideaId={idea.id} />
              </TabsContent>
              <TabsContent value="conversation">
                <Conversation idea={idea} />
              </TabsContent>
              {staff && (
                <TabsContent value="scoring">
                  <Scoring idea={idea} />
                </TabsContent>
              )}
            </Tabs>
          </div>
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <ScoreCard idea={idea} />
            {staff && <DecisionPanel idea={idea} />}
            {staff && <AiBrief idea={idea} />}
            {!staff && owner && <OwnerHelp idea={idea} />}
          </aside>
        </div>
      )}
    </AppShell>
  );
}

function toDraft(i: Idea): IdeaDraft {
  return {
    id: i.id,
    title: i.title,
    category: i.category,
    company_name: i.company_name,
    youth_shareholding: i.youth_shareholding,
    team_size: i.team_size,
    problem: i.problem,
    solution: i.solution,
    impact: i.impact,
    target_market: i.target_market,
  };
}

function Overview({ idea }: { idea: Idea }) {
  const blocks: [string, string][] = [
    ["The problem", idea.problem],
    ["Proposed solution", idea.solution],
    ["Socio-economic impact", idea.impact],
    ["Target market", idea.target_market],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Fact
          icon={<Building2 className="size-4" />}
          label="Company"
          value={idea.company_name || "—"}
        />
        <Fact
          icon={<Users className="size-4" />}
          label="Team size"
          value={String(idea.team_size)}
        />
        <Fact
          icon={<span className="text-xs font-bold">%</span>}
          label="Youth shareholding"
          value={`${idea.youth_shareholding}%`}
          ok={idea.youth_shareholding > 50}
        />
      </div>
      <div className="divide-y rounded-2xl border bg-card shadow-card">
        {blocks.map(([h, b]) => (
          <div key={h} className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent">{h}</h3>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed">
              {b || <span className="text-muted-foreground">Not provided yet.</span>}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fact({
  icon,
  label,
  value,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate font-display text-lg font-bold",
          ok === true && "text-success",
          ok === false && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Timeline({ ideaId }: { ideaId: string }) {
  const { data } = useEvents(ideaId);
  if (!data?.length)
    return (
      <Empty
        title="No activity yet"
        body="Every stage change will appear here the moment it happens."
      />
    );
  return (
    <ol className="relative space-y-6 rounded-2xl border bg-card p-6 shadow-card before:absolute before:bottom-8 before:left-[35px] before:top-8 before:w-px before:bg-border">
      {data.map((e, n) => (
        <li key={e.id} className="relative flex gap-4">
          <span
            className={cn(
              "z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-card",
              n === 0 ? "bg-gradient-ember" : "bg-muted",
            )}
          >
            <span className="size-1.5 rounded-full bg-card" />
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              {e.from_stage && (
                <>
                  <StageBadge stage={e.from_stage} />
                  <span className="text-muted-foreground">→</span>
                </>
              )}
              <StageBadge stage={e.to_stage} />
            </p>
            {e.note && <p className="mt-1.5 text-sm">{e.note}</p>}
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(e.created_at).toLocaleString("en-BW", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              · {timeAgo(e.created_at)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Conversation({ idea }: { idea: Idea }) {
  const { user, roles } = useAuth();
  const { data, refetch } = useFeedback(idea.id);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const staff = isStaff(roles);

  const send = async () => {
    if (!user || !msg.trim()) return;
    setBusy(true);
    const { error } = await supabase.from("feedback").insert({
      idea_id: idea.id,
      author_id: user.id,
      author_name:
        (user.user_metadata?.["full_name"] as string | undefined) ?? user.email ?? "User",
      is_staff: staff,
      message: msg.trim(),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMsg("");
    refetch();
  };

  return (
    <div className="rounded-2xl border bg-card shadow-card">
      <div className="max-h-[480px] space-y-4 overflow-y-auto p-6">
        {data?.length ? (
          data.map((f) => {
            const mine = f.author_id === user?.id;
            return (
              <div key={f.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold",
                    f.is_staff ? "bg-ink text-ink-foreground" : "bg-secondary",
                  )}
                >
                  {initials(f.author_name)}
                </span>
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    mine ? "bg-gradient-ember text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p className="text-xs font-semibold opacity-75">
                    {f.author_name}
                    {f.is_staff ? " · CEDA panel" : ""} · {timeAgo(f.created_at)}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap">{f.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {staff
              ? "Ask the innovator a question or explain what to improve."
              : "Questions from the panel will appear here, and you can reply."}
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t p-4">
        <Textarea
          rows={2}
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Write a message…"
          className="min-h-0 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
        />
        <Button variant="hero" onClick={send} disabled={busy || !msg.trim()} className="self-end">
          {busy ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}

function Scoring({ idea }: { idea: Idea }) {
  const { user, roles } = useAuth();
  const qc = useQueryClient();
  const { data: criteria } = useCriteria();
  const { data: scores } = useScores(idea.id);
  const canScore = roles.includes("evaluator") || roles.includes("admin");
  const active = (criteria ?? []).filter((c) => c.active);
  const [vals, setVals] = useState<Record<string, { score: number; comment: string }>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const mine = (scores ?? []).filter((s) => s.evaluator_id === user?.id);
    const next: Record<string, { score: number; comment: string }> = {};
    active.forEach((c) => {
      const s = mine.find((m) => m.criterion_id === c.id);
      next[c.id] = { score: s?.score ?? Math.round(c.max_score / 2), comment: s?.comment ?? "" };
    });
    setVals(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, criteria, user?.id]);

  const upd = (id: string, patch: Partial<{ score: number; comment: string }>) =>
    setVals((p) => ({
      ...p,
      [id]: { score: p[id]?.score ?? 0, comment: p[id]?.comment ?? "", ...patch },
    }));

  const panel = useMemo(() => {
    const evaluators = new Set((scores ?? []).map((s) => s.evaluator_id));
    return { count: evaluators.size };
  }, [scores]);

  const totalWeight = active.reduce((a, c) => a + c.weight, 0) || 1;
  const preview =
    (active.reduce((a, c) => a + ((vals[c.id]?.score ?? 0) / c.max_score) * c.weight, 0) /
      totalWeight) *
    100;

  const save = async () => {
    if (!user) return;
    setBusy(true);
    const rows = active.map((c) => ({
      idea_id: idea.id,
      evaluator_id: user.id,
      criterion_id: c.id,
      score: vals[c.id]?.score ?? 0,
      comment: vals[c.id]?.comment || null,
    }));
    const { error } = await supabase
      .from("scores")
      .upsert(rows, { onConflict: "idea_id,evaluator_id,criterion_id" });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Scores saved");
    qc.invalidateQueries({ queryKey: ["scores"] });
    qc.invalidateQueries({ queryKey: ["idea", idea.id] });
    qc.invalidateQueries({ queryKey: ["ideas"] });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">{canScore ? "Your scorecard" : "Panel scorecard"}</h3>
            <p className="text-sm text-muted-foreground">
              Weighted criteria set by the CEDA administrator. {panel.count} evaluator
              {panel.count === 1 ? "" : "s"} scored so far.
            </p>
          </div>
          {canScore && (
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your weighted score
              </p>
              <p className="font-display text-3xl font-extrabold text-accent">
                {preview.toFixed(0)}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 space-y-6">
          {active.map((c) => {
            const all = (scores ?? []).filter((s) => s.criterion_id === c.id);
            const avg = all.length ? all.reduce((a, s) => a + s.score, 0) / all.length : null;
            return (
              <div key={c.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {c.name}{" "}
                      <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-xs">
                        {c.weight}%
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Panel avg{" "}
                    <b className="text-foreground">{avg == null ? "—" : avg.toFixed(1)}</b>/
                    {c.max_score}
                  </p>
                </div>
                {canScore &&
                  vals[c.id] &&
                  (() => {
                    const v = vals[c.id]!;
                    return (
                      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                        <Slider
                          value={[v.score]}
                          min={0}
                          max={c.max_score}
                          step={1}
                          onValueChange={([v]) => upd(c.id, { score: v ?? 0 })}
                        />
                        <span className="w-14 text-right font-display text-xl font-extrabold">
                          {v.score}
                          <span className="text-xs text-muted-foreground">/{c.max_score}</span>
                        </span>
                        <Textarea
                          rows={1}
                          className="min-h-0 md:col-span-2"
                          placeholder="Comment (optional, visible to the panel)"
                          value={v.comment}
                          onChange={(e) => upd(c.id, { comment: e.target.value })}
                        />
                      </div>
                    );
                  })()}
                {!canScore && all.filter((s) => s.comment).length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {all
                      .filter((s) => s.comment)
                      .map((s) => (
                        <li key={s.id} className="text-muted-foreground">
                          “{s.comment}”
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        {canScore && (
          <div className="mt-6 flex justify-end">
            <Button variant="hero" onClick={save} disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save scores
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ idea }: { idea: Idea }) {
  const score = idea.avg_score == null ? null : Number(idea.avg_score);
  return (
    <div className="overflow-hidden rounded-2xl bg-ink p-5 text-ink-foreground shadow-elegant">
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
        Weighted panel score
      </p>
      <div className="mt-2 flex items-end gap-2">
        <span className="font-display text-5xl font-extrabold text-gradient-ember">
          {score == null ? "—" : score.toFixed(0)}
        </span>
        <span className="mb-1.5 text-sm opacity-60">/ 100</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-foreground/15">
        <div
          className="h-full rounded-full bg-gradient-ember transition-all duration-700"
          style={{ width: `${score ?? 0}%` }}
        />
      </div>
      <p className="mt-3 text-xs opacity-70">
        {idea.submitted_at ? `Submitted ${timeAgo(idea.submitted_at)}` : "Not submitted yet"} ·
        Updated {timeAgo(idea.updated_at)}
      </p>
    </div>
  );
}

function DecisionPanel({ idea }: { idea: Idea }) {
  const { roles } = useAuth();
  const qc = useQueryClient();
  const options = allowedTransitions(roles, idea.stage);
  const [to, setTo] = useState<Stage | "">("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const move = async () => {
    if (!to) return;
    if (to === "revision_requested" && !note.trim()) {
      toast.error("Tell the innovator what to change.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc("advance_idea", {
      _idea_id: idea.id,
      _to: to,
      _note: note.trim() || `Moved to ${STAGE_META[to].label}`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Moved to ${STAGE_META[to].label}`);
    setTo("");
    setNote("");
    qc.invalidateQueries({ queryKey: ["idea", idea.id] });
    qc.invalidateQueries({ queryKey: ["events"] });
    qc.invalidateQueries({ queryKey: ["ideas"] });
  };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold">
        <Gavel className="size-5 text-accent" /> Decision
      </h3>
      {options.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {idea.stage === "draft"
            ? "This idea is still a draft."
            : "Your role can't move this idea from its current stage."}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <Select value={to} onValueChange={(v) => setTo(v as Stage)}>
            <SelectTrigger>
              <SelectValue placeholder="Move to stage…" />
            </SelectTrigger>
            <SelectContent>
              {options.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              to === "revision_requested"
                ? "What should the innovator change? (required)"
                : "Note for the record (shown on the timeline)"
            }
          />
          <Button variant="hero" className="w-full" onClick={move} disabled={!to || busy}>
            {busy && <Loader2 className="animate-spin" />} Confirm decision
          </Button>
          <p className="text-xs text-muted-foreground">
            Every decision is logged with your name and time. The innovator sees it instantly.
          </p>
        </div>
      )}
    </div>
  );
}

function AiBrief({ idea }: { idea: Idea }) {
  const analyze = useServerFn(analyzeIdea);
  const [ai, setAi] = useState<AiInsight | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    const res = await analyze({
      data: {
        title: idea.title,
        category: idea.category,
        problem: idea.problem,
        solution: idea.solution,
        impact: idea.impact,
        target_market: idea.target_market,
        mode: "evaluator",
      },
    });
    setBusy(false);
    if (res.error) toast.error(res.error);
    setAi(res.insight);
  };
  return (
    <div className="rounded-2xl bg-ink p-5 text-ink-foreground shadow-elegant">
      <div className="flex items-center gap-2 font-display text-lg font-bold">
        <Sparkles className="size-5 text-primary" /> AI panel brief
      </div>
      <p className="mt-1 text-sm opacity-70">
        An objective summary against the five CEDA criteria to speed up your review. You make the
        call.
      </p>
      <Button variant="hero" className="mt-4 w-full" onClick={run} disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="animate-spin" /> Reading…
          </>
        ) : (
          <>
            <Sparkles /> Generate brief
          </>
        )}
      </Button>
      {ai && <InsightView insight={ai} />}
    </div>
  );
}

function OwnerHelp({ idea }: { idea: Idea }) {
  const text: Partial<Record<Stage, string>> = {
    draft:
      "Finish the mandatory fields and submit when you're ready. Run the AI Pitch Coach first for a readiness score.",
    submitted: "Your idea is in the queue. A CEDA officer will screen it for eligibility shortly.",
    screening: "An officer is checking eligibility and completeness.",
    evaluation: "Evaluators are scoring your idea against the weighted criteria.",
    adjudication: "The adjudication committee is reviewing the panel's scores.",
    revision_requested:
      "The panel asked for changes. Check the timeline and conversation, then revise and resubmit.",
    approved: "Approved! The committee will confirm awards shortly.",
    awarded: "Awarded. CEDA will contact you about next steps.",
    rejected: "This idea did not progress in this round. Check the conversation for feedback.",
  };
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <h3 className="font-display text-lg font-bold">What happens next</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{text[idea.stage]}</p>
    </div>
  );
}

function DeleteDraft({ id }: { id: string }) {
  const navigate = useNavigate();
  const del = async () => {
    const { error } = await supabase.from("ideas").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Draft deleted");
    navigate({ to: "/dashboard" });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Trash2 /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={del}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
