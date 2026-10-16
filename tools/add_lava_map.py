# เพิ่มแมพลาวา (Lv 150-200 โหดกว่าแมพปกติ) — รันซ้ำไม่ได้ (มีตัวกันซ้ำ)
import random, re, os, collections
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f):
    return open(os.path.join(G, f), encoding='utf-8', newline='').read()
def wr(f, t):
    open(os.path.join(G, f), 'w', encoding='utf-8', newline='').write(t)
BLOCK = set('T~#r')
def blank(ch): return [[ch] * 32 for _ in range(32)]
def inb(x, y): return 1 <= x <= 30 and 1 <= y <= 30
def disc(g, cx, cy, r, ch):
    for y in range(int(cy - r - 1), int(cy + r + 2)):
        for x in range(int(cx - r - 1), int(cx + r + 2)):
            if inb(x, y) and (x - cx) ** 2 + (y - cy) ** 2 <= r * r: g[y][x] = ch
def line(g, a, b, r, ch):
    n = int(max(abs(a[0] - b[0]), abs(a[1] - b[1])) * 2) + 1
    for i in range(n + 1):
        t = i / n; disc(g, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, r, ch)
def prune(g, sx, sy):
    seen = {(sx, sy)}; q = collections.deque([(sx, sy)])
    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            a, b = x + dx, y + dy
            if 0 <= a < 32 and 0 <= b < 32 and (a, b) not in seen and g[b][a] not in BLOCK: seen.add((a, b)); q.append((a, b))
    for y in range(32):
        for x in range(32):
            if g[y][x] not in BLOCK and (x, y) not in seen: g[y][x] = '#'
    return len(seen)

def lava():
    R = random.Random(777); g = blank('.')
    for _ in range(7): disc(g, R.randint(2, 29), R.randint(14, 29), R.choice([1.3, 1.8]), '#')
    # แม่น้ำลาวา 2 สาย (เดินไม่ได้) พร้อมสะพานหิน
    r1 = [(1, 14), (7, 13), (14, 15), (22, 13), (30, 15)]
    r2 = [(1, 24), (8, 26), (16, 23), (24, 26), (30, 24)]
    for rv in (r1, r2):
        for a, b in zip(rv, rv[1:]): line(g, a, b, 1.5, '~')
    for _ in range(9): disc(g, R.randint(3, 28), R.randint(16, 22), R.choice([1, 1.3]), '~')
    for _ in range(7): disc(g, R.randint(3, 28), R.randint(27, 29), R.choice([1, 1.3]), '~')
    # ทางหลักจากเมืองลงใต้ (ใช้ ',')
    pts = [(15, 11), (13, 16), (9, 19), (16, 21), (18, 28)]
    for a, b in zip(pts, pts[1:]): line(g, a, b, .6, ',')
    # สะพาน: วางบนช่องลาวาที่ตรงกับทางหลัก/ทางเสริม
    def bridge(x, rv):
        ys = [y for y in range(1, 31) if g[y][x] == '~' and abs(y - min(rv, key=lambda p: abs(p[0] - x))[1]) <= 3]
        if ys: g[ys[len(ys) // 2]][x] = '='
    bridge(14, r1); bridge(6, r1); bridge(25, r1)
    bridge(10, r2); bridge(20, r2); bridge(4, r2)
    for y in range(1, 31):
        for x in range(1, 31):
            if g[y][x] == '.' and R.random() < .035: g[y][x] = 'r'
    for a, b in zip(pts, pts[1:]): line(g, a, b, .6, ',')
    # เมือง H ตามผังเดียวกับแมพอื่น (คอลัมน์ 11-20 แถว 1-10)
    for y in range(0, 12):
        for x in range(10, 22):
            if inb(x, y) and g[y][x] in BLOCK: g[y][x] = '.'
    for y in range(1, 11):
        for x in range(11, 21): g[y][x] = 'H'
    for i in range(32): g[0][i] = g[31][i] = g[i][0] = g[i][31] = '#'
    for y in range(12, 14):
        for x in range(13, 18): g[y][x] = ','
    return g, prune(g, 15, 5)

g, n = lava(); print('lava walkable', n); print('\n'.join(''.join(r) for r in g))
rows = ",\n".join("'" + ''.join(r) + "'" for r in g)
idx = rd('index.html')
nl = "\r\n" if "\r\n" in idx else "\n"
def L(s): return s.replace("\n", nl)
if "lava:{name:" in idx: raise SystemExit('already applied')
newmap = L(f"""  lava:{{name:'ทุ่งลาวาเดือด',ic:'🌋',lv:'150-200',lavaMap:1,
    grid:[
{rows}],
    pal:{{0:['#2a2224','#34292b','#42353a'],1:['#5a4636','#6e5642','#86684e'],2:['#2a2224','#34292b','#42353a'],3:['#d8400a','#f0701a','#ffb02a'],
         4:['#15101a','#241a26','#3a2c3c'],5:['#4a3a34','#6a5648','#8a7260'],6:['#6e6258','#84786c','#9a8e80'],7:['#14101a','#1c1620','#241e2a'],8:['#3a3232','#524848','#6a5e5e'],9:['#4a3a34','#5a4a44','#6a5a54']}},
    deco:['rock','bones','dtree','lcrys2','lcrys3','lcrys4','dcrys1','dcrys2','lflame'],trees:null,mcol:'#3a2a30',
    }}
""")
m = re.search(r"(    deco:\['bush','flower','rock'\],trees:'tree',mcol:'#8a7058',\r?\n    \})\r?\n\};\r?\nconst MAP_ORDER", idx)
assert m, 'anchor MAPS end'
idx = idx[:m.end(1)] + "," + nl + newmap + "};" + nl + "const MAP_ORDER" + idx[m.end():]
def rep(a, b):
    global idx
    assert a in idx, a[:80]
    idx = idx.replace(a, b, 1)
rep("const MAP_ORDER=['forest','desert','snow','deepwood','ruinvillage'];", "const MAP_ORDER=['forest','desert','snow','deepwood','ruinvillage','lava'];")
rep("ruinvillage:['#f0505a','#ffb0b4']};", "ruinvillage:['#f0505a','#ffb0b4'],lava:['#ff7a1a','#ffd27a']};")
# มอนสเตอร์ของแต่ละแมพ: แมพลาวาใช้เฉพาะ ROSTER ที่ติด lava:1, แมพอื่นไม่รวมมอนสเตอร์ลาวา; แมพลาวา: กองละ 10-12 ตัว
rep("inR=r=>r[3]>=a&&r[3]<=b,o=r=>r[4]||{};M.lvr=[a,b];",
    "o=r=>r[4]||{},inR=r=>r[3]>=a&&r[3]<=b&&!!o(r).lava===!!M.lavaMap;M.lvr=[a,b];")
rep("M.spawns=ROSTER.filter(r=>inR(r)&&!o(r).boss).map(r=>[r[0],o(r).elite?1:2,o(r).elite?3:o(r).big?4:0]);",
    "M.spawns=ROSTER.filter(r=>inR(r)&&!o(r).boss).map(r=>M.lavaMap?[r[0],o(r).elite?1:2,o(r).elite?[3,4]:[10,12]]:[r[0],o(r).elite?1:2,o(r).elite?3:o(r).big?4:0]);")
# ขนาดกองแบบช่วง [min,max]
rep("const n=size||ri(5,8),pack=[],pid=centers.length;", "const n=Array.isArray(size)?ri(size[0],size[1]):(size||ri(5,8)),pack=[],pid=centers.length;")
# ความโหด/EXP ของมอนสเตอร์แมพลาวา (o.lava) — ไม่กระทบแมพอื่น
rep("const TOUGH_HI=(lv,s)=>{if(lv>100){s.hp=Math.round(s.hp*4);s.atk=Math.round(s.atk*1.8)}return s};",
    "const TOUGH_HI=(lv,s)=>{if(lv>100){s.hp=Math.round(s.hp*4);s.atk=Math.round(s.atk*1.8)}return s};\n// แมพลาวา: HP x1.6 ATK x1.3 DEF x1.25 EXP x2.5 Zeny x2 (ซ้อนบน TOUGH_HI)\nconst TOUGH_LAVA=(o,s)=>{if(o.lava){s.hp=Math.round(s.hp*1.6);s.atk=Math.round(s.atk*1.3);s.def=Math.round(s.def*1.25);s.exp=Math.round(s.exp*2.5);s.zeny=s.zeny.map(v=>Math.round(v*2))}return s};")
rep("TOUGH_HI(lv,mobStats(lv,o)));", "TOUGH_LAVA(o,TOUGH_HI(lv,mobStats(lv,o))));")
# เพิ่ม ROSTER
roster = """  // ----- ทุ่งลาวาเดือด Lv 150-200 (โหดกว่า/EXP มากกว่า • ภาพชุดไฟ/มืดจาก mon2) -----
  ['lv_slime','สไลม์ลาวาหลอมเหลว','m2_b0',150,{lava:1,tint:'red'}],['lv_imp','ภูตเพลิงนรก','m2_c3',155,{lava:1,ranged:1,tint:'gold'}],['lv_golem','โกเลมลาวาคลั่ง','m2_c5',160,{lava:1,big:1,tint:'red'}],
  ['lv_shark','ฉลามหินลาวา','m2_c7',165,{lava:1,tint:'red'}],['lv_orc','ออร์คเหล็กหลอม','m2_c1',170,{lava:1,tint:'gold'}],['lv_wolf','หมาป่าถ่านเพลิง','m2_c2',173,{lava:1,tint:'red'}],
  ['lv_knight','อัศวินกระดูกไหม้','m2_c8',177,{lava:1,tint:'red'}],['lv_bird','อินทรีเถ้าถ่าน','m2_c6',181,{lava:1,tint:'gold'}],['lv_bat','แมลงเพลิงปีกดำ','m2_c0',185,{lava:1,tint:'red'}],
  ['lv_plant','ดอกไม้ไหม้กินคน','m2_c4',189,{lava:1,ranged:1,tint:'gold'}],['lv_hydra','ไฮดราลาวา','m2_c9',193,{lava:1,elite:1,tint:'red'}],['lv_golem2','โกเลมเจ้าไฟ','m2_c5',197,{lava:1,elite:1,big:1,tint:'gold'}],
  ['lavaLord','เจ้าแห่งลาวา','m2_c5',200,{lava:1,boss:1,px:2,tint:'red'}]
"""
rep("['vl_jinn','จินน์ผู้ล่มสลาย','cp_jinn',198,{elite:1,ranged:1,tint:'gold'}],['ruinLord','จอมมารผู้ล่มหมู่บ้าน','cp_demon',200,{boss:1,px:2,tint:'red'}]",
    "['vl_jinn','จินน์ผู้ล่มสลาย','cp_jinn',198,{elite:1,ranged:1,tint:'gold'}],['ruinLord','จอมมารผู้ล่มหมู่บ้าน','cp_demon',200,{boss:1,px:2,tint:'red'}],\n" + roster.rstrip("\n"))
# จัดสีภาพ re-skin ไม่แตะมอนสเตอร์ลาวา
rep("const L=ROSTER.filter(r=>r[3]>=lo&&r[3]<=hi).sort((x,y)=>x[3]-y[3]);", "const L=ROSTER.filter(r=>r[3]>=lo&&r[3]<=hi&&!(r[4]&&r[4].lava)).sort((x,y)=>x[3]-y[3]);")
# พื้นลาวา: ขอบเรืองแสง
rep("c=e===1?[214,236,246]:e<=3?P_[2]:P_[n>.55?1:0];", "c=id==='lava'?(e===1?[255,236,140]:e<=3?P_[2]:P_[n>.55?1:0]):e===1?[214,236,246]:e<=3?P_[2]:P_[n>.55?1:0];")
rep("if(e>3&&hash2(x>>2,y,9)>.992)c=[200,232,250];", "if(e>3&&hash2(x>>2,y,9)>.992)c=id==='lava'?[255,240,170]:[200,232,250];")
wr('index.html', idx)

# แผนที่โลก (f_theme.js)
t = rd('f_theme.js')
def rept(a, b):
    global t
    assert a in t, a[:70]
    t = t.replace(a, b, 1)
rept("const WM_POS={forest:[140,262],desert:[380,266],snow:[96,80],deepwood:[262,74],ruinvillage:[428,84]};",
     "const WM_POS={forest:[96,268],desert:[262,272],snow:[96,80],deepwood:[262,74],ruinvillage:[428,84],lava:[430,268]};")
rept("เศษบ้านเรือนกลายเป็นรังของจอมมารผู้ล่มหมู่บ้าน'};", "เศษบ้านเรือนกลายเป็นรังของจอมมารผู้ล่มหมู่บ้าน',\n  lava:'ทุ่งลาวาเดือดพล่าน แม่น้ำลาวาและสะพานหิน มอนสเตอร์โหดกว่าแมพอื่น เกิดเป็นกองใหญ่ แต่ได้ EXP มหาศาล เจ้าแห่งลาวารออยู่ปลายทาง'};")
rept("ruinvillage:'Ruins'};", "ruinvillage:'Ruins',lava:'Lava'};")
wr('f_theme.js', t)
print('done')

