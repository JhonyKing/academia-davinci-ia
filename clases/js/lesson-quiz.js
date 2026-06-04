/* ============================================================
   lesson-quiz.js — Mini-quiz al final de cada lección
   Academia Da Vinci IA

   Requiere en la página:
     window.LESSON_QUIZ_DATA = {
       claseNum: N,                    // número de clase (1-26)
       preguntas: [                    // array de preguntas
         { q: "...", opciones: ["a","b","c","d"], correcta: 0, pista: "..." },
         ...
       ]
     }

   Depende de (cargados antes):
     - supabase-client.js  → window._supabase
     - auth.js             → window.dvMarkClassComplete()
     - juice.js            → window.GCSound, window.GCConfetti (opcionales)
   ============================================================ */

;(function () {
  'use strict';

  if (!window.LESSON_QUIZ_DATA) return;

  // Señal para auth.js: no marcar completa por scroll
  window.LESSON_HAS_QUIZ = true;

  const { claseNum, preguntas } = window.LESSON_QUIZ_DATA;
  const PASS_RATE = 0.8;           // 80 %
  const startTime = Date.now();

  // Clases que además requieren entrega física
  const REQUIEREN_ENTREGA = new Set([2, 3, 4, 5, 10, 11, 14, 18, 23]);
  const requiereEntrega = REQUIEREN_ENTREGA.has(claseNum);

  let nextBtn = null;
  let nextBtnHref = null;

  /* ── Bloqueo / desbloqueo del botón siguiente ────────────────────────── */

  function lockNextBtn() {
    nextBtn = document.querySelector('.lnav-btn.next-btn');
    if (!nextBtn) return;
    nextBtnHref = nextBtn.getAttribute('href');
    nextBtn.removeAttribute('href');
    nextBtn.classList.add('lq-locked');

    const msg = document.createElement('p');
    msg.id = 'lq-lock-msg';
    msg.textContent = '🔒 Completa el quiz para continuar a la siguiente lección';
    nextBtn.parentElement.appendChild(msg);
  }

  function unlockNextBtn() {
    if (!nextBtn) return;
    nextBtn.setAttribute('href', nextBtnHref);
    nextBtn.classList.remove('lq-locked');
    nextBtn.classList.add('lq-unlocked');

    const msg = document.getElementById('lq-lock-msg');
    if (msg) {
      msg.textContent = '✅ ¡Quiz completado! Puedes continuar.';
      msg.classList.add('lq-done-msg');
    }
  }

  /* ── Supabase: verificar si ya aprobó ───────────────────────────────── */

  async function checkAlreadyPassed() {
    try {
      const sb = window._supabase;
      if (!sb) return false;
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return false;
      const { data } = await sb
        .from('progress')
        .select('completada')
        .eq('user_id', user.id)
        .eq('clase_num', claseNum)
        .maybeSingle();
      return data?.completada === true;
    } catch (_) {
      return false;
    }
  }

  /* ── Lógica del quiz ────────────────────────────────────────────────── */

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderQuiz(container) {
    const shuffled = shuffle(preguntas);
    const total    = shuffled.length;
    const passMark = Math.ceil(total * PASS_RATE);

    container.innerHTML = `
      <div class="lq-wrap">
        <div class="lq-header">
          <span class="lq-icon">🧠</span>
          <div>
            <div class="lq-title">Quiz de la Clase ${claseNum}</div>
            <div class="lq-sub">Necesitas <strong>${passMark} de ${total}</strong> respuestas correctas (80%) para continuar. ¡Intentos ilimitados!</div>
          </div>
        </div>
        ${requiereEntrega ? `
        <div class="lq-entrega-notice">
          📬 <strong>¡Importante!</strong> Esta clase también requiere que entregues tu misión.
          Completa la entrega <em>y</em> el quiz para avanzar a la siguiente lección.
        </div>` : ''}
        <div id="lq-questions" class="lq-questions"></div>
        <div class="lq-footer">
          <button id="lq-submit" class="lq-btn-submit" disabled>
            Verificar mis respuestas →
          </button>
        </div>
      </div>`;

    const qContainer = document.getElementById('lq-questions');
    const submitBtn  = document.getElementById('lq-submit');
    const answers    = {};

    shuffled.forEach((q, idx) => {
      // Mezclar opciones manteniendo cuál es la correcta
      const withMeta = q.opciones.map((text, i) => ({ text, isCorrect: i === q.correcta }));
      const mixed    = shuffle(withMeta);
      const correctIdx = mixed.findIndex(o => o.isCorrect);

      // Guardar índice correcto mezclado en la pregunta (para calificar)
      q._shuffledCorrect = correctIdx;

      const qEl = document.createElement('div');
      qEl.className = 'lq-question';
      qEl.innerHTML = `
        <div class="lq-q-text">
          <span class="lq-q-num">${idx + 1}</span>
          ${q.q}
        </div>
        <div class="lq-options">
          ${mixed.map((opt, i) => `
            <label class="lq-option">
              <input type="radio" name="q${idx}" value="${i}">
              <span>${opt.text}</span>
            </label>`).join('')}
        </div>
        ${q.pista ? `<div class="lq-pista" id="pista-${idx}" style="display:none">💡 ${q.pista}</div>` : ''}`;

      qContainer.appendChild(qEl);

      qEl.querySelectorAll('input[type=radio]').forEach(radio => {
        radio.addEventListener('change', () => {
          answers[idx] = parseInt(radio.value, 10);
          if (Object.keys(answers).length === total) submitBtn.disabled = false;
        });
      });
    });

    submitBtn.addEventListener('click', () =>
      gradeQuiz(shuffled, answers, container, total, passMark));
  }

  function gradeQuiz(shuffled, answers, container, total, passMark) {
    let correct = 0;

    shuffled.forEach((q, idx) => {
      const qEl     = container.querySelectorAll('.lq-question')[idx];
      const selected = answers[idx];
      const isCorrect = selected === q._shuffledCorrect;
      if (isCorrect) correct++;

      // Marcar opciones
      qEl.querySelectorAll('.lq-option').forEach((label, i) => {
        if (i === q._shuffledCorrect) label.classList.add('lq-correct');
        else if (i === selected && !isCorrect) label.classList.add('lq-wrong');
        label.querySelector('input').disabled = true;
      });

      // Mostrar pista si falló
      if (!isCorrect && q.pista) {
        const pistaEl = document.getElementById(`pista-${idx}`);
        if (pistaEl) pistaEl.style.display = 'block';
      }
    });

    const pct    = Math.round(correct / total * 100);
    const passed = correct >= passMark;

    const footer = container.querySelector('.lq-footer');
    footer.innerHTML = `
      <div class="lq-result ${passed ? 'lq-pass' : 'lq-fail'}">
        <div class="lq-result-score">${correct}/${total} — ${pct}%</div>
        <div class="lq-result-msg">${passed
          ? '🎉 ¡Aprobado! Ya puedes continuar a la siguiente lección.'
          : `Necesitas ${passMark} correctas para aprobar. Revisa las pistas y vuelve a intentarlo.`}</div>
        ${!passed ? `<button id="lq-retry" class="lq-btn-retry">🔄 Intentar de nuevo</button>` : ''}
      </div>`;

    if (passed) {
      // Guardar en Supabase y desbloquear
      if (window.dvMarkClassComplete) window.dvMarkClassComplete();
      setTimeout(() => {
        unlockNextBtn();
        if (window.GCSound) window.GCSound.win();
        if (window.GCConfetti) window.GCConfetti(60);
      }, 500);
    } else {
      document.getElementById('lq-retry')?.addEventListener('click', () => renderQuiz(container));
    }
  }

  function showAlreadyPassedState(container) {
    container.innerHTML = `
      <div class="lq-wrap lq-already-passed">
        <span class="lq-icon">✅</span>
        <div>
          <div class="lq-title">¡Quiz ya completado!</div>
          <div class="lq-sub">Ya aprobaste esta lección. Puedes continuar cuando quieras.</div>
        </div>
      </div>`;
    unlockNextBtn();
  }

  /* ── Init ────────────────────────────────────────────────────────────── */

  async function init() {
    const container = document.getElementById('lesson-quiz-container');
    if (!container) return;

    lockNextBtn();

    const alreadyPassed = await checkAlreadyPassed();
    if (alreadyPassed) {
      showAlreadyPassedState(container);
    } else {
      renderQuiz(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
