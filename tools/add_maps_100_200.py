# เพิ่มแมพ Lv 101-150 (ป่าเงาลึก) และ 151-200 (ทุ่งหมู่บ้านร้าง) ลง index.html + ไฟล์ที่เกี่ยวข้อง (รันซ้ำไม่ได้ — มีตัวกันซ้ำ)
import random, re, os, collections
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
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
def town(g, x0, y0, x1, y1):
    for y in range(y0 - 1, y1 + 2):
        for x in range(x0 - 1, x1 + 2):
            if inb(x, y) and g[y][x] in BLOCK: g[y][x] = '.'
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1): g[y][x] = 'H'
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
def border(g):
    for i in range(32): g[0][i] = g[31][i] = g[i][0] = g[i][31] = '#'

# ---------- ป่าเงาลึก: ทางเดินคดเคี้ยวกลางเหวมืด (อ้างอิงภาพป่าลอยฟ้า) ----------
def deepwood():
    R = random.Random(101); g = blank('#')
    pts = [(25, 11), (19, 14), (9, 13), (6, 19), (12, 23), (22, 22), (26, 27), (15, 29), (6, 28)]
    for a, b in zip(pts, pts[1:]): line(g, a, b, 3, '.')
    for p in pts[1:]: disc(g, p[0], p[1], 5, '.')
    for a, b in zip(pts, pts[1:]): line(g, a, b, .6, ',')
    for y in range(1, 31):
        for x in range(1, 31):
            if g[y][x] == '.' and R.random() < .07: disc(g, x, y, R.choice([1, 1.5, 2]), 'T')
    for p in pts[1:]:
        if R.random() < .6: disc(g, p[0] + 2, p[1] - 2, 2, '~')
    for y in range(1, 31):
        for x in range(1, 31):
            if g[y][x] == '.' and R.random() < .02: g[y][x] = 'r'
    # รักษาแนวทางเดิน
    for a, b in zip(pts, pts[1:]): line(g, a, b, .6, ',')
    town(g, 21, 1, 30, 10); border(g)
    return g, prune(g, 25, 5)
# ---------- ทุ่งหมู่บ้านร้าง: ทุ่งหญ้า สระน้ำ ซากบ้าน (อ้างอิงภาพหมู่บ้าน) ----------
def village():
    R = random.Random(151); g = blank('.')
    for _ in range(26): disc(g, R.randint(2, 29), R.randint(2, 29), R.choice([1.5, 2, 2.5]), 'T')
    for _ in range(4): disc(g, R.randint(4, 27), R.randint(13, 28), R.choice([2.5, 3]), '~')
    for _ in range(5): disc(g, R.randint(3, 28), R.randint(12, 29), R.choice([1.2, 1.8]), '#')
    for _ in range(9):   # ซากบ้าน 3x2
        x, y = R.randint(3, 27), R.randint(13, 28)
        for yy in range(y, y + 2):
            for xx in range(x, x + 3):
                if inb(xx, yy): g[yy][xx] = 'r'
    pts = [(15, 11), (15, 17), (6, 19), (6, 26), (16, 24), (25, 20), (25, 28)]
    for a, b in zip(pts, pts[1:]): line(g, a, b, 1.6, '.')
    for a, b in zip(pts, pts[1:]): line(g, a, b, .6, ',')
    town(g, 11, 1, 20, 10); border(g)
    return g, prune(g, 15, 5)

MAPS = {}
g, n = deepwood(); MAPS['deepwood'] = g; print('deepwood walkable', n)
g, n = village(); MAPS['ruinvillage'] = g; print('ruinvillage walkable', n)
for k, gg in MAPS.items():
    print(k); print('\n'.join(''.join(r) for r in gg))
def rows(g): return ",\n".join("'" + ''.join(r) + "'" for r in g)

idx = rd('index.html')
if "deepwood:{" in idx: raise SystemExit('already applied')
newmaps = f"""  deepwood:{{name:'ป่าเงาลึก',ic:'🌑',lv:'101-150',
    grid:[
{rows(MAPS['deepwood'])}],
    pal:{{0:['#3f7a34','#4f9140','#62a84d'],1:['#a89060','#bda472','#cdb784'],2:['#1c4220','#265a2a','#307034'],3:['#2f6fa8','#3f86c0','#5aa2d6'],
         4:['#14101c','#241c30','#3a2e4a'],5:['#6b4a2b','#8a6038','#a87a4a'],6:['#8f8a7a','#a8a28e','#bcb6a0'],7:['#2a1a1a','#3a2424','#4a2e2e'],8:['#6a6a58','#848470','#9c9c84'],9:['#8cc4e4','#a4d4ee','#c4e6f6']}},
    deco:['bush','flower','rock'],trees:'tree',
    }},
  ruinvillage:{{name:'ทุ่งหมู่บ้านร้าง',ic:'🏚️',lv:'151-200',
    grid:[
{rows(MAPS['ruinvillage'])}],
    pal:{{0:['#58a038','#68b444','#7cc858'],1:['#d4aa5a','#e2bc6a','#eed07e'],2:['#244e22','#2f6a2c','#3a8036'],3:['#2a9ac0','#3ab4d8','#6ad0ea'],
         4:['#5a4636','#7a6048','#9a7c5c'],5:['#6b4a2b','#8a6038','#a87a4a'],6:['#a89a80','#bcae94','#d0c2a8'],7:['#3a2a1a','#4a3622','#5a442c'],8:['#6a5a4a','#8a7860','#a89478'],9:['#8cc4e4','#a4d4ee','#c4e6f6']}},
    deco:['bush','flower','rock'],trees:'tree',
    }}
"""
# แทรกต่อท้าย snow (ก่อน `};` ปิด MAPS)
m = re.search(r"(    deco:\['snowrock','crystal','snowpine'\],trees:null,\n    \})\n\};\nconst MAP_ORDER", idx)
assert m
idx = idx[:m.end(1)] + ",\n" + newmaps + "};\nconst MAP_ORDER" + idx[m.end():]
idx = idx.replace("const MAP_ORDER=['forest','desert','snow'];", "const MAP_ORDER=['forest','desert','snow','deepwood','ruinvillage'];")
idx = idx.replace("const PORTAL_COL={forest:['#3fbf5f','#9ff0b0'],desert:['#e0a040','#ffe0a0'],snow:['#4ab0f0','#c0f0ff']};",
                  "const PORTAL_COL={forest:['#3fbf5f','#9ff0b0'],desert:['#e0a040','#ffe0a0'],snow:['#4ab0f0','#c0f0ff'],deepwood:['#9a5af0','#d8b8ff'],ruinvillage:['#f0505a','#ffb0b4']};")
idx = idx.replace("const MAX_LV=99,", "const MAX_LV=200,").replace("เลเวลสูงสุด 99", "เลเวลสูงสุด 200")
idx = idx.replace("genItem(clamp(P.lv,1,99)", "genItem(clamp(P.lv,1,MAX_LV)")
# มอนสเตอร์
TINT = "const TINTS={violet:{f:'hue-rotate(250deg) saturate(1.2)',c:[1.1,.8,1.5]},green:{f:'hue-rotate(80deg) saturate(1.3)',c:[.8,1.3,.8]},red:{f:'hue-rotate(-30deg) saturate(1.6) brightness(.95)',c:[1.4,.75,.75]},gold:{f:'hue-rotate(35deg) saturate(1.5) brightness(1.1)',c:[1.4,1.2,.6]},blue:{f:'hue-rotate(170deg) saturate(1.3)',c:[.7,.95,1.5]}};   // สีเปลี่ยนมอนสเตอร์ที่ใช้สไปรต์ซ้ำ\n"
roster = """  // ----- ป่าเงาลึก Lv 101-150 -----
  ['dw_wisp','วิญญาณป่าเงา','cp_ghost',101,{ranged:1,tint:'violet'}],['dw_spider','แมงมุมพิษราตรี','cp_spiderS',104,{tint:'violet'}],['dw_wolf','หมาป่าเงาดำ','cp_wolfD',107,{tint:'violet'}],
  ['dw_were','มนุษย์หมาป่าป่าลึก','cp_were',110,{tint:'green'}],['dw_ent','เอนท์พิษ','cp_ent',113,{big:1,tint:'green'}],['dw_hood','นักบวชเงา','cp_hooded',116,{ranged:1,tint:'violet'}],
  ['dw_beetle','ด้วงเรืองแสง','cp_beetle',119,{tint:'green'}],['dw_mantis','ตั๊กแตนจักรพรรดิ','cp_mantis',122,{tint:'violet'}],['dw_garg','การ์กอยล์ตะไคร่','cp_garg',125,{elite:1,tint:'green'}],
  ['dw_ogre','ยักษ์ป่าลึก','cp_ogre',128,{big:1,tint:'green'}],['dw_felem','ธาตุสายฟ้าป่า','cp_felem',131,{ranged:1,tint:'blue'}],['dw_boar','หมูป่าเขี้ยวเหล็ก','cp_boar',134,{tint:'violet'}],
  ['dw_troll','โทรลล์ป่าโบราณ','cp_trollA3',137,{big:1,tint:'green'}],['dw_deer','กวางกะโหลกเงา','cp_deer',140,{tint:'violet'}],['dw_reaper','อัศวินมรณะแห่งป่า','cp_reaper',144,{tint:'green'}],
  ['dw_dragon','มังกรป่าพิษ','cp_dragon',147,{elite:1,tint:'green'}],['woodLord','ราชันย์ต้นไม้ผู้ตื่น','cp_ent',150,{boss:1,px:2,tint:'violet'}],
  // ----- ทุ่งหมู่บ้านร้าง Lv 151-200 -----
  ['vl_zombie','ชาวบ้านซอมบี้','cp_zombie',151,{tint:'gold'}],['vl_rat','มนุษย์หนูโจร','cp_rat',155,{tint:'red'}],['vl_imp','อิมพ์เผาเรือน','cp_imp',159,{ranged:1,tint:'red'}],
  ['vl_hound','หมาล่าเนื้อ','cp_hound',163,{tint:'red'}],['vl_ghost','วิญญาณชาวบ้าน','cp_ghost',167,{ranged:1,tint:'gold'}],['vl_demon','ปีศาจเฝ้าซาก','cp_demon',171,{tint:'red'}],
  ['vl_medusa','เมดูซ่าแห่งบึง','cp_medusa',175,{ranged:1,tint:'blue'}],['vl_troll','โทรลล์ผู้ทำลายบ้าน','cp_trollA2',179,{big:1,tint:'red'}],['vl_rdemon','ปีศาจเพลิงถล่ม','cp_rdemon',183,{elite:1,tint:'gold'}],
  ['vl_hellh','เซอร์เบอรัสเฝ้าหมู่บ้าน','cp_hellh',187,{tint:'gold'}],['vl_reaper','อัศวินมรณะนิรันดร์','cp_reaper',191,{tint:'red'}],['vl_dragon','มังกรเพลิงอาถรรพ์','cp_dragon',195,{elite:1,tint:'red'}],
  ['vl_jinn','จินน์ผู้ล่มสลาย','cp_jinn',198,{elite:1,ranged:1,tint:'gold'}],['ruinLord','จอมมารผู้ล่มหมู่บ้าน','cp_demon',200,{boss:1,px:2,tint:'red'}]
"""
idx = idx.replace("  ['dragonLord','มังกรแห่งหายนะ','cp_dragon',100,{boss:1,px:2}]\n];",
                  "  ['dragonLord','มังกรแห่งหายนะ','cp_dragon',100,{boss:1,px:2}],\n" + roster + "];")
idx = idx.replace("const ROSTER=[", TINT + "const ROSTER=[", 1)
idx = idx.replace("MOBS[k]=Object.assign({name,sprite,px:(o.px||1)*MOB_SCALE,ranged:!!o.ranged,elite:!!o.elite,boss:!!o.boss},mobStats(lv,o));",
                  "MOBS[k]=Object.assign({name,sprite,px:(o.px||1)*MOB_SCALE,ranged:!!o.ranged,elite:!!o.elite,boss:!!o.boss,tint:o.tint?TINTS[o.tint]:null},mobStats(lv,o));")
# วาด tint (2D): ใส่ใน drawActor + จุดวาดมอนสเตอร์
idx = idx.replace("  if(o.flash)lx.filter='brightness(2.4) saturate(.4)';\n  else if(o.frozen)lx.filter='sepia(.6) hue-rotate(160deg) saturate(2.2) brightness(1.15)';",
                  "  if(o.flash)lx.filter='brightness(2.4) saturate(.4)';\n  else if(o.frozen)lx.filter='sepia(.6) hue-rotate(160deg) saturate(2.2) brightness(1.15)';\n  else if(o.tint)lx.filter=o.tint;")
idx = idx.replace("drawActor(m.actor,m.x,m.y,{flash:m.hitT>0,frozen:m.slowT>0||m.stunT>0,alpha:al,sc:UNIT_SCALE});",
                  "drawActor(m.actor,m.x,m.y,{flash:m.hitT>0,frozen:m.slowT>0||m.stunT>0,alpha:al,sc:UNIT_SCALE,tint:m.d.tint&&m.d.tint.f});")
for old in ("const hk=MAPID==='forest'",): pass
wr('index.html', idx)

f = rd('f_25d.js')
f = f.replace("e.mat.color.setScalar(1.8);else if(o.frozen)e.mat.color.setRGB(.65,1,1.45);else e.mat.color.setScalar(1);",
              "e.mat.color.setScalar(1.8);else if(o.frozen)e.mat.color.setRGB(.65,1,1.45);else if(o.tc)e.mat.color.setRGB(o.tc[0],o.tc[1],o.tc[2]);else e.mat.color.setScalar(1);")
f = f.replace("const e=putActor(m,m.actor,m.x,m.y,{flash:m.hitT>0,frozen:m.slowT>0||m.stunT>0,alpha:al,",
              "const e=putActor(m,m.actor,m.x,m.y,{tc:m.d.tint&&m.d.tint.c,flash:m.hitT>0,frozen:m.slowT>0||m.stunT>0,alpha:al,")
wr('f_25d.js', f)

d = rd('f_depth.js')
d = d.replace("MAPID==='snow'?'i':null;", "MAPID==='snow'||MAPID==='deepwood'||MAPID==='ruinvillage'?'i':null;")
wr('f_depth.js', d)

t = rd('f_theme.js')
t = t.replace("const WM_POS={forest:[128,238],desert:[392,238],snow:[262,98]};",
              "const WM_POS={forest:[140,262],desert:[380,266],snow:[96,80],deepwood:[262,74],ruinvillage:[428,84]};")
t = t.replace("  snow:'ดินแดนน้ำแข็งเลือดที่อันตรายที่สุด เป็นรังของอัศวินมรณะ ราชันย์กระดูก และมังกรแห่งหายนะ'};",
              "  snow:'ดินแดนน้ำแข็งเลือดที่อันตรายที่สุด เป็นรังของอัศวินมรณะ ราชันย์กระดูก และมังกรแห่งหายนะ',\n  deepwood:'ป่าลึกที่ถูกเหวมืดล้อมรอบ ทางเดินคดเคี้ยวเต็มไปด้วยสัตว์ป่าเงาและเอนท์พิษ มีราชันย์ต้นไม้ผู้ตื่นซ่อนอยู่ปลายทาง',\n  ruinvillage:'หมู่บ้านร้างริมสระที่ถูกปีศาจเพลิงยึดครอง เศษบ้านเรือนกลายเป็นรังของจอมมารผู้ล่มหมู่บ้าน'};")
t = t.replace("const WM_TYPE={forest:'Forest',desert:'Desert',snow:'Frostland'};",
              "const WM_TYPE={forest:'Forest',desert:'Desert',snow:'Frostland',deepwood:'Deepwood',ruinvillage:'Ruins'};")
t = t.replace("const [cx,cy]=WM_POS[id],rx=108,ry=82,sel=WM.sel===id;", "const [cx,cy]=WM_POS[id],rx=76,ry=58,sel=WM.sel===id;")
t = t.replace("d=((x-cx)/118)**2+((y-cy)/92)**2;", "d=((x-cx)/84)**2+((y-cy)/66)**2;")
wr('f_theme.js', t)

s = rd('tools/supabase_setup.sql')
s = s.replace("if nlv < 1 or nlv > 100 then raise exception 'cheat: level'; end if;", "if nlv < 1 or nlv > 200 then raise exception 'cheat: level'; end if;")
wr('tools/supabase_setup.sql', s)
print('done')
