/* ============================================================
   GENIOS CREATIVOS · "Pregúntale a Robotsin" — Tutor con IA
   Botón flotante + chat. Robotsin ayuda al niño SIN darle la
   respuesta hecha: lo guía, en español, con tono amable.
   Autocontenido: inyecta sus propios estilos.

   • Vista previa (este entorno): usa IA real (window.claude.complete).
   • Producción (tu sitio): conecta tu propio backend de IA en askAI().
     Define el tema de la clase con:  window.ROBOTSIN_CONTEXT = "Clase N — tema";
   ============================================================ */
(function () {
  'use strict';

  var CTX = window.ROBOTSIN_CONTEXT || 'una clase de creatividad con Inteligencia Artificial';
  var PERSONA =
    'Eres "Robotsin", un robot maestro simpático de la Academia Da Vinci IA. ' +
    'Ayudas a un niño de entre 9 y 13 años en ' + CTX + '. ' +
    'Reglas: responde SIEMPRE en español, en máximo 3 o 4 frases cortas y sencillas. ' +
    'Sé alentador y divertido, usa 1 emoji. NUNCA hagas la tarea por él ni des la respuesta final completa: ' +
    'dale una pista, un ejemplo o una pregunta que lo haga pensar. ' +
    'Si pide algo fuera de la clase, regrésalo con cariño al tema. Habla de "prompts", personajes, historias e ideas creativas.';

  var SUGERENCIAS = ['¿Qué es un prompt? 🤔', 'Dame una idea de personaje 🦸', 'No sé qué escribir 😅', '¿Cómo hago mi imagen mejor? 🎨'];

  // ── Estilos ──
  var css = document.createElement('style');
  css.textContent = [
    '.rt-fab{position:fixed;right:20px;bottom:20px;z-index:9000;display:flex;align-items:center;gap:10px;',
    'background:var(--wc,#2F7BF6);color:#fff;border:none;cursor:pointer;font-family:var(--font-display,sans-serif);',
    'font-weight:600;font-size:16px;padding:13px 20px 13px 13px;border-radius:999px;',
    'box-shadow:0 8px 0 rgba(0,0,0,.16),0 16px 30px -10px rgba(0,0,0,.4);transition:transform .14s;}',
    '.rt-fab:hover{transform:translateY(-2px);} .rt-fab:active{transform:translateY(4px);box-shadow:0 2px 0 rgba(0,0,0,.16);}',
    '.rt-fab img{width:40px;height:40px;border-radius:50%;background:#fff;object-fit:contain;padding:2px;}',
    '.rt-fab .rt-dot{position:absolute;top:8px;left:40px;width:12px;height:12px;border-radius:50%;background:#22C268;border:2px solid #fff;}',
    '@media(max-width:600px){.rt-fab span{display:none;}.rt-fab{padding:12px;}}',
    '.rt-panel{position:fixed;right:20px;bottom:20px;z-index:9001;width:380px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 40px);',
    'background:#fff;border:2px solid var(--line,#E6E9F7);border-radius:24px;box-shadow:0 30px 70px -20px rgba(0,0,0,.5);',
    'display:none;flex-direction:column;overflow:hidden;transform-origin:bottom right;}',
    '.rt-panel.open{display:flex;animation:rtIn .28s cubic-bezier(.22,1,.36,1);}',
    '@keyframes rtIn{from{opacity:0;transform:translateY(20px) scale(.94);}to{opacity:1;transform:none;}}',
    '.rt-head{display:flex;align-items:center;gap:12px;padding:16px 16px;background:linear-gradient(135deg,var(--wc,#2F7BF6),color-mix(in srgb,var(--wc,#2F7BF6) 55%,#8C5CF0));color:#fff;}',
    '.rt-head img{width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.95);object-fit:contain;padding:3px;flex-shrink:0;}',
    '.rt-head .t{font-family:var(--font-display,sans-serif);font-weight:600;font-size:17px;line-height:1.1;}',
    '.rt-head .s{font-size:12px;font-weight:700;opacity:.9;display:flex;align-items:center;gap:5px;}',
    '.rt-head .s::before{content:"";width:8px;height:8px;border-radius:50%;background:#7DF0A8;display:inline-block;}',
    '.rt-close{margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;flex-shrink:0;}',
    '.rt-close:hover{background:rgba(255,255,255,.32);}',
    '.rt-body{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:12px;background:#F7F9FF;}',
    '.rt-msg{display:flex;gap:9px;align-items:flex-end;max-width:88%;}',
    '.rt-msg .av{width:30px;height:30px;border-radius:50%;background:#fff;border:2px solid var(--line,#E6E9F7);object-fit:contain;padding:1px;flex-shrink:0;}',
    '.rt-bubble{padding:11px 15px;border-radius:18px;font-weight:600;font-size:14.5px;line-height:1.5;color:var(--ink,#1E2547);}',
    '.rt-bot .rt-bubble{background:#fff;border:2px solid var(--line,#E6E9F7);border-bottom-left-radius:6px;}',
    '.rt-me{align-self:flex-end;flex-direction:row-reverse;}',
    '.rt-me .rt-bubble{background:var(--wc,#2F7BF6);color:#fff;border-bottom-right-radius:6px;}',
    '.rt-typing{display:flex;gap:4px;padding:14px 16px;}',
    '.rt-typing span{width:8px;height:8px;border-radius:50%;background:var(--ink-3,#8C93B4);animation:rtBlink 1.2s infinite;}',
    '.rt-typing span:nth-child(2){animation-delay:.2s;} .rt-typing span:nth-child(3){animation-delay:.4s;}',
    '@keyframes rtBlink{0%,60%,100%{opacity:.3;transform:translateY(0);}30%{opacity:1;transform:translateY(-4px);}}',
    '.rt-chips{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 10px;background:#F7F9FF;}',
    '.rt-chip{background:#fff;border:2px solid var(--line,#E6E9F7);color:var(--ink-2,#4B5478);font-family:var(--font-body,sans-serif);font-weight:700;font-size:12.5px;padding:7px 13px;border-radius:999px;cursor:pointer;transition:.15s;}',
    '.rt-chip:hover{border-color:var(--wc,#2F7BF6);color:var(--wc,#2F7BF6);}',
    '.rt-foot{display:flex;gap:8px;padding:12px 14px;border-top:2px solid var(--line,#E6E9F7);background:#fff;}',
    '.rt-input{flex:1;background:#F7F9FF;border:2px solid var(--line,#E6E9F7);border-radius:999px;padding:12px 16px;font-family:var(--font-body,sans-serif);font-weight:600;font-size:14px;color:var(--ink,#1E2547);outline:none;}',
    '.rt-input:focus{border-color:var(--wc,#2F7BF6);background:#fff;}',
    '.rt-send{background:var(--wc,#2F7BF6);color:#fff;border:none;width:46px;height:46px;border-radius:50%;font-size:20px;cursor:pointer;flex-shrink:0;box-shadow:0 4px 0 rgba(0,0,0,.14);transition:.14s;}',
    '.rt-send:hover{filter:brightness(1.05);} .rt-send:disabled{opacity:.5;cursor:not-allowed;}',
    '@media(prefers-reduced-motion:reduce){.rt-panel.open{animation:none;}.rt-typing span{animation:none;}}'
  ].join('');
  document.head.appendChild(css);

  var AVATAR = 'robotsin/robotsin_artista.png';

  // ── Estructura ──
  var fab = document.createElement('button');
  fab.className = 'rt-fab';
  fab.innerHTML = '<img src="' + AVATAR + '" alt="Robotsin"><span>¿Dudas? Pregúntame</span><span class="rt-dot"></span>';
  fab.setAttribute('aria-label', 'Pregúntale a Robotsin');

  var panel = document.createElement('div');
  panel.className = 'rt-panel';
  panel.innerHTML =
    '<div class="rt-head"><img src="' + AVATAR + '" alt="Robotsin"><div><div class="t">Robotsin</div><div class="s">Tu tutor genio</div></div><button class="rt-close" aria-label="Cerrar">✕</button></div>' +
    '<div class="rt-body" id="rtBody"></div>' +
    '<div class="rt-chips" id="rtChips"></div>' +
    '<form class="rt-foot" id="rtForm"><input class="rt-input" id="rtInput" placeholder="Escríbele a Robotsin…" autocomplete="off" maxlength="300"><button class="rt-send" id="rtSend" type="submit" aria-label="Enviar">➤</button></form>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    wire();
  });

  var convo = []; // historial {role, content}
  var busy = false;

  function wire() {
    var body = panel.querySelector('#rtBody');
    var chips = panel.querySelector('#rtChips');
    var form = panel.querySelector('#rtForm');
    var input = panel.querySelector('#rtInput');

    fab.addEventListener('click', function () {
      panel.classList.add('open'); fab.style.display = 'none';
      if (!convo.length) {
        botSay('¡Hola, genio! 🤖 Soy Robotsin. ¿En qué te ayudo hoy? Pregúntame lo que sea de la clase.');
        renderChips();
      }
      setTimeout(function () { input.focus(); }, 100);
      if (window.GCSound) try { window.GCSound.click(); } catch (e) {}
    });
    panel.querySelector('.rt-close').addEventListener('click', function () {
      panel.classList.remove('open'); fab.style.display = 'flex';
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });

    function renderChips() {
      chips.innerHTML = '';
      SUGERENCIAS.forEach(function (s) {
        var c = document.createElement('button');
        c.className = 'rt-chip'; c.type = 'button'; c.textContent = s;
        c.addEventListener('click', function () { send(s); });
        chips.appendChild(c);
      });
    }
    function clearChips() { chips.innerHTML = ''; }

    function botSay(text) {
      var m = document.createElement('div');
      m.className = 'rt-msg rt-bot';
      m.innerHTML = '<img class="av" src="' + AVATAR + '" alt=""><div class="rt-bubble"></div>';
      m.querySelector('.rt-bubble').textContent = text;
      body.appendChild(m); body.scrollTop = body.scrollHeight;
    }
    function meSay(text) {
      var m = document.createElement('div');
      m.className = 'rt-msg rt-me';
      m.innerHTML = '<div class="rt-bubble"></div>';
      m.querySelector('.rt-bubble').textContent = text;
      body.appendChild(m); body.scrollTop = body.scrollHeight;
    }
    function typing(on) {
      var ex = body.querySelector('.rt-typing-wrap');
      if (on) {
        if (ex) return;
        var w = document.createElement('div');
        w.className = 'rt-msg rt-bot rt-typing-wrap';
        w.innerHTML = '<img class="av" src="' + AVATAR + '" alt=""><div class="rt-bubble" style="padding:6px 10px;"><div class="rt-typing"><span></span><span></span><span></span></div></div>';
        body.appendChild(w); body.scrollTop = body.scrollHeight;
      } else if (ex) { ex.remove(); }
    }

    async function send(text) {
      text = (text || '').trim();
      if (!text || busy) return;
      clearChips();
      meSay(text); convo.push({ role: 'user', content: text });
      input.value = '';
      busy = true; panel.querySelector('#rtSend').disabled = true;
      typing(true);
      try {
        var reply = await askAI();
        typing(false); botSay(reply); convo.push({ role: 'assistant', content: reply });
        if (window.GCSound) try { window.GCSound.hover(); } catch (e) {}
      } catch (err) {
        typing(false);
        botSay('¡Uy! Mi circuito se enredó 🤖⚡ Intenta preguntarme de nuevo en un momento.');
      }
      busy = false; panel.querySelector('#rtSend').disabled = false; input.focus();
    }
  }

  // ── Llamada a la IA ──
  // Producción: backend propio en /api/tutor (Claude Haiku via Vercel function).
  // Vista previa local: window.claude.complete si existe.
  async function askAI() {
    try {
      var headers = { 'Content-Type': 'application/json' };
      // Adjuntar token de sesión para que el backend valide que es un alumno real
      if (window._supabase) {
        var s = (await window._supabase.auth.getSession()).data.session;
        if (s && s.access_token) headers['Authorization'] = 'Bearer ' + s.access_token;
      }
      var r = await fetch('/api/tutor', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ context: CTX, messages: convo })
      });
      if (r.ok) {
        var data = await r.json();
        if (data && data.reply) return data.reply;
      }
    } catch (e) { /* sigue al fallback */ }

    if (window.claude && window.claude.complete) {
      var messages = [
        { role: 'user', content: PERSONA },
        { role: 'assistant', content: '¡Entendido! Soy Robotsin y ayudaré al genio con pistas, sin darle la respuesta hecha. 🤖' }
      ].concat(convo);
      var out = await window.claude.complete({ messages: messages });
      return (out || '').trim() || '¡Cuéntame un poco más, genio! 😄';
    }
    // Fallback sin IA
    return '¡Uy! Ahorita no puedo pensar bien 🤖⚡ Mientras tanto: recuerda los 4 ingredientes del prompt — ¿Qué?, ¿Cómo?, ¿Dónde? y ¿Extras? 🎨';
  }
})();
