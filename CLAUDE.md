# CLAUDE.md — JhonyKingAI Remotion Project

## Project Overview
Production system for mass video publishing to TikTok, Instagram, Facebook, and YouTube via Blotato API. Videos are rendered with Remotion/FFmpeg, tracked in Google Sheets, and scheduled through Blotato.

## Environment
- **OS**: Windows 10 (bash via Git Bash or WSL)
- **Node**: 18+ — `npm install` in repo root
- **Python**: 3.12 — no pip installs needed beyond `gspread`, `requests`, `pytz`
- **FFmpeg**: bundled at `node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe`
- **gspread credentials**: `%APPDATA%/gspread/credentials.json` + `authorized_user.json`

## Key Paths
```
C:\Users\Usuario\JhonyKingAI_Remotion\
├── src/                          # Remotion compositions + components
├── public/
│   ├── hooks_videos/             # FAN_*.mp4 source videos + hook_*.mp4 rendered
│   ├── artists/                  # FAN_*.png artist images (bg removed)
│   ├── hooks-data.json           # Whisper transcriptions per artist
│   └── MATERIALES/
│       ├── VIDEOS GANCHOS SI A TI TE GUSTA/
│       ├── VIDEOS CONTENIDO CENTRAL/
│       ├── THUMBNAILS_MH/        # Local thumbnails for IG/YT
│       └── VIDEOS RENDERIZADOS POR CLAUDE/
├── media_cache_mh.json           # Blotato CDN URL cache (646+ entries)
├── render-hooks.bat              # Render all 21 Remotion hook compositions
├── render-single.bat <ID>        # Render single hook (e.g. FAN-JUAN-SOLO)
└── scripts/                      # TS helper scripts (transcribe, process-hooks, etc.)
```

## Google Sheets
- **URL**: `https://docs.google.com/spreadsheets/d/15EQ-_g4vPC4nKwn7aonMH2u1mdv8zgTTKWJnv4_kMcY`
- **POSIBLES**: source data per video (TT/IG/YT/FB rows)
- **POSTS**: 39-column table, one row per account per video (18 rows/video)

### POSTS Columns (critical ones)
`ID | Estado | Fecha | Hora | Zona_Horaria | Usar_Slot_Libre | Plataforma | Account_ID | Cuenta_Nombre | Texto_Copy | Hashtags | Video_URL | TT_CoverMs | TT_Privacidad | TT_Comentarios | TT_Dueto | TT_Stitch | TT_Branded | TT_TuMarca | TT_EsIA | IG_Tipo | IG_Portada_URL | IG_ShareToFeed | FB_PageId | FB_TipoMedia | YT_Titulo | YT_Privacidad | YT_Notificar | YT_ParaNinos | YT_EsIA | YT_Miniatura | Post_Submission_ID | Estado_API | Fecha_Publicado | Notas`

### ⚠️ Critical: Sheets time values
Always use `value_input_option='RAW'` for Hora column — USER_ENTERED converts `'06:48'` to a time value.

## Blotato API
- **Base URL**: `https://backend.blotato.com/v2`
- **Auth header**: `blotato-api-key: blt_PXDsPBb6/fGzCMNaqRLMXVnca/HC+A5JYqP8kIYkUHo=`
- **Endpoints**:
  - `POST /v2/media` — register URL, returns `{ url: "cdn-url" }`
  - `POST /v2/posts` — create scheduled post, returns `{ postSubmissionId: "uuid" }`
  - `GET /v2/schedules` — list all scheduled posts
  - `GET /v2/schedules/{id}` — get one scheduled post
  - `PATCH /v2/schedules/{id}` — update scheduled post (time or content)
  - `DELETE /v2/schedules/{id}` — delete scheduled post ✅ (NOT /v2/posts/{id})
  - `GET /v2/users/me/accounts` — list accounts
- **Rate limits**: 0.6s between posts, 3s every 20 posts, 35s on 429 or "already in progress"

## Publishing Pipeline (18 accounts per video)
```
#  Platform    Account_ID  Handle/Page
01 tiktok      34164       @jk_arts8
02 tiktok      34150       @jhony_king_music
03 tiktok      2633        @jhonykingia
04 instagram   14635       @jhonykingmusic        (reel)
05 instagram   2141        @jhonyking.ia          (reel)
06 instagram   36126       @juanlopez624100       (reel)
07 instagram   14635       @jhonykingmusic        (story)
08 instagram   2141        @jhonyking.ia          (story)
09 instagram   36126       @juanlopez624100       (story)
10 facebook    2077        Jhony King Music       page=1064497986744147
11 facebook    2077        Videos virales 2017    page=490873684369565
12 facebook    2077        Loomin Lab             page=645979691924551
13 facebook    2077        Jhony King IA          page=629394793590375
14 youtube     1229        YT-1229
15 youtube     30662       YT-30662
16 youtube     30663       YT-30663
17 youtube     30664       YT-30664
18 youtube     30661       YT-30661
```

## Schedule Slots
5 slots daily (America/Matamoros, -05:00): `06:48 | 12:11 | 17:13 | 21:07 | 23:52`

## Key Scripts
| Script | Purpose |
|--------|---------|
| `generate_posts_mh.py` | Generate POSTS rows from POSIBLES |
| `audit_posts_mh.py` | 9-check audit before publishing |
| `publish_mh.py` | Main Blotato publisher |
| `retry_errors_mh.py` | Retry failed rows |
| `fix_hora_format.py` | Fix hour format in Sheets (RAW mode) |
| `render_batch.py` | FFmpeg batch render: hook+content+CTA |
| `render_batch_sdlf.py` | FFmpeg batch render with heavy effects |

## Common Issues
- **Drive quota exceeded**: Google Drive public bandwidth limit hit — wait ~24h, then run `retry_errors_mh.py`
- **"already in progress"**: Blotato is processing same URL — wait 35s, retry
- **Past slot 422**: Post time already passed — handle immediately or reschedule
- **Hora stored as time value**: Always use `value_input_option='RAW'` in gspread
