# ปาร์ตี้: แบ่ง EXP 80% — เมื่อสมาชิกฆ่ามอนสเตอร์ เพื่อนในปาร์ตี้ที่อยู่แมพเดียวกันได้ EXP 80% ของที่มอนสเตอร์ให้ (ส่งแบบรวมชุดทุก ~1 วินาที ผ่านแชนเนลปาร์ตี้)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

s = rd('f_social.js')
if 'PARTY_SHARE' in s: raise SystemExit('already applied')
s = rep(s, "  ch.subscribe(s=>{if(s==='SUBSCRIBED'&&SOC.partyCh===ch)partyTrack()});",
"""  // รับ EXP แบ่งจากเพื่อนในปาร์ตี้ (เฉพาะแมพเดียวกัน)
  ch.on('broadcast',{event:'xp'},m=>{
    try{
      const pl=m&&m.payload;if(!pl||!P||P.hp<=0||P.dying>0||pl.map!==MAPID||pl.uid===SESS.user.id)return;
      let e=Math.round(+pl.exp||0);if(!(e>0))return;
      e=Math.min(e,Math.round(need(P.lv)*.08));   // กันค่าผิดปกติ
      e=Math.round(e*(bm().exp||1));
      P.exp+=e;SOC.shareGot=(SOC.shareGot||0)+e;checkLevel();
      float(P.x,P.y-CLASSES[P.cls].h-24,`+${e.toLocaleString()} EXP 🤝`,'#9ff0a0');
    }catch(err){}
  });
  ch.subscribe(s=>{if(s==='SUBSCRIBED'&&SOC.partyCh===ch)partyTrack()});""")
s = rep(s, "// โบนัส EXP: เพื่อนในปาร์ตี้ที่อยู่แมพเดียวกัน +10% ต่อคน (สูงสุด +30%)",
"""// แบ่ง EXP 80%: สะสม EXP ที่ฆ่าได้ แล้วส่งให้เพื่อนทุก ~1 วินาที (ไม่ส่งถี่เกิน) • ผู้รับได้ 80% ของ EXP ต้นทาง
const PARTY_SHARE=.8;
SOC.shareAcc=0;SOC.shareT=0;
REG.kill.push(m=>{if(SOC.partyCh&&SOC.members.length>1&&partyNear()>0)SOC.shareAcc+=Math.round((m.d.exp||0)*PARTY_SHARE)});
REG.tick.push(dt=>{
  if(!SOC.shareAcc)return;SOC.shareT-=dt;
  if(SOC.shareT>0)return;SOC.shareT=1;
  const e=SOC.shareAcc;SOC.shareAcc=0;
  if(!SOC.partyCh||partyNear()<1)return;
  try{SOC.partyCh.send({type:'broadcast',event:'xp',payload:{uid:SESS.user.id,map:MAPID,exp:e}})}catch(err){}
});
// โบนัส EXP: เพื่อนในปาร์ตี้ที่อยู่แมพเดียวกัน +10% ต่อคน (สูงสุด +30%)""")
s = rep(s, "สมาชิกที่อยู่แมพเดียวกันให้ EXP +10% ต่อคน (สูงสุด +30%)", "สมาชิกที่อยู่แมพเดียวกันให้ EXP +10% ต่อคน (สูงสุด +30%) และแบ่ง EXP 80% ของที่เพื่อนฆ่าได้")
s = rep(s, "อยู่แมพเดียวกัน = EXP +10% ต่อเพื่อน 1 คน", "อยู่แมพเดียวกัน = EXP +10% ต่อเพื่อน 1 คน • เพื่อนฆ่ามอนสเตอร์ คุณได้ EXP แบ่ง 80%")
s = rep(s, "`EXP +${n*10}% (เพื่อนในแมพนี้ ${n} คน)`", "`EXP +${n*10}% • แบ่ง EXP 80% (เพื่อนในแมพนี้ ${n} คน)`")
wr('f_social.js', s)

h = rd('index.html')
h = re.sub(r"f_social\.js\?v=(\d+)", lambda m: "f_social.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)

m = rd('f_manual.js')
m = rep(m, "'อันดับ (L) เรียงตามพลังรบ", "'ปาร์ตี้ (แตะผู้เล่นอื่นในแมพเพื่อชวน สูงสุด 4 คน): อยู่แมพเดียวกัน EXP +10% ต่อคน และเพื่อนฆ่ามอนสเตอร์คุณได้ EXP แบ่ง 80%',\n    'อันดับ (L) เรียงตามพลังรบ")
wr('f_manual.js', m)
h = rd('index.html')
h = re.sub(r"f_manual\.js\?v=(\d+)", lambda m: "f_manual.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
