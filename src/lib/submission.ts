import { prisma } from "./prisma";
import { canonicalJson, sha256, signReceipt } from "./crypto";
import { parseJson } from "./format";
import type { FormField } from "./domain";

export type Payload = Record<string, string>;

export function validatePayload(fields: FormField[], payload: Payload, fileSlots: Set<string>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = (payload[f.key] ?? "").trim();
    if (f.type === "file") {
      if (f.required && !fileSlots.has(f.key)) errors[f.key] = "Upload this document";
      continue;
    }
    if (f.required && !v) {
      errors[f.key] = "This answer is required";
      continue;
    }
    if (!v) continue;
    if (f.maxLength && v.length > f.maxLength) errors[f.key] = `Keep this under ${f.maxLength} characters`;
    if (f.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) errors[f.key] = "Enter a number";
      else if (f.min !== undefined && n < f.min) errors[f.key] = `Must be at least ${f.min}`;
      else if (f.max !== undefined && n > f.max) errors[f.key] = `Must be at most ${f.max}`;
    }
    if (f.type === "url" && !/^https?:\/\/\S+\.\S+/.test(v)) errors[f.key] = "Enter a full link starting with https://";
    if (f.type === "select" && f.options && !f.options.includes(v)) errors[f.key] = "Choose one of the options";
  }
  return errors;
}

/** Locks a version: canonical payload + file hashes -> SHA-256 seal + HMAC receipt. */
export async function sealVersion(submissionId: string, payload: Payload, note?: string) {
  const sub = await prisma.submission.findUniqueOrThrow({ where: { id: submissionId }, include: { files: true } });
  const version = sub.currentVersion + 1;
  const files = sub.files
    .map((f) => ({ slot: f.slot, name: f.fileName, sha256: f.sha256, size: f.size }))
    .sort((a, b) => a.slot.localeCompare(b.slot));
  const snapshot = { reference: sub.reference, version, answers: payload, files };
  const json = canonicalJson(snapshot);
  const hash = sha256(json);
  const at = new Date();
  const signature = signReceipt([sub.reference, String(version), hash, at.toISOString()]);
  const v = await prisma.submissionVersion.create({
    data: { submissionId, version, payload: json, sha256: hash, signature, note, createdAt: at },
  });
  return v;
}

export function answersOf(versionPayload: string | null | undefined): Payload {
  return parseJson<{ answers?: Payload }>(versionPayload, {}).answers ?? {};
}

export async function nextReference() {
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await prisma.submission.count();
  return `SKY-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
};
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
