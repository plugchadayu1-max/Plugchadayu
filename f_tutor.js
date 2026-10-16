/* ============ สอนเล่น (ครั้งแรก) ============
   Lv 2: สอนลงแต้มสถานะ  •  Lv 4: สอนเรียนสกิลใหม่ + อัปเลเวลสกิล
   ทำทีละขั้น: กล่องคำแนะนำ + กรอบเรืองแสงรอบปุ่มที่ต้องกด (ตามตำแหน่งปุ่มจริงทุกเฟรม)
   ขั้นถัดไปจะขึ้นเองเมื่อผู้เล่นทำขั้นนั้นเสร็จ • เคยดูแล้ว (P.dx.tut) จะไม่ขึ้นอีก • กด "ข้าม" ได้ตลอด
   ต้องโหลดหลัง f_depth.js (สร้าง P.dx) */

const TU={id:null,i:-1,p0:0,shown:-1};
const isOpen=id=>{const w=$(id);return !!w&&w.style.display==='block'};
const visEl=el=>{if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0?el:null};
// ปุ่มบนแถบด้านบน (จอเล็กปุ่มลัดถูกซ่อน -> ชี้ปุ่ม "เมนู" แทน)
const topBtn=(win,id)=>visEl(document.querySelector(`#top .q[onclick*="${win}"]`))||visEl($(id))||visEl($('bMenu'));
const statRow=()=>STAT_ROWS.find(r=>r[0]===CLASSES[P.cls].main)||STAT_ROWS[0];

const TUTS={
  stat:[
    {txt:()=>`🎉 <b>เลเวลอัป!</b> ทุกครั้งที่เลเวลขึ้นจะได้ <b>แต้มสถานะ 3 แต้ม</b> ไว้เพิ่มพลังให้ตัวละคร<br>มาลองลงแต้มกัน`,
     el:()=>topBtn('winChar','bChar'),btn:['เปิดหน้าต่างตัวละคร',()=>{CH.tab='stat';if(!isOpen('winChar'))toggleWin('winChar');else refreshChar()}],
     done:()=>isOpen('winChar')&&CH.tab==='stat'},
    {txt:()=>{const [k,n,d]=statRow();return `กดปุ่ม <b>+</b> ที่ <b>${n}</b> — ค่าหลักของ${CLASSES[P.cls].name} (${d})<br>
       ลงให้ครบ ${P.pts} แต้ม จะแบ่งไปค่าอื่นด้วยก็ได้ • ตัวเลข<span style="color:#ffb36b">สีส้ม</span>ด้านบน = ค่าที่ยังต่ำกว่าที่แนะนำ`},
     el:()=>{const i=STAT_ROWS.indexOf(statRow()),r=document.querySelectorAll('#winChar .srow')[i];return r&&r.querySelector('.pb')},
     back:()=>!isOpen('winChar')||CH.tab!=='stat',done:()=>P.pts<TU.p0||pendSum()>=P.pts},
    {txt:()=>`กด <b>ตกลง</b> เพื่อยืนยัน (กด "ยกเลิก" ถ้าอยากลงใหม่)`,
     el:()=>document.querySelector('#winChar .cbtn.ok'),
     back:()=>!isOpen('winChar')||(pendSum()===0&&P.pts>=TU.p0),done:()=>P.pts<TU.p0},
    {txt:()=>`✦ <b>เยี่ยมมาก!</b> ตัวละครแข็งแกร่งขึ้นแล้ว<br>เลเวลอัปครั้งต่อไป ถ้ามีแต้มเหลือจะเห็นป้าย <b style="color:#ffe28a">✦ แต้ม</b> ที่กรอบสถานะมุมซ้ายบน`,
     el:()=>visEl($('hPts'))||visEl($('hName')),btn:['เข้าใจแล้ว',()=>tuNext()]}
  ],
  skill:[
    {txt:()=>`✨ <b>Lv 4 แล้ว!</b> ตอนนี้<b>เรียนสกิลใหม่</b>ได้ และ<b>อัปเลเวลสกิล</b>ให้แรงขึ้นได้ (ใช้ Zeny)`,
     el:()=>topBtn('winSkill','bSkill'),btn:['เปิดหน้าต่างสกิล',()=>{if(!isOpen('winSkill'))toggleWin('winSkill')}],
     done:()=>isOpen('winSkill')},
    {txt:()=>{const s=CLASSES[P.cls].skills[1],c=skillCost(1,0),ok=P.zeny>=c;return `กด <b>เรียน</b> ที่ ${s.ic} <b>${s.n}</b><br>${SKILL_DESC[s.n]||''} • ราคา <b style="color:#f2c94c">${c} Zeny</b>`+
       (ok?'':`<br><span style="color:#ff9d9a">Zeny ยังไม่พอ (มี ${P.zeny}) — ล่ามอนสเตอร์เก็บเงินก่อน แล้วค่อยกลับมาเรียนที่หน้าต่างสกิล (K)</span>`)},
     el:()=>{const r=document.querySelectorAll('#winSkill .sr')[1];return r&&r.querySelector('.up')},
     btn:()=>P.zeny>=skillCost(1,0)?null:['ไว้ทีหลัง',()=>tuEnd()],
     back:()=>!isOpen('winSkill'),done:()=>P.skLv[1]>0},
    {txt:()=>{const s=CLASSES[P.cls].skills[0],lv=P.skLv[0]||1,c=skillCost(0,lv),ok=P.zeny>=c;return `อัปเลเวลสกิลแรก: กด <b>+</b> ที่ ${s.ic} <b>${s.n}</b><br>
       ดาเมจ ${skillPct(lv)}% → <span style="color:#6fdc6f">${skillPct(lv+1)}%</span> • ราคา <b style="color:#f2c94c">${c.toLocaleString()} Zeny</b>`+
       (ok?'':`<br><span style="color:#ff9d9a">Zeny ยังไม่พอ — เก็บเงินแล้วค่อยมาอัปทีหลังได้</span>`)},
     el:()=>{const r=document.querySelectorAll('#winSkill .sr')[0];return r&&r.querySelector('.up')},
     btn:['ไว้ทีหลัง',()=>tuNext()],back:()=>!isOpen('winSkill'),done:()=>(P.skLv[0]||1)>=2},
    {enter:()=>{if(isOpen('winSkill'))toggleWin('winSkill')},
     txt:()=>{const s=CLASSES[P.cls].skills[1];return `${s.ic} <b>${s.n}</b> อยู่ที่ปุ่มนี้ (คีย์บอร์ดกด <b>2</b>) • ใช้ ${s.sp} SP<br>
       สกิลใหม่ปลดล็อกเพิ่มที่ Lv ${SKILL_REQ[2]} • สกิลเลเวลสูงขึ้นต้องใช้เลเวลตัวละครสูงขึ้นด้วย`},
     el:()=>visEl(actEls.sk[1]),btn:['เข้าใจแล้ว',()=>tuNext()]}
  ]
};

(function(){
  const s=document.createElement('style');s.textContent=`
#tutH{position:fixed;z-index:69;pointer-events:none;display:none;border:3px solid #ffe28a;border-radius:12px;box-shadow:0 0 0 3px rgba(0,0,0,.35),0 0 18px 4px rgba(255,214,90,.85);animation:tutP 1s ease-in-out infinite}
@keyframes tutP{50%{box-shadow:0 0 0 3px rgba(0,0,0,.35),0 0 30px 10px rgba(255,214,90,.55);transform:scale(1.06)}}
#tutB{position:fixed;z-index:70;display:none;width:min(320px,calc(100vw - 24px));box-sizing:border-box;padding:12px 14px 10px;color:#eef3ff;font-size:14px;line-height:1.55;
  background:linear-gradient(#1b2d5c,#0f1a3a);border:2px solid #d4af37;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.55)}
#tutB .tt{font-size:12px;color:#ffe28a;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center}
#tutB .tt a{color:#9aa3c8;cursor:pointer;text-decoration:underline;font-size:12px}
#tutB .tb{display:flex;justify-content:flex-end;margin-top:8px}
#tutB .tb button{padding:7px 14px;font-size:14px;font-weight:bold;font-family:inherit;cursor:pointer;border-radius:8px;color:#2a1a00;background:linear-gradient(#ffe28a,#d4a017);border:2px solid #fff1b8}`;
  document.head.appendChild(s);
  for(const id of ['tutH','tutB']){const d=document.createElement('div');d.id=id;document.body.appendChild(d)}
})();

function tuStart(id){TU.id=id;TU.i=-1;TU.shown=-1;tuNext()}
function tuNext(){
  const T=TUTS[TU.id];if(!T)return;TU.i++;TU.p0=P.pts;
  if(TU.i>=T.length){tuEnd();return}
  const s=T[TU.i];if(s.enter)s.enter();
}
function tuEnd(){
  if(TU.id&&P&&P.dx){P.dx.tut=P.dx.tut||{};P.dx.tut[TU.id]=1;save(false)}
  TU.id=null;TU.i=-1;$('tutB').style.display='none';$('tutH').style.display='none';
}
function tuRender(s){
  const b=$('tutB'),T=TUTS[TU.id],btn=typeof s.btn==='function'?s.btn():s.btn;
  b.innerHTML=`<div class="tt"><span>📘 แนะนำการเล่น ${TU.i+1}/${T.length}</span><a onclick="tuEnd()">ข้าม</a></div><div>${s.txt()}</div>${btn?`<div class="tb"><button id="tutBtn">${btn[0]}</button></div>`:''}`;
  if(btn)$('tutBtn').onclick=btn[1];
  b.style.display='block';TU.shown=TU.i;TU.html=b.innerHTML;
}
// ตำแหน่งกล่อง: ใต้หรือเหนือปุ่มที่ชี้ (เลือกฝั่งที่มีที่ว่าง) • ไม่มีปุ่ม = กลางจอค่อนล่าง
function tuPlace(el){
  const b=$('tutB'),h=$('tutH'),bw=b.offsetWidth,bh=b.offsetHeight,W=innerWidth,H=innerHeight;
  if(!el){h.style.display='none';b.style.left=Math.round((W-bw)/2)+'px';b.style.top=Math.round(H*.62-bh/2)+'px';return}
  const r=el.getBoundingClientRect(),pad=5;
  Object.assign(h.style,{display:'block',left:r.left-pad+'px',top:r.top-pad+'px',width:r.width+pad*2+'px',height:r.height+pad*2+'px'});
  let x=r.left+r.width/2-bw/2,y=r.bottom+14;
  // ปุ่มอยู่ในหน้าต่าง: วางกล่องข้างหน้าต่าง ไม่บังเนื้อหา (จอแคบไม่มีที่ -> ใต้/เหนือปุ่มตามปกติ)
  const wnd=el.closest('[id^="win"]'),wr=wnd&&wnd.getBoundingClientRect();
  if(wr&&(wr.right+14+bw<=W-8||wr.left-14-bw>=8)){
    x=wr.right+14+bw<=W-8?wr.right+14:wr.left-bw-14;y=r.top+r.height/2-bh/2;
    b.style.left=Math.round(x)+'px';b.style.top=Math.round(Math.max(8,Math.min(H-bh-8,y)))+'px';return;
  }
  if(y+bh>H-8)y=r.top-bh-14;
  if(y<8)y=Math.min(H-bh-8,Math.max(8,r.top+r.height/2-bh/2)),x=r.left>W/2?r.left-bw-14:r.right+14;   // ไม่มีที่บน/ล่าง -> วางข้างๆ
  b.style.left=Math.round(Math.max(8,Math.min(W-bw-8,x)))+'px';b.style.top=Math.round(Math.max(8,Math.min(H-bh-8,y)))+'px';
}
function tuTick(){
  if(!P||!P.dx)return;
  const tut=P.dx.tut||{};
  if(!TU.id){
    if(P.hp<=0||P.dying>0)return;
    if(!tut.stat&&P.lv>=2&&P.lv<=5&&P.pts>0)tuStart('stat');
    else if(!tut.skill&&P.lv>=4&&P.lv<=9&&!P.skLv[1])tuStart('skill');
    else return;
  }
  const T=TUTS[TU.id];let s=T[TU.i];if(!s)return;
  if(s.done&&s.done()){tuNext();s=T[TU.i];if(!TU.id||!s)return}
  else if(s.back&&s.back()){TU.i=-1;tuNext();s=T[TU.i]}
  if(TU.shown!==TU.i||$('tutB').innerHTML!==TU.html)tuRender(s);
  // อัปเดตข้อความที่มีตัวเลขเปลี่ยน (แต้มที่เหลือ / Zeny) โดยไม่ทำปุ่มหาย
  else{const d=$('tutB').children[1],t=s.txt();if(d&&d.innerHTML!==t){d.innerHTML=t;TU.html=$('tutB').innerHTML}}
  tuPlace(s.el&&visEl(s.el()));
}
REG.tick.push(tuTick);
