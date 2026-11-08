import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import { SidebarNav } from "./sidebar-nav";
import { RoleGuide, RoleSwitcher } from "./role-switcher";
import { logout } from "@/app/actions/auth";
import { ROLE_INFO, type Role } from "@/lib/domain";
import { navFor } from "@/lib/nav";
import type { CurrentUser } from "@/lib/auth";

function initials(name: string) {
  return name
    .replace(/^(Dr|Mr|Ms|Mrs|Prof)\.?\s+/i, "")
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppShell({ user, children }: { user: CurrentUser; children: React.ReactNode }) {
  const role = user.role as Role;
  const nav = navFor(role);
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="night no-print sticky top-0 hidden h-screen flex-col overflow-hidden border-r border-white/[0.06] px-3 py-4 lg:flex">
        <div className="hex-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="relative px-2.5 pt-1 pb-5">
          <Logo href={ROLE_INFO[role].home} dark />
        </div>
        <SidebarNav groups={nav} variant="side" />
        <div className="relative mt-auto space-y-2">
          <Link
            href="/tour"
            className="group relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-white/[0.04] p-3 text-[13px] text-white ring-1 ring-white/10"
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
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-400/15 font-mono text-[11px] font-semibold text-sky-300 ring-1 ring-sky-400/40">
              {initials(user.name)}
            </span>
            <div className="min-w-0 text-xs">
              <div className="truncate font-medium text-white">{user.name}</div>
              <div className="truncate text-white/45">{ROLE_INFO[role].label}{user.org?.name ? ` · ${user.org.name}` : ""}</div>
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
            <RoleSwitcher email={user.email} role={role} />
            <span className="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />
            <NotificationBell />
            <form action={logout}>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-rose-600" aria-label="Sign out" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <SidebarNav groups={nav} variant="top" />
        <RoleGuide email={user.email} role={role} />
        <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 md:px-8 md:py-9">{children}</main>
        <footer className="no-print flex flex-wrap justify-between gap-2 border-t border-slate-200/80 px-4 py-4 text-xs text-slate-400 md:px-8">
          <span>Arena prototype · CEDA Innovation Portal Hackathon · Demo data only</span>
          <span className="font-mono">Botswana Data Protection Act 2024</span>
        </footer>
      </div>
    </div>
  );
}
