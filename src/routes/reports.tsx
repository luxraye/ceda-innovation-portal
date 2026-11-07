import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { AppShell, Empty, Stat } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useIdeas } from "@/lib/data";
import { isStaff, PIPELINE, STAGE_META } from "@/lib/stages";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — CEDA Innovation Portal" }] }),
  component: Reports,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const tip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--card)",
    fontSize: 12,
  },
};

function Reports() {
  const { roles } = useAuth();
  const { data, isLoading } = useIdeas();
  const ideas = useMemo(() => (data ?? []).filter((i) => i.stage !== "draft"), [data]);

  const byStage = PIPELINE.map((s) => ({
    name: STAGE_META[s].label,
    value: ideas.filter((i) => i.stage === s).length,
  }));
  const sectors = useMemo(() => {
    const m = new Map<string, { n: number; sum: number; scored: number }>();
    ideas.forEach((i) => {
      const e = m.get(i.category) ?? { n: 0, sum: 0, scored: 0 };
      e.n++;
      if (i.avg_score != null) {
        e.sum += Number(i.avg_score);
        e.scored++;
      }
      m.set(i.category, e);
    });
    return [...m.entries()]
      .map(([name, e]) => ({
        name,
        value: e.n,
        avg: e.scored ? +(e.sum / e.scored).toFixed(1) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [ideas]);
  const overTime = useMemo(() => {
    const m = new Map<string, number>();
    ideas.forEach((i) => {
      const d = (i.submitted_at ?? i.created_at).slice(0, 10);
      m.set(d, (m.get(d) ?? 0) + 1);
    });
    let run = 0;
    return [...m.entries()]
      .sort()
      .map(([d, n]) => ({
        date: new Date(d).toLocaleDateString("en-BW", { day: "numeric", month: "short" }),
        total: (run += n),
      }));
  }, [ideas]);

  const awarded = ideas.filter((i) => i.stage === "awarded" || i.stage === "approved").length;
  const youth = ideas.length
    ? Math.round(ideas.reduce((a, i) => a + i.youth_shareholding, 0) / ideas.length)
    : 0;
  const decided = ideas.filter((i) => ["approved", "awarded", "rejected"].includes(i.stage)).length;

  const exportCsv = () => {
    const head = [
      "Reference",
      "Title",
      "Company",
      "Sector",
      "Stage",
      "Youth %",
      "Team",
      "Score",
      "Submitted",
    ];
    const lines = ideas.map((i) => [
      i.reference,
      i.title,
      i.company_name,
      i.category,
      STAGE_META[i.stage].label,
      i.youth_shareholding,
      i.team_size,
      i.avg_score ?? "",
      i.submitted_at?.slice(0, 10) ?? "",
    ]);
    const csv = [head, ...lines]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `ceda-innovation-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (!isStaff(roles)) {
    return (
      <AppShell title="Reports">
        <Empty title="Panel members only" body="Reports are available to CEDA staff." />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Decision reports"
      subtitle="Pipeline health, sector mix and scoring trends for CEDA leadership."
      actions={
        <Button variant="outline" onClick={exportCsv} disabled={!ideas.length}>
          <Download /> Export CSV
        </Button>
      }
    >
      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : !ideas.length ? (
        <Empty title="No submissions yet" body="Charts appear once ideas are submitted." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Submissions" value={ideas.length} accent />
            <Stat
              label="Approved or awarded"
              value={awarded}
              hint={`${decided ? Math.round((awarded / decided) * 100) : 0}% of decided ideas`}
            />
            <Stat label="Sectors represented" value={sectors.length} />
            <Stat
              label="Avg youth shareholding"
              value={`${youth}%`}
              hint="Eligibility needs more than 50%"
            />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Ideas by stage">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={byStage} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="value" name="Ideas" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Sector mix">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={sectors}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {sectors.map((s, i) => (
                      <Cell key={s.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 text-xs">
                {sectors.map((s, i) => (
                  <span key={s.name} className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                    {s.name} ({s.value})
                  </span>
                ))}
              </div>
            </Panel>
            <Panel title="Average score by sector">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={sectors} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip {...tip} cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="avg" name="Avg score" radius={[0, 8, 8, 0]} fill="var(--chart-2)" />
                </BarChart>
              </ResponsiveContainer>
            </Panel>
            <Panel title="Submissions over time">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={overTime} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip {...tip} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="var(--chart-1)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-6 shadow-card">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}
