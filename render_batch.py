#!/usr/bin/env python3
"""
Batch render 986 videos: hook(1.1x) + content + CTA overlay
Usage:
  python render_batch.py          # render all
  python render_batch.py --test   # render 1 combination only
  python render_batch.py --workers 3  # parallel workers (default 2)
"""
import os, re, sys, subprocess, shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

# ─── PATHS ────────────────────────────────────────────────────────────────────
FFMPEG   = r"C:\Users\Usuario\JhonyKingAI_Remotion\node_modules\@ffmpeg-installer\win32-x64\ffmpeg.exe"
BASE     = r"C:\Users\Usuario\JhonyKingAI_Remotion\public\MATERIALES"
HOOKS_DIR   = os.path.join(BASE, "VIDEOS GANCHOS SI A TI TE GUSTA")
CONTENT_DIR = os.path.join(BASE, "VIDEOS CONTENIDO CENTRAL")
CTA_AUDIO   = os.path.join(BASE, "AUDIO CALL TO ACTION HABITOS.mp3")
OUTPUT_DIR  = os.path.join(BASE, "VIDEOS RENDERIZADOS POR CLAUDE")
TEMP_HOOKS  = os.path.join(BASE, "_TEMP_HOOKS_1.1x")
TEMP_ASS    = os.path.join(BASE, "_TEMP_ASS")

CTA_DURATION    = 2.59   # seconds
DUCK_VOLUME     = 0.15   # 15% original audio during CTA (heavily ducked)
CTA_BOOST       = 2.5    # boost CTA audio volume
FADE_DUR        = 0.35   # transition fade duration (seconds)

# ─── ARTIST INITIALS ──────────────────────────────────────────────────────────
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

# ─── CTA WORD GROUPS (3 words each) ───────────────────────────────────────────
# Each group: (start_cs_rel, end_cs_rel, [(word, duration_cs), ...])
CTA_GROUPS = [
    (0,   70,  [("Comenta", 32), ("la", 12), ("palabra", 26)]),
    (70,  154, [('"HÁBITOS"', 62), ("y",  14), ("te",      8)]),
    (154, 259, [("mando",   24), ("mi", 10), ("música.", 71)]),
]

# ─── HELPERS ──────────────────────────────────────────────────────────────────
print_lock = Lock()

def log(msg):
    with print_lock:
        print(msg, flush=True)

def get_duration(filepath):
    """Return video duration in seconds."""
    r = subprocess.run([FFMPEG, "-i", filepath], capture_output=True, text=True, errors="replace")
    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", r.stderr)
    if m:
        return int(m.group(1))*3600 + int(m.group(2))*60 + float(m.group(3))
    raise RuntimeError(f"Could not get duration of: {filepath}")

def cs_to_ass(total_cs):
    """Centiseconds → ASS timestamp H:MM:SS.cc"""
    h  = total_cs // 360000; total_cs %= 360000
    mi = total_cs // 6000;   total_cs %= 6000
    s  = total_cs // 100;    cs = total_cs % 100
    return f"{h}:{mi:02d}:{s:02d}.{cs:02d}"

def generate_ass(cta_start_sec, ass_path):
    """Write ASS subtitle file for CTA starting at cta_start_sec."""
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
    # Two-layer approach:
    # Layer 0 CTABG: invisible text, soft grey semi-transparent box (BorderStyle=3)
    # Layer 1 CTA:   white text with red outline (BorderStyle=1), no background
    # Both centered (Alignment=5), same font size → box perfectly fits text
    events = []
    for (rel_start, rel_end, words) in CTA_GROUPS:
        t_start = cs_to_ass(cta_cs + rel_start)
        t_end   = cs_to_ass(cta_cs + rel_end)
        plain_text   = " ".join(w for w, _ in words)
        karaoke_text = " ".join(f"{{\\kf{dur}}}{word}" for word, dur in words)
        # Layer 0: grey background box (invisible text)
        events.append(f"Dialogue: 0,{t_start},{t_end},CTABG,,0,0,0,,{plain_text}")
        # Layer 1: white text with red outline + karaoke highlight
        events.append(f"Dialogue: 1,{t_start},{t_end},CTA,,0,0,0,,{karaoke_text}")

    with open(ass_path, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")

def esc_ass_path(p):
    """Escape path for FFmpeg subtitles filter (Windows)."""
    # Replace backslashes, escape colons except drive letter colon
    p = p.replace("\\", "/")
    # FFmpeg subtitles filter needs drive colon escaped
    p = p.replace(":", "\\:")
    return p

# ─── STEP 1: PRE-RENDER SPED-UP HOOKS ─────────────────────────────────────────
def speedup_hook(hook_name, hook_path, out_path):
    if os.path.exists(out_path):
        log(f"  [SKIP] Hook already exists: {hook_name}")
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
def render_combo(hook_fast_path, hook_dur, content_path, content_name, initials, out_path):
    content_dur  = get_duration(content_path)
    cta_start    = hook_dur + content_dur - CTA_DURATION
    cta_delay_ms = int(cta_start * 1000)
    total_dur    = hook_dur + content_dur

    # Transition: fade to white at end of hook, fade in from white at start of content
    hook_fade_st = max(0.0, hook_dur - FADE_DUR)

    # Generate ASS for this combo
    ass_path = os.path.join(TEMP_ASS, f"{os.path.basename(out_path)}.ass")
    generate_ass(cta_start, ass_path)
    ass_esc  = esc_ass_path(ass_path)

    # Volume expression: duck original to 15% during CTA window
    vol_expr = f"if(between(t,{cta_start:.3f},{total_dur:.3f}),{DUCK_VOLUME},1.0)"

    filter_complex = (
        # video: fade hook out to white, fade content in from white, then concat
        f"[0:v]fade=t=out:st={hook_fade_st:.3f}:d={FADE_DUR:.3f}:color=white[hv];"
        f"[1:v]fade=t=in:st=0:d={FADE_DUR:.3f}:color=white[cv];"
        "[hv][cv]concat=n=2:v=1:a=0[outv];"
        # audio: fade hook audio out, fade content audio in, concat
        f"[0:a]aresample=44100,afade=t=out:st={hook_fade_st:.3f}:d={FADE_DUR:.3f}[ha];"
        f"[1:a]aresample=44100,afade=t=in:st=0:d={FADE_DUR:.3f}[ca];"
        "[ha][ca]concat=n=2:v=0:a=1[outa];"
        # duck original audio during CTA
        f"[outa]volume='{vol_expr}'[outa_duck];"
        # boost CTA audio and delay to its start point
        f"[2:a]aresample=44100,volume={CTA_BOOST},adelay={cta_delay_ms}|{cta_delay_ms}[cta_del];"
        # mix original (ducked) + CTA
        "[outa_duck][cta_del]amix=inputs=2:duration=first[finalA];"
        # burn CTA subtitles
        f"[outv]subtitles='{ass_esc}'[finalV]"
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

    # cleanup ASS
    try:
        os.remove(ass_path)
    except:
        pass

# ─── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    test_mode = "--test" in sys.argv
    workers   = 2
    for a in sys.argv:
        if a.startswith("--workers="):
            workers = int(a.split("=")[1])
        elif a == "--workers" and sys.argv.index(a)+1 < len(sys.argv):
            workers = int(sys.argv[sys.argv.index(a)+1])

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
            print(f"WARNING: No initials for hook '{stem}' — skipping")
            continue
        hooks.append((stem, os.path.join(HOOKS_DIR, f)))

    # Collect content videos
    contents = sorted([
        f for f in os.listdir(CONTENT_DIR) if f.endswith(".mp4")
    ])

    print(f"Hooks: {len(hooks)} | Content: {len(contents)} | Combos: {len(hooks)*len(contents)}")

    # Step 1: speed up all hooks
    print("\n=== Pre-processing hooks at 1.1x ===")
    for stem, hook_path in hooks:
        fast_path = os.path.join(TEMP_HOOKS, stem + "_fast.mp4")
        speedup_hook(stem, hook_path, fast_path)

    # Build job list
    jobs = []
    for stem, hook_path in hooks:
        initials  = ARTIST_INITIALS[stem]
        fast_path = os.path.join(TEMP_HOOKS, stem + "_fast.mp4")
        hook_dur  = get_duration(fast_path)

        for content_file in contents:
            content_name = os.path.splitext(content_file)[0]
            out_name = f"{initials}-MH-HABITOS-{content_name}.mp4"
            out_path = os.path.join(OUTPUT_DIR, out_name)

            if os.path.exists(out_path):
                continue  # skip already rendered

            jobs.append({
                "hook_fast":    fast_path,
                "hook_dur":     hook_dur,
                "content_path": os.path.join(CONTENT_DIR, content_file),
                "content_name": content_name,
                "initials":     initials,
                "out_path":     out_path,
                "label":        out_name,
            })

    if test_mode:
        jobs = jobs[:1]
        print(f"\n=== TEST MODE: rendering 1 video ===")
        print(f"  Output: {jobs[0]['out_path']}")

    total = len(jobs)
    done  = [0]
    errors = []

    print(f"\n=== Rendering {total} videos (workers={workers}) ===\n")

    def run_job(j):
        try:
            render_combo(
                j["hook_fast"], j["hook_dur"],
                j["content_path"], j["content_name"],
                j["initials"], j["out_path"]
            )
            done[0] += 1
            log(f"[{done[0]}/{total}] OK: {j['label']}")
        except Exception as e:
            errors.append(j["label"])
            log(f"[ERROR] {j['label']}: {e}")

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = {ex.submit(run_job, j): j for j in jobs}
        for _ in as_completed(futures):
            pass

    print(f"\n=== DONE: {done[0]}/{total} rendered ===")
    if errors:
        print(f"Errors ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")

    # Cleanup temp ASS dir
    if os.path.isdir(TEMP_ASS) and not os.listdir(TEMP_ASS):
        shutil.rmtree(TEMP_ASS, ignore_errors=True)

if __name__ == "__main__":
    main()
