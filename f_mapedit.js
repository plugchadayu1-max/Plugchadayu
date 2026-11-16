/* ============ f_mapedit.js — โหมดผู้สร้าง: จัดวางแมพเอง ============
   ผู้สร้างเกมวาดแมพบนกริดได้เอง ตั้งชื่อ/ไอคอน/ช่วงเลเวล/ธีมสี
   v15: • มุมมอง "เกม 2D" — เห็นแมพเหมือนตอนเล่นจริง (พื้น/ต้นไม้/อาคาร/NPC) ลาก-ซูมได้
        • วาง/ย้าย/ลบ NPC ร้านค้า ป้ายเควสต์ ช่างตีเหล็ก กระท่อม ศาลเทพี ปราสาท กองไฟ จุดเกิด ได้เอง
   • เซฟลงในเครื่อง → แมพโผล่ในหน้าต่างวาร์ป (T) และประตูวาร์ปในเมืองทันที (รีเฟรช 1 ครั้ง)
   • ส่งออกเป็นไฟล์ .json แจกจ่าย/สำรองได้  • นำเข้าไฟล์ .json ได้
   เข้าผ่าน: ปุ่ม "🛠 จัดวางแมพ" หน้าเริ่มเกม / เมนู ☰ → ระบบ (ต้องใส่รหัสผู้สร้าง) */
'use strict';
const CREATOR_CODE='Plugnaja27';   // ★ เปลี่ยนรหัสผู้สร้างเป็นรหัสของคุณก่อนอัปโหลด!
const CM_KEY='mq_custommaps';
const isCreator=()=>{try{return localStorage.getItem('mq_creator')==='1'}catch(e){return false}};
function askCreator(){
  if(isCreator())return true;
  const c=prompt('🔑 รหัสผู้สร้าง (Map Editor):');
  if(c===null)return false;
  if(c.trim()===CREATOR_CODE){try{localStorage.setItem('mq_creator','1')}catch(e){}return true}
  alert('รหัสไม่ถูกต้อง');return false;
}

/* ---- ธีมสำเร็จรูป: ยืมพาเลต/ของประดับจากแมพหลัก ---- */
const ED_THEMES={
  forest:{label:'🌲 ป่าเขียว',pal:MAPS.forest.pal,trees:'tree',deco:['bush','rock','flower'],portal:['#3fbf5f','#9ff0b0']},
  desert:{label:'🏜️ ทะเลทราย',pal:MAPS.desert.pal,trees:null,deco:['cactus','bones','rock'],portal:['#e0a040','#ffe0a0']},
  snow:{label:'❄️ น้ำแข็ง',pal:MAPS.snow.pal,trees:null,deco:['snowrock','crystal','snowpine'],portal:['#4ab0f0','#c0f0ff']},
  sky:{label:'☁️ เมฆ/ทวีปลอย',pal:MAPS.sky.pal,trees:'tree',deco:['snowrock','crystal','flower'],portal:['#a8d8ff','#ffffff']},
  lava:{label:'🌋 ลาวา',pal:MAPS.lava.pal,trees:null,deco:['rock','bones'],portal:['#ff7a1a','#ffd27a']},
  dark:{label:'🌑 มืด/เงา',pal:MAPS.deepwood.pal,trees:'tree',deco:['bush','rock'],portal:['#9a5af0','#d8b8ff']}
};
const TILES={'.':'หญ้า',',':'หญ้าหยาบ','T':'ป่าทึบ(กั้น)','~':'น้ำ(กั้น)','#':'หน้าผา(กั้น)','=':'สะพาน','H':'เมือง','o':'หลุม','r':'เสา/เสาหิน','i':'พื้นพิเศษ'};
const TILE_COL={'.':'#5fa046',',':'#8a9060','T':'#2e6228','~':'#3f86c0','#':'#6a6a72','=':'#8a6038','H':'#c8b890','o':'#3a3a44','r':'#9a8c76','i':'#a4d4ee'};
/* ตำแหน่งไอซ์แลนด์บนแผนที่โลก (wmDraw) สำรองไว้ 6 ช่อง */
const WM_SLOTS=[[96,172],[430,172],[262,318],[96,318],[430,318],[262,110]];

/* ---- ชนิดวัตถุที่วางได้ (v15): อาคาร / NPC / กองไฟ / จุดเกิด ---- */
const ED_OBJS={
  shop:{label:'🏪 ร้านค้า',b:1,tip:'คลิก/ลากเพื่อวางตำแหน่งร้านค้า'},
  quest:{label:'📜 ป้ายเควสต์',b:1},
  smith:{label:'⚒ ช่างตีเหล็ก',b:1},
  hut:{label:'🛖 กระท่อมลุงปลา',b:1},
  shrine:{label:'⛩ ศาลเทพี (จุติ)',b:1},
  castle:{label:'🏰 ปราสาท',b:1},
  fire:{label:'🔥 กองไฟ',multi:1},
  spawn:{label:'🚩 จุดเกิด/กลับเมือง'},
  n_elder:{label:'🧓 นักผจญภัยชรา',npc:'elder'},
  n_sage:{label:'🧙 ปราชญ์ลูน่า',npc:'sage'},
  n_merchant:{label:'🧺 พ่อค้าเร่ฮันนา',npc:'merchant'},
  n_cook:{label:'🍳 ป้าใบ',npc:'cook'},
  n_guide:{label:'🧭 นักสำรวจเอลซ่า',npc:'guide'},
  n_smith:{label:'🔨 ช่างตีเหล็กบอร์ก',npc:'smith'},
  n_fisher:{label:'🎣 ลุงปลา',npc:'fisher'},
  n_rebirth:{label:'✨ เทพีเอลิน',npc:'rebirth'}
};
const ED_BUILDINGS=['shop','quest','smith','hut','shrine','castle'];

/* ---- ผสานแมพ custom เข้าระบบ (MAPS / MAP_ORDER / วาร์ป / แผนที่โลก) ---- */
let CMAPS={};
try{CMAPS=JSON.parse(localStorage.getItem(CM_KEY)||'{}')||{}}catch(e){CMAPS={}}
function applyCustomMap(id,d){
  if(!d||!Array.isArray(d.grid)||!d.grid.length)return false;
  const th=ED_THEMES[d.theme]||ED_THEMES.forest,gn=d.gn||32;
  const grid=d.grid.map(r=>(r+'#'.repeat(gn)).slice(0,gn));   // งกความยาวให้ตรง gn
  while(grid.length<gn)grid.push('#'.repeat(gn));
  const M={name:String(d.name||id).slice(0,20),ic:d.ic||'🗺️',lv:String(d.lv||(d.lv1+'-'+d.lv2)||'1-20'),gn,grid,
    pal:th.pal,trees:th.trees,deco:th.deco,mtn:false,custom:1};
  if(Array.isArray(d.objs))M.objs=d.objs;
  if(Array.isArray(d.dels))M.dels=d.dels;
  MAPS[id]=M;
  if(!MAP_ORDER.includes(id))MAP_ORDER.push(id);
  PORTAL_COL[id]=th.portal;
  if(typeof WM_POS!=='undefined'&&!WM_POS[id])WM_POS[id]=WM_SLOTS[Object.keys(CMAPS).length%WM_SLOTS.length];
  if(typeof WM_DESC!=='undefined'&&!WM_DESC[id])WM_DESC[id]='แมพที่ผู้สร้างจัดวางเอง';
  if(typeof WM_TYPE!=='undefined'&&!WM_TYPE[id])WM_TYPE[id]='Custom';
  // มอนสเตอร์ตามช่วงเลเวล (คำนวณเหมือนลูปหลักของเกม โซนว่างเท่านั้น)
  const [a,b]=M.lv.split('-').map(Number),zo=r=>{const o=r[4]||{};return o.lava?'lava':o.sky?'sky':''};
  M.lvr=[a,b];
  M.spawns=ROSTER.filter(r=>r[3]>=a&&r[3]<=b&&zo(r)===''&&!(r[4]||{}).boss).map(r=>[r[0],(r[4]||{}).elite?1:2,(r[4]||{}).elite?3:(r[4]||{}).big?4:0]);
  M.boss=ROSTER.filter(r=>r[3]>=a&&r[3]<=b&&zo(r)===''&&(r[4]||{}).boss).map(r=>r[0]);
  for(const k in MAP_CACHE)delete MAP_CACHE[k];   // ให้เมืองสร้างประตูวาร์ปไปยังแมพใหม่
  return true;
}
for(const [id,d] of Object.entries(CMAPS))applyCustomMap(id,d);

function saveCustomMap(id,d){for(const k in CMAPS)if(k.indexOf('ed_prev_')===0)delete CMAPS[k];CMAPS[id]=d;try{localStorage.setItem(CM_KEY,JSON.stringify(CMAPS))}catch(e){alert('เซฟไม่สำเร็จ (พื้นที่เครื่องเต็ม?)')}applyCustomMap(id,d)}

/* ---- แทรกวัตถุที่ผู้สร้างวาง ลงในแมพตอน build (v15) ----
   กติกา: วัตถุแต่ละชนิด ถ้ามีใน d.objs = ย้ายไปตำแหน่งที่วาง • ถ้าอยู่ใน d.dels = ลบทิ้ง • ไม่มี = ใช้ตำแหน่งอัตโนมัติเดิม */
(function(){
  const _bm=buildMap;
  buildMap=function(id){
    const r=_bm(id);
    let d=CMAPS[id];
    if(!d||(!Array.isArray(d.objs)||!d.objs.length)&&(!Array.isArray(d.dels)||!d.dels.length))return r;
    if(r._edObjs)return r;r._edObjs=1;
    const ter=r.ter,t=r.town,objs=d.objs||[],dels=d.dels||[];
    const has=k=>objs.some(o=>o&&o.k===k),del=k=>dels.includes(k);
    // คืนพื้น (เลิกบล็อก) รอบอาคารเดิม + ถอดอาคารอัตโนมัติที่ถูกย้าย/ลบ
    const floor=6,hwOf=k=>k==='quest'?.7:.8;
    const clearRect=(x,y,wArt,dy0)=>{const bx=Math.round(x/A),by=Math.round(y/A),hw=Math.max(1,Math.round(wArt/2));
      for(let yy=by-dy0;yy<=by;yy++)for(let xx=bx-hw;xx<=bx+hw;xx++)if(xx>=0&&yy>=0&&xx<GW&&yy<GH&&ter[yy*GW+xx]===8)ter[yy*GW+xx]=floor};
    const moved=k=>has(k)||del(k);
    r.props=r.props.filter(p=>{
      if(!ED_BUILDINGS.includes(p.k))return true;
      if(!moved(p.k))return true;
      if(p.k==='castle')clearRect(p.x,p.y,ART.castle.width*.62,14);
      else clearRect(p.x,p.y,ART[p.k].width*hwOf(p.k),5);
      return false;
    });
    // วางของใหม่ตามตำแหน่งที่ผู้สร้างจัด (อาคาร = วาง + บล็อกฐานเหมือนของเดิม)
    const blockRect=(x,y,wArt,dy0)=>{const bx=Math.round(x/A),by=Math.round(y/A),hw=Math.max(1,Math.round(wArt/2));
      for(let yy=by-dy0;yy<=by;yy++)for(let xx=bx-hw;xx<=bx+hw;xx++)if(xx>=0&&yy>=0&&xx<GW&&yy<GH&&ter[yy*GW+xx]!==4)ter[yy*GW+xx]=8};
    for(const o of objs){
      if(!o||!ED_OBJS[o.k])continue;
      const x=Math.max(30,Math.min(CELL*r.G.length-30,+o.x||t.cx)),y=Math.max(30,Math.min(CELL*r.G.length-30,+o.y||t.cy));
      if(ED_BUILDINGS.includes(o.k)){
        if(ART[o.k]){r.props.push({k:o.k,x,y});
          if(o.k==='castle')blockRect(x,y,ART.castle.width*.62,14);else blockRect(x,y,ART[o.k].width*hwOf(o.k),5)}
      }else if(o.k==='fire'){r.fires.push({x,y})}
      else if(o.k==='spawn'){t.slots.spawn={x,y};t.spawnY=y;t.spy=y-t.cy+60}
      else if(ED_OBJS[o.k].npc){
        if(del(o.k))t.slots.npc[ED_OBJS[o.k].npc]={x:-1e9,y:-1e9};   // ลบ NPC = ส่งไปไกลนอกแมพ
        else t.slots.npc[ED_OBJS[o.k].npc]={x,y};
      }
    }
    // กองไฟ: ถ้าผู้สร้างวางกองไฟเอง = แทนที่ของเดิมทั้งหมด / ถ้าลบ = ไม่มีกองไฟ
    if(has('fire'))r.fires=objs.filter(o=>o&&o.k==='fire').map(o=>({x:Math.max(30,+o.x||0),y:Math.max(30,+o.y||0)}));
    else if(del('fire'))r.fires=[];
    if(del('spawn')){delete t.slots.spawn;}   // ลบจุดเกิด = กลับไปใช้จุดเกิดเดิมไม่ได้ คง default
    // NPC ที่ถูกลบ: ปิดช่องให้ random ไม่ทำ — ส่งออกนอกแมพแล้วด้านบน
    for(const k of dels){if(ED_OBJS[k]&&ED_OBJS[k].npc&&!has(k))t.slots.npc[ED_OBJS[k].npc]={x:-1e9,y:-1e9}}
    if(typeof npMap!=='undefined')npMap='';   // บังคับ NPC เกิดใหม่ตามตำแหน่งที่จัด (แม้เข้าแมพเดิมซ้ำ)
    return r;
  };
})();


/* ============ ตัว Editor ============ */
let ED=null;
function edNewGrid(gn){
  const rows=[];for(let y=0;y<gn;y++){const r=[];for(let x=0;x<gn;x++)r.push((x===0||y===0||x===gn-1||y===gn-1)?'#':((x+y)%7===0?',':'.'));rows.push(r)}
  edStampTown(rows);return rows;
}
function edStampTown(g){   // เมือง 7x10 มุมล่างขวา + เคลียร์รอบเมืองให้ประตูเปิด
  const gn=g.length;
  for(let y=gn-13;y<gn;y++)for(let x=gn-11;x<gn;x++){if(y<0||x<0)continue;const v=g[y][x];if(v==='~'||v==='T'||v==='='||v==='#')g[y][x]=','}
  for(let y=gn-11;y<gn-1;y++)for(let x=gn-9;x<gn-2;x++)g[y][x]='H';
  return g;
}
function edOpen(id){
  let d=id&&CMAPS[id]?JSON.parse(JSON.stringify(CMAPS[id])):null;
  if(!d){const n=Object.keys(CMAPS).length+1;d={id:'c'+n+'_'+Date.now().toString(36).slice(-4),name:'แมพใหม่ '+n,ic:'🗺️',lv:'1-20',gn:32,theme:'forest',grid:null}}
  d.id=id||d.id||('c'+Date.now().toString(36));
  const [a,b]=(d.lv||'1-20').split('-');
  ED={id:d.id,name:d.name,ic:d.ic,lv1:+a||1,lv2:+b||20,gn:+d.gn||32,theme:d.theme||'forest',
    grid:d.grid?d.grid.map(r=>[...r]):edNewGrid(+d.gn||32),brush:'.',tool:'pen',undo:[],
    view:'game',                       // v15: เริ่มที่มุมมองเกม 2D
    objs:(d.objs||[]).map(o=>({k:o.k,x:+o.x||0,y:+o.y||0})),dels:[...(d.dels||[])],
    cam:{x:0,y:0,z:3},built:null,prevId:'ed_prev_'+Date.now().toString(36),npcA:{},_mx:-1,_my:-1};
  edRender();$('mapEd').style.display='flex';
  if(ED.view==='game'){edStartView();edTownView()}
}
function edCur(){const d={id:ED.id,name:ED.name.trim()||'แมพไม่มีชื่อ',ic:ED.ic||'🗺️',lv:ED.lv1+'-'+ED.lv2,gn:ED.gn,theme:ED.theme,grid:ED.grid.map(r=>r.join(''))};
  if(ED.objs.length)d.objs=ED.objs.map(o=>({k:o.k,x:Math.round(o.x),y:Math.round(o.y)}));
  if(ED.dels.length)d.dels=[...ED.dels];
  return d}
function edPushUndo(){ED.undo.push({g:ED.grid.map(r=>r.join('')),o:ED.objs.map(o=>({...o})),d:[...ED.dels]});if(ED.undo.length>30)ED.undo.shift()}
function edUndo(){if(!ED.undo.length)return;const s=ED.undo.pop();ED.grid=s.g.map(r=>[...r]);ED.objs=s.o.map(o=>({...o}));ED.dels=s.d;edDraw();edDirty()}
function edValid(){
  const d=edCur();
  if(!/^[a-z0-9_]{1,30}$/i.test(d.id))return 'ID แมพ ต้องเป็นตัวอังกฤษ/ตัวเลข (ใช้ _ ได้)';
  if(MAPS[d.id]&&!MAPS[d.id].custom)return 'ห้ามใช้ ID ทับแมพหลักของเกม';
  if(!(ED.lv1>=1&&ED.lv1<=200&&ED.lv2>=ED.lv1&&ED.lv2<=210))return 'ช่วงเลเวลไม่ถูกต้อง (1-210)';
  const H=ED.grid.flat().filter(c=>c==='H').length;
  if(H<30)return 'ยังไม่มีเมือง (ต้องมีพื้น H อย่างน้อย ~30 ช่อง) — กดปุ่ม "วางเมืองให้อัตโนมัติ"';
  return '';
}
/* ---- วาด UI ---- */
function edRender(){
  let w=$('mapEd');
  if(!w){
    w=document.createElement('div');w.id='mapEd';
    w.innerHTML=`<style>
#mapEd{position:fixed;inset:0;z-index:80;display:none;flex-direction:column;background:rgba(8,10,20,.92);font-size:13px;color:#f4ecd8;font-family:inherit}
#mapEd .eh{display:flex;align-items:center;gap:8px;padding:8px 12px;background:linear-gradient(#3a4a8a,#22295a);border-bottom:3px solid #0b0d18;flex-wrap:wrap}
#mapEd .eh b{font-size:17px;color:#fff;text-shadow:2px 2px 0 #000;margin-right:auto}
#mapEd .eh button,#mapEd .eb button{font:inherit;cursor:pointer;padding:5px 10px;font-weight:bold;color:#fff;background:linear-gradient(#4a5aa0,#2a3468);border:2px solid #0b0d18;box-shadow:inset 0 0 0 1px #6a7ab8}
#mapEd .eb{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;background:#141a30;border-bottom:2px solid #0b0d18;align-items:center}
#mapEd .eb input,#mapEd .eb select{font:inherit;padding:4px 6px;color:#fff;background:#0a0f22;border:2px solid #39406a;width:70px}
#mapEd .eb input.wide{width:140px}
#mapEd .vbar{display:flex;gap:6px;padding:6px 12px;background:#101628;border-bottom:2px solid #0b0d18;align-items:center;flex-wrap:wrap}
#mapEd .vbar button{font:inherit;cursor:pointer;padding:5px 12px;font-weight:bold;color:#fff;border:2px solid #0b0d18;background:linear-gradient(#4a5aa0,#2a3468)}
#mapEd .vbar button.on{background:linear-gradient(#c9a227,#8a6d0d);outline:2px solid #f2c94c}
#mapEd .tl{display:flex;flex-wrap:wrap;gap:5px;padding:6px 12px;background:#101628;border-bottom:2px solid #0b0d18}
#mapEd .tl button{cursor:pointer;padding:4px 8px;font:inherit;font-size:12px;border:2px solid #0b0d18;background:#1a2040;color:#e8e2d0}
#mapEd .tl button.on{outline:3px solid #f2c94c}
#mapEd .tl2{display:flex;flex-wrap:wrap;gap:5px;padding:6px 12px;background:#0e1426;border-bottom:2px solid #0b0d18}
#mapEd .tl2 button{cursor:pointer;padding:4px 8px;font:inherit;font-size:12px;border:2px solid #0b0d18;background:#20304a;color:#e8e2d0}
#mapEd .tl2 button.on{outline:3px solid #7ee08a}
#mapEd .cvw{flex:1;overflow:hidden;padding:0;display:flex;justify-content:center;align-items:center;position:relative}
#mapEd canvas{cursor:crosshair;background:#222;image-rendering:pixelated}
#mapEd #edCv2{width:100%;height:100%;display:block;cursor:grab;touch-action:none}
#mapEd .hint{padding:4px 12px;background:#0c1020;color:#9aa3c8;font-size:11px}</style>
<div class="eh"><b>🛠 Map Editor — จัดวางแมพเอง</b>
  <button id="edSave">💾 บันทึกใช้ในเกม</button><button id="edPlay">▶ ทดสอบเล่น</button>
  <button id="edExp">⬇ ส่งออก .json</button><button id="edImp">⬆ นำเข้า .json</button>
  <button id="edClose" style="background:linear-gradient(#8a3a2a,#5a2014)">✕ ปิด</button></div>
<div class="eb">
  ID <input id="edId" class="wide"> ชื่อ <input id="edName" class="wide"> ไอคอน <input id="edIc" style="width:44px">
  Lv <input id="edL1" style="width:52px">-<input id="edL2" style="width:52px">
  ขนาด <select id="edGn"><option>32</option><option>48</option></select>
  ธีม <select id="edTh">${Object.entries(ED_THEMES).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select>
  <button id="edTown">🏘 วางเมืองให้อัตโนมัติ</button><button id="edFill">🪣 ถังเทียมทั้งแมพ</button><button id="edUndo">↩ ย้อน</button>
  <button id="edDel" style="background:linear-gradient(#6a2a2a,#3a1414)">🗑 ลบแมพนี้</button></div>
<div class="vbar">
  <b style="color:#9aa3c8">มุมมอง:</b>
  <button id="edViewGame" class="on">🎮 เหมือนในเกม</button><button id="edViewGrid">⬛ กริด</button>
  <button id="edGridOn" class="on">แสดงกริด</button>
  <button id="edViewAll">🔍 ดูทั้งแมพ</button><button id="edViewTown">🎯 ไปเมือง</button>
  <span style="color:#9aa3c8;margin-left:auto" id="edZoomTxt">100%</span></div>
<div class="tl2" id="edObjs"></div>
<div class="tl" id="edTiles"></div>
<div class="cvw"><canvas id="edCv2"></canvas><canvas id="edCv" style="display:none"></canvas></div>
<div class="hint" id="edHint">🎮 มุมมองเกม: ลากเมาส์/นิ้ว = ใช้เครื่องมือที่เลือก • ลากด้วยปุ่มขวา/สองนิ้ว = เลื่อนกล้อง • ล้อเมาส์/บีบนิ้ว = ซูม • เลือก "วัตถุ" ด้านบนแล้วคลิก/ลากบนแมพเพื่อวาง NPC/ร้านค้า • ปุ่มลบวัตถุ = คลิกที่วัตถุเพื่อลบ</div>`;
    document.body.appendChild(w);
    $('edClose').onclick=()=>{edStopView();edCleanupPrev();$('mapEd').style.display='none'};
    $('edSave').onclick=()=>{const e=edValid();if(e)return alert(e);const d=edCur();edCleanupPrev();saveCustomMap(d.id,d);ED.id=d.id;alert('บันทึกแล้ว! เปิดหน้าต่างวาร์ป (T) เพื่อไปแมพนี้ หรือกด ▶ ทดสอบเล่น\n(ผู้เล่นอื่นบนเครื่องนี้เห็นแมพนี้ด้วย)')};
    $('edPlay').onclick=()=>{const e=edValid();if(e)return alert(e);if(!P)return alert('ต้องอยู่ในเกมก่อน (เข้าตัวละครแล้วเปิด editor จากเมนู ☰)');const d=edCur();edStopView();edCleanupPrev();saveCustomMap(d.id,d);if(typeof WM_POS!=='undefined')WM_POS[d.id]=WM_POS[d.id]||WM_SLOTS[0];enterMap(d.id);$('mapEd').style.display='none'};
    $('edExp').onclick=()=>{const d=edCur();const blob=new Blob([JSON.stringify(d,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meadowmap_'+d.id+'.json';a.click();URL.revokeObjectURL(a.href)};
    $('edImp').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.grid)throw 0;edStopView();edCleanupPrev();ED={id:d.id||('c'+Date.now().toString(36)),name:d.name||'นำเข้า',ic:d.ic,lv1:(d.lv||'1-20').split('-')[0],lv2:(d.lv||'1-20').split('-')[1],gn:d.gn||32,theme:ED_THEMES[d.theme]?d.theme:'forest',grid:d.grid.map(x=>[...x]),brush:'.',tool:'pen',undo:[],view:'game',objs:(d.objs||[]).map(o=>({k:o.k,x:+o.x||0,y:+o.y||0})),dels:[...(d.dels||[])],cam:{x:0,y:0,z:3},built:null,prevId:'ed_prev_'+Date.now().toString(36),npcA:{},_mx:-1,_my:-1};edRender();$('mapEd').style.display='flex';edStartView()}catch(e){alert('ไฟล์ไม่ใช่แมพที่ส่งออกจากเกมนี้')}};r.readAsText(f)};i.click()};
    $('edTown').onclick=()=>{edPushUndo();edStampTown(ED.grid);edDraw();edDirty()};
    $('edFill').onclick=()=>{edPushUndo();const b=ED.brush;for(let y=1;y<ED.gn-1;y++)for(let x=1;x<ED.gn-1;x++)ED.grid[y][x]=b;edDraw();edDirty()};
    $('edUndo').onclick=edUndo;
    $('edDel').onclick=()=>{if(!CMAPS[ED.id])return alert('แมพนี้ยังไม่ได้เซฟ');if(!confirm('ลบแมพ '+ED.name+' ถาวร?'))return;delete CMAPS[ED.id];try{localStorage.setItem(CM_KEY,JSON.stringify(CMAPS))}catch(e){}delete MAPS[ED.id];const i=MAP_ORDER.indexOf(ED.id);if(i>=0)MAP_ORDER.splice(i,1);for(const k in MAP_CACHE)delete MAP_CACHE[k];alert('ลบแล้ว (รีเฟรชหน้าเว็บให้สมบูรณ์)')};
    ['edId','edName','edIc','edL1','edL2','edGn','edTh'].forEach(i=>$(i).oninput=$(i).onchange=()=>edSyncForm());
    $('edViewGame').onclick=()=>{edSetView('game')};
    $('edViewGrid').onclick=()=>{edSetView('grid')};
    $('edGridOn').onclick=()=>{ED.gridOn=!ED.gridOn;$('edGridOn').classList.toggle('on',ED.gridOn)};
    $('edViewAll').onclick=()=>{if(ED.view==='game')edFitView()};
    $('edViewTown').onclick=()=>{if(ED.view==='game')edTownView()};
    // แถววัตถุ (v15)
    const ob=$('edObjs');
    const mkOb=(k,lab)=>{const b=document.createElement('button');b.innerHTML=lab;b.dataset.k=k;
      b.onclick=()=>{if(k==='pen'||k==='pan'||k==='erase'){ED.tool=k;ED.objK=null}else{ED.tool='obj';ED.objK=k}edRefreshToolUI()};ob.appendChild(b)};
    mkOb('pen','🖌 วาดพื้น');mkOb('pan','✋ เลื่อนกล้อง');mkOb('erase','🗑 ลบวัตถุ');
    ob.appendChild(document.createElement('span')).textContent='';
    for(const [k,v] of Object.entries(ED_OBJS))mkOb(k,v.label);
    // แถวพู่กันพื้น
    const tl=$('edTiles');tl.innerHTML='';
    for(const [ch,label] of Object.entries(TILES)){const b=document.createElement('button');b.innerHTML=`<span style="display:inline-block;width:12px;height:12px;background:${TILE_COL[ch]};border:1px solid #000;margin-right:5px;vertical-align:-1px"></span>${label}`;b.dataset.tile=ch;b.onclick=()=>{ED.brush=ch;ED.tool='pen';edRefreshToolUI()};if(ch==='.')b.classList.add('on');tl.appendChild(b)}
    // กริด: วาดบน canvas เดิม
    const cv=$('edCv');
    const paint=ev=>{if(!ev.buttons&&ev.type==='pointermove')return;const r=cv.getBoundingClientRect();const x=Math.floor((ev.clientX-r.left)/(r.width/ED.gn)),y=Math.floor((ev.clientY-r.top)/(r.height/ED.gn));if(x<0||y<0||x>=ED.gn||y>=ED.gn)return;ev.preventDefault();if(ED.grid[y][x]!==ED.brush){if(!ED._u){edPushUndo();ED._u=1}ED.grid[y][x]=ED.brush;edDraw();edDirty()}};
    cv.addEventListener('pointerdown',e=>{ED._u=0;cv.setPointerCapture(e.pointerId);paint(e)});
    cv.addEventListener('pointermove',paint);
    cv.addEventListener('pointerup',()=>ED._u=0);
    // เกม 2D: อินพุต
    edBindCanvas2();
  }
  $('edId').value=ED.id;$('edName').value=ED.name;$('edIc').value=ED.ic;$('edL1').value=ED.lv1;$('edL2').value=ED.lv2;$('edGn').value=ED.gn;$('edTh').value=ED.theme;
  ED.gridOn=true;
  edSetView(ED.view||'game');
  edRefreshToolUI();
  edDraw();
}
function edSetView(v){
  ED.view=v;
  $('edViewGame').classList.toggle('on',v==='game');$('edViewGrid').classList.toggle('on',v==='grid');
  $('edCv').style.display=v==='grid'?'block':'none';$('edCv2').style.display=v==='game'?'block':'none';
  if(v==='grid'){edStopView();edDraw()}else edStartView();
}
function edRefreshToolUI(){
  [...$('edTiles').children].forEach(b=>b.classList.toggle('on',ED.tool==='pen'&&ED.brush===b.dataset.tile));
  [...$('edObjs').children].forEach(b=>{if(!b.dataset.k)return;b.classList.toggle('on',ED.tool==='obj'&&ED.objK===b.dataset.k||((ED.tool==='pen'||ED.tool==='pan'||ED.tool==='erase')&&b.dataset.k===ED.tool))});
  const h=$('edHint');
  if(h){
    if(ED.tool==='obj'&&ED.objK&&ED_OBJS[ED.objK])h.textContent='วาง '+ED_OBJS[ED.objK].label.replace(/^\S+\s/,'')+': คลิก/ลากบนแมพเพื่อจัดตำแหน่ง • คลิกซ้ำที่อื่น = ย้าย • ของชนิดเดิมที่เคยลบจะกลับมา';
    else if(ED.tool==='erase')h.textContent='ลบวัตถุ: คลิกที่วงแหวน (หรือคลิกขวา) เพื่อลบ NPC/ร้านค้า/กองไฟ • วางใหม่ได้ด้วยปุ่มชนิดนั้นๆ';
    else if(ED.tool==='pan')h.textContent='เลื่อนกล้อง: ลากเมาส์/นิ้ว • ล้อเมาส์/บีบนิ้ว = ซูม';
    else h.textContent='วาดพื้น: ลากเมาส์/นิ้วบนแมพ (ภาพจะปรับตามที่วาดภายใน ~0.3 วิ) • ปุ่มขวา/สองนิ้ว = เลื่อนกล้อง • ล้อเมาส์ = ซูม';
  }
}
function edSyncForm(){
  ED.id=($('edId').value||'c').toLowerCase().replace(/[^a-z0-9_]/g,'');ED.name=$('edName').value;ED.ic=$('edIc').value||'🗺️';
  ED.lv1=clamp(+$('edL1').value||1,1,210);ED.lv2=clamp(+$('edL2').value||20,ED.lv1,210);
  const g=+$('edGn').value,th=$('edTh').value;
  let chg=false;
  if(g!==ED.gn){ED.gn=g;ED.grid=edNewGrid(g);chg=true}   // ขยาย/ย่อ = เริ่มกริดใหม่ (มีเมืองอัตโนมัติ)
  const t2=ED_THEMES[th]?th:'forest';
  if(t2!==ED.theme){ED.theme=t2;chg=true}
  if(chg){ED._fit=0;edDirty()}
}
function edDraw(){
  if(!ED||ED.view!=='grid')return;
  const cv=$('edCv');if(!cv)return;const gn=ED.gn,cs=18;cv.width=gn*cs;cv.height=gn*cs;
  const g=cv.getContext('2d');
  for(let y=0;y<gn;y++)for(let x=0;x<gn;x++){const ch=ED.grid[y]&&ED.grid[y][x]||'.';g.fillStyle=TILE_COL[ch]||'#333';g.fillRect(x*cs,y*cs,cs,cs);
    if(ch==='H'){g.fillStyle='#8a84a0';g.fillRect(x*cs,y*cs,cs,2)}}
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;
  for(let i=0;i<=gn;i++){g.beginPath();g.moveTo(i*cs,0);g.lineTo(i*cs,gn*cs);g.stroke();g.beginPath();g.moveTo(0,i*cs);g.lineTo(gn*cs,i*cs);g.stroke()}
  // กรอบเมือง
  g.strokeStyle='#f2c94c';g.lineWidth=2;g.strokeRect((gn-9)*cs,(gn-11)*cs,7*cs,10*cs);
}

/* ============ มุมมอง "เหมือนในเกม" (2D) — v15 ============ */
function edCleanupPrev(){
  if(!ED)return;const pid=ED.prevId;
  if(!pid)return;
  delete CMAPS[pid];
  if(MAPS[pid]&&MAPS[pid].custom&&/^ed_prev_/.test(pid)){delete MAPS[pid];const i=MAP_ORDER.indexOf(pid);if(i>=0)MAP_ORDER.splice(i,1)}
  try{delete WM_POS[pid];delete WM_DESC[pid];delete WM_TYPE[pid]}catch(e){}
  delete MAP_CACHE[pid];for(const k in MAP_CACHE)delete MAP_CACHE[k];
}
/* สร้างภาพแมพจริงด้วย buildMap ของเกม (เบราว์เซอร์วางพื้น/ต้นไม้/เมืองเหมือนตอนเล่น) */
function edRebuild(){
  if(!ED)return;
  const d=edCur(),pid=ED.prevId;
  CMAPS[pid]=d;                    // ใช้เฉพาะ preview ไม่เซฟ localStorage
  applyCustomMap(pid,d);
  delete MAP_CACHE[pid];
  const sw=WORLD.w,sh=WORLD.h,sgw=GW,sgh=GH,snw=NW,snh=NH;
  try{ED.built=buildMap(pid)}catch(e){console.warn('[editor] build error',e);ED.built=null}
  WORLD.w=sw;WORLD.h=sh;GW=sgw;GH=sgh;NW=snw;NH=snh;   // คืนค่าโลกของเกมหลัง (กันกระทบเกมที่เปิดอยู่เบื้องหลัง)
}
function edDirty(){if(ED)ED._rbAt=performance.now()+260}
function edZoomTxt(){const e=$('edZoomTxt');if(e&&ED)e.textContent='ซูม ×'+ED.cam.z.toFixed(2)}
/* จุดกึ่งกลางเมืองจากกริด (ช่อง H) */
function edTownCenter(){
  let sx=0,sy=0,n=0;
  for(let y=0;y<ED.gn;y++)for(let x=0;x<ED.gn;x++)if(ED.grid[y][x]==='H'){sx+=x;sy+=y;n++}
  if(!n)return{x:ED.gn/2,y:ED.gn/2};
  return{x:sx/n,y:sy/n};
}
function edFitView(){        // ดูทั้งแมพ
  const cv=$('edCv2');if(!cv)return;
  const r=cv.getBoundingClientRect();if(!r.width)return;
  ED.cam.z=clamp(Math.min(r.width,r.height)/(ED.gn*CP)*.96,.3,16);
  ED.cam.x=ED.gn*CP/2;ED.cam.y=ED.gn*CP/2;
  edZoomTxt();
}
function edTownView(){       // ซูมใกล้เมืองเหมือนตอนเล่น
  const cv=$('edCv2');if(!cv)return;
  const c=edTownCenter();
  ED.cam.z=2.2;ED.cam.x=c.x*CP;ED.cam.y=c.y*CP;
  edClampCam();edZoomTxt();
}
function edStartView(){
  if(!ED)return;
  ED._dirtyCells=ED._dirtyCells||{};ED._pts=ED._pts||new Map();
  if(!ED.built||!ED._fit){edRebuild();ED._fit=1;edTownView()}
  if(!ED.raf){ED._lt=0;ED.raf=requestAnimationFrame(edFrame)}
}
function edStopView(){if(ED&&ED.raf){cancelAnimationFrame(ED.raf);ED.raf=0}}
function edW2S(x,y){return{x:(x/A-ED.cam.x)*ED.cam.z+ED._vw/2,y:(y/A-ED.cam.y)*ED.cam.z+ED._vh/2}}
function edS2W(px,py){return{x:((px-ED._vw/2)/ED.cam.z+ED.cam.x)*A,y:((py-ED._vh/2)/ED.cam.z+ED.cam.y)*A}}
function edClampCam(){
  const m=ED.gn*CP;
  ED.cam.x=clamp(ED.cam.x,-40,m+40);ED.cam.y=clamp(ED.cam.y,-40,m+40);
}
function edFrame(now){
  if(!ED||!$('mapEd')||$('mapEd').style.display==='none'||ED.view!=='game'){if(ED)ED.raf=0;return}
  const dt=Math.min(.1,(now-(ED._lt||now))/1000);ED._lt=now;
  if(ED._rbAt&&now>ED._rbAt){ED._rbAt=0;ED._dirtyCells={};edRebuild()}
  for(const k in ED.npcA){const a=ED.npcA[k];if(a)a.t+=dt}
  edDrawGame();
  ED.raf=requestAnimationFrame(edFrame);
}
/* ชีต NPC สำหรับพรีวิว (ยืมสไปรต์/การแต่งตัวของเกมจริง) */
function edNpcActor(npcId){
  if(ED.npcA[npcId]!==undefined)return ED.npcA[npcId];
  let a=null;
  const d=(typeof NPCS!=='undefined'?NPCS:[]).find(n=>n.id===npcId);
  if(d){const C=CLASSES[d.cls];let sh=d.img?null:(typeof styledSheet==='function'?styledSheet(d.cls,d.sty):null);
    if(!sh&&C&&SHEETS[C.sprite])sh=SHEETS[C.sprite];
    if(sh)a={sh,anim:'idle',t:Math.random()*2,once:false,dur:1,ts:1,busy:0,ang:Math.PI/2,px:1}}
  ED.npcA[npcId]=a;return a
}
const ED_LABELS={shop:'ร้านค้า',quest:'📜 ป้ายเควสต์',smith:'⚒ ช่างตีเหล็ก'};
function edText(g,t,x,y,col,size){
  g.font='bold '+(size||12)+'px sans-serif';g.textAlign='center';
  g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.75)';g.strokeText(t,x,y);
  g.fillStyle=col;g.fillText(t,x,y);g.textAlign='left';
}
function edDrawSprite(g,im,X,Y,z,alpha){
  if(!im)return;
  const w=im.width*z,h=im.height*z;
  if(im._k){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,0,0,im._bw,im._bh,X-w/2,Y-h+3*z,w,h);g.imageSmoothingEnabled=false}
  else g.drawImage(im,X-w/2,Y-h+3*z,w,h);
}
function edDrawActorS(g,a,X,Y,z){
  const S=a.sh;if(!S)return;
  const fr=actorFrame(a),sx0=(fr%S.cols)*S.cw,sy0=Math.floor(fr/S.cols)*S.ch,k=(a.px||1)*(S.scale||1);
  const w=S.cw*k*z,h=S.ch*k*z;
  if(S.scale){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high'}
  g.drawImage(S.im,sx0,sy0,S.cw,S.ch,X-S.cx*w,Y-S.foot*h,w,h);
  g.imageSmoothingEnabled=false;
}
function edDrawPortalS(g,X,Y,to,z){
  const col=PORTAL_COL[to]||['#89a8cc','#ffffff'],t=performance.now()/1000;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(X,Y,15*z,5*z,0,0,7);g.fill();
  g.fillStyle='#3a3442';g.fillRect(X-14*z,Y-34*z,3*z,34*z);g.fillRect(X+11*z,Y-34*z,3*z,34*z);
  g.fillStyle='#4a4458';g.fillRect(X-15*z,Y-37*z,30*z,4*z);g.fillStyle='#8a84a0';g.fillRect(X-13*z,Y-36*z,26*z,1*z);
  for(let i=0;i<14;i++){const a2=t*3+i/14*Math.PI*2,r=7+Math.sin(t*4+i)*1.5;
    g.fillStyle=i%2?col[0]:col[1];g.fillRect(X+Math.cos(a2)*r*.8*z-1*z,Y-17*z+Math.sin(a2)*r*z-1*z,2*z,2*z)}
  g.globalAlpha=.4;g.fillStyle=col[0];g.beginPath();g.ellipse(X,Y-17*z,7*z,11*z,0,0,7);g.fill();g.globalAlpha=1;
  const M=MAPS[to];if(M)edText(g,M.ic+' '+M.name,X,Y-44*z,col[1],12);
}
function edDrawFireS(g,X,Y,z){
  const t=performance.now()/1000,k=Math.floor(t*10)%3,H=[9,11,10][k];
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(X,Y+1*z,7*z,2*z,0,0,7);g.fill();
  g.fillStyle='#3a2614';g.fillRect(X-6*z,Y-1*z,12*z,2*z);
  for(let i=0;i<H;i++){const w=Math.max(1,Math.round(4*(1-i/H)));g.fillStyle=i<H*.45?'#ff8a2a':'#ffb347';g.fillRect(X-w*z,Y-(2+i)*z,w*2*z,Math.max(1,1.2*z))}
}
function edRing(g,X,Y,col,z){
  g.strokeStyle=col;g.lineWidth=2;g.beginPath();g.ellipse(X,Y,12*z,4.5*z,0,0,7);g.stroke();
}
/* รายการ "วัตถุที่มีผลจริง" ในแมพ (auto + ที่ผู้สร้างวาง) — ใช้ทั้งวาด marker และ hit-test */
function edEffObjs(){
  const b=ED.built;if(!b)return[];
  const out=[],o1=k=>ED.objs.find(o=>o.k===k);
  for(const p of b.props)if(ED_BUILDINGS.includes(p.k))out.push({k:p.k,x:p.x,y:p.y,own:!!o1(p.k)});
  if(!(ED.dels.includes('fire')&&!b.fires.length))for(const f of b.fires)out.push({k:'fire',x:f.x,y:f.y,own:!!ED.objs.find(o=>o.k==='fire'&&Math.hypot(o.x-f.x,o.y-f.y)<10)});
  if(b.town&&b.town.slots){
    for(const [id,pos] of Object.entries(b.town.slots.npc||{}))if(pos&&pos.x>-1e5)out.push({k:'n_'+id,x:pos.x,y:pos.y,own:!!o1('n_'+id)});
    if(b.town.slots.spawn)out.push({k:'spawn',x:b.town.slots.spawn.x,y:b.town.slots.spawn.y,own:!!o1('spawn')});
  }
  return out;
}
function edDrawGame(){
  const cv=$('edCv2');if(!cv||!ED)return;
  const dpr=window.devicePixelRatio||1,w=cv.clientWidth||600,h=cv.clientHeight||400;
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  ED._vw=w;ED._vh=h;
  const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const z=ED.cam.z,b=ED.built,gn=ED.gn,mpx=gn*CP;
  g.fillStyle='#0a0c14';g.fillRect(0,0,w,h);
  if(!b){edText(g,'กำลังสร้างแมพ...',w/2,h/2,'#9aa3c8',14);return}
  // พื้น (ภาพเดียวกับที่เกมใช้ตอนเล่น)
  g.imageSmoothingEnabled=false;
  const gx=(0-ED.cam.x)*z+w/2,gy=(0-ED.cam.y)*z+h/2;
  g.drawImage(b.ground,gx,gy,mpx*z,mpx*z);
  // พื้นที่ที่เพิ่งวาด (ก่อน rebuild): ทับสีพู่กันโปร่งๆ
  for(const key in ED._dirtyCells||{}){const i=+key,t2=ED._dirtyCells[key],cx=i%128,cy=i/128|0;
    g.fillStyle=TILE_COL[t2]||'#333';g.globalAlpha=.55;
    g.fillRect(gx+cx*CP*z,gy+cy*CP*z,CP*z+1,CP*z+1);g.globalAlpha=1}
  // กริด (เปิด/ปิดได้)
  if(ED.gridOn&&z>.8){g.strokeStyle='rgba(0,0,0,.16)';g.lineWidth=1;g.beginPath();
    for(let i=0;i<=gn;i++){g.moveTo(Math.round(gx+i*CP*z)+.5,gy);g.lineTo(Math.round(gx+i*CP*z)+.5,gy+mpx*z);g.moveTo(gx,Math.round(gy+i*CP*z)+.5);g.lineTo(gx+mpx*z,Math.round(gy+i*CP*z)+.5)}
    g.stroke()}
  // ชั้นวัตถุเรียงตาม y (เหมือนในเกม)
  const items=[];
  for(const p of b.props)items.push({y:p.y,f:()=>{
    const P2=edW2S(p.x,p.y);
    if(p.k==='portal'){edDrawPortalS(g,P2.x,P2.y,p.to,z);return}
    edDrawSprite(g,ART[p.k],P2.x,P2.y,z);
    if(ED_LABELS[p.k]&&z>.6)edText(g,ED_LABELS[p.k],P2.x,P2.y-ART[p.k].height*z-8,'#f2c94c',12);
  }});
  for(const f of b.fires)items.push({y:f.y,f:()=>{const P2=edW2S(f.x,f.y);edDrawFireS(g,P2.x,P2.y,z)}});
  if(b.town&&b.town.slots)for(const [id,pos] of Object.entries(b.town.slots.npc||{})){
    if(!pos||pos.x<-1e5)continue;
    const a=edNpcActor(id);if(!a)continue;
    items.push({y:pos.y,f:()=>{
      const P2=edW2S(pos.x,pos.y),S=a.sh,k=(a.px||1)*(S.scale||1);
      g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(P2.x,P2.y,9*z,2.6*z,0,0,7);g.fill();
      edDrawActorS(g,a,P2.x,P2.y,z);
      if(z>.6){const d=(typeof NPCS!=='undefined'?NPCS:[]).find(n=>n.id===id);if(d)edText(g,d.n,P2.x,P2.y-S.ch*k*z-6,'#ffe9b0',11)}
    }});
  }
  items.sort((a2,b2)=>a2.y-b2.y);for(const it of items)it.f();
  // marker วัตถุ เมื่อใช้เครื่องมือวัตถุ/ลบ
  if(ED.tool==='obj'||ED.tool==='erase'){
    const eff=edEffObjs();
    const hitW=ED.tool==='erase'?edHitObj(ED._mx,ED._my):null;
    for(const o of eff){
      if(o.x<-1e5)continue;
      const P2=edW2S(o.x,o.y);
      edRing(g,P2.x,P2.y,o.own?'#f2c94c':'rgba(200,205,230,.55)',z);
      if(hitW&&hitW.k===o.k&&Math.hypot(hitW.x-o.x,hitW.y-o.y)<10)edRing(g,P2.x,P2.y,'#ff5a52',z*1.4);
    }
  }
  // ghost ตามเคอร์เซอร์
  if(ED._mx>=0&&ED._my>=0){
    if(ED.tool==='pen'){
      const cx=Math.floor(ED._mx/CELL),cy=Math.floor(ED._my/CELL);
      if(cx>=0&&cy>=0&&cx<gn&&cy<gn){g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(gx+cx*CP*z,gy+cy*CP*z,CP*z,CP*z)}
    }else if(ED.tool==='obj'&&ED.objK){
      const P2=edW2S(ED._mx,ED._my),k=ED.objK,v=ED_OBJS[k];
      g.globalAlpha=.75;
      if(v.npc){const a=edNpcActor(v.npc);if(a)edDrawActorS(g,a,P2.x,P2.y,z)}
      else if(ED_BUILDINGS.includes(k))edDrawSprite(g,ART[k],P2.x,P2.y,z);
      else if(k==='fire')edDrawFireS(g,P2.x,P2.y,z);
      else if(k==='spawn')edText(g,'🚩',P2.x,P2.y-6*z,'#fff',16);
      g.globalAlpha=1;edRing(g,P2.x,P2.y,'#7ee08a',z);
    }
    // ลากวัตถุอยู่: วงแหวนตาม
    if(ED._drag){const P2=edW2S(ED._drag.x,ED._drag.y);edRing(g,P2.x,P2.y,'#7ee08a',z*1.4)}
  }
}
/* ---- อินพุตบน canvas มุมมองเกม ---- */
function edHitObj(wx,wy){
  if(!ED.built)return null;
  let best=null,bd=95;
  for(const o of edEffObjs()){const d=Math.hypot(wx-o.x,wy-o.y);if(d<bd&&o.x>-1e5){bd=d;best=o}}
  return best;
}
function edErase(hit){
  if(!hit)return;
  const k=hit.k;
  if(k==='fire'){
    let j=-1,bd=90;ED.objs.forEach((e,i2)=>{if(e.k==='fire'){const d=Math.hypot(e.x-hit.x,e.y-hit.y);if(d<bd){bd=d;j=i2}}});
    if(j>=0){edPushUndo();ED.objs.splice(j,1);edDirty();return}
  }
  edPushUndo();
  const j=ED.objs.findIndex(o=>o.k===k);
  if(j>=0)ED.objs.splice(j,1);
  if(!ED.dels.includes(k))ED.dels.push(k);
  edDirty();
}
function edObjDown(wx,wy){
  const k=ED.objK;if(!k||!ED_OBJS[k])return;
  edPushUndo();
  ED.dels=ED.dels.filter(d=>d!==k);   // วางอีกครั้ง = คืนชนิดนี้
  let o=null;
  if(ED_OBJS[k].multi){
    let j=-1,bd=80;ED.objs.forEach((e,i2)=>{if(e.k===k){const d=Math.hypot(e.x-wx,e.y-wy);if(d<bd){bd=d;j=i2}}});
    if(j>=0)o=ED.objs[j];else{o={k,x:wx,y:wy};ED.objs.push(o)}
  }else{
    o=ED.objs.find(e=>e.k===k);
    if(!o){o={k,x:wx,y:wy};ED.objs.push(o)}
  }
  o.x=clamp(wx,30,ED.gn*CELL-30);o.y=clamp(wy,30,ED.gn*CELL-30);
  ED._drag=o;edDirty();
}
function edPaintAt(wx,wy){
  const cx=Math.floor(wx/CELL),cy=Math.floor(wy/CELL);
  if(cx<0||cy<0||cx>=ED.gn||cy>=ED.gn)return;
  if(ED.grid[cy][cx]!==ED.brush){
    if(!ED._u){edPushUndo();ED._u=1}
    ED.grid[cy][cx]=ED.brush;
    (ED._dirtyCells=ED._dirtyCells||{})[cy*128+cx]=ED.brush;
    edDirty();
  }
}
function edBindCanvas2(){
  const cv=$('edCv2');
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('wheel',e=>{
    if(!ED||ED.view!=='game')return;e.preventDefault();
    const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
    const w0=edS2W(px,py),f=Math.pow(1.0016,-e.deltaY);
    ED.cam.z=clamp(ED.cam.z*f,.3,16);
    const w1=edS2W(px,py);
    ED.cam.x+=(w0.x-w1.x)/A;ED.cam.y+=(w0.y-w1.y)/A;edClampCam();edZoomTxt();
  },{passive:false});
  const wpos=e=>{const r=cv.getBoundingClientRect();return edS2W(e.clientX-r.left,e.clientY-r.top)};
  cv.addEventListener('pointerdown',e=>{
    if(!ED||ED.view!=='game')return;e.preventDefault();
    cv.setPointerCapture(e.pointerId);
    ED._pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ED._pts.size>=2){ED._drag=null;ED._pan=null;ED._pinch=edPinchInfo();return}
    const w=wpos(e);
    if(e.button===2||e.button===1){ED._pan={x:e.clientX,y:e.clientY,rmb:e.button===2,moved:0,wx:w.x,wy:w.y};return}
    if(ED.tool==='pan'){ED._pan={x:e.clientX,y:e.clientY,moved:0};return}
    if(ED.tool==='pen'){ED._u=0;edPaintAt(w.x,w.y);return}
    if(ED.tool==='erase'){edErase(edHitObj(w.x,w.y));return}
    if(ED.tool==='obj'){ED._u=0;edObjDown(w.x,w.y);return}
  });
  cv.addEventListener('pointermove',e=>{
    if(!ED||ED.view!=='game')return;
    if(ED._pts.has(e.pointerId))ED._pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const w=wpos(e);ED._mx=w.x;ED._my=w.y;
    if(ED._pinch&&ED._pts.size>=2){edPinchMove();return}
    if(ED._pan){
      const dx=(e.clientX-ED._pan.x)/ED.cam.z,dy=(e.clientY-ED._pan.y)/ED.cam.z;
      ED.cam.x-=dx;ED.cam.y-=dy;ED._pan.moved+=Math.abs(dx)+Math.abs(dy);edClampCam();
      ED._pan.x=e.clientX;ED._pan.y=e.clientY;cv.style.cursor='grabbing';
      return;
    }
    if(ED._drag){
      ED._drag.x=clamp(w.x,30,ED.gn*CELL-30);ED._drag.y=clamp(w.y,30,ED.gn*CELL-30);
      return;
    }
    if(ED.tool==='pen'&&(e.buttons&1))edPaintAt(w.x,w.y);
  });
  const up=e=>{
    if(!ED)return;
    ED._pts.delete(e.pointerId);
    if(ED._pts.size<2)ED._pinch=null;
    if(ED._pan){
      if(ED._pan.rmb&&ED._pan.moved<3){const w=wpos(e);edErase(edHitObj(w.x,w.y))}
      ED._pan=null;cv.style.cursor='grab';
    }
    if(ED._drag){ED._drag=null;edDirty()}
  };
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
}
function edPinchInfo(){
  const ps=[...ED._pts.values()];if(ps.length<2)return null;
  return{d:Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y),cx:(ps[0].x+ps[1].x)/2,cy:(ps[0].y+ps[1].y)/2};
}
function edPinchMove(){
  const r=$('edCv2').getBoundingClientRect(),info=edPinchInfo();if(!info||!ED._pinch)return;
  const cv=$('edCv2');
  const px=ED._pinch.cx-r.left,py=ED._pinch.cy-r.top;
  const w0=edS2W(px,py);
  ED.cam.z=clamp(ED.cam.z*info.d/Math.max(20,ED._pinch.d),.3,16);
  const w1=edS2W(px,py);
  ED.cam.x+=(w0.x-w1.x)/A;ED.cam.y+=(w0.y-w1.y)/A;
  // เลื่อนตามนิ้วกลาง
  const dcx=info.cx-ED._pinch.cx,dcy=info.cy-ED._pinch.cy;
  ED.cam.x-=dcx/ED.cam.z;ED.cam.y-=dcy/ED.cam.z;
  ED._pinch=info;edClampCam();edZoomTxt();
}

/* ---- ปุ่มเข้า editor ---- */
(function(){
  // หน้าเริ่มเกม
  const add=()=>{const s=$('start');if(!s||$('bEdStart'))return;const b=document.createElement('button');b.id='bEdStart';b.className='btn';b.textContent='🛠 จัดวางแมพ (ผู้สร้าง)';b.style.cssText='font-size:13px;padding:6px 12px;opacity:.75';
    b.onclick=()=>{if(!askCreator())return;edOpen(null)};s.insertBefore(b,s.children[2]||null)};
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',add,{once:true});else add();
  // ในเกม: เมนู ☰ → ระบบ
  const addMenu=()=>{const mb=document.querySelectorAll('#menuPanel .mg')[3];if(!mb||$('bEd'))return;const row=mb.querySelector('.mb');const b=document.createElement('button');b.className='btn';b.id='bEd';b.innerHTML='<i>🛠</i><span>จัดวางแมพ</span><em>&nbsp;</em>';
    b.onclick=()=>{if(!askCreator())return;$('menuPanel').parentNode.classList.remove('open');edOpen(null)};row.appendChild(b)};
  const t=setInterval(()=>{if(document.getElementById('menuPanel')){addMenu();clearInterval(t)}},800);setTimeout(()=>clearInterval(t),15000);
  // แก้ไขแมพที่เซฟไว้: พิมพ์ E ใน editor เพื่อเลือก, หรือเปิดจากลิงก์นี้
  window.edList=()=>{const ids=Object.keys(CMAPS);if(!ids.length)return alert('ยังไม่มีแมพที่เซฟ (เริ่มวาดแมพใหม่แล้วกด 💾)');const i=prompt('แมพที่เซฟไว้:\n'+ids.map((k,n)=>(n+1)+'. '+CMAPS[k].name).join('\n')+'\n\nพิมพ์เลขที่ต้องการแก้ (ยกเลิก = วาดใหม่):');if(i===null)return null;const n=+i;if(n>=1&&n<=ids.length)return ids[n-1];return null};
})();
/* เปิด editor: ถ้ามีแมพเซฟไว้ ถามก่อนว่าจะแก้ตัวเดิมหรือวาดใหม่ */
const _edOpen=edOpen;
edOpen=function(id){if(id===null||id===undefined){const pick=window.edList?edList():null;if(pick)return _edOpen(pick)}return _edOpen(id)};
