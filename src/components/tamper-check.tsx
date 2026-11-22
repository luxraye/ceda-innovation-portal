"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { runTamperCheck } from "@/app/actions/instances";
import type { InstanceCheck } from "@/lib/integrity";

/** Button that re-verifies one instance and shows each check inline. */
export function TamperCheck({ submissionId }: { submissionId: string }) {
  const [result, setResult] = useState<InstanceCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function run() {
    setError(null);
    start(async () => {
      const r = await runTamperCheck(submissionId);
      if ("error" in r) setError(r.error);
      else setResult(r);
    });
  }

  if (!result) {
    return (
      <div className="flex flex-col items-start gap-1">
        <button type="button" onClick={run} disabled={pending} className="btn-ghost h-8 px-2.5 text-xs">
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-sky-600" />}
          {pending ? "Checking..." : "Run tamper check"}
        </button>
        {error && <span className="text-xs text-rose-600">{error}</span>}
      </div>
    );
  }

  return (
    <div className="min-w-[220px]">
      <div className={`flex items-center gap-1.5 text-xs font-semibold ${result.ok ? "text-emerald-700" : "text-rose-700"}`}>
        {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        {result.ok ? `Intact · v${result.version}` : "Tampering detected"}
      </div>
      <ul className="mt-1.5 space-y-1">
        {result.checks.map((c) => (
          <li key={c.label} className="flex gap-1.5 text-[11px] leading-snug text-slate-600" title={c.detail}>
            {c.ok ? <CheckCircle2 className="mt-px h-3 w-3 shrink-0 text-emerald-600" /> : <XCircle className="mt-px h-3 w-3 shrink-0 text-rose-600" />}
            <span><span className="font-medium text-navy-900">{c.label}</span>: {c.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
