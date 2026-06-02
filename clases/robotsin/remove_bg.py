from PIL import Image
import numpy as np
from collections import deque
import os

BASE = r"C:\Users\Usuario\JhonyKingAI_Remotion\robotsin"

MAPPING = [
    ("ChatGPT Image 1 jun 2026, 12_31_02 a.m. (1).png", "robotsin_artista.png"),
    ("ChatGPT Image 1 jun 2026, 12_31_02 a.m. (2).png", "robotsin_arquitecto.png"),
    ("ChatGPT Image 1 jun 2026, 12_31_06 a.m. (3).png", "robotsin_escritor.png"),
    ("ChatGPT Image 1 jun 2026, 12_31_10 a.m. (4).png", "robotsin_director.png"),
    ("ChatGPT Image 1 jun 2026, 12_31_15 a.m. (5).png", "robotsin_musico.png"),
    ("ChatGPT Image 1 jun 2026, 12_31_19 a.m. (6).png", "robotsin_maestro.png"),
]

def remove_white_bg(input_path, output_path, tolerance=40):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img, dtype=np.int32)
    h, w = data.shape[:2]

    alpha = np.ones((h, w), dtype=np.uint8) * 255
    visited = np.zeros((h, w), dtype=bool)

    # background color sampled from top-left corner (white)
    bg = data[0, 0, :3]

    queue = deque()
    # seed from all 4 corners + top/bottom/left/right edges at intervals
    seeds = [(0,0),(0,w-1),(h-1,0),(h-1,w-1)]
    for y in range(0, h, 10):
        seeds += [(y,0),(y,w-1)]
    for x in range(0, w, 10):
        seeds += [(0,x),(h-1,x)]

    for y, x in seeds:
        if not visited[y, x]:
            visited[y, x] = True
            queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        pixel = data[y, x, :3]
        dist = int(np.max(np.abs(pixel - bg)))
        if dist <= tolerance:
            alpha[y, x] = 0
            for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    result = np.array(img)
    result[:,:,3] = alpha
    out_img = Image.fromarray(result.astype(np.uint8))
    out_img.save(output_path)
    print(f"OK: {os.path.basename(output_path)}")

for src_name, dst_name in MAPPING:
    src = os.path.join(BASE, src_name)
    dst = os.path.join(BASE, dst_name)
    remove_white_bg(src, dst)

# Robotsin completo (todas las herramientas)
remove_white_bg(
    os.path.join(BASE, "ChatGPT Image 1 jun 2026, 12_57_26 a.m..png"),
    os.path.join(BASE, "robotsin_completo.png")
)

print("Listo. 7 imagenes procesadas.")
