# สร้างสไปรต์อาชีพใหม่จากภาพแคปจอหลายแถว (Gemini): นักยิงปืน (hd_gunner) และนักอัญเชิญ (hd_summoner)
#  - ภาพเดิน/โจมตี: 1 ภาพ = 2 แถว (หน้า+หลัง หรือ ขวา+ซ้าย) มีข้อความหัวข้อคั่น → ลบตัวอักษรออกก่อน
#  - ภาพสกิล: 1 ภาพ = 4 แถว (หน้า, หลัง, ขวา, ซ้าย) • ไอคอนสกิล = ภาพกรอบสี่เหลี่ยมจากโฟลเดอร์ สกิลปืน / สกิลอัญเชิญ
# รัน:  python game/tools/build_classes.py            (ทั้งสองอาชีพ)   หรือ  ... gunner / summoner
import base64, io, json, os, sys
_argv = sys.argv[1:]
sys.argv = [sys.argv[0], "warrior"]
from PIL import Image, ImageChops
import build_ref_sprites as B

SRC = r"D:\2.SCHOOL\start 071069"
S = lambda folder, t: os.path.join(SRC, folder, f"Screenshot 2026-10-15 {t}.png")
G = lambda folder, name: os.path.join(SRC, folder, f"Gemini_Generated_Image_kcmw7kcmw7kcmw7k{name}.jpg")
DIRS = ["back", "left", "front", "right"]

CLASSES = {
    "gunner": dict(
        key="hd_gunner", body=60,
        walk=[(S("ท่าทางนักยิงปืน", "091103"), ["front", "back"]), (S("ท่าทางนักยิงปืน", "091111"), ["right", "left"])],
        attack=[(S("ท่าทางนักยิงปืน", "091122"), ["front", "back"]), (S("ท่าทางนักยิงปืน", "091135"), ["right", "left"])],
        skills=[S("สกิลปืน", "091327"), S("สกิลปืน", "091334"), S("สกิลปืน", "091341")],
        icons={"Twin Barrage": G("สกิลปืน", ""), "Hellfire Round": G("สกิลปืน", " (1)"), "Thunder Cannon": G("สกิลปืน", " (2)")},
        # ปุ่มแชร์/ดาวน์โหลดของหน้าเว็บทับหัวเฟรมสุดท้ายของท่ายิงขวา → ใช้เฟรมนั้นจากแถวซ้ายกลับด้านแทน
        fix_attack_right_last=True),
    "summoner": dict(
        key="hd_summoner", body=58,
        walk=[(S("ท่าทางนักอัญเชิญ", "091145"), ["front", "back"]), (S("ท่าทางนักอัญเชิญ", "091150"), ["right", "left"])],
        attack=[(S("ท่าทางนักอัญเชิญ", "091201"), ["front", "back"]), (S("ท่าทางนักอัญเชิญ", "091206"), ["right", "left"])],
        skills=[S("สกิลอัญเชิญ", "091350"), S("สกิลอัญเชิญ", "091357"), S("สกิลอัญเชิญ", "091403")],
        icons={"Raise Skeleton": G("สกิลอัญเชิญ", " (3)"), "Bone Prison": G("สกิลอัญเชิญ", " (4)"), "Soul Vortex": G("สกิลอัญเชิญ", " (5)")}),
}


def remove_text(cut, max_h=30):
    """ลบองค์ประกอบเล็กๆ (ตัวอักษรหัวข้อ ○ ฯลฯ): ก้อนที่สูงไม่เกิน max_h พิกเซล"""
    W, H = cut.size
    a = cut.getchannel("A")
    px = a.load()
    seen = bytearray(W * H)
    for y in range(H):
        for x in range(W):
            if px[x, y] <= 40 or seen[y * W + x]:
                continue
            stack = [(x, y)]; seen[y * W + x] = 1
            comp = []; y0 = y1 = y
            while stack:
                cx, cy = stack.pop(); comp.append((cx, cy))
                y0 = min(y0, cy); y1 = max(y1, cy)
                for nx in (cx - 1, cx, cx + 1):
                    for ny in (cy - 1, cy, cy + 1):
                        if 0 <= nx < W and 0 <= ny < H and not seen[ny * W + nx] and px[nx, ny] > 40:
                            seen[ny * W + nx] = 1; stack.append((nx, ny))
            if y1 - y0 + 1 <= max_h:
                for c in comp:
                    px[c] = 0
    out = cut.copy(); out.putalpha(a)
    return out


def split_rows(cut, n):
    """แบ่งเป็น n แถว: ตัดที่แถวพิกเซลที่ว่างที่สุดใกล้เส้นแบ่งเท่าๆ กัน"""
    W, H = cut.size
    a = cut.getchannel("A").point(lambda v: 255 if v > 40 else 0)
    prof = list(a.resize((1, H), Image.BOX).get_flattened_data()) if hasattr(a, "get_flattened_data") else list(a.resize((1, H), Image.BOX).getdata())
    cuts = [0]
    for k in range(1, n):
        c = round(H * k / n)
        lo, hi = c - int(H / n * .3), c + int(H / n * .3)
        cuts.append(min(range(lo, hi), key=lambda y: (prof[y], abs(y - c))))
    cuts.append(H)
    rows = []
    for i in range(n):
        r = cut.crop((0, cuts[i], W, cuts[i + 1]))
        bb = r.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
        rows.append(r.crop((0, bb[1], W, bb[3])) if bb else r)
    return rows


def frames_of_image(path, names, text):
    im = Image.open(path).convert("RGB")
    cut = B.cut_background(im, hole_min=120)
    if text:
        cut = remove_text(cut)
    rows = split_rows(cut, len(names))
    return {n: B.split5(r) for n, r in zip(names, rows)}


def normalize_group(groups, keep_y):
    """ปรับขนาดทั้งภาพให้เท่ากัน (มัธยฐานความสูงของทุกเฟรมในภาพ) แทนการหาต่อแถว"""
    allf = [f for fr in groups.values() for f in fr]
    hs = sorted(f.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()[3] - f.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()[1] for f in allf)
    ref = hs[len(hs) // 2]
    k = B.BODY_PX / ref
    out = {}
    for name, frames in groups.items():
        bbs = [f.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox() for f in frames]
        ground = sorted(b[3] for b in bbs)[2]
        cells = []
        for f, bb in zip(frames, bbs):
            ax = B.anchor_x(f, bb)
            sc = f.resize((max(1, round(f.width * k)), max(1, round(f.height * k))), Image.LANCZOS)
            cell = Image.new("RGBA", (B.CW, B.CH), (0, 0, 0, 0))
            cell.alpha_composite(sc, (round(B.CW / 2 - ax * k), round(B.FOOT_Y - (ground if keep_y else bb[3]) * k)))
            cells.append(cell)
        out[name] = cells
    return out


def build(cid):
    C = CLASSES[cid]
    F = {}
    for kind in ("walk", "attack"):
        for path, names in C[kind]:
            g = normalize_group(frames_of_image(path, names, True), keep_y=False)
            for n, fr in g.items():
                F[(kind, n)] = fr
            print(" ", kind, names, "ok")
    if C.get("fix_attack_right_last"):
        F[("attack", "right")][4] = F[("attack", "left")][4].transpose(Image.FLIP_LEFT_RIGHT)
    order = ["front", "back", "right", "left"]
    for si, path in enumerate(C["skills"], 1):
        g = normalize_group(frames_of_image(path, order, False), keep_y=True)
        for n, fr in g.items():
            F[(f"skill{si}", n)] = fr
        print(f"  skill{si} ok")
    for d in DIRS:
        F[("idle", d)] = B.idle_from(F[("attack", d)][0])
    animations = ["idle", "walk", "attack", "skill1", "skill2", "skill3"]
    sheet = Image.new("RGBA", (B.CW * 5, B.CH * len(animations) * 4), (0, 0, 0, 0))
    anims, row = {}, 0
    for a in animations:
        anims[a] = {}
        for d in DIRS:
            for i, f in enumerate(F[(a, d)]):
                sheet.alpha_composite(f, (i * B.CW, row * B.CH))
            anims[a][d] = [row * 5 + i for i in range(5)]
            row += 1
    fi = anims["idle"]["front"][0]
    bb = sheet.crop(((fi % 5) * B.CW, (fi // 5) * B.CH, (fi % 5 + 1) * B.CW, (fi // 5 + 1) * B.CH)).getchannel("A").point(lambda v: 255 if v > 60 else 0).getbbox()
    scale = C["body"] / (bb[3] - bb[1])
    buf = io.BytesIO(); sheet.save(buf, "WEBP", quality=90, method=6)
    key = C["key"]
    meta = {"img": "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode(), "cw": B.CW, "ch": B.CH, "cols": 5, "rows": len(animations) * 4,
            "pixel": False, "foot": round(B.FOOT_Y / B.CH, 4), "cx": .5, "body": C["body"], "scale": round(scale, 4), "anims": anims}
    js = f"// generated by tools/build_classes.py ({cid}) - do not edit by hand\nwindow.SPRITES=window.SPRITES||{{}};window.SPRITES.{key}={json.dumps(meta, separators=(',', ':'))};\n"
    with open(os.path.join(B.GAME, key + ".js"), "w", encoding="utf-8") as fh:
        fh.write(js)
    out = os.path.join(B.ROOT, "photo", cid + "_hd")
    os.makedirs(out, exist_ok=True)
    bg = Image.new("RGBA", sheet.size, (74, 106, 58, 255)); bg.alpha_composite(sheet)
    bg.resize((sheet.width // 2, sheet.height // 2)).save(os.path.join(out, "sheet_preview.png"))
    print(f"saved game/{key}.js ({len(js) // 1024} KB) scale={scale:.3f}")
    # ไอคอนสกิล
    B.OUT_DIR = out
    B.SRC = ""
    B.build_icons({n: p for n, p in C["icons"].items()})


if __name__ == "__main__":
    ids = [a for a in _argv if a in CLASSES] or list(CLASSES)
    for cid in ids:
        print("==", cid)
        build(cid)
