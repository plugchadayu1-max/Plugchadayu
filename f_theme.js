/* ============ ธีม UI ใหม่ (น้ำเงินเข้ม + ทอง + กระดาษ) ============
   1) กรอบหน้าต่างทั้งหมด  2) เมนูแบบไอคอน  3) หน้าสร้างตัวละครแบบการ์ดกระดาษ  4) หน้าต่างแผนที่โลก (วาร์ป)
   โหลดเป็นไฟล์สุดท้าย — ใช้ CSS + แต่ง DOM เท่านั้น ไม่แตะตรรกะเกม */

const THEME_CSS=`
/* ---------- กรอบหน้าต่าง ---------- */
body .win.panel{background:linear-gradient(#15224f,#0b1330);border:3px solid #d4af37;border-radius:12px;
  box-shadow:inset 0 0 0 2px #070c20,inset 0 0 0 4px #6a5320,0 10px 36px rgba(0,0,0,.65);padding:14px;color:#f1ead6}
body .win h3{position:relative;justify-content:center;align-items:center;margin:-14px -14px 12px;padding:10px 46px;font-size:17px;color:#fff;
  background:linear-gradient(#2a4090,#17285f);border-bottom:3px solid #d4af37;border-radius:9px 9px 0 0;text-shadow:0 2px 0 #0a1030;box-shadow:inset 0 2px 0 #4f68c0}
body .win h3 span::before{content:'◆✦◆ ';color:#e8c25a;font-size:11px;letter-spacing:1px}
body .win h3 span::after{content:' ◆✦◆';color:#e8c25a;font-size:11px;letter-spacing:1px}
body .win h3 .x{position:absolute;right:9px;top:50%;transform:translateY(-50%);width:30px;height:30px;padding:0;border-radius:50%;
  background:radial-gradient(#2a3a78,#10194a);border:2px solid #d4af37;color:#fff;font-size:15px;line-height:1;box-shadow:0 2px 0 #000}
body .win h3 .x:hover{background:#7a2a2a}
body .win .small{opacity:.9}
/* ---------- ส่วนเนื้อหาภายใน ---------- */
body .sm .eqr,body .qr,body .st{background:linear-gradient(#112250,#0b1633);border:1px solid #2e528f;border-radius:7px;box-shadow:inset 0 1px 0 #3a64a8}
body .sm .eqr.cur,body .qr.done{border-color:#7cc85e;box-shadow:inset 0 0 0 1px #7cc85e}
body .sm .mat{background:#0a1230;border:1px solid #d4af37;border-radius:7px}
body .sm table.rk td{border-bottom:1px solid #223a68}
body .tabs2{gap:5px}
body .sm .tabs2 button,body .tabs2 button{padding:7px 0;background:linear-gradient(#1b2d68,#101c46);border:1px solid #2e528f;border-radius:7px;color:#a9b8e6;box-shadow:none;font-weight:bold}
body .sm .tabs2 button.on,body .tabs2 button.on{background:linear-gradient(#f0cd6a,#c9972c);color:#2a1c04;border-color:#fff1b8;box-shadow:inset 0 2px 0 #fff3c4,0 2px 0 #000}
body .sm button:not(.x):not(.on),body .qr button{padding:7px 12px;border-radius:7px;font-weight:bold;color:#fff;
  background:linear-gradient(#4a82f0,#1c47b4);border:2px solid #e0bf5a;box-shadow:inset 0 2px 0 #8db4ff,0 2px 0 #000;text-shadow:0 1px 0 #0a1a50}
body .sm button:not(.x):not(.on):hover,body .qr button:hover{filter:brightness(1.15)}
body .sm button:disabled,body .qr button:disabled{background:#3a4258;border-color:#6a7088;box-shadow:none;color:#8b93aa;text-shadow:none}
body .sm .tabs2 button{box-shadow:none;text-shadow:none}
body .sm .tabs2 button.on{box-shadow:inset 0 2px 0 #fff3c4,0 2px 0 #000}
body .win .sep{background:#2e528f}
body .winbody::-webkit-scrollbar{width:8px}body .winbody::-webkit-scrollbar-thumb{background:#d4af37;border-radius:4px}body .winbody::-webkit-scrollbar-track{background:#0a1230}
/* ---------- แถบบน + เมนูไอคอน ---------- */
#top>.btn{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:56px;padding:4px 8px 3px;gap:1px;border-radius:10px;
  background:linear-gradient(#22357a,#111d4c);border:2px solid #d4af37;box-shadow:inset 0 2px 0 #4f68c0,0 3px 0 rgba(0,0,0,.55)}
#top>.btn i,#menuPanel .btn i{font-style:normal;font-size:22px;line-height:1.1;filter:drop-shadow(0 2px 0 rgba(0,0,0,.6))}
#top>.btn span,#menuPanel .btn span{font-size:11px;line-height:1.2;white-space:nowrap}
#top>#bSnd{min-width:44px}
#bAuto.on{background:linear-gradient(#3d9a3a,#1d5a1e)!important;border-color:#b6f08a!important}
#menuPanel.panel{background:linear-gradient(#15224f,#0b1330);border:3px solid #d4af37;border-radius:12px;box-shadow:inset 0 0 0 2px #070c20,0 10px 30px rgba(0,0,0,.65);width:372px;padding:10px 10px 8px}
#menuPanel .mh{color:#ffe28a;font-size:12px;margin:8px 0 5px;border-bottom:1px solid #2e528f;letter-spacing:.5px}
#menuPanel .mb{grid-template-columns:repeat(4,1fr);gap:6px}
#menuPanel .btn.mi{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:2px;padding:6px 2px 5px;min-height:62px;border-radius:9px;
  background:linear-gradient(#1a2b66,#0f1a44);border:1px solid #2e528f;box-shadow:inset 0 1px 0 #3a64a8}
#menuPanel .btn.mi:hover{border-color:#d4af37;background:linear-gradient(#27408a,#152560)}
#menuPanel .btn.mi em{font-style:normal;font-size:9px;opacity:.55;line-height:1}
#menuPanel .btn.mi.danger{border-color:#7a2a2a;background:linear-gradient(#4a1a1a,#2a0e0e)}
@media (max-width:640px){#top>.btn{min-width:46px;padding:3px 5px 2px}#top>.btn i{font-size:18px}#top>.btn span{font-size:9px}#menuPanel.panel{width:min(350px,94vw)}}
/* ---------- หน้าเลือกอาชีพ ---------- */
#start{background:radial-gradient(ellipse at 50% 30%,#223a74,#0a1030 75%)}
#start h1{color:#ffe28a;text-shadow:3px 3px 0 #5a3a08,6px 6px 0 #000}
#startBanner{margin:0;padding:9px 56px;font-size:20px;font-weight:bold;color:#fff;letter-spacing:1px;background:linear-gradient(#2a4090,#17285f);border:3px solid #d4af37;border-radius:10px;text-shadow:0 2px 0 #0a1030;box-shadow:inset 0 2px 0 #4f68c0,0 4px 0 #000}
#startBanner::before{content:'◆✦◆  ';color:#e8c25a;font-size:12px}#startBanner::after{content:'  ◆✦◆';color:#e8c25a;font-size:12px}
#cards{background:linear-gradient(#f4ebd2,#e3d6b4);border:4px solid #d4af37;border-radius:14px;padding:20px;gap:16px;box-shadow:inset 0 0 0 3px #7a5a22,0 12px 40px rgba(0,0,0,.7);max-width:min(760px,96vw)}
body .card.panel{width:158px;padding:0 0 12px;background:linear-gradient(#fcf7e8,#ecdfbf);border:3px solid #7a5a22;border-radius:9px;color:#3a2a10;
  box-shadow:inset 0 0 0 2px #e8cf86,0 4px 0 rgba(0,0,0,.35);overflow:hidden}
body .card.panel:hover{box-shadow:inset 0 0 0 3px #1f3270,0 8px 0 rgba(0,0,0,.35);transform:translateY(-5px)}
.card canvas{display:block;margin:8px auto 4px;border-radius:50%;border:4px solid #d4af37;background:#e8dec0;width:112px!important;height:112px!important}
body .card b{margin:2px 10px 4px;padding:5px 0;color:#fff;font-size:15px;background:linear-gradient(#2a4090,#17285f);border:2px solid #d4af37;border-radius:7px;text-shadow:0 1px 0 #0a1030}
body .card .small{min-height:44px;padding:0 8px;color:#5a4a2a;opacity:1;font-size:12px}
body .card::after{content:'ตัวละครใหม่เริ่มที่ Lv.1';display:block;font-size:11px;color:#8a7a56;margin-top:2px}
/* ---------- หน้าเลือกตัวละคร (2 ช่อง) ---------- */
body .card.slot{width:190px}body .card.slot::after{content:none}
body .card.slot .small{min-height:36px}
.card.slot .plus{width:112px;height:112px;box-sizing:border-box;margin:8px auto 4px;border-radius:50%;border:4px dashed #b89a52;display:flex;align-items:center;justify-content:center;font-size:56px;color:#b89a52;background:#efe4c6}
body .card.slot.empty b{background:linear-gradient(#8a7444,#6a5530)}
body .card.slot.lock{opacity:.6;cursor:not-allowed}body .card.slot.lock:hover{transform:none}
.card.slot .sbtn{display:flex;gap:6px;padding:8px 10px 0}
.card.slot .sbtn button{font:inherit;font-weight:bold;cursor:pointer;border-radius:7px;padding:7px 0}
.card.slot .sbtn .go{flex:1;font-size:15px;color:#2a1a00;background:linear-gradient(#ffe28a,#d4a017);border:2px solid #7a5a22}
.card.slot .sbtn .del{width:40px;font-size:15px;color:#fff;background:linear-gradient(#b84a4a,#7a2a2a);border:2px solid #5a1a1a}
#bCont{margin-top:4px}
/* ---------- แผนที่โลก ---------- */
#winWarp{width:min(880px,97vw)}
#winWarp .wm{display:flex;gap:12px;align-items:stretch}
#winWarp .wmL{flex:1.25;min-width:0}
#winWarp .wmL canvas{display:block;width:100%;height:auto;border:3px solid #d4af37;border-radius:8px;background:#2a6490;image-rendering:auto;cursor:pointer;box-shadow:0 0 0 2px #070c20}
#winWarp .wmR{flex:1;min-width:230px;display:flex;flex-direction:column;gap:8px;padding:10px;background:linear-gradient(#0f1c46,#09112c);border:1px solid #2e528f;border-radius:9px}
#winWarp .wmR h4{margin:0;font-size:19px;color:#ffe28a}
#winWarp .tag{display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;font-size:11px;background:#0a1230;border:1px solid #2e528f;border-radius:10px}
#winWarp .chips{display:flex;flex-wrap:wrap;gap:4px;max-height:130px;overflow:auto}
#winWarp .chip{padding:3px 7px;font-size:11px;background:#112250;border:1px solid #2e528f;border-radius:6px;white-space:nowrap}
#winWarp .chip.boss{border-color:#d4af37;color:#ffe28a}
#winWarp .go{margin-top:auto;font-size:16px!important;padding:11px 10px!important}
@media (max-width:700px){#winWarp .wm{flex-direction:column}}
`;
(function(){const s=document.createElement('style');s.id='themeCss';s.textContent=THEME_CSS;document.head.appendChild(s)})();

/* ---------- เมนู: เปลี่ยนปุ่มข้อความเป็นไอคอน ---------- */
(function(){
  const M={bChar:['🧙','ตัวละคร','C'],bBag:['🎒','เป้','I'],bSkill:['✨','สกิล','K'],bDepth:['🌟','ความสามารถ','X'],bJob:['⚔️','อาชีพ','Y'],bStyle:['👗','แต่งตัว','V'],
    bQuest:['📜','เควสต์','J'],bStory:['📖','เรื่องราว','N'],bWarp:['🗺️','แผนที่โลก','T'],bRank:['🏆','อันดับ','L'],bGoal:['🎯','เป้าหมาย','O'],
    bShop:['🛒','ร้านค้า','B'],bLife:['🎣','ชีวิต','G'],bChat:['💬','แชทโลก','Enter'],bSave:['💾','บันทึกเกม',''],bSwap:['🔄','เปลี่ยนตัวละคร',''],bDel:['🗑️','ลบตัวละคร','']};
  for(const id in M){const b=$(id);if(!b)continue;const [ic,n,k]=M[id];b.classList.add('mi');if(id==='bDel')b.classList.add('danger');b.removeAttribute('style');
    b.innerHTML=`<i>${ic}</i><span>${n}</span>${k?`<em>${k}</em>`:'<em>&nbsp;</em>'}`}
  const Q=[['🧙','ตัวละคร'],['🎒','เป้'],['✨','สกิล'],['📜','เควสต์']];
  document.querySelectorAll('#top>.btn.q').forEach((b,i)=>{b.innerHTML=`<i>${Q[i][0]}</i><span>${Q[i][1]}</span>`});
  const m=$('bMenu');if(m)m.innerHTML='<i>☰</i><span>เมนู</span>';
  const a=$('bAuto');if(a)a.innerHTML='<i>⚔️</i><span>ออโต้ (Z)</span>';
})();

/* ---------- หน้าเลือกอาชีพ ---------- */
(function(){
  const st=$('start');if(!st||$('startBanner'))return;
  const b=document.createElement('div');b.id='startBanner';b.textContent='เลือกอาชีพ';
  st.insertBefore(b,$('cards'));
})();

/* ---------- แผนที่โลก (วาร์ป) ---------- */
const WM={sel:null,timer:0,thumbs:{}};
const WM_POS={forest:[140,262],desert:[380,266],snow:[96,80],deepwood:[262,74],ruinvillage:[428,84]};
const WM_DESC={forest:'ป่าทึบริมทะเลสาบ จุดเริ่มต้นของนักผจญภัย มีหมู่บ้านและมอนสเตอร์เบาๆ ให้ฝึกมือ',
  desert:'ทะเลทรายร้อนระอุเต็มไปด้วยแมงป่อง ปีศาจ และซากโบราณ ซ่อนผนึกที่สองไว้ใต้ผืนทราย',
  snow:'ดินแดนน้ำแข็งเลือดที่อันตรายที่สุด เป็นรังของอัศวินมรณะ ราชันย์กระดูก และมังกรแห่งหายนะ',
  deepwood:'ป่าลึกที่ถูกเหวมืดล้อมรอบ ทางเดินคดเคี้ยวเต็มไปด้วยสัตว์ป่าเงาและเอนท์พิษ มีราชันย์ต้นไม้ผู้ตื่นซ่อนอยู่ปลายทาง',
  ruinvillage:'หมู่บ้านร้างริมสระที่ถูกปีศาจเพลิงยึดครอง เศษบ้านเรือนกลายเป็นรังของจอมมารผู้ล่มหมู่บ้าน'};
const WM_TYPE={forest:'Forest',desert:'Desert',snow:'Frostland',deepwood:'Deepwood',ruinvillage:'Ruins'};
function wmThumb(id){
  if(WM.thumbs[id])return WM.thumbs[id];
  const M=MAPS[id],c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){const ch=M.grid[y][x],i=TT[ch],P_=M.pal[i];g.fillStyle=(P_?P_[ch==='#'?2:1]:'#333');g.fillRect(x,y,1,1)}
  return WM.thumbs[id]=c;
}
function wmBlob(g,cx,cy,rx,ry,seed){
  g.beginPath();
  for(let i=0;i<=56;i++){const a=i/56*Math.PI*2,k=1+.07*Math.sin(a*3+seed)+.05*Math.sin(a*5+seed*2.3)+.03*Math.sin(a*9+seed*.7),x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;i?g.lineTo(x,y):g.moveTo(x,y)}
  g.closePath();
}
function wmDraw(){
  const c=$('wmCv');if(!c||!P)return;const g=c.getContext('2d'),W=c.width,H=c.height,t=performance.now()/1000;
  g.imageSmoothingEnabled=false;
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#3f8cb2');gr.addColorStop(1,'#2a6490');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,255,255,.10)';
  for(let i=0;i<46;i++){const x=(i*97)%W,y=(i*61+17)%H,w=8+(i*7)%10;g.fillRect(x,y+Math.round(Math.sin(t*1.5+i)*1.2),w,1)}
  // เส้นทางเชื่อมแผนที่
  g.save();g.strokeStyle='#ffe28a';g.lineWidth=3;g.setLineDash([9,7]);g.lineDashOffset=-t*8;g.globalAlpha=.85;
  for(let i=0;i<MAP_ORDER.length-1;i++){const a=WM_POS[MAP_ORDER[i]],b=WM_POS[MAP_ORDER[i+1]];g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo((a[0]+b[0])/2,Math.min(a[1],b[1])-30+ (i?30:0),b[0],b[1]);g.stroke()}
  g.restore();
  MAP_ORDER.forEach((id,n)=>{
    const [cx,cy]=WM_POS[id],rx=76,ry=58,sel=WM.sel===id;
    g.save();g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=10;g.shadowOffsetY=4;wmBlob(g,cx,cy,rx+5,ry+5,n*1.7);g.fillStyle='#f0e0a0';g.fill();g.restore();   // ชายหาด
    g.save();wmBlob(g,cx,cy,rx,ry,n*1.7);g.clip();g.drawImage(wmThumb(id),cx-rx*1.25,cy-ry*1.25,rx*2.5,ry*2.5);
    const sh=g.createRadialGradient(cx,cy,ry*.5,cx,cy,rx*1.1);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=sh;g.fillRect(cx-rx-9,cy-ry-9,rx*2+18,ry*2+18);g.restore();
    if(sel){g.save();g.strokeStyle='#ffd84a';g.lineWidth=4;g.shadowColor='#ffd84a';g.shadowBlur=14+4*Math.sin(t*4);wmBlob(g,cx,cy,rx+7,ry+7,n*1.7);g.stroke();g.restore()}
    // ป้ายชื่อ
    const M=MAPS[id],name=`${M.ic} ${M.name}`,sub=`Lv.${M.lv}`;
    g.font='bold 12px Tahoma,sans-serif';const w=Math.max(g.measureText(name).width,60)+16,lx=cx-w/2,ly=cy+ry-8;
    g.fillStyle='rgba(8,14,40,.92)';g.strokeStyle=sel?'#ffd84a':'#d4af37';g.lineWidth=2;
    g.beginPath();g.roundRect?g.roundRect(lx,ly,w,34,7):g.rect(lx,ly,w,34);g.fill();g.stroke();
    g.fillStyle='#fff';g.textAlign='center';g.fillText(name,cx,ly+14);
    g.font='11px Tahoma,sans-serif';g.fillStyle=P.lv<M.lvr[0]?'#ff9d9a':'#9be58a';g.fillText(sub,cx,ly+28);
    // ตำแหน่งผู้เล่น
    if(id===MAPID){
      const py=cy-ry*.3-Math.abs(Math.sin(t*3))*5;
      g.fillStyle='#e0524f';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(cx,py-10,8,0,6.3);g.fill();g.stroke();
      g.beginPath();g.moveTo(cx-6,py-5);g.lineTo(cx,py+6);g.lineTo(cx+6,py-5);g.fill();
      g.fillStyle='rgba(8,14,40,.92)';g.strokeStyle='#ffd84a';g.beginPath();g.roundRect?g.roundRect(cx-44,py-42,88,18,9):g.rect(cx-44,py-42,88,18);g.fill();g.stroke();
      g.fillStyle='#ffe28a';g.font='bold 11px Tahoma,sans-serif';g.fillText('◆ คุณอยู่ที่นี่',cx,py-29);
    }
  });
  // เข็มทิศ
  g.save();g.translate(W-48,H-48);g.strokeStyle='rgba(255,240,200,.85)';g.fillStyle='rgba(255,240,200,.85)';g.lineWidth=2;
  g.beginPath();g.arc(0,0,20,0,6.3);g.stroke();g.beginPath();g.moveTo(0,-26);g.lineTo(5,0);g.lineTo(0,26);g.lineTo(-5,0);g.closePath();g.fill();
  g.beginPath();g.moveTo(-26,0);g.lineTo(0,-4);g.lineTo(26,0);g.lineTo(0,4);g.closePath();g.globalAlpha=.6;g.fill();g.restore();
  g.fillStyle='#fff';g.font='bold 11px Tahoma,sans-serif';g.textAlign='center';g.fillText('N',W-48,H-80);
}
function wmPick(e){
  const c=$('wmCv');if(!c)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;
  let best=null,bd=9;
  for(const id of MAP_ORDER){const [cx,cy]=WM_POS[id],d=((x-cx)/84)**2+((y-cy)/66)**2;if(d<bd){bd=d;best=id}}
  if(best&&bd<1.4){WM.sel=best;sfx('click');refreshWarp()}
}
refreshWarp=function(){
  const w=$('winWarp');if(!w||w.style.display!=='block'||!P)return;
  if(!WM.sel||!MAPS[WM.sel])WM.sel=MAPID;
  const id=WM.sel,M=MAPS[id],here=id===MAPID,busy=P.combatT>0,low=P.lv<M.lvr[0],ok=!here&&!busy&&P.zeny>=WARP_COST&&!(P.dying>0);
  const keys=[...new Set(M.spawns.map(s=>s[0]))].sort((a,b)=>MOBS[a].lv-MOBS[b].lv),bosses=M.boss||[];
  const chip=(k,cls)=>{const d=MOBS[k],e=typeof MEL!=='undefined'&&MEL[k]&&typeof EL!=='undefined'?EL[MEL[k]].ic:'';return`<span class="chip ${cls||''}">${cls?'👑 ':''}Lv${d.lv} ${d.name} ${e}</span>`};
  const btnTxt=here?'📍 คุณอยู่ที่นี่':busy?'⚠ กำลังสู้อยู่':P.zeny<WARP_COST?`💰 Zeny ไม่พอ (${WARP_COST.toLocaleString()})`:`🌀 วาร์ปไปที่นี่ — ${WARP_COST.toLocaleString()} Zeny`;
  w.innerHTML=`<h3><span>🗺️ แผนที่โลก</span><button class="x" onclick="toggleWin('winWarp')">✕</button></h3>
    <div class="wm"><div class="wmL"><canvas id="wmCv" width="520" height="360"></canvas><div class="small" style="margin-top:4px">📍 แตะพื้นที่บนแผนที่เพื่อดูรายละเอียด • วาร์ปไปถึงเมืองของแผนที่นั้นทันที</div></div>
    <div class="wmR"><h4>${M.ic} ${M.name}</h4>
      <div><span class="tag">Lv.แนะนำ ${M.lv}</span><span class="tag">${WM_TYPE[id]||''}</span><span class="tag" style="color:#ffe28a">💰 ${P.zeny.toLocaleString()}</span></div>
      ${low?'<div class="small" style="color:#ff9d9a">⚠ สูงกว่าเลเวลของคุณ (Lv '+P.lv+')</div>':''}
      <div class="small" style="line-height:1.5">${WM_DESC[id]||''}</div>
      <div><b style="font-size:12px;color:#ffe28a">มอนสเตอร์ที่พบ</b><div class="chips">${keys.map(k=>chip(k)).join('')}${bosses.map(k=>chip(k,'boss')).join('')}</div></div>
      <div class="small">🏘 เมืองมี: ร้านค้า • ป้ายเควสต์ • ช่างตีเหล็ก • ประตูดันเจี้ยน • NPC</div>
      <button class="go" ${ok?'':'disabled'} onclick="warpTo('${id}')">${btnTxt}</button></div></div>`;
  const c=$('wmCv');if(c)c.onpointerdown=wmPick;
  wmDraw();clearInterval(WM.timer);
  WM.timer=setInterval(()=>{const ww=$('winWarp');if(!ww||ww.style.display!=='block'||!$('wmCv')){clearInterval(WM.timer);return}wmDraw()},90);
};
// เปิดหน้าต่างครั้งแรก: เลือกแผนที่ที่ยืนอยู่
const _toggleWinTheme=toggleWin;
toggleWin=function(id){if(id==='winWarp'&&P){const w=$('winWarp');if(w.style.display!=='block')WM.sel=MAPID}return _toggleWinTheme(id)};
