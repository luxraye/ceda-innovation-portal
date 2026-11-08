import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { rolesFor } from "@/lib/nav";

// Route-level RBAC from the shared area map in lib/nav. Pages and actions check again on the server (defence in depth).
export async function middleware(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname } = req.nextUrl;
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  const roles = rolesFor(pathname);
  if (roles && !roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/app?denied=1", req.url));
  }
  const headers = new Headers(req.headers);
  headers.set("x-pathname", pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/app/:path*"] };
