import { Hono } from 'hono'
import {
  type AppEnv,
  requireAuth,
  audit,
  notify,
  notifyRole,
  sanitize,
  isStaff,
  isAdjudicatorOrAdmin,
  nextRefCode,
  addHistory,
  clientIp
} from '../lib/core'

const ideas = new Hono<AppEnv>()
ideas.use('*', requireAuth)

const IDEA_FIELDS = [
  'title',
  'summary',
  'problem',
  'solution',
  'target_beneficiaries',
  'impact',
  'business_model',
  'timeline',
  'team_description',
  'district',
  'tags'
] as const

function pickPayload(body: any) {
  const p: Record<string, unknown> = {}
  for (const f of IDEA_FIELDS) p[f] = sanitize(body[f], f === 'title' ? 200 : 6000)
  p.budget_estimate = body.budget_estimate !== undefined && body.budget_estimate !== '' ? Number(body.budget_estimate) : null
  p.category_id = body.category_id ? Number(body.category_id) : null
  p.is_confidential = body.is_confidential === false || body.is_confidential === 0 ? 0 : 1
  return p
}

function validateForSubmission(p: Record<string, any>): string[] {
  const errs: string[] = []
  if (!p.title || String(p.title).length < 5) errs.push('Title must be at least 5 characters')
  if (!p.summary || String(p.summary).length < 30) errs.push('Summary must be at least 30 characters')
  if (!p.problem) errs.push('Problem statement is required')
  if (!p.solution) errs.push('Proposed solution is required')
  if (!p.target_beneficiaries) errs.push('Target beneficiaries are required')
  if (!p.impact) errs.push('Expected impact is required')
  if (!p.business_model) errs.push('Business model is required')
  if (!p.team_description) errs.push('Team description is required')
  if (!p.category_id) errs.push('Please choose a category')
  if (p.budget_estimate !== null && (isNaN(p.budget_estimate) || p.budget_estimate < 0)) errs.push('Budget must be a positive number')
  return errs
}

/** Blind-review: strip submitter identity for evaluators when round is blind. */
function maskIdea(idea: any, viewerRole: string) {
  if (viewerRole === 'evaluator' && idea.blind_review) {
    const { submitter_name, submitter_email, submitter_org, team_description, ...rest } = idea
    return { ...rest, submitter_name: 'Anonymised (blind review)', team_description: '[Hidden during blind review]' }
  }
  return idea
}

async function canAccessIdea(c: any, ideaId: number) {
  const user = c.get('user')
  const idea = await c.env.DB.prepare(
    `SELECT i.*, u.name AS submitter_name, u.email AS submitter_email, u.organisation AS submitter_org,
            cat.name AS category_name, r.name AS round_name, r.slug AS round_slug, r.blind_review, r.stage_order
     FROM ideas i
     JOIN users u ON u.id = i.submitter_id
     LEFT JOIN categories cat ON cat.id = i.category_id
     LEFT JOIN rounds r ON r.id = i.current_round_id
     WHERE i.id = ?`
  )
    .bind(ideaId)
    .first<any>()
  if (!idea) return { idea: null, allowed: false }
  if (user.role === 'admin' || user.role === 'adjudicator') return { idea, allowed: true }
  if (user.id === idea.submitter_id) return { idea, allowed: true }
  if (user.role === 'evaluator') {
    const a = await c.env.DB.prepare(`SELECT id FROM assignments WHERE idea_id = ? AND evaluator_id = ?`)
      .bind(ideaId, user.id)
      .first()
    return { idea, allowed: !!a }
  }
  return { idea, allowed: false }
}

// GET /api/ideas  - list according to role
ideas.get('/', async (c) => {
  const user = c.get('user')
  const q = c.req.query()
  const where: string[] = []
  const params: unknown[] = []

  if (user.role === 'submitter') {
    where.push('i.submitter_id = ?')
    params.push(user.id)
  } else if (user.role === 'evaluator') {
    where.push('i.id IN (SELECT idea_id FROM assignments WHERE evaluator_id = ?)')
    params.push(user.id)
  } else {
    where.push(`i.stage != 'draft'`)
  }
  if (q.stage) {
    where.push('i.stage = ?')
    params.push(q.stage)
  }
  if (q.category_id) {
    where.push('i.category_id = ?')
    params.push(Number(q.category_id))
  }
  if (q.round_id) {
    where.push('i.current_round_id = ?')
    params.push(Number(q.round_id))
  }
  if (q.search) {
    where.push('(i.title LIKE ? OR i.summary LIKE ? OR i.ref_code LIKE ? OR i.tags LIKE ?)')
    const s = `%${q.search}%`
    params.push(s, s, s, s)
  }

  const sql = `
    SELECT i.id, i.ref_code, i.title, i.summary, i.stage, i.version, i.district, i.tags, i.budget_estimate,
           i.created_at, i.updated_at, i.submitted_at, i.category_id, i.current_round_id,
           cat.name AS category_name, cat.icon AS category_icon,
           r.name AS round_name, r.stage_order, r.blind_review,
           u.name AS submitter_name, u.organisation AS submitter_org,
           (SELECT COUNT(*) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id) AS assignments_total,
           (SELECT COUNT(*) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id AND a.status='completed') AS assignments_done,
           (SELECT ROUND(AVG(a.weighted_score),1) FROM assignments a WHERE a.idea_id = i.id AND a.round_id = i.current_round_id AND a.status='completed') AS avg_score,
           (SELECT COUNT(*) FROM feedback f WHERE f.idea_id = i.id AND (f.visibility='submitter' OR ? != 'submitter')) AS feedback_count
    FROM ideas i
    LEFT JOIN categories cat ON cat.id = i.category_id
    LEFT JOIN rounds r ON r.id = i.current_round_id
    JOIN users u ON u.id = i.submitter_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.updated_at DESC
    LIMIT 500`
  const { results } = await c.env.DB.prepare(sql).bind(user.role, ...params).all<any>()
  return c.json({ ideas: results.map((i) => maskIdea(i, user.role)) })
})

// POST /api/ideas - create (draft or submit)
ideas.post('/', async (c) => {
  const user = c.get('user')
  if (user.role !== 'submitter' && user.role !== 'admin') return c.json({ error: 'Only submitters can create ideas' }, 403)
  const open = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='submission_open'`).first<{ value: string }>()
  if (open?.value === '0') return c.json({ error: 'Submissions are currently closed' }, 400)

  const body = await c.req.json().catch(() => ({}))
  const p = pickPayload(body)
  const submit = body.submit === true
  if (!p.title) return c.json({ error: 'Title is required' }, 400)
  if (submit) {
    const errs = validateForSubmission(p)
    if (errs.length) return c.json({ error: 'Validation failed', details: errs }, 400)
  }

  const ref = await nextRefCode(c.env.DB)
  const firstRound = await c.env.DB.prepare(`SELECT id FROM rounds WHERE status='open' ORDER BY stage_order LIMIT 1`).first<{ id: number }>()
  const stage = submit ? 'submitted' : 'draft'
  const res = await c.env.DB.prepare(
    `INSERT INTO ideas (ref_code, title, summary, problem, solution, target_beneficiaries, impact, business_model,
       budget_estimate, timeline, team_description, district, tags, category_id, submitter_id, stage, current_round_id,
       is_confidential, submitted_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, ${submit ? "datetime('now')" : 'NULL'})`
  )
    .bind(
      ref,
      p.title,
      p.summary || '',
      p.problem,
      p.solution,
      p.target_beneficiaries,
      p.impact,
      p.business_model,
      p.budget_estimate,
      p.timeline,
      p.team_description,
      p.district,
      p.tags,
      p.category_id,
      user.id,
      stage,
      submit ? firstRound?.id || null : null,
      p.is_confidential
    )
    .run()
  const id = Number(res.meta.last_row_id)
  await c.env.DB.prepare(`INSERT INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES (?,?,?,?,?)`)
    .bind(id, 1, JSON.stringify(p), submit ? 'Initial submission' : 'Draft created', user.id)
    .run()
  await addHistory(c.env.DB, id, null, stage, submit ? firstRound?.id || null : null, user.id, submit ? 'Submitted via portal' : 'Draft created')
  await audit(c.env.DB, user.id, submit ? 'idea.submit' : 'idea.draft', 'idea', id, { ref }, clientIp(c))
  if (submit) {
    await notify(c.env.DB, user.id, 'stage', 'Submission received', `${ref} "${p.title}" has been received and is awaiting screening.`, `/app#/ideas/${id}`)
    await notifyRole(c.env.DB, 'admin', 'new_idea', 'New idea submitted', `${ref} "${p.title}" awaits evaluator assignment.`, `/app#/ideas/${id}`)
  }
  return c.json({ id, ref_code: ref, stage }, 201)
})

// GET /api/ideas/:id - detail with history, versions, assignments, decisions, feedback
ideas.get('/:id', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const { idea, allowed } = await canAccessIdea(c, id)
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (!allowed) return c.json({ error: 'Forbidden' }, 403)

  const db = c.env.DB
  const [history, versions, attachments, feedback, decisions, assignments] = await Promise.all([
    db
      .prepare(
        `SELECT h.*, u.name AS actor_name, r.name AS round_name FROM idea_stage_history h
         LEFT JOIN users u ON u.id = h.actor_id LEFT JOIN rounds r ON r.id = h.round_id
         WHERE h.idea_id = ? ORDER BY h.created_at ASC, h.id ASC`
      )
      .bind(id)
      .all<any>(),
    db.prepare(`SELECT id, version, change_note, created_at FROM idea_versions WHERE idea_id = ? ORDER BY version DESC`).bind(id).all<any>(),
    db.prepare(`SELECT * FROM idea_attachments WHERE idea_id = ? ORDER BY created_at`).bind(id).all<any>(),
    db
      .prepare(
        `SELECT f.*, u.name AS author_name, u.role AS author_role FROM feedback f JOIN users u ON u.id = f.author_id
         WHERE f.idea_id = ? ${user.role === 'submitter' ? "AND f.visibility = 'submitter'" : ''} ORDER BY f.created_at ASC`
      )
      .bind(id)
      .all<any>(),
    isStaff(user)
      ? db
          .prepare(
            `SELECT d.*, u.name AS decided_by_name, r.name AS round_name FROM decisions d JOIN users u ON u.id = d.decided_by
             LEFT JOIN rounds r ON r.id = d.round_id WHERE d.idea_id = ? ORDER BY d.created_at DESC`
          )
          .bind(id)
          .all<any>()
      : db
          .prepare(
            `SELECT d.id, d.decision, d.rationale, d.created_at, r.name AS round_name FROM decisions d
             LEFT JOIN rounds r ON r.id = d.round_id WHERE d.idea_id = ? ORDER BY d.created_at DESC`
          )
          .bind(id)
          .all<any>(),
    isAdjudicatorOrAdmin(user)
      ? db
          .prepare(
            `SELECT a.*, u.name AS evaluator_name, r.name AS round_name FROM assignments a JOIN users u ON u.id = a.evaluator_id
             JOIN rounds r ON r.id = a.round_id WHERE a.idea_id = ? ORDER BY a.round_id, a.assigned_at`
          )
          .bind(id)
          .all<any>()
      : user.role === 'evaluator'
        ? db
            .prepare(
              `SELECT a.*, r.name AS round_name FROM assignments a JOIN rounds r ON r.id = a.round_id
               WHERE a.idea_id = ? AND a.evaluator_id = ?`
            )
            .bind(id, user.id)
            .all<any>()
        : Promise.resolve({ results: [] as any[] })
  ])

  // Scores per assignment for adjudicators/admins
  let scores: any[] = []
  if (isAdjudicatorOrAdmin(user) && assignments.results.length) {
    const ids = assignments.results.map((a: any) => a.id)
    const { results } = await db
      .prepare(
        `SELECT s.*, c.name AS criterion_name, c.weight, c.max_score FROM scores s JOIN criteria c ON c.id = s.criterion_id
         WHERE s.assignment_id IN (${ids.map(() => '?').join(',')})`
      )
      .bind(...ids)
      .all<any>()
    scores = results
  }

  // Aggregate for current round
  const agg = await db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS done,
              ROUND(AVG(CASE WHEN status='completed' THEN weighted_score END),1) AS avg_score,
              SUM(CASE WHEN recommendation='advance' THEN 1 ELSE 0 END) AS rec_advance,
              SUM(CASE WHEN recommendation='revise' THEN 1 ELSE 0 END) AS rec_revise,
              SUM(CASE WHEN recommendation='reject' THEN 1 ELSE 0 END) AS rec_reject
       FROM assignments WHERE idea_id = ? AND round_id = ?`
    )
    .bind(id, idea.current_round_id || 0)
    .first<any>()

  const rounds = await db.prepare(`SELECT id, name, slug, stage_order, pass_threshold FROM rounds ORDER BY stage_order`).all<any>()
  const settings = await db.prepare(`SELECT key, value FROM settings`).all<any>()

  return c.json({
    idea: maskIdea(idea, user.role),
    history: history.results,
    versions: versions.results,
    attachments: attachments.results,
    feedback: feedback.results,
    decisions: decisions.results,
    assignments: assignments.results,
    scores,
    aggregate: agg,
    rounds: rounds.results,
    settings: Object.fromEntries(settings.results.map((s: any) => [s.key, s.value]))
  })
})

// PUT /api/ideas/:id - update draft or resubmit after revision request
ideas.put('/:id', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (idea.submitter_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  if (!['draft', 'revision_requested'].includes(idea.stage)) return c.json({ error: `Idea cannot be edited while ${idea.stage.replace('_', ' ')}` }, 400)

  const body = await c.req.json().catch(() => ({}))
  const p = pickPayload(body)
  const submit = body.submit === true
  if (submit) {
    const errs = validateForSubmission(p)
    if (errs.length) return c.json({ error: 'Validation failed', details: errs }, 400)
  }

  // resubmission limit
  if (submit && idea.stage === 'revision_requested') {
    const max = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='max_resubmissions'`).first<{ value: string }>()
    const limit = Number(max?.value || 2)
    if (idea.version - 1 >= limit) return c.json({ error: `Maximum of ${limit} resubmissions reached` }, 400)
  }

  const newVersion = submit ? idea.version + 1 : idea.version
  const nextStage = submit ? 'submitted' : idea.stage
  const firstRound = await c.env.DB.prepare(`SELECT id FROM rounds WHERE status='open' ORDER BY stage_order LIMIT 1`).first<{ id: number }>()
  const roundId = submit ? idea.current_round_id || firstRound?.id || null : idea.current_round_id

  await c.env.DB.prepare(
    `UPDATE ideas SET title=?, summary=?, problem=?, solution=?, target_beneficiaries=?, impact=?, business_model=?,
       budget_estimate=?, timeline=?, team_description=?, district=?, tags=?, category_id=?, is_confidential=?,
       version=?, stage=?, current_round_id=?, updated_at=datetime('now'),
       submitted_at = CASE WHEN ? = 1 THEN datetime('now') ELSE submitted_at END
     WHERE id=?`
  )
    .bind(
      p.title,
      p.summary || '',
      p.problem,
      p.solution,
      p.target_beneficiaries,
      p.impact,
      p.business_model,
      p.budget_estimate,
      p.timeline,
      p.team_description,
      p.district,
      p.tags,
      p.category_id,
      p.is_confidential,
      newVersion,
      nextStage,
      roundId,
      submit ? 1 : 0,
      id
    )
    .run()

  if (submit) {
    const note = sanitize(body.change_note, 1000) || (idea.stage === 'draft' ? 'Initial submission' : 'Resubmitted after revision request')
    await c.env.DB.prepare(`INSERT INTO idea_versions (idea_id, version, payload, change_note, created_by) VALUES (?,?,?,?,?)`)
      .bind(id, newVersion, JSON.stringify(p), note, user.id)
      .run()
    await addHistory(c.env.DB, id, idea.stage, 'submitted', roundId, user.id, note)
    await audit(c.env.DB, user.id, idea.stage === 'draft' ? 'idea.submit' : 'idea.resubmit', 'idea', id, { version: newVersion }, clientIp(c))
    await notify(c.env.DB, user.id, 'stage', idea.stage === 'draft' ? 'Submission received' : 'Resubmission received', `${idea.ref_code} v${newVersion} is now awaiting review.`, `/app#/ideas/${id}`)
    await notifyRole(c.env.DB, 'admin', 'new_idea', idea.stage === 'draft' ? 'New idea submitted' : 'Idea resubmitted', `${idea.ref_code} v${newVersion} "${p.title}"`, `/app#/ideas/${id}`)
    await notifyRole(c.env.DB, 'adjudicator', 'new_idea', idea.stage === 'draft' ? 'New idea submitted' : 'Idea resubmitted', `${idea.ref_code} v${newVersion} "${p.title}"`, `/app#/ideas/${id}`)
  } else {
    await audit(c.env.DB, user.id, 'idea.update', 'idea', id, null, clientIp(c))
  }
  return c.json({ ok: true, stage: nextStage, version: newVersion })
})

// POST /api/ideas/:id/withdraw
ideas.post('/:id/withdraw', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (idea.submitter_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  if (['awarded', 'rejected', 'withdrawn'].includes(idea.stage)) return c.json({ error: 'Idea is already closed' }, 400)
  await c.env.DB.prepare(`UPDATE ideas SET stage='withdrawn', updated_at=datetime('now'), decided_at=datetime('now') WHERE id=?`).bind(id).run()
  await addHistory(c.env.DB, id, idea.stage, 'withdrawn', idea.current_round_id, user.id, 'Withdrawn by submitter')
  await audit(c.env.DB, user.id, 'idea.withdraw', 'idea', id)
  return c.json({ ok: true })
})

// DELETE /api/ideas/:id - drafts only
ideas.delete('/:id', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (idea.submitter_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  if (idea.stage !== 'draft') return c.json({ error: 'Only drafts can be deleted' }, 400)
  await c.env.DB.prepare(`DELETE FROM ideas WHERE id=?`).bind(id).run()
  await audit(c.env.DB, user.id, 'idea.delete', 'idea', id)
  return c.json({ ok: true })
})

// GET /api/ideas/:id/versions/:v
ideas.get('/:id/versions/:v', async (c) => {
  const id = Number(c.req.param('id'))
  const v = Number(c.req.param('v'))
  const { idea, allowed } = await canAccessIdea(c, id)
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (!allowed) return c.json({ error: 'Forbidden' }, 403)
  const row = await c.env.DB.prepare(`SELECT * FROM idea_versions WHERE idea_id=? AND version=?`).bind(id, v).first<any>()
  if (!row) return c.json({ error: 'Version not found' }, 404)
  return c.json({ version: { ...row, payload: JSON.parse(row.payload) } })
})

// Attachments (links to supporting documents / pitch decks)
ideas.post('/:id/attachments', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (idea.submitter_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json().catch(() => ({}))
  const filename = sanitize(body.filename, 200)
  const url = sanitize(body.url, 1000)
  if (!filename || !url || !/^https?:\/\//.test(url)) return c.json({ error: 'A name and a valid https URL are required' }, 400)
  const res = await c.env.DB.prepare(`INSERT INTO idea_attachments (idea_id, filename, url, kind) VALUES (?,?,?,?)`)
    .bind(id, filename, url, sanitize(body.kind, 40) || 'link')
    .run()
  await audit(c.env.DB, user.id, 'attachment.add', 'idea', id, { filename })
  return c.json({ id: res.meta.last_row_id }, 201)
})

ideas.delete('/:id/attachments/:aid', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id = ?`).bind(id).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (idea.submitter_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  await c.env.DB.prepare(`DELETE FROM idea_attachments WHERE id=? AND idea_id=?`).bind(Number(c.req.param('aid')), id).run()
  return c.json({ ok: true })
})

// Feedback thread
ideas.post('/:id/feedback', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const { idea, allowed } = await canAccessIdea(c, id)
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (!allowed) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json().catch(() => ({}))
  const text = sanitize(body.body, 4000)
  if (!text) return c.json({ error: 'Feedback body is required' }, 400)
  let visibility = body.visibility === 'internal' ? 'internal' : 'submitter'
  if (user.role === 'submitter') visibility = 'submitter'
  const parentId = body.parent_id ? Number(body.parent_id) : null
  const res = await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility, parent_id) VALUES (?,?,?,?,?)`)
    .bind(id, user.id, text, visibility, parentId)
    .run()
  await audit(c.env.DB, user.id, 'feedback.add', 'idea', id, { visibility })

  if (visibility === 'submitter' && user.id !== idea.submitter_id) {
    await notify(c.env.DB, idea.submitter_id, 'feedback', 'New feedback on your idea', `${idea.ref_code}: ${text.slice(0, 120)}`, `/app#/ideas/${id}`)
  } else if (user.id === idea.submitter_id) {
    // notify staff involved
    const { results } = await c.env.DB.prepare(
      `SELECT DISTINCT author_id AS id FROM feedback WHERE idea_id = ? AND author_id != ?
       UNION SELECT DISTINCT evaluator_id FROM assignments WHERE idea_id = ?
       UNION SELECT DISTINCT decided_by FROM decisions WHERE idea_id = ?`
    )
      .bind(id, user.id, id, id)
      .all<{ id: number }>()
    for (const r of results) await notify(c.env.DB, r.id, 'feedback', 'Submitter replied', `${idea.ref_code}: ${text.slice(0, 120)}`, `/app#/ideas/${id}`)
  }
  return c.json({ id: res.meta.last_row_id }, 201)
})

export default ideas
