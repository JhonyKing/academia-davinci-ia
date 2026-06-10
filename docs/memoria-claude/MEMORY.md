# JhonyKingAI Remotion Project Memory

## Project Location
- Main repo: `C:\Users\Usuario\JhonyKingAI_Remotion`
- node_modules: in main repo only
- Public assets: `C:\Users\Usuario\JhonyKingAI_Remotion\public\`

## Hook Videos Project
- **Purpose**: Short reels saying "Si eres fan de [ARTIST], la siguiente canción te gustará"
- **Source videos**: `public/hooks_videos/FAN_*.mp4` (21 videos, raw recordings)
- **Artist images**: `public/artists/FAN_*.png` (fan card images)
- **Data**: `public/hooks-data.json` (word-level transcription with timestamps for all 21 artists)
- **Output** (already rendered): `public/hooks_videos/hook_*.mp4` (20 of 21 rendered — missing JUAN_SOLO)

## Key Source Files
- `src/compositions/HookGenerator.tsx` — main composition (artist flash + video + subtitles)
- `src/components/SubtitleOverlay.tsx` — word-by-word karaoke subtitles
- `src/Root.tsx` — registers all 21 hook compositions from hooks-data.json

## Render Scripts
- `render-hooks.bat` — renders all 21 compositions to `out/hooks/`
- `render-single.bat <ID>` — renders one composition (e.g. `render-single.bat FAN-JUAN-SOLO`)

## Design Decisions
- Video format: 1080x1920 (portrait/reels), 30fps
- Artist image: spring animation (0→25 frames = ~0.83s quick flash), anchored to bottom, 70% height
- Subtitles: bottom: 120px fixed, 3 words per group, current word yellow/highlighted, black bg pill
- Video filter: contrast(1.2) saturate(1.3) for better look
- SubtitleOverlay receives `startFromSeconds` to correctly offset timing

## hooks-data.json Structure
```json
{ "id": "FAN-ANDRES-CALAMARO", "artist": "ANDRES CALAMARO",
  "videoPath": "hooks_videos/FAN_ANDRES_CALAMARO.mp4",
  "imageLocalUrl": "artists/FAN_ANDRES_CALAMARO.png",
  "startFromSeconds": 0, "durationSeconds": 5.007,
  "words": [{"word": "Si", "start": 0, "end": 0.36}, ...] }
```

## Note on Audio Cleaning
Remotion cannot process audio. For audio cleanup (noise reduction), use FFmpeg pre-processing before rendering.

## Academia Da Vinci IA (proyecto curso online)
- [Academia Da Vinci IA — estado, URLs, pedagogía, Robotsin](project_academia_davinci.md) — Vercel + Supabase + **26 clases** + quiz OBLIGATORIO en todas + REQUIEREN_ENTREGA=[1,2,3,4,5,10,11,14,18,23] + bloqueo secuencial + paywall clase 5+
- [Arquitectura técnica del sitio — cómo construir clases](project_academia_arquitectura_tecnica.md) — estructura HTML por clase, cadena de carga JS, checklist para nueva clase, reglas absolutas. LEER ANTES de crear/modificar clases.
- [Skill: insertar-quizes-en-curso](~/.claude/skills/insertar-quizes-en-curso/SKILL.md) — sistema reutilizable de mini-quiz para cursos HTML
- [Principios de diseño: luz, sonido y movimiento](project_academia_diseno_principios.md) — Los 3 pilares sensoriales que deben guiar TODO el diseño del sitio

## Blotato API
- [Blotato API capabilities and limitations](blotato_api.md) — Supported endpoints, DELETE works via `/v2/schedules/{id}`, rate limits, auth key

## Regla anti-duplicados
- [Verificar duplicados siempre post-publicación](feedback_no_duplicados.md) — OBLIGATORIO después de publish o retry

## NUNCA borrar archivos sin preguntar
- [Confirmar antes de borrar cualquier archivo](feedback_never_delete_without_asking.md) — SIEMPRE pedir permiso explícito antes de rm/del/shutil

## Responder SIEMPRE en español
- [Idioma operativo de Jhony es español mexicano](feedback_responder_en_espanol.md) — sin importar el idioma del input

## Usar subagentes para HTML/CSS/JS extenso
- [Delegar HTML/CSS/JS largo a subagentes](feedback_usar_subagentes_html.md) — no escribirlo inline para no llenar el contexto

## Explicar todo "con manzanitas"
- [Jhony está aprendiendo — explicaciones simples sin jerga](feedback_explicar_simple.md) — analogías cotidianas, definir términos al vuelo

## Google Workspace CLI (`gws`) instalado
- [gws CLI con OAuth activo en jhonykingmusica2@gmail.com](reference_gws_cli.md) — Drive, Gmail, Calendar, Sheets, Docs, Tasks, Meet conectados

## Robotsin NO hace acciones fuera de los videos
- [NUNCA escribir "Robotsin guía/explica/hace" en actividades HTML](feedback_robotsin_no_acciones.md) — implica grabar video nuevo = trabajo extra

## Pipeline de voz ElevenLabs (Academia Da Vinci)
- [Pipeline reemplazo de voz: audio-separator + ElevenLabs + FFmpeg](project_pipeline_videos.md) — voz Efrayn, mapeo manual, BG_VOL=4.0, mutes de voz en clase2/5

---

## Masivos HookVideos — Publicación en Blotato (completado 2026-03-31)

### Alcance
- **Videos**: V073–V407 (335 videos)
- **Cuentas**: 18 por video (3 TikTok + 15 Instagram)
- **Total rows generados**: 6,030 en hoja POSTS de Google Sheets

### Scripts clave (todos en `C:\Users\Usuario\JhonyKingAI_Remotion\`)
| Script | Función |
|--------|---------|
| `generate_posts_mh.py` | Generó 6,030 filas POSTS (V073-V407 × 18 cuentas) |
| `audit_posts_mh.py` | Auditoría de 9 checks antes de publicar |
| `fix_hora_format.py` | Corrigió formato hora ('6:48' → '06:48') con `value_input_option='RAW'` |
| `publish_mh.py` | Publicador principal con pre-caché de media y manejo de slots pasados |
| `fix_v073_and_resume.py` | Reprogramó V073 a Jun 5 17:13, reanudó publicación pendiente |
| `retry_errors_mh.py` | Reintenta filas en estado Error (usar cuando Drive quota se resetee) |
| `diagnose_drive_urls.py` | Diagnóstico de URLs de Drive fallidas |
| `media_cache_mh.json` | Caché Blotato CDN URLs (646 entradas) |

### Estado actual de publicación
- ✅ **OK**: ~5,638 filas publicadas en Blotato
- ❌ **Error pendiente**: ~392 filas (24 videos: V239, V251, V305, V312, V313, V384–V407)
  - **Causa**: Google Drive quota de ancho de banda excedida (~24h para reset)
  - **Fix**: Ejecutar `retry_errors_mh.py` después del 2026-04-01 ~18:00

### Horarios programados (America/Matamoros, CST -05:00)
- 5 slots diarios: 06:48, 12:11, 17:13, 21:07, 23:52
- Inicio: 2026-06-05 (V073 en 17:13)
- Lecciones aprendidas:
  - Usar `value_input_option='RAW'` para horas en Sheets (USER_ENTERED las convierte a time values)
  - Pre-cachear TODA la media ANTES de verificar horarios (el pre-caché de 335 videos tomó ~25min)

### Google Sheets
- URL: `https://docs.google.com/spreadsheets/d/15EQ-_g4vPC4nKwn7aonMH2u1mdv8zgTTKWJnv4_kMcY`
- Hojas relevantes: POSTS, POSIBLES
- Columnas POSTS: ID, Video_URL, Thumbnail_URL, Fecha, Hora, Cuenta, Estado, Post_Submission_ID, Notas, TT_CoverMs

---

## Nuevo Laredo Carousel (en progreso — 2026-03-31)

### Objetivo
Carrusel de fotos para TikTok (35 fotos) e Instagram (top 20) con lugares emblemáticos de Nuevo Laredo, Tamaulipas.

### Carpeta destino
`C:\Users\Usuario\JhonyKingAI_Remotion\imagenes_nuevo_laredo\`

### Script descarga
`download_nl_photos.py` — usa requests + BeautifulSoup para og:image scraping

### Estado de descarga (17/35 ✅)
| # | Slug | Estado |
|---|------|--------|
| 01 | plaza_de_la_mujer | ✅ 117KB |
| 02 | parque_peninsula_el_laguito | ⚠️ 15KB (posible logo) |
| 03 | estacion_palabra_ggm | ✅ 93KB |
| 04 | plaza_hidalgo_reloj | ✅ 166KB |
| 05 | casa_longoria | ❌ imagen equivocada (misma URL que #3) |
| 06 | avenida_guerrero | ❌ pendiente |
| 07 | centro_historico | ✅ 173KB |
| 08 | centro_cultural | ✅ 50KB |
| 09 | teatro_principal | ⚠️ 15KB (posible logo) |
| 10 | catedral_espiritu_santo | ⚠️ 48KB (posible logo) |
| 11 | parque_viveros | ✅ 156KB |
| 12 | parque_la_junta | ❌ pendiente |
| 13 | ciudad_deportiva | ❌ pendiente |
| 14 | letras_nuevo_laredo | ❌ pendiente |
| 15 | mercado_maclovio_herrera | ❌ pendiente |
| 16 | plaza_juarez | ✅ 395KB |
| 17 | zoologico | ❌ pendiente |
| 18 | parque_arqueologico_uman | ⚠️ imagen incorrecta |
| 19 | museo_reyes_meza | ❌ pendiente |
| 20 | templo_santo_nino | ❌ imagen incorrecta (misma que #16) |
| 21 | mercado_de_nl | ❌ pendiente |
| 22 | antiguo_banco_longoria | ❌ pendiente |
| 23 | parroquia_san_martin | ❌ pendiente |
| 24 | parque_silao | ❌ pendiente |
| 25 | ruta_jabali | ❌ pendiente |
| 26 | parque_narciso_mendoza | ❌ pendiente |
| 27 | plaza_mexico | ❌ pendiente |
| 28 | zaragoza_street | ❌ pendiente |
| 29 | carretera_panamericana | ❌ pendiente |
| 30 | puente_juarez_lincoln | ✅ 60KB |
| 31 | puente_ferroviario | ✅ 446KB |
| 32 | el_patio_streetfood | ✅ 128KB |
| 33 | sabor_a_cielo | ❌ pendiente |
| 34 | las_espuelas | ✅ 73KB |
| 35 | el_padrino | ❌ pendiente |

### Pendiente
- Buscar URLs directas de imagen para los 18 lugares faltantes + corregir 5 imágenes incorrectas
- Problema: TripAdvisor, Instagram, AllTrails no sirven og:image sin JS rendering

---

## Claude Code — Configuración del entorno (2026-03-31)

### Skills instalados
- `skill-creator` — en `~/.claude/skills/skill-creator/` (global, todos los proyectos)
  - Permite crear, evaluar y mejorar skills personalizados
  - Activar con `/skill-creator` o mencionando "crear un skill"

### Settings globales (`~/.claude/settings.json`)
- `autoDreamEnabled: true` — consolidación automática de memoria entre sesiones
- `enabledPlugins: { "skill-creator@claude-plugins-official": true }`
- Marketplace oficial de Anthropic configurado: `claude-plugins-official`

### Auto-Dream
- Se activa automáticamente: 24h+ desde último dream Y 5+ sesiones en ese período
- También se puede pedir manualmente escribiendo `dream` en el chat
