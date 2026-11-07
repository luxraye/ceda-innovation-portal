const HEAD = (title: string) => `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="CEDA Innovation Portal - submit, evaluate and track innovative ideas from Botswana's citizen entrepreneurs.">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='%23c2410c'/><path d='M20 60 Q50 20 80 60 Z' fill='%23fbbf24'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { theme: { extend: { colors: {
      brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
      sand: { 50:'#fdfbf7',100:'#f8f3ea',200:'#efe4d1' },
      ink: { 900:'#1b1917', 800:'#2a2623', 700:'#44403c' }
    }, fontFamily: { sans: ['Inter','ui-sans-serif','system-ui','sans-serif'] } } } }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
  <link href="/static/styles.css" rel="stylesheet">
`

export const landingPage = () => `<!DOCTYPE html>
<html lang="en">
<head>${HEAD('CEDA Innovation Portal | #KaeKapaKae')}</head>
<body class="bg-sand-50 text-ink-900 font-sans antialiased">
<header class="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-sand-200">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
    <a href="/" class="flex items-center gap-3">
      <span class="brand-mark"><i class="fas fa-mountain-sun"></i></span>
      <span class="leading-tight"><span class="block font-extrabold tracking-tight text-lg">CEDA Innovation Portal</span><span class="block text-xs text-ink-700/70 -mt-0.5">Finance · Develop · Sustain</span></span>
    </a>
    <div class="hidden md:flex items-center gap-6 text-sm font-medium text-ink-700">
      <a href="#how-it-works" class="hover:text-brand-700">How it works</a>
      <a href="#categories" class="hover:text-brand-700">Focus areas</a>
      <a href="#eligibility" class="hover:text-brand-700">Eligibility</a>
      <a href="#timeline" class="hover:text-brand-700">Timeline</a>
    </div>
    <div class="flex items-center gap-2">
      <a href="/app#/login" class="btn-ghost">Sign in</a>
      <a href="/app#/register" class="btn-primary">Submit an idea</a>
    </div>
  </nav>
</header>

<main>
  <section id="hero-section" class="relative overflow-hidden hero-bg text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p class="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6"><i class="fas fa-bolt text-amber-300"></i> #KaeKapaKae · Innovation Hackathon 2026</p>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">Turn bold ideas into <span class="text-amber-300">funded ventures</span>.</h1>
        <p class="mt-6 text-lg text-white/80 max-w-xl">A single, transparent platform where Batswana entrepreneurs submit innovative ideas and CEDA evaluates, nurtures and funds them - from first draft to award.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a href="/app#/register" class="btn-primary-lg">Start your submission <i class="fas fa-arrow-right ml-2"></i></a>
          <a href="/app#/login" class="btn-outline-lg">Evaluator / Admin login</a>
        </div>
        <dl id="public-stats" class="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Submissions</dt><dd class="text-3xl font-extrabold" data-stat="submissions">—</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Innovators</dt><dd class="text-3xl font-extrabold" data-stat="innovators">—</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Focus areas</dt><dd class="text-3xl font-extrabold" data-stat="categories">—</dd></div>
          <div><dt class="text-xs uppercase tracking-wider text-white/60">Approved</dt><dd class="text-3xl font-extrabold" data-stat="approved">—</dd></div>
        </dl>
      </div>
      <aside class="hidden lg:block">
        <div class="glass-card p-6 rotate-1">
          <div class="flex items-center justify-between text-sm"><span class="font-semibold">CEDA-2026-0001 · Smart Irrigation Network</span><span class="chip chip-amber">Under review</span></div>
          <ol class="mt-5 space-y-3 text-sm">
            <li class="flex items-center gap-3"><span class="step-dot done"><i class="fas fa-check"></i></span><span>Submitted</span><span class="ml-auto text-white/60">06 Nov</span></li>
            <li class="flex items-center gap-3"><span class="step-dot done"><i class="fas fa-check"></i></span><span>Eligibility screening</span><span class="ml-auto text-white/60">Passed · 71%</span></li>
            <li class="flex items-center gap-3"><span class="step-dot active"><i class="fas fa-magnifying-glass"></i></span><span>Technical &amp; business review</span><span class="ml-auto text-white/60">1 of 2 evaluators</span></li>
            <li class="flex items-center gap-3 opacity-60"><span class="step-dot"></span><span>Investment committee pitch</span></li>
            <li class="flex items-center gap-3 opacity-60"><span class="step-dot"></span><span>Award</span></li>
          </ol>
          <div class="mt-5 rounded-xl bg-white/10 p-4 text-sm"><i class="fas fa-comment-dots text-amber-300 mr-2"></i><span class="text-white/90">"Strong agronomic grounding and credible pilot data. Hardware supply chain needs a second vendor."</span><span class="block text-xs text-white/50 mt-1">Evaluator feedback · shared with submitter</span></div>
        </div>
      </aside>
    </div>
  </section>

  <section id="how-it-works" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">How it works</p><h2 class="section-title">A multi-level workflow built for fairness and speed</h2><p class="section-lead">Every idea moves through configurable evaluation rounds with weighted criteria, blind review, quorum rules and documented panel decisions.</p></header>
    <ol class="mt-12 grid md:grid-cols-4 gap-6">
      ${[
        ['fa-pen-to-square', '1. Submit', 'Guided wizard with auto-save drafts, mandatory fields, supporting document links and a Data Protection consent.'],
        ['fa-shield-halved', '2. Screen', 'Eligibility screening confirms citizen ownership, youth leadership and strategic fit with CEDA priorities.'],
        ['fa-scale-balanced', '3. Evaluate', 'Sector experts score weighted criteria independently. Blind review hides identities; scores aggregate automatically.'],
        ['fa-award', '4. Decide & award', 'Adjudicators advance, request revisions or award with a written rationale. Submitters see every step in real time.']
      ]
        .map(
          ([i, t, d]) => `<li class="feature-card"><span class="feature-icon"><i class="fas ${i}"></i></span><h3 class="font-bold text-lg mt-4">${t}</h3><p class="text-ink-700/80 text-sm mt-2">${d}</p></li>`
        )
        .join('')}
    </ol>
  </section>

  <section id="platform-features" class="bg-white border-y border-sand-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p class="section-kicker">Platform capabilities</p>
        <h2 class="section-title">Everything the guidelines ask for - and the details that make it work</h2>
        <ul class="mt-8 space-y-4">
          ${[
            ['Role-based access control', 'Submitter, Evaluator, Adjudicator and Administrator roles with granular permissions and full audit trail.'],
            ['Real-time status tracking', 'Live stage tracker, in-app notifications and feedback threads keep innovators informed at every step.'],
            ['Configurable evaluation', 'Admins define rounds, weighted criteria, pass thresholds, quorum and blind-review per round - no code changes.'],
            ['Analytics & reporting', 'Dashboards for pipeline, categories, districts, evaluator workload and score distribution. One-click CSV exports.'],
            ['Data protection by design', 'PBKDF2 password hashing, session expiry, confidentiality flags and compliance with Botswana\u2019s Data Protection Act, 2024.'],
            ['Modular & scalable', 'Edge-deployed API on Cloudflare with D1 SQLite, ready for file storage (R2), SSO and external integrations.']
          ]
            .map(
              ([t, d]) => `<li class="flex gap-4"><span class="check-icon"><i class="fas fa-check"></i></span><div><h3 class="font-semibold">${t}</h3><p class="text-sm text-ink-700/80">${d}</p></div></li>`
            )
            .join('')}
        </ul>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <div class="stat-tile"><i class="fas fa-users-gear"></i><strong>4 roles</strong><span>Submitter · Evaluator · Adjudicator · Admin</span></div>
        <div class="stat-tile"><i class="fas fa-layer-group"></i><strong>3 rounds</strong><span>Screening · Technical review · Pitch</span></div>
        <div class="stat-tile"><i class="fas fa-sliders"></i><strong>12 criteria</strong><span>Weighted and fully configurable</span></div>
        <div class="stat-tile"><i class="fas fa-clipboard-check"></i><strong>100% audited</strong><span>Every action logged with actor and time</span></div>
      </div>
    </div>
  </section>

  <section id="categories" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">Focus areas</p><h2 class="section-title">Aligned with CEDA\u2019s strategic priorities</h2></header>
    <div id="category-grid" class="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"></div>
  </section>

  <section id="eligibility" class="bg-ink-900 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-3 gap-10">
      <div><p class="section-kicker text-amber-300">Eligibility</p><h2 class="text-3xl font-extrabold tracking-tight">Who can apply</h2><p class="mt-4 text-white/70">Per the CEDA Innovation Platform Competition Guidelines.</p></div>
      <ul class="lg:col-span-2 grid sm:grid-cols-2 gap-5 text-sm">
        ${[
          ['fa-id-card', 'Motswana youth citizen (18-35) with a registered company'],
          ['fa-chart-pie', 'Youth shareholding above 50%; citizen-owned company'],
          ['fa-file-lines', 'Complete application with a technical proposal'],
          ['fa-language', 'Submissions in English; every question answered'],
          ['fa-hand-holding-dollar', 'No application fee'],
          ['fa-people-group', 'Team: Front-end & Back-end developers, UI/UX, DevOps, Business/Technical analysts']
        ]
          .map(([i, t]) => `<li class="flex gap-3 rounded-xl bg-white/5 border border-white/10 p-4"><i class="fas ${i} text-amber-300 mt-0.5"></i><span>${t}</span></li>`)
          .join('')}
      </ul>
    </div>
  </section>

  <section id="timeline" class="max-w-7xl mx-auto px-4 sm:px-6 py-20">
    <header class="max-w-2xl"><p class="section-kicker">Timeline</p><h2 class="section-title">Key dates</h2></header>
    <ol class="mt-10 grid md:grid-cols-3 gap-6">
      <li class="timeline-card"><span class="date">6 Nov 2026</span><h3>Applications open</h3><p>Portal opens for submissions and team registration.</p></li>
      <li class="timeline-card"><span class="date">10 Nov 2026</span><h3>Applications close</h3><p>Submissions lock at 23:59. Late entries cannot be accepted.</p></li>
      <li class="timeline-card"><span class="date">11 Nov 2026</span><h3>Shortlist announced</h3><p>Successful applicants are contacted. Stay tuned for pitch invitations.</p></li>
    </ol>
    <div class="mt-10 rounded-2xl bg-brand-50 border border-brand-200 p-6 flex flex-col md:flex-row md:items-center gap-4">
      <i class="fas fa-shield-heart text-3xl text-brand-700"></i>
      <p class="text-sm text-ink-700"><strong>Data protection.</strong> The Innovation Platform complies with Botswana\u2019s Data Protection Act, 2024. Participants\u2019 personal data is collected and processed lawfully, used only for specified purposes, protected against unauthorised access or disclosure, and retained only for as long as necessary.</p>
      <a href="/app#/register" class="btn-primary whitespace-nowrap md:ml-auto">Apply now</a>
    </div>
  </section>
</main>

<footer class="border-t border-sand-200 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-ink-700/70">
    <p>© 2026 Citizen Entrepreneurial Development Agency · <a class="hover:text-brand-700" href="https://www.ceda.co.bw" target="_blank" rel="noopener">www.ceda.co.bw</a></p>
    <p>Secondary submissions: <a class="text-brand-700 font-medium" href="mailto:hackathon@bih.co.bw">hackathon@bih.co.bw</a></p>
  </div>
</footer>

<script>
  fetch('/api/public/stats').then(r => r.json()).then(d => {
    for (const k in d.stats) { const el = document.querySelector('[data-stat="' + k + '"]'); if (el) el.textContent = d.stats[k]; }
    const grid = document.getElementById('category-grid');
    grid.innerHTML = d.categories.map(c => '<article class="category-card"><span class="feature-icon"><i class="fas ' + c.icon + '"></i></span><h3 class="font-bold mt-4">' + c.name + '</h3><p class="text-sm text-ink-700/80 mt-1">' + (c.description || '') + '</p></article>').join('');
  }).catch(() => {});
</script>
</body>
</html>`

export const appShell = () => `<!DOCTYPE html>
<html lang="en">
<head>${HEAD('CEDA Innovation Portal · Workspace')}
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js"></script>
</head>
<body class="bg-sand-50 text-ink-900 font-sans antialiased">
  <div id="app" class="min-h-screen"></div>
  <div id="toast-root" class="fixed bottom-4 right-4 z-[100] space-y-2"></div>
  <div id="modal-root"></div>
  <script src="/static/app.js"></script>
</body>
</html>`
