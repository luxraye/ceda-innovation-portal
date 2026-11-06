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

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const role = user.role as Role;
  const store = await cookies();
  const judge = store.get("sky_judge")?.value === "1";
  const path = (await headers()).get("x-pathname") ?? "/app";
  const nav = NAV[role];
  const active = nav
    .filter((n) => path === n.href || path.startsWith(n.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen flex-col border-r border-slate-200/80 bg-[#fbfbfc] px-3 py-4 lg:flex">
        <div className="px-2.5 pt-1 pb-5">
          <Logo href={ROLE_INFO[role].home} />
        </div>
        <div className="eyebrow px-3 pt-2 pb-2 text-slate-400">Workspace</div>
        <nav className="space-y-0.5" aria-label="Workspace">
          {nav.map((n) => {
            const on = n.href === active;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
                className={`group flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] transition ${
                  on
                    ? "bg-white font-medium text-navy-950 shadow-[0_0_0_1px_rgb(11_18_32/0.08),0_1px_2px_rgb(11_18_32/0.06)]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy-950"
                }`}
              >
                <n.icon className={`h-4 w-4 ${on ? "text-sky-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <Link
            href="/tour"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-navy-950 p-3 text-[13px] text-white shadow-[0_8px_20px_-10px_rgb(5_8_15/0.6)]"
          >
            <span className="pointer-events-none absolute -top-8 -right-6 h-20 w-20 rounded-full bg-sky-500/40 blur-2xl" aria-hidden="true" />
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gold-400/15 ring-1 ring-gold-400/40">
              <Sparkles className="h-3.5 w-3.5 text-gold-300" />
            </span>
            <span className="relative">
              <span className="block font-medium">Judge's guide</span>
              <span className="block text-[11px] text-white/50">The brief, screen by screen</span>
            </span>
          </Link>
          <div className="flex items-center gap-2.5 rounded-xl p-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-sky-100 to-sky-200 text-[11px] font-semibold text-sky-800 ring-1 ring-sky-300/60">
              {initials(user.name)}
            </span>
            <div className="min-w-0 text-xs">
              <div className="truncate font-medium text-navy-950">{user.name}</div>
              <div className="truncate text-slate-500">{user.org?.name ?? ROLE_INFO[role].label}</div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <header className="no-print sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 backdrop-blur-xl md:px-8">
          <div className="lg:hidden">
            <Logo href={ROLE_INFO[role].home} compact />
          </div>
          <div className="hidden min-w-0 items-center gap-2.5 text-[13px] text-slate-500 lg:flex">
            <span className="chip bg-sky-50 text-sky-800 ring-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> {ROLE_INFO[role].label}
            </span>
            <span className="truncate">{ROLE_INFO[role].blurb}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={`/api/judge-mode?on=${judge ? "0" : "1"}&back=${encodeURIComponent(path)}`}
              className="hidden h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:flex"
              title="Show which part of the CEDA brief each screen answers"
            >
              <span className={`relative h-[18px] w-8 rounded-full transition ${judge ? "bg-gold-500" : "bg-slate-300"}`}>
                <span className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow transition-all ${judge ? "left-[16px]" : "left-[2px]"}`} />
              </span>
              Judge mode
            </a>
            <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
            <NotificationBell />
            <form action={logout}>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-rose-600" aria-label="Sign out" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <nav className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden" aria-label="Workspace">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${n.href === active ? "bg-slate-100 font-medium text-navy-950" : "text-slate-600"}`}
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 md:px-8 md:py-9">{children}</main>
        <footer className="no-print flex flex-wrap justify-between gap-2 border-t border-slate-200/80 px-4 py-4 text-xs text-slate-400 md:px-8">
          <span>Sky prototype · CEDA Innovation Portal Hackathon · Demo data only</span>
          <span className="font-mono">Botswana Data Protection Act 2024</span>
        </footer>
      </div>
    </div>
  );
}
