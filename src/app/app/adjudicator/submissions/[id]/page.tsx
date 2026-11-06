import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { StaffSubmission } from "@/components/staff-submission";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; done?: string }> }) {
  const user = await requireRole("ADJUDICATOR");
  const { id } = await params;
  const sp = await searchParams;
  const view = await StaffSubmission({ user, id, back: `/app/adjudicator/submissions/${id}`, ...sp });
  if (!view) notFound();
  return view;
}
