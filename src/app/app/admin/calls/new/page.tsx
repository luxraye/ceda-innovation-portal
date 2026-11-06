import { requireRole } from "@/lib/auth";
import { PageHeader, Req } from "@/components/ui";
import { CallBuilder } from "@/components/call-builder";
import { DEFAULT_CRITERIA, DEFAULT_FORM, DEFAULT_STAGES } from "@/lib/templates";

export const metadata = { title: "Build a call" };

export default async function NewCall() {
  await requireRole("ADMIN");
  return (
    <div>
      <PageHeader eyebrow={<><Req k="g" /><Req k="b" /></>} title="Build a new call" subtitle="Start from CEDA's standard template, then change the questions, scoring criteria and stages for this challenge." />
      <CallBuilder defaults={{ fields: DEFAULT_FORM, criteria: DEFAULT_CRITERIA.map((c) => ({ ...c, maxScore: 10 })), stages: DEFAULT_STAGES }} />
    </div>
  );
}
