/* ============================================================
   session-tracker.js — Tiempo de estudio por sesión
   Academia Da Vinci IA

   Registra cuánto tiempo pasa cada alumno en el sitio.
   Se carga automáticamente después de auth.js.
   Los padres pueden ver el resumen en progreso.html.

   Una "sesión" abarca toda la visita (sessionStorage comparte el
   id entre páginas). Al cambiar de página se reanuda la misma fila
   sumando sobre lo ya acumulado (baseline) — nunca se sobreescribe.
   ============================================================ */

(function () {
  'use strict';

  var HEARTBEAT_MS  = 30 * 1000;   // actualiza la BD cada 30 segundos
  var SESSION_KEY   = 'dv_session_id';
  var sessionId     = null;
  var sessionStart  = null;
  var baseline      = 0;           // segundos ya acumulados en páginas anteriores
  var cachedToken   = null;        // JWT del usuario para el guardado keepalive
  var heartbeatTimer = null;
  var paused        = false;
  var pausedAt      = null;
  var totalPaused   = 0;

  /* ── Tiempo activo de ESTA página (excluye pestaña oculta) ── */
  function activeSecs() {
    if (!sessionStart) return 0;
    var elapsed = (Date.now() - sessionStart) / 1000;
    var extra   = (paused && pausedAt) ? (Date.now() - pausedAt) / 1000 : 0;
    return Math.max(0, Math.round(elapsed - totalPaused / 1000 - extra));
  }

  /* ── Total de la sesión: lo acumulado antes + esta página ── */
  function totalSecs() { return baseline + activeSecs(); }

  /* ── Crea o reanuda sesión en Supabase ── */
  async function startSession(sb, user) {
    try {
      // Reanudar la sesión de esta visita (mismo tab), conservando lo acumulado
      var existingId = sessionStorage.getItem(SESSION_KEY);
      if (existingId) {
        var check = await sb.from('sesiones')
          .select('id, duracion_segundos').eq('id', existingId).maybeSingle();
        if (check.data) {
          sessionId = existingId;
          baseline  = check.data.duracion_segundos || 0;
        }
      }

      if (!sessionId) {
        var ins = await sb.from('sesiones').insert({
          user_id : user.id,
          inicio  : new Date().toISOString(),
          duracion_segundos: 0
        }).select('id').single();
        sessionId = ins.data && ins.data.id;
        if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
      }

      var s = await sb.auth.getSession();
      cachedToken = s.data && s.data.session && s.data.session.access_token;

      sessionStart = Date.now();
      heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
    } catch (e) {
      // Silencioso — no bloquea la experiencia si falla
    }
  }

  /* ── Actualiza duración en la BD (y refresca el token) ── */
  async function heartbeat() {
    if (!sessionId || !window._supabase) return;
    try {
      var sb = window._supabase;
      await sb.from('sesiones').update({
        duracion_segundos : totalSecs(),
        fin               : new Date().toISOString()
      }).eq('id', sessionId);
      var s = await sb.auth.getSession();
      if (s.data && s.data.session) cachedToken = s.data.session.access_token;
    } catch (_) {}
  }

  /* ── Guardado inmediato y confiable (sobrevive al cierre de página).
        sendBeacon no sirve aquí: no permite PATCH ni headers de Supabase. ── */
  function saveNow() {
    if (!sessionId || !cachedToken) return;
    var url = (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL
              : 'https://joiuvopzkorvmxegnjqg.supabase.co')
              + '/rest/v1/sesiones?id=eq.' + sessionId;
    var key = (typeof SUPABASE_ANON_KEY !== 'undefined') ? SUPABASE_ANON_KEY : null;
    if (!key) return;
    try {
      fetch(url, {
        method: 'PATCH',
        keepalive: true,
        headers: {
          'apikey'        : key,
          'Authorization' : 'Bearer ' + cachedToken,
          'Content-Type'  : 'application/json',
          'Prefer'        : 'return=minimal'
        },
        body: JSON.stringify({
          duracion_segundos : totalSecs(),
          fin               : new Date().toISOString()
        })
      });
    } catch (e) {}
  }

  /* ── Visibilidad: pausa cuando la pestaña está oculta + guarda ── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
      pausedAt = Date.now();
      saveNow();  // guardar lo que va, por si la pestaña no regresa
    } else {
      if (paused && pausedAt) totalPaused += Date.now() - pausedAt;
      paused = false;
      pausedAt = null;
    }
  });

  /* ── Guarda al salir de la página (navegación o cierre) ── */
  window.addEventListener('pagehide', function () {
    clearInterval(heartbeatTimer);
    saveNow();
  });

  /* ── Init: espera a que Supabase esté listo ── */
  var _iv = setInterval(function () {
    var sb = window._supabase;
    if (!sb) return;
    clearInterval(_iv);
    sb.auth.getUser().then(function (r) {
      var user = r.data && r.data.user;
      if (user) startSession(sb, user);
    });
  }, 500);

  /* ── API pública: devuelve segundos activos de esta sesión ── */
  window.dvSessionSecs = function () { return totalSecs(); };

})();
