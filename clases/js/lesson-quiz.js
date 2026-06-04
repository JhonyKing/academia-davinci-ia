/* ============================================================
   lesson-quiz.js — Mini-quiz una pregunta a la vez
   Academia Da Vinci IA
   ============================================================ */

;(function () {
  'use strict';

  if (!window.LESSON_QUIZ_DATA) return;

  window.LESSON_HAS_QUIZ = true;

  const { claseNum, preguntas } = window.LESSON_QUIZ_DATA;
  const PASS_RATE = 0.8;
  const startTime = Date.now();
  const REQUIEREN_ENTREGA = new Set([2, 3, 4, 5, 10, 11, 14, 18, 23]);

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
    const msg = document.createElement('p');
    msg.id = 'lq-lock-msg';
    msg.textContent = '🔒 Completa el quiz para continuar';
    nextBtn.parentElement.appendChild(msg);
  }

  function unlockNextBtn() {
    if (!nextBtn) return;
    nextBtn.setAttribute('href', nextBtnHref);
    nextBtn.classList.remove('lq-locked');
    nextBtn.classList.add('lq-unlocked');
    const msg = document.getElementById('lq-lock-msg');
    if (msg) { msg.textContent = '✅ ¡Quiz completado!'; msg.classList.add('lq-done-msg'); }
  }

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
        btn.addEventListener('click', () => selectAnswer(idx, parseInt(btn.dataset.i)));
      });
    } else {
      document.getElementById('lq-advance')?.addEventListener('click', () => {
        if (isLast) showResults();
        else renderQuestion(idx + 1);
        current = isLast ? current : idx + 1;
      });
    }
  }

  function selectAnswer(qIdx, optIdx) {
    answers[qIdx] = optIdx;
    renderQuestion(qIdx); // re-render para mostrar correcto/incorrecto
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
            ? '¡Aprobado! Ya puedes continuar a la siguiente lección.'
            : `Necesitas al menos ${passMark} correctas (80%). ¡Inténtalo de nuevo!`}
        </div>
        ${!passed ? `<button class="lq-btn-retry" id="lq-retry">🔄 Volver a intentar</button>` : ''}
        ${passed && REQUIEREN_ENTREGA.has(claseNum) ? `
          <div class="lq-entrega-notice">
            📬 <strong>Recuerda:</strong> Esta clase también requiere entregar tu misión para avanzar.
          </div>` : ''}
      </div>`;

    if (passed) {
      if (window.dvMarkClassComplete) window.dvMarkClassComplete();
      setTimeout(() => {
        unlockNextBtn();
        if (window.GCSound) window.GCSound.win();
        if (window.GCConfetti) window.GCConfetti(60);
      }, 400);
    } else {
      document.getElementById('lq-retry')?.addEventListener('click', startQuiz);
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
    container.innerHTML = `
      <div class="lq-card lq-already-done">
        <div class="lq-card-header">
          <div class="lq-card-tag">🧠 QUIZ · Clase ${claseNum}</div>
        </div>
        <div class="lq-result-score">✅</div>
        <div class="lq-result-msg">¡Ya completaste este quiz! Puedes continuar.</div>
      </div>`;
    unlockNextBtn();
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
