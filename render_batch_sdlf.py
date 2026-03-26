#!/usr/bin/env python3
"""
Batch render SDLF videos: hook(1.1x) + content(SDLF) + CTA "SMOG" overlay
Usage:
  python render_batch_sdlf.py          # render all
  python render_batch_sdlf.py --test   # render 1 combination only
  python render_batch_sdlf.py --workers 3
"""
import os, re, sys, subprocess, shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ─── PATHS ────────────────────────────────────────────────────────────────────
FFMPEG      = r"C:\Users\Usuario\JhonyKingAI_Remotion\node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe"
BASE        = r"C:\Users\Usuario\JhonyKingAI_Remotion\public\MATERIALES"
HOOKS_DIR   = os.path.join(BASE, "VIDEOS GANCHOS SI A TI TE GUSTA")
CONTENT_DIR = os.path.join(BASE, "VIDEOS CONTENIDO CENTRAL", "SDLF")
CTA_AUDIO   = os.path.join(BASE, "AUDIO CALL TO ACTION SMOG.mp3")
OUTPUT_DIR  = os.path.join(BASE, "VIDEOS RENDERIZADOS POR CLAUDE", "SDLF")
TEMP_HOOKS  = os.path.join(BASE, "_TEMP_HOOKS_1.1x")   # reuse pre-rendered hooks
TEMP_ASS    = os.path.join(BASE, "_TEMP_ASS_SDLF")

# ─── CTA SETTINGS ─────────────────────────────────────────────────────────────
CTA_DURATION  = 2.0     # seconds (from Whisper analysis)
CTA_OFFSET    = 1.0     # start CTA this many seconds BEFORE the video ends (so it plays fully)
DUCK_VOLUME   = 0.15    # 15% original audio during CTA
CTA_BOOST     = 2.5     # CTA audio volume multiplier
VOLUME_BOOST  = 1.6     # ~+4 dB boost on final mix (user requested louder audio)
FADE_DUR      = 0.35    # white-flash transition duration
EFFECT_PERIOD = 5.0     # visual effect every N seconds (in content section)

# ─── ARTIST INITIALS ──────────────────────────────────────────────────────────
# All 17 hooks included (Rio Roma / Santiago Cruz / Juan Solo not in folder)
ARTIST_INITIALS = {
    "FAN-ANDRES-CALAMARO": "AC",
    "FAN-FOO-FIGHTERS":    "FF",
    "FAN-JOSE-MADERO":     "JM",
    "FAN-LOS-BUNKERS":     "LB",
    "FAN-MANA":            "MA",
    "FAN-MUSE":            "MU",
    "FAN-PANDA":           "PA",
    "FAN-PLASTILINA-MOSH": "PM",
    "FAN-SOBER":           "SO",
    "FAN-ZOE":             "ZO",
    "hook_CAIFANES":       "CA",
    "hook_CHARLY-GARCIA":  "CG",
    "hook_GREEN-DAY":      "GD",
    "hook_JUANES":         "JU",
    "hook_LA-LEY":         "LL",
    "hook_LENNY-KRAVITZ":  "LK",
    "hook_SODA-STEREO":    "SS",
}

# ─── CTA WORD GROUPS ──────────────────────────────────────────────────────────
# Transcribed via Whisper from AUDIO CALL TO ACTION SMOG.mp3
# Format: (start_cs_relative, end_cs_relative, [(word, duration_cs), ...])
CTA_GROUPS = [
    (0,   72,  [("Comenta", 36), ("la",  12), ("palabra", 24)]),
    (72,  142, [('"SMOG"',  28), ("y",   32), ("te",      10)]),
    (142, 200, [("mando",   24), ("mi",  10), ("música.", 24)]),
]

# ─── HELPERS ──────────────────────────────────────────────────────────────────
print_lock = Lock()

def log(msg):
    with print_lock:
        print(msg, flush=True)

def get_duration(filepath):
    r = subprocess.run([FFMPEG, "-i", filepath], capture_output=True, text=True, errors="replace")
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    if m:
        return int(m.group(1))*3600 + int(m.group(2))*60 + float(m.group(3))
    raise RuntimeError(f"Could not get duration of: {filepath}")

def cs_to_ass(total_cs):
    h  = total_cs // 360000; total_cs %= 360000
    mi = total_cs // 6000;   total_cs %= 6000
    s  = total_cs // 100;    cs = total_cs % 100
    return f"{h}:{mi:02d}:{s:02d}.{cs:02d}"

def generate_ass(cta_start_sec, ass_path):
    """Write ASS subtitle file — CTA captions top-center, white text + red outline, grey box."""
    cta_cs = int(cta_start_sec * 100)

    header = """\
[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: CTABG,Arial Black,90,&HFF000000,&HFF000000,&HFF000000,&H60A0A0A0,-1,0,0,0,100,100,0,0,3,4,0,8,30,30,80,1
Style: CTA,Arial Black,90,&H00FFFFFF,&H00CCCCCC,&H000000FF,&HFF000000,-1,0,0,0,100,100,0,0,1,4,0,8,30,30,80,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    for (rel_start, rel_end, words) in CTA_GROUPS:
        t_start = cs_to_ass(cta_cs + rel_start)
        t_end   = cs_to_ass(cta_cs + rel_end)
        plain_text   = " ".join(w for w, _ in words)
        karaoke_text = " ".join(f"{{\\kf{dur}}}{word}" for word, dur in words)
        events.append(f"Dialogue: 0,{t_start},{t_end},CTABG,,0,0,0,,{plain_text}")
        events.append(f"Dialogue: 1,{t_start},{t_end},CTA,,0,0,0,,{karaoke_text}")

    with open(ass_path, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")

def esc_ass_path(p):
    p = p.replace("\\", "/")
    p = p.replace(":", "\\:")
    return p

# ─── STEP 1: SPEED UP HOOK (reuse if already exists) ─────────────────────────
def speedup_hook(hook_name, hook_path, out_path):
    if os.path.exists(out_path):
        log(f"  [SKIP] Hook cached: {hook_name}")
        return
    log(f"  [HOOK] Speed up 1.1x: {hook_name}")
    cmd = [
        FFMPEG, "-y", "-i", hook_path,
        "-vf", "setpts=PTS/1.1",
        "-af", "atempo=1.1",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        out_path
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if r.returncode != 0:
        raise RuntimeError(f"Hook speedup failed: {r.stderr[-500:]}")

# ─── STEP 2: RENDER ONE COMBINATION ───────────────────────────────────────────
def build_effects(hd, P=5.0):
    """
    8 DISTINCT effect types — no two shakes in a row, varied light+motion palette.
    hd = hook_dur (seconds). All effects gate on t >= hd.

    Beat schedule (relative to content start) — intentionally staggered so no type repeats:
      SHAKE    P=8s  off=0   → ~2.0, 10.0, 18.0s          brutal crop shake + glitch
      COLORPOP P=5s  off=1.5 → ~2.75, 7.75, 12.75, 17.75s  brightness+saturation burst
      STROBE   P=6s  off=3   → ~4.5, 10.5, 16.5s           blinding white snap
      WARM     P=7s  off=2   → ~3.75, 10.75, 17.75s        warm golden light flare
      LIGHTWASH P=11s off=5  → ~6.75, 17.75s               dreamy blur overexposure
      SHARPEN  P=9s  off=4   → ~5.25, 14.25s               ultra-sharpen punch
      NEON     P=13s off=6   → ~7.75, 20.75s               cool blue neon blast
      ZOOM     P=10s off=7   → ~8.75, 18.75s               slow push-in (crop drift)
    """
    h = f"{hd:.3f}"

    # ── Beat timing helpers ────────────────────────────────────────────────────
    def beat(period, offset, threshold):
        s = f"sin(2*PI*(t-{h}-{offset:.1f})/{period:.1f})"
        return f"gte(t,{h})*gt({s},{threshold})"

    beatSHAKE_w = beat(8,  0.0, 0.80)   # ~1.1s  wide  → shake duration
    beatSHAKE_t = beat(8,  0.0, 0.995)  # ~0.08s snap  → glitch at peak
    beatPOP     = beat(5,  1.5, 0.84)   # ~0.85s       → color pop
    beatSTROBE  = beat(6,  3.0, 0.997)  # ~0.06s snap  → white strobe
    beatWARM_w  = beat(7,  2.0, 0.85)   # ~0.70s       → warm flare visible
    beatWARM_t  = beat(7,  2.0, 0.97)   # ~0.25s       → warm flare peak
    beatWASH    = beat(11, 5.0, 0.92)   # ~0.55s       → dreamy light wash
    beatSHARP   = beat(9,  4.0, 0.95)   # ~0.40s       → sharpen burst
    beatNEON    = beat(13, 6.0, 0.90)   # ~0.65s       → neon blast
    beatZOOM    = beat(10, 7.0, 0.80)   # ~1.1s        → slow zoom push

    # ── 1. SHAKE  (brutal ±48px X + ±34px Y, P=8s) ───────────────────────────
    sxS = f"50+48*sin(t*142)*{beatSHAKE_w}"   # range 2–98   ✓
    syS = f"50+34*cos(t*117)*{beatSHAKE_w}"   # range 16–84  ✓
    shake = f"crop=980:1820:x='{sxS}':y='{syS}',scale=1080:1920:flags=bicubic"

    # ── 2. RGB GLITCH snap  (at shake peak only, ~0.08s split) ───────────────
    glitch = f"rgbashift=rh=24:bh=-18:enable='{beatSHAKE_t}'"

    # ── 3. COLOR POP  (P=5s offset — between shakes) ─────────────────────────
    color_pop = f"eq=brightness=0.24:contrast=1.20:saturation=2.6:enable='{beatPOP}'"

    # ── 4. WHITE STROBE snap  (P=6s — blinding ~0.06s flash) ─────────────────
    strobe = f"eq=brightness=0.65:contrast=1.08:enable='{beatSTROBE}'"

    # ── 5a. WARM LIGHT FLARE wide  (golden hour lens hit, 0.7s) ──────────────
    #  colorbalance: push reds/yellows (rs=+red shadows, gs=+green midtones)
    warm_color = f"colorbalance=rs=0.50:gs=0.10:bs=-0.28:enable='{beatWARM_w}'"
    # ── 5b. WARM FLARE peak brightness burst (0.25s) ─────────────────────────
    warm_eq    = f"eq=brightness=0.22:saturation=1.6:enable='{beatWARM_t}'"

    # ── 6. LIGHT WASH / overexposure dream  (P=11s, rare — 0.55s) ────────────
    #  Heavy blur + brightness + desaturate = "washed in white light" look
    light_blur = f"gblur=sigma=22:enable='{beatWASH}'"
    light_eq   = f"eq=brightness=0.32:saturation=0.45:enable='{beatWASH}'"

    # ── 7. SHARPEN BURST  (P=9s — ultra-crisp 0.4s punch) ────────────────────
    sharpen = f"unsharp=luma_msize_x=9:luma_msize_y=9:luma_amount=2.8:enable='{beatSHARP}'"

    # ── 8. NEON COOL FLASH  (P=13s, rare — cyberpunk blue/purple, 0.65s) ─────
    neon_color = f"colorbalance=rs=-0.32:gs=0.04:bs=0.48:enable='{beatNEON}'"
    neon_eq    = f"eq=brightness=0.24:saturation=2.2:enable='{beatNEON}'"

    # ── 9. SLOW PUSH-IN / ZOOM  (P=10s — gentle crop drift, 1.1s) ───────────
    #  Slowly drifts crop center inward (simulates slow zoom-in).
    #  No scale needed: crop 1040×1880 centered, drift ±20px toward center.
    sxZ = f"20+18*sin(t*12)*{beatZOOM}"    # range 2–38  ✓ (slow oscillation)
    syZ = f"20+14*cos(t*10)*{beatZOOM}"    # range 6–34  ✓
    zoom_drift = f"crop=1040:1880:x='{sxZ}':y='{syZ}',scale=1080:1920:flags=lanczos"

    # ── 10. CINEMATIC GRADE  (ALWAYS ON) ──────────────────────────────────────
    grade = (
        "curves="
        "r='0/0 0.06/0.07 0.5/0.51 1/0.94':"
        "g='0/0 0.5/0.50 1/0.96':"
        "b='0/0.03 0.3/0.34 1/0.99'"
    )

    # ── 11. VIGNETTE  (ALWAYS ON) ─────────────────────────────────────────────
    vignette = "vignette=PI/4"

    # ── 12. FILM GRAIN  (ALWAYS ON) ───────────────────────────────────────────
    grain = "noise=c0s=7:c0f=t+u:allf=t"

    return (
        f"{shake},{glitch},"          # brutal shake + glitch at peak
        f"{color_pop},"               # color pop (between shakes)
        f"{strobe},"                  # blinding white snap
        f"{warm_color},{warm_eq},"    # warm golden light flare
        f"{light_blur},{light_eq},"   # dreamy light wash
        f"{sharpen},"                 # ultra-sharpen punch
        f"{neon_color},{neon_eq},"    # cool neon blast
        f"{zoom_drift},"              # slow push-in zoom
        f"{grade},{vignette},{grain}" # always-on cinematic base
    )


def render_combo(hook_fast_path, hook_dur, content_path, out_path):
    content_dur  = get_duration(content_path)
    # CTA starts CTA_OFFSET seconds before end → finishes with room to breathe
    cta_start    = hook_dur + content_dur - CTA_DURATION - CTA_OFFSET
    cta_delay_ms = int(cta_start * 1000)
    total_dur    = hook_dur + content_dur
    hook_fade_st = max(0.0, hook_dur - FADE_DUR)

    ass_path = os.path.join(TEMP_ASS, os.path.basename(out_path) + ".ass")
    generate_ass(cta_start, ass_path)
    ass_esc  = esc_ass_path(ass_path)

    vol_expr = f"if(between(t,{cta_start:.3f},{total_dur:.3f}),{DUCK_VOLUME},1.0)"

    # Build professional effects chain
    vfx_chain = build_effects(hook_dur)

    filter_complex = (
        # ── Video: white-flash transition hook → content ──────────────────────
        f"[0:v]fade=t=out:st={hook_fade_st:.3f}:d={FADE_DUR:.3f}:color=white[hv];"
        f"[1:v]fade=t=in:st=0:d={FADE_DUR:.3f}:color=white[cv];"
        "[hv][cv]concat=n=2:v=1:a=0[outv];"
        # ── Professional effects chain ────────────────────────────────────────
        f"[outv]{vfx_chain}[vfx];"
        # ── Audio: fade + concat ──────────────────────────────────────────────
        f"[0:a]aresample=44100,afade=t=out:st={hook_fade_st:.3f}:d={FADE_DUR:.3f}[ha];"
        f"[1:a]aresample=44100,afade=t=in:st=0:d={FADE_DUR:.3f}[ca];"
        "[ha][ca]concat=n=2:v=0:a=1[outa];"
        # ── Duck original during CTA ──────────────────────────────────────────
        f"[outa]volume='{vol_expr}'[outa_duck];"
        # ── CTA audio: boost + delay ──────────────────────────────────────────
        f"[2:a]aresample=44100,volume={CTA_BOOST},adelay={cta_delay_ms}|{cta_delay_ms}[cta_del];"
        # ── Mix + global volume boost ─────────────────────────────────────────
        f"[outa_duck][cta_del]amix=inputs=2:duration=first[mixed];"
        f"[mixed]volume={VOLUME_BOOST}[finalA];"
        # ── Burn CTA subtitles on top ─────────────────────────────────────────
        f"[vfx]subtitles='{ass_esc}'[finalV]"
    )

    cmd = [
        FFMPEG, "-y",
        "-i", hook_fast_path,
        "-i", content_path,
        "-i", CTA_AUDIO,
        "-filter_complex", filter_complex,
        "-map", "[finalV]", "-map", "[finalA]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-pix_fmt", "yuv420p", "-r", "30",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        out_path
    ]

    r = subprocess.run(cmd, capture_output=True, text=True, errors="replace")
    if r.returncode != 0:
        raise RuntimeError(f"Render failed [{out_path}]: {r.stderr[-800:]}")

    try:
        os.remove(ass_path)
    except:
        pass

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    test_mode = "--test" in sys.argv
    workers   = 2
    for i, a in enumerate(sys.argv):
        if a.startswith("--workers="):
            workers = int(a.split("=")[1])
        elif a == "--workers" and i+1 < len(sys.argv):
            workers = int(sys.argv[i+1])

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(TEMP_HOOKS, exist_ok=True)
    os.makedirs(TEMP_ASS,   exist_ok=True)

    # Collect hooks
    hooks = []
    for f in sorted(os.listdir(HOOKS_DIR)):
        if not f.endswith(".mp4"):
            continue
        stem = os.path.splitext(f)[0]
        if stem not in ARTIST_INITIALS:
            log(f"WARNING: No initials for hook '{stem}' — skipping")
            continue
        hooks.append((stem, os.path.join(HOOKS_DIR, f)))

    # Collect SDLF content videos
    contents = sorted([f for f in os.listdir(CONTENT_DIR) if f.endswith(".mp4")])

    total_combos = len(hooks) * len(contents)
    print(f"Hooks: {len(hooks)} | SDLF Content: {len(contents)} | Combos: {total_combos}")

    # Step 1: speed up hooks (skip if already cached from MH batch)
    print("\n=== Pre-processing hooks at 1.1x ===")
    for stem, hook_path in hooks:
        fast_path = os.path.join(TEMP_HOOKS, stem + "_fast.mp4")
        speedup_hook(stem, hook_path, fast_path)

    # Build job list
    jobs = []
    for stem, _ in hooks:
        initials  = ARTIST_INITIALS[stem]
        fast_path = os.path.join(TEMP_HOOKS, stem + "_fast.mp4")
        hook_dur  = get_duration(fast_path)

        for content_file in contents:
            content_name = os.path.splitext(content_file)[0]
            out_name = f"{initials}-SDLF-SMOG-{content_name}.mp4"
            out_path = os.path.join(OUTPUT_DIR, out_name)

            if os.path.exists(out_path):
                continue  # skip already rendered

            jobs.append({
                "hook_fast":    fast_path,
                "hook_dur":     hook_dur,
                "content_path": os.path.join(CONTENT_DIR, content_file),
                "out_path":     out_path,
                "label":        out_name,
            })

    if test_mode:
        jobs = jobs[:1]
        print(f"\n=== TEST MODE: 1 video ===")
        print(f"  Output: {jobs[0]['out_path']}")

    total = len(jobs)
    done  = [0]
    errors = []

    print(f"\n=== Rendering {total} videos (workers={workers}) ===\n")

    def run_job(j):
        try:
            render_combo(j["hook_fast"], j["hook_dur"], j["content_path"], j["out_path"])
            done[0] += 1
            log(f"[{done[0]}/{total}] OK: {j['label']}")
        except Exception as e:
            errors.append(j["label"])
            log(f"[ERROR] {j['label']}: {e}")

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(run_job, j): j for j in jobs}
        for _ in as_completed(futures):
            pass

    print(f"\nDONE: {done[0]}/{total} rendered. Errors: {len(errors)}")
    if errors:
        print("Errors:")
        for e in errors:
            print(f"  - {e}")

    if os.path.isdir(TEMP_ASS) and not os.listdir(TEMP_ASS):
        shutil.rmtree(TEMP_ASS, ignore_errors=True)

if __name__ == "__main__":
    main()
