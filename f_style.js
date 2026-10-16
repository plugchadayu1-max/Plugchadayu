/* ============ ห้องแต่งตัว (Wardrobe) ============
   - สีผม / สีผิว / สีชุด / เสื้อ (นักรบ) : ย้อมสีที่พิกเซลของสไปรต์จริง (แยกส่วนด้วยสีและตำแหน่ง) แล้วแคชเป็นชีตใหม่
   - หมวก / ผ้าคลุม / ปีก : พิกเซลอาร์ตวาดซ้อนบนตัวละคร ยึดตำแหน่งหัวจากเฟรมจริง (ตามท่าเดิน) และสลับหน้า-หลังตามทิศ
   - รอยเท้า : อนุภาคตามหลังตอนเดิน
   ข้อมูลเก็บใน P.sty (ซื้อแล้วถาวรใน P.sty.own) */

/* ---------- แคตตาล็อก ---------- */
const DYES=[
  {id:'orig',n:'ดั้งเดิม',price:0},
  {id:'red',n:'แดง',h:355,price:400},{id:'orange',n:'ส้ม',h:25,price:400},{id:'yellow',n:'เหลือง',h:48,price:400},
  {id:'lime',n:'เขียวสด',h:90,price:400},{id:'green',n:'เขียว',h:135,price:400},{id:'teal',n:'ฟ้าเขียว',h:175,price:400},
  {id:'sky',n:'ฟ้า',h:200,price:400},{id:'blue',n:'น้ำเงิน',h:225,price:400},{id:'purple',n:'ม่วง',h:275,price:400},
  {id:'pink',n:'ชมพู',h:322,price:400},{id:'black',n:'ดำ',h:260,sm:.15,lm:.5,price:600},{id:'white',n:'ขาว',h:220,sm:.12,lm:1,la:.38,price:600}];
const HAIRS=[
  {id:'orig',n:'ดั้งเดิม',price:0},
  {id:'black',n:'ดำ',h:240,s:.12,lm:.35,price:250},{id:'brown',n:'น้ำตาล',h:24,s:.55,lm:.8,price:250},{id:'blond',n:'บลอนด์',h:46,s:.85,lm:1.3,price:250},
  {id:'red',n:'แดง',h:4,s:.8,lm:1.05,price:250},{id:'pink',n:'ชมพู',h:330,s:.75,lm:1.35,price:300},{id:'green',n:'เขียว',h:130,s:.6,lm:1.1,price:300},
  {id:'purple',n:'ม่วง',h:280,s:.6,lm:1.05,price:300},{id:'silver',n:'เงิน',h:215,s:.08,lm:1.7,price:400},{id:'aqua',n:'ฟ้าน้ำทะเล',h:185,s:.8,lm:1.25,price:300}];
const SKINS=[
  {id:'orig',n:'ดั้งเดิม',price:0},
  {id:'pale',n:'ขาวใส',sm:.6,lm:1.1,price:0},{id:'tan',n:'แทน',sm:1,lm:.84,price:0},{id:'brown',n:'น้ำตาล',h:22,sm:.9,lm:.64,price:0},
  {id:'dark',n:'เข้ม',h:20,sm:.8,lm:.44,price:0},{id:'elf',n:'เอลฟ์เขียว',h:100,sm:.9,lm:.88,price:500},
  {id:'ice',n:'ผิวน้ำแข็ง',h:200,sm:.55,lm:.95,price:500},{id:'rose',n:'ชมพูพีช',h:350,sm:1,lm:.98,price:500}];
const SHIRTS=[
  {id:'none',n:'ไม่ใส่',price:0},
  {id:'white',n:'ขาว',h:40,s:.1,l:.92,price:300},{id:'red',n:'แดง',h:355,s:.6,l:.5,price:300},{id:'blue',n:'น้ำเงิน',h:215,s:.6,l:.5,price:300},
  {id:'green',n:'เขียว',h:130,s:.5,l:.42,price:300},{id:'black',n:'ดำ',h:240,s:.1,l:.22,price:300},{id:'gold',n:'ทอง',h:44,s:.8,l:.55,price:500},
  {id:'purple',n:'ม่วง',h:275,s:.5,l:.45,price:300},{id:'orange',n:'ส้ม',h:25,s:.8,l:.52,price:300}];

/* พิกเซลอาร์ต: '.' = โปร่ง  ตัวอักษร = สีใน pal  (มีเส้นขอบเข้มอัตโนมัติ) */
const SA={
  crown:{pal:{Y:'#ffd84a',y:'#c9922a',R:'#e0424a',B:'#4aa8ff'},rows:['Y....Y....Y','YY..YYY..YY','YYYYYYYYYYY','YRYYYBYYYRY','yyyyyyyyyyy']},
  icecrown:{pal:{Y:'#dff4ff',y:'#7fb8e8',R:'#ffffff',B:'#59d0ff'},rows:['Y....Y....Y','YY..YYY..YY','YYYYYYYYYYY','YRYYYBYYYRY','yyyyyyyyyyy']},
  ears:{pal:{K:'#2a2a36',P:'#ff9db4'},rows:['KK.........KK','KPK.......KPK','KPPK.....KPPK','KKKKK...KKKKK']},
  halo:{pal:{Y:'#ffe56a',w:'#fffbe0'},rows:['...wYYYw...','..YYwwwYY..','.Y.......Y.','.Y.......Y.','..YYYYYYY..'],noline:1},
  bow:{pal:{R:'#ff4f7a',r:'#ff9fbd',D:'#b02a50'},rows:['RR...RR','RrR.RrR','RRRDRRR','RR...RR']},
  flowers:{pal:{G:'#4cae52',g:'#2f7d3a',P:'#ff8fc0',W:'#ffffff',Y:'#ffd84a',O:'#ff9a4a'},rows:['..P...Y...O..','.PYP.WYW.OYO.','GGPGGGOGGGPGG','.gGG.gGGg.GG.']},
  horns:{pal:{R:'#d8323a',D:'#7a1020',K:'#2a2a36'},rows:['R...........R','RR.........RR','.RR.......RR.','.RDR.....RDR.','..KKKKKKKKK..']},
  tophat:{pal:{K:'#2a2a3a',k:'#4a4a60',R:'#c0303a'},rows:['..KkKKKKK..','..KkKKKKK..','..KkKKKKK..','..KkKKKKK..','..RRRRRRR..','KKKKKKKKKKK']},
  straw:{pal:{Y:'#f2c85a',y:'#c99a35',R:'#d8454a'},rows:['.....YYYYY.....','....YYYYYYY....','...YRRRRRRRY...','YYYYYYYYYYYYYYY','.yyyyyyyyyyyyy.']},
  santa:{pal:{R:'#d8323a',r:'#f05a5a',W:'#ffffff'},rows:['.......WW..','.....RRRRW.','...RRRRRRR.','..RRrRRRRR.','.RRRRRRRRRR','WWWWWWWWWWW','WWWWWWWWWWW']},
  wing:{rows:['W...........','WW..........','WWW.........','WwWW........','.WwWWW......','.WwWWWW.....','..WwWWWWW...','..WwWWWWWW..','...wWWWWWWW.','...wwWWWWWWW','....wwWWWWWW','.....wwwWWWW']}
};
const WINGPAL={angel:{W:'#ffffff',w:'#b9cdf5'},butterfly:{W:'#ff9be0',w:'#8f6bff'},flame:{W:'#ffc04a',w:'#e8402a'},bat:{W:'#6a3a8a',w:'#2a1238'}};
const HATS=[
  {id:'none',n:'ไม่สวม',price:0},
  {id:'bow',n:'โบว์ชมพู',ic:'🎀',art:'bow',ov:1,ox:-4,price:800},{id:'straw',n:'หมวกฟาง',ic:'👒',art:'straw',ov:2,price:900},
  {id:'flowers',n:'มงกุฎดอกไม้',ic:'🌸',art:'flowers',ov:2,price:1200},{id:'ears',n:'หูแมว',ic:'🐱',art:'ears',ov:2,price:1500},
  {id:'santa',n:'หมวกซานต้า',ic:'🎅',art:'santa',ov:2,price:1500},{id:'tophat',n:'หมวกทรงสูง',ic:'🎩',art:'tophat',ov:2,price:2000},
  {id:'horns',n:'เขาปีศาจ',ic:'😈',art:'horns',ov:2,price:2500},{id:'halo',n:'ฮาโลนางฟ้า',ic:'😇',art:'halo',float:4,price:5000},
  {id:'crown',n:'มงกุฎทอง',ic:'👑',art:'crown',ov:2,price:6000},{id:'icecrown',n:'มงกุฎน้ำแข็ง',ic:'❄️',art:'icecrown',ov:2,price:8000}];
const BACKS=[
  {id:'none',n:'ไม่มี',price:0},
  {id:'capeR',n:'ผ้าคลุมแดง',ic:'🟥',cape:['#d8323a','#8a1a24','#ffd84a'],price:2500},{id:'capeB',n:'ผ้าคลุมน้ำเงิน',ic:'🟦',cape:['#3a6ad8','#1d3a8a','#e8f0ff'],price:2500},
  {id:'capeK',n:'ผ้าคลุมราตรี',ic:'⬛',cape:['#3a2a52','#1a1228','#c58aff'],price:3500},{id:'capeG',n:'ผ้าคลุมทอง',ic:'🟨',cape:['#f0c040','#a8761e','#ffffff'],price:6000},
  {id:'wbfly',n:'ปีกผีเสื้อ',ic:'🦋',wing:'butterfly',price:7000},{id:'wbat',n:'ปีกค้างคาว',ic:'🦇',wing:'bat',price:9000},
  {id:'wangel',n:'ปีกนางฟ้า',ic:'🪽',wing:'angel',price:12000},{id:'wflame',n:'ปีกเพลิง',ic:'🔥',wing:'flame',price:15000}];
const TRAILS=[
  {id:'none',n:'ไม่มี',price:0},
  {id:'petal',n:'กลีบซากุระ',ic:'🌸',cols:['#ffb7d0','#ff8fb8','#ffffff'],g:'fall',price:1500},{id:'note',n:'โน้ตดนตรี',ic:'🎵',cols:['#9fd0ff','#ffe86a','#ff9fd0'],g:'note',price:2000},
  {id:'heart',n:'หัวใจ',ic:'💗',cols:['#ff5a8a','#ff9fbd'],g:'heart',price:2500},{id:'spark',n:'ประกายดาว',ic:'✨',cols:['#fff6a8','#ffffff','#ffd84a'],g:'spark',price:3000},
  {id:'snow',n:'เกล็ดหิมะ',ic:'❄️',cols:['#ffffff','#bfe8ff','#8fd8ff'],g:'fall',price:3000},{id:'flame',n:'เปลวไฟ',ic:'🔥',cols:['#ffdd55','#ff8a2a','#e8402a'],g:'rise',price:6000}];
const CATS={dye:DYES,hair:HAIRS,skin:SKINS,shirt:SHIRTS,hat:HATS,back:BACKS,trail:TRAILS};
const CATN={dye:'สีชุด',hair:'สีผม',skin:'สีผิว',shirt:'เสื้อ',hat:'หมวก',back:'หลัง',trail:'รอยเท้า'};
const STY0={dye:'orig',hair:'orig',skin:'orig',shirt:'none',hat:'none',back:'none',trail:'none'};
const itemOf=(cat,id)=>CATS[cat].find(x=>x.id===id)||CATS[cat][0];
function styOf(s){return Object.assign({},STY0,s||{})}
function myStyle(){if(!P)return STY0;if(!P.sty)P.sty={own:{}};P.sty.own=P.sty.own||{};return Object.assign(P.sty,styOf(P.sty))}
const owns=(cat,id)=>{const it=itemOf(cat,id);return it.price===0||!!(P.sty&&P.sty.own&&P.sty.own[cat+':'+id])};

/* ---------- ย้อมสีสไปรต์ ---------- */
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),l=(M+m)/2;let h=0,s=0;
  if(M!==m){const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);h=M===r?(g-b)/d+(g<b?6:0):M===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s,l]}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;if(s<=0){const v=l*255;return[v,v,v]}
  const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q,f=t=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<.5?q:t<2/3?p+(q-p)*(2/3-t)*6:p};
  return[f(h+1/3)*255,f(h)*255,f(h-1/3)*255]}
const clamp01=v=>v<0?0:v>1?1:v;
// ฐานสีชุด / กติกาแยกส่วนของแต่ละอาชีพ (ดูจากสีจริงของสไปรต์)
const SPEC={
  lpc_warrior:{base:245,hair:(h,s,l)=>h>=195&&h<=310&&s>=.2,skin:(h,s,l)=>h>=5&&h<=45&&s>=.4&&l>=.55},
  lpc_archer:{base:240,hair:(h,s,l)=>h>=195&&h<=310&&s>=.2,skin:(h,s,l)=>h>=5&&h<=45&&s>=.4&&l>=.55},
  kk_mage:{base:250,hair:null,skin:(h,s,l)=>h>=5&&h<=45&&s>=.4&&l>=.55},
  // โจร (สาวปีศาจ): ชุดดำอมม่วงย้อมได้ / ผมส้มยาว / ด้ามหอกและเขาไม่ย้อม
  px_devil:{base:265,hairF:.75,hair:(h,s,l)=>h>=10&&h<=30&&s>=.75&&l>=.4&&l<.7,skin:(h,s,l)=>h>=15&&h<=35&&s>=.6&&l>=.75,keep:(h,s,l)=>(h<=12||h>=330)&&l<.3},
  // จอมเวท LPC: ผมชมพูยาวถึงกลางตัว / ปีกทองไม่ย้อมตามชุด
  lpc_mage:{base:228,hairF:.6,hair:(h,s,l)=>(h>=300||h<=6)&&s>=.2&&l>=.15,skin:(h,s,l)=>h>=15&&h<=30&&s>=.5&&l>=.66,keep:(h,s,l)=>h>=18&&h<=58&&s>=.55},
  kk_rogue:{base:160,hair:(h,s,l)=>(h<=45||h>=350)&&s>=.3&&l<.66,skin:(h,s,l)=>h>=5&&h<=45&&s>=.3&&l>=.66}
};
// STYLE_ON = สวิตช์หลักระบบแต่งตัว (false = ปิดทั้งหมด: ไม่ย้อมสี ไม่สวมหมวก/ปีก ไม่มีรอยเท้า ซ่อนปุ่ม/หน้าต่าง) • ข้อมูลที่ซื้อไว้ในเซฟยังอยู่ครบ เปิดคืนได้
const STYLE_ON=false;
const SHEETC={};
function styledSheet(cls,sty){
  const C=CLASSES[cls],key=C.sprite,S=SHEETS[key];if(!S)return null;
  if(!STYLE_ON)return (typeof skinSheet==='function'&&skinSheet(cls,sty))||S;   // ระบบแต่งตัวปิดอยู่ แต่ยังใช้สกิน (f_skin.js) ได้
  sty=styOf(sty);const ck=[cls,sty.dye,sty.hair,sty.skin,cls==='warrior'?sty.shirt:'none'].join('|');
  if(ck===[cls,'orig','orig','orig','none'].join('|'))return S;
  if(SHEETC[ck])return SHEETC[ck];
  if(!SPEC[key])return S;   // ชีตที่ยังไม่มีกติกาย้อมสี (เช่นสไปรต์ HD hd_*) ใช้ภาพเดิม
  const D=wSrc(key),W=D.width,Hh=D.height,out=new Uint8ClampedArray(D.data),sp=SPEC[key],pw=WPRED[key];
  const dy_=DYES.find(x=>x.id===sty.dye),hr=HAIRS.find(x=>x.id===sty.hair),sk=SKINS.find(x=>x.id===sty.skin),sh=SHIRTS.find(x=>x.id===(cls==='warrior'?sty.shirt:'none'));
  const rows=Math.floor(Hh/S.ch),cw=S.cw,ch=S.ch,cxp=cw*S.cx;
  for(let fr=0;fr<S.cols*rows;fr++){
    const ox=(fr%S.cols)*cw,oy=Math.floor(fr/S.cols)*ch;let t=ch,b=-1;
    for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(D.data[((oy+y)*W+ox+x)*4+3]>=128){if(y<t)t=y;b=y}
    if(b<0)continue;const H=b-t+1;
    for(let y=t;y<=b;y++){const f=(y-t)/H;
      for(let x=0;x<cw;x++){const p=((oy+y)*W+ox+x)*4;if(out[p+3]<8)continue;
        const r=D.data[p],g=D.data[p+1],bl=D.data[p+2];
        if(pw&&pw(r,g,bl,Math.abs(x-cxp)))continue;   // อาวุธไม่ย้อม
        let[h,s,l]=rgb2hsl(r,g,bl),done=0;
        if(sp.skin(h,s,l)){   // ผิว (และเสื้อที่ทาทับผิวช่วงลำตัว)
          if(sh&&sh.id!=='none'&&f>=.4&&f<.66){h=sh.h;s=sh.s;l=clamp01(l*(sh.l/.7));done=1}
          else if(sk&&sk.id!=='orig'){if(sk.h!=null)h=sk.h;s=clamp01(s*(sk.sm||1));l=clamp01(l*(sk.lm||1));done=1}
          else continue;
        }else if(f<(sp.hairF||.34)&&sp.hair&&sp.hair(h,s,l)){
          if(hr&&hr.id!=='orig'){h=hr.h;s=hr.s;l=clamp01(l*hr.lm);done=1}else continue;
        }else if(sp.keep&&sp.keep(h,s,l))continue;
        else if(dy_&&dy_.id!=='orig'&&s>=.14){   // ชุด: เปลี่ยนโทนสี เก็บเงาเดิม
          let dh=h-sp.base;dh-=Math.round(dh/360)*360;
          h=dy_.h+dh*.4;s=clamp01(s*(dy_.sm||1));l=clamp01(l*(dy_.lm||1)+(dy_.la||0));done=1;
        }
        if(done){const c=hsl2rgb(h,s,l);out[p]=c[0];out[p+1]=c[1];out[p+2]=c[2]}
      }}
  }
  const cv=document.createElement('canvas');cv.width=W;cv.height=Hh;cv.getContext('2d').putImageData(new ImageData(out,W,Hh),0,0);
  return SHEETC[ck]=Object.assign({},S,{im:cv});
}
// ชีตของตัวละครผู้เล่น (ใช้ตอนวาดภาพตัวละครในหน้าต่างต่างๆ)
function myStyledSheet(S){if(!P)return S;const r=styledSheet(P.cls,myStyle());return r||S}

/* ---------- พิกเซลอาร์ต -> แคนวาส ---------- */
const ARTC={};
function mkArt(rows,pal,noline){
  const w=Math.max(...rows.map(r=>r.length)),h=rows.length,pad=noline?0:1,cv=document.createElement('canvas');cv.width=w+pad*2;cv.height=h+pad*2;
  const g=cv.getContext('2d'),at=(x,y)=>x>=0&&y>=0&&x<w&&y<h&&rows[y][x]&&rows[y][x]!=='.';
  if(!noline){g.fillStyle='#1d1522';for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++)if(!at(x,y)&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1)))g.fillRect(x+pad,y+pad,1,1)}
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(at(x,y)){g.fillStyle=pal[rows[y][x]]||'#f0f';g.fillRect(x+pad,y+pad,1,1)}
  return cv;
}
function artOf(name,pal){const k=name+(pal?JSON.stringify(pal):'');if(ARTC[k])return ARTC[k];const a=SA[name];return ARTC[k]=mkArt(a.rows,pal||a.pal,a.noline)}
function flipped(cv){const k='f'+cv.width+cv.height+(cv._id||(cv._id=Math.random()));if(ARTC[k])return ARTC[k];const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const g=o.getContext('2d');g.translate(cv.width,0);g.scale(-1,1);g.drawImage(cv,0,0);return ARTC[k]=o}

/* ---------- ตำแหน่งหัว/ไหล่จากเฟรมจริง ---------- */
const ANC={};
function anchor(key,S,idx){
  const ck=key+'|'+idx;if(ANC[ck])return ANC[ck];
  const D=wSrc(key),ox=(idx%S.cols)*S.cw,oy=Math.floor(idx/S.cols)*S.ch;let t=S.ch,b=-1;
  for(let y=0;y<S.ch;y++)for(let x=0;x<S.cw;x++)if(D.data[((oy+y)*D.width+ox+x)*4+3]>=128){if(y<t)t=y;b=y}
  if(b<0)return ANC[ck]={top:0,bot:1,cx:S.cw*S.cx};
  let sx=0,n=0;for(let y=t;y<t+3;y++)for(let x=0;x<S.cw;x++)if(D.data[((oy+y)*D.width+ox+x)*4+3]>=128){sx+=x;n++}
  return ANC[ck]={top:t,bot:b,cx:n?sx/n:S.cw*S.cx};
}
const tNow=()=>performance.now()/1000;
function drawCape(g,cx,sy,len,k,col,front){
  const [M,Dk,Tr]=col,T=tNow(),W=front?8:10;
  for(let r=0;r<len;r++){
    const w=Math.round(W+r*(front?.16:.32)+(front?0:2)),sway=Math.round(Math.sin(T*2.6+r*.18)*r*.045),x=Math.round(cx-w/2+sway);
    g.fillStyle='#1d1522';g.fillRect((x-1)*k,(sy+r)*k,(w+2)*k,k);
    g.fillStyle=r>len*.62?Dk:M;g.fillRect(x*k,(sy+r)*k,w*k,k);
    g.fillStyle=Tr;g.fillRect(x*k,(sy+r)*k,k,k);g.fillRect((x+w-1)*k,(sy+r)*k,k,k);
    if(r===len-1){g.fillStyle='#1d1522';g.fillRect((x-1)*k,(sy+r+1)*k,(w+2)*k,k);g.fillStyle=Tr;g.fillRect(x*k,(sy+r)*k,w*k,k)}
  }
}
/* วาดของตกแต่งซ้อนตัวละคร: (sx,sy) = จุดเท้าบนแคนวาสปลายทาง  k = ขยาย  layer = 'back' | 'front' */
function drawStyle(g,a,sx,sy,k,layer,sty){
  if(!STYLE_ON||!a||!a.sh)return;sty=styOf(sty);
  if(sty.hat==='none'&&sty.back==='none')return;
  const S=a.sh,key=S.key||'';if(!key)return;const idx=actorFrame(a),an=anchor(key,S,idx);
  const L0=sx-Math.round(S.cx*S.cw*k),T0=sy-Math.round(S.foot*S.ch*k),north=Math.sin(a.ang)<-.45;
  const cx=an.cx,top=an.top,H=an.bot-an.top+1,shY=top+H*.26,T=tNow();
  g.save();g.imageSmoothingEnabled=false;g.translate(L0,T0);
  const back=itemOf('back',sty.back);
  if(back.id!=='none'&&((layer==='back')!==north)){
    if(back.cape)drawCape(g,cx,Math.round(shY),Math.round(H*.58),k,back.cape,north);
    else if(back.wing){
      const wc=artOf('wing',WINGPAL[back.wing]),flap=Math.sin(T*5)*.5+.5,ww=wc.width,wh=wc.height,fl=flipped(wc);
      const WS=2,yy=Math.round(shY-wh*WS*.62+flap*2*(north?-1:1)),spread=Math.round(1+flap*3);
      g.globalAlpha=back.wing==='flame'?.9:1;
      g.drawImage(wc,Math.round(cx-spread-ww*WS+3)*k,yy*k,ww*WS*k,wh*WS*k);g.drawImage(fl,Math.round(cx+spread-3)*k,yy*k,ww*WS*k,wh*WS*k);g.globalAlpha=1;
    }
  }
  if(layer==='front'){
    const hat=itemOf('hat',sty.hat);
    const witch=key==='kk_mage'||key==='lpc_mage';   // สวมหมวกแม่มดอยู่แล้ว: ใส่ได้แค่วงแหวนเทวดาลอยเหนือหมวก
    if(hat.id!=='none'&&!(witch&&hat.id!=='halo')){
      const pal=hat.art,c=artOf(pal),w=c.width,h=c.height;
      let y=top-h+(hat.ov||0)+1+(hat.float?-hat.float+Math.round(Math.sin(T*3)*1.2):0);
      if(witch)y=top-h-2+Math.round(Math.sin(T*3)*1.2);
      g.drawImage(c,Math.round(cx-w/2+(hat.ox||0))*k,y*k,w*k,h*k);
    }
  }
  g.restore();
}
function drawStyleWorld(a,x,y,layer,sty){drawStyle(lx,a,sxL(x),syL(y),a.px||1,layer,sty)}

/* ---------- ฉากหน้าต่างและภาพตัวละครในเป้ ---------- */
function styledPortrait(pc,a,x,y,k,sty){
  sty=sty||myStyle();const S=styledSheet(P.cls,sty)||a.sh;a.sh=S;S.key=CLASSES[P.cls].sprite;
  const idx=actorFrame(a);pc.imageSmoothingEnabled=false;
  drawStyle(pc,a,x,y,k,'back',sty);
  pc.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,x-Math.round(S.cx*S.cw*k),y-Math.round(S.foot*S.ch*k),S.cw*k,S.ch*k);
  drawStyle(pc,a,x,y,k,'front',sty);
  return true;
}

/* ---------- ในเกม: สลับชีต + วาดซ้อน + รอยเท้า ---------- */
const TR=[];let trT=0;
REG.tick.push((dt)=>{
  if(!P||!P.actor)return;
  for(const k in SHEETS)if(!SHEETS[k].key)SHEETS[k].key=k;
  const want=styledSheet(P.cls,myStyle());if(want&&P.actor.sh!==want){P.actor.sh=want}
  // แต่งตัวผู้เล่นปลอมในเมืองให้ดูหลากหลาย
  for(const f of FP){if(f.sty)continue;const r=Math.random;
    f.sty={dye:r()<.7?DYES[1+(r()*(DYES.length-1)|0)].id:'orig',hair:r()<.6?HAIRS[1+(r()*(HAIRS.length-1)|0)].id:'orig',skin:r()<.25?SKINS[1+(r()*4|0)].id:'orig',
      shirt:f.f.c==='warrior'&&r()<.7?SHIRTS[1+(r()*(SHIRTS.length-1)|0)].id:'none',hat:r()<.55?HATS[1+(r()*(HATS.length-1)|0)].id:'none',back:r()<.35?BACKS[1+(r()*(BACKS.length-1)|0)].id:'none'};
    const sh=styledSheet(f.f.c,f.sty);if(sh)f.actor.sh=sh}
  const t=itemOf('trail',myStyle().trail);
  if(!STYLE_ON||t.id==='none'||TOWNHIDE())return;
  const moving=P.actor.anim==='walk';trT-=dt;
  if(moving&&trT<=0){trT=t.g==='spark'?.06:.09;
    const c=t.cols[Math.random()*t.cols.length|0];
    TR.push({x:P.x+rnd(-14,14),y:P.y+rnd(-4,6),vx:rnd(-12,12),vy:t.g==='rise'?rnd(-90,-50):t.g==='note'||t.g==='heart'?rnd(-45,-25):t.g==='spark'?rnd(-30,-6):rnd(8,24),
      life:t.g==='rise'?.55:1.1,age:0,c,g:t.g,z:t.g==='fall'?rnd(30,50):rnd(0,10),ph:Math.random()*6})}
  for(const p of TR){p.age+=dt;p.x+=p.vx*dt+(p.g==='fall'?Math.sin(p.age*5+p.ph)*8*dt:0);p.z-=p.vy*dt}
  for(let i=TR.length-1;i>=0;i--)if(TR[i].age>=TR[i].life||TR.length>90)TR.splice(i,1);
});
const TOWNHIDE=()=>false;
const HEART=['.RR.RR.','RRRRRRR','RRRRRRR','.RRRRR.','..RRR..','...R...'];
function drawTrail(){
  for(const p of TR){const f=1-p.age/p.life,x=sxL(p.x),y=syL(p.y)-Math.round(p.z/A);
    lx.globalAlpha=Math.min(1,f*1.6);
    if(p.g==='heart'){lx.fillStyle=p.c;const s=f>.5?1:0;for(let yy=0;yy<HEART.length;yy++)for(let xx=0;xx<7;xx++)if(HEART[yy][xx]==='R')lx.fillRect(x-3+xx,y-3+yy,1,1)}
    else if(p.g==='note'){lx.fillStyle=p.c;lx.fillRect(x,y-4,1,5);lx.fillRect(x-2,y,3,2);lx.fillRect(x+1,y-4,2,1)}
    else if(p.g==='spark'){lx.fillStyle=p.c;lx.fillRect(x,y-1,1,3);lx.fillRect(x-1,y,3,1)}
    else if(p.g==='rise'){lx.fillStyle=p.c;const s=f>.5?2:1;lx.fillRect(x,y,s,s+1)}
    else{lx.fillStyle=p.c;lx.fillRect(x,y,2,1);lx.fillRect(x+1,y+1,1,1)}
  }
  lx.globalAlpha=1;
}
REG.draw.push((Ls,iv)=>{
  if(!P||!P.actor)return;const sty=myStyle();
  if(TR.length)Ls.push({y:P.y+1,f:drawTrail});
  if(sty.back!=='none'||sty.hat!=='none'){
    Ls.push({y:P.y-.01,f:()=>{if(P.dying>0&&P.dying<=0)return;lx.globalAlpha=P.dying>0?clamp(P.dying/.6,0,1):1;drawStyleWorld(P.actor,P.x,P.y,'back',sty);lx.globalAlpha=1}});
    Ls.push({y:P.y+.01,f:()=>{lx.globalAlpha=P.dying>0?clamp(P.dying/.6,0,1):1;drawStyleWorld(P.actor,P.x,P.y,'front',sty);lx.globalAlpha=1}});
  }
  for(const f of FP){if(!f.sty||(f.sty.hat==='none'&&f.sty.back==='none')||!iv(f.x,f.y,100,100))continue;
    Ls.push({y:f.y-.01,f:()=>drawStyleWorld(f.actor,f.x,f.y,'back',f.sty)});Ls.push({y:f.y+.01,f:()=>drawStyleWorld(f.actor,f.x,f.y,'front',f.sty)})}
});

/* ---------- หน้าต่างห้องแต่งตัว ---------- */
const ST={tab:'dye',tryC:null,tryI:null,ang:Math.PI/2,timer:0,pa:null};
(function(){
  const d=document.createElement('div');d.id='winStyle';d.className='win panel sm';d.style.cssText='z-index:5;width:min(600px,96vw)';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`
#winStyle .wrap{display:flex;gap:10px;align-items:flex-start}
#winStyle .pv{flex:none;width:240px;text-align:center}
#winStyle .pv canvas{width:240px;height:288px;image-rendering:pixelated;background:linear-gradient(#27406a,#3c6a45 72%,#2d4a26);border:2px solid #c9a24b;cursor:pointer}
#winStyle .opts{flex:1;min-width:0}
#winStyle .sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:5px;margin-bottom:6px}
#winStyle .sw button{position:relative;padding:3px 0 2px;font-size:11px;font-weight:bold;color:#fff;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a}
#winStyle .sw button i{display:block;height:20px;margin:0 4px 2px;border:1px solid #000}
#winStyle .sw button.on{box-shadow:inset 0 0 0 2px #7cc85e}
#winStyle .sw button.try{box-shadow:inset 0 0 0 2px #ffd27a}
#winStyle .sw button .lk{position:absolute;top:0;right:2px;font-size:10px}
#winStyle .ic{font-size:20px;width:30px;text-align:center}
#winStyle .buy{margin-top:6px;padding:6px 8px;background:#2a2410;border:2px solid #c9a24b;color:#ffe28a;font-weight:bold}
@media(max-width:560px){#winStyle .wrap{flex-direction:column;align-items:center}#winStyle .opts{width:100%}}`;
  document.head.appendChild(s);
})();
function trySty(){const s=Object.assign({},myStyle());if(ST.tryC)s[ST.tryC]=ST.tryI;return s}
function styPick(cat,id){
  const it=itemOf(cat,id);
  if(owns(cat,id)){const s=myStyle();s[cat]=id;ST.tryC=null;sfx('click');refreshStyle();return}
  ST.tryC=cat;ST.tryI=id;refreshStyle();
}
function styBuy(){
  if(!ST.tryC)return;const it=itemOf(ST.tryC,ST.tryI);
  if(P.zeny<it.price){say('Zeny ไม่พอ','#ff9d9a');return}
  P.zeny-=it.price;const s=myStyle();s.own[ST.tryC+':'+ST.tryI]=1;s[ST.tryC]=ST.tryI;
  sfx('loot',2);toast(`ซื้อ ${it.n} แล้ว!`);ring&&ring(P.x,P.y,70,'#ffe28a',.7);ST.tryC=null;save(false);refreshStyle();
}
function styCancel(){ST.tryC=null;refreshStyle()}
function swCol(cat,it){
  if(cat==='dye'){if(it.id==='orig')return'linear-gradient(135deg,#6a7ab8,#c8a060)';return it.id==='black'?'#2b2b38':it.id==='white'?'#f2f2f2':`hsl(${it.h} 62% 50%)`}
  if(cat==='hair'){if(it.id==='orig')return'linear-gradient(135deg,#4a5ad8,#8a9aff)';return`hsl(${it.h} ${Math.round(it.s*100)}% ${Math.min(90,Math.round(36*it.lm))}%)`}
  if(cat==='skin'){if(it.id==='orig')return'linear-gradient(135deg,#f6c9a0,#c88a60)';return`hsl(${it.h==null?22:it.h} ${Math.round(70*Math.min(1,it.sm))}% ${Math.min(92,Math.round(72*it.lm))}%)`}
  if(cat==='shirt'){if(it.id==='none')return'linear-gradient(135deg,#f6c9a0,#c88a60)';return`hsl(${it.h} ${Math.round(it.s*100)}% ${Math.round(it.l*100)}%)`}
  return'#444';
}
function styRow(cat,it){
  const own=owns(cat,it.id),cur=myStyle()[cat]===it.id,tr=ST.tryC===cat&&ST.tryI===it.id;
  return`<div class="eqr${cur?' cur':''}"><span class="ic">${it.ic||'—'}</span><div class="nm"><b>${it.n}</b><br><span class="small">${own?(cur?'กำลังใส่':'เป็นเจ้าของแล้ว'):it.price.toLocaleString()+' Zeny'}</span></div><button onclick="styPick('${cat}','${it.id}')">${cur&&it.id!=='none'?'ถอด':own?'ใส่':tr?'ลองอยู่':'ลองดู'}</button></div>`;
}
function refreshStyle(){
  const w=$('winStyle');if(!w||w.style.display!=='block')return;
  const sty=myStyle(),tabs=['dye','hair','skin','shirt','hat','back','trail'],cat=ST.tab,list=CATS[cat];let body='';
  const ban=cat==='shirt'&&P.cls!=='warrior'?'<div class="small">ใช้ได้กับ<b>นักรบ</b>เท่านั้น (อาชีพอื่นสวมเสื้ออยู่แล้ว — ลองเปลี่ยน "สีชุด")</div>':
    cat==='hair'&&P.cls==='mage'?'<div class="small">จอมเวทสวมหมวกคลุมผมอยู่ — สีผมไม่มีผล ลอง "สีชุด" แทน</div>':
    cat==='hat'&&P.cls==='mage'?'<div class="small">จอมเวทสวมหมวกพ่อมดอยู่แล้ว ใส่ได้เฉพาะ <b>ฮาโล</b></div>':'';
  if(['dye','hair','skin','shirt'].includes(cat)){
    const note={dye:'สีชุด 400 Zeny/สี (ดำ-ขาว 600)',hair:'สีผม 250-400 Zeny',skin:'สีผิวพื้นฐานใส่ฟรีทุกสี (สีแฟนตาซี 500)',shirt:'ทาเสื้อ 300 Zeny/สี'}[cat];
    body=`<div class="small" style="margin-bottom:5px">${note} • ซื้อครั้งเดียวใช้ได้ตลอด • กดสีเพื่อลองก่อนซื้อ</div>${ban}<div class="sw">${list.map(it=>{
      const own=owns(cat,it.id),cls=sty[cat]===it.id?'on':ST.tryC===cat&&ST.tryI===it.id?'try':'';
      return`<button class="${cls}" onclick="styPick('${cat}','${it.id}')"><i style="background:${swCol(cat,it)}"></i>${it.n}${own?'':'<span class="lk">🔒</span>'}</button>`}).join('')}</div>`;
  }else{
    body=ban+list.map(it=>styRow(cat,it)).join('');
  }
  let buy='';
  if(ST.tryC){const it=itemOf(ST.tryC,ST.tryI);buy=`<div class="buy">กำลังลอง: ${CATN[ST.tryC]} "${it.n}" — ${it.price.toLocaleString()} Zeny <div style="margin-top:5px"><button onclick="styBuy()" ${P.zeny>=it.price?'':'disabled'}>ซื้อและใส่</button> <button onclick="styCancel()">ยกเลิก</button> <span class="small">(มี ${P.zeny.toLocaleString()}z)</span></div></div>`}
  w.innerHTML=`<h3><span>👗 ห้องแต่งตัว</span><button class="x" onclick="toggleWin('winStyle')">✕</button></h3>
    <div class="tabs2" style="flex-wrap:wrap">${tabs.map(k=>`<button class="${cat===k?'on':''}" style="min-width:64px" onclick="ST.tab='${k}';ST.tryC=null;refreshStyle()">${CATN[k]}</button>`).join('')}</div>
    <div class="wrap"><div class="pv"><canvas id="stPv" width="80" height="96" title="คลิกเพื่อหมุน"></canvas><div class="small">คลิกที่ภาพเพื่อหมุนตัว</div></div><div class="opts">${body}${buy}</div></div>`;
  const pv=$('stPv');pv.onclick=()=>{ST.ang=ST.ang===Math.PI/2?Math.PI:ST.ang===Math.PI?-Math.PI/2:ST.ang===-Math.PI/2?0:Math.PI/2};
  ST.pa=makeActor(CLASSES[P.cls].sprite);
  drawStylePv();clearInterval(ST.timer);ST.timer=setInterval(()=>{const w=$('winStyle');if(!w||w.style.display!=='block'||!$('stPv')){clearInterval(ST.timer);return}drawStylePv()},90);
}
function drawStylePv(){
  const c=$('stPv');if(!c||!ST.pa)return;const g=c.getContext('2d'),a=ST.pa,S=SHEETS[CLASSES[P.cls].sprite];
  a.ang=ST.ang;a.t=tNow();a.anim='idle';g.clearRect(0,0,c.width,c.height);
  styledPortrait(g,a,40,90,1,trySty());   // แคนวาส 80x96 ขยาย 3 เท่าด้วย CSS
}
WINX.winStyle=refreshStyle;
(function(){
  if(!STYLE_ON){const st=document.createElement('style');st.textContent='#bStyle,#winStyle{display:none!important}';document.head.appendChild(st);return}   // ปิดระบบ: ซ่อนปุ่ม/หน้าต่าง (ธีมเมนูจะรีเซ็ต style inline จึงใช้ CSS)
  const b=$('bStyle');if(b)b.onclick=()=>toggleWin('winStyle');
})();
addEventListener('keydown',e=>{if(!P||!STYLE_ON)return;if(keyName(e)==='v')toggleWin('winStyle')});

// เมนูรวม: คลิกนอกเมนู = ปิด
addEventListener('pointerdown',e=>{const t=$('top');if(t&&t.classList.contains('open')&&!t.contains(e.target))t.classList.remove('open')},true);
