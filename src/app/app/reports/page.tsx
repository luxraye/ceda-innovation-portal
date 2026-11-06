import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildReport } from "@/lib/reports";
import { PageHeader, Req, Stat } from "@/components/ui";
import { ReportCharts } from "@/components/report-charts";
import { PrintButton } from "@/components/print-button";
import { pula } from "@/lib/format";

export const metadata = { title: "Reports" };

export default async function Reports({ searchParams }: { searchParams: Promise<{ call?: string }> }) {
  await requireRole("ADMIN", "ADJUDICATOR", "DPO");
  const { call: slug } = await searchParams;
  const calls = await prisma.call.findMany({ where: { status: { not: "DRAFT" } }, orderBy: { closesAt: "asc" } });
  const call = calls.find((c) => c.slug === slug);
  const r = await buildReport(call?.id);
  const conversion = r.total ? Math.round((r.awardedCount / r.total) * 1000) / 10 : 0;
  return (
    <div>
      <PageHeader
        eyebrow={<><Req k="f" /></>}
        title="Reports"
        subtitle={`Participation, outcomes and timelines${call ? ` for ${call.title}` : " across all calls"}. Exports are pseudonymised: no names or contact details.`}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Link href="/app/reports" className={!call ? "btn-primary py-2" : "btn-ghost py-2"}>All calls</Link>
            {calls.map((c) => <Link key={c.id} href={`/app/reports?call=${c.slug}`} className={call?.id === c.id ? "btn-primary py-2" : "btn-ghost py-2"}>{c.title.replace(/ 2026$/, "")}</Link>)}
            <a href={`/api/reports/export${call ? `?call=${call.id}` : ""}`} className="btn-ghost py-2">Export CSV</a>
            <PrintButton />
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Ideas submitted" value={r.total} accent />
        <Stat label="Districts reached" value={r.districts.length} hint="of 16" />
        <Stat label="Women-led ideas" value={`${r.femaleShare}%`} />
        <Stat label="Average panel score" value={r.avgScore} hint="raw weighted, out of 100" />
        <Stat label="Awarded" value={r.awardedCount} hint={`${pula(r.awardedSum)} · ${conversion}% of ideas`} />
      </div>
      <ReportCharts data={{ funnel: r.funnel, districts: r.districts, sectors: r.sectors, gender: r.gender, timeInStage: r.timeInStage, scoreBands: r.scoreBands, perWeek: r.perWeek }} />
    </div>
  );
}
