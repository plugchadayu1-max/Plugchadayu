# กระเป๋า 100 ช่อง • ทำอาหารแล้วอาหารเข้ากระเป๋าอัตโนมัติ (แท็บ "ใช้") กดกินเมื่อต้องการ
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

h = rd('index.html')
if 'foodURL' in h: raise SystemExit('already applied')
h = rep(h, "const BAG_MAX=32;", "const BAG_MAX=100;")
h = rep(h, "function itemIcon(it){return it.kind==='use'?potionURL(it.pot):",
"""// ไอคอนอาหาร: วาดอีโมจิของเมนูลงแคนวาสเล็ก (เก็บแคช)
const FOOD_ICON={};
function foodURL(id){
  if(FOOD_ICON[id])return FOOD_ICON[id];
  const fi=window.foodInfo&&foodInfo(id),c=document.createElement('canvas');c.width=c.height=36;const g=c.getContext('2d');
  g.fillStyle='#2a1c10';g.fillRect(0,0,36,36);g.fillStyle='#4a3420';g.fillRect(2,2,32,32);
  g.font='22px "Segoe UI Emoji","Apple Color Emoji",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(fi?fi.ic:'🍲',18,19);
  return FOOD_ICON[id]=c.toDataURL();
}
function eatFood(id){
  const f=P.dx&&P.dx.food;if(!f||!(f[id]>0))return;const fi=foodInfo(id);if(!fi)return;
  f[id]--;if(f[id]<=0)delete f[id];
  addBuff('food_'+id,fi.mins);sfx('levelup');toast(`${fi.ic} กิน${fi.n} — ${fi.d}`);refreshBag();
}
function itemIcon(it){return it.food?foodURL(it.food):it.kind==='use'?potionURL(it.pot):""")
h = rep(h, "  return BAG.tab==='use'?pots:BAG.tab==='equip'?eq:[...pots,...eq];",
"""  const fd=(P.dx&&P.dx.food)||{},foods=Object.keys(fd).filter(id=>fd[id]>0&&window.foodInfo&&foodInfo(id)).map(id=>({kind:'use',food:id,pot:'hp',name:foodInfo(id).n,count:fd[id],rar:1}));
  return BAG.tab==='use'?[...pots,...foods]:BAG.tab==='equip'?eq:[...pots,...foods,...eq];""")
h = rep(h, "const key=it.kind==='use'?'u:'+it.pot:'b:'+it.bi;", "const key=it.food?'f:'+it.food:it.kind==='use'?'u:'+it.pot:'b:'+it.bi;")
h = rep(h, "  if(s.startsWith('u:'))return P.pot[s.slice(2)]>0?",
"""  if(s.startsWith('f:')){const id=s.slice(2),n=P.dx&&P.dx.food&&P.dx.food[id]||0,fi=window.foodInfo&&foodInfo(id);return n>0&&fi?{it:{kind:'use',food:id,pot:'hp',name:fi.n,count:n,rar:1},food:id}:null}
  if(s.startsWith('u:'))return P.pot[s.slice(2)]>0?""")
h = rep(h, "  if(it.kind==='use'){\n    h=`<div class=\"tn\"><img src=\"${potionURL(it.pot)}\"",
"""  if(it.food){
    const fi=foodInfo(it.food);
    h=`<div class="tn"><img src="${foodURL(it.food)}" style="width:28px;height:28px;image-rendering:pixelated;vertical-align:middle"> ${it.name} x${it.count}</div>${fi.d} • นาน ${fi.mins} นาที
       <div class="tb"><button onclick="eatFood('${it.food}')">กิน</button></div>`;
  }else if(it.kind==='use'){
    h=`<div class="tn"><img src="${potionURL(it.pot)}\"""")
wr('index.html', h)

l = rd('f_life.js')
l = rep(l, "for(const r of RECIPES)BUFFS['food_'+r.id]=r.def;",
"for(const r of RECIPES)BUFFS['food_'+r.id]=r.def;\n// ข้อมูลอาหารสำหรับกระเป๋า (index.html: bagList / eatFood)\nwindow.foodInfo=id=>{const r=RECIPES.find(q=>q.id===id);return r?{n:r.n,ic:r.ic,d:r.d,mins:r.mins}:null};")
l = rep(l, "P.dx.stat.cook++;addBuff('food_'+r.id,r.mins);sfx('levelup');toast(`${r.ic} ทำ${r.n}สำเร็จ!`);refreshLife();",
           "P.dx.stat.cook++;P.dx.food=P.dx.food||{};P.dx.food[r.id]=(P.dx.food[r.id]||0)+1;   // เข้ากระเป๋าอัตโนมัติ (แท็บ ใช้)\n  sfx('levelup');toast(`${r.ic} ทำ${r.n}สำเร็จ! เก็บเข้ากระเป๋าแล้ว`);say(`${r.ic} ${r.n} อยู่ในกระเป๋า (แท็บ ใช้) กดกินเมื่อต้องการ`,'#ffd27a');refreshLife();try{if($('winBag').style.display==='block')refreshBag()}catch(e){}")
wr('f_life.js', l)

h = rd('index.html')
h = re.sub(r"f_life\.js\?v=(\d+)", lambda m: "f_life.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
