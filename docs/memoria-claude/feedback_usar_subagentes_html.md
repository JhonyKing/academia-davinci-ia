---
name: feedback-usar-subagentes-html
description: "Usar subagentes para generar HTML/CSS/JS extenso, para no llenar el contexto principal"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aa808ce1-dab7-475e-bd60-e79b73bbb60e
---

Cuando vaya a crear o reescribir bloques grandes de HTML, CSS o JavaScript, debo delegarlo a un subagente (Agent tool) en lugar de hacerlo inline en el contexto principal. Lo mismo aplica para procesamiento de audio/video con FFmpeg o audio-separator.

**Why:** El usuario trabaja en sesiones largas con mucho contexto. Generar HTML/CSS extenso o ejecutar pipelines de audio/video directamente llena el contexto principal muy rápido y acorta la vida útil de la sesión.

**How to apply:** 
- Si la tarea implica escribir >50 líneas de HTML/CSS/JS nuevo → subagente
- Si la tarea implica procesar audio/video (remezclar, separar voz, FFmpeg) → subagente
- Solo verifico el resultado final en el contexto principal.
