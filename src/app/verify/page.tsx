import { CheckCircle2, XCircle } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { prisma } from "@/lib/prisma";
import { verifyReceipt } from "@/lib/crypto";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Verify a receipt" };
export const dynamic = "force-dynamic";

// Anyone holding a receipt can check it is genuine, without seeing the submission itself.
export default async function Verify({ searchParams }: { searchParams: Promise<{ ref?: string; hash?: string }> }) {
  const { ref, hash } = await searchParams;
  let result: null | { ok: boolean; message: string; at?: Date; version?: number } = null;
  if (ref && hash) {
    const sub = await prisma.submission.findUnique({ where: { reference: ref.trim().toUpperCase() }, include: { versions: true } });
    const v = sub?.versions.find((x) => x.sha256 === hash.trim().toLowerCase());
    if (sub && v) {
      const ok = verifyReceipt([sub.reference, String(v.version), v.sha256, v.createdAt.toISOString()], v.signature);
      result = ok ? { ok, message: "Genuine receipt. This submission has not been changed since it was sealed.", at: v.createdAt, version: v.version } : { ok, message: "The signature does not match." };
    } else result = { ok: false, message: "No submission with that reference and fingerprint." };
  }
  return (
    <div>
      <div className="sky-gradient"><PublicHeader /></div>
      <div className="mx-auto max-w-xl px-4 py-14">
        <div className="req-badge">3.2(d) Data integrity</div>
        <h1 className="mt-3 text-3xl font-semibold text-navy-900">Verify a submission receipt</h1>
        <p className="mt-2 text-slate-600">Enter the reference and SHA-256 fingerprint from a Sky receipt. Nothing about the idea itself is shown.</p>
        <form className="card mt-6 space-y-4 p-6">
          <div><label className="label" htmlFor="ref">Reference</label><input id="ref" name="ref" defaultValue={ref} className="input font-mono" placeholder="SKY-26-0001" required /></div>
          <div><label className="label" htmlFor="hash">SHA-256 fingerprint</label><input id="hash" name="hash" defaultValue={hash} className="input font-mono text-xs" required /></div>
          <button className="btn-primary w-full">Verify</button>
        </form>
        {result && (
          <div className={`mt-6 flex gap-3 rounded-2xl border p-5 ${result.ok ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
            {result.ok ? <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" /> : <XCircle className="h-6 w-6 shrink-0 text-rose-600" />}
            <div className="text-sm"><div className="font-semibold text-navy-900">{result.message}</div>{result.at && <div className="text-slate-600">Version {result.version}, sealed {fmtDateTime(result.at)}</div>}</div>
          </div>
        )}
      </div>
      <PublicFooter />
    </div>
  );
}
