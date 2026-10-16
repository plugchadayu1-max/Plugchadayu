# สร้างผังแมพลาวาใหม่ (แทนที่ grid ใน index.html ที่ add_lava_map.py ใส่ไว้)
import math, random, re, os, collections
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOCK = set('T~#r')
R = random.Random(2024)
g = [['.'] * 32 for _ in range(32)]
def inb(x, y): return 1 <= x <= 30 and 1 <= y <= 30
def disc(cx, cy, r, ch):
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if inb(x, y) and (x - cx) ** 2 + (y - cy) ** 2 <= r * r: g[y][x] = ch
# แม่น้ำลาวา 2 สาย ไหลขวางแมพ (คดเคี้ยวตามคลื่น sin)
def river(y0, amp, ph, hw):
    cols = {}
    for x in range(1, 31):
        yc = y0 + amp * math.sin(x / 4.2 + ph)
        for y in range(1, 31):
            if abs(y - yc) <= hw: g[y][x] = '~'
        cols[x] = yc
    return cols
c1 = river(14.5, 1.1, 0.6, 1.3); c2 = river(24.5, 1.2, 2.1, 1.3)
# เกาะหินเล็กในแม่น้ำ (ให้ดูธรรมชาติ) ไม่ขวางสะพาน
# สะพานหิน: ช่องกลางของแถวน้ำที่คอลัมน์นั้น
def bridge(x):
    ys = [y for y in range(1, 31) if g[y][x] == '~']
    # เลือกแม่น้ำที่ใกล้ที่สุดจาก y (จัดกลุ่มช่วงต่อเนื่อง)
    runs = []; cur = []
    for y in ys:
        if cur and y != cur[-1] + 1: runs.append(cur); cur = []
        cur.append(y)
    if cur: runs.append(cur)
    return runs
for rv, xs in ((0, (8, 15, 24)), (1, (6, 17, 26))):
    for x in xs:
        runs = bridge(x)
        run = runs[rv]
        for xx in (x, x + 1):
            for yy in range(run[0], run[-1] + 1):
                if g[yy][xx] == '~': g[yy][xx] = '='
# ทางหลัก (,) จากเมืองลงสะพาน 15 ถึงสะพาน 17
def path(a, b):
    n = int(max(abs(a[0] - b[0]), abs(a[1] - b[1])) * 2) + 1
    for i in range(n + 1):
        t = i / n; x = round(a[0] + (b[0] - a[0]) * t); y = round(a[1] + (b[1] - a[1]) * t)
        if inb(x, y) and g[y][x] == '.': g[y][x] = ','
path((15, 11), (15, 14)); path((15, 17), (14, 20)); path((14, 20), (17, 22)); path((17, 27), (17, 30))
# สระลาวา/หินดำ/หิน กระจายบนพื้นดิน (เว้นรอบทางหลักและหัวสะพาน)
def near_special(x, y):
    for yy in range(y - 2, y + 3):
        for xx in range(x - 2, x + 3):
            if 0 <= xx < 32 and 0 <= yy < 32 and g[yy][xx] in ',=': return True
    return False
for _ in range(11):
    x, y = R.randint(3, 28), R.randint(17, 29)
    if g[y][x] == '.' and not near_special(x, y) and not (y < 23 and y > 11 and False): disc(x, y, R.choice([1.2, 1.6]), '~')
for _ in range(60):
    x, y = R.randint(2, 29), R.randint(11, 30)
    if g[y][x] == '.' and not near_special(x, y) and R.random() < .6: g[y][x] = 'r'
for _ in range(5):
    x, y = R.choice([2, 3, 28, 29]), R.randint(17, 28)
    if g[y][x] == '.' and not near_special(x, y): disc(x, y, 1.4, '#')
# เมือง
for y in range(0, 12):
    for x in range(10, 22):
        if inb(x, y) and g[y][x] in BLOCK: g[y][x] = '.'
for y in range(1, 11):
    for x in range(11, 21): g[y][x] = 'H'
for i in range(32): g[0][i] = g[31][i] = g[i][0] = g[i][31] = '#'
# เก็บเฉพาะที่ไปถึงได้จากเมือง
seen = {(15, 5)}; q = collections.deque([(15, 5)])
while q:
    x, y = q.popleft()
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        a, b = x + dx, y + dy
        if 0 <= a < 32 and 0 <= b < 32 and (a, b) not in seen and g[b][a] not in BLOCK: seen.add((a, b)); q.append((a, b))
lost = 0
for y in range(32):
    for x in range(32):
        if g[y][x] not in BLOCK and (x, y) not in seen: g[y][x] = '~'; lost += 1
print('walkable', len(seen), 'unreachable->lava', lost)
rows = ",\n".join("'" + ''.join(r) + "'" for r in g)
print('\n'.join(''.join(r) for r in g))
p = os.path.join(G, 'index.html'); t = open(p, encoding='utf-8', newline='').read()
nl = "\r\n" if "\r\n" in t else "\n"
m = re.search(r"(  lava:\{name:'ทุ่งลาวาเดือด'.*?grid:\[\r?\n)(.*?)(\],\r?\n    pal:)", t, re.S)
assert m
t = t[:m.start(2)] + rows.replace("\n", nl) + t[m.end(2):]
open(p, 'w', encoding='utf-8', newline='').write(t)
print('regrid ok')

