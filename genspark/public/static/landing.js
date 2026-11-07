/* CEDA Innovation Portal - landing page interactions */
(function () {
  'use strict'
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

  // Category -> photo
  const CAT_IMG = [
    [/agri|food/i, 'farmer-field'],
    [/manufact|mining/i, 'maker-sewing'],
    [/energy|climate|green/i, 'solar-rural'],
    [/touris|creative/i, 'elephants'],
    [/health|social/i, 'founder-macbook'],
    [/digital|fintech|ict/i, 'engineer']
  ]
  const catImg = (name) => (CAT_IMG.find(([re]) => re.test(name)) || [0, 'delta-aerial'])[1]

  // Hero slideshow
  const slides = [...document.querySelectorAll('.hero-slide')]
  const dots = [...document.querySelectorAll('.hero-dot')]
  const cap = document.getElementById('hero-caption')
  let cur = 0
  let timer
  const show = (i) => {
    cur = (i + slides.length) % slides.length
    slides.forEach((s, j) => s.classList.toggle('is-active', j === cur))
    dots.forEach((d, j) => d.classList.toggle('is-active', j === cur))
    if (cap) cap.innerHTML = '<i class="fas fa-location-dot text-amber-300 mr-1.5"></i>' + esc(slides[cur].dataset.caption)
  }
  const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => show(cur + 1), 6500) }
  dots.forEach((d) => (d.onclick = () => { show(Number(d.dataset.slide)); play() }))
  play()

  // Count-up
  const countUp = (el, to) => {
    if (reduce || !to) return (el.textContent = to)
    const t0 = performance.now()
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1400)
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }

  // Stats + categories
  fetch('/api/public/stats')
    .then((r) => r.json())
    .then((d) => {
      for (const k in d.stats) { const el = document.querySelector('[data-stat="' + k + '"]'); if (el) countUp(el, Number(d.stats[k]) || 0) }
      const grid = document.getElementById('category-grid')
      grid.innerHTML = d.categories
        .map(
          (c, i) => `<article class="photo-card reveal" style="--d:${i * 70}ms" tabindex="0">
            <img src="/static/img/${catImg(c.name)}.webp" alt="" loading="lazy">
            <div class="photo-card-body"><span class="photo-card-icon"><i class="fas ${esc(c.icon)}"></i></span><h3>${esc(c.name)}</h3><p>${esc(c.description || '')}</p>
            <a href="/app#/register" class="photo-card-cta">Submit an idea <i class="fas fa-arrow-right"></i></a></div></article>`
        )
        .join('')
      observe(grid.querySelectorAll('.reveal'))
    })
    .catch(() => {})

  // Scroll reveal
  const io = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    : null
  function observe(els) { els.forEach((el) => (io ? io.observe(el) : el.classList.add('is-in'))) }
  document.querySelectorAll('#how-it-works .feature-card, #platform-features li, .stat-tile, .timeline-card').forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', (i % 4) * 80 + 'ms') })
  observe(document.querySelectorAll('.reveal'))

  // Tilt card
  if (!reduce) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const host = card.parentElement
      host.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`
      })
      host.addEventListener('mouseleave', () => (card.style.transform = ''))
    })
    // Parallax backgrounds and hero zoom on scroll
    const par = [...document.querySelectorAll('[data-parallax]')]
    const onScroll = () => {
      par.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect()
        el.style.transform = `translate3d(0, ${(r.top + r.height / 2 - innerHeight / 2) * -0.15}px, 0) scale(1.15)`
      })
    }
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }
})()
