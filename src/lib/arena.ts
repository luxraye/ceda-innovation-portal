import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import { callRanking } from "./ranking";

// The Innovator Index: a 0-1000 rating for every youth-owned company, built from
// four parts anyone can check. It ranks and guides; it never decides an award.

export const TRACKS = {
  MARKET: { label: "Market", hint: "Customers, pricing, demand" },
  FINANCE: { label: "Finance", hint: "Unit economics, funding, cash" },
  PRODUCT: { label: "Product", hint: "Prototype, testing, delivery" },
  COMPLIANCE: { label: "Compliance", hint: "CIPA, tax, data protection" },
  PITCH: { label: "Pitch", hint: "Telling the story in 90 seconds" },
  IMPACT: { label: "Impact", hint: "Jobs, inclusion, environment" },
} as const;
export type Track = keyof typeof TRACKS;

export const DIFFICULTY = {
  EASY: { label: "Easy", tone: "emerald" },
  MEDIUM: { label: "Medium", tone: "amber" },
  HARD: { label: "Hard", tone: "rose" },
} as const;

export const EVENT_KINDS = {
  HACKATHON: "Hackathon",
  BOOTCAMP: "Bootcamp",
  PITCH_NIGHT: "Pitch night",
} as const;

export const INDEX_PARTS = [
  { key: "panel", label: "Panel score", max: 400, how: "Your best normalised panel score from any call, adjusted for harsh and generous judges." },
  { key: "progress", label: "Pipeline progress", max: 250, how: "How far your furthest idea has gone: submitted, screened, committee, awarded." },
  { key: "range", label: "Range challenges", max: 250, how: "Points from challenges you've solved on the Range. First solves earn a bonus." },
  { key: "events", label: "Events", max: 100, how: "Hackathons, bootcamps and pitch nights you attended." },
] as const;
export type IndexPart = (typeof INDEX_PARTS)[number]["key"];

export const TIERS = [
  { name: "Platinum", min: 750, className: "text-sky-300 ring-sky-400/50 bg-sky-400/10" },
  { name: "Gold", min: 550, className: "text-gold-300 ring-gold-400/50 bg-gold-400/10" },
  { name: "Silver", min: 350, className: "text-slate-200 ring-slate-300/40 bg-slate-300/10" },
  { name: "Bronze", min: 0, className: "text-[#e7a77a] ring-[#c97a45]/50 bg-[#c97a45]/10" },
] as const;
export const tierFor = (score: number) => TIERS.find((t) => score >= t.min)!;

export type IndexRow = {
  userId: string;
  orgId: string;
  org: string;
  /** Public name: the company if it agreed to be showcased, otherwise an anonymous handle. */
  display: string;
  public: boolean;
  district: string;
  sector: string;
  verified: boolean;
  parts: Record<IndexPart, number>;
  score: number;
  rank: number;
  tier: (typeof TIERS)[number]["name"];
  solves: number;
  bestIdea?: { id: string; title: string; status: string };
};

const PROGRESS_POINTS = { submitted: 40, screened: 110, committee: 180, awarded: 250 };

function handle(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `Innovator #${String(h % 9000 + 1000)}`;
}

/** Computes the Index for every innovator. Cached for the length of one request. */
export const getIndex = cache(async (): Promise<IndexRow[]> => {
  const [users, calls] = await Promise.all([
    prisma.user.findMany({
      where: { role: "INNOVATOR", anonymisedAt: null, orgId: { not: null } },
      include: {
        org: true,
        consents: { where: { purpose: "SHOWCASE" }, orderBy: { grantedAt: "desc" }, take: 1 },
        submissions: { where: { status: { not: "DRAFT" } }, include: { stage: true } },
        solves: { where: { status: "SOLVED" } },
        seats: { where: { attended: true }, include: { event: true } },
      },
    }),
    prisma.call.findMany({ select: { id: true } }),
  ]);
  const ranks = new Map<string, number>();
  for (const c of calls) for (const [id, r] of await callRanking(c.id)) ranks.set(id, r.normalised);

  const rows: IndexRow[] = users.map((u) => {
    let best = 0;
    let bestIdea: IndexRow["bestIdea"];
    let progress = 0;
    for (const s of u.submissions) {
      const n = ranks.get(s.id) ?? 0;
      if (n > best || !bestIdea) {
        best = Math.max(best, n);
        bestIdea = { id: s.id, title: s.title, status: s.status };
      }
      const order = s.stage?.order ?? 1;
      const p =
        s.status === "AWARDED" ? PROGRESS_POINTS.awarded : order >= 3 ? PROGRESS_POINTS.committee : order >= 2 ? PROGRESS_POINTS.screened : PROGRESS_POINTS.submitted;
      progress = Math.max(progress, p);
    }
    const parts = {
      panel: Math.round((best / 100) * 400),
      progress,
      range: Math.min(250, u.solves.reduce((a, s) => a + s.points, 0)),
      events: Math.min(100, u.seats.reduce((a, s) => a + s.event.bonus, 0)),
    };
    const score = parts.panel + parts.progress + parts.range + parts.events;
    const showcase = u.consents[0];
    const isPublic = !!showcase?.granted && !showcase.withdrawnAt && !u.restricted;
    return {
      userId: u.id,
      orgId: u.orgId!,
      org: u.org!.name,
      display: isPublic ? u.org!.name.replace(/\s*\(Pty\) Ltd\.?$/i, "") : handle(u.id),
      public: isPublic,
      district: u.org!.district,
      sector: u.org!.sector || "Not set",
      verified: u.org!.verified,
      parts,
      score,
      rank: 0,
      tier: tierFor(score).name,
      solves: u.solves.length,
      bestIdea,
    };
  });
  rows.sort((a, b) => b.score - a.score || b.parts.panel - a.parts.panel || a.org.localeCompare(b.org));
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
});

/** District league: average Index of each district's innovators, plus head count. */
export function districtLeague(rows: IndexRow[]) {
  const m = new Map<string, { district: string; total: number; count: number; top: number }>();
  for (const r of rows) {
    const d = m.get(r.district) ?? { district: r.district, total: 0, count: 0, top: 0 };
    d.total += r.score;
    d.count++;
    d.top = Math.max(d.top, r.score);
    m.set(r.district, d);
  }
  return [...m.values()]
    .map((d) => ({ ...d, avg: Math.round(d.total / d.count) }))
    .sort((a, b) => b.total - a.total);
}

/** Points earned for a solve. The first team to solve a challenge earns 20% more. */
export function solvePoints(base: number, first: boolean) {
  return first ? Math.round(base * 1.2) : base;
}
