"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Bar, BarChart, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Slice = { name: string; value: number };

const tip = {
  contentStyle: { borderRadius: 10, border: "none", boxShadow: "0 0 0 1px rgb(31 25 21 / .08), 0 12px 24px -8px rgb(31 25 21 / .2)", fontSize: 12 },
  cursor: { fill: "rgb(236 98 36 / .06)" },
};
// Azure deepens through the live stages; grey for not selected, gold for awarded.
const STAGE_FILL = ["#f9a77c", "#f47f45", "#d94914", "#d4d4d8", "#f8a018"];
const SECTOR_FILL = ["#b4380f", "#d94914", "#ec6224", "#f47f45", "#f9a77c", "#fdcdb1", "#f8a018", "#fde3a7"];

/** Pipeline by stage and ideas by sector. Clicking a bar opens the pipeline board. */
export function OverviewCharts({ stages, sectors }: { stages: Slice[]; sectors: Slice[] }) {
  const router = useRouter();
  const total = sectors.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy-900">Pipeline by stage</h2>
            <p className="mt-0.5 text-xs text-slate-500">Ideas sitting at each stage right now. Click a bar to open the board.</p>
          </div>
          <Link href="/app/admin/pipeline" className="flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline">Board <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="mt-5 h-60">
          <ResponsiveContainer>
            <BarChart data={stages} margin={{ top: 18, left: 0, right: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#71717b" }} axisLine={false} tickLine={false} interval={0} />
              <YAxis hide allowDecimals={false} />
              <Tooltip {...tip} />
              <Bar dataKey="value" name="Ideas" radius={[6, 6, 0, 0]} barSize={46} className="cursor-pointer" onClick={() => router.push("/app/admin/pipeline")}>
                {stages.map((s, i) => <Cell key={s.name} fill={STAGE_FILL[i % STAGE_FILL.length]} />)}
                <LabelList dataKey="value" position="top" fontSize={12} fontWeight={600} fill="#1f1915" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="font-semibold text-navy-900">By sector</h2>
        <p className="mt-0.5 text-xs text-slate-500">Where this year's ideas come from.</p>
        <div className="mt-4 grid grid-cols-[9rem_1fr] items-center gap-4">
          <div className="relative h-36">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={sectors} dataKey="value" nameKey="name" innerRadius={44} outerRadius={66} paddingAngle={2} stroke="none">
                  {sectors.map((s, i) => <Cell key={s.name} fill={SECTOR_FILL[i % SECTOR_FILL.length]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <span><span className="block font-display text-2xl font-semibold text-navy-950">{total}</span><span className="text-[10px] text-slate-500">ideas</span></span>
            </div>
          </div>
          <ul className="space-y-1.5 text-xs">
            {sectors.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: SECTOR_FILL[i % SECTOR_FILL.length] }} />
                <span className="min-w-0 flex-1 truncate text-slate-600">{s.name}</span>
                <span className="font-mono text-slate-500 tabular-nums">{Math.round((s.value / total) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
