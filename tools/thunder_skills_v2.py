# ปรับสกิลเทพสายฟ้าให้ตรงคอนเซปต์: ทัณฑ์อัสนีฟากฟ้า / ก้าวพริบตาอัสนีคู่ / วายุอัสนีคลั่ง / มหาเวทย์มังกรอัสนีพิโรธ
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:100])
    return t.replace(a, b, 1)

N = ['ทัณฑ์อัสนีฟากฟ้า', 'ก้าวพริบตาอัสนีคู่', 'วายุอัสนีคลั่ง', 'มหาเวทย์มังกรอัสนีพิโรธ']
h = rd('index.html')
if "type:'flash'" in h: raise SystemExit('already applied')
a = h.index("    skills:[{n:'Thunder Pillar'"); b = h.index("  rogue:{name:'นักยิงปืน'")
h = h[:a] + f"""    skills:[{{n:'{N[0]}',ic:'⚡',sp:22,cd:5,type:'storm',anim:'skill1',dur:1.0,hitAt:.62,mult:2.4,r:460,strikes:24,col:'#7ae8ff',vfx:'lit3',shake:5}},
            {{n:'{N[1]}',ic:'🌩️',sp:28,cd:8,type:'flash',anim:'skill2',dur:.85,hitAt:.5,mult:4.4,range:560,r:230,col:'#9ff0ff',vfx:'lit4',hitFx:'lit6',stun:1,shake:5}},
            {{n:'{N[2]}',ic:'🌪️',sp:36,cd:12,type:'vortex',anim:'skill3',dur:1.1,hitAt:.35,mult:4.2,r:400,ticks:4,tick:.22,col:'#8fe8ff',vfx:'war5',tint:'hue-rotate(160deg) saturate(1.3)',stun:.6,slow:2.5,shake:4}},
            {{n:'{N[3]}',ic:'🐉',sp:70,cd:22,type:'dragon',anim:'skill4',dur:1.4,hitAt:.5,mult:9,r:660,waves:3,col:'#ffe86a',vfx:'lit3',stun:2,slow:3,shake:7}}]}},
""" + h[b:]

# --- สกิลชนิดใหม่: flash / vortex / dragon (ใส่ก่อนชนิด 'storm') ---
NEW = """  // เทพสายฟ้า — ก้าวพริบตาอัสนีคู่: พุ่งวาร์ปประชิดเป้า แล้วระเบิดสายฟ้าสองฝ่ามือ (2 จังหวะ)
  if(s.type==='flash'){
    const t0=P.target&&!P.target.dead&&dist(P,P.target)<s.range?P.target:nearestMob(s.range);
    if(!t0){say('ไม่มีเป้าหมายในระยะ','#ccc');return}
    P.sp-=s.sp;P.skCd[i]=s.cd;P.target=t0;
    SA({target:t0,hit:()=>{
      const fx0=P.x,fy0=P.y,a=Math.atan2(t0.y-P.y,t0.x-P.x),nx=t0.x-Math.cos(a)*34,ny=t0.y-Math.sin(a)*20;
      vfx('lit1',fx0,fy0-C.h*.5,{to:{x:nx,y:ny-C.h*.5}});
      if(walkable(nx,ny)){P.x=nx;P.y=ny;P.path=null;P.dest=null}
      ring(P.x,P.y,s.r,s.col,.55);burst(P.x,P.y-30,s.col,18);vfx(s.vfx,P.x,P.y-C.h*.4,{tint:s.tint});shake=Math.max(shake,s.shake||4);
      for(let k=0;k<2;k++)setTimeoutGame(k*.16,()=>{
        const cx=t0.dead?P.x:t0.x,cy=t0.dead?P.y:t0.y;vfx(s.hitFx||'lit6',cx,cy-20);ring(cx,cy,s.r*(.7+.3*k),s.col,.35);
        for(const m of mobs)if(!m.dead&&Math.hypot(m.x-cx,m.y-cy)<s.r+m.d.h*.3){hitMob(m,calcDmg(s.mult/2),true);if(k)afflict(m)}})
    }});
    return}
  // เทพสายฟ้า — วายุอัสนีคลั่ง: ลอยตัวหมุนพายุสายฟ้าล้อมกาย โจมตีรอบทิศหลายจังหวะ
  if(s.type==='vortex'){
    P.sp-=s.sp;P.skCd[i]=s.cd;
    SA({hit:()=>{
      const ticks=s.ticks||4;
      for(let k=0;k<ticks;k++)setTimeoutGame(k*(s.tick||.22),()=>{
        if(!P||P.hp<=0)return;
        ring(P.x,P.y,s.r*(.5+.5*(k+1)/ticks),s.col,.4);vfx(s.vfx,P.x,P.y-C.h*.4,{scale:.55+k*.1,tint:s.tint});burst(P.x,P.y-30,s.col,10);shake=Math.max(shake,s.shake||3);
        for(const m of mobs)if(!m.dead&&dist(P,m)<s.r+m.d.h*.3){hitMob(m,calcDmg(s.mult/ticks*1.6),true);afflict(m)}})
    }});
    return}
  // เทพสายฟ้า — มหาเวทย์มังกรอัสนีพิโรธ (อัลติเมท): อัญเชิญมังกรสายฟ้า คำรามระเบิดคลื่นอัสนี 3 ระลอกขยายวง
  if(s.type==='dragon'){
    P.sp-=s.sp;P.skCd[i]=s.cd;
    SA({hit:()=>{
      vfx('lit5',P.x,P.y-C.h*.5,{slow:2});ring(P.x,P.y,s.r*.35,s.col,.9);shake=Math.max(shake,s.shake||6);
      const waves=s.waves||3;
      for(let k=0;k<waves;k++)setTimeoutGame(k*.4,()=>{
        if(!P||P.hp<=0)return;const r=s.r*(.55+.45*(k+1)/waves);
        ring(P.x,P.y,r,k%2?'#7ae8ff':s.col,.7);shake=Math.max(shake,s.shake||6);
        for(let j=0;j<12;j++){const a=Math.random()*Math.PI*2,rr=Math.random()*r;vfx(s.vfx,P.x+Math.cos(a)*rr,P.y+Math.sin(a)*rr*.6,{delay:j*.03})}
        for(const m of mobs)if(!m.dead&&dist(P,m)<r+m.d.h*.3){hitMob(m,calcDmg(s.mult/waves*1.8),true);afflict(m);vfx('lit6',m.x,m.y-m.d.h*.5)}})
    }});
    return}
"""
h = rep(h, "  // พายุสายฟ้า: ฟาดลงสุ่มใส่ศัตรูรอบตัวหลายครั้ง\n  if(s.type==='storm'){", NEW + "  // พายุสายฟ้า: ฟาดลงสุ่มใส่ศัตรูรอบตัวหลายครั้ง\n  if(s.type==='storm'){")
# ออโต้: ใช้ vortex/dragon เหมือนสกิลรอบตัว
h = rep(h, "if(s.type==='aoe'||s.type==='storm'){const n=mobs.filter", "if(s.type==='aoe'||s.type==='storm'||s.type==='vortex'||s.type==='dragon'){const n=mobs.filter")
wr('index.html', h)

# --- f_progress.js: คำอธิบาย + การ์ดอาชีพ ---
p = rd('f_progress.js')
a = p.index("Object.assign(SKILL_DESC,{'Thunder Pillar'"); b = p.index("function thunderCard(active){")
p = p[:a] + f"""Object.assign(SKILL_DESC,{{'{N[0]}':'ชูคทาเหนือศีรษะเปิดวงเวทย์บนฟ้า แล้วปล่อยสายฟ้าฟาดลงมารอบตัวเป็นวงกว้าง',
  '{N[1]}':'แปลงร่างเป็นกระแสสายฟ้าพุ่งวาร์ปเข้าหาศัตรู แล้วระเบิดสายฟ้าจากฝ่ามือทั้งสองพร้อมกัน',
  '{N[2]}':'ลอยตัวด้วยกระแสลมไฟฟ้า หมุนตัวสร้างพายุสายฟ้าโอบล้อมกาย โจมตีรอบทิศหลายจังหวะ',
  '{N[3]}':'เปิดวงเวทย์ใต้เท้าและวงแหวนรูน อัญเชิญมังกรสายฟ้าฟ้า-ทองพันรอบกาย คำรามระเบิดคลื่นอัสนี 3 ระลอก'}});
""" + p[b:]
p = rep(p, "สกิลสายฟ้าวงกว้างอลังการ 4 สกิล<br>", "สกิลสายฟ้าวงกว้างอลังการ 4 สกิล (ท่าที่ 4 = อัลติเมท)<br>")
wr('f_progress.js', p)

# --- build_thunder.py: ชื่อไอคอน ---
t = rd('tools/build_thunder.py')
for old, new in [("Thunder Pillar", N[0]), ("Lightning Dash", N[1]), ("Storm Cyclone", N[2]), ("Thunder Dragon", N[3])]:
    t = rep(t, f'"{old}"', f'"{new}"')
wr('tools/build_thunder.py', t)
hh = rd('index.html')
hh = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), hh, count=1)
hh = re.sub(r"thunder_sprites\.js\?v=(\d+)", lambda m: "thunder_sprites.js?v=%d" % (int(m.group(1)) + 1), hh, count=1)
wr('index.html', hh)
print('ok')
