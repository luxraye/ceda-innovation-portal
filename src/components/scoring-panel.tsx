"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { saveScores } from "@/app/actions/evaluation";

type Criterion = { id: string; name: string; description: string; weight: number; maxScore: number };

export function ScoringPanel({ assignmentId, criteria, existing, overall: initialOverall, done }: { assignmentId: string; criteria: Criterion[]; existing: { criterionId: string; value: number; comment: string }[]; overall: string; done: boolean }) {
  const router = useRouter();
  const [vals, setVals] = useState<Record<string, number | null>>(Object.fromEntries(criteria.map((c) => [c.id, existing.find((e) => e.criterionId === c.id)?.value ?? null])));
  const [comments, setComments] = useState<Record<string, string>>(Object.fromEntries(criteria.map((c) => [c.id, existing.find((e) => e.criterionId === c.id)?.comment ?? ""])));
  const [share, setShare] = useState<Record<string, boolean>>(Object.fromEntries(criteria.map((c) => [c.id, true])));
  const [overall, setOverall] = useState(initialOverall);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const total = criteria.reduce((sum, c) => sum + ((vals[c.id] ?? 0) / c.maxScore) * c.weight, 0);
  const scored = criteria.filter((c) => vals[c.id] !== null).length;

  function payload() {
    return criteria.filter((c) => vals[c.id] !== null).map((c) => ({ criterionId: c.id, value: vals[c.id] as number, comment: comments[c.id] ?? "", share: share[c.id] }));
  }
  function save(final: boolean) {
    setMsg(null);
    start(async () => {
      try {
        await saveScores(assignmentId, payload(), overall, final);
        setMsg(final ? "Scores submitted. Thank you." : "Progress saved.");
        if (final) router.refresh();
      } catch (e) {
        setMsg((e as Error).message);
      }
    });
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between bg-navy-900 px-5 py-4 text-white">
        <div>
          <div className="text-xs text-sky-200">Weighted score</div>
          <div className="font-display text-3xl font-bold">{total.toFixed(1)}<span className="text-base text-sky-200"> / 100</span></div>
        </div>
        <div className="text-right text-xs text-sky-200">{scored} of {criteria.length} criteria scored</div>
      </div>
      <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
        {criteria.map((c) => (
          <div key={c.id}>
            <div className="flex items-baseline justify-between gap-2">
              <div className="text-sm font-semibold text-navy-900">{c.name}</div>
              <div className="font-mono text-xs text-sky-700">{c.weight}%</div>
            </div>
            <p className="text-xs text-slate-500">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label={`Score for ${c.name}`}>
              {Array.from({ length: c.maxScore + 1 }, (_, n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={vals[c.id] === n}
                  disabled={done}
                  onClick={() => setVals((v) => ({ ...v, [c.id]: n }))}
                  className={`h-8 w-8 rounded-lg border text-xs font-semibold transition ${vals[c.id] === n ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <textarea disabled={done} value={comments[c.id]} onChange={(e) => setComments((x) => ({ ...x, [c.id]: e.target.value }))} rows={2} className="input mt-2 text-xs" placeholder="Comment on this criterion" />
            {!done && (
              <label className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <input type="checkbox" checked={share[c.id]} onChange={(e) => setShare((x) => ({ ...x, [c.id]: e.target.checked }))} className="accent-sky-600" />
                Share this comment with the applicant as feedback
              </label>
            )}
          </div>
        ))}
        <div>
          <label className="label" htmlFor="overall">Note to the committee (not shared with the applicant)</label>
          <textarea id="overall" disabled={done} value={overall} onChange={(e) => setOverall(e.target.value)} rows={3} className="input text-sm" />
        </div>
      </div>
      <div className="border-t border-slate-100 p-5">
        {done ? (
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-5 w-5" /> Submitted. Scores are locked.</div>
        ) : (
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => save(false)} disabled={pending}>Save progress</button>
            <button className="btn-primary flex-1" onClick={() => save(true)} disabled={pending || scored < criteria.length}>Submit scores</button>
          </div>
        )}
        {msg && <p className="mt-2 text-center text-xs text-slate-600" role="status">{msg}</p>}
      </div>
    </div>
  );
}
