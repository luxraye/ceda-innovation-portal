import { AlertOctagon, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { breachStep, logBreach, resolveRequest, runRetention } from "@/app/actions/privacy";
import { verifyAuditChain } from "@/lib/audit";
import { CONSENT_PURPOSES, DATA_REQUEST_TYPES, type ConsentPurpose } from "@/lib/domain";
import { PageHeader, Req, Stat, Tone } from "@/components/ui";
import { daysUntil, fmtDate, fmtDateTime, hoursSince } from "@/lib/format";

export const metadata = { title: "Compliance overview" };

export default async function DpoHome() {
  await requireRole("DPO");
  const [requests, breaches, policies, consents, users, chain, restricted] = await Promise.all([
    prisma.dataRequest.findMany({ orderBy: [{ status: "asc" }, { dueAt: "asc" }], include: { user: true } }),
    prisma.breachIncident.findMany({ orderBy: { discoveredAt: "desc" } }),
    prisma.retentionPolicy.findMany({ orderBy: { months: "asc" } }),
    prisma.consent.groupBy({ by: ["purpose", "granted"], where: { withdrawnAt: null }, _count: true }),
    prisma.user.count({ where: { role: "INNOVATOR", anonymisedAt: null } }),
    verifyAuditChain(),
    prisma.user.count({ where: { restricted: true } }),
  ]);
  const open = requests.filter((r) => r.status === "OPEN" || r.status === "IN_PROGRESS");
  const openBreaches = breaches.filter((b) => b.status !== "CLOSED");
  const consentRate = (p: string) => {
    const g = consents.find((c) => c.purpose === p && c.granted)?._count ?? 0;
    const n = consents.filter((c) => c.purpose === p).reduce((a, c) => a + c._count, 0);
    return n ? Math.round((g / n) * 100) : 0;
  };
  const run = async () => {
    "use server";
    await runRetention();
  };
  return (
    <div>
      <PageHeader eyebrow={<Req k="dpa" />} title="Compliance overview" subtitle="Data Protection Act 2024 duties, turned into a workspace: consent, data subject rights, retention and breach response." />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Open rights requests" value={open.length} hint={open.some((r) => daysUntil(r.dueAt) < 7) ? "Some due within 7 days" : "All within deadline"} accent />
        <Stat label="Open incidents" value={openBreaches.length} />
        <Stat label="Data subjects" value={users} hint={`${restricted} with restricted processing`} />
        <Stat label="Audit chain" value={chain.ok ? "Intact" : "Broken"} hint={`${chain.total} entries verified`} />
      </div>

      <section id="breaches" className="mt-8">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-navy-900">Breach register</h2><Tone tone="rose">Notify the Commission within 72 hours where feasible</Tone></div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            {breaches.length === 0 && <div className="card p-5 text-sm text-slate-500">No incidents recorded.</div>}
            {breaches.map((b) => {
              const h = hoursSince(b.discoveredAt);
              const left = Math.max(0, 72 - h);
              const late = !b.commissionNotifiedAt && h > 72;
              return (
                <div key={b.id} className={`card p-5 ${late ? "border-rose-300" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-500">{b.reference}</span>{b.isDrill && <Tone tone="sky">Drill</Tone>}<Tone tone={b.severity === "HIGH" ? "rose" : b.severity === "MEDIUM" ? "amber" : "slate"}>{b.severity.toLowerCase()}</Tone><Tone tone="slate">{b.status.toLowerCase()}</Tone></div>
                      <div className="mt-1 font-semibold text-navy-900">{b.title}</div>
                      <div className="text-xs text-slate-500">Discovered {fmtDateTime(b.discoveredAt)} · {b.affectedCount} people · {b.dataTypes}</div>
                    </div>
                    {!b.commissionNotifiedAt && b.status !== "CLOSED" ? (
                      <div className={`rounded-xl px-3 py-2 text-center ${late ? "bg-rose-600 text-white" : "bg-gold-300/40 text-earth-700"}`}>
                        <div className="flex items-center gap-1 text-[11px] font-semibold uppercase"><Clock className="h-3 w-3" /> Commission</div>
                        <div className="font-display text-xl font-bold">{late ? `${Math.floor(h - 72)}h late` : `${Math.floor(left)}h ${Math.floor((left % 1) * 60)}m`}</div>
                      </div>
                    ) : b.commissionNotifiedAt ? <Tone tone="emerald">Reported {fmtDateTime(b.commissionNotifiedAt)}</Tone> : null}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{b.description}</p>
                  {b.status !== "CLOSED" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        { step: "contain", label: "Mark contained", done: !!b.containedAt },
                        { step: "commission", label: "Commission notified", done: !!b.commissionNotifiedAt },
                        { step: "subjects", label: "Affected people told", done: !!b.subjectsNotifiedAt },
                        { step: "close", label: "Close incident", done: false },
                      ].map((s) => (
                        <form key={s.step} action={breachStep}>
                          <input type="hidden" name="breachId" value={b.id} /><input type="hidden" name="step" value={s.step} />
                          <button disabled={s.done} className="btn-ghost py-1.5 text-xs">{s.done && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}{s.label}</button>
                        </form>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <form action={logBreach} className="card space-y-3 p-5">
            <div className="flex items-center gap-2 font-semibold text-navy-900"><AlertOctagon className="h-5 w-5 text-rose-600" /> Log an incident</div>
            <input name="title" required className="input" placeholder="What happened" />
            <textarea name="description" required rows={3} className="input" placeholder="How it was found, what data, what was done" />
            <div className="grid grid-cols-2 gap-2">
              <select name="severity" className="input"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select>
              <input name="affectedCount" type="number" min={0} className="input" placeholder="People affected" />
            </div>
            <input name="dataTypes" className="input" placeholder="Data involved, e.g. emails, phone numbers" />
            <label className="label" htmlFor="discoveredAt">Discovered at</label>
            <input id="discoveredAt" name="discoveredAt" type="datetime-local" className="input" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isDrill" className="accent-sky-600" /> This is a drill</label>
            <button className="btn-danger w-full">Start the 72-hour clock</button>
          </form>
        </div>
      </section>

      <section id="requests" className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-navy-900">Data subject requests</h2>
        <div className="card divide-y divide-slate-100">
          {requests.length === 0 && <p className="p-5 text-sm text-slate-500">No requests.</p>}
          {requests.map((r) => {
            const d = daysUntil(r.dueAt);
            const isOpen = r.status === "OPEN" || r.status === "IN_PROGRESS";
            return (
              <div key={r.id} className="grid gap-3 p-5 lg:grid-cols-[1fr_22rem]">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs text-slate-500">{r.reference}</span><Tone tone="sky">{DATA_REQUEST_TYPES[r.type as keyof typeof DATA_REQUEST_TYPES]}</Tone>{isOpen ? <Tone tone={d < 7 ? "amber" : "slate"}>Due {fmtDate(r.dueAt)} ({d} days)</Tone> : <Tone tone={r.status === "COMPLETED" ? "emerald" : "rose"}>{r.status.toLowerCase()}</Tone>}</div>
                  <div className="mt-1 text-sm font-medium text-navy-900">{r.user.name} <span className="font-normal text-slate-500">· {r.user.email}</span></div>
                  <p className="text-sm text-slate-600">{r.details}</p>
                  {r.resolution && <p className="mt-1 text-xs text-slate-500">Resolution: {r.resolution}</p>}
                </div>
                {isOpen && (
                  <form action={resolveRequest} className="space-y-2">
                    <input type="hidden" name="requestId" value={r.id} />
                    <input name="resolution" className="input py-1.5 text-sm" placeholder="Response to the person" />
                    <div className="flex gap-2">
                      <button name="outcome" value="COMPLETED" className="btn-primary flex-1 py-1.5 text-xs">{r.type === "ERASURE" ? "Erase and complete" : "Complete"}</button>
                      <button name="outcome" value="REJECTED" className="btn-ghost py-1.5 text-xs">Reject with reason</button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-semibold text-navy-900">Consent coverage</h2>
          <ul className="mt-4 space-y-3">
            {(Object.keys(CONSENT_PURPOSES) as ConsentPurpose[]).map((p) => (
              <li key={p}>
                <div className="flex justify-between text-sm"><span className="text-navy-900">{CONSENT_PURPOSES[p].label}</span><span className="font-mono text-slate-500">{consentRate(p)}%</span></div>
                <div className="mt-1 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${consentRate(p)}%` }} /></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between"><h2 className="font-semibold text-navy-900">Retention rules</h2><form action={run}><button className="btn-ghost py-1.5 text-xs"><ShieldCheck className="h-3.5 w-3.5" /> Run now</button></form></div>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500"><th className="pb-2 font-medium">Data</th><th className="pb-2 font-medium">Keep for</th><th className="pb-2 font-medium">Then</th></tr></thead>
            <tbody>{policies.map((p) => <tr key={p.id} className="border-t border-slate-100"><td className="py-2"><div className="text-navy-900">{p.label}</div><div className="text-xs text-slate-500">{p.basis}</div></td><td className="py-2">{p.months} months</td><td className="py-2">{p.action.toLowerCase()}</td></tr>)}</tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">Last run: {policies[0]?.lastRunAt ? fmtDateTime(policies[0].lastRunAt) : "never"}. In production this runs nightly.</p>
        </section>
      </div>
    </div>
  );
}
