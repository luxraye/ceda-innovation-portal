import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

// Right of access and portability: everything Sky holds about the signed-in person, as JSON.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const data = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true, email: true, phone: true, district: true, gender: true, dateOfBirth: true, role: true, createdAt: true, lastLoginAt: true,
      org: { select: { name: true, uin: true, youthShareholdingPct: true, district: true, sector: true, employees: true } },
      consents: { select: { purpose: true, granted: true, version: true, grantedAt: true, withdrawnAt: true } },
      submissions: { select: { reference: true, title: true, summary: true, status: true, submittedAt: true, awardAmount: true, versions: { select: { version: true, payload: true, sha256: true, createdAt: true } }, files: { select: { fileName: true, size: true, sha256: true, uploadedAt: true } }, feedback: { where: { visibility: "APPLICANT" }, select: { body: true, createdAt: true } } } },
      dataRequests: { select: { reference: true, type: true, status: true, createdAt: true, resolution: true } },
      notifications: { select: { title: true, body: true, createdAt: true } },
    },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: "dsr.self_export", entity: "User", entityId: user.id });
  return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), controller: "Citizen Entrepreneurial Development Agency (CEDA)", data }, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="my-sky-data.json"`, "Cache-Control": "no-store" },
  });
}
