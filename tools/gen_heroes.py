# สร้าง pixel sprite sheet จอมเวท + นักธนู: idle / walk / attack x 4 ทิศ x 5 เฟรม (สไตล์เดียวกับ gen_devil_girl.py)
# รัน: python tools/gen_heroes.py  -> photo/mage_pixel/ และ photo/archer_pixel/
import json, math, os
from PIL import Image, ImageDraw

FW = FH = 96
OX, OY = 16, 22
COLS = 5
DIRS = ["up", "left", "down", "right"]   # ลำดับแถวแบบ LPC
ANIMS = ["idle", "walk", "attack"]
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "photo")

BASE = dict(
    skin=(255, 226, 200), skinD=(232, 174, 140), blush=(255, 160, 150), white=(255, 255, 255),
    outline=(26, 18, 22), trim=(232, 192, 84), trimD=(168, 128, 44),
)
PALS = {
    "mage": dict(BASE,
        hair=(128, 78, 42), hairD=(86, 50, 28), hairL=(178, 120, 66),
        eye=(64, 112, 204), eyeD=(28, 48, 112),
        robe=(46, 54, 116), robeD=(28, 32, 76), robeL=(78, 92, 166), boot=(58, 40, 30),
        wood=(116, 74, 42), woodD=(78, 48, 26), crystal=(130, 224, 255), crystalD=(56, 140, 222)),
    "archer": dict(BASE,
        hair=(134, 84, 44), hairD=(90, 54, 28), hairL=(186, 128, 70),
        eye=(66, 140, 70), eyeD=(30, 74, 36),
        tunic=(100, 116, 54), tunicD=(66, 78, 34), tunicL=(146, 156, 84),
        leather=(124, 82, 44), leatherD=(86, 56, 30), belt=(72, 46, 28), pants=(84, 64, 44), boot=(70, 46, 30),
        bow=(156, 104, 52), bowD=(104, 66, 32), string=(236, 232, 210),
        arrowS=(206, 176, 124), arrowT=(206, 210, 220), fletch=(214, 64, 44)),
}
PAL = PALS["mage"]

FX_MAGIC = (150, 230, 255)
FX_MAGIC2 = (230, 250, 255)
FX_WIND = (255, 250, 230)


class Pen:
    def __init__(self, d, dx=0, dy=0):
        self.d, self.dx, self.dy = d, dx, dy

    def at(self, dx, dy):
        return Pen(self.d, self.dx + dx, self.dy + dy)

    def _p(self, x, y):
        return (round(x + self.dx + OX), round(y + self.dy + OY))

    def rect(self, x0, y0, x1, y1, c):
        self.d.rectangle([self._p(x0, y0), self._p(x1, y1)], fill=PAL[c])

    def ell(self, x0, y0, x1, y1, c):
        self.d.ellipse([self._p(x0, y0), self._p(x1, y1)], fill=PAL[c])

    def poly(self, pts, c):
        self.d.polygon([self._p(x, y) for x, y in pts], fill=PAL[c])

    def line(self, pts, c, w=1):
        self.d.line([self._p(x, y) for x, y in pts], fill=PAL[c], width=w)

    def pt(self, x, y, c):
        self.d.point(self._p(x, y), fill=PAL[c])


def g(p):
    return (round(p[0] + OX), round(p[1] + OY))


def norm(x, y):
    l = math.hypot(x, y)
    return x / l, y / l


def add(a, b, k=1):
    return (a[0] + b[0] * k, a[1] + b[1] * k)


# ---------- หัว ----------

def eyes_front(p, blink):
    for ex in (24, 35):
        if blink:
            p.line([(ex, 29), (ex + 4, 29)], "eyeD")
        else:
            p.rect(ex, 26, ex + 4, 31, "eye")
            p.rect(ex, 30, ex + 4, 31, "eyeD")
            p.rect(ex, 25, ex + 4, 25, "outline")
            p.rect(ex + 1, 27, ex + 2, 28, "white")
    p.pt(22, 33, "blush"); p.pt(41, 33, "blush")
    p.line([(31, 34), (32, 34)], "skinD")


def hat_front(p):
    p.poly([(21, 14), (43, 14), (37, -1), (45, -8), (32, -4)], "robe")
    p.poly([(37, 14), (43, 14), (37, -1)], "robeD")
    p.line([(26, 7), (40, 7)], "trim", 2)
    p.ell(10, 11, 53, 21, "robeD")
    p.ell(11, 10, 52, 19, "robe")
    p.line([(16, 12), (26, 11)], "robeL")
    p.pt(31, 2, "trim"); p.pt(30, 3, "trim"); p.pt(32, 3, "trim"); p.pt(31, 4, "trim")


def hat_side(p):
    p.poly([(20, 14), (40, 14), (44, 0), (52, -5), (38, -2)], "robe")
    p.poly([(36, 14), (40, 14), (44, 0)], "robeD")
    p.line([(24, 7), (40, 7)], "trim", 2)
    p.ell(9, 11, 50, 20, "robeD")
    p.ell(10, 10, 49, 18, "robe")
    p.line([(14, 12), (24, 11)], "robeL")


def hat_back(p):
    p.poly([(21, 14), (43, 14), (37, -1), (45, -8), (32, -4)], "robe")
    p.poly([(21, 14), (27, 14), (32, -4)], "robeD")
    p.line([(26, 7), (40, 7)], "trim", 2)
    p.ell(10, 11, 53, 21, "robeD")
    p.ell(11, 10, 52, 19, "robe")


def spikes(p, side=False):
    pts = [((21, 13), (23, 3), (28, 10)), ((27, 10), (32, 1), (36, 10)), ((35, 11), (41, 4), (43, 14))]
    if side:
        pts = [((26, 11), (31, 2), (35, 10)), ((33, 10), (41, 3), (42, 13)), ((39, 14), (48, 11), (44, 20))]
    for a, b, c in pts:
        p.poly([a, b, c], "hair")
        p.line([a, b], "hairL")


def head_front(p, who, blink, sway):
    p.poly([(18, 22), (16 + sway, 35), (23, 31)], "hairD")
    p.poly([(45, 22), (47 + sway, 35), (40, 31)], "hairD")
    p.ell(17, 11, 46, 37, "hairD")
    p.ell(17, 9, 45, 35, "hair")
    if who == "archer":
        spikes(p)
    p.ell(21, 17, 42, 37, "skin")
    p.rect(20, 14, 43, 19, "hair")
    for x in range(20, 42, 4):
        p.poly([(x, 19), (x + 4, 19), (x + 1, 24)], "hair")
    p.line([(24, 12), (30, 11)], "hairL")
    eyes_front(p, blink)
    if who == "mage":
        hat_front(p)


def head_back(p, who, sway):
    p.ell(17, 9, 46, 37, "hairD")
    p.ell(17, 9, 45, 35, "hair")
    p.poly([(20, 30), (24 + sway, 39), (31, 34), (38 + sway, 39), (43, 30)], "hairD")
    for x in range(20, 44, 5):
        p.line([(x + 2, 20), (x + 1, 33)], "hairD")
    if who == "archer":
        spikes(p)
    if who == "mage":
        hat_back(p)


def head_side(p, who, blink, sway):
    p.poly([(38, 22), (45 + sway, 36), (35, 34)], "hairD")
    p.ell(19, 11, 46, 37, "hairD")
    p.ell(18, 9, 45, 35, "hair")
    if who == "archer":
        spikes(p, side=True)
    p.ell(16, 17, 34, 37, "skin")
    p.rect(17, 14, 34, 20, "hair")
    for x in range(16, 32, 4):
        p.poly([(x, 20), (x + 4, 20), (x + 1, 24)], "hair")
    p.ell(31, 26, 35, 31, "skin"); p.pt(33, 28, "skinD")      # หู
    p.line([(24, 12), (31, 11)], "hairL")
    if blink:
        p.line([(19, 29), (22, 29)], "eyeD")
    else:
        p.rect(19, 26, 22, 31, "eye")
        p.rect(19, 30, 22, 31, "eyeD")
        p.rect(19, 25, 22, 25, "outline")
        p.rect(20, 27, 20, 28, "white")
    p.pt(23, 33, "blush")
    p.pt(18, 34, "skinD")
    if who == "mage":
        hat_side(p)


# ---------- ลำตัว ----------

def mage_front(p, lL, lR, sw, back=False):
    for x, lift in ((26, lL), (34, lR)):
        p.rect(x - 1, 54 - lift, x + 4, 57 - lift, "boot")
    p.ell(19, 35, 28, 45, "robe"); p.ell(35, 35, 44, 45, "robeD")      # แขนเสื้อกว้าง
    p.poly([(25, 35), (38, 35), (44 + sw, 56), (19 + sw, 56)], "robe")
    p.poly([(34, 35), (38, 35), (44 + sw, 56), (38 + sw, 56)], "robeD")
    p.line([(19 + sw, 56), (44 + sw, 56)], "trim")
    if back:
        p.line([(31.5, 38), (31.5 + sw * 0.5, 55)], "robeD")
    else:
        p.line([(31.5, 40), (31.5 + sw * 0.5, 55)], "trim")
        p.poly([(27, 35), (36, 35), (31.5, 40)], "trim")
        p.rect(26, 43, 37, 44, "trimD")


def mage_side(p, lL, lR, sw):
    for x, lift in ((30 + sw, lL), (27 - sw, lR)):
        p.rect(x - 2, 54 - lift, x + 3, 57 - lift, "boot")
    p.poly([(27, 35), (36, 35), (41 - sw, 56), (21 + sw, 56)], "robe")
    p.poly([(33, 35), (36, 35), (41 - sw, 56), (36 - sw, 56)], "robeD")
    p.line([(21 + sw, 56), (41 - sw, 56)], "trim")
    p.line([(27, 37), (23 + sw, 55)], "trim")
    p.rect(27, 43, 36, 44, "trimD")
    p.ell(27, 35, 35, 46, "robe"); p.line([(28, 45), (34, 45)], "trim")


def legs(p, x, lift, side=False):
    w = 2 if side else 1
    p.rect(x, 48, x + 3, 54 - lift, "pants")
    p.rect(x - w, 52 - lift, x + 4 if not side else x + 3, 56 - lift, "boot")
    p.rect(x, 52 - lift, x + 3, 52 - lift, "leather")


def archer_front(p, lL, lR, back=False):
    legs(p, 26, lL); legs(p, 34, lR)
    p.ell(20, 35, 27, 41, "leather"); p.ell(36, 35, 43, 41, "leather")
    p.pt(22, 37, "tunicL"); p.pt(38, 37, "tunicL")
    p.rect(25, 36, 38, 47, "tunic"); p.rect(35, 36, 38, 47, "tunicD")
    p.poly([(24, 46), (39, 46), (41, 50), (22, 50)], "tunic")
    p.line([(22, 50), (41, 50)], "tunicD")
    p.rect(25, 44, 38, 45, "belt")
    if back:
        p.poly([(36, 28), (42, 30), (36, 48), (30, 46)], "leather")       # ซองธนู
        p.line([(36, 28), (31, 46)], "leatherD")
        for x, y in ((37, 26), (39, 27), (41, 28)):
            p.line([(x, y), (x - 1, y + 3)], "arrowS"); p.pt(x, y, "fletch"); p.pt(x + 1, y, "fletch")
    else:
        p.line([(26, 36), (37, 45)], "leatherD", 2)                       # สายซองธนูพาดอก
        p.pt(31, 44, "trim"); p.pt(32, 44, "trim")


def archer_side(p, sw, lL, lR):
    p.poly([(37, 29), (42, 31), (39, 47), (34, 46)], "leather")
    for x, y in ((38, 27), (40, 27), (42, 29)):
        p.pt(x, y, "fletch"); p.pt(x, y + 1, "fletch")
    legs(p, 31 - sw, lR, True); legs(p, 29 + sw, lL, True)
    p.rect(27, 36, 36, 47, "tunic"); p.rect(34, 36, 36, 47, "tunicD")
    p.poly([(26, 46), (37, 46), (40, 50), (23, 50)], "tunic")
    p.rect(27, 44, 36, 45, "belt"); p.pt(28, 44, "trim")
    p.ell(28, 35, 35, 41, "leather"); p.pt(30, 37, "tunicL")


def arm(p, shoulder, hand, who):
    col = "robe" if who == "mage" else "tunic"
    p.line([shoulder, hand], col, 3)
    p.rect(hand[0] - 1, hand[1] - 1, hand[0] + 1, hand[1] + 1, "skin")


# ---------- อาวุธ ----------

def staff(p, butt, tip):
    u = norm(tip[0] - butt[0], tip[1] - butt[1]); v = (-u[1], u[0])
    neck = add(tip, u, -4)
    p.line([butt, neck], "wood", 2)
    p.line([add(neck, v, 3), add(neck, v, -3)], "trim", 2)
    p.line([add(neck, v, 3), add(add(tip, v, 4), u, 2)], "trimD")
    p.line([add(neck, v, -3), add(add(tip, v, -4), u, 2)], "trimD")
    p.poly([add(tip, u, 5), add(tip, v, 3), add(tip, u, -3), add(tip, v, -3)], "crystal")
    p.poly([add(tip, u, 5), add(tip, v, -3), add(tip, u, -3)], "crystalD")
    p.pt(*add(add(tip, v, 1), u, 1), "white")


def bow(p, center, u, draw, arrow):
    v = (-u[1], u[0])
    pts = [add(add(center, v, 13 * t), u, 4 * (1 - t * t)) for t in [k / 4 - 1 for k in range(9)]]
    s = add(center, u, -draw)
    p.line([pts[0], s, pts[-1]], "string")
    p.line(pts, "bow", 2)
    p.line(pts[3:6], "bowD", 2)
    if arrow:
        tip = add(s, u, 19)
        p.line([s, tip], "arrowS")
        p.poly([add(tip, u, 3), add(tip, v, 1.5), add(tip, v, -1.5)], "arrowT")
        p.pt(*add(add(s, u, 1), v, 1), "fletch"); p.pt(*add(add(s, u, 1), v, -1), "fletch")
    return s


# ---------- เฟรม ----------

WALK_BOB = [0, -1, 0, -1, 0]
WALK_LL = [0, 2, 1, 0, 0]
WALK_LR = [0, 0, 0, 2, 1]
WALK_SW = [0, 2, 1, -1, -2]
IDLE_BOB = [0, 0, 1, 1, 0]
MAGE_EXT = [0, -4, 5, 8, 2]
MAGE_LEAN = [0, 1, -1, -2, -1]
BOW_DRAW = [0, 3, 7, 0, 0]
BOW_LEAN = [0, 1, 1, -1, 0]


def frame(who, direction, anim, i):
    img = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    flip = direction == "right"
    view = "left" if flip else direction

    bob, lL, lR, sw, sway, blink = 0, 0, 0, 0, 0, False
    lean_x = lean_y = 0
    fx = []
    behind, front = [], []      # อาวุธ: วาดหลังลำตัว / หน้าลำตัว (ฟังก์ชันรับ Pen)
    arms = []                   # (shoulder, hand) วาดทับสุด

    if anim == "idle":
        bob = IDLE_BOB[i]; sway = [0, 0, 1, 1, 0][i]; blink = i == 3
    elif anim == "walk":
        bob = WALK_BOB[i]; lL, lR, sw = WALK_LL[i], WALK_LR[i], WALK_SW[i]
        sway = [0, 1, 0, -1, 0][i]
    else:
        lean = (MAGE_LEAN if who == "mage" else BOW_LEAN)[i]
        if view == "down": lean_y = -lean
        if view == "up": lean_y = lean
        if view == "left": lean_x = lean
        lL = 1 if i == 1 else 0

    hb = bob + lean_y
    if who == "mage":
        if anim != "attack":
            if view == "down":
                front.append(lambda p: staff(p, (15, 58 + bob), (15, 4 + bob)))
                arms.append(((23, 39 + bob), (15, 44 + bob)))
            elif view == "up":
                front.append(lambda p: staff(p, (48, 58 + bob), (48, 4 + bob)))
                arms.append(((40, 39 + bob), (48, 44 + bob)))
            else:
                behind.append(lambda p: staff(p, (41, 57 + bob), (43, 2 + bob)))
        else:
            e = MAGE_EXT[i]
            if view == "down":
                u = norm(0.2, 1); h0, sh, fr = (25, 42), (25, 38), True
            elif view == "up":
                u = norm(0.25, -1); h0, sh, fr = (40, 37), (39, 38), False
            else:
                u = norm(-1, -0.2); h0, sh, fr = (26, 41), (32, 39), True
            hand = (h0[0] + lean_x + u[0] * e * 0.6, h0[1] + hb + u[1] * e * 0.6)
            reach = {"down": 15, "up": 24}.get(view, 18)
            butt, tip = add(hand, u, -12), add(hand, u, reach + e * 0.3)
            (front if fr else behind).append(lambda p, b=butt, t=tip: staff(p, b, t))
            if fr:
                arms.append(((sh[0] + lean_x, sh[1] + hb), hand))
            r = [0, 3, 5, 6, 2][i]
            if r:
                al = [0, 140, 190, 220, 110][i]
                fx.append(lambda dd, t=tip, r=r, al=al: dd.ellipse([g((t[0] - r, t[1] - r)), g((t[0] + r, t[1] + r))], outline=FX_MAGIC + (al,), width=1))
            if i in (3, 4):   # ลูกเวทหลุดออกจากไม้เท้า
                k = 12 if i == 3 else 22
                o = add(tip, u, k); rr = 3 if i == 3 else 2
                fx.append(lambda dd, o=o, rr=rr: dd.ellipse([g((o[0] - rr - 1, o[1] - rr - 1)), g((o[0] + rr + 1, o[1] + rr + 1))], fill=FX_MAGIC + (200,)))
                fx.append(lambda dd, o=o, rr=rr: dd.ellipse([g((o[0] - rr + 1, o[1] - rr + 1)), g((o[0] + rr - 1, o[1] + rr - 1))], fill=FX_MAGIC2 + (255,)))
                for j in range(3):
                    s = add(o, u, -4 - j * 3)
                    fx.append(lambda dd, s=s, j=j: dd.point(g(s), fill=FX_MAGIC + (200 - j * 50,)))
            if i == 2:
                for a in range(4):   # ประกายรอบคริสตัล
                    q = (tip[0] + math.cos(a * 1.57 + 0.6) * 7, tip[1] + math.sin(a * 1.57 + 0.6) * 7)
                    fx.append(lambda dd, q=q: dd.point(g(q), fill=FX_MAGIC2 + (255,)))
    else:
        if anim != "attack":
            if view == "down":
                front.append(lambda p: bow(p, (13, 44 + bob), (-1, 0), 0, False))
                arms.append(((23, 39 + bob), (14, 44 + bob)))
            elif view == "up":
                front.append(lambda p: bow(p, (50, 44 + bob), (1, 0), 0, False))
                arms.append(((40, 39 + bob), (49, 44 + bob)))
            else:
                behind.append(lambda p: bow(p, (41, 42 + bob), (1, 0), 0, False))
        else:
            dr = BOW_DRAW[i]
            if view == "down":
                u = (0, 1); c, fr = (31 + lean_x, 47 + hb), True
                shf, shb = (24, 39 + hb), (39, 39 + hb)
            elif view == "up":
                u = (0, -1); c, fr = (31 + lean_x, 27 + hb), False
                shf = shb = None
            else:
                u = (-1, 0); c, fr = (18 + lean_x, 41 + hb), True
                shf, shb = (29 + lean_x, 39 + hb), (33 + lean_x, 39 + hb)
            if i == 4:
                c = add(c, (0, 1))
            s = add(c, u, -dr)
            (front if fr else behind).append(lambda p, c=c, u=u, dr=dr: bow(p, c, u, dr, i in (1, 2)))
            if shf:
                arms.append((shb, s))
                arms.append((shf, c))
            if i == 3:   # ลูกศรพุ่ง + สายลม
                a0, a1 = add(c, u, 24), add(c, u, 40)
                fx.append(lambda dd, a0=a0, a1=a1: dd.line([g(a0), g(a1)], fill=PAL["arrowS"] + (255,), width=1))
                fx.append(lambda dd, a1=a1, u=u: dd.polygon([g(add(a1, u, 3)), g(add(a1, (-u[1], u[0]), 1.5)), g(add(a1, (u[1], -u[0]), 1.5))], fill=PAL["arrowT"] + (255,)))
                v = (-u[1], u[0])
                for k in (-1, 1):
                    b0, b1 = add(add(c, u, 14), v, 4 * k), add(add(c, u, 28), v, 4 * k)
                    fx.append(lambda dd, b0=b0, b1=b1: dd.line([g(b0), g(b1)], fill=FX_WIND + (150,), width=1))
            if i == 2:
                fx.append(lambda dd, s=s: dd.point(g(s), fill=FX_WIND + (255,)))

    base = Pen(d)
    body = base.at(lean_x, bob + lean_y)
    for fn in behind:
        fn(base)
    if view in ("down", "up"):
        if who == "mage":
            mage_front(base.at(lean_x, 0), lL, lR, sw if view == "down" else -sw, back=view == "up")
        else:
            archer_front(base.at(lean_x, 0), lL, lR, back=False)
        if view == "down":
            head_front(body, who, blink, sway)
        else:
            head_back(body, who, sway)
            if who == "archer":
                archer_front_back_overlay(body)
        if not arms:
            arm(body, (40 if view == "down" else 23, 39), (41 if view == "down" else 22, 45), who)
        elif view == "down" and len(arms) == 1:
            arm(body, (40, 39), (41, 45), who)
        elif view == "up" and len(arms) == 1:
            arm(body, (23, 39), (22, 45), who)
    else:
        if who == "mage":
            mage_side(base.at(lean_x, 0), lL, lR, sw // 2)
        else:
            archer_side(base.at(lean_x, 0), sw, lL, lR)
        head_side(body, who, blink, sway)
        if not arms:
            arm(body, (31, 39), (29, 45), who)
    for fn in front:
        fn(base)
    for sh, hd in arms:
        arm(base, sh, hd, who)

    img = outline(img)
    if fx:
        d2 = ImageDraw.Draw(img)
        for fn in fx:
            fn(d2)

    out = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    sd = ImageDraw.Draw(out)
    sx = OX + 31.5 + lean_x
    sd.ellipse([sx - 12, OY + 54, sx + 12, OY + 60], fill=(0, 0, 0, 70))   # เงาพื้น 2.5D
    out.alpha_composite(img)
    if flip:
        out = out.transpose(Image.FLIP_LEFT_RIGHT)
    return out


def archer_front_back_overlay(p):
    """ซองธนูบนหลัง (มุมหลัง) วาดทับผม"""
    p.poly([(36, 28), (42, 30), (36, 48), (30, 46)], "leather")
    p.line([(36, 28), (31, 46)], "leatherD")
    p.line([(23, 37), (37, 46)], "leatherD", 2)
    for x, y in ((37, 25), (39, 26), (41, 27)):
        p.line([(x, y), (x - 1, y + 4)], "arrowS"); p.pt(x, y, "fletch"); p.pt(x + 1, y, "fletch")


def outline(img):
    w, h = img.size
    src = img.load()
    res = img.copy()
    dst = res.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3]:
                continue
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3]:
                    dst[x, y] = BASE["outline"] + (255,)
                    break
    return res


def build(who):
    global PAL
    PAL = PALS[who]
    out = os.path.join(ROOT, f"{who}_pixel")
    os.makedirs(out, exist_ok=True)
    sheet = Image.new("RGBA", (FW * COLS, FH * len(ANIMS) * len(DIRS)), (0, 0, 0, 0))
    frames, row = {}, 0
    meta = {"frameWidth": FW, "frameHeight": FH, "framesPerAnim": COLS, "dirs": DIRS, "anims": {}}
    for a in ANIMS:
        meta["anims"][a] = {}
        for dname in DIRS:
            fl = [frame(who, dname, a, i) for i in range(COLS)]
            frames[(a, dname)] = fl
            for i, f in enumerate(fl):
                sheet.paste(f, (i * FW, row * FH))
            meta["anims"][a][dname] = row
            row += 1
    sheet.save(os.path.join(out, f"{who}_sheet.png"))
    with open(os.path.join(out, f"{who}_sheet.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)
    S = 4
    for a in ANIMS:
        gif = []
        for i in range(COLS):
            canvas = Image.new("RGBA", (FW * 4, FH), (60, 66, 80, 255))
            for k, dname in enumerate(DIRS):
                canvas.alpha_composite(frames[(a, dname)][i], (k * FW, 0))
            gif.append(canvas.resize((FW * 4 * S, FH * S), Image.NEAREST).convert("P", palette=Image.ADAPTIVE))
        dur = {"idle": 220, "walk": 130, "attack": 110}[a]
        gif[0].save(os.path.join(out, f"preview_{a}.gif"), save_all=True, append_images=gif[1:], duration=dur, loop=0, disposal=2)
    bg = Image.new("RGBA", sheet.size, (60, 66, 80, 255))
    bg.alpha_composite(sheet)
    bg.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(os.path.join(out, "preview_sheet_x3.png"))
    print("saved", os.path.abspath(out))


if __name__ == "__main__":
    for w in ("mage", "archer"):
        build(w)
