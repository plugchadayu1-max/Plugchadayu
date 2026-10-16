/* ============ ระบบออนไลน์ (Supabase) ============
   - สมัคร/ล็อกอินด้วยชื่อผู้ใช้+รหัสผ่าน (ไม่ต้องใช้อีเมลจริง) (Supabase Auth ผ่าน REST ไม่ต้องใช้ไลบรารี)
   - เซฟตัวละครขึ้นตาราง game_saves (1 บัญชี = 2 ช่อง = แถวละ 1 ตัวละคร คีย์ player_id+slot) ป้องกันด้วย RLS ฝั่งฐานข้อมูล
     ถ้ายังไม่ได้รัน tools/supabase_setup.sql เวอร์ชันใหม่ (ไม่มีคอลัมน์ slot) -> ใช้ได้ช่องเดียวแบบเดิม (SB.legacy)
   - เซฟในเครื่องยังอยู่เป็นสำรอง; ถ้าเน็ตหลุดจะเล่นต่อได้ แล้วซิงค์ตอนกลับมา
   ต้องโหลดเป็นไฟล์สุดท้าย (หลัง f_theme.js) */

const SB={url:'https://sdsfpefkzxogzobesagm.supabase.co',key:'sb_publishable_RGOfZyF6tGj6fNY9ohih7g_f-86XgRX',table:'game_saves',legacy:false};
const noSlotCol=e=>/slot/.test(JSON.stringify(e&&(e.raw||e.tx)||''))&&/column|schema|42703|PGRST204/i.test(JSON.stringify(e&&(e.raw||e.tx)||''));
const SESS_KEY='mq_sess',OWNER_KEY='mq_owner';
let SESS=null,CLOUD={last:0,ok:null,pushing:false,at:0};

function loadSess(){try{SESS=JSON.parse(localStorage.getItem(SESS_KEY)||'null')}catch(e){SESS=null}}
function saveSess(){try{if(SESS)localStorage.setItem(SESS_KEY,JSON.stringify(SESS));else localStorage.removeItem(SESS_KEY)}catch(e){}}
// ชื่อผู้ใช้ <-> อีเมลสังเคราะห์ (Supabase Auth ต้องมีรูปแบบอีเมล) — ผู้ใช้ไม่ต้องมีอีเมลจริง ต้องปิด "Confirm email" ใน Supabase
const AUTH_DOMAIN='players.meadowquest.app';
const userToEmail=u=>u.includes('@')?u:u+'@'+AUTH_DOMAIN;           // มี @ = บัญชีเก่าที่สมัครด้วยอีเมลจริง ใช้ได้เหมือนเดิม
const emailToUser=e=>String(e||'').endsWith('@'+AUTH_DOMAIN)?e.slice(0,-(AUTH_DOMAIN.length+1)):e;
function sessFrom(j){return{access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:{id:j.user.id,email:j.user.email}}}

// คำร้องไป Supabase  (auth=true แนบโทเคนผู้เล่น)  โยน {net:true} เมื่อเน็ตมีปัญหา
async function sb(path,opt={},auth=true){
  const h=Object.assign({apikey:SB.key,'Content-Type':'application/json'},opt.headers||{});
  if(auth&&SESS)h.Authorization='Bearer '+SESS.access_token;
  let r;try{r=await fetch(SB.url+path,Object.assign({},opt,{headers:h}))}catch(e){throw{net:true,msg:'ติดต่อเซิร์ฟเวอร์ไม่ได้ ตรวจสอบอินเทอร์เน็ต'}}
  let j=null;const tx=await r.text();try{j=tx?JSON.parse(tx):null}catch(e){}
  if(!r.ok){throw{status:r.status,msg:authMsg((j&&(j.error_description||j.msg||j.message||j.error))||('HTTP '+r.status)),raw:j}}
  return j;
}
function authMsg(m){
  m=String(m);
  const T=[[/invalid login/i,'ID หรือรหัสผ่านไม่ถูกต้อง'],[/already registered|already been registered/i,'ID นี้มีคนใช้แล้ว ลองตั้ง ID อื่น หรือเข้าสู่ระบบแทน'],
    [/at least 6/i,'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'],[/email not confirmed/i,'บัญชียังไม่ถูกเปิดใช้งาน — ให้ผู้ดูแลปิด "Confirm email" ใน Supabase'],
    [/valid email|invalid.*email|email address.*invalid/i,'ID นี้ใช้ไม่ได้ ลองตั้ง ID อื่น (ตัวอังกฤษ/ตัวเลข)'],[/rate limit|too many/i,'ลองบ่อยเกินไป รอสักครู่แล้วลองใหม่'],
    [/signups? (not allowed|disabled)/i,'ระบบปิดรับสมัครอยู่'],[/JWT|expired/i,'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่']];
  for(const [re,t] of T)if(re.test(m))return t;return m;
}
async function ensureFresh(){
  if(!SESS)throw{msg:'ยังไม่ได้ล็อกอิน'};
  if(SESS.expires_at-Math.floor(Date.now()/1000)>90)return;
  const j=await sb('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:SESS.refresh_token})},false);
  SESS=sessFrom(j);saveSess();
}

/* ---------- ซิงค์เซฟ ---------- */
function cloudStatus(){
  const e=$('cloudSt');if(!e)return;
  if(!SESS){e.textContent='';return}
  const t=CLOUD.at?new Date(CLOUD.at).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'}):'-';
  e.innerHTML=`☁ ${emailToUser(SESS.user.email)}<br>${CLOUD.ok===false?'<span style="color:#ff9d9a">⚠ ซิงค์ไม่สำเร็จ (จะลองใหม่)</span>':`ซิงค์ล่าสุด ${t}`}`;
}
async function cloudPush(keep){
  if(!SESS||NOSAVE||CLOUD.pushing&&!keep)return;
  if(SB.legacy&&SLOT!==1)return;   // ฐานข้อมูลยังไม่รองรับช่อง 2 -> ห้ามอัปทับช่อง 1
  let obj=null;try{obj=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){}
  if(!obj)return;
  CLOUD.pushing=true;CLOUD.last=Date.now();
  try{
    if(!keep)await ensureFresh();
    const row={player_id:SESS.user.id,save_data:obj,updated_at:new Date().toISOString()};if(!SB.legacy)row.slot=SLOT;
    const body=JSON.stringify(row);
    const r=await fetch(SB.url+`/rest/v1/${SB.table}?on_conflict=${SB.legacy?'player_id':'player_id,slot'}`,{method:'POST',keepalive:!!keep,
      headers:{apikey:SB.key,Authorization:'Bearer '+SESS.access_token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body});
    if(!r.ok){let tx='';try{tx=await r.text()}catch(e){}throw{status:r.status,tx}}
    CLOUD.ok=true;CLOUD.at=Date.now();CLOUD.rej=false;
    lbPush();
  }catch(e){
    CLOUD.ok=false;if(e&&e.status===401)SESS&&(SESS.expires_at=0);
    // เซิร์ฟเวอร์ตรวจพบข้อมูลผิดปกติ (ระบบกันโกงใน Supabase) -> แจ้งผู้เล่น ไม่ลองซ้ำรัวๆ
    if(e&&/cheat/.test(e.tx||'')){CLOUD.rej=true;CLOUD.last=Date.now()+120000;if(typeof say==='function'&&P)say('⚠ เซิร์ฟเวอร์ปฏิเสธการบันทึก: พบข้อมูลที่ผิดปกติ (เลเวล/เงินเพิ่มเร็วเกินจริง)','#ff8a85')}
  }
  CLOUD.pushing=false;cloudStatus();
}
/* ---------- อันดับพลังรบ (ผู้เล่นจริงเท่านั้น) ตาราง leaderboard — ต้องรัน tools/supabase_setup.sql ---------- */
async function lbPush(){
  try{
    if(!SESS||!P||SB.legacy)return;
    await fetch(SB.url+'/rest/v1/leaderboard?on_conflict=player_id,slot',{method:'POST',
      headers:{apikey:SB.key,Authorization:'Bearer '+SESS.access_token,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},
      body:JSON.stringify({player_id:SESS.user.id,slot:SLOT,name:pName(),cls:P.cls,lv:P.lv,power:power(),updated_at:new Date().toISOString()})});
  }catch(e){}
}
// ลงทะเบียนแถวอันดับของตัวเองทันทีที่เข้าเล่น (ไม่ต้องรอเซฟขึ้นคลาวด์) -> ทุกคนที่เคยเข้าเล่นมีชื่ออยู่ในตาราง ไม่ว่าตอนนี้ออนไลน์หรือไม่
setInterval(()=>{if(typeof SESS!=='undefined'&&SESS&&typeof P!=='undefined'&&P&&window._lbSlot!==SLOT){window._lbSlot=SLOT;lbPush()}},3000);
const LB_EVERY=300000;   // อันดับอัปเดตทุก 5 นาที
function lbCycle(){
  if(typeof SESS==='undefined'||!SESS||typeof P==='undefined'||!P)return;
  lbPush();   // ส่งพลังรบล่าสุดของเรา แล้วดึงอันดับใหม่
  window.lbFetch().then(()=>{try{const w=$('winRank');if(w&&w.style.display==='block'&&typeof refreshRank==='function')refreshRank()}catch(e){}});
}
setInterval(lbCycle,LB_EVERY);
setTimeout(lbCycle,8000);   // ครั้งแรกหลังเข้าเกมไม่นาน
window.lbFetch=async function(){
  if(!SESS)return;window._lbBusy=true;window._lbAt=Date.now();
  try{await ensureFresh();window.LB_ROWS=await sb('/rest/v1/leaderboard?select=player_id,slot,name,cls,lv,power&order=power.desc&limit=200')||[]}
  catch(e){window.LB_ROWS=window.LB_ROWS||[]}
  window._lbBusy=false;
};
const _saveOnline=save;
save=function(manual){
  _saveOnline(manual);
  if(NOSAVE||!SESS)return;
  if(manual||Date.now()-CLOUD.last>20000){cloudPush(false);if(manual)say('บันทึกขึ้นคลาวด์แล้ว ☁','#9be58a')}
};
addEventListener('pagehide',()=>{if(P&&SESS&&!NOSAVE)cloudPush(true)});
addEventListener('visibilitychange',()=>{if(document.hidden&&P&&SESS&&!NOSAVE)cloudPush(true)});

async function syncAfterLogin(){
  const uid=SESS.user.id,owner=localStorage.getItem(OWNER_KEY);
  if(owner&&owner!==uid)for(let s=1;s<=CHAR_SLOTS;s++)localStorage.removeItem(slotKey(s));   // เซฟในเครื่องเป็นของบัญชีอื่น
  await ensureFresh();
  const q=`/rest/v1/${SB.table}?player_id=eq.${encodeURIComponent(uid)}`;
  let rows;
  try{rows=await sb(q+'&select=slot,save_data,updated_at');SB.legacy=false}
  catch(e){if(!noSlotCol(e))throw e;SB.legacy=true;rows=(await sb(q+'&select=save_data,updated_at')||[]).map(r=>Object.assign({slot:1},r))}
  const push=[];
  for(let s=1;s<=CHAR_SLOTS;s++){
    const k=slotKey(s),row=(rows||[]).find(r=>(r.slot||1)===s),cloud=row&&row.save_data;
    let local=null;try{local=JSON.parse(localStorage.getItem(k)||'null')}catch(e){}
    if(cloud&&cloud.cls){
      if(local&&owner===uid&&(local.t||0)>(cloud.t||0))push.push(s);   // เล่นออฟไลน์ไว้ใหม่กว่า -> ใช้ของเครื่อง แล้วอัปขึ้น
      else localStorage.setItem(k,JSON.stringify(cloud));
    }else if(local&&local.cls&&(!owner||owner===uid)&&!(SB.legacy&&s>1))push.push(s);   // ยังไม่มีบนคลาวด์: ผูกเซฟในเครื่องเข้าบัญชีนี้
    else if(!(SB.legacy&&s>1))localStorage.removeItem(k);
  }
  localStorage.setItem(OWNER_KEY,uid);CLOUD.at=Date.now();CLOUD.ok=true;
  const cur=SLOT;for(const s of push){setSlot(s);await cloudPush(false)}setSlot(cur);
}
// ฐานข้อมูลเก่า (ไม่มีคอลัมน์ slot): สร้างได้แค่ช่องแรก
slotLock=function(s){return SB.legacy&&s>1?'เปิดใช้ช่องที่ 2 ไม่ได้: ผู้ดูแลต้องรัน tools/supabase_setup.sql เวอร์ชันใหม่ใน Supabase ก่อน':''};

/* ---------- หน้าล็อกอิน ---------- */
let AUTHNEXT=null,AUTHMODE='login';
(function(){
  const s=document.createElement('style');s.textContent=`
#authUI{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;flex-direction:column;gap:14px;padding:16px;background:radial-gradient(ellipse at 50% 30%,#223a74,#0a1030 75%);overflow:auto}
#authUI h1{margin:0;font-size:clamp(28px,6vw,46px);color:#ffe28a;text-shadow:3px 3px 0 #5a3a08,6px 6px 0 #000;letter-spacing:3px}
#authBox{width:min(380px,94vw);padding:0 0 16px;background:linear-gradient(#15224f,#0b1330);border:3px solid #d4af37;border-radius:12px;box-shadow:inset 0 0 0 2px #070c20,0 10px 36px rgba(0,0,0,.65)}
#authBox .ah{padding:10px;text-align:center;font-size:17px;font-weight:bold;color:#fff;background:linear-gradient(#2a4090,#17285f);border-bottom:3px solid #d4af37;border-radius:9px 9px 0 0;text-shadow:0 2px 0 #0a1030}
#authBox .ab{padding:14px 16px 0;display:flex;flex-direction:column;gap:10px}
#authBox label{font-size:12px;color:#c8d4f0;display:block;margin-bottom:3px}
#authBox input{width:100%;padding:10px;font-size:15px;color:#fff;background:#0a1230;border:2px solid #2e528f;border-radius:7px;outline:none;user-select:text;-webkit-user-select:text}
#authBox input:focus{border-color:#d4af37}
#authBox .go{padding:11px;font-size:16px;font-weight:bold;color:#fff;background:linear-gradient(#4a82f0,#1c47b4);border:2px solid #e0bf5a;border-radius:8px;box-shadow:inset 0 2px 0 #8db4ff,0 2px 0 #000;text-shadow:0 1px 0 #0a1a50}
#authBox .go:disabled{opacity:.5}
#authBox .sw{background:none;border:0;color:#9fc0ff;font-size:13px;text-decoration:underline;padding:4px}
#authErr{min-height:18px;font-size:13px;color:#ff9d9a;text-align:center}
#authMsg{font-size:12px;color:#ffe28a;text-align:center;max-width:380px;line-height:1.5}`;
  document.head.appendChild(s);
  const d=document.createElement('div');d.id='authUI';
  d.innerHTML=`<h1>MEADOW QUEST</h1><div id="authMsg">เข้าสู่ระบบเพื่อเล่นออนไลน์ — ตัวละครของคุณจะถูกเก็บบนคลาวด์ เล่นข้ามเครื่องได้</div>
  <div id="authBox"><div class="ah" id="authTitle">เข้าสู่ระบบ</div><div class="ab">
    <div><label>ID (ตัวอังกฤษ/ตัวเลข 3-20 ตัว)</label><input id="aEmail" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="40" placeholder="ตั้ง ID ของคุณ เช่น hero123"></div>
    <div><label>รหัสผ่าน (อย่างน้อย 6 ตัว)</label><input id="aPass" type="password" autocomplete="current-password" placeholder="••••••"></div>
    <div id="authErr"></div>
    <button class="go" id="aGo">เข้าสู่ระบบ</button>
    <button class="sw" id="aSw">ยังไม่มีบัญชี? สมัครสมาชิก</button></div></div>`;
  document.body.appendChild(d);
})();
function authMode(m){
  AUTHMODE=m;$('authTitle').textContent=m==='login'?'เข้าสู่ระบบ':'สมัครสมาชิก';$('aGo').textContent=m==='login'?'เข้าสู่ระบบ':'สมัครและเริ่มเล่น';
  $('aSw').textContent=m==='login'?'ยังไม่มีบัญชี? สมัครสมาชิก':'มีบัญชีแล้ว? เข้าสู่ระบบ';$('authErr').textContent='';
  $('aPass').autocomplete=m==='login'?'current-password':'new-password';
}
async function authSubmit(){
  const uname=$('aEmail').value.trim().toLowerCase(),pw=$('aPass').value,err=$('authErr'),btn=$('aGo');
  if(!uname||!pw){err.style.color='#ff9d9a';err.textContent='กรอก ID และรหัสผ่านก่อน';return}
  if(AUTHMODE==='signup'&&!/^[a-z0-9_.-]{3,20}$/.test(uname)){err.style.color='#ff9d9a';err.textContent='ID ต้องเป็นตัวอังกฤษหรือตัวเลข (ใช้ _ . - ได้) ยาว 3-20 ตัว ห้ามเว้นวรรค';return}
  if(AUTHMODE==='login'&&!/^[a-z0-9_.@+-]{3,80}$/.test(uname)){err.style.color='#ff9d9a';err.textContent='ID ไม่ถูกต้อง';return}
  const email=userToEmail(uname);
  btn.disabled=true;err.textContent='';err.style.color='#ffe28a';err.textContent='กำลังดำเนินการ...';
  try{
    let j;
    if(AUTHMODE==='signup'){
      j=await sb('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password:pw})},false);
      if(!j.access_token){   // เปิด Confirm email ไว้ -> ยังไม่มีเซสชัน
        err.style.color='#ffe28a';err.textContent='สมัครแล้ว แต่ระบบยังเปิดให้ยืนยันอีเมลอยู่ — ให้ผู้ดูแลปิด "Confirm email" ใน Supabase (Authentication → Providers → Email) แล้วลองเข้าสู่ระบบ';btn.disabled=false;authMode('login');return}
    }else j=await sb('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password:pw})},false);
    SESS=sessFrom(j);saveSess();
    err.textContent='กำลังโหลดตัวละคร...';
    await syncAfterLogin();
    $('authUI').style.display='none';btn.disabled=false;$('aPass').value='';
    const n=AUTHNEXT;AUTHNEXT=null;if(n)n();
  }catch(e){err.style.color='#ff9d9a';err.textContent=e.msg||'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง';btn.disabled=false}
}
$('aGo').onclick=authSubmit;$('aSw').onclick=()=>authMode(AUTHMODE==='login'?'signup':'login');
$('aPass').addEventListener('keydown',e=>{if(e.key==='Enter')authSubmit()});
$('aEmail').addEventListener('keydown',e=>{if(e.key==='Enter')$('aPass').focus()});

/* ---------- ประตูก่อนเข้าเกม ---------- */
const _buildStartOnline=buildStart;
buildStart=function(){
  loadSess();
  const go=()=>{$('start').style.display='';_buildStartOnline();setTimeout(cloudStatus,50)};
  const show=()=>{AUTHNEXT=go;authMode('login');$('authUI').style.display='flex';$('start').style.display='none';setTimeout(()=>$('aEmail').focus(),50)};
  if(!SESS){show();return}
  syncAfterLogin().then(go).catch(e=>{
    if(e&&e.net&&localStorage.getItem(OWNER_KEY)===SESS.user.id){CLOUD.ok=false;go();return}   // เน็ตหลุด: เล่นด้วยเซฟในเครื่องก่อน
    SESS=null;saveSess();show();
  });
};

/* ---------- ออกจากระบบ / ลบตัวละคร ---------- */
async function logout(){
  if(!confirm('ออกจากระบบ?\n(เซฟล่าสุดจะถูกอัปขึ้นคลาวด์ก่อน)'))return;
  try{if(P&&SESS)await cloudPush(false)}catch(e){}
  NOSAVE=true;clearInterval(saveTimer);
  try{for(let s=1;s<=CHAR_SLOTS;s++)localStorage.removeItem(slotKey(s));localStorage.removeItem(OWNER_KEY);localStorage.removeItem(SESS_KEY)}catch(e){}
  location.reload();
}
// ลบตัวละครช่อง s: ลบบนคลาวด์ก่อน (ตรวจว่าลบโดนจริง) แล้วค่อยลบในเครื่อง
const _delSlotLocal=deleteSlotData;
deleteSlotData=async function(s){
  try{
    if(SESS&&!(SB.legacy&&s>1)){
      await ensureFresh();
      const q=`/rest/v1/${SB.table}?player_id=eq.${encodeURIComponent(SESS.user.id)}`+(SB.legacy?'':`&slot=eq.${s}`);
      const had=await sb(q+'&select=player_id'),rows=await sb(q,{method:'DELETE',headers:{Prefer:'return=representation'}});
      if(had&&had.length&&!(rows&&rows.length)){   // มีแถวอยู่แต่ลบไม่โดน = ติดสิทธิ์ (ยังไม่มี policy ลบ)
        throw{msg:'ลบบนคลาวด์ไม่ได้ — ต้องเพิ่ม policy "ลบเซฟตัวเอง" ใน Supabase (รัน tools/supabase_setup.sql)'}}
    }
  }catch(e){alert((e&&e.msg)||'ลบบนคลาวด์ไม่สำเร็จ ลองใหม่อีกครั้ง');return false}
  return _delSlotLocal(s);
};

// ปุ่มออกจากระบบ + สถานะคลาวด์ในเมนู
(function(){
  const mb=document.querySelectorAll('#menuPanel .mg')[3];if(!mb)return;
  const row=mb.querySelector('.mb'),b=document.createElement('button');b.className='btn mi';b.id='bOut';b.innerHTML='<i>🚪</i><span>ออกจากระบบ</span><em>&nbsp;</em>';b.onclick=logout;row.appendChild(b);
  const st=document.createElement('div');st.id='cloudSt';st.className='small';st.style.cssText='margin-top:8px;padding-top:6px;border-top:1px solid #2e528f;color:#9fc0ff;line-height:1.5;word-break:break-all';
  document.getElementById('menuPanel').appendChild(st);
})();
setInterval(cloudStatus,15000);
