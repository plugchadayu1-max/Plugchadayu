/* ============ แชทโลก ============
   ตาราง chat_messages (Supabase) • ดึงข้อความใหม่ทุก ~4 วินาที (REST) • จำกัดความยาว/ความถี่ที่ฝั่งฐานข้อมูล
   ต้องโหลดหลัง f_online.js (ใช้ sb, SESS, ensureFresh) */

const CHT={last:0,first:true,busy:false,unread:0,lastSend:0,err:'',rows:[]};
/* ---------- ดูแลแชท: กรองคำหยาบ / ปิดเสียงผู้เล่น / รายงาน ---------- */
// กรองตอนแสดงผลทุกเครื่อง (แม้คนส่งเลี่ยงการกรองฝั่งตัวเอง คนอื่นก็ยังเห็นเป็น ***)
const BADW=['เหี้ย(?!มหาญ)','สัส','สัตว์นรก','ควย','หี(?![บ้่])','แตด','เย็ด','เงี่ยน','มึง','กู(?!้|ด|ล|เกิ้ล)','ไอ้สัส','อีดอก','ดอกทอง','ร่าน','ชาติหมา','พ่อมึง','แม่มึง','ส้นตีน','ตีน(?=มึง)','จัญไร','ระยำ','ไอ้เวร','อีเวร','กะหรี่','ส้นทีน',
  'fuck','shit','bitch','cunt','\\bdick\\b','pussy','nigg','\\bfag','whore','slut','asshole','motherf'];
const BADRE=new RegExp(BADW.slice().sort((a,b)=>b.length-a.length).join('|'),'gi');   // คำยาวก่อน: ไม่เหลือเศษตัวอักษร
const chatClean=s=>String(s).replace(BADRE,m=>'*'.repeat(Math.min(6,[...m].length)));
const MUTE_KEY='mq_mute';
let MUTED=[];try{MUTED=JSON.parse(localStorage.getItem(MUTE_KEY)||'[]')}catch(e){}
const isMuted=id=>MUTED.includes(id);
function chMute(id,name){
  if(isMuted(id))MUTED=MUTED.filter(x=>x!==id);else{if(!confirm(`ปิดเสียง ${name}?\nจะไม่เห็นข้อความของผู้เล่นนี้อีก (เปิดคืนได้ที่หน้าต่างแชท)`))return;MUTED.push(id)}
  try{localStorage.setItem(MUTE_KEY,JSON.stringify(MUTED))}catch(e){}
  refreshChat();
}
async function chReport(r){
  const why=prompt(`รายงานข้อความของ ${r.name}\n"${r.msg}"\n\nเหตุผล (เช่น คำหยาบ / สแปม / หลอกลวง):`,'คำหยาบ');
  if(why===null)return;
  try{await ensureFresh();await sb('/rest/v1/chat_reports',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({reporter:SESS.user.id,target:r.player_id,msg_id:r.id,name:r.name,msg:r.msg,reason:why.slice(0,60)})});
    say('ส่งรายงานแล้ว ขอบคุณที่ช่วยดูแลชุมชน','#9be58a')}
  catch(e){say(/too many/.test(JSON.stringify(e.raw||''))?'รายงานบ่อยเกินไป ลองใหม่ภายหลัง':/chat_reports|PGRST205/.test(JSON.stringify(e.raw||''))?'ระบบรายงานยังไม่เปิด (ผู้ดูแลต้องรัน supabase_setup.sql)':'ส่งรายงานไม่สำเร็จ','#ff9d9a')}
}
function chMenu(id){
  const r=CHT.rows.find(x=>x.id===id);if(!r)return;
  const m=$('chMenu');if(!m)return;
  m.innerHTML=`<b>${esc(chatClean(r.name))}</b><button onclick="chMute('${r.player_id}','${esc(r.name).replace(/'/g,'')}')">🔇 ปิดเสียงผู้เล่นนี้</button><button onclick="chReport(CHT.rows.find(x=>x.id===${id}))">🚩 รายงานข้อความ</button><button onclick="$('chMenu').style.display='none'">ยกเลิก</button>`;
  m.style.display='flex';
}
const chatOn=()=>!!(SESS&&P&&P.dx);
const chatName=()=>`${(P.dx.nick||'ไร้นาม')}·Lv${P.lv}`;

(function(){
  const d=document.createElement('div');d.id='winChat';d.className='win panel sm';
  d.style.cssText='z-index:6;left:10px;bottom:10px;top:auto;transform:none;width:min(380px,96vw);padding-bottom:10px';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`
#chList{height:min(34vh,230px);overflow:auto;padding:6px 8px;background:#0a1230;border:1px solid #2e528f;border-radius:7px;font-size:13px;line-height:1.45;user-select:text;-webkit-user-select:text;word-break:break-word}
#chList div{margin-bottom:3px}#chList .tm{color:#6f86b8;font-size:10px;margin-right:4px}#chList b{color:#9fc0ff}#chList .me b{color:#ffe28a}#chList .sys{color:#9aa3c8;font-size:12px}
#chRow{display:flex;gap:6px;margin-top:8px}#chIn,#chNick{flex:1;min-width:0;padding:9px;font-size:14px;color:#fff;background:#0a1230;border:2px solid #2e528f;border-radius:7px;outline:none;user-select:text;-webkit-user-select:text}
#chIn:focus,#chNick:focus{border-color:#d4af37}#chErr{min-height:16px;font-size:12px;color:#ff9d9a;margin-top:4px}
#bChatQ{position:relative}
#chList .op{float:right;margin-left:6px;padding:0 5px;color:#6f86b8;cursor:pointer;text-decoration:none;border-radius:4px}#chList .op:hover{color:#fff;background:#2e528f}
#winChat{position:fixed}#chMenu{display:none;position:absolute;inset:40px 10px auto 10px;z-index:2;flex-direction:column;gap:6px;padding:10px;background:#0f1a3a;border:2px solid #d4af37;border-radius:9px;box-shadow:0 6px 18px rgba(0,0,0,.6)}
#chMenu b{color:#ffe28a;text-align:center}#chMenu button{padding:8px;font-size:14px}
#chOnline{font-size:11px;color:#8be07a;font-weight:normal;margin-left:8px}
#chMuted{font-size:11px;color:#9aa3c8;margin-top:4px}#chMuted a{color:#9fc0ff;cursor:pointer;text-decoration:underline;margin-left:4px}`;
  document.head.appendChild(s);
  // ปุ่มแชทที่แถบบน (เห็นตลอด มีเลขข้อความที่ยังไม่อ่าน)
  const top=$('top'),m=$('bMenu');
  if(top&&m){const b=document.createElement('button');b.className='btn';b.id='bChatQ';b.innerHTML='<i>💬</i><span>แชท</span>';b.onclick=()=>toggleWin('winChat');top.insertBefore(b,m)}
  const bb=$('bChat');if(bb)bb.onclick=()=>toggleWin('winChat');
})();

function chAdd(r,mine){
  if(isMuted(r.player_id)||CHT.rows.some(x=>x.id===r.id))return;
  CHT.rows.push(r);if(CHT.rows.length>120)CHT.rows.shift();
  const l=$('chList');if(!l||$('winChat').style.display!=='block')return;
  const near=l.scrollTop+l.clientHeight>=l.scrollHeight-30;l.appendChild(chLine(r));
  while(l.children.length>120)l.firstChild.remove();
  if(near||mine)l.scrollTop=l.scrollHeight;
}
function chLine(r){
  const me=SESS&&r.player_id===SESS.user.id,d=document.createElement('div');if(me)d.className='me';
  const t=new Date(r.created_at),tm=document.createElement('span');tm.className='tm';tm.textContent=t.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'});
  const b=document.createElement('b');b.textContent=chatClean(r.name);const x=document.createTextNode(': '+chatClean(r.msg));   // textContent เท่านั้น กันแทรก HTML
  d.append(tm,b,x);
  if(!me){const o=document.createElement('a');o.className='op';o.textContent='⋯';o.title='ปิดเสียง / รายงาน';o.onclick=()=>chMenu(r.id);d.append(o)}
  return d;
}
function chErrMsg(e){
  const m=(e&&(e.raw&&(e.raw.message||e.raw.hint)||e.msg))||'ส่งไม่ได้';
  if(/too fast/.test(m))return 'ส่งเร็วเกินไป รอสักครู่';
  if(/name not owned/.test(m)){if(typeof nameEnsure==='function')nameEnsure();return 'ชื่อนี้เป็นของผู้เล่นคนอื่น (หรือฐานข้อมูลยังเป็นแบบเก่า) — เปลี่ยนชื่อตัวละคร หรือให้ผู้ดูแลรัน tools/fix_chat_slots.sql'}if(/bad length/.test(m))return 'ข้อความต้องยาว 1-120 ตัวอักษร';
  if(/chat_messages|schema cache|PGRST205|relation/.test(m))return 'ยังไม่ได้สร้างตารางแชทใน Supabase (รัน tools/supabase_setup.sql)';
  return m;
}
async function chPoll(){
  if(!chatOn()||CHT.busy||document.hidden)return;CHT.busy=true;
  try{
    await ensureFresh();
    const q=CHT.last?`&id=gt.${CHT.last}&order=id.asc&limit=60`:'&order=id.desc&limit=40';
    let rows=await sb(`/rest/v1/chat_messages?select=id,created_at,player_id,name,msg${q}`)||[];
    rows.sort((a,b)=>a.id-b.id);   // เก่า -> ใหม่ เสมอ (ไม่พึ่งลำดับที่เซิร์ฟเวอร์ส่งมา)
    const open=$('winChat').style.display==='block';
    for(const r of rows){
      if(r.id<=CHT.last)continue;CHT.last=r.id;chAdd(r,false);
      if(!CHT.first&&r.player_id!==SESS.user.id&&!isMuted(r.player_id)){
        if(!open){CHT.unread++;say(`💬 ${chatClean(r.name)}: ${chatClean(r.msg)}`,'#bfe3ff')}
        else if(typeof sfx==='function')sfx('click');
      }
    }
    CHT.first=false;CHT.err='';
  }catch(e){CHT.err=chErrMsg(e)}
  CHT.busy=false;chBadge();
}
function chBadge(){
  const b=$('bChatQ'),m=$('bChat');
  if(b)b.classList.toggle('badge',CHT.unread>0);if(m)m.classList.toggle('badge',CHT.unread>0);
}
async function chSetNick(){
  const v=($('chNick').value||'').trim().replace(/\s+/g,' ');
  const er=typeof nameErr==='function'?nameErr(v):(v.length<2||v.length>12?'ชื่อต้องยาว 2-12 ตัวอักษร':'');
  if(er){$('chErr').textContent=er;return}
  $('chErr').textContent='กำลังตรวจชื่อ...';
  const e2=typeof nameCheck==='function'?await nameCheck(v):'';if(e2){$('chErr').textContent=e2;return}
  P.dx.nick=v;save(false);refreshChat();setTimeout(()=>{const i=$('chIn');i&&i.focus()},50);
}
async function chSend(){
  const el=$('chIn');if(!el||!chatOn())return;const t=el.value.trim();if(!t)return;
  if(Date.now()-CHT.lastSend<1500){$('chErr').textContent='ส่งเร็วเกินไป รอสักครู่';return}
  CHT.lastSend=Date.now();el.value='';$('chErr').textContent='';
  try{
    await ensureFresh();
    const r=await sb('/rest/v1/chat_messages',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({player_id:SESS.user.id,name:chatName(),msg:chatClean(t).slice(0,120)})});
    // ยังไม่ได้โหลดประวัติแชทครั้งแรก: อย่าขยับ last ไม่อย่างนั้นข้อความเก่าจะไม่ถูกโหลด
    chSend._retry=0;const row=r&&r[0];if(row){if(!CHT.first)CHT.last=Math.max(CHT.last,row.id);chAdd(row,true)}
  }catch(e){
    $('chErr').textContent=chErrMsg(e);el.value=t;
    // ชื่อยังไม่ถูกจอง: จองแล้วลองส่งซ้ำอัตโนมัติ 1 ครั้ง
    if(!chSend._retry&&/name not owned/.test((e&&(e.raw&&(e.raw.message||e.raw.hint)||e.msg))||'')&&typeof nameCheck==='function'&&P.dx.nick){
      chSend._retry=1;try{await nameCheck(P.dx.nick)}catch(x){}
      CHT.lastSend=0;setTimeout(()=>chSend(),300);
    }
  }
}
function refreshChat(){
  const w=$('winChat');if(!w||w.style.display!=='block'||!P)return;
  CHT.unread=0;chBadge();
  let body;
  if(!SESS)body='<div class="small">ต้องล็อกอินออนไลน์ก่อนจึงจะแชทได้</div>';
  else if(!P.dx||!P.dx.nick)body=`<div class="small" style="margin-bottom:6px">ตั้งชื่อตัวละคร (2-12 ตัวอักษร) — ใช้ชื่อสุภาพ ห้ามแอบอ้างผู้อื่น</div>
    <div id="chRow"><input id="chNick" maxlength="12" placeholder="ชื่อตัวละคร"><button onclick="chSetNick()">ตกลง</button></div><div id="chErr"></div>`;
  else body=`<div id="chList"></div><div id="chRow"><input id="chIn" maxlength="120" placeholder="พิมพ์ข้อความ แล้วกด Enter..." autocomplete="off"><button onclick="chSend()">ส่ง</button></div><div id="chErr">${CHT.err||''}</div>
    <div class="small" style="opacity:.6;margin-top:2px">แชทโลก • เก็บข้อความ 3 วัน • กด ⋯ ท้ายข้อความเพื่อปิดเสียง/รายงาน</div>
    ${MUTED.length?`<div id="chMuted">🔇 ปิดเสียงไว้ ${MUTED.length} คน<a onclick="if(confirm('เปิดเสียงทุกคนที่ปิดไว้?')){MUTED=[];try{localStorage.setItem(MUTE_KEY,'[]')}catch(e){}refreshChat()}">เปิดทั้งหมด</a></div>`:''}<div id="chMenu"></div>`;
  const on=typeof ONLINE!=='undefined'&&ONLINE.n?`<span id="chOnline">🟢 ออนไลน์ ${ONLINE.n} คน</span>`:'<span id="chOnline"></span>';
  w.innerHTML=`<h3><span>💬 แชทโลก${on}</span><button class="x" onclick="toggleWin('winChat')">✕</button></h3>${body}`;
  const l=$('chList');if(l){for(const r of CHT.rows)if(!isMuted(r.player_id))l.appendChild(chLine(r));l.scrollTop=l.scrollHeight}
  // พิมพ์ในช่องแล้วต้องไม่ไปกดปุ่มลัดของเกม (WASD/1-4/Q/E ฯลฯ)
  for(const id of ['chIn','chNick']){
    const i=$(id);if(!i)continue;
    i.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();id==='chIn'?chSend():chSetNick()}else if(e.key==='Escape'){toggleWin('winChat')}});
    i.addEventListener('keyup',e=>e.stopPropagation());
  }
  setTimeout(()=>{const i=$('chIn')||$('chNick');if(i&&!TOUCH)i.focus()},60);
  chPoll();
}
WINX.winChat=refreshChat;
// Enter = เปิด/โฟกัสแชท
addEventListener('keydown',e=>{
  if(!P||e.key!=='Enter'||e.repeat)return;
  const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'))return;
  e.preventDefault();toggleWin('winChat');
});
// ดึงข้อความใหม่เป็นระยะ (เปิดหน้าต่างอยู่ถี่กว่า)
let chT=0;
REG.tick.push((dt)=>{
  if(!chatOn())return;chT-=dt;if(chT>0)return;
  chT=$('winChat').style.display==='block'?3:6;chPoll();
});
