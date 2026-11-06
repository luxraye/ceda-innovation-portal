import { NextResponse, type NextRequest } from "next/server";

// Toggles the requirement badges that map each screen to the CEDA brief.
export async function GET(req: NextRequest) {
  const on = req.nextUrl.searchParams.get("on") === "1";
  const back = req.nextUrl.searchParams.get("back") || "/";
  const res = NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", req.url));
  res.cookies.set("sky_judge", on ? "1" : "0", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  return res;
}
