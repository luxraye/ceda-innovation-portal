/* CEDA Innovation Portal - shared views: dashboard router, ideas, submission wizard, idea detail, profile */
(function () {
  'use strict'
  const C = window.CEDA
  const { state, api, esc, fmtDate, ago, money, nl2br, stageChip, recChip, asgChip, scoreColor, toast, modal, confirmDialog, fd, route, navigate, page, loading } = C
  C.views = C.views || {}

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------
  const isStaff = () => state.user && state.user.role !== 'submitter'
  const isAdj = () => state.user && (state.user.role === 'adjudicator' || state.user.role === 'admin')

  const empty = (icon, title, body, action = '') =>
    `<div class="card text-center py-14"><span class="mx-auto w-14 h-14 rounded-2xl bg-sand-100 text-brand-600 flex items-center justify-center text-xl"><i class="fas ${icon}"></i></span><h3 class="font-bold text-lg mt-4">${title}</h3><p class="text-sm text-stone-500 mt-1 max-w-md mx-auto">${body}</p>${action ? `<div class="mt-5">${action}</div>` : ''}</div>`

  const kpi = (label, value, sub = '', icon = '') =>
    `<div class="kpi"><span class="label">${icon ? `<i class="fas ${icon} mr-1.5 text-brand-600"></i>` : ''}${label}</span><span class="value">${value}</span>${sub ? `<span class="sub">${sub}</span>` : ''}</div>`

  /** Five-step journey: Submitted, Screening, Technical review, Committee, Decision. */
  function tracker(idea, rounds) {
    const order = idea.stage_order || (rounds.find((r) => r.id === idea.current_round_id) || {}).stage_order || 1
    const steps = ['Submitted', ...rounds.slice(0, 3).map((r) => r.name.replace(' Screening', '').replace(' & Business Review', ' review').replace('Investment Committee Pitch', 'Committee pitch')), 'Decision']
    const s = idea.stage
    const states = steps.map((_, i) => {
      if (s === 'draft') return ''
      if (i === 0) return 'done'
      if (i === 4) return s === 'awarded' || s === 'approved' ? 'done' : s === 'rejected' ? 'failed' : s === 'withdrawn' ? 'failed' : ''
      if (['awarded', 'approved'].includes(s)) return 'done'
      if (i < order) return 'done'
      if (i === order) return s === 'rejected' || s === 'withdrawn' ? 'failed' : 'active'
      return ''
    })
    const icon = (st, i) => (st === 'done' ? 'fa-check' : st === 'failed' ? 'fa-xmark' : st === 'active' ? 'fa-hourglass-half' : String(i + 1))
    return `<div class="tracker">${steps
      .map((label, i) => `<div class="tracker-step ${states[i]}"><div class="dot">${/^\d$/.test(icon(states[i], i)) ? icon(states[i], i) : `<i class="fas ${icon(states[i], i)}"></i>`}</div>${esc(label)}</div>`)
      .join('')}</div>`
  }
  C.views.tracker = tracker
  C.views.empty = empty
  C.views.kpi = kpi

  const ideaRow = (i) => `
    <a href="#/ideas/${i.id}" class="card block hover:border-brand-300 hover:shadow-md transition group">
      <div class="flex items-start gap-4">
        <span class="relative shrink-0"><img class="idea-thumb transition duration-500 group-hover:scale-105" src="${C.catImg(i.category_name)}" alt="" loading="lazy"><span class="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-white text-brand-600 shadow flex items-center justify-center text-xs"><i class="fas ${esc(i.category_icon || 'fa-lightbulb')}"></i></span></span>
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500"><span class="font-mono">${esc(i.ref_code)}</span><span>·</span><span>${esc(i.category_name || 'Uncategorised')}</span>${i.version > 1 ? `<span class="chip chip-gray">v${i.version}</span>` : ''}</div>
          <h3 class="font-bold text-base mt-1 group-hover:text-brand-700 truncate">${esc(i.title)}</h3>
          <p class="text-sm text-stone-600 mt-1 line-clamp-2">${esc(i.summary || '')}</p>
          <div class="flex flex-wrap items-center gap-3 mt-3 text-xs text-stone-500">
            ${stageChip(i.stage)}
            ${i.round_name && !['draft', 'withdrawn'].includes(i.stage) ? `<span><i class="fas fa-layer-group mr-1"></i>${esc(i.round_name)}</span>` : ''}
            ${i.feedback_count ? `<span><i class="fas fa-comments mr-1"></i>${i.feedback_count} feedback</span>` : ''}
            ${isStaff() && i.assignments_total ? `<span><i class="fas fa-clipboard-check mr-1"></i>${i.assignments_done}/${i.assignments_total} scored</span>` : ''}
            ${isStaff() && i.avg_score != null ? `<span class="font-bold ${scoreColor(i.avg_score)}">${i.avg_score}%</span>` : ''}
            <span class="ml-auto">Updated ${ago(i.updated_at)}</span>
          </div>
        </div>
      </div>
    </a>`

  // ---------------------------------------------------------------------------
  // Dashboard (dispatches by role)
  // ---------------------------------------------------------------------------
  route('/', async () => {
    const r = state.user.role
    if (r === 'submitter') return submitterDashboard()
    if (r === 'evaluator' && C.views.evaluatorDashboard) return C.views.evaluatorDashboard()
    if (C.views.staffDashboard) return C.views.staffDashboard()
    page(empty('fa-gauge', 'Dashboard', 'Loading modules…'), 'Dashboard')
  })

  async function submitterDashboard() {
    loading('Dashboard')
    const [{ ideas }, { settings }] = await Promise.all([api('/ideas'), api('/settings')])
    const count = (fn) => ideas.filter(fn).length
    const active = ideas.filter((i) => ['submitted', 'under_review', 'revision_requested', 'approved'].includes(i.stage))
    const needs = ideas.filter((i) => i.stage === 'revision_requested' || i.stage === 'draft')
    const deadline = settings.submission_deadline
    const first = state.user.name.split(' ')[0]
    page(
      `<section class="photo-banner p-6 sm:p-10"><img class="photo-banner-img" src="/ceda-innovation-portal/genspark/static/img/founder-laptop.webp" alt="">
        <p class="text-xs font-semibold tracking-widest uppercase text-amber-300">${esc(settings.programme_name || 'CEDA Innovation Challenge')}</p>
        <h2 class="text-2xl sm:text-3xl font-extrabold mt-2">Dumela, ${esc(first)}.</h2>
        <p class="text-white/70 mt-2 max-w-xl text-sm">Track every idea from submission to award, read evaluator feedback, and resubmit stronger versions — all in one place.</p>
        <div class="mt-5 flex flex-wrap gap-3">
          ${settings.submission_open === '0' ? '<span class="chip chip-red">Submissions closed</span>' : '<a href="#/ideas/new" class="btn-primary-lg"><i class="fas fa-plus"></i> Submit a new idea</a>'}
          ${deadline ? `<span class="glass-card px-4 py-2 text-sm"><i class="fas fa-clock text-amber-300 mr-2"></i>Deadline ${esc(fmtDate(deadline))}</span>` : ''}
        </div>
      </section>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        ${kpi('Total ideas', ideas.length, 'including drafts', 'fa-lightbulb')}
        ${kpi('In review', count((i) => ['submitted', 'under_review'].includes(i.stage)), 'with the panel', 'fa-magnifying-glass')}
        ${kpi('Need your action', needs.length, 'drafts and revisions', 'fa-bolt')}
        ${kpi('Approved / awarded', count((i) => ['approved', 'awarded'].includes(i.stage)), 'success so far', 'fa-award')}
      </div>
      ${needs.length ? `<div class="mt-6"><h3 class="card-title mb-3"><i class="fas fa-bolt text-amber-500 mr-2"></i>Needs your attention</h3><div class="grid gap-3">${needs.map(ideaRow).join('')}</div></div>` : ''}
      <div class="mt-6"><h3 class="card-title mb-3">Active submissions</h3>${active.length ? `<div class="grid gap-3">${active.map(ideaRow).join('')}</div>` : empty('fa-seedling', 'No active submissions yet', 'Your submitted ideas will appear here with live progress through each evaluation round.', '<a href="#/ideas/new" class="btn-primary"><i class="fas fa-plus"></i> Start an idea</a>')}</div>
      <div class="grid md:grid-cols-3 gap-4 mt-6">
        ${[['fa-file-pen', 'Submit', 'Use the guided form. Drafts save as you type.', 'engineer'], ['fa-users-viewfinder', 'Blind review', 'Independent evaluators score against published criteria.', 'grain-hands'], ['fa-comments', 'Improve', 'Read feedback, reply, and resubmit a stronger version.', 'maker-sewing']]
          .map(([ic, t, b, img]) => `<div class="photo-card !min-h-[13rem]"><img src="/ceda-innovation-portal/genspark/static/img/${img}.webp" alt="" loading="lazy"><div class="photo-card-body"><span class="photo-card-icon"><i class="fas ${ic}"></i></span><h3>${t}</h3><p>${b}</p></div></div>`)
          .join('')}
      </div>`,
      'Dashboard'
    )
  }

  // ---------------------------------------------------------------------------
  // Ideas list
  // ---------------------------------------------------------------------------
  route('/ideas', async () => {
    const title = isStaff() ? 'All ideas' : 'My ideas'
    loading(title)
    const params = new URLSearchParams(sessionStorage.getItem('ceda_idea_filters') || '')
    const [{ ideas }, { categories }] = await Promise.all([api('/ideas?' + params.toString()), api('/categories')])
    page(
      `<form id="filters" class="card flex flex-wrap gap-3 items-end">
        <div class="flex-1 min-w-[12rem]"><label class="label">Search</label><input class="input" name="search" value="${esc(params.get('search') || '')}" placeholder="Title, reference, tag…"></div>
        <div><label class="label">Stage</label><select class="select" name="stage"><option value="">All stages</option>${Object.entries(C.STAGE_META)
          .filter(([k]) => isStaff() ? k !== 'draft' : true)
          .map(([k, m]) => `<option value="${k}" ${params.get('stage') === k ? 'selected' : ''}>${m[0]}</option>`)
          .join('')}</select></div>
        <div><label class="label">Category</label><select class="select" name="category_id"><option value="">All categories</option>${categories.map((c) => `<option value="${c.id}" ${params.get('category_id') == c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <button class="btn-secondary" type="submit"><i class="fas fa-filter"></i> Apply</button>
        ${params.toString() ? '<button class="btn-ghost" type="button" id="clear-f">Clear</button>' : ''}
      </form>
      <p class="text-sm text-stone-500 mt-4 mb-3">${ideas.length} idea${ideas.length === 1 ? '' : 's'}</p>
      ${ideas.length ? `<div class="grid gap-3">${ideas.map(ideaRow).join('')}</div>` : empty('fa-lightbulb', 'No ideas match', isStaff() ? 'Try clearing the filters.' : 'Start your first submission — it only takes a few minutes.', state.user.role === 'submitter' ? '<a href="#/ideas/new" class="btn-primary"><i class="fas fa-plus"></i> New idea</a>' : '')}`,
      title
    )
    const f = document.getElementById('filters')
    f.onsubmit = (e) => {
      e.preventDefault()
      const p = new URLSearchParams(Object.entries(fd(f)).filter(([, v]) => v))
      sessionStorage.setItem('ceda_idea_filters', p.toString())
      C.render()
    }
    const cl = document.getElementById('clear-f')
    if (cl) cl.onclick = () => { sessionStorage.removeItem('ceda_idea_filters'); C.render() }
  })

  // ---------------------------------------------------------------------------
  // Submission wizard (new + edit/resubmit)
  // ---------------------------------------------------------------------------
  const STEPS = [
    { t: 'Basics', icon: 'fa-lightbulb', fields: ['title', 'category_id', 'summary', 'district', 'tags'] },
    { t: 'Problem & solution', icon: 'fa-puzzle-piece', fields: ['problem', 'solution', 'target_beneficiaries'] },
    { t: 'Impact & business', icon: 'fa-chart-line', fields: ['impact', 'business_model', 'budget_estimate', 'timeline'] },
    { t: 'Team & privacy', icon: 'fa-users', fields: ['team_description', 'is_confidential'] },
    { t: 'Review & submit', icon: 'fa-paper-plane', fields: [] }
  ]
  const FIELD = {
    title: ['Idea title *', 'input', 'A short, memorable name. e.g. "Solar cold rooms for Maun fish traders"'],
    summary: ['One-paragraph summary *', 'textarea', 'At least 30 characters. What is it, who is it for, and why now?'],
    district: ['District', 'input', 'Where will you operate first? e.g. Gaborone, Maun, Serowe'],
    tags: ['Tags', 'input', 'Comma separated, e.g. solar, agriculture, mobile money'],
    problem: ['Problem statement *', 'textarea', 'What problem exists today, and how do you know? Use data where you can.'],
    solution: ['Proposed solution *', 'textarea', 'How does your idea solve it? What makes it different or innovative?'],
    target_beneficiaries: ['Target beneficiaries *', 'textarea', 'Who benefits, and how many people or businesses could you reach?'],
    impact: ['Expected impact *', 'textarea', 'Jobs created, income, export potential, social or environmental benefits.'],
    business_model: ['Business model *', 'textarea', 'How will it make money and become self-sustaining?'],
    budget_estimate: ['Funding requested (BWP)', 'number', 'Your best estimate of the funding needed.'],
    timeline: ['Implementation timeline', 'textarea', 'Key milestones for the next 12–24 months.'],
    team_description: ['Team *', 'textarea', 'Founders, skills and shareholding. Hidden from evaluators during blind review.']
  }

  async function wizard(existing) {
    const { categories } = await api('/categories')
    const key = 'ceda_draft_' + (existing ? existing.id : 'new')
    let local = {}
    try { local = JSON.parse(localStorage.getItem(key) || '{}') } catch (_) {}
    const data = Object.assign({ is_confidential: 1 }, existing || {}, local)
    const isRevision = existing && existing.stage === 'revision_requested'
    let step = 0
    let ideaId = existing ? existing.id : null
    const title = existing ? (isRevision ? 'Revise & resubmit' : 'Edit draft') : 'New submission'

    const fieldHtml = (f) => {
      if (f === 'category_id')
        return `<div><label class="label">Category *</label><div class="grid sm:grid-cols-2 gap-2">${categories
          .filter((c) => c.is_active)
          .map((c) => `<label class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${data.category_id == c.id ? 'border-brand-500 bg-brand-50' : 'border-sand-200 hover:border-brand-300'}"><input type="radio" name="category_id" value="${c.id}" class="mt-1" ${data.category_id == c.id ? 'checked' : ''}><span><span class="font-semibold text-sm"><i class="fas ${esc(c.icon)} text-brand-600 mr-1.5"></i>${esc(c.name)}</span><span class="block text-xs text-stone-500 mt-0.5">${esc(c.description || '')}</span></span></label>`)
          .join('')}</div></div>`
      if (f === 'is_confidential')
        return `<label class="flex gap-3 p-4 rounded-xl border border-sand-200 bg-sand-50 text-sm"><input type="checkbox" name="is_confidential" ${data.is_confidential ? 'checked' : ''} class="mt-0.5"><span><strong>Keep my idea confidential</strong><span class="block text-stone-500 text-xs mt-0.5">Only assigned evaluators and the adjudication panel can read it. Recommended. Your personal data is processed under Botswana's Data Protection Act, 2024.</span></span></label>`
      const [label, type, help] = FIELD[f]
      const v = esc(data[f] ?? '')
      const input = type === 'textarea' ? `<textarea class="textarea" name="${f}" rows="${f === 'summary' ? 3 : 5}">${v}</textarea>` : `<input class="input" name="${f}" type="${type === 'number' ? 'number' : 'text'}" ${type === 'number' ? 'min="0" step="1000"' : ''} value="${v}">`
      return `<div><label class="label" for="${f}">${label}</label>${input}<p class="help">${help}${f === 'summary' || f === 'problem' || f === 'solution' ? ` <span class="float-right" data-count="${f}">${String(data[f] || '').length} chars</span>` : ''}</p></div>`
    }

    const review = () => `
      <div class="space-y-4">
        ${STEPS.slice(0, 4)
          .map(
            (s, i) => `<div class="rounded-xl border border-sand-200 p-4"><div class="flex items-center justify-between"><h4 class="font-bold text-sm"><i class="fas ${s.icon} text-brand-600 mr-2"></i>${s.t}</h4><button type="button" class="text-xs text-brand-700 font-semibold" data-goto="${i}">Edit</button></div>
            <dl class="mt-2 grid gap-2 text-sm">${s.fields
              .map((f) => {
                let v = data[f]
                if (f === 'category_id') v = (categories.find((c) => c.id == v) || {}).name
                if (f === 'is_confidential') v = v ? 'Confidential' : 'Visible to all staff'
                if (f === 'budget_estimate' && v) v = money(v)
                const req = FIELD[f] && FIELD[f][0].includes('*')
                return `<div><dt class="text-xs text-stone-500">${f === 'category_id' ? 'Category' : f === 'is_confidential' ? 'Confidentiality' : FIELD[f][0].replace(' *', '')}</dt><dd class="${!v && (req || f === 'category_id') ? 'text-red-600' : ''}">${v ? nl2br(String(v)).slice(0, 600) : !v && (req || f === 'category_id') ? 'Missing — required' : '—'}</dd></div>`
              })
              .join('')}</dl></div>`
          )
          .join('')}
        ${isRevision ? `<div><label class="label">What did you change? *</label><textarea class="textarea" name="change_note" rows="3" placeholder="Summarise how you addressed the panel's feedback">${esc(data.change_note || '')}</textarea></div>` : ''}
        <div id="submit-errors"></div>
      </div>`

    const draw = () => {
      page(
        `<div class="max-w-3xl mx-auto">
          ${isRevision ? `<div class="info-box mb-4"><i class="fas fa-rotate-left mr-2"></i>The panel asked for a revision. Address their feedback below, then resubmit as version ${existing.version + 1}.</div>` : ''}
          <div class="wizard-steps">${STEPS.map((_, i) => `<span class="wizard-step ${i <= step ? 'done' : ''}"></span>`).join('')}</div>
          <div class="flex items-center justify-between mt-3 text-xs text-stone-500"><span>Step ${step + 1} of ${STEPS.length}</span><span id="save-state"><i class="fas fa-cloud mr-1"></i>Autosaved on this device</span></div>
          <form id="wiz" class="card mt-4 space-y-5" novalidate>
            <div class="flex items-center gap-3"><span class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><i class="fas ${STEPS[step].icon}"></i></span><div><h2 class="font-extrabold text-lg">${STEPS[step].t}</h2>${existing ? `<p class="text-xs text-stone-500 font-mono">${esc(existing.ref_code)}</p>` : ''}</div></div>
            ${step < 4 ? STEPS[step].fields.map(fieldHtml).join('') : review()}
            <div class="flex flex-wrap gap-2 pt-2 border-t border-sand-100">
              ${step > 0 ? '<button type="button" class="btn-secondary" id="back"><i class="fas fa-arrow-left"></i> Back</button>' : ''}
              <button type="button" class="btn-ghost" id="save-draft"><i class="fas fa-floppy-disk"></i> Save draft</button>
              <span class="flex-1"></span>
              ${step < 4 ? '<button type="submit" class="btn-primary">Continue <i class="fas fa-arrow-right"></i></button>' : `<button type="button" class="btn-primary-lg" id="submit-idea"><i class="fas fa-paper-plane"></i> ${isRevision ? 'Resubmit' : 'Submit idea'}</button>`}
            </div>
          </form>
        </div>`,
        title
      )
      const f = document.getElementById('wiz')
      const capture = () => {
        const v = fd(f)
        STEPS[step].fields.forEach((k) => {
          if (k === 'is_confidential') data[k] = f.is_confidential.checked ? 1 : 0
          else if (k in v) data[k] = v[k]
        })
        if ('change_note' in v) data.change_note = v.change_note
        try { localStorage.setItem(key, JSON.stringify(data)) } catch (_) {}
      }
      f.addEventListener('input', (e) => {
        capture()
        const cnt = f.querySelector(`[data-count="${e.target.name}"]`)
        if (cnt) cnt.textContent = e.target.value.length + ' chars'
        document.getElementById('save-state').innerHTML = '<i class="fas fa-check text-green-600 mr-1"></i>Saved on this device'
      })
      f.addEventListener('change', (e) => { if (e.target.name === 'category_id') { capture(); draw() } })
      f.onsubmit = (e) => { e.preventDefault(); capture(); step++; draw(); window.scrollTo(0, 0) }
      const back = document.getElementById('back')
      if (back) back.onclick = () => { capture(); step--; draw() }
      f.querySelectorAll('[data-goto]').forEach((b) => (b.onclick = () => { step = Number(b.dataset.goto); draw() }))
      document.getElementById('save-draft').onclick = async () => { capture(); await save(false) }
      const sub = document.getElementById('submit-idea')
      if (sub) sub.onclick = async () => { capture(); await save(true) }
    }

    async function save(submit) {
      const body = { ...data, is_confidential: !!Number(data.is_confidential), submit }
      if (isRevision && submit && !String(data.change_note || '').trim()) {
        document.getElementById('submit-errors').innerHTML = '<div class="error-box">Please describe what you changed for the panel.</div>'
        return
      }
      if (!submit && !String(data.title || '').trim()) return toast('Add a title before saving a draft', 'error')
      try {
        let res
        if (ideaId) res = await api('/ideas/' + ideaId, { method: 'PUT', body })
        else { res = await api('/ideas', { method: 'POST', body }); ideaId = res.id }
        localStorage.removeItem(key)
        if (submit) {
          modal(
            `<div class="text-center py-4"><span class="mx-auto w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl"><i class="fas fa-circle-check"></i></span>
             <h3 class="text-xl font-extrabold mt-4">${isRevision ? 'Resubmitted' : 'Submission received'}</h3>
             <p class="text-sm text-stone-600 mt-2">Your reference is <strong class="font-mono">${esc(res.ref_code || existing.ref_code)}</strong>. We've sent you a notification and you can track progress at any time.</p>
             <div class="mt-6 flex justify-center gap-2"><button class="btn-primary" data-close id="go-idea">Track my idea</button></div></div>`,
            (root) => root.querySelector('#go-idea').addEventListener('click', () => navigate('/ideas/' + ideaId))
          )
        } else {
          toast('Draft saved')
          if (!existing) { history.replaceState(null, '', '#/ideas/' + ideaId + '/edit'); existing = { id: ideaId, ref_code: res.ref_code, stage: 'draft', version: 1 } }
        }
      } catch (err) {
        const box = document.getElementById('submit-errors')
        const html = `<div class="error-box"><strong>${esc(err.message)}</strong>${err.details ? `<ul class="list-disc ml-5 mt-1">${err.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}</div>`
        if (box) box.innerHTML = html
        else toast(err.message, 'error')
      }
    }
    draw()
  }

  route('/ideas/new', async () => { loading('New submission'); await wizard(null) }, { roles: ['submitter', 'admin'] })
  route('/ideas/:id/edit', async ({ id }) => {
    loading('Edit')
    const { idea } = await api('/ideas/' + id)
    if (!['draft', 'revision_requested'].includes(idea.stage)) return navigate('/ideas/' + id)
    await wizard(idea)
  })

  // ---------------------------------------------------------------------------
  // Idea detail (all roles; staff panels appear by role)
  // ---------------------------------------------------------------------------
  route('/ideas/:id', async ({ id }) => {
    loading('Idea')
    const d = await api('/ideas/' + id)
    const { idea, history, versions, attachments, feedback, decisions, assignments, scores, aggregate, rounds, settings } = d
    const u = state.user
    const mine = idea.submitter_id === u.id
    const editable = mine && ['draft', 'revision_requested'].includes(idea.stage)
    const canWithdraw = mine && !['awarded', 'rejected', 'withdrawn', 'draft'].includes(idea.stage)
    const resubsLeft = Number(settings.max_resubmissions || 2) - (idea.version - 1)
    const latestDecision = decisions[0]

    const section = (label, val) => (val ? `<div><h4 class="text-xs uppercase tracking-wider font-semibold text-stone-500">${label}</h4><p class="mt-1 text-sm leading-relaxed">${nl2br(val)}</p></div>` : '')

    const bubbles = feedback
      .map((f) => {
        const cls = f.visibility === 'internal' ? 'bubble-internal' : f.author_id === idea.submitter_id ? 'bubble-submitter' : 'bubble-staff'
        const who = f.author_id === u.id ? 'You' : u.role === 'submitter' && f.author_role !== 'submitter' ? (f.author_role === 'evaluator' ? 'Evaluator' : 'CEDA panel') : f.author_name
        return `<div class="bubble ${cls}"><div class="flex items-center gap-2 text-xs text-stone-500 mb-1"><strong class="text-stone-700">${esc(who)}</strong>${f.visibility === 'internal' ? '<span class="chip chip-gray"><i class="fas fa-lock"></i>internal</span>' : ''}<span class="ml-auto">${ago(f.created_at)}</span></div>${nl2br(f.body)}</div>`
      })
      .join('')

    const staffPanel = isAdj()
      ? `<div class="card">
          <div class="flex items-center justify-between"><h3 class="card-title">Panel scoring · ${esc(idea.round_name || '—')}</h3>${aggregate && aggregate.avg_score != null ? `<span class="text-2xl font-extrabold ${scoreColor(aggregate.avg_score)}">${aggregate.avg_score}%</span>` : ''}</div>
          <p class="text-xs text-stone-500 mt-1">${aggregate.done || 0} of ${aggregate.total || 0} evaluations complete · pass mark ${(rounds.find((r) => r.id === idea.current_round_id) || {}).pass_threshold ?? '—'}%</p>
          <div class="flex gap-2 mt-3 text-xs">${aggregate.rec_advance ? `<span class="chip chip-green">${aggregate.rec_advance} advance</span>` : ''}${aggregate.rec_revise ? `<span class="chip chip-orange">${aggregate.rec_revise} revise</span>` : ''}${aggregate.rec_reject ? `<span class="chip chip-red">${aggregate.rec_reject} reject</span>` : ''}</div>
          <div class="mt-4 space-y-2">${assignments.length
            ? assignments
                .map((a) => {
                  const sc = scores.filter((s) => s.assignment_id === a.id)
                  return `<details class="rounded-xl border border-sand-200 p-3"><summary class="flex items-center gap-2 cursor-pointer text-sm"><strong>${esc(a.evaluator_name)}</strong><span class="text-xs text-stone-500">${esc(a.round_name)}</span><span class="ml-auto flex items-center gap-2">${asgChip(a.status)}${recChip(a.recommendation)}<span class="font-bold ${scoreColor(a.weighted_score)}">${a.weighted_score != null ? a.weighted_score + '%' : '—'}</span></span></summary>
                    ${sc.length ? `<table class="table mt-2"><tbody>${sc.map((s) => `<tr><td>${esc(s.criterion_name)} <span class="text-stone-400 text-xs">×${s.weight}</span></td><td class="text-right font-semibold">${s.score}/${s.max_score}</td></tr>${s.comment ? `<tr><td colspan="2" class="text-xs text-stone-500 pt-0">${esc(s.comment)}</td></tr>` : ''}`).join('')}</tbody></table>` : ''}
                    ${a.overall_comment ? `<p class="text-sm mt-2 text-stone-600"><i class="fas fa-quote-left text-stone-300 mr-1"></i>${esc(a.overall_comment)}</p>` : ''}
                    ${a.conflict_note ? `<p class="text-xs mt-2 text-amber-700"><i class="fas fa-triangle-exclamation mr-1"></i>Conflict note: ${esc(a.conflict_note)}</p>` : ''}
                    ${a.status !== 'completed' ? `<button class="btn-ghost btn-sm mt-2 text-red-600" data-unassign="${a.id}"><i class="fas fa-user-minus"></i> Remove</button>` : ''}</details>`
                })
                .join('')
            : '<p class="text-sm text-stone-500">No evaluators assigned yet.</p>'}</div>
          ${!['draft', 'withdrawn', 'rejected', 'awarded'].includes(idea.stage) ? `<div class="flex flex-wrap gap-2 mt-4"><button class="btn-secondary" id="assign-btn"><i class="fas fa-user-plus"></i> Assign evaluators</button><button class="btn-primary" id="decide-btn"><i class="fas fa-gavel"></i> Record decision</button></div>` : ''}
        </div>`
      : ''

    const myAsg = u.role === 'evaluator' ? assignments.filter((a) => a.status !== 'completed') : []

    page(
      `<div class="flex flex-wrap items-start gap-3 mb-5">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500"><a href="#/ideas" class="hover:text-brand-700"><i class="fas fa-arrow-left mr-1"></i>Ideas</a><span>·</span><span class="font-mono">${esc(idea.ref_code)}</span><span>·</span><span>v${idea.version}</span>${idea.is_confidential ? '<span class="chip chip-gray"><i class="fas fa-lock"></i>Confidential</span>' : ''}</div>
          <h2 class="text-2xl font-extrabold mt-1">${esc(idea.title)}</h2>
          <div class="flex flex-wrap items-center gap-2 mt-2">${stageChip(idea.stage)}${idea.category_name ? `<span class="chip chip-gray">${esc(idea.category_name)}</span>` : ''}${idea.district ? `<span class="text-xs text-stone-500"><i class="fas fa-location-dot mr-1"></i>${esc(idea.district)}</span>` : ''}${isStaff() ? `<span class="text-xs text-stone-500"><i class="fas fa-user mr-1"></i>${esc(idea.submitter_name)}${idea.submitter_org ? ' · ' + esc(idea.submitter_org) : ''}</span>` : ''}</div>
        </div>
        <div class="flex flex-wrap gap-2">
          ${editable ? `<a href="#/ideas/${idea.id}/edit" class="btn-primary"><i class="fas fa-pen"></i> ${idea.stage === 'draft' ? 'Continue draft' : 'Revise & resubmit'}</a>` : ''}
          ${mine && idea.stage === 'draft' ? '<button class="btn-ghost text-red-600" id="del-btn"><i class="fas fa-trash"></i> Delete</button>' : ''}
          ${canWithdraw ? '<button class="btn-secondary" id="wd-btn"><i class="fas fa-ban"></i> Withdraw</button>' : ''}
          ${myAsg.length ? `<a href="#/evaluate/${myAsg[0].id}" class="btn-primary"><i class="fas fa-clipboard-check"></i> Open scoring sheet</a>` : ''}
          <button class="btn-ghost" onclick="window.print()"><i class="fas fa-print"></i></button>
        </div>
      </div>
      <div class="idea-cover"><img src="${C.catImg(idea.category_name)}" alt=""><span class="absolute z-10 bottom-4 left-5 text-white text-xs font-semibold tracking-widest uppercase"><i class="fas fa-layer-group text-amber-300 mr-1.5"></i>${esc(idea.category_name || 'Uncategorised')}</span></div>
      ${idea.stage !== 'draft' ? `<div class="card mb-5">${tracker(idea, rounds)}</div>` : ''}
      ${idea.stage === 'revision_requested' && mine ? `<div class="info-box mb-5"><i class="fas fa-rotate-left mr-2"></i><strong>The panel has asked for a revision.</strong> Read the feedback below, then revise and resubmit. ${resubsLeft > 0 ? `You have ${resubsLeft} resubmission${resubsLeft === 1 ? '' : 's'} left.` : 'You have reached the resubmission limit.'}</div>` : ''}
      ${latestDecision && mine ? `<div class="${latestDecision.decision === 'reject' ? 'error-box' : latestDecision.decision === 'revise' ? 'info-box' : 'success-box'} mb-5"><strong>Panel decision (${esc(latestDecision.round_name || '')}):</strong> ${esc(latestDecision.decision)} — ${esc(latestDecision.rationale)}</div>` : ''}
      <div class="grid lg:grid-cols-3 gap-5">
        <div class="lg:col-span-2 space-y-5">
          <div class="card space-y-5">
            ${section('Summary', idea.summary)}
            ${section('Problem', idea.problem)}
            ${section('Solution', idea.solution)}
            ${section('Target beneficiaries', idea.target_beneficiaries)}
            ${section('Expected impact', idea.impact)}
            ${section('Business model', idea.business_model)}
            ${section('Timeline', idea.timeline)}
            ${section('Team', idea.team_description)}
            <div class="grid sm:grid-cols-3 gap-3 pt-3 border-t border-sand-100 text-sm">
              <div><p class="text-xs text-stone-500">Funding requested</p><p class="font-bold">${money(idea.budget_estimate)}</p></div>
              <div><p class="text-xs text-stone-500">Submitted</p><p class="font-semibold">${fmtDate(idea.submitted_at)}</p></div>
              <div><p class="text-xs text-stone-500">Tags</p><p>${idea.tags ? idea.tags.split(',').map((t) => `<span class="chip chip-gray mr-1">${esc(t.trim())}</span>`).join('') : '—'}</p></div>
            </div>
          </div>
          ${staffPanel}
          <div class="card">
            <h3 class="card-title"><i class="fas fa-comments text-brand-600 mr-2"></i>Feedback & conversation</h3>
            <p class="text-xs text-stone-500 mt-1">${u.role === 'submitter' ? 'Evaluator feedback and panel decisions appear here. You can reply to ask questions or clarify.' : 'Messages marked internal are never shown to the innovator.'}</p>
            <div class="mt-4 flex flex-col gap-3">${bubbles || '<p class="text-sm text-stone-500">No feedback yet.</p>'}</div>
            ${idea.stage !== 'withdrawn' ? `<form id="fb-form" class="mt-4 space-y-2"><textarea class="textarea" name="body" rows="3" placeholder="${u.role === 'submitter' ? 'Reply to the panel…' : 'Write constructive feedback…'}" required></textarea>
              <div class="flex items-center gap-3">${isStaff() ? '<label class="text-xs flex items-center gap-2"><input type="checkbox" name="internal"> Internal note (staff only)</label>' : ''}<button class="btn-primary btn-sm ml-auto"><i class="fas fa-paper-plane"></i> Send</button></div></form>` : ''}
          </div>
        </div>
        <aside class="space-y-5">
          <div class="card">
            <h3 class="card-title">Attachments</h3>
            <ul class="mt-3 space-y-2 text-sm">${attachments.map((a) => `<li class="flex items-center gap-2"><i class="fas fa-link text-stone-400"></i><a href="${esc(a.url)}" target="_blank" rel="noopener noreferrer" class="text-brand-700 hover:underline truncate">${esc(a.filename)}</a>${mine ? `<button class="ml-auto text-stone-400 hover:text-red-600" data-del-att="${a.id}" aria-label="Remove"><i class="fas fa-xmark"></i></button>` : ''}</li>`).join('') || '<li class="text-stone-500">None yet</li>'}</ul>
            ${mine && !['withdrawn', 'rejected'].includes(idea.stage) ? `<form id="att-form" class="mt-3 space-y-2"><input class="input" name="filename" placeholder="Name, e.g. Pitch deck" required><input class="input" name="url" type="url" placeholder="https://drive.google.com/…" required><button class="btn-secondary btn-sm w-full"><i class="fas fa-plus"></i> Add link</button></form>` : ''}
          </div>
          <div class="card">
            <h3 class="card-title">History</h3>
            <div class="history mt-4">${history
              .slice()
              .reverse()
              .map((h) => `<div class="history-item"><p class="font-semibold">${h.from_stage ? `${esc(C.STAGE_META[h.from_stage]?.[0] || h.from_stage)} → ` : ''}${esc(C.STAGE_META[h.to_stage]?.[0] || h.to_stage)}</p>${h.round_name ? `<p class="text-xs text-stone-500">${esc(h.round_name)}</p>` : ''}${h.note ? `<p class="text-xs text-stone-600 mt-0.5">${esc(h.note)}</p>` : ''}<p class="text-[11px] text-stone-400 mt-0.5">${fmtDate(h.created_at)}${isStaff() && h.actor_name ? ' · ' + esc(h.actor_name) : ''}</p></div>`)
              .join('')}</div>
          </div>
          ${versions.length ? `<div class="card"><h3 class="card-title">Versions</h3><ul class="mt-3 space-y-2 text-sm">${versions.map((v) => `<li><button class="w-full text-left rounded-lg p-2 hover:bg-sand-50" data-version="${v.version}"><span class="font-semibold">v${v.version}</span> <span class="text-xs text-stone-500">${fmtDate(v.created_at)}</span><span class="block text-xs text-stone-500">${esc(v.change_note || '')}</span></button></li>`).join('')}</ul></div>` : ''}
          ${isStaff() && decisions.length ? `<div class="card"><h3 class="card-title">Decisions</h3><ul class="mt-3 space-y-3 text-sm">${decisions.map((x) => `<li><div class="flex items-center gap-2"><span class="chip ${x.decision === 'reject' ? 'chip-red' : x.decision === 'revise' ? 'chip-orange' : 'chip-green'}">${esc(x.decision)}</span><span class="text-xs text-stone-500">${esc(x.round_name || '')}</span>${x.aggregate_score != null ? `<span class="ml-auto font-bold">${x.aggregate_score}%</span>` : ''}</div><p class="text-xs text-stone-600 mt-1">${esc(x.rationale)}</p><p class="text-[11px] text-stone-400">${esc(x.decided_by_name || '')} · ${fmtDate(x.created_at)}</p></li>`).join('')}</ul></div>` : ''}
        </aside>
      </div>`,
      idea.ref_code
    )

    const reload = () => C.render()
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn }
    on('del-btn', async () => { if (await confirmDialog('Delete draft?', 'This permanently removes the draft.', 'Delete', true)) { await api('/ideas/' + idea.id, { method: 'DELETE' }); toast('Draft deleted'); navigate('/ideas') } })
    on('wd-btn', async () => { if (await confirmDialog('Withdraw this idea?', 'Withdrawing removes it from evaluation. This cannot be undone.', 'Withdraw', true)) { await api(`/ideas/${idea.id}/withdraw`, { method: 'POST' }); toast('Idea withdrawn'); reload() } })
    on('assign-btn', () => C.views.assignModal && C.views.assignModal(idea, reload))
    on('decide-btn', () => C.views.decisionModal && C.views.decisionModal(idea, aggregate, rounds, reload))
    document.querySelectorAll('[data-unassign]').forEach((b) => (b.onclick = async () => { if (await confirmDialog('Remove evaluator?', 'Their in-progress scores will be discarded.', 'Remove', true)) { await api('/evaluation/assignments/' + b.dataset.unassign, { method: 'DELETE' }); toast('Evaluator removed'); reload() } }))
    document.querySelectorAll('[data-del-att]').forEach((b) => (b.onclick = async () => { await api(`/ideas/${idea.id}/attachments/${b.dataset.delAtt}`, { method: 'DELETE' }); reload() }))
    document.querySelectorAll('[data-version]').forEach((b) => (b.onclick = async () => {
      const { version } = await api(`/ideas/${idea.id}/versions/${b.dataset.version}`)
      const p = version.payload
      modal(`<div class="flex items-center justify-between"><h3 class="text-lg font-bold">Version ${version.version}</h3><button class="btn-ghost" data-close><i class="fas fa-xmark"></i></button></div><p class="text-xs text-stone-500">${fmtDate(version.created_at)} · ${esc(version.change_note || '')}</p>
        <div class="mt-4 space-y-4">${['title', 'summary', 'problem', 'solution', 'target_beneficiaries', 'impact', 'business_model', 'timeline'].map((k) => (p[k] ? section(k.replace('_', ' '), String(p[k])) : '')).join('')}</div>`)
    }))
    const fb = document.getElementById('fb-form')
    if (fb) fb.onsubmit = async (e) => {
      e.preventDefault()
      const v = fd(fb)
      try { await api(`/ideas/${idea.id}/feedback`, { method: 'POST', body: { body: v.body, visibility: v.internal ? 'internal' : 'submitter' } }); toast('Message sent'); reload() } catch (err) { toast(err.message, 'error') }
    }
    const att = document.getElementById('att-form')
    if (att) att.onsubmit = async (e) => {
      e.preventDefault()
      try { await api(`/ideas/${idea.id}/attachments`, { method: 'POST', body: fd(att) }); toast('Attachment added'); reload() } catch (err) { toast(err.message, 'error') }
    }
  })

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------
  route('/profile', async () => {
    loading('Profile')
    const { user } = await api('/auth/me')
    page(
      `<div class="grid lg:grid-cols-2 gap-5 max-w-5xl">
        <form id="prof" class="card space-y-4"><h3 class="card-title">Your details</h3>
          <div><label class="label">Full name</label><input class="input" name="name" value="${esc(user.name)}" required></div>
          <div><label class="label">Email</label><input class="input" value="${esc(user.email)}" disabled></div>
          <div class="grid grid-cols-2 gap-3"><div><label class="label">Organisation</label><input class="input" name="organisation" value="${esc(user.organisation || '')}"></div><div><label class="label">District</label><input class="input" name="district" value="${esc(user.district || '')}"></div></div>
          <div><label class="label">Phone</label><input class="input" name="phone" value="${esc(user.phone || '')}"></div>
          ${user.role !== 'submitter' ? `<div><label class="label">Expertise</label><input class="input" name="expertise" value="${esc(user.expertise || '')}"></div>` : ''}
          <button class="btn-primary">Save changes</button></form>
        <div class="space-y-5">
          <form id="pw" class="card space-y-4"><h3 class="card-title">Change password</h3>
            <div><label class="label">Current password</label><input class="input" type="password" name="current" required autocomplete="current-password"></div>
            <div><label class="label">New password</label><input class="input" type="password" name="next" minlength="8" required autocomplete="new-password"></div>
            <button class="btn-secondary">Update password</button></form>
          <div class="card text-sm"><h3 class="card-title"><i class="fas fa-shield-halved text-brand-600 mr-2"></i>Your data rights</h3>
            <p class="text-stone-600 mt-2">Under Botswana's Data Protection Act, 2024 you may access, correct or request deletion of your personal data. Every access to your submissions is recorded in a tamper-evident audit log.</p>
            <p class="text-stone-500 mt-2 text-xs">Account created ${fmtDate(user.created_at)}${user.last_login_at ? ' · last sign-in ' + ago(user.last_login_at) : ''}</p></div>
        </div>
      </div>`,
      'Profile'
    )
    const pf = document.getElementById('prof')
    pf.onsubmit = async (e) => { e.preventDefault(); try { await api('/auth/profile', { method: 'PUT', body: fd(pf) }); const me = await api('/auth/me'); state.user = me.user; toast('Profile updated'); C.render() } catch (err) { toast(err.message, 'error') } }
    const pw = document.getElementById('pw')
    pw.onsubmit = async (e) => { e.preventDefault(); try { await api('/auth/password', { method: 'PUT', body: fd(pw) }); pw.reset(); toast('Password updated') } catch (err) { toast(err.message, 'error') } }
  })
})()
