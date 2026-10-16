# ATK มอนสเตอร์แมพ 101-200 ลดลง (x4 -> x2.5, HP คง x4) • ยาฟื้นเลือด/SP: ฟื้นตาม % ของค่าสูงสุดด้วย กดมือรัวได้ และออโต้กินเร็วขึ้น
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(G, 'index.html')
h = open(p, encoding='utf-8-sig').read()
def rep(a, b):
    global h
    if a not in h: raise SystemExit('missing: ' + a[:90])
    h = h.replace(a, b, 1)
if 'POT_PCT' in h: raise SystemExit('already applied')

rep("s.hp=Math.round(s.hp*4);s.atk=Math.round(s.atk*4)", "s.hp=Math.round(s.hp*4);s.atk=Math.round(s.atk*2.5)")
rep("HP และ ATK x4 (ใช้ตอน", "HP x4 / ATK x2.5 (ใช้ตอน")
rep("""  if(k==='hp'){const h=POTS.hp.heal+P.lv*6;P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-C.h-10,`+${h}`,'#8bf08b',true)}
  else{const h=POTS.sp.heal+P.lv*2;P.sp=Math.min(maxSp(),P.sp+h);float(P.x,P.y-C.h-10,`+${h} SP`,'#8fc4ff',true)}""",
"""  // ฟื้นตามเลเวลหรือ % ของค่าสูงสุด (เอาค่าที่มากกว่า) เพื่อให้กดมือรัว/ออโต้ดื่มต่อเนื่องแล้วทันกับมอนสเตอร์เลเวลสูง
  if(k==='hp'){const h=Math.max(POTS.hp.heal+P.lv*6,Math.round(maxHp()*POT_PCT.hp));P.hp=Math.min(maxHp(),P.hp+h);float(P.x,P.y-C.h-10,`+${h}`,'#8bf08b',true)}
  else{const h=Math.max(POTS.sp.heal+P.lv*2,Math.round(maxSp()*POT_PCT.sp));P.sp=Math.min(maxSp(),P.sp+h);float(P.x,P.y-C.h-10,`+${h} SP`,'#8fc4ff',true)}""")
rep("function usePot(k){", "const POT_PCT={hp:.3,sp:.35};   // ยาแดงฟื้นอย่างน้อย 30% ของ HP สูงสุด • ยาน้ำเงิน 35% ของ SP สูงสุด\nfunction usePot(k){")
rep("    if(hpF<.4&&P.pot.hp>0){usePot('hp');AUTO.potCd=1.2}\n    else if(spF<.2&&P.pot.sp>0){usePot('sp');AUTO.potCd=1.2}",
    "    if(hpF<.55&&P.pot.hp>0){usePot('hp');AUTO.potCd=.6}\n    else if(spF<.25&&P.pot.sp>0){usePot('sp');AUTO.potCd=.6}")
open(p, 'w', encoding='utf-8').write(h)
print('ok')
