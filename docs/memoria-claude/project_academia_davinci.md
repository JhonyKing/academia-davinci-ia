---
name: project-academia-davinci
description: "Academia Da Vinci IA / Genios Creativos — curso online de IA creativa para niños 8-13 años. URLs, Supabase, pedagogía, estado del proyecto, reglas de completado, sistema secuencial."
metadata: 
  node_type: memory
  type: project
  originSessionId: aa808ce1-dab7-475e-bd60-e79b73bbb60e
---

# Academia Da Vinci IA — Genios Creativos

## Estado actual (2026-06-10)
- ✅ **Dominio de producción**: https://genioscreativos.com (Namecheap + Vercel)
- ✅ **26 lecciones HTML** en `clases/clase1_bienvenido_genio.html` … `clase26_graduacion_genios.html`
- ✅ **Mini-quiz obligatorio** en TODAS las clases (`lesson-quiz.js` + `LESSON_QUIZ_DATA`)
- ✅ **Sistema de entregas** (upload a Supabase Storage) en clases: 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 18, 23
- ✅ **Bloqueo secuencial**: clase N bloqueada hasta completar clase N-1
- ✅ **Paywall**: clases 5+ requieren `profile.activo = true`
- ✅ **Stripe + webhook** en `api/webhook.js` → `inviteUserByEmail` al comprar
- ✅ **Email SMTP**: Resend vía `smtp.resend.com:465`, usuario=`resend`, pw=API key
- ✅ **Contador de tiempo**: `session-tracker.js` guarda en tabla `sesiones`; visible en `progreso.html` y en `mi-estudio.html` (modal de bienvenida + widget inline)
- ✅ **Panel de Papás**: `progreso.html` — tiempo total, tiempo hoy, últimos 7 días, logros, actividad
- ✅ **Mi Personaje**: `mi-estudio.html` — portafolio del alumno con todas sus entregas
- ✅ **Resend verificado** (2026-06-11): dominio genioscreativos.com listo; el MX de send. era el faltante
- ✅ **Compra E2E validada** (2026-06-11): pago test → webhook (genioscreativos.com/api/webhook) → invite → login → activo=true
  - ⚠️ El redirect vercel.app→genioscreativos en vercel.json EXCLUYE /api/ (Stripe no sigue 307)
  - ⚠️ El upsert de profiles DEBE incluir email (columna NOT NULL; un upsert es INSERT y valida NOT NULL aunque la fila exista)
- ✅ **Landing con botón de compra** → pago.html (dos planes); la lista de espera falsa se eliminó
- ✅ **Racha diaria por usuario**: calculada desde tabla sesiones (días consecutivos); NUNCA usar localStorage para racha
- ✅ **Mi Estudio**: mi-estudio.html (antes mi-personaje.html, hay stub de redirect); 4 arquetipos en clase 7 (aliado/mentor/villano/comico)
- ⏳ **Pendiente**: videos de clases 6-26, modo live de Stripe (llaves reales + webhook en modo live)

**GitHub**: https://github.com/JhonyKing/academia-davinci-ia
**Supabase**: https://supabase.com/dashboard/project/joiuvopzkorvmxegnjqg
**Vercel project**: `jhonykings-projects/academia-davinci-ia`

---

## Estructura del curso (26 clases + 6 checkpoints)
```
M1 (El Genio Creativo,   --m1 #E74C3C): Clases  1–5  → Checkpoint M1
M2 (El Mundo del Genio,  --m2 #4A90D9): Clases  6–9  → Checkpoint M2
M3 (La Historia,         --m3 #27AE60): Clases 10–13 → Checkpoint M3
M4 (El Genio en Movim.,  --m4 #E74C3C): Clases 14–18 → Checkpoint M4
M5 (La Voz del Genio,    --m5 #F39C12): Clases 19–22 → Checkpoint M5
M6 (El Genio al Mundo,   --m6 #16A085): Clases 23–26 → Checkpoint M6
```

## Reglas de completado de lecciones — CRÍTICAS
**Estas reglas son absolutas. Nunca cambiarlas sin confirmación explícita de Jhony.**

1. **TODAS las clases requieren quiz aprobado** (≥80%) para marcar como completada.
   - El quiz se resuelve en `lesson-quiz.js`; al aprobar llama internamente a la lógica de completado.
   - El flag `window.LESSON_HAS_QUIZ = true` es seteado por `lesson-quiz.js` al cargar.

2. **Las clases con entrega TAMBIÉN requieren la entrega** además del quiz:
   - Clases con entrega: **1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 18, 23**
   - Clase 6: 3 imágenes obligatorias (universo_principal, universo_version_b, universo_zona) — multi-zona con onUploaded
   - Clase 7: formulario propio (#dz-personajes) que guarda en `personajes_secundarios` (nombre, tipo, descripcion, imagen_retrato_url=path storage); entrega completa con ≥1 aliado y ≥1 villano
   - Clase 8: 1 imagen (mapa_mundo) — el mapa oficial hecho en Canva
   - "Entrega" = cualquier contenido que se sube o guarda en la BD (imagen, texto, video URL, selección)
   - En estas clases, el botón de badge/insignia solo se desbloquea cuando `_entregaDone = true` Y `_quizPassed = true`
   - El botón de badge llama `window.dvMarkClassComplete()` al hacer clic

3. **NO hay auto-completado por scroll ni por timer** (esos fueron eliminados de `auth.js`).
   - `injectCompletionButton()` solo inyecta un botón "Completar" en clases de puro contenido sin quiz ni entrega (actualmente ninguna — todas tienen quiz)

4. **`REQUIEREN_ENTREGA`** en `auth.js`: `new Set([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 14, 18, 23])`

5. **Checkpoints (Reto del Mundo) son parte de la secuencia obligatoria**:
   - Cada mundo termina con `checkpoint_mundoN.html` (quiz de 20 preguntas, motor `quiz.js`, ≥80%)
   - Al pasarlo, `quiz.js` guarda en `progress` con **`clase_num = 100 + mundo`** (101-106)
   - La PRIMERA clase de cada mundo requiere el checkpoint del mundo anterior:
     `REQUIERE_CHECKPOINT = { 6:101, 10:102, 14:103, 19:104, 23:105 }` (en auth.js)
   - Entrar a un checkpoint requiere la última clase de su mundo:
     `ULTIMA_DE_MUNDO = { 1:5, 2:9, 3:13, 4:18, 5:22, 6:26 }` (en auth.js)
   - `index.html` arma la secuencia SEQ = [1..5, 101, 6..9, 102, ...] y `current` es el primer
     elemento no completado — si es checkpoint, "Continuar aventura" apunta al checkpoint
   - El constraint de `progress.clase_num` permite 1-26 y 101-106 (migración aplicada 2026-06-10)
   - Los checkpoints también tienen dv-guard + cadena Supabase (login obligatorio)

## Bloqueo secuencial — CRÍTICO
```javascript
// En auth.js — init()
if (CLASE_NUM > 1 && profile?.rol !== 'instructor') {
  const { data: prevProgress } = await sb.from('progress')
    .select('completada').eq('user_id', user.id).eq('clase_num', CLASE_NUM - 1).maybeSingle()
  if (!prevProgress?.completada) {
    window.location.href = 'index.html'  // Redirige si la anterior no está completa
    return
  }
}
```
- El alumno **no puede ver ninguna clase** sin haber completado la inmediata anterior
- No hay excepciones (excepto `rol = 'instructor'`)
- El mapa en `index.html` muestra las clases bloqueadas con 🔒 y sin link clickeable

## Paywall
- Clases 1–4: gratis (`CLASES_GRATIS = 4`)
- Clases 5–26: requieren `profile.activo = true`
- Si no tiene acceso → redirige a `pago.html?clase=N`
- Se activa via Stripe: el webhook setea `activo = true` en el perfil

---

## Supabase Schema (tablas clave)
| Tabla | Descripción |
|---|---|
| `profiles` | id, nombre, email, rol, activo, ultimo_acceso |
| `progress` | user_id, clase_num (1-26), completada (bool), completada_at |
| `entregas` | user_id, clase_num, tipo, contenido_texto, archivo_url, youtube_url, metadata (JSONB) |
| `sesiones` | user_id, inicio, fin, duracion_segundos — rastreado por `session-tracker.js` |
| `personaje` | user_id (unique), nombre, arquetipo, descripcion, imagen_retrato_url, imagen_tarjeta_url |
| `personajes_secundarios` | user_id, nombre, arquetipo, tipo (aliado/villano/neutral/protagonista_anterior) |
| `logros` | user_id, clave (unique/user), titulo, emoji, tipo, subtitulo, color, fecha_ganado |

---

## Archivos JS clave (`clases/js/`)
| Archivo | Función |
|---|---|
| `auth.js` | Guard de sesión, bloqueo secuencial, paywall, inyecta logout en topbar |
| `lesson-quiz.js` | Motor de quiz — setea `LESSON_HAS_QUIZ`, llama `dvMarkClassComplete` al aprobar |
| `logros.js` | `dvAwardLogro()` — guarda insignias/trofeos en Supabase |
| `session-tracker.js` | Registra tiempo de estudio en tabla `sesiones`, heartbeat cada 60s |
| `supabase-client.js` | Inicializa `window._supabase` con URL + anon key |
| `juice.js` | Efectos visuales, sonidos, reveal animations, GCConfetti, GCLevelUp |
| `celebration.js` | Celebración al completar clase (llamado desde `markClassComplete`) |
| `robotsin-tutor.js` | Chat "Pregúntale a Robotsin" con contexto de clase |
| `archetype-quiz.js` | Quiz de 102 personajes famosos (solo clase 5) |

## Cadena de carga Supabase (TODAS las clases deben tener esta cadena)
```javascript
if (/vercel\.app$|academiadavinci|genioscreativos/.test(location.hostname)) {
  const add=(src,cb)=>{const s=document.createElement('script');s.src=src;s.onload=cb;document.head.appendChild(s);};
  add('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',()=>{
    add('js/supabase-client.js',()=>{ add('js/auth.js', ()=>{ add('js/logros.js', ()=>{ add('js/session-tracker.js'); }); }); });
  });
}
```
⚠️ El regex DEBE incluir `genioscreativos` — sin él, auth.js no carga en producción.

---

## Flujo de completado de clase (con entrega)
```
Alumno abre clase N
  → auth.js verifica sesión + bloqueo secuencial + paywall
  → Alumno ve el contenido + video
  → Alumno hace el quiz → lesson-quiz.js → _quizPassed = true → checkBadgeUnlock()
  → Alumno sube entrega (imagen/texto/etc.) → _entregaDone = true → checkBadgeUnlock()
  → Ambos flags true → botón badge se desbloquea
  → Alumno hace clic en badge → dvMarkClassComplete() → progress.upsert() → clase marcada ✓
  → index.html muestra clase N como completada, clase N+1 desbloqueada
```

## Flujo de completado de clase (solo quiz, sin entrega)
```
  → quiz aprobado → lesson-quiz.js llama dvMarkClassComplete() directamente
  → progress.upsert() → clase marcada ✓
```

---

## Pedagogía
Inspirada en **Fritz & Chesster**. El alumno crea su propio personaje animado con historia, mundo, música y voz. Cada clase es una "misión" con nombre épico, insignia al completar, y desbloqueo secuencial. **Edad objetivo: 8-13 años.** Ver `docs/pedagogia.md`.

## Personaje Robotsin
- Diferentes variantes: `robotsin_artista`, `robotsin_arquitecto`, `robotsin_escritor`, `robotsin_director`, `robotsin_musico`, `robotsin_maestro`
- Cada módulo usa su variante correspondiente
- **NUNCA escribir en HTML "Robotsin guía/explica/hace X"** — implica grabar video nuevo
- El personaje aparece en el hero de cada clase como imagen estática o en video

Ver también: [[project-academia-arquitectura-tecnica]]
