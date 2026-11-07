import { AlertTriangle, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { callRanking } from "@/lib/ranking";
import { weightedTotal } from "@/lib/scoring";
import { fmtDate, fmtDateTime, parseJson, pula } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import { STAGE_DECIDERS } from "@/lib/workflow";
import { addStaffComment, assignEvaluators, makeDecision } from "@/app/actions/evaluation";
import { Callout, PageHeader, Req, ScoreBar, StatusBadge, Tone } from "./ui";
import { StageTracker } from "./stage-tracker";
import { AnswerList, ReceiptCard, Timeline, VersionDiff } from "./submission-parts";
import type { FormField } from "@/lib/domain";
import { DecisionForm } from "./decision-form";
import { PanelBrief } from "./panel-brief";

export async function StaffSubmission({ user, id, back, error, done }: { user: CurrentUser; id: string; back: string; error?: string; done?: string }) {
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      call: { include: { stages: { orderBy: { order: "asc" } }, criteria: { orderBy: { order: "asc" } } } },
      stage: true,
      org: true,
      owner: true,
      events: { orderBy: { createdAt: "desc" }, include: { actor: true } },
      versions: { orderBy: { version: "desc" } },
      files: { select: { id: true, slot: true, fileName: true, size: true, sha256: true } },
      assignments: { include: { evaluator: true, scores: true, stage: true }, orderBy: { createdAt: "asc" } },
      feedback: { orderBy: { createdAt: "asc" }, include: { author: true, criterion: true } },
      decisions: { orderBy: { createdAt: "desc" }, include: { decider: true, stage: true } },
    },
  });
  if (!sub) return null;
  await audit({ actorId: user.id, actorRole: user.role, action: "submission.viewed", entity: "Submission", entityId: id });
  const fields = parseJson<FormField[]>(sub.call.formSchema, []);
  const ranking = await callRanking(sub.callId);
  const rank = ranking.get(sub.id);
  const position = rank ? [...ranking.values()].findIndex((r) => r.submissionId === sub.id) + 1 : null;
  const stageKind = sub.stage?.kind ?? "SCREENING";
  const canDecide = STAGE_DECIDERS[stageKind]?.includes(user.role) && !["DRAFT", "WITHDRAWN", "DECLINED", "AWARDED"].includes(sub.status);
  const evaluators = user.role === "ADMIN" && stageKind === "PANEL" ? await prisma.user.findMany({ where: { role: "EVALUATOR" }, orderBy: { name: "asc" } }) : [];
  const assignedIds = new Set(sub.assignments.filter((a) => a.stageId === sub.stageId).map((a) => a.evaluatorId));
  const latest = sub.versions[0];
  const prev = sub.versions[1];
  const panelDone = sub.assignments.filter((a) => a.stageId === sub.stageId && a.status === "DONE").length;
  const panelTotal = sub.assignments.filter((a) => a.stageId === sub.stageId && a.status !== "CONFLICT").length;
  const nextStage = sub.call.stages[sub.call.stages.findIndex((s) => s.id === sub.stageId) + 1];

  return (
    <div>
      <PageHeader
        eyebrow={<><span className="font-mono text-xs text-slate-500">{sub.reference}</span><StatusBadge status={sub.status} /><Req k="b" /><Req k="c" /></>}
        title={sub.title}
        subtitle={`${sub.org.name} · ${sub.org.district} · ${sub.call.title}`}
      />
      {error && <div className="mb-4"><Callout tone="rose">{error}</Callout></div>}
      {done && <div className="mb-4"><Callout tone="emerald" title="Decision recorded">The applicant has been notified in-app, by email and by SMS.</Callout></div>}
      <div className="card p-6"><StageTracker stages={sub.call.stages} currentStageId={sub.stageId} status={sub.status} /></div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          {latest && ["ADJUDICATOR", "ADMIN"].includes(user.role) && <PanelBrief submissionId={sub.id} />}
          <section className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-navy-900">Panel scores</h2>
              <div className="flex items-center gap-2"><Req k="b" />{rank && <Tone tone="sky">Rank {position} of {ranking.size} in this call</Tone>}</div>
            </div>
            {sub.assignments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No evaluators assigned yet.</p>
            ) : (
              <>
                {rank && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl bg-sky-50 p-4"><div className="text-xs text-slate-500">Normalised score</div><div className="font-display text-2xl font-semibold text-navy-900">{rank.normalised}</div><div className="text-[11px] text-slate-500">Adjusted for each judge's scoring habits</div></div>
                    <div className="rounded-xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Raw weighted average</div><div className="font-display text-2xl font-semibold text-navy-900">{rank.raw}</div><ScoreBar value={rank.raw} /></div>
                    <div className={`rounded-xl p-4 ${rank.flagged ? "bg-gold-300/30" : "bg-slate-50"}`}><div className="text-xs text-slate-500">Panel spread</div><div className="font-display text-2xl font-semibold text-navy-900">±{rank.spread}</div><div className="text-[11px] text-slate-500">{rank.flagged ? "Judges disagree. Discuss before deciding." : "Judges broadly agree"}</div></div>
                  </div>
                )}
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="py-2 pr-3 font-medium">Criterion</th>
                        {sub.assignments.map((a) => <th key={a.id} className="px-2 py-2 text-center font-medium">{a.evaluator.name.split(" ").slice(-1)[0]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sub.call.criteria.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100">
                          <td className="py-2 pr-3"><span className="text-navy-900">{c.name}</span> <span className="font-mono text-[11px] text-slate-400">{c.weight}%</span></td>
                          {sub.assignments.map((a) => {
                            const s = a.scores.find((x) => x.criterionId === c.id);
                            return <td key={a.id} className="px-2 py-2 text-center font-mono" title={s?.comment ?? ""}>{a.status === "CONFLICT" ? "-" : s ? `${s.value}/${c.maxScore}` : "..."}</td>;
                          })}
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td className="py-2 pr-3 text-navy-900">Weighted total</td>
                        {sub.assignments.map((a) => (
                          <td key={a.id} className="px-2 py-2 text-center">
                            {a.status === "CONFLICT" ? <Tone tone="slate">Conflict</Tone> : a.status === "DONE" ? weightedTotal(a.scores, sub.call.criteria) : <Tone tone="sky">Pending</Tone>}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {user.role === "ADMIN" && stageKind === "PANEL" && (
              <form action={assignEvaluators} className="mt-6 rounded-xl border border-slate-200 p-4">
                <input type="hidden" name="submissionId" value={sub.id} />
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900"><Users className="h-4 w-4" /> Assign evaluators ({sub.stage?.minReviewers ?? 2} minimum)</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {evaluators.map((e) => (
                    <label key={e.id} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="evaluatorId" value={e.id} defaultChecked={assignedIds.has(e.id)} disabled={assignedIds.has(e.id)} className="accent-sky-600" />
                      <span>{e.name}<span className="block text-xs text-slate-500">{e.title}</span></span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs text-slate-600" htmlFor="days">Due in</label>
                  <input id="days" name="days" type="number" defaultValue={7} min={1} max={30} className="input w-20 py-1.5" />
                  <span className="text-xs text-slate-600">days</span>
                  <button className="btn-primary ml-auto py-2">Assign and notify</button>
                </div>
              </form>
            )}
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between"><h2 className="font-semibold text-navy-900">Feedback and discussion</h2><Req k="e" /></div>
            <ul className="mt-4 space-y-3">
              {sub.feedback.length === 0 && <li className="text-sm text-slate-500">No comments yet.</li>}
              {sub.feedback.map((f) => (
                <li key={f.id} className={`rounded-xl p-3 text-sm ${f.visibility === "PANEL" ? "bg-slate-50" : f.author.role === "INNOVATOR" ? "bg-sky-50" : "border border-slate-200"}`}>
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-navy-900">{f.author.name}</span>
                    <span>{f.author.role.toLowerCase()}</span>
                    {f.criterion && <Tone tone="sky">{f.criterion.name}</Tone>}
                    <Tone tone={f.visibility === "PANEL" ? "slate" : "emerald"}>{f.visibility === "PANEL" ? "Panel only" : "Shared with applicant"}</Tone>
                    {f.kind === "CHANGE_REQUEST" && <Tone tone="amber">Change request</Tone>}
                    <span>{fmtDateTime(f.createdAt)}</span>
                  </div>
                  {f.body}
                </li>
              ))}
            </ul>
            <form action={addStaffComment} className="mt-4 space-y-2">
              <input type="hidden" name="submissionId" value={sub.id} />
              <input type="hidden" name="back" value={back} />
              <textarea name="body" rows={2} className="input" placeholder="Add a comment" required />
              <div className="flex items-center justify-between">
                <select name="visibility" className="input w-auto py-1.5 text-xs"><option value="PANEL">Panel only</option><option value="APPLICANT">Share with applicant</option></select>
                <button className="btn-ghost py-2">Post comment</button>
              </div>
            </form>
          </section>

          {prev && latest && (
            <section className="card p-6">
              <h2 className="font-semibold text-navy-900">What changed in version {latest.version}</h2>
              <div className="mt-4"><VersionDiff fields={fields} before={answersOf(prev.payload)} after={answersOf(latest.payload)} /></div>
            </section>
          )}
          <section className="card p-6">
            <h2 className="mb-4 font-semibold text-navy-900">Submission (version {latest?.version ?? "-"})</h2>
            <AnswerList fields={fields} answers={answersOf(latest?.payload)} files={sub.files} />
          </section>
        </div>

        <div className="space-y-6">
          {canDecide ? (
            <DecisionForm
              submissionId={sub.id}
              back={back}
              stageName={sub.stage?.name ?? "Screening"}
              stageKind={stageKind}
              nextStageName={nextStage && nextStage.kind !== "AWARD" ? nextStage.name : null}
              panelNote={stageKind === "PANEL" ? `${panelDone} of ${panelTotal} evaluators have scored` : null}
              action={makeDecision}
            />
          ) : (
            <div className="card p-5 text-sm text-slate-600">
              <div className="font-semibold text-navy-900">Decision rights</div>
              {["AWARDED", "DECLINED", "WITHDRAWN"].includes(sub.status) ? "This idea has a final outcome." : `At the ${sub.stage?.name ?? "current"} stage, decisions are made by: ${(STAGE_DECIDERS[stageKind] ?? []).map((r) => r.toLowerCase()).join(", ") || "nobody"}.`}
            </div>
          )}
          <section className="card p-5 text-sm">
            <h2 className="font-semibold text-navy-900">Applicant</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Company</dt><dd className="text-right text-navy-900">{sub.org.name}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">CIPA UIN</dt><dd className="font-mono text-navy-900">{sub.org.uin}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Youth shareholding</dt><dd className="text-navy-900">{sub.org.youthShareholdingPct}%</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Founder</dt><dd className="text-navy-900">{sub.owner.anonymisedAt ? "Anonymised" : sub.owner.name}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-slate-500">Submitted</dt><dd className="text-navy-900">{fmtDate(sub.submittedAt)}</dd></div>
              {sub.awardAmount && <div className="flex justify-between gap-2"><dt className="text-slate-500">Award</dt><dd className="font-semibold text-navy-900">{pula(sub.awardAmount)}</dd></div>}
            </dl>
            {sub.owner.restricted && <div className="mt-3 flex items-center gap-2 text-xs text-rose-700"><AlertTriangle className="h-4 w-4" /> Applicant has restricted processing</div>}
          </section>
          {latest && <ReceiptCard reference={sub.reference} version={latest} />}
          <section className="card p-5">
            <h2 className="mb-4 font-semibold text-navy-900">Timeline</h2>
            <Timeline events={sub.events} showActors />
          </section>
        </div>
      </div>
    </div>
  );
}
