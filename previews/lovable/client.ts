// Preview build only: an in-browser stand-in for the Supabase client, with seeded demo data.
// Data lives in this browser's localStorage, so every visitor starts from the same demo state.
/* eslint-disable @typescript-eslint/no-explicit-any */
const KEY = "ceda_lovable_preview_v1";
const SKEY = "ceda_lovable_preview_session_v1";
const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
const now = () => new Date().toISOString();
const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const DEMO_USERS = [
  { id: "00000000-0000-0000-0000-000000000001", email: "naledi@demo.ceda.bw", full_name: "Naledi Sebego", role: "submitter", company_name: "Morogo Ventures (Pty) Ltd" },
  { id: "00000000-0000-0000-0000-000000000002", email: "evaluator@demo.ceda.bw", full_name: "Dr Thabo Kgosi", role: "evaluator", company_name: null },
  { id: "00000000-0000-0000-0000-000000000003", email: "panel@demo.ceda.bw", full_name: "Lesego Molefe", role: "adjudicator", company_name: null },
  { id: "00000000-0000-0000-0000-000000000004", email: "admin@demo.ceda.bw", full_name: "Kagiso Dintwe", role: "admin", company_name: null },
];

function seed() {
  const U = DEMO_USERS;
  const criteria = [
    ["Innovation & Originality", "Novelty of the idea and its differentiation from existing solutions", 25],
    ["Market Potential", "Size of addressable market and commercial viability in Botswana and beyond", 20],
    ["Socio-economic Impact", "Job creation, SDG alignment and contribution to national transformation", 20],
    ["Technical Feasibility", "Ability of the team to build, scale and secure the solution", 20],
    ["Team Capability", "Youth ownership, skills mix and execution track record", 15],
  ].map(([name, description, weight], i) => ({ id: "c" + (i + 1), name, description, weight, max_score: 10, active: true, sort: i + 1 }));
  const mk = (n: number, title: string, category: string, problem: string, solution: string, impact: string, target_market: string, company_name: string, youth: number, team: number, stage: string, sub: number | null, created: number) => ({
    id: "i" + n, owner_id: U[0].id, title, category, problem, solution, impact, target_market, company_name, youth_shareholding: youth, team_size: team, stage,
    submitted_at: sub == null ? null : ago(sub), avg_score: null as number | null, created_at: ago(created), updated_at: ago(sub ?? created), reference: "CEDA-" + (100000 + n * 7919).toString(36).toUpperCase().slice(0, 6),
  });
  const ideas = [
    mk(1, "Morogo Fresh — cold-chain for smallholder farmers", "Agritech", "Smallholder vegetable farmers lose up to 40% of produce post-harvest due to lack of cold storage.", "Solar-powered modular cold rooms with mobile booking and buyer marketplace. A pilot with 30 farmers in Mahalapye is running.", "Reduce waste, raise farmer incomes and create 120 rural jobs.", "Smallholder farmers in Central & Kgatleng", "Morogo Ventures (Pty) Ltd", 80, 4, "evaluation", 6, 9),
    mk(2, "PulaPay Micro-ledger for informal traders", "Fintech", "Informal traders lack credit histories and cannot access CEDA loans.", "USSD bookkeeping that builds a verifiable credit score from daily sales.", "Unlock financing for 10,000 street vendors within two years.", "Informal sector traders nationally", "Kgotla Digital", 100, 3, "adjudication", 8, 12),
    mk(3, "Thuto AI — Setswana tutoring assistant", "Edtech", "Learners in rural schools have limited access to after-hours tutoring.", "Offline-first AI tutor delivering the BGCSE syllabus in Setswana and English.", "Improve pass rates in Maths and Science across 50 schools.", "Junior and senior secondary learners", "Thuto Labs", 67, 5, "submitted", 1, 3),
    mk(4, "Kalahari Craft Exchange", "Creative Industries", "Basket weavers in remote villages cannot reach international buyers.", "E-commerce storefront with logistics pooling and artisan provenance certificates.", "Increase artisan income by 3x and preserve cultural heritage.", "Global buyers of authentic crafts", "Lefatshe Creative", 90, 2, "approved", 10, 14),
    mk(5, "WaterWise Smart Meters", "Cleantech", "Municipal water losses exceed 30% due to undetected leaks.", "LoRa-connected meters with leak-detection analytics dashboards.", "Save millions of litres annually for Water Utilities Corporation.", "Municipal councils and utilities", "Metsi Tech", 55, 6, "screening", 2, 5),
    mk(6, "Mophane Protein Snacks", "Manufacturing", "Mophane worm harvests are sold raw at low prices with no value addition.", "", "", "", "Naledi Foods", 100, 2, "draft", null, 1),
    mk(7, "SafeRide Gaborone", "Logistics", "Commuters lack safe, tracked evening transport between Gaborone and surrounding villages.", "Licensed combi operators on a booking app with live tracking and cashless fares.", "Safer travel for 5,000 daily commuters and higher operator earnings.", "Commuters in Greater Gaborone", "Tsamaya Mobility", 75, 4, "revision_requested", 7, 11),
  ];
  const evPath: Record<string, string[]> = { i1: ["submitted", "screening", "evaluation"], i2: ["submitted", "screening", "evaluation", "adjudication"], i3: ["submitted"], i4: ["submitted", "screening", "evaluation", "adjudication", "approved"], i5: ["submitted", "screening"], i7: ["submitted", "screening", "revision_requested"] };
  const idea_events: any[] = [];
  for (const [iid, path] of Object.entries(evPath)) {
    const idea = ideas.find((i) => i.id === iid)!;
    const base = new Date(idea.submitted_at!).getTime();
    path.forEach((st, k) => idea_events.push({ id: uid(), idea_id: iid, actor_id: k === 0 ? U[0].id : k < 3 ? U[1].id : U[2].id, from_stage: k ? path[k - 1] : "draft", to_stage: st, note: k === 0 ? "Idea submitted" : st === "revision_requested" ? "Please add operator licensing details and a fare model." : `Moved to ${st}`, created_at: new Date(base + k * 86400000 * 0.9).toISOString() }));
  }
  const scores: any[] = [];
  const sc: Record<string, number[]> = { i1: [8, 7, 9, 7, 8], i2: [9, 8, 8, 7, 9], i4: [8, 9, 8, 8, 7] };
  for (const [iid, arr] of Object.entries(sc)) arr.forEach((s, k) => scores.push({ id: uid(), idea_id: iid, evaluator_id: U[1].id, criterion_id: criteria[k].id, score: s, comment: k === 0 ? "Clear differentiation from existing options." : null, created_at: ago(3) }));
  const feedback = [
    { id: uid(), idea_id: "i7", author_id: U[1].id, author_name: U[1].full_name, is_staff: true, message: "Promising idea. Please add how operators are licensed and your proposed fare model, then resubmit.", created_at: ago(4) },
    { id: uid(), idea_id: "i7", author_id: U[0].id, author_name: U[0].full_name, is_staff: false, message: "Thank you. We are confirming the licensing route with the Department of Road Transport and will update this week.", created_at: ago(3) },
    { id: uid(), idea_id: "i2", author_id: U[2].id, author_name: U[2].full_name, is_staff: true, message: "Strong evaluation scores. The committee will decide at the next sitting.", created_at: ago(1) },
  ];
  const profiles = U.map((u, k) => ({ id: u.id, email: u.email, full_name: u.full_name, company_name: u.company_name, phone: k === 0 ? "+267 71 234 567" : null, age: k === 0 ? 27 : null, youth_shareholding: k === 0 ? 80 : null, created_at: ago(30 - k) }));
  const user_roles = U.map((u) => ({ id: uid(), user_id: u.id, role: u.role }));
  const db: any = { criteria, ideas, idea_events, scores, feedback, profiles, user_roles };
  for (const i of ideas) recompute(db, i.id);
  return db;
}

function recompute(db: any, ideaId: string) {
  const idea = db.ideas.find((i: any) => i.id === ideaId);
  if (!idea) return;
  const rows = db.scores.filter((s: any) => s.idea_id === ideaId);
  if (!rows.length) { idea.avg_score = null; return; }
  let num = 0, w = 0;
  for (const s of rows) { const c = db.criteria.find((c: any) => c.id === s.criterion_id); if (!c) continue; num += (s.score / c.max_score) * c.weight; w += c.weight; }
  idea.avg_score = w ? Math.round((num / w) * 1000) / 10 : null;
}

let DB: any;
function load() {
  if (DB) return DB;
  try { const s = localStorage.getItem(KEY); if (s) DB = JSON.parse(s); } catch { /* ignore */ }
  if (!DB) DB = seed();
  return DB;
}
const listeners = new Set<() => void>();
function save() { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch { /* ignore */ } listeners.forEach((f) => setTimeout(f, 0)); }

// ---- auth ----
type Sess = { access_token: string; refresh_token: string; expires_at: number; token_type: string; user: any } | null;
function sessFor(u: any): Sess {
  return { access_token: "preview-" + u.id, refresh_token: "preview", token_type: "bearer", expires_at: Math.floor(Date.now() / 1000) + 86400 * 30, user: { id: u.id, email: u.email, aud: "authenticated", role: "authenticated", user_metadata: { full_name: u.full_name }, app_metadata: {}, created_at: ago(30) } };
}
let session: Sess = null;
try { const s = localStorage.getItem(SKEY); if (s) session = JSON.parse(s); } catch { /* ignore */ }
// ?as=<role> signs in as that demo user (used by the preview role switcher)
try {
  const as = new URLSearchParams(location.search).get("as");
  if (as) {
    const u = DEMO_USERS.find((d) => d.role === as);
    if (u) session = sessFor(u);
    const url = new URL(location.href); url.searchParams.delete("as"); history.replaceState(history.state, "", url.toString());
    localStorage.setItem(SKEY, JSON.stringify(session));
  }
} catch { /* ignore */ }
const authCbs = new Set<(e: string, s: Sess) => void>();
function setSess(s: Sess, ev: string) {
  session = s;
  try { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); } catch { /* ignore */ }
  authCbs.forEach((cb) => setTimeout(() => cb(ev, s), 0));
}
const me = () => session?.user?.id as string | undefined;
const rolesOf = (id?: string) => load().user_roles.filter((r: any) => r.user_id === id).map((r: any) => r.role);
const isStaff = (id?: string) => rolesOf(id).some((r: string) => r !== "submitter");

const auth = {
  async getSession() { return { data: { session }, error: null }; },
  async getUser() { return { data: { user: session?.user ?? null }, error: null }; },
  async getClaims() { return { data: session ? { claims: { sub: session.user.id, email: session.user.email } } : null, error: null }; },
  onAuthStateChange(cb: (e: string, s: Sess) => void) { authCbs.add(cb); setTimeout(() => cb("INITIAL_SESSION", session), 0); return { data: { subscription: { unsubscribe: () => authCbs.delete(cb) } } }; },
  async setSession() { return { data: { session }, error: null }; },
  async signInWithPassword({ email }: { email: string; password: string }) {
    const db = load();
    let p = db.profiles.find((x: any) => (x.email || "").toLowerCase() === email.toLowerCase());
    if (!p) return { data: { session: null, user: null }, error: { message: "Use a demo account: naledi@, evaluator@, panel@ or admin@demo.ceda.bw (any password)." } };
    const s = sessFor(p); setSess(s, "SIGNED_IN");
    return { data: { session: s, user: s!.user }, error: null };
  },
  async signUp({ email, options }: any) {
    const db = load();
    const id = uid();
    const full_name = options?.data?.full_name ?? email;
    db.profiles.push({ id, email, full_name, company_name: null, phone: null, age: null, youth_shareholding: null, created_at: now() });
    db.user_roles.push({ id: uid(), user_id: id, role: "submitter" });
    save();
    const s = sessFor({ id, email, full_name }); setSess(s, "SIGNED_IN");
    return { data: { session: s, user: s!.user }, error: null };
  },
  async signOut() { setSess(null, "SIGNED_OUT"); return { error: null }; },
};

// ---- query builder ----
function visible(table: string, rows: any[]) {
  const id = me(); const staff = isStaff(id);
  if (!id) return [];
  const db = load();
  const canSeeIdea = (iid: string) => { const i = db.ideas.find((x: any) => x.id === iid); return i && (staff || i.owner_id === id); };
  if (table === "ideas") return rows.filter((r) => staff || r.owner_id === id);
  if (table === "idea_events" || table === "feedback") return rows.filter((r) => canSeeIdea(r.idea_id));
  if (table === "scores") return staff ? rows : [];
  if (table === "profiles") return staff ? rows : rows.filter((r) => r.id === id);
  if (table === "user_roles") return staff ? rows : rows.filter((r) => r.user_id === id);
  return rows;
}
function pick(row: any, cols: string) {
  if (!cols || cols.trim() === "*") return { ...row };
  const o: any = {};
  for (const c of cols.split(",").map((s) => s.trim()).filter(Boolean)) o[c] = row[c];
  return o;
}
const DEFAULTS: Record<string, () => any> = {
  ideas: () => ({ id: uid(), stage: "draft", created_at: now(), updated_at: now(), submitted_at: null, avg_score: null, reference: "CEDA-" + Math.random().toString(36).slice(2, 8).toUpperCase(), category: "Other", problem: "", solution: "", impact: "", target_market: "", company_name: "", team_size: 1, youth_shareholding: 100 }),
  feedback: () => ({ id: uid(), created_at: now(), is_staff: isStaff(me()), author_name: null }),
  scores: () => ({ id: uid(), created_at: now(), comment: null }),
  criteria: () => ({ id: uid(), active: true, description: "", max_score: 10, sort: 99, weight: 10 }),
  idea_events: () => ({ id: uid(), created_at: now(), note: null, from_stage: null, actor_id: me() ?? null }),
  user_roles: () => ({ id: uid() }),
  profiles: () => ({ created_at: now() }),
};

class Q implements PromiseLike<any> {
  private filters: ((r: any) => boolean)[] = [];
  private orders: [string, boolean][] = [];
  private lim?: number;
  private cols = "*";
  private mode: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any;
  private conflict?: string;
  private one: "single" | "maybe" | null = null;
  private returning = false;
  constructor(private table: string) {}
  select(cols = "*") { this.cols = cols; if (this.mode !== "select") this.returning = true; return this; }
  insert(v: any) { this.mode = "insert"; this.payload = v; return this; }
  update(v: any) { this.mode = "update"; this.payload = v; return this; }
  delete() { this.mode = "delete"; return this; }
  upsert(v: any, o?: { onConflict?: string }) { this.mode = "upsert"; this.payload = v; this.conflict = o?.onConflict; return this; }
  eq(c: string, v: any) { this.filters.push((r) => r[c] === v); return this; }
  neq(c: string, v: any) { this.filters.push((r) => r[c] !== v); return this; }
  in(c: string, v: any[]) { this.filters.push((r) => v.includes(r[c])); return this; }
  is(c: string, v: any) { this.filters.push((r) => (r[c] ?? null) === v); return this; }
  gte(c: string, v: any) { this.filters.push((r) => r[c] >= v); return this; }
  lte(c: string, v: any) { this.filters.push((r) => r[c] <= v); return this; }
  gt(c: string, v: any) { this.filters.push((r) => r[c] > v); return this; }
  lt(c: string, v: any) { this.filters.push((r) => r[c] < v); return this; }
  ilike(c: string, v: string) { const re = new RegExp("^" + v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*") + "$", "i"); this.filters.push((r) => re.test(String(r[c] ?? ""))); return this; }
  order(c: string, o?: { ascending?: boolean }) { this.orders.push([c, o?.ascending ?? true]); return this; }
  limit(n: number) { this.lim = n; return this; }
  range(a: number, b: number) { this.lim = b + 1; this.filters.push(() => true); void a; return this; }
  single() { this.one = "single"; return this; }
  maybeSingle() { this.one = "maybe"; return this; }
  private exec(): { data: any; error: any } {
    const db = load();
    const tbl: any[] = db[this.table] ?? (db[this.table] = []);
    const match = (r: any) => this.filters.every((f) => f(r));
    let out: any[] = [];
    if (this.mode === "select") {
      out = visible(this.table, tbl).filter(match);
      for (const [c, asc] of [...this.orders].reverse()) out.sort((a, b) => (a[c] === b[c] ? 0 : (a[c] ?? "") > (b[c] ?? "") ? (asc ? 1 : -1) : asc ? -1 : 1));
      if (this.lim != null) out = out.slice(0, this.lim);
      out = out.map((r) => pick(r, this.cols));
    } else if (this.mode === "insert" || this.mode === "upsert") {
      if (!me()) return { data: null, error: { message: "Please sign in first." } };
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const keys = (this.conflict ?? "id").split(",").map((s) => s.trim());
      for (const r of rows) {
        const existing = this.mode === "upsert" ? tbl.find((t) => keys.every((k) => r[k] !== undefined && t[k] === r[k])) : undefined;
        if (existing) { Object.assign(existing, r); out.push(existing); }
        else { const row = { ...(DEFAULTS[this.table]?.() ?? { id: uid() }), ...r }; tbl.push(row); out.push(row); }
      }
    } else if (this.mode === "update") {
      out = visible(this.table, tbl).filter(match);
      out.forEach((r) => Object.assign(r, this.payload));
    } else if (this.mode === "delete") {
      out = visible(this.table, tbl).filter(match);
      db[this.table] = tbl.filter((r) => !out.includes(r));
      if (this.table === "ideas") for (const t of ["idea_events", "feedback", "scores"]) db[t] = db[t].filter((r: any) => !out.some((o) => o.id === r.idea_id));
    }
    if (this.mode !== "select") {
      if (this.table === "scores") new Set(out.map((r) => r.idea_id)).forEach((i) => recompute(db, i as string));
      if (this.table === "criteria") db.ideas.forEach((i: any) => recompute(db, i.id));
      save();
      out = this.returning ? out.map((r) => pick(r, this.cols)) : out;
      if (!this.returning && !this.one) return { data: null, error: null };
    }
    if (this.one) {
      if (out.length === 0) return this.one === "maybe" ? { data: null, error: null } : { data: null, error: { message: "No rows found" } };
      return { data: out[0], error: null };
    }
    return { data: out, error: null };
  }
  then<A, B>(res?: ((v: any) => A | PromiseLike<A>) | null, rej?: ((e: any) => B | PromiseLike<B>) | null) {
    return new Promise((r) => setTimeout(() => r(this.exec()), 60)).then(res, rej);
  }
}

async function rpc(name: string, a: any) {
  const db = load(); const id = me(); const roles = rolesOf(id);
  const err = (message: string) => ({ data: null, error: { message } });
  const event = (idea_id: string, from: string, to: string, note: string) => db.idea_events.push({ id: uid(), idea_id, actor_id: id, from_stage: from, to_stage: to, note, created_at: now() });
  if (name === "submit_idea") {
    const i = db.ideas.find((x: any) => x.id === a._idea_id);
    if (!i || i.owner_id !== id) return err("Not your idea");
    if (!["draft", "revision_requested"].includes(i.stage)) return err("Idea cannot be submitted from this stage");
    const L = (s: string) => (s || "").trim().length;
    if (!L(i.title) || L(i.problem) < 20 || L(i.solution) < 20 || L(i.impact) < 10 || !L(i.company_name)) return err("All mandatory fields must be completed");
    if (i.youth_shareholding <= 50) return err("Youth shareholding must be more than 50%");
    const from = i.stage;
    Object.assign(i, { stage: "submitted", submitted_at: i.submitted_at ?? now(), updated_at: now() });
    event(i.id, from, "submitted", from === "revision_requested" ? "Resubmitted after revision" : "Idea submitted");
    save(); return { data: null, error: null };
  }
  if (name === "advance_idea") {
    const i = db.ideas.find((x: any) => x.id === a._idea_id);
    if (!i) return err("Not found");
    const to = a._to;
    const ok = roles.includes("admin") ||
      (roles.includes("evaluator") && ["submitted", "screening", "evaluation"].includes(i.stage) && ["screening", "evaluation", "adjudication", "revision_requested", "rejected"].includes(to)) ||
      (roles.includes("adjudicator") && ["adjudication", "approved"].includes(i.stage) && ["approved", "awarded", "rejected", "revision_requested", "evaluation"].includes(to));
    if (!ok) return err(`Your role cannot move this idea to ${to}`);
    const from = i.stage; Object.assign(i, { stage: to, updated_at: now() });
    event(i.id, from, to, a._note); save(); return { data: null, error: null };
  }
  if (name === "set_user_role") {
    if (!roles.includes("admin")) return err("Admins only");
    if (a._grant) { if (!db.user_roles.some((r: any) => r.user_id === a._user_id && r.role === a._role)) db.user_roles.push({ id: uid(), user_id: a._user_id, role: a._role }); }
    else db.user_roles = db.user_roles.filter((r: any) => !(r.user_id === a._user_id && r.role === a._role));
    save(); return { data: null, error: null };
  }
  if (name === "has_role") return { data: rolesOf(a._user_id).includes(a._role), error: null };
  return err("Unknown function " + name);
}

function channel() {
  const ch: any = {
    on: (_t: string, _f: any, cb: () => void) => { listeners.add(cb); (ch._cbs ||= []).push(cb); return ch; },
    subscribe: () => ch,
    unsubscribe: () => { (ch._cbs || []).forEach((c: any) => listeners.delete(c)); },
  };
  return ch;
}

export const supabase: any = {
  auth,
  from: (t: string) => new Q(t),
  rpc,
  channel,
  removeChannel: (ch: any) => ch?.unsubscribe?.(),
  storage: { from: () => ({ upload: async () => ({ data: null, error: { message: "Uploads are off in the preview" } }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
};
export function __resetPreview() { localStorage.removeItem(KEY); localStorage.removeItem(SKEY); location.reload(); }
