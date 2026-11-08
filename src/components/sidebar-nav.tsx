"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Crosshair,
  FileText,
  Gavel,
  KanbanSquare,
  LayoutDashboard,
  Lock,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Swords,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { activeHref, type NavGroup, type NavIcon } from "@/lib/nav";

const ICONS: Record<NavIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  range: Swords,
  profile: UserRound,
  calls: Megaphone,
  trophy: Trophy,
  lock: Lock,
  queue: ClipboardCheck,
  gavel: Gavel,
  users: Users,
  chart: BarChart3,
  kanban: KanbanSquare,
  file: FileText,
  crosshair: Crosshair,
  scroll: ScrollText,
  shield: ShieldCheck,
  calendar: CalendarDays,
};

/**
 * Workspace navigation. It reads the live URL on the client, so the highlight
 * follows every click (the shell around it is a layout and does not re-render).
 */
export function SidebarNav({ groups, variant }: { groups: NavGroup[]; variant: "side" | "top" }) {
  const path = usePathname();
  const active = activeHref(groups, path);

  if (variant === "top") {
    return (
      <nav className="no-print flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 lg:hidden" aria-label="Workspace">
        {groups.flatMap((g) => g.items).map((n) => {
          const Icon = ICONS[n.icon];
          const on = n.href === active;
          return (
            <Link
              key={n.href}
              href={n.href}
              aria-current={on ? "page" : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${on ? "bg-sky-50 font-medium text-navy-950 ring-1 ring-sky-200" : "text-slate-600 hover:bg-slate-50"}`}
            >
              <Icon className="h-4 w-4" /> {n.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="relative space-y-5" aria-label="Workspace">
      {groups.map((g) => (
        <div key={g.title}>
          <div className="term px-3 pb-2 text-white/35">
            <span className="text-sky-400">&gt;</span> {g.title}
          </div>
          <div className="space-y-0.5">
            {g.items.map((n) => {
              const Icon = ICONS[n.icon];
              const on = n.href === active;
              const external = !n.href.startsWith("/app");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={on ? "page" : undefined}
                  className={`group relative flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] transition ${
                    on ? "bg-sky-400/10 font-medium text-white ring-1 ring-sky-400/25 ring-inset" : "text-white/55 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {on && <span className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-sky-400" />}
                  <Icon className={`h-4 w-4 ${on ? "text-sky-300" : "text-white/35 group-hover:text-white/70"}`} />
                  <span className="flex-1">{n.label}</span>
                  {external && <ArrowUpRight className="h-3.5 w-3.5 text-white/25 group-hover:text-white/60" aria-label="Opens the public site" />}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
