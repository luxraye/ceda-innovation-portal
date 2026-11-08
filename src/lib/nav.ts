import type { Role } from "./domain";

/**
 * One source of truth for who may open which workspace area.
 * The middleware guards routes with it and the sidebar is filtered by it,
 * so a link can never appear for a role that would be turned away.
 * The longest matching prefix wins, so "/app/admin/audit" overrides "/app/admin".
 */
export const AREA_ROLES: Record<string, Role[]> = {
  "/app/innovator": ["INNOVATOR"],
  "/app/evaluator": ["EVALUATOR"],
  "/app/adjudicator": ["ADJUDICATOR"],
  "/app/admin": ["ADMIN"],
  "/app/admin/audit": ["ADMIN", "DPO"],
  "/app/dpo": ["DPO"],
  "/app/reports": ["ADMIN", "ADJUDICATOR", "DPO"],
  "/app/talent": ["ADMIN", "ADJUDICATOR"],
  "/app/events": ["INNOVATOR"],
};

/** Roles allowed on a path, or null when any signed-in user may open it. */
export function rolesFor(pathname: string): Role[] | null {
  const match = Object.keys(AREA_ROLES)
    .filter((p) => pathname === p || pathname.startsWith(p + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? AREA_ROLES[match] : null;
}

export function canOpen(role: Role, href: string) {
  if (!href.startsWith("/app")) return true;
  const roles = rolesFor(href.split("?")[0]);
  return !roles || roles.includes(role);
}

export type NavIcon =
  | "dashboard" | "range" | "profile" | "calls" | "trophy" | "lock" | "queue" | "gavel"
  | "users" | "chart" | "kanban" | "file" | "crosshair" | "scroll" | "shield" | "calendar";

export type NavItem = { href: string; label: string; icon: NavIcon };
export type NavGroup = { title: string; items: NavItem[] };

const NAV: Record<Role, NavGroup[]> = {
  INNOVATOR: [
    {
      title: "My workspace",
      items: [
        { href: "/app/innovator", label: "My dashboard", icon: "dashboard" },
        { href: "/app/calls", label: "Open calls", icon: "calls" },
        { href: "/app/innovator/range", label: "The Range", icon: "range" },
        { href: "/app/events", label: "Events", icon: "calendar" },
        { href: "/app/innovator/profile", label: "My profile & Index", icon: "profile" },
        { href: "/app/leaderboard", label: "Leaderboard", icon: "trophy" },
        { href: "/app/privacy", label: "Privacy centre", icon: "lock" },
      ],
    },
  ],
  EVALUATOR: [
    {
      title: "My workspace",
      items: [
        { href: "/app/evaluator", label: "My review queue", icon: "queue" },
        { href: "/app/privacy", label: "Privacy centre", icon: "lock" },
      ],
    },
  ],
  ADJUDICATOR: [
    {
      title: "Committee",
      items: [
        { href: "/app/adjudicator", label: "Committee board", icon: "gavel" },
        { href: "/app/talent", label: "Talent directory", icon: "users" },
        { href: "/app/reports", label: "Reports", icon: "chart" },
        { href: "/app/leaderboard", label: "Leaderboard", icon: "trophy" },
        { href: "/app/privacy", label: "Privacy centre", icon: "lock" },
      ],
    },
  ],
  ADMIN: [
    {
      title: "Run the programme",
      items: [
        { href: "/app/admin", label: "Overview", icon: "dashboard" },
        { href: "/app/admin/pipeline", label: "Pipeline board", icon: "kanban" },
        { href: "/app/admin/calls", label: "Calls & rubrics", icon: "file" },
        { href: "/app/admin/range", label: "Range control", icon: "crosshair" },
      ],
    },
    {
      title: "Insight & oversight",
      items: [
        { href: "/app/talent", label: "Talent directory", icon: "users" },
        { href: "/app/leaderboard", label: "Leaderboard", icon: "trophy" },
        { href: "/app/reports", label: "Reports", icon: "chart" },
        { href: "/app/admin/audit", label: "Audit trail", icon: "scroll" },
        { href: "/app/privacy", label: "Privacy centre", icon: "lock" },
      ],
    },
  ],
  DPO: [
    {
      title: "Data protection",
      items: [
        { href: "/app/dpo", label: "Compliance overview", icon: "shield" },
        { href: "/app/admin/audit", label: "Audit trail", icon: "scroll" },
        { href: "/app/reports", label: "Reports", icon: "chart" },
        { href: "/app/privacy", label: "Privacy centre", icon: "lock" },
      ],
    },
  ],
};

/** The sidebar for a role, with anything that role cannot open removed. */
export function navFor(role: Role): NavGroup[] {
  return NAV[role]
    .map((g) => ({ ...g, items: g.items.filter((i) => canOpen(role, i.href)) }))
    .filter((g) => g.items.length > 0);
}

/** The nav item that best matches the current path (longest prefix wins). */
export function activeHref(groups: NavGroup[], pathname: string) {
  return groups
    .flatMap((g) => g.items)
    .filter((n) => pathname === n.href || pathname.startsWith(n.href + "/"))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
