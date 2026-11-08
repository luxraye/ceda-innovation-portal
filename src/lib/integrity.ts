import "server-only";
import { prisma } from "./prisma";
import { decryptFile, sha256, verifyReceipt } from "./crypto";
import { parseJson } from "./format";

export type Check = { label: string; ok: boolean; detail: string };
export type InstanceCheck = { ok: boolean; checkedAt: string; version: number; checks: Check[] };

type SealedFile = { slot: string; name: string; sha256: string; size: number };

/** Cheap check for lists: does the latest receipt still verify against its fingerprint? */
export function receiptValid(reference: string, v: { version: number; sha256: string; signature: string; createdAt: Date }) {
  return verifyReceipt([reference, String(v.version), v.sha256, v.createdAt.toISOString()], v.signature);
}

/**
 * Full tamper check of one idea instance. It re-hashes the sealed answers, re-verifies
 * the signed receipt, and decrypts and re-hashes every stored document.
 */
export async function checkInstance(submissionId: string): Promise<InstanceCheck | null> {
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { versions: { orderBy: { version: "desc" }, take: 1 }, files: true },
  });
  const v = sub?.versions[0];
  if (!sub || !v) return null;
  const checks: Check[] = [];

  const rehash = sha256(v.payload);
  checks.push({
    label: "Sealed answers",
    ok: rehash === v.sha256,
    detail: rehash === v.sha256 ? `Version ${v.version} still hashes to ${v.sha256.slice(0, 12)}...` : "The stored answers no longer match their fingerprint.",
  });

  const receipt = receiptValid(sub.reference, v);
  checks.push({
    label: "Signed receipt",
    ok: receipt,
    detail: receipt ? "The receipt signature matches what CEDA issued." : "The receipt signature does not match. The record was altered.",
  });

  const sealed = parseJson<{ files?: SealedFile[] }>(v.payload, {}).files ?? [];
  const reopened = ["DRAFT", "CHANGES_REQUESTED"].includes(sub.status);
  for (const s of sealed) {
    const f = sub.files.find((x) => x.slot === s.slot);
    if (!f || f.sha256 !== s.sha256) {
      checks.push({
        label: s.name,
        ok: reopened,
        detail: reopened ? "Replaced while the founder revises it. The new file is sealed on resubmission." : "This document is missing or differs from the sealed version.",
      });
      continue;
    }
    let ok = false;
    try {
      ok = sha256(decryptFile(Buffer.from(f.data), f.iv, f.authTag)) === s.sha256;
    } catch {
      ok = false;
    }
    checks.push({ label: s.name, ok, detail: ok ? `Decrypted and re-hashed: ${s.sha256.slice(0, 12)}...` : "The stored bytes fail decryption or no longer match their hash." });
  }

  return { ok: checks.every((c) => c.ok), checkedAt: new Date().toISOString(), version: v.version, checks };
}
