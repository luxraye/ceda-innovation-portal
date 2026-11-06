import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildReport } from "@/lib/reports";
import { audit } from "@/lib/audit";

// Pseudonymised export: no names, emails or phone numbers leave Sky in a spreadsheet.
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !["ADMIN", "ADJUDICATOR", "DPO"].includes(user.role)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const callId = req.nextUrl.searchParams.get("call") ?? undefined;
  const r = await buildReport(callId);
  const header = ["reference", "call", "sector", "district", "youth_shareholding_pct", "gender", "status", "stage", "submitted_at", "award_bwp"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = r.subs.map((s) => [s.reference, s.call.title, s.sector, s.org.district, s.org.youthShareholdingPct, s.owner.gender ?? "", s.status, s.stage?.name ?? "", s.submittedAt?.toISOString() ?? "", s.awardAmount ?? ""].map(esc).join(","));
  await audit({ actorId: user.id, actorRole: user.role, action: "report.exported", entity: "Report", meta: { rows: lines.length, callId: callId ?? "all" } });
  return new NextResponse([header.join(","), ...lines].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="sky-report-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
