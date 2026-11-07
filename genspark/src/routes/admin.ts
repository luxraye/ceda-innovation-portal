import { Hono } from 'hono'
import { type AppEnv, requireAuth, requireRole, audit, hashPassword, randomHex, sanitize, notify, clientIp } from '../lib/core'

const admin = new Hono<AppEnv>()
admin.use('*', requireAuth)

// ---------------------------------------------------------------------------
// Public-ish reference data (any authenticated user)
// ---------------------------------------------------------------------------
admin.get('/categories', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT cat.*, (SELECT COUNT(*) FROM ideas i WHERE i.category_id = cat.id AND i.stage != 'draft') AS idea_count FROM categories cat ORDER BY name`
  ).all<any>()
  return c.json({ categories: results })
})

admin.get('/settings', async (c) => {
  const { results } = await c.env.DB.prepare(`SELECT key, value FROM settings`).all<any>()
  return c.json({ settings: Object.fromEntries(results.map((r) => [r.key, r.value])) })
})

admin.get('/evaluators', requireRole('admin', 'adjudicator'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.role, u.expertise, u.organisation,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = u.id AND a.status IN ('pending','in_progress')) AS open_assignments,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = u.id AND a.status='completed') AS completed_assignments
     FROM users u WHERE u.role IN ('evaluator','adjudicator') AND u.is_active = 1 ORDER BY u.name`
  ).all<any>()
  return c.json({ evaluators: results })
})

// ---------------------------------------------------------------------------
// Admin-only management
// ---------------------------------------------------------------------------
admin.post('/categories', requireRole('admin'), async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const name = sanitize(b.name, 120)
  if (!name) return c.json({ error: 'Name is required' }, 400)
  const res = await c.env.DB.prepare(`INSERT INTO categories (name, description, strategic_priority, icon) VALUES (?,?,?,?)`)
    .bind(name, sanitize(b.description, 500), sanitize(b.strategic_priority, 200), sanitize(b.icon, 60) || 'fa-lightbulb')
    .run()
  await audit(c.env.DB, c.get('user').id, 'category.create', 'category', Number(res.meta.last_row_id))
  return c.json({ id: res.meta.last_row_id }, 201)
})

admin.put('/categories/:id', requireRole('admin'), async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json().catch(() => ({}))
  const cat = await c.env.DB.prepare(`SELECT * FROM categories WHERE id=?`).bind(id).first<any>()
  if (!cat) return c.json({ error: 'Not found' }, 404)
  await c.env.DB.prepare(`UPDATE categories SET name=?, description=?, strategic_priority=?, icon=?, is_active=? WHERE id=?`)
    .bind(
      sanitize(b.name, 120) || cat.name,
      b.description !== undefined ? sanitize(b.description, 500) : cat.description,
      b.strategic_priority !== undefined ? sanitize(b.strategic_priority, 200) : cat.strategic_priority,
      sanitize(b.icon, 60) || cat.icon,
      b.is_active !== undefined ? (b.is_active ? 1 : 0) : cat.is_active,
      id
    )
    .run()
  return c.json({ ok: true })
})

admin.put('/settings', requireRole('admin'), async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const allowed = ['programme_name', 'submission_open', 'submission_deadline', 'contact_email', 'max_resubmissions']
  const stmts: D1PreparedStatement[] = []
  for (const k of allowed) {
    if (b[k] !== undefined) {
      stmts.push(c.env.DB.prepare(`INSERT INTO settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).bind(k, String(b[k])))
    }
  }
  if (stmts.length) await c.env.DB.batch(stmts)
  await audit(c.env.DB, c.get('user').id, 'settings.update', 'settings', null, b)
  return c.json({ ok: true })
})

// Users
admin.get('/users', requireRole('admin'), async (c) => {
  const q = c.req.query()
  const where: string[] = []
  const params: unknown[] = []
  if (q.role) {
    where.push('role = ?')
    params.push(q.role)
  }
  if (q.search) {
    where.push('(name LIKE ? OR email LIKE ? OR organisation LIKE ?)')
    params.push(`%${q.search}%`, `%${q.search}%`, `%${q.search}%`)
  }
  const { results } = await c.env.DB.prepare(
    `SELECT id, email, name, role, organisation, district, expertise, is_active, created_at, last_login_at,
            (SELECT COUNT(*) FROM ideas i WHERE i.submitter_id = users.id) AS idea_count,
            (SELECT COUNT(*) FROM assignments a WHERE a.evaluator_id = users.id) AS assignment_count
     FROM users ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT 500`
  )
    .bind(...params)
    .all<any>()
  return c.json({ users: results })
})

admin.post('/users', requireRole('admin'), async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const email = sanitize(b.email, 200)?.toLowerCase()
  const name = sanitize(b.name, 120)
  const role = ['submitter', 'evaluator', 'adjudicator', 'admin'].includes(b.role) ? b.role : 'evaluator'
  const password = String(b.password || '')
  if (!email || !name) return c.json({ error: 'Email and name are required' }, 400)
  if (password.length < 8) return c.json({ error: 'Temporary password must be at least 8 characters' }, 400)
  const exists = await c.env.DB.prepare(`SELECT id FROM users WHERE email=?`).bind(email).first()
  if (exists) return c.json({ error: 'Email already in use' }, 409)
  const salt = randomHex(16)
  const hash = await hashPassword(password, salt)
  const res = await c.env.DB.prepare(
    `INSERT INTO users (email, password_hash, salt, name, role, organisation, district, expertise) VALUES (?,?,?,?,?,?,?,?)`
  )
    .bind(email, hash, salt, name, role, sanitize(b.organisation, 200), sanitize(b.district, 100), sanitize(b.expertise, 300))
    .run()
  const id = Number(res.meta.last_row_id)
  await audit(c.env.DB, c.get('user').id, 'user.create', 'user', id, { role }, clientIp(c))
  await notify(c.env.DB, id, 'welcome', 'Welcome to the CEDA Innovation Portal', `Your ${role} account has been created. Please change your password in Profile.`, '/app#/profile')
  return c.json({ id }, 201)
})

admin.put('/users/:id', requireRole('admin'), async (c) => {
  const id = Number(c.req.param('id'))
  const me = c.get('user')
  const b = await c.req.json().catch(() => ({}))
  const u = await c.env.DB.prepare(`SELECT * FROM users WHERE id=?`).bind(id).first<any>()
  if (!u) return c.json({ error: 'User not found' }, 404)
  const role = ['submitter', 'evaluator', 'adjudicator', 'admin'].includes(b.role) ? b.role : u.role
  const isActive = b.is_active !== undefined ? (b.is_active ? 1 : 0) : u.is_active
  if (id === me.id && (role !== 'admin' || !isActive)) return c.json({ error: 'You cannot demote or deactivate your own account' }, 400)
  await c.env.DB.prepare(`UPDATE users SET name=?, role=?, organisation=?, district=?, expertise=?, is_active=? WHERE id=?`)
    .bind(
      sanitize(b.name, 120) || u.name,
      role,
      b.organisation !== undefined ? sanitize(b.organisation, 200) : u.organisation,
      b.district !== undefined ? sanitize(b.district, 100) : u.district,
      b.expertise !== undefined ? sanitize(b.expertise, 300) : u.expertise,
      isActive,
      id
    )
    .run()
  if (b.password && String(b.password).length >= 8) {
    const salt = randomHex(16)
    const hash = await hashPassword(String(b.password), salt)
    await c.env.DB.prepare(`UPDATE users SET password_hash=?, salt=? WHERE id=?`).bind(hash, salt, id).run()
    await c.env.DB.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id).run()
  }
  if (!isActive) await c.env.DB.prepare(`DELETE FROM sessions WHERE user_id=?`).bind(id).run()
  await audit(c.env.DB, me.id, 'user.update', 'user', id, { role, isActive }, clientIp(c))
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Analytics dashboard
// ---------------------------------------------------------------------------
admin.get('/analytics', requireRole('admin', 'adjudicator', 'evaluator'), async (c) => {
  const db = c.env.DB
  const [byStage, byCategory, byRound, byDistrict, timeline, evaluators, kpis, recent, scoreDist] = await Promise.all([
    db.prepare(`SELECT stage, COUNT(*) AS n FROM ideas GROUP BY stage`).all<any>(),
    db
      .prepare(
        `SELECT cat.name, cat.icon, COUNT(i.id) AS n, ROUND(AVG(a.weighted_score),1) AS avg_score
         FROM categories cat LEFT JOIN ideas i ON i.category_id = cat.id AND i.stage != 'draft'
         LEFT JOIN assignments a ON a.idea_id = i.id AND a.status='completed'
         GROUP BY cat.id ORDER BY n DESC`
      )
      .all<any>(),
    db
      .prepare(
        `SELECT r.name, r.stage_order, COUNT(i.id) AS n FROM rounds r LEFT JOIN ideas i ON i.current_round_id = r.id AND i.stage IN ('submitted','under_review','revision_requested')
         GROUP BY r.id ORDER BY r.stage_order`
      )
      .all<any>(),
    db.prepare(`SELECT COALESCE(district,'Unspecified') AS district, COUNT(*) AS n FROM ideas WHERE stage != 'draft' GROUP BY district ORDER BY n DESC LIMIT 10`).all<any>(),
    db.prepare(`SELECT DATE(submitted_at) AS day, COUNT(*) AS n FROM ideas WHERE submitted_at IS NOT NULL GROUP BY day ORDER BY day`).all<any>(),
    db
      .prepare(
        `SELECT u.name, COUNT(a.id) AS total, SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed,
                ROUND(AVG(CASE WHEN a.status='completed' THEN a.weighted_score END),1) AS avg_score
         FROM users u LEFT JOIN assignments a ON a.evaluator_id = u.id WHERE u.role IN ('evaluator','adjudicator') AND u.is_active=1
         GROUP BY u.id ORDER BY total DESC`
      )
      .all<any>(),
    db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM ideas WHERE stage != 'draft') AS total_submissions,
           (SELECT COUNT(*) FROM ideas WHERE stage IN ('submitted','under_review')) AS in_pipeline,
           (SELECT COUNT(*) FROM ideas WHERE stage = 'revision_requested') AS awaiting_revision,
           (SELECT COUNT(*) FROM ideas WHERE stage IN ('approved','awarded')) AS approved,
           (SELECT COUNT(*) FROM ideas WHERE stage = 'rejected') AS rejected,
           (SELECT COUNT(*) FROM users WHERE role='submitter') AS submitters,
           (SELECT COUNT(*) FROM users WHERE role IN ('evaluator','adjudicator')) AS evaluators,
           (SELECT COUNT(*) FROM assignments WHERE status IN ('pending','in_progress')) AS open_assignments,
           (SELECT COUNT(*) FROM assignments WHERE status = 'completed') AS completed_assignments,
           (SELECT ROUND(AVG(weighted_score),1) FROM assignments WHERE status='completed') AS avg_score,
           (SELECT COALESCE(SUM(budget_estimate),0) FROM ideas WHERE stage != 'draft') AS total_budget_requested,
           (SELECT COUNT(*) FROM feedback) AS feedback_items,
           (SELECT ROUND(AVG((julianday(completed_at) - julianday(assigned_at)) * 24),1) FROM assignments WHERE status='completed' AND completed_at IS NOT NULL) AS avg_turnaround_hours`
      )
      .first<any>(),
    db
      .prepare(
        `SELECT l.action, l.entity_type, l.entity_id, l.created_at, u.name AS actor_name, l.meta
         FROM audit_log l LEFT JOIN users u ON u.id = l.actor_id ORDER BY l.created_at DESC, l.id DESC LIMIT 15`
      )
      .all<any>(),
    db
      .prepare(
        `SELECT CASE WHEN weighted_score >= 80 THEN '80-100' WHEN weighted_score >= 60 THEN '60-79' WHEN weighted_score >= 40 THEN '40-59' ELSE '0-39' END AS bucket, COUNT(*) AS n
         FROM assignments WHERE status='completed' GROUP BY bucket`
      )
      .all<any>()
  ])

  // leaderboard: top ideas by average score
  const leaderboard = await db
    .prepare(
      `SELECT i.id, i.ref_code, i.title, i.stage, cat.name AS category_name, ROUND(AVG(a.weighted_score),1) AS avg_score, COUNT(a.id) AS evaluations
       FROM ideas i JOIN assignments a ON a.idea_id = i.id AND a.status='completed' LEFT JOIN categories cat ON cat.id=i.category_id
       WHERE i.stage NOT IN ('draft','withdrawn') GROUP BY i.id ORDER BY avg_score DESC LIMIT 10`
    )
    .all<any>()

  return c.json({
    kpis,
    by_stage: byStage.results,
    by_category: byCategory.results,
    by_round: byRound.results,
    by_district: byDistrict.results,
    timeline: timeline.results,
    evaluators: evaluators.results,
    recent_activity: recent.results,
    score_distribution: scoreDist.results,
    leaderboard: leaderboard.results
  })
})

// Audit log
admin.get('/audit', requireRole('admin'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT l.*, u.name AS actor_name, u.email AS actor_email FROM audit_log l LEFT JOIN users u ON u.id = l.actor_id ORDER BY l.created_at DESC, l.id DESC LIMIT 300`
  ).all<any>()
  return c.json({ audit: results })
})

// ---------------------------------------------------------------------------
// Reports (CSV export)
// ---------------------------------------------------------------------------
function toCsv(rows: any[]): string {
  if (!rows.length) return ''
  const cols = Object.keys(rows[0])
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [cols.join(','), ...rows.map((r) => cols.map((col) => esc(r[col])).join(','))].join('\n')
}

admin.get('/reports/:type', requireRole('admin', 'adjudicator'), async (c) => {
  const type = c.req.param('type')
  let rows: any[] = []
  if (type === 'ideas') {
    rows = (
      await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, i.stage, i.version, cat.name AS category, r.name AS current_round, i.district, i.budget_estimate,
                u.name AS submitter, u.email AS submitter_email, u.organisation,
                (SELECT ROUND(AVG(weighted_score),1) FROM assignments a WHERE a.idea_id=i.id AND a.status='completed') AS avg_score,
                (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.status='completed') AS evaluations,
                i.submitted_at, i.updated_at
         FROM ideas i LEFT JOIN categories cat ON cat.id=i.category_id LEFT JOIN rounds r ON r.id=i.current_round_id JOIN users u ON u.id=i.submitter_id
         WHERE i.stage != 'draft' ORDER BY i.ref_code`
      ).all<any>()
    ).results
  } else if (type === 'scores') {
    rows = (
      await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, r.name AS round, u.name AS evaluator, cr.name AS criterion, cr.weight, cr.max_score, s.score, s.comment,
                a.weighted_score, a.recommendation, a.completed_at
         FROM scores s JOIN assignments a ON a.id=s.assignment_id JOIN ideas i ON i.id=a.idea_id JOIN rounds r ON r.id=a.round_id
         JOIN users u ON u.id=a.evaluator_id JOIN criteria cr ON cr.id=s.criterion_id ORDER BY i.ref_code, r.stage_order, u.name, cr.sort_order`
      ).all<any>()
    ).results
  } else if (type === 'decisions') {
    rows = (
      await c.env.DB.prepare(
        `SELECT i.ref_code, i.title, r.name AS round, d.decision, d.aggregate_score, d.rationale, u.name AS decided_by, d.created_at
         FROM decisions d JOIN ideas i ON i.id=d.idea_id LEFT JOIN rounds r ON r.id=d.round_id JOIN users u ON u.id=d.decided_by ORDER BY d.created_at DESC`
      ).all<any>()
    ).results
  } else if (type === 'evaluators') {
    rows = (
      await c.env.DB.prepare(
        `SELECT u.name, u.email, u.expertise, COUNT(a.id) AS assigned, SUM(CASE WHEN a.status='completed' THEN 1 ELSE 0 END) AS completed,
                ROUND(AVG(CASE WHEN a.status='completed' THEN a.weighted_score END),1) AS avg_score
         FROM users u LEFT JOIN assignments a ON a.evaluator_id=u.id WHERE u.role IN ('evaluator','adjudicator') GROUP BY u.id ORDER BY u.name`
      ).all<any>()
    ).results
  } else {
    return c.json({ error: 'Unknown report. Use ideas | scores | decisions | evaluators' }, 400)
  }
  await audit(c.env.DB, c.get('user').id, 'report.export', 'report', null, { type })
  if (c.req.query('format') === 'json') return c.json({ rows })
  return new Response(toCsv(rows), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ceda-${type}-${new Date().toISOString().slice(0, 10)}.csv"`
    }
  })
})

// ---------------------------------------------------------------------------
// Notifications (all users)
// ---------------------------------------------------------------------------
admin.get('/notifications', async (c) => {
  const user = c.get('user')
  const { results } = await c.env.DB.prepare(`SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC, id DESC LIMIT 50`).bind(user.id).all<any>()
  const unread = results.filter((n) => !n.is_read).length
  return c.json({ notifications: results, unread })
})

admin.post('/notifications/read', async (c) => {
  const user = c.get('user')
  const b = await c.req.json().catch(() => ({}))
  if (Array.isArray(b.ids) && b.ids.length) {
    await c.env.DB.prepare(`UPDATE notifications SET is_read=1 WHERE user_id=? AND id IN (${b.ids.map(() => '?').join(',')})`)
      .bind(user.id, ...b.ids.map(Number))
      .run()
  } else {
    await c.env.DB.prepare(`UPDATE notifications SET is_read=1 WHERE user_id=?`).bind(user.id).run()
  }
  return c.json({ ok: true })
})

export default admin
