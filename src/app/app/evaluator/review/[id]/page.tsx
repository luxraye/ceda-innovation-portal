import { notFound } from "next/navigation";
import { ShieldCheck, EyeOff } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import { audit } from "@/lib/audit";
import { declareConflict } from "@/app/actions/evaluation";
import { PageHeader, Req } from "@/components/ui";
import { AnswerList } from "@/components/submission-parts";
import { ScoringPanel } from "@/components/scoring-panel";
import { PanelBrief } from "@/components/panel-brief";
import type { FormField } from "@/lib/domain";

// Fields that reveal identity are hidden in blind review.
const IDENTITY_SECTIONS = ["Your team"];

export default async function Review({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("EVALUATOR");
  const { id } = await params;
  const a = await prisma.assignment.findUnique({
    where: { id },
    include: {
      stage: true,
      scores: true,
      submission: { include: { call: { include: { criteria: { orderBy: { order: "asc" } } } }, versions: { orderBy: { version: "desc" }, take: 1 }, files: { select: { id: true, slot: true, fileName: true, size: true, sha256: true } } } },
    },
  });
  if (!a || a.evaluatorId !== user.id) notFound();
  const sub = a.submission;

  if (!a.coiDeclaredAt) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader eyebrow={<><Req k="b" /><Req k="d" /></>} title="Before you open this idea" subtitle="CEDA requires every evaluator to declare conflicts of interest first." />
        <div className="card p-7">
          <ShieldCheck className="h-10 w-10 text-sky-600" />
          <p className="mt-4 text-slate-700">
            You are about to review <strong>{sub.reference}</strong> in <strong>{sub.call.title}</strong>, sector <strong>{sub.sector}</strong>. Do you have a personal, family, financial
            or business relationship with any company in this sector that has applied to this call, or any other reason you could not judge fairly?
          </p>
          <form action={declareConflict} className="mt-6 space-y-4">
            <input type="hidden" name="assignmentId" value={a.id} />
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm">
              <input type="radio" name="conflict" value="no" defaultChecked className="mt-0.5 accent-sky-600" />
              <span><span className="font-semibold text-navy-900">I have no conflict of interest</span><span className="block text-slate-600">I will keep this submission confidential and judge it only on the published criteria.</span></span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm">
              <input type="radio" name="conflict" value="yes" className="mt-0.5 accent-sky-600" />
              <span><span className="font-semibold text-navy-900">I have a conflict</span><span className="block text-slate-600">The idea stays closed to you and the programme team reassigns it.</span></span>
            </label>
            <textarea name="note" className="input" rows={2} placeholder="If you have a conflict, briefly say why (optional)" />
            <button className="btn-primary btn-lg w-full">Confirm declaration</button>
            <p className="text-center text-xs text-slate-500">Your declaration is time-stamped in the audit trail.</p>
          </form>
        </div>
      </div>
    );
  }

  await audit({ actorId: user.id, actorRole: user.role, action: "submission.viewed_blind", entity: "Submission", entityId: sub.id });
  const fields = parseJson<FormField[]>(sub.call.formSchema, []).filter((f) => !IDENTITY_SECTIONS.includes(f.section));
  const answers = answersOf(sub.versions[0]?.payload);
  return (
    <div>
      <PageHeader
        eyebrow={<><span className="font-mono text-xs text-slate-500">{sub.reference}</span><span className="chip bg-slate-900 text-white"><EyeOff className="h-3 w-3" /> Blind review</span><Req k="b" /></>}
        title={sub.title}
        subtitle={`${sub.call.title} · ${a.stage.name} · ${sub.sector}`}
      />
      <div className="mb-6"><PanelBrief submissionId={sub.id} /></div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="card p-6">
          <h2 className="mb-1 font-semibold text-navy-900">The idea</h2>
          <p className="mb-5 text-xs text-slate-500">Founder and company details are hidden so the idea is judged on its merits. Version {sub.versions[0]?.version ?? 1}.</p>
          <AnswerList fields={fields} answers={answers} files={sub.files} hideIdentity />
        </section>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ScoringPanel
            assignmentId={a.id}
            done={a.status === "DONE"}
            criteria={sub.call.criteria.map((c) => ({ id: c.id, name: c.name, description: c.description, weight: c.weight, maxScore: c.maxScore }))}
            existing={a.scores.map((s) => ({ criterionId: s.criterionId, value: s.value, comment: s.comment ?? "" }))}
            overall={a.overall ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
