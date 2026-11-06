import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson, pula } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import { replyToFeedback, withdrawSubmission } from "@/app/actions/submissions";
import { Callout, PageHeader, Req, StatusBadge } from "@/components/ui";
import { StageTracker } from "@/components/stage-tracker";
import { AnswerList, ReceiptCard, Timeline, VersionDiff } from "@/components/submission-parts";
import type { FormField } from "@/lib/domain";
import { fmtDateTime } from "@/lib/format";

export default async function SubmissionView({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string; v?: string }> }) {
  const user = await requireRole("INNOVATOR");
  const { id } = await params;
  const { submitted } = await searchParams;
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      call: { include: { stages: true } },
      stage: true,
      events: { orderBy: { createdAt: "desc" } },
      versions: { orderBy: { version: "desc" } },
      files: { select: { id: true, slot: true, fileName: true, size: true, sha256: true } },
      feedback: { where: { visibility: "APPLICANT" }, orderBy: { createdAt: "asc" }, include: { author: true, criterion: true } },
      decisions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!sub || sub.ownerId !== user.id) notFound();
  const fields = parseJson<FormField[]>(sub.call.formSchema, []);
  const latest = sub.versions[0];
  const prev = sub.versions[1];
  const decision = sub.decisions[0];
  return (
    <div>
      <PageHeader
        eyebrow={<><span className="font-mono text-xs text-slate-500">{sub.reference}</span><StatusBadge status={sub.status} /><Req k="c" /></>}
        title={sub.title}
        subtitle={sub.call.title}
        actions={
          sub.status === "CHANGES_REQUESTED" ? <Link href={`/app/innovator/submissions/${id}/edit`} className="btn-gold">Improve and resubmit</Link> : null
        }
      />
      {submitted && <div className="mb-6"><Callout tone="emerald" title="Submitted and sealed">Your idea is locked with a SHA-256 fingerprint and a signed receipt. You'll get a notification at every stage.</Callout></div>}
      {sub.status === "AWARDED" && <div className="mb-6"><Callout tone="gold" title={`Congratulations, you've been awarded ${pula(sub.awardAmount)}`}>{decision?.rationale}</Callout></div>}
      {sub.status === "DECLINED" && decision && <div className="mb-6"><Callout tone="rose" title="This idea was not selected this time">{decision.rationale} You can apply to future calls; your feedback below will help.</Callout></div>}

      <div className="card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Where your idea is now</h2>
          <span className="flex items-center gap-1.5 text-xs text-emerald-700"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live</span>
        </div>
        <StageTracker stages={sub.call.stages} currentStageId={sub.stageId} status={sub.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="card p-6" id="feedback">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-navy-900">Feedback from CEDA</h2>
              <Req k="e" />
            </div>
            {sub.feedback.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No feedback yet. Panels share comments here as they review.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {sub.feedback.map((f) => {
                  const mine = f.authorId === user.id;
                  return (
                    <li key={f.id} className={`rounded-xl p-4 text-sm ${mine ? "ml-8 bg-sky-50" : f.kind === "CHANGE_REQUEST" ? "border border-gold-400/60 bg-gold-300/15" : "bg-slate-50"}`}>
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-navy-900">{mine ? "You" : f.author.role === "EVALUATOR" ? "Panel evaluator" : f.author.role === "ADJUDICATOR" ? "CEDA committee" : "CEDA programme team"}</span>
                        {f.criterion && <span className="chip bg-white text-sky-700">{f.criterion.name}</span>}
                        {f.kind === "CHANGE_REQUEST" && <span className="chip bg-gold-300/50 text-earth-700">{f.resolved ? "Change made" : "Change requested"}</span>}
                        <span>{fmtDateTime(f.createdAt)}</span>
                      </div>
                      <p className="text-slate-800">{f.body}</p>
                    </li>
                  );
                })}
              </ul>
            )}
            {sub.feedback.some((f) => f.authorId !== user.id) && !["WITHDRAWN"].includes(sub.status) && (
              <form action={replyToFeedback} className="mt-4 flex gap-2">
                <input type="hidden" name="submissionId" value={sub.id} />
                <input name="body" className="input" placeholder="Reply to the panel or ask a question" required minLength={2} />
                <button className="btn-primary shrink-0">Send</button>
              </form>
            )}
          </section>

          {prev && latest && (
            <section className="card p-6">
              <h2 className="font-semibold text-navy-900">What changed in version {latest.version}</h2>
              <p className="mt-1 text-xs text-slate-500">Compared with version {prev.version}. Green is new, red is removed.</p>
              <div className="mt-4"><VersionDiff fields={fields} before={answersOf(prev.payload)} after={answersOf(latest.payload)} /></div>
            </section>
          )}

          {latest && (
            <section className="card p-6">
              <h2 className="mb-4 font-semibold text-navy-900">Your submitted answers (version {latest.version})</h2>
              <AnswerList fields={fields} answers={answersOf(latest.payload)} files={sub.files} />
            </section>
          )}
        </div>
        <div className="space-y-6">
          {latest && <ReceiptCard reference={sub.reference} version={latest} />}
          <section className="card p-6">
            <h2 className="mb-4 font-semibold text-navy-900">Timeline</h2>
            <Timeline events={sub.events} />
          </section>
          {sub.versions.length > 1 && (
            <section className="card p-6">
              <h2 className="font-semibold text-navy-900">Versions</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {sub.versions.map((v) => (
                  <li key={v.id} className="flex justify-between"><span>v{v.version} · {v.note}</span><span className="font-mono text-xs text-slate-500">{v.sha256.slice(0, 10)}</span></li>
                ))}
              </ul>
            </section>
          )}
          {!["AWARDED", "DECLINED", "WITHDRAWN"].includes(sub.status) && (
            <form action={withdrawSubmission} className="text-center">
              <input type="hidden" name="submissionId" value={sub.id} />
              <button className="text-xs text-slate-500 underline hover:text-rose-600">Withdraw this idea</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
