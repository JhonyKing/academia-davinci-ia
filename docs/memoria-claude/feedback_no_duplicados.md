---
name: Regla anti-duplicados en Blotato
description: El usuario exige verificar y eliminar duplicados en Blotato SIEMPRE después de publicar o reintentar errores
type: feedback
---

Después de cualquier publicación o retry en Blotato, verificar duplicados y eliminarlos antes de terminar. No entregar como "listo" sin haber hecho el check.

**Why:** El usuario lo pidió explícitamente: "NO QUIERO DUPLICADOS". En sesiones anteriores, scripts de delete usaban el endpoint incorrecto (`/v2/posts/{id}`) y silenciaban el error, dejando ~192 posts duplicados sin que nadie se diera cuenta.

**How to apply:**
1. Después de `publish_mh.py` o `retry_errors_mh.py`, correr `GET /v2/schedules` y agrupar por `(accountId + scheduledTime + videoUrl)`.
2. Si hay grupos con más de 1 entrada → duplicado. Eliminar con `DELETE /v2/schedules/{id}` (el endpoint correcto).
3. Reportar al usuario: cuántos duplicados encontrados y cuántos eliminados.
4. Si no hay duplicados, confirmarlo explícitamente.
