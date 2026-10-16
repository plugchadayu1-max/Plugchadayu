# แปลงภาพแถบท่าทาง (พื้นขาว 5 ท่าเรียงกัน เช่นจาก Gemini) เป็นสไปรต์ HD ของเกม: idle / walk / attack x 4 ทิศ x 5 เฟรม
# ทิศซ้าย = กลับภาพทิศขวา • idle = ท่าเตรียมพร้อม (เฟรมแรกของท่าโจมตี) + หายใจเบาๆ
# รัน:  python game/tools/build_ref_sprites.py warrior   (หรือ archer — ดูรายการใน CHARS)
import base64, io, json, os, sys
from PIL import Image, ImageDraw, ImageChops, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
ROOT = os.path.dirname(GAME)

# ---- ตั้งค่าตัวละคร: (ท่า, ทิศ) -> ไฟล์  (right = หันขวา; ไม่มี left จะกลับภาพจาก right) ----
CHARS = {
    "warrior": dict(src=r"D:\2.SCHOOL\start 071069\ท่าทางนักดาบ", key="hd_warrior", body=60, strips={
        ("walk", "front"): "Gemini_Generated_Image_1ka4ji1ka4ji1ka4.jpg",
        ("walk", "back"): "Gemini_Generated_Image_1ka4ji1ka4ji1ka4 (1).jpg",
        ("walk", "right"): "Gemini_Generated_Image_1ka4ji1ka4ji1ka4 (2).jpg",
        ("attack", "front"): "Gemini_Generated_Image_3ikn313ikn313ikn.jpg",
        ("attack", "back"): "Gemini_Generated_Image_3ikn313ikn313ikn (1).jpg",
        ("attack", "right"): "Gemini_Generated_Image_3ikn313ikn313ikn (2).jpg",
        # ท่าสกิล (โฟลเดอร์ สกิลดาบ): skill1 ฟันจันทร์เสี้ยวฟ้า, skill2 หมุนพายุ, skill3 กระโดดฟาดสายฟ้า
        **{(f"skill{k + 1}", d): r"..\สกิลดาบ\Screenshot 2026-10-14 " + t + ".png"
           for k, ts in enumerate([("220420", "220424", "220428", "220432"), ("220456", "220500", "220503", "220507"),
                                   ("220552", "220555", "220558", "220601")])
           for d, t in zip(("front", "back", "right", "left"), ts)}},
        keep_y={"skill3"},   # ท่ากระโดด: คงความสูงจากภาพ ไม่ดึงเท้าลงพื้นทุกเฟรม
        icons={"Azure Crescent": r"..\สกิลดาบ\Screenshot 2026-10-14 220414.png",
               "Whirlwind": r"..\สกิลดาบ\Gemini_Generated_Image_zdgq0kzdgq0kzdgq.jpg",
               "Thunder Smash": r"..\สกิลดาบ\Gemini_Generated_Image_zdgq0kzdgq0kzdq.jpg"}),
    # นักธนู: เดินข้างซ้าย (3) เฟรม 2 ภาพเสีย จึงกลับภาพจากข้างขวาแทน • ท่ายิงไม่มีมุมหน้าตรง ใช้มุมเฉียง (y3mm) แทน
    "archer": dict(src=r"D:\2.SCHOOL\start 071069\ท่าทางนักธนู", key="hd_archer", body=60, strips={
        ("walk", "front"): "Gemini_Generated_Image_qxcaidqxcaidqxca.jpg",
        ("walk", "back"): "Gemini_Generated_Image_qxcaidqxcaidqxca (1).jpg",
        ("walk", "right"): "Gemini_Generated_Image_qxcaidqxcaidqxca (2).jpg",
        ("attack", "front"): "Gemini_Generated_Image_y3mm8ry3mm8ry3mm.jpg",
        ("attack", "back"): "Gemini_Generated_Image_y3mm8ry3mm8ry3mm (1).jpg",
        ("attack", "right"): "Gemini_Generated_Image_qxcaidqxcaidqxca (4).jpg",
        ("attack", "left"): "Gemini_Generated_Image_qxcaidqxcaidqxca (5).jpg",
        # ท่าสกิล (ภาพแคปจอจากโฟลเดอร์ สกิลธนู): skill1 ยิงสามดอก, skill2 ฝนธนู, skill3 ธนูพายุ
        **{(f"skill{k + 1}", d): r"..\สกิลธนู\Screenshot 2026-10-14 " + t + ".png"
           for k, ts in enumerate([("215053", "215100", "215105", "215110"), ("215121", "215127", "215135", "215139"),
                                   ("215157", "215200", "215204", "215208")])
           for d, t in zip(("front", "back", "right", "left"), ts)}},
        icons={"Triple Shot": r"..\สกิลธนู\Screenshot 2026-10-14 215042.png",
               "Arrow Rain": r"..\สกิลธนู\Screenshot 2026-10-14 215115.png",
               "Gale Arrow": r"..\สกิลธนู\Screenshot 2026-10-14 215151.png"}),
}
WHO = sys.argv[1] if len(sys.argv) > 1 else "warrior"
CFG = CHARS[WHO]
SRC, KEY, STRIPS, BODY_ART = CFG["src"], CFG["key"], CFG["strips"], CFG["body"]   # BODY_ART = ความสูงตัวในเกม (พิกเซลอาร์ต)
CW = CH = 320          # ขนาดช่องในชีต
BODY_PX = 200          # ความสูงตัวละคร (ไม่รวมอาวุธที่ยกขึ้น) ในชีต
FOOT_Y = 292           # เส้นเท้าในช่อง
DIRS = ["back", "left", "front", "right"]
ANIMS = ["idle", "walk", "attack"] + sorted({a for a, _ in STRIPS if a.startswith("skill")})
OUT_DIR = os.path.join(ROOT, "photo", KEY[3:] + "_hd")


def cut_background(im, hole_min=None):
    """ลบพื้นขาวที่ต่อกับขอบภาพ + รูพื้นขาวขนาดใหญ่ที่ถูกล้อม (ช่องระหว่างแขน/ขา)"""
    im = im.convert("RGB")
    W, H = im.size
    mark = (255, 0, 255)
    work = im.copy()
    for x in range(0, W, 40):
        for y in (0, H - 1):
            if work.getpixel((x, y)) != mark and min(work.getpixel((x, y))) > 225:
                ImageDraw.floodfill(work, (x, y), mark, thresh=48)
    for y in range(0, H, 40):
        for x in (0, W - 1):
            if work.getpixel((x, y)) != mark and min(work.getpixel((x, y))) > 225:
                ImageDraw.floodfill(work, (x, y), mark, thresh=48)
    # รูพื้นขาวในตัว: กลุ่มพิกเซลขาวจัดที่ใหญ่พอ • รูที่เป็นสีฟ้าซีด (แสงเรืองรอบสายธนู) ต้องใหญ่กว่านี้มาก (big_min) กันลบแกนแสงเอฟเฟกต์
    px = work.load()
    seen = set()
    base_min = hole_min or max(60, 2600 * (H / 1024) ** 2)
    big_min = max(base_min, 1500) if hole_min else base_min

    def white(c):
        return min(c) >= 240 and max(c) - min(c) <= 14

    def pale_cyan(c):
        r, g, b = c
        return min(c) >= 205 and g >= r + 8 and b >= r + 8 and abs(g - b) <= 14

    for y in range(0, H, 3):
        for x in range(0, W, 3):
            c = px[x, y]
            if c == mark or (x, y) in seen or not ((min(c) >= 247 and max(c) - min(c) <= 10) or (hole_min and pale_cyan(c))):
                continue
            stack, comp, nwhite = [(x, y)], [], 0
            seen.add((x, y))
            while stack and len(comp) < 400000:
                cx, cy = stack.pop(); comp.append((cx, cy))
                if white(px[cx, cy]): nwhite += 1
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen:
                        cc = px[nx, ny]
                        if cc != mark and (white(cc) or (hole_min and pale_cyan(cc))):
                            seen.add((nx, ny)); stack.append((nx, ny))
            if nwhite > base_min or len(comp) > big_min:   # ขาวล้วนพอใหญ่ หรือกลุ่มซีดทั้งก้อนใหญ่มาก
                for p in comp:
                    px[p] = mark
    diff = ImageChops.difference(work, Image.new("RGB", (W, H), mark)).convert("L")
    alpha = diff.point(lambda v: 255 if v > 6 else 0)
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))   # ตัดขอบขาวจาง + ขอบนุ่ม
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


def split5(img):
    """แบ่ง 5 ท่า: แยกเป็นก้อนที่ต่อกัน (ย่อภาพ 1/4 ให้เร็ว) แล้วยกแต่ละก้อนให้ท่าที่จุดกึ่งกลางของก้อนตกอยู่
    ดาบที่ยื่นเลยเส้นแบ่งจึงไม่ถูกตัดขาด"""
    W, H = img.size
    S = 4
    w, h = W // S, H // S
    small = img.getchannel("A").resize((w, h), Image.BOX).point(lambda v: 255 if v > 20 else 0)
    px = small.load()
    lab = [[-1] * w for _ in range(h)]
    comps = []
    for y in range(h):
        for x in range(w):
            if px[x, y] == 0 or lab[y][x] >= 0:
                continue
            idx = len(comps); stack = [(x, y)]; lab[y][x] = idx; sx = n = 0
            while stack:
                cx, cy = stack.pop(); sx += cx; n += 1
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if 0 <= nx < w and 0 <= ny < h and px[nx, ny] and lab[ny][nx] < 0:
                            lab[ny][nx] = idx; stack.append((nx, ny))
            comps.append((sx / n, n))
    xs = {}
    for y in range(h):
        for x, l in enumerate(lab[y]):
            if l >= 0:
                a, b = xs.get(l, (x, x)); xs[l] = (min(a, x), max(b, x))
    # เส้นแบ่ง: ใช้ก้อนใหญ่ 5 ก้อนที่อยู่ห่างกันเป็นตัวละคร (ภาพแคปจอเว้นระยะไม่เท่ากัน) ถ้าไม่ครบ (เอฟเฟกต์เชื่อมกัน) ใช้แบ่งเท่าๆ กัน
    # แล้วขยับเส้นไปที่คอลัมน์ว่างที่สุดแถวนั้น
    seeds = []
    for i in sorted(range(len(comps)), key=lambda i: -comps[i][1]):
        if xs[i][1] - xs[i][0] < w / 5 * 1.25 and all(abs(comps[i][0] - comps[j][0]) > w / 12 for j in seeds):
            seeds.append(i)
        if len(seeds) == 5:
            break
    centers = sorted(comps[i][0] for i in seeds) if len(seeds) == 5 else [w * (k + .5) / 5 for k in range(5)]
    col = [sum(1 for y in range(h) if px[x, y]) for x in range(w)]
    cuts = []
    for k in range(4):
        lo, hi = centers[k], centers[k + 1]
        m0, m1 = int(lo + (hi - lo) * .3), int(lo + (hi - lo) * .7) + 1
        cuts.append(min(range(m0, m1), key=lambda x: (col[x], abs(x - (lo + hi) / 2))))
    region = lambda x: sum(1 for c in cuts if x > c)
    # ก้อนปกติไปอยู่ช่องของจุดกึ่งกลาง (ดาบ/ลูกศรที่ยื่นเลยเส้นไม่ขาด) • ก้อนที่กว้างเกินหนึ่งช่อง (เอฟเฟกต์เชื่อมหลายตัว) แบ่งตามคอลัมน์
    owner = [None if xs[i][1] - xs[i][0] > w / 5 * 1.25 else region(c[0]) for i, c in enumerate(comps)]
    frames = []
    for k in range(5):
        m = Image.new("L", (w, h), 0); mp = m.load()
        for y in range(h):
            row = lab[y]
            for x in range(w):
                l = row[x]
                if l >= 0 and comps[l][1] > 3 and (owner[l] if owner[l] is not None else region(x)) == k:
                    v = 255
                    if owner[l] is None:   # เอฟเฟกต์ที่เชื่อมหลายตัว: จางลงตรงรอยตัด ไม่ให้ขอบขาดเป็นเส้นตรงแข็ง
                        left = cuts[k - 1] if k > 0 else x - 99
                        right = cuts[k] if k < 4 else x + 99
                        v = int(255 * max(0.0, min(1.0, min(x - left, right - x) / 5)))
                    mp[x, y] = v
        m = m.filter(ImageFilter.MaxFilter(3)).resize((W, H), Image.NEAREST)
        a = ImageChops.multiply(img.getchannel("A"), m)
        fr = img.copy(); fr.putalpha(a)
        bb = a.getbbox()
        frames.append(fr.crop((max(0, bb[0] - 4), 0, min(W, bb[2] + 4), H)))
    return frames


def anchor_x(fr, bb):
    """จุดกึ่งกลางแนวนอน = มัธยฐานของเนื้อภาพช่วงลำตัว-ขา (ไม่โดนดาบดึง)"""
    x0, y0, x1, y1 = bb
    band = fr.getchannel("A").crop((x0, y0 + int((y1 - y0) * .45), x1, y1))
    prof = list(band.resize((x1 - x0, 1), Image.BOX).getdata())
    tot = sum(prof) or 1
    acc = 0
    for i, v in enumerate(prof):
        acc += v
        if acc >= tot / 2:
            return x0 + i
    return (x0 + x1) // 2


def normalize(frames, keep_y=False):
    bbs = [f.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox() for f in frames]
    ground = sorted(b[3] for b in bbs)[2]   # keep_y: พื้นของทั้งแถบ = มัธยฐานของขอบล่าง (ท่ากระโดดลอยสูงตามภาพ)
    hs = sorted(b[3] - b[1] for b in bbs)
    ref = hs[2]                      # ความสูงตัวจริง = มัธยฐาน (ไม่นับท่ายกอาวุธสูง/ท่าคุกเข่า)
    k = BODY_PX / ref
    out = []
    for f, bb in zip(frames, bbs):
        ax = anchor_x(f, bb)
        sc = f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS)
        cell = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        cell.alpha_composite(sc, (round(CW / 2 - ax * k), round(FOOT_Y - (ground if keep_y else bb[3]) * k)))
        out.append(cell)
    return out


def idle_from(base):
    """ท่ายืนเตรียมพร้อม (เฟรมแรกของท่าโจมตี) + หายใจ (ยืดตัวขึ้นเล็กน้อยโดยเท้าอยู่ที่เดิม)"""
    out = []
    for s in (0, .008, .016, .008, 0):
        h = round(CH * (1 + s))
        st = base.resize((CW, h), Image.LANCZOS)
        cell = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
        cell.alpha_composite(st, (0, FOOT_Y - round(FOOT_Y * (1 + s))))
        out.append(cell)
    return out


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    F = {}
    for (anim, d), fn in STRIPS.items():
        print("กำลังแปลง", anim, d, fn)
        strip = cut_background(Image.open(os.path.join(SRC, fn)))
        F[(anim, d)] = normalize(split5(strip), anim in CFG.get("keep_y", ()))
    for anim in ANIMS[1:]:
        if (anim, "left") not in F:
            F[(anim, "left")] = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in F[(anim, "right")]]
    for d in DIRS:
        F[("idle", d)] = idle_from(F[("attack", d)][0])

    rows = len(ANIMS) * len(DIRS)
    sheet = Image.new("RGBA", (CW * 5, CH * rows), (0, 0, 0, 0))
    anims, row = {}, 0
    for a in ANIMS:
        anims[a] = {}
        for d in DIRS:
            for i, f in enumerate(F[(a, d)]):
                sheet.alpha_composite(f, (i * CW, row * CH))
            anims[a][d] = [row * 5 + i for i in range(5)]
            row += 1
    sheet.save(os.path.join(OUT_DIR, KEY + "_sheet.png"))

    # ความสูงตัวจริงในชีต (ท่ายืนหันหน้า) -> อัตราย่อให้เท่าพิกเซลอาร์ตในเกม
    fi = anims["idle"]["front"][0]
    bb = sheet.crop(((fi % 5) * CW, (fi // 5) * CH, (fi % 5 + 1) * CW, (fi // 5 + 1) * CH)).getchannel("A").point(lambda v: 255 if v > 60 else 0).getbbox()
    scale = BODY_ART / (bb[3] - bb[1])
    buf = io.BytesIO(); sheet.save(buf, "WEBP", quality=92, method=6)
    meta = {"img": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(),
            "cw": CW, "ch": CH, "cols": 5, "rows": rows, "pixel": False, "foot": round(FOOT_Y / CH, 4), "cx": .5,
            "body": BODY_ART, "scale": round(scale, 4), "anims": anims}
    js = (f"// generated by tools/build_ref_sprites.py from {SRC} - do not edit by hand\n"
          f"window.SPRITES=window.SPRITES||{{}};window.SPRITES.{KEY}={json.dumps(meta, separators=(',', ':'))};\n")
    with open(os.path.join(GAME, KEY + ".js"), "w", encoding="utf-8") as fh:
        fh.write(js)

    # พรีวิว GIF ต่อท่า (4 ทิศเรียงกัน)
    for a in ANIMS:
        gif = []
        for i in range(5):
            cv = Image.new("RGBA", (CW * 4, CH), (74, 106, 58, 255))
            for k, d in enumerate(DIRS):
                cv.alpha_composite(F[(a, d)][i], (k * CW, 0))
            gif.append(cv.resize((CW * 2, CH // 2)).convert("RGB"))
        gif[0].save(os.path.join(OUT_DIR, f"preview_{a}.gif"), save_all=True, append_images=gif[1:],
                    duration={"idle": 240, "walk": 120}.get(a, 110), loop=0)
    print(f"saved game/{KEY}.js ({len(js) // 1024} KB) scale={scale:.4f}")
    if CFG.get("icons"):
        build_icons(CFG["icons"])


def build_icons(icons, size=96):
    """ไอคอนสกิล: ตัดขอบขาวของภาพแคป, ลบปุ่มแชร์/ดาวน์โหลดที่มุมขวาบน (ใช้มุมซ้ายบนกลับด้านแทน), มุมโค้งโปร่งใส"""
    out = {}
    for name, fn in icons.items():
        im = Image.open(os.path.join(SRC, fn)).convert("RGB")
        if os.path.basename(fn).startswith("Gemini"):
            # ไฟล์ดาวน์โหลดตรง: กรอบมีมุมแหลม พื้นนอกกรอบเป็นสีขาว → ตัดพื้นขาวที่ต่อกับขอบภาพให้โปร่งใส (ไม่ใช้มุมโค้ง)
            im = im.resize((640, 640), Image.LANCZOS)
            im = cut_background(im, hole_min=10 ** 9)
            bb = im.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
            im = im.crop(bb)
            w, h = im.size
            side = max(w, h)
            sq = Image.new("RGBA", (side, side), (0, 0, 0, 0)); sq.paste(im, ((side - w) // 2, (side - h) // 2))
            im = sq.resize((size, size), Image.LANCZOS)
        else:
            bb = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).convert("L").point(lambda v: 255 if v > 30 else 0).getbbox()
            im = im.crop(bb)
            w, h = im.size
            if os.path.basename(fn).startswith("Screenshot"):   # ภาพแคปจอมีปุ่มของหน้าเว็บทับมุมขวาบน
                c = int(min(w, h) * .2)
                im.paste(im.crop((0, 0, c, c)).transpose(Image.FLIP_LEFT_RIGHT), (w - c, 0))
            im = im.resize((size, size), Image.LANCZOS).convert("RGBA")
            m = Image.new("L", (size * 4, size * 4), 0)
            ImageDraw.Draw(m).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=size * 4 // 9, fill=255)
            im.putalpha(m.resize((size, size), Image.LANCZOS))
        im.save(os.path.join(OUT_DIR, "icon_" + name.replace(" ", "_") + ".png"))
        buf = io.BytesIO(); im.save(buf, "WEBP", quality=90)
        out[name] = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()
    path = os.path.join(GAME, "skill_icons.js")
    cur = {}
    if os.path.exists(path):   # รวมกับไอคอนอาชีพอื่นที่มีอยู่แล้ว
        txt = open(path, encoding="utf-8").read()
        cur = json.loads(txt[txt.index("{"):txt.rindex("}") + 1])
    cur.update(out)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("// generated by tools/build_ref_sprites.py - ไอคอนสกิล (ชื่อสกิล -> ภาพ)\nwindow.SKILL_ICONS=" + json.dumps(cur, separators=(",", ":")) + ";\n")
    print("saved game/skill_icons.js", list(cur))


if __name__ == "__main__":
    main()
