import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Compass, Repeat } from "lucide-react";
import { demoLogin } from "@/app/actions/auth";
import { DEMO_ACCOUNTS } from "@/lib/demo";
import { AutoCloseDetails } from "./auto-close-details";
import { ROLE_INFO, type Role } from "@/lib/domain";

/** Demo mode only: hop between the five seeded accounts without signing out. */
export function RoleSwitcher({ email, role }: { email: string; role: Role }) {
  if (process.env.DEMO_MODE !== "true") return null;
  return (
    <AutoCloseDetails className="group/rs relative">
      <summary className="flex h-8 cursor-pointer list-none items-center gap-2 rounded-lg bg-white px-2.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 transition hover:ring-slate-300 [&::-webkit-details-marker]:hidden">
        <Repeat className="h-3.5 w-3.5 text-sky-600" />
        <span className="hidden sm:inline">Viewing as</span>
        <span className="text-navy-950">{ROLE_INFO[role].label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 transition group-open/rs:rotate-180" />
      </summary>
      <div className="absolute right-0 z-50 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="text-[13px] font-medium text-navy-950">Switch demo account</div>
          <div className="text-xs text-slate-500">Each role sees only its own workspace. One click switches.</div>
        </div>
        <ul>
          {DEMO_ACCOUNTS.map((a) => {
            const current = a.email === email;
            return (
              <li key={a.email} className="border-b border-slate-100 last:border-0">
                <form action={demoLogin}>
                  <input type="hidden" name="email" value={a.email} />
                  <button
                    disabled={current}
                    className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${current ? "bg-sky-50/70" : "hover:bg-slate-50"}`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${current ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {current ? <Check className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-navy-950">
                        {ROLE_INFO[a.role as Role].label}
                        <span className={`rounded px-1.5 py-px text-[10px] font-medium ${a.side === "Applicant" ? "bg-gold-300/30 text-earth-700" : "bg-slate-100 text-slate-500"}`}>{a.side}</span>
                      </span>
                      <span className="block text-xs text-slate-500">{a.who}</span>
                    </span>
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </div>
    </AutoCloseDetails>
  );
}

/** Demo mode only: a slim strip telling a judge who they are and what to try here. */
export function RoleGuide({ email, role }: { email: string; role: Role }) {
  if (process.env.DEMO_MODE !== "true") return null;
  const account = DEMO_ACCOUNTS.find((a) => a.email === email) ?? DEMO_ACCOUNTS.find((a) => a.role === role);
  if (!account) return null;
  return (
    <div className="no-print border-b border-sky-100 bg-sky-50/60">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 text-[13px] md:px-8">
        <span className="flex items-center gap-2 font-medium text-navy-950">
          <Compass className="h-4 w-4 text-sky-600" />
          You are {account.who.charAt(0).toLowerCase() + account.who.slice(1)}.
        </span>
        <span className="text-slate-400">Try:</span>
        {account.try.map((s, i) => (
          <Link key={s.href} href={s.href} className="group flex items-center gap-1.5 text-sky-800 hover:text-sky-950">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-100 font-mono text-[9.5px] text-sky-700">{i + 1}</span>
            <span className="underline-offset-2 group-hover:underline">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
