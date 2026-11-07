/* CEDA Innovation Portal - SPA (vanilla JS, hash router) */
(function () {
  'use strict'
  dayjs.extend(window.dayjs_plugin_relativeTime)

  // ---------------------------------------------------------------------------
  // State & API client
  // ---------------------------------------------------------------------------
  const state = { user: null, token: localStorage.getItem('ceda_token'), unread: 0, cache: {}, charts: [] }

  async function api(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
    if (state.token) headers.Authorization = 'Bearer ' + state.token
    const res = await fetch('/api' + path, { ...opts, headers, body: opts.body ? JSON.stringify(opts.body) : undefined })
    if (res.status === 401 && !path.startsWith('/auth/login')) {
      setUser(null, null)
      navigate('/login')
      throw new Error('Session expired. Please sign in again.')
    }
    const ct = res.headers.get('Content-Type') || ''
    const data = ct.includes('json') ? await res.json() : await res.text()
    if (!res.ok) {
      const err = new Error((data && data.error) || 'Request failed')
      err.details = data && data.details
      err.status = res.status
      throw err
    }
    return data
  }

  function setUser(user, token) {
    state.user = user
    state.token = token
    if (token) localStorage.setItem('ceda_token', token)
    else localStorage.removeItem('ceda_token')
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
  const fmtDate = (d) => (d ? dayjs(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z')).format('DD MMM YYYY, HH:mm') : '—')
  const ago = (d) => (d ? dayjs(d.replace(' ', 'T') + (d.includes('Z') || d.includes('+') ? '' : 'Z')).fromNow() : '—')
  const money = (n) => (n == null ? '—' : 'BWP ' + Number(n).toLocaleString('en-BW', { maximumFractionDigits: 0 }))
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>')

  const STAGE_META = {
    draft: ['Draft', 'chip-gray', 'fa-pen'],
    submitted: ['Submitted', 'chip-blue', 'fa-paper-plane'],
    under_review: ['Under review', 'chip-yellow', 'fa-magnifying-glass'],
    revision_requested: ['Revision requested', 'chip-orange', 'fa-rotate-left'],
    approved: ['Approved', 'chip-green', 'fa-circle-check'],
    awarded: ['Awarded', 'chip-emerald', 'fa-award'],
    rejected: ['Not selected', 'chip-red', 'fa-circle-xmark'],
    withdrawn: ['Withdrawn', 'chip-gray', 'fa-ban']
  }
  const stageChip = (s) => {
    const m = STAGE_META[s] || [s, 'chip-gray', 'fa-circle']
    return `<span class="chip ${m[1]}"><i class="fas ${m[2]}"></i>${m[0]}</span>`
  }
  const ROLE_META = { submitter: ['Innovator', 'chip-blue'], evaluator: ['Evaluator', 'chip-purple'], adjudicator: ['Adjudicator', 'chip-orange'], admin: ['Administrator', 'chip-red'] }
  const roleChip = (r) => `<span class="chip ${(ROLE_META[r] || ['?', 'chip-gray'])[1]}">${(ROLE_META[r] || [r])[0]}</span>`
  const recChip = (r) => (r ? `<span class="chip ${r === 'advance' ? 'chip-green' : r === 'revise' ? 'chip-orange' : 'chip-red'}">${r}</span>` : '<span class="chip chip-gray">—</span>')
  const asgChip = (s) => `<span class="chip ${s === 'completed' ? 'chip-green' : s === 'in_progress' ? 'chip-yellow' : s === 'declined' ? 'chip-red' : 'chip-gray'}">${s.replace('_', ' ')}</span>`
  const scoreColor = (n) => (n == null ? 'text-stone-400' : n >= 80 ? 'text-green-600' : n >= 60 ? 'text-amber-600' : 'text-red-600')

  function toast(msg, type = 'success') {
    const el = document.createElement('div')
    el.className = 'toast ' + type
    el.innerHTML = `<i class="fas ${type === 'success' ? 'fa-circle-check text-green-400' : type === 'error' ? 'fa-triangle-exclamation text-red-400' : 'fa-circle-info text-blue-400'} mt-0.5"></i><span>${esc(msg)}</span>`
    document.getElementById('toast-root').appendChild(el)
    setTimeout(() => el.remove(), 4200)
  }

  function modal(html, onMount) {
    const root = document.getElementById('modal-root')
    root.innerHTML = `<div class="modal-backdrop" id="modal-backdrop"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`
    const close = () => (root.innerHTML = '')
    root.querySelector('#modal-backdrop').addEventListener('click', (e) => { if (e.target.id === 'modal-backdrop') close() })
    root.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close))
    if (onMount) onMount(root, close)
    return close
  }

  function confirmDialog(title, body, okLabel = 'Confirm', danger = false) {
    return new Promise((resolve) => {
      modal(
        `<h3 class="text-lg font-bold">${esc(title)}</h3><p class="text-sm text-stone-600 mt-2">${body}</p>
         <div class="mt-5 flex justify-end gap-2"><button class="btn-secondary" data-close>Cancel</button><button class="${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-ok">${esc(okLabel)}</button></div>`,
        (root, close) => {
          root.querySelector('#confirm-ok').onclick = () => { close(); resolve(true) }
          root.querySelector('[data-close]').addEventListener('click', () => resolve(false))
        }
      )
    })
  }

  const fd = (form) => Object.fromEntries(new FormData(form).entries())
  const destroyCharts = () => { state.charts.forEach((c) => c.destroy()); state.charts = [] }

  // ---------------------------------------------------------------------------
  // Router
  // ---------------------------------------------------------------------------
  const routes = []
  const route = (pattern, handler, opts = {}) => routes.push({ re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), handler, ...opts })
  const navigate = (path) => { location.hash = '#' + path }

  async function render() {
    destroyCharts()
    const path = location.hash.slice(1) || '/'
    const app = document.getElementById('app')
    for (const r of routes) {
      const m = path.match(r.re)
      if (!m) continue
      if (r.auth !== false && !state.user) {
        sessionStorage.setItem('ceda_redirect', path)
        return navigate('/login')
      }
      if (r.roles && !r.roles.includes(state.user.role)) {
        app.innerHTML = layout(`<div class="card text-center py-16"><i class="fas fa-lock text-4xl text-stone-300"></i><h2 class="text-xl font-bold mt-4">Access restricted</h2><p class="text-stone-500 mt-2">Your role (${esc(state.user.role)}) does not have permission to view this page.</p><a href="#/" class="btn-primary mt-6">Back to dashboard</a></div>`)
        return
      }
      try {
        await r.handler(m.groups || {}, path)
      } catch (e) {
        app.innerHTML = layout(`<div class="error-box"><strong>Something went wrong:</strong> ${esc(e.message)}</div>`)
      }
      return
    }
    app.innerHTML = layout(`<div class="card text-center py-16"><h2 class="text-xl font-bold">Page not found</h2><a href="#/" class="btn-primary mt-6">Go home</a></div>`)
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------
  function navItems() {
    const u = state.user
    const items = [{ href: '#/', icon: 'fa-gauge-high', label: 'Dashboard' }]
    if (u.role === 'submitter') {
      items.push({ href: '#/ideas', icon: 'fa-lightbulb', label: 'My ideas' }, { href: '#/ideas/new', icon: 'fa-plus-circle', label: 'New submission' })
    }
    if (u.role === 'evaluator') items.push({ href: '#/evaluate', icon: 'fa-clipboard-check', label: 'My evaluations' })
    if (u.role === 'adjudicator' || u.role === 'admin') {
      items.push({ href: '#/ideas', icon: 'fa-lightbulb', label: 'All ideas' }, { href: '#/queue', icon: 'fa-gavel', label: 'Adjudication' }, { href: '#/assignments', icon: 'fa-people-arrows', label: 'Assignments' }, { href: '#/evaluate', icon: 'fa-clipboard-check', label: 'Evaluations' })
    }
    if (u.role === 'admin') items.push({ href: '#/rounds', icon: 'fa-layer-group', label: 'Rounds & criteria' }, { href: '#/users', icon: 'fa-users-gear', label: 'Users & roles' }, { href: '#/settings', icon: 'fa-sliders', label: 'Settings' }, { href: '#/audit', icon: 'fa-shield-halved', label: 'Audit log' })
    if (u.role !== 'submitter') items.push({ href: '#/reports', icon: 'fa-file-export', label: 'Reports' })
    items.push({ href: '#/profile', icon: 'fa-user', label: 'Profile' })
    return items
  }

  function layout(content, title) {
    const u = state.user
    const cur = '#' + (location.hash.slice(1) || '/')
    return `
    <div class="flex min-h-screen">
      <aside class="hidden lg:flex flex-col w-64 bg-ink-900 text-white p-4 fixed inset-y-0 no-print" aria-label="Sidebar">
        <a href="/" class="flex items-center gap-3 px-2 py-2"><span class="brand-mark"><i class="fas fa-mountain-sun"></i></span><span class="leading-tight"><span class="block font-extrabold">CEDA Portal</span><span class="block text-[11px] text-white/50 -mt-0.5">Innovation Workspace</span></span></a>
        <nav class="mt-6 space-y-1 flex-1">${navItems().map((n) => `<a href="${n.href}" class="sidebar-link ${cur === n.href || (n.href !== '#/' && cur.startsWith(n.href) && !navItems().some((o) => o.href !== n.href && o.href.length > n.href.length && cur.startsWith(o.href))) ? 'active' : ''}"><i class="fas ${n.icon}"></i>${n.label}</a>`).join('')}</nav>
        <div class="border-t border-white/10 pt-4 px-2">
          <div class="flex items-center gap-3"><span class="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center font-bold">${esc(u.name.split(' ').map((p) => p[0]).slice(0, 2).join(''))}</span><div class="min-w-0"><p class="text-sm font-semibold truncate">${esc(u.name)}</p><p class="text-[11px] text-white/50 truncate">${roleChip(u.role)}</p></div></div>
          <button id="logout-btn" class="mt-3 w-full text-left sidebar-link"><i class="fas fa-right-from-bracket"></i>Sign out</button>
        </div>
      </aside>
      <div class="flex-1 lg:ml-64 flex flex-col min-w-0">
        <header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-sand-200 h-16 flex items-center px-4 sm:px-6 gap-3 no-print">
          <button id="mobile-nav-btn" class="lg:hidden btn-ghost px-2"><i class="fas fa-bars"></i></button>
          <h1 class="font-bold text-lg truncate">${esc(title || 'Dashboard')}</h1>
          <div class="ml-auto flex items-center gap-2">
            ${u.role === 'submitter' ? '<a href="#/ideas/new" class="btn-primary hidden sm:inline-flex"><i class="fas fa-plus"></i> New idea</a>' : ''}
            <div class="relative"><button id="notif-btn" class="btn-ghost px-3 relative" aria-label="Notifications"><i class="fas fa-bell"></i>${state.unread ? `<span class="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">${state.unread}</span>` : ''}</button><div id="notif-dropdown" class="dropdown hidden"></div></div>
          </div>
        </header>
        <div id="mobile-nav" class="hidden lg:hidden bg-ink-900 text-white p-3 space-y-1 no-print">${navItems().map((n) => `<a href="${n.href}" class="sidebar-link">${n.label}</a>`).join('')}<button id="logout-btn-m" class="sidebar-link w-full text-left">Sign out</button></div>
        <main class="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto">${content}</main>
      </div>
    </div>`
  }

  function wireLayout() {
    document.querySelectorAll('#logout-btn, #logout-btn-m').forEach((b) => (b.onclick = logout))
    const mb = document.getElementById('mobile-nav-btn')
    if (mb) mb.onclick = () => document.getElementById('mobile-nav').classList.toggle('hidden')
    const nb = document.getElementById('notif-btn')
    if (nb) nb.onclick = toggleNotifications
  }

  async function toggleNotifications() {
    const dd = document.getElementById('notif-dropdown')
    if (!dd.classList.contains('hidden')) return dd.classList.add('hidden')
    dd.classList.remove('hidden')
    dd.innerHTML = '<div class="p-4 text-sm text-stone-500">Loading…</div>'
    const { notifications } = await api('/notifications')
    dd.innerHTML = `<div class="flex items-center justify-between px-4 py-3 border-b border-sand-200"><strong class="text-sm">Notifications</strong><button id="mark-all" class="text-xs text-brand-700 font-semibold">Mark all read</button></div>
      <div class="max-h-96 overflow-y-auto">${notifications.length ? notifications.map((n) => `<div class="notif-item ${n.is_read ? '' : 'unread'}" data-link="${esc(n.link || '')}" data-id="${n.id}"><p class="font-semibold">${esc(n.title)}</p><p class="text-stone-600">${esc(n.body || '')}</p><p class="text-[11px] text-stone-400 mt-1">${ago(n.created_at)}</p></div>`).join('') : '<div class="p-6 text-center text-sm text-stone-500">No notifications yet</div>'}</div>`
    dd.querySelector('#mark-all').onclick = async () => { await api('/notifications/read', { method: 'POST', body: {} }); state.unread = 0; dd.classList.add('hidden'); render() }
    dd.querySelectorAll('.notif-item').forEach((el) => (el.onclick = async () => {
      await api('/notifications/read', { method: 'POST', body: { ids: [Number(el.dataset.id)] } })
      state.unread = Math.max(0, state.unread - (el.classList.contains('unread') ? 1 : 0))
      dd.classList.add('hidden')
      if (el.dataset.link) { const h = el.dataset.link.split('#')[1]; if (h) navigate(h); else render() } else render()
    }))
  }

  async function refreshUnread() {
    if (!state.user) return
    try { const { unread } = await api('/auth/me'); if (unread !== state.unread) { state.unread = unread; const b = document.getElementById('notif-btn'); if (b) b.innerHTML = `<i class="fas fa-bell"></i>${unread ? `<span class="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">${unread}</span>` : ''}` } } catch (_) {}
  }
  setInterval(refreshUnread, 20000)

  function page(content, title) {
    document.getElementById('app').innerHTML = layout(content, title)
    wireLayout()
  }
  const loading = (title) => page('<div class="space-y-4"><div class="skeleton h-24"></div><div class="skeleton h-64"></div></div>', title)

  async function logout() {
    try { await api('/auth/logout', { method: 'POST' }) } catch (_) {}
    setUser(null, null)
    navigate('/login')
  }

  // ---------------------------------------------------------------------------
  // Auth pages
  // ---------------------------------------------------------------------------
  function authShell(inner) {
    return `<div class="min-h-screen grid lg:grid-cols-2">
      <section class="auth-photo text-white p-10 lg:p-16 flex flex-col justify-between"><img src="/static/img/team-laptop.webp" alt="">
        <a href="/" class="flex items-center gap-3"><span class="brand-mark"><i class="fas fa-mountain-sun"></i></span><span class="font-extrabold text-lg">CEDA Innovation Portal</span></a>
        <div><p class="text-xs font-semibold tracking-widest uppercase text-amber-300">#KaeKapaKae</p><h2 class="text-4xl font-extrabold mt-3 leading-tight">From idea to award, <br>one transparent journey.</h2><p class="mt-4 text-white/70 max-w-md">Submit, track and improve your innovation with structured feedback from CEDA experts.</p>
          <div class="mt-8 glass-card p-4 text-sm"><p class="font-semibold mb-2"><i class="fas fa-key text-amber-300 mr-2"></i>Demo accounts (password: <code>Demo@2026</code>)</p>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-white/80 text-xs">
              <li><button class="demo-login hover:text-amber-300" data-e="thabo@youthventures.bw">Innovator · thabo@youthventures.bw</button></li>
              <li><button class="demo-login hover:text-amber-300" data-e="evaluator1@ceda.co.bw">Evaluator · evaluator1@ceda.co.bw</button></li>
              <li><button class="demo-login hover:text-amber-300" data-e="adjudicator@ceda.co.bw">Adjudicator · adjudicator@ceda.co.bw</button></li>
              <li><button class="demo-login hover:text-amber-300" data-e="admin@ceda.co.bw">Admin · admin@ceda.co.bw</button></li>
            </ul></div></div>
        <p class="text-xs text-white/50">Compliant with Botswana's Data Protection Act, 2024</p>
      </section>
      <section class="flex items-center justify-center p-6 sm:p-12"><div class="w-full max-w-md">${inner}</div></section></div>`
  }

  route('/login', async () => {
    document.getElementById('app').innerHTML = authShell(`
      <h1 class="text-2xl font-extrabold">Welcome back</h1><p class="text-stone-500 text-sm mt-1">Sign in to your workspace.</p>
      <form id="login-form" class="mt-6 space-y-4">
        <div><label class="label" for="email">Email</label><input class="input" id="email" name="email" type="email" required autocomplete="email"></div>
        <div><label class="label" for="password">Password</label><input class="input" id="password" name="password" type="password" required autocomplete="current-password"></div>
        <div id="login-error"></div>
        <button class="btn-primary w-full py-3" type="submit">Sign in</button>
      </form>
      <p class="text-sm text-stone-500 mt-6 text-center">New innovator? <a href="#/register" class="text-brand-700 font-semibold">Create an account</a></p>`)
    const f = document.getElementById('login-form')
    document.querySelectorAll('.demo-login').forEach((b) => (b.onclick = () => { f.email.value = b.dataset.e; f.password.value = 'Demo@2026'; f.requestSubmit() }))
    f.onsubmit = async (e) => {
      e.preventDefault()
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true
      try {
        const { token, user } = await api('/auth/login', { method: 'POST', body: fd(f) })
        setUser(user, token)
        const { unread } = await api('/auth/me'); state.unread = unread
        toast(`Welcome, ${user.name.replace(/^(Dr|Prof|Mr|Mrs|Ms)\.? /, '').split(' ')[0]}!`)
        const redir = sessionStorage.getItem('ceda_redirect'); sessionStorage.removeItem('ceda_redirect')
        navigate(redir && redir !== '/login' && redir !== '/register' ? redir : '/')
      } catch (err) { document.getElementById('login-error').innerHTML = `<div class="error-box">${esc(err.message)}</div>`; btn.disabled = false }
    }
  }, { auth: false })

  route('/register', async () => {
    document.getElementById('app').innerHTML = authShell(`
      <h1 class="text-2xl font-extrabold">Create your innovator account</h1><p class="text-stone-500 text-sm mt-1">Youth-led, citizen-owned companies (18–35, &gt;50% shareholding) are eligible.</p>
      <form id="reg-form" class="mt-6 space-y-4">
        <div><label class="label">Full name *</label><input class="input" name="name" required></div>
        <div><label class="label">Email *</label><input class="input" name="email" type="email" required></div>
        <div class="grid grid-cols-2 gap-3"><div><label class="label">Company / organisation</label><input class="input" name="organisation" placeholder="e.g. Pula AgriTech (Pty) Ltd"></div><div><label class="label">District</label><input class="input" name="district" placeholder="e.g. Serowe"></div></div>
        <div><label class="label">Phone</label><input class="input" name="phone" placeholder="+267"></div>
        <div><label class="label">Password * <span class="font-normal text-stone-400">(min 8 characters)</span></label><input class="input" name="password" type="password" minlength="8" required></div>
        <label class="flex gap-3 text-xs text-stone-600"><input type="checkbox" name="consent" class="mt-0.5" required><span>I consent to CEDA collecting and processing my personal data for this competition, in line with Botswana's Data Protection Act, 2024. Data is used only for stated purposes and retained only as long as necessary.</span></label>
        <div id="reg-error"></div>
        <button class="btn-primary w-full py-3" type="submit">Create account</button>
      </form>
      <p class="text-sm text-stone-500 mt-6 text-center">Already registered? <a href="#/login" class="text-brand-700 font-semibold">Sign in</a></p>`)
    const f = document.getElementById('reg-form')
    document.querySelectorAll('.demo-login').forEach((b) => (b.onclick = () => navigate('/login')))
    f.onsubmit = async (e) => {
      e.preventDefault()
      try {
        const body = fd(f); body.consent = !!body.consent
        const { token, user } = await api('/auth/register', { method: 'POST', body })
        setUser(user, token)
        toast('Account created. Welcome aboard!')
        navigate('/ideas/new')
      } catch (err) { document.getElementById('reg-error').innerHTML = `<div class="error-box">${esc(err.message)}</div>` }
    }
  }, { auth: false })

  const CAT_IMG = [[/agri|food/i, 'farmer-field'], [/manufact|mining/i, 'maker-sewing'], [/energy|climate|green/i, 'solar-rural'], [/touris|creative/i, 'elephants'], [/health|social/i, 'founder-macbook'], [/digital|fintech|ict/i, 'engineer']]
  const catImg = (name) => '/static/img/' + (CAT_IMG.find(([re]) => re.test(name || '')) || [0, 'delta-aerial'])[1] + '.webp'

  // Expose for later modules
  window.CEDA = { catImg, state, api, esc, fmtDate, ago, money, nl2br, stageChip, roleChip, recChip, asgChip, scoreColor, STAGE_META, toast, modal, confirmDialog, fd, route, navigate, page, loading, layout, wireLayout, render, setUser }

  // ---------------------------------------------------------------------------
  // Boot
  // ---------------------------------------------------------------------------
  async function boot() {
    if (state.token) {
      try { const { user, unread } = await api('/auth/me'); state.user = user; state.unread = unread } catch (_) { setUser(null, null) }
    }
    window.addEventListener('hashchange', render)
    document.addEventListener('click', (e) => { const dd = document.getElementById('notif-dropdown'); if (dd && !dd.classList.contains('hidden') && !e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) dd.classList.add('hidden') })
    // Load view modules then render
    await Promise.all(['/static/views-submitter.js', '/static/views-evaluate.js', '/static/views-admin.js'].map((src) => new Promise((res) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = res; document.body.appendChild(s) })))
    if (!location.hash) location.hash = '#/'
    render()
  }
  boot()
})()
