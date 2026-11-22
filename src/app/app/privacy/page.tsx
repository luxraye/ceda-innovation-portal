import { Download } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requestRights, setConsent } from "@/app/actions/privacy";
import { CONSENT_PURPOSES, DATA_REQUEST_TYPES, type ConsentPurpose } from "@/lib/domain";
import { Callout, PageHeader, Req, Tone } from "@/components/ui";
import { fmtDate, fmtDateTime } from "@/lib/format";

export const metadata = { title: "Privacy centre" };

export default async function PrivacyCentre() {
  const user = await requireRole();
  const [consents, requests, views] = await Promise.all([
    prisma.consent.findMany({ where: { userId: user.id, withdrawnAt: null } }),
    prisma.dataRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ where: { entity: "Submission", action: { in: ["submission.viewed", "submission.viewed_blind"] }, entityId: { in: (await prisma.submission.findMany({ where: { ownerId: user.id }, select: { id: true } })).map((s) => s.id) } }, orderBy: { seq: "desc" }, take: 10, include: { actor: true } }),
  ]);
  const current = (p: ConsentPurpose) => consents.find((c) => c.purpose === p);
  return (
    <div>
      <PageHeader eyebrow={<Req k="dpa" />} title="Privacy centre" subtitle="See and control what CEDA holds about you. These are your rights under the Botswana Data Protection Act 2024." actions={<a href="/api/me/export" className="btn-primary"><Download className="h-4 w-4" /> Download my data</a>} />
      {user.restricted && <div className="mb-6"><Callout tone="gold" title="Processing restricted">You asked CEDA to restrict processing. Your applications are paused until the DPO resolves your request.</Callout></div>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-semibold text-navy-900">Your consents</h2>
          <ul className="mt-4 space-y-3">
            {(Object.keys(CONSENT_PURPOSES) as ConsentPurpose[]).map((p) => {
              const c = current(p);
              const info = CONSENT_PURPOSES[p];
              return (
                <li key={p} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-navy-900">{info.label}</div>
                      <div className="text-xs text-slate-500">{info.detail}</div>
                      {c && <div className="mt-1 text-[11px] text-slate-400">Version {c.version} · {fmtDate(c.grantedAt)}</div>}
                    </div>
                    {c?.granted ? <Tone tone="emerald">On</Tone> : <Tone tone="slate">Off</Tone>}
                  </div>
                  {!info.required && user.role === "INNOVATOR" && (
                    <form action={setConsent} className="mt-3">
                      <input type="hidden" name="purpose" value={p} />
                      <input type="hidden" name="grant" value={c?.granted ? "0" : "1"} />
                      <button className="btn-ghost py-1.5 text-xs">{c?.granted ? "Withdraw consent" : "Give consent"}</button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold text-navy-900">Make a request</h2>
            <p className="mt-1 text-sm text-slate-600">CEDA's Data Protection Officer responds within 30 days.</p>
            <form action={requestRights} className="mt-4 space-y-3">
              <select name="type" className="input" required>
                {Object.entries(DATA_REQUEST_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <textarea name="details" rows={3} className="input" placeholder="Tell us what you need, e.g. which detail is wrong" />
              <button className="btn-primary w-full">Send request</button>
            </form>
          </section>
          <section className="card p-6">
            <h2 className="font-semibold text-navy-900">My requests</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {requests.length === 0 && <li className="text-slate-500">None yet.</li>}
              {requests.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
                  <span><span className="font-mono text-xs text-slate-500">{r.reference}</span><span className="block text-navy-900">{DATA_REQUEST_TYPES[r.type as keyof typeof DATA_REQUEST_TYPES]}</span>{r.resolution && <span className="block text-xs text-slate-500">{r.resolution}</span>}</span>
                  <Tone tone={r.status === "COMPLETED" ? "emerald" : r.status === "REJECTED" ? "rose" : "sky"}>{r.status === "OPEN" ? `Due ${fmtDate(r.dueAt)}` : r.status.toLowerCase()}</Tone>
                </li>
              ))}
            </ul>
          </section>
          {user.role === "INNOVATOR" && (
            <section className="card p-6">
              <h2 className="font-semibold text-navy-900">Who has opened my ideas</h2>
              <p className="mt-1 text-xs text-slate-500">From the audit trail. Evaluators appear by role only.</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                {views.length === 0 && <li className="text-slate-500">No views yet.</li>}
                {views.map((v) => <li key={v.id} className="flex justify-between"><span className="text-navy-900">{v.actorRole === "EVALUATOR" ? "A panel evaluator (blind)" : v.actorRole === "ADJUDICATOR" ? "CEDA committee member" : v.actorRole === "DPO" ? "Data Protection Officer" : "CEDA programme team"}</span><span className="text-xs text-slate-500">{fmtDateTime(v.createdAt)}</span></li>)}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
