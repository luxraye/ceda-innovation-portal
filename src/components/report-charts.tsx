"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type D = {
  funnel: { stage: string; count: number }[];
  districts: { name: string; value: number }[];
  sectors: { name: string; value: number }[];
  gender: { name: string; value: number }[];
  timeInStage: { stage: string; days: number }[];
  scoreBands: { band: string; ideas: number }[];
  perWeek: { week: string; ideas: number }[];
};

const AZURE = "#007fff";
const SKY = ["#007fff", "#36a6ff", "#7cc6ff", "#0a3f7d", "#f29a1f", "#b9e0ff"];
const axis = { fontSize: 11, fill: "#64748b" };

function Panel({ title, note, children, wide }: { title: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`card p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <h2 className="font-semibold text-navy-900">{title}</h2>
      {note && <p className="text-xs text-slate-500">{note}</p>}
      <div className="mt-4 h-64">{children}</div>
    </section>
  );
}

export function ReportCharts({ data }: { data: D }) {
  const first = data.funnel[0]?.count || 1;
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="card p-5 lg:col-span-2">
        <h2 className="font-semibold text-navy-900">From idea to award</h2>
        <p className="text-xs text-slate-500">How many ideas reached each stage, and the share of all submissions.</p>
        <div className="mt-5 space-y-3">
          {data.funnel.map((f) => (
            <div key={f.stage} className="grid grid-cols-[9rem_1fr_5rem] items-center gap-3 text-sm">
              <span className="text-slate-700">{f.stage}</span>
              <div className="h-8 rounded-lg bg-slate-100"><div className="flex h-8 items-center rounded-lg bg-gradient-to-r from-sky-500 to-sky-700 px-3 text-xs font-semibold text-white" style={{ width: `${Math.max(6, (f.count / first) * 100)}%` }}>{f.count}</div></div>
              <span className="text-right font-mono text-xs text-slate-500">{Math.round((f.count / first) * 100)}%</span>
            </div>
          ))}
        </div>
      </section>
      <Panel title="Ideas by district" note="Where applicants are based">
        <ResponsiveContainer>
          <BarChart data={data.districts} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={100} tick={axis} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#f0f8ff" }} />
            <Bar dataKey="value" name="Ideas" fill={AZURE} radius={[0, 6, 6, 0]}><LabelList dataKey="value" position="right" fontSize={11} fill="#0b1b33" /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Ideas by sector">
        <ResponsiveContainer>
          <BarChart data={data.sectors} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis type="category" dataKey="name" width={150} tick={axis} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "#f0f8ff" }} />
            <Bar dataKey="value" name="Ideas" fill="#36a6ff" radius={[0, 6, 6, 0]}><LabelList dataKey="value" position="right" fontSize={11} fill="#0b1b33" /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Panel score distribution" note="Raw weighted scores out of 100">
        <ResponsiveContainer>
          <BarChart data={data.scoreBands}>
            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis dataKey="band" tick={axis} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip cursor={{ fill: "#f0f8ff" }} />
            <Bar dataKey="ideas" name="Ideas" fill={AZURE} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Average days in each stage" note="Where ideas wait longest">
        <ResponsiveContainer>
          <BarChart data={data.timeInStage}>
            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis dataKey="stage" tick={axis} axisLine={false} tickLine={false} />
            <YAxis tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip cursor={{ fill: "#f0f8ff" }} />
            <Bar dataKey="days" name="Days" fill="#f29a1f" radius={[6, 6, 0, 0]}><LabelList dataKey="days" position="top" fontSize={11} fill="#0b1b33" /></Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Submissions per week">
        <ResponsiveContainer>
          <LineChart data={data.perWeek}>
            <CartesianGrid vertical={false} stroke="#eef2f7" />
            <XAxis dataKey="week" tick={axis} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} width={24} />
            <Tooltip />
            <Line type="monotone" dataKey="ideas" name="Ideas" stroke={AZURE} strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Panel>
      <Panel title="Applicants by gender" note="Self-declared; used only in totals like this">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data.gender} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
              {data.gender.map((_, i) => <Cell key={i} fill={SKY[i % SKY.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
