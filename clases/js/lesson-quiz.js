/* ============================================================
   lesson-quiz.js — Mini-quiz una pregunta a la vez
   Academia Da Vinci IA
   ============================================================ */

/* ── Mueve .next div después del quiz y lo convierte en leyenda ── */
;(function () {
  function doMove() {
    var nextDiv = document.querySelector('.next');
    var nav     = document.querySelector('nav.lessonnav');
    if (!nextDiv || !nav) return;
    var em = nextDiv.querySelector('span.em');
    if (em) em.remove();
    nav.parentNode.insertBefore(nextDiv, nav);
    // Override display:flex de lesson.css → columna centrada
    nextDiv.style.cssText = [
      'display:flex;flex-direction:column;align-items:center;justify-content:center;',
      'text-align:center;',
      'max-width:680px;width:100%;box-sizing:border-box;',
      'margin:0 auto;padding:28px 20px 22px;',
      'border-top:2px solid rgba(0,0,0,.09);'
    ].join('');
    var lab = nextDiv.querySelector('.lab');
    var ti  = nextDiv.querySelector('.ti');
    if (lab) lab.style.cssText = 'font-size:11px;text-transform:uppercase;letter-spacing:.14em;font-weight:800;color:var(--wc);margin-bottom:10px;display:block;';
    if (ti)  ti.style.cssText  = 'font-size:24px;font-weight:900;color:#111;display:block;line-height:1.25;';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', doMove);
  else doMove();
})();

;(function () {
  'use strict';

  if (!window.LESSON_QUIZ_DATA) return;

  window.LESSON_HAS_QUIZ = true;

  const { claseNum, preguntas } = window.LESSON_QUIZ_DATA;
  const PASS_RATE = 0.8;
  const startTime = Date.now();
  // Mantener sincronizado con REQUIEREN_ENTREGA de auth.js
  const REQUIEREN_ENTREGA = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 18, 23]);

  let nextBtn = null;
  let nextBtnHref = null;
  let shuffledQ = [];
  let current = 0;
  let answers = {};
  let container = null;

  /* ── Bloqueo / desbloqueo del botón siguiente ── */

  function lockNextBtn() {
    nextBtn = document.querySelector('.lnav-btn.next-btn');
    if (!nextBtn) return;
    nextBtnHref = nextBtn.getAttribute('href');
    nextBtn.removeAttribute('href');
    nextBtn.classList.add('lq-locked');
    nextBtn.style.position = 'relative';
    const overlay = document.createElement('div');
    overlay.id = 'lq-lock-overlay';
    overlay.innerHTML = '<span class="lq-lock-ico">🔒</span><span>' + (REQUIEREN_ENTREGA.has(claseNum) ? 'Completa la entrega y el quiz para continuar' : 'Completa el quiz para continuar') + '</span>';
    nextBtn.appendChild(overlay);
    // shake al hacer clic mientras está bloqueado
    nextBtn._lockedClick = function() {
      nextBtn.classList.remove('lq-shake');
      void nextBtn.offsetWidth;
      nextBtn.classList.add('lq-shake');
    };
    nextBtn.addEventListener('click', nextBtn._lockedClick);
  }

  function unlockNextBtn() {
    if (!nextBtn) return;
    nextBtn.setAttribute('href', nextBtnHref);
    nextBtn.classList.remove('lq-locked');
    nextBtn.classList.add('lq-unlocked');
    nextBtn.style.position = '';
    const overlay = document.getElementById('lq-lock-overlay');
    if (overlay) overlay.remove();
    if (nextBtn._lockedClick) nextBtn.removeEventListener('click', nextBtn._lockedClick);
  }
  // auth.js lo llama cuando la clase se completa de verdad (insignia reclamada)
  window.lqUnlockNext = unlockNextBtn;

  /* ── Supabase ── */

  async function checkAlreadyPassed() {
    try {
      const sb = window._supabase;
      if (!sb) return false;
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return false;
      const { data } = await sb.from('progress').select('completada')
        .eq('user_id', user.id).eq('clase_num', claseNum).maybeSingle();
      return data?.completada === true;
    } catch (_) { return false; }
  }

  /* ── Sonidos ── */

  const S = {
    select:  () => window.GCSound?.select(),
    correct: () => window.GCSound?.correct(),
    wrong:   () => window.GCSound?.wrong(),
    next:    () => window.GCSound?.click(),
    fanfare: () => window.GCSound?.fanfare(),
    fail:    () => window.GCSound?.wrong(),
  };

  /* ── Utilidades ── */

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Render de una pregunta ── */

  function renderQuestion(idx) {
    const q = shuffledQ[idx];
    const total = shuffledQ.length;
    const isLast = idx === total - 1;
    const answered = answers[idx] !== undefined;

    container.innerHTML = `
      <div class="lq-card">
        <div class="lq-card-header">
          <div class="lq-card-tag">🧠 QUIZ · Clase ${claseNum}</div>
          <div class="lq-progress-wrap">
            <div class="lq-progress-dots">
              ${Array.from({length: total}, (_, i) =>
                `<span class="lq-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>`
              ).join('')}
            </div>
            <div class="lq-progress-label">Pregunta ${idx + 1} de ${total}</div>
          </div>
        </div>

        <div class="lq-question-text">${q.q}</div>

        <div class="lq-options-list" id="lq-opts">
          ${q._shuffledOptions.map((opt, i) => `
            <button class="lq-opt ${answered && answers[idx] === i ? (i === q._correctIdx ? 'lq-opt-correct' : 'lq-opt-wrong') : ''} ${answered && i === q._correctIdx ? 'lq-opt-correct' : ''}" data-i="${i}" ${answered ? 'disabled' : ''}>
              <span class="lq-opt-letter">${'ABCD'[i]}</span>
              <span class="lq-opt-text">${opt.text}</span>
              ${answered && i === q._correctIdx ? '<span class="lq-opt-mark">✓</span>' : ''}
              ${answered && answers[idx] === i && i !== q._correctIdx ? '<span class="lq-opt-mark">✗</span>' : ''}
            </button>`).join('')}
        </div>

        ${answered && !q._shuffledOptions[answers[idx]].isCorrect && q.pista ? `
          <div class="lq-pista">💡 ${q.pista}</div>` : ''}

        <div class="lq-card-footer">
          ${answered ? `
            <button class="lq-btn-next" id="lq-advance">
              ${isLast ? '📊 Ver resultados' : 'Siguiente pregunta →'}
            </button>` : `
            <div class="lq-hint-select">Selecciona una respuesta para continuar</div>`}
        </div>
      </div>`;

    // Bind options
    if (!answered) {
      container.querySelectorAll('.lq-opt').forEach(btn => {
        btn.addEventListener('mouseenter', () => window.GCSound?.hover());
        btn.addEventListener('click', () => {
          S.select();
          selectAnswer(idx, parseInt(btn.dataset.i));
        });
      });
    } else {
      const advBtn = document.getElementById('lq-advance');
      if (advBtn) {
        advBtn.addEventListener('mouseenter', () => window.GCSound?.hover());
        advBtn.addEventListener('click', () => {
          S.next();
          if (isLast) showResults();
          else renderQuestion(idx + 1);
          current = isLast ? current : idx + 1;
        });
      }
    }
    // Registrar botones dinámicos con juice.js (hover + ripple)
    if (window.GCBind) window.GCBind();
  }

  function selectAnswer(qIdx, optIdx) {
    const q = shuffledQ[qIdx];
    const isCorrect = optIdx === q._correctIdx;
    // Sonido inmediato antes del re-render
    if (isCorrect) setTimeout(S.correct, 80);
    else setTimeout(S.wrong, 80);
    answers[qIdx] = optIdx;
    renderQuestion(qIdx);
  }

  /* ── Resultados ── */

  function showResults() {
    const total = shuffledQ.length;
    const correct = shuffledQ.filter((q, i) => answers[i] === q._correctIdx).length;
    const pct = Math.round(correct / total * 100);
    const passed = pct >= Math.round(PASS_RATE * 100);
    const passMark = Math.ceil(total * PASS_RATE);

    container.innerHTML = `
      <div class="lq-card lq-result-card ${passed ? 'lq-passed' : 'lq-failed'}">
        <div class="lq-card-header">
          <div class="lq-card-tag">🧠 QUIZ · Clase ${claseNum}</div>
        </div>
        <div class="lq-result-score">${passed ? '🎉' : '😓'}</div>
        <div class="lq-result-num">${correct} / ${total}</div>
        <div class="lq-result-pct">${pct}%</div>
        <div class="lq-result-msg">
          ${passed
            ? (REQUIEREN_ENTREGA.has(claseNum)
                ? '¡Aprobado! Ahora completa tu entrega para terminar la clase.'
                : '¡Aprobado! Ya puedes continuar a la siguiente lección.')
            : `Necesitas al menos ${passMark} correctas (80%). ¡Inténtalo de nuevo!`}
        </div>
        ${!passed ? `<button class="lq-btn-retry" id="lq-retry">🔄 Volver a intentar</button>` : ''}
        ${passed && REQUIEREN_ENTREGA.has(claseNum) ? `
          <div class="lq-entrega-notice">
            📬 <strong>Recuerda:</strong> Esta clase también requiere entregar tu misión para avanzar.
          </div>` : ''}
      </div>`;

    if (passed) {
      if (REQUIEREN_ENTREGA.has(claseNum)) {
        // Clases con entrega: el quiz NO completa la clase por sí solo.
        // Solo marca el flag; la clase se completa al reclamar la insignia
        // (botón gateado por _entregaDone && _quizPassed).
        window._quizPassed = true;
        if (window.checkBadgeUnlock) window.checkBadgeUnlock();
      } else {
        if (window.dvMarkClassComplete) window.dvMarkClassComplete();
        unlockNextBtn();
      }
      setTimeout(() => {
        S.fanfare();
        if (window.GCConfetti) window.GCConfetti(80);
      }, 300);
    } else {
      S.fail();
      const retryBtn = document.getElementById('lq-retry');
      if (retryBtn) {
        retryBtn.addEventListener('mouseenter', () => window.GCSound?.hover());
        retryBtn.addEventListener('click', () => { S.next(); startQuiz(); });
      }
    }
  }

  /* ── Init quiz ── */

  function startQuiz() {
    current = 0;
    answers = {};
    shuffledQ = shuffle(preguntas).map(q => {
      const withMeta = q.opciones.map((text, i) => ({ text, isCorrect: i === q.correcta }));
      const mixed = shuffle(withMeta);
      return { ...q, _shuffledOptions: mixed, _correctIdx: mixed.findIndex(o => o.isCorrect) };
    });
    renderQuestion(0);
  }

  function showAlreadyPassed() {
    // Muestra banner verde pero sigue mostrando el quiz para repasar
    unlockNextBtn();
    const notice = document.createElement('div');
    notice.id = 'lq-done-notice';
    notice.innerHTML = `
      <div style="background:rgba(34,194,104,.12);border:1.5px solid rgba(34,194,104,.35);
        border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <span style="font-size:28px;line-height:1;">✅</span>
        <div>
          <div style="font-weight:800;color:#22C268;font-size:15px;">¡Ya completaste este quiz!</div>
          <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:3px;">Puedes volver a practicar las preguntas cuando quieras.</div>
        </div>
      </div>`;
    container.prepend(notice);
    startQuiz();
  }

  /* ── Init ── */

  async function init() {
    container = document.getElementById('lesson-quiz-container');
    if (!container) return;
    lockNextBtn();
    const passed = await checkAlreadyPassed();
    if (passed) showAlreadyPassed();
    else startQuiz();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
