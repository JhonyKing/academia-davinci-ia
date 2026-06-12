// ──────────────────────────────────────────────
//  auth.js
//  Incluir en TODAS las páginas de lección (clase*.html)
//  NO incluir en login.html ni admin.html
//
//  Dependencias (incluir antes en el HTML):
//    1. https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js
//    2. js/supabase-client.js
// ──────────────────────────────────────────────

;(function () {
  'use strict'

  // ── 1. Detectar número de clase del nombre del archivo ──────────────────
  function detectClaseNum() {
    const pathname = window.location.pathname          // e.g. /clases/clase7_mapa_del_mundo.html
    const filename = pathname.split('/').pop()         // clase7_mapa_del_mundo.html
    const match    = filename.match(/clase(\d+)/i)
    return match ? parseInt(match[1], 10) : null
  }

  const CLASE_NUM       = detectClaseNum()
  const TOTAL_CLASES    = 26

  // Detectar página de checkpoint (checkpoint_mundoN.html)
  function detectCheckpointNum() {
    const filename = window.location.pathname.split('/').pop()
    const match    = filename.match(/checkpoint_mundo(\d+)/i)
    return match ? parseInt(match[1], 10) : null
  }
  const CHECKPOINT_NUM = detectCheckpointNum()

  // Clases que requieren entrega además del quiz para completarse
  const REQUIEREN_ENTREGA = new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 18, 23])

  // Primera clase de cada mundo → checkpoint del mundo anterior (clase_num 100+N)
  const REQUIERE_CHECKPOINT = { 6: 101, 10: 102, 14: 103, 19: 104, 23: 105 }
  // Última clase de cada mundo (requisito para entrar a su checkpoint)
  const ULTIMA_DE_MUNDO = { 1: 5, 2: 9, 3: 13, 4: 18, 5: 22, 6: 26 }

  // ── 1b. Carga celebration.js de forma diferida ──────────────────────────
  function loadCelebration() {
    if (window.CelebrationSystem) return Promise.resolve()
    return new Promise(resolve => {
      const s = document.createElement('script')
      s.src = 'js/celebration.js'
      s.onload = resolve
      s.onerror = resolve  // si falla, no bloquear
      document.head.appendChild(s)
    })
  }

  // ── 2a. Validar en BD que la entrega de la clase realmente existe ────────
  // Defensa en profundidad: aunque el front marque flags, la clase NO se
  // completa si la entrega no está guardada en Supabase.
  async function entregaCompletaEnBD(userId) {
    if (!REQUIEREN_ENTREGA.has(CLASE_NUM)) return true
    const sb = window._supabase
    try {
      if (CLASE_NUM === 7) {
        // Clase 7: requiere ≥1 aliado y ≥1 villano en personajes_secundarios
        const { data } = await sb.from('personajes_secundarios')
          .select('tipo').eq('user_id', userId)
        const tipos = (data || []).map(r => r.tipo)
        return tipos.includes('aliado') && tipos.includes('villano')
      }
      if (CLASE_NUM === 6) {
        // Clase 6: requiere las 3 imágenes del universo
        const { data } = await sb.from('entregas')
          .select('tipo').eq('user_id', userId).eq('clase_num', 6)
        const tipos = new Set((data || []).map(r => r.tipo))
        return tipos.has('universo_principal') && tipos.has('universo_version_b') && tipos.has('universo_zona')
      }
      // Resto: al menos una entrega registrada para esta clase
      const { count } = await sb.from('entregas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId).eq('clase_num', CLASE_NUM)
      return (count || 0) > 0
    } catch (_) {
      return false  // ante la duda, no completar
    }
  }

  // ── 2. Marcar clase como completada en Supabase ─────────────────────────
  async function markClassComplete(userId) {
    if (!CLASE_NUM) return
    const sb = window._supabase

    // Verificar la entrega en BD antes de marcar (no confiar solo en flags del front)
    const entregaOk = await entregaCompletaEnBD(userId)
    if (!entregaOk) {
      console.warn('[Da Vinci IA] Clase', CLASE_NUM, 'NO completada: falta la entrega.')
      nudgeEntrega()
      return
    }

    // Verificar si ya estaba completada (para mostrar celebración solo la primera vez)
    const { data: existing } = await sb
      .from('progress')
      .select('completada')
      .eq('user_id', userId)
      .eq('clase_num', CLASE_NUM)
      .maybeSingle()
    const wasAlreadyComplete = existing?.completada === true

    const { error } = await sb
      .from('progress')
      .upsert(
        { user_id: userId, clase_num: CLASE_NUM, completada: true, completada_at: new Date().toISOString() },
        { onConflict: 'user_id,clase_num' }
      )
    if (error) {
      console.warn('[Da Vinci IA] Error guardando progreso:', error.message)
    } else {
      console.log('[Da Vinci IA] Clase', CLASE_NUM, 'marcada como completada ✓')
      // Desbloquear el botón "Siguiente misión" (bloqueado por lesson-quiz.js)
      if (window.lqUnlockNext) window.lqUnlockNext()
      // Marcar visualmente el botón de navegación siguiente si existe
      const badge = document.getElementById('dv-progress-badge')
      if (badge) {
        badge.textContent = '✓ Completada'
        badge.style.color = 'var(--green, #27AE60)'
      }
      // Celebración solo la primera vez que se completa
      if (!wasAlreadyComplete) {
        loadCelebration().then(() => {
          if (window.CelebrationSystem) {
            window.CelebrationSystem.showClassComplete(CLASE_NUM)
          }
        })
      }
    }
  }

  // ── 3. Actualizar último acceso en profiles ──────────────────────────────
  async function updateLastAccess(userId) {
    const sb = window._supabase
    await sb
      .from('profiles')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', userId)
  }

  // ── 4. Inyectar botón de logout en .topbar-right ────────────────────────
  function injectGreeting(nombre) {
    const right = document.querySelector('.topbar-right')
    if (!right) return
    const logoutBtn = document.createElement('button')
    logoutBtn.id          = 'dv-logout-btn'
    logoutBtn.textContent = 'Salir'
    logoutBtn.style.cssText = `
      background: transparent;
      border: 1.5px solid var(--line, rgba(0,0,0,.15));
      color: var(--ink-2, #5a5f7a);
      padding: 6px 14px;
      border-radius: 20px;
      font-family: 'Poppins', sans-serif;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all .2s;
    `
    logoutBtn.addEventListener('mouseover', () => {
      logoutBtn.style.borderColor = 'var(--red, #E74C3C)'
      logoutBtn.style.color = 'var(--red, #E74C3C)'
    })
    logoutBtn.addEventListener('mouseout', () => {
      logoutBtn.style.borderColor = 'var(--line, rgba(0,0,0,.15))'
      logoutBtn.style.color = 'var(--ink-2, #5a5f7a)'
    })
    logoutBtn.addEventListener('click', window.dvLogout)
    right.appendChild(logoutBtn)
  }

  // ── 5a. Nudge visual cuando la clase requiere entrega ───────────────────
  function nudgeEntrega() {
    if (document.getElementById('dv-entrega-nudge')) return

    const nudge = document.createElement('div')
    nudge.id = 'dv-entrega-nudge'
    nudge.innerHTML = '📬 <strong>¡Casi!</strong> Entrega tu misión para completar esta clase.'
    nudge.style.cssText = `
      position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
      background: #1A2540; border: 1px solid rgba(74,144,217,0.5);
      border-left: 4px solid #4A90D9;
      color: #E8EAF0; font-family: 'Poppins', sans-serif;
      font-size: 14px; padding: 14px 24px; border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      z-index: 9000; cursor: pointer; white-space: nowrap;
      animation: dv-nudge-in .3s ease both;
    `
    if (!document.getElementById('dv-nudge-style')) {
      const st = document.createElement('style')
      st.id = 'dv-nudge-style'
      st.textContent = `
        @keyframes dv-nudge-in { from { opacity:0; transform:translateX(-50%) translateY(12px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
      `
      document.head.appendChild(st)
    }
    document.body.appendChild(nudge)

    nudge.addEventListener('click', () => {
      nudge.remove()
      const widget = document.getElementById('entrega-widget')
      if (widget) widget.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    setTimeout(() => nudge.remove(), 5000)
  }

  // ── 5b. Inyectar botón "Completar misión" para clases sin quiz ni entrega ──
  // Las clases con LESSON_HAS_QUIZ se completan desde el quiz.
  // Las clases en REQUIEREN_ENTREGA se completan desde el widget de entrega.
  // Esta función agrega un botón visible para las demás clases de solo contenido.
  function injectCompletionButton(userId) {
    if (!CLASE_NUM) return  // No inyectar en páginas que no son clases (mi-estudio, etc.)
    if (window.LESSON_HAS_QUIZ) return
    if (REQUIEREN_ENTREGA.has(CLASE_NUM)) return
    if (document.getElementById('dv-complete-btn-wrap')) return

    const wrap = document.createElement('div')
    wrap.id = 'dv-complete-btn-wrap'
    wrap.style.cssText = `
      text-align: center; padding: 32px 20px 48px; margin-top: 16px;
    `
    wrap.innerHTML = `
      <button id="dv-complete-btn" style="
        background: var(--green, #27AE60); color: #fff; border: none;
        padding: 16px 36px; border-radius: 50px; font-family: 'Poppins', sans-serif;
        font-size: 16px; font-weight: 700; cursor: pointer;
        box-shadow: 0 4px 18px rgba(39,174,96,.35);
        transition: transform .15s, box-shadow .15s;
      ">✅ ¡Completar esta misión!</button>
      <p style="margin-top:10px;font-size:13px;color:var(--ink-3,#8890b5);font-family:'Poppins',sans-serif;">
        Haz clic cuando hayas terminado de leer y practicar.
      </p>
    `
    // Insertar antes del footer o al final del body
    const foot = document.querySelector('footer') || document.querySelector('.foot')
    if (foot) foot.before(wrap)
    else document.body.appendChild(wrap)

    const btn = document.getElementById('dv-complete-btn')
    btn.addEventListener('mouseover', () => { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 8px 28px rgba(39,174,96,.45)' })
    btn.addEventListener('mouseout',  () => { btn.style.transform = ''; btn.style.boxShadow = '0 4px 18px rgba(39,174,96,.35)' })
    btn.addEventListener('click', async () => {
      btn.disabled = true
      btn.textContent = '⏳ Guardando…'
      await markClassComplete(userId)
      btn.textContent = '🏆 ¡Misión completada!'
      btn.style.background = 'var(--ink-3, #8890b5)'
      btn.style.cursor = 'default'
      btn.style.boxShadow = 'none'
    })
  }

  // ── 6. Función global logout ─────────────────────────────────────────────
  window.dvLogout = async function () {
    const sb = window._supabase
    await sb.auth.signOut()
    window.location.href = 'login.html'
  }

  // ── 7. Función global markClassComplete (accesible desde HTML si se necesita) ──
  window.dvMarkClassComplete = function () {
    const sb = window._supabase
    sb.auth.getUser().then(({ data }) => {
      if (data && data.user) markClassComplete(data.user.id)
    })
  }

  // ── 8. Init: verificar sesión al cargar ──────────────────────────────────
  async function init() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init)
      return
    }

    const sb = window._supabase
    if (!sb) {
      console.error('[Da Vinci IA] _supabase no inicializado. Verifica que supabase-client.js esté incluido.')
      window.location.href = 'login.html'
      return
    }

    const { data: { session }, error } = await sb.auth.getSession()

    if (error || !session) {
      // Sin sesión → redirigir a login
      window.location.href = 'login.html'
      return
    }

    const user = session.user

    // Obtener perfil del alumno
    const { data: profile } = await sb
      .from('profiles')
      .select('nombre, rol, activo')
      .eq('id', user.id)
      .single()

    const nombre = profile?.nombre || user.email.split('@')[0]

    // Destino al toparse con un candado en clase de paga (regla de Jhony):
    // cuenta gratis CON entregas → página de pago (momento de venta: ahí ve
    // todo lo que ya creó). Cuenta gratis sin entregas, o cuenta pagada → mapa.
    const CLASES_GRATIS = 4
    async function lockDestino() {
      if (CLASE_NUM && CLASE_NUM > CLASES_GRATIS && !profile?.activo) {
        const { count } = await sb
          .from('entregas')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
        if ((count || 0) > 0) return 'pago.html?clase=' + CLASE_NUM
      }
      return 'index.html'
    }

    // ── Paywall: clases 5+ requieren acceso activo ───────────────────────────
    if (CLASE_NUM && CLASE_NUM > CLASES_GRATIS && profile?.rol !== 'instructor') {
      if (!profile?.activo) {
        window.location.href = await lockDestino()
        return
      }
    }

    // ── Bloqueo secuencial: clase N requiere clase N-1 completada ────────────
    if (CLASE_NUM && CLASE_NUM > 1 && profile?.rol !== 'instructor') {
      const { data: prevProgress } = await sb
        .from('progress')
        .select('completada')
        .eq('user_id', user.id)
        .eq('clase_num', CLASE_NUM - 1)
        .maybeSingle()

      if (!prevProgress?.completada) {
        window.location.href = await lockDestino()
        return
      }
    }

    // ── Primera clase de un mundo: además requiere el Reto del mundo anterior ─
    if (CLASE_NUM && REQUIERE_CHECKPOINT[CLASE_NUM] && profile?.rol !== 'instructor') {
      const { data: ckProgress } = await sb
        .from('progress')
        .select('completada')
        .eq('user_id', user.id)
        .eq('clase_num', REQUIERE_CHECKPOINT[CLASE_NUM])
        .maybeSingle()

      if (!ckProgress?.completada) {
        window.location.href = await lockDestino()
        return
      }
    }

    // ── Checkpoint: requiere la última clase de su mundo completada ──────────
    if (CHECKPOINT_NUM && profile?.rol !== 'instructor') {
      const { data: lastProgress } = await sb
        .from('progress')
        .select('completada')
        .eq('user_id', user.id)
        .eq('clase_num', ULTIMA_DE_MUNDO[CHECKPOINT_NUM])
        .maybeSingle()

      if (!lastProgress?.completada) {
        window.location.href = 'index.html'
        return
      }
    }

    // Sesión y permisos válidos → revelar la página (oculta por el guard del <head>)
    window._dvAuthOk = true
    document.documentElement.style.visibility = ''

    // Inyectar saludo en nav
    injectGreeting(nombre)

    // Actualizar último acceso (sin await para no bloquear)
    updateLastAccess(user.id)

    // Inyectar botón de completar para clases de solo contenido
    injectCompletionButton(user.id)
  }

  // Arrancar
  init()

})()
