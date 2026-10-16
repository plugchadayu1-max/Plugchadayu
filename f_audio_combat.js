'use strict';
/* ===== f_audio_combat.js — เสียง/เพลง, คอมโบ, ประกายดรอป, ความสามารถพิเศษของมอนสเตอร์, สถานะผิดปกติ =====
   โหลดหลัง index.html หลัก: ใช้ตัวแปรของเกมหลัก (P, mobs, fx, sfx ฯลฯ) และประกาศฟังก์ชัน hook ทับของเดิม */

// ---------- ทะเบียน hook (ไฟล์ f_progress.js / f_world.js เพิ่มรายการเข้ามา) ----------
const REG={tick:[],draw:[],names:[],mini:[],art:[],npc:[],kill:[],pois:[],atmos:[]};
function tick2(dt,a){for(const f of REG.tick)f(dt,a)}
function extraDraw(Ls,iv){for(const f of REG.draw)f(Ls,iv)}
function drawNames(TX,sc){for(const f of REG.names)f(TX,sc)}
function miniExtra(c,sx,sy){for(const f of REG.mini)f(c,sx,sy)}
function makeArt2(){for(const f of REG.art)f()}
function openNpcX(k,p){for(const f of REG.npc)if(f(k,p))return true;return false}
function killExtra(m){for(const f of REG.kill)f(m)}
function spawnPois(cells){for(const f of REG.pois)f(cells)}
function atmos(){for(const f of REG.atmos)f()}
// ปุ่มลัดของหน้าต่างใหม่
addEventListener('keydown',e=>{
  if(!P)return;const k=keyName(e);
  if(k==='m')toggleSound();else if(k==='y')toggleWin('winJob');else if(k==='l')toggleWin('winRank');
});

/* ============ เสียง (สังเคราะห์ด้วย WebAudio ไม่ต้องมีไฟล์) ============ */
const SND={on:true,ctx:null,mst:null,last:{},nb:null};
try{if(localStorage.getItem('meadowquest_snd')==='0')SND.on=false}catch(e){}
function actx(){
  if(!SND.ctx){try{SND.ctx=new (window.AudioContext||window.webkitAudioContext)();SND.mst=SND.ctx.createGain();SND.mst.gain.value=.55;SND.mst.connect(SND.ctx.destination)}catch(e){SND.ctx=null;return null}}
  if(SND.ctx.state==='suspended')SND.ctx.resume();return SND.ctx;
}
['pointerdown','keydown'].forEach(ev=>addEventListener(ev,()=>actx(),{once:false,passive:true}));
function tone(f,d,type='square',v=.12,slide=0,delay=0){
  const c=SND.ctx;if(!c||!SND.on||c.state!=='running')return;
  const t=c.currentTime+delay,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+d);
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(SND.mst);o.start(t);o.stop(t+d+.03);
}
function noise(d,v=.15,f=2000,delay=0){
  const c=SND.ctx;if(!c||!SND.on||c.state!=='running')return;
  if(!SND.nb){SND.nb=c.createBuffer(1,c.sampleRate,c.sampleRate);const a=SND.nb.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1}
  const t=c.currentTime+delay,s=c.createBufferSource(),g=c.createGain(),fl=c.createBiquadFilter();s.buffer=SND.nb;fl.type='bandpass';fl.frequency.value=f;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(SND.mst);s.start(t);s.stop(t+d+.03);
}
const GAP={hit:.05,crit:.08,hurt:.12,kill:.06,skill:.1};
function sfx(n,a){
  if(!SND.on||!SND.ctx)return;const now=performance.now()/1000;
  if(GAP[n]&&now-(SND.last[n]||0)<GAP[n])return;SND.last[n]=now;
  switch(n){
    case 'hit':noise(.06,.1,1800);tone(230,.07,'square',.06,-130);break;
    case 'crit':tone(560,.13,'sawtooth',.1,-330);noise(.12,.14,2600);tone(900,.05,'square',.05,0,.04);break;
    case 'skill':{const b=260+(a||0)*110;tone(b,.28,'sawtooth',.09,520);noise(.22,.1,3200,.04);break}
    case 'kill':tone(330,.08,'triangle',.1);tone(494,.1,'triangle',.1,0,.07);break;
    case 'boss':[392,330,262,196].forEach((f,i)=>tone(f,.4,'sawtooth',.1,-20,i*.1));noise(.5,.12,500);break;
    case 'hurt':tone(150,.16,'sawtooth',.12,-70);noise(.08,.08,900);break;
    case 'levelup':[523,659,784,1047,1319].forEach((f,i)=>tone(f,.22,'sine',.13,0,i*.09));break;
    case 'loot':{const r=a||0;[880,1175,1568].slice(0,r>=2?3:2).forEach((f,i)=>tone(f,.14,'triangle',.09,0,i*.07));if(r>=3){tone(1760,.5,'sine',.1,0,.25)}break}
    case 'coin':tone(1318,.06,'square',.05);tone(1760,.12,'square',.05,0,.05);break;
    case 'enhOk':[392,494,587,784,988].forEach((f,i)=>tone(f,.2,'triangle',.12,0,i*.07));noise(.3,.08,6000,.3);break;
    case 'enhFail':tone(220,.3,'sawtooth',.12,-150);tone(165,.35,'sawtooth',.1,-100,.15);noise(.25,.12,400);break;
    case 'click':tone(640,.04,'square',.05);break;
    case 'warp':tone(220,.5,'sine',.12,900);tone(330,.5,'sine',.08,1200,.05);break;
    case 'quest':tone(659,.12,'triangle',.1);tone(880,.2,'triangle',.1,0,.1);break;
    case 'alert':for(let i=0;i<3;i++){tone(440,.18,'square',.09,0,i*.4);tone(660,.18,'square',.09,0,i*.4+.2)}break;
    case 'combo':tone(520+Math.min(a||0,50)*14,.09,'square',.06);break;
    case 'dg':[196,262,330,392].forEach((f,i)=>tone(f,.3,'sawtooth',.09,0,i*.12));break;
  }
}
function toggleSound(){
  SND.on=!SND.on;try{localStorage.setItem('meadowquest_snd',SND.on?'1':'0')}catch(e){}
  $('bSnd').textContent=SND.on?'🔊':'🔇';if(SND.on){actx();sfx('click')}toast(SND.on?'🔊 เปิดเสียง':'🔇 ปิดเสียง');
}
$('bSnd').textContent=SND.on?'🔊':'🔇';$('bSnd').onclick=toggleSound;
// ปุ่ม UI ทุกปุ่มมีเสียงคลิก
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('button'))sfx('click')},true);

/* ---------- เพลงพื้นหลัง: สร้างทำนองสุ่มตามโหมด (เมือง / สนามล่า / บอส-ดันเจี้ยน) ---------- */
const BGM={mode:'',step:0,next:0};
const BGMD={town:{sc:[0,2,4,7,9,12,9,7,4,2,0,4,7,12,9,7],base:261.6,len:.46,type:'sine',v:.05,bass:[0,0,-3,-5]},
  field:{sc:[0,3,5,7,10,12,10,7,5,3,0,-2,0,3,7,3],base:220,len:.32,type:'triangle',v:.045,bass:[0,0,-4,-2]},
  boss:{sc:[0,1,3,0,6,5,3,1,0,1,3,6,8,6,5,3],base:130.8,len:.19,type:'sawtooth',v:.04,bass:[0,0,0,-2]}};
function bgmTick(){
  const c=SND.ctx;if(!c||!SND.on||c.state!=='running'||!BGM.mode)return;
  const m=BGMD[BGM.mode];if(BGM.next<c.currentTime)BGM.next=c.currentTime+.05;
  while(BGM.next<c.currentTime+.5){
    const i=BGM.step%m.sc.length,f=m.base*Math.pow(2,m.sc[i]/12),dl=BGM.next-c.currentTime;
    tone(f,m.len*1.6,m.type,m.v,0,dl);
    if(BGM.step%4===0){const bf=m.base/2*Math.pow(2,m.bass[(BGM.step>>2)%4]/12);tone(bf,m.len*3.2,'sine',m.v*1.6,0,dl)}
    if(BGM.mode==='boss'&&BGM.step%2===0)noise(.05,.03,4000,dl);
    BGM.step++;BGM.next+=m.len;
  }
}
setInterval(bgmTick,160);
function bgmMode(){
  if(MAP.dungeon)return 'boss';
  if(inTown(P.x,P.y))return 'town';
  for(const m of mobs)if(m.d.boss&&!m.dead&&m.aggro&&dist(m,P)<800)return 'boss';
  return 'field';
}
let bgmT=0;
REG.tick.push((dt)=>{bgmT-=dt;if(bgmT>0)return;bgmT=1;const m=bgmMode();if(m!==BGM.mode){BGM.mode=m;BGM.step=0;BGM.next=0}});

/* ============ คอมโบ ============ */
const COMBO={n:0,t:0};
function comboUI(pop){
  const e=$('combo');if(COMBO.n<3){e.classList.remove('on');return}
  e.innerHTML=`<b>${COMBO.n}</b> COMBO<small>EXP +${Math.round(Math.min(.5,(COMBO.n-1)*.01)*100)}%</small>`;e.classList.add('on');
  if(pop){e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop')}
}
function comboKill(m){
  COMBO.n=COMBO.t>0?COMBO.n+1:1;COMBO.t=4.5;
  if(COMBO.n>=3)sfx('combo',COMBO.n);
  const MS={10:'+จัดหนัก!',25:'ยอดเยี่ยม!',50:'ไร้เทียมทาน!',100:'ตำนาน!'};
  if(MS[COMBO.n]){const z=COMBO.n*20*Math.max(1,P.lv/5|0);P.zeny+=z;toast(`🔥 คอมโบ ${COMBO.n} ${MS[COMBO.n]}`);say(`โบนัสคอมโบ ${COMBO.n}: +${z} Zeny`,'#ffb36b');sfx('coin')}
  comboUI(true);return 1+Math.min(.5,(COMBO.n-1)*.01);
}
REG.tick.push((dt)=>{if(COMBO.t>0){COMBO.t-=dt;if(COMBO.t<=0){if(COMBO.n>=10)say(`คอมโบจบที่ ${COMBO.n}`,'#ffb36b');COMBO.n=0;comboUI(false)}}});

/* ============ ประกายดรอปของหายาก ============ */
function lootFx(m,it){
  sfx('loot',it.rar);
  if(it.rar>=2)fx.push({k:'beam',x:m.x,y:m.y,col:RAR[it.rar].g,rar:it.rar,age:0,life:1.9});
}
function lootBeamDraw(f,t){
  const x=sxL(f.x),y=syL(f.y),h=Math.round(46+f.rar*8),c=f.col,k=1-t;
  for(let i=0;i<h;i++){lx.globalAlpha=Math.max(0,(1-i/h))*k*.85;px(x-1-(f.rar>=3?1:0),y-i,3+(f.rar>=3?2:0),1,c);}
  lx.globalAlpha=k;px(x,y-h*.6|0,1,(h*.6)|0,'#ffffff');
  lx.globalAlpha=k*.7;pxEllipse(x,y,6+Math.round(t*8),2+Math.round(t*3),c);
  for(let i=0;i<5;i++){const a=i*1.3+f.age*3,r=(f.age*14+i*5)%h;lx.globalAlpha=k*.9;px(Math.round(x+Math.sin(a)*5),y-r|0,1,1,i%2?'#ffffff':c)}
  lx.globalAlpha=1;
}

/* ============ ความสามารถพิเศษของมอนสเตอร์ ============ */
// poison = พิษต่อเนื่อง, burn = ไฟเผา, web = ทำให้เดินช้า, charge = พุ่งชน, stomp = กระแทกพื้นเป็นวง (มีสัญญาณเตือน)
const AB_MAP={cp_mush:'poison',cp_flower:'poison',cp_snake:'poison',cp_scorp:'poison',cp_zombie:'poison',
  cp_spider:'web',cp_spiderS:'web',cp_medusa:'web',cp_ghost:'web',
  cp_boar:'charge',cp_wolf:'charge',cp_wolfD:'charge',cp_hound:'charge',cp_mantis:'charge',cp_bat:'charge',cp_were:'charge',
  cp_imp:'burn',cp_fwisp:'burn',cp_demon:'burn',cp_hellh:'burn',cp_felem:'burn',cp_sdragon:'burn',cp_dragon:'burn',dragonLord:'burn',
  cp_trollB1:'stomp',cp_trollB2:'stomp',cp_trollB3:'stomp',cp_trollA2:'stomp',cp_trollA3:'stomp',trollKing:'stomp',cp_ogre:'stomp',cp_rdemon:'stomp'};
for(const k in AB_MAP)if(MOBS[k])MOBS[k].ab=AB_MAP[k];
const AB_TXT={poison:'☠ มีพิษ',burn:'🔥 ไฟเผา',web:'🕸 ใยหนืด',charge:'💨 พุ่งชน',stomp:'💥 กระแทกพื้น'};
function slam(m,r,mul,col){
  ring(m.x,m.y,r,col||'#ff6b4a',.85);float(m.x,m.y-m.d.h-12,'⚠','#ffdd55',true);
  setTimeoutGame(.85,()=>{if(m.dead||!P||P.hp<=0)return;ring(m.x,m.y,r,'#ffffff',.3);shake=Math.max(shake,3);burst(m.x,m.y-6,col||'#ff6b4a',10);
    if(dist(P,m)<r)damagePlayer(Math.max(1,Math.round(m.d.atk*mul-(P.stats.vit+SBN())*.3-P.gs.def*.4)))});
}
function mobAbility(m,dt,d){
  const ab=m.d.ab;if(!ab||!P||P.hp<=0)return;
  if(m.charge>0){
    m.charge-=dt;const mv=Math.hypot(m.cdx,m.cdy)||1;tryMove(m,m.cdx/mv*430*dt,m.cdy/mv*430*dt);
    if(d<m.d.range*.9){damagePlayer(Math.round(m.d.atk*1.15));m.charge=0;shake=Math.max(shake,2);mobHitFx(m)}
    return;
  }
  if(!m.aggro)return;
  m.abCd=(m.abCd===undefined?rnd(2,6):m.abCd)-dt;if(m.abCd>0||(m.actor.busy>0))return;
  if(ab==='charge'&&d>140&&d<360){m.charge=.45;m.abCd=rnd(6,9);m.cdx=P.x-m.x;m.cdy=P.y-m.y;float(m.x,m.y-m.d.h-8,'!','#ff9d9a',true)}
  else if(ab==='stomp'&&d<210){m.abCd=rnd(7,10);slam(m,120,1.3,'#ffb36b')}
  else if(ab==='burn'&&m.d.ranged!==true&&d<260&&d>90&&Math.random()<.5){m.abCd=rnd(7,10);slam(m,95,1.0,'#ff7a3c')}
  else m.abCd=1.2;
}
function mobHitFx(m){
  const ab=m.d.ab;if(!ab||!P||P.hp<=0)return;
  if(ab==='poison'&&Math.random()<.4){P.dot={t:6,dps:Math.max(2,m.d.atk*.12),k:'☠ พิษ'};float(P.x,P.y-60,'พิษ!','#8be06a')}
  else if(ab==='burn'&&Math.random()<.4){P.dot={t:4,dps:Math.max(2,m.d.atk*.2),k:'🔥 ไฟเผา'};float(P.x,P.y-60,'ไฟลวก!','#ff9a4a')}
  else if(ab==='web'&&Math.random()<.5){P.slowT=3;float(P.x,P.y-60,'ติดใย!','#d0d0e0')}
}
// สถานะผู้เล่น: พิษ/ไฟ (ลดเลือดทุกวินาที), ช้า — ขึ้นแสดงใต้ HP
let dotAcc=0;
REG.tick.push((dt,alive)=>{
  if(!P)return;if(P.slowT>0)P.slowT-=dt;
  if(alive&&P.dot){dotAcc+=dt;P.dot.t-=dt;if(dotAcc>=1){dotAcc=0;damagePlayer(Math.max(1,Math.round(P.dot.dps)))}if(P.dot.t<=0)P.dot=null}
  if(!alive){P.dot=null;P.slowT=0}
  if(inTown(P.x,P.y)){P.dot=null;P.slowT=0}
  const s=[P.dot?`${P.dot.k} ${Math.ceil(P.dot.t)}s`:'',P.slowT>0?`🕸 ช้า ${Math.ceil(P.slowT)}s`:''].filter(Boolean).join('  ');
  const e=$('pstat');if(e.textContent!==s)e.textContent=s;
});
