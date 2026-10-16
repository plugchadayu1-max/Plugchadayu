# จัดตำแหน่งในเมืองให้ไม่ทับกัน: กำหนดช่องคงที่ (town.slots) ให้ ร้านค้า/ป้ายเควสต์/ช่างตีเหล็ก/ประตูดันเจี้ยน/NPC/กองไฟ/จุดเกิด
import os
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b, n=1):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, n)

h = rd('index.html')
if 'town.slots' in h: raise SystemExit('already applied')
h = rep(h, "  const sy_=cay+150;\n  pr.push({k:'shop',x:town.cx,y:sy_+40});\n  pr.push({k:'quest',x:town.cx-230,y:sy_+80},{k:'smith',x:town.cx+230,y:sy_+80});\n",
"""  // ผังเมือง (ค่าเทียบจากกึ่งกลาง cx และขอบบน y0): แถว NPC ใต้ปราสาท → แถวร้านค้า/ป้ายเควสต์/ช่างตีเหล็ก → กองไฟ/ประตูดันเจี้ยน/ประตูวาร์ปด้านล่าง
  const S=(dx,dy)=>({x:town.cx+dx,y:y0+dy});
  town.slots={
    shop:S(0,800),quest:S(-420,800),smith:S(420,800),dungeon:S(420,1070),
    fire:[S(-210,930),S(210,930)],spawn:S(0,1010),
    npc:{elder:S(-420,590),sage:S(-150,590),merchant:S(150,590),cook:S(420,590),fisher:S(-420,1020)}};
  town.spy=town.slots.spawn.y-town.cy+60;   // ใช้แทน cy+60 ตอนเกิด/กลับเมือง (TOWN.cy+TOWN.spy-60 ไม่ใช้ — เก็บเป็น y จริงด้านล่าง)
  town.spawnY=town.slots.spawn.y;
  pr.push({k:'shop',x:town.slots.shop.x,y:town.slots.shop.y});
  pr.push({k:'quest',x:town.slots.quest.x,y:town.slots.quest.y},{k:'smith',x:town.slots.smith.x,y:town.slots.smith.y});
""")
h = rep(h, "  fr.push({x:town.cx-120,y:sy_+190},{x:town.cx+120,y:sy_+190});", "  for(const f of town.slots.fire)fr.push({x:f.x,y:f.y});")
# จุดเกิด/กลับเมือง
n = h.count("TOWN.cy+60")
h = h.replace("P.y=TOWN.cy+60", "P.y=TOWN.spawnY")
h = h.replace("{x:TOWN.cx,y:TOWN.cy+60}", "{x:TOWN.cx,y:TOWN.spawnY}")
print('remaining cy+60:', h.count("TOWN.cy+60"))
wr('index.html', h)

w = rd('f_world.js')
w = rep(w, "  const gx=Math.min(TOWN.x1-90,TOWN.cx+280);props.push({k:'dungeon',x:gx,y:TOWN.cy-10});",
           "  const dgs=TOWN.slots&&TOWN.slots.dungeon;props.push({k:'dungeon',x:dgs?dgs.x:Math.min(TOWN.x1-90,TOWN.cx+280),y:dgs?dgs.y:TOWN.cy-10});")
wr('f_world.js', w)

l = rd('f_life.js')
l = rep(l, "    let x=0,y=0;for(let t=0;t<60;t++){x=rnd(TOWN.x0+110,TOWN.x1-110);y=rnd(TOWN.y0+150,TOWN.y1-70);if(walkable(x,y))break}",
           "    let x=0,y=0;const sl=TOWN.slots&&TOWN.slots.npc&&TOWN.slots.npc[d.id];\n    if(sl){x=sl.x;y=sl.y}else for(let t=0;t<60;t++){x=rnd(TOWN.x0+110,TOWN.x1-110);y=rnd(TOWN.y0+150,TOWN.y1-70);if(walkable(x,y))break}")
# เดินวนรอบจุดประจำ ไม่ให้เดินไปทับร้านอื่น: ลดรัศมี
l = rep(l, "n.wx=n.hx+rnd(-110,110);n.wy=n.hy+rnd(-60,60)", "n.wx=n.hx+rnd(-60,60);n.wy=n.hy+rnd(-30,30)")
wr('f_life.js', l)
print('ok')
