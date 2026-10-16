/* ---------- ดูตัวละครผู้เล่นอื่น ----------
   แตะผู้เล่นในแมพ → เมนู "👁 ดูตัวละคร" → ส่งคำขอเข้ากล่องจดหมายของอีกฝ่าย (mq-user-<uid>) → อีกฝ่ายตอบกลับสถานะ/อุปกรณ์ที่สวมอยู่
   ปิดไม่ให้คนอื่นดูได้ที่ปุ่ม 👁 แถบบน • ข้อมูลที่รับมาตรวจทุกช่องก่อนแสดง (ช่อง Realtime เป็นสาธารณะ) ต้องโหลดหลัง f_social.js */
(function(){
  const KEY='mq_inspect_ok';
  let ALLOW=true;try{ALLOW=localStorage.getItem(KEY)!=='0'}catch(e){}
  const lastReq=new Map();let pending=null;
  const num=(v,a,b)=>Math.min(b,Math.max(a,Math.round(+v||0)));
  const E=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const STN={atk:'โจมตี',def:'ป้องกัน',hp:'HP',sp:'SP',crit:'คริ%',spd:'ความเร็ว'};

  // ----- ฝั่งถูกดู: ตอบกลับ -----
  window.inspectReq=function(p){
    if(!ALLOW||!P||!p||typeof p.uid!=='string'||!/^[0-9a-f-]{36}$/i.test(p.uid))return;
    const now=Date.now();if(now-(lastReq.get(p.uid)||0)<3000)return;lastReq.set(p.uid,now);
    const eq=[];for(const s of Object.keys(SLOTS)){const it=P.eq&&P.eq[s];if(!it||!it.st)continue;
      eq.push({s,n:String(it.name||'').slice(0,24),r:num(it.rar,0,3),l:num(it.lv,1,200),p:num(it.plus,0,15),c:it.cls||'',st:Object.fromEntries(Object.keys(it.st).filter(k=>STN[k]).map(k=>[k,num(effSt(it,k),0,99999)]))})}
    sendTo(p.uid,'inspectres',{id:p.id||'',name:pName(),cls:P.cls,job:P.name,lv:P.lv,rb:P.rb||0,sty:P.sty||null,
      stats:{str:P.stats.str,agi:P.stats.agi,vit:P.stats.vit,int:P.stats.int},gs:P.gs,hp:maxHp(),sp:maxSp(),atk:atkPow(),pow:power(),eq});
  };
  // ----- ฝั่งดู: ขอ + แสดง -----
  window.inspectAsk=function(k){
    $('socPop').style.display='none';const o=SOC.others.get(k);if(!o||!SOC.rt)return;
    if(!/^[0-9a-f-]{36}$/i.test(o.uid||'')){say('ดูตัวละครคนนี้ไม่ได้','#ff9d9a');return}
    pending={uid:o.uid,name:o.name,t:Date.now()};
    sendTo(o.uid,'inspect',{uid:SESS.user.id,id:meKey()});
    toast('👁 กำลังขอดูตัวละคร '+o.name+'...');
    setTimeout(()=>{if(pending&&Date.now()-pending.t>=7000){pending=null;say('ไม่ได้รับข้อมูล — ผู้เล่นอาจปิดการดูตัวละคร หรือออฟไลน์อยู่','#ffb36b')}},7200);
  };
  window.inspectRes=function(p){
    if(!pending||!p||typeof p!=='object'||!CLASSES[p.cls])return;pending=null;
    const rec=Array.isArray(p.eq)?p.eq.slice(0,8).filter(e=>e&&SLOTS[e.s]).map(e=>({s:e.s,n:String(e.n||'').slice(0,24),r:num(e.r,0,3),l:num(e.l,1,200),p:num(e.p,0,15),
      c:CLASSES[e.c]?e.c:p.cls,st:e.st&&typeof e.st==='object'?Object.fromEntries(Object.keys(STN).filter(k=>e.st[k]!=null).map(k=>[k,num(e.st[k],0,99999)])):{}})):[];
    const D={name:cleanName2(p.name),cls:p.cls,job:String(p.job||'').slice(0,20),lv:num(p.lv,1,200),rb:num(p.rb,0,99),
      stats:Object.fromEntries(['str','agi','vit','int'].map(k=>[k,num(p.stats&&p.stats[k],0,99999)])),hp:num(p.hp,0,9999999),sp:num(p.sp,0,9999999),atk:num(p.atk,0,9999999),pow:num(p.pow,0,99999999),
      gs:Object.fromEntries(Object.keys(STN).map(k=>[k,num(p.gs&&p.gs[k],0,99999)])),eq:rec,sty:p.sty&&typeof p.sty==='object'?p.sty:null};
    showInspect(D);
  };
  function portrait(D){
    const c=document.createElement('canvas');c.width=c.height=96;const g=c.getContext('2d');
    try{const S=SHEETS[CLASSES[D.cls].sprite];if(S){const set=S.anims.idle,fr=(set.front||set.right||set.all||Object.values(set)[0])[0],k=Math.min(96/S.cw,96/S.ch)*(S.scale?1:1);
      const w=S.cw*k,h=S.ch*k;g.imageSmoothingEnabled=!S.pixel;g.drawImage(S.im,(fr%S.cols)*S.cw,Math.floor(fr/S.cols)*S.ch,S.cw,S.ch,(96-w)/2,96-h,w,h)}}catch(e){}
    return c.toDataURL();
  }
  function showInspect(D){
    let w=$('winIns');
    if(!w){w=document.createElement('div');w.id='winIns';w.className='win panel';w.style.zIndex=45;document.body.appendChild(w);
      const st=document.createElement('style');st.textContent=`#winIns .ih{display:flex;gap:10px;align-items:center}#winIns .ih img{width:84px;height:84px;object-fit:contain;background:#10142a;border:2px solid #39406a;border-radius:8px;image-rendering:auto}
#winIns .eqg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}#winIns .eqs{position:relative;aspect-ratio:1;background:#10142a;border:2px solid #39406a;border-radius:6px;display:flex;align-items:center;justify-content:center}
#winIns .eqs img{width:80%;height:80%;object-fit:contain}#winIns .eqs i{position:absolute;right:2px;bottom:0;font-size:10px;font-style:normal;color:#fff;text-shadow:0 0 3px #000}#winIns .eqs.empty{opacity:.35}
#winIns .sg{display:grid;grid-template-columns:repeat(2,1fr);gap:2px 10px;font-size:13px;margin-top:6px}`;document.head.appendChild(st)}
    const cl=CLASSES[D.cls],eqm=Object.fromEntries(D.eq.map(e=>[e.s,e]));
    const slot=s=>{const e=eqm[s];if(!e)return `<div class="eqs empty" title="${E(SLOTS[s].n)}"><img src="${iconURL(SLOTS[s].ic,0)}"></div>`;
      const it={slot:s,rar:e.r,cls:e.c,kind:'equip'},col=RAR[e.r].g,tip=`${e.p?'+'+e.p+' ':''}${e.n} (Lv${e.l})\n`+Object.keys(e.st).map(k=>`${STN[k]} +${e.st[k]}`).join(' • ');
      return `<div class="eqs" style="border-color:${col}" title="${E(tip)}"><img src="${itemIcon(it)}">${e.p?`<i>+${e.p}</i>`:''}</div>`};
    const sg=['str','agi','vit','int'].map(k=>`<div>${{str:'STR',agi:'AGI',vit:'VIT',int:'INT'}[k]} <b>${D.stats[k]}</b></div>`).join('')+
      `<div>HP <b>${D.hp.toLocaleString()}</b></div><div>SP <b>${D.sp.toLocaleString()}</b></div><div>พลังโจมตี <b>${D.atk.toLocaleString()}</b></div><div>ป้องกัน <b>${D.gs.def}</b></div><div>คริติคอล <b>${D.gs.crit}%</b></div><div>ความเร็ว <b>+${D.gs.spd}</b></div>`;
    w.innerHTML=`<h3><span>👁 ตัวละครของ ${E(D.name)}</span><button class="x" onclick="$('winIns').style.display='none'">✕</button></h3>
      <div class="ih"><img src="${portrait(D)}"><div><b style="font-size:16px">${E(D.name)}</b><br><span class="small">${E(D.job||cl.name)} • ${E(cl.name)}</span><br>Lv <b>${D.lv}</b>${D.rb?` • 🌟 จุติ ${D.rb} ครั้ง`:''}<br><span class="small">พลังรวม ${D.pow.toLocaleString()}</span></div></div>
      <div class="sg">${sg}</div>
      <div class="small" style="margin-top:8px">อุปกรณ์ที่สวมอยู่</div>
      <div class="eqg">${SLOT_L.map(slot).join('')}${SLOT_R.map(slot).join('')}</div>`;
    ['winChar','winShop','winBag','winSkill','winQuest','winSmith','winWarp'].forEach(i=>{const e=$(i);if(e)e.style.display='none'});
    w.style.display='block';
  }
  // ----- ตั้งค่า: อนุญาตให้คนอื่นดูตัวละครเรา -----
  const b=document.createElement('button');b.className='btn';b.id='bIns';
  const paint=()=>{b.textContent=ALLOW?'👁':'🙈';b.style.opacity=ALLOW?1:.5;b.title=ALLOW?'ผู้อื่นดูตัวละครคุณได้ (แตะเพื่อปิด)':'ปิดไม่ให้ผู้อื่นดูตัวละคร (แตะเพื่อเปิด)'};
  b.onclick=()=>{ALLOW=!ALLOW;try{localStorage.setItem(KEY,ALLOW?'1':'0')}catch(e){}paint();toast(ALLOW?'👁 อนุญาตให้ผู้อื่นดูตัวละครของคุณ':'🙈 ปิดการดูตัวละครของคุณแล้ว')};
  paint();const ref=$('bShk');if(ref&&ref.parentNode)ref.parentNode.insertBefore(b,ref.nextSibling);
})();
