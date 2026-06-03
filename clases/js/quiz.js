/* ============================================================
   GENIOS CREATIVOS · quiz.js — Checkpoint por mundo
   Reto de opción múltiple con feedback inmediato y recompensa.
   Uso:
     <div id="quiz"></div>
     <script>window.QUIZ_DATA = {
       insignia:'🎨', insigniaNombre:'Maestro de Prompts',
       avatar:'robotsin/robotsin_artista.png',
       volverHref:'index.html', siguienteHref:'clase6_el_universo.html',
       preguntas:[ { q:'…', opciones:['…','…','…'], correcta:1, pista:'…' }, … ]
     };</script>
     <script src="js/quiz.js"></script>
   ============================================================ */
(function () {
  'use strict';
  function init() {
    var mount = document.getElementById('quiz');
    var D = window.QUIZ_DATA;
    if (!mount || !D || !D.preguntas) return;

    var KEYS = ['A', 'B', 'C', 'D', 'E'];
    var avatar = D.avatar || 'robotsin/robotsin_artista.png';
    var i = 0, aciertos = 0, intentos = 0, locked = false;

    var card = document.createElement('div');
    card.className = 'quiz-card';
    mount.appendChild(card);

    function renderQuestion() {
      locked = false;
      var p = D.preguntas[i];
      var pct = Math.round((i / D.preguntas.length) * 100);
      card.innerHTML =
        '<div class="quiz-bar-top">' +
          '<div class="quiz-track"><div class="quiz-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="quiz-count">' + (i + 1) + ' / ' + D.preguntas.length + '</div>' +
        '</div>' +
        '<div class="quiz-q"><span class="ava"><img src="' + avatar + '" alt="Robotsin"></span><h3>' + p.q + '</h3></div>' +
        '<div class="quiz-options" id="quizOpts"></div>' +
        '<div class="quiz-feedback" id="quizFb"></div>';
      var opts = card.querySelector('#quizOpts');
      p.opciones.forEach(function (txt, idx) {
        var b = document.createElement('button');
        b.className = 'quiz-opt'; b.type = 'button';
        b.innerHTML = '<span class="key">' + KEYS[idx] + '</span><span>' + txt + '</span>';
        b.addEventListener('click', function () { answer(idx, b); });
        opts.appendChild(b);
      });
    }

    function answer(idx, btn) {
      if (locked) return;
      var p = D.preguntas[i];
      intentos++;
      var fb = card.querySelector('#quizFb');
      if (idx === p.correcta) {
        locked = true;
        btn.classList.add('correct');
        card.querySelectorAll('.quiz-opt').forEach(function (o) { o.disabled = true; if (o !== btn) o.classList.add('dim'); });
        if (intentos === 1) aciertos++;
        if (window.GCSound) try { window.GCSound.unlock(); } catch (e) {}
        if (window.GCConfetti) window.GCConfetti(14);
        fb.className = 'quiz-feedback ok show';
        fb.innerHTML = '<span class="em">✅</span><span>¡Correcto, genio!</span>' +
          '<button class="btn ' + (D.btnClass || '') + ' next" id="quizNext">' + (i + 1 < D.preguntas.length ? 'Siguiente →' : 'Ver resultado 🏆') + '</button>';
        card.querySelector('#quizNext').addEventListener('click', function () {
          i++; if (i < D.preguntas.length) renderQuestion(); else renderEnd();
        });
      } else {
        btn.classList.add('wrong'); btn.disabled = true;
        if (window.GCSound) try { window.GCSound.hover(); } catch (e) {}
        fb.className = 'quiz-feedback no show';
        fb.innerHTML = '<span class="em">💡</span><span><b>Casi…</b> ' + (p.pista || 'Piénsalo otra vez, ¡tú puedes!') + '</span>';
      }
    }

    function renderEnd() {
      var total = D.preguntas.length;
      var perfecto = aciertos === total;
      card.innerHTML =
        '<div class="quiz-end">' +
          '<div class="coin">' + (D.insignia || '🏆') + '</div>' +
          '<h2>' + (perfecto ? '¡Reto perfecto! 🎉' : '¡Reto superado! 🎉') + '</h2>' +
          '<div class="score">Acertaste ' + aciertos + ' de ' + total + ' a la primera</div>' +
          '<p>Ganaste la insignia <b>"' + (D.insigniaNombre || 'Maestro del Mundo') + '"</b>. ¡Listo para el siguiente mundo!</p>' +
          '<div class="actions">' +
            (D.volverHref ? '<a class="btn btn-ghost" href="' + D.volverHref + '">🗺️ Volver al mapa</a>' : '') +
            (D.siguienteHref ? '<a class="btn ' + (D.btnClass || '') + '" href="' + D.siguienteHref + '">' + (D.siguienteLabel || '▶ Siguiente mundo') + '</a>' : '') +
          '</div>' +
        '</div>';
      if (window.GCSound) try { window.GCSound.win(); } catch (e) {}
      if (window.GCConfetti) window.GCConfetti(70);
    }

    renderQuestion();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
