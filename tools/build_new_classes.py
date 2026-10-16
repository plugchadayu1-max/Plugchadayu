# สร้างสไปรต์ 3 อาชีพ: นักมวย (hd_boxer), นักอัญเชิญสายฟ้า (hd_sumthunder), นักอัญเชิญความมืด (hd_sumdark) + ไอคอนสกิล
#   ชีตต้นฉบับ 5 เฟรม x 4 ทิศ (แถว 0 หน้า, 1 หลัง, 2 ขวา, 3 ซ้าย)
#   เฟรมที่ขีดกากบาทสีน้ำเงิน: ใช้รูปเดี่ยวตรงทิศแทน → ไม่มี: ซ้าย=กลับด้านจากขวา, ขวา=กลับด้านจากซ้าย, หน้า/หลัง=ใช้เฟรมใกล้เคียงในแถวเดียวกัน
# รัน: python game/tools/build_new_classes.py → game/newclass/*.png + game/newclass_sprites.js
import base64, io, json, os
import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
BOX = r"D:\2.SCHOOL\start 071069\นักมวย"
SUM = r"D:\2.SCHOOL\start 071069\นักอัญเชิญสายฟ้า + ความมืด"
OUT = os.path.join(GAME, "newclass")
CW, CH = 320, 176      # ช่องเฟรมในชีตเกม
SC = 0.8               # ย่อจากชีตต้นฉบับ (ที่ปรับกว้าง 1264 แล้ว)
DIRS = ["front", "back", "right", "left"]


def cutout(rgb):
    r, g, b = rgb.split()
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    mask = mn.point(lambda v: 0 if v > 228 else 255)
    W, H = mask.size
    for p in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1)]:
        if mask.getpixel(p) == 0: ImageDraw.floodfill(mask, p, 128)
    alpha = mask.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.MinFilter(3))
    out = rgb.copy(); out.putalpha(alpha)
    return out


def load_sheet(path):
    im = Image.open(path).convert("RGB")
    im = im.resize((1264, round(im.height * 1264 / im.width)), Image.LANCZOS)
    a = np.array(im).astype(int)
    blue = (a[:, :, 2] > 150) & (a[:, :, 0] < 100) & (a[:, :, 1] < 170) & (a[:, :, 2] - a[:, :, 0] > 80)
    blue = ndimage.binary_dilation(blue, iterations=2)
    a[blue] = 255
    return cutout(Image.fromarray(a.astype(np.uint8), "RGB"))


def frames_of(im):
    """แยก 20 เฟรม (4 แถว x 5 คอลัมน์): พิกเซลในช่อง + ชิ้นเอฟเฟกต์ที่ส่วนใหญ่อยู่ในช่องแต่ล้นไปช่องข้าง
    คืน out[r][c] = (ภาพ RGBA ตัดเหลือเนื้อหา, ตำแหน่ง x ของกึ่งกลางช่องในภาพนั้น, ภาพชิ้นใหญ่สุด) หรือ (None,0,None)"""
    rgba = np.array(im)
    a = rgba[:, :, 3] > 0
    ys, xs = np.nonzero(a)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    cw, ch = (x1 - x0) / 5, (y1 - y0) / 4
    H, W = a.shape
    lab, n = ndimage.label(ndimage.binary_dilation(a, iterations=2), structure=np.ones((3, 3)))
    gx = np.clip(((np.arange(W) - x0) // cw).astype(int), 0, 4)
    gy = np.clip(((np.arange(H) - y0) // ch).astype(int), 0, 3)
    cellid = gy[:, None] * 5 + gx[None, :]
    owner = np.full(n + 1, -1); sizes = np.zeros(n + 1, int)
    for l, sl in enumerate(ndimage.find_objects(lab), start=1):
        if sl is None: continue
        m = (lab[sl] == l) & a[sl]
        if not m.any(): continue
        owner[l] = int(np.bincount(cellid[sl][m], minlength=20).argmax()); sizes[l] = int(m.sum())
    own_px = owner[lab]
    out = [[None] * 5 for _ in range(4)]
    for r in range(4):
        for c in range(5):
            idc = r * 5 + c
            xa, xb = int(x0 + c * cw - .25 * cw), int(x0 + (c + 1) * cw + .25 * cw)
            ya, yb = int(y0 + r * ch), int(y0 + (r + 1) * ch)
            region = np.zeros((H, W), bool); region[ya:yb, max(0, xa):min(W, xb)] = True
            m = a & region & ((cellid == idc) | (own_px == idc))
            ccx = x0 + (c + .5) * cw
            core = np.zeros((H, W), bool); core[ya:yb, int(ccx - .2 * cw):int(ccx + .2 * cw)] = True
            keep = np.unique(lab[m & core]); keep = keep[keep > 0]
            m = m & np.isin(lab, keep)
            if not m.any():
                out[r][c] = (None, 0, None); continue
            yy, xx2 = np.nonzero(m)
            bx0, by0, bx1, by1 = xx2.min(), yy.min(), xx2.max() + 1, yy.max() + 1
            crop = rgba[by0:by1, bx0:bx1].copy(); crop[~m[by0:by1, bx0:bx1]] = 0
            ids = [l for l in np.unique(lab[m]) if l > 0]
            big = max(ids, key=lambda l: int((m & (lab == l) & core).sum())) if ids else None
            if big is not None:
                mb = m & (lab == big); yb2, xb2 = np.nonzero(mb)
                bc = rgba[yb2.min():yb2.max() + 1, xb2.min():xb2.max() + 1].copy()
                bc[~mb[yb2.min():yb2.max() + 1, xb2.min():xb2.max() + 1]] = 0
                bigimg = Image.fromarray(bc, "RGBA")
            else: bigimg = Image.fromarray(crop, "RGBA")
            out[r][c] = (Image.fromarray(crop, "RGBA"), ccx - bx0, bigimg)
    return out


def place(img, xoff):
    """วางเฟรม (ย่อ SC) ลงช่อง CWxCH: กึ่งกลางช่องเดิม = กึ่งกลางแนวนอน, ชิดล่าง"""
    out = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    if img is None: return out
    c = img.resize((max(1, round(img.width * SC)), max(1, round(img.height * SC))), Image.LANCZOS); xoff *= SC
    if c.height > CH - 3:
        k = (CH - 3) / c.height; c = c.resize((max(1, int(c.width * k)), CH - 3), Image.LANCZOS); xoff *= k
    # จัดให้ลำตัวอยู่กึ่งกลางช่อง: ใช้จุดศูนย์กลางมวลของช่วงล่าง 45% (ขา) ซึ่งนิ่งแม้แขน/เอฟเฟกต์ยื่นออกไป
    a = np.asarray(c.getchannel("A"))
    lo = a[int(a.shape[0] * .55):, :].astype(float)
    if lo.sum() > 0:
        xoff = float((lo.sum(axis=0) * np.arange(lo.shape[1])).sum() / lo.sum())
    x = int(round(CW / 2 - xoff)); x = max(0, min(CW - c.width, x))
    out.paste(c, (x, CH - 3 - c.height), c)
    return out


def single_frame(path, target_h):
    """รูปเดี่ยว → ตัดพื้นขาว ย่อให้สูงเท่าเนื้อหาของช่องที่ถูกขีด"""
    im = cutout(Image.open(path).convert("RGB"))
    bb = im.getchannel("A").getbbox(); im = im.crop(bb)
    k = target_h / im.height
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def build_sheet(path, crossed, singles):
    """คืน grid[r][c] = ภาพ RGBA CWxCH (แก้เฟรมที่ถูกขีดแล้ว)"""
    fr = frames_of(load_sheet(path))
    g = [[None] * 5 for _ in range(4)]
    for r in range(4):
        for c in range(5):
            if (r, c) in crossed: continue
            im, xo, _ = fr[r][c]
            g[r][c] = place(im, xo)
    for (r, c) in crossed:
        if (r, c) in singles:
            tgt = fr[r][c][0].height if fr[r][c][0] is not None else 190
            s = single_frame(singles[(r, c)], tgt)
            g[r][c] = place(s, s.width / 2)
    for (r, c) in crossed:
        if g[r][c] is not None: continue
        src = None
        if r == 3 and g[2][c] is not None and (2, c) not in crossed:
            src = g[2][c].transpose(Image.FLIP_LEFT_RIGHT)
        elif r == 2 and g[3][c] is not None and (3, c) not in crossed:
            src = g[3][c].transpose(Image.FLIP_LEFT_RIGHT)
        else:
            for d in range(1, 5):
                for cc in (c - d, c + d):
                    if 0 <= cc < 5 and g[r][cc] is not None and (r, cc) not in crossed: src = g[r][cc]; break
                if src is not None: break
        g[r][c] = src if src is not None else Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    return g


def icons_from(path, names):
    im = Image.open(path).convert("RGB"); W, H = im.size
    out = {}
    quads = [(0, 0), (W // 2, 0), (0, H // 2), (W // 2, H // 2)]   # TL TR BL BR
    for n, (qx, qy) in zip(names, quads):
        if n is None: continue
        q = im.crop((qx, qy, qx + W // 2, qy + H // 2))
        a = ImageChops.invert(q.convert("L")).point(lambda v: 255 if v > 40 else 0)
        bb = a.getbbox()
        if bb: q = q.crop(bb)
        q = q.resize((96, 96), Image.LANCZOS)
        buf = io.BytesIO(); q.save(buf, "WEBP", quality=88)
        out[n] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    return out


def save_class(key, rows_spec, meta_extra=None):
    """rows_spec: list ของ (anim, grid[r][c] หรือ [5 เฟรม x 4 ทิศ])"""
    rows = []
    for anim, frames_by_dir in rows_spec:
        for d in DIRS:
            rows.append((anim, d, frames_by_dir[d]))
    sheet = Image.new("RGBA", (CW * 5, CH * len(rows)), (0, 0, 0, 0))
    anims = {}
    for ri, (anim, d, fr) in enumerate(rows):
        for ci, f in enumerate(fr): sheet.paste(f, (ci * CW, ri * CH))
        anims.setdefault(anim, {})[d] = [ri * 5 + ci for ci in range(len(fr))]
    os.makedirs(OUT, exist_ok=True)
    sheet.save(os.path.join(OUT, key + ".png"), optimize=True)
    return {"img": "newclass/" + key + ".png", "cw": CW, "ch": CH, "cols": 5, "rows": len(rows), "pixel": False,
            "foot": round((CH - 3) / CH, 4), "cx": 0.5, "body": 66, "scale": 0.46, "anims": anims}, sheet


def by_dir(grid):          # grid[r][c] -> {dir: [5 frames]}
    return {d: [grid[i][c] for c in range(5)] for i, d in enumerate(DIRS)}


def pick(grid, cols):      # เลือกเฟรมบางคอลัมน์ต่อทิศ
    return {d: [grid[i][c] for c in cols] for i, d in enumerate(DIRS)}


meta, icons = {}, {}
prev = []

# ---------------- นักมวย ----------------
B = lambda n: os.path.join(BOX, n)
skill1 = build_sheet(B("Gemini_Generated_Image_g2ctqzg2ctqzg2.jpg"), [(1, 2), (1, 3), (3, 2)],
                     {(1, 2): B("Gemini_Generated_Image_4aqfvo4aqfvo4aqf.jpg"), (1, 3): B("Gemini_Generated_Image_4aqfvo4aqfvo4aqf (1).jpg")})
skill2 = build_sheet(B("Gemini_Generated_Image_g2ctqzg2ctqzg2ct (2).jpg"), [(0, 4), (1, 2), (1, 3), (3, 2)], {})
skill3 = build_sheet(B("Gemini_Generated_Image_g2ctqzg2ctqzg2ct (3).jpg"), [(0, 4), (2, 4), (3, 2)],
                     {(3, 2): B("Gemini_Generated_Image_c9w6vic9w6vic9w6 (2).jpg")})
walk = build_sheet(B("Gemini_Generated_Image_g2ctqzg2ctqzg2ct.jpg"), [], {})
skill4 = build_sheet(B("Gemini_Generated_Image_g2ctqzg2ctqzgt.jpg"), [(0, 4), (1, 2), (1, 3), (3, 2), (3, 3)],
                     {(1, 2): B("Gemini_Generated_Image_4aqfvo4aqfvo4aqf (4).jpg"), (1, 3): B("Gemini_Generated_Image_4aqfvo4aqfvo4aqf (5).jpg")})
atk = {d: [walk[i][0], skill3[i][0], skill3[i][1], skill3[i][1], walk[i][0]] for i, d in enumerate(DIRS)}
m, sh = save_class("hd_boxer", [("idle", pick(walk, [0])), ("walk", by_dir(walk)), ("attack", atk),
                                ("skill1", by_dir(skill1)), ("skill2", by_dir(skill2)), ("skill3", by_dir(skill3)), ("skill4", by_dir(skill4))])
meta["hd_boxer"] = m
icons.update(icons_from(B("Gemini_Generated_Image_g2ctqzg2ctqzg2ct (1).jpg"),
                        ["เข่าพยัคฆ์เพลิง", "เตะหมุนอัคคี", "หมัดไฟสะเก็ดดาว", "อสูรเพลิงแปดกร"][:0] or [None, None, None, None]))
# ลำดับไอคอนในภาพ: TL หมัดมังกร (=หมัดไฟ), TR เตะหมุน, BL พยัคฆ์, BR อสูร
q = icons_from(B("Gemini_Generated_Image_g2ctqzg2ctqzg2ct (1).jpg"), ["หมัดไฟสะเก็ดดาว", "เตะหมุนอัคคี", "เข่าพยัคฆ์เพลิง", "อสูรเพลิงแปดกร"])
icons.update(q)

# ---------------- นักอัญเชิญสายฟ้า ----------------
S = lambda n: os.path.join(SUM, n)
T_walk = build_sheet(S("Gemini_Generated_Image_69crke69crke69cr.jpg"), [], {})
T_ult = build_sheet(S("Gemini_Generated_Image_69crke69crke69.jpg"), [(1, 2), (1, 3), (3, 2)], {})
T_wing = build_sheet(S("Gemini_Generated_Image_69crke69crke69c.jpg"), [(3, 2)], {})
T_ring = build_sheet(S("Gemini_Generated_Image_69crke69crke69cr (2).jpg"), [(3, 2)], {})
T_wolf = build_sheet(S("Gemini_Generated_Image_69crke69crke69cr (3).jpg"), [(3, 2)],
                     {(3, 2): S("Gemini_Generated_Image_c9w6vic9w6vic9w6.jpg")})
t_atk = {d: [T_wing[i][0], T_wing[i][0], T_wing[i][3], T_wing[i][3], T_wing[i][4]] for i, d in enumerate(DIRS)}
m, sh = save_class("hd_sumthunder", [("idle", pick(T_walk, [0])), ("walk", by_dir(T_walk)), ("attack", t_atk),
                                     ("skill1", by_dir(T_wolf)), ("skill2", by_dir(T_ring)), ("skill3", by_dir(T_wing)), ("skill4", by_dir(T_ult))])
meta["hd_sumthunder"] = m
icons.update(icons_from(S("Gemini_Generated_Image_69crke69crke69cr (1).jpg"),
                        ["หมาป่าสายฟ้า", "โซ่อัสนีผนึก", "ปีกสายฟ้าพิโรธ", "เทพพิทักษ์อัสนี"]))

# ---------------- นักอัญเชิญความมืด ----------------
D_walk = build_sheet(S("Gemini_Generated_Image_lf14q0lf14q0lf14.jpg"), [], {})
D_ult = build_sheet(S("Gemini_Generated_Image_lf14q0lf14q0lf.jpg"), [(1, 2), (1, 3), (1, 4), (3, 2)], {})
D_wing = build_sheet(S("Gemini_Generated_Image_lf14q0lf14q0lf1.jpg"), [(3, 2)], {})
D_ring = build_sheet(S("Gemini_Generated_Image_lf14q0lf14q0lf14 (2).jpg"), [(3, 2)], {})
D_wolf = build_sheet(S("Gemini_Generated_Image_lf14q0lf14q0lf14 (3).jpg"), [(3, 2)],
                     {(3, 2): S("Gemini_Generated_Image_c9w6vic9w6vic9w6 (1).jpg")})
d_atk = {d: [D_wing[i][0], D_wing[i][0], D_wing[i][3], D_wing[i][3], D_wing[i][4]] for i, d in enumerate(DIRS)}
m, sh = save_class("hd_sumdark", [("idle", pick(D_walk, [0])), ("walk", by_dir(D_walk)), ("attack", d_atk),
                                  ("skill1", by_dir(D_wolf)), ("skill2", by_dir(D_ring)), ("skill3", by_dir(D_wing)), ("skill4", by_dir(D_ult))])
meta["hd_sumdark"] = m
icons.update(icons_from(S("Gemini_Generated_Image_lf14q0lf14q0lf14 (1).jpg"),
                        ["หมาป่าอสูรมืด", "โซ่รูนมืดผนึก", "ปีกอีกามรณะ", "อัศวินอสูรมืด"]))

with open(os.path.join(GAME, "newclass_sprites.js"), "w", encoding="utf-8") as fh:
    fh.write("// สร้างจาก tools/build_new_classes.py (นักมวย / นักอัญเชิญสายฟ้า / นักอัญเชิญความมืด: สไปรต์ + ไอคอนสกิล)\n")
    fh.write("window.SPRITES=Object.assign(window.SPRITES||{}," + json.dumps(meta, ensure_ascii=False) + ");\n")
    fh.write("window.SKILL_ICONS=Object.assign(window.SKILL_ICONS||{}," + json.dumps(icons, ensure_ascii=False) + ");\n")
# contact sheet ตรวจสายตา: แถวทิศหน้า+ขวา ของแต่ละคลาส
for key in meta:
    sh = Image.open(os.path.join(OUT, key + ".png"))
    rows = meta[key]["rows"]; keep = [i for i in range(rows) if (i % 4) in (0, 2)]
    pv = Image.new("RGBA", (CW * 5, CH * len(keep)), (40, 60, 90, 255))
    for j, i in enumerate(keep): pv.alpha_composite(sh.crop((0, i * CH, CW * 5, (i + 1) * CH)), (0, j * CH))
    pv.convert("RGB").save(os.path.join(HERE, "preview_" + key + ".png"))
print({k: (v["rows"], v["cw"], v["ch"]) for k, v in meta.items()}, list(icons))
