import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startApplication } from "@/app/actions/submissions";
import { checkEligibility } from "@/lib/eligibility";
import { Callout, PageHeader, Req } from "@/components/ui";
import { CheckCircle2, CircleAlert } from "lucide-react";

export default async function Apply({ params }: { params: Promise<{ callId: string }> }) {
  const user = await requireRole("INNOVATOR");
  const { callId } = await params;
  const call = await prisma.call.findUnique({ where: { id: callId } });
  if (!call) notFound();
  const elig = checkEligibility({
    dateOfBirth: user.dateOfBirth ?? new Date(0),
    citizen: true,
    uin: user.org?.uin ?? "",
    youthShareholdingPct: user.org?.youthShareholdingPct ?? 0,
  });
  const start = startApplication.bind(null, call.id);
  return (
    <div className="max-w-2xl">
      <PageHeader eyebrow={<Req k="a" />} title={`Apply to ${call.title}`} subtitle="Before you start, the portal confirms you and your company qualify." />
      <div className="card p-6">
        <ul className="space-y-3">
          {elig.checks.map((c) => (
            <li key={c.key} className="flex items-start gap-3 text-sm">
              {c.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-rose-500" />}
              <span><span className="font-medium text-navy-900">{c.label}</span><span className="block text-slate-500">{c.detail}</span></span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          {elig.eligible ? (
            <form action={start}>
              <button className="btn-primary btn-lg w-full">Start my application</button>
              <p className="mt-2 text-center text-xs text-slate-500">Your answers save as a draft until you press submit.</p>
            </form>
          ) : (
            <Callout tone="rose" title="Not eligible for this call">Update your details in the privacy centre if something here is wrong.</Callout>
          )}
        </div>
      </div>
    </div>
  );
}
