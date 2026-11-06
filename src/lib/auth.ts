import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { readSessionToken, SESSION_COOKIE } from "./session";
import type { Role } from "./domain";

export async function getSession() {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.sub }, include: { org: true } });
  if (!user || user.anonymisedAt) return null;
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Page guard: signs out or redirects anyone without one of the roles. */
export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (roles.length && !roles.includes(user.role as Role)) redirect("/app?denied=1");
  return user;
}

/** Action guard: throws instead of redirecting, so a forged request fails loudly. */
export async function assertRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  if (roles.length && !roles.includes(user.role as Role)) throw new Error("Not allowed for your role");
  return user;
}
