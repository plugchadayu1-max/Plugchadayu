# ออโต้: ล่าเฉพาะจุดที่กด (คลิกพื้น = ย้ายจุดล่าไปจุดนั้น) ไม่ย้ายจุด/แมพตามเลเวลเองอีก (ยกเว้นออโต้ภารกิจที่เลือกมอนสเตอร์)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(G, 'index.html')
h = open(p, encoding='utf-8-sig').read()
def rep(a, b):
    global h
    if a not in h: raise SystemExit('missing: ' + a[:90])
    h = h.replace(a, b, 1)

rep('  <label><input type="checkbox" id="aMove" checked> ย้ายจุดล่า/แมพตามเลเวล</label>\n', '')
rep("  if(AUTO.cfg.move){const b=autoBestSpot();if(b)return{x:b.hx,y:b.hy}}\n", "")
rep("""  const i=MAP_ORDER.indexOf(MAPID),minLv=k=>parseInt(MAPS[MAP_ORDER[k]].lv);
  if(i<MAP_ORDER.length-1&&P.lv>=minLv(i+1)+1)return MAP_ORDER[i+1];
  if(i>0&&P.lv<minLv(i)-1)return MAP_ORDER[i-1];
  return MAPID;""", "  return MAPID;   // ไม่ย้ายแมพตามเลเวลเอง — ล่าในแมพที่ผู้เล่นอยู่")
rep("  if(AUTO.cfg.move&&AUTO.chkT<=0){AUTO.chkT=6;if(autoRelocate())return}",
    "  if(AUTO.focus&&AUTO.chkT<=0){AUTO.chkT=6;if(autoRelocate())return}   // ย้ายจุด/แมพเฉพาะตอนออโต้ภารกิจที่เลือกมอนสเตอร์ไว้")
rep("[['aSkill','skill'],['aPot','pot'],['aSafe','safe'],['aRest','rest'],['aMove','move'],['aSell','sell'],['aEquip','equip']]",
    "[['aSkill','skill'],['aPot','pot'],['aSafe','safe'],['aRest','rest'],['aSell','sell'],['aEquip','equip']]")
rep("P.target=null;P.dest={x:clamp(w.x,40,WORLD.w-40),y:clamp(w.y,120,WORLD.h-30)};if(AUTO.on)AUTO.pause=2}",
    "P.target=null;P.dest={x:clamp(w.x,40,WORLD.w-40),y:clamp(w.y,120,WORLD.h-30)};\n    if(AUTO.on){AUTO.anchor={x:P.dest.x,y:P.dest.y};AUTO.pause=0;AUTO.focus=AUTO.focusRef=null;if(AUTO.mode==='hunt')autoStatus('ออโต้: ล่าเฉพาะจุดนี้');toast('📍 ออโต้: ล่าเฉพาะจุดที่กด')}}")
open(p, 'w', encoding='utf-8').write(h)
print('ok')
