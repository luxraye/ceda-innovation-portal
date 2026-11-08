import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { DemoButton } from "@/components/demo-button";
import { AuthAside } from "@/components/auth-aside";
import { DEMO_ACCOUNTS } from "@/lib/demo";
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
            Welcome back to <span className="text-sky-300">CEDA Innovation Portal.</span>
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
            New here? <Link href="/register" className="font-medium text-sky-700 hover:underline">Create an account</Link>
          </p>

          {demo && (
            <div className="mt-12">
              <div className="flex items-center gap-3">
                <span className="req-badge">For hackathon judges</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>
              <p className="mt-3 text-sm text-slate-500">One click signs you in as a demo user, with judge mode on.</p>
              <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-200">
                {DEMO_ACCOUNTS.map((a) => (
                  <div key={a.email} className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 last:border-0 hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-navy-950">{ROLE_INFO[a.role as Role].label}</div>
                      <div className="truncate text-xs text-slate-500">{a.name} · {a.note}</div>
                    </div>
                    <DemoButton email={a.email} next={next} className="btn-ghost h-8 shrink-0 px-3 text-[13px]">
                      Enter <ArrowRight className="h-3.5 w-3.5" />
                    </DemoButton>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
