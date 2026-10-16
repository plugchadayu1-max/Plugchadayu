# สร้างสไปรต์ออร่าแฟชั่น (5 ธีมสี × 5 แบบ = 25 แบบ) จากภาพแถบพื้นขาวของ Gemini → game/auras.js
# แต่ละไฟล์ภาพ = 1 ธีมสี มี 5 แบบเรียงกัน (วงเวท / เสาพลัง / ปีก / ประกายรัศมี / ปีกรัศมี) • ไม่ใช่เฟรมแอนิเมชัน
# พื้นขาวถูกแปลงเป็นความโปร่งใสแบบ "color to alpha" (ไฟ/แสงเรืองซ้อนบนพื้นเกมได้เนียน ไม่เป็นกรอบขาว)
# รัน:  python game/tools/build_auras.py
import base64, io, json, os
from PIL import Image

SRC = r"D:\2.SCHOOL\start 071069\ออร่า"
PREFIX = "Gemini_Generated_Image_lljwmolljwmolljw"
THEMES = [  # id, ไฟล์ (ต่อท้ายชื่อ), ชื่อไทย
    ("gold", "", "ทองศักดิ์สิทธิ์"),
    ("fire", " (1)", "เพลิงมังกร"),
    ("lightning", " (2)", "สายฟ้าครามทอง"),
    ("wind", " (3)", "พายุมรกต"),
    ("shadow", " (4)", "เงามรณะ"),
]
STYLES = ["วงเวท", "เสาพลัง", "ปีกราชัน", "รัศมีแตกกระจาย", "ปีกรัศมี"]
# โหมดจุดยึดของแต่ละแบบ (ตามตำแหน่งตัวละครที่ควรยืน):
#  ground = วงแบนบนพื้น ตัวละครอยู่กลางวง • bottom = มีวงที่ฐาน ตัวละครยืนที่วงล่างสุด ปีก/เสาขึ้นไปด้านหลัง • center = ซ้อนหลังลำตัว (ไม่มีวงพื้น)
MODE = {
    "gold": ["ground", "bottom", "bottom", "center", "bottom"],
    "fire": ["ground", "bottom", "center", "bottom", "bottom"],
    "lightning": ["ground", "bottom", "bottom", "center", "bottom"],
    "wind": ["ground", "bottom", "bottom", "ground", "bottom"],
    "shadow": ["ground", "bottom", "bottom", "bottom", "bottom"],
}
ADDITIVE = {"lightning"}   # ธีมแสงสว่าง: ซ้อนแบบบวกแสง (สายฟ้าสว่างวาบ)
GAMMA = {"gold": 0.38}      # ทอง: ยกความทึบสูงกว่าธีมอื่น (ปกติ 0.62) ไม่ให้ออกหม่น/เขียวบนพื้นหญ้า
DW = {"ground": 50, "bottom": 54, "center": 52}   # ความกว้างของภาพบนฉาก (หน่วยพิกเซลอาร์ต; ตัวละครสูง ~30)
GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PREVIEW = os.path.join(os.path.dirname(GAME), "photo", "auras")
SHRINK = 3   # ย่อภาพต้นฉบับลงกี่เท่า (4128 → 1376)


def to_alpha(img, gamma=0.62):
    """color-to-alpha: พิกเซล = (1-a)*ขาว + a*สี  →  a = 1 - min(r,g,b)/255, สี = (p - min) / a
    + ยก alpha ด้วยเกรเดียนต์ (สีอ่อนอย่างทอง/ฟ้าอ่อนจะไม่จางจนดูหม่น)"""
    w, h = img.size
    src = img.load()
    out = Image.new("RGBA", (w, h))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = src[x, y]
            mn = min(r, g, b)
            a = 255 - mn - 10                      # 10 = ตัดสัญญาณรบกวน JPEG ของพื้นขาว
            if a <= 0:
                continue
            a = min(1.0, a / 245)
            a = a ** gamma                          # ยกส่วนจาง/กลางให้ทึบขึ้น
            k = 255.0 / max(1, 255 - mn)
            dst[x, y] = (min(255, int((r - mn) * k)), min(255, int((g - mn) * k)), min(255, int((b - mn) * k)), int(a * 255))
    return out


def split5(strip):
    """แบ่ง 5 แบบ: ตัดที่คอลัมน์ว่างที่สุดใกล้เส้นแบ่งเท่าๆ กัน"""
    W, H = strip.size
    a = strip.getchannel("A").resize((W, 1), Image.BOX)
    col = list(a.get_flattened_data()) if hasattr(a, "get_flattened_data") else list(a.getdata())
    cuts = [0]
    for k in range(1, 5):
        c = round(W * k / 5)
        lo, hi = c - W // 40, c + W // 40
        cuts.append(min(range(lo, hi), key=lambda x: (col[x], abs(x - c))))
    cuts.append(W)
    return [strip.crop((cuts[i], 0, cuts[i + 1], H)) for i in range(5)]


def centroid_y(img, y0, y1):
    px = img.getchannel("A").load()
    W = img.width
    sy = n = 0
    for y in range(y0, y1):
        for x in range(0, W, 2):
            if px[x, y] > 140:
                sy += y; n += 1
    return sy / n if n else (y0 + y1) / 2


def main():
    cells = []   # (theme, idx, image(cropped), fx, fy)
    for tid, suf, tname in THEMES:
        im = Image.open(os.path.join(SRC, PREFIX + suf + ".jpg")).convert("RGB")
        im = im.resize((im.width // SHRINK, im.height // SHRINK), Image.LANCZOS)
        strip = to_alpha(im, GAMMA.get(tid, 0.62))
        print("แปลง", tid)
        for i, c in enumerate(split5(strip)):
            bb = c.getchannel("A").point(lambda v: 255 if v > 18 else 0).getbbox()
            c = c.crop(bb)
            w, h = c.size
            mode = MODE[tid][i]
            if mode == "ground":
                fy = centroid_y(c, 0, h) / h
            elif mode == "bottom":
                fy = centroid_y(c, int(h * .72), h) / h
            else:   # center: จุดกลางภาพอยู่ที่ลำตัว (สูงจากเท้า ~14 พิกเซลอาร์ต)
                fy = .5 + 14 / (DW["center"] * h / w)
            cells.append(dict(theme=tid, idx=i, img=c, fx=.5, fy=fy, mode=mode))
    # แพ็กลงแผ่นเดียว: แถวละ 1 ธีม
    rows = []
    for t in range(len(THEMES)):
        rows.append([c for c in cells if c["theme"] == THEMES[t][0]])
    PAD = 2
    W = max(sum(c["img"].width + PAD for c in r) for r in rows)
    H = sum(max(c["img"].height for c in r) + PAD for r in rows)
    atlas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    y = 0
    lst = []
    for r in rows:
        x = 0
        rh = max(c["img"].height for c in r)
        for c in r:
            atlas.alpha_composite(c["img"], (x, y))
            tid = c["theme"]
            tn = next(t[2] for t in THEMES if t[0] == tid)
            w, h = c["img"].size
            dw = DW[c["mode"]]
            lst.append({"id": f"{tid}_{c['idx']}", "theme": tid, "idx": c["idx"], "n": f"{tn} · {STYLES[c['idx']]}",
                        "x": x, "y": y, "w": w, "h": h, "fx": c["fx"], "fy": round(c["fy"], 3), "dw": dw, "dh": round(dw * h / w, 2), "mode": c["mode"]})
            x += w + PAD
        y += rh + PAD
    buf = io.BytesIO(); atlas.save(buf, "WEBP", quality=88, method=6)
    js = {"img": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(), "w": W, "h": H, "list": lst,
          "themes": [{"id": t[0], "n": t[2], "add": t[0] in ADDITIVE} for t in THEMES], "styles": STYLES}
    with open(os.path.join(GAME, "auras.js"), "w", encoding="utf-8") as fh:
        fh.write("// generated by tools/build_auras.py from " + SRC + " - do not edit by hand\nwindow.AURAS=" + json.dumps(js, separators=(",", ":"), ensure_ascii=False) + ";\n")
    os.makedirs(PREVIEW, exist_ok=True)
    bg = Image.new("RGBA", atlas.size, (60, 90, 56, 255)); bg.alpha_composite(atlas)
    bg.save(os.path.join(PREVIEW, "auras_sheet.png"))
    print(f"saved game/auras.js atlas={W}x{H} {len(buf.getvalue()) // 1024} KB webp, {len(lst)} auras")


if __name__ == "__main__":
    main()
