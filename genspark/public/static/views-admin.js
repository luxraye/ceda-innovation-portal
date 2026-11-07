/* CEDA Innovation Portal - staff dashboard, programme configuration, users, audit, reports */
(function () {
  'use strict'
  const C = window.CEDA
  const { state, api, esc, fmtDate, ago, money, stageChip, roleChip, scoreColor, STAGE_META, toast, modal, confirmDialog, fd, route, page, loading } = C
  C.views = C.views || {}
  const kpi = (...a) => C.views.kpi(...a)

  const PALETTE = ['#c2410c', '#f59e0b', '#16a34a', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#78716c']
  const STAGE_COLOR = { draft: '#a8a29e', submitted: '#3b82f6', under_review: '#eab308', revision_requested: '#f97316', approved: '#22c55e', awarded: '#059669', rejected: '#ef4444', withdrawn: '#78716c' }
  function chart(id, config) {
    const el = document.getElementById(id)
    if (!el || !window.Chart) return
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif'
    Chart.defaults.color = '#78716c'
    state.charts.push(new Chart(el, config))
  }
  const noGrid = { grid: { display: false }, border: { display: false } }
  const softGrid = { grid: { color: '#f5f0e6' }, border: { display: false }, beginAtZero: true, ticks: { precision: 0 } }

  // ---------------------------------------------------------------------------
  // Staff dashboard (admin / adjudicator)
  // ---------------------------------------------------------------------------
  C.views.staffDashboard = async function () {
    loading('Programme dashboard')
    const a = await api('/analytics')
    const k = a.kpis
    const decided = (k.approved || 0) + (k.rejected || 0)
    page(
      `<section class="photo-banner p-6 sm:p-8 mb-6"><img class="photo-banner-img" src="/static/img/city-aerial.webp" alt="">
        <p class="text-xs font-semibold tracking-widest uppercase text-amber-300">Programme overview</p>
        <h2 class="text-2xl sm:text-3xl font-extrabold mt-2">${k.in_pipeline} ideas in the pipeline, ${k.open_assignments} evaluations open.</h2>
        <p class="text-white/70 mt-2 text-sm max-w-xl">Live numbers from every round. Click a pipeline bar or a leaderboard row to drill in.</p>
        <div class="mt-5 flex flex-wrap gap-2"><a href="#/queue" class="btn-primary"><i class="fas fa-gavel"></i> Adjudication queue</a><a href="#/reports" class="btn-outline-lg !py-2 !px-4 !text-sm"><i class="fas fa-file-export mr-2"></i>Reports</a></div>
      </section>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${kpi('Submissions', k.total_submissions, `${k.submitters} registered innovators`, 'fa-lightbulb')}
        ${kpi('In pipeline', k.in_pipeline, `${k.awaiting_revision} awaiting revision`, 'fa-diagram-project')}
        ${kpi('Approved / awarded', k.approved, decided ? `${Math.round((k.approved / decided) * 100)}% of decided ideas` : 'no decisions yet', 'fa-award')}
        ${kpi('Average score', k.avg_score != null ? k.avg_score + '%' : '—', `${k.completed_assignments} evaluations completed`, 'fa-scale-balanced')}
        ${kpi('Open evaluations', k.open_assignments, `${k.evaluators} evaluators on the panel`, 'fa-clipboard-check')}
        ${kpi('Avg. turnaround', k.avg_turnaround_hours > 0 ? (k.avg_turnaround_hours >= 48 ? Math.round(k.avg_turnaround_hours / 24) + ' days' : k.avg_turnaround_hours + ' h') : '—', 'assignment to score', 'fa-stopwatch')}
        ${kpi('Funding requested', 'BWP ' + (k.total_budget_requested >= 1e6 ? (k.total_budget_requested / 1e6).toFixed(2).replace(/\.?0+$/, '') + 'm' : Math.round(k.total_budget_requested / 1000) + 'k'), 'across all submissions', 'fa-coins')}
        ${kpi('Feedback items', k.feedback_items, 'messages to innovators', 'fa-comments')}
      </div>
      <div class="grid lg:grid-cols-3 gap-5 mt-6">
        <div class="card lg:col-span-2"><h3 class="card-title">Pipeline by stage</h3><div class="h-64 mt-3"><canvas id="c-stage"></canvas></div></div>
        <div class="card"><h3 class="card-title">By category</h3><div class="h-64 mt-3"><canvas id="c-cat"></canvas></div></div>
        <div class="card lg:col-span-2"><h3 class="card-title">Submissions over time</h3><div class="h-56 mt-3"><canvas id="c-time"></canvas></div></div>
        <div class="card"><h3 class="card-title">Score distribution</h3><div class="h-56 mt-3"><canvas id="c-score"></canvas></div></div>
        <div class="card"><h3 class="card-title">Reach by district</h3><div class="h-64 mt-3"><canvas id="c-district"></canvas></div></div>
        <div class="card lg:col-span-2"><h3 class="card-title">Leaderboard</h3>
          <div class="table-wrap mt-3 border-0"><table class="table"><thead><tr><th>#</th><th>Idea</th><th>Stage</th><th>Evals</th><th class="text-right">Avg</th></tr></thead><tbody>${a.leaderboard
            .map((l, i) => `<tr><td class="font-bold text-stone-400">${i + 1}</td><td><a href="#/ideas/${l.id}" class="font-semibold hover:text-brand-700">${esc(l.title)}</a><div class="text-xs text-stone-500">${esc(l.ref_code)} · ${esc(l.category_name || '')}</div></td><td>${stageChip(l.stage)}</td><td>${l.evaluations}</td><td class="text-right font-extrabold ${scoreColor(l.avg_score)}">${l.avg_score}%</td></tr>`)
            .join('') || '<tr><td colspan="5" class="text-center text-stone-500 py-6">No scored ideas yet</td></tr>'}</tbody></table></div></div>
        <div class="card lg:col-span-2"><h3 class="card-title">Evaluator workload</h3><div class="h-56 mt-3"><canvas id="c-eval"></canvas></div></div>
        <div class="card"><h3 class="card-title">Recent activity</h3><ul class="mt-3 space-y-3 text-sm max-h-60 overflow-y-auto">${a.recent_activity
          .map((r) => `<li class="flex gap-3"><i class="fas fa-circle text-[6px] text-brand-600 mt-2"></i><span><span class="font-semibold">${esc(r.actor_name || 'System')}</span> <span class="text-stone-600">${esc(r.action.replace('.', ' '))}</span> <span class="text-stone-400">${esc(r.entity_type || '')} ${r.entity_id ? '#' + r.entity_id : ''}</span><span class="block text-[11px] text-stone-400">${ago(r.created_at)}</span></span></li>`)
          .join('')}</ul></div>
      </div>`,
      'Programme dashboard'
    )
    const stages = a.by_stage.filter((s) => s.stage !== 'draft')
    chart('c-stage', { type: 'bar', data: { labels: stages.map((s) => (STAGE_META[s.stage] || [s.stage])[0]), datasets: [{ data: stages.map((s) => s.n), backgroundColor: stages.map((s) => STAGE_COLOR[s.stage]), borderRadius: 8, maxBarThickness: 48 }] }, options: { maintainAspectRatio: false, onHover: (e, els) => (e.native.target.style.cursor = els.length ? 'pointer' : 'default'), onClick: (e, els) => { if (!els.length) return; sessionStorage.setItem('ceda_idea_filters', 'stage=' + stages[els[0].index].stage); C.navigate('/ideas') }, plugins: { legend: { display: false } }, scales: { x: noGrid, y: softGrid } } })
    chart('c-cat', { type: 'doughnut', data: { labels: a.by_category.map((c) => c.name), datasets: [{ data: a.by_category.map((c) => c.n), backgroundColor: PALETTE, borderWidth: 2, borderColor: '#fff' }] }, options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } } } })
    let run = 0
    chart('c-time', { type: 'line', data: { labels: a.timeline.map((t) => dayjs(t.day).format('DD MMM')), datasets: [{ label: 'Cumulative', data: a.timeline.map((t) => (run += t.n)), borderColor: '#c2410c', backgroundColor: 'rgba(194,65,12,.12)', fill: true, tension: 0.35, pointRadius: 3 }, { label: 'Per day', data: a.timeline.map((t) => t.n), type: 'bar', backgroundColor: '#fed7aa', borderRadius: 4, maxBarThickness: 18 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { x: noGrid, y: softGrid } } })
    const buckets = ['0-39', '40-59', '60-79', '80-100']
    chart('c-score', { type: 'bar', data: { labels: buckets.map((b) => b + '%'), datasets: [{ data: buckets.map((b) => (a.score_distribution.find((s) => s.bucket === b) || { n: 0 }).n), backgroundColor: ['#ef4444', '#f59e0b', '#84cc16', '#16a34a'], borderRadius: 8 }] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: noGrid, y: softGrid } } })
    chart('c-district', { type: 'bar', data: { labels: a.by_district.map((d) => d.district), datasets: [{ data: a.by_district.map((d) => d.n), backgroundColor: '#f59e0b', borderRadius: 6 }] }, options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: softGrid, y: noGrid } } })
    chart('c-eval', { type: 'bar', data: { labels: a.evaluators.map((e) => e.name), datasets: [{ label: 'Completed', data: a.evaluators.map((e) => e.completed), backgroundColor: '#16a34a', borderRadius: 6 }, { label: 'Open', data: a.evaluators.map((e) => e.total - e.completed), backgroundColor: '#fde68a', borderRadius: 6 }] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10 } } }, scales: { x: { ...noGrid, stacked: true }, y: { ...softGrid, stacked: true } } } })
  }

  // ---------------------------------------------------------------------------
  // Rounds & criteria
  // ---------------------------------------------------------------------------
  route('/rounds', async () => {
    loading('Rounds & criteria')
    const [{ rounds }, { categories }] = await Promise.all([api('/evaluation/rounds'), api('/categories')])
    page(
      `<div class="info-box mb-5"><i class="fas fa-circle-info mr-2"></i>Ideas move through these rounds in order. Each evaluator's score is the weighted average of the criteria below, expressed as a percentage. Changes apply to new evaluations.</div>
      <div class="space-y-5">${rounds
        .map((r) => {
          const tw = r.criteria.reduce((s, c) => s + c.weight, 0)
          return `<div class="card">
            <div class="flex flex-wrap items-start gap-3">
              <span class="w-10 h-10 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center">${r.stage_order}</span>
              <div class="flex-1 min-w-0"><h3 class="font-extrabold text-lg">${esc(r.name)}</h3><p class="text-sm text-stone-500">${esc(r.description || '')}</p>
                <div class="flex flex-wrap gap-2 mt-2 text-xs"><span class="chip ${r.status === 'open' ? 'chip-green' : 'chip-gray'}">${r.status}</span><span class="chip chip-gray">min ${r.min_evaluators} evaluators</span><span class="chip chip-gray">pass ${r.pass_threshold}%</span>${r.blind_review ? '<span class="chip chip-purple"><i class="fas fa-user-secret"></i>blind review</span>' : '<span class="chip chip-gray">open review</span>'}</div></div>
              <button class="btn-secondary btn-sm" data-edit-round="${r.id}"><i class="fas fa-pen"></i> Edit round</button>
            </div>
            <div class="table-wrap mt-4"><table class="table"><thead><tr><th>Criterion</th><th>Weight</th><th>Share</th><th>Max</th><th></th></tr></thead><tbody>${r.criteria
              .map((c) => `<tr><td><span class="font-semibold">${esc(c.name)}</span><div class="text-xs text-stone-500">${esc(c.description || '')}</div></td><td>×${c.weight}</td><td><div class="flex items-center gap-2"><div class="h-1.5 w-20 rounded-full bg-stone-100 overflow-hidden"><div class="h-full bg-brand-600" style="width:${tw ? (c.weight / tw) * 100 : 0}%"></div></div><span class="text-xs text-stone-500">${tw ? Math.round((c.weight / tw) * 100) : 0}%</span></div></td><td>${c.max_score}</td><td class="text-right whitespace-nowrap"><button class="btn-ghost btn-sm" data-edit-crit="${c.id}" aria-label="Edit"><i class="fas fa-pen"></i></button><button class="btn-ghost btn-sm text-red-600" data-del-crit="${c.id}" aria-label="Delete"><i class="fas fa-trash"></i></button></td></tr>`)
              .join('') || '<tr><td colspan="5" class="text-center text-stone-500 py-4">No criteria yet</td></tr>'}</tbody></table></div>
            <button class="btn-ghost btn-sm mt-3" data-add-crit="${r.id}"><i class="fas fa-plus"></i> Add criterion</button>
          </div>`
        })
        .join('')}</div>
      <button class="btn-primary mt-5" id="add-round"><i class="fas fa-plus"></i> Add round</button>
      <h3 class="card-title mt-8 mb-3">Innovation categories</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${categories
        .map((c) => `<div class="card ${c.is_active ? '' : 'opacity-60'}"><div class="flex items-start gap-3"><span class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><i class="fas ${esc(c.icon)}"></i></span><div class="flex-1 min-w-0"><p class="font-bold">${esc(c.name)}</p><p class="text-xs text-stone-500">${esc(c.description || '')}</p>${c.strategic_priority ? `<p class="text-[11px] text-brand-700 mt-1">${esc(c.strategic_priority)}</p>` : ''}</div></div><div class="flex items-center justify-between mt-3 text-xs text-stone-500"><span>${c.idea_count} ideas</span><button class="btn-ghost btn-sm" data-toggle-cat="${c.id}" data-active="${c.is_active}">${c.is_active ? 'Deactivate' : 'Activate'}</button></div></div>`)
        .join('')}
        <button class="card border-dashed text-stone-500 hover:text-brand-700 hover:border-brand-300 flex items-center justify-center gap-2" id="add-cat"><i class="fas fa-plus"></i> Add category</button></div>`,
      'Rounds & criteria'
    )
    const all = rounds.flatMap((r) => r.criteria)
    const roundForm = (r = {}) => `<form id="rf" class="space-y-4"><h3 class="text-lg font-bold">${r.id ? 'Edit round' : 'New round'}</h3>
      <div><label class="label">Name</label><input class="input" name="name" value="${esc(r.name || '')}" required></div>
      <div><label class="label">Description</label><textarea class="textarea" name="description" rows="2">${esc(r.description || '')}</textarea></div>
      <div class="grid grid-cols-3 gap-3"><div><label class="label">Min evaluators</label><input class="input" type="number" min="1" name="min_evaluators" value="${r.min_evaluators || 2}"></div><div><label class="label">Pass mark %</label><input class="input" type="number" min="0" max="100" name="pass_threshold" value="${r.pass_threshold ?? 60}"></div><div><label class="label">Status</label><select class="select" name="status"><option value="open" ${r.status !== 'closed' ? 'selected' : ''}>Open</option><option value="closed" ${r.status === 'closed' ? 'selected' : ''}>Closed</option></select></div></div>
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="blind_review" ${r.blind_review !== 0 ? 'checked' : ''}> Blind review (hide innovator identity from evaluators)</label>
      <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary">Save</button></div></form>`
    const critForm = (c = {}) => `<form id="cf" class="space-y-4"><h3 class="text-lg font-bold">${c.id ? 'Edit criterion' : 'New criterion'}</h3>
      <div><label class="label">Name</label><input class="input" name="name" value="${esc(c.name || '')}" required></div>
      <div><label class="label">Guidance for evaluators</label><textarea class="textarea" name="description" rows="2">${esc(c.description || '')}</textarea></div>
      <div class="grid grid-cols-2 gap-3"><div><label class="label">Weight</label><input class="input" type="number" step="0.5" min="0.5" name="weight" value="${c.weight || 1}"></div><div><label class="label">Max score</label><input class="input" type="number" min="1" name="max_score" value="${c.max_score || 10}"></div></div>
      <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary">Save</button></div></form>`
    const submitForm = (sel, fn) => (root, close) => {
      const f = root.querySelector(sel)
      f.onsubmit = async (e) => { e.preventDefault(); try { await fn(f); close(); toast('Saved'); C.render() } catch (err) { toast(err.message, 'error') } }
    }
    const roundBody = (f) => ({ ...fd(f), blind_review: f.blind_review.checked })
    document.getElementById('add-round').onclick = () => modal(roundForm(), submitForm('#rf', (f) => api('/evaluation/rounds', { method: 'POST', body: roundBody(f) })))
    document.querySelectorAll('[data-edit-round]').forEach((b) => (b.onclick = () => { const r = rounds.find((x) => x.id == b.dataset.editRound); modal(roundForm(r), submitForm('#rf', (f) => api('/evaluation/rounds/' + r.id, { method: 'PUT', body: roundBody(f) }))) }))
    document.querySelectorAll('[data-add-crit]').forEach((b) => (b.onclick = () => modal(critForm(), submitForm('#cf', (f) => api(`/evaluation/rounds/${b.dataset.addCrit}/criteria`, { method: 'POST', body: fd(f) })))))
    document.querySelectorAll('[data-edit-crit]').forEach((b) => (b.onclick = () => { const c = all.find((x) => x.id == b.dataset.editCrit); modal(critForm(c), submitForm('#cf', (f) => api('/evaluation/criteria/' + c.id, { method: 'PUT', body: fd(f) }))) }))
    document.querySelectorAll('[data-del-crit]').forEach((b) => (b.onclick = async () => { if (await confirmDialog('Delete criterion?', 'Criteria that already have scores cannot be deleted.', 'Delete', true)) { try { await api('/evaluation/criteria/' + b.dataset.delCrit, { method: 'DELETE' }); toast('Criterion deleted'); C.render() } catch (err) { toast(err.message, 'error') } } }))
    document.querySelectorAll('[data-toggle-cat]').forEach((b) => (b.onclick = async () => { await api('/categories/' + b.dataset.toggleCat, { method: 'PUT', body: { is_active: b.dataset.active !== '1' } }); C.render() }))
    document.getElementById('add-cat').onclick = () => modal(`<form id="catf" class="space-y-4"><h3 class="text-lg font-bold">New category</h3><div><label class="label">Name</label><input class="input" name="name" required></div><div><label class="label">Description</label><input class="input" name="description"></div><div><label class="label">Strategic priority</label><input class="input" name="strategic_priority" placeholder="e.g. NDP 12 · economic diversification"></div><div><label class="label">Icon (Font Awesome)</label><input class="input" name="icon" placeholder="fa-seedling"></div><div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary">Create</button></div></form>`, submitForm('#catf', (f) => api('/categories', { method: 'POST', body: fd(f) })))
  }, { roles: ['admin'] })

  // ---------------------------------------------------------------------------
  // Users & roles
  // ---------------------------------------------------------------------------
  route('/users', async () => {
    loading('Users & roles')
    const q = new URLSearchParams(sessionStorage.getItem('ceda_user_filters') || '')
    const { users } = await api('/users?' + q.toString())
    const me = state.user
    page(
      `<div class="flex flex-wrap gap-3 items-end mb-4">
        <form id="uf" class="flex flex-wrap gap-3 items-end flex-1"><div class="flex-1 min-w-[12rem]"><label class="label">Search</label><input class="input" name="search" value="${esc(q.get('search') || '')}" placeholder="Name or email"></div>
        <div><label class="label">Role</label><select class="select" name="role"><option value="">All roles</option>${['submitter', 'evaluator', 'adjudicator', 'admin'].map((r) => `<option value="${r}" ${q.get('role') === r ? 'selected' : ''}>${r}</option>`).join('')}</select></div><button class="btn-secondary">Filter</button></form>
        <button class="btn-primary" id="add-user"><i class="fas fa-user-plus"></i> Add staff user</button>
      </div>
      <div class="table-wrap"><table class="table"><thead><tr><th>User</th><th>Role</th><th>Organisation</th><th>Activity</th><th>Last sign-in</th><th>Status</th><th></th></tr></thead><tbody>${users
        .map((u) => `<tr class="${u.is_active ? '' : 'opacity-50'}"><td><p class="font-semibold">${esc(u.name)}</p><p class="text-xs text-stone-500">${esc(u.email)}</p></td><td>${roleChip(u.role)}</td><td class="text-xs">${esc(u.organisation || '—')}${u.district ? `<br><span class="text-stone-400">${esc(u.district)}</span>` : ''}</td><td class="text-xs">${u.role === 'submitter' ? `${u.idea_count} ideas` : `${u.assignment_count} assignments`}</td><td class="text-xs">${u.last_login_at ? ago(u.last_login_at) : 'never'}</td><td>${u.is_active ? '<span class="chip chip-green">active</span>' : '<span class="chip chip-gray">inactive</span>'}</td><td class="text-right">${u.id !== me.id ? `<button class="btn-ghost btn-sm" data-edit-user="${u.id}"><i class="fas fa-pen"></i></button>` : '<span class="text-xs text-stone-400">you</span>'}</td></tr>`)
        .join('')}</tbody></table></div>`,
      'Users & roles'
    )
    const uf = document.getElementById('uf')
    uf.onsubmit = (e) => { e.preventDefault(); sessionStorage.setItem('ceda_user_filters', new URLSearchParams(Object.entries(fd(uf)).filter(([, v]) => v)).toString()); C.render() }
    const roleSel = (cur) => `<select class="select" name="role">${['submitter', 'evaluator', 'adjudicator', 'admin'].map((r) => `<option value="${r}" ${cur === r ? 'selected' : ''}>${r}</option>`).join('')}</select>`
    document.getElementById('add-user').onclick = () => modal(
      `<form id="nu" class="space-y-4"><h3 class="text-lg font-bold">Add user</h3>
        <div class="grid grid-cols-2 gap-3"><div><label class="label">Full name</label><input class="input" name="name" required></div><div><label class="label">Email</label><input class="input" type="email" name="email" required></div></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="label">Role</label>${roleSel('evaluator')}</div><div><label class="label">Temporary password</label><input class="input" name="password" minlength="8" required></div></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="label">Organisation</label><input class="input" name="organisation"></div><div><label class="label">District</label><input class="input" name="district"></div></div>
        <div><label class="label">Expertise</label><input class="input" name="expertise" placeholder="e.g. Agri-tech, finance, ICT"></div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary">Create user</button></div></form>`,
      (root, close) => { const f = root.querySelector('#nu'); f.onsubmit = async (e) => { e.preventDefault(); try { await api('/users', { method: 'POST', body: fd(f) }); close(); toast('User created'); C.render() } catch (err) { toast(err.message, 'error') } } }
    )
    document.querySelectorAll('[data-edit-user]').forEach((b) => (b.onclick = () => {
      const u = users.find((x) => x.id == b.dataset.editUser)
      modal(
        `<form id="eu" class="space-y-4"><h3 class="text-lg font-bold">Edit ${esc(u.name)}</h3><p class="text-xs text-stone-500 -mt-3">${esc(u.email)}</p>
          <div class="grid grid-cols-2 gap-3"><div><label class="label">Name</label><input class="input" name="name" value="${esc(u.name)}"></div><div><label class="label">Role</label>${roleSel(u.role)}</div></div>
          <div class="grid grid-cols-2 gap-3"><div><label class="label">Organisation</label><input class="input" name="organisation" value="${esc(u.organisation || '')}"></div><div><label class="label">District</label><input class="input" name="district" value="${esc(u.district || '')}"></div></div>
          <div><label class="label">Expertise</label><input class="input" name="expertise" value="${esc(u.expertise || '')}"></div>
          <div><label class="label">Reset password <span class="font-normal text-stone-400">(optional, signs the user out)</span></label><input class="input" name="password" minlength="8"></div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" name="is_active" ${u.is_active ? 'checked' : ''}> Account active</label>
          <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" data-close>Cancel</button><button class="btn-primary">Save</button></div></form>`,
        (root, close) => { const f = root.querySelector('#eu'); f.onsubmit = async (e) => { e.preventDefault(); try { await api('/users/' + u.id, { method: 'PUT', body: { ...fd(f), is_active: f.is_active.checked } }); close(); toast('User updated'); C.render() } catch (err) { toast(err.message, 'error') } } }
      )
    }))
  }, { roles: ['admin'] })

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------
  route('/settings', async () => {
    loading('Settings')
    const { settings: s } = await api('/settings')
    const dl = s.submission_deadline ? s.submission_deadline.slice(0, 16).replace(' ', 'T') : ''
    page(
      `<form id="sf" class="card max-w-2xl space-y-5">
        <h3 class="card-title">Programme settings</h3>
        <div><label class="label">Programme name</label><input class="input" name="programme_name" value="${esc(s.programme_name || '')}"></div>
        <label class="flex items-start gap-3 p-4 rounded-xl border border-sand-200"><input type="checkbox" name="submission_open" ${s.submission_open !== '0' ? 'checked' : ''} class="mt-0.5"><span><strong class="text-sm">Accept new submissions</strong><span class="block text-xs text-stone-500">Turn off to close the call. Existing ideas continue through evaluation.</span></span></label>
        <div class="grid sm:grid-cols-2 gap-4"><div><label class="label">Submission deadline</label><input class="input" type="datetime-local" name="submission_deadline" value="${esc(dl)}"></div><div><label class="label">Maximum resubmissions</label><input class="input" type="number" min="0" max="10" name="max_resubmissions" value="${esc(s.max_resubmissions || '2')}"></div></div>
        <div><label class="label">Contact email</label><input class="input" type="email" name="contact_email" value="${esc(s.contact_email || '')}"></div>
        <button class="btn-primary">Save settings</button>
      </form>`,
      'Settings'
    )
    const f = document.getElementById('sf')
    f.onsubmit = async (e) => {
      e.preventDefault()
      const v = fd(f)
      v.submission_open = f.submission_open.checked ? '1' : '0'
      if (v.submission_deadline) v.submission_deadline = v.submission_deadline.replace('T', ' ') + ':00'
      try { await api('/settings', { method: 'PUT', body: v }); toast('Settings saved') } catch (err) { toast(err.message, 'error') }
    }
  }, { roles: ['admin'] })

  // ---------------------------------------------------------------------------
  // Audit log
  // ---------------------------------------------------------------------------
  route('/audit', async () => {
    loading('Audit log')
    const { audit } = await api('/audit')
    const filter = sessionStorage.getItem('ceda_audit_q') || ''
    const rows = filter ? audit.filter((r) => (r.action + ' ' + (r.actor_name || '') + ' ' + (r.entity_type || '')).toLowerCase().includes(filter.toLowerCase())) : audit
    const icon = (a) => (a.startsWith('auth') ? 'fa-key' : a.startsWith('idea') ? 'fa-lightbulb' : a.startsWith('evaluation') ? 'fa-clipboard-check' : a.startsWith('decision') ? 'fa-gavel' : a.startsWith('assignment') ? 'fa-people-arrows' : a.startsWith('report') ? 'fa-file-export' : a.startsWith('user') ? 'fa-user-gear' : 'fa-circle-dot')
    page(
      `<div class="info-box mb-4"><i class="fas fa-shield-halved mr-2"></i>Every sign-in, submission, score, decision and export is recorded with the actor, time and IP address. Records cannot be edited from the portal. Supports accountability under the Data Protection Act, 2024.</div>
      <form id="af" class="flex gap-3 mb-4"><input class="input flex-1" name="q" value="${esc(filter)}" placeholder="Filter by action, person or entity"><button class="btn-secondary">Filter</button></form>
      <p class="text-xs text-stone-500 mb-2">Showing ${rows.length} of ${audit.length} most recent events</p>
      <div class="table-wrap"><table class="table"><thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Entity</th><th>Details</th><th>IP</th></tr></thead><tbody>${rows
        .map((r) => `<tr><td class="text-xs whitespace-nowrap">${fmtDate(r.created_at)}</td><td class="text-sm">${esc(r.actor_name || 'System')}<div class="text-[11px] text-stone-400">${esc(r.actor_email || '')}</div></td><td><span class="font-mono text-xs"><i class="fas ${icon(r.action)} text-brand-600 mr-1.5"></i>${esc(r.action)}</span></td><td class="text-xs">${esc(r.entity_type || '')}${r.entity_id ? ' #' + r.entity_id : ''}</td><td class="text-[11px] text-stone-500 font-mono max-w-xs truncate" title="${esc(r.meta || '')}">${esc(r.meta || '')}</td><td class="text-[11px] text-stone-400">${esc(r.ip || '')}</td></tr>`)
        .join('')}</tbody></table></div>`,
      'Audit log'
    )
    const af = document.getElementById('af')
    af.onsubmit = (e) => { e.preventDefault(); sessionStorage.setItem('ceda_audit_q', af.q.value); C.render() }
  }, { roles: ['admin'] })

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------
  const REPORTS = [
    ['ideas', 'All submissions', 'fa-lightbulb', 'Every non-draft idea with stage, round, category, budget and average score.'],
    ['scores', 'Criterion scores', 'fa-table-cells', 'Every score by evaluator and criterion, with comments and recommendations.'],
    ['decisions', 'Panel decisions', 'fa-gavel', 'All adjudication decisions with rationale and aggregate score.'],
    ['evaluators', 'Evaluator performance', 'fa-user-check', 'Assignments, completions and average score given per evaluator.']
  ]
  route('/reports', async () => {
    const can = ['admin', 'adjudicator'].includes(state.user.role)
    page(
      `${can ? '' : '<div class="info-box mb-4">Reports are available to adjudicators and administrators.</div>'}
      <div class="grid md:grid-cols-2 gap-4">${REPORTS.map(([k, t, ic, d]) => `<div class="card"><div class="flex items-start gap-3"><span class="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center"><i class="fas ${ic}"></i></span><div class="flex-1"><h3 class="font-bold">${t}</h3><p class="text-sm text-stone-500 mt-1">${d}</p></div></div>
        <div class="flex gap-2 mt-4"><button class="btn-primary btn-sm" data-csv="${k}" ${can ? '' : 'disabled'}><i class="fas fa-file-csv"></i> Download CSV</button><button class="btn-secondary btn-sm" data-preview="${k}" ${can ? '' : 'disabled'}><i class="fas fa-eye"></i> Preview</button></div></div>`).join('')}</div>
      <div id="preview" class="mt-6"></div>`,
      'Reports'
    )
    if (!can) return
    document.querySelectorAll('[data-csv]').forEach((b) => (b.onclick = async () => {
      const res = await fetch('/api/reports/' + b.dataset.csv, { headers: { Authorization: 'Bearer ' + state.token } })
      if (!res.ok) return toast('Export failed', 'error')
      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `ceda-${b.dataset.csv}-${dayjs().format('YYYY-MM-DD')}.csv`
      a.click()
      URL.revokeObjectURL(a.href)
      toast('Report downloaded. The export was recorded in the audit log.')
    }))
    document.querySelectorAll('[data-preview]').forEach((b) => (b.onclick = async () => {
      const { rows } = await api(`/reports/${b.dataset.preview}?format=json`)
      const cols = rows.length ? Object.keys(rows[0]) : []
      document.getElementById('preview').innerHTML = `<h3 class="card-title mb-3">${REPORTS.find((r) => r[0] === b.dataset.preview)[1]} · ${rows.length} rows</h3>${rows.length ? `<div class="table-wrap"><table class="table"><thead><tr>${cols.map((c) => `<th>${esc(c.replace(/_/g, ' '))}</th>`).join('')}</tr></thead><tbody>${rows.slice(0, 50).map((r) => `<tr>${cols.map((c) => `<td class="text-xs max-w-xs truncate">${esc(r[c] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="card text-sm text-stone-500">No rows yet.</p>'}`
    }))
  })
})()
