---
name: reference-gws-cli
description: "Google Workspace CLI (gws) instalado y autenticado para Loomin Lab. Cubre Drive, Gmail, Calendar, Sheets, Docs, Slides, Meet, Tasks, People en una sola conexión OAuth."
metadata: 
  node_type: memory
  type: reference
  originSessionId: 9e697734-84fa-4268-86e1-51bc65fe38b7
---

# Google Workspace CLI (`gws`) — Setup activo

## Binario
- Comando: `gws` (en PATH, instalado vía `npm install -g @googleworkspace/cli`)
- Versión al instalar: **0.22.5**
- Repo: https://github.com/googleworkspace/cli

## Cuenta y proyecto
- **Cuenta autorizada:** `jhonykingmusica2@gmail.com` (cuenta operativa de Jhony para Workspace — NO `ganaconinteligenciaartificial@gmail.com`)
- **Proyecto GCP:** `loomin-lab-aios-496121`

## Archivos de configuración (Windows)
- Client config: `C:\Users\Usuario\.config\gws\client_secret.json`
- Credenciales encriptadas: `C:\Users\Usuario\.config\gws\credentials.enc` (AES-256-GCM, llave en OS keyring)
- Refresh token: incluido, no expira (mientras la app esté en modo Testing en GCP).

## Scopes activos (25)
drive, spreadsheets, gmail.modify, calendar, documents, presentations, tasks, contacts, contacts.other.readonly, contacts.readonly, directory.readonly, meetings.space.created, meetings.space.readonly, meetings.space.settings, user.addresses.read, user.birthday.read, user.emails.read, user.gender.read, user.organization.read, user.phonenumbers.read, userinfo.email, userinfo.profile, openid + email + profile.

## Comandos de mantenimiento
- Verificar estado: `gws auth status`
- Re-loguear: `gws auth login --services drive,gmail,sheets,calendar,docs,slides,meet,tasks,people`
- Cerrar sesión: `gws auth logout`
- Ver schema de un endpoint: `gws schema drive.files.list`

## Patrón de comandos
```
gws <service> <resource> [sub-resource] <method> [flags]

# Ejemplos:
gws drive files list --params '{"pageSize":10}'
gws gmail users messages list --params '{"userId":"me","maxResults":20}'
gws sheets spreadsheets get --params '{"spreadsheetId":"..."}'
gws calendar events list --params '{"calendarId":"primary","maxResults":10}'
gws docs documents get --params '{"documentId":"..."}'
```

## Flags útiles
- `--format table|json|yaml|csv` — formato de salida
- `--page-all` — auto-paginación (NDJSON, una línea por página)
- `--page-limit N` — máximo de páginas con `--page-all`
- `--upload PATH` — subir archivo binario
- `--output PATH` — guardar respuesta binaria

## Limitación importante
La app en GCP está en modo **Testing** (no Production). Solo los usuarios agregados como Test Users en el OAuth consent screen pueden loguearse. Si Jhony quiere autenticar otra cuenta, debe agregarla primero en:
https://console.cloud.google.com/apis/credentials/consent

## Servicios disponibles
drive, sheets, gmail, calendar, admin-reports, docs, slides, tasks, people, chat, classroom, forms, keep, meet (más algunos extras según el discovery service de Google).
