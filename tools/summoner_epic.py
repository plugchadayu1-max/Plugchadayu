# นักอัญเชิญ: สกิลอลังการขึ้น + อัลติเมท (ท่าไม้ตายสาย A/B) เรียกกองทัพโครงกระดูกพร้อมดูดเลือด +15%
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:100])
    return t.replace(a, b, 1)

# ---------- index.html: สกิลพื้นฐาน + ท่า summon ----------
h = rd('index.html')
if 'amult' in h: raise SystemExit('already applied')
h = rep(h, "{n:'Raise Skeleton',ic:'💀',sp:18,cd:8,type:'summon',anim:'skill1',dur:.8,hitAt:.66,mult:1.1,range:420,life:16,maxMinions:3,col:'#b98cff'},",
           "{n:'Raise Skeleton',ic:'💀',sp:18,cd:8,type:'summon',anim:'skill1',dur:.8,hitAt:.66,mult:1.2,range:420,life:18,maxMinions:4,count:2,r:170,amult:1.4,nova:7,vfx:'war5',tint:'hue-rotate(255deg) saturate(1.2)',col:'#b98cff',shake:3},")
h = rep(h, "{n:'Bone Prison',ic:'🦴',sp:20,cd:7,type:'aoeT',anim:'skill2',dur:.75,hitAt:.62,mult:2.1,r:120,range:360,col:'#c58aff',vfx:'war5',tint:'hue-rotate(255deg) saturate(1.1)',stun:1.6},",
           "{n:'Bone Prison',ic:'🦴',sp:20,cd:7,type:'aoeT',anim:'skill2',dur:.75,hitAt:.62,mult:2.4,r:190,range:380,col:'#c58aff',vfx:'war5',nova:10,tint:'hue-rotate(255deg) saturate(1.2)',stun:1.8,shake:5},")
h = rep(h, "{n:'Soul Vortex',ic:'👻',sp:28,cd:11,type:'aoe',anim:'skill3',dur:.85,hitAt:.55,mult:2.6,r:160,col:'#8fffa0',vfx:'war5',nova:8,tint:'hue-rotate(255deg) saturate(1.2)',slow:2.5,shake:4}]},",
           "{n:'Soul Vortex',ic:'👻',sp:28,cd:11,type:'aoe',anim:'skill3',dur:.85,hitAt:.55,mult:3,r:230,col:'#8fffa0',vfx:'war5',vfx2:'war4',nova:12,tint:'hue-rotate(255deg) saturate(1.2)',slow:2.5,shake:6}]},")
# ท่า summon: เรียกหลายตน + คลื่นพลังรอบตัว (ถ้ามี r)
h = rep(h, "    SA({target:t0,hit:()=>{if(typeof summonMinion==='function')summonMinion(s)}});\n    return}",
"""    SA({target:t0,hit:()=>{
      if(typeof summonMinion==='function')summonMinion(s);
      if(s.r){   // คลื่นพลังวิญญาณเรียกโครงกระดูก: วงแหวนซ้อน + ระเบิดรอบตัว + โจมตี/มึนศัตรูรอบตัว
        ring(P.x,P.y,s.r,s.col,.75);ring(P.x,P.y,s.r*.62,'#ffffff',.55);ring(P.x,P.y,s.r*.3,s.col,.4);burst(P.x,P.y-30,s.col,22);shake=Math.max(shake,s.shake||4);
        vfx(s.vfx,P.x,P.y-C.h*.35,{tint:s.tint});
        if(s.nova)for(let k=0;k<s.nova;k++){const a=k/s.nova*Math.PI*2;vfx(s.vfx,P.x+Math.cos(a)*s.r*.7,P.y+Math.sin(a)*s.r*.45,{scale:.42,delay:.05+k*.04,tint:s.tint})}
        let n=0;for(const m of mobs)if(!m.dead&&dist(P,m)<s.r+m.d.h*.3){hitMob(m,calcDmg(s.amult||s.mult),true);afflict(m);n++}
      }
    }});
    return}""")
wr('index.html', h)

# ---------- f_summon.js: หลายตน + ดูดเลือด ----------
f = rd('f_summon.js')
f = rep(f, "  const max=s.maxMinions||3;\n  while(MIN.length>=max)MIN.shift();\n  const a=Math.random()*Math.PI*2;\n  const px=(typeof MOBS==='object'&&MOBS.swarrior&&MOBS.swarrior.px)||1;\n  const m={x:P.x+Math.cos(a)*38,y:P.y+Math.sin(a)*24,life:s.life||16,mult:s.mult||1,atkCd:.6,hitIn:0,tgt:null,map:MAPID,actor:makeActor(SPR,px)};\n  m.actor.ang=P.actor.ang;oneShot(m.actor,'spawn',.7);\n  MIN.push(m);\n  const c=s.col||'#b98cff';\n  ring(m.x,m.y,46,c,.6);burst(m.x,m.y-16,c,14);\n  say('เรียกโครงกระดูกอัศวินมาช่วยสู้!','#c9a8ff');",
"""  const max=s.maxMinions||3,cnt=s.count||1,c=s.col||'#b98cff';
  const px=(typeof MOBS==='object'&&MOBS.swarrior&&MOBS.swarrior.px)||1;
  for(let k=0;k<cnt;k++){
    while(MIN.length>=max)MIN.shift();
    const a=(k/cnt)*Math.PI*2+Math.random()*.6,r=36+k*7;
    const m={x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r*.65,life:s.life||16,mult:s.mult||1,ls:s.ls||0,atkCd:.6+k*.1,hitIn:0,tgt:null,map:MAPID,actor:makeActor(SPR,px)};
    m.actor.ang=P.actor.ang;oneShot(m.actor,'spawn',.7);
    MIN.push(m);
    ring(m.x,m.y,46,c,.6);burst(m.x,m.y-16,c,14);
  }
  say(cnt>1?`เรียกโครงกระดูก ${cnt} ตนมาช่วยสู้!${s.ls?' (ดูดเลือด +'+Math.round(s.ls*100)+'%)':''}`:'เรียกโครงกระดูกอัศวินมาช่วยสู้!','#c9a8ff');""")
f = rep(f, "        hitMob(m.tgt,calcDmg(m.mult),false);\n",
"""        const dm=calcDmg(m.mult);hitMob(m.tgt,dm,false);
        if(m.ls&&P&&P.hp>0){const hl=Math.max(1,Math.round(dm*m.ls));P.hp=Math.min(maxHp(),P.hp+hl);float(P.x,P.y-90,`+${hl}`,'#8bf08b');ring(m.x,m.y,22,'#8bf08b',.25)}   // ดูดเลือด
""")
wr('f_summon.js', f)

# ---------- f_progress.js: อัลติเมทสายนักอัญเชิญ ----------
p = rd('f_progress.js')
a = p.index("  mage:{\n    A:{n:'ราชาวิญญาณ'"); b = p.index("  archer:{\n    A:{n:'ผู้เรียกพายุ'")
p = p[:a] + """  mage:{
    A:{n:'ราชาวิญญาณ',n2:'จักรพรรดิวิญญาณ',ic:'👻',d:'SP เยอะ คุมสนามด้วยวิญญาณและกองทัพโครงกระดูก',p:{sp:.25,hp:.1},ud:'กรีดร้องวิญญาณรอบตัว ศัตรูมึน 3 วิ แล้วเรียกกองทัพโครงกระดูก 4 ตนช่วยสู้ 22 วิ ทุกตนดูดเลือดให้คุณ +15%',
      u:{n:'Banshee Wail',ic:'👻',sp:48,cd:5,type:'summon',anim:'skill3',dur:1.0,hitAt:.5,mult:2.4,amult:3.2,range:420,life:22,maxMinions:6,count:4,ls:.15,r:290,nova:12,col:'#b98cff',vfx:'war5',tint:'hue-rotate(255deg)',stun:3,shake:7}},
    B:{n:'จอมอสูรกระดูก',n2:'ราชันย์อสูรกระดูก',ic:'💀',d:'พลังอัญเชิญระเบิด ดาเมจเป้าเดียวสูง และกองทัพกระดูก',p:{atk:.22,sp:.1},ud:'กะโหลกมหึมาหล่นถล่มวงกว้าง ศัตรูช้า แล้วกระดูกผุดเป็นโครงกระดูก 3 ตนที่แรงกว่า 22 วิ ทุกตนดูดเลือดให้คุณ +15%',
      u:{n:'Skull Meteor',ic:'💀',sp:50,cd:5,type:'summon',anim:'skill3',dur:1.0,hitAt:.5,mult:3.4,amult:6,range:420,life:22,maxMinions:5,count:3,ls:.15,r:230,nova:10,col:'#c58aff',vfx:'war5',tint:'hue-rotate(255deg)',slow:3.5,shake:8}}},
""" + p[b:]
wr('f_progress.js', p)

h = rd('index.html')
for fn in ('f_summon', 'f_progress'):
    h = re.sub(fn + r"\.js\?v=(\d+)", lambda m, fn=fn: "%s.js?v=%d" % (fn, int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
