import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setCallStatus } from "@/app/actions/calls";
import { PageHeader, Req, Tone } from "@/components/ui";
import { fmtDate, parseJson, pula } from "@/lib/format";
import type { FormField } from "@/lib/domain";

export const metadata = { title: "Calls and rubrics" };

export default async function CallsAdmin() {
  await requireRole("ADMIN");
  const calls = await prisma.call.findMany({ orderBy: { createdAt: "desc" }, include: { criteria: { orderBy: { order: "asc" } }, stages: { orderBy: { order: "asc" } }, _count: { select: { submissions: true } } } });
  return (
    <div>
      <PageHeader eyebrow={<><Req k="g" /><Req k="a" /></>} title="Calls and rubrics" subtitle="Each call carries its own form, scoring criteria and stages. All of it is configuration, so CEDA can launch a new challenge without a developer." actions={<Link href="/app/admin/calls/new" className="btn-primary">Build a new call</Link>} />
      <div className="space-y-5">
        {calls.map((c) => {
          const fields = parseJson<FormField[]>(c.formSchema, []);
          return (
            <section key={c.id} className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="eyebrow text-sky-700">{c.theme}</div>
                  <h2 className="text-lg font-semibold text-navy-900">{c.title}</h2>
                  <div className="text-sm text-slate-500">{fmtDate(c.opensAt)} to {fmtDate(c.closesAt)} · {pula(c.prizePool)} · {c._count.submissions} ideas</div>
                </div>
                <form action={setCallStatus} className="flex items-center gap-2">
                  <input type="hidden" name="callId" value={c.id} />
                  <select name="status" defaultValue={c.status} className="input w-auto py-1.5 text-sm">
                    <option value="DRAFT">Draft</option><option value="OPEN">Open</option><option value="REVIEW">In review</option><option value="CLOSED">Closed</option>
                  </select>
                  <button className="btn-ghost py-1.5">Update</button>
                </form>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div><div className="eyebrow text-slate-400">Form</div><div className="mt-1 text-sm text-navy-900">{fields.length} questions, {fields.filter((f) => f.required).length} required, {fields.filter((f) => f.type === "file").length} documents</div></div>
                <div><div className="eyebrow text-slate-400">Rubric</div><ul className="mt-1 space-y-0.5 text-sm">{c.criteria.map((k) => <li key={k.id} className="flex justify-between"><span className="text-navy-900">{k.name}</span><span className="font-mono text-slate-500">{k.weight}%</span></li>)}</ul></div>
                <div><div className="eyebrow text-slate-400">Stages</div><ol className="mt-1 flex flex-wrap gap-1.5">{c.stages.map((s, i) => <li key={s.id}><Tone tone="sky">{i + 1}. {s.name}</Tone></li>)}</ol></div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
