/* ============ ความลึกของเกม ============
   1) ธาตุ + จุดอ่อน   2) ความสามารถเลือกสาย (Talent)   3) การ์ดมอนสเตอร์   4) บอสมีเฟส + วงอันตราย
   5) ดันเจี้ยนเลือกบัฟระหว่างทาง (rogue-lite)   6) อีเวนต์สุ่มในแมพ (ขุมทรัพย์ / หมอกปีศาจ)   + ระบบบัฟกลาง (ใช้ร่วมกับ f_life.js)
   ข้อมูลผู้เล่นเก็บใน P.dx (บันทึกไปกับเซฟ) */

/* ---------- ข้อมูลพื้นฐาน ---------- */
const EL={fire:{n:'ไฟ',ic:'🔥',c:'#ff7a3a'},ice:{n:'น้ำแข็ง',ic:'❄️',c:'#8fd8ff'},thunder:{n:'สายฟ้า',ic:'⚡',c:'#ffe86a'},poison:{n:'พิษ',ic:'☠️',c:'#9be58a'},dark:{n:'มืด',ic:'🌑',c:'#b98cff'}};
const EL_ORDER=['fire','ice','thunder','poison','dark'];
// ธาตุของมอนสเตอร์ -> ธาตุที่ชนะทาง (ดาเมจ x1.5)  /  ธาตุเดียวกันโดนต้านทาน (x0.6)
const WEAKTO={fire:['ice'],ice:['fire'],thunder:['poison'],poison:['thunder'],dark:['fire','thunder']};
const MEL={};
for(const [el,ks] of Object.entries({fire:['cp_imp','cp_fwisp','cp_demon','cp_rdemon','cp_felem','cp_hellh','cp_sdragon'],
  ice:['cp_wolfD','cp_trollA2','cp_trollA3'],
  thunder:['cp_bat','cp_beetle','cp_garg','cp_hound','jinnLord'],
  poison:['cp_slime','cp_mush','cp_spider','cp_spiderS','cp_scorp','cp_snake','cp_flower','cp_lizard','cp_zombie','cp_mantis','cp_medusa','cp_snail'],
  dark:['minion','srogue','smage','swarrior','boss','cp_ghost','cp_reaper','cp_hooded','cp_were','cp_deer','cp_dragon','dragonLord']}))for(const k of ks)MEL[k]=el;
// ธาตุประจำสกิลของแต่ละอาชีพ (null = ไร้ธาตุ)  — ช่อง 4 (ท่าไม้ตายอาชีพขั้นสูง) ใช้ธาตุหลักของอาชีพ
const SKEL={warrior:[null,null,null,null],mage:['dark','dark','dark','dark'],archer:['thunder','thunder','thunder','thunder'],rogue:[null,'fire','thunder','fire']};
let DXC=null;   // ค่าพิเศษรวม (คำนวณใหม่ทุกครั้งที่ recalcGear)
const freshX=()=>({el:{},vs:{},weak:0,ls:0,cdr:0,critd:0,boss:0,elite:0,dmg:0,killSp:0,killHp:0,cardx:1,conv:null});
DXC=freshX();
const hashStr=s=>{let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const pct=v=>Math.round(v*1000)/10;

/* ---------- ความสามารถเลือกสาย ---------- */
const TAL=[
  {lv:10,n:'พรสวรรค์',o:[
    {id:'a',n:'นักสู้ใจกล้า',d:'ATK +4% • คริติคอล +3',b:{atk:.04,crit:3}},
    {id:'b',n:'ผิวหนา',d:'HP +8% • DEF +4',b:{hp:.08,def:4}},
    {id:'c',n:'นักล่าโชคดี',d:'EXP +6% • Zeny +10%',b:{exp:.06,zeny:.1}}]},
  {lv:25,n:'แปรธาตุ',o:EL_ORDER.slice(0,4).map(e=>({id:e,n:`พลัง${EL[e].n}`,d:`สกิล/โจมตีทุกอย่างกลายเป็นธาตุ${EL[e].ic}${EL[e].n} • ดาเมจธาตุนี้ +12%`,x:{conv:e,el:{[e]:.12}}}))},
  {lv:40,n:'สายต่อสู้',o:[
    {id:'ls',n:'กระหายเลือด',d:'ดูดเลือด 3% ของดาเมจที่ทำ',x:{ls:.03}},
    {id:'cd',n:'สกิลไว',d:'คูลดาวน์สกิล -15%',x:{cdr:.15}},
    {id:'sp',n:'จิตเวท',d:'SP สูงสุด +25% • ฆ่ามอนสเตอร์ฟื้น SP 2',b:{sp:.25},x:{killSp:2}}]},
  {lv:60,n:'จุดแข็ง',o:[
    {id:'cr',n:'พลังทำลาย',d:'ดาเมจคริติคอล/สกิล +35%',x:{critd:.35}},
    {id:'bo',n:'นักล่าหัวหน้า',d:'ดาเมจใส่บอส/ผู้นำ +25%',x:{boss:.25,elite:.25}},
    {id:'un',n:'ไม่ยอมล้ม',d:'ฆ่ามอนสเตอร์ฟื้น HP 2% • DEF +6',b:{def:6},x:{killHp:.02}}]},
  {lv:80,n:'ขั้นสูงสุด',o:[
    {id:'wk',n:'เล็งจุดอ่อน',d:'ตีโดนจุดอ่อนธาตุแรงขึ้น (x1.5 → x2.0)',x:{weak:.5}},
    {id:'lk',n:'โชคมหาศาล',d:'การ์ดดรอป x2 • Zeny +15%',b:{zeny:.15},x:{cardx:2}},
    {id:'kg',n:'ราชานักสู้',d:'ATK +10% • HP +10%',b:{atk:.1,hp:.1}}]}
];
const talResetCost=()=>1500+P.lv*40;

/* ---------- บัฟ (ใช้ร่วมกับอาหาร/ม้วนจากพ่อค้า/หมอก) ---------- */
const BUFFS={
  fog:{n:'หมอกปีศาจ',ic:'🌫️',g:'fog',b:{exp:.4}},
  scrollExp:{n:'ม้วน EXP',ic:'📜',g:'scroll',b:{exp:.3}},
  scrollAtk:{n:'ม้วนพลัง',ic:'📕',g:'scroll',b:{atk:.15}},
  scrollDef:{n:'ม้วนเกราะ',ic:'📘',g:'scroll',b:{hp:.15,def:8}},
  potExp15:{n:'ยา EXP x1.5',ic:'🧪',g:'potexp',b:{exp:.5}},
  potExp2:{n:'ยา EXP x2',ic:'⚗️',g:'potexp',b:{exp:1}}
};
function dxBuffList(){return(P&&P.dx&&P.dx.buffs)||[]}
function addBuff(id,mins){
  const def=BUFFS[id];if(!def||!P||!P.dx)return;
  P.dx.buffs=dxBuffList().filter(b=>!(BUFFS[b.id]&&BUFFS[b.id].g===def.g));   // กลุ่มเดียวกันซ้อนกันไม่ได้ (แทนที่)
  P.dx.buffs.push({id,until:Date.now()+mins*60000});
  recalcGear();P.hp=Math.min(P.hp,maxHp());
}

/* ---------- การ์ดมอนสเตอร์ ---------- */
const CARD_TY=['atk','hp','def','crit','exp','zeny','sp','vs'];
function cardEff(k){
  const d=MOBS[k];if(!d)return null;
  const me=MEL[k]||null,tier=d.boss?2.6:d.elite?1.6:1,base=(1+d.lv/25)*tier;
  let ty=CARD_TY[hashStr(k)%CARD_TY.length];if(ty==='vs'&&!me)ty='atk';
  const e={ty,tier:d.boss?2:d.elite?1:0};
  if(ty==='atk'){e.b={atk:base/100};e.t=`ATK +${pct(base/100)}%`}
  else if(ty==='hp'){e.b={hp:base/100};e.t=`HP +${pct(base/100)}%`}
  else if(ty==='def'){const v=Math.round(1+d.lv*.12*tier);e.b={def:v};e.t=`DEF +${v}`}
  else if(ty==='crit'){const v=Math.round(1+d.lv/40*tier);e.b={crit:v};e.t=`คริติคอล +${v}`}
  else if(ty==='exp'){e.b={exp:base*.8/100};e.t=`EXP +${pct(base*.8/100)}%`}
  else if(ty==='zeny'){e.b={zeny:base*1.2/100};e.t=`Zeny +${pct(base*1.2/100)}%`}
  else if(ty==='sp'){e.b={sp:base/100};e.t=`SP +${pct(base/100)}%`}
  else{const v=base*1.5/100;e.x={vs:{[me]:v}};e.t=`ดาเมจใส่มอนธาตุ${EL[me].ic}${EL[me].n} +${pct(v)}%`}
  return e;
}
const cardSlots=()=>2+(P.lv>=30?1:0)+(P.lv>=60?1:0);
const cardKeys=()=>Object.keys(P.dx.cards).filter(k=>MOBS[k]).sort((a,b)=>MOBS[b].lv-MOBS[a].lv);
function giveCard(k,x,y,why){
  return;   // ยกเลิกระบบการ์ด
  if(!P||!P.dx||!MOBS[k])return;const d=MOBS[k],isNew=!P.dx.cards[k];
  P.dx.cards[k]=(P.dx.cards[k]||0)+1;
  sfx('loot',3);toast(`🃏 ได้การ์ด ${d.name}${isNew?' (ใหม่!)':''}`);say(`🃏 การ์ด${d.name} — ${cardEff(k).t}${isNew?'':' (ซ้ำ)'}`,'#e9c6ff');
  if(x!=null){float(x,y-d.h-76,'🃏 การ์ด!','#e9c6ff',true);ring(x,y,60,'#e9c6ff',.6)}
  if(isNew){recalcGear();if(typeof storyCheck==='function')storyCheck()}
  refreshDepth();
}
function equipCard(k){
  const cs=P.dx.cs;if(cs.includes(k))return;
  let i=cs.findIndex((v,j)=>j<cardSlots()&&!v);if(i<0&&cs.length<cardSlots())i=cs.length;
  if(i<0){say('ช่องการ์ดเต็ม — ถอดใบอื่นก่อน','#ffb36b');return}
  cs[i]=k;recalcGear();P.hp=Math.min(P.hp,maxHp());sfx('click');refreshDepth();
}
function unequipCard(k){const i=P.dx.cs.indexOf(k);if(i>=0)P.dx.cs[i]=null;recalcGear();P.hp=Math.min(P.hp,maxHp());refreshDepth()}
function cardDupToGem(){
  let g=0;for(const k in P.dx.cards){const ex=P.dx.cards[k]-1;if(ex>=3){const n=Math.floor(ex/3);g+=n;P.dx.cards[k]-=n*3}}
  if(!g){say('ต้องมีการ์ดซ้ำอย่างน้อย 3 ใบ (นอกจากใบแรก) ต่อชนิด','#ccc');return}
  addMat('gem',g);toast(`แลกการ์ดซ้ำได้ หินเวท x${g}`);refreshDepth();
}
REG.kill.push(m=>{
  if(!P||!P.dx)return;const d=m.d,X=DXC;
  if(X.killSp)P.sp=Math.min(maxSp(),P.sp+X.killSp);
  if(X.killHp)P.hp=Math.min(maxHp(),P.hp+maxHp()*X.killHp);
  // สมุนไพร (ใช้ทำอาหารที่ f_life.js)
  const hk=MAPID==='forest'?'g':MAPID==='desert'?'d':MAPID==='snow'||MAPID==='deepwood'||MAPID==='ruinvillage'?'i':null;
  if(hk&&!MAP.dungeon&&Math.random()<(d.boss?1:d.elite?.35:.05)){const n=d.boss?3:1;P.dx.herb[hk]=(P.dx.herb[hk]||0)+n;float(m.x,m.y-d.h-88,'🌿','#9be58a')}
});

/* ---------- คำนวณโบนัสรวม (ต่อยอดจาก f_progress.js) ---------- */
let DGB=[];   // บัฟที่เลือกระหว่างดันเจี้ยนรอบนี้
const FE={t:200,treasure:null,fog:0};
const _bonusMods=bonusMods;
function mergeX(X,o){
  for(const k in o){
    if(k==='el'||k==='vs'){for(const e in o[k])X[k][e]=(X[k][e]||0)+o[k][e]}
    else if(k==='conv')X.conv=o.conv;
    else if(k==='cardx')X.cardx=Math.max(X.cardx,o.cardx);
    else X[k]=(X[k]||0)+o[k];
  }
}
bonusMods=function(){
  const b=_bonusMods(),X=freshX();DXC=X;
  if(!P||!P.dx)return b;
  const add=o=>{if(o)for(const k in o)b[k]=(b[k]||0)+o[k]};
  const now=Date.now();
  for(const bf of dxBuffList()){const def=BUFFS[bf.id];if(def&&bf.until>now){add(def.b);if(def.x)mergeX(X,def.x)}}
  if(FE.fog>0)add(BUFFS.fog.b);
  for(const g of DGB){add(g.b);if(g.x)mergeX(X,g.x)}
  return b;
};
function afterNewPlayerDx(){
  P.dx=Object.assign({tal:{},imbue:null,cards:{},cs:[],herb:{g:0,d:0,i:0},fish:{},rod:1,buffs:[],story:{ch:0,st:0,p:0},stat:{fish:0,cook:0,dg:0},seen:{}},P.dx||{});
  P.dx.herb=Object.assign({g:0,d:0,i:0},P.dx.herb);P.dx.stat=Object.assign({fish:0,cook:0,dg:0},P.dx.stat);P.dx.story=Object.assign({ch:0,st:0,p:0},P.dx.story);
  P.dx.fish=P.dx.fish||{};P.dx.buffs=P.dx.buffs||[];P.dx.cs=P.dx.cs||[];
  recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());
}
const _anp=afterNewPlayer;
afterNewPlayer=function(){_anp();afterNewPlayerDx()};

/* ---------- ธาตุ: ครอบคลุมทั้งสกิล โจมตีธรรมดา และกระสุน ---------- */
// ยกเลิกระบบธาตุ: ไม่มีธาตุสกิล/ธาตุอาวุธ ไม่มีจุดอ่อน-ต้านทาน (โค้ดเดิมคงไว้ ไม่ทำงาน)
const talConv=()=>null;
const skEl=i=>null;
const basicEl=()=>null;
const curEl=()=>basicEl()||skEl(0);
const _useSkill=useSkill;
useSkill=function(i){
  if(!P||!P.dx)return _useSkill(i);
  const before=P.skCd[i];SKCTX=i;
  try{_useSkill(i)}finally{SKCTX=null}
  if(before<=0&&P.skCd[i]>0&&DXC.cdr)P.skCd[i]*=1-DXC.cdr;
};
const _startAnim=startAnim;
startAnim=function(o){
  if(o&&o.hit&&P&&P.dx){
    const el=SKCTX!=null?skEl(SKCTX):basicEl(),h=o.hit;
    o.hit=function(){const p=ELCTX;ELCTX=el;try{h.apply(this,arguments)}finally{ELCTX=p}};
  }
  return _startAnim(o);
};
const _setTG=setTimeoutGame;
setTimeoutGame=function(t,fn){const el=ELCTX;_setTG(t,function(){const p=ELCTX;ELCTX=el;try{fn()}finally{ELCTX=p}})};
const _shoot=shoot;
shoot=function(){_shoot.apply(this,arguments);const p=projs[projs.length-1];if(p&&!p.toP)p.el=ELCTX};
const _hitMob=hitMob;
hitMob=function(m,dmg,crit){
  if(!m||m.dead||!P||!P.dx)return _hitMob(m,dmg,crit);
  const el=null,me=null,X=DXC;let mult=1,tag=null;
  if(el&&me){if((WEAKTO[me]||[]).includes(el)){mult*=1.5+X.weak;tag='w'}else if(el===me){mult*=.6;tag='r'}}
  if(el&&X.el[el])mult*=1+X.el[el];
  if(me&&X.vs[me])mult*=1+X.vs[me];
  if(m.d.boss)mult*=1+X.boss;else if(m.d.elite)mult*=1+X.elite;
  if(crit)mult*=1+X.critd;
  const out=Math.max(1,Math.round(dmg*mult));
  _hitMob(m,out,crit);
  if(tag==='w')float(m.x+rnd(-8,8),m.y-m.d.h-20,'จุดอ่อน!'+(el?EL[el].ic:''),EL[el].c,true);
  else if(tag==='r'&&Math.random()<.35)float(m.x,m.y-m.d.h-20,'ต้านทาน','#9aa3b8');
  if(X.ls>0&&P.hp>0)P.hp=Math.min(maxHp(),P.hp+out*X.ls);
};

/* ---------- ป้ายธาตุเหนือมอนสเตอร์ ---------- */
REG.draw.push((Ls,iv)=>{
  return;   // ยกเลิกป้ายธาตุเหนือมอนสเตอร์
  if(!P||!P.dx||inTown(P.x,P.y))return;const my=curEl();
  for(const m of mobs){
    if(m.dead||!MEL[m.k]||!iv(m.x,m.y,240,340))continue;
    Ls.push({y:m.y+.5,f:()=>{
      const e=MEL[m.k],x=sxL(m.x),hL=Math.round(m.d.h/A),y=syL(m.y)-hL-12;
      px(x+9,y,4,4,'#120c08');px(x+10,y+1,2,2,EL[e].c);
      if(my){const w=(WEAKTO[e]||[]).includes(my),r=my===e;
        if(w){px(x+10,y-3,2,1,'#7cff7c');px(x+9,y-2,4,1,'#7cff7c')}
        else if(r){px(x+9,y+5,4,1,'#ff7c7c');px(x+10,y+6,2,1,'#ff7c7c')}}
    }});
  }
});

/* ---------- บอสมีเฟส + วงอันตรายบนพื้น ---------- */
const ZONES=[];
function bossAdds(m,n){
  const pool=((MAP.dungeon&&typeof DG!=='undefined'&&DG)?DG.pool:MAP.spawns.map(s=>s[0])).filter(k=>MOBS[k]&&!MOBS[k].boss&&!MOBS[k].elite);
  if(!pool.length)return;
  pool.sort((a,b)=>Math.abs(MOBS[a].lv-(m.d.lv-6))-Math.abs(MOBS[b].lv-(m.d.lv-6)));
  for(let i=0;i<n;i++){
    const k=pool[0];let pos=null;
    for(let t=0;t<20&&!pos;t++){const a=rnd(0,6.28),r=rnd(110,230),x=m.x+Math.cos(a)*r,y=m.y+Math.sin(a)*r*.8;if(walkable(x,y))pos={x,y}}
    if(!pos)continue;
    const a2=mkMob(k,pos.x,pos.y);a2.temp=true;a2.aggro=true;a2.add=1;a2.actor=makeActor(a2.d.sprite,a2.d.px||1);a2.actor.ang=rnd(0,6.3);mobs.push(a2);
    ring(pos.x,pos.y,40,'#ff6b66',.5);
  }
}
function castZones(m,ph){
  const n=ph,dmg=Math.round(m.d.atk*1.7);
  for(let i=0;i<n;i++){
    let x=P.x,y=P.y;if(i>0){const a=rnd(0,6.28),r=rnd(70,200);x+=Math.cos(a)*r;y+=Math.sin(a)*r*.7}
    ZONES.push({x,y,r:62+ph*8,t:0,dur:1.5,dmg,m});
  }
  float(m.x,m.y-m.d.h-12,'⚠ หนีออกจากวงแดง!','#ff6b66',true);sfx('alert');
}
REG.tick.push((dt,alive)=>{
  if(!P)return;
  for(const m of mobs){
    if(m.dead||!m.d.boss||!m.aggro||m.d.world&&0)continue;
    const b=m.bx||(m.bx={cast:rnd(3,5),ph:1});
    const f=m.hp/m.mx,ph=f<.33?3:f<.66?2:1;
    if(ph>b.ph){
      b.ph=ph;
      m.d=Object.assign({},m.d,{atk:Math.round(m.d.atk*1.18),spd:Math.round(m.d.spd*1.2)});   // เฉพาะตัวนี้ (เกิดใหม่แล้วรีเซ็ต)
      shake=Math.max(shake,5);ring(m.x,m.y,200,ph===3?'#ff3030':'#ffb36b',.9);sfx('boss');
      float(m.x,m.y-m.d.h-24,ph===3?'🔥 คลั่งเต็มที่!':'💢 บอสโกรธ!','#ff8a85',true);
      say(ph===3?`${m.d.name} คลั่งเต็มที่! วงอันตรายถี่ขึ้น`:`${m.d.name} เริ่มโกรธ! เรียกสมุนมาช่วย`,'#ff8a85');
      bossAdds(m,ph===2?3:4);
    }
    b.cast-=dt;
    if(alive&&b.cast<=0&&dist(m,P)<600){b.cast=(ph===1?5.8:ph===2?4.4:3.3)+rnd(0,1.2);castZones(m,ph)}
  }
  for(let i=ZONES.length-1;i>=0;i--){
    const z=ZONES[i];z.t+=dt;
    if(z.m&&z.m.dead||!alive&&z.t>.3){ZONES.splice(i,1);continue}
    if(z.t>=z.dur){
      ring(z.x,z.y,z.r,'#ffffff',.35);ring(z.x,z.y,z.r*.7,'#ff6b66',.45);burst(z.x,z.y-10,'#ff8a5a',14);shake=Math.max(shake,3);
      if(Math.hypot(P.x-z.x,(P.y-z.y)*1.4)<z.r&&P.hp>0&&P.dying<=0){damagePlayer(z.dmg);float(P.x,P.y-60,'โดนวงแดง!','#ff6b66',true)}
      ZONES.splice(i,1);
    }
  }
});
REG.draw.push((Ls,iv)=>{
  if(!ZONES.length)return;
  Ls.push({y:-1e6,f:()=>{
    for(const z of ZONES){
      const x=sxL(z.x),y=syL(z.y),rx=Math.round(z.r/A),ry=Math.round(rx*.62),p=clamp(z.t/z.dur,0,1);
      lx.globalAlpha=.1+.32*p;pxEllipse(x,y,rx,ry,'#ff2a2a',true);
      lx.globalAlpha=.9;pxEllipse(x,y,rx,ry,p>.7&&Math.floor(z.t*14)%2?'#ffffff':'#ff4a4a',false);
      lx.globalAlpha=.55;pxEllipse(x,y,Math.max(1,Math.round(rx*p)),Math.max(1,Math.round(ry*p)),'#ff7a5a',false);
      lx.globalAlpha=1;
    }
  }});
});

/* ---------- ดันเจี้ยน: เลือกบัฟระหว่างคลื่น ---------- */
const BOONS=[
  {id:'atk',n:'ใจนักรบ',ic:'⚔️',d:'ATK +15%',b:{atk:.15}},
  {id:'crit',n:'ตาเหยี่ยว',ic:'🎯',d:'คริติคอล +10',b:{crit:10}},
  {id:'hp',n:'ผิวเหล็ก',ic:'🛡️',d:'HP สูงสุด +20% และฟื้น 50% ทันที',b:{hp:.2},now:()=>{P.hp=Math.min(maxHp(),P.hp+maxHp()*.5)}},
  {id:'ls',n:'กระหายเลือด',ic:'🩸',d:'ดูดเลือด 6% ของดาเมจ',x:{ls:.06}},
  {id:'cdr',n:'สกิลไว',ic:'⏩',d:'คูลดาวน์สกิล -25%',x:{cdr:.25}},
  {id:'spd',n:'เท้าลม',ic:'💨',d:'ความเร็วเดิน +25',b:{spd:25}},
  {id:'el',n:'ธาตุผันผวน',ic:'🌀',d:'สกิลทั้งหมดกลายเป็นธาตุสุ่ม ดาเมจธาตุนั้น +30%',roll:true},
  {id:'boss',n:'ล่าผู้คุม',ic:'👹',d:'ดาเมจใส่บอส/ผู้นำ +35%',x:{boss:.35,elite:.35}},
  {id:'kill',n:'ฆ่าแล้วฟื้น',ic:'💖',d:'ฆ่ามอนสเตอร์ฟื้น HP 4% และ SP 5',x:{killHp:.04,killSp:5}},
  {id:'dmg',n:'พลังดิบ',ic:'💥',d:'ดาเมจทั้งหมด +12% และ DEF +5',x:{dmg:.12},b:{def:5}}
];
let BOONUI=null;
(function(){
  const d=document.createElement('div');d.id='boonUI';d.style.cssText='position:fixed;inset:0;display:none;z-index:7;background:rgba(5,8,20,.55);align-items:center;justify-content:center;flex-direction:column;gap:10px;padding:14px';
  d.innerHTML='<div style="color:#ffe28a;font-weight:bold;font-size:18px;text-shadow:2px 2px 0 #000" id="boonT">เลือกพร 1 อย่าง</div><div id="boonC" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"></div><div class="small" id="boonS" style="color:#ccd"></div>';
  document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`#boonC button{width:150px;min-height:128px;padding:10px 8px;background:linear-gradient(#2c3668,#171c3a);border:3px solid #0b0d18;box-shadow:inset 0 0 0 2px #c9a24b,4px 4px 0 rgba(0,0,0,.45);color:#fff;font-size:13px;line-height:1.4}
#boonC button:hover{background:linear-gradient(#3d4a8a,#232a56)}#boonC button b{display:block;font-size:15px;color:#ffe28a;margin:4px 0}#boonC button i{font-style:normal;font-size:30px}`;
  document.head.appendChild(s);
})();
function offerBoons(){
  const have=new Set(DGB.map(g=>g.id)),pool=BOONS.filter(b=>!have.has(b.id)).sort(()=>Math.random()-.5).slice(0,3);
  if(!pool.length)return false;
  $('boonT').textContent=DG&&DG.wave===0?'พรแห่งดันเจี้ยน — เลือก 1 อย่างก่อนเริ่ม':'ผ่านคลื่นแล้ว! เลือกพร 1 อย่าง';
  $('boonS').textContent=DGB.length?'พรที่มี: '+DGB.map(g=>g.n).join(' • '):'พรมีผลจนออกจากดันเจี้ยน';
  $('boonC').innerHTML=pool.map(b=>`<button onclick="pickBoon('${b.id}')"><i>${b.ic}</i><b>${b.n}</b>${b.d}</button>`).join('');
  $('boonUI').style.display='flex';BOONUI=true;return true;
}
function pickBoon(id){
  const b=BOONS.find(q=>q.id===id);if(!b)return;
  const g={id:b.id,n:b.n,b:b.b,x:b.x};
  if(b.roll){const e=EL_ORDER.slice(0,4)[Math.random()*4|0];g.x={conv:e,el:{[e]:.3}};g.n=`ธาตุผันผวน(${EL[e].n})`}
  DGB.push(g);if(b.now)b.now();
  $('boonUI').style.display='none';BOONUI=null;if(DG){DG.bn=DG.wave;DG.t=2.5}
  recalcGear();sfx('levelup');toast(`${b.ic} ได้พร: ${g.n}`);
}
const _dgInit=dgInit;
dgInit=function(){DGB.length=0;BOONUI=null;$('boonUI').style.display='none';_dgInit();if(DG)DG.bn=-1;recalcGear()};
const _dgDone=dgDone;
dgDone=function(){_dgDone();if(P.dx){P.dx.stat.dg++;if(typeof storyCheck==='function')storyCheck()}};
REG.tick.push((dt)=>{
  if(!P||!P.dx)return;
  if(!MAP.dungeon){if(DGB.length){DGB.length=0;recalcGear()}if(BOONUI){$('boonUI').style.display='none';BOONUI=null}return}
  if(!DG)return;
  if(BOONUI){DG.t=Math.max(DG.t,5);return}
  if(DG.state==='wait'&&DG.bn!==DG.wave&&P.hp>0&&P.dying<=0){DG.t=Math.max(DG.t,5);if(!offerBoons())DG.bn=DG.wave}
});

/* ---------- อีเวนต์สุ่มในแมพ: ขุมทรัพย์ / หมอกปีศาจ ---------- */
function startTreasure(){
  const pos=spawnNear(480,900);if(!pos)return false;
  FE.treasure={x:pos.x,y:pos.y,t:240};
  sfx('quest');toast('🗺 พบแผนที่ขุมทรัพย์!');say('🗺 ขุมทรัพย์ปรากฏในแมพ — ดูจุดสีทองกะพริบบนแผนที่เล็ก (ภายใน 4 นาที) ระวังกับดักมอนสเตอร์!','#ffe28a');
  return true;
}
function openTreasure(){
  const tr=FE.treasure;FE.treasure=null;
  sfx('loot',3);ring(tr.x,tr.y,120,'#ffe28a',.9);burst(tr.x,tr.y-20,'#ffe28a',28);shake=Math.max(shake,3);
  const rar=Math.random()<.3?3:2;
  giveReward({xp:.4,zeny:P.lv*140+600,ore:ri(3,6),gem:ri(1,2),item:rar},'ขุมทรัพย์');toast('💎 เปิดขุมทรัพย์!');
  const ks=kindsHere();if(ks.length&&Math.random()<.5)giveCard(ks[Math.min(ks.length-1,ri(0,2))]);
  // กับดัก: มอนสเตอร์โผล่รอบหีบ
  const n=4;for(let i=0;i<n;i++){const a=i/n*6.28,x=tr.x+Math.cos(a)*130,y=tr.y+Math.sin(a)*90;if(!walkable(x,y))continue;
    const k=ks[0];if(!k)break;const m=mkMob(k,x,y);m.temp=true;m.aggro=true;m.actor=makeActor(m.d.sprite,m.d.px||1);m.actor.ang=rnd(0,6.3);mobs.push(m)}
  say('มอนสเตอร์ที่เฝ้าสมบัติโผล่มาแล้ว!','#ff8a85');
}
function startFog(){
  FE.fog=150;recalcGear();spawnMini();addBuffUi();
  sfx('alert');toast('🌫️ หมอกปีศาจปกคลุม!');say('🌫️ หมอกปีศาจ 2.5 นาที: EXP +40% และมินิบอสโผล่มา!','#cfd8ff');
}
REG.tick.push((dt,alive)=>{
  if(!P||!P.dx||!alive)return;
  if(FE.fog>0){FE.fog-=dt;if(FE.fog<=0){FE.fog=0;recalcGear();toast('หมอกจางลงแล้ว')}}
  if(MAP.dungeon||inTown(P.x,P.y)){return}
  FE.t-=dt;
  if(FE.t<=0){FE.t=rnd(260,420);if(!FE.treasure&&Math.random()<.62)startTreasure();else if(!FE.fog)startFog()}
  const tr=FE.treasure;
  if(tr){tr.t-=dt;
    if(tr.t<=0){FE.treasure=null;say('ขุมทรัพย์จมหายไปแล้ว...','#ccc')}
    else if(Math.hypot(P.x-tr.x,(P.y-tr.y)*1.3)<52)openTreasure()}
});
REG.mini.push((c,sx,sy)=>{
  const tr=FE.treasure;if(!tr)return;
  if(Math.floor(time*3)%2){c.fillStyle='#ffd84a';c.fillRect(Math.round(tr.x*sx)-2,Math.round(tr.y*sy)-2,5,5)}
});
REG.draw.push((Ls,iv)=>{
  const tr=FE.treasure;if(!tr||!iv(tr.x,tr.y,100,200))return;
  Ls.push({y:tr.y,f:()=>{
    const x=sxL(tr.x),y=syL(tr.y),pu=.6+.4*Math.sin(time*5);
    lx.globalCompositeOperation='lighter';
    const g=lx.createLinearGradient(0,y-90,0,y);g.addColorStop(0,'rgba(255,220,100,0)');g.addColorStop(1,`rgba(255,220,100,${.55*pu})`);lx.fillStyle=g;lx.fillRect(x-5,y-90,10,90);
    lx.globalCompositeOperation='source-over';
    const im=ART.chest;if(im)lx.drawImage(im,x-(im.width>>1),y-im.height+3);
    for(let i=0;i<4;i++){const ph=(time*.9+i/4)%1;lx.globalAlpha=1-ph;px(Math.round(x+Math.sin(i*2.4+time*2)*8),Math.round(y-8-ph*28),1,1,i%2?'#fff6a8':'#ffd84a')}
    lx.globalAlpha=1;
  }});
});
REG.names.push((TX,sc)=>{
  const tr=FE.treasure;if(!tr)return;const x=sxL(tr.x),y=syL(tr.y)-24;if(x<-60||x>LW+60||y<-30||y>LH+30)return;
  TX(x*sc,y*sc,`💎 ขุมทรัพย์ ${Math.ceil(tr.t)}s`,'#ffe28a',12);
});
REG.atmos.push(()=>{
  if(!P||FE.fog<=0)return;
  const env=Math.min(1,FE.fog/8,(150-FE.fog)/6+.2);
  lx.globalAlpha=.38*env;lx.fillStyle='#cfd8e6';lx.fillRect(0,0,LW,LH);
  lx.globalAlpha=.16*env;lx.fillStyle='#ffffff';
  for(let i=0;i<7;i++){const x=((time*6+i*97)%(LW+160))-80,y=(i*61+Math.sin(time*.4+i)*20)%LH;pxEllipse(Math.round(x),Math.round(y),60,14,'#ffffff',true)}
  lx.globalAlpha=1;
});

/* ---------- ป้ายบัฟบน HUD ---------- */
let buffEl=null;
function addBuffUi(){
  if(buffEl)return;const h=$('hud');if(!h)return;
  buffEl=document.createElement('div');buffEl.id='buffBar';buffEl.className='small';buffEl.style.cssText='margin-top:2px;color:#ffe28a;line-height:1.5';h.appendChild(buffEl);
}
let buffT=0;
REG.tick.push((dt)=>{
  if(!P||!P.dx)return;buffT-=dt;if(buffT>0)return;buffT=1;addBuffUi();
  const now=Date.now(),before=P.dx.buffs.length;
  P.dx.buffs=P.dx.buffs.filter(b=>BUFFS[b.id]&&b.until>now);
  if(P.dx.buffs.length!==before){recalcGear();P.hp=Math.min(P.hp,maxHp());toast('บัฟหมดเวลา')}
  const parts=P.dx.buffs.map(b=>`${BUFFS[b.id].ic}${Math.ceil((b.until-now)/60000)}น.`);
  if(FE.fog>0)parts.push(`🌫️${Math.ceil(FE.fog)}s`);
  if(DGB.length)parts.push(...DGB.map(g=>'✦'+g.n));
  if(buffEl)buffEl.textContent=parts.join('  ');
});

/* ---------- หน้าต่าง: ความสามารถ / ธาตุ / การ์ด ---------- */
const DP={tab:'tal'};
(function(){
  const d=document.createElement('div');d.id='winDepth';d.className='win panel sm';d.style.cssText='z-index:5;width:min(580px,96vw)';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`#winDepth .tier{margin:8px 0 2px}#winDepth .tier>b{color:#ffe28a}
#winDepth .slots{display:flex;gap:6px;margin:6px 0}#winDepth .slots .sl{flex:1;min-height:54px;padding:4px;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a;font-size:11px;text-align:center}
#winDepth .slots .sl.f{box-shadow:inset 0 0 0 2px #c58aff}#winDepth .slots .sl.lk{opacity:.4}
#winDepth .elc{display:flex;gap:5px;flex-wrap:wrap;margin:6px 0}#winDepth .elc button{padding:6px 8px;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a;color:#fff;font-weight:bold;font-size:12px}
#winDepth .elc button.on{box-shadow:inset 0 0 0 2px #7cc85e}
#winDepth .cd{display:flex;align-items:center;gap:8px}#winDepth .cd canvas{width:44px;height:44px;image-rendering:pixelated;background:#0b0d18;border:2px solid #39406a;flex:none}`;
  document.head.appendChild(s);
})();
function pickTal(i,id){
  const t=TAL[i];if(P.lv<t.lv)return;const cur=P.dx.tal[i];if(cur===id)return;
  if(cur){const c=talResetCost();if(P.zeny<c){say(`ต้องใช้ ${c.toLocaleString()} Zeny เพื่อเปลี่ยนสาย`,'#ff9d9a');return}P.zeny-=c}
  P.dx.tal[i]=id;recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());sfx('levelup');toast(`เลือกสาย: ${t.o.find(q=>q.id===id).n}`);refreshDepth();refreshChar();
}
function setImbue(e){
  if(e&&P.dx.imbue!==e){if(P.mats.gem<1){say('ต้องใช้หินเวท 1 ก้อนเพื่อเปลี่ยนธาตุอาวุธ','#ff9d9a');return}P.mats.gem--}
  P.dx.imbue=e||null;sfx('click');if(e)toast(`โจมตีธรรมดาเป็นธาตุ${EL[e].ic}${EL[e].n}`);refreshDepth();
}
function refreshDepth(){
  const w=$('winDepth');if(!w||w.style.display!=='block'||!P||!P.dx)return;let body='';
  if(DP.tab==='tal'){
    body=`<div class="small">ถึงเลเวลที่กำหนดเลือกได้ <b>1 สายต่อขั้น</b> • เปลี่ยนภายหลังเสีย ${talResetCost().toLocaleString()} Zeny/ครั้ง</div>`+TAL.map((t,i)=>{
      const ok=P.lv>=t.lv,cur=P.dx.tal[i];
      return`<div class="tier"><b>ขั้น ${i+1}: ${t.n}</b> <span class="small">(Lv ${t.lv}${ok?'':' • ยังไม่ปลดล็อก'})</span></div>`+t.o.map(o=>`<div class="eqr${cur===o.id?' cur':''}" style="${ok?'':'opacity:.45'}"><div class="nm"><b>${o.n}</b><br><span class="small">${o.d}</span></div><button ${ok&&cur!==o.id?'':'disabled'} onclick="pickTal(${i},'${o.id}')">${cur===o.id?'เลือกอยู่':cur?'เปลี่ยน':'เลือก'}</button></div>`).join('');
    }).join('');
  }else if(DP.tab==='el'){
    const sk=CLASSES[P.cls].skills,here={};for(const s of (MAP.spawns||[])){const e=MEL[s[0]]||'none';here[e]=(here[e]||0)+1}
    body=`<div class="small" style="line-height:1.6">ตีโดน<b style="color:#7cff7c">จุดอ่อน</b>ดาเมจ x${1.5+DXC.weak} • ตีธาตุเดียวกัน<b style="color:#ff9d9a">ต้านทาน</b> x0.6 • เครื่องหมายสีเล็กๆ ข้างเลเวลมอนสเตอร์บอกธาตุของมัน (▲เขียว = ธาตุคุณชนะ ▼แดง = โดนต้าน)</div>
      <table class="rk"><tr><td>🔥 ไฟ</td><td>ชนะ มอน❄️น้ำแข็ง, 🌑มืด</td></tr><tr><td>❄️ น้ำแข็ง</td><td>ชนะ มอน🔥ไฟ</td></tr><tr><td>⚡ สายฟ้า</td><td>ชนะ มอน☠️พิษ, 🌑มืด</td></tr><tr><td>☠️ พิษ</td><td>ชนะ มอน⚡สายฟ้า</td></tr><tr><td>🌑 มืด</td><td>ไม่มีใครชนะ แต่ไม่โดนต้านจากมอนทั่วไป</td></tr></table>
      <div class="tier"><b>ธาตุของสกิลคุณ</b></div>
      <div class="small">${sk.map((s,i)=>{const e=skEl(i);return`${s.ic} ${s.n}: ${e?EL[e].ic+EL[e].n:'ไร้ธาตุ'}`}).join(' • ')}</div>
      <div class="tier"><b>ธาตุอาวุธ (โจมตีธรรมดา)</b> <span class="small">เปลี่ยนครั้งละ 1 หินเวท (มี ${P.mats.gem})</span></div>
      <div class="elc"><button class="${!P.dx.imbue?'on':''}" onclick="setImbue(null)">ไม่ใส่</button>${EL_ORDER.map(e=>`<button class="${P.dx.imbue===e?'on':''}" style="color:${EL[e].c}" onclick="setImbue('${e}')">${EL[e].ic} ${EL[e].n}</button>`).join('')}</div>
      <div class="small">แปรธาตุจากความสามารถขั้น 2 / พรดันเจี้ยน จะแทนที่ธาตุสกิลทั้งหมด</div>
      <div class="tier"><b>มอนสเตอร์ในแมพนี้</b></div>
      <div class="small">${Object.entries(here).map(([e,n])=>e==='none'?`ไร้ธาตุ ×${n}`:`${EL[e].ic}${EL[e].n} ×${n}`).join(' • ')||'-'}</div>`;
  }else{
    const keys=cardKeys(),slots=cardSlots();
    body=`<div class="small">มอนสเตอร์ดรอปการ์ด (ธรรมดา 0.6% • ผู้นำ 4% • บอส 15%) ใส่ได้ ${slots} ช่อง (ช่องเพิ่มที่ Lv 30 / 60) • สะสมครบหลายชนิดได้โบนัสเพิ่ม</div>
      <div class="slots">${Array.from({length:4},(_,i)=>{const k=P.dx.cs[i];if(i>=slots)return`<div class="sl lk">🔒<br>Lv ${i===2?30:60}</div>`;
        return k?`<div class="sl f"><b>${MOBS[k].name}</b><br>${cardEff(k).t}</div>`:`<div class="sl">ว่าง</div>`}).join('')}</div>
      <div class="mat"><span>สะสม ${keys.length}/${Object.keys(MOBS).length} ชนิด</span><span>โบนัสสะสม ATK/HP +${pct(keys.length*.002)}%</span><button onclick="cardDupToGem()" style="margin-left:auto">แลกการ์ดซ้ำ→หินเวท</button></div>`+
      (keys.length?keys.map(k=>{const d=MOBS[k],e=cardEff(k),on=P.dx.cs.includes(k);
        return`<div class="eqr${on?' cur':''}"><div class="cd"><canvas data-sp="${d.sprite}" width="44" height="44"></canvas><div class="nm"><b style="color:${d.boss?'#ffd27a':d.elite?'#c58aff':'#fff'}">${d.name}</b> <span class="small">Lv ${d.lv}${P.dx.cards[k]>1?' • x'+P.dx.cards[k]:''}</span><br><span class="small">${e.t}</span></div></div><button onclick="${on?'unequipCard':'equipCard'}('${k}')">${on?'ถอด':'ใส่'}</button></div>`}).join(''):'<div class="small" style="margin-top:8px">ยังไม่มีการ์ด — ไปล่ามอนสเตอร์ได้เลย</div>');
  }
  w.innerHTML=`<h3><span>⚔ ความสามารถ • ธาตุ • การ์ด</span><button class="x" onclick="toggleWin('winDepth')">✕</button></h3>
    <div class="tabs2">${[['tal','ความสามารถ'],['el','ธาตุ'],['card','การ์ด']].map(([k,n])=>`<button class="${DP.tab===k?'on':''}" onclick="DP.tab='${k}';refreshDepth()">${n}</button>`).join('')}</div><div class="winbody">${body}</div>`;
  w.querySelectorAll('canvas[data-sp]').forEach(c=>{if(c.dataset.sp)sheetIcon(c,c.dataset.sp)});
}
WINX.winDepth=refreshDepth;
(function(){const b=$('bDepth');if(b)b.onclick=()=>toggleWin('winDepth')})();
// ปุ่ม badge เมื่อมีสายความสามารถใหม่ให้เลือก
REG.tick.push(()=>{
  if(!P||!P.dx)return;const b=$('bDepth');if(!b)return;
  b.classList.toggle('badge',TAL.some((t,i)=>P.lv>=t.lv&&!P.dx.tal[i]));
});
for(const k in MEL)delete MEL[k];   // ยกเลิกธาตุมอนสเตอร์
