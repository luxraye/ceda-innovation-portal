"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CloudUpload, FileCheck2, Loader2, Lock } from "lucide-react";
import { saveDraft, submitApplication, uploadFile } from "@/app/actions/submissions";
import type { FormField } from "@/lib/domain";

type FileInfo = { id: string; slot: string; fileName: string; size: number; sha256: string };

async function hashFile(file: File) {
  const buf = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function SubmissionForm({
  submissionId,
  fields,
  initial,
  files: initialFiles,
  resubmission,
}: {
  submissionId: string;
  fields: FormField[];
  initial: Record<string, string>;
  files: FileInfo[];
  resubmission: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [files, setFiles] = useState<FileInfo[]>(initialFiles);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const dirty = useRef(false);

  const sections = useMemo(() => {
    const map = new Map<string, FormField[]>();
    for (const f of fields) map.set(f.section, [...(map.get(f.section) ?? []), f]);
    return [...map.entries()];
  }, [fields]);

  const required = fields.filter((f) => f.required);
  const done = required.filter((f) => (f.type === "file" ? files.some((x) => x.slot === f.key) : (values[f.key] ?? "").trim())).length;
  const pct = required.length ? Math.round((done / required.length) * 100) : 100;

  // Autosave 1.2s after the last keystroke.
  useEffect(() => {
    if (!dirty.current) return;
    setSaving(true);
    const t = setTimeout(async () => {
      try {
        const r = await saveDraft(submissionId, values);
        setSavedAt(r.savedAt);
      } finally {
        setSaving(false);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [values, submissionId]);

  function set(key: string, v: string) {
    dirty.current = true;
    setValues((old) => ({ ...old, [key]: v }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  }

  async function onFile(slot: string, file: File | undefined) {
    if (!file) return;
    setUploading(slot);
    try {
      const fd = new FormData();
      fd.set("submissionId", submissionId);
      fd.set("slot", slot);
      fd.set("file", file);
      fd.set("clientHash", await hashFile(file));
      const r = await uploadFile(fd);
      if ("error" in r && r.error) setErrors((e) => ({ ...e, [slot]: r.error! }));
      else if (r.file) {
        setFiles((fs) => [...fs.filter((f) => f.slot !== slot), r.file!]);
        setErrors(({ [slot]: _, ...rest }) => rest);
      }
    } finally {
      setUploading(null);
    }
  }

  function submit() {
    startSubmit(async () => {
      const r = await submitApplication(submissionId, values);
      if ("errors" in r && r.errors) {
        setErrors(r.errors);
        setConfirm(false);
        const first = Object.keys(r.errors)[0];
        document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      router.push(`/app/innovator/submissions/${submissionId}?submitted=1`);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
      <div className="space-y-6">
        {sections.map(([section, list], si) => (
          <section key={section} className="card p-6">
            <h2 className="text-lg font-bold text-navy-900">{si + 1}. {section}</h2>
            <div className="mt-5 space-y-5">
              {list.map((f) => {
                const err = errors[f.key];
                const v = values[f.key] ?? "";
                const id = `field-${f.key}`;
                return (
                  <div key={f.key} id={id}>
                    <label className="label" htmlFor={`in-${f.key}`}>
                      {f.label} {f.required ? <span className="text-rose-600" aria-label="required">*</span> : <span className="text-xs font-normal text-slate-400">(optional)</span>}
                    </label>
                    {f.type === "textarea" ? (
                      <>
                        <textarea id={`in-${f.key}`} rows={5} className="input" value={v} maxLength={f.maxLength} onChange={(e) => set(f.key, e.target.value)} aria-invalid={!!err} />
                        {f.maxLength && <div className="mt-1 text-right text-[11px] text-slate-400">{v.length}/{f.maxLength}</div>}
                      </>
                    ) : f.type === "select" ? (
                      <select id={`in-${f.key}`} className="input" value={v} onChange={(e) => set(f.key, e.target.value)} aria-invalid={!!err}>
                        <option value="">Choose</option>
                        {f.options?.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    ) : f.type === "file" ? (
                      <FileSlot slot={f.key} accept={f.accept} file={files.find((x) => x.slot === f.key)} busy={uploading === f.key} onPick={(file) => onFile(f.key, file)} />
                    ) : (
                      <input id={`in-${f.key}`} type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"} className="input" value={v} maxLength={f.maxLength} min={f.min} max={f.max} onChange={(e) => set(f.key, e.target.value)} aria-invalid={!!err} />
                    )}
                    {f.help && <p className="help">{f.help}</p>}
                    {err && <p className="mt-1 text-xs font-medium text-rose-600" role="alert">{err}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <div className="text-sm font-semibold text-navy-900">Completeness</div>
          <div className="font-display mt-1 text-3xl font-bold text-navy-900">{pct}%</div>
          <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500 transition-all" style={{ width: `${pct}%` }} /></div>
          <div className="mt-2 text-xs text-slate-500">{done} of {required.length} required answers</div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500" aria-live="polite">
            {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving draft...</> : savedAt ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Draft saved</> : "Changes save automatically"}
          </div>
          {errors._ && <p className="mt-3 text-xs text-rose-600">{errors._}</p>}
          {!confirm ? (
            <button type="button" className="btn-primary mt-5 w-full" onClick={() => setConfirm(true)} disabled={pct < 100 || submitting}>
              {resubmission ? "Resubmit" : "Review and submit"}
            </button>
          ) : (
            <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
              <div className="flex items-center gap-1.5 font-semibold"><Lock className="h-3.5 w-3.5" /> Ready to seal?</div>
              <p className="mt-1">Your answers and files will be locked and sealed with a SHA-256 fingerprint. You'll get a signed receipt.</p>
              <div className="mt-3 flex gap-2">
                <button type="button" className="btn-primary flex-1 py-2" onClick={submit} disabled={submitting}>{submitting ? "Sealing..." : "Submit"}</button>
                <button type="button" className="btn-ghost py-2" onClick={() => setConfirm(false)}>Back</button>
              </div>
            </div>
          )}
          {pct < 100 && <p className="mt-2 text-center text-[11px] text-slate-500">Answer every required question to submit.</p>}
        </div>
      </aside>
    </div>
  );
}

function FileSlot({ slot, accept, file, busy, onPick }: { slot: string; accept?: string; file?: FileInfo; busy: boolean; onPick: (f: File | undefined) => void }) {
  return (
    <label htmlFor={`in-${slot}`} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed p-4 transition ${file ? "border-emerald-300 bg-emerald-50/50" : "border-slate-300 hover:border-sky-400 hover:bg-sky-50/50"}`}>
      {busy ? <Loader2 className="h-7 w-7 animate-spin text-sky-600" /> : file ? <FileCheck2 className="h-7 w-7 text-emerald-600" /> : <CloudUpload className="h-7 w-7 text-sky-600" />}
      <span className="min-w-0 flex-1 text-sm">
        {file ? (
          <>
            <span className="block truncate font-medium text-navy-900">{file.fileName}</span>
            <span className="block font-mono text-[11px] text-slate-500">{(file.size / 1024).toFixed(0)} KB · SHA-256 {file.sha256.slice(0, 16)}... · encrypted</span>
          </>
        ) : (
          <>
            <span className="block font-medium text-navy-900">{busy ? "Encrypting and sealing..." : "Choose a file"}</span>
            <span className="block text-xs text-slate-500">PDF, image or Office file, up to 8 MB</span>
          </>
        )}
      </span>
      {file && <span className="text-xs font-medium text-sky-700">Replace</span>}
      <input id={`in-${slot}`} type="file" className="sr-only" accept={accept ?? ".pdf,.png,.jpg,.jpeg,.pptx,.docx,.xlsx"} onChange={(e) => onPick(e.target.files?.[0])} />
    </label>
  );
}
