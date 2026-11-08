"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { createCall, type CallInput } from "@/app/actions/calls";
import { CALL_SECTORS, VENTURE_STAGES, VENTURE_STAGE_HINT, type FormField, type FieldType } from "@/lib/domain";

type Crit = { name: string; description: string; weight: number; maxScore: number };
type Stage = { name: string; kind: string; description: string; minReviewers: number; blind: boolean };

const TYPES: { v: FieldType; label: string }[] = [
  { v: "text", label: "Short answer" },
  { v: "textarea", label: "Long answer" },
  { v: "select", label: "Choice" },
  { v: "number", label: "Number" },
  { v: "url", label: "Link" },
  { v: "file", label: "Document upload" },
];

export function CallBuilder({ defaults }: { defaults: { fields: FormField[]; criteria: Crit[]; stages: Stage[] } }) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const inMonth = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const [meta, setMeta] = useState({ title: "", theme: "", sector: "Cross-sector" as string, ventureStage: "Idea" as string, tagline: "", description: "", prizePool: 500000, opensAt: today, closesAt: inMonth, status: "OPEN" as "OPEN" | "DRAFT" });
  const [fields, setFields] = useState<FormField[]>(defaults.fields);
  const [criteria, setCriteria] = useState<Crit[]>(defaults.criteria);
  const [stages, setStages] = useState<Stage[]>(defaults.stages);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const weightTotal = criteria.reduce((a, c) => a + (Number(c.weight) || 0), 0);

  const move = <T,>(list: T[], i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return list;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  function save() {
    setError(null);
    start(async () => {
      const r = await createCall({ ...meta, fields, criteria, stages } as unknown as CallInput);
      if ("error" in r && r.error) setError(r.error);
      else router.push("/app/admin/calls");
    });
  }

  return (
    <div className="space-y-6">
      <section className="card p-6">
        <h2 className="font-semibold text-navy-900">1. About the call</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2"><label className="label">Title</label><input className="input" value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder="e.g. Tourism Innovation Challenge 2027" /></div>
          <div><label className="label">Theme</label><input className="input" value={meta.theme} onChange={(e) => setMeta({ ...meta, theme: e.target.value })} placeholder="e.g. Tourism & Creative" /></div>
          <div>
            <label className="label">Sector (matrix row)</label>
            <select className="input" value={meta.sector} onChange={(e) => setMeta({ ...meta, sector: e.target.value })}>
              {CALL_SECTORS.map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Venture stage (matrix column)</label>
            <select className="input" value={meta.ventureStage} onChange={(e) => setMeta({ ...meta, ventureStage: e.target.value })}>
              {VENTURE_STAGES.map((x) => <option key={x} value={x}>{x}: {VENTURE_STAGE_HINT[x].toLowerCase()}</option>)}
            </select>
          </div>
          <div><label className="label">Prize pool (BWP)</label><input type="number" className="input" value={meta.prizePool} onChange={(e) => setMeta({ ...meta, prizePool: Number(e.target.value) })} /></div>
          <div className="md:col-span-2"><label className="label">One-line pitch</label><input className="input" value={meta.tagline} onChange={(e) => setMeta({ ...meta, tagline: e.target.value })} /></div>
          <div className="md:col-span-2"><label className="label">The challenge</label><textarea rows={4} className="input" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} /></div>
          <div><label className="label">Opens</label><input type="date" className="input" value={meta.opensAt} onChange={(e) => setMeta({ ...meta, opensAt: e.target.value })} /></div>
          <div><label className="label">Closes</label><input type="date" className="input" value={meta.closesAt} onChange={(e) => setMeta({ ...meta, closesAt: e.target.value })} /></div>
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">2. Application form <span className="text-sm font-normal text-slate-500">({fields.length} questions)</span></h2>
          <button type="button" className="btn-ghost py-2" onClick={() => setFields([...fields, { key: `q${fields.length + 1}`, label: "New question", type: "textarea", required: true, section: "Additional questions" }])}><Plus className="h-4 w-4" /> Add question</button>
        </div>
        <div className="mt-4 space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="grid items-center gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_9rem_9rem_6rem_auto]">
              <input className="input py-1.5 text-sm" value={f.label} onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} aria-label="Question" />
              <input className="input py-1.5 text-sm" value={f.section} onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, section: e.target.value } : x)))} aria-label="Section" />
              <select className="input py-1.5 text-sm" value={f.type} onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, type: e.target.value as FieldType, options: e.target.value === "select" ? x.options ?? ["Option 1", "Option 2"] : undefined } : x)))} aria-label="Type">
                {TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
              </select>
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={f.required} onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))} className="accent-sky-600" /> Required</label>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setFields(move(fields, i, -1))} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setFields(move(fields, i, 1))} aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30" disabled={f.key === "title" || f.key === "summary"} onClick={() => setFields(fields.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
              {f.type === "select" && (
                <input className="input py-1.5 text-xs md:col-span-5" value={(f.options ?? []).join(", ")} onChange={(e) => setFields(fields.map((x, j) => (j === i ? { ...x, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)))} placeholder="Options, separated by commas" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">3. Scoring rubric</h2>
          <span className={`chip ${weightTotal === 100 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>Weights: {weightTotal} / 100</span>
        </div>
        <div className="mt-4 space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="grid items-center gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[14rem_1fr_6rem_6rem_auto]">
              <input className="input py-1.5 text-sm" value={c.name} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Criterion" />
              <input className="input py-1.5 text-sm" value={c.description} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} aria-label="What evaluators look for" />
              <label className="flex items-center gap-1 text-xs"><input type="number" className="input py-1.5 text-sm" value={c.weight} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) } : x)))} aria-label="Weight" />%</label>
              <label className="flex items-center gap-1 text-xs">0-<input type="number" min={3} max={10} className="input py-1.5 text-sm" value={c.maxScore} onChange={(e) => setCriteria(criteria.map((x, j) => (j === i ? { ...x, maxScore: Number(e.target.value) } : x)))} aria-label="Maximum score" /></label>
              <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setCriteria(criteria.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <button type="button" className="btn-ghost py-2" onClick={() => setCriteria([...criteria, { name: "New criterion", description: "What evaluators look for", weight: 0, maxScore: 10 }])}><Plus className="h-4 w-4" /> Add criterion</button>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-navy-900">4. Evaluation stages</h2>
        <div className="mt-4 space-y-2">
          {stages.map((s, i) => (
            <div key={i} className="grid items-center gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[2rem_14rem_12rem_1fr_7rem_auto]">
              <span className="font-display font-semibold text-sky-600">{i + 1}</span>
              <input className="input py-1.5 text-sm" value={s.name} onChange={(e) => setStages(stages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Stage name" />
              <select className="input py-1.5 text-sm" value={s.kind} onChange={(e) => setStages(stages.map((x, j) => (j === i ? { ...x, kind: e.target.value } : x)))} aria-label="Stage type">
                <option value="SCREENING">Screening</option><option value="PANEL">Panel scoring</option><option value="ADJUDICATION">Committee</option><option value="AWARD">Award</option>
              </select>
              <input className="input py-1.5 text-sm" value={s.description} onChange={(e) => setStages(stages.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} aria-label="Description" />
              <label className="flex items-center gap-1.5 text-xs text-slate-600"><input type="checkbox" checked={s.blind} onChange={(e) => setStages(stages.map((x, j) => (j === i ? { ...x, blind: e.target.checked } : x)))} className="accent-sky-600" /> Blind</label>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" onClick={() => setStages(move(stages, i, -1))} aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" onClick={() => setStages(stages.filter((_, j) => j !== i))} aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <button type="button" className="btn-ghost py-2" onClick={() => setStages([...stages.slice(0, -1), { name: "Second panel round", kind: "PANEL", description: "A further scoring round for shortlisted ideas.", minReviewers: 2, blind: true }, ...stages.slice(-1)])}><Plus className="h-4 w-4" /> Add a stage</button>
        </div>
      </section>

      <div className="card sticky bottom-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <select className="input w-auto" value={meta.status} onChange={(e) => setMeta({ ...meta, status: e.target.value as "OPEN" | "DRAFT" })}>
          <option value="OPEN">Publish and open now</option><option value="DRAFT">Save as draft</option>
        </select>
        {error && <p className="flex-1 text-sm text-rose-600">{error}</p>}
        <button className="btn-primary ml-auto" onClick={save} disabled={pending}>{pending ? "Saving..." : "Save call"}</button>
      </div>
    </div>
  );
}
