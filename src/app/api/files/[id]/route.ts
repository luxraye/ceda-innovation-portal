import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewSubmission } from "@/lib/access";
import { decryptFile, sha256 } from "@/lib/crypto";
import { audit } from "@/lib/audit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await params;
  const file = await prisma.submissionFile.findUnique({ where: { id } });
  if (!file || !(await canViewSubmission(user, file.submissionId))) {
    await audit({ actorId: user.id, actorRole: user.role, action: "file.access_denied", entity: "SubmissionFile", entityId: id });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const bytes = decryptFile(Buffer.from(file.data), file.iv, file.authTag);
  const intact = sha256(bytes) === file.sha256;
  await audit({ actorId: user.id, actorRole: user.role, action: "file.downloaded", entity: "SubmissionFile", entityId: id, meta: { intact } });
  if (!intact) return NextResponse.json({ error: "Integrity check failed. The file does not match its seal." }, { status: 409 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${file.fileName.replace(/[^\w.\- ]/g, "_")}"`,
      "X-CEDA-SHA256": file.sha256,
      "Cache-Control": "private, no-store",
    },
  });
}
