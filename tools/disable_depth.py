# ยกเลิกระบบ ความสามารถ / ธาตุ / การ์ด (ปิดผลและซ่อน UI คงโค้ดเดิมไว้ให้ไฟล์อื่นไม่พัง)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:80])
    return t.replace(a, b, 1)

h = rd('index.html')
h = rep(h, '<button class="btn" id="bDepth">ความสามารถ (X)</button>', '')
wr('index.html', h)

d = rd('f_depth.js')
if 'ยกเลิกระบบการ์ด' in d: raise SystemExit('already applied')
d = rep(d, "  let ch=d.boss?.15:d.elite?.04:.006;if(m.dg)ch*=2;if(d.world)ch=1;ch=Math.min(1,ch*X.cardx);\n  if(MOBS[m.k]&&Math.random()<ch)giveCard(m.k,m.x,m.y);\n", "")
d = rep(d, "  TAL.forEach((t,i)=>{if(P.lv<t.lv)return;const o=t.o.find(q=>q.id===P.dx.tal[i]);if(o){add(o.b);if(o.x)mergeX(X,o.x)}});\n", "")
d = rep(d, "  for(const k of P.dx.cs){if(!k)continue;const e=cardEff(k);if(e){add(e.b);if(e.x)mergeX(X,e.x)}}\n", "")
d = rep(d, "  const n=Object.keys(P.dx.cards).filter(k=>MOBS[k]).length;add({atk:n*.002,hp:n*.002});   // โบนัสสะสมการ์ด\n", "")
d = rep(d, "const talConv=()=>DXC&&DXC.conv;\nconst skEl=i=>talConv()||((SKEL[P.cls]||[])[i])||null;\nconst basicEl=()=>(P.dx&&P.dx.imbue)||talConv()||null;",
        "// ยกเลิกระบบธาตุ: ไม่มีธาตุสกิล/ธาตุอาวุธ ไม่มีจุดอ่อน-ต้านทาน (โค้ดเดิมคงไว้ ไม่ทำงาน)\nconst talConv=()=>null;\nconst skEl=i=>null;\nconst basicEl=()=>null;")
d = rep(d, "  const el=ELCTX,me=MEL[m.k]||null,X=DXC;let mult=1,tag=null;", "  const el=null,me=null,X=DXC;let mult=1,tag=null;")
d = rep(d, "function giveCard(k,x,y,why){\n", "function giveCard(k,x,y,why){\n  return;   // ยกเลิกระบบการ์ด\n")
d = rep(d, "addEventListener('keydown',e=>{if(P&&keyName(e)==='x')toggleWin('winDepth')});\n", "")
d = rep(d, "REG.draw.push((Ls,iv)=>{\n  if(!P||!P.dx||inTown(P.x,P.y))return;const my=curEl();", "REG.draw.push((Ls,iv)=>{\n  return;   // ยกเลิกป้ายธาตุเหนือมอนสเตอร์\n  if(!P||!P.dx||inTown(P.x,P.y))return;const my=curEl();")
d = d.rstrip('\n') + "\nfor(const k in MEL)delete MEL[k];   // ยกเลิกธาตุมอนสเตอร์\n"
wr('f_depth.js', d)

l = rd('f_life.js')
l = rep(l, "talk:['ก่อนจะข้ามไปดินแดนน้ำแข็งเลือด เธอต้องรู้จักศัตรูให้มากกว่านี้','การ์ดมอนสเตอร์คือบันทึกพลังของพวกมัน','สะสมการ์ดให้ได้ 8 ชนิด แล้วฉันจะมอบของพิเศษให้'],obj:{t:'cards',c:8,txt:'สะสมการ์ดต่างชนิด 8 ใบ'}",
        "talk:['ก่อนจะข้ามไปดินแดนน้ำแข็งเลือด เธอต้องฝึกฝนให้มากกว่านี้','ศัตรูทางเหนือแข็งแกร่งกว่าที่เธอเคยเจอ','ล่ามอนสเตอร์ให้ได้ 80 ตัว แล้วฉันจะมอบของพิเศษให้'],obj:{t:'killAny',c:80,txt:'ล่ามอนสเตอร์ใดก็ได้ 80 ตัว'}")
l = rep(l, "'เตรียมการ์ดและธาตุให้พร้อม แล้วไปจบมัน'", "'เตรียมอุปกรณ์และสกิลให้พร้อม แล้วไปจบมัน'")
l = rep(l, "'ทุกอย่างที่เธอสะสมมา — สกิล การ์ด ธาตุ — ใช้ให้หมด! โค่นมันซะ!'", "'ทุกอย่างที่เธอสะสมมา — สกิล อุปกรณ์ — ใช้ให้หมด! โค่นมันซะ!'")
l = rep(l, "${c.r.card?` • การ์ด${MOBS[c.r.card].name}`:''}", "")
l = re.sub(r"  \{id:'card1',n:'ซองการ์ดสุ่ม'.*?\},\n", "", l, count=1, flags=re.S)
l = re.sub(r"  \{id:'card5',n:'ซองการ์ด x5'.*?\},\n", "", l, count=1, flags=re.S)
wr('f_life.js', l)

g = rd('f_guide.js')
g = rep(g, "  if(r.card)t+=` • 🃏การ์ด${MOBS[r.card].name}`;\n", "")
g = rep(g, "  if(r.cardRand)t+=' • 🃏 (โอกาส)';return t;", "  return t;")
g = re.sub(r"  if\(TAL\.some\(\(t,i\)=>P\.lv>=t\.lv&&!P\.dx\.tal\[i\]\)\)add\([^\n]*\n", "", g, count=1)
g = re.sub(r"  const free=Math\.min\(cardSlots\(\),4\)[^\n]*\n  if\(free>0&&cardKeys[^\n]*\n", "", g, count=1)
wr('f_guide.js', g)
print('ok')
