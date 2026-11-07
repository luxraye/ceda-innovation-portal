/* CEDA Innovation Portal - evaluation & adjudication views */
(function () {
  'use strict'
  const C = window.CEDA
  const { state, api, esc, fmtDate, ago, money, nl2br, stageChip, recChip, asgChip, scoreColor, toast, modal, confirmDialog, fd, route, navigate, page, loading } = C
  C.views = C.views || {}
  const kpi = (...a) => C.views.kpi(...a)
  const empty = (...a) => C.views.empty(...a)

  const asgCard = (a) => `
    <a href="#/evaluate/${a.id}" class="card block hover:border-brand-300 hover:shadow-md transition">
      <div class="flex items-start gap-4">
        <img class="idea-thumb" src="${C.catImg(a.category_name)}" alt="" loading="lazy">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500"><span class="font-mono">${esc(a.ref_code)}</span><span>·</span><span>${esc(a.round_name)}</span>${a.blind_review ? '<span class="chip chip-purple"><i class="fas fa-user-secret"></i>blind</span>' : ''}</div>
          <h3 class="font-bold mt-1 truncate">${esc(a.title)}</h3>
          <p class="text-sm text-stone-600 mt-1 line-clamp-2">${esc(a.summary || '')}</p>
          <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-500">${asgChip(a.status)}${a.recommendation ? recChip(a.recommendation) : ''}${a.weighted_score != null ? `<span class="font-bold ${scoreColor(a.weighted_score)}">${a.weighted_score}%</span>` : ''}${state.user.role !== 'evaluator' ? `<span><i class="fas fa-user mr-1"></i>${esc(a.evaluator_name)}</span>` : ''}<span class="ml-auto">${a.due_at ? `<i class="fas fa-clock mr-1"></i>Due ${esc(fmtDate(a.due_at))}` : 'Assigned ' + ago(a.assigned_at)}</span></div>
        </div>
      </div>
    </a>`

  // ---------------------------------------------------------------------------
  // Evaluator dashboard
  // ---------------------------------------------------------------------------
  C.views.evaluatorDashboard = async function () {
    loading('Dashboard')
    const { assignments } = await api('/evaluation/assignments')
    const open = assignments.filter((a) => a.status !== 'completed')
    const done = assignments.filter((a) => a.status === 'completed')
    const avg = done.length ? (done.reduce((s, a) => s + (a.weighted_score || 0), 0) / done.length).toFixed(1) : '—'
    page(
      `<section class="photo-banner p-6 sm:p-10"><img class="photo-banner-img" src="/static/img/grain-hands.webp" alt="">
        <p class="text-xs font-semibold tracking-widest uppercase text-amber-300">Evaluator workspace</p>
        <h2 class="text-2xl sm:text-3xl font-extrabold mt-2">${open.length ? `You have ${open.length} idea${open.length === 1 ? '' : 's'} to score.` : 'You are all caught up.'}</h2>
        <p class="text-white/70 mt-2 max-w-xl text-sm">Score each idea against the round's published criteria. Blind rounds hide the innovator's identity to keep reviews fair. Declare any conflict of interest before you score.</p>
        ${open.length ? `<a href="#/evaluate/${open[0].id}" class="btn-primary-lg mt-5"><i class="fas fa-play"></i> Start next evaluation</a>` : ''}
      </section>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        ${kpi('Assigned', assignments.length, 'all rounds', 'fa-inbox')}
        ${kpi('To do', open.length, 'pending or in progress', 'fa-hourglass-half')}
        ${kpi('Completed', done.length, 'submitted scores', 'fa-circle-check')}
        ${kpi('Your average', avg === '—' ? avg : avg + '%', 'weighted score given', 'fa-scale-balanced')}
      </div>
      <h3 class="card-title mt-6 mb-3">Your queue</h3>
      ${open.length ? `<div class="grid gap-3">${open.map(asgCard).join('')}</div>` : empty('fa-mug-hot', 'Nothing waiting', 'New assignments will appear here and you will get a notification.')}
      ${done.length ? `<h3 class="card-title mt-6 mb-3">Recently completed</h3><div class="grid gap-3">${done.slice(0, 5).map(asgCard).join('')}</div>` : ''}`,
      'Dashboard'
    )
  }

  // ---------------------------------------------------------------------------
  // Evaluations list
  // ---------------------------------------------------------------------------
  route('/evaluate', async () => {
    const title = state.user.role === 'evaluator' ? 'My evaluations' : 'Evaluations'
    loading(title)
    const status = sessionStorage.getItem('ceda_asg_status') || ''
    const { assignments } = await api('/evaluation/assignments' + (status ? '?status=' + status : ''))
    const tabs = [['', 'All'], ['pending', 'Pending'], ['in_progress', 'In progress'], ['completed', 'Completed']]
    page(
      `<div class="flex flex-wrap gap-2 mb-4">${tabs.map(([k, l]) => `<button class="${status === k ? 'btn-primary' : 'btn-secondary'} btn-sm" data-st="${k}">${l}</button>`).join('')}</div>
      ${assignments.length ? `<div class="grid gap-3">${assignments.map(asgCard).join('')}</div>` : empty('fa-clipboard-check', 'No evaluations here', 'Assignments matching this filter will appear here.')}`,
      title
    )
    document.querySelectorAll('[data-st]').forEach((b) => (b.onclick = () => { sessionStorage.setItem('ceda_asg_status', b.dataset.st); C.render() }))
  }, { roles: ['evaluator', 'adjudicator', 'admin'] })

  // ---------------------------------------------------------------------------
  // Scoring sheet
  // ---------------------------------------------------------------------------
  route('/evaluate/:id', async ({ id }) => {
    loading('Scoring sheet')
    const { assignment: a, idea, criteria, scores, attachments, feedback } = await api('/evaluation/assignments/' + id)
    const mine = a.evaluator_id === state.user.id
    const locked = a.status === 'completed' || !mine
    const val = {}
    const com = {}
    scores.forEach((s) => { val[s.criterion_id] = s.score; com[s.criterion_id] = s.comment || '' })
    const totalW = criteria.reduce((s, c) => s + c.weight, 0) || 1
    const compute = () => {
      let sum = 0
      let n = 0
      criteria.forEach((c) => { if (val[c.id] != null) { sum += (val[c.id] / c.max_score) * c.weight; n++ } })
      return { pct: n ? Math.round((sum / totalW) * 1000) / 10 : null, n }
    }
    const section = (l, v) => (v ? `<div><h4 class="text-xs uppercase tracking-wider font-semibold text-stone-500">${l}</h4><p class="mt-1 text-sm leading-relaxed">${nl2br(v)}</p></div>` : '')

    page(
      `<div class="flex flex-wrap items-center gap-2 text-xs text-stone-500 mb-2"><a href="#/evaluate" class="hover:text-brand-700"><i class="fas fa-arrow-left mr-1"></i>Evaluations</a><span>·</span><span class="font-mono">${esc(idea.ref_code)}</span><span>·</span><span>${esc(a.round_name)}</span>${a.blind_review ? '<span class="chip chip-purple"><i class="fas fa-user-secret"></i>Blind review</span>' : ''}${asgChip(a.status)}</div>
      <h2 class="text-2xl font-extrabold">${esc(idea.title)}</h2>
      <div class="grid lg:grid-cols-5 gap-5 mt-5">
        <div class="lg:col-span-2 space-y-5">
          <div class="card space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
            <div class="flex flex-wrap gap-2 text-xs">${idea.category_name ? `<span class="chip chip-gray">${esc(idea.category_name)}</span>` : ''}<span class="chip chip-gray">v${idea.version}</span><span class="text-stone-500"><i class="fas fa-user mr-1"></i>${esc(idea.submitter_name)}</span></div>
            ${section('Summary', idea.summary)}${section('Problem', idea.problem)}${section('Solution', idea.solution)}${section('Beneficiaries', idea.target_beneficiaries)}${section('Impact', idea.impact)}${section('Business model', idea.business_model)}${section('Timeline', idea.timeline)}${section('Team', idea.team_description)}
            <div class="text-sm"><span class="text-xs text-stone-500">Funding requested</span><p class="font-bold">${money(idea.budget_estimate)}</p></div>
            ${attachments.length ? `<div><h4 class="text-xs uppercase tracking-wider font-semibold text-stone-500">Attachments</h4><ul class="mt-1 text-sm">${attachments.map((x) => `<li><a class="text-brand-700 hover:underline" target="_blank" rel="noopener noreferrer" href="${esc(x.url)}"><i class="fas fa-link mr-1"></i>${esc(x.filename)}</a></li>`).join('')}</ul></div>` : ''}
            ${feedback.length ? `<details><summary class="text-xs uppercase tracking-wider font-semibold text-stone-500 cursor-pointer">Earlier feedback (${feedback.length})</summary><div class="mt-2 space-y-2">${feedback.map((f) => `<div class="bubble ${f.visibility === 'internal' ? 'bubble-internal' : 'bubble-staff'} text-xs">${nl2br(f.body)}<p class="text-[10px] text-stone-400 mt-1">${ago(f.created_at)}</p></div>`).join('')}</div></details>` : ''}
          </div>
        </div>
        <form id="sheet" class="lg:col-span-3 space-y-4">
          <div class="card flex items-center gap-4">
            <div class="flex-1"><p class="text-xs text-stone-500 uppercase tracking-wider font-semibold">Weighted score</p><p class="text-xs text-stone-500" id="progress"></p></div>
            <span class="text-4xl font-extrabold" id="total">—</span>
            <span class="text-xs text-stone-500">pass ${a.pass_threshold}%</span>
          </div>
          ${criteria
            .map(
              (c) => `<div class="card">
                <div class="flex items-start gap-3"><div class="flex-1"><h4 class="font-bold">${esc(c.name)} <span class="text-xs font-normal text-stone-400">weight ×${c.weight}</span></h4><p class="text-xs text-stone-500 mt-0.5">${esc(c.description || '')}</p></div><span class="score-badge" data-badge="${c.id}">${val[c.id] ?? '–'}</span><span class="text-xs text-stone-400 mt-1.5">/ ${c.max_score}</span></div>
                <input type="range" class="score-range mt-3" min="0" max="${c.max_score}" step="1" value="${val[c.id] ?? Math.round(c.max_score / 2)}" data-cid="${c.id}" ${locked ? 'disabled' : ''} aria-label="${esc(c.name)} score">
                <div class="flex justify-between text-[10px] text-stone-400"><span>Weak</span><span>Adequate</span><span>Excellent</span></div>
                <input class="input mt-2 text-sm" placeholder="Optional comment on this criterion" data-com="${c.id}" value="${esc(com[c.id] || '')}" ${locked ? 'disabled' : ''}>
              </div>`
            )
            .join('')}
          <div class="card space-y-4">
            <div><label class="label">Recommendation *</label><div class="grid grid-cols-3 gap-2">${[['advance', 'Advance', 'fa-arrow-up', 'green'], ['revise', 'Revise', 'fa-rotate-left', 'orange'], ['reject', 'Reject', 'fa-xmark', 'red']]
              .map(([k, l, ic]) => `<label class="flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-sm font-semibold transition has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/30 has-[:checked]:text-brand-800 border-sand-200"><input type="radio" name="recommendation" value="${k}" class="sr-only" ${a.recommendation === k ? 'checked' : ''} ${locked ? 'disabled' : ''}><i class="fas ${ic}"></i>${l}</label>`)
              .join('')}</div></div>
            <div><label class="label">Overall comment for the innovator *</label><textarea class="textarea" name="overall_comment" rows="4" placeholder="Strengths, gaps, and one concrete next step. Be specific and constructive." ${locked ? 'disabled' : ''}>${esc(a.overall_comment || '')}</textarea></div>
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="share_comment" checked ${locked ? 'disabled' : ''}> Share this comment with the innovator (anonymously)</label>
            <div><label class="label">Conflict of interest declaration</label><input class="input" name="conflict_note" placeholder="Leave blank if none. Declare any relationship with the applicant." value="${esc(a.conflict_note || '')}" ${locked ? 'disabled' : ''}></div>
            <div id="sheet-err"></div>
            ${locked ? `<div class="success-box"><i class="fas fa-lock mr-2"></i>${a.status === 'completed' ? `Submitted ${fmtDate(a.completed_at)}. Scores are locked for audit.` : 'Read-only view.'}</div>` : `<div class="flex flex-wrap gap-2"><button type="button" class="btn-secondary" id="save-sheet"><i class="fas fa-floppy-disk"></i> Save progress</button><button type="submit" class="btn-primary ml-auto"><i class="fas fa-paper-plane"></i> Submit evaluation</button></div>`}
          </div>
        </form>
      </div>`,
      'Scoring sheet'
    )

    const touched = new Set(Object.keys(val).map(Number))
    const paint = () => {
      const { pct, n } = compute()
      const t = document.getElementById('total')
      t.textContent = pct == null ? '—' : pct + '%'
      t.className = 'text-4xl font-extrabold ' + scoreColor(pct)
      document.getElementById('progress').textContent = `${n} of ${criteria.length} criteria scored`
    }
    document.querySelectorAll('[data-cid]').forEach((r) => (r.oninput = () => {
      const cid = Number(r.dataset.cid)
      val[cid] = Number(r.value)
      touched.add(cid)
      document.querySelector(`[data-badge="${cid}"]`).textContent = r.value
      paint()
    }))
    paint()
    if (locked) return
    const f = document.getElementById('sheet')
    const body = (submit) => {
      const v = fd(f)
      return {
        scores: criteria.filter((c) => touched.has(c.id)).map((c) => ({ criterion_id: c.id, score: val[c.id], comment: document.querySelector(`[data-com="${c.id}"]`).value })),
        recommendation: v.recommendation || null,
        overall_comment: v.overall_comment,
        conflict_note: v.conflict_note,
        share_comment: !!v.share_comment,
        submit
      }
    }
    document.getElementById('save-sheet').onclick = async () => { try { await api('/evaluation/assignments/' + id, { method: 'PUT', body: body(false) }); toast('Progress saved') } catch (err) { toast(err.message, 'error') } }
    f.onsubmit = async (e) => {
      e.preventDefault()
      const b = body(true)
      if (b.scores.length < criteria.length) return (document.getElementById('sheet-err').innerHTML = `<div class="error-box">Move every slider to score all ${criteria.length} criteria (${b.scores.length} done).</div>`)
      if (!(await confirmDialog('Submit evaluation?', `Weighted score <strong>${compute().pct}%</strong>, recommendation <strong>${esc(b.recommendation || '—')}</strong>. Scores are locked once submitted.`, 'Submit'))) return
      try { await api('/evaluation/assignments/' + id, { method: 'PUT', body: b }); toast('Evaluation submitted. Thank you!'); navigate('/evaluate') } catch (err) { document.getElementById('sheet-err').innerHTML = `<div class="error-box">${esc(err.message)}</div>` }
    }
  }, { roles: ['evaluator', 'adjudicator', 'admin'] })

  // ---------------------------------------------------------------------------
  // Modals: assign evaluators, record decision (used from idea detail & queue)
  // ---------------------------------------------------------------------------
  C.views.assignModal = async function (idea, done) {
    const [{ evaluators }, { rounds }] = await Promise.all([api('/evaluators'), api('/evaluation/rounds')])
    const due = dayjs().add(7, 'day').format('YYYY-MM-DD')
    modal(
      `<div class="flex items-center justify-between"><h3 class="text-lg font-bold">Assign evaluators</h3><button class="btn-ghost" data-close><i class="fas fa-xmark"></i></button></div>
      <p class="text-sm text-stone-500 mt-1"><span class="font-mono">${esc(idea.ref_code)}</span> · ${esc(idea.title)}</p>
      <form id="asg-form" class="mt-4 space-y-4">
        <div><label class="label">Round</label><select class="select" name="round_id">${rounds.map((r) => `<option value="${r.id}" ${r.id === idea.current_round_id ? 'selected' : ''}>${esc(r.name)} · min ${r.min_evaluators} evaluators${r.blind_review ? ' · blind' : ''}</option>`).join('')}</select></div>
        <div><label class="label">Evaluators</label><div class="space-y-2 max-h-64 overflow-y-auto">${evaluators
          .map((e) => `<label class="flex items-center gap-3 p-3 rounded-xl border border-sand-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/30 has-[:checked]:text-brand-800 cursor-pointer"><input type="checkbox" name="ev" value="${e.id}"><span class="flex-1"><span class="font-semibold text-sm">${esc(e.name)}</span> <span class="text-xs text-stone-500">${esc(e.role)}</span><span class="block text-xs text-stone-500">${esc(e.expertise || '')}</span></span><span class="text-xs text-stone-500 text-right">${e.open_assignments} open<br>${e.completed_assignments} done</span></label>`)
          .join('')}</div></div>
        <div><label class="label">Due date</label><input class="input" type="date" name="due_at" value="${due}"></div>
        <div id="asg-err"></div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary"><i class="fas fa-user-plus"></i> Assign</button></div>
      </form>`,
      (root, close) => {
        const f = root.querySelector('#asg-form')
        f.onsubmit = async (e) => {
          e.preventDefault()
          const ids = [...f.querySelectorAll('[name=ev]:checked')].map((x) => Number(x.value))
          if (!ids.length) return (root.querySelector('#asg-err').innerHTML = '<div class="error-box">Choose at least one evaluator.</div>')
          try {
            const r = await api('/evaluation/assignments', { method: 'POST', body: { idea_id: idea.id, round_id: Number(f.round_id.value), evaluator_ids: ids, due_at: f.due_at.value } })
            close()
            toast(r.created ? `${r.created} evaluator${r.created === 1 ? '' : 's'} assigned and notified` : 'Those evaluators were already assigned', r.created ? 'success' : 'info')
            done && done()
          } catch (err) { root.querySelector('#asg-err').innerHTML = `<div class="error-box">${esc(err.message)}</div>` }
        }
      }
    )
  }

  C.views.decisionModal = function (idea, agg, rounds, done) {
    const cur = rounds.find((r) => r.id === idea.current_round_id)
    const isLast = cur && !rounds.some((r) => r.stage_order > cur.stage_order)
    const avg = agg && agg.avg_score
    const pass = cur ? cur.pass_threshold : null
    const suggest = avg == null ? null : avg >= pass ? 'advance' : avg >= pass - 15 ? 'revise' : 'reject'
    const opts = [
      ['advance', isLast ? 'Approve (final round)' : 'Advance to next round', 'fa-arrow-up', 'Moves the idea to the next evaluation round.'],
      ['revise', 'Request revision', 'fa-rotate-left', 'The innovator revises and resubmits.'],
      ['reject', 'Not selected', 'fa-xmark', 'Closes the idea with constructive reasons.'],
      ['approve', 'Approve', 'fa-circle-check', 'Approves the idea for funding consideration.'],
      ['award', 'Award', 'fa-award', 'Selects the idea for award.']
    ]
    modal(
      `<div class="flex items-center justify-between"><h3 class="text-lg font-bold">Record panel decision</h3><button class="btn-ghost" data-close><i class="fas fa-xmark"></i></button></div>
      <p class="text-sm text-stone-500 mt-1"><span class="font-mono">${esc(idea.ref_code)}</span> · ${esc(idea.title)}</p>
      <div class="grid grid-cols-3 gap-3 mt-4 text-center">
        <div class="rounded-xl bg-sand-50 p-3"><p class="text-xs text-stone-500">Average</p><p class="text-xl font-extrabold ${scoreColor(avg)}">${avg != null ? avg + '%' : '—'}</p></div>
        <div class="rounded-xl bg-sand-50 p-3"><p class="text-xs text-stone-500">Pass mark</p><p class="text-xl font-extrabold">${pass ?? '—'}%</p></div>
        <div class="rounded-xl bg-sand-50 p-3"><p class="text-xs text-stone-500">Evaluations</p><p class="text-xl font-extrabold">${(agg && agg.done) || 0}/${(agg && agg.total) || 0}</p></div>
      </div>
      ${suggest ? `<p class="text-xs text-stone-500 mt-3"><i class="fas fa-wand-magic-sparkles text-brand-600 mr-1"></i>Based on the scores, the suggested decision is <strong>${suggest}</strong>. The panel has the final say.</p>` : '<p class="text-xs text-amber-700 mt-3"><i class="fas fa-triangle-exclamation mr-1"></i>No completed evaluations yet in this round.</p>'}
      <form id="dec-form" class="mt-4 space-y-4">
        <div class="space-y-2">${opts.map(([k, l, ic, h]) => `<label class="flex items-start gap-3 p-3 rounded-xl border border-sand-200 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:ring-2 has-[:checked]:ring-brand-500/30 has-[:checked]:text-brand-800 cursor-pointer"><input type="radio" name="decision" value="${k}" class="mt-1" ${k === suggest ? 'checked' : ''}><span><span class="font-semibold text-sm"><i class="fas ${ic} mr-1.5 text-brand-600"></i>${l}</span><span class="block text-xs text-stone-500">${h}</span></span></label>`).join('')}</div>
        <div><label class="label">Rationale * <span class="font-normal text-stone-400">(shared with the innovator)</span></label><textarea class="textarea" name="rationale" rows="4" required placeholder="Explain the decision with reference to the criteria and scores."></textarea></div>
        <div id="dec-err"></div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary"><i class="fas fa-gavel"></i> Record decision</button></div>
      </form>`,
      (root, close) => {
        const f = root.querySelector('#dec-form')
        f.onsubmit = async (e) => {
          e.preventDefault()
          const v = fd(f)
          if (!v.decision) return (root.querySelector('#dec-err').innerHTML = '<div class="error-box">Choose a decision.</div>')
          try {
            const r = await api('/evaluation/decisions', { method: 'POST', body: { idea_id: idea.id, decision: v.decision, rationale: v.rationale } })
            close()
            toast(`Decision recorded. Idea is now ${(C.STAGE_META[r.stage] || [r.stage])[0].toLowerCase()} and the innovator has been notified.`)
            done && done()
          } catch (err) { root.querySelector('#dec-err').innerHTML = `<div class="error-box">${esc(err.message)}</div>` }
        }
      }
    )
  }

  // ---------------------------------------------------------------------------
  // Adjudication queue
  // ---------------------------------------------------------------------------
  route('/queue', async () => {
    loading('Adjudication')
    const [{ queue }, { rounds }] = await Promise.all([api('/evaluation/queue'), api('/evaluation/rounds')])
    const ready = queue.filter((q) => q.stage === 'under_review' && q.completed >= q.min_evaluators)
    const waiting = queue.filter((q) => q.stage === 'under_review' && q.completed < q.min_evaluators)
    const unassigned = queue.filter((q) => q.stage === 'submitted')
    const approved = queue.filter((q) => q.stage === 'approved')
    const recBar = (q) => {
      const t = (q.rec_advance || 0) + (q.rec_revise || 0) + (q.rec_reject || 0)
      if (!t) return '<span class="text-xs text-stone-400">—</span>'
      const w = (n) => ((n || 0) / t) * 100
      return `<div class="flex h-2 w-24 rounded-full overflow-hidden bg-stone-100" title="${q.rec_advance || 0} advance · ${q.rec_revise || 0} revise · ${q.rec_reject || 0} reject"><span class="bg-green-500" style="width:${w(q.rec_advance)}%"></span><span class="bg-orange-400" style="width:${w(q.rec_revise)}%"></span><span class="bg-red-500" style="width:${w(q.rec_reject)}%"></span></div>`
    }
    const table = (rows, action) =>
      rows.length
        ? `<div class="table-wrap"><table class="table"><thead><tr><th>Idea</th><th>Round</th><th>Evaluations</th><th>Average</th><th>Recommendations</th><th></th></tr></thead><tbody>${rows
            .map(
              (q) => `<tr><td><a href="#/ideas/${q.id}" class="font-semibold hover:text-brand-700">${esc(q.title)}</a><div class="text-xs text-stone-500"><span class="font-mono">${esc(q.ref_code)}</span> · ${esc(q.category_name || '')} · ${esc(q.submitter_name)}</div></td>
              <td class="text-xs">${esc(q.round_name || '—')}</td>
              <td class="text-sm">${q.completed}/${q.assigned} <span class="text-xs text-stone-400">(min ${q.min_evaluators || '—'})</span></td>
              <td><span class="font-bold ${scoreColor(q.avg_score)}">${q.avg_score != null ? q.avg_score + '%' : '—'}</span>${q.avg_score != null && q.pass_threshold != null ? `<span class="block text-[10px] ${q.avg_score >= q.pass_threshold ? 'text-green-600' : 'text-red-500'}">${q.avg_score >= q.pass_threshold ? 'above' : 'below'} ${q.pass_threshold}%</span>` : ''}</td>
              <td>${recBar(q)}</td>
              <td class="text-right whitespace-nowrap">${action(q)}</td></tr>`
            )
            .join('')}</tbody></table></div>`
        : '<p class="text-sm text-stone-500 card">Nothing here right now.</p>'
    page(
      `<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${kpi('Ready to decide', ready.length, 'quorum reached', 'fa-gavel')}
        ${kpi('Being scored', waiting.length, 'awaiting evaluators', 'fa-hourglass-half')}
        ${kpi('Needs evaluators', unassigned.length, 'submitted, unassigned', 'fa-user-plus')}
        ${kpi('Approved', approved.length, 'eligible for award', 'fa-circle-check')}
      </div>
      <h3 class="card-title mt-6 mb-3"><i class="fas fa-gavel text-brand-600 mr-2"></i>Ready for a decision</h3>${table(ready, (q) => `<button class="btn-primary btn-sm" data-decide="${q.id}">Decide</button>`)}
      <h3 class="card-title mt-6 mb-3"><i class="fas fa-user-plus text-brand-600 mr-2"></i>Needs evaluators</h3>${table(unassigned, (q) => `<button class="btn-secondary btn-sm" data-assign="${q.id}">Assign</button>`)}
      <h3 class="card-title mt-6 mb-3"><i class="fas fa-hourglass-half text-brand-600 mr-2"></i>Being scored</h3>${table(waiting, (q) => `<button class="btn-ghost btn-sm" data-assign="${q.id}">Add evaluator</button> <button class="btn-ghost btn-sm" data-decide="${q.id}">Decide early</button>`)}
      <h3 class="card-title mt-6 mb-3"><i class="fas fa-award text-brand-600 mr-2"></i>Approved, awaiting award</h3>${table(approved, (q) => `<button class="btn-success btn-sm" data-decide="${q.id}">Award / decide</button>`)}`,
      'Adjudication'
    )
    const byId = (id) => queue.find((q) => q.id === Number(id))
    document.querySelectorAll('[data-assign]').forEach((b) => (b.onclick = () => C.views.assignModal(byId(b.dataset.assign), C.render)))
    document.querySelectorAll('[data-decide]').forEach((b) => (b.onclick = () => {
      const q = byId(b.dataset.decide)
      C.views.decisionModal(q, { avg_score: q.avg_score, done: q.completed, total: q.assigned }, rounds, C.render)
    }))
  }, { roles: ['adjudicator', 'admin'] })

  // ---------------------------------------------------------------------------
  // Assignments overview (workload)
  // ---------------------------------------------------------------------------
  route('/assignments', async () => {
    loading('Assignments')
    const [{ assignments }, { evaluators }] = await Promise.all([api('/evaluation/assignments'), api('/evaluators')])
    page(
      `<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4">${evaluators
        .map((e) => {
          const total = e.open_assignments + e.completed_assignments
          const pct = total ? Math.round((e.completed_assignments / total) * 100) : 0
          return `<div class="card"><div class="flex items-center gap-3"><span class="w-10 h-10 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center">${esc(e.name.split(' ').map((p) => p[0]).slice(0, 2).join(''))}</span><div class="min-w-0"><p class="font-semibold truncate">${esc(e.name)}</p><p class="text-xs text-stone-500 truncate">${esc(e.expertise || e.role)}</p></div></div>
            <div class="mt-4 flex justify-between text-xs text-stone-500"><span>${e.completed_assignments} done · ${e.open_assignments} open</span><span>${pct}%</span></div>
            <div class="h-2 rounded-full bg-stone-100 mt-1 overflow-hidden"><div class="h-full bg-brand-600" style="width:${pct}%"></div></div></div>`
        })
        .join('')}</div>
      <h3 class="card-title mt-6 mb-3">All assignments</h3>
      <div class="table-wrap"><table class="table"><thead><tr><th>Idea</th><th>Evaluator</th><th>Round</th><th>Status</th><th>Score</th><th>Due</th><th></th></tr></thead><tbody>${assignments
        .map((a) => `<tr><td><a href="#/ideas/${a.idea_id}" class="font-semibold hover:text-brand-700">${esc(a.title)}</a><div class="text-xs text-stone-500 font-mono">${esc(a.ref_code)}</div></td><td>${esc(a.evaluator_name)}</td><td class="text-xs">${esc(a.round_name)}</td><td>${asgChip(a.status)}</td><td class="font-bold ${scoreColor(a.weighted_score)}">${a.weighted_score != null ? a.weighted_score + '%' : '—'}</td><td class="text-xs">${a.due_at ? esc(a.due_at) : '—'}</td><td class="text-right">${a.status !== 'completed' ? `<button class="btn-ghost btn-sm text-red-600" data-rm="${a.id}" aria-label="Remove"><i class="fas fa-user-minus"></i></button>` : `<a class="btn-ghost btn-sm" href="#/evaluate/${a.id}">View</a>`}</td></tr>`)
        .join('') || '<tr><td colspan="7" class="text-center text-stone-500 py-8">No assignments yet</td></tr>'}</tbody></table></div>`,
      'Assignments'
    )
    document.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = async () => { if (await confirmDialog('Remove assignment?', 'The evaluator will no longer see this idea.', 'Remove', true)) { await api('/evaluation/assignments/' + b.dataset.rm, { method: 'DELETE' }); toast('Assignment removed'); C.render() } }))
  }, { roles: ['adjudicator', 'admin'] })
})()
