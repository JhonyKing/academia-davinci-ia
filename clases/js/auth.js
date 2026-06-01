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
  const TOTAL_CLASES    = 24
  const SCROLL_TRIGGER  = 0.90   // 90 % de scroll para marcar completada

  // ── 2. Marcar clase como completada en Supabase ─────────────────────────
  async function markClassComplete(userId) {
    if (!CLASE_NUM) return
    const sb = window._supabase
    // upsert: si ya existe la fila no lanza error
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

  // ── 4. Inyectar saludo en la nav ─────────────────────────────────────────
  function injectGreeting(nombre) {
    // Busca el elemento con clase .nav-title o .nav-module-title
    const navTitle = document.querySelector('.nav-title')
    if (navTitle) {
      navTitle.innerHTML = `Hola, <span>${nombre}</span> 👋`
    }
    // También inyectar un botón de logout si hay un .nav-spacer
    const navSpacer = document.querySelector('.nav-spacer')
    if (navSpacer) {
      const logoutBtn = document.createElement('button')
      logoutBtn.id        = 'dv-logout-btn'
      logoutBtn.textContent = 'Salir'
      logoutBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(255,255,255,0.2);
        color: rgba(255,255,255,0.5);
        padding: 6px 14px;
        border-radius: 20px;
        font-family: 'Poppins', sans-serif;
        font-size: 12px;
        cursor: pointer;
        transition: all .2s;
        margin-left: 8px;
      `
      logoutBtn.addEventListener('mouseover', () => {
        logoutBtn.style.color  = '#fff'
        logoutBtn.style.borderColor = 'rgba(255,255,255,0.5)'
      })
      logoutBtn.addEventListener('mouseout', () => {
        logoutBtn.style.color  = 'rgba(255,255,255,0.5)'
        logoutBtn.style.borderColor = 'rgba(255,255,255,0.2)'
      })
      logoutBtn.addEventListener('click', window.dvLogout)
      navSpacer.after(logoutBtn)
    }
  }

  // ── 5. Scroll listener: trigger al 90 % ─────────────────────────────────
  function setupScrollListener(userId) {
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
        markClassComplete(userId)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Edge case: página corta (sin scroll) → marcar al cabo de 30s de permanencia
    if (document.documentElement.scrollHeight <= window.innerHeight + 50) {
      setTimeout(() => {
        if (!marked) {
          marked = true
          markClassComplete(userId)
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
      .select('nombre, rol')
      .eq('id', user.id)
      .single()

    const nombre = profile?.nombre || user.email.split('@')[0]

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
