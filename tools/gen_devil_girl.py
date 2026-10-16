# สร้าง pixel sprite sheet ตัวละครสาวปีศาจถือหอก: idle / walk / attack / skill1-3 x 4 ทิศ x 5 เฟรม
# รัน: python tools/gen_devil_girl.py  -> ผลลัพธ์อยู่ที่ photo/devil_girl_pixel/
import json, math, os
from PIL import Image, ImageDraw

FW = FH = 96          # ขนาดเฟรม (เผื่อที่กระโดด/ควงหอก)
OX, OY = 16, 22        # offset จากพิกัด local (0..63) ไปพิกัดเฟรม
COLS = 5
DIRS = ["up", "left", "down", "right"]   # ลำดับแถวแบบ LPC
ANIMS = ["idle", "walk", "attack", "skill1", "skill2", "skill3"]   # skill1 แทงหนัก, skill2 ควงครึ่งรอบ, skill3 กระโดดทุบ
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "photo", "devil_girl_pixel")

C = dict(
    hair=(255, 128, 30), hairD=(214, 70, 18), hairL=(255, 196, 120),
    skin=(255, 228, 206), skinD=(238, 178, 150), blush=(255, 150, 140),
    eye=(196, 36, 24), eyeD=(90, 14, 14), white=(255, 255, 255),
    horn=(34, 28, 40), hornL=(88, 76, 100),
    arm=(40, 36, 48), armD=(26, 22, 32), armL=(78, 70, 92), trim=(242, 98, 22),
    shaft=(70, 44, 40), blade=(255, 112, 32), bladeD=(190, 52, 12), bladeL=(255, 200, 140),
    outline=(28, 14, 20),
)


class Pen:
    def __init__(self, d, dx=0, dy=0):
        self.d, self.dx, self.dy = d, dx, dy

    def at(self, dx, dy):
        return Pen(self.d, self.dx + dx, self.dy + dy)

    def _p(self, x, y):
        return (round(x + self.dx + OX), round(y + self.dy + OY))

    def rect(self, x0, y0, x1, y1, c):
        self.d.rectangle([self._p(x0, y0), self._p(x1, y1)], fill=C[c])

    def ell(self, x0, y0, x1, y1, c):
        self.d.ellipse([self._p(x0, y0), self._p(x1, y1)], fill=C[c])

    def poly(self, pts, c):
        self.d.polygon([self._p(x, y) for x, y in pts], fill=C[c])

    def line(self, pts, c, w=1):
        self.d.line([self._p(x, y) for x, y in pts], fill=C[c], width=w)

    def pt(self, x, y, c):
        self.d.point(self._p(x, y), fill=C[c])


def norm(x, y):
    l = math.hypot(x, y)
    return x / l, y / l


# ---------- ชิ้นส่วน ----------

def spear(p, butt, tip):
    ux, uy = norm(tip[0] - butt[0], tip[1] - butt[1])
    px, py = -uy, ux
    base = (tip[0] - ux * 11, tip[1] - uy * 11)
    p.line([butt, base], "shaft", 2)
    # ใบหอกทรงธง
    p.poly([tip, (tip[0] - ux * 5 + px * 3.5, tip[1] - uy * 5 + py * 3.5), base,
            (tip[0] - ux * 6 - px * 2.5, tip[1] - uy * 6 - py * 2.5)], "blade")
    p.line([(tip[0] - ux * 2, tip[1] - uy * 2), (base[0] + ux, base[1] + uy)], "bladeD")
    p.line([(base[0] + px * 3, base[1] + py * 3), (base[0] - px * 3, base[1] - py * 3)], "horn", 2)
    p.pt(tip[0] - ux * 3 + px, tip[1] - uy * 3 + py, "bladeL")


def horns(p, side=False):
    if side:
        p.poly([(24, 15), (20, 9), (20, 4), (22, 0), (22, 6), (24, 9), (28, 13)], "horn")
        p.pt(22, 5, "hornL")
        p.poly([(36, 13), (39, 8), (39, 4), (37, 0), (41, 4), (41, 9), (39, 14)], "horn")
    else:
        for s in (1, -1):
            x = lambda v: 31.5 + s * (v - 31.5)
            p.poly([(x(24), 16), (x(20), 10), (x(20), 5), (x(22), 0), (x(22), 6), (x(24), 10), (x(28), 13)], "horn")
            p.pt(x(21), 5, "hornL")


def legs_front(p, liftL, liftR):
    for x, lift in ((26, liftL), (34, liftR)):
        p.rect(x, 46, x + 3, 54 - lift, "arm")
        p.rect(x - 1, 52 - lift, x + 4, 56 - lift, "arm")
        p.rect(x, 49 - lift, x + 3, 49 - lift, "trim")
        p.pt(x + 3, 54 - lift, "armL")


def legs_side(p, swing, liftF, liftB):
    for x, lift, col in ((31 - swing, liftB, "armD"), (29 + swing, liftF, "arm")):
        p.rect(x, 46, x + 3, 54 - lift, col)
        p.rect(x - 2, 52 - lift, x + 3, 56 - lift, col)
        p.rect(x, 49 - lift, x + 3, 49 - lift, "trim")


def torso_front(p, back=False):
    p.ell(20, 35, 27, 41, "arm"); p.ell(36, 35, 43, 41, "arm")       # เกราะไหล่
    p.pt(22, 37, "armL"); p.pt(38, 37, "armL")
    p.rect(26, 36, 37, 39, "arm")                                     # เกราะอก
    p.rect(26, 39, 37, 39, "trim")
    p.rect(27, 40, 36, 41, "armD" if back else "skin")                # เอว
    p.poly([(25, 42), (38, 42), (41, 49), (22, 49)], "arm")           # กระโปรงเกราะ
    p.line([(25, 42), (38, 42)], "trim")
    p.line([(22, 49), (41, 49)], "armD")
    if not back:
        p.poly([(29, 44), (34, 44), (31.5, 47)], "trim")
    else:
        p.line([(31, 43), (31, 48)], "armD")


def torso_side(p):
    p.rect(27, 36, 36, 39, "arm")
    p.rect(27, 39, 36, 39, "trim")
    p.rect(28, 40, 35, 41, "skin")
    p.poly([(26, 42), (37, 42), (40, 49), (23, 49)], "arm")
    p.line([(26, 42), (37, 42)], "trim")
    p.poly([(26, 44), (29, 44), (27.5, 47)], "trim")
    p.ell(28, 35, 35, 41, "arm"); p.pt(30, 37, "armL")               # เกราะไหล่ด้านหน้า


def arm(p, shoulder, hand):
    p.line([shoulder, hand], "arm", 3)
    p.rect(hand[0] - 1, hand[1] - 1, hand[0] + 1, hand[1] + 1, "armD")
    p.pt(hand[0] - 1, hand[1] - 1, "armL")


def head_front(p, blink=False, sway=0):
    horns(p)
    p.poly([(18, 22), (16 + sway, 40), (22, 35), (23, 24)], "hairD")   # ปอยผมข้าง
    p.poly([(45, 22), (47 + sway, 40), (41, 35), (40, 24)], "hairD")
    p.ell(18, 11, 46, 37, "hairD")
    p.ell(17, 9, 45, 35, "hair")
    p.poly([(20, 26), (12, 22), (20, 31)], "skin"); p.pt(16, 25, "skinD")   # หูแหลม
    p.poly([(43, 26), (51, 22), (43, 31)], "skin"); p.pt(47, 25, "skinD")
    p.ell(21, 17, 42, 37, "skin")
    p.rect(21, 14, 42, 20, "hair")
    for i, x in enumerate(range(21, 42, 4)):
        p.poly([(x, 20), (x + 4, 20), (x + 2 - (i % 2), 24 + (i % 2))], "hair")
    p.line([(24, 12), (30, 11)], "hairL"); p.pt(33, 12, "hairL")
    for ex in (24, 35):
        if blink:
            p.line([(ex, 29), (ex + 4, 29)], "eyeD")
        else:
            p.rect(ex, 26, ex + 4, 31, "eye")
            p.rect(ex, 30, ex + 4, 31, "eyeD")
            p.rect(ex, 25, ex + 4, 25, "outline")
            p.rect(ex + 1, 27, ex + 2, 28, "white")
            p.pt(ex + 3, 30, "blush")
    p.pt(22, 33, "blush"); p.pt(41, 33, "blush")
    p.line([(31, 34), (32, 34)], "skinD")


def head_back(p, sway=0):
    horns(p)
    p.poly([(43, 26), (51, 22), (43, 31)], "skin")
    p.poly([(20, 26), (12, 22), (20, 31)], "skin")
    p.poly([(18, 24), (17 + sway, 41), (31.5, 38), (46 + sway, 41), (45, 24)], "hairD")
    p.ell(17, 9, 46, 37, "hairD")
    p.ell(17, 9, 45, 35, "hair")
    for x in range(19, 44, 5):
        p.line([(x + 2, 22), (x + 1, 34)], "hairD")
    p.line([(24, 12), (30, 11)], "hairL")


def head_side(p, blink=False, sway=0):
    horns(p, side=True)
    p.poly([(38, 22), (46 + sway, 40), (35, 36)], "hairD")
    p.ell(19, 11, 46, 37, "hairD")
    p.ell(18, 9, 45, 35, "hair")
    p.ell(16, 17, 34, 37, "skin")
    p.rect(17, 14, 34, 20, "hair")
    for i, x in enumerate(range(16, 32, 4)):
        p.poly([(x, 20), (x + 4, 20), (x + 1, 24 + (i % 2))], "hair")
    p.poly([(31, 28), (41, 23), (33, 32)], "skin"); p.pt(36, 26, "skinD")  # หูชี้ไปด้านหลัง
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


# ---------- เฟรม ----------

WALK_BOB = [0, -1, 0, -1, 0]
WALK_LL = [0, 2, 1, 0, 0]
WALK_LR = [0, 0, 0, 2, 1]
WALK_SW = [0, 2, 1, -1, -2]
IDLE_BOB = [0, 0, 1, 1, 0]
ATK_EXT = [0, -3, 6, 10, 3]
ATK_LEAN = [0, 1, -1, -2, -1]   # บวก = ถอยหลัง, ลบ = พุ่งไปข้างหน้า
# สกิล 1 แทงหนัก: ง้างลึก แทงยาวกว่าโจมตีปกติ
SK1_EXT = [-6, -9, 12, 17, 7]
SK1_LEAN = [1, 2, -2, -3, -1]
# สกิล 2 ควงครึ่งรอบ: มุมหอกเทียบทิศหน้า (องศา)
SK2_ANG = [-125, -65, 0, 65, 120]
# สกิล 3 กระโดดทุบ: ความสูงลอย / ย่อตัว / ยกขา
SK3_AIR = [0, 12, 17, 0, 0]
SK3_CROUCH = [3, 0, 0, 3, 1]
SK3_LIFT = [0, 2, 3, 0, 0]

FACE = {"down": (0, 1), "up": (0, -1), "left": (-1, 0)}
CENTER = (31.5, 41)
FX_HOT = (255, 236, 200)
FX_FIRE = (255, 140, 40)
FX_DEEP = (230, 60, 20)


def thrust_pose(view, e, lean_x, lean_y, bob, long=False):
    if view == "down":
        u = norm(0.25, 1); h0, sh, front = (25, 43), (25, 38), True
    elif view == "up":
        u = norm(0.3, -1); h0, sh, front = (40, 38), (39, 38), False
    else:
        u = norm(-1, 0.06); h0, sh, front = (27, 43), (32, 39), True
    hand = (h0[0] + lean_x + u[0] * e * 0.6, h0[1] + bob + lean_y + u[1] * e * 0.6)
    back = {"down": 10, "up": 6}.get(view, 14)
    reach = {"down": 19, "up": 28}.get(view, 20) + (4 if long else 0)
    sp = ((hand[0] - u[0] * back, hand[1] - u[1] * back),
          (hand[0] + u[0] * (reach + e * 0.4), hand[1] + u[1] * (reach + e * 0.4)))
    return hand, (sh[0] + lean_x, sh[1] + bob + lean_y), sp, front, u


def rot(f, deg):
    a = math.radians(deg)
    x = f[0] * math.cos(a) - f[1] * math.sin(a)
    y = f[0] * math.sin(a) + f[1] * math.cos(a)
    return x, y * 0.55          # บีบแกน y = พื้นราบมุมมอง 2.5D


def frame(direction, anim, i):
    img = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    flip = direction == "right"
    view = "left" if flip else direction

    bob, lL, lR, sw, sway, blink = 0, 0, 0, 0, 0, False
    lean_x = lean_y = 0
    air = crouch = 0
    fx = []   # ฟังก์ชันวาดเอฟเฟกต์ (วาดหลัง outline, พิกัด local)
    hand = sh = None
    sp, sp_front = None, False

    if anim == "idle":
        bob = IDLE_BOB[i]; sway = [0, 0, 1, 1, 0][i]; blink = i == 3
    elif anim == "walk":
        bob = WALK_BOB[i]; lL, lR, sw = WALK_LL[i], WALK_LR[i], WALK_SW[i]
        sway = [0, 1, 0, -1, 0][i]
    elif anim in ("attack", "skill1"):
        sk = anim == "skill1"
        lean = (SK1_LEAN if sk else ATK_LEAN)[i]
        if view == "down": lean_y = -lean
        if view == "up": lean_y = lean
        if view == "left": lean_x = lean
        lL = 1 if i == 1 else 0
        e = (SK1_EXT if sk else ATK_EXT)[i]
        hand, sh, sp, sp_front, u = thrust_pose(view, e, lean_x, lean_y, bob, long=sk)
        if i in (2, 3):
            t = sp[1]; px, py = -u[1], u[0]
            n = (20 if i == 3 else 14) + (8 if sk else 0)
            for k in (-1, 1):
                a = (t[0] - u[0] * 8 + px * 5 * k, t[1] - u[1] * 8 + py * 5 * k)
                b = (t[0] - u[0] * n + px * 5 * k, t[1] - u[1] * n + py * 5 * k)
                fx.append(lambda dd, a=a, b=b: dd.line([g(a), g(b)], fill=FX_HOT + (170,), width=1))
            if sk:   # ไฟนรกไหลตามด้ามหอก + ประกายที่ปลาย
                for j in range(6):
                    q = 6 + j * 3.5
                    off = (2.5 if j % 2 else -2.5) * (1 if i == 2 else 1.4)
                    p0 = (t[0] - u[0] * q + px * off, t[1] - u[1] * q + py * off)
                    col = [FX_HOT, FX_FIRE, FX_DEEP][j % 3]
                    fx.append(lambda dd, p0=p0, col=col: dd.rectangle([g(p0), g((p0[0] + 1, p0[1] + 1))], fill=col + (230,)))
                r = 5 if i == 3 else 3
                fx.append(lambda dd, t=t, r=r: dd.ellipse([g((t[0] - r, t[1] - r)), g((t[0] + r, t[1] + r))], outline=FX_FIRE + (220,), width=1))
    elif anim == "skill2":
        f = FACE[view]
        ang = SK2_ANG[i]
        u = rot(f, ang)
        lean = [1, 0, -1, -1, 0][i]
        lean_x, lean_y = f[0] * -lean, f[1] * -lean
        bob = [1, 0, 0, 0, 1][i]
        lL, lR = ([0, 1, 0, 0, 0][i], [0, 0, 0, 1, 0][i])
        cx, cy = CENTER[0] + lean_x, CENTER[1] + bob + lean_y
        hand = (cx + u[0] * 11, cy + u[1] * 11 + 2)
        sh = (cx + (7 if hand[0] >= cx else -7), 38 + bob + lean_y)
        sp = ((cx - u[0] * 7, cy - u[1] * 7 + 2), (cx + u[0] * 31, cy + u[1] * 31 + 2))
        sp_front = u[1] > -0.08
        if i > 0:   # รอยโค้งที่ปลายหอกกวาดผ่าน
            a0 = SK2_ANG[i - 1]
            pts = []
            for k in range(9):
                vv = rot(f, a0 + (ang - a0) * k / 8)
                pts.append((cx + vv[0] * 29, cy + vv[1] * 29 + 2))
            inner = [(cx + (p[0] - cx) * 0.8, cy + (p[1] - cy) * 0.8) for p in pts]
            fx.append(lambda dd, pts=pts: dd.line([g(p) for p in pts], fill=FX_FIRE + (200,), width=3))
            fx.append(lambda dd, pts=pts: dd.line([g(p) for p in pts[3:]], fill=FX_HOT + (230,), width=1))
            fx.append(lambda dd, pts=inner: dd.line([g(p) for p in pts[2:]], fill=FX_DEEP + (140,), width=1))
    elif anim == "skill3":
        air, crouch = SK3_AIR[i], SK3_CROUCH[i]
        lL = lR = SK3_LIFT[i]
        if view == "down":
            P3 = [((16, 40), (16, 54), (16, -2), True), ((17, 33), (15, 48), (19, -10), True),
                  ((22, 33), (14, 20), (31, 60), True), ((28, 46), (24, 30), (33, 71), True),
                  ((28, 45), (24, 29), (33, 71), True)]
            shp = (23, 39)
        elif view == "up":
            P3 = [((47, 40), (47, 54), (47, -2), True), ((46, 33), (48, 48), (44, -10), True),
                  ((44, 31), (50, 44), (38, 2), True), ((40, 36), (46, 12), (36, 46), False),
                  ((40, 36), (46, 13), (36, 46), False)]
            shp = (40, 39)
        else:
            P3 = [(None, (41, 57), (43, 0), False), (None, (41, 50), (43, -8), False),
                  ((26, 33), (40, 20), (12, 56), True), ((24, 45), (36, 28), (11, 64), True),
                  ((24, 44), (36, 27), (11, 64), True)]
            shp = (31, 39)
        hnd, b0, t0, sp_front = P3[i]
        lift = -air + (crouch if i >= 3 else 0)
        sp = ((b0[0], b0[1] + lift), (t0[0], t0[1] + lift))
        if hnd:
            hand = (hnd[0], hnd[1] - air + crouch)
            sh = (shp[0], shp[1] - air + crouch)
        if i >= 3:   # คลื่นกระแทกรอบตัว + เสาไฟเล็กๆ
            rx, ry, al = (22, 7, 230) if i == 3 else (34, 11, 160)
            fx.append(lambda dd, rx=rx, ry=ry, al=al: dd.ellipse([g((31.5 - rx, 56 - ry)), g((31.5 + rx, 56 + ry))], outline=FX_FIRE + (al,), width=2))
            fx.append(lambda dd, rx=rx, ry=ry: dd.ellipse([g((31.5 - rx + 3, 56 - ry + 1)), g((31.5 + rx - 3, 56 + ry - 1))], outline=FX_HOT + (150,), width=1))
            for k in range(8):
                a = k / 8 * math.tau + (0.4 if i == 4 else 0)
                x, y = 31.5 + math.cos(a) * rx, 56 + math.sin(a) * ry
                h = 4 if i == 3 else 7
                fx.append(lambda dd, x=x, y=y, h=h: dd.rectangle([g((x - 1, y - h)), g((x, y))], fill=FX_FIRE + (220,)))
                fx.append(lambda dd, x=x, y=y, h=h: dd.point(g((x, y - h - 1)), fill=FX_HOT + (240,)))
            if i == 3:
                for k in range(6):   # เศษหินกระเด็น
                    a = k / 6 * math.tau + 0.3
                    x, y = 31.5 + math.cos(a) * 14, 50 + math.sin(a) * 6 - 4
                    fx.append(lambda dd, x=x, y=y: dd.rectangle([g((x, y)), g((x + 1, y + 1))], fill=(120, 96, 80, 255)))

    # ถือหอกปกติ (idle / walk)
    if sp is None:
        hb = bob
        if view == "down":
            hand, sh, sp_front = (15, 44 + hb), (23, 39 + hb), True
            sp = ((15, 58 + hb), (15, 1 + hb))
        elif view == "up":
            hand, sh, sp_front = (48, 44 + hb), (40, 39 + hb), True
            sp = ((48, 58 + hb), (48, 1 + hb))
        else:
            sp = ((41, 57 + hb), (43, 0 + hb))

    base = Pen(d).at(0, -air)
    body = base.at(lean_x, bob + lean_y + crouch)

    if not sp_front:
        spear(Pen(d), *sp)

    legs = base.at(lean_x, 0)
    if view in ("down", "up"):
        legs_front(legs, lL, lR)
        torso_front(body, back=view == "up")
        if view == "down":
            head_front(body, blink, sway)
            if hand is None or hand[0] < 31: arm(body, (40, 39), (41, 45))
        else:
            head_back(body, sway)
            if hand is None or hand[0] > 32: arm(body, (23, 39), (22, 45))
    else:
        legs_side(legs, sw, lL, lR)
        torso_side(body)
        head_side(body, blink, sway)
        if hand is None:
            arm(body, (31, 39), (29, 45))

    if sp_front:
        spear(Pen(d), *sp)
    if hand is not None:
        arm(Pen(d), sh, hand)

    img = outline(img)
    if fx:
        d2 = ImageDraw.Draw(img)
        for fn in fx:
            fn(d2)

    out = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    sd = ImageDraw.Draw(out)
    sx = OX + 31.5 + lean_x
    sr = 12 - air * 0.35
    sd.ellipse([sx - sr, OY + 54 + air * 0.05, sx + sr, OY + 60 - air * 0.05], fill=(0, 0, 0, 70 - air * 2))   # เงาพื้น 2.5D
    out.alpha_composite(img)
    if flip:
        out = out.transpose(Image.FLIP_LEFT_RIGHT)
    return out


def g(p):
    return (round(p[0] + OX), round(p[1] + OY))


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
                    dst[x, y] = C["outline"] + (255,)
                    break
    return res


def main():
    os.makedirs(OUT, exist_ok=True)
    sheet = Image.new("RGBA", (FW * COLS, FH * len(ANIMS) * len(DIRS)), (0, 0, 0, 0))
    frames = {}
    row = 0
    meta = {"frameWidth": FW, "frameHeight": FH, "framesPerAnim": COLS, "dirs": DIRS, "anims": {}}
    for a in ANIMS:
        meta["anims"][a] = {}
        for dname in DIRS:
            fl = [frame(dname, a, i) for i in range(COLS)]
            frames[(a, dname)] = fl
            for i, f in enumerate(fl):
                sheet.paste(f, (i * FW, row * FH))
            meta["anims"][a][dname] = row
            row += 1
    sheet.save(os.path.join(OUT, "devil_girl_sheet.png"))
    with open(os.path.join(OUT, "devil_girl_sheet.json"), "w", encoding="utf-8") as fh:
        json.dump(meta, fh, indent=2)

    # พรีวิว: GIF ต่อท่า (4 ทิศเรียงกัน) ขยาย 4 เท่า
    S = 4
    for a in ANIMS:
        gif = []
        for i in range(COLS):
            canvas = Image.new("RGBA", (FW * 4, FH), (60, 66, 80, 255))
            for k, dname in enumerate(DIRS):
                canvas.alpha_composite(frames[(a, dname)][i], (k * FW, 0))
            gif.append(canvas.resize((FW * 4 * S, FH * S), Image.NEAREST).convert("P", palette=Image.ADAPTIVE))
        dur = {"idle": 220, "walk": 130, "attack": 90, "skill1": 100, "skill2": 90, "skill3": 160}[a]
        gif[0].save(os.path.join(OUT, f"preview_{a}.gif"), save_all=True, append_images=gif[1:], duration=dur, loop=0, disposal=2)

    bg = Image.new("RGBA", sheet.size, (60, 66, 80, 255))
    bg.alpha_composite(sheet)
    bg.resize((sheet.width * 3, sheet.height * 3), Image.NEAREST).save(os.path.join(OUT, "preview_sheet_x3.png"))
    print("saved to", os.path.abspath(OUT))


if __name__ == "__main__":
    main()

