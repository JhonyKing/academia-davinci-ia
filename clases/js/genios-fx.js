/* ============================================================
   GENIOS CREATIVOS · Motor de efectos (window.GC)
   Partículas, parallax, scroll-reveal, tilt 3D, sonido de juego,
   confeti, racha diaria, contadores y subida de nivel.
   Carga: <script src="js/genios-fx.js"></script>  (al final del body)
   Respeta prefers-reduced-motion.
   ============================================================ */
(function () {
  'use strict';
  const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PALETTE = ['#2F7BF6', '#FF4D5E', '#FFB020', '#22C268', '#8C5CF0', '#15C2C9', '#FF5DA2'];
  const GC = (window.GC = {});

  /* ---------- SONIDO (Web Audio, opcional) ---------- */
  const Sound = (() => {
    let on = localStorage.getItem('gc_sound') !== '0';
    let ctx;
    function tone(freq, t0, dur, type = 'sine', vol = 0.12) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type; o.frequency.value = freq;
      const s = ctx.currentTime + t0;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(vol, s + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
      o.start(s); o.stop(s + dur + 0.03);
    }
    function ensure() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { return false; } return !!ctx; }
    const SEQ = {
      hover:  [[520, 0, .05, 'sine', .05]],
      click:  [[660, 0, .07, 'triangle', .12], [880, .05, .06, 'triangle', .1]],
      coin:   [[988, 0, .08, 'square', .08], [1319, .07, .12, 'square', .08]],
      success:[[523, 0, .14, 'triangle', .18], [659, .1, .14, 'triangle', .18], [784, .2, .3, 'sine', .18]],
      unlock: [[392, 0, .1, 'sawtooth', .07], [587, .09, .12, 'triangle', .12]],
      levelup:[[523, 0, .12, 'triangle', .2], [659, .1, .12, 'triangle', .2], [784, .2, .12, 'triangle', .2], [1047, .3, .5, 'sine', .22]],
      streak: [[440, 0, .1, 'triangle', .14], [554, .09, .1, 'triangle', .14], [880, .18, .25, 'sine', .14]],
    };
    return {
      play(name) { if (!on || RM) return; if (!ensure()) return; (SEQ[name] || SEQ.click).forEach(a => tone(...a)); },
      isOn: () => on,
      toggle() { on = !on; localStorage.setItem('gc_sound', on ? '1' : '0'); if (on) this.play('coin'); return on; },
    };
  })();
  GC.sound = Sound;

  /* ---------- CONFETI ---------- */
  GC.confetti = function (opts = {}) {
    if (RM) return;
    const n = opts.count || 46;
    const cx = opts.x != null ? opts.x : window.innerWidth / 2;
    const cy = opts.y != null ? opts.y : window.innerHeight * 0.3;
    const power = opts.power || 1;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div');
      const sz = 7 + Math.random() * 10;
      c.style.cssText = `position:fixed;z-index:99998;left:${cx}px;top:${cy}px;width:${sz}px;height:${sz * (.5 + Math.random() * .7)}px;background:${PALETTE[i % PALETTE.length]};border-radius:${Math.random() > .5 ? '50%' : '3px'};pointer-events:none;will-change:transform,opacity;`;
      document.body.appendChild(c);
      const ang = Math.random() * Math.PI * 2;
      const dist = (90 + Math.random() * 230) * power;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 120 * power;
      const dur = 1300 + Math.random() * 1500;
      c.animate(
        [{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
         { transform: `translate(${dx}px,${dy + window.innerHeight * .5}px) rotate(${Math.random() * 900}deg)`, opacity: 1, offset: .85 },
         { transform: `translate(${dx * 1.1}px,${dy + window.innerHeight * .75}px) rotate(${Math.random() * 1000}deg)`, opacity: 0 }],
        { duration: dur, easing: 'cubic-bezier(.2,.7,.3,1)' }
      ).onfinish = () => c.remove();
    }
  };
  GC.confettiFrom = function (el, opts = {}) {
    if (!el) return GC.confetti(opts);
    const r = el.getBoundingClientRect();
    GC.confetti(Object.assign({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, opts));
  };

  /* ---------- PARTÍCULAS AMBIENTE ---------- */
  GC.particles = function () {
    if (RM) return;
    let cv = document.getElementById('gc-particles');
    if (!cv) { cv = document.createElement('canvas'); cv.id = 'gc-particles'; document.body.appendChild(cv); }
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    const ctx = cv.getContext('2d');
    let W, H, parts;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      const count = Math.min(54, Math.round(innerWidth * innerHeight / 26000));
      parts = Array.from({ length: count }, () => mk(dpr));
    }
    function mk(dpr) {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: (1.2 + Math.random() * 3) * dpr,
        vy: -(.15 + Math.random() * .5) * dpr,
        vx: (Math.random() - .5) * .3 * dpr,
        a: .25 + Math.random() * .5, ph: Math.random() * 6.28,
        c: PALETTE[(Math.random() * PALETTE.length) | 0], star: Math.random() > .62,
      };
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.ph += .02;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
        const al = p.a * (.6 + .4 * Math.sin(p.ph));
        ctx.globalAlpha = al; ctx.fillStyle = p.c;
        if (p.star) { drawStar(p.x, p.y, p.r * 1.6); }
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.28); ctx.fill(); }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }
    function drawStar(x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = i / 4 * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        const a2 = a + Math.PI / 4;
        ctx.lineTo(x + Math.cos(a2) * r * .42, y + Math.sin(a2) * r * .42);
      }
      ctx.closePath(); ctx.fill();
    }
    addEventListener('resize', resize, { passive: true });
    resize(); requestAnimationFrame(draw);
  };

  /* ---------- PARALLAX (puntero) ---------- */
  GC.parallax = function () {
    if (RM) return;
    const els = [...document.querySelectorAll('[data-parallax]')];
    if (!els.length) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf;
    function loop() {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      els.forEach(el => {
        const d = parseFloat(el.dataset.parallax) || 0.04;
        el.style.transform = `translate(${cx * d}px, ${cy * d}px)`;
      });
      raf = requestAnimationFrame(loop);
    }
    addEventListener('pointermove', e => {
      tx = e.clientX - innerWidth / 2; ty = e.clientY - innerHeight / 2;
    }, { passive: true });
    loop();
  };

  /* ---------- SCROLL-REVEAL ---------- */
  GC.reveal = function () {
    const els = [...document.querySelectorAll('[data-reveal]')].filter(e => !e.dataset.rv);
    els.forEach(e => e.dataset.rv = '1');
    if (RM) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => {
      ents.forEach(en => {
        if (en.isIntersecting) {
          const el = en.target;
          const delay = parseFloat(el.dataset.revealDelay) || 0;
          setTimeout(() => el.classList.add('in'), delay * 1000);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach(e => io.observe(e));
  };

  /* ---------- TILT 3D ---------- */
  GC.tilt = function () {
    if (RM || matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      if (el.dataset.tlt) return; el.dataset.tlt = '1';
      const max = parseFloat(el.dataset.tilt) || 8;
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = `perspective(700px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translateY(-4px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  };

  /* ---------- RACHA DIARIA ---------- */
  GC.streak = function () {
    const today = new Date().toISOString().slice(0, 10);
    let s = {};
    try { s = JSON.parse(localStorage.getItem('gc_streak') || '{}'); } catch (e) {}
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    let isNew = false;
    if (s.last === today) { /* ya contado hoy */ }
    else if (s.last === y) { s.count = (s.count || 0) + 1; isNew = true; }
    else { s.count = 1; isNew = true; }
    s.last = today;
    localStorage.setItem('gc_streak', JSON.stringify(s));
    return { count: s.count || 1, isNew };
  };

  /* ---------- CONTADOR ANIMADO ---------- */
  GC.countUp = function (el, to, ms = 900) {
    if (!el) return;
    if (RM) { el.textContent = to; return; }
    const from = 0, t0 = performance.now();
    (function tick(t) {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  };

  /* ---------- SUBIDA DE NIVEL ---------- */
  GC.levelUp = function (n) {
    Sound.play('levelup');
    const ov = document.createElement('div');
    ov.className = 'gc-levelup';
    ov.innerHTML = `<div class="gc-lu-card"><div class="gc-lu-ring"></div><div class="gc-lu-star">⭐</div><div class="gc-lu-t">¡Subiste de nivel!</div><div class="gc-lu-n">Nivel ${n}</div></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.classList.add('show'));
    GC.confetti({ y: window.innerHeight * 0.4, count: 70, power: 1.3 });
    setTimeout(() => GC.confetti({ y: window.innerHeight * 0.4, count: 40, power: 1.1 }), 300);
    const close = () => { ov.classList.remove('show'); setTimeout(() => ov.remove(), 350); };
    ov.addEventListener('click', close);
    setTimeout(close, 2600);
  };

  /* ---------- MASCOTA REACTIVA ---------- */
  GC.mascot = function (el, phrases) {
    if (!el) return;
    el.style.cursor = 'pointer';
    let bubble;
    function say() {
      Sound.play('coin');
      el.classList.remove('gc-wiggle'); void el.offsetWidth; el.classList.add('gc-wiggle');
      if (!phrases || !phrases.length) { setTimeout(() => el.classList.remove('gc-wiggle'), 640); return; }
      bubble && bubble.remove();
      bubble = document.createElement('div');
      bubble.className = 'gc-say';
      bubble.textContent = phrases[(Math.random() * phrases.length) | 0];
      el.parentElement.style.position = el.parentElement.style.position || 'relative';
      el.parentElement.appendChild(bubble);
      requestAnimationFrame(() => bubble.classList.add('in'));
      setTimeout(() => el.classList.remove('gc-wiggle'), 640);
      setTimeout(() => { if (bubble) { bubble.classList.remove('in'); const b = bubble; setTimeout(() => b.remove(), 300); } }, 2400);
    }
    el.addEventListener('click', say);
  };

  /* ---------- SONIDO GLOBAL EN HOVER/CLICK ---------- */
  GC.bindSounds = function (root = document) {
    root.querySelectorAll('.btn, .tlink, .node-link:not(.is-locked), .guide, .extra, .icon-btn, .lback, .lnav-btn, .lnav-home, .obj, .act, .rec, .steam-card').forEach(el => {
      if (el.dataset.snd) return; el.dataset.snd = '1';
      el.addEventListener('pointerenter', () => Sound.play('hover'));
      el.addEventListener('click', () => Sound.play('click'));
    });
  };

  /* ---------- BOTÓN DE SONIDO ---------- */
  GC.wireSoundButton = function (btn) {
    if (!btn) return;
    const paint = () => { btn.textContent = Sound.isOn() ? '🔊' : '🔇'; btn.classList.toggle('off', !Sound.isOn()); };
    btn.addEventListener('click', () => { Sound.toggle(); paint(); });
    paint();
  };

  /* ---------- INIT GENERAL ---------- */
  GC.init = function (opts = {}) {
    GC.particles();
    GC.parallax();
    GC.reveal();
    GC.tilt();
    GC.bindSounds();
    GC.wireSoundButton(document.getElementById('soundBtn'));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {});
})();
