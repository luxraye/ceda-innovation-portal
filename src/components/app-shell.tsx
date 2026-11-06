import Link from "next/link";
import { cookies, headers } from "next/headers";
import {
  BarChart3,
  ClipboardCheck,
  FileText,
  Gavel,
  KanbanSquare,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import { logout } from "@/app/actions/auth";
import { ROLE_INFO, type Role } from "@/lib/domain";
import type { CurrentUser } from "@/lib/auth";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const NAV: Record<Role, NavItem[]> = {
  INNOVATOR: [
    { href: "/app/innovator", label: "My dashboard", icon: LayoutDashboard },
    { href: "/calls", label: "Open calls", icon: Megaphone },
    { href: "/app/privacy", label: "Privacy centre", icon: Lock },
  ],
  EVALUATOR: [
    { href: "/app/evaluator", label: "My review queue", icon: ClipboardCheck },
    { href: "/app/privacy", label: "Privacy centre", icon: Lock },
  ],
  ADJUDICATOR: [
    { href: "/app/adjudicator", label: "Committee board", icon: Gavel },
    { href: "/app/reports", label: "Reports", icon: BarChart3 },
    { href: "/app/privacy", label: "Privacy centre", icon: Lock },
  ],
  ADMIN: [
    { href: "/app/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/app/admin/pipeline", label: "Pipeline board", icon: KanbanSquare },
    { href: "/app/admin/calls", label: "Calls & rubrics", icon: FileText },
    { href: "/app/reports", label: "Reports", icon: BarChart3 },
    { href: "/app/admin/audit", label: "Audit trail", icon: ScrollText },
  ],
  DPO: [
    { href: "/app/dpo", label: "Compliance overview", icon: ShieldCheck },
    { href: "/app/admin/audit", label: "Audit trail", icon: ScrollText },
    { href: "/app/reports", label: "Reports", icon: BarChart3 },
  ],
};

export async function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const role = user.role as Role;
  const store = await cookies();
  const judge = store.get("sky_judge")?.value === "1";
  const path = (await headers()).get("x-pathname") ?? "/app";
  const nav = NAV[role];
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="night-gradient hidden flex-col p-5 text-white lg:flex">
        <Logo dark href={ROLE_INFO[role].home} />
        <nav className="mt-8 space-y-1" aria-label="Workspace">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sky-100/90 hover:bg-white/10 hover:text-white"
            >
              <n.icon className="h-4.5 w-4.5" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <Link href="/tour" className="flex items-center gap-2 rounded-xl border border-gold-400/40 bg-gold-500/10 px-3 py-2.5 text-sm text-gold-300 hover:bg-gold-500/20">
            <Sparkles className="h-4 w-4" /> Judge's guide
          </Link>
          <div className="rounded-xl bg-white/5 p-3 text-xs text-sky-100/80">
            <div className="flex items-center gap-2 font-semibold text-white">
              <UserRound className="h-4 w-4" /> {user.name}
            </div>
            <div className="mt-0.5">{ROLE_INFO[role].label}</div>
            {user.org && <div className="mt-0.5 truncate">{user.org.name}</div>}
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur md:px-8">
          <div className="lg:hidden">
            <Logo href={ROLE_INFO[role].home} />
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 lg:flex">
            <span className="chip bg-sky-100 text-sky-800">{ROLE_INFO[role].label}</span>
            <span className="truncate">{ROLE_INFO[role].blurb}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/api/judge-mode?on=${judge ? "0" : "1"}&back=${encodeURIComponent(path)}`}
              className={`hidden rounded-xl border px-3 py-2 text-xs font-semibold sm:block ${judge ? "border-gold-400 bg-gold-300/30 text-earth-700" : "border-slate-200 bg-white text-slate-600 hover:border-gold-400"}`}
              title="Show which part of the CEDA brief each screen answers"
            >
              Judge mode: {judge ? "on" : "off"}
            </a>
            <NotificationBell />
            <form action={logout}>
              <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:text-rose-600" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>
        <nav className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden" aria-label="Workspace">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-sky-50">
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="no-print border-t border-slate-200 px-8 py-4 text-xs text-slate-500">
          Sky prototype for the CEDA Innovation Portal Hackathon · Demo data only · Protected under the Botswana Data Protection Act 2024
        </footer>
      </div>
    </div>
  );
}
