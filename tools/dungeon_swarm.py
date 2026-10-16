# ดันเจี้ยน: คลื่นละ 100 ตัว วิ่งเข้าหาผู้เล่นทั้งหมด • ความโหดตามเลเวลผู้เล่นตอนเข้า
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

w = rd('f_world.js')
if 'DG_WAVE_N' in w: raise SystemExit('already applied')
w = rep(w, "DG.wave++;const boss=DG.wave>DG.waves,n=boss?1:6+DG.wave*2;", "DG.wave++;const boss=DG.wave>DG.waves,n=boss?1:DG_WAVE_N;")
w = rep(w, "const DG_MAX=3;let DG=null,DGPEND=null;", "const DG_MAX=3,DG_WAVE_N=100;let DG=null,DGPEND=null;   // คลื่นละ 100 ตัว วิ่งเข้าหาผู้เล่นทั้งหมด")
w = rep(w, "    else d=dgMob(k,DG.lv+DG.wave-1,{ranged:MOBS[k].ranged,big:MOBS[k].range>=70});",
"""    else{d=dgMob(k,DG.lv+DG.wave-1,{ranged:MOBS[k].ranged,big:MOBS[k].range>=70});
      // ฝูง 100 ตัว: ลดพลังรายตัวลงให้สู้ไหว (ความโหดยังตามเลเวลผู้เล่น) และ EXP/Zeny รายตัวลดตามจำนวน
      d.hp=Math.round(d.hp*.45);d.atk=Math.round(d.atk*.55);d.exp=Math.round(d.exp*.3);d.zeny=d.zeny.map(v=>Math.round(v*.35));d.spd=Math.round(d.spd*1.12);d.aggro=2000}""")
w = rep(w, "m.temp=true;m.dg=1;m.aggro=true;", "m.temp=true;m.dg=1;m.aggro=true;m.rush=1;")
w = rep(w, "กำจัด 3 คลื่น แล้วสู้กับผู้คุม", "3 คลื่น คลื่นละ 100 ตัววิ่งเข้าหาคุณ แล้วสู้กับผู้คุม")
w = rep(w, "<b>3 คลื่น</b> แล้วสู้กับ <b>ผู้คุมดันเจี้ยน</b>", "<b>3 คลื่น (คลื่นละ 100 ตัว วิ่งเข้าหาคุณทั้งหมด)</b> แล้วสู้กับ <b>ผู้คุมดันเจี้ยน</b>")
wr('f_world.js', w)

h = rd('index.html')
h = rep(h, "if(!m.evt&&(dist(m,{x:m.hx,y:m.hy})>700||d>520)){m.aggro=false}", "if(!m.evt&&!m.rush&&(dist(m,{x:m.hx,y:m.hy})>700||d>520)){m.aggro=false}")
h = rep(h, "if(!tryMove(m,(P.x-m.x)/d*s*dt,(P.y-m.y)/d*s*dt))m.aggro=d<m.d.range*2}", "if(!tryMove(m,(P.x-m.x)/d*s*dt,(P.y-m.y)/d*s*dt))m.aggro=m.rush?true:d<m.d.range*2}")
h = re.sub(r"f_world\.js\?v=(\d+)", lambda m: "f_world.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
