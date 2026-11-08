import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { DemoButton } from "@/components/demo-button";
import { AuthAside } from "@/components/auth-aside";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { ROLE_INFO, type Role } from "@/lib/domain";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const demo = process.env.DEMO_MODE === "true";
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
      <AuthAside
        title={
          <>
            Welcome back to <span className="font-serif text-[1.08em] text-sky-300 italic">Arena.</span>
          </>
        }
        body="Follow your ideas through every stage, or review the ones assigned to you. Everything you do here is recorded on a tamper-evident trail."
      />
      <main className="flex items-center justify-center px-4 py-12 md:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-10 text-3xl text-navy-950 lg:mt-0">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Use the email you registered with.</p>
          <LoginForm next={next ?? ""} />
          <p className="mt-6 text-sm text-slate-500">
            New to Arena? <Link href="/register" className="font-medium text-sky-700 hover:underline">Create an account</Link>
          </p>

          {demo && (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <span className="req-badge">For hackathon judges</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Pick who you want to be. One click signs you in, and you can switch roles any time from the <span className="font-medium text-slate-700">Viewing as</span> menu at the top of every workspace.
              </p>
              {(["Applicant", "CEDA"] as const).map((side) => (
                <div key={side} className="mt-5">
                  <div className="eyebrow text-slate-400">{side === "Applicant" ? "The applicant side" : "The CEDA side"}</div>
                  <div className="mt-2 grid gap-2">
                    {DEMO_ACCOUNTS.filter((a) => a.side === side).map((a) => (
                      <DemoButton
                        key={a.email}
                        email={a.email}
                        next={next}
                        plain
                        className="group flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3 text-left ring-1 ring-slate-200 transition hover:-translate-y-px hover:shadow-md hover:ring-sky-300"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-navy-950">{ROLE_INFO[a.role as Role].label}</span>
                          <span className="block text-xs text-slate-500">{a.who}</span>
                          <span className="mt-1 block truncate text-[11.5px] text-slate-400">{a.name} · try: {a.try[0].label.toLowerCase()}</span>
                        </span>
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-sky-500 group-hover:text-white">
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </DemoButton>
                    ))}
                  </div>
                </div>
              ))}
              <p className="mt-4 text-xs text-slate-400">Prefer typing? Every demo account uses the password {DEMO_PASSWORD}.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
