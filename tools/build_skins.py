# สร้างสไปรต์สกินจากภาพแคปจอแถบท่าทาง (Gemini) → game/skin_<id>.js
# แต่ละสกินมี 3 ภาพแคป: A = เดิน หน้า/หลัง/ขวา • B = เดินซ้าย + โจมตีหน้า/หลัง • C = โจมตีขวา/ซ้าย
# ทั้งหมดมี 4 ทิศครบ (ไม่ต้องกลับภาพ) • idle = เฟรมแรกของท่าโจมตี • skill1-3 = ใช้ท่าโจมตีของสกิน (ยังไม่มีภาพท่าสกิลของสกิน)
# รัน:  python game/tools/build_skins.py            (ทุกสกิน)   หรือ  python game/tools/build_skins.py dragon
import base64, io, json, os, sys
sys.argv = [sys.argv[0], "warrior"] + sys.argv[1:]
from PIL import Image, ImageChops
import build_ref_sprites as B

SRC = r"D:\2.SCHOOL\start 071069\สกิน"
SKINS = {
    # id: (ไฟล์ A, B, C)
    "dragon": ("223034", "223046", "223237"),
    "cyber": ("223251", "223256", "223302"),
    "valk": ("223310", "223321", "223333"),
    "neko": ("223344", "223350", "223355"),
}
# ภาพที่แก้ไขท่าโจมตีด้านซ้าย (ใช้แทนแถบ "โจมตีซ้าย" ในภาพ C): id -> (ไฟล์, ลำดับแถบในไฟล์)
ATTACK_LEFT_FIX = {
    "valk": (os.path.join(B.ROOT, "photo", "skins", "src_archer_left_fix.png"), 0),
    "neko": (os.path.join(B.ROOT, "photo", "skins", "src_archer_left_fix.png"), 1),
}
DIRS = ["back", "left", "front", "right"]
OUT_PREVIEW = os.path.join(B.ROOT, "photo", "skins")


def load(t):
    return Image.open(os.path.join(SRC, f"Screenshot 2026-10-14 {t}.png")).convert("RGB")


def strips_of(im):
    """แยกแถบตัวละคร 5 ตัวออกจากภาพแคป (ข้ามบรรทัดข้อความ/ปุ่มลูกศรเลื่อน)"""
    W, H = im.size
    cut = B.cut_background(im, hole_min=100)   # ภาพแคปจอตัวเล็ก: ช่องว่างขาวในคันธนู/ระหว่างแขนมีขนาดไม่กี่ร้อยพิกเซล
    a = cut.getchannel("A")
    # ลบปุ่มลูกศรเลื่อนกลางล่าง: เฉพาะก้อนเล็ก (<=45px) ที่ลอยอยู่ในกรอบล่างกลางทั้งก้อน (ตัวละคร/รองเท้าเป็นก้อนใหญ่ไม่โดน)
    px = a.load()
    x0, x1, y0 = W // 2 - 70, W // 2 + 70, H - 56
    seen = set()
    for sy in range(y0, H):
        for sx in range(x0, x1):
            if px[sx, sy] <= 40 or (sx, sy) in seen:
                continue
            comp, stack, inside = [], [(sx, sy)], True
            seen.add((sx, sy))
            while stack:
                cx, cy = stack.pop(); comp.append((cx, cy))
                if cx <= x0 or cx >= x1 - 1 or cy <= y0:
                    inside = False        # ต่อออกนอกกรอบ = ส่วนของตัวละคร
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if 0 <= nx < W and 0 <= ny < H and (nx, ny) not in seen and px[nx, ny] > 40:
                            seen.add((nx, ny)); stack.append((nx, ny))
            xs = [c[0] for c in comp]; ys = [c[1] for c in comp]
            if inside and max(xs) - min(xs) <= 45 and max(ys) - min(ys) <= 45:
                for c in comp:
                    px[c] = 0
    cut.putalpha(a)
    rows = [sum(1 for x in range(0, W, 2) if px[x, y] > 40) for y in range(H)]
    bands, y = [], 0
    while y < H:
        if rows[y] > 0:
            s = y
            while y < H and (rows[y] > 0 or any(rows[y:y + 4])):
                y += 1
            bands.append((s, y))
        else:
            y += 1
    strips = []
    for s, e in bands:
        if e - s >= 70:
            bb = ImageChops.multiply(a.crop((0, s, W, e)), Image.new("L", (W, e - s), 255)).getbbox()
            strips.append(cut.crop((0, s, W, e)))
    return strips


def build(sid):
    A, Bm, C = (load(t) for t in SKINS[sid])
    sa, sb, sc = strips_of(A), strips_of(Bm), strips_of(C)
    assert len(sa) == 3 and len(sb) == 3 and len(sc) == 2, (sid, len(sa), len(sb), len(sc))
    raw = {("walk", "front"): sa[0], ("walk", "back"): sa[1], ("walk", "right"): sa[2],
           ("walk", "left"): sb[0], ("attack", "front"): sb[1], ("attack", "back"): sb[2],
           ("attack", "right"): sc[0], ("attack", "left"): sc[1]}
    if sid in ATTACK_LEFT_FIX:
        f, n = ATTACK_LEFT_FIX[sid]
        fixed = strips_of(Image.open(f).convert("RGB"))
        assert len(fixed) == 2, len(fixed)
        raw[("attack", "left")] = fixed[n]
    F = {k: B.normalize(B.split5(v)) for k, v in raw.items()}
    for d in DIRS:
        F[("idle", d)] = B.idle_from(F[("attack", d)][0])
    anims_order = ["idle", "walk", "attack"]
    sheet = Image.new("RGBA", (B.CW * 5, B.CH * 12), (0, 0, 0, 0))
    anims, row = {}, 0
    for a in anims_order:
        anims[a] = {}
        for d in DIRS:
            for i, f in enumerate(F[(a, d)]):
                sheet.alpha_composite(f, (i * B.CW, row * B.CH))
            anims[a][d] = [row * 5 + i for i in range(5)]
            row += 1
    for k in (1, 2, 3):   # สกิลของสกินใช้ท่าโจมตีของสกิน
        anims[f"skill{k}"] = {d: list(anims["attack"][d]) for d in DIRS}
    fi = anims["idle"]["front"][0]
    bb = sheet.crop(((fi % 5) * B.CW, (fi // 5) * B.CH, (fi % 5 + 1) * B.CW, (fi // 5 + 1) * B.CH)).getchannel("A").point(lambda v: 255 if v > 60 else 0).getbbox()
    scale = B.BODY_ART / (bb[3] - bb[1])
    buf = io.BytesIO(); sheet.save(buf, "WEBP", quality=90, method=6)
    key = "skin_" + sid
    meta = {"img": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(), "cw": B.CW, "ch": B.CH, "cols": 5, "rows": 12,
            "pixel": False, "foot": round(B.FOOT_Y / B.CH, 4), "cx": .5, "body": B.BODY_ART, "scale": round(scale, 4), "anims": anims}
    js = f"// generated by tools/build_skins.py from {SRC} ({sid}) - do not edit by hand\nwindow.SPRITES=window.SPRITES||{{}};window.SPRITES.{key}={json.dumps(meta, separators=(',', ':'))};\n"
    with open(os.path.join(B.GAME, key + ".js"), "w", encoding="utf-8") as fh:
        fh.write(js)
    os.makedirs(OUT_PREVIEW, exist_ok=True)
    bg = Image.new("RGBA", sheet.size, (74, 106, 58, 255)); bg.alpha_composite(sheet)
    bg.resize((sheet.width // 2, sheet.height // 2)).save(os.path.join(OUT_PREVIEW, f"{sid}_sheet.png"))
    print(f"saved game/{key}.js ({len(js) // 1024} KB) scale={scale:.3f}")


if __name__ == "__main__":
    ids = [a for a in sys.argv[2:] if a in SKINS] or list(SKINS)
    for sid in ids:
        build(sid)


