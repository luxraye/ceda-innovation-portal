import { CheckCircle2, XCircle, Link2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAuditChain } from "@/lib/audit";
import { PageHeader, Req } from "@/components/ui";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Audit trail" };

export default async function Audit({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireRole("ADMIN", "DPO");
  const { q } = await searchParams;
  const [check, entries] = await Promise.all([
    verifyAuditChain(),
    prisma.auditLog.findMany({ where: q ? { action: { contains: q } } : undefined, orderBy: { seq: "desc" }, take: 150, include: { actor: true } }),
  ]);
  return (
    <div>
      <PageHeader eyebrow={<><Req k="d" /><Req k="dpa" /></>} title="Audit trail" subtitle="Every sign-in, view, upload, score and decision. Each entry includes the fingerprint of the one before it, so changing any past entry breaks the chain from that point on." />
      <div className={`card mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center ${check.ok ? "border-emerald-200 bg-emerald-50/60" : "border-rose-200 bg-rose-50"}`}>
        {check.ok ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-rose-600" />}
        <div className="flex-1">
          <div className="font-semibold text-navy-900">{check.ok ? `Chain intact: all ${check.total} entries verified` : `Chain broken at entry #${check.brokenAt}`}</div>
          <div className="font-mono text-xs break-all text-slate-600">{check.ok ? `Head ${check.head}` : "An entry was altered or removed. Investigate immediately."}</div>
        </div>
        <form><input name="q" defaultValue={q} placeholder="Filter by action, e.g. decision" className="input w-64" /></form>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="px-4 py-3 font-medium">#</th><th className="px-4 py-3 font-medium">When</th><th className="px-4 py-3 font-medium">Who</th><th className="px-4 py-3 font-medium">Action</th><th className="px-4 py-3 font-medium">Record</th><th className="px-4 py-3 font-medium">Chain</th></tr></thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-slate-100 align-top">
                <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{e.seq}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">{fmtDateTime(e.createdAt)}</td>
                <td className="px-4 py-2.5"><div className="text-navy-900">{e.actor?.name ?? "Anonymous"}</div><div className="text-xs text-slate-500">{e.actorRole?.toLowerCase() ?? ""}</div></td>
                <td className="px-4 py-2.5 font-mono text-xs text-navy-900">{e.action}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{e.entity}{e.meta && <div className="max-w-xs truncate font-mono" title={e.meta}>{e.meta}</div>}</td>
                <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400"><span className="inline-flex items-center gap-1"><Link2 className="h-3 w-3" />{e.hash.slice(0, 10)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
