;(function () {
  'use strict'

  // ── Mensajes predefinidos por clase ──────────────────────────────────────
  // Escritos en voz de Robotsin: directo al niño, premia el esfuerzo (Dweck),
  // nunca "eres muy talentoso" — siempre "lo creaste tú / lo lograste".

  const MENSAJES_ARQUETIPO = {
    heroe:      '¡El Héroe ha llegado! Los héroes cargan con el peso de proteger a todos — eso los convierte en los personajes más queridos de toda la historia. Tu personaje tiene ese corazón.',
    sabio:      '¡El Sabio! El conocimiento es el poder más peligroso del universo. Tu personaje tiene la mente más afilada del mundo que estás construyendo.',
    explorador: '¡El Explorador! Los mundos desconocidos son su elemento. Tu personaje va a descubrir lugares que nadie más ha visto jamás.',
    creador:    '¡El Creador! No hay arquetipo más apropiado para alguien en esta Academia. Tu personaje inventa el futuro — igual que tú en cada clase.',
    guardian:   '¡El Guardián! Proteger a quienes no pueden defenderse solos requiere más valentía que cualquier batalla. Tu personaje tiene esa fortaleza.',
    rebelde:    '¡El Rebelde! Las reglas que no tienen sentido están para romperse. Tu personaje va a cambiar el mundo desafiándolo desde adentro.',
    inocente:   '¡El Inocente! Ver magia en todo lo que toca — ese es el superpoder más raro del universo. Tu personaje va a hacer que todos vean el mundo diferente.',
    mago:       '¡El Mago! Transformar la realidad con creatividad. Eso es exactamente lo que estás haciendo en esta Academia con cada clase que completas.',
  }

  const MENSAJES_POR_CLASE = {
    2:  () => '¡Robotsin procesó la historia de tu personaje y los circuitos se encendieron de emoción! Cada detalle que escribiste lo hace único en todo el universo. Nadie más podría haber creado exactamente a este personaje — eso es completamente tuyo. ¡Sigue construyendo su mundo!',
    3:  () => '¡El Retrato Oficial está en los archivos de Robotsin! Ahora tu personaje tiene un rostro real en el universo digital. Lo que creaste con IA y con tu imaginación no existía antes de hoy. Eso es exactamente lo que significa crear, genio.',
    4:  () => '¡IDENTIDAD CONFIRMADA! La Tarjeta Oficial de tu personaje ya está registrada en la base de datos de la Academia Da Vinci. A partir de este momento, existe oficialmente en el universo digital. ¡El mundo te espera!',
    5:  (p) => MENSAJES_ARQUETIPO[p?.arquetipo_id] || '¡Arquetipo confirmado! Tu personaje tiene su esencia fundamental. El universo ya sabe quién es.',
    7:  () => '¡Robotsin conoció a todo el equipo! Una historia con personajes secundarios bien definidos es diez veces más emocionante. Aliados que apoyan, villanos que desafían — tu universo ya tiene sus primeras relaciones.',
    10: () => '¡GUION RECIBIDO! Robotsin lo leyó completo y encontró una historia real — con inicio, nudo y desenlace. Escribir un guion en 3 actos es exactamente lo que hacen los directores profesionales. Eso hiciste hoy.',
    11: () => '¡Los diálogos de tus personajes ya existen en el universo! Robotsin detectó que hablan de forma auténtica — que suenan como ellos mismos, no como todos los demás. Eso es lo más difícil de escribir. Lo lograste.',
    14: () => '¡🎬 ROBOTSIN VIO TU PRIMERA ANIMACIÓN! Este es el momento exacto en que tu personaje cobró vida por primera vez. De aquí en adelante ya eres animador. Nada de lo que hagas será "tu primera animación" — porque ya la hiciste, y existió.',
    18: () => '¡TRÁILER RECIBIDO! Robotsin lo vio completo. Tienes una pieza real de marketing cinematográfico — el tipo de material que usan los directores para presentar su película al mundo. Eso es exactamente lo que acabas de crear.',
    23: () => '🎓 ¡ROBOTSIN VIO TU PELÍCULA COMPLETA! Personaje, historia, mundo, música, voz, animación y edición — TODO lo construiste tú, clase por clase. Lo que existe ahora no existía cuando empezaste la Clase 1. Eso no se puede deshacer. Eres oficialmente un Creador Digital.',
  }

  const MENSAJE_DEFAULT = '¡Robotsin recibió tu entrega! Tu trabajo quedó guardado en la Academia. Cada cosa que creas te acerca más a tu proyecto final. ¡Sigue adelante, genio!'

  function getPredefined(claseNum, payload) {
    const fn = MENSAJES_POR_CLASE[claseNum]
    return fn ? fn(payload || {}) : MENSAJE_DEFAULT
  }

  // ── Función principal: predefinido ahora, IA cuando se configure ──────────
  // Cuando se agregue ANTHROPIC_API_KEY en Vercel → /api/feedback responderá
  // y este código usará IA automáticamente sin más cambios aquí.
  async function generateFeedback(claseNum, tipo, payload) {
    try {
      const ctrl    = new AbortController()
      const timeout = setTimeout(() => ctrl.abort(), 3500)
      const res = await fetch('/api/feedback', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ claseNum, tipo, payload }),
        signal:  ctrl.signal,
      })
      clearTimeout(timeout)
      if (res.ok) {
        const data = await res.json()
        if (data?.message) return data.message
      }
    } catch (_) {
      // /api/feedback no configurado aún — caer a predefinido (comportamiento normal)
    }
    return getPredefined(claseNum, payload)
  }

  window.DvFeedback = { generateFeedback, getPredefined }

})()
