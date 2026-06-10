---
name: project-pipeline-videos
description: Pipeline de reemplazo de voz en videos de Academia Da Vinci IA — audio-separator + ElevenLabs + FFmpeg
metadata: 
  node_type: memory
  type: project
  originSessionId: aa808ce1-dab7-475e-bd60-e79b73bbb60e
---

# Pipeline de Reemplazo de Voz — Academia Da Vinci IA

## Propósito
Reemplazar la voz original de los videos de clase con una nueva voz de ElevenLabs (Efrayn), conservando todos los efectos de sonido originales.

**Why:** Los videos originales fueron grabados con una voz diferente. ElevenLabs genera una voz nueva; hay que mezclarla con los FX del original.

## Voz ElevenLabs
- **Nombre**: Efrayn — Breathy, Serene and Expressive
- **Voice ID**: `1MxuWc12WPRxDkgfT3kj`
- **API key**: NO guardar en memoria — pedirla al usuario cuando sea necesario

## Archivos del pipeline
- `clases/robotsin/videos/` — videos originales (Escena_Introduccion + Escena_clase_1-5)
- `clases/robotsin/videos/audios_nuevos/` — audios ElevenLabs (6 archivos .mp3/.wav sin nombre descriptivo)
- `clases/robotsin/videos/voiced/` — videos finales con voz nueva
- `remezclar_videos.py` — script principal de re-mezcla (versión corregida con mapeo manual)
- `separar_voz_videos.py` — script original (usa auto-mapeo por duración, puede confundir videos con misma duración)

## Mapeo de audios (MANUAL — no usar auto-mapeo)
Intro y Clase3 tienen la misma duración (22.05s) y se confunden si se usa auto-mapeo:

| Video | Audio ElevenLabs |
|-------|-----------------|
| Escena_Introduccion | T04_51_46.mp3 |
| Escena_clase_1 | T04_48_36.wav |
| Escena_clase_2 | T04_47_39.mp3 |
| Escena_clase_3 | T04_46_09.mp3 |
| Escena_clase_4 | T04_25_25.wav |
| Escena_clase_5 | T04_42_49.mp3 |

## Configuración de mezcla
- **BG_VOL = 4.0** (FX originales, subidos para que no se pierdan)
- **VOICE_VOL = 2.2** (voz ElevenLabs)
- Clase2: VOZ muteada segundos 22-25 (sonidos extraños)
- Clase5: VOZ muteada segundo 22 hasta el final

## Modelo de separación
- `UVR-MDX-NET-Inst_HQ_3.onnx` via `audio-separator[cpu]`
- Buscar stem con `(instrumental)` en el nombre (fondo sin voz)

## Dependencias Python
```
pip install audio-separator[cpu]
pip install google-api-python-client google-auth-oauthlib
```

## Google Docs (libro del curso)
- `crear_libro_davinci.py` — crea Google Doc con contenido de clases 1-2
- `auth_docs.py` — autoriza Google Docs API (genera docs_token.json)
- `docs_token.json` — token OAuth (no subir a git)
- Requiere scope: documents + drive + spreadsheets
