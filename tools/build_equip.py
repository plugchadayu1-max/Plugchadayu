# ไอคอนอุปกรณ์จากภาพต้นฉบับ (start 071069\อุปกรณ์) -> equip_icons.js (window.EQUIP_IMG[key] = data URI webp)
import os, io, base64, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = r"D:\2.SCHOOL\start 071069\อุปกรณ์"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "equip_icons.js")
SIZE = 128


def items_of(path, n):
    im = Image.open(path).convert("RGB")
    a = np.asarray(im).astype(int)
    white = (a.min(axis=2) > 232)
    lab, k = ndi.label(white)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    big = [i for i in range(1, k + 1) if (lab == i).sum() > 1500]   # ช่องขาวใหญ่ในห่วง (แหวน สร้อย ธนู) ก็ลบด้วย
    bg = np.isin(lab, list(border) + big)
    fg = ~bg
    fg = ndi.binary_opening(fg, iterations=1)
    merged = ndi.binary_dilation(fg, iterations=22)
    L, m = ndi.label(merged)
    sizes = ndi.sum(fg, L, range(1, m + 1))
    keep = [i + 1 for i in np.argsort(sizes)[::-1][:n]]
    boxes = []
    for i in keep:
        ys, xs = np.where((L == i) & fg)
        boxes.append((xs.min(), ys.min(), xs.max(), ys.max(), i))
    rgba = np.dstack([a.astype(np.uint8), (fg * 255).astype(np.uint8)])
    full = Image.fromarray(rgba, "RGBA")
    out = []
    for x0, y0, x1, y1, i in boxes:
        mask = (L == i)
        r = rgba.copy(); r[~mask, 3] = 0
        out.append(((x0, y0), Image.fromarray(r, "RGBA").crop((x0, y0, x1 + 1, y1 + 1))))
    return out


def fit(img):
    bb = img.getchannel("A").getbbox(); img = img.crop(bb)
    k = (SIZE - 4) / max(img.size)
    img = img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)
    c = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    c.paste(img, ((SIZE - img.width) // 2, (SIZE - img.height) // 2), img)
    return c


def uri(img):
    b = io.BytesIO(); img.save(b, "WEBP", quality=90)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()


def rows(items, per_row):
    # เรียงตามแถว (บน->ล่าง) แล้วซ้าย->ขวา
    items = sorted(items, key=lambda t: t[0][1])
    out = []
    for r in range(0, len(items), per_row):
        out += sorted(items[r:r + per_row], key=lambda t: t[0][0])
    return [im for _, im in out]


gear = rows(items_of(os.path.join(SRC, "Gemini_Generated_Image_h30hz8h30hz8h30h.jpg"), 8), 4)
wpn = sorted(items_of(os.path.join(SRC, "Gemini_Generated_Image_h30hz8h30hz8h30h (1).jpg"), 5), key=lambda t: t[0][0])
wpn = [im for _, im in wpn]
names_g = ["helmet", "armor", "cape", "charm", "gloves", "boots", "ring", "necklace"]
names_w = ["w_sword", "w_bow", "w_orb", "w_gun", "w_wing"]
D = {}
prev = Image.new("RGBA", (SIZE * 13, SIZE), (120, 120, 140, 255))
for i, (n, im) in enumerate(list(zip(names_g, gear)) + list(zip(names_w, wpn))):
    f = fit(im); D[n] = uri(f); prev.paste(f, (i * SIZE, 0), f)
D["w_gloves"] = D["gloves"]
prev.save(os.path.join(os.environ.get("TEMP", "."), "equip_preview.png"))
open(OUT, "w", encoding="utf-8").write("window.EQUIP_IMG=" + json.dumps(D) + ";\n")
print(len(D), os.path.getsize(OUT) // 1024, "KB")
