;(function () {
  'use strict'

  // ── Estructura de módulos ─────────────────────────────────────────────────
  const MODULES = [
    { num: 1, name: 'El Genio Creativo',     color: '#2F7BF6', classes: [1,2,3,4,5]        },
    { num: 2, name: 'El Mundo del Genio',    color: '#8C5CF0', classes: [6,7,8,9]           },
    { num: 3, name: 'La Historia del Genio', color: '#FF9F1C', classes: [10,11,12,13]       },
    { num: 4, name: 'El Genio en Movimiento',color: '#22C268', classes: [14,15,16,17,18]    },
    { num: 5, name: 'La Voz del Genio',      color: '#15C2C9', classes: [19,20,21,22]       },
    { num: 6, name: 'El Genio al Mundo',     color: '#FF4D5E', classes: [23,24,25,26]       },
  ]

  function getModule(claseNum) { return MODULES.find(m => m.classes.includes(claseNum)) }
  function isLastInModule(claseNum) {
    const m = getModule(claseNum)
    return m && m.classes[m.classes.length - 1] === claseNum
  }

  // ── Inyectar CSS una sola vez ─────────────────────────────────────────────
  let cssInjected = false
  function injectCSS() {
    if (cssInjected) return
    cssInjected = true
    const s = document.createElement('style')
    s.textContent = `
      .dv-ov {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(30,37,71,0.55);
        backdrop-filter: blur(6px);
        cursor: pointer;
        animation: dv-ov-in .25s ease both;
      }
      @keyframes dv-ov-in { from { opacity:0 } to { opacity:1 } }

      .dv-modal {
        position: relative; overflow: hidden;
        background: var(--card, #fff);
        border: 2px solid var(--line, #E6E9F7);
        border-top: 4px solid var(--dv-accent, var(--blue, #2F7BF6));
        border-radius: var(--r-lg, 30px);
        padding: 40px 40px 32px;
        text-align: center;
        min-width: 300px; max-width: 460px; width: 90vw;
        box-shadow: var(--shadow, 0 18px 40px -18px rgba(30,37,71,.45));
        animation: dv-modal-in .35s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes dv-modal-in {
        from { transform: scale(.7) translateY(20px); opacity:0 }
        to   { transform: scale(1) translateY(0);     opacity:1 }
      }

      .dv-confetti-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .dv-c {
        position: absolute; border-radius: 2px;
        animation: dv-fall linear infinite;
      }
      @keyframes dv-fall {
        0%   { transform: translateY(-16px) rotate(0deg);   opacity: 0 }
        6%   { opacity: 1 }
        88%  { opacity: 1 }
        100% { transform: translateY(460px) rotate(740deg); opacity: 0 }
      }

      .dv-robotsin-face {
        width: 80px; height: 80px; object-fit: contain;
        filter: drop-shadow(0 8px 14px rgba(30,37,71,.25));
        margin-bottom: 8px;
        animation: dv-bob 2s ease-in-out infinite;
      }
      @keyframes dv-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

      .dv-emoji  { font-size: 52px; line-height: 1; margin-bottom: 8px; display: block;
                   animation: dv-pop .4s cubic-bezier(.34,1.56,.64,1) .1s both; }
      @keyframes dv-pop { from{transform:scale(0)} to{transform:scale(1)} }

      .dv-title  { font-family: var(--font-display, 'Fredoka', sans-serif); font-size: clamp(20px,4vw,26px);
                   font-weight: 700; color: var(--ink, #1E2547); margin: 8px 0 6px; line-height: 1.2; }
      .dv-sub    { font-family: var(--font-body, 'Nunito', sans-serif); font-size: 14px; font-weight: 600;
                   color: var(--ink-2, #4B5478); margin-bottom: 20px; }

      .dv-bar-wrap { height: 5px; background: var(--line, #E6E9F7); border-radius: 4px; overflow: hidden; }
      .dv-bar      { height: 100%; background: var(--dv-accent, var(--blue, #2F7BF6)); border-radius: 4px;
                     width: 100%; animation: dv-shrink linear both; transform-origin: left; }
      @keyframes dv-shrink { from{transform:scaleX(1)} to{transform:scaleX(0)} }

      .dv-hint { font-family: var(--font-body, 'Nunito', sans-serif); font-size: 11px; font-weight: 700;
                 color: var(--ink-3, #8C93B4); margin-top: 10px; }
      .dv-close {
        position: absolute; top: 14px; right: 14px;
        background: #fff; border: 2px solid var(--line, #E6E9F7);
        color: var(--ink-3, #8C93B4); border-radius: 50%;
        width: 32px; height: 32px; font-size: 14px; line-height: 1;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: all .2s; font-family: var(--font-body, 'Nunito', sans-serif);
      }
      .dv-close:hover { border-color: var(--red, #FF4D5E); color: var(--red, #FF4D5E); }
    `
    document.head.appendChild(s)
  }

  // ── Sonido de victoria via Web Audio API ─────────────────────────────────
  function playChime(notes) {
    try {
      const ctx    = new (window.AudioContext || window.webkitAudioContext)()
      const master = ctx.createGain()
      master.gain.value = 0.5
      master.connect(ctx.destination)

      notes.forEach(([freq, t, dur = 0.5, type = 'sine', vol = 0.22]) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(master)
        osc.type = type; osc.frequency.value = freq
        const st = ctx.currentTime + t
        gain.gain.setValueAtTime(0, st)
        gain.gain.linearRampToValueAtTime(vol, st + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.001, st + dur)
        osc.start(st); osc.stop(st + dur + 0.05)
      })
    } catch (e) { /* silencioso si el browser bloquea audio */ }
  }

  // Fanfarria de victoria: arpegio ascendente con armónico y acorde final
  const CHIME_CLASS = [
    [523,  0,    0.35, 'triangle', 0.3],   // C5
    [659,  0.16, 0.35, 'triangle', 0.3],   // E5
    [784,  0.32, 0.35, 'triangle', 0.3],   // G5
    [1047, 0.48, 0.7,  'sine',     0.28],  // C6 — nota larga final
    [1047, 0.48, 0.7,  'triangle', 0.12],  // C6 armónico
  ]
  // Fanfarria épica para módulo: sube más alto y más fuerte
  const CHIME_MODULE = [
    [523,  0,    0.3,  'triangle', 0.28],
    [659,  0.14, 0.3,  'triangle', 0.28],
    [784,  0.28, 0.3,  'triangle', 0.28],
    [1047, 0.42, 0.3,  'triangle', 0.28],
    [1319, 0.56, 0.9,  'sine',     0.32],  // E6 — pico épico largo
    [1319, 0.56, 0.9,  'triangle', 0.14],
    [1047, 0.58, 0.85, 'sine',     0.15],  // acorde C6+E6
  ]
  const CHIME_ENTREGA = [
    [440, 0,   0.3, 'sine', 0.2],
    [554, 0.2, 0.4, 'sine', 0.22],
  ]

  // ── Confetti ──────────────────────────────────────────────────────────────
  const COLORS = ['#2F7BF6','#8C5CF0','#FF9F1C','#22C268','#15C2C9','#FF4D5E','#FFD23F','#FF5DA2']
  function spawnConfetti(wrap) {
    for (let i = 0; i < 28; i++) {
      const el  = document.createElement('div')
      el.className = 'dv-c'
      const color = COLORS[i % COLORS.length]
      const size  = 5 + Math.random() * 9
      el.style.cssText = `
        left:${Math.random()*100}%;
        background:${color};
        width:${size}px; height:${size * (0.4 + Math.random()*0.6)}px;
        border-radius:${Math.random()>.5?'50%':'2px'};
        animation-duration:${1.2+Math.random()*1.6}s;
        animation-delay:${Math.random()*0.8}s;
        transform: rotate(${Math.random()*360}deg);
      `
      wrap.appendChild(el)
    }
  }

  // ── Mostrar modal ─────────────────────────────────────────────────────────
  function showModal({ emoji, title, subtitle, color, robotsinSrc, ms = 4000 }) {
    injectCSS()
    document.querySelector('.dv-ov')?.remove()

    const ov = document.createElement('div')
    ov.className = 'dv-ov'

    const imgHTML = robotsinSrc
      ? `<img src="${robotsinSrc}" class="dv-robotsin-face" onerror="this.style.display='none'" alt="Robotsin">`
      : ''

    ov.innerHTML = `
      <div class="dv-modal" style="--dv-accent:${color}" onclick="event.stopPropagation()">
        <button class="dv-close" onclick="this.closest('.dv-ov').remove()" title="Cerrar">✕</button>
        <div class="dv-confetti-wrap"></div>
        ${imgHTML}
        <span class="dv-emoji">${emoji}</span>
        <h2 class="dv-title">${title}</h2>
        <p class="dv-sub">${subtitle}</p>
        <div class="dv-bar-wrap">
          <div class="dv-bar" style="animation-duration:${ms}ms"></div>
        </div>
        <p class="dv-hint">Toca en cualquier lugar para continuar</p>
      </div>`

    document.body.appendChild(ov)
    spawnConfetti(ov.querySelector('.dv-confetti-wrap'))

    ov.addEventListener('click', () => ov.remove())
    setTimeout(() => ov.remove(), ms + 200)
  }

  // ── API pública ───────────────────────────────────────────────────────────
  window.CelebrationSystem = {

    showClassComplete(claseNum) {
      // Si es la última clase del módulo, esperar 800ms y mostrar el módulo
      if (isLastInModule(claseNum)) {
        const mod = getModule(claseNum)
        playChime(CHIME_MODULE)
        showModal({
          emoji: '🏆',
          title: `¡Módulo ${mod.num} completado!`,
          subtitle: `"${mod.name}" — ¡Insignia desbloqueada, genio!`,
          color: mod.color,
          robotsinSrc: 'robotsin/robotsin_completo.png',
          ms: 15000,
        })
      } else {
        playChime(CHIME_CLASS)
        showModal({
          emoji: '⭐',
          title: `¡Clase ${claseNum} completada!`,
          subtitle: 'Sigue avanzando. Tu proyecto está tomando forma.',
          color: '#2F7BF6',
          robotsinSrc: 'robotsin/robotsin_completo.png',
          ms: 15000,
        })
      }
    },

    showEntregaSuccess(mensaje) {
      playChime(CHIME_ENTREGA)
      showModal({
        emoji: '📬',
        title: '¡Robotsin recibió tu entrega!',
        subtitle: mensaje || 'Tu trabajo quedó guardado. ¡Misión cumplida, genio!',
        color: '#22C268',
        robotsinSrc: 'robotsin/robotsin_artista.png',
        ms: 15000,
      })
    },
  }

})()
