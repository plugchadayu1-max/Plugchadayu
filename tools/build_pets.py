# แปลงชีตสัตว์เลี้ยง (Gemini 5 เฟรม x 4 ทิศ พื้นขาว) -> game/pets/*.png + game/pets_sprites.js
# แถว: 0 หน้า, 1 ซ้าย, 2 ขวา, 3 หลัง   รัน: python game/tools/build_pets.py
import json, os
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)
SRC = r"D:\2.SCHOOL\start 071069\สัตว์เลี้ยง"
OUT = os.path.join(GAME, "pets")
CELL = 200
FOOT = 188
PETS = {  # key: (ไฟล์, ความสูงตัวในเกม)
    "pet_dog": ("Gemini_Generated_Image_xma4s1xma4s1xma4.jpg", 26),
    "pet_cat": ("Gemini_Generated_Image_xma4s1xma4s1xma4 (1).jpg", 24),
    "pet_eagle": ("Gemini_Generated_Image_xma4s1xma4s1xma4 (2).jpg", 28),
    "pet_dragon": ("Gemini_Generated_Image_xma4s1xma4s1xma4 (3).jpg", 30),
    "pet_fairy": ("fairy_v2.jpg", 32),
}
ROWS = ["front", "left", "right", "back"]
os.makedirs(OUT, exist_ok=True)


def cutout(im):
    rgb = im.convert("RGB")
    r, g, b = rgb.split()
    mn = ImageChops.darker(ImageChops.darker(r, g), b)
    mask = mn.point(lambda v: 0 if v > 225 else 255)      # 0 = ขาว, 255 = เนื้อภาพ
    W, H = mask.size
    for p in [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1)]:
        if mask.getpixel(p) == 0:
            ImageDraw.floodfill(mask, p, 128)
    alpha = mask.point(lambda v: 0 if v == 128 else 255)
    alpha = alpha.filter(ImageFilter.MinFilter(3))        # ตัดขอบขาว 1 พิกเซล
    out = rgb.copy()
    out.putalpha(alpha)
    return out


meta_all = {}
for key, (fn, body) in PETS.items():
    im = cutout(Image.open(os.path.join(SRC, fn)))
    W, H = im.size
    cw, ch = W / 5, H / 4
    cells = []
    for r in range(4):
        for c in range(5):
            cell = im.crop((round(c * cw), round(r * ch), round((c + 1) * cw), round((r + 1) * ch)))
            bb = cell.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
            cells.append((cell.crop(bb), ) if bb else (cell, ))
    mh = max(c[0].height for c in cells)
    mw = max(c[0].width for c in cells)
    s = min((FOOT - 4) / mh, (CELL - 4) / mw)
    sheet = Image.new("RGBA", (CELL * 5, CELL * 4), (0, 0, 0, 0))
    for i, (c,) in enumerate(cells):
        t = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
        x = (i % 5) * CELL + (CELL - t.width) // 2
        y = (i // 5) * CELL + FOOT - t.height
        sheet.paste(t, (x, y))
    sheet.save(os.path.join(OUT, key + ".png"), optimize=True)
    scale = body / (mh * s)
    anims = {"walk": {}, "idle": {}}
    for r, d in enumerate(ROWS):
        fr = [r * 5 + k for k in range(5)]
        anims["walk"][d] = fr
        anims["idle"][d] = [fr[0], fr[1]] if key in ("pet_dog", "pet_cat") else fr
    meta_all[key] = {"img": "pets/" + key + ".png", "cw": CELL, "ch": CELL, "cols": 5, "rows": 4, "pixel": False,
                     "foot": round(FOOT / CELL, 4), "cx": 0.5, "body": body, "scale": round(scale, 4), "anims": anims}
    print(key, "scale", round(scale, 4))

with open(os.path.join(GAME, "pets_sprites.js"), "w", encoding="utf-8") as f:
    f.write("// สร้างจาก tools/build_pets.py (ชีตสัตว์เลี้ยง: หมา แมว นกอินทรี มังกร ภูติ)\n")
    f.write("window.SPRITES=Object.assign(window.SPRITES||{}," + json.dumps(meta_all, ensure_ascii=False) + ");\n")

