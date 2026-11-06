import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";

// Route-level RBAC. Pages and actions check again on the server (defence in depth).
const AREA_ROLES: Record<string, string[]> = {
  "/app/innovator": ["INNOVATOR"],
  "/app/evaluator": ["EVALUATOR"],
  "/app/adjudicator": ["ADJUDICATOR"],
  "/app/admin": ["ADMIN"],
  "/app/dpo": ["DPO"],
  "/app/reports": ["ADMIN", "ADJUDICATOR", "DPO"],
};

export async function middleware(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  for (const [prefix, roles] of Object.entries(AREA_ROLES)) {
    if (pathname.startsWith(prefix) && !roles.includes(session.role)) {
      return NextResponse.redirect(new URL("/app?denied=1", req.url));
    }
  }
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/app/:path*"] };
