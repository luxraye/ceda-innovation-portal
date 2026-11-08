import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { PageHeader, Req, StatusBadge } from "@/components/ui";
import { IndexBar, IndexLegend, TierChip } from "@/components/arena-ui";
import { TIERS, getIndex } from "@/lib/arena";
import { DISTRICTS, SECTORS } from "@/lib/domain";
import { cn } from "@/lib/format";
import { audit } from "@/lib/audit";

export const metadata = { title: "Talent directory" };

export default async function Talent({ searchParams }: { searchParams: Promise<{ sector?: string; district?: string; tier?: string; verified?: string }> }) {
  const user = await requireRole("ADMIN", "ADJUDICATOR");
  const sp = await searchParams;
  const rows = (await getIndex()).filter(
    (r) =>
      (!sp.sector || r.sector === sp.sector) &&
      (!sp.district || r.district === sp.district) &&
      (!sp.tier || r.tier === sp.tier) &&
      (!sp.verified || r.verified),
  );
  await audit({ actorId: user.id, actorRole: user.role, action: "talent.viewed", entity: "Directory", meta: { filters: sp } });
  const base = user.role === "ADMIN" ? "/app/admin/submissions/" : "/app/adjudicator/submissions/";
  return (
    <div>
      <PageHeader
        eyebrow={<><span className="eyebrow text-sky-700">Talent directory</span><Req k="f" /></>}
        title="Find ranked youth companies"
        subtitle="Every innovator on Arena, ordered by Innovator Index. Filter by sector, district or tier to build a shortlist for a programme or partner. Each view is recorded in the audit trail."
      />
      <form className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <select name="sector" defaultValue={sp.sector ?? ""} className="input">
          <option value="">All sectors</option>
          {SECTORS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="district" defaultValue={sp.district ?? ""} className="input">
          <option value="">All districts</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select name="tier" defaultValue={sp.tier ?? ""} className="input">
          <option value="">All tiers</option>
          {TIERS.map((t) => <option key={t.name}>{t.name}</option>)}
        </select>
        <label className="flex h-10 items-center gap-2 rounded-[9px] px-3 text-sm text-slate-600 ring-1 ring-slate-200">
          <input type="checkbox" name="verified" value="1" defaultChecked={!!sp.verified} className="accent-[#0aa85c]" /> CIPA verified only
        </label>
        <div className="flex gap-2">
          <button className="btn-primary flex-1">Filter</button>
          <Link href="/app/talent" className="btn-ghost">Clear</Link>
        </div>
      </form>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-slate-500"><span className="font-semibold text-navy-950">{rows.length}</span> companies</span>
        <IndexLegend />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
            <tr>
              <th className="w-14 px-5 py-3 font-medium">Rank</th>
              <th className="px-3 py-3 font-medium">Company</th>
              <th className="px-3 py-3 font-medium">District · sector</th>
              <th className="w-48 px-3 py-3 font-medium">Index</th>
              <th className="px-3 py-3 font-medium">Best idea</th>
              <th className="px-5 py-3 text-right font-medium">Showcase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.userId} className="hover:bg-slate-50/60">
                <td className="px-5 py-3 font-mono text-slate-500">#{r.rank}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 font-medium text-navy-950">
                    {r.org} {r.verified && <BadgeCheck className="h-3.5 w-3.5 text-sky-600" aria-label="CIPA verified" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <TierChip score={r.score} /> {r.solves} Range {r.solves === 1 ? "solve" : "solves"}
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">
                  {r.district}
                  <div className="text-xs text-slate-400">{r.sector}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-9 font-mono font-semibold text-navy-950">{r.score}</span>
                    <IndexBar parts={r.parts} />
                  </div>
                </td>
                <td className="px-3 py-3">
                  {r.bestIdea ? (
                    <Link href={base + r.bestIdea.id} className="group block">
                      <span className="text-navy-950 group-hover:text-sky-700">{r.bestIdea.title}</span>
                      <div className="mt-0.5"><StatusBadge status={r.bestIdea.status} /></div>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400">No submission yet</span>
                  )}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={cn("chip", r.public ? "bg-sky-50 text-sky-800 ring-sky-200" : "bg-slate-50 text-slate-500 ring-slate-200")}>
                    {r.public ? "Public" : "Private"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Contact details are not shown here. Introductions to private companies go through the CEDA programme team, so only companies that agreed
        to be showcased are shared with outside partners.
      </p>
    </div>
  );
}
