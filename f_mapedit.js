/* ============ f_mapedit.js — โหมดผู้สร้าง: จัดวางแมพเอง ============
   ผู้สร้างเกมวาดแมพบนกริดได้เอง ตั้งชื่อ/ไอคอน/ช่วงเลเวล/ธีมสี
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

function saveCustomMap(id,d){CMAPS[id]=d;try{localStorage.setItem(CM_KEY,JSON.stringify(CMAPS))}catch(e){alert('เซฟไม่สำเร็จ (พื้นที่เครื่องเต็ม?)')}applyCustomMap(id,d)}

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
    grid:d.grid?d.grid.map(r=>[...r]):edNewGrid(+d.gn||32),brush:'.',tool:'pen',undo:[]};
  edRender();$('mapEd').style.display='flex';
}
function edCur(){return {id:ED.id,name:ED.name.trim()||'แมพไม่มีชื่อ',ic:ED.ic||'🗺️',lv:ED.lv1+'-'+ED.lv2,gn:ED.gn,theme:ED.theme,grid:ED.grid.map(r=>r.join(''))}}
function edPushUndo(){ED.undo.push(ED.grid.map(r=>r.join('')));if(ED.undo.length>30)ED.undo.shift()}
function edUndo(){if(!ED.undo.length)return;ED.grid=ED.undo.pop().map(r=>[...r]);edDraw()}
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
#mapEd .eh{display:flex;align-items:center;gap:8px;padding:8px 12px;background:linear-gradient(#3a4a8a,#22295a);border-bottom:3px solid #0b0d18}
#mapEd .eh b{font-size:17px;color:#fff;text-shadow:2px 2px 0 #000;margin-right:auto}
#mapEd .eh button,#mapEd .eb button{font:inherit;cursor:pointer;padding:5px 10px;font-weight:bold;color:#fff;background:linear-gradient(#4a5aa0,#2a3468);border:2px solid #0b0d18;box-shadow:inset 0 0 0 1px #6a7ab8}
#mapEd .eb{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px;background:#141a30;border-bottom:2px solid #0b0d18;align-items:center}
#mapEd .eb input,#mapEd .eb select{font:inherit;padding:4px 6px;color:#fff;background:#0a0f22;border:2px solid #39406a;width:70px}
#mapEd .eb input.wide{width:140px}
#mapEd .tl{display:flex;flex-wrap:wrap;gap:5px;padding:6px 12px;background:#101628;border-bottom:2px solid #0b0d18}
#mapEd .tl button{cursor:pointer;padding:4px 8px;font:inherit;font-size:12px;border:2px solid #0b0d18;background:#1a2040;color:#e8e2d0}
#mapEd .tl button.on{outline:3px solid #f2c94c}
#mapEd .cvw{flex:1;overflow:auto;padding:10px;display:flex;justify-content:center;align-items:flex-start}
#mapEd canvas{cursor:crosshair;border:3px solid #0b0d18;box-shadow:0 0 0 2px #39406a;background:#222;image-rendering:pixelated;max-width:100%}
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
<div class="tl" id="edTiles"></div>
<div class="cvw"><canvas id="edCv"></canvas></div>
<div class="hint" id="edHint">ลากเมาส์/นิ้วบนกริดเพื่อวาด • ป่าทึบ/น้ำ/หน้าผา = เดินไม่ได้ • สะพาน (=) วางบนขอบน้ำแล้วระบบจะต่อข้ามฝั่งให้เอง • เมือง (H) ต้องมีก้อนใหญ่อย่างน้อย 7x10</div>`;
    document.body.appendChild(w);
    $('edClose').onclick=()=>{$('mapEd').style.display='none'};
    $('edSave').onclick=()=>{const e=edValid();if(e)return alert(e);const d=edCur();saveCustomMap(d.id,d);ED.id=d.id;alert('บันทึกแล้ว! เปิดหน้าต่างวาร์ป (T) เพื่อไปแมพนี้ หรือกด ▶ ทดสอบเล่น\n(ผู้เล่นอื่นบนเครื่องนี้เห็นแมพนี้ด้วย)')};
    $('edPlay').onclick=()=>{const e=edValid();if(e)return alert(e);if(!P)return alert('ต้องอยู่ในเกมก่อน (เข้าตัวละครแล้วเปิด editor จากเมนู ☰)');const d=edCur();applyCustomMap(d.id,d);if(typeof WM_POS!=='undefined')WM_POS[d.id]=WM_POS[d.id]||WM_SLOTS[0];enterMap(d.id);$('mapEd').style.display='none'};
    $('edExp').onclick=()=>{const d=edCur();const blob=new Blob([JSON.stringify(d,null,1)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='meadowmap_'+d.id+'.json';a.click();URL.revokeObjectURL(a.href)};
    $('edImp').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=()=>{const f=i.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.grid)throw 0;ED={id:d.id||('c'+Date.now().toString(36)),name:d.name||'นำเข้า',ic:d.ic,lv1:(d.lv||'1-20').split('-')[0],lv2:(d.lv||'1-20').split('-')[1],gn:d.gn||32,theme:ED_THEMES[d.theme]?d.theme:'forest',grid:d.grid.map(x=>[...x]),brush:'.',tool:'pen',undo:[]};edRender();$('mapEd').style.display='flex'}catch(e){alert('ไฟล์ไม่ใช่แมพที่ส่งออกจากเกมนี้')}};r.readAsText(f)};i.click()};
    $('edTown').onclick=()=>{edPushUndo();edStampTown(ED.grid);edDraw()};
    $('edFill').onclick=()=>{edPushUndo();const b=ED.brush;for(let y=1;y<ED.gn-1;y++)for(let x=1;x<ED.gn-1;x++)ED.grid[y][x]=b;edDraw()};
    $('edUndo').onclick=edUndo;
    $('edDel').onclick=()=>{if(!CMAPS[ED.id])return alert('แมพนี้ยังไม่ได้เซฟ');if(!confirm('ลบแมพ '+ED.name+' ถาวร?'))return;delete CMAPS[ED.id];try{localStorage.setItem(CM_KEY,JSON.stringify(CMAPS))}catch(e){}delete MAPS[ED.id];const i=MAP_ORDER.indexOf(ED.id);if(i>=0)MAP_ORDER.splice(i,1);for(const k in MAP_CACHE)delete MAP_CACHE[k];alert('ลบแล้ว (รีเฟรชหน้าเว็บให้สมบูรณ์)')};
    ['edId','edName','edIc','edL1','edL2','edGn','edTh'].forEach(i=>$(i).oninput=$(i).onchange=()=>edSyncForm());
    const tl=$('edTiles');tl.innerHTML='';
    for(const [ch,label] of Object.entries(TILES)){const b=document.createElement('button');b.innerHTML=`<span style="display:inline-block;width:12px;height:12px;background:${TILE_COL[ch]};border:1px solid #000;margin-right:5px;vertical-align:-1px"></span>${label}`;b.onclick=()=>{ED.brush=ch;[...tl.children].forEach(c=>c.classList.remove('on'));b.classList.add('on')};if(ch==='.')b.classList.add('on');tl.appendChild(b)}
    // วาดบน canvas
    const cv=$('edCv');
    const paint=ev=>{if(!ev.buttons&&ev.type==='pointermove')return;const r=cv.getBoundingClientRect();const cs=cv.width/ED.gn;const x=Math.floor((ev.clientX-r.left)/(r.width/ED.gn)),y=Math.floor((ev.clientY-r.top)/(r.height/ED.gn));if(x<0||y<0||x>=ED.gn||y>=ED.gn)return;ev.preventDefault();if(ED.grid[y][x]!==ED.brush){if(!ED._u){edPushUndo();ED._u=1}ED.grid[y][x]=ED.brush;edDraw()}};
    cv.addEventListener('pointerdown',e=>{ED._u=0;cv.setPointerCapture(e.pointerId);paint(e)});
    cv.addEventListener('pointermove',paint);
    cv.addEventListener('pointerup',()=>ED._u=0);
  }
  $('edId').value=ED.id;$('edName').value=ED.name;$('edIc').value=ED.ic;$('edL1').value=ED.lv1;$('edL2').value=ED.lv2;$('edGn').value=ED.gn;$('edTh').value=ED.theme;
  edDraw();
}
function edSyncForm(){
  ED.id=($('edId').value||'c').toLowerCase().replace(/[^a-z0-9_]/g,'');ED.name=$('edName').value;ED.ic=$('edIc').value||'🗺️';
  ED.lv1=clamp(+$('edL1').value||1,1,210);ED.lv2=clamp(+$('edL2').value||20,ED.lv1,210);
  const g=+$('edGn').value,th=$('edTh').value;
  if(g!==ED.gn){ED.gn=g;ED.grid=edNewGrid(g)}   // ขยาย/ย่อ = เริ่มกริดใหม่ (มีเมืองอัตโนมัติ)
  ED.theme=ED_THEMES[th]?th:'forest';
}
function edDraw(){
  const cv=$('edCv');if(!cv||!ED)return;const gn=ED.gn,cs=18;cv.width=gn*cs;cv.height=gn*cs;
  const g=cv.getContext('2d');
  for(let y=0;y<gn;y++)for(let x=0;x<gn;x++){const ch=ED.grid[y]&&ED.grid[y][x]||'.';g.fillStyle=TILE_COL[ch]||'#333';g.fillRect(x*cs,y*cs,cs,cs);
    if(ch==='H'){g.fillStyle='#8a84a0';g.fillRect(x*cs,y*cs,cs,2)}}
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;
  for(let i=0;i<=gn;i++){g.beginPath();g.moveTo(i*cs,0);g.lineTo(i*cs,gn*cs);g.stroke();g.beginPath();g.moveTo(0,i*cs);g.lineTo(gn*cs,i*cs);g.stroke()}
  // กรอบเมือง
  g.strokeStyle='#f2c94c';g.lineWidth=2;g.strokeRect((gn-9)*cs,(gn-11)*cs,7*cs,10*cs);
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
