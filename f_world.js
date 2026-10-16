'use strict';
/* ===== f_world.js — หีบสมบัติ/จุดขุดแร่, ดันเจี้ยนประจำวัน, บอสโลก, กลางวัน-กลางคืน, สภาพอากาศ ===== */

/* ---------- ภาพของ prop ใหม่ ---------- */
REG.art.push(()=>{
  const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'));return c};
  const rect=(c,col,x,y,w,h)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  ART.chest=mk(24,20,c=>{pxEllipseOn(c,12,18,10,2,'rgba(0,0,0,.28)');
    rect(c,'#2b1a0c',2,6,20,12);rect(c,'#8a5a2b',3,7,18,10);rect(c,'#a87a4a',3,7,18,3);rect(c,'#6a431f',3,12,18,1);
    rect(c,'#2b1a0c',2,3,20,5);rect(c,'#a87a4a',3,4,18,3);rect(c,'#c49a5a',3,4,18,1);
    rect(c,'#f2c94c',10,8,4,5);rect(c,'#7a5a14',11,10,2,2);rect(c,'#f2c94c',2,3,2,14);rect(c,'#f2c94c',20,3,2,14)});
  ART.chestO=mk(24,24,c=>{pxEllipseOn(c,12,22,10,2,'rgba(0,0,0,.28)');
    rect(c,'#2b1a0c',2,10,20,12);rect(c,'#8a5a2b',3,11,18,10);rect(c,'#3a2410',3,11,18,4);rect(c,'#ffe28a',5,12,14,2);rect(c,'#fff6c0',8,11,8,1);
    rect(c,'#2b1a0c',2,0,20,5);rect(c,'#a87a4a',3,1,18,3);rect(c,'#f2c94c',2,10,2,12);rect(c,'#f2c94c',20,10,2,12)});
  const ore=(c,body,hi)=>{pxEllipseOn(c,12,17,10,2,'rgba(0,0,0,.28)');
    pxCircle(c,8,11,6,'#2a2a32');pxCircle(c,16,12,5,'#2a2a32');pxCircle(c,8,11,5,'#6a6a76');pxCircle(c,16,12,4,'#5a5a66');
    if(body){[[6,6,body],[15,7,hi],[11,4,body],[18,10,hi]].forEach(([x,y,col])=>{rect(c,'#0e0e14',x-1,y-2,4,7);rect(c,col,x,y-1,2,5);rect(c,'#ffffff',x,y-1,1,1)})}};
  ART.node=mk(24,20,c=>ore(c,'#4ab0f0','#9fe0ff'));
  ART.nodeO=mk(24,20,c=>ore(c,null));
  ART.dungeon=mk(60,70,c=>{pxEllipseOn(c,30,67,28,3,'rgba(0,0,0,.3)');
    rect(c,'#1a1218',4,18,10,50);rect(c,'#5a4a62',5,18,8,49);rect(c,'#7e6e88',5,18,2,49);
    rect(c,'#1a1218',46,18,10,50);rect(c,'#5a4a62',47,18,8,49);rect(c,'#7e6e88',47,18,2,49);
    rect(c,'#1a1218',2,8,56,12);rect(c,'#5a4a62',3,9,54,10);rect(c,'#7e6e88',3,9,54,2);
    rect(c,'#1a1218',24,0,12,10);rect(c,'#e8e0cc',26,1,8,7);rect(c,'#1a1218',27,3,2,2);rect(c,'#1a1218',31,3,2,2);rect(c,'#1a1218',28,6,4,1);
    rect(c,'#0b0610',14,20,32,48);
    for(let i=0;i<6;i++){c.globalAlpha=.55-i*.07;pxEllipseOn(c,30,48,14-i*2,22-i*3,i%2?'#ff3a5a':'#b0207a')}c.globalAlpha=1;rect(c,'#ffd0e0',29,40,2,12)});
});
CLICKABLE.chest=1;CLICKABLE.node=1;CLICKABLE.dungeon=1;

/* ---------- หีบสมบัติ + จุดขุดแร่ + ประตูดันเจี้ยน ---------- */
function okPoi(x,y){return walkable(x,y)&&reachable(x,y)&&(x<TOWN.x0-250||x>TOWN.x1+250||y<TOWN.y0-250||y>TOWN.y1+250)}
REG.pois.push(cells=>{
  const dgs=TOWN.slots&&TOWN.slots.dungeon;props.push({k:'dungeon',x:dgs?dgs.x:Math.min(TOWN.x1-90,TOWN.cx+280),y:dgs?dgs.y:TOWN.cy-10});
  const D=Math.max(8,...cells.map(c=>c.d)),[l0,l1]=MAP.lvr,placed=[];
  const place=(n,kind)=>{for(let i=0;i<n;i++)for(let t=0;t<60;t++){
    const c=cells[Math.random()*cells.length|0],x=(c.cx+.2+Math.random()*.6)*CELL,y=(c.cy+.2+Math.random()*.6)*CELL;
    if(!okPoi(x,y)||placed.some(q=>Math.hypot(q.x-x,q.y-y)<300))continue;
    const p={k:kind,x,y,lv:Math.round(l0+(c.d/D)*(l1-l0)),rt:0};placed.push(p);props.push(p);break}};
  place(9,'chest');place(11,'node');
});
REG.tick.push((dt)=>{
  if(!P)return;
  for(const p of props)if(p.rt>0){p.rt-=dt;if(p.rt<=0){if(p.k==='chestO')p.k='chest';else if(p.k==='nodeO')p.k='node'}}
});
function openChest(p){
  if(p.k!=='chest')return;p.k='chestO';p.rt=240;sfx('loot',2);
  const lv=clamp(p.lv||P.lv,1,100),z=ri(lv*30,lv*60)+100;P.zeny+=z;let msg=[`${z} Zeny`];
  const ore=ri(1,3);addMat('ore',ore);msg.push(`แร่ x${ore}`);
  if(Math.random()<.25){addMat('gem',1);msg.push('หินเวท x1')}
  if(Math.random()<.55){const roll=Math.random(),rar=roll>.93?2:roll>.6?1:0,sl=Object.keys(SLOTS),it=genItem(lv,rar,Math.random()<.3?'weapon':sl[ri(0,sl.length-1)],P.cls);
    if(addItem(it)){msg.push(`${it.name}[${RAR[rar].n}]`);fx.push({k:'beam',x:p.x,y:p.y,col:RAR[rar].g,rar:Math.max(2,rar),age:0,life:1.6})}}
  if(Math.random()<.03)giveEgg('chest');
  burst(p.x,p.y-12,'#ffe28a',16);ring(p.x,p.y,50,'#ffe28a',.5);float(p.x,p.y-40,'📦 เปิดหีบ!','#ffe28a',true);
  say('เปิดหีบ: '+msg.join(' • '),'#ffe28a');
}
function mineNode(p){
  if(p.k!=='node'||p.mining)return;p.mining=true;sfx('hit');float(p.x,p.y-30,'⛏ ขุด...','#c8d4ea');
  for(let i=1;i<=3;i++)setTimeoutGame(i*.4,()=>{sfx('hit');burst(p.x,p.y-8,'#9fe0ff',6)});
  setTimeoutGame(1.3,()=>{
    p.mining=false;if(p.k!=='node')return;p.k='nodeO';p.rt=150;
    const n=ri(2,4)+(P.lv>=40?1:0);addMat('ore',n);let m=`แร่ x${n}`;if(Math.random()<.08){addMat('gem',1);m+=' • หินเวท x1'}
    sfx('coin');float(p.x,p.y-30,'+'+n+' แร่','#9fe0ff',true);say('ขุดได้ '+m,'#c8d4ea')});
}
REG.npc.push((k,p)=>{
  if(k==='chest'&&p){openChest(p);return true}
  if(k==='node'&&p){mineNode(p);return true}
  if(k==='dungeon'){if($('winDg').style.display!=='block')toggleWin('winDg');return true}
  return false;
});
REG.names.push((TX,sc)=>{
  for(const p of props){if(p.hide)continue;
    const lbl=p.k==='dungeon'?['🕳 ดันเจี้ยนปีศาจ','#ff9dc0']:p.k==='chest'?['📦','#ffe28a']:p.k==='node'?['⛏','#9fe0ff']:null;if(!lbl)continue;
    const x=sxL(p.x),y=syL(p.y)-ART[p.k].height+2;if(x<-60||x>LW+60||y<-30||y>LH+30)continue;TX(x*sc,y*sc,lbl[0],lbl[1],p.k==='dungeon'?13:11)}
});
REG.mini.push((c,sx,sy)=>{
  for(const p of props){if(p.k==='chest'||p.k==='node'){c.fillStyle=p.k==='chest'?'#ffe28a':'#9fe0ff';c.fillRect(Math.round(p.x*sx)-1,Math.round(p.y*sy)-1,3,3)}
    else if(p.k==='dungeon'){c.fillStyle='#ff4fa0';c.fillRect(Math.round(p.x*sx)-2,Math.round(p.y*sy)-2,5,5)}}
});

/* ---------- ดันเจี้ยนประจำวัน (3 รอบ/วัน): 3 คลื่น + บอสผู้คุม ปรับความยากตามเลเวลตอนเข้า ---------- */
(()=>{
  const rows=[];for(let y=0;y<32;y++){let r='';for(let x=0;x<32;x++){
    let ch='#';
    if(y>=12&&y<=24&&x>=9&&x<=22)ch=((x+y)%7===0&&(x<12||x>19||y<15||y>21)?',':'.');   // ห้องเล็ก 14x13 ช่อง ต่อกับเมืองด้านล่าง
    if((x===10||x===21)&&(y===13||y===22))ch='r';   // เสาหินมุมห้อง (ไม่มีสิ่งกีดขวางกลางห้อง)
    if(y>=25&&y<=27&&x>=13&&x<=18)ch='H';
    r+=ch}rows.push(r)}
  MAPS.dungeon={name:'ดันเจี้ยนปีศาจ',ic:'🕳️',lv:'1-100',lvr:[1,100],dungeon:true,grid:rows,spawns:[],boss:[],
    pal:{0:['#3a3640','#46424f','#555060'],1:['#4a4048','#58505a','#675f6b'],2:['#2a2a30','#34343c','#3e3e48'],3:['#2f4a6a','#3a5c80','#4a7098'],
      4:['#1c1a22','#2a2630','#3a3644'],5:['#6b4a2b','#8a6038','#a87a4a'],6:['#6a6272','#7e7686','#948c9c'],7:['#14101a','#1c1624','#241e2e'],
      8:['#7a7282','#94909c','#aeaab6'],9:['#86bedf','#9ed0ec','#bfe3f5']},
    deco:['rock','bones'],trees:null};
})();
const DG_MAX=3,DG_WAVE_N=100;let DG=null,DGPEND=null;   // คลื่นละ 100 ตัว วิ่งเข้าหาผู้เล่นทั้งหมด
function dgRuns(){const dk=dayKey();if(!P.dg||P.dg.day!==dk)P.dg={day:dk,used:0};return DG_MAX-P.dg.used}
function enterDungeon(){
  if(MAP.dungeon||!P||P.hp<=0||P.dying>0)return;
  if(dgRuns()<=0){say('วันนี้เข้าดันเจี้ยนครบ 3 รอบแล้ว — พรุ่งนี้มาใหม่','#ff9d9a');return}
  if(P.combatT>0){say('กำลังสู้อยู่ เข้าดันเจี้ยนไม่ได้','#ff9d9a');return}
  P.dg.used++;DGPEND={lv:P.lv};$('winDg').style.display='none';P.portalCd=99;P.dest=null;P.target=null;
  sfx('dg');toast('🕳️ เข้าสู่ดันเจี้ยนปีศาจ...');setTimeout(()=>enterMap('dungeon'),MAP_CACHE.dungeon?60:150);
}
function dgInit(){
  const lv=(DGPEND&&DGPEND.lv)||P.lv,pool=ROSTER.filter(r=>!(r[4]&&(r[4].boss||r[4].elite))).sort((a,b)=>Math.abs(a[3]-lv)-Math.abs(b[3]-lv)).slice(0,4).map(r=>r[0]);
  DG={lv,waves:3,wave:0,state:'wait',t:3,pool,done:false};DGPEND=null;
  say(`ดันเจี้ยนปีศาจ (ปรับตามเลเวล ${lv}) — 3 คลื่น คลื่นละ 100 ตัววิ่งเข้าหาคุณ แล้วสู้กับผู้คุม`,'#ff9dc0');
}
function dgMob(k,L,o,extra){
  const b=MOBS[k],d=Object.assign({},b,mobStats(L,o||{}),{name:b.name,sprite:b.sprite,ab:b.ab,ranged:b.ranged,range:b.range,h:b.h,px:b.px,elite:false,boss:false},extra||{});
  return d;
}
function dgSpawn(){
  DG.wave++;const boss=DG.wave>DG.waves,n=boss?1:DG_WAVE_N;
  for(let i=0;i<n;i++){
    let pos=null;for(let t=0;t<80&&!pos;t++){const x=rnd(9.6,21.4)*CELL,y=rnd(12.6,23.4)*CELL;if(walkable(x,y)&&reachable(x,y)&&dist({x,y},P)>(boss?420:300)&&!nearTown(x,y))pos={x,y}}
    if(!pos)pos={x:15.5*CELL+rnd(-300,300),y:17*CELL+rnd(-200,200)};
    const k=DG.pool[i%DG.pool.length];let d;
    if(boss){const b=MOBS[DG.pool[0]];d=dgMob(DG.pool[0],DG.lv+3,{boss:true},{name:'ผู้คุมดันเจี้ยน '+b.name,boss:true,px:(b.px||1)*1.9,h:Math.round(b.h*1.9),ab:b.ab||'stomp',range:Math.max(b.range,100),respawn:undefined,exp:Math.round(mobStats(DG.lv+3,{boss:true}).exp*.5)})}
    else{d=dgMob(k,DG.lv+DG.wave-1,{ranged:MOBS[k].ranged,big:MOBS[k].range>=70});
      // ฝูง 100 ตัว: ลดพลังรายตัวลงให้สู้ไหว (ความโหดยังตามเลเวลผู้เล่น) และ EXP/Zeny รายตัวลดตามจำนวน
      d.hp=Math.round(d.hp*.45);d.atk=Math.round(d.atk*.55);d.exp=Math.round(d.exp*.3);d.zeny=d.zeny.map(v=>Math.round(v*.35));d.spd=Math.round(d.spd*1.12);d.aggro=2000}
    const m=mkMob(k,pos.x,pos.y);m.d=d;m.hp=m.mx=d.hp;m.temp=true;m.dg=1;m.aggro=true;m.rush=1;m.actor=makeActor(d.sprite,d.px||1);m.actor.ang=rnd(0,6.3);mobs.push(m);
  }
  if(boss){toast('👹 ผู้คุมดันเจี้ยนปรากฏตัว!');sfx('boss')}else{toast(`⚔ คลื่นที่ ${DG.wave}/${DG.waves}`);sfx('alert')}
  DG.state='fight';
}
function dgDone(){
  DG.done=true;DG.state='done';const big=Math.random()<.35;
  toast('🏆 ผ่านดันเจี้ยนแล้ว!');sfx('levelup');
  giveReward({xp:.9,zeny:DG.lv*150+2000,ore:10,gem:3,item:big?3:2},'รางวัลดันเจี้ยน');if(Math.random()<.25)giveEgg('dungeon');
  say('ออกจากดันเจี้ยนได้ที่ประตูวาร์ปในเมืองด้านล่าง','#ff9dc0');
}
REG.tick.push((dt)=>{
  if(!P)return;if(!MAP.dungeon){DG=null;return}
  if(!DG)return;const e=$('evt');
  if(DG.state==='wait'){DG.t-=dt;e.style.display='block';e.textContent=`🕳 ดันเจี้ยน • คลื่นต่อไปใน ${Math.ceil(DG.t)} วิ`;if(DG.t<=0)dgSpawn()}
  else if(DG.state==='fight'){
    const left=mobs.filter(m=>m.dg&&!m.dead).length;e.style.display='block';
    e.textContent=`🕳 ดันเจี้ยน • ${DG.wave>DG.waves?'ผู้คุม':`คลื่น ${DG.wave}/${DG.waves}`} • เหลือ ${left} ตัว`;
    if(!left){if(DG.wave>DG.waves)dgDone();else{DG.state='wait';DG.t=4;sfx('quest')}}
  }else if(DG.state==='done'){e.style.display='block';e.textContent='🏆 ดันเจี้ยนสำเร็จ — ออกทางประตูวาร์ป'}
});
function refreshDg(){
  const w=$('winDg');if(!w||w.style.display!=='block')return;const left=dgRuns();
  w.innerHTML=`<h3><span>🕳️ ดันเจี้ยนปีศาจ</span><button class="x" onclick="toggleWin('winDg')">✕</button></h3>
    <div class="mat"><span>รอบที่เหลือวันนี้ ${left}/${DG_MAX}</span><span>ปรับตามเลเวลคุณ (Lv ${P.lv})</span></div>
    <div class="small" style="line-height:1.7">• ห้องปิดตาย: ต้องกำจัดมอนสเตอร์ <b>3 คลื่น (คลื่นละ 100 ตัว วิ่งเข้าหาคุณทั้งหมด)</b> แล้วสู้กับ <b>ผู้คุมดันเจี้ยน</b><br>• มอนสเตอร์ปรับพลังตามเลเวลที่เข้า และมีความสามารถพิเศษ<br>• รางวัล: EXP จำนวนมาก • Zeny • แร่ • หินเวท • อุปกรณ์ระดับหายาก-เอพิค (35%)<br>• เข้าไม่ได้ขณะกำลังสู้ • ตายแล้วฟื้นที่ทางเข้า ลองใหม่ได้ (ไม่เสียรอบเพิ่ม)</div>
    <div style="text-align:center;margin-top:10px"><button class="btn" ${left>0&&P.combatT<=0?'':'disabled'} onclick="enterDungeon()" style="font-size:15px;padding:8px 22px">${left>0?'เข้าดันเจี้ยน':'วันนี้ครบแล้ว'}</button></div>`;
}
WINX.winDg=refreshDg;

/* ---------- บอสโลก: โผล่ในสนามล่าเป็นระยะ ---------- */
const WB={next:600};
function spawnWorldBoss(){
  if(MAP.dungeon||inTown(P.x,P.y)||mobs.some(m=>m.d.world&&!m.dead))return false;
  const ks=MAP.spawns.map(s=>s[0]).filter(k=>!MOBS[k].elite).sort((a,b)=>Math.abs(MOBS[a].lv-P.lv)-Math.abs(MOBS[b].lv-P.lv)),k=ks[0],pos=spawnNear(420,620);if(!k||!pos)return false;
  const b=MOBS[k],st=mobStats(P.lv+4,{boss:true,ranged:b.ranged});
  const d=Object.assign({},b,st,{name:'🌍 บอสโลก '+b.name,boss:true,world:true,elite:false,px:(b.px||1)*2.2,h:Math.round(b.h*2.2),respawn:undefined,hp:Math.round(st.hp*1.5),exp:Math.round(st.exp*.8),aggro:380,ab:b.ab||'stomp'});
  const m=mkMob(k,pos.x,pos.y);m.d=d;m.hp=m.mx=d.hp;m.temp=true;m.wbT=300;m.actor=makeActor(d.sprite,d.px);m.actor.ang=rnd(0,6.3);mobs.push(m);
  sfx('alert');toast('🌍 บอสโลกปรากฏตัว!');say(`🌍 ${d.name} (Lv ${d.lv}) ปรากฏในแมพ — จุดสีชมพูบนแผนที่ รางวัลพิเศษ! (หายไปใน 5 นาที)`,'#ff9dc0');ring(m.x,m.y,160,'#ff4fd8',1);
  return true;
}
REG.tick.push((dt,alive)=>{
  if(!P||!alive||MAP.dungeon)return;
  for(const m of mobs)if(m.d.world&&!m.dead){m.wbT-=dt;if(m.wbT<=0){m.gone=1;say('บอสโลกหายตัวไปแล้ว...','#ccc')}}
  if(inTown(P.x,P.y))return;WB.next-=dt;if(WB.next<=0){WB.next=rnd(900,1500);spawnWorldBoss()}
});
REG.kill.push(m=>{
  if(!m.d.world)return;
  giveReward({xp:.5,zeny:P.lv*300,gem:2,ore:6,item:Math.random()<.4?3:2},'รางวัลบอสโลก');toast('🌍 ปราบบอสโลกสำเร็จ!');
});

/* ---------- กลางวัน-กลางคืน + สภาพอากาศ ---------- */
const DAYLEN=720,WX={kind:'',p:[],rainOn:false,rainT:200,last:0};
const lerp3=(a,b,t)=>a.map((v,i)=>Math.round(v+(b[i]-v)*t));
function wxInit(kind){
  WX.kind=kind;WX.p=[];const n=kind==='snow'?120:kind==='dust'?45:0;
  for(let i=0;i<n;i++)WX.p.push({x:Math.random()*LW,y:Math.random()*LH,s:Math.random()});
}
REG.atmos.push(()=>{
  if(!P||!MAP)return;
  const dtt=Math.min(.1,time-WX.last);WX.last=time;
  // --- กลางวัน/กลางคืน (วงจร 12 นาที ตามนาฬิกาจริง)
  const ph=(Date.now()/1000%DAYLEN)/DAYLEN,day=.5+.5*Math.sin(ph*Math.PI*2-Math.PI/2);
  let night=clamp((.46-day)/.46,0,1)*.9;if(MAP.dungeon)night=.62;
  if(night>.02){
    const col=MAP.dungeon?[120,90,150]:[85,100,170],c=lerp3([255,255,255],col,night);
    lx.globalCompositeOperation='multiply';lx.fillStyle=`rgb(${c[0]},${c[1]},${c[2]})`;lx.fillRect(0,0,LW,LH);lx.globalCompositeOperation='source-over';
    // แสงจากกองไฟ/ผู้เล่น ตอนกลางคืน
    lx.globalCompositeOperation='lighter';
    const glow=(x,y,r,col,a)=>{const g=lx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);lx.fillStyle=g;lx.fillRect(x-r,y-r,r*2,r*2)};
    for(const f of fires){const x=sxL(f.x),y=syL(f.y)-4;if(x>-50&&x<LW+50&&y>-50&&y<LH+50)glow(x,y,40,'255,170,70',.55*night)}
    for(const p of props){if(p.k==='portal'||p.k==='dungeon'){const x=sxL(p.x),y=syL(p.y)-18;if(x>-50&&x<LW+50&&y>-50&&y<LH+50)glow(x,y,34,p.k==='dungeon'?'255,70,140':'120,200,255',.5*night)}}
    glow(sxL(P.x),syL(P.y)-14,46,'255,214,150',.32*night);
    lx.globalCompositeOperation='source-over';
  }
  // --- สภาพอากาศ
  const kind=MAP.dungeon?'':MAPID==='snow'?'snow':MAPID==='desert'?'dust':'';
  if(MAPID!==WX.mapId||kind!==WX.kind){WX.mapId=MAPID;wxInit(kind);WX.rainOn=false}
  if(MAPID==='forest'&&!MAP.dungeon){
    WX.rainT-=dtt;
    if(WX.rainT<=0){WX.rainOn=!WX.rainOn;WX.rainT=WX.rainOn?rnd(50,90):rnd(150,300);if(WX.rainOn){toast('🌧 ฝนเริ่มตก');while(WX.p.length<160)WX.p.push({x:Math.random()*LW,y:Math.random()*LH,s:Math.random()})}else WX.p=[]}
  }
  if(WX.kind==='snow'){
    for(const q of WX.p){q.y+=(18+q.s*18)*dtt;q.x+=Math.sin(time*.8+q.s*9)*8*dtt-6*dtt;if(q.y>LH){q.y=-2;q.x=Math.random()*LW}if(q.x<0)q.x=LW;
      lx.globalAlpha=.55+q.s*.4;px(Math.floor(q.x),Math.floor(q.y),q.s>.7?2:1,q.s>.7?2:1,'#ffffff')}
    lx.globalAlpha=1;
  }else if(WX.kind==='dust'){
    for(const q of WX.p){q.x-=(70+q.s*60)*dtt;q.y+=Math.sin(time+q.s*6)*6*dtt;if(q.x<-6){q.x=LW+2;q.y=Math.random()*LH}
      lx.globalAlpha=.25+q.s*.3;px(Math.floor(q.x),Math.floor(q.y),3+Math.floor(q.s*4),1,'#e8d2a0')}
    lx.globalAlpha=1;
  }else if(WX.rainOn){
    lx.globalCompositeOperation='multiply';lx.fillStyle='rgb(190,200,222)';lx.fillRect(0,0,LW,LH);lx.globalCompositeOperation='source-over';
    for(const q of WX.p){q.y+=190*dtt;q.x-=40*dtt;if(q.y>LH){q.y=-4;q.x=Math.random()*LW+20}if(q.x<0)q.x=LW;
      lx.globalAlpha=.6;px(Math.floor(q.x),Math.floor(q.y),1,3,'#b8d0ff')}
    lx.globalAlpha=1;
  }
});
