/* ============ ระบบสกิน (ชุดตัวละครพิเศษ) ============
   - ซื้อด้วย Zeny ครั้งเดียว ใส่/ถอดได้ตลอด แยกตามอาชีพ (นักรบ / นักธนู)
   - สกินคือสไปรต์ทั้งชุด (ยืน เดิน โจมตี 4 ทิศ) สร้างจาก tools/build_skins.py → skin_<id>.js
   - โหลดไฟล์ตอนที่ใช้งานจริงเท่านั้น (ไฟล์ละ ~1 MB) • สกินไม่มีภาพท่าสกิลของตัวเอง ใช้ท่าโจมตีของสกินแทน
   - เก็บใน P.sty (ถูกเซฟ/ส่งให้ผู้เล่นคนอื่นเห็นอยู่แล้ว): P.sty.outfit = id ที่ใส่, P.sty.own['outfit:<id>'] = ซื้อแล้ว */
(function(){
const SKIN_PRICE=1000000;
const SKINS={
  warrior:[
    {id:'dragon',n:'อัศวินมังกรเพลิง',ic:'🐉',d:'เกราะมังกรแดงทอง ปีกเพลิงและดาบแดงเรืองแสง'},
    {id:'cyber',n:'ดาบเลเซอร์ไซเบอร์',ic:'⚡',d:'ชุดนินจาล้ำยุค ผ้าพันคอสีม่วง ดาบเลเซอร์ฟ้า'}],
  archer:[
    {id:'valk',n:'วัลคิรีธนูเพลิง',ic:'🔥',d:'เกราะแดงทอง เขาและผ้าคลุมเพลิง ธนูลุกไหม้'},
    {id:'neko',n:'เนโกะธนูพลาสม่า',ic:'🐱',d:'หูแมวกับหูฟัง ชุดไซเบอร์ ธนูพลาสม่าสีฟ้า'}],
};
for(const c in SKINS)for(const s of SKINS[c]){s.cls=c;s.price=SKIN_PRICE;s.key='skin_'+s.id}
const find=(cls,id)=>(SKINS[cls]||[]).find(s=>s.id===id);
const sty=()=>{if(!P.sty)P.sty={own:{}};P.sty.own=P.sty.own||{};return P.sty};
const owns=id=>!!(P&&((P.sty&&P.sty.own&&P.sty.own['outfit:'+id])||(P.job&&P.job.skin===id)));
window.skinCount=cls=>(SKINS[cls]||[]).length;
window.skinsOf=cls=>(SKINS[cls]||[]).map(x=>({id:x.id,n:x.n,ic:x.ic,d:x.d}));
// วาดภาพสกิน (หน้าตรง ท่ายืน เคลื่อนไหว) ลงแคนวาส — ใช้ในหน้าต่างอาชีพ
window.skinDraw=function(c,id){
  const def=Object.values(SKINS).flat().find(x=>x.id===id);if(!def)return;ensureLoad(id);
  const S=SHEETS[def.key],g=c.getContext('2d'),W=c.width,H=c.height;g.clearRect(0,0,W,H);
  if(!S){g.fillStyle='#fff';g.font='11px Tahoma';g.textAlign='center';g.fillText('กำลังโหลด...',W/2,H/2);return}
  const fr=S.anims.idle.front,idx=fr[Math.floor(performance.now()/180)%fr.length];
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  const cx=S.cw*.15,cy=S.ch*.1,cw=S.cw*.7,chh=S.ch*.85,dh=H,dw=H*cw/chh;   // ตัดขอบว่างรอบตัวละคร ให้ภาพตัวใหญ่ขึ้น
  g.drawImage(S.im,(idx%S.cols)*S.cw+cx,Math.floor(idx/S.cols)*S.ch+cy,cw,chh,(W-dw)/2,0,dw,dh);
};
// เลือกสกินตอนตื่นรู้: บันทึกเป็นของผู้เล่นและสวมให้ทันที
window.skinGrant=id=>{if(!P.job)return;P.job.skin=id;const t=sty();t.own['outfit:'+id]=1;t.outfit=id;try{save&&save(false)}catch(e){}};

/* ---------- โหลดไฟล์สกินตอนต้องใช้ ---------- */
const state={};   // id -> 'loading' | 'ready' | 'fail'
function ensureLoad(id){
  const def=Object.values(SKINS).flat().find(s=>s.id===id);if(!def||state[id])return;
  state[id]='loading';
  const sc=document.createElement('script');sc.src=def.key+'.js?v=1';
  sc.onload=()=>{
    const m=window.SPRITES&&window.SPRITES[def.key];if(!m){state[id]='fail';return}
    const im=new Image();
    im.onload=()=>{SHEETS[def.key]=Object.assign({im,key:def.key},m);state[id]='ready';onLoaded()};
    im.onerror=()=>{state[id]='fail'};im.src=m.img;
  };
  sc.onerror=()=>{state[id]='fail'};
  document.head.appendChild(sc);
}
// โหลดเสร็จ: อัปเดตภาพผู้เล่นคนอื่นที่สวมสกินนี้ + หน้าเลือกตัวละคร + หน้าต่างสกิน
function onLoaded(){
  try{if(typeof SOC!=='undefined'&&SOC.others)for(const o of SOC.others.values()){
    if(o.sty&&o.sty.outfit&&typeof styledSheet==='function'){const s=styledSheet(o.cls,o.sty);if(s)o.actor.sh=s}}}catch(e){}
  try{if(!P&&$('cards')&&$('cards').querySelector('.slot')&&typeof buildStart==='function')buildStart()}catch(e){}
  refresh();
}
// ใช้จาก styledSheet() ใน f_style.js: คืนชีตสกินถ้าใส่อยู่และโหลดแล้ว ไม่งั้น null (ใช้ภาพปกติไปก่อน)
window.skinSheet=function(cls,s){
  const id=s&&s.outfit;if(!id||id==='none')return null;
  const def=find(cls,id);if(!def)return null;
  const S=SHEETS[def.key];if(S)return S;
  ensureLoad(id);return null;
};
// เซฟที่มีสกิน: โหลดล่วงหน้าให้หน้าเลือกตัวละครเห็นสกิน
try{
  for(let s=1;s<=3;s++){const sv=typeof loadSlot==='function'?loadSlot(s):null;
    if(sv&&sv.sty&&sv.sty.outfit)ensureLoad(sv.sty.outfit)}
}catch(e){}

/* ---------- ออร่าแฟชั่น (เอฟเฟกต์เรืองแสงด้านหลัง/ที่เท้า) ----------
   ไม่เกี่ยวกับระดับตีบวก — เลือกใส่ได้อิสระ 25 แบบ (5 ธีมสี × 5 แบบ) หรือปิด • ภาพจาก tools/build_auras.py → auras.js (โหลดตอนใช้ครั้งแรก ~1.3 MB)
   เก็บค่าเลือกใน P.sty.aura ('none' หรือ id เช่น 'fire_2') • ราคา: AURA_PRICE (0 = ฟรี) ถ้ากำหนดราคาจะซื้อก่อนใส่ (P.sty.own['aura:<id>']) */
const AURA_PRICE=0;
let auraImg=null,auraState='';
const auraMeta=()=>window.AURAS;
const auraOf=id=>{const m=auraMeta();return m&&m.list.find(a=>a.id===id)};
function loadAuras(){
  if(auraState)return;auraState='loading';
  const sc=document.createElement('script');sc.src='auras.js?v=4';
  sc.onload=()=>{const m=window.AURAS;if(!m){auraState='fail';return}
    const im=new Image();im.onload=()=>{auraImg=im;auraState='ready';refresh()};im.onerror=()=>{auraState='fail'};im.src=m.img};
  sc.onerror=()=>{auraState='fail'};document.head.appendChild(sc);
}
const auraSel=()=>{const a=P&&P.sty&&P.sty.aura;return a&&a!=='none'?a:null};
// สายออร่า (ธีมสี) เลือกครั้งเดียวที่ Lv30 • เซฟเก่าที่ใส่ออร่าไว้แล้ว = ถือว่าเลือกสายของออร่านั้น
const AURA_LV=30;
function auraTheme(){
  if(!P||!P.sty)return null;if(P.sty.auraTheme)return P.sty.auraTheme;
  const a=P.sty.aura&&P.sty.aura!=='none'&&auraOf(P.sty.aura);if(a){P.sty.auraTheme=a.theme;return a.theme}
  return null;
}
function pickAuraTheme(id){
  if(!P||P.lv<AURA_LV||auraTheme())return;const AM=auraMeta(),t=AM&&AM.themes.find(x=>x.id===id);if(!t)return;
  if(!confirm(`เลือกสายออร่า "${t.n}" ?\nเลือกแล้วเปลี่ยนสายไม่ได้ — จะเลือกได้เฉพาะ 5 แบบของสายนี้`))return;
  sty().auraTheme=id;sfx('levelup');toast(`✨ เลือกสายออร่า ${t.n}`);save&&save(false);refresh();
}
window.skinAuraTheme=pickAuraTheme;
window.auraSelected=()=>!!auraSel();
// คืนข้อมูลวาดออร่าเฟรมนี้ (ใช้ทั้งโหมด 2D และ 2.5D) หรือ null ถ้าไม่ได้เลือก/ยังโหลดไม่เสร็จ
window.auraCur=function(){
  const id=auraSel();if(!id)return null;
  if(!auraImg){loadAuras();return null}
  const a=auraOf(id);if(!a)return null;
  const t=performance.now()/1000,th=auraMeta().themes.find(x=>x.id===a.theme);
  const pulse=.5+.5*Math.sin(t*2.4);
  return {im:auraImg,x:a.x,y:a.y,w:a.w,h:a.h,fx:a.fx,fy:a.fy,dw:a.dw,dh:a.dh,W:auraImg.width,H:auraImg.height,add:!!(th&&th.add),
    sx:1+.035*pulse,dy:Math.sin(t*1.7)*.9,alpha:(.8+.2*pulse)*(th&&th.add?.72:1)};   // แสงบวกลดลงนิด ไม่ให้สว่างจ้าบนพื้นหญ้า   // ขยับเบาๆ: หายใจ/ลอยขึ้นลง/เรืองแสงเป็นจังหวะ
};
const aOwn=id=>AURA_PRICE<=0||!!(P.sty&&P.sty.own&&P.sty.own['aura:'+id]);
function setAura(id){
  if(id!=='none'){const a=auraOf(id);if(!a||a.theme!==auraTheme()){say('ต้องเลือกสายออร่าตอน Lv30 ก่อน','#ff9d9a');return}}
  if(id!=='none'&&!aOwn(id)){
    if(P.zeny<AURA_PRICE){say(`Zeny ไม่พอ (ต้องใช้ ${AURA_PRICE.toLocaleString()})`,'#ff9d9a');return}
    P.zeny-=AURA_PRICE;sty().own['aura:'+id]=1;toast('ซื้อออร่าแล้ว!');
  }
  sty().aura=id;sfx('click');save&&save(false);refresh();
}
window.skinAura=setAura;

/* ---------- ซื้อ / ใส่ / ถอด ---------- */
function equip(id){const s=sty();s.outfit=id;sfx('click');save&&save(false);refresh()}
function buySkin(id){
  const def=find(P.cls,id);if(!def||owns(id))return;
  if(P.zeny<def.price){say(`Zeny ไม่พอ (ต้องใช้ ${def.price.toLocaleString()})`,'#ff9d9a');refresh();return}
  P.zeny-=def.price;const s=sty();s.own['outfit:'+id]=1;s.outfit=id;
  sfx('loot',2);toast(`${def.ic} ซื้อสกิน ${def.n} แล้ว!`);
  try{ring(P.x,P.y,70,'#ffe28a',.7);burst(P.x,P.y-40,'#ffe28a',16)}catch(e){}
  save&&save(false);refresh();
}
window.skinBuy=buySkin;window.skinEquip=equip;

/* ---------- หน้าต่าง ---------- */
const w=document.createElement('div');w.id='winSkin';w.className='win panel sm';w.style.cssText='z-index:5;width:min(520px,96vw)';document.body.appendChild(w);
const st=document.createElement('style');st.textContent=`
#winSkin .sk-list{display:flex;flex-direction:column;gap:8px}
#winSkin .sk-card{display:flex;gap:10px;align-items:center;padding:8px;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a}
#winSkin .sk-card.on{box-shadow:inset 0 0 0 2px #7cc85e}
#winSkin .sk-card canvas{flex:none;width:112px;height:112px;background:linear-gradient(#27406a,#3c6a45 72%,#2d4a26);border:2px solid #c9a24b}
#winSkin .sk-info{flex:1;min-width:0}
#winSkin .sk-info b{font-size:15px}
#winSkin .sk-price{color:#ffe28a;font-weight:bold;margin:4px 0}
#winSkin .sk-info button{padding:6px 12px;font-weight:bold}
#winSkin .sk-aura{margin-top:12px;padding:8px;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a}
#winSkin .sk-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
#winSkin .sk-chips button{padding:5px 9px;font-size:12px;font-weight:bold}
#winSkin .sk-chips button.on{box-shadow:inset 0 0 0 2px #7cc85e}
#winSkin .sk-th{margin:8px 0 3px;font-size:12px;color:#ffe28a;font-weight:bold}
#winSkin .sk-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
#winSkin .sk-grid button{padding:3px 0 2px;display:flex;flex-direction:column;align-items:center;gap:1px;font-size:10px;font-weight:bold;color:#fff;background:#0b0e20;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a}
#winSkin .sk-grid button.on{box-shadow:inset 0 0 0 2px #7cc85e}
#winSkin .sk-grid canvas{width:100%;max-width:72px;aspect-ratio:1;image-rendering:auto}`;
document.head.appendChild(st);
let timer=0;
function refresh(){
  if(w.style.display!=='block'||!P)return;
  const list=SKINS[P.cls]||[],cur=sty().outfit||'none';
  const selA=sty().aura||'none',AM=auraMeta();
  const th0=auraTheme();
  // แถวตัวอย่างออร่า: ทุกสาย สายละ 5 แบบ (pick=true แสดงปุ่มเลือกสาย)
  const previewRows=pick=>AM.themes.map(t=>`<div class="sk-th">${t.n}${pick?` <button class="cbtn ok" style="margin-left:6px;padding:2px 10px" onclick="skinAuraTheme('${t.id}')">เลือกสายนี้</button>`:''}</div>
    <div class="sk-grid">${AM.list.filter(a=>a.theme===t.id).map(a=>`<button disabled style="opacity:1;cursor:default"><canvas data-au="${a.id}" width="72" height="72"></canvas><span>${AM.styles[a.idx]}</span></button>`).join('')}</div>`).join('');
  let auraBody;
  if(!AM)auraBody='<div class="small">กำลังโหลดออร่า...</div>';
  else if(!th0&&P.lv<AURA_LV)auraBody=`<div class="small">🔒 ปลดล็อกที่เลเวล ${AURA_LV} — เลือก 1 สายสีออร่า (เลือกแล้วเปลี่ยนไม่ได้) ตอนนี้ Lv ${P.lv}<br>ตัวอย่างออร่าแต่ละสาย:</div>`+previewRows(false);
  else if(!th0)auraBody=`<div class="small" style="margin-bottom:6px">เลือก <b>1 สายออร่า</b> — เลือกแล้วเปลี่ยนไม่ได้ และจะใช้ได้เฉพาะ 5 แบบของสายนั้น</div>
      `+previewRows(true);
  else{const tn=AM.themes.find(t=>t.id===th0);
    auraBody=`<div class="small">สายที่เลือก: <b style="color:#ffe28a">${tn?tn.n:th0}</b> • เลือกได้ 5 แบบ</div>
      <div class="sk-chips"><button class="${selA==='none'?'on':''}" onclick="skinAura('none')">ปิดออร่า</button></div>
      <div class="sk-grid">${AM.list.filter(a=>a.theme===th0).map(a=>
        `<button class="${selA===a.id?'on':''}" title="${a.n}" onclick="skinAura('${a.id}')"><canvas data-au="${a.id}" width="72" height="72"></canvas><span>${AM.styles[a.idx]}</span></button>`).join('')}</div>`}
  const auraHTML=`<div class="sk-aura"><b>✨ ออร่า</b> <span class="small">เลือกสายตอน Lv${AURA_LV}</span>${auraBody}</div>`;
  const mine=list.filter(x=>owns(x.id)),awakened=P.job&&P.job.t===2,canPick=awakened&&list.length&&!mine.length;
  let skHTML;
  if(!list.length)skHTML='<div class="small">อาชีพนี้ยังไม่มีสกิน (ได้สถานะ +100 จากการตื่นรู้เท่านั้น)</div>';
  else if(mine.length)skHTML=mine.map(x=>{const on=cur===x.id;
      return`<div class="sk-card${on?' on':''}"><canvas data-sk="${x.id}" width="128" height="128"></canvas>
        <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div>
        <div class="sk-price">${on?'✔ กำลังใส่':'สายที่เลือกตอนตื่นรู้'}</div>${on?`<button onclick="skinEquip('none')">ถอดสกิน</button>`:`<button onclick="skinEquip('${x.id}')">ใส่</button>`}</div></div>`}).join('');
  else if(canPick)skHTML=`<div class="small" style="margin-bottom:6px">ตื่นรู้แล้ว — เลือกสายสกินได้ 1 จาก ${list.length} (เลือกแล้วเปลี่ยนไม่ได้)</div><button class="cbtn ok" onclick="skinChoose()">เลือกสายสกิน</button>`;
  else skHTML=`<div class="small">🔒 สกินปลดล็อกตอนตื่นรู้ (Lv50) — เลือกได้ 1 จาก ${list.length} สาย พร้อมสถานะทุกค่า +100</div>
      ${list.map(x=>`<div class="sk-card"><canvas data-sk="${x.id}" width="128" height="128"></canvas>
        <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div></div></div>`).join('')}`;
  w.innerHTML=`<h3><span>🎭 สกินและออร่า</span><button class="x" onclick="toggleWin('winSkin')">✕</button></h3>
    <div class="small" style="margin-bottom:8px">สกินของ<b>${CLASSES[P.cls].name}</b> — ได้จากการตื่นรู้ที่ Lv50 • ออร่าเลือกสายที่ Lv30</div>
    <div class="sk-list">${skHTML}</div>${auraHTML}`;
  list.forEach(s=>ensureLoad(s.id));loadAuras();
  clearInterval(timer);timer=setInterval(drawPreviews,150);drawPreviews();
}
function drawAuraThumbs(){
  if(!auraImg)return;
  w.querySelectorAll('canvas[data-au]').forEach(c=>{
    if(c.dataset.done)return;const a=auraOf(c.dataset.au);if(!a)return;c.dataset.done=1;
    const g=c.getContext('2d'),k=Math.min(66/a.w,66/a.h),dw=a.w*k,dh=a.h*k;
    g.imageSmoothingQuality='high';g.drawImage(auraImg,a.x,a.y,a.w,a.h,(72-dw)/2,(72-dh)/2,dw,dh);
  });
}
function drawPreviews(){
  if(w.style.display!=='block'){clearInterval(timer);return}
  drawAuraThumbs();
  const t=Math.floor(performance.now()/180);
  w.querySelectorAll('canvas[data-sk]').forEach(c=>{
    const def=find(P.cls,c.dataset.sk),S=def&&SHEETS[def.key],g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);
    if(!S){g.fillStyle='#fff';g.font='14px Tahoma';g.textAlign='center';g.fillText('กำลังโหลด...',64,68);return}
    const fr=S.anims.idle.front,idx=fr[t%fr.length];
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
    g.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,0,0,128,128);
  });
}
WINX.winSkin=refresh;
/* ---------- โมดัลเลือกสายสกินตอนตื่นรู้ ---------- */
window.skinPickModal=function(cls,info,done){
  const list=SKINS[cls]||[];if(!list.length){done(null);return}
  list.forEach(x=>ensureLoad(x.id));
  const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:50;background:rgba(5,8,20,.78);display:flex;align-items:center;justify-content:center';
  const costTxt=info&&info.cost?` • ค่าธรรมเนียม ${info.cost.toLocaleString()} Zeny`:'';
  o.innerHTML=`<div class="win panel sm" style="display:block;position:relative;width:min(560px,96vw);max-height:92vh;overflow:auto;padding:12px">
    <h3 style="margin:0 0 6px"><span>🌟 ตื่นรู้${info&&info.name?' เป็น '+info.name:''}</span></h3>
    <div class="small" style="margin-bottom:8px">เลือกสายสกิน <b>1 จาก ${list.length}</b> (เลือกแล้วเปลี่ยนไม่ได้) • สถานะทุกค่า <b style="color:#7fe07f">+100</b>${costTxt}</div>
    <div class="sk-list">${list.map(x=>`<div class="sk-card"><canvas data-pk="${x.id}" width="128" height="128"></canvas>
      <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div><button data-pick="${x.id}">เลือกสายนี้</button></div></div>`).join('')}</div>
    <div style="text-align:right;margin-top:8px"><button data-cancel="1">ยกเลิก</button></div></div>`;
  document.body.appendChild(o);
  const tick=setInterval(()=>{const t=Math.floor(performance.now()/180);
    o.querySelectorAll('canvas[data-pk]').forEach(c=>{const def=find(cls,c.dataset.pk),S=def&&SHEETS[def.key],g=c.getContext('2d');g.clearRect(0,0,128,128);
      if(!S){g.fillStyle='#fff';g.font='14px Tahoma';g.textAlign='center';g.fillText('กำลังโหลด...',64,68);return}
      const fr=S.anims.idle.front,idx=fr[t%fr.length];g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,0,0,128,128)})},150);
  const close=()=>{clearInterval(tick);o.remove()};
  o.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.cancel){close();return}
    if(b.dataset.pick){const id=b.dataset.pick,def=find(cls,id);if(!confirm(`เลือกสายสกิน "${def.n}" ?\nเลือกแล้วเปลี่ยนไม่ได้`))return;close();done(id)}});
};
// คนที่ตื่นรู้ไปแล้วแต่ยังไม่ได้เลือกสกิน
window.skinChoose=function(){
  if(!P||!P.job||P.job.t!==2||P.job.skin)return;
  skinPickModal(P.cls,{name:P.name},id=>{window.skinGrant(id);toast('เลือกสายสกินแล้ว!');refresh()});
};

/* ---------- ปุ่มเมนู + คีย์ลัด V (แทนห้องแต่งตัวเดิมที่ปิดอยู่) ---------- */
(function(){
  const old=$('bStyle'),b=document.createElement('button');b.className='btn mi';b.id='bSkin';
  b.innerHTML='<i>🎭</i><span>สกิน/ออร่า</span><em>V</em>';
  if(old&&old.parentNode)old.parentNode.insertBefore(b,old);else{const m=$('menuPanel');if(m)m.appendChild(b)}
  b.onclick=()=>toggleWin('winSkin');
})();
let _auraHint=0;
setInterval(()=>{if(!P||P.lv<AURA_LV||auraTheme()||_auraHint===P.name+P.lv)return;_auraHint=P.name+P.lv;
  toast('✨ ถึง Lv30 — เลือกสายออร่าได้แล้ว (เมนู สกิน/ออร่า V)');say('✨ เลือกสายออร่าได้ที่เมนู สกิน/ออร่า (V) — เลือกแล้วเปลี่ยนไม่ได้','#ffe28a')},4000);
addEventListener('keydown',e=>{if(!P)return;const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='TEXTAREA')return;if(keyName(e)==='v')toggleWin('winSkin')});
})();
