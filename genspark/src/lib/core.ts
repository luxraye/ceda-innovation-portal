import type { Context, MiddlewareHandler } from 'hono'

export type Role = 'submitter' | 'evaluator' | 'adjudicator' | 'admin'

export type Bindings = { DB: D1Database }
export type User = {
  id: number
  email: string
  name: string
  role: Role
  organisation?: string | null
  district?: string | null
  expertise?: string | null
  phone?: string | null
}
export type Variables = { user: User }
export type AppEnv = { Bindings: Bindings; Variables: Variables }

// ---------------------------------------------------------------------------
// Crypto helpers (Web Crypto only - Workers compatible)
// ---------------------------------------------------------------------------
const enc = new TextEncoder()

export function randomHex(bytes = 16): string {
  const arr = new Uint8Array(bytes)
  crypto.getRandomValues(arr)
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    key,
    256
  )
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------
export const SESSION_TTL_HOURS = 12

export function getToken(c: Context): string | null {
  const auth = c.req.header('Authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookie = c.req.header('Cookie') || ''
  const m = cookie.match(/(?:^|;\s*)ceda_session=([^;]+)/)
  return m ? decodeURIComponent(m[1]) : null
}

export async function userFromToken(db: D1Database, token: string | null): Promise<User | null> {
  if (!token) return null
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.organisation, u.district, u.expertise, u.phone
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now') AND u.is_active = 1`
    )
    .bind(token)
    .first<User>()
  return row || null
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await userFromToken(c.env.DB, getToken(c))
  if (!user) return c.json({ error: 'Authentication required' }, 401)
  c.set('user', user)
  await next()
}

export const requireRole = (...roles: Role[]): MiddlewareHandler<AppEnv> => {
  return async (c, next) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Authentication required' }, 401)
    if (!roles.includes(user.role)) {
      return c.json({ error: `Forbidden: requires role ${roles.join(' or ')}` }, 403)
    }
    await next()
  }
}

export const isStaff = (u: User) => ['evaluator', 'adjudicator', 'admin'].includes(u.role)
export const isAdjudicatorOrAdmin = (u: User) => ['adjudicator', 'admin'].includes(u.role)

// ---------------------------------------------------------------------------
// Audit & notifications
// ---------------------------------------------------------------------------
export async function audit(
  db: D1Database,
  actorId: number | null,
  action: string,
  entityType?: string,
  entityId?: number | null,
  meta?: unknown,
  ip?: string | null
) {
  await db
    .prepare(`INSERT INTO audit_log (actor_id, action, entity_type, entity_id, meta, ip) VALUES (?,?,?,?,?,?)`)
    .bind(actorId, action, entityType || null, entityId ?? null, meta ? JSON.stringify(meta) : null, ip || null)
    .run()
}

export async function notify(
  db: D1Database,
  userId: number,
  type: string,
  title: string,
  body?: string,
  link?: string
) {
  await db
    .prepare(`INSERT INTO notifications (user_id, type, title, body, link) VALUES (?,?,?,?,?)`)
    .bind(userId, type, title, body || null, link || null)
    .run()
}

export async function notifyRole(db: D1Database, role: Role, type: string, title: string, body?: string, link?: string) {
  const { results } = await db.prepare(`SELECT id FROM users WHERE role = ? AND is_active = 1`).bind(role).all<{ id: number }>()
  for (const r of results) await notify(db, r.id, type, title, body, link)
}

export function clientIp(c: Context): string | null {
  return c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || null
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export function sanitize(s: unknown, max = 5000): string | null {
  if (s === undefined || s === null) return null
  const str = String(s).trim()
  return str.length ? str.slice(0, max) : null
}

export const STAGES = [
  'draft',
  'submitted',
  'under_review',
  'revision_requested',
  'approved',
  'awarded',
  'rejected',
  'withdrawn'
] as const
export type Stage = (typeof STAGES)[number]

export async function nextRefCode(db: D1Database): Promise<string> {
  const year = new Date().getFullYear()
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM ideas`).first<{ n: number }>()
  const n = (row?.n || 0) + 1
  return `CEDA-${year}-${String(n).padStart(4, '0')}`
}

export async function addHistory(
  db: D1Database,
  ideaId: number,
  from: string | null,
  to: string,
  roundId: number | null,
  actorId: number | null,
  note?: string | null
) {
  await db
    .prepare(`INSERT INTO idea_stage_history (idea_id, from_stage, to_stage, round_id, actor_id, note) VALUES (?,?,?,?,?,?)`)
    .bind(ideaId, from, to, roundId, actorId, note || null)
    .run()
}

/** Compute the weighted percentage score for an assignment from its criterion scores. */
export async function computeWeightedScore(db: D1Database, assignmentId: number): Promise<number | null> {
  const row = await db
    .prepare(
      `SELECT SUM(s.score * c.weight) AS num, SUM(c.max_score * c.weight) AS den
       FROM scores s JOIN criteria c ON c.id = s.criterion_id
       WHERE s.assignment_id = ?`
    )
    .bind(assignmentId)
    .first<{ num: number | null; den: number | null }>()
  if (!row || !row.den) return null
  return Math.round(((row.num || 0) / row.den) * 1000) / 10
}
