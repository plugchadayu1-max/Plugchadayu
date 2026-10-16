/* ---------- จุติ (Rebirth) ----------
   ถึง Lv200 → คุยกับ NPC "เทพีเอลิน" ในเมือง → รับเควสต์ตีมอนสเตอร์ 200 ตัว → กลับมาคุยเพื่อจุติ
   จุติ = รีเซ็ตเป็น Lv1 แต่ค่าสถานะ/แต้ม/อุปกรณ์/สกิล/อาชีพ/คลาสพิเศษคงเดิม */
(function(){
  const NEED=200,LV=()=>typeof MAX_LV==='number'?MAX_LV:200;
  const Q=()=>P&&P.rbq;
  // นับมอนสเตอร์ที่ฆ่าหลังรับเควสต์
  REG.kill.push(m=>{
    const q=Q();if(!q||q.st!==1)return;
    q.n=Math.min(NEED,(q.n||0)+1);
    if(q.n>=NEED){q.st=2;toast('🌟 เควสต์จุติ: ตีครบ 200 ตัวแล้ว! กลับไปหาเทพีเอลินในเมือง');say('🌟 ตีมอนสเตอร์ครบ 200 ตัว กลับไปคุยกับเทพีเอลินเพื่อจุติ','#ffe28a')}
    else if(q.n%50===0)say(`🌟 เควสต์จุติ ${q.n}/${NEED}`,'#ffe28a');
    if(typeof updateTracker==='function')try{updateTracker()}catch(e){}
  });
  window.rbState=()=>{const q=Q();return !P||P.lv<LV()&&!(q&&q.st)?0:(q&&q.st)||0}; // 0=ยังไม่รับ 1=ทำอยู่ 2=ตีครบ
  window.rbMark=()=>{if(!P)return '';const q=Q();if(q&&q.st===2)return '✔';if(q&&q.st===1)return '…';return P.lv>=LV()?'❗':''};
  function render(){
    const w=$('winRb');if(!w||w.style.display!=='block')return;
    const q=Q(),n=(P.rb||0)+1;let body='';
    if(q&&q.st===2){
      body=`<div class="small" style="margin-bottom:8px">“เจ้าผ่านบททดสอบแล้ว… พร้อมจะเกิดใหม่หรือยัง”</div>
        <div class="small">จุติครั้งที่ ${n}: เลเวลกลับเป็น Lv 1 (EXP เริ่มใหม่)<br>ค่าสถานะ แต้มสถานะ อุปกรณ์ สกิล อาชีพ และคลาสพิเศษ <b style="color:#9be58a">ยังอยู่คงเดิม</b></div>
        <div style="text-align:center;margin-top:10px"><button onclick="doRebirth()" style="font-size:16px;padding:9px 26px;background:#7a3ab8;color:#fff">🌟 จุติ</button></div>`;
    }else if(q&&q.st===1){
      body=`<div class="small" style="margin-bottom:8px">“ไปพิสูจน์พลังของเจ้า แล้วกลับมาหาข้า”</div>
        <div class="qr"><div class="qd"><b>บททดสอบแห่งการจุติ</b><br>ตีมอนสเตอร์ ${NEED} ตัว (นับทุกแมพ)<div class="qb"><i style="width:${Math.min(100,(q.n||0)/NEED*100)}%"></i></div><span class="small">${q.n||0}/${NEED}</span></div></div>`;
    }else if(P.lv<LV()){
      body=`<div class="small">“พลังของเจ้ายังไม่ถึงขีดสุด… กลับมาเมื่อถึง Lv ${LV()}”<br><br>เลเวลปัจจุบัน Lv ${P.lv}</div>`;
    }else{
      body=`<div class="small" style="margin-bottom:8px">“เจ้าถึงขีดสุดของเส้นทางแล้ว ข้าจะช่วยให้เจ้าเกิดใหม่ โดยพลังที่สั่งสมไว้จะไม่สูญหาย”</div>
        <div class="qr"><div class="qd"><b>บททดสอบแห่งการจุติ</b><br>ตีมอนสเตอร์ ${NEED} ตัว แล้วกลับมาหาข้า<br><span class="rw">รางวัล: สิทธิ์จุติ (Lv1 ค่าสถานะคงเดิม)</span></div></div>
        <div style="text-align:center;margin-top:10px"><button onclick="rbAccept()" style="font-size:15px;padding:8px 22px">รับเควสต์</button></div>`;
    }
    w.innerHTML=`<h3><span>🌟 เทพีเอลิน${P.rb?` • จุติแล้ว ${P.rb} ครั้ง`:''}</span><button class="x" onclick="toggleWin('winRb')">✕</button></h3><div class="winbody">${body}</div>`;
  }
  if(typeof WINX==='object')WINX.winRb=render;
  window.rbOpen=()=>{if($('winRb').style.display!=='block')toggleWin('winRb');else render()};
  window.rbAccept=()=>{if(!P||P.lv<LV()||(P.rbq&&P.rbq.st))return;P.rbq={st:1,n:0};say(`🌟 รับเควสต์จุติ: ตีมอนสเตอร์ ${NEED} ตัว`,'#ffe28a');render();try{updateTracker()}catch(e){}try{save(false)}catch(e){}};
  window.doRebirth=function(){
    const q=Q();if(!P||!q||q.st!==2)return;
    const n=(P.rb||0)+1;
    P.rb=n;P.rbq=null;P.lv=1;P.exp=0;
    P.hp=maxHp();P.sp=maxSp();
    try{recalcGear()}catch(e){}
    ring(P.x,P.y,140,'#ffe28a',.9);ring(P.x,P.y,90,'#ffffff',.7);burst(P.x,P.y-50,'#ffe28a',30);
    try{sfx('levelup')}catch(e){}
    toast(`🌟 จุติสำเร็จ! ครั้งที่ ${n}`);say(`🌟 จุติครั้งที่ ${n} — กลับเป็น Lv 1 ค่าสถานะยังอยู่คงเดิม`,'#ffe28a');
    try{refreshChar()}catch(e){}
    toggleWin('winRb');try{save(false)}catch(e){}
  };
})();
