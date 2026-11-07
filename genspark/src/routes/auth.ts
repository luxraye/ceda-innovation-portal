import { Hono } from 'hono'
import {
  type AppEnv,
  hashPassword,
  randomHex,
  timingSafeEqual,
  SESSION_TTL_HOURS,
  getToken,
  userFromToken,
  audit,
  clientIp,
  sanitize,
  requireAuth
} from '../lib/core'

const auth = new Hono<AppEnv>()

function sessionCookie(token: string, maxAgeSeconds: number) {
  return `ceda_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}`
}

// POST /api/auth/register  (public self-registration always creates a submitter)
auth.post('/register', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const email = sanitize(body.email, 200)?.toLowerCase()
  const password = String(body.password || '')
  const name = sanitize(body.name, 120)
  const organisation = sanitize(body.organisation, 200)
  const district = sanitize(body.district, 100)
  const phone = sanitize(body.phone, 40)

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return c.json({ error: 'A valid email is required' }, 400)
  if (!name) return c.json({ error: 'Full name is required' }, 400)
  if (password.length < 8) return c.json({ error: 'Password must be at least 8 characters' }, 400)
  if (!body.consent) return c.json({ error: 'You must accept the Data Protection notice' }, 400)

  const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(email).first()
  if (exists) return c.json({ error: 'An account with this email already exists' }, 409)

  const salt = randomHex(16)
  const hash = await hashPassword(password, salt)
  const res = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, salt, name, role, organisation, district, phone) VALUES (?,?,?,?,'submitter',?,?,?)`
  )
    .bind(email, hash, salt, name, organisation, district, phone)
    .run()
  const userId = Number(res.meta.last_row_id)
  await audit(c.env.DB, userId, 'auth.register', 'user', userId, { email }, clientIp(c))

  // auto-login
  const token = randomHex(32)
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString()
  await c.env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, user_agent) VALUES (?,?,?,?)`)
    .bind(token, userId, expires, c.req.header('User-Agent') || null)
    .run()
  const user = await userFromToken(c.env.DB, token)
  c.header('Set-Cookie', sessionCookie(token, SESSION_TTL_HOURS * 3600))
  return c.json({ token, user }, 201)
})

// POST /api/auth/login
auth.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const email = sanitize(body.email, 200)?.toLowerCase()
  const password = String(body.password || '')
  if (!email || !password) return c.json({ error: 'Email and password are required' }, 400)

  const row = await c.env.DB.prepare(`SELECT id, password_hash, salt, is_active FROM users WHERE email = ?`)
    .bind(email)
    .first<{ id: number; password_hash: string; salt: string; is_active: number }>()

  // Always hash to keep timing roughly constant
  const candidate = await hashPassword(password, row?.salt || 'nosalt')
  if (!row || !row.is_active || !timingSafeEqual(candidate, row.password_hash)) {
    await audit(c.env.DB, row?.id || null, 'auth.login_failed', 'user', row?.id || null, { email }, clientIp(c))
    return c.json({ error: 'Invalid email or password' }, 401)
  }

  const token = randomHex(32)
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString()
  await c.env.DB.batch([
    c.env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, user_agent) VALUES (?,?,?,?)`).bind(
      token,
      row.id,
      expires,
      c.req.header('User-Agent') || null
    ),
    c.env.DB.prepare(`UPDATE users SET last_login_at = datetime('now') WHERE id = ?`).bind(row.id),
    c.env.DB.prepare(`DELETE FROM sessions WHERE expires_at < datetime('now')`)
  ])
  await audit(c.env.DB, row.id, 'auth.login', 'user', row.id, null, clientIp(c))
  const user = await userFromToken(c.env.DB, token)
  c.header('Set-Cookie', sessionCookie(token, SESSION_TTL_HOURS * 3600))
  return c.json({ token, user })
})

// POST /api/auth/logout
auth.post('/logout', async (c) => {
  const token = getToken(c)
  if (token) await c.env.DB.prepare(`DELETE FROM sessions WHERE token = ?`).bind(token).run()
  c.header('Set-Cookie', sessionCookie('', 0))
  return c.json({ ok: true })
})

// GET /api/auth/me
auth.get('/me', requireAuth, async (c) => {
  const user = c.get('user')
  const unread = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0`)
    .bind(user.id)
    .first<{ n: number }>()
  return c.json({ user, unread: unread?.n || 0 })
})

// PUT /api/auth/profile
auth.put('/profile', requireAuth, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const name = sanitize(body.name, 120) || user.name
  const organisation = sanitize(body.organisation, 200)
  const district = sanitize(body.district, 100)
  const phone = sanitize(body.phone, 40)
  const expertise = sanitize(body.expertise, 300)
  await c.env.DB.prepare(`UPDATE users SET name=?, organisation=?, district=?, phone=?, expertise=? WHERE id=?`)
    .bind(name, organisation, district, phone, expertise, user.id)
    .run()
  await audit(c.env.DB, user.id, 'profile.update', 'user', user.id)
  return c.json({ ok: true })
})

// PUT /api/auth/password
auth.put('/password', requireAuth, async (c) => {
  const user = c.get('user')
  const body = await c.req.json().catch(() => ({}))
  const current = String(body.current || '')
  const next = String(body.next || '')
  if (next.length < 8) return c.json({ error: 'New password must be at least 8 characters' }, 400)
  const row = await c.env.DB.prepare(`SELECT password_hash, salt FROM users WHERE id = ?`)
    .bind(user.id)
    .first<{ password_hash: string; salt: string }>()
  if (!row || !timingSafeEqual(await hashPassword(current, row.salt), row.password_hash)) {
    return c.json({ error: 'Current password is incorrect' }, 400)
  }
  const salt = randomHex(16)
  const hash = await hashPassword(next, salt)
  await c.env.DB.prepare(`UPDATE users SET password_hash=?, salt=? WHERE id=?`).bind(hash, salt, user.id).run()
  await audit(c.env.DB, user.id, 'auth.password_change', 'user', user.id)
  return c.json({ ok: true })
})

export default auth
