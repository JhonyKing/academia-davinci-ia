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
  const SCROLL_TRIGGER  = 0.90   // 90 % de scroll para marcar completada

  // Clases que SOLO se completan al entregar — el scroll nunca las marca
  const REQUIEREN_ENTREGA = new Set([2, 3, 4, 5, 10, 11, 14, 18, 23])

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

  // ── 2. Marcar clase como completada en Supabase ─────────────────────────
  async function markClassComplete(userId) {
    if (!CLASE_NUM) return
    const sb = window._supabase

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
    // No mostrar si ya hay un nudge visible
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
    // Inyectar animación si no existe
    if (!document.getElementById('dv-nudge-style')) {
      const st = document.createElement('style')
      st.id = 'dv-nudge-style'
      st.textContent = `
        @keyframes dv-nudge-in { from { opacity:0; transform:translateX(-50%) translateY(12px) } to { opacity:1; transform:translateX(-50%) translateY(0) } }
      `
      document.head.appendChild(st)
    }
    document.body.appendChild(nudge)

    // Al hacer clic, baja al widget de entrega
    nudge.addEventListener('click', () => {
      nudge.remove()
      const widget = document.getElementById('entrega-widget')
      if (widget) widget.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    // Auto-desaparece en 5 s
    setTimeout(() => nudge.remove(), 5000)
  }

  // ── 5b. Scroll listener: trigger al 90 % ────────────────────────────────
  function setupScrollListener(userId) {
    // Si la lección tiene quiz propio, el quiz controla cuándo se marca completa
    if (window.LESSON_HAS_QUIZ) return;
    let marked = false
    function onScroll() {
      if (marked) return
      const scrollTop    = window.scrollY || document.documentElement.scrollTop
      const docHeight    = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      const ratio = scrollTop / docHeight
      if (ratio >= SCROLL_TRIGGER) {
        marked = true
        window.removeEventListener('scroll', onScroll)

        if (CLASE_NUM && REQUIEREN_ENTREGA.has(CLASE_NUM)) {
          // Esta clase solo se completa al entregar — mostrar nudge
          nudgeEntrega()
        } else {
          markClassComplete(userId)
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Edge case: página corta (sin scroll) → marcar al cabo de 30s de permanencia
    if (document.documentElement.scrollHeight <= window.innerHeight + 50) {
      setTimeout(() => {
        if (!marked) {
          marked = true
          if (!CLASE_NUM || !REQUIEREN_ENTREGA.has(CLASE_NUM)) {
            markClassComplete(userId)
          }
        }
      }, 30_000)
    }
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

    // ── Paywall: clases 5+ requieren acceso activo ───────────────────────────
    const CLASES_GRATIS = 4
    if (CLASE_NUM && CLASE_NUM > CLASES_GRATIS && profile?.rol !== 'instructor') {
      if (!profile?.activo) {
        window.location.href = 'pago.html?clase=' + CLASE_NUM
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
        window.location.href = 'index.html'
        return
      }
    }

    // Inyectar saludo en nav
    injectGreeting(nombre)

    // Actualizar último acceso (sin await para no bloquear)
    updateLastAccess(user.id)

    // Configurar listener de scroll para marcar progreso
    setupScrollListener(user.id)
  }

  // Arrancar
  init()

})()
