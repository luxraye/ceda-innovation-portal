import { Hono } from 'hono'
import {
  type AppEnv,
  requireAuth,
  requireRole,
  audit,
  notify,
  sanitize,
  addHistory,
  computeWeightedScore,
  clientIp
} from '../lib/core'

const ev = new Hono<AppEnv>()
ev.use('*', requireAuth)

// ---------------------------------------------------------------------------
// Rounds & criteria (read for all staff; write for admin)
// ---------------------------------------------------------------------------
ev.get('/rounds', async (c) => {
  const { results: rounds } = await c.env.DB.prepare(`SELECT * FROM rounds ORDER BY stage_order`).all<any>()
  const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria ORDER BY round_id, sort_order`).all<any>()
  return c.json({
    rounds: rounds.map((r) => ({ ...r, criteria: criteria.filter((cr) => cr.round_id === r.id) }))
  })
})

ev.post('/rounds', requireRole('admin'), async (c) => {
  const b = await c.req.json().catch(() => ({}))
  const name = sanitize(b.name, 120)
  if (!name) return c.json({ error: 'Round name is required' }, 400)
  const slug = (sanitize(b.slug, 60) || name).toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const maxOrder = await c.env.DB.prepare(`SELECT COALESCE(MAX(stage_order),0) AS m FROM rounds`).first<{ m: number }>()
  const res = await c.env.DB.prepare(
    `INSERT INTO rounds (name, slug, stage_order, description, min_evaluators, pass_threshold, blind_review, status) VALUES (?,?,?,?,?,?,?,?)`
  )
    .bind(
      name,
      slug,
      Number(b.stage_order) || (maxOrder?.m || 0) + 1,
      sanitize(b.description, 1000),
      Number(b.min_evaluators) || 2,
      Number(b.pass_threshold) || 60,
      b.blind_review === false ? 0 : 1,
      b.status === 'closed' ? 'closed' : 'open'
    )
    .run()
  await audit(c.env.DB, c.get('user').id, 'round.create', 'round', Number(res.meta.last_row_id))
  return c.json({ id: res.meta.last_row_id }, 201)
})

ev.put('/rounds/:id', requireRole('admin'), async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json().catch(() => ({}))
  const r = await c.env.DB.prepare(`SELECT * FROM rounds WHERE id=?`).bind(id).first<any>()
  if (!r) return c.json({ error: 'Round not found' }, 404)
  await c.env.DB.prepare(
    `UPDATE rounds SET name=?, description=?, min_evaluators=?, pass_threshold=?, blind_review=?, status=?, stage_order=? WHERE id=?`
  )
    .bind(
      sanitize(b.name, 120) || r.name,
      b.description !== undefined ? sanitize(b.description, 1000) : r.description,
      Number(b.min_evaluators) || r.min_evaluators,
      b.pass_threshold !== undefined ? Number(b.pass_threshold) : r.pass_threshold,
      b.blind_review !== undefined ? (b.blind_review ? 1 : 0) : r.blind_review,
      b.status === 'closed' || b.status === 'open' ? b.status : r.status,
      Number(b.stage_order) || r.stage_order,
      id
    )
    .run()
  await audit(c.env.DB, c.get('user').id, 'round.update', 'round', id)
  return c.json({ ok: true })
})

ev.post('/rounds/:id/criteria', requireRole('admin'), async (c) => {
  const roundId = Number(c.req.param('id'))
  const b = await c.req.json().catch(() => ({}))
  const name = sanitize(b.name, 120)
  if (!name) return c.json({ error: 'Criterion name is required' }, 400)
  const maxOrder = await c.env.DB.prepare(`SELECT COALESCE(MAX(sort_order),0) AS m FROM criteria WHERE round_id=?`).bind(roundId).first<{ m: number }>()
  const res = await c.env.DB.prepare(`INSERT INTO criteria (round_id, name, description, weight, max_score, sort_order) VALUES (?,?,?,?,?,?)`)
    .bind(roundId, name, sanitize(b.description, 500), Number(b.weight) || 1, Number(b.max_score) || 10, (maxOrder?.m || 0) + 1)
    .run()
  await audit(c.env.DB, c.get('user').id, 'criterion.create', 'criterion', Number(res.meta.last_row_id), { roundId })
  return c.json({ id: res.meta.last_row_id }, 201)
})

ev.put('/criteria/:id', requireRole('admin'), async (c) => {
  const id = Number(c.req.param('id'))
  const b = await c.req.json().catch(() => ({}))
  const cr = await c.env.DB.prepare(`SELECT * FROM criteria WHERE id=?`).bind(id).first<any>()
  if (!cr) return c.json({ error: 'Criterion not found' }, 404)
  await c.env.DB.prepare(`UPDATE criteria SET name=?, description=?, weight=?, max_score=?, sort_order=? WHERE id=?`)
    .bind(
      sanitize(b.name, 120) || cr.name,
      b.description !== undefined ? sanitize(b.description, 500) : cr.description,
      Number(b.weight) || cr.weight,
      Number(b.max_score) || cr.max_score,
      Number(b.sort_order) || cr.sort_order,
      id
    )
    .run()
  return c.json({ ok: true })
})

ev.delete('/criteria/:id', requireRole('admin'), async (c) => {
  const id = Number(c.req.param('id'))
  const used = await c.env.DB.prepare(`SELECT COUNT(*) AS n FROM scores WHERE criterion_id=?`).bind(id).first<{ n: number }>()
  if (used?.n) return c.json({ error: 'Criterion has scores and cannot be deleted' }, 400)
  await c.env.DB.prepare(`DELETE FROM criteria WHERE id=?`).bind(id).run()
  return c.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------
// GET /api/evaluation/assignments  - my queue (evaluator) or all (adjudicator/admin)
ev.get('/assignments', async (c) => {
  const user = c.get('user')
  const q = c.req.query()
  const where: string[] = []
  const params: unknown[] = []
  if (user.role === 'evaluator') {
    where.push('a.evaluator_id = ?')
    params.push(user.id)
  } else if (user.role === 'submitter') {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (q.status) {
    where.push('a.status = ?')
    params.push(q.status)
  }
  if (q.round_id) {
    where.push('a.round_id = ?')
    params.push(Number(q.round_id))
  }
  const sql = `
    SELECT a.*, i.ref_code, i.title, i.summary, i.stage, i.category_id, cat.name AS category_name, cat.icon AS category_icon,
           r.name AS round_name, r.blind_review, u.name AS evaluator_name,
           CASE WHEN r.blind_review = 1 AND ? = 'evaluator' THEN 'Anonymised' ELSE s.name END AS submitter_name
    FROM assignments a
    JOIN ideas i ON i.id = a.idea_id
    JOIN rounds r ON r.id = a.round_id
    JOIN users u ON u.id = a.evaluator_id
    JOIN users s ON s.id = i.submitter_id
    LEFT JOIN categories cat ON cat.id = i.category_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY CASE a.status WHEN 'pending' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END, a.assigned_at DESC`
  const { results } = await c.env.DB.prepare(sql).bind(user.role, ...params).all<any>()
  return c.json({ assignments: results })
})

// POST /api/evaluation/assignments  - assign evaluators (admin/adjudicator)
ev.post('/assignments', requireRole('admin', 'adjudicator'), async (c) => {
  const user = c.get('user')
  const b = await c.req.json().catch(() => ({}))
  const ideaId = Number(b.idea_id)
  const roundId = Number(b.round_id)
  const evaluatorIds: number[] = Array.isArray(b.evaluator_ids) ? b.evaluator_ids.map(Number) : [Number(b.evaluator_id)]
  const dueAt = sanitize(b.due_at, 40)
  if (!ideaId || !roundId || !evaluatorIds.filter(Boolean).length) return c.json({ error: 'idea_id, round_id and evaluator_ids are required' }, 400)

  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(ideaId).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (['draft', 'withdrawn', 'rejected', 'awarded'].includes(idea.stage)) return c.json({ error: `Cannot assign an idea in stage ${idea.stage}` }, 400)
  const round = await c.env.DB.prepare(`SELECT * FROM rounds WHERE id=?`).bind(roundId).first<any>()
  if (!round) return c.json({ error: 'Round not found' }, 404)

  const created: number[] = []
  for (const evId of evaluatorIds) {
    const evaluator = await c.env.DB.prepare(`SELECT id, name, role FROM users WHERE id=? AND is_active=1`).bind(evId).first<any>()
    if (!evaluator || !['evaluator', 'adjudicator', 'admin'].includes(evaluator.role)) continue
    if (evaluator.id === idea.submitter_id) continue // conflict of interest
    const res = await c.env.DB.prepare(
      `INSERT OR IGNORE INTO assignments (idea_id, round_id, evaluator_id, assigned_by, due_at) VALUES (?,?,?,?,?)`
    )
      .bind(ideaId, roundId, evId, user.id, dueAt)
      .run()
    if (res.meta.changes) {
      created.push(Number(res.meta.last_row_id))
      await notify(c.env.DB, evId, 'assignment', 'New evaluation assigned', `You have been assigned ${idea.ref_code} for ${round.name}.`, `/app#/evaluate/${res.meta.last_row_id}`)
      await audit(c.env.DB, user.id, 'assignment.create', 'assignment', Number(res.meta.last_row_id), { ideaId, evId, roundId }, clientIp(c))
    }
  }

  // Move idea into review for this round
  if (created.length && (idea.stage === 'submitted' || idea.current_round_id !== roundId)) {
    await c.env.DB.prepare(`UPDATE ideas SET stage='under_review', current_round_id=?, updated_at=datetime('now') WHERE id=?`).bind(roundId, ideaId).run()
    await addHistory(c.env.DB, ideaId, idea.stage, 'under_review', roundId, user.id, `Assigned to ${created.length} evaluator(s) for ${round.name}`)
    await notify(c.env.DB, idea.submitter_id, 'stage', 'Your idea is under review', `${idea.ref_code} is now being evaluated in ${round.name}.`, `/app#/ideas/${ideaId}`)
  }
  return c.json({ created: created.length, ids: created }, 201)
})

ev.delete('/assignments/:id', requireRole('admin', 'adjudicator'), async (c) => {
  const id = Number(c.req.param('id'))
  const a = await c.env.DB.prepare(`SELECT * FROM assignments WHERE id=?`).bind(id).first<any>()
  if (!a) return c.json({ error: 'Assignment not found' }, 404)
  if (a.status === 'completed') return c.json({ error: 'Completed assignments cannot be removed' }, 400)
  await c.env.DB.prepare(`DELETE FROM assignments WHERE id=?`).bind(id).run()
  await audit(c.env.DB, c.get('user').id, 'assignment.delete', 'assignment', id)
  return c.json({ ok: true })
})

// GET /api/evaluation/assignments/:id - scoring sheet
ev.get('/assignments/:id', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const a = await c.env.DB.prepare(
    `SELECT a.*, r.name AS round_name, r.blind_review, r.pass_threshold, u.name AS evaluator_name
     FROM assignments a JOIN rounds r ON r.id = a.round_id JOIN users u ON u.id = a.evaluator_id WHERE a.id=?`
  )
    .bind(id)
    .first<any>()
  if (!a) return c.json({ error: 'Assignment not found' }, 404)
  if (user.role === 'evaluator' && a.evaluator_id !== user.id) return c.json({ error: 'Forbidden' }, 403)
  if (user.role === 'submitter') return c.json({ error: 'Forbidden' }, 403)

  const idea = await c.env.DB.prepare(
    `SELECT i.*, cat.name AS category_name, u.name AS submitter_name, u.organisation AS submitter_org
     FROM ideas i LEFT JOIN categories cat ON cat.id=i.category_id JOIN users u ON u.id=i.submitter_id WHERE i.id=?`
  )
    .bind(a.idea_id)
    .first<any>()
  if (a.blind_review && user.role === 'evaluator') {
    idea.submitter_name = 'Anonymised (blind review)'
    idea.submitter_org = null
    idea.team_description = '[Hidden during blind review]'
  }
  const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria WHERE round_id=? ORDER BY sort_order`).bind(a.round_id).all<any>()
  const { results: scores } = await c.env.DB.prepare(`SELECT * FROM scores WHERE assignment_id=?`).bind(id).all<any>()
  const { results: attachments } = await c.env.DB.prepare(`SELECT * FROM idea_attachments WHERE idea_id=?`).bind(a.idea_id).all<any>()
  const { results: feedback } = await c.env.DB.prepare(
    `SELECT f.*, u.name AS author_name, u.role AS author_role FROM feedback f JOIN users u ON u.id=f.author_id WHERE f.idea_id=? ORDER BY f.created_at`
  )
    .bind(a.idea_id)
    .all<any>()

  // mark in progress on first open
  if (a.status === 'pending' && a.evaluator_id === user.id) {
    await c.env.DB.prepare(`UPDATE assignments SET status='in_progress' WHERE id=?`).bind(id).run()
    a.status = 'in_progress'
  }
  return c.json({ assignment: a, idea, criteria, scores, attachments, feedback })
})

// PUT /api/evaluation/assignments/:id  - save scores (draft or submit)
ev.put('/assignments/:id', async (c) => {
  const user = c.get('user')
  const id = Number(c.req.param('id'))
  const a = await c.env.DB.prepare(`SELECT a.*, r.name AS round_name, r.min_evaluators, r.pass_threshold FROM assignments a JOIN rounds r ON r.id=a.round_id WHERE a.id=?`)
    .bind(id)
    .first<any>()
  if (!a) return c.json({ error: 'Assignment not found' }, 404)
  if (a.evaluator_id !== user.id && user.role !== 'admin') return c.json({ error: 'Forbidden' }, 403)
  if (a.status === 'completed') return c.json({ error: 'This evaluation has already been submitted' }, 400)

  const b = await c.req.json().catch(() => ({}))
  const submit = b.submit === true
  const scores: { criterion_id: number; score: number; comment?: string }[] = Array.isArray(b.scores) ? b.scores : []
  const { results: criteria } = await c.env.DB.prepare(`SELECT * FROM criteria WHERE round_id=?`).bind(a.round_id).all<any>()

  // validate
  const stmts: D1PreparedStatement[] = []
  for (const s of scores) {
    const cr = criteria.find((x) => x.id === Number(s.criterion_id))
    if (!cr) continue
    const val = Number(s.score)
    if (isNaN(val) || val < 0 || val > cr.max_score) return c.json({ error: `Score for "${cr.name}" must be between 0 and ${cr.max_score}` }, 400)
    stmts.push(
      c.env.DB.prepare(
        `INSERT INTO scores (assignment_id, criterion_id, score, comment) VALUES (?,?,?,?)
         ON CONFLICT(assignment_id, criterion_id) DO UPDATE SET score=excluded.score, comment=excluded.comment`
      ).bind(id, cr.id, val, sanitize(s.comment, 1000))
    )
  }
  if (submit) {
    const scoredIds = new Set(scores.map((s) => Number(s.criterion_id)))
    const missing = criteria.filter((cr) => !scoredIds.has(cr.id))
    if (missing.length) return c.json({ error: `All criteria must be scored. Missing: ${missing.map((m) => m.name).join(', ')}` }, 400)
    if (!['advance', 'revise', 'reject'].includes(b.recommendation)) return c.json({ error: 'A recommendation (advance / revise / reject) is required' }, 400)
    if (!sanitize(b.overall_comment, 4000)) return c.json({ error: 'An overall comment is required to help the submitter improve' }, 400)
  }
  if (stmts.length) await c.env.DB.batch(stmts)

  const weighted = await computeWeightedScore(c.env.DB, id)
  await c.env.DB.prepare(
    `UPDATE assignments SET status=?, recommendation=?, overall_comment=?, conflict_note=?, weighted_score=?,
       completed_at = CASE WHEN ? = 1 THEN datetime('now') ELSE completed_at END WHERE id=?`
  )
    .bind(
      submit ? 'completed' : 'in_progress',
      submit ? b.recommendation : sanitize(b.recommendation, 20),
      sanitize(b.overall_comment, 4000),
      sanitize(b.conflict_note, 1000),
      weighted,
      submit ? 1 : 0,
      id
    )
    .run()
  await audit(c.env.DB, user.id, submit ? 'evaluation.submit' : 'evaluation.save', 'assignment', id, { weighted }, clientIp(c))

  if (submit) {
    const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(a.idea_id).first<any>()
    // Post the evaluator's overall comment to the submitter as constructive feedback (anonymous from evaluator)
    if (b.share_comment !== false) {
      await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility) VALUES (?,?,?,?)`)
        .bind(a.idea_id, user.id, `[${a.round_name} evaluator feedback] ${sanitize(b.overall_comment, 4000)}`, 'submitter')
        .run()
      await notify(c.env.DB, idea.submitter_id, 'feedback', 'New evaluator feedback', `${idea.ref_code}: an evaluator has shared feedback on your idea.`, `/app#/ideas/${a.idea_id}`)
    }
    // Notify adjudicators when quorum reached
    const agg = await c.env.DB.prepare(
      `SELECT COUNT(*) AS done, ROUND(AVG(weighted_score),1) AS avg FROM assignments WHERE idea_id=? AND round_id=? AND status='completed'`
    )
      .bind(a.idea_id, a.round_id)
      .first<any>()
    if (agg.done >= a.min_evaluators) {
      const { results: adj } = await c.env.DB.prepare(`SELECT id FROM users WHERE role IN ('adjudicator','admin') AND is_active=1`).all<{ id: number }>()
      for (const u of adj) {
        await notify(c.env.DB, u.id, 'quorum', 'Ready for adjudication', `${idea.ref_code} has ${agg.done} completed evaluations (avg ${agg.avg}%) in ${a.round_name}.`, `/app#/ideas/${a.idea_id}`)
      }
    }
  }
  return c.json({ ok: true, weighted_score: weighted, status: submit ? 'completed' : 'in_progress' })
})

// ---------------------------------------------------------------------------
// Adjudication decisions
// ---------------------------------------------------------------------------
// GET /api/evaluation/queue - adjudication queue with aggregates
ev.get('/queue', requireRole('admin', 'adjudicator'), async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT i.id, i.ref_code, i.title, i.stage, i.version, i.current_round_id, i.submitted_at, i.updated_at,
            cat.name AS category_name, r.name AS round_name, r.min_evaluators, r.pass_threshold, r.stage_order,
            u.name AS submitter_name,
            (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS assigned,
            (SELECT COUNT(*) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id AND a.status='completed') AS completed,
            (SELECT ROUND(AVG(weighted_score),1) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id AND a.status='completed') AS avg_score,
            (SELECT SUM(CASE WHEN recommendation='advance' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_advance,
            (SELECT SUM(CASE WHEN recommendation='revise' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_revise,
            (SELECT SUM(CASE WHEN recommendation='reject' THEN 1 ELSE 0 END) FROM assignments a WHERE a.idea_id=i.id AND a.round_id=i.current_round_id) AS rec_reject
     FROM ideas i
     LEFT JOIN categories cat ON cat.id=i.category_id
     LEFT JOIN rounds r ON r.id=i.current_round_id
     JOIN users u ON u.id=i.submitter_id
     WHERE i.stage IN ('submitted','under_review','approved')
     ORDER BY CASE WHEN i.stage='under_review' THEN 0 WHEN i.stage='submitted' THEN 1 ELSE 2 END, i.updated_at DESC`
  ).all<any>()
  return c.json({ queue: results })
})

// POST /api/evaluation/decisions
ev.post('/decisions', requireRole('admin', 'adjudicator'), async (c) => {
  const user = c.get('user')
  const b = await c.req.json().catch(() => ({}))
  const ideaId = Number(b.idea_id)
  const decision = String(b.decision)
  const rationale = sanitize(b.rationale, 4000)
  if (!ideaId || !['advance', 'revise', 'reject', 'approve', 'award'].includes(decision)) return c.json({ error: 'idea_id and a valid decision are required' }, 400)
  if (!rationale) return c.json({ error: 'A rationale is required for transparency' }, 400)

  const idea = await c.env.DB.prepare(`SELECT * FROM ideas WHERE id=?`).bind(ideaId).first<any>()
  if (!idea) return c.json({ error: 'Idea not found' }, 404)
  if (['draft', 'withdrawn', 'rejected', 'awarded'].includes(idea.stage)) return c.json({ error: `Idea in stage ${idea.stage} cannot receive a decision` }, 400)

  const agg = await c.env.DB.prepare(`SELECT ROUND(AVG(weighted_score),1) AS avg FROM assignments WHERE idea_id=? AND round_id=? AND status='completed'`)
    .bind(ideaId, idea.current_round_id || 0)
    .first<any>()
  const { results: rounds } = await c.env.DB.prepare(`SELECT * FROM rounds ORDER BY stage_order`).all<any>()
  const currentRound = rounds.find((r) => r.id === idea.current_round_id) || rounds[0]
  const nextRound = rounds.find((r) => r.stage_order > (currentRound?.stage_order || 0))

  let newStage = idea.stage
  let newRoundId = idea.current_round_id
  let title = ''
  let body = ''
  switch (decision) {
    case 'advance':
      if (nextRound) {
        newStage = 'submitted'
        newRoundId = nextRound.id
        title = `Advanced to ${nextRound.name}`
        body = `${idea.ref_code} has progressed to ${nextRound.name}.`
      } else {
        newStage = 'approved'
        title = 'Idea approved'
        body = `${idea.ref_code} has completed all evaluation rounds and is approved.`
      }
      break
    case 'revise':
      newStage = 'revision_requested'
      title = 'Revision requested'
      body = `${idea.ref_code}: please review the feedback and resubmit.`
      break
    case 'reject':
      newStage = 'rejected'
      title = 'Decision: not selected'
      body = `${idea.ref_code} was not selected to proceed. See the rationale for constructive feedback.`
      break
    case 'approve':
      newStage = 'approved'
      newRoundId = rounds[rounds.length - 1]?.id || idea.current_round_id
      title = 'Idea approved'
      body = `${idea.ref_code} has been approved by the adjudication panel.`
      break
    case 'award':
      newStage = 'awarded'
      title = 'Congratulations - Awarded!'
      body = `${idea.ref_code} has been selected for award. CEDA will contact you with next steps.`
      break
  }

  const res = await c.env.DB.prepare(`INSERT INTO decisions (idea_id, round_id, decided_by, decision, rationale, aggregate_score) VALUES (?,?,?,?,?,?)`)
    .bind(ideaId, idea.current_round_id, user.id, decision, rationale, agg?.avg ?? null)
    .run()
  await c.env.DB.prepare(
    `UPDATE ideas SET stage=?, current_round_id=?, updated_at=datetime('now'),
       decided_at = CASE WHEN ? IN ('rejected','awarded','approved') THEN datetime('now') ELSE decided_at END WHERE id=?`
  )
    .bind(newStage, newRoundId, newStage, ideaId)
    .run()
  await addHistory(c.env.DB, ideaId, idea.stage, newStage, newRoundId, user.id, `${decision}: ${rationale.slice(0, 200)}`)
  await c.env.DB.prepare(`INSERT INTO feedback (idea_id, author_id, body, visibility) VALUES (?,?,?,?)`)
    .bind(ideaId, user.id, `[Panel decision: ${decision.toUpperCase()}] ${rationale}`, 'submitter')
    .run()
  await notify(c.env.DB, idea.submitter_id, 'decision', title, body, `/app#/ideas/${ideaId}`)
  await audit(c.env.DB, user.id, 'decision.create', 'decision', Number(res.meta.last_row_id), { ideaId, decision, newStage }, clientIp(c))
  return c.json({ id: res.meta.last_row_id, stage: newStage, round_id: newRoundId }, 201)
})

export default ev
