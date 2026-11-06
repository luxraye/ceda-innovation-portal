import { SignJWT, jwtVerify } from "jose";
import type { Role } from "./domain";

export const SESSION_COOKIE = "sky_session";
export const SESSION_HOURS = 8;

export type SessionPayload = { sub: string; role: Role; name: string };

function key() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(p: SessionPayload) {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function readSessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { sub: String(payload.sub), role: payload.role as Role, name: String(payload.name) };
  } catch {
    return null;
  }
}
