# สร้างสไปรต์อาชีพพิเศษ "เทพสายฟ้า" (hd_thunder) + ไอคอนสกิล จากภาพ Gemini
#   ท่าเดิน: ท่าทางเทพสายฟ้า/Gemini_...jpg • ท่าโจมตี: ท่าทางเทพสายฟ้า/Code_Generated_Image.png • สกิล 1-4: สกิลเทพสายฟ้า/Code_Generated_Image*.png
#   แถวในชีตต้นฉบับ: 0 หน้า, 1 หลัง, 2 ขวา, 3 ซ้าย (5 เฟรมต่อแถว)
# รัน: python game/tools/build_thunder.py → game/thunder/hd_thunder.png + game/thunder_sprites.js
import base64, io, json, os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
SRC_POSE = r"D:\2.SCHOOL\start 071069\ท่าทางเทพสายฟ้า"
SRC_SK = r"D:\2.SCHOOL\start 071069\สกิลเทพสายฟ้า"
OUT = os.path.join(GAME, "thunder")
CW, CH = 384, 216
DIRS = ["front", "back", "right", "left"]
SHEETS = [   # (ท่า, ไฟล์)
    ("walk", os.path.join(SRC_POSE, "Gemini_Generated_Image_zt2p2zt2p2zt2p2z.jpg")),
    ("attack", os.path.join(SRC_POSE, "Code_Generated_Image.png")),
    ("skill1", os.path.join(SRC_SK, "Code_Generated_Image.png")),
    ("skill2", os.path.join(SRC_SK, "Code_Generated_Image (1).png")),
    ("skill3", os.path.join(SRC_SK, "Code_Generated_Image (2).png")),
    ("skill4", os.path.join(SRC_SK, "Code_Generated_Image (3).png")),
]
ICONS = {  # ชื่อสกิล -> ไอคอน
    "ทัณฑ์อัสนีฟากฟ้า": os.path.join(SRC_SK, "Gemini_Generated_Image_yhy7tfyhy7tfyhy7.jpg"),
    "ก้าวพริบตาอัสนีคู่": os.path.join(SRC_SK, "Gemini_Generated_Image_yhy7tfyhy7tfyhy7 (1).jpg"),
    "วายุอัสนีคลั่ง": os.path.join(SRC_SK, "Gemini_Generated_Image_yhy7tfyhy7tfyhy7 (2).jpg"),
    "มหาเวทย์มังกรอัสนีพิโรธ": os.path.join(SRC_SK, "Gemini_Generated_Image_scwy16scwy16scwy.jpg"),
}


def cutout(im):
    rgb = im.convert("RGB")
    r, g, b = rgb.split()
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    mask = mn.point(lambda v: 0 if v > 228 else 255)
    W, H = mask.size
    for p in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, 0), (W // 2, H - 1)]:
        if mask.getpixel(p) == 0:
            ImageDraw.floodfill(mask, p, 128)
    alpha = mask.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.MinFilter(3))
    out = rgb.copy(); out.putalpha(alpha)
    return out


def frames_of(im):
    """แยกเฟรมแต่ละช่อง: พิกเซลในช่องตัวเอง + ชิ้นเอฟเฟกต์ (connected components) ที่ส่วนใหญ่อยู่ในช่องตัวเองแต่ล้นไปช่องข้าง
    คืน 4 แถว x 5 คอลัมน์ ของ (ภาพ RGBA ที่ตัดเหลือเนื้อหา, x กึ่งกลางช่องเดิมในภาพนั้น, ภาพเฉพาะชิ้นใหญ่สุด=ตัวละคร)"""
    import numpy as np
    from scipy import ndimage
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
    own_px = owner[lab]            # เจ้าของของแต่ละพิกเซล (-1 = พื้นหลัง)
    xx = np.arange(W)[None, :]
    out = [[None] * 5 for _ in range(4)]
    for r in range(4):
        for c in range(5):
            idc = r * 5 + c
            xa, xb = int(x0 + c * cw - .25 * cw), int(x0 + (c + 1) * cw + .25 * cw)
            ya, yb = int(y0 + r * ch), int(y0 + (r + 1) * ch)
            region = np.zeros((H, W), bool); region[ya:yb, max(0, xa):min(W, xb)] = True
            m = a & region & ((cellid == idc) | (own_px == idc))
            # ตัดชิ้นเอฟเฟกต์ลอยที่อยู่นอกกลางช่อง (เศษของเฟรมข้างเคียง): เก็บเฉพาะชิ้นที่แตะช่วงกลาง cx±0.2cw
            ccx = x0 + (c + .5) * cw
            core = np.zeros((H, W), bool); core[ya:yb, int(ccx - .2 * cw):int(ccx + .2 * cw)] = True
            keep = np.unique(lab[m & core]); keep = keep[keep > 0]
            m = m & np.isin(lab, keep)
            if not m.any():
                out[r][c] = (None, 0, None); continue
            if not m.any():
                out[r][c] = (None, 0, None); continue
            yy, xx2 = np.nonzero(m)
            bx0, by0, bx1, by1 = xx2.min(), yy.min(), xx2.max() + 1, yy.max() + 1
            crop = rgba[by0:by1, bx0:bx1].copy(); crop[~m[by0:by1, bx0:bx1]] = 0
            ids = [l for l in np.unique(lab[m]) if l > 0]
            big = max(ids, key=lambda l: int((m & (lab == l) & core).sum())) if ids else None
            if big is not None:
                mb = m & (lab == big); yb2, xb2 = np.nonzero(mb)
                bc = rgba[yb2.min():yb2.max() + 1, xb2.min():xb2.max() + 1].copy(); bc[~mb[yb2.min():yb2.max() + 1, xb2.min():xb2.max() + 1]] = 0
                bigimg = Image.fromarray(bc, "RGBA")
            else: bigimg = Image.fromarray(crop, "RGBA")
            cx = x0 + (c + .5) * cw
            out[r][c] = (Image.fromarray(crop, "RGBA"), cx - bx0, bigimg)
    return out

def place(item, main_only=False):
    """วางลงช่อง CWxCH: กึ่งกลางช่องเดิม = กึ่งกลางแนวนอน ชิดล่าง"""
    out = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    if item[0] is None: return out
    if main_only:
        c = item[2]; xoff = c.width / 2
    else:
        c, xoff = item[0], item[1]
    if c.height > CH - 4:
        k = (CH - 4) / c.height; c = c.resize((max(1, int(c.width * k)), CH - 4), Image.LANCZOS); xoff *= k
    x = int(round(CW / 2 - xoff)); x = max(0, min(CW - c.width, x))
    out.paste(c, (x, CH - 4 - c.height), c)
    return out

os.makedirs(OUT, exist_ok=True)
grid = {}   # (anim, dir) -> [5 frames]
for anim, f in SHEETS:
    im = Image.open(f)
    if im.width > 1400: im = im.resize((1264, round(im.height * 1264 / im.width)), Image.LANCZOS)
    cs = frames_of(cutout(im))
    for r, d in enumerate(DIRS):
        grid[(anim, d)] = [place(cs[r][c]) for c in range(5)]
        if anim == 'attack': grid[('idle', d)] = [place(cs[r][4], True)]

# idle = เฟรมสุดท้ายของท่าโจมตี (ท่ายืนผ่อนคลาย)
order = ["idle", "walk", "attack", "skill1", "skill2", "skill3", "skill4"]
rows = []   # (anim, dir, frames)
for anim in order:
    for d in DIRS:
        fr = grid[(anim, d)]
        rows.append((anim, d, fr))
sheet = Image.new("RGBA", (CW * 5, CH * len(rows)), (0, 0, 0, 0))
anims = {}
for ri, (anim, d, fr) in enumerate(rows):
    for ci, fim in enumerate(fr): sheet.paste(fim, (ci * CW, ri * CH))
    anims.setdefault(anim, {})[d] = [ri * 5 + ci for ci in range(len(fr))]
sheet.save(os.path.join(OUT, "hd_thunder.png"), optimize=True)

BODY = 66
meta = {"hd_thunder": {"img": "thunder/hd_thunder.png", "cw": CW, "ch": CH, "cols": 5, "rows": len(rows), "pixel": False,
                       "foot": round((CH - 4) / CH, 4), "cx": 0.5, "body": BODY, "scale": round(BODY / 170, 4), "anims": anims}}


def icon_url(f):
    im = Image.open(f).convert("RGB").resize((96, 96), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, "WEBP", quality=88)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


icons = {n: icon_url(f) for n, f in ICONS.items()}
with open(os.path.join(GAME, "thunder_sprites.js"), "w", encoding="utf-8") as fh:
    fh.write("// สร้างจาก tools/build_thunder.py (อาชีพพิเศษเทพสายฟ้า: สไปรต์ + ไอคอนสกิล)\n")
    fh.write("window.SPRITES=Object.assign(window.SPRITES||{}," + json.dumps(meta, ensure_ascii=False) + ");\n")
    fh.write("window.SKILL_ICONS=Object.assign(window.SKILL_ICONS||{}," + json.dumps(icons, ensure_ascii=False) + ");\n")
print("rows", len(rows), "size", sheet.size)
# contact sheet สำหรับตรวจสายตา
prev = Image.new("RGBA", (CW * 5, CH * 8), (40, 60, 90, 255))
for i, (anim, d, fr) in enumerate([x for x in rows if x[1] in ("front", "right")][:8]):
    for ci, fim in enumerate(fr): prev.alpha_composite(fim, (ci * CW, i * CH))
prev.convert("RGB").save(os.path.join(HERE, "thunder_preview.png"))





