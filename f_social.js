/* ============ ออนไลน์ด้วยกัน ============
   1) ชื่อตัวละครห้ามซ้ำ: จองชื่อในตาราง char_names (1 แถวต่อช่องตัวละคร) • ตัวละครเก่าจองให้อัตโนมัติตอนเข้าเกม
   2) คนออนไลน์: ส่งสัญญาณลงตาราง presence ทุก 60 วินาที แล้วนับคนที่ส่งสัญญาณภายใน 2 นาที
   3) เห็นผู้เล่นจริงในแมพเดียวกัน (Supabase Realtime: ช่องต่อแมพ) — ส่งตำแหน่งเฉพาะตอนเดิน (~1.4 ครั้ง/วิ) ประหยัดโควตา
      มอนสเตอร์ยังจำลองแยกเครื่องใครเครื่องมัน: เห็นกันเดิน/โจมตี แต่ตีมอนสเตอร์ตัวเดียวกันไม่ได้
   4) ปาร์ตี้ (สูงสุด 4 คน): แตะผู้เล่นอื่น -> ชวน • สมาชิกที่อยู่แมพเดียวกันให้ EXP +10% ต่อคน (สูงสุด +30%) และแบ่ง EXP 80% ของที่เพื่อนฆ่าได้
   ต้องโหลดหลัง f_online.js / f_chat.js / f_name.js / f_qtrack.js */

const SOC={rt:null,mapCh:null,mapId:null,inbox:null,others:new Map(),sendT:0,idleT:0,last:null,moving:false,prevA:'',prevT:0,actT:0,infoT:0,info:'',
  party:null,partyCh:null,members:[],pT:0,invite:null};
const ONLINE={n:0,t:3};
const meKey=()=>SESS.user.id+':'+SLOT;
const errStr=e=>JSON.stringify(e&&(e.raw||e.msg||e)||'');
// ชื่อที่มาจากคนอื่น: เหลือเฉพาะตัวอักษรที่ระบบชื่ออนุญาต + กรองคำหยาบ
const cleanName2=v=>chatClean(String(v||'').replace(/[^฀-๿A-Za-z0-9_ ]/g,'').trim().slice(0,12))||'ผู้เล่น';

/* ---------- 1) ชื่อห้ามซ้ำ ---------- */
// '' = จองได้ (หรือเซิร์ฟเวอร์ยังไม่มีตาราง/เน็ตหลุด -> ปล่อยผ่าน แล้วจองใหม่ตอนเข้าเกม) • 'taken' • 'invalid'
async function nameClaim(v){
  if(typeof SESS==='undefined'||!SESS)return '';
  try{await ensureFresh();
    await sb('/rest/v1/char_names?on_conflict=player_id,slot',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({player_id:SESS.user.id,slot:SLOT,name:v,name_key:v.toLowerCase()})});return ''}
  catch(e){const s=errStr(e);if(/23505|duplicate|char_names_key/.test(s))return 'taken';if(/name: invalid/.test(s))return 'invalid';return ''}
}
nameCheck=async v=>{const r=await nameClaim(v);return r==='taken'?'ชื่อนี้มีผู้เล่นใช้แล้ว ลองชื่ออื่น':r==='invalid'?'ชื่อไม่ถูกต้อง':''};
// ตัวละครที่มีชื่ออยู่แล้ว: จองชื่อให้ ถ้าชนกับคนอื่น -> ให้ตั้งชื่อใหม่
async function nameEnsure(){
  if(!P||!P.dx||!P.dx.nick||!SESS)return;
  if(await nameClaim(P.dx.nick)!=='taken')return;
  say(`ชื่อ "${P.dx.nick}" มีผู้เล่นคนอื่นใช้แล้ว กรุณาตั้งชื่อใหม่`,'#ffb36b');
  askName(P.cls,n=>{P.dx.nick=n;save(true);toast(`✏️ ตั้งชื่อเป็น ${n} แล้ว`);socInfo(true)});
}
const _beginS=begin;
begin=function(cls,carry){_beginS(cls,carry);if(carry)setTimeout(nameEnsure,1500)};
// ลบตัวละคร -> คืนชื่อให้คนอื่นใช้ได้
const _delS=deleteSlotData;
deleteSlotData=async function(s){
  const ok=await _delS(s);
  if(ok&&SESS)try{await sb(`/rest/v1/char_names?player_id=eq.${encodeURIComponent(SESS.user.id)}&slot=eq.${s}`,{method:'DELETE'})}catch(e){}
  return ok;
};

/* ---------- 2) คนออนไลน์ ---------- */
(function(){
  const s=document.createElement('style');s.textContent=`
#onlineSt{position:fixed;z-index:5;display:none;padding:2px 8px;font-size:11px;color:#8be07a;background:rgba(8,12,28,.6);border-radius:9px;pointer-events:none;white-space:nowrap}
#socPop{position:fixed;z-index:40;display:none;flex-direction:column;gap:6px;min-width:190px;padding:10px;color:#eef3ff;font-size:13px;background:linear-gradient(#1b2d5c,#0f1a3a);border:2px solid #d4af37;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.6)}
#socPop b{color:#ffe28a;font-size:15px}#socPop .small{color:#9fb0d8}
#socPop button,#socInv button{padding:8px 10px;font:inherit;font-weight:bold;cursor:pointer;border-radius:8px;color:#fff;background:linear-gradient(#2f5bb3,#1d3a7a);border:2px solid #4a74c9}
#socPop button.go,#socInv button.go{color:#2a1a00;background:linear-gradient(#ffe28a,#d4a017);border-color:#fff1b8}
#socPop button:disabled{opacity:.5;cursor:default}
#socInv{position:fixed;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);display:none;flex-direction:column;gap:10px;width:min(360px,92vw);padding:18px 18px 16px;text-align:center;color:#eef3ff;font-size:15px;background:linear-gradient(#1b2d5c,#0f1a3a);border:3px solid #d4af37;border-radius:14px;box-shadow:0 0 0 100vmax rgba(4,8,24,.55),0 10px 34px rgba(0,0,0,.7)}
#socInv .tt{font-size:17px;font-weight:bold;color:#ffe28a}#socInv .who{font-size:18px}#socInv .cd{font-size:12px;color:#9fb0d8}
#socInv .row{display:flex;gap:8px}#socInv .row button{flex:1}`;
  document.head.appendChild(s);
  for(const id of ['onlineSt','socPop','socInv']){const d=document.createElement('div');d.id=id;document.body.appendChild(d)}
})();
function onlineUI(){
  const e=$('onlineSt'),m=$('mini');if(!e)return;
  if(!ONLINE.n||!m||m.style.display==='none'){e.style.display='none';return}
  const r=m.getBoundingClientRect();e.textContent=`🟢 ออนไลน์ ${ONLINE.n} คน`;e.style.display='block';
  e.style.top=Math.round(r.bottom+4)+'px';e.style.right=Math.round(innerWidth-r.right)+'px';
  const c=$('chOnline');if(c)c.textContent=`🟢 ออนไลน์ ${ONLINE.n} คน`;
}
async function presencePing(){
  if(!SESS||!P||NOSAVE)return;
  try{
    await ensureFresh();
    await sb('/rest/v1/presence?on_conflict=player_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({player_id:SESS.user.id,name:pName(),lv:P.lv,cls:P.cls,map:MAPID})});
    const since=new Date(Date.now()-120000).toISOString();
    const rows=await sb(`/rest/v1/presence?select=player_id&seen_at=gt.${encodeURIComponent(since)}&limit=1000`);
    ONLINE.n=(rows||[]).length;
  }catch(e){}
  onlineUI();
}

/* ---------- 3) เห็นผู้เล่นจริงในแมพ (Realtime) ---------- */
function rtLoad(){
  return new Promise((res,rej)=>{
    if(window.supabase&&window.supabase.createClient)return res();
    const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);
  });
}
async function rtInit(){
  if(SOC.rt||SOC.loading||!SESS)return;SOC.loading=true;
  try{
    await rtLoad();
    SOC.rt=window.supabase.createClient(SB.url,SB.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    SOC.rt.realtime.setAuth(SESS.access_token);
    inboxJoin();partyRestore();
  }catch(e){console.warn('[social] realtime ใช้ไม่ได้',e)}
  SOC.loading=false;
}
// ข้อมูลตัวเราที่คนอื่นเห็น
function myInfo(){return{id:meKey(),uid:SESS.user.id,name:pName(),lv:P.lv,cls:P.cls,job:P.name,sty:P.sty||null,map:MAPID,x:Math.round(P.x),y:Math.round(P.y)}}
function socInfo(force){
  const ch=SOC.mapCh;if(!ch||!SOC.joined)return;
  const i=myInfo(),k=JSON.stringify([i.name,i.lv,i.cls,i.job,i.sty]);
  if(force||k!==SOC.info){SOC.info=k;ch.track(i)}
}
// ข้อมูลจากคนอื่น: ตรวจทุกช่องก่อนใช้ (ช่อง Realtime เป็นสาธารณะ)
function cleanInfo(i){
  if(!i||typeof i!=='object'||!CLASSES[i.cls])return null;
  const name=cleanName2(i.name);
  return{name,lv:clamp(+i.lv||1,1,200),cls:i.cls,job:String(i.job||'').slice(0,20),sty:i.sty&&typeof i.sty==='object'?i.sty:null,uid:String(i.uid||'').slice(0,40),
    x:clamp(+i.x||0,0,WORLD.w),y:clamp(+i.y||0,0,WORLD.h)};
}
function upsertOther(k,raw){
  const i=cleanInfo(raw);if(!i)return;
  let o=SOC.others.get(k);
  if(!o){o={k,x:i.x,y:i.y,tx:i.x,ty:i.y,spd:120,actor:makeActor(CLASSES[i.cls].sprite)};o.actor.ang=Math.PI/2;SOC.others.set(k,o)}
  if(o.cls!==i.cls||JSON.stringify(o.sty)!==JSON.stringify(i.sty)){
    o.actor.sh=SHEETS[CLASSES[i.cls].sprite];
    try{if(i.sty&&typeof styledSheet==='function'){const s=styledSheet(i.cls,i.sty);if(s){s.key=CLASSES[i.cls].sprite;o.actor.sh=s}}}catch(e){}
  }
  Object.assign(o,{name:i.name,lv:i.lv,cls:i.cls,job:i.job,sty:i.sty,uid:i.uid});
}
function mapJoin(){
  if(!SOC.rt||!P)return;
  if(SOC.mapCh){try{SOC.rt.removeChannel(SOC.mapCh)}catch(e){}SOC.mapCh=null}
  SOC.others.clear();SOC.mapId=MAPID;SOC.joined=false;SOC.info='';
  if(MAP.dungeon)return;   // ดันเจี้ยนเป็นของส่วนตัว
  const me=meKey(),ch=SOC.rt.channel('mq-map-'+MAPID,{config:{broadcast:{self:false},presence:{key:me}}});
  ch.on('presence',{event:'sync'},()=>{
    const st=ch.presenceState();
    for(const k in st){if(k!==me&&st[k][0])upsertOther(k,st[k][0])}
    for(const k of [...SOC.others.keys()])if(!st[k])SOC.others.delete(k);
  });
  ch.on('broadcast',{event:'pos'},({payload:p})=>{
    const o=p&&SOC.others.get(p.id);if(!o)return;
    const x=clamp(+p.x||0,0,WORLD.w),y=clamp(+p.y||0,0,WORLD.h),d=Math.hypot(x-o.x,y-o.y);
    o.tx=x;o.ty=y;o.spd=Math.max(60,d/.75);if(d>700){o.x=x;o.y=y}
  });
  ch.on('broadcast',{event:'act'},({payload:p})=>{
    const o=p&&SOC.others.get(p.id);if(!o)return;o.actor.ang=+p.ang||0;oneShot(o.actor,'attack',.45);
  });
  ch.subscribe(s=>{if(s==='SUBSCRIBED'&&SOC.mapCh===ch){SOC.joined=true;socInfo(true);sendPos()}});
  SOC.mapCh=ch;
}
function sendPos(){
  if(!SOC.mapCh||!SOC.joined)return;
  SOC.last={x:P.x,y:P.y};SOC.mapCh.send({type:'broadcast',event:'pos',payload:{id:meKey(),x:Math.round(P.x),y:Math.round(P.y)}});
}
// อัปเดตทุกเฟรม: ส่งตำแหน่งตอนเดิน / ขยับคนอื่นไปหาตำแหน่งล่าสุด
REG.tick.push(dt=>{
  if(!P||typeof SESS==='undefined'||!SESS)return;
  ONLINE.t-=dt;if(ONLINE.t<=0){ONLINE.t=60;presencePing();if(!SOC.rt)rtInit()}
  if(!SOC.rt)return;
  if(SOC.mapId!==MAPID)mapJoin();
  if(SOC.joined){
    const mv=!SOC.last||Math.hypot(P.x-SOC.last.x,P.y-SOC.last.y)>3;
    SOC.sendT-=dt;SOC.idleT-=dt;
    if(mv&&SOC.sendT<=0){SOC.sendT=.7;SOC.idleT=15;sendPos()}
    else if(!mv&&SOC.moving){sendPos()}           // หยุดเดิน: ส่งจุดสุดท้ายให้ตรง
    else if(SOC.idleT<=0){SOC.idleT=15;sendPos()}
    SOC.moving=mv;
    // โจมตี: ส่งให้คนอื่นเห็นท่า (ไม่เกิน 2 ครั้ง/วิ)
    const a=P.actor;SOC.actT-=dt;
    if(a&&a.anim==='attack'&&(SOC.prevA!=='attack'||a.t<SOC.prevT)&&SOC.actT<=0){SOC.actT=.5;SOC.mapCh.send({type:'broadcast',event:'act',payload:{id:meKey(),ang:+a.ang.toFixed(2)}})}
    if(a){SOC.prevA=a.anim;SOC.prevT=a.t}
    SOC.infoT-=dt;if(SOC.infoT<=0){SOC.infoT=4;socInfo(false)}
  }
  for(const o of SOC.others.values()){
    const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);
    if(d>3){const s=Math.min(d,o.spd*dt);o.x+=dx/d*s;o.y+=dy/d*s;o.actor.ang=Math.atan2(dy,dx);loopAnim(o.actor,'walk',.9)}else loopAnim(o.actor,'idle');
    tickActor(o.actor,dt);
  }
  partyTick(dt);
});
REG.draw.push((Ls,iv)=>{
  for(const o of SOC.others.values()){if(!iv(o.x,o.y,100,120))continue;
    Ls.push({y:o.y,f:()=>{lx.globalAlpha=.28;pxEllipse(sxL(o.x),syL(o.y),9,3,'#000',true);lx.globalAlpha=1;drawActor(o.actor,o.x,o.y,{sc:UNIT_SCALE})}});
    if(o.sty&&(o.sty.hat&&o.sty.hat!=='none'||o.sty.back&&o.sty.back!=='none')&&typeof drawStyleWorld==='function'){
      Ls.push({y:o.y-.01,f:()=>drawStyleWorld(o.actor,o.x,o.y,'back',o.sty)});Ls.push({y:o.y+.01,f:()=>drawStyleWorld(o.actor,o.x,o.y,'front',o.sty)})}
  }
});
REG.names.push((TX,sc)=>{
  for(const o of SOC.others.values()){const x=sxL(o.x),y=syL(o.y)+14;if(x<-60||x>LW+60||y<-20||y>LH+30)continue;
    const mate=SOC.members.some(m=>m.uid===o.uid);TX(x*sc,y*sc,`${mate?'👥 ':''}${o.name} Lv${o.lv}`,mate?'#8be07a':'#bfe0ff',12)}
});
// แตะผู้เล่นคนอื่น -> เมนู (ดักก่อนระบบคลิกเดิน/โจมตีเดิม)
addEventListener('pointerdown',e=>{
  if(e.target!==cv||!P||!SOC.others.size||!e.isPrimary)return;
  const w=worldPos(e);let best=null,bd=1e9;
  for(const o of SOC.others.values()){const h=CLASSES[o.cls].h||150,dx=Math.abs(w.x-o.x),dy=o.y-w.y;
    if(dx<34&&dy>-20&&dy<h+10){const d=dx+Math.abs(dy-h/2)*.3;if(d<bd){bd=d;best=o}}}
  if(!best)return;
  e.stopImmediatePropagation();e.preventDefault();socPop(best,e.clientX,e.clientY);
},true);
function socPop(o,x,y){
  const p=$('socPop'),inP=SOC.members.some(m=>m.uid===o.uid),full=SOC.members.length>=4;
  p.innerHTML=`<b>${esc(o.name)}</b><div class="small">${esc(o.job||CLASSES[o.cls].name)} • Lv ${o.lv}</div>
    <button class="go" ${inP||full?'disabled':''} onclick="partyInvite('${o.k}')">${inP?'👥 อยู่ปาร์ตี้เดียวกันแล้ว':full?'ปาร์ตี้เต็ม (4 คน)':'👥 ชวนเข้าปาร์ตี้'}</button>
    <button onclick="$('socPop').style.display='none'">ปิด</button>`;
  p.style.display='flex';
  const r=p.getBoundingClientRect();p.style.left=Math.round(clamp(x-r.width/2,8,innerWidth-r.width-8))+'px';p.style.top=Math.round(clamp(y-r.height-16,8,innerHeight-r.height-8))+'px';
}

/* ---------- 4) ปาร์ตี้ ---------- */
const PARTY_KEY='mq_party',PARTY_MAX=4;
// กล่องจดหมายส่วนตัว: รับคำชวน/คำตอบ
function inboxJoin(){
  const ch=SOC.rt.channel('mq-user-'+SESS.user.id,{config:{broadcast:{self:false}}});
  ch.on('broadcast',{event:'invite'},({payload:p})=>{
    if(!p||typeof p.pid!=='string'||SOC.invite||(SOC.party&&SOC.party===p.pid))return;
    SOC.invite=p;const d=$('socInv'),nm=esc(cleanName2(p.name));
    const lvT=p.lv?` <span style="color:#9fb0d8;font-size:13px">Lv ${esc(String(+p.lv||''))}</span>`:'';
    d.innerHTML=`<div class="tt">👥 คำชวนเข้าปาร์ตี้</div><div class="who"><b style="color:#9ff0a0">${nm}</b>${lvT}<br>ชวนคุณเข้าร่วมปาร์ตี้</div>${SOC.party?'<div class="small" style="color:#ffb36b">ถ้ารับ จะออกจากปาร์ตี้เดิม</div>':''}
      <div class="small" style="color:#9fb0d8">อยู่แมพเดียวกัน = EXP +10% ต่อเพื่อน 1 คน • เพื่อนฆ่ามอนสเตอร์ คุณได้ EXP แบ่ง 80%</div>
      <div class="row"><button onclick="partyAnswer(false)">✖ ปฏิเสธ</button><button class="go" onclick="partyAnswer(true)">✔ ตกลง</button></div><div class="cd" id="invCount">ตอบภายใน 30 วินาที</div>`;
    d.style.display='flex';if(typeof sfx==='function')sfx('quest');
    clearTimeout(SOC.invT);SOC.invT=setTimeout(()=>{if(SOC.invite===p)partyAnswer(false)},30000);
    clearInterval(SOC.invI);let left=30;SOC.invI=setInterval(()=>{left--;const c=$('invCount');if(c)c.textContent='ตอบภายใน '+Math.max(0,left)+' วินาที';if(left<=0||SOC.invite!==p)clearInterval(SOC.invI)},1000);
    try{if(typeof toast==='function')toast('👥 '+cleanName2(p.name)+' ชวนคุณเข้าปาร์ตี้')}catch(e){}
  });
  ch.on('broadcast',{event:'reply'},({payload:p})=>{
    if(!p)return;const nm=cleanName2(p.name);
    say(p.ok?`👥 ${nm} เข้าร่วมปาร์ตี้แล้ว`:`${nm} ปฏิเสธคำชวน`,p.ok?'#8be07a':'#ccc');
  });
  ch.subscribe();SOC.inbox=ch;
}
// ส่งข้อความเข้ากล่องของอีกคน (เปิดช่องชั่วคราว ส่งแล้วปิด)
function sendTo(uid,event,payload){
  if(!/^[0-9a-f-]{36}$/i.test(uid))return;
  const ch=SOC.rt.channel('mq-user-'+uid);
  ch.subscribe(s=>{if(s==='SUBSCRIBED'){ch.send({type:'broadcast',event,payload});setTimeout(()=>{try{SOC.rt.removeChannel(ch)}catch(e){}},1500)}});
}
function partyInvite(k){
  $('socPop').style.display='none';const o=SOC.others.get(k);if(!o||!SOC.rt)return;
  if(!SOC.party)partyJoin(Math.random().toString(36).slice(2,10)+Date.now().toString(36));
  sendTo(o.uid,'invite',{pid:SOC.party,uid:SESS.user.id,name:pName(),lv:P.lv});
  say(`ส่งคำชวนเข้าปาร์ตี้ถึง ${o.name} แล้ว`,'#9fc0ff');
}
function partyAnswer(ok){
  clearInterval(SOC.invI);const p=SOC.invite;$('socInv').style.display='none';SOC.invite=null;if(!p)return;
  if(ok){partyJoin(p.pid);toast('👥 เข้าร่วมปาร์ตี้แล้ว')}
  if(typeof p.uid==='string')sendTo(p.uid,'reply',{name:pName(),ok});
}
function partyJoin(pid){
  partyLeave(true);
  SOC.party=pid;SOC.members=[];SOC.pj=Date.now();
  try{localStorage.setItem(PARTY_KEY,JSON.stringify({pid,t:Date.now()}))}catch(e){}
  const me=meKey(),ch=SOC.rt.channel('mq-party-'+pid,{config:{presence:{key:me}}});
  ch.on('presence',{event:'sync'},()=>{
    const st=ch.presenceState(),L=[];
    for(const k in st){const i=st[k][0];if(!i)continue;L.push({k,uid:String(i.uid||''),name:cleanName2(i.name),lv:clamp(+i.lv||1,1,100),cls:CLASSES[i.cls]?i.cls:'warrior',
      map:MAPS[i.map]?i.map:'',hp:clamp(+i.hp||0,0,1),j:+i.j||0,me:k===me})}
    L.sort((a,b)=>a.j-b.j);
    // เกิน 4 คน: คนที่เข้ามาทีหลังสุดออกเอง
    if(L.length>PARTY_MAX&&L.findIndex(m=>m.me)>=PARTY_MAX){say('ปาร์ตี้เต็มแล้ว (4 คน)','#ff9d9a');partyLeave();return}
    SOC.members=L;if(typeof QT!=='undefined'&&QT.tab==='party')updateTracker();
  });
  // รับ EXP แบ่งจากเพื่อนในปาร์ตี้ (เฉพาะแมพเดียวกัน)
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
  ch.subscribe(s=>{if(s==='SUBSCRIBED'&&SOC.partyCh===ch)partyTrack()});
  SOC.partyCh=ch;
  if(typeof QT!=='undefined'){QT.tab='party';updateTracker()}
}
function partyTrack(){
  if(!SOC.partyCh||!P)return;
  SOC.partyCh.track({uid:SESS.user.id,name:pName(),lv:P.lv,cls:P.cls,map:MAPID,hp:+(P.hp/maxHp()).toFixed(2),j:SOC.pj});
}
function partyLeave(silent){
  if(SOC.partyCh){try{SOC.partyCh.untrack();SOC.rt.removeChannel(SOC.partyCh)}catch(e){}}
  const had=!!SOC.party;SOC.partyCh=null;SOC.party=null;SOC.members=[];
  try{localStorage.removeItem(PARTY_KEY)}catch(e){}
  if(had&&!silent){say('ออกจากปาร์ตี้แล้ว','#ccc');updateTracker()}
}
// รีโหลดหน้า/สลับตัวละคร ภายใน 30 นาที: กลับเข้าปาร์ตี้เดิม
function partyRestore(){
  try{const p=JSON.parse(localStorage.getItem(PARTY_KEY)||'null');if(p&&p.pid&&Date.now()-p.t<1800000)partyJoin(p.pid)}catch(e){}
}
function partyTick(dt){
  if(!SOC.partyCh)return;SOC.pT-=dt;
  if(SOC.pT<=0){SOC.pT=2.5;partyTrack();
    try{localStorage.setItem(PARTY_KEY,JSON.stringify({pid:SOC.party,t:Date.now()}))}catch(e){}
    if(typeof QT!=='undefined'&&QT.tab==='party')updateTracker()}
}
// แบ่ง EXP 80%: สะสม EXP ที่ฆ่าได้ แล้วส่งให้เพื่อนทุก ~1 วินาที (ไม่ส่งถี่เกิน) • ผู้รับได้ 80% ของ EXP ต้นทาง
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
// โบนัส EXP: เพื่อนในปาร์ตี้ที่อยู่แมพเดียวกัน +10% ต่อคน (สูงสุด +30%)
const partyNear=()=>SOC.members.filter(m=>!m.me&&m.map===MAPID).length;
const _bmS=bonusMods;
bonusMods=function(){const b=_bmS(),n=Math.min(3,partyNear());return n?Object.assign({},b,{exp:b.exp*(1+.1*n)}):b};
// แถบปาร์ตี้ในแถบเควสต์ (f_qtrack.js เรียก)
function partyRows(){
  if(!SESS)return '<div class="qe">ต้องล็อกอินออนไลน์ก่อน</div>';
  if(!SOC.party)return `<div class="qe">ยังไม่มีปาร์ตี้ • แตะผู้เล่นคนอื่นในแมพเพื่อชวน${ONLINE.n?`<br>🟢 ออนไลน์ ${ONLINE.n} คน`:''}</div>`;
  const n=partyNear();
  return SOC.members.map(m=>`<div class="qi"><div class="qn">${m.me?'⭐ ':''}${esc(m.name)} <span style="color:#9fb0d8;font-weight:normal">Lv${m.lv}</span></div>`+
    `<div class="qo"><span>${MAPS[m.map]?MAPS[m.map].ic+' '+MAPS[m.map].name:'-'}</span><b style="color:${m.hp>.5?'#8be07a':m.hp>.25?'#ffd84a':'#ff8a85'}">HP ${Math.round(m.hp*100)}%</b></div></div>`).join('')+
    `<div class="qe">${n?`EXP +${n*10}% • แบ่ง EXP 80% (เพื่อนในแมพนี้ ${n} คน)`:'อยู่แมพเดียวกันเพื่อรับ EXP เพิ่ม'} • <a style="color:#ff9d9a;cursor:pointer;text-decoration:underline" onclick="if(confirm('ออกจากปาร์ตี้?'))partyLeave()">ออกจากปาร์ตี้</a></div>`;
}
