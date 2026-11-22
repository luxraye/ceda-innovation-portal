"use client";

import { useState, useTransition } from "react";
import { HelpCircle, Loader2, SearchCheck, Sparkles } from "lucide-react";
import { briefForPanel } from "@/app/actions/ai";
import type { BriefResult } from "@/lib/ai";

/** Panel Brief: a neutral, blind summary of an idea against the call rubric. */
export function PanelBrief({ submissionId, compact = false }: { submissionId: string; compact?: boolean }) {
  const [brief, setBrief] = useState<BriefResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      const r = await briefForPanel(submissionId);
      if ("error" in r) setError(r.error);
      else setBrief(r);
    });
  }

  return (
    <section className="night-gradient relative overflow-hidden rounded-2xl p-6 text-white shadow-[0_18px_40px_-18px_rgb(217_73_20/0.55)] ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-gold-400" /> Panel brief</div>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-white/65">Evidence and gaps for each criterion, from the blind answers. It never scores or recommends: you make the call.</p>
        </div>
        <button type="button" onClick={run} disabled={pending} className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-navy-900 transition hover:bg-sky-50 disabled:opacity-70">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading...</> : <><Sparkles className="h-4 w-4 text-sky-600" /> {brief ? "Refresh brief" : "Generate brief"}</>}
        </button>
      </div>
      {error && <p className="mt-3 text-xs text-rose-300" role="alert">{error}</p>}

      {brief && (
        <div className="mt-5 animate-rise space-y-5">
          <p className="text-sm leading-relaxed text-white/90">{brief.summary}</p>
          <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
            {brief.criteria.map((c) => (
              <div key={c.criterion} className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
                <div className="text-sm font-semibold text-sky-200">{c.criterion}</div>
                <p className="mt-1.5 text-xs leading-relaxed text-white/80"><span className="font-semibold text-emerald-300">Evidence. </span>{c.evidence}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-white/80"><span className="font-semibold text-gold-300">Gaps. </span>{c.gaps}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {brief.questions.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-300"><HelpCircle className="h-3.5 w-3.5" /> Questions to ask</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/80">{brief.questions.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            )}
            {brief.claimsToVerify.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold-300"><SearchCheck className="h-3.5 w-3.5" /> Claims to verify</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-white/80">{brief.claimsToVerify.map((q) => <li key={q}>{q}</li>)}</ul>
              </div>
            )}
          </div>
          <p className="text-[10px] text-white/45">{brief.source === "ai" ? "Written by AI from the blind answers" : "Built-in checklist (no AI key set)"}. Logged in the audit trail.</p>
        </div>
      )}
    </section>
  );
}
