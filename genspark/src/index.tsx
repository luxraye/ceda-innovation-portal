import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import type { AppEnv } from './lib/core'
import authRoutes from './routes/auth'
import ideaRoutes from './routes/ideas'
import evaluationRoutes from './routes/evaluation'
import adminRoutes from './routes/admin'
import { landingPage, appShell } from './pages'

const app = new Hono<AppEnv>()

app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))

// Security headers
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'SAMEORIGIN')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
})

// API
app.route('/api/auth', authRoutes)
app.route('/api/ideas', ideaRoutes)
app.route('/api/evaluation', evaluationRoutes)
app.route('/api', adminRoutes)

app.get('/api/health', async (c) => {
  try {
    const row = await c.env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>()
    return c.json({ status: 'ok', db: 'connected', users: row?.n ?? 0, time: new Date().toISOString() })
  } catch (e: any) {
    return c.json({ status: 'degraded', db: 'unavailable', error: e.message }, 503)
  }
})

// Public stats for landing page
app.get('/api/public/stats', async (c) => {
  const row = await c.env.DB.prepare(
    `SELECT (SELECT COUNT(*) FROM ideas WHERE stage != 'draft') AS submissions,
            (SELECT COUNT(*) FROM users WHERE role='submitter') AS innovators,
            (SELECT COUNT(*) FROM categories WHERE is_active=1) AS categories,
            (SELECT COUNT(*) FROM ideas WHERE stage IN ('approved','awarded')) AS approved`
  ).first<any>()
  const { results: cats } = await c.env.DB.prepare(`SELECT name, description, icon FROM categories WHERE is_active=1 ORDER BY name`).all<any>()
  const { results: settings } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<any>()
  return c.json({ stats: row, categories: cats, settings: Object.fromEntries(settings.map((s: any) => [s.key, s.value])) })
})

app.notFound((c) => {
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Not found' }, 404)
  return c.html(landingPage(), 404)
})

app.onError((err, c) => {
  console.error(err)
  if (c.req.path.startsWith('/api/')) return c.json({ error: 'Internal server error', detail: err.message }, 500)
  return c.text('Internal server error', 500)
})

// Pages
app.get('/', (c) => c.html(landingPage()))
app.get('/app', (c) => c.html(appShell()))

export default app
