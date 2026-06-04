/* ============================================================
   archetype-quiz.js — Actividad: Identifica el Arquetipo
   Academia Da Vinci IA — Clase 5: Los Arquetipos
   60 personajes · 12 arquetipos · sistema de trofeos
   ============================================================ */

;(function () {
  'use strict';

  const ARQUETIPOS = [
    { id: 'heroe',      nombre: 'El Héroe',      emoji: '🦸' },
    { id: 'mago',       nombre: 'El Mago',        emoji: '🔮' },
    { id: 'rebelde',    nombre: 'El Rebelde',     emoji: '⚡' },
    { id: 'sabio',      nombre: 'El Sabio',       emoji: '🦉' },
    { id: 'inocente',   nombre: 'El Inocente',    emoji: '☀️' },
    { id: 'explorador', nombre: 'El Explorador',  emoji: '🧭' },
    { id: 'cuidador',   nombre: 'El Cuidador',    emoji: '💚' },
    { id: 'creador',    nombre: 'El Creador',     emoji: '🎨' },
    { id: 'gobernante', nombre: 'El Gobernante',  emoji: '👑' },
    { id: 'amante',     nombre: 'El Amante',      emoji: '❤️' },
    { id: 'bufon',      nombre: 'El Bufón',       emoji: '🃏' },
    { id: 'huerfano',   nombre: 'El Huérfano',    emoji: '🌟' },
  ];

  // Map para lookup rápido
  const AQ_MAP = {};
  ARQUETIPOS.forEach(a => { AQ_MAP[a.id] = a; });

  const PERSONAJES = [
    // 🦸 El Héroe
    { id: 'spiderman',     nombre: 'Spider-Man',       obra: 'Marvel',                       img: 'img/arquetipos/spiderman.jpg',     correcto: ['heroe'] },
    { id: 'moana',         nombre: 'Moana',             obra: 'Disney',                       img: 'img/arquetipos/moana.jpg',         correcto: ['heroe','explorador'] },
    { id: 'mulan',         nombre: 'Mulan',             obra: 'Disney',                       img: 'img/arquetipos/mulan.jpg',         correcto: ['heroe','rebelde'] },
    { id: 'hercules',      nombre: 'Hércules',          obra: 'Disney',                       img: 'img/arquetipos/hercules.jpg',      correcto: ['heroe'] },
    { id: 'harry_potter',  nombre: 'Harry Potter',      obra: 'Harry Potter',                 img: 'img/arquetipos/harry_potter.jpg',  correcto: ['heroe','huerfano'] },
    // 🔮 El Mago
    { id: 'gandalf',       nombre: 'Gandalf',           obra: 'El Señor de los Anillos',      img: 'img/arquetipos/gandalf.jpg',       correcto: ['mago','sabio'] },
    { id: 'genie',         nombre: 'Genio',             obra: 'Aladdin',                      img: 'img/arquetipos/genie.jpg',         correcto: ['mago','bufon'] },
    { id: 'hada_madrina',  nombre: 'Hada Madrina',      obra: 'Cenicienta',                   img: 'img/arquetipos/hada_madrina.jpg',  correcto: ['mago','cuidador'] },
    { id: 'merlin',        nombre: 'Merlín',            obra: 'La Espada en la Piedra',       img: 'img/arquetipos/merlin.jpg',        correcto: ['mago','sabio'] },
    { id: 'dr_strange',    nombre: 'Doctor Strange',    obra: 'Marvel',                       img: 'img/arquetipos/dr_strange.jpg',    correcto: ['mago','heroe'] },
    // ⚡ El Rebelde
    { id: 'shrek',         nombre: 'Shrek',             obra: 'DreamWorks',                   img: 'img/arquetipos/shrek.jpg',         correcto: ['rebelde','huerfano'] },
    { id: 'katniss',       nombre: 'Katniss Everdeen',  obra: 'Los Juegos del Hambre',        img: 'img/arquetipos/katniss.jpg',       correcto: ['rebelde','heroe'] },
    { id: 'remy',          nombre: 'Remy',              obra: 'Ratatouille',                  img: 'img/arquetipos/remy.jpg',          correcto: ['rebelde','creador'] },
    { id: 'jack_sparrow',  nombre: 'Jack Sparrow',      obra: 'Piratas del Caribe',           img: 'img/arquetipos/jack_sparrow.jpg',  correcto: ['rebelde','bufon'] },
    { id: 'sonic',         nombre: 'Sonic',             obra: 'Sonic the Hedgehog',           img: 'img/arquetipos/sonic.jpg',         correcto: ['rebelde','heroe'] },
    // 🦉 El Sabio
    { id: 'yoda',          nombre: 'Yoda',              obra: 'Star Wars',                    img: 'img/arquetipos/yoda.jpg',          correcto: ['sabio'] },
    { id: 'mufasa',        nombre: 'Mufasa',            obra: 'El Rey León',                  img: 'img/arquetipos/mufasa.jpg',        correcto: ['sabio','gobernante'] },
    { id: 'oogway',        nombre: 'Maestro Oogway',    obra: 'Kung Fu Panda',                img: 'img/arquetipos/oogway.jpg',        correcto: ['sabio'] },
    { id: 'dumbledore',    nombre: 'Dumbledore',        obra: 'Harry Potter',                 img: 'img/arquetipos/dumbledore.jpg',    correcto: ['sabio','mago'] },
    { id: 'iroh',          nombre: 'Tío Iroh',          obra: 'Avatar: La Leyenda de Aang',   img: 'img/arquetipos/iroh.jpg',          correcto: ['sabio','cuidador'] },
    // ☀️ El Inocente
    { id: 'nemo',          nombre: 'Nemo',              obra: 'Buscando a Nemo',              img: 'img/arquetipos/nemo.jpg',          correcto: ['inocente','heroe'] },
    { id: 'olaf',          nombre: 'Olaf',              obra: 'Frozen',                       img: 'img/arquetipos/olaf.jpg',          correcto: ['inocente','bufon'] },
    { id: 'winnie_pooh',   nombre: 'Winnie Pooh',       obra: 'Disney',                       img: 'img/arquetipos/winnie_pooh.jpg',   correcto: ['inocente'] },
    { id: 'bambi',         nombre: 'Bambi',             obra: 'Disney',                       img: 'img/arquetipos/bambi.jpg',         correcto: ['inocente','huerfano'] },
    { id: 'lilo',          nombre: 'Lilo',              obra: 'Lilo & Stitch',                img: 'img/arquetipos/lilo.jpg',          correcto: ['inocente','huerfano'] },
    // 🧭 El Explorador
    { id: 'dora',          nombre: 'Dora',              obra: 'Dora la Exploradora',          img: 'img/arquetipos/dora.jpg',          correcto: ['explorador'] },
    { id: 'indiana',       nombre: 'Indiana Jones',     obra: 'Indiana Jones',                img: 'img/arquetipos/indiana.jpg',       correcto: ['explorador','heroe'] },
    { id: 'hiccup',        nombre: 'Hipo',              obra: 'Cómo entrenar a tu Dragón',    img: 'img/arquetipos/hiccup.jpg',        correcto: ['explorador','heroe'] },
    { id: 'miguel',        nombre: 'Miguel',            obra: 'Coco',                         img: 'img/arquetipos/miguel.jpg',        correcto: ['explorador','heroe'] },
    { id: 'carl',          nombre: 'Carl Fredricksen',  obra: 'Up',                           img: 'img/arquetipos/carl.jpg',          correcto: ['explorador','amante'] },
    // 💚 El Cuidador
    { id: 'baymax',        nombre: 'Baymax',            obra: 'Big Hero 6',                   img: 'img/arquetipos/baymax.jpg',        correcto: ['cuidador'] },
    { id: 'elastigirl',    nombre: 'Elastigirl',        obra: 'Los Increíbles',               img: 'img/arquetipos/elastigirl.jpg',    correcto: ['cuidador','heroe'] },
    { id: 'paddington',    nombre: 'Paddington',        obra: 'Paddington',                   img: 'img/arquetipos/paddington.jpg',    correcto: ['cuidador','inocente'] },
    { id: 'sam',           nombre: 'Sam Gamgee',        obra: 'El Señor de los Anillos',      img: 'img/arquetipos/sam.jpg',           correcto: ['cuidador'] },
    { id: 'eve',           nombre: 'EVE',               obra: 'WALL-E',                       img: 'img/arquetipos/eve.jpg',           correcto: ['cuidador','amante'] },
    // 🎨 El Creador
    { id: 'tony_stark',    nombre: 'Tony Stark',        obra: 'Marvel',                       img: 'img/arquetipos/tony_stark.jpg',    correcto: ['creador','heroe'] },
    { id: 'wonka',         nombre: 'Willy Wonka',       obra: 'Charlie y la Fábrica de Chocolate', img: 'img/arquetipos/wonka.jpg',   correcto: ['creador','mago'] },
    { id: 'edna',          nombre: 'Edna Mode',         obra: 'Los Increíbles',               img: 'img/arquetipos/edna.jpg',          correcto: ['creador'] },
    { id: 'emmet',         nombre: 'Emmet',             obra: 'La LEGO Película',             img: 'img/arquetipos/emmet.jpg',         correcto: ['creador','heroe'] },
    { id: 'hiro',          nombre: 'Hiro Hamada',       obra: 'Big Hero 6',                   img: 'img/arquetipos/hiro.jpg',          correcto: ['creador','heroe'] },
    // 👑 El Gobernante
    { id: 'simba',         nombre: 'Simba',             obra: 'El Rey León',                  img: 'img/arquetipos/simba.jpg',         correcto: ['gobernante','heroe'] },
    { id: 'black_panther', nombre: 'Black Panther',     obra: 'Marvel',                       img: 'img/arquetipos/black_panther.jpg', correcto: ['gobernante','heroe'] },
    { id: 'elsa',          nombre: 'Elsa (Reina)',      obra: 'Frozen',                       img: 'img/arquetipos/elsa.jpg',          correcto: ['gobernante','mago'] },
    { id: 'triton',        nombre: 'Rey Tritón',        obra: 'La Sirenita',                  img: 'img/arquetipos/triton.jpg',        correcto: ['gobernante'] },
    { id: 'elinor',        nombre: 'Reina Elinor',      obra: 'Brave',                        img: 'img/arquetipos/elinor.jpg',        correcto: ['gobernante','cuidador'] },
    // ❤️ El Amante
    { id: 'walle',         nombre: 'WALL-E',            obra: 'WALL-E',                       img: 'img/arquetipos/walle.jpg',         correcto: ['amante','inocente'] },
    { id: 'ariel',         nombre: 'Ariel',             obra: 'La Sirenita',                  img: 'img/arquetipos/ariel.jpg',         correcto: ['amante','explorador'] },
    { id: 'rapunzel',      nombre: 'Rapunzel',          obra: 'Enredados',                    img: 'img/arquetipos/rapunzel.jpg',      correcto: ['amante','creador'] },
    { id: 'belle',         nombre: 'Bella',             obra: 'La Bella y la Bestia',         img: 'img/arquetipos/belle.jpg',         correcto: ['amante','sabio'] },
    { id: 'romeo',         nombre: 'Romeo',             obra: 'Romeo y Julieta',              img: 'img/arquetipos/romeo.jpg',         correcto: ['amante'] },
    // 🃏 El Bufón
    { id: 'donkey',        nombre: 'Burro',             obra: 'Shrek',                        img: 'img/arquetipos/donkey.jpg',        correcto: ['bufon','amante'] },
    { id: 'timon',         nombre: 'Timón',             obra: 'El Rey León',                  img: 'img/arquetipos/timon.jpg',         correcto: ['bufon'] },
    { id: 'mushu',         nombre: 'Mushu',             obra: 'Mulan',                        img: 'img/arquetipos/mushu.jpg',         correcto: ['bufon','cuidador'] },
    { id: 'patrick',       nombre: 'Patrick Star',      obra: 'Bob Esponja',                  img: 'img/arquetipos/patrick.jpg',       correcto: ['bufon','inocente'] },
    { id: 'phil',          nombre: 'Filoctetes',        obra: 'Hércules',                     img: 'img/arquetipos/phil.jpg',          correcto: ['bufon','sabio'] },
    // 🌟 El Huérfano
    { id: 'frodo',         nombre: 'Frodo Bolsón',      obra: 'El Señor de los Anillos',      img: 'img/arquetipos/frodo.jpg',         correcto: ['huerfano','heroe'] },
    { id: 'cenicienta',    nombre: 'Cenicienta',        obra: 'Disney',                       img: 'img/arquetipos/cenicienta.jpg',    correcto: ['huerfano','inocente'] },
    { id: 'tarzan',        nombre: 'Tarzán',            obra: 'Disney',                       img: 'img/arquetipos/tarzan.jpg',        correcto: ['huerfano','explorador'] },
    { id: 'pinocho',       nombre: 'Pinocho',           obra: 'Disney',                       img: 'img/arquetipos/pinocho.jpg',       correcto: ['huerfano','inocente'] },
    { id: 'oliver',        nombre: 'Oliver',            obra: 'Oliver & Company',             img: 'img/arquetipos/oliver.jpg',        correcto: ['huerfano','inocente'] },
  ];

  // State
  let shuffled = [];
  let current  = 0;
  let score    = 0;
  let container = null;

  // Sounds
  const S = {
    select:  () => window.GCSound?.select(),
    correct: () => window.GCSound?.correct(),
    wrong:   () => window.GCSound?.wrong(),
    next:    () => window.GCSound?.click(),
    fanfare: () => window.GCSound?.fanfare(),
  };

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getTrophy(pct) {
    if (pct >= 90) return { nivel: 'Maestro Supremo', titulo: 'de Arquetipos', emoji: '🏆', color: '#F39C12', stars: 5, fanfare: true  };
    if (pct >= 80) return { nivel: 'Gran Maestro',    titulo: 'de Arquetipos', emoji: '🥇', color: '#E5C200', stars: 4, fanfare: true  };
    if (pct >= 60) return { nivel: 'Experto',         titulo: 'en Arquetipos', emoji: '🥈', color: '#A8B5C0', stars: 3, fanfare: false };
    if (pct >= 40) return { nivel: 'Conocedor',       titulo: 'de Arquetipos', emoji: '🎖️', color: '#CD7F32', stars: 2, fanfare: false };
    return               { nivel: 'Aprendiz',         titulo: 'de Arquetipos', emoji: '🌱', color: '#27AE60', stars: 1, fanfare: false };
  }

  function formatCorrects(ids) {
    return ids.map(id => {
      const a = AQ_MAP[id];
      return a ? `${a.emoji} <strong>${a.nombre}</strong>` : id;
    }).join(' o ');
  }

  /* ── Pantalla de inicio ── */
  function renderStart() {
    container.innerHTML = `
      <div class="aq-card aq-start-card">
        <div class="aq-start-icon">🎮</div>
        <h2 class="aq-start-title">Reto: Identifica el Arquetipo</h2>
        <p class="aq-start-desc">
          Verás <strong>60 personajes famosos</strong> del cine y la TV.<br>
          Tu misión: ¿a cuál arquetipo pertenece cada uno?<br>
          <em>¡Algunos personajes tienen más de un arquetipo correcto!</em>
        </p>
        <div class="aq-start-stats">
          <span>🎭 60 personajes</span>
          <span>🏛️ 12 arquetipos</span>
          <span>🏆 Gana un trofeo</span>
        </div>
        <button class="aq-btn aq-btn-start" id="aq-start-btn">¡Empezar el reto!</button>
      </div>`;

    const btn = document.getElementById('aq-start-btn');
    btn.addEventListener('mouseenter', () => window.GCSound?.hover());
    btn.addEventListener('click', () => { S.next(); startActivity(); });
    if (window.GCBind) window.GCBind();
  }

  function startActivity() {
    score   = 0;
    current = 0;
    shuffled = shuffle(PERSONAJES);
    renderCard(0);
  }

  /* ── Tarjeta de personaje ── */
  function renderCard(idx) {
    const p = shuffled[idx];
    const total = shuffled.length;
    const pct   = Math.round(idx / total * 100);

    container.innerHTML = `
      <div class="aq-card" id="aq-main-card">

        <div class="aq-progress-bar-wrap">
          <div class="aq-progress-bar-fill" style="width:${pct}%"></div>
          <span class="aq-progress-label">${idx} / ${total}</span>
        </div>

        <div class="aq-char-area">
          <div class="aq-char-img-wrap">
            <img class="aq-char-img" src="${p.img}" alt="${p.nombre}"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="aq-char-img-fallback" style="display:none">🎭</div>
          </div>
          <div class="aq-char-info">
            <div class="aq-char-name">${p.nombre}</div>
            <div class="aq-char-obra">${p.obra}</div>
            ${p.correcto.length > 1
              ? `<div class="aq-multi-tip">💡 Este personaje tiene más de un arquetipo correcto</div>`
              : ''}
          </div>
        </div>

        <div class="aq-prompt">¿Cuál es su arquetipo?</div>

        <div class="aq-archetypes-grid" id="aq-grid">
          ${ARQUETIPOS.map(a => `
            <button class="aq-arch-btn" data-id="${a.id}">
              <span class="aq-arch-emoji">${a.emoji}</span>
              <span class="aq-arch-name">${a.nombre}</span>
            </button>`).join('')}
        </div>

        <div id="aq-feedback" class="aq-feedback" style="display:none"></div>

        <div class="aq-card-footer" id="aq-footer" style="display:none">
          <button class="aq-btn aq-btn-next" id="aq-next-btn">
            ${idx === total - 1 ? '🏆 Ver mi trofeo' : 'Siguiente →'}
          </button>
        </div>
      </div>`;

    document.querySelectorAll('.aq-arch-btn').forEach(btn => {
      btn.addEventListener('mouseenter', () => window.GCSound?.hover());
      btn.addEventListener('click', () => {
        S.select();
        handleAnswer(idx, btn.dataset.id);
      });
    });
    if (window.GCBind) window.GCBind();
  }

  function handleAnswer(idx, selectedId) {
    const p = shuffled[idx];
    const isCorrect = p.correcto.includes(selectedId);
    if (isCorrect) score++;

    // Marcar botones
    document.querySelectorAll('.aq-arch-btn').forEach(btn => {
      btn.disabled = true;
      if (p.correcto.includes(btn.dataset.id)) btn.classList.add('aq-arch-correct');
      if (btn.dataset.id === selectedId && !isCorrect) btn.classList.add('aq-arch-wrong');
    });

    if (isCorrect) setTimeout(S.correct, 80);
    else           setTimeout(S.wrong,   80);

    // Feedback
    const feedback = document.getElementById('aq-feedback');
    const correctNames = formatCorrects(p.correcto);
    feedback.innerHTML = isCorrect
      ? `<div class="aq-fb-correct">✅ ¡Correcto! <strong>${p.nombre}</strong> es ${correctNames}</div>`
      : `<div class="aq-fb-wrong">❌ El arquetipo correcto era ${correctNames}</div>`;
    feedback.style.display = 'block';

    // Botón siguiente
    const footer = document.getElementById('aq-footer');
    footer.style.display = 'flex';
    const nextBtn = document.getElementById('aq-next-btn');
    nextBtn.addEventListener('mouseenter', () => window.GCSound?.hover());
    nextBtn.addEventListener('click', () => {
      S.next();
      current = idx + 1;
      if (current >= shuffled.length) renderResults();
      else renderCard(current);
    });
    if (window.GCBind) window.GCBind();
  }

  /* ── Pantalla de resultados + trofeo ── */
  function renderResults() {
    const total = shuffled.length;
    const pct   = Math.round(score / total * 100);
    const t     = getTrophy(pct);
    const stars = '⭐'.repeat(t.stars) + '☆'.repeat(5 - t.stars);

    const msg =
      pct >= 90 ? '¡Extraordinario! Eres un maestro reconociendo arquetipos.' :
      pct >= 80 ? '¡Increíble! Tu intuición para los arquetipos es muy aguda.' :
      pct >= 60 ? '¡Muy bien! Ya dominas los arquetipos principales.' :
      pct >= 40 ? '¡Buen inicio! Sigue practicando y lo tendrás dominado.' :
                  '¡Los arquetipos son difíciles al principio! Repasa la lección e inténtalo de nuevo.';

    container.innerHTML = `
      <div class="aq-card aq-result-card" style="--tc:${t.color}">
        <div class="aq-result-glow"></div>
        <div class="aq-result-trophy">${t.emoji}</div>
        <div class="aq-result-level">${t.nivel}</div>
        <div class="aq-result-titulo">${t.titulo}</div>
        <div class="aq-result-stars">${stars}</div>
        <div class="aq-result-score">${score} <span class="aq-result-of">/ ${total}</span></div>
        <div class="aq-result-pct">${pct}%</div>
        <div class="aq-result-msg">${msg}</div>
        <button class="aq-btn aq-btn-retry" id="aq-retry-btn">🔄 Volver a intentar</button>
      </div>`;

    if (t.fanfare) {
      setTimeout(() => {
        S.fanfare();
        if (window.GCConfetti) window.GCConfetti(100);
      }, 350);
    }

    const retryBtn = document.getElementById('aq-retry-btn');
    retryBtn.addEventListener('mouseenter', () => window.GCSound?.hover());
    retryBtn.addEventListener('click', () => { S.next(); renderStart(); });
    if (window.GCBind) window.GCBind();
  }

  /* ── Init ── */
  function init() {
    container = document.getElementById('archetype-activity-container');
    if (!container) return;
    renderStart();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
