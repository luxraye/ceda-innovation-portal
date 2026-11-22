import Link from "next/link";
import { CheckCircle2, Layers, XCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CALL_SECTORS, VENTURE_STAGES, VENTURE_STAGE_HINT } from "@/lib/domain";
import { receiptValid } from "@/lib/integrity";
import { cn, fmtDate } from "@/lib/format";
import { PHOTOS } from "@/lib/photos";
import { Callout, NightEyebrow, Req, Stat, StatusBadge, WorkspaceHero } from "@/components/ui";
import { TamperCheck } from "@/components/tamper-check";

export const metadata = { title: "Calls and instances" };

/**
 * Every call is a template: a form, a rubric and a set of stages, placed on CEDA's
 * sector x venture-stage matrix. Every idea is an instance of one template: a sealed,
 * versioned container of answers and documents with a signed receipt.
 */
export default async function Instances({ searchParams }: { searchParams: Promise<{ call?: string }> }) {
  await requireRole("ADMIN", "DPO");
  const { call: callFilter } = await searchParams;
  const [calls, instances] = await Promise.all([
    prisma.call.findMany({
      orderBy: { opensAt: "desc" },
      include: { submissions: { where: { status: { not: "DRAFT" } }, select: { status: true } } },
    }),
    prisma.submission.findMany({
      where: { status: { not: "DRAFT" }, ...(callFilter ? { call: { slug: callFilter } } : {}) },
      orderBy: { submittedAt: "desc" },
      take: 60,
      include: {
        call: { select: { title: true, slug: true, sector: true, ventureStage: true } },
        versions: { orderBy: { version: "desc" }, take: 1, select: { version: true, sha256: true, signature: true, createdAt: true } },
        _count: { select: { files: true } },
      },
    }),
  ]);

  const max = Math.max(1, ...calls.map((c) => c.submissions.length));
  const rows = CALL_SECTORS;
  const sealed = instances.filter((i) => i.versions[0]);
  const valid = sealed.filter((i) => receiptValid(i.reference, i.versions[0])).length;
  const covered = new Set(calls.map((c) => `${c.sector}|${c.ventureStage}`)).size;
  const filtered = callFilter ? calls.find((c) => c.slug === callFilter) : null;

  return (
    <div>
      <WorkspaceHero
        photo={PHOTOS.city}
        eyebrow={<><NightEyebrow>Calls and instances</NightEyebrow><Req k="a" /><Req k="g" /></>}
        title={`${calls.length} call templates, ${instances.length} sealed instances.`}
        accent="Every one verifiable."
        subtitle="A call is a template: its form, rubric and stages, placed on CEDA's sector and venture-stage matrix. Each idea is an instance of one template, sealed with a SHA-256 fingerprint and a signed receipt."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Call templates" value={calls.length} hint={`${calls.filter((c) => c.status === "OPEN").length} open now`} accent />
        <Stat label="Instances submitted" value={instances.length} hint="Drafts are not counted" />
        <Stat label="Receipts verified" value={`${valid}/${sealed.length}`} hint="Checked on this page load" />
        <Stat label="Matrix cells covered" value={`${covered}/${CALL_SECTORS.length * VENTURE_STAGES.length}`} hint="Empty cells are gaps in the pipeline" />
      </div>

      <h2 className="mt-10 mb-1 text-lg font-semibold text-navy-900">Sector × venture-stage matrix</h2>
      <p className="mb-4 max-w-3xl text-sm text-slate-500">
        Each call template sits in one cell. Shading shows how many ideas it drew. A grant suits an idea-stage founder, while a growth-stage venture needs a loan and market access, so the matrix shows where CEDA&apos;s innovation money is reaching.
      </p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="min-w-[190px] px-4 py-3 text-left text-xs font-medium text-slate-500">Sector / stage</th>
              {VENTURE_STAGES.map((st) => (
                <th key={st} className="min-w-[140px] px-3 py-3 text-left text-xs font-medium text-slate-500">
                  <span className="block text-navy-900">{st}</span>
                  <span className="font-normal">{VENTURE_STAGE_HINT[st]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((sector) => (
              <tr key={sector}>
                <td className="px-4 py-3 font-medium text-navy-900">{sector}</td>
                {VENTURE_STAGES.map((st) => {
                  const here = calls.filter((c) => c.sector === sector && c.ventureStage === st);
                  return (
                    <td key={st} className="px-2 py-2 align-top">
                      {here.length === 0 ? (
                        <span className="block px-2 text-slate-300">·</span>
                      ) : (
                        here.map((c) => {
                          const shade = c.submissions.length / max;
                          return (
                            <Link
                              key={c.id}
                              href={`/app/admin/instances?call=${c.slug}`}
                              className={cn(
                                "mb-1 block rounded-lg p-2 transition hover:shadow",
                                shade > 0.6 ? "bg-sky-600 text-white" : shade > 0.3 ? "bg-sky-200 text-sky-950" : "bg-sky-50 text-sky-900",
                                callFilter === c.slug && "ring-2 ring-gold-500",
                              )}
                            >
                              <span className="block text-xs leading-snug font-semibold">{c.title}</span>
                              <span className="text-[11px] opacity-80">{c.submissions.length} instances · {c.status.toLowerCase()}</span>
                            </Link>
                          );
                        })
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-navy-900">Instance register{filtered ? `: ${filtered.title}` : ""}</h2>
          <p className="text-sm text-slate-500">Run a tamper check to re-hash the sealed answers, re-verify the receipt, and decrypt and re-hash every document.</p>
        </div>
        {filtered && <Link href="/app/admin/instances" className="btn-ghost">Show all calls</Link>}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">Instance</th>
              <th className="px-4 py-3 font-medium">Template</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Sealed</th>
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Tamper check</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instances.map((i) => {
              const v = i.versions[0];
              const ok = v ? receiptValid(i.reference, v) : false;
              return (
                <tr key={i.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link href={`/app/admin/submissions/${i.id}`} className="font-mono text-xs text-sky-700 hover:underline">{i.reference}</Link>
                    <div className="mt-0.5 font-medium text-navy-900">{i.title}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <div className="font-medium text-navy-900">{i.call.title}</div>
                    {i.call.sector} · {i.call.ventureStage}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {v ? (
                      <>
                        <div>Version {v.version} · {i._count.files} documents</div>
                        <div className="font-mono text-[11px] text-slate-500">{v.sha256.slice(0, 16)}...</div>
                        <div>{fmtDate(v.createdAt)}</div>
                      </>
                    ) : "Not sealed"}
                  </td>
                  <td className="px-4 py-3">
                    {v && (ok ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Valid</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700"><XCircle className="h-4 w-4" /> Invalid</span>
                    ))}
                  </td>
                  <td className="px-4 py-3">{v && <TamperCheck submissionId={i.id} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Callout title="Why templates and instances?">
          <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> A new call is data, not code:</span> a form, a rubric and stages. Every idea submitted to it becomes a locked instance with mandatory fields checked, a sealed fingerprint and a receipt the founder keeps, so nobody, including CEDA staff, can change it unnoticed.
        </Callout>
      </div>
    </div>
  );
}
