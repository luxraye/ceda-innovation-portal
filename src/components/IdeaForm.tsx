import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Save, Send, Loader2, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { analyzeIdea, type AiInsight } from "@/lib/ai.functions";
import { CATEGORIES } from "@/lib/stages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type IdeaDraft = {
  id?: string;
  title: string;
  category: string;
  company_name: string;
  youth_shareholding: number;
  team_size: number;
  problem: string;
  solution: string;
  impact: string;
  target_market: string;
};

export const emptyIdea: IdeaDraft = {
  title: "", category: "Other", company_name: "", youth_shareholding: 51, team_size: 1,
  problem: "", solution: "", impact: "", target_market: "",
};

const REQUIRED: { key: keyof IdeaDraft; label: string; min: number }[] = [
  { key: "title", label: "Idea title", min: 3 },
  { key: "company_name", label: "Company name", min: 2 },
  { key: "problem", label: "Problem statement", min: 20 },
  { key: "solution", label: "Proposed solution", min: 20 },
  { key: "impact", label: "Expected impact", min: 10 },
];

export function missingFields(d: IdeaDraft) {
  return REQUIRED.filter((r) => String(d[r.key] ?? "").trim().length < r.min);
}

export function IdeaForm({ initial, onDone }: { initial: IdeaDraft; onDone?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeIdea);
  const [d, setD] = useState<IdeaDraft>(initial);
  const [busy, setBusy] = useState<"save" | "submit" | null>(null);
  const [ai, setAi] = useState<AiInsight | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [touched, setTouched] = useState(false);

  const missing = missingFields(d);
  const youthOk = d.youth_shareholding > 50;
  const completeness = Math.round(((REQUIRED.length - missing.length + (d.target_market.trim() ? 1 : 0)) / (REQUIRED.length + 1)) * 100);
  const set = <K extends keyof IdeaDraft>(k: K, v: IdeaDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const persist = async (): Promise<string | null> => {
    if (!user) return null;
    const { id, ...fields } = d;
    if (id) {
      const { error } = await supabase.from("ideas").update({ ...fields, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) { toast.error(error.message); return null; }
      return id;
    }
    const { data, error } = await supabase.from("ideas").insert({ ...fields, owner_id: user.id }).select("id").single();
    if (error) { toast.error(error.message); return null; }
    setD((p) => ({ ...p, id: data.id }));
    return data.id;
  };

  const save = async () => {
    setBusy("save");
    const id = await persist();
    setBusy(null);
    if (id) { toast.success("Draft saved"); onDone?.(); if (!initial.id) navigate({ to: "/ideas/$id", params: { id } }); }
  };

  const submit = async () => {
    setTouched(true);
    if (missing.length || !youthOk) { toast.error("Please complete all mandatory fields before submitting."); return; }
    setBusy("submit");
    const id = await persist();
    if (!id) return setBusy(null);
    const { error } = await supabase.rpc("submit_idea", { _idea_id: id });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Idea submitted — you can track it live.");
    onDone?.();
    navigate({ to: "/ideas/$id", params: { id } });
  };

  const runCoach = async () => {
    setAiBusy(true);
    const res = await analyze({ data: { ...d, mode: "coach" } });
    setAiBusy(false);
    if (res.error) toast.error(res.error);
    setAi(res.insight);
  };

  const err = (k: keyof IdeaDraft) => touched && missing.some((m) => m.key === k);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6 rounded-2xl border bg-card p-6 shadow-card md:p-8">
        <Section n="01" title="The venture">
          <Field label="Idea title" required error={err("title")}>
            <Input value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Solar cold-chain for smallholder farmers" />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Registered company" required error={err("company_name")}>
              <Input value={d.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="Company (Pty) Ltd" />
            </Field>
            <Field label="Sector">
              <Select value={d.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label={`Youth shareholding (18–35): ${d.youth_shareholding}%`} required error={touched && !youthOk}>
              <Slider value={[d.youth_shareholding]} min={0} max={100} step={1} onValueChange={([v]) => set("youth_shareholding", v)} />
              <p className={`text-xs ${youthOk ? "text-success" : "text-destructive"}`}>
                {youthOk ? "Eligible — youth-owned majority" : "Must be more than 50% to be eligible"}
              </p>
            </Field>
            <Field label="Team size">
              <Input type="number" min={1} value={d.team_size} onChange={(e) => set("team_size", Math.max(1, Number(e.target.value)))} />
            </Field>
          </div>
        </Section>
        <Section n="02" title="Problem & solution">
          <Field label="What problem are you solving?" required error={err("problem")} hint={`${d.problem.length} chars · min 20`}>
            <Textarea rows={4} value={d.problem} onChange={(e) => set("problem", e.target.value)} />
          </Field>
          <Field label="Your proposed solution" required error={err("solution")} hint={`${d.solution.length} chars · min 20`}>
            <Textarea rows={4} value={d.solution} onChange={(e) => set("solution", e.target.value)} />
          </Field>
        </Section>
        <Section n="03" title="Impact & market">
          <Field label="Expected socio-economic impact" required error={err("impact")}>
            <Textarea rows={3} value={d.impact} onChange={(e) => set("impact", e.target.value)} placeholder="Jobs, SDGs, national transformation…" />
          </Field>
          <Field label="Target market">
            <Input value={d.target_market} onChange={(e) => set("target_market", e.target.value)} />
          </Field>
        </Section>
        <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
          <Button variant="outline" onClick={save} disabled={!!busy || d.title.trim().length < 3}>
            {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />} Save draft
          </Button>
          <Button variant="hero" onClick={submit} disabled={!!busy}>
            {busy === "submit" ? <Loader2 className="animate-spin" /> : <Send />} Submit idea
          </Button>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>Submission completeness</span><span>{completeness}%</span>
          </div>
          <Progress value={completeness} />
          <ul className="mt-4 space-y-1.5 text-sm">
            {REQUIRED.map((r) => {
              const ok = !missing.some((m) => m.key === r.key);
              return (
                <li key={r.key} className={`flex items-center gap-2 ${ok ? "text-foreground" : "text-muted-foreground"}`}>
                  <CheckCircle2 className={`size-4 ${ok ? "text-success" : "text-border"}`} />{r.label}
                </li>
              );
            })}
            <li className={`flex items-center gap-2 ${youthOk ? "" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`size-4 ${youthOk ? "text-success" : "text-border"}`} />Youth majority &gt;50%
            </li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl bg-ink p-5 text-ink-foreground shadow-elegant">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Sparkles className="size-5 text-primary" /> AI Pitch Coach
          </div>
          <p className="mt-1 text-sm opacity-70">Get an instant readiness score and evaluator-style feedback before you submit.</p>
          <Button variant="hero" className="mt-4 w-full" onClick={runCoach} disabled={aiBusy || d.problem.length < 10}>
            {aiBusy ? <><Loader2 className="animate-spin" /> Analysing…</> : <><Sparkles /> Review my pitch</>}
          </Button>
          {ai && <InsightView insight={ai} />}
        </div>
      </aside>
    </div>
  );
}

export function InsightView({ insight }: { insight: AiInsight }) {
  return (
    <div className="mt-5 space-y-4 animate-rise">
      <div className="flex items-center gap-4">
        <div className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-ember font-display text-xl font-extrabold text-primary-foreground">
          {Math.round(insight.readiness)}
        </div>
        <p className="text-sm font-medium leading-snug">{insight.headline}</p>
      </div>
      <InsightList icon={<CheckCircle2 className="size-4 text-success" />} title="Strengths" items={insight.strengths} />
      <InsightList icon={<AlertTriangle className="size-4 text-primary" />} title="Gaps" items={insight.gaps} />
      <InsightList icon={<Lightbulb className="size-4 text-primary-glow" />} title="Suggestions" items={insight.suggestions} />
    </div>
  );
}

function InsightList({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-80">{icon}{title}</div>
      <ul className="space-y-1 text-sm opacity-90">{items?.map((s, i) => <li key={i}>• {s}</li>)}</ul>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-sm font-bold text-accent">{n}</span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, error, hint, children }: { label: string; required?: boolean; error?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label className={error ? "text-destructive" : ""}>{label}{required && <span className="text-accent"> *</span>}</Label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">This field is mandatory.</p>}
    </div>
  );
}
