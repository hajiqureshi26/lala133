/* ==========================================================
   IMMERSIVE PORTFOLIO SCRIPT
   ========================================================== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = matchMedia('(pointer: coarse)').matches;

/* ---------- 1) PRELOADER ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#preloader').classList.add('hide');
    document.body.classList.remove('loading');
  }, reduced ? 100 : 800);
});

/* ---------- 2) THEME TOGGLE ---------- */
const root = document.documentElement;
const themeBtn = $('#themeToggle');
root.dataset.theme = localStorage.getItem('theme') || 'dark';
const setIcon = () => themeBtn.textContent = root.dataset.theme === 'dark' ? '🌙' : '☀️';
setIcon();
themeBtn.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', root.dataset.theme);
  setIcon();
});

/* ---------- 3) SCROLL: progress bar, nav, back-top, hero parallax ---------- */
const progressBar = $('#progressBar'), nav = $('#nav'), backTop = $('#backTop'), heroContent = $('#heroContent');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (y / h * 100) + '%';
  nav.classList.toggle('scrolled', y > 40);
  backTop.classList.toggle('show', y > 600);
  if (heroContent && y < innerHeight) heroContent.style.transform = `translateY(${y * .25}px)`;
}, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));

/* ---------- 4) MOBILE MENU + ACTIVE NAV ---------- */
const burger = $('#burger'), navLinks = $('#navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const linkMap = $$('.nav__links a');
const secObs = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) linkMap.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
}), { rootMargin: '-40% 0px -55% 0px' });
$$('section[id]').forEach(s => secObs.observe(s));

/* ---------- 5) INTERACTIVE PARTICLE BACKGROUND ---------- */
const canvas = $('#particles'), ctx = canvas.getContext('2d');
let particles = [], mouse = { x: null, y: null };
const hexToRgb = hex => { const n = parseInt(hex.slice(1), 16); return `${n >> 16},${(n >> 8) & 255},${n & 255}`; };
const themeRGB = () => hexToRgb(getComputedStyle(root).getPropertyValue('--accent').trim());

function initParticles() {
  canvas.width = innerWidth; canvas.height = innerHeight;
  const count = Math.min(85, Math.floor(innerWidth / 15));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .55, vy: (Math.random() - .5) * .55,
    r: Math.random() * 1.9 + .7
  }));
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rgb = themeRGB();
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    // gentle mouse attraction
    if (mouse.x !== null) {
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
      if (d < 160 && d > .5) { p.x += dx / d * .6; p.y += dy / d * .6; }
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fillStyle = `rgba(${rgb},.75)`; ctx.fill();
  });
  // connecting lines
  for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
    const a = particles[i], b = particles[j], d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 125) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(${rgb},${(1 - d / 125) * .22})`; ctx.lineWidth = 1; ctx.stroke(); }
  }
  // line to mouse
  if (mouse.x !== null) particles.forEach(p => {
    const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
    if (d < 170) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y);
      ctx.strokeStyle = `rgba(${rgb},${(1 - d / 170) * .4})`; ctx.stroke(); }
  });
  requestAnimationFrame(drawParticles);
}
if (!reduced) {
  initParticles(); drawParticles();
  window.addEventListener('resize', initParticles);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });
}

/* ---------- 6) CUSTOM CURSOR ---------- */
if (!isTouch && !reduced) {
  const dot = $('#cursorDot'), ring = $('#cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  });
  (function lerp() {
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(lerp);
  })();
  $$('a, button, .flip-card, .chip, input, textarea, [data-tilt]').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* ---------- 7) TYPING EFFECT ---------- */
const roles = ['Web Designer', 'Frontend Developer', 'UI/UX Enthusiast', 'Freelancer']; // ✏️ CHANGE
const typedEl = $('#typed');
if (reduced) { typedEl.textContent = roles[0]; }
else {
  let ri = 0, ci = 0, deleting = false;
  (function type() {
    const word = roles[ri];
    typedEl.textContent = word.slice(0, ci);
    if (!deleting && ci < word.length) { ci++; setTimeout(type, 85); }
    else if (!deleting) { deleting = true; setTimeout(type, 1700); }
    else if (ci > 0) { ci--; setTimeout(type, 42); }
    else { deleting = false; ri = (ri + 1) % roles.length; setTimeout(type, 350); }
  })();
}

/* ---------- 8) SCROLL REVEAL ---------- */
const revealObs = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.classList.add('visible'); revealObs.unobserve(en.target); }
}), { threshold: .12 });
$$('.reveal, .reveal-left, .reveal-right, .reveal-zoom').forEach(el => revealObs.observe(el));

/* ---------- 9) ANIMATED COUNTERS ---------- */
const counterObs = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix || '';
  const t0 = performance.now(), dur = 1900;
  (function tick(now) {
    const p = Math.min((now - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
  counterObs.unobserve(el);
}), { threshold: .5 });
$$('.counter').forEach(c => counterObs.observe(c));

/* ---------- 10) SKILL BARS ---------- */
const skillObs = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { en.target.style.width = en.target.dataset.level + '%'; skillObs.unobserve(en.target); }
}), { threshold: .4 });
$$('.skill__fill').forEach(f => skillObs.observe(f));

/* ---------- 11) 3D TILT + GLARE ---------- */
if (!isTouch && !reduced) $$('[data-tilt]').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    el.style.transform = `perspective(900px) rotateX(${-y * 9}deg) rotateY(${x * 11}deg) translateY(-5px)`;
    el.style.setProperty('--gx', `${(x + .5) * 100}%`);
    el.style.setProperty('--gy', `${(y + .5) * 100}%`);
  });
  el.addEventListener('mouseleave', () => { el.style.transform = ''; });
});

/* ---------- 12) FLIP CARDS ---------- */
$$('.flip-card').forEach(card => {
  const flip = e => { if (e.target.closest('a')) return; card.classList.toggle('is-flipped'); };
  card.addEventListener('click', flip);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flipped'); }
  });
});

/* ---------- 13) MAGNETIC BUTTONS ---------- */
if (!isTouch && !reduced) $$('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .28}px, ${(e.clientY - r.top - r.height / 2) * .28}px)`;
  });
  btn.addEventListener('mouseleave', () => btn.style.transform = '');
});

/* ---------- 14) TESTIMONIAL SLIDER ---------- */
const slides = $$('.testimonial'), dotsBox = $('#tDots');
let tIdx = 0, tTimer;
slides.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 't-dot' + (i === 0 ? ' active' : '');
  d.setAttribute('aria-label', 'Testimonial ' + (i + 1));
  d.addEventListener('click', () => { showSlide(i); restartTimer(); });
  dotsBox.appendChild(d);
});
const dots = $$('.t-dot');
function showSlide(i) {
  tIdx = i;
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
}
function restartTimer() {
  clearInterval(tTimer);
  if (!reduced) tTimer = setInterval(() => showSlide((tIdx + 1) % slides.length), 5000);
}
restartTimer();

/* ---------- 15) CONTACT FORM (EmailJS) ----------
   ⚙️ CHANGE HERE — paste your EmailJS keys:
   1) emailjs.com → Email Services → copy Service ID
   2) Email Templates → copy Template ID
   3) Account → General → copy Public Key            */
const EMAILJS_SERVICE_ID  = 'service_bqbegpm';
const EMAILJS_TEMPLATE_ID = 'template_1sd0m1e';
const EMAILJS_PUBLIC_KEY  = 'K2E7beQs8qCjfEWAA';
const FALLBACK_EMAIL      = 'hajiqureshi8885@gmail.com'; // ✏️ CHANGE

const form = $('#contactForm'), status = $('#formStatus'), submitBtn = $('#submitBtn');
form.addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(form);

  if (EMAILJS_SERVICE_ID.includes('YOUR_')) {           // fallback → mail app
    const subject = encodeURIComponent(data.get('subject') || 'Portfolio inquiry');
    const body = encodeURIComponent(`Name: ${data.get('from_name')}\nEmail: ${data.get('from_email')}\n\n${data.get('message')}`);
    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
    status.textContent = '📧 Opening your email app… (add EmailJS keys in script.js for auto-send)';
    return;
  }
  submitBtn.disabled = true; submitBtn.textContent = 'Sending…';
  emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form, EMAILJS_PUBLIC_KEY)
    .then(() => { status.textContent = '✅ Message sent! I will reply soon.'; status.style.color = '#34d399'; form.reset(); submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✦'; })
    .catch(() => { status.textContent = '❌ Failed to send — please try again.'; status.style.color = '#fb7185'; submitBtn.disabled = false; submitBtn.textContent = 'Send Message ✦'; });
});