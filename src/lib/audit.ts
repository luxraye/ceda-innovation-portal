import { prisma } from "./prisma";
import { sha256, canonicalJson } from "./crypto";

const GENESIS = "0".repeat(64);

type AuditInput = {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
};

/**
 * Appends to a hash-chained audit log. Each entry's hash covers the previous
 * hash, so editing or deleting any past entry breaks every hash after it.
 */
export async function audit(input: AuditInput, at?: Date) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const last = await prisma.auditLog.findFirst({ orderBy: { seq: "desc" } });
    const seq = (last?.seq ?? 0) + 1;
    const prevHash = last?.hash ?? GENESIS;
    const createdAt = at ?? new Date();
    const meta = input.meta ? canonicalJson(input.meta) : null;
    const hash = entryHash({ ...input, seq, prevHash, createdAt, meta });
    try {
      return await prisma.auditLog.create({
        data: {
          seq,
          prevHash,
          hash,
          createdAt,
          actorId: input.actorId ?? null,
          actorRole: input.actorRole ?? null,
          action: input.action,
          entity: input.entity ?? null,
          entityId: input.entityId ?? null,
          meta,
        },
      });
    } catch {
      // Another write took this seq number; retry with the new tail.
    }
  }
  throw new Error("Could not write audit entry");
}

function entryHash(e: {
  seq: number;
  prevHash: string;
  createdAt: Date;
  meta: string | null;
  actorId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
}) {
  return sha256(
    [e.seq, e.prevHash, e.createdAt.toISOString(), e.actorId ?? "", e.action, e.entity ?? "", e.entityId ?? "", e.meta ?? ""].join("|"),
  );
}

export async function verifyAuditChain() {
  const entries = await prisma.auditLog.findMany({ orderBy: { seq: "asc" } });
  let prev = GENESIS;
  for (const e of entries) {
    const expected = entryHash({ ...e });
    if (e.prevHash !== prev || e.hash !== expected) {
      return { ok: false as const, total: entries.length, brokenAt: e.seq };
    }
    prev = e.hash;
  }
  return { ok: true as const, total: entries.length, head: prev };
}
