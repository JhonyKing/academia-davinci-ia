---
name: project-academia-arquitectura-tecnica
description: "Cómo está construido el sitio Academia Da Vinci IA / Genios Creativos: estructura de archivos HTML por clase, scripts JS, flujo de completado, reglas de construcción, deploy. Leer ANTES de crear o modificar clases."
metadata: 
  node_type: memory
  type: project
  originSessionId: aa808ce1-dab7-475e-bd60-e79b73bbb60e
---

# Arquitectura técnica — Academia Da Vinci IA

Ver también: [[project-academia-davinci]] para reglas de completado, URLs, estado del proyecto.

---

## ⚠️ DESIGN SYSTEM — LEER ANTES DE ESCRIBIR CUALQUIER CSS O ESTILO

**El sitio usa tema CLARO. NUNCA usar fondos oscuros como `#0F1830`, `#1A2540`, `#141E35`.**

### Variables CSS (definidas en `css/genios.css`, disponibles en todo el sitio)
```css
/* Colores de marca */
--blue:   #2F7BF6;   --blue-d: #1B5FD6;
--red:    #FF4D5E;
--gold:   #FFB020;
--green:  #22C268;
--purple: #8C5CF0;
--teal:   #15C2C9;
--pink:   #FF5DA2;

/* Tinta y fondos — SIEMPRE usar estas, nunca hardcodear */
--ink:   #1E2547;   /* texto principal */
--ink-2: #4B5478;   /* texto secundario */
--ink-3: #8C93B4;   /* texto tenue, labels */
--line:  #E6E9F7;   /* bordes */
--paper: #EEF2FF;   /* fondo de página */
--card:  #FFFFFF;   /* fondo de tarjetas */

/* Bordes redondeados */
--r-sm: 14px;   --r: 22px;   --r-lg: 30px;

/* Sombras */
--shadow:    0 18px 40px -18px rgba(30,37,71,.45);
--shadow-sm: 0 10px 24px -14px rgba(30,37,71,.4);

/* Colores por módulo */
--m1:#2F7BF6; --m2:#8C5CF0; --m3:#FF9F1C;
--m4:#22C268; --m5:#15C2C9; --m6:#FF4D5E;
```

### Tipografías — SIEMPRE usar estas variables, NUNCA hardcodear font-family
```css
--font-display: 'Fredoka'   /* títulos, números grandes, badges */
--font-body:    'Nunito'    /* párrafos, etiquetas, botones */
```
**NUNCA usar**: `Space Grotesk`, `Inter`, `system-ui` solos, ni ninguna fuente que no sea Fredoka/Nunito.

### Estilos de tarjeta estándar — SIEMPRE seguir este patrón
```css
.cualquier-card {
  background: var(--card);          /* blanco */
  border: 2px solid var(--line);    /* borde lavanda suave */
  border-radius: var(--r);          /* 22px */
  box-shadow: var(--shadow-sm);
  padding: 26px;
}
/* Acento de color: franja de 4px arriba */
.cualquier-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:4px;
  background: var(--blue); /* o --gold, --green, --red según contexto */
}
/* Hover: elevar */
.cualquier-card:hover { transform: translateY(-5px); box-shadow: var(--shadow); }
```

### Overlays / modales — fondo semitransparente sobre blanco
```css
/* Fondo del overlay */
background: rgba(30,37,71,.55);
backdrop-filter: blur(6px);

/* Tarjeta dentro del modal */
background: var(--card);
border: 2px solid var(--line);
border-radius: var(--r-lg);
box-shadow: var(--shadow);
```

### Texto en tarjetas y etiquetas
```css
/* Número/valor grande */
font-family: var(--font-display); font-weight: 700; color: var(--blue); /* o var(--gold), var(--green)... */

/* Etiqueta uppercase pequeña */
font-family: var(--font-body); font-size: 11px; font-weight: 800;
color: var(--ink-3); text-transform: uppercase; letter-spacing: .06em;

/* Texto secundario */
color: var(--ink-2); font-family: var(--font-body);
```

---

## Sitio web: cómo funciona

- **Stack**: HTML estático + Vanilla JS + Supabase Auth/DB/Storage + Vercel hosting
- **No hay framework**: Sin React, sin Vue, sin build step. Archivos HTML directos.
- **Supabase se carga dinámicamente** vía CDN solo en producción (ver cadena de carga abajo)
- **Vercel outputDirectory**: `"clases"` (en `vercel.json`) → los archivos en `clases/` sirven como raíz web
  - `clases/login.html` → `/login.html`
  - `clases/clase1_bienvenido_genio.html` → `/clase1_bienvenido_genio.html`

## Deploy — SIEMPRE usar este comando exacto
```bash
vercel --prod --cwd "C:\Users\Usuario\JhonyKingAI_Remotion"
```
⚠️ NUNCA hacer `cd clases && vercel` — despliega el proyecto equivocado (`clases` en lugar de `academia-davinci-ia`)

---

## Estructura de directorios (solo Academia)
```
clases/
├── index.html              ← Mapa de lecciones + "Continuar aventura"
├── login.html              ← Login + recuperar contraseña + nueva contraseña
├── pago.html               ← Checkout Stripe
├── progreso.html           ← Panel de papás: tiempo, logros, actividad
├── mi-personaje.html       ← Portafolio del alumno (sus entregas visualizadas)
├── bienvenida.html         ← Página de bienvenida post-registro
├── mapa.html               ← Mapa visual del curso (alternativo a index)
├── clase1_bienvenido_genio.html
├── clase2_...html
│   … (26 clases en total)
├── clase26_graduacion_genios.html
├── js/
│   ├── supabase-client.js  ← Inicializa window._supabase (URL + anon key hardcodeados)
│   ├── auth.js             ← Guard de sesión, bloqueo secuencial, paywall, logout
│   ├── lesson-quiz.js      ← Motor de quiz interactivo
│   ├── logros.js           ← dvAwardLogro() → tabla logros
│   ├── session-tracker.js  ← Heartbeat cada 60s → tabla sesiones
│   ├── juice.js            ← GCConfetti, GCLevelUp, reveal animations, sonidos
│   ├── celebration.js      ← Celebración al completar clase
│   ├── robotsin-tutor.js   ← Chat con Robotsin (contexto por clase)
│   ├── upload-zone.js      ← Drag & drop para entregas de imagen
│   └── archetype-quiz.js   ← Quiz de 102 personajes (solo clase 5)
├── robotsin/               ← PNGs y videos del mascot Robotsin por variante
├── diagrams/               ← Diagramas PNG de lecciones
└── styles/                 ← CSS global
```

---

## Anatomía de una clase HTML (estructura obligatoria)

### 1. Script de Supabase en el `<head>` (TODOS los archivos clase*)
```javascript
const LESSON_QUIZ_DATA = { /* preguntas del quiz */ }
/* lesson-quiz.js se carga ANTES del if de producción, de forma síncrona */
```

```javascript
// Inmediatamente después del LESSON_QUIZ_DATA
if (/vercel\.app$|academiadavinci|genioscreativos/.test(location.hostname)) {
  const add=(src,cb)=>{const s=document.createElement('script');s.src=src;s.onload=cb;document.head.appendChild(s);};
  add('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',()=>{
    add('js/supabase-client.js',()=>{ add('js/auth.js', ()=>{ add('js/logros.js', ()=>{ add('js/session-tracker.js'); }); }); });
  });
}
```
⚠️ El regex **DEBE** incluir `genioscreativos` — es el dominio de producción.

### 2. Topbar (navbar superior)
```html
<nav class="topbar">
  <div class="topbar-left"><!-- Logo / módulo --></div>
  <div class="topbar-right"><!-- auth.js inyecta botón "Salir" aquí --></div>
</nav>
```

### 3. Hero de la clase
```html
<section class="lesson-hero">
  <div class="hero-badge">Módulo N · Clase N</div>
  <h1 class="lesson-title">Nombre épico de la misión</h1>
  <p class="lesson-subtitle">Descripción breve</p>
  <!-- Robotsin image o video aquí -->
</section>
```

### 4. Contenido de la lección
Secciones de texto, video embed de YouTube, diagramas, interactividades.

### 5. Widget de entrega (solo en clases con entrega)
```html
<section id="entrega-widget" class="entrega-section">
  <!-- Upload zone, textarea, o lo que corresponda -->
  <!-- Al guardar en Supabase: window._entregaDone = true; window.checkBadgeUnlock?.() -->
</section>
```

### 6. Quiz de la lección
```html
<div id="quiz-container" class="quiz-section">
  <!-- lesson-quiz.js renderiza el quiz aquí automáticamente -->
  <!-- Al aprobar ≥80%: window._quizPassed = true; checkBadgeUnlock() llamado internamente -->
</div>
```

### 7. Sección de badge/insignia (al final)
```html
<section class="badge-section">
  <div class="badge-card">
    <img src="..." alt="Insignia clase N">
    <h3>¡Misión completada!</h3>
    <button id="claim-badge-btn" disabled onclick="window.dvMarkClassComplete()">
      🏆 Reclamar insignia
    </button>
    <p id="badge-lock-msg">Completa la entrega y el quiz para desbloquear</p>
  </div>
</section>

<script>
  window.checkBadgeUnlock = function() {
    const needsEntrega = /* REQUIEREN_ENTREGA.has(CLASE_NUM) */ true/false
    const ready = needsEntrega
      ? (window._entregaDone && window._quizPassed)
      : window._quizPassed
    const btn = document.getElementById('claim-badge-btn')
    const msg = document.getElementById('badge-lock-msg')
    if (btn) btn.disabled = !ready
    if (msg) msg.style.display = ready ? 'none' : ''
  }
</script>
```

### 8. Footer
```html
<footer class="lesson-footer">
  <a href="index.html">← Volver al mapa</a>
  <a href="claseN+1_....html" class="next-btn">Siguiente misión →</a>
</footer>
```

---

## Reglas absolutas de construcción

1. **Nunca auto-completar** por scroll o por timer — violación crítica de las reglas de Jhony.
2. **Siempre incluir quiz** en TODAS las clases (`LESSON_QUIZ_DATA` + `lesson-quiz.js`).
3. **`LESSON_HAS_QUIZ = true`** lo setea `lesson-quiz.js` automáticamente; no hardcodearlo a mano.
4. **Clases con entrega** (1, 2, 3, 4, 5, 10, 11, 14, 18, 23): requieren AMBOS quiz + entrega.
5. **`window._entregaDone = true`** debe llamarse dentro del callback de éxito al guardar entrega.
6. **`window.dvMarkClassComplete()`** SOLO se llama desde el badge claim button (clic del alumno).
7. **Cadena de carga**: el orden de scripts importa — supabase → supabase-client → auth → logros → session-tracker.
8. **Regex de producción**: siempre `vercel\.app$|academiadavinci|genioscreativos`.
9. **`injectCompletionButton` en auth.js** está guardado con `if (!CLASE_NUM) return` — NO lo inyecta en páginas que no son clase (mi-personaje, progreso, etc.).
10. **Robotsin solo aparece como imagen/video** — nunca como "Robotsin explica X" en el HTML (implicaría grabar video).

---

## Páginas especiales (NO son clases)

| Página | Propósito |
|---|---|
| `index.html` | Mapa de misiones — carga `progress` y muestra estado de cada clase |
| `login.html` | Auth: login + recuperar contraseña + nueva contraseña (flujo de invite) |
| `pago.html` | Checkout Stripe: botón que redirige a Stripe Checkout |
| `progreso.html` | Panel de papás: tiempo total/hoy/7d, logros, clases, actividad |
| `mi-personaje.html` | Portafolio del alumno: todas sus entregas, personaje, tiempo de estudio |
| `bienvenida.html` | Mostrada al nuevo alumno después de registrarse |

**Estas páginas NO deben tener `dvMarkClassComplete`, quiz, ni entrega-widget.**
`auth.js` las detecta (`CLASE_NUM = null`) y NO inyecta el botón "Completar misión".

---

## Supabase Storage — cómo se guardan las entregas

- **Bucket**: `entregas` (público para lectura)
- **Path**: `{userId}/{clase_num}/{tipo}_{timestamp}.{ext}`
- **DB insert después de upload**:
  ```javascript
  await supabase.from('entregas').insert({
    user_id: userId,
    clase_num: CLASE_NUM,
    tipo: 'imagen',           // o 'texto', 'video_url', 'personaje', etc.
    archivo_url: publicUrl,   // URL pública del Storage
  })
  window._entregaDone = true
  window.checkBadgeUnlock?.()
  ```

---

## Session Tracker (`session-tracker.js`)

- Una "sesión" abarca TODA la visita: el id vive en sessionStorage y se comparte entre páginas
- Al navegar, retoma la misma fila con **baseline** (lo ya acumulado) y suma — NUNCA sobreescribir
- Heartbeat cada 30s: `duracion_segundos = baseline + segundos de esta página`
- Pausa cuando `document.hidden = true` (tab en segundo plano) y guarda al ocultarse
- Guardado al salir (`pagehide`): **fetch keepalive PATCH** con headers apikey + Bearer JWT cacheado
  - ⚠️ NUNCA usar `navigator.sendBeacon` con Supabase: no permite PATCH ni headers → falla siempre
- Expone `window.dvSessionSecs()` → segundos totales de la sesión
- DEBE cargarse en TODAS las páginas donde el alumno pasa tiempo: 26 clases, checkpoints,
  index, galeria, mi-personaje, progreso
- `progreso.html` y `mi-personaje.html` suman las filas de `sesiones` (campos: duracion_segundos, inicio)

---

## `index.html` — lógica crítica del mapa

```javascript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  location.href = 'login.html'  // ← NUNCA render([1]) aquí — causaría falso completado
  return
}
// Cargar progress del usuario
const { data: rows } = await supabase.from('progress')
  .select('clase_num').eq('user_id', user.id).eq('completada', true)
const completadas = rows?.map(r => r.clase_num) ?? []
render(completadas, user)  // ← Solo marcar como completadas lo que realmente está en DB
```

## Bloqueo visual en `index.html` (render)
- Clase en `completadas` → ícono ✓, verde
- Clase `max(completadas)+1` → desbloqueada, clickeable
- Resto → 🔒, sin link, opaca

---

## Checklist para crear una nueva clase HTML

- [ ] Nombre: `claseN_nombre_epico.html` (N = número con ceros si aplica)
- [ ] LESSON_QUIZ_DATA definido con mínimo 5 preguntas
- [ ] Cadena de carga Supabase completa (con regex correcto)
- [ ] Si tiene entrega: en REQUIEREN_ENTREGA de auth.js, widget de entrega, `_entregaDone = true` al guardar
- [ ] Badge section con `checkBadgeUnlock` y botón deshabilitado por defecto
- [ ] Topbar con `.topbar-right` vacío (auth.js inyecta el botón Salir)
- [ ] Footer con links a index.html y siguiente clase
- [ ] Robotsin como imagen/video (no como actor con acciones)
