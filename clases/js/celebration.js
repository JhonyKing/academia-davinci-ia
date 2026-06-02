;(function () {
  'use strict'

  // ── Estructura de módulos ─────────────────────────────────────────────────
  const MODULES = [
    { num: 1, name: 'El Genio Creativo',     color: '#4A90D9', classes: [1,2,3,4,5]        },
    { num: 2, name: 'El Mundo del Genio',    color: '#8E44AD', classes: [6,7,8,9]           },
    { num: 3, name: 'La Historia del Genio', color: '#F39C12', classes: [10,11,12,13]       },
    { num: 4, name: 'El Genio en Movimiento',color: '#27AE60', classes: [14,15,16,17,18]    },
    { num: 5, name: 'La Voz del Genio',      color: '#16A085', classes: [19,20,21,22]       },
    { num: 6, name: 'El Genio al Mundo',     color: '#E74C3C', classes: [23,24,25,26]       },
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
        background: rgba(10,16,34,0.85);
        backdrop-filter: blur(6px);
        cursor: pointer;
        animation: dv-ov-in .25s ease both;
      }
      @keyframes dv-ov-in { from { opacity:0 } to { opacity:1 } }

      .dv-modal {
        position: relative; overflow: hidden;
        background: #1A2540;
        border: 1px solid rgba(255,255,255,0.1);
        border-top: 3px solid var(--dv-accent, #4A90D9);
        border-radius: 24px;
        padding: 40px 40px 32px;
        text-align: center;
        min-width: 300px; max-width: 460px; width: 90vw;
        box-shadow: 0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(74,144,217,0.15);
        animation: dv-modal-in .35s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes dv-modal-in {
        from { transform: scale(.7) translateY(20px); opacity:0 }
        to   { transform: scale(1) translateY(0);     opacity:1 }
      }

      .dv-confetti-wrap { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
      .dv-c {
        position: absolute; top: -12px; border-radius: 2px;
        animation: dv-fall linear both;
      }
      @keyframes dv-fall {
        0%   { transform: translateY(0)    rotate(0deg);   opacity: 1 }
        80%  { opacity: 1 }
        100% { transform: translateY(420px) rotate(720deg); opacity: 0 }
      }

      .dv-robotsin-face {
        width: 80px; height: 80px; object-fit: contain;
        filter: drop-shadow(0 0 16px var(--dv-accent, #4A90D9));
        margin-bottom: 8px;
        animation: dv-bob 2s ease-in-out infinite;
      }
      @keyframes dv-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

      .dv-emoji  { font-size: 52px; line-height: 1; margin-bottom: 8px; display: block;
                   animation: dv-pop .4s cubic-bezier(.34,1.56,.64,1) .1s both; }
      @keyframes dv-pop { from{transform:scale(0)} to{transform:scale(1)} }

      .dv-title  { font-family:'Poppins',sans-serif; font-size: clamp(18px,4vw,24px);
                   font-weight: 900; color: #fff; margin: 8px 0 6px; line-height: 1.2; }
      .dv-sub    { font-family:'Poppins',sans-serif; font-size: 14px;
                   color: rgba(232,234,240,0.6); margin-bottom: 20px; }

      .dv-bar-wrap { height: 4px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden; }
      .dv-bar      { height: 100%; background: var(--dv-accent, #4A90D9); border-radius: 4px;
                     width: 100%; animation: dv-shrink linear both; transform-origin: left; }
      @keyframes dv-shrink { from{transform:scaleX(1)} to{transform:scaleX(0)} }

      .dv-hint { font-family:'Poppins',sans-serif; font-size: 11px;
                 color: rgba(255,255,255,0.2); margin-top: 10px; }
      .dv-close {
        position: absolute; top: 14px; right: 14px;
        background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
        color: rgba(255,255,255,0.5); border-radius: 50%;
        width: 32px; height: 32px; font-size: 14px; line-height: 1;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: all .2s; font-family: sans-serif;
      }
      .dv-close:hover { background: rgba(255,255,255,0.18); color: #fff; }
    `
    document.head.appendChild(s)
  }

  // ── Sonido chime via Web Audio API ────────────────────────────────────────
  function playChime(notes) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      notes.forEach(([freq, t]) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.type = 'sine'; osc.frequency.value = freq
        const st = ctx.currentTime + t
        gain.gain.setValueAtTime(0, st)
        gain.gain.linearRampToValueAtTime(0.22, st + 0.04)
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.7)
        osc.start(st); osc.stop(st + 0.7)
      })
    } catch (e) { /* silencioso si el browser bloquea audio */ }
  }

  const CHIME_CLASS   = [[523, 0], [659, 0.18], [784, 0.36]]   // C5 E5 G5
  const CHIME_MODULE  = [[523, 0], [659, 0.15], [784, 0.30], [1047, 0.48]] // + C6
  const CHIME_ENTREGA = [[440, 0], [554, 0.2]]

  // ── Confetti ──────────────────────────────────────────────────────────────
  const COLORS = ['#4A90D9','#8E44AD','#F39C12','#27AE60','#16A085','#E74C3C','#ffffff','#74B9FF']
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
          ms: 10000,
        })
      } else {
        playChime(CHIME_CLASS)
        showModal({
          emoji: '⭐',
          title: `¡Clase ${claseNum} completada!`,
          subtitle: 'Sigue avanzando. Tu proyecto está tomando forma.',
          color: '#4A90D9',
          robotsinSrc: 'robotsin/robotsin_completo.png',
          ms: 3800,
        })
      }
    },

    showEntregaSuccess(mensaje) {
      playChime(CHIME_ENTREGA)
      showModal({
        emoji: '📬',
        title: '¡Robotsin recibió tu entrega!',
        subtitle: mensaje || 'Tu trabajo quedó guardado. ¡Misión cumplida, genio!',
        color: '#27AE60',
        robotsinSrc: 'robotsin/robotsin_artista.png',
        ms: 5000,
      })
    },
  }

})()
