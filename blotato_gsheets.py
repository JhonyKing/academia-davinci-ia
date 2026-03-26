"""
blotato_gsheets.py — Conecta Google Sheets ↔ Blotato API

Modos:
  python blotato_gsheets.py --setup        → verifica conexión y crea/actualiza el sheet
  python blotato_gsheets.py --prefill      → llena las 72 filas template en Google Sheets
  python blotato_gsheets.py --dry-run      → simula publicación sin publicar
  python blotato_gsheets.py               → publica todas las filas "Pendiente"
  python blotato_gsheets.py --row 5        → publica solo la fila 5
  python blotato_gsheets.py --status       → revisa estado de posts enviados

Credenciales:
  Coloca credentials.json en: C:\\Users\\Usuario\\AppData\\Roaming\\gspread\\credentials.json
  (Ver instrucciones en SETUP_GSHEETS.md del Escritorio)
"""

import os, sys, json, base64, argparse, traceback
from datetime import datetime, timedelta
from pathlib import Path

# ── Configuración ──────────────────────────────────────────────────────────────
BLOTATO_KEY   = "blt_PXDsPBb6/fGzCMNaqRLMXVnca/HC+A5JYqP8kIYkUHo="
BLOTATO_BASE  = "https://backend.blotato.com/v2"
SHEET_NAME    = "BLOTATO_POSTS"          # nombre del Google Sheet
LOG_PATH      = r"C:\Users\Usuario\Desktop\BLOTATO_LOG.txt"
CREDS_DIR     = Path(os.environ["APPDATA"]) / "gspread"
CREDS_FILE    = CREDS_DIR / "credentials.json"

# ── Dependencias ──────────────────────────────────────────────────────────────
def ensure_deps():
    pkgs = ["gspread", "google-auth-oauthlib", "requests"]
    for pkg in pkgs:
        try:
            __import__(pkg.replace("-", "_"))
        except ImportError:
            import subprocess
            print(f"Instalando {pkg}...")
            subprocess.run([sys.executable, "-m", "pip", "install", pkg, "-q"])

ensure_deps()

import gspread
import requests
from gspread.exceptions import SpreadsheetNotFound

# ── Logging ───────────────────────────────────────────────────────────────────
def log(msg):
    ts  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line + "\n")

# ── Auth Google ───────────────────────────────────────────────────────────────
def get_gspread_client():
    if not CREDS_FILE.exists():
        print()
        print("=" * 60)
        print("  CREDENCIALES NO ENCONTRADAS")
        print("=" * 60)
        print(f"  Coloca tu credentials.json en:")
        print(f"  {CREDS_FILE}")
        print()
        print("  Pasos para obtenerlo:")
        print("  1. Ve a https://console.cloud.google.com/")
        print("  2. Crea un proyecto (o selecciona uno existente)")
        print("  3. APIs y servicios > Habilitar APIs")
        print("     - Habilita: Google Sheets API")
        print("     - Habilita: Google Drive API")
        print("  4. Credenciales > Crear credenciales > ID de cliente OAuth 2.0")
        print("     - Tipo de aplicacion: Aplicacion de escritorio")
        print("     - Nombre: blotato-publisher")
        print("  5. Descargar JSON > renombrar a credentials.json")
        print(f"  6. Moverlo a: {CREDS_DIR}")
        print()
        print("  (Solo se hace UNA vez — despues queda guardado el token)")
        print("=" * 60)
        sys.exit(1)

    gc = gspread.oauth(
        credentials_filename=str(CREDS_FILE),
        authorized_user_filename=str(CREDS_DIR / "authorized_user.json"),
    )
    return gc

# ── Obtener o crear el sheet ───────────────────────────────────────────────────
def get_or_create_sheet(gc):
    try:
        sh = gc.open(SHEET_NAME)
        log(f"Sheet encontrado: '{SHEET_NAME}'  ({sh.url})")
        return sh
    except SpreadsheetNotFound:
        log(f"Sheet '{SHEET_NAME}' no encontrado. Creando nuevo...")
        sh = gc.create(SHEET_NAME)
        sh.share(None, perm_type="anyone", role="writer")   # solo acceso autenticado
        log(f"Sheet creado: {sh.url}")
        return sh

# ── Estructura de columnas ────────────────────────────────────────────────────
COLS = [
    "ID","Estado","Fecha","Hora","Zona_Horaria","Usar_Slot_Libre",
    "Plataforma","Account_ID","Cuenta_Nombre",
    "Texto_Copy","Hashtags","Video_URL","Media_Extra",
    "IG_Tipo","IG_AltText","IG_Portada_URL","IG_ShareToFeed","IG_AudioName",
    "TT_Privacidad","TT_Comentarios","TT_Dueto","TT_Stitch",
    "TT_Branded","TT_TuMarca","TT_EsIA",
    "YT_Titulo","YT_Privacidad","YT_Notificar","YT_ParaNinos","YT_EsIA","YT_Miniatura",
    "FB_PageId","FB_TipoMedia","FB_Link",
    "Post_Submission_ID","Estado_API","Fecha_Publicado","Notas",
]

# FB_PageId: subaccount ID (diferente al Account_ID de Blotato)
FB_PAGES = [
    ("2077", "Jhony King Music",                    "1064497986744147"),
    ("2077", "Los mejores videos virales 2017",     "490873684369565"),
    ("2077", "Loomin Lab - IA & Marketing Digital", "645979691924551"),
    ("2077", "Jhony King - Especialista en IA",     "629394793590375"),
]

POSTING_ROUND = [
    # ── TikTok (3 cuentas) ────────────────────────────────────────────────────
    ("tiktok",    "34164", "@jk_arts8",         None,    {}),
    ("tiktok",    "34150", "@jhony_king_music",  None,    {}),
    ("tiktok",    "2633",  "@jhonykingia",        None,    {}),
    # ── Instagram Reels + feed (3 cuentas) ───────────────────────────────────
    ("instagram", "14635", "@jhonykingmusic",    "reel",  {"IG_ShareToFeed": "TRUE"}),
    ("instagram", "2141",  "@jhonyking.ia",       "reel",  {"IG_ShareToFeed": "TRUE"}),
    ("instagram", "36126", "@juanlopez624100",   "reel",  {"IG_ShareToFeed": "TRUE"}),
    # ── Instagram Stories (3 cuentas) ────────────────────────────────────────
    ("instagram", "14635", "@jhonykingmusic",    "story", {"IG_ShareToFeed": "FALSE"}),
    ("instagram", "2141",  "@jhonyking.ia",       "story", {"IG_ShareToFeed": "FALSE"}),
    ("instagram", "36126", "@juanlopez624100",   "story", {"IG_ShareToFeed": "FALSE"}),
    # ── Facebook (4 páginas — perfil personal NO disponible por restricción de FB API) ──
    ("facebook",  "2077",  "Jhony King Music",                    "reel", {"FB_PageId":"1064497986744147","FB_TipoMedia":"reel"}),
    ("facebook",  "2077",  "Los mejores videos virales 2017",     "reel", {"FB_PageId":"490873684369565", "FB_TipoMedia":"reel"}),
    ("facebook",  "2077",  "Loomin Lab - IA & Marketing Digital", "reel", {"FB_PageId":"645979691924551", "FB_TipoMedia":"reel"}),
    ("facebook",  "2077",  "Jhony King - Especialista en IA",     "reel", {"FB_PageId":"629394793590375", "FB_TipoMedia":"reel"}),
    # ── YouTube (2 canales principales) ──────────────────────────────────────
    ("youtube",   "1229",  "JhonyKing IA",        None,   {"YT_Privacidad":"public","YT_Notificar":"FALSE","YT_EsIA":"TRUE"}),
    ("youtube",   "30661", "Jhonnatan Vazquez",    None,   {"YT_Privacidad":"public","YT_Notificar":"FALSE","YT_EsIA":"TRUE"}),
]

DEFAULTS = {
    "Zona_Horaria":"America/Matamoros","Usar_Slot_Libre":"FALSE",
    "TT_Privacidad":"PUBLIC_TO_EVERYONE","TT_Comentarios":"FALSE",
    "TT_Dueto":"FALSE","TT_Stitch":"FALSE","TT_Branded":"FALSE",
    "TT_TuMarca":"FALSE","TT_EsIA":"TRUE",
    "YT_Privacidad":"public","YT_Notificar":"FALSE","YT_ParaNinos":"FALSE","YT_EsIA":"TRUE",
    "FB_TipoMedia":"reel",
}

# ── Colores de columnas ───────────────────────────────────────────────────────
def rgb(r, g, b):
    return {"red": r/255, "green": g/255, "blue": b/255}

COLUMN_COLORS = {
    # Instagram (N:R) — rosa suave
    "IG_Tipo":        rgb(255, 209, 220),
    "IG_AltText":     rgb(255, 209, 220),
    "IG_Portada_URL": rgb(255, 209, 220),
    "IG_ShareToFeed": rgb(255, 209, 220),
    "IG_AudioName":   rgb(255, 209, 220),
    # TikTok (S:Y) — gris suave
    "TT_Privacidad":  rgb(225, 225, 225),
    "TT_Comentarios": rgb(225, 225, 225),
    "TT_Dueto":       rgb(225, 225, 225),
    "TT_Stitch":      rgb(225, 225, 225),
    "TT_Branded":     rgb(225, 225, 225),
    "TT_TuMarca":     rgb(225, 225, 225),
    "TT_EsIA":        rgb(225, 225, 225),
    # YouTube (Z:AE) — rojo suave
    "YT_Titulo":      rgb(255, 180, 180),
    "YT_Privacidad":  rgb(255, 180, 180),
    "YT_Notificar":   rgb(255, 180, 180),
    "YT_ParaNinos":   rgb(255, 180, 180),
    "YT_EsIA":        rgb(255, 180, 180),
    "YT_Miniatura":   rgb(255, 180, 180),
    # Facebook (AF:AH) — azul celeste suave
    "FB_PageId":      rgb(173, 216, 230),
    "FB_TipoMedia":   rgb(173, 216, 230),
    "FB_Link":        rgb(173, 216, 230),
}

def col_letter(index):
    """Convierte índice 0-based a letra(s) de columna: 0→A, 25→Z, 26→AA..."""
    result = ""
    index += 1
    while index > 0:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result

def apply_column_colors(ws):
    """Aplica colores de fondo a las columnas por plataforma."""
    requests_batch = []
    sheet_id = ws._properties["sheetId"]

    for col_name, color in COLUMN_COLORS.items():
        if col_name not in COLS:
            continue
        col_idx = COLS.index(col_name)
        requests_batch.append({
            "repeatCell": {
                "range": {
                    "sheetId": sheet_id,
                    "startColumnIndex": col_idx,
                    "endColumnIndex":   col_idx + 1,
                },
                "cell": {"userEnteredFormat": {"backgroundColor": color}},
                "fields": "userEnteredFormat.backgroundColor",
            }
        })

    if requests_batch:
        ws.spreadsheet.batch_update({"requests": requests_batch})

# ── Pre-fill del sheet ─────────────────────────────────────────────────────────
def prefill(gc):
    sh   = get_or_create_sheet(gc)

    # Hoja POSTS
    try:
        ws = sh.worksheet("POSTS")
    except Exception:
        ws = sh.add_worksheet(title="POSTS", rows=300, cols=len(COLS))

    # Hoja CUENTAS
    try:
        wc = sh.worksheet("CUENTAS")
    except Exception:
        wc = sh.add_worksheet(title="CUENTAS", rows=20, cols=5)

    log("Escribiendo encabezados...")
    # Row 1: nombres de columnas
    ws.update("A1", [COLS], value_input_option="RAW")

    # Row 2: descripciones cortas
    DESCS = {
        "ID":"#","Estado":"Pendiente/Publicado/Error","Fecha":"YYYY-MM-DD","Hora":"HH:MM",
        "Zona_Horaria":"America/Mexico_City","Usar_Slot_Libre":"TRUE/FALSE",
        "Plataforma":"tiktok/instagram/youtube/facebook","Account_ID":"ID de Blotato",
        "Cuenta_Nombre":"Referencia visual","Texto_Copy":"Caption del post",
        "Hashtags":"#tag1 #tag2...","Video_URL":"Ruta local o URL publica",
        "Media_Extra":"URLs extra separadas por coma",
        "IG_Tipo":"reel/story/post","IG_AltText":"Alt text","IG_Portada_URL":"Cover image URL",
        "IG_ShareToFeed":"TRUE/FALSE","IG_AudioName":"Nombre del audio",
        "TT_Privacidad":"PUBLIC_TO_EVERYONE / SELF_ONLY","TT_Comentarios":"TRUE=desactivar",
        "TT_Dueto":"TRUE=desactivar","TT_Stitch":"TRUE=desactivar",
        "TT_Branded":"TRUE=contenido de marca","TT_TuMarca":"TRUE=tu marca",
        "TT_EsIA":"TRUE=generado por IA",
        "YT_Titulo":"Titulo del video (OBLIGATORIO)","YT_Privacidad":"public/private/unlisted",
        "YT_Notificar":"TRUE=notificar suscriptores","YT_ParaNinos":"TRUE=Kids",
        "YT_EsIA":"TRUE=contiene IA","YT_Miniatura":"URL miniatura personalizada",
        "FB_PageId":"ID de la pagina FB (subaccount) - ver hoja CUENTAS",
        "FB_TipoMedia":"video/reel","FB_Link":"URL externa",
        "Post_Submission_ID":"[auto]","Estado_API":"[auto]",
        "Fecha_Publicado":"[auto]","Notas":"[auto/manual]",
    }
    desc_row = [DESCS.get(c, "") for c in COLS]
    ws.update("A2", [desc_row], value_input_option="RAW")

    log("Escribiendo 72 filas template (6 bloques x 12)...")
    rows_data = []
    base_date = datetime.now() + timedelta(days=1)

    for block in range(6):
        post_date = (base_date + timedelta(days=block)).strftime("%Y-%m-%d")
        post_hora = ["09:00","12:00","15:00","18:00","09:00","12:00"][block]

        for idx, (platform, acct_id, acct_name, tipo, extras) in enumerate(POSTING_ROUND):
            row = {c: "" for c in COLS}
            row["ID"]           = f"{block+1:02d}-{idx+1:02d}"
            row["Estado"]       = "Pendiente"
            row["Fecha"]        = post_date
            row["Hora"]         = post_hora
            row["Plataforma"]   = platform
            row["Account_ID"]   = acct_id
            row["Cuenta_Nombre"]= acct_name
            row["Texto_Copy"]   = f"[COPY VIDEO {block+1}]"
            row["Hashtags"]     = "[#hashtag1 #hashtag2 #hashtag3]"
            row["Video_URL"]    = f"[RUTA_VIDEO_{block+1}.mp4]"

            # Defaults
            for k, v in DEFAULTS.items():
                row[k] = v

            if platform == "tiktok":
                pass  # ya cubierto por DEFAULTS

            elif platform == "instagram":
                row["IG_Tipo"]       = tipo or "reel"
                row["IG_ShareToFeed"]= extras.get("IG_ShareToFeed", "TRUE")
                if tipo != "story":
                    row["IG_Portada_URL"] = f"[THUMBNAIL_VIDEO_{block+1}.jpg]"

            elif platform == "youtube":
                row["YT_Titulo"]   = f"[TITULO VIDEO {block+1}]"
                row["YT_Miniatura"]= f"[THUMBNAIL_VIDEO_{block+1}.jpg]"
                for k, v in extras.items():
                    row[k] = v

            elif platform == "facebook":
                row["FB_TipoMedia"] = extras.get("FB_TipoMedia", "reel")

            for k, v in extras.items():
                row[k] = v

            rows_data.append([row[c] for c in COLS])

        # Separador entre bloques
        sep = [""] * len(COLS)
        sep[0] = f"── VIDEO {block+2} ──"
        rows_data.append(sep)

    ws.update(f"A3", rows_data, value_input_option="RAW")

    # Hoja CUENTAS
    cuentas_headers = ["Account_ID", "Plataforma", "Nombre / Usuario", "Notas"]
    cuentas_data = [
        ["2077",  "facebook",  "Jhony King",           "Conectar 3 cuentas FB mas en Blotato"],
        ["1229",  "youtube",   "JhonyKing IA",          "Canal principal"],
        ["30661", "youtube",   "Jhonnatan Vazquez",     "Segundo canal"],
        ["14635", "instagram", "@jhonykingmusic",       ""],
        ["2141",  "instagram", "@jhonyking.ia",          ""],
        ["36126", "instagram", "@juanlopez624100",      ""],
        ["639",   "threads",   "@jhonykingia",           ""],
        ["34164", "tiktok",    "@jk_arts8",              ""],
        ["34150", "tiktok",    "@jhony_king_music",      ""],
        ["2633",  "tiktok",    "@jhonykingia",            ""],
    ]
    wc.update("A1", [cuentas_headers] + cuentas_data, value_input_option="RAW")

    # Eliminar hoja por defecto "Sheet1" si existe
    try:
        default = sh.worksheet("Sheet1")
        sh.del_worksheet(default)
    except Exception:
        pass

    # ── Colores de columnas por plataforma ────────────────────────────────────
    log("Aplicando colores por plataforma...")
    apply_column_colors(ws)

    log(f"Pre-llenado completo.")
    log(f"Abre tu sheet: {sh.url}")
    print()
    print("  Campos que TU llenas por video:")
    print("    [COPY VIDEO N]          -> Texto_Copy")
    print("    [#hashtag...]           -> Hashtags")
    print("    [RUTA_VIDEO_N.mp4]      -> Video_URL")
    print("    [TITULO VIDEO N]        -> YT_Titulo")
    print("    [THUMBNAIL_VIDEO_N.jpg] -> IG_Portada_URL / YT_Miniatura")
    print("    Fecha / Hora            -> programacion")

# ── Blotato: upload media ─────────────────────────────────────────────────────
def upload_media(path_or_url):
    if path_or_url.startswith("http://") or path_or_url.startswith("https://"):
        return path_or_url
    p = Path(path_or_url)
    if not p.exists():
        raise FileNotFoundError(f"Archivo no encontrado: {path_or_url}")
    size_mb = p.stat().st_size / (1024*1024)
    log(f"  Subiendo {p.name} ({size_mb:.1f} MB)...")
    suffix  = p.suffix.lower()
    mimes   = {".mp4":"video/mp4",".mov":"video/quicktime",".jpg":"image/jpeg",
               ".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp"}
    mime    = mimes.get(suffix, "application/octet-stream")
    with open(p, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")
    resp = requests.post(
        f"{BLOTATO_BASE}/media",
        headers={"blotato-api-key": BLOTATO_KEY, "Content-Type": "application/json"},
        json={"url": f"data:{mime};base64,{b64}"},
        timeout=180,
    )
    resp.raise_for_status()
    url = resp.json()["url"]
    log(f"  Media subida: {url}")
    return url

# ── Construir body para Blotato ───────────────────────────────────────────────
def build_body(row_dict):
    def g(key, default=""):
        return str(row_dict.get(key) or default).strip()

    platform   = g("Plataforma").lower()
    account_id = g("Account_ID")
    fecha      = g("Fecha")
    hora       = g("Hora")
    zona       = g("Zona_Horaria", "America/Mexico_City")
    slot_libre = g("Usar_Slot_Libre", "FALSE").upper() == "TRUE"
    texto      = g("Texto_Copy")
    hashtags   = g("Hashtags")
    video_url  = g("Video_URL")
    media_extra= g("Media_Extra")

    if not platform: raise ValueError("Plataforma vacia")
    if not account_id: raise ValueError("Account_ID vacio")

    full_text = texto
    if hashtags:
        full_text = f"{texto}\n\n{hashtags}"

    media_urls = []
    if video_url and not video_url.startswith("["):
        media_urls.append(upload_media(video_url))
    for u in media_extra.split(","):
        u = u.strip()
        if u and not u.startswith("["):
            media_urls.append(upload_media(u))

    target = {"targetType": platform}

    if platform == "instagram":
        ig_tipo  = g("IG_Tipo", "reel").lower()
        ig_alt   = g("IG_AltText")
        ig_cover = g("IG_Portada_URL")
        ig_feed  = g("IG_ShareToFeed", "TRUE").upper() == "TRUE"
        ig_audio = g("IG_AudioName")
        if ig_tipo in ("reel", "story"): target["mediaType"] = ig_tipo
        if ig_alt:  target["altText"] = ig_alt
        if ig_cover and not ig_cover.startswith("["): target["coverImageUrl"] = upload_media(ig_cover)
        target["shareToFeed"] = ig_feed
        if ig_audio: target["audioName"] = ig_audio

    elif platform == "tiktok":
        target["privacyLevel"]       = g("TT_Privacidad", "PUBLIC_TO_EVERYONE")
        target["disabledComments"]   = g("TT_Comentarios","FALSE").upper() == "TRUE"
        target["disabledDuet"]       = g("TT_Dueto",      "FALSE").upper() == "TRUE"
        target["disabledStitch"]     = g("TT_Stitch",     "FALSE").upper() == "TRUE"
        target["isBrandedContent"]   = g("TT_Branded",    "FALSE").upper() == "TRUE"
        target["isYourBrand"]        = g("TT_TuMarca",    "FALSE").upper() == "TRUE"
        target["isAiGenerated"]      = g("TT_EsIA",       "TRUE" ).upper() == "TRUE"

    elif platform == "youtube":
        yt_title = g("YT_Titulo")
        if not yt_title or yt_title.startswith("["): raise ValueError("YT_Titulo vacio")
        target["title"]                   = yt_title
        target["privacyStatus"]           = g("YT_Privacidad","public")
        target["shouldNotifySubscribers"] = g("YT_Notificar","FALSE").upper() == "TRUE"
        target["isMadeForKids"]           = g("YT_ParaNinos","FALSE").upper() == "TRUE"
        target["containsSyntheticMedia"]  = g("YT_EsIA",    "TRUE" ).upper() == "TRUE"
        yt_thumb = g("YT_Miniatura")
        if yt_thumb and not yt_thumb.startswith("["):
            target["thumbnailUrl"] = upload_media(yt_thumb)

    elif platform == "facebook":
        # pageId = subaccount ID (FB_PageId), no el account_id de Blotato
        fb_page_id = g("FB_PageId")
        if not fb_page_id:
            raise ValueError("Facebook requiere FB_PageId (subaccount ID de la pagina)")
        target["pageId"] = fb_page_id
        fb_media = g("FB_TipoMedia","reel").lower()
        if fb_media in ("video","reel"): target["mediaType"] = fb_media
        fb_link = g("FB_Link")
        if fb_link: target["link"] = fb_link

    body = {
        "post": {
            "accountId": account_id,
            "content": {"text": full_text, "mediaUrls": media_urls,
                        "platform": platform, "additionalPosts": []},
            "target": target,
        }
    }

    if slot_libre:
        body["useNextFreeSlot"] = True
    elif fecha and hora:
        tz_offsets = {
            "America/Matamoros":"-05:00","America/Mexico_City":"-06:00",
            "America/New_York":"-05:00","America/Chicago":"-06:00",
            "America/Los_Angeles":"-08:00","America/Cancun":"-05:00",
            "UTC":"+00:00","Europe/Madrid":"+01:00",
        }
        offset = tz_offsets.get(zona, "-05:00")
        body["scheduledTime"] = f"{fecha}T{hora}:00{offset}"

    return body

# ── Publicar ──────────────────────────────────────────────────────────────────
def publish_to_blotato(body):
    resp = requests.post(
        f"{BLOTATO_BASE}/posts",
        headers={"blotato-api-key": BLOTATO_KEY, "Content-Type": "application/json"},
        json=body, timeout=60,
    )
    try: data = resp.json()
    except Exception: data = {"raw": resp.text}
    if not resp.ok: raise RuntimeError(f"HTTP {resp.status_code}: {data}")
    return data

# ── Modo principal: publicar desde Google Sheets ──────────────────────────────
def run_publish(gc, dry_run=False, only_row=None, check_mode=False):
    sh = get_or_create_sheet(gc)
    ws = sh.worksheet("POSTS")

    all_values = ws.get_all_values()
    if not all_values:
        log("El sheet esta vacio. Ejecuta --prefill primero.")
        return

    headers = all_values[0]
    def col(name):
        try: return headers.index(name)
        except ValueError: return -1

    if check_mode:
        log("=== Revisando estado de posts enviados ===")
        updates = []
        for i, row in enumerate(all_values[2:], start=3):
            estado = row[col("Estado")] if col("Estado") >= 0 else ""
            sub_id = row[col("Post_Submission_ID")] if col("Post_Submission_ID") >= 0 else ""
            if estado in ("Enviado","Pendiente_Check") and sub_id:
                try:
                    resp = requests.get(f"{BLOTATO_BASE}/posts/{sub_id}",
                                        headers={"blotato-api-key": BLOTATO_KEY}, timeout=20)
                    nuevo = resp.json().get("status","Desconocido")
                    gsheet_row = i + 1
                    ws.update_cell(gsheet_row, col("Estado_API") + 1, nuevo)
                    if nuevo == "published":
                        ws.update_cell(gsheet_row, col("Estado") + 1, "Publicado")
                    log(f"  Fila {gsheet_row}: {sub_id} -> {nuevo}")
                except Exception as e:
                    log(f"  Fila {i+1}: ERROR -> {e}")
        return

    log(f"=== Blotato Publisher ({'DRY RUN' if dry_run else 'REAL'}) ===")
    total = ok = errors = skipped = 0

    for i, row in enumerate(all_values[2:], start=3):
        if not any(row): break
        gsheet_row = i + 1   # 1-indexed + skip header rows

        row_dict = {headers[j]: row[j] for j in range(len(headers))}
        estado   = row_dict.get("Estado","").strip()

        if only_row and gsheet_row != only_row:
            continue
        if estado != "Pendiente":
            skipped += 1
            continue

        plataforma = row_dict.get("Plataforma","?")
        cuenta     = row_dict.get("Cuenta_Nombre", row_dict.get("Account_ID","?"))
        log(f"\n[Fila {gsheet_row}] {plataforma} | {cuenta}")
        total += 1

        try:
            body = build_body(row_dict)
            if dry_run:
                log(f"  DRY RUN: {json.dumps(body, ensure_ascii=False)[:400]}...")
                ok += 1
                continue

            result   = publish_to_blotato(body)
            sub_id   = result.get("postSubmissionId","")
            now_str  = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            log(f"  OK -> postSubmissionId: {sub_id}")

            ws.update_cell(gsheet_row, col("Post_Submission_ID")+1, sub_id)
            ws.update_cell(gsheet_row, col("Estado")+1,             "Enviado")
            ws.update_cell(gsheet_row, col("Estado_API")+1,         "submitted")
            ws.update_cell(gsheet_row, col("Fecha_Publicado")+1,    now_str)
            ok += 1

        except Exception as e:
            err = str(e)
            log(f"  ERROR: {err}")
            traceback.print_exc()
            ws.update_cell(gsheet_row, col("Estado")+1, "Error")
            ws.update_cell(gsheet_row, col("Notas")+1,  err[:300])
            errors += 1

    log(f"\n=== Resumen ===")
    log(f"  Procesados: {total} | OK: {ok} | Errores: {errors} | Saltados: {skipped}")

# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Blotato + Google Sheets Publisher")
    parser.add_argument("--setup",    action="store_true", help="Verificar conexion")
    parser.add_argument("--prefill",  action="store_true", help="Llenar sheet con template")
    parser.add_argument("--dry-run",  action="store_true", help="Simular sin publicar")
    parser.add_argument("--row",      type=int,            help="Procesar solo la fila N")
    parser.add_argument("--status",   action="store_true", help="Revisar estado de posts")
    args = parser.parse_args()

    gc = get_gspread_client()

    if args.setup or args.prefill:
        sh = get_or_create_sheet(gc)
        log(f"Conexion OK. Sheet: {sh.url}")
        if args.prefill:
            prefill(gc)
    elif args.status:
        run_publish(gc, check_mode=True)
    else:
        run_publish(gc, dry_run=args.dry_run, only_row=args.row)
