import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export function sha256(input: string | Buffer | Uint8Array): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Stable JSON so the same payload always hashes the same way. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${canonicalJson(obj[k])}`)
    .join(",")}}`;
}

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET must be set (16+ characters)");
  return s;
}

/** Receipt signature: proves Sky issued this hash at this time. */
export function signReceipt(parts: string[]): string {
  return createHmac("sha256", secret()).update(parts.join("|")).digest("hex");
}

export function verifyReceipt(parts: string[], signature: string): boolean {
  const expected = Buffer.from(signReceipt(parts), "hex");
  const given = Buffer.from(signature, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given);
}

function fileKey(): Buffer {
  const hex = process.env.FILE_ENCRYPTION_KEY ?? "";
  if (/^[0-9a-f]{64}$/i.test(hex)) return Buffer.from(hex, "hex");
  // Fallback for demos: derive from AUTH_SECRET so files are still encrypted.
  return createHash("sha256").update(`sky-files:${secret()}`).digest();
}

export function encryptFile(data: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", fileKey(), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return { data: encrypted, iv: iv.toString("hex"), authTag: cipher.getAuthTag().toString("hex") };
}

export function decryptFile(data: Buffer, iv: string, authTag: string): Buffer {
  const decipher = createDecipheriv("aes-256-gcm", fileKey(), Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
