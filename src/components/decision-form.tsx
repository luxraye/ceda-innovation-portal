"use client";

import { useState } from "react";
import { Gavel } from "lucide-react";

export function DecisionForm({ submissionId, back, stageName, stageKind, nextStageName, panelNote, action }: { submissionId: string; back: string; stageName: string; stageKind: string; nextStageName: string | null; panelNote: string | null; action: (f: FormData) => void }) {
  const options = [
    ...(nextStageName ? [{ v: "ADVANCE", label: `Advance to ${nextStageName}` }] : []),
    ...(stageKind === "ADJUDICATION" ? [{ v: "AWARD", label: "Award" }] : []),
    { v: "REQUEST_CHANGES", label: "Ask for changes" },
    { v: "DECLINE", label: "Decline" },
  ];
  const [outcome, setOutcome] = useState(options[0].v);
  return (
    <form action={action} className="card overflow-hidden">
      <div className="flex items-center gap-2 bg-navy-900 px-5 py-3 text-white"><Gavel className="h-5 w-5 text-gold-400" /><span className="font-semibold">Decision at {stageName}</span></div>
      <div className="space-y-4 p-5">
        {panelNote && <p className="text-xs text-slate-500">{panelNote}</p>}
        <input type="hidden" name="submissionId" value={submissionId} />
        <input type="hidden" name="back" value={back} />
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => (
            <label key={o.v} className={`cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-medium ${outcome === o.v ? (o.v === "DECLINE" ? "border-rose-400 bg-rose-50 text-rose-700" : o.v === "AWARD" ? "border-gold-500 bg-gold-300/30 text-earth-700" : "border-sky-500 bg-sky-50 text-sky-800") : "border-slate-200 text-slate-600"}`}>
              <input type="radio" name="outcome" value={o.v} checked={outcome === o.v} onChange={() => setOutcome(o.v)} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
        {outcome === "AWARD" && (
          <div>
            <label className="label" htmlFor="awardAmount">Award amount (BWP)</label>
            <input id="awardAmount" name="awardAmount" type="number" min={1000} step={1000} required className="input" placeholder="150000" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="rationale">Reason</label>
          <textarea id="rationale" name="rationale" rows={4} required minLength={10} className="input" placeholder={outcome === "REQUEST_CHANGES" ? "Tell the applicant exactly what to improve" : "The applicant will see this as feedback"} />
          <p className="help">Every decision needs a reason. It's recorded and shared with the applicant.</p>
        </div>
        <button className={outcome === "DECLINE" ? "btn-danger w-full" : outcome === "AWARD" ? "btn-gold w-full" : "btn-primary w-full"}>Record decision and notify</button>
      </div>
    </form>
  );
}
