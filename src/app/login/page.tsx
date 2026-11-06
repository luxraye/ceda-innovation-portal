import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";
import { DemoButton } from "@/components/demo-button";
import { DEMO_ACCOUNTS } from "@/lib/demo";
import { ROLE_INFO, type Role } from "@/lib/domain";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const demo = process.env.DEMO_MODE === "true";
  return (
    <div className="sky-gradient min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 md:px-8 lg:grid-cols-2">
        <div className="card p-8">
          <Logo />
          <h1 className="mt-8 text-2xl font-bold text-navy-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to follow your ideas, or to review the ones assigned to you.</p>
          <LoginForm next={next ?? ""} />
          <p className="mt-6 text-sm text-slate-600">
            New to Sky? <Link href="/register" className="font-semibold text-sky-700 hover:underline">Create an account</Link>
          </p>
        </div>
        {demo && (
          <div>
            <div className="req-badge">For hackathon judges</div>
            <h2 className="mt-3 text-2xl font-bold text-navy-900">Step into any role</h2>
            <p className="mt-1 text-sm text-slate-600">One click signs you in as a demo user. Judge mode badges switch on so you can see which requirement each screen meets.</p>
            <div className="mt-5 space-y-3">
              {DEMO_ACCOUNTS.map((a) => (
                <div key={a.email} className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white/70 p-4 backdrop-blur">
                  <div className="min-w-0">
                    <div className="font-semibold text-navy-900">{ROLE_INFO[a.role as Role].label}</div>
                    <div className="truncate text-xs text-slate-600">{a.name} · {a.note}</div>
                  </div>
                  <DemoButton email={a.email} next={next} className="shrink-0 px-3 py-2">Enter</DemoButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
