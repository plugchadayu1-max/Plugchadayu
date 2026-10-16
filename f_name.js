/* ============ ชื่อตัวละคร ============
   ตั้งตอนสร้างตัวละคร (หลังเลือกอาชีพ) • เก็บใน P.dx.nick (ใช้เป็นชื่อแชทด้วย เซฟขึ้นคลาวด์พร้อมตัวละคร)
   ตัวละครเก่าที่ยังไม่มีชื่อ จะถูกถามครั้งแรกที่เข้าเกม
   ต้องโหลดหลัง f_depth.js (สร้าง P.dx) และ f_chat.js */

const NAME_RE=/^[฀-๿A-Za-z0-9_ ]+$/;
const cleanName=v=>(v||'').trim().replace(/\s+/g,' ');
function nameErr(v){
  if(v.length<2||v.length>12)return 'ชื่อต้องยาว 2-12 ตัวอักษร';
  if(!NAME_RE.test(v))return 'ใช้ได้เฉพาะภาษาไทย อังกฤษ ตัวเลข เว้นวรรค และ _';
  return '';
}
let NEWNAME=null;   // ชื่อที่ตั้งไว้ รอใส่ตอนสร้างตัวละคร (afterNewPlayer)
// ตรวจ/จองชื่อกับเซิร์ฟเวอร์ (f_social.js) คืนข้อความผิดพลาด หรือ '' = ใช้ได้
async function nameCheck(v){return ''}

(function(){
  const s=document.createElement('style');s.textContent=`
#nameDlg{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(4,8,24,.72);padding:16px}
#nameDlg .panel{position:static;transform:none;width:min(360px,100%);padding:16px 16px 14px;text-align:center}
#nameDlg h3{justify-content:center;margin-bottom:8px}
#nameDlg canvas{width:96px;height:96px;image-rendering:pixelated;border-radius:10px;border:2px solid #2e528f;background:#2d4a26;display:block;margin:4px auto 8px}
#nmIn{width:100%;box-sizing:border-box;padding:11px;font-size:16px;text-align:center;color:#fff;background:#0a1230;border:2px solid #2e528f;border-radius:8px;outline:none;user-select:text;-webkit-user-select:text}
#nmIn:focus{border-color:#d4af37}
#nmErr{min-height:18px;font-size:12px;color:#ff9d9a;margin:6px 0 4px}
#nameDlg .row{display:flex;gap:8px;justify-content:center}
#nameDlg .row button{flex:1;padding:10px;font-size:15px;font-weight:bold;font-family:inherit;cursor:pointer;border-radius:8px;color:#fff;background:linear-gradient(#2f5bb3,#1d3a7a);border:2px solid #4a74c9}
#nameDlg .row button:hover{filter:brightness(1.15)}
#nameDlg #nmOk{color:#2a1a00;background:linear-gradient(#ffe28a,#d4a017);border-color:#fff1b8}`;
  document.head.appendChild(s);
  const d=document.createElement('div');d.id='nameDlg';document.body.appendChild(d);
})();

// เปิดหน้าต่างตั้งชื่อ  cls = อาชีพ (ไว้แสดงภาพ)  onOk(name)  onBack = ปุ่มย้อนกลับ (ไม่ใส่ = ต้องตั้งชื่อ)
function askName(cls,onOk,onBack){
  const d=$('nameDlg'),C=CLASSES[cls];
  d.innerHTML=`<div class="panel"><h3><span>✏️ ตั้งชื่อตัวละคร</span></h3>
    <canvas width="64" height="64"></canvas>
    <div class="small" style="margin-bottom:8px">${C.name} • ชื่อนี้จะแสดงเหนือหัว ในอันดับ และในแชท</div>
    <input id="nmIn" maxlength="12" placeholder="ชื่อตัวละคร (2-12 ตัวอักษร)" autocomplete="off" spellcheck="false">
    <div id="nmErr"></div>
    <div class="row">${onBack?'<button id="nmBack">◀ เปลี่ยนอาชีพ</button>':''}<button id="nmOk">เริ่มผจญภัย ▶</button></div>
    <div class="small" style="opacity:.6;margin-top:8px">ใช้ชื่อสุภาพ ห้ามแอบอ้างเป็นผู้อื่น</div></div>`;
  // ภาพตัวละครหันหน้า
  const a=makeActor(C.sprite),pc=d.querySelector('canvas').getContext('2d');a.ang=Math.PI/2;
  const S=a.sh,idx=actorFrame(a),k=S.scale||1;   // k = ย่อสไปรต์ HD ให้พอดีช่อง 64x64 เหมือนหน้าเลือกตัวละคร
  pc.fillStyle='#2d4a26';pc.fillRect(0,0,64,64);pxEllipseOn(pc,32,57,10,3,'rgba(0,0,0,.3)');pc.imageSmoothingEnabled=!!S.scale;
  pc.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,32-Math.round(S.cx*S.cw*k),58-Math.round(S.foot*S.ch*k),S.cw*k,S.ch*k);
  const inp=$('nmIn'),err=$('nmErr');
  let busy=false;
  const ok=async()=>{
    if(busy)return;const v=cleanName(inp.value),e=nameErr(v);if(e){err.textContent=e;inp.focus();return}
    busy=true;err.style.color='#9fc0ff';err.textContent='กำลังตรวจชื่อ...';
    const e2=await nameCheck(v);busy=false;err.style.color='';
    if(e2){err.textContent=e2;inp.focus();return}
    d.style.display='none';onOk(v);
  };
  $('nmOk').onclick=ok;
  if(onBack)$('nmBack').onclick=()=>{d.style.display='none';onBack()};
  inp.addEventListener('input',()=>{err.textContent=''});
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();ok()}});
  inp.addEventListener('keyup',e=>e.stopPropagation());
  d.style.display='flex';setTimeout(()=>inp.focus(),60);
}

// สร้างตัวละครใหม่: เลือกอาชีพ -> ตั้งชื่อ -> เข้าเกม  •  เข้าเกมด้วยตัวเดิมที่ยังไม่มีชื่อ -> ถามชื่อครั้งเดียว
const _beginN=begin;
begin=function(cls,carry){
  if(carry){
    _beginN(cls,carry);
    if(P&&P.dx&&!P.dx.nick)askName(cls,n=>{P.dx.nick=n;save(false);toast(`✏️ ตั้งชื่อเป็น ${n} แล้ว`)});
    return;
  }
  $('start').style.display='none';
  askName(cls,n=>{NEWNAME=n;_beginN(cls)},()=>{$('start').style.display=''});
};
const _anpN=afterNewPlayer;
afterNewPlayer=function(){_anpN();if(NEWNAME&&P.dx){P.dx.nick=NEWNAME;NEWNAME=null}};
