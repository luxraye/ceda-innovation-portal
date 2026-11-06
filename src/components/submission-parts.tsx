import { CheckCircle2, Download, FileText, ShieldCheck } from "lucide-react";
import { fmtDateTime, timeAgo } from "@/lib/format";
import { verifyReceipt } from "@/lib/crypto";
import type { FormField } from "@/lib/domain";

type Event = { id: string; label: string; stageName: string; note: string | null; createdAt: Date; actor?: { name: string; role: string } | null };

export function Timeline({ events, showActors = false }: { events: Event[]; showActors?: boolean }) {
  return (
    <ol className="relative space-y-5 border-l-2 border-sky-100 pl-6">
      {events.map((e, i) => (
        <li key={e.id} className="relative">
          <span className={`absolute top-1 -left-[31px] h-3.5 w-3.5 rounded-full border-2 border-white ${i === 0 ? "bg-sky-600 ring-4 ring-sky-100" : "bg-sky-300"}`} />
          <div className="text-sm font-semibold text-navy-900">{e.label}</div>
          <div className="text-xs text-slate-500">
            {e.stageName} · {fmtDateTime(e.createdAt)} ({timeAgo(e.createdAt)})
            {showActors && e.actor && <> · {e.actor.name}</>}
          </div>
          {e.note && <div className="mt-1 text-sm text-slate-600">{e.note}</div>}
        </li>
      ))}
    </ol>
  );
}

export function ReceiptCard({ reference, version }: { reference: string; version: { version: number; sha256: string; signature: string; createdAt: Date } }) {
  const valid = verifyReceipt([reference, String(version.version), version.sha256, version.createdAt.toISOString()], version.signature);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-sky-700 px-5 py-3 text-white">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-semibold">Submission receipt</span>
        <span className="ml-auto chip bg-white/20 text-white">v{version.version}</span>
      </div>
      <dl className="space-y-3 p-5 text-sm">
        <div><dt className="text-xs text-slate-500">Reference</dt><dd className="font-mono font-semibold text-navy-900">{reference}</dd></div>
        <div><dt className="text-xs text-slate-500">Sealed at</dt><dd className="text-navy-900">{fmtDateTime(version.createdAt)}</dd></div>
        <div><dt className="text-xs text-slate-500">SHA-256 fingerprint</dt><dd className="font-mono text-[11px] break-all text-slate-700">{version.sha256}</dd></div>
        <div><dt className="text-xs text-slate-500">Signature</dt><dd className="font-mono text-[11px] break-all text-slate-500">{version.signature.slice(0, 32)}...</dd></div>
        <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${valid ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
          <CheckCircle2 className="h-4 w-4" /> {valid ? "Signature verified: unchanged since submission" : "Signature does not match"}
        </div>
      </dl>
    </div>
  );
}

export function AnswerList({ fields, answers, files, hideIdentity = false }: { fields: FormField[]; answers: Record<string, string>; files: { id: string; slot: string; fileName: string; size: number; sha256: string }[]; hideIdentity?: boolean }) {
  const sections = new Map<string, FormField[]>();
  for (const f of fields) sections.set(f.section, [...(sections.get(f.section) ?? []), f]);
  return (
    <div className="space-y-6">
      {[...sections.entries()].map(([section, list]) => (
        <section key={section}>
          <h3 className="mb-3 eyebrow flex items-center gap-3 text-slate-400 after:h-px after:flex-1 after:bg-slate-100">{section}</h3>
          <dl className="space-y-4">
            {list.map((f) => {
              if (f.type === "file") {
                const file = files.find((x) => x.slot === f.key);
                return (
                  <div key={f.key}>
                    <dt className="text-sm font-medium text-slate-700">{f.label}</dt>
                    <dd className="mt-1">
                      {file ? (
                        <a href={`/api/files/${file.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-sky-300">
                          <FileText className="h-4 w-4 text-sky-600" />
                          <span className="max-w-xs truncate">{hideIdentity ? `${f.label}.${file.fileName.split(".").pop()}` : file.fileName}</span>
                          <Download className="h-4 w-4 text-slate-400" />
                        </a>
                      ) : <span className="text-sm text-slate-400">Not provided</span>}
                    </dd>
                  </div>
                );
              }
              return (
                <div key={f.key}>
                  <dt className="text-sm font-medium text-slate-700">{f.label}</dt>
                  <dd className="mt-1 text-sm whitespace-pre-line text-slate-900">{answers[f.key] || <span className="text-slate-400">Not answered</span>}</dd>
                </div>
              );
            })}
          </dl>
        </section>
      ))}
    </div>
  );
}

/** Word-level comparison between two versions of an answer. */
export function diffWords(a: string, b: string) {
  const x = a.split(/(\s+)/);
  const y = b.split(/(\s+)/);
  const m = x.length, n = y.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: { t: "same" | "add" | "del"; s: string }[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (x[i] === y[j]) { out.push({ t: "same", s: x[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: "del", s: x[i] }); i++; }
    else { out.push({ t: "add", s: y[j] }); j++; }
  }
  while (i < m) out.push({ t: "del", s: x[i++] });
  while (j < n) out.push({ t: "add", s: y[j++] });
  return out;
}

export function VersionDiff({ fields, before, after }: { fields: FormField[]; before: Record<string, string>; after: Record<string, string> }) {
  const changed = fields.filter((f) => f.type !== "file" && (before[f.key] ?? "") !== (after[f.key] ?? ""));
  if (!changed.length) return <p className="text-sm text-slate-500">No text answers changed between these versions.</p>;
  return (
    <div className="space-y-5">
      {changed.map((f) => (
        <div key={f.key}>
          <div className="text-sm font-semibold text-navy-900">{f.label}</div>
          <p className="mt-1 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed whitespace-pre-line">
            {diffWords(before[f.key] ?? "", after[f.key] ?? "").map((p, k) =>
              p.t === "same" ? <span key={k}>{p.s}</span> : p.t === "add" ? <ins key={k} className="rounded bg-emerald-100 text-emerald-900 no-underline">{p.s}</ins> : <del key={k} className="rounded bg-rose-100 text-rose-800">{p.s}</del>,
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
