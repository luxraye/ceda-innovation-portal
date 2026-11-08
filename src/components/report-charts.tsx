"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
type D = {
  funnel: { stage: string; count: number }[];
  districts: { name: string; value: number }[];
  sectors: { name: string; value: number }[];
  gender: { name: string; value: number }[];
  timeInStage: { stage: string; days: number }[];
  scoreBands: { band: string; ideas: number }[];
  perWeek: { week: string; ideas: number }[];
};

const AZURE = "#d94914";
const SKY = ["#d94914", "#f47f45", "#fdcdb1", "#f8a018"];
const axis = { fontSize: 11, fill: "#71717b" };
const tip = {
  contentStyle: { borderRadius: 10, border: "none", boxShadow: "0 0 0 1px rgb(31 25 21 / .08), 0 12px 24px -8px rgb(31 25 21 / .2)", fontSize: 12 },
  cursor: { fill: "rgb(236 98 36 / .06)" },
};

function Defs() {
  return (
    <defs>
      <linearGradient id="g-azure-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#f9a77c" />
        <stop offset="1" stopColor="#d94914" />
      </linearGradient>
      <linearGradient id="g-azure-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ec6224" />
        <stop offset="1" stopColor="#f9a77c" />
      </linearGradient>
      <linearGradient id="g-gold-v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f8a018" />
        <stop offset="1" stopColor="#fde3a7" />
      </linearGradient>
      <linearGradient id="g-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ec6224" stopOpacity={0.35} />
        <stop offset="1" stopColor="#ec6224" stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

function Panel({ title, note, children, wide }: { title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`card p-6 ${wide ? "lg:col-span-2" : ""}`}>
      <h2 className="text-[15px] text-navy-950">{title}</h2>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      <div className="mt-5 h-64">{children}</div>
    </section>
  );
}

export function ReportCharts({ data }: { data: D }) {
  const first = data.funnel[0]?.count || 1;
  const genderTotal = data.gender.reduce((a, g) => a + g.value, 0) || 1;
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="card p-6 lg:col-span-2">
        <h2 className="text-[15px] text-navy-950">From idea to award</h2>
        <p className="mt-0.5 text-xs text-slate-500">How many ideas reached each stage, and the share of all submissions.</p>
        <div className="mt-6 space-y-2.5">
          {data.funnel.map((f, i) => (
            <div key={f.stage} className="grid grid-cols-[9.5rem_1fr_3.5rem] items-center gap-4 text-sm">
              <span className="text-slate-600">{f.stage}</span>
              <div className="h-8 rounded-md bg-slate-100/80">
                <div
                  className="flex h-8 items-center justify-end rounded-md px-2.5 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"
                  style={{
                    width: `${Math.max(7, (f.count / first) * 100)}%`,
                    background: `linear-gradient(90deg, ${["#f47f45", "#ec6224", "#d94914", "#b4380f"][i % 4]}, #b4380f)`,
                  }}
                >
                  {f.count}
                </div>
              </div>
              <span className="text-right font-mono text-xs text-slate-500 tabular-nums">{Math.round((f.count / first) * 100)}%</span>
            </div>
          ))}
        </div>
      </section>
      <Panel title="Ideas by district" note="Where applicants are based">
        <ResponsiveContainer>
          <BarChart data={data.districts} layout="vertical" margin={{ left: 0, right: 28 }}>
            <Defs />
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={96} tick={axis} axisLine={false} tickLine={false} interval={0} />
            <Tooltip {...tip} />
            <Bar dataKey="value" name="Ideas" fill="url(#g-azure-h)" radius={[0, 4, 4, 0]} barSize={9}>
              <LabelList dataKey="value" position="right" fontSize={11} fill="#3f3f47" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Ideas by sector">
        <ResponsiveContainer>
          <BarChart data={data.sectors} layout="vertical" margin={{ left: 0, right: 28 }}>
            <Defs />
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={150} tick={axis} axisLine={false} tickLine={false} interval={0} />
            <Tooltip {...tip} />
            <Bar dataKey="value" name="Ideas" fill="url(#g-azure-h)" radius={[0, 4, 4, 0]} barSize={9}>
              <LabelList dataKey="value" position="right" fontSize={11} fill="#3f3f47" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Panel score distribution" note="Raw weighted scores out of 100">
        <ResponsiveContainer>
          <BarChart data={data.scoreBands}>
            <Defs />
            <CartesianGrid vertical={false} stroke="#f4f4f5" strokeDasharray="3 3" />
            <XAxis dataKey="band" tick={axis} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip {...tip} />
            <Bar dataKey="ideas" name="Ideas" fill="url(#g-azure-v)" radius={[5, 5, 0, 0]} barSize={34} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Average days in each stage" note="Where ideas wait longest">
        <ResponsiveContainer>
          <BarChart data={data.timeInStage}>
            <Defs />
            <CartesianGrid vertical={false} stroke="#f4f4f5" strokeDasharray="3 3" />
            <XAxis dataKey="stage" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip {...tip} />
            <Bar dataKey="days" name="Days" fill="url(#g-gold-v)" radius={[5, 5, 0, 0]} barSize={44}>
              <LabelList dataKey="days" position="top" fontSize={11} fill="#3f3f47" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Submissions per week">
        <ResponsiveContainer>
          <AreaChart data={data.perWeek} margin={{ top: 8, right: 8 }}>
            <Defs />
            <CartesianGrid vertical={false} stroke="#f4f4f5" strokeDasharray="3 3" />
            <XAxis dataKey="week" tick={axis} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip {...tip} cursor={{ stroke: "#fdcdb1" }} />
            <Area
              type="monotone"
              dataKey="ideas"
              name="Ideas"
              stroke={AZURE}
              strokeWidth={2}
              fill="url(#g-area)"
              connectNulls
              dot={{ r: 3, fill: "#fff", stroke: AZURE, strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Panel>
      <section className="card p-6">
        <h2 className="text-[15px] text-navy-950">Applicants by gender</h2>
        <p className="mt-0.5 text-xs text-slate-500">Self-declared; used only in totals like this</p>
        <div className="mt-5 grid h-64 grid-cols-[1fr_auto] items-center gap-6">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data.gender} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={3} stroke="none" isAnimationActive={false}>
                {data.gender.map((_, i) => (
                  <Cell key={i} fill={SKY[i % SKY.length]} />
                ))}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="space-y-3 pr-4 text-sm">
            {data.gender.map((g, i) => (
              <li key={g.name} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SKY[i % SKY.length] }} />
                <span className="text-slate-600">{g.name}</span>
                <span className="ml-auto pl-4 font-mono text-xs text-navy-950 tabular-nums">{Math.round((g.value / genderTotal) * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
