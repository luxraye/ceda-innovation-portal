import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { isStaff, type AppRole } from "@/lib/stages";
import { initials } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  show: (r: AppRole[]) => boolean;
};

const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: () => true },
  { to: "/ideas/new", label: "New idea", icon: Plus, show: () => true },
  { to: "/review", label: "Review queue", icon: ClipboardList, show: isStaff },
  { to: "/reports", label: "Reports", icon: BarChart3, show: isStaff },
  { to: "/admin", label: "Administration", icon: Settings2, show: (r) => r.includes("admin") },
];

const ROLE_LABEL: Record<AppRole, string> = {
  submitter: "Innovator",
  evaluator: "Evaluator",
  adjudicator: "Adjudicator",
  admin: "Administrator",
};

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? "";
  const topRole =
    (["admin", "adjudicator", "evaluator", "submitter"] as AppRole[]).find((r) =>
      roles.includes(r),
    ) ?? "submitter";

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link to="/" className="flex items-center gap-2.5 px-6 py-6" onClick={onNavigate}>
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-ember font-display text-lg font-extrabold text-primary-foreground">
          C
        </span>
        <span className="font-display text-lg font-bold leading-none text-sidebar-accent-foreground">
          CEDA
          <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] opacity-60">
            Innovation Portal
          </span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.filter((n) => n.show(roles)).map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            activeOptions={{ exact: n.to === "/dashboard" }}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          >
            {({ isActive }) => (
              <>
                <n.icon
                  className={cn("size-4", isActive ? "text-sidebar-primary" : "opacity-70")}
                />
                {n.label}
                {isActive && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
              </>
            )}
          </Link>
        ))}
      </nav>
      <div className="m-3 rounded-xl border border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{name}</p>
            <p className="text-xs opacity-60">{ROLE_LABEL[topRole]}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={signOut}
        >
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  );
}

/** Signed-in layout: dark sidebar on desktop, slide-out drawer on mobile. Sends visitors to sign in. */
export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen lg:block">
        <SidebarBody />
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[270px] border-0 p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-display font-bold">CEDA Innovation Portal</span>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="animate-rise">
              <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
              {subtitle && <div className="mt-1.5 text-muted-foreground">{subtitle}</div>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-card",
        accent ? "border-transparent bg-ink text-ink-foreground" : "bg-card",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          accent ? "opacity-70" : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn("mt-2 font-display text-3xl font-extrabold", accent && "text-gradient-ember")}
      >
        {value}
      </p>
      {hint && (
        <p className={cn("mt-1 text-xs", accent ? "opacity-70" : "text-muted-foreground")}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="grain rounded-2xl border border-dashed p-12 text-center">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
