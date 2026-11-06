import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/format";
import { answersOf } from "@/lib/submission";
import { Callout, PageHeader, Req } from "@/components/ui";
import { SubmissionForm } from "@/components/submission-form";
import type { FormField } from "@/lib/domain";

export default async function EditSubmission({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("INNOVATOR");
  const { id } = await params;
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      call: true,
      files: { select: { id: true, slot: true, fileName: true, size: true, sha256: true } },
      versions: { orderBy: { version: "desc" }, take: 1 },
      feedback: { where: { kind: "CHANGE_REQUEST", resolved: false }, include: { criterion: true } },
    },
  });
  if (!sub || sub.ownerId !== user.id) notFound();
  if (!["DRAFT", "CHANGES_REQUESTED"].includes(sub.status)) redirect(`/app/innovator/submissions/${id}`);
  const fields = parseJson<FormField[]>(sub.call.formSchema, []);
  const draft = { ...answersOf(sub.versions[0]?.payload), ...parseJson<Record<string, string>>(sub.draft, {}) };
  return (
    <div className="max-w-4xl">
      <PageHeader
        eyebrow={<><span className="font-mono text-xs text-slate-500">{sub.reference}</span><Req k="a" />{sub.status === "CHANGES_REQUESTED" && <Req k="e" />}</>}
        title={sub.status === "CHANGES_REQUESTED" ? "Improve and resubmit" : "Your application"}
        subtitle={sub.call.title}
      />
      {sub.feedback.length > 0 && (
        <div className="mb-6">
          <Callout tone="gold" title="What the panel asked you to change">
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {sub.feedback.map((f) => <li key={f.id}>{f.criterion && <strong>{f.criterion.name}: </strong>}{f.body}</li>)}
            </ul>
          </Callout>
        </div>
      )}
      <SubmissionForm submissionId={sub.id} fields={fields} initial={draft} files={sub.files} resubmission={sub.status === "CHANGES_REQUESTED"} />
    </div>
  );
}
