/* ============================================================
   GENIOS CREATIVOS · Motor de efectos (juice.js)
   Partículas, parallax, scroll-reveal, tilt 3D, ripple,
   sonidos de juego, rastro de chispas, mascota reactiva,
   racha diaria y subida de nivel. 100% vanilla, sin librerías.
   ============================================================ */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1) SONIDO DE JUEGO  (Web Audio, recordado)
  ───────────────────────────────────────────── */
  const Sound = (function () {
    let on = localStorage.getItem('gc_sound') !== '0';
    let ctx;
    const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
    function tone(freq, dur, type, vol, when) {
      if (!on) return;
      try {
        const c = ac(), o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = type; o.frequency.value = freq;
        const t = c.currentTime + (when || 0);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.start(t); o.stop(t + dur + 0.03);
      } catch (e) {}
    }
    return {
      isOn: () => on,
      toggle() { on = !on; localStorage.setItem('gc_sound', on ? '1' : '0'); if (on) this.click(); return on; },
      hover() { tone(540, 0.05, 'sine', 0.045); },
      click() { tone(660, 0.07, 'triangle', 0.12); tone(880, 0.06, 'triangle', 0.1, 0.05); },
      unlock() { tone(523, .14, 'triangle', .14); tone(659, .14, 'triangle', .13, .1); tone(784, .2, 'triangle', .13, .2); },
      win() { [[523,0,.3],[659,.12,.3],[784,.24,.3],[1047,.38,.7]].forEach(([f,t,d]) => tone(f, d, 'triangle', 0.18, t)); },
      level() { [[392,0,.2],[523,.1,.2],[659,.2,.2],[784,.3,.2],[1047,.42,.6]].forEach(([f,t,d]) => tone(f, d, 'triangle', 0.16, t)); }
    };
  })();
  window.GCSound = Sound;

  /* ─────────────────────────────────────────────
     2) PARTÍCULAS DE FONDO  (canvas suave)
  ───────────────────────────────────────────── */
  function particles() {
    if (reduce) return;
    const cv = document.createElement('canvas');
    cv.id = 'fx-particles';
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    let w, h, parts, raf;
    const COLORS = ['#2F7BF6', '#8C5CF0', '#FFB020', '#22C268', '#FF5DA2', '#15C2C9'];
    function size() {
      w = cv.width = innerWidth * devicePixelRatio;
      h = cv.height = innerHeight * devicePixelRatio;
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    }
    function make() {
      const n = Math.min(46, Math.floor(innerWidth / 26));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: (1.5 + Math.random() * 3) * devicePixelRatio,
        vx: (Math.random() - .5) * .25 * devicePixelRatio,
        vy: (-.15 - Math.random() * .35) * devicePixelRatio,
        a: .25 + Math.random() * .45,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        tw: Math.random() * Math.PI * 2
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        const tw = (Math.sin(p.tw) + 1) / 2;
        ctx.globalAlpha = p.a * (0.4 + 0.6 * tw);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    size(); make(); frame();
    addEventListener('resize', () => { cancelAnimationFrame(raf); size(); make(); frame(); }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     3) SCROLL REVEAL
  ───────────────────────────────────────────── */
  function reveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  }

  /* ─────────────────────────────────────────────
     4) PARALLAX (elementos con data-parallax="0.2")
  ───────────────────────────────────────────── */
  function parallax() {
    if (reduce) return;
    const els = [...document.querySelectorAll('[data-parallax]')];
    if (!els.length) return;
    let ticking = false;
    function upd() {
      const vh = innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2 - vh / 2;
        const sp = parseFloat(el.dataset.parallax) || 0.15;
        el.style.transform = `translate3d(0, ${(-center * sp).toFixed(1)}px, 0)`;
      });
      ticking = false;
    }
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ─────────────────────────────────────────────
     5) TILT 3D (tarjetas con clase .tilt)
  ───────────────────────────────────────────── */
  function tilt() {
    if (reduce || matchMedia('(hover: none)').matches) return;
    document.querySelectorAll('.tilt').forEach(card => {
      if (card.dataset.gcTilt) return; card.dataset.gcTilt = '1';
      const MAX = 9;
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(700px) rotateX(${(-py * MAX).toFixed(2)}deg) rotateY(${(px * MAX).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ─────────────────────────────────────────────
     6) RIPPLE + SONIDO en clicks / hover
  ───────────────────────────────────────────── */
  function interactions() {
    const tappable = '.btn, .node-link:not(.is-locked), .tlink, .guide, .extra, .obj, .rec, .lnav-btn, .lnav-home, .icon-btn, .steam-card';
    document.querySelectorAll(tappable).forEach(el => {
      if (el.dataset.gcBound) return; el.dataset.gcBound = '1';
      el.classList.add('ripple-host');
      el.addEventListener('mouseenter', () => Sound.hover());
      el.addEventListener('click', (e) => {
        Sound.click();
        const r = el.getBoundingClientRect();
        const d = Math.max(r.width, r.height);
        const rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.width = rip.style.height = d + 'px';
        rip.style.left = (e.clientX - r.left - d / 2) + 'px';
        rip.style.top = (e.clientY - r.top - d / 2) + 'px';
        el.appendChild(rip);
        setTimeout(() => rip.remove(), 650);
      });
    });
  }

  /* ─────────────────────────────────────────────
     7) RASTRO DE CHISPAS con el cursor
  ───────────────────────────────────────────── */
  function sparkTrail() {
    if (reduce || matchMedia('(hover: none)').matches) return;
    const GLYPHS = ['✦', '✧', '⭐', '✨'];
    let last = 0;
    addEventListener('pointermove', (e) => {
      const now = performance.now();
      if (now - last < 90) return; last = now;
      const s = document.createElement('span');
      s.className = 'spark-trail';
      s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px';
      s.style.color = ['#FFB020', '#2F7BF6', '#8C5CF0', '#FF5DA2'][Math.floor(Math.random() * 4)];
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     8) CONFETI  (reutilizable)
  ───────────────────────────────────────────── */
  function confetti(burst) {
    const COLORS = ['#2F7BF6', '#FF4D5E', '#FFB020', '#22C268', '#8C5CF0', '#15C2C9', '#FF5DA2'];
    const n = burst || 46;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      const sz = 7 + Math.random() * 10;
      c.style.cssText = `position:fixed;z-index:9999;top:-20px;left:${Math.random() * 100}vw;width:${sz}px;height:${sz * (.5 + Math.random() * .7)}px;background:${COLORS[i % COLORS.length]};border-radius:${Math.random() > .5 ? '50%' : '3px'};pointer-events:none;`;
      document.body.appendChild(c);
      const dx = (Math.random() * 2 - 1) * 180, dur = 1500 + Math.random() * 1500;
      c.animate(
        [{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
         { transform: `translate(${dx}px, ${innerHeight + 60}px) rotate(${Math.random() * 900}deg)`, opacity: 1 },
         { opacity: 0 }],
        { duration: dur, easing: 'cubic-bezier(.2,.6,.4,1)' }
      ).onfinish = () => c.remove();
    }
  }
  window.GCConfetti = confetti;

  /* ─────────────────────────────────────────────
     9) MASCOTA REACTIVA  (clic = salta + frase + sonido)
  ───────────────────────────────────────────── */
  const FRASES = ['¡Vamos, genio! 🚀', '¡Tú puedes! ✨', '¡Eres increíble! ⭐', '¡A crear! 🎨', '¡Genial! 🎉', '¡Sigue así! 💪'];
  function reactiveMascot(img, stage) {
    if (!img) return;
    let say = stage.querySelector('.mascot-say');
    if (!say) { say = document.createElement('div'); say.className = 'mascot-say'; stage.appendChild(say); }
    img.addEventListener('click', () => {
      img.classList.remove('react'); void img.offsetWidth; img.classList.add('react');
      stage.classList.remove('react'); void stage.offsetWidth; stage.classList.add('react');
      say.textContent = FRASES[Math.floor(Math.random() * FRASES.length)];
      say.classList.add('show'); Sound.click(); confetti(14);
      clearTimeout(say._t); say._t = setTimeout(() => say.classList.remove('show'), 1700);
    });
  }
  window.GCReactiveMascot = reactiveMascot;

  /* ─────────────────────────────────────────────
     10) RACHA DIARIA  (localStorage, sin backend)
  ───────────────────────────────────────────── */
  function streak() {
    const KEY = 'gc_streak';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const ts = today.getTime(), DAY = 864e5;
    let st = {};
    try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) {}
    if (st.last === ts) { /* ya contó hoy */ }
    else if (st.last === ts - DAY) { st.count = (st.count || 0) + 1; st.last = ts; }
    else { st.count = 1; st.last = ts; }
    localStorage.setItem(KEY, JSON.stringify(st));
    window.GCStreak = st.count;
    // pintar widgets
    document.querySelectorAll('[data-streak-num]').forEach(e => e.textContent = st.count);
    const strip = document.querySelector('[data-streak-days]');
    if (strip) {
      const NAMES = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
      let dow = today.getDay(); dow = dow === 0 ? 6 : dow - 1; // L=0..D=6
      strip.innerHTML = NAMES.map((nm, i) => {
        const on = i <= dow && (dow - i) < st.count;
        const isToday = i === dow;
        return `<div class="sd ${on ? 'on' : ''} ${isToday ? 'today' : ''}"><div class="dot">${on ? '🔥' : (isToday ? '⭐' : '·')}</div>${nm}</div>`;
      }).join('');
    }
    return st.count;
  }

  /* ─────────────────────────────────────────────
     11) SUBIDA DE NIVEL  (flash a pantalla completa)
  ───────────────────────────────────────────── */
  function levelUp(level, label) {
    const lvlEl = document.getElementById('xpLevel');
    if (lvlEl) { lvlEl.classList.remove('levelup'); void lvlEl.offsetWidth; lvlEl.classList.add('levelup'); }
    const f = document.createElement('div');
    f.className = 'lvl-flash';
    f.innerHTML = `<div class="small">¡SUBISTE DE NIVEL!</div><div class="big">⭐ ${level}</div><div class="small">${label || ''}</div>`;
    document.body.appendChild(f);
    void f.offsetWidth; f.classList.add('show');
    Sound.level(); confetti(60);
    setTimeout(() => f.remove(), 5000);
  }
  window.GCLevelUp = levelUp;

  // Re-vincular efectos a contenido renderizado dinámicamente (mapa)
  window.GCBind = function () { interactions(); tilt(); reveal(); };

  /* ─────────────────────────────────────────────
     12) BOTÓN DE SONIDO  (si existe #soundBtn)
  ───────────────────────────────────────────── */
  function soundButton() {
    const b = document.getElementById('soundBtn');
    if (!b) return;
    const paint = () => { b.textContent = Sound.isOn() ? '🔊' : '🔇'; b.classList.toggle('off', !Sound.isOn()); };
    b.addEventListener('click', () => { Sound.toggle(); paint(); });
    paint();
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    particles(); reveal(); parallax(); tilt(); interactions();
    sparkTrail(); streak(); soundButton();
    // mascotas reactivas conocidas
    const heroM = document.querySelector('.hero-mascot');
    if (heroM) reactiveMascot(heroM, heroM.parentElement);
    const stageM = document.querySelector('.mascot-stage');
    if (stageM) reactiveMascot(stageM.querySelector('img'), stageM);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
