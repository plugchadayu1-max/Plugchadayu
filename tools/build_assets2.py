# อัปเดตภาพ: โพชั่น EXP / มอนสเตอร์ 3 ชุด (ชุดละ 10 แบบ) / ร้านค้า-อาคาร-ปราสาท / NPC / เหยื่อตกปลา / บ่อตกปลา
# ต้นฉบับ: D:\2.SCHOOL\start 071069\...  ->  ผลลัพธ์ในโฟลเดอร์เกม: art2\*.webp, mon2\*.webp, castle.png, mon2_sprites.js, art2_assets.js
import os, io, json, base64, sys
import numpy as np
from PIL import Image, ImageEnhance
from scipy import ndimage as ndi

SRC = r"D:\2.SCHOOL\start 071069"
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A2 = os.path.join(G, "art2"); M2 = os.path.join(G, "mon2")
os.makedirs(A2, exist_ok=True); os.makedirs(M2, exist_ok=True)
PREV = os.path.join(os.environ.get("TEMP", "."), "assets2_preview"); os.makedirs(PREV, exist_ok=True)


def cutout(im):
    """ตัดพื้นขาว (ส่วนที่ติดขอบภาพ) ให้โปร่งใสแบบนุ่ม — พื้นที่ขาวภายในตัวภาพคงไว้"""
    if im.mode in ("RGBA", "LA", "P"):      # ต้นฉบับมีช่องโปร่งใส: วางบนพื้นขาวก่อน
        im = im.convert("RGBA"); w = Image.new("RGB", im.size, (255, 255, 255)); w.paste(im, mask=im.getchannel("A")); im = w
    a = np.asarray(im.convert("RGB")).astype(int)
    m = a.min(axis=2)
    near = m > 200
    lab, _ = ndi.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    big = [i for i in range(1, lab.max() + 1) if (lab == i).sum() > 4000 and i not in edge]
    bg = np.isin(lab, list(edge) + big)
    zone = ndi.binary_dilation(bg, iterations=5)
    soft = np.clip((236 - m) / 36.0, 0, 1)
    alpha = np.where(zone, soft, 1.0)
    alpha[bg & (m > 232)] = 0
    return Image.fromarray(np.dstack([a.astype(np.uint8), (alpha * 255).astype(np.uint8)]), "RGBA")


def comps(rgba, n, min_h_frac=0.08, dil=14):
    """แยกชิ้นงานด้วย connected component ของแอลฟา → [(bbox, RGBA crop)] เรียงตามแถว/ซ้าย→ขวา"""
    al = np.asarray(rgba.getchannel("A")) > 40
    merged = ndi.binary_dilation(al, iterations=dil)
    lab, k = ndi.label(merged)
    H = al.shape[0]; out = []
    for i in range(1, k + 1):
        ys, xs = np.where((lab == i) & al)
        if len(ys) == 0: continue
        h = ys.max() - ys.min() + 1
        if h < H * min_h_frac: continue
        out.append((len(ys), (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1), i))
    out.sort(reverse=True); out = out[:n]
    arr = np.asarray(rgba).copy(); res = []
    for _, bb, i in out:
        r = arr.copy(); r[lab != i, 3] = 0
        res.append((bb, Image.fromarray(r, "RGBA").crop(bb)))
    return res


def ordered(items, per_row):
    items = sorted(items, key=lambda t: (t[0][1] + t[0][3]) / 2)
    out = []
    for r in range(0, len(items), per_row):
        out += sorted(items[r:r + per_row], key=lambda t: t[0][0])
    return out


def fit_box(img, w, h):
    bb = img.getchannel("A").getbbox(); img = img.crop(bb)
    k = min(w / img.width, h / img.height)
    return img.resize((max(1, round(img.width * k)), max(1, round(img.height * k))), Image.LANCZOS)


def webp_uri(img, q=88):
    b = io.BytesIO(); img.save(b, "WEBP", quality=q)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()


def save_webp(img, path, q=88):
    img.save(path, "WEBP", quality=q)


def montage(imgs, name, cell=200, cols=10):
    rows = (len(imgs) + cols - 1) // cols
    m = Image.new("RGBA", (cols * cell, rows * cell), (110, 110, 130, 255))
    for i, im in enumerate(imgs):
        t = fit_box(im, cell - 8, cell - 8); m.paste(t, ((i % cols) * cell + (cell - t.width) // 2, (i // cols) * cell + (cell - t.height) // 2), t)
    m.save(os.path.join(PREV, name))


OUT = {}   # art2_assets.js


# ---------------- โพชั่น EXP ----------------
def potions():
    im = cutout(Image.open(os.path.join(SRC, "โพชั่น", "Gemini_Generated_Image_sxw3pmsxw3pmsxw3.jpg")))
    its = sorted(comps(im, 2, 0.3, 30), key=lambda t: t[0][0])
    for key, (_, c) in zip(["pot_exp15", "pot_exp2"], its):
        OUT[key] = webp_uri(fit_box(c, 160, 160), 90)
    montage([c for _, c in its], "potions.png", 260, 2)


# ---------------- เหยื่อตกปลา ----------------
def baits():
    im = cutout(Image.open(os.path.join(SRC, "เหยื่อตกปลา", "Gemini_Generated_Image_4tpub74tpub74tpu.jpg")))
    figs = anchored(im, [(.2, .3), (.5, .3), (.8, .3), (.2, .78), (.5, .78), (.8, .78)], 0.004)
    names = ["bait0", "bait1", "bait2", "bait3", "bait4", "bait5"]
    for n, c in zip(names, figs): OUT[n] = webp_uri(fit_box(c, 96, 96), 90)
    montage(figs, "baits.png", 200, 6)


# ---------------- NPC (2 ท่า) ----------------
def npcs():
    im = cutout(Image.open(os.path.join(SRC, "NPC", "Gemini_Generated_Image_e8spuce8spuce8sp.jpg")))
    xs = [.135, .325, .515, .69, .87]
    # แถวบน: พ่อค้ากับเทพีเอลินติดกัน → ตัดที่คอลัมน์ที่มีพิกเซลน้อยที่สุดระหว่าง x=.68-.78
    arr = np.asarray(im).copy(); H, W = arr.shape[:2]
    top = arr[: int(H * .5), :, 3] > 235
    c0, c1 = int(W * .56), int(W * .70)
    prof = top[:, c0:c1].sum(axis=0)
    z = np.where(prof == 0)[0]
    cut = c0 + (int(z.mean()) if len(z) else int(np.argmin(prof)))
    arr[: int(H * .5), cut:cut + 12, 3] = 0
    c0, c1 = int(W * .72), int(W * .79)
    cut = c0 + int(np.argmin(top[:, c0:c1].sum(axis=0)))
    arr[: int(H * .5), cut:cut + 12, 3] = 0
    im = Image.fromarray(arr, "RGBA")
    figs = anchored(im, [(x, .3) for x in xs] + [(x, .75) for x in xs])
    ids = ["smith", "guide", "fisher", "merchant", "goddess"]
    for i, c in enumerate(figs):
        row, col = divmod(i, 5)       # row 0 = ครึ่งตัว (ใช้เป็นรูปตอนคุย) , row 1 = เต็มตัว (ใช้ในฉาก)
        OUT["npc_%s_%d" % (ids[col], row)] = webp_uri(fit_box(c, 220, 280), 88)
    montage(figs, "npcs.png", 220, 5)


# ---------------- อาคาร ----------------
def buildings():
    im = cutout(Image.open(os.path.join(SRC, "ร้านค้า", "Screenshot 2026-10-16 195907.png")))
    figs = anchored(im, [(.25, .28), (.75, .28), (.25, .75), (.75, .75)], 0.003)
    names = ["bld_smith", "bld_hut", "bld_house", "bld_shrine"]
    for n, c in zip(names, figs): OUT[n] = webp_uri(fit_box(c, 420, 320), 88)
    montage(figs, "buildings.png", 300, 4)
    shop = cutout(Image.open(os.path.join(SRC, "ร้านค้า", "Gemini_Generated_Image_843lvr843lvr843l.jpg")))
    shop = fit_box(shop, 760, 600); OUT["bld_shop"] = webp_uri(shop, 88); montage([shop], "shop.png", 500, 1)
    cas = cutout(Image.open(os.path.join(SRC, "ร้านค้า", "Gemini_Generated_Image_kd5i5okd5i5okd5i.jpg")))
    cas = fit_box(cas, 648, 490)
    old = os.path.join(G, "castle_old.png")
    if not os.path.exists(old) and os.path.exists(os.path.join(G, "castle.png")):
        Image.open(os.path.join(G, "castle.png")).save(old)
    cas.save(os.path.join(G, "castle.png"), optimize=True)
    # ฉากหลังหน้าเริ่มเกม
    bg = Image.open(os.path.join(SRC, "ร้านค้า", "Gemini_Generated_Image_rv5gswrv5gswrv5g.jpg")).convert("RGB")
    bg = bg.crop((0, 0, bg.width, int(bg.height * 0.945))); bg.thumbnail((1400, 1400))
    bg.save(os.path.join(A2, "bg_castle.webp"), "WEBP", quality=80)


# ---------------- บ่อตกปลา ----------------
def pond():
    im = Image.open(os.path.join(SRC, "map", "Screenshot 2026-10-16 195844.png")).convert("RGB")
    im.thumbnail((900, 900)); im.save(os.path.join(A2, "pond.webp"), "WEBP", quality=82)


# ---------------- ของประดับทะเลทราย (ตัดจากภาพแมพไอโซเมตริกสีส้ม ด้วยหน้ากากสี) ----------------
def props():
    im = Image.open(os.path.join(SRC, "map", "Gemini_Generated_Image_ri162mri162mri16.jpg")).convert("RGB")
    a = np.asarray(im).astype(int); H, W = a.shape[:2]
    s = 1.26   # พิกัดที่ดูจากภาพย่อ ×1.26
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(axis=2), a.min(axis=2)
    sat = (mx - mn) / np.maximum(mx, 1)
    green = (g > r + 8) & (g > b + 25)
    dark = mx < 100
    bone = (sat < .32) & (mx > 175)
    # (ชื่อ, กรอบ x0,y0,x1,y1 ในภาพย่อ, เงื่อนไขสี, ความกว้างบนฉาก(พิกเซลอาร์ต))
    spec = [("prop_cactus", (20, 225, 215, 430), green | dark, 22),
            ("prop_crysG1", (110, 1405, 275, 1555), green | dark, 22),
            ("prop_crysG2", (1075, 1430, 1265, 1605), green | dark, 26),
            ("prop_bush2", (600, 1610, 905, 1850), dark, 30),
            ("prop_tree", (880, 40, 1225, 570), dark, 48),
            ("prop_chest", (185, 985, 315, 1080), dark, 16)]
    out = []
    for name, (x0, y0, x1, y1), m, wa in spec:
        x0, y0, x1, y1 = int(x0 * s), int(y0 * s), int(x1 * s), int(y1 * s)
        sub = m[y0:y1, x0:x1]
        sub = ndi.binary_closing(sub, iterations=2)
        sub = ndi.binary_fill_holes(sub)
        lab, k = ndi.label(sub)
        if k == 0: print("empty", name); continue
        sizes = ndi.sum(sub, lab, range(1, k + 1)); keep = lab == (1 + int(np.argmax(sizes)))
        keep = ndi.binary_dilation(keep, iterations=2)
        rgba = np.dstack([a[y0:y1, x0:x1].astype(np.uint8), (keep * 255).astype(np.uint8)])
        img = Image.fromarray(rgba, "RGBA"); bb = img.getchannel("A").getbbox(); img = img.crop(bb)
        k2 = min(1, 240 / max(img.size)); img = img.resize((max(1, round(img.width * k2)), max(1, round(img.height * k2))), Image.LANCZOS)
        OUT[name] = webp_uri(img, 88); OUT[name + "_w"] = wa; out.append(img)
    montage(out, "props.png", 160, 8)


# ---------------- มอนสเตอร์ ----------------
CELL = 192; ANCH = (96, 184); SC = 0.26
SETS = {
    "a": dict(file=("มอนสเตอร์", "Gemini_Generated_Image_w3fidew3fidew3fi.jpg"),
              names=["ลูกไฟจิ๋ว", "เห็ดม่วงจอมซน", "โกเลมมอสน้อย", "มังกรน้อยป่า", "เอลฟ์ใบไม้", "เมฆฟ้าคะนอง", "ลูกเจี๊ยบอัศวิน", "โคมไฟตาเดียว", "สิงโตหน้ากากแดง", "กระต่ายอัศวิน"],
              fit=[100, 125, 150, 125, 125, 100, 100, 125, 125, 125], left=[3]),
    "b": dict(file=("มอนสเตอร์", "Gemini_Generated_Image_r4alavr4alavr4al.jpg"),
              names=["สไลม์ลาวาเดือด", "เห็ดพิษกลายพันธุ์", "โกเลมหินโบราณ", "มังกรแดว", "วิญญาณป่าไม้", "เมฆพายุคลั่ง", "ลูกเจี๊ยบนักรบเถื่อน", "โคมไฟปีศาจ", "สิงโตหน้ากากคาบูกิ", "กระต่ายปีศาจ"],
              fit=[125, 125, 150, 150, 150, 125, 125, 125, 150, 125], left=[3]),
    "c": dict(file=("มอนสเตอร์", "Gemini_Generated_Image_ot2e01ot2e01ot2e.jpg"),
              names=["แมลงปีกอเวจี", "ออร์คขวานเลือด", "หมาป่าเงาม่วง", "ภูตเพลิงโกรธา", "พืชกินคนน้ำลายพิษ", "โกเลมลาวาเพลิง", "อินทรีทมิฬ", "ฉลามเกราะหิน", "อัศวินโครงกระดูกไฟฟ้า", "ไฮดราสามหัว"],
              fit=[150, 150, 125, 125, 150, 150, 150, 150, 150, 150], left=[2, 4, 6, 7]),
}


def tf(fig, sx=1, sy=1, rot=0, dx=0, dy=0, alpha=1.0, flash=0.0):
    w, h = max(1, round(fig.width * sx)), max(1, round(fig.height * sy))
    f = fig.resize((w, h), Image.BICUBIC)
    T = Image.new("RGBA", (CELL * 2, CELL * 2), (0, 0, 0, 0))
    T.paste(f, (CELL - w // 2, CELL - h), f)
    if rot: T = T.rotate(rot, resample=Image.BICUBIC, center=(CELL, CELL))
    out = T.crop((CELL - (ANCH[0] + int(dx)), CELL - (ANCH[1] + int(dy)), CELL * 2 - (ANCH[0] + int(dx)), CELL * 2 - (ANCH[1] + int(dy))))
    if alpha < 1:
        a = out.getchannel("A").point(lambda v: int(v * alpha)); out.putalpha(a)
    if flash:
        rgb = ImageEnhance.Brightness(out.convert("RGB")).enhance(1 + flash)
        rgb = rgb.convert("RGBA"); rgb.putalpha(out.getchannel("A")); out = rgb
    return out


ANIM = {   # (sx, sy, rot, dx, dy, alpha, flash) — ท่าหันขวา; ซ้ายกลับ dx/rot
    "idle": [(1, 1, 0, 0, 0), (.985, 1.03, 0, 0, 0), (1, 1, 0, 0, 0), (1.015, .97, 0, 0, 0)],
    "walk": [(1, 1, -3, 0, 0), (1.02, .98, 0, 0, -6), (1, 1, 3, 0, 0), (1.02, .98, 0, 0, -6)],
    "attack": [(1.02, .96, -7, -6, 0), (1.04, .93, -10, -12, 0), (.95, 1.05, 7, 22, -4), (.98, 1.02, 4, 14, 0), (1, 1, 0, 0, 0)],
    "hurt": [(.96, 1.02, -9, -10, 0, 1, .5), (.99, 1, -4, -4, 0, 1, .2)],
    "death": [(1, 1, 0, 0, 0, 1), (1, .98, 8, -2, 0, 1), (1, .95, 22, -4, 2, .95), (1, .9, 48, -6, 6, .8), (1, .8, 78, -8, 12, .55), (1, .7, 88, -8, 16, .2)],
}
LAYOUT = [("idle", 4), ("walk", 4), ("attack", 5), ("hurt", 2), ("death", 6)]


def make_sheet(fig, face_left):
    fr = []
    for anim, n in LAYOUT:
        for side in ("right", "left"):
            src = fig
            flip = (side == "left") != face_left       # ภาพต้นฉบับหันซ้าย → ท่าหันขวาต้องกลับ
            if flip: src = fig.transpose(Image.FLIP_LEFT_RIGHT)
            sgn = 1 if side == "right" else -1
            for p in ANIM[anim][:n]:
                p = tuple(p) + (1,) * (7 - len(p)) if len(p) < 5 else tuple(p)
                sx, sy, rot, dx, dy = p[:5]; al = p[5] if len(p) > 5 else 1; fl = p[6] if len(p) > 6 else 0
                fr.append(tf(src, sx, sy, -rot * sgn, dx * sgn, dy, al, fl))
    cols, rows = 7, 6
    sheet = Image.new("RGBA", (cols * CELL, rows * CELL), (0, 0, 0, 0))
    for i, f in enumerate(fr): sheet.paste(f, ((i % cols) * CELL, (i // cols) * CELL))
    return sheet


ANCHORS = {   # ตำแหน่งกึ่งกลางโดยประมาณ (สัดส่วนภาพ) ของมอนสเตอร์แต่ละตัว — จัดชิ้นส่วนเข้าตัวที่ใกล้ที่สุด
    "a": None,
    "b": [(.115, .30), (.32, .27), (.515, .28), (.71, .25), (.895, .27), (.12, .77), (.32, .78), (.525, .77), (.715, .78), (.9, .74)],
    "c": [(.135, .20), (.35, .25), (.61, .28), (.87, .18), (.135, .73), (.355, .76), (.565, .67), (.875, .52), (.69, .80), (.88, .78)],
}


def anchored(rgba, anchors, min_frac=0.0015):
    al = np.asarray(rgba.getchannel("A")) > 40
    H, W = al.shape
    lab, k = ndi.label(ndi.binary_dilation(al, iterations=2))
    arr = np.asarray(rgba).copy(); groups = [np.zeros((H, W), bool) for _ in anchors]
    for i in range(1, k + 1):
        m = (lab == i) & al; n = int(m.sum())
        if n < min_frac * W * H: continue
        ys, xs = np.where(m); cx, cy = xs.mean() / W, ys.mean() / H
        j = min(range(len(anchors)), key=lambda q: (anchors[q][0] - cx) ** 2 + (anchors[q][1] - cy) ** 2)
        groups[j] |= m
    res = []
    for g in groups:
        ys, xs = np.where(g); r = arr.copy(); r[~g, 3] = 0
        res.append(Image.fromarray(r, "RGBA").crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)) if len(ys) else None)
    return res


def monsters():
    meta = {}; formnames = {}
    prev = []
    for sk, S in SETS.items():
        im = cutout(Image.open(os.path.join(SRC, *S["file"])))
        figs = anchored(im, ANCHORS[sk]) if ANCHORS[sk] else [c for _, c in ordered(comps(im, 10, 0.11, 10), 5)]
        if len(figs) != 10 or any(f is None for f in figs): print("!! set", sk, "found", len(figs))
        for i, c in enumerate(figs[:10]):
            fig = fit_box(c, 170, S["fit"][i])
            key = "m2_%s%d" % (sk, i)
            sheet = make_sheet(fig, i in S["left"])
            save_webp(sheet, os.path.join(M2, key + ".webp"), 82)
            body = round(fig.height * SC)
            anims = {"idle": {"right": [0, 1, 2, 3], "left": [4, 5, 6, 7]}, "walk": {"right": [8, 9, 10, 11], "left": [12, 13, 14, 15]},
                     "attack": {"right": [16, 17, 18, 19, 20], "left": [21, 22, 23, 24, 25]}, "hurt": {"right": [26, 27], "left": [28, 29]},
                     "death": {"right": [30, 31, 32, 33, 34, 35], "left": [36, 37, 38, 39, 40, 41]}}
            meta[key] = {"img": "mon2/%s.webp" % key, "cw": CELL, "ch": CELL, "cols": 7, "rows": 6, "pixel": False,
                         "foot": round(ANCH[1] / CELL, 4), "cx": 0.5, "body": body, "scale": SC, "anims": anims}
            formnames[key] = S["names"][i]; prev.append(fig)
    montage(prev, "monsters.png", 190, 10)
    js = "// สร้างจาก tools/build_assets2.py — ภาพมอนสเตอร์ใหม่ 3 ชุด (Lv1-50 / 51-100 / 101-150) ชุดละ 10 แบบ\nwindow.SPRITES=Object.assign(window.SPRITES||{},%s);\nwindow.MON2={names:%s};\n" % (
        json.dumps(meta, ensure_ascii=False), json.dumps(formnames, ensure_ascii=False))
    open(os.path.join(G, "mon2_sprites.js"), "w", encoding="utf-8").write(js)


if __name__ == "__main__":
    which = sys.argv[1:] or ["potions", "baits", "npcs", "buildings", "pond", "monsters"]
    for w in which: globals()[w](); print("done", w)
    if OUT:
        old = {}
        p = os.path.join(G, "art2_assets.js")
        if os.path.exists(p):
            t = open(p, encoding="utf-8").read(); i = t.index("{"); old = json.loads(t[i:t.rindex("}") + 1])
        old.update(OUT)
        open(p, "w", encoding="utf-8").write("window.ART2=" + json.dumps(old) + ";\n")
        print(len(old), "assets", os.path.getsize(p) // 1024, "KB")



