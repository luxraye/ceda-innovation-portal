"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { coachMyPitch } from "@/app/actions/ai";
import type { CoachResult } from "@/lib/ai";

function Ring({ value }: { value: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90" aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke="url(#coach-g)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} className="transition-[stroke-dashoffset] duration-700" />
      <defs>
        <linearGradient id="coach-g" x1="0" x2="1">
          <stop offset="0" stopColor="#5ea3ff" />
          <stop offset="1" stopColor="#efc06a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/** Pitch Coach: checks the current draft against the call's rubric. */
export function PitchCoach({ submissionId, values, labels }: { submissionId: string; values: Record<string, string>; labels: Record<string, string> }) {
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      const r = await coachMyPitch(submissionId, values);
      if ("error" in r) setError(r.error);
      else setResult(r);
    });
  }

  function jump(key: string) {
    const el = document.getElementById(`field-${key}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    (document.getElementById(`in-${key}`) as HTMLElement | null)?.focus({ preventScroll: true });
  }

  return (
    <div className="night-gradient relative mt-4 overflow-hidden rounded-2xl p-5 text-white shadow-[0_18px_40px_-18px_rgb(15_111_255/0.55)] ring-1 ring-white/10">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Sparkles className="h-4 w-4 text-gold-400" /> Pitch Coach
      </div>
      {!result && <p className="mt-1.5 text-xs leading-relaxed text-white/65">See your draft the way the panel will: a readiness score against this call&apos;s rubric and what to add before you submit.</p>}

      {result && (
        <div className="-mr-2 mt-3 max-h-[52vh] animate-rise overflow-y-auto pr-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Ring value={result.readiness} />
              <span className="absolute inset-0 grid place-items-center font-display text-lg font-semibold">{result.readiness}</span>
            </div>
            <p className="text-xs leading-relaxed text-white/85">{result.headline}</p>
          </div>
          {result.strengths.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {result.strengths.map((s) => (
                <li key={s} className="flex gap-2 text-xs text-white/80"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{s}</li>
              ))}
            </ul>
          )}
          {result.improvements.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold-300">Add before you submit</div>
              <ul className="mt-2 space-y-2">
                {result.improvements.map((i) => (
                  <li key={i.fieldKey + i.tip}>
                    <button type="button" onClick={() => jump(i.fieldKey)} className="group w-full rounded-xl bg-white/5 p-2.5 text-left text-xs text-white/85 ring-1 ring-white/10 transition hover:bg-white/10">
                      <span className="flex items-center justify-between gap-2 font-medium text-sky-300">
                        <span className="truncate">{labels[i.fieldKey] ?? i.fieldKey}</span>
                        <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-0.5 block leading-relaxed">{i.tip}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-rose-300" role="alert">{error}</p>}
      <button type="button" onClick={run} disabled={pending} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-navy-900 transition hover:bg-sky-50 disabled:opacity-70">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading your draft...</> : <><Sparkles className="h-4 w-4 text-sky-600" /> {result ? "Check again" : "Check my pitch"}</>}
      </button>
      <p className="mt-2 text-center text-[10px] text-white/45">
        {result?.source === "checklist" ? "Built-in readiness checklist" : "AI suggestions"}. Advice only: it never scores your application.
      </p>
    </div>
  );
}
