/* ============================================================
   session-tracker.js — Tiempo de estudio por sesión
   Academia Da Vinci IA

   Registra cuánto tiempo pasa cada alumno en el sitio.
   Se carga automáticamente después de auth.js.
   Los padres pueden ver el resumen en progreso.html.
   ============================================================ */

(function () {
  'use strict';

  var HEARTBEAT_MS  = 60 * 1000;   // actualiza la BD cada 60 segundos
  var SESSION_KEY   = 'dv_session_id';
  var sessionId     = null;
  var sessionStart  = null;
  var heartbeatTimer = null;
  var paused        = false;
  var pausedAt      = null;
  var totalPaused   = 0;

  /* ── Tiempo activo (excluye tiempo con pestaña oculta) ── */
  function activeSecs() {
    var elapsed = (Date.now() - sessionStart) / 1000;
    var extra   = (paused && pausedAt) ? (Date.now() - pausedAt) / 1000 : 0;
    return Math.max(0, Math.round(elapsed - totalPaused / 1000 - extra));
  }

  /* ── Crea o reanuda sesión en Supabase ── */
  async function startSession(sb, user) {
    try {
      // Intenta reanudar sesión de esta pestaña (misma sesión de browser)
      var existingId = sessionStorage.getItem(SESSION_KEY);
      if (existingId) {
        var check = await sb.from('sesiones').select('id').eq('id', existingId).maybeSingle();
        if (check.data) { sessionId = existingId; }
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

      sessionStart = Date.now();
      heartbeatTimer = setInterval(heartbeat, HEARTBEAT_MS);
    } catch (e) {
      // Silencioso — no bloquea la experiencia si falla
    }
  }

  /* ── Actualiza duración en la BD ── */
  async function heartbeat() {
    if (!sessionId || !window._supabase) return;
    try {
      await window._supabase.from('sesiones').update({
        duracion_segundos : activeSecs(),
        fin               : new Date().toISOString()
      }).eq('id', sessionId);
    } catch (_) {}
  }

  /* ── Visibilidad: pausa cuando la pestaña está oculta ── */
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      paused = true;
      pausedAt = Date.now();
    } else {
      if (paused && pausedAt) totalPaused += Date.now() - pausedAt;
      paused = false;
      pausedAt = null;
    }
  });

  /* ── Guarda al salir de la página ── */
  window.addEventListener('pagehide', function () {
    clearInterval(heartbeatTimer);
    // Intento síncrono (no espera Promise)
    var sb = window._supabase;
    if (!sb || !sessionId) return;
    var secs = activeSecs();
    // sendBeacon para garantizar el envío aunque la página se cierre
    var url = sb.supabaseUrl + '/rest/v1/sesiones?id=eq.' + sessionId;
    var body = JSON.stringify({ duracion_segundos: secs, fin: new Date().toISOString() });
    navigator.sendBeacon && navigator.sendBeacon(
      url,
      new Blob([body], { type: 'application/json' })
    );
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
  window.dvSessionSecs = function () { return activeSecs(); };

})();
