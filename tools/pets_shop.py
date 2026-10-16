# สัตว์เลี้ยง: เหลือ 5 ชนิด ซื้อที่ร้านค้า 50 ล้าน Zeny/ตัว • พาไปได้ทีละ 1 ตัว • ขณะพาไป สถานะทุกค่า +100
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

p = rd('f_progress.js')
if 'PET_PRICE' in p: raise SystemExit('already applied')
s = p.index("const PETS=["); e = p.index("const petOf=id=>")
p = p[:s] + """const PET_PRICE=50000000;   // ซื้อที่ร้านค้า ตัวละ 50 ล้าน Zeny • เก็บความเป็นเจ้าของใน P.pets เป็น 'b:<id>'
const PETS=[
  {id:'dog',n:'หมาน้อย',ic:'🐶',spr:'pet_dog',b:{},px:1.2,back:46,side:-14},
  {id:'cat',n:'แมวส้ม',ic:'🐱',spr:'pet_cat',b:{},px:1.2,back:46,side:14},
  {id:'eagle',n:'นกอินทรี',ic:'🦅',spr:'pet_eagle',b:{},px:1.1,fly:1,ox:34,oy:-6,z:30},
  {id:'pdragon',n:'มังกรเขียว',ic:'🐲',spr:'pet_dragon',b:{},px:1.1,fly:1,ox:34,oy:-6,z:30},
  {id:'fairy',n:'ภูติใบไม้',ic:'🧚',spr:'pet_fairy',b:{},px:1.1,fly:1,ox:34,oy:-6,z:32}];
const petOwned=id=>!!(P&&P.pets&&P.pets.includes('b:'+id));
window.petActive=()=>!!(P&&P.pet&&petOwned(P.pet));   // ใช้คำนวณสถานะ +100 (SBN ใน index.html)
""" + p[e:]
p = rep(p, "function setPet(id){P.pet=P.pet===id?null:id;", "function setPet(id){if(!petOwned(id))return;P.pet=P.pet===id?null:id;")
# ไข่ถูกยกเลิก
a = p.index("function giveEgg(src){"); b = p.index("REG.tick.push((dt)=>{\n  if(!P||!PT.actor)return;")
p = p[:a] + """function giveEgg(){}   // ยกเลิกระบบไข่: สัตว์เลี้ยงซื้อที่ร้านค้าเท่านั้น
function buyPet(id){
  const d=petOf(id);if(!d||petOwned(id))return;
  if(P.zeny<PET_PRICE){say(`Zeny ไม่พอ (ต้องใช้ ${PET_PRICE.toLocaleString()})`,'#ff9d9a');return}
  P.zeny-=PET_PRICE;P.pets.push('b:'+id);if(!P.pet){P.pet=id;petInit()}
  sfx('loot',3);toast(`${d.ic} ได้ ${d.n} เป็นเพื่อนร่วมทาง! สถานะทุกค่า +100`);try{ring(P.x,P.y,80,'#ffe28a',.7);burst(P.x,P.y-40,'#ffe28a',18)}catch(e){}
  recalcGear();refreshShop();refreshJob();try{save(false)}catch(e){}
}
""" + p[b:]
p = rep(p, "function petInit(){", "function petInit(){")
# โบนัสสัตว์เลี้ยงเดิมไม่ใช้แล้ว
p = rep(p, "const petBonus=()=>{const p=P.pet&&petOf(P.pet);return p?p.b:null};", "const petBonus=()=>null;   // โบนัสของสัตว์เลี้ยง = สถานะทุกค่า +100 (ดู SBN)")
# โหลดเซฟ: ตัดสัตว์เลี้ยงเก่า/ที่ยังไม่ได้ซื้อ
p = rep(p, "P.pets=P.pets||[];for(const p of PETS)if(p.free&&!P.pets.includes(p.id))P.pets.push(p.id);if(!P.pet)P.pet='dog';P.pet=P.pet||null;",
           "P.pets=(P.pets||[]).filter(x=>PETS.some(q=>'b:'+q.id===x));P.pet=P.pet&&P.pets.includes('b:'+P.pet)?P.pet:null;")
# หน้าต่างอาชีพ แท็บสัตว์เลี้ยง
a = p.index("  }else if(JB.tab==='pet'){"); b = p.index("  }else if(JB.tab==='title'){")
p = p[:a] + """  }else if(JB.tab==='pet'){
    body=`<div class="small" style="margin-bottom:6px">ซื้อสัตว์เลี้ยงได้ที่ <b>ร้านค้า (B)</b> ตัวละ ${PET_PRICE.toLocaleString()} Zeny • พาไปได้ทีละ 1 ตัว • ขณะพาไป <b style="color:#7fe07f">สถานะทุกค่า +100</b> (มี ${P.pets.length}/${PETS.length})</div>`+
      PETS.map(p=>{const own=petOwned(p.id);
        return `<div class="eqr${P.pet===p.id?' cur':''}"><div class="pet"><canvas data-sp="${own?p.spr:''}" width="44" height="44"></canvas><div class="nm">${own?`<b>${p.n}</b>`:`<b>${p.ic} ${p.n}</b>`}<br><span class="small">${own?'สถานะทุกค่า +100':'ยังไม่ได้ซื้อ'}</span></div></div>${own?`<button onclick="setPet('${p.id}')">${P.pet===p.id?'เก็บ':'พาไป'}</button>`:''}</div>`}).join('');
""" + p[b:]
# CRAFTS ไข่ + ข้อความ
p = re.sub(r"CRAFTS\.push\(\{n:'🥚 ไข่สัตว์เลี้ยงสุ่ม'[^\n]*\n", "", p, count=1)
# ร้านค้า: ส่วนสัตว์เลี้ยงต่อท้ายหน้าต่างเดิม
p += """
/* ---------- ร้านค้า: สัตว์เลี้ยง 5 ชนิด ---------- */
const _refreshShopBase=refreshShop;
refreshShop=function(){
  _refreshShopBase();
  const w=$('winShop');if(!w||w.style.display!=='block'||!P)return;
  w.innerHTML+=`<div class="sep"></div><div class="small"><b>🐾 สัตว์เลี้ยง</b> — ตัวละ ${PET_PRICE.toLocaleString()} Zeny • พาไปได้ทีละ 1 ตัว (เมนู Y) • ขณะพาไป <b style="color:#7fe07f">สถานะทุกค่า +100</b></div>`+
    PETS.map(p=>{const own=petOwned(p.id);
      return `<div class="st"><span>${p.ic} ${p.n}</span><span>${own?'<span class="small">✔ มีแล้ว</span>':`<button onclick="buyPet('${p.id}')" ${P.zeny>=PET_PRICE?'':'disabled'}>ซื้อ ${PET_PRICE/1000000}M</button>`}</span></div>`}).join('');
};
"""
wr('f_progress.js', p)

# ---- ร้านพ่อค้าเร่ ไม่ขายไข่แล้ว ----
l = rd('f_life.js')
l = re.sub(r"  \{id:'egg',n:'ไข่สัตว์เลี้ยง'[^\n]*\n", "", l, count=1)
wr('f_life.js', l)

# ---- ข้อความ ----
w = rd('f_world.js'); w = w.replace(" • ไข่สัตว์เลี้ยง (25%)", ""); wr('f_world.js', w)
g = rd('f_guide.js'); g = g.replace("ได้ EXP/ไอเทม/ไข่)", "ได้ EXP/ไอเทม)"); wr('f_guide.js', g)
m = rd('f_manual.js')
m = m.replace("ได้ EXP/ไอเทม/ไข่สัตว์เลี้ยง (จำกัดรอบต่อวัน)", "ได้ EXP/ไอเทม (จำกัดรอบต่อวัน)")
m = rep(m, "    'หมา แมว นกอินทรี มังกร ภูติ — มีครบตั้งแต่เริ่ม พาไปได้ทีละ 1 ตัว (Y แท็บสัตว์เลี้ยง)',\n    'หมา/แมววิ่งตามหลัง • นก/มังกร/ภูติลอยตามด้านบนขวา • แต่ละตัวให้โบนัสเล็กน้อย']],",
          "    'ซื้อที่ร้านค้า (B) ตัวละ 50,000,000 Zeny: หมา แมว นกอินทรี มังกร ภูติ — พาไปได้ทีละ 1 ตัว (Y แท็บสัตว์เลี้ยง)',\n    'ขณะพาไป สถานะทุกค่า +100 • หมา/แมววิ่งตามหลัง • นก/มังกร/ภูติลอยตามด้านบนขวา']],")
wr('f_manual.js', m)

# ---- index.html: สถานะ +100 จากสัตว์เลี้ยง ----
h = rd('index.html')
h = rep(h, "const SBN=()=>P&&P.job&&P.job.t===2?100:0;", "const SBN=()=>(P&&P.job&&P.job.t===2?100:0)+(window.petActive&&window.petActive()?100:0);")
h = h.replace("// ตื่นรู้ (Lv50) = สถานะทุกค่า +100 (STR/AGI/VIT/INT)", "// ตื่นรู้ (Lv50) +100 และพาสัตว์เลี้ยงไปด้วย +100 = สถานะทุกค่า (STR/AGI/VIT/INT)")
h = h.replace('title="โบนัสตื่นรู้"', 'title="โบนัสตื่นรู้ / สัตว์เลี้ยง"')
wr('index.html', h)
print('ok')
