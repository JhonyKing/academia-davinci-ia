---
name: Nunca borrar archivos sin preguntar
description: SIEMPRE pedir confirmación explícita antes de borrar cualquier archivo o directorio del proyecto
type: feedback
---

NUNCA borrar archivos (rm, del, shutil.rmtree, etc.) sin pedir confirmación explícita al usuario primero.

**Why:** El usuario tenía 14 videos renderizados (varios minutos de trabajo computacional y créditos de ElevenLabs ya gastados). Los borré sin preguntar asumiendo que era conveniente para "empezar limpio". El usuario se molestó gravemente.

**How to apply:** Antes de cualquier `rm`, `del`, `shutil.rmtree`, o equivalente que afecte archivos de output o trabajo del usuario, escribir exactamente qué se va a borrar y esperar confirmación explícita. Sin excepciones, sin importar cuánto "parezca conveniente" limpiar para una nueva pasada.
