# มอนสเตอร์แมพ Lv 101-200: HP x2 และ ATK x2 (เฉพาะมอนสเตอร์ประจำแมพ ไม่รวมดันเจี้ยน/บอสโลกที่คำนวณจากเลเวลผู้เล่น)
import os
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(G, 'index.html')
h = open(p, encoding='utf-8-sig').read()
a = "tint:o.tint?TINTS[o.tint]:null},mobStats(lv,o));"
assert a in h and 'TOUGH_HI' not in h
b = "tint:o.tint?TINTS[o.tint]:null},TOUGH_HI(lv,mobStats(lv,o)));"
h = h.replace(a, b, 1)
helper = "// แมพ Lv 101-200 โหดขึ้น: HP และ ATK x2 (ใช้ตอนสร้างตารางมอนสเตอร์จาก ROSTER เท่านั้น)\nconst TOUGH_HI=(lv,s)=>{if(lv>100){s.hp=Math.round(s.hp*2);s.atk=Math.round(s.atk*2)}return s};\n"
h = h.replace("const MOBS={};", helper + "const MOBS={};", 1)
open(p, 'w', encoding='utf-8').write(h)
print('ok')
