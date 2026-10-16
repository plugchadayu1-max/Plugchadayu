/* ============ ตัวแนะนำเป้าหมาย + ประกาศล่าค่าหัว + เควสต์ช่วงปลาย ============
   แก้อาการ "ไม่รู้จะทำอะไรต่อ": ระบบเลือกสิ่งที่ควรทำถัดไปให้ (แสดงบนแถบภารกิจและในหน้าต่าง 🎯)
   ค่าหัวสุ่มตามเลเวลไม่มีวันหมด (3 ช่อง) ให้ EXP/Zeny/หินเวท/การ์ด
   ต้องโหลดหลัง f_depth.js และ f_life.js */

/* ---------- เควสต์เพิ่มสำหรับ Lv 44-100 ---------- */
(function(){
  const add=(id,lv,n,t,k,c,r)=>{if(!QUESTS.some(q=>q.id===id))QUESTS.push({id,lv,n,t,k,c,r})};
  add('q18',44,'กอบลินบุกค่าย','kill','goblinM',35,{xp:.25,zeny:8000,ore:6});
  add('q19',47,'ศึกกอบลินสาว','kill','goblinF',35,{xp:.25,zeny:9000,gem:2});
  add('q20',50,'วิญญาณไร้ที่พัก','kill','cp_ghost',35,{xp:.25,zeny:11000,item:2});
  add('q21',53,'ล่าหัวหน้ากอบลิน','kill','goblinC',10,{xp:.3,zeny:14000,gem:2});
  add('q22',56,'คำสาปมนุษย์หมาป่า','kill','cp_were',40,{xp:.25,zeny:16000,ore:10});
  add('q23',60,'ช่างตีเหล็กมือเก๋า','enh',null,6,{xp:.2,zeny:12000,gem:3});
  add('q24',64,'โทรลล์น้ำแข็ง','kill','cp_trollA2',30,{xp:.25,zeny:22000,item:3});
  add('q25',68,'สุนัขแห่งนรก','kill','cp_hellh',40,{xp:.25,zeny:26000,gem:3});
  add('q26',72,'ป่าปีศาจ','kill','cp_ent',40,{xp:.25,zeny:30000,ore:12});
  add('q27',76,'ยักษ์แดงคลั่ง','kill','cp_ogre',40,{xp:.25,zeny:36000,item:3});
  add('q28',80,'นักบวชแห่งความมืด','kill','cp_hooded',40,{xp:.25,zeny:42000,gem:4});
  add('q29',84,'ผู้พิทักษ์ขั้นสูง','event',null,5,{xp:.3,zeny:46000,item:3});
  add('q30',88,'วิญญาณเปลวไฟ','kill','cp_felem',40,{xp:.25,zeny:54000,gem:4});
  add('q31',92,'กวางกะโหลก','kill','cp_deer',50,{xp:.25,zeny:62000,item:3});
  add('q32',96,'ฝูงมังกรม่วง','kill','cp_dragon',20,{xp:.3,zeny:75000,gem:5});
  add('q33',100,'ปราบมังกรแห่งหายนะ','kill','dragonLord',3,{xp:.5,zeny:150000,item:3,gem:8});
})();

/* ---------- ประกาศล่าค่าหัว ---------- */
const BN_SLOTS=3;
function bnPool(){
  const lo=P.lv-6,hi=P.lv+5;
  let r=ROSTER.filter(x=>!(x[4]&&(x[4].boss||x[4].elite))&&x[3]>=lo&&x[3]<=hi);
  if(!r.length)r=ROSTER.filter(x=>!(x[4]&&(x[4].boss||x[4].elite))).sort((a,b)=>Math.abs(a[3]-P.lv)-Math.abs(b[3]-P.lv)).slice(0,4);
  return r;
}
function genBounty(avoid){
  const R=Math.random(),lv=P.lv;
  if(R<.2){   // บอส
    const bs=ROSTER.filter(x=>x[4]&&x[4].boss&&x[3]<=lv+8&&x[3]>=lv-30).sort((a,b)=>Math.abs(a[3]-lv)-Math.abs(b[3]-lv));
    if(bs.length&&!(avoid||[]).includes(bs[0][0]))return{t:'boss',k:bs[0][0],c:1,p:0,r:{xp:.45,zeny:lv*1500,gem:2,item:lv>=30?3:2,card:bs[0][0]}};
  }
  if(R<.4){   // ผู้นำ
    return{t:'elite',k:null,c:ri(3,5),p:0,r:{xp:.22,zeny:lv*400,gem:1,cardRand:.25}};
  }
  const pool=bnPool().filter(x=>!(avoid||[]).includes(x[0])),pick=(pool.length?pool:bnPool())[Math.random()*(pool.length||bnPool().length)|0];
  const c=ri(22,45);
  return{t:'kill',k:pick[0],c,p:0,r:{xp:Math.round((.09+c*.003)*100)/100,zeny:Math.round(lv*c*6),gem:Math.random()<.3?1:0,card:Math.random()<.14?pick[0]:null}};
}
function bnInit(){
  const D=P.dx;D.bounty=Array.isArray(D.bounty)?D.bounty:[];
  // ค่าหัวที่ยังไม่เริ่มทำ แต่เป้าหมายห่างจากเลเวลตอนนี้มาก (เช่นเลเวลขึ้นไปแล้ว) -> สุ่มใหม่ให้เหมาะกับเลเวล
  D.bounty.forEach((b,i)=>{if(b.p===0&&b.k&&MOBS[b.k]&&Math.abs(MOBS[b.k].lv-P.lv)>(b.t==='boss'?32:12))D.bounty[i]=genBounty(D.bounty.map(x=>x.k))});
  while(D.bounty.length<BN_SLOTS)D.bounty.push(genBounty(D.bounty.map(b=>b.k)));
}
const bnName=b=>b.t==='kill'?`ล่า ${MOBS[b.k].name}`:b.t==='boss'?`โค่นบอส ${MOBS[b.k].name}`:'ล่าผู้นำ/หัวหน้า';
const bnDone=b=>b.p>=b.c;
function bnRewardText(b){
  const r=b.r;let t=rewardText({xp:r.xp,zeny:r.zeny,gem:r.gem,item:r.item});
  return t;
}
function bnClaim(i){
  const b=P.dx.bounty[i];if(!b||!bnDone(b))return;
  const r=b.r;giveReward({xp:r.xp,zeny:r.zeny,gem:r.gem,item:r.item},'ค่าหัว');
  if(r.card)giveCard(r.card);   // บอส = การ์ดแน่นอน, ค่าหัวทั่วไป = สุ่มตอนสร้างค่าหัวแล้ว (มี r.card เฉพาะที่ได้)
  if(r.cardRand&&Math.random()<r.cardRand){const ks=ROSTER.filter(x=>!(x[4]&&x[4].boss)&&Math.abs(x[3]-P.lv)<=12);if(ks.length)giveCard(ks[Math.random()*ks.length|0][0])}
  P.st.bn=(P.st.bn||0)+1;sfx('levelup');toast('🎯 ส่งค่าหัวสำเร็จ!');
  if(AUTO.focusRef==='b:'+i){AUTO.focus=AUTO.focusRef=null;AUTO.chkT=0}
  P.dx.bounty[i]=genBounty(P.dx.bounty.map(x=>x.k));bnRefresh();
}
function bnReroll(i){
  const c=P.lv*150;if(P.zeny<c){say(`ต้องใช้ ${c.toLocaleString()} Zeny เพื่อเปลี่ยนค่าหัว`,'#ff9d9a');return}
  P.zeny-=c;P.dx.bounty[i]=genBounty(P.dx.bounty.map(x=>x.k));sfx('click');bnRefresh();
}
function bnGo(i){
  const b=P.dx.bounty[i];if(!b)return;
  if(bnDone(b)){openGoal('bounty');return}
  AUTO.focus=b.t==='elite'?null:b.k;AUTO.focusRef='b:'+i;AUTO.mode='hunt';AUTO.chkT=0;
  if(!AUTO.on)setAuto(true);else AUTO.anchor=defaultAnchor();
  AUTO.focus=b.t==='elite'?null:b.k;AUTO.focusRef='b:'+i;
  say(`ออโต้: ไปทำค่าหัว "${bnName(b)}"`,'#9be58a');updateTracker();
}
REG.kill.push(m=>{
  if(!P||!P.dx||!P.dx.bounty)return;let ch=false;
  for(const b of P.dx.bounty){
    if(bnDone(b))continue;
    if(b.t==='kill'&&m.k===b.k||b.t==='boss'&&m.k===b.k&&m.d.boss||b.t==='elite'&&(m.d.elite||m.d.mini)&&!m.add){b.p++;ch=true;if(bnDone(b)){sfx('quest');toast(`🎯 ค่าหัวสำเร็จ: ${bnName(b)}`)}}
  }
  if(ch){updateTracker();bnRefresh()}
});
const _focusCheckG=focusCheck;
focusCheck=function(){
  if(AUTO.focusRef&&AUTO.focusRef[0]==='b'){const b=P.dx.bounty[+AUTO.focusRef.slice(2)];if(!b||bnDone(b)){AUTO.focus=AUTO.focusRef=null;AUTO.chkT=0}return}
  _focusCheckG();
};

/* ---------- เป้าหมายแนะนำ ---------- */
function guideList(){
  const L=[],S=P.dx.story,sc=STORY[S.ch],add=(ic,t,btn,fn,pr)=>L.push({ic,t,btn,fn,pr});
  if(sc&&S.st===2)add('📖',`ส่งบทเรื่องราว "${sc.t}" รับรางวัล`,'รับรางวัล','openStory()',1);
  if(P.pts>0)add('✦',`มีแต้มสถานะที่ยังไม่ได้ใช้ ${P.pts} แต้ม`,'ลงแต้ม',"toggleWin('winChar')",2);
  if((!P.job&&P.lv>=JOB1.lv)||(P.job&&P.job.t===1&&P.lv>=JOB2.lv))add('⚔️',`เลื่อนขั้นอาชีพได้แล้ว (ใช้ ${(!P.job?JOB1.cost:JOB2.cost).toLocaleString()} Zeny)`,'ดู',"toggleWin('winJob')",3);
  const readyQ=QUESTS.filter(q=>{const s=P.qs[q.id];return s&&s.s===1&&s.p>=q.c});
  if(readyQ.length)add('📜',`เควสต์เสร็จแล้ว ${readyQ.length} อัน รอรับรางวัล`,'รับ',"toggleWin('winQuest')",1);
  const readyB=P.dx.bounty.findIndex(bnDone);
  if(readyB>=0)add('🎯','ค่าหัวสำเร็จแล้ว ไปรับรางวัล','รับ',"openGoal('bounty')",1);
  if(sc&&S.st===1)add('📖',`เนื้อเรื่อง: ${sc.obj.txt} ${Math.min(sc.obj.c,storyProg())}/${sc.obj.c}`,'ไปทำ','storyGo()',4);
  else if(sc&&S.st===0&&P.lv>=sc.lv)add('📖',`เนื้อเรื่องบทใหม่: ${sc.t}`,'อ่าน','openStory()',3);
  else if(sc&&S.st===0)add('📖',`บทถัดไป "${sc.t}" ปลดล็อกที่ Lv ${sc.lv}`,'ดู','openStory()',9);
  const bi=P.dx.bounty.findIndex(b=>!bnDone(b));
  if(bi>=0){const b=P.dx.bounty[bi];add('🎯',`ค่าหัว: ${bnName(b)} ${b.p}/${b.c}`,'ไปล่า',`bnGo(${bi})`,5)}
  const di=P.daily.list.findIndex(q=>!q.d&&q.p<q.c);
  if(di>=0){const q=P.daily.list[di];add('☀',`ภารกิจประจำวัน: ${q.x} (${q.p}/${q.c})`,'ไปทำ',`trackGo('d:${di}')`,6)}
  else if(P.daily.list.some(q=>!q.d&&q.p>=q.c))add('☀','ภารกิจประจำวันเสร็จแล้ว รอรับรางวัล','รับ',"QU.tab='daily';toggleWin('winQuest')",1);
  const act=Object.values(P.qs).filter(s=>s.s===1).length,avail=QUESTS.filter(q=>!P.qs[q.id]&&q.lv<=P.lv+2);
  if(avail.length&&act<6)add('📜',`มีเควสต์ให้รับ ${avail.length} อัน (เหมาะกับเลเวลคุณ)`,'ดู',"QU.tab='quest';toggleWin('winQuest')",6);
  if(typeof dgRuns==='function'&&P.lv>=15&&dgRuns()>0)add('🕳️',`ดันเจี้ยนวันนี้เหลือ ${dgRuns()} รอบ (เลือกพร ได้ EXP/ไอเทม)`,'เข้า',"toggleWin('winDg')",7);
  if(P.mats.ore>=8&&P.eq.weapon&&(P.eq.weapon.plus||0)<ENH_MAX)add('⚒️',`มีแร่ ${P.mats.ore} ก้อน — ตีบวกอาวุธที่ช่างตีเหล็กในเมือง`,'ดู',"toggleWin('winSmith')",8);
  if(typeof autoWantMap==='function'){const w=autoWantMap();if(w!==MAPID&&!MAP.dungeon)add('🗺️',`เลเวลคุณเหมาะกับ ${MAPS[w].name} แล้ว`,'วาร์ป',"toggleWin('winWarp')",4)}
  if(P.dx.stat.fish<3)add('🎣','ลองตกปลา/ทำอาหารให้บัฟเพิ่มพลัง','ลอง',"LF.tab='fish';toggleWin('winLife')",9);
  L.sort((a,b)=>a.pr-b.pr);
  if(!L.length)add('⚔️','ล่ามอนสเตอร์ต่อเพื่อเก็บ EXP — เปิดออโต้ (Z) ได้เลย','ออโต้','setAuto(true)',10);
  return L;
}
const GL={tab:'goal'};
(function(){
  const d=document.createElement('div');d.id='winGoal';d.className='win panel sm';d.style.cssText='z-index:5;width:min(540px,96vw)';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`#tracker.min .tr.gl{display:block}#winGoal .gi{font-size:22px;width:30px;text-align:center}#winGoal .top{box-shadow:inset 0 0 0 2px #ffd84a}`;document.head.appendChild(s);
})();
function openGoal(tab){if(tab)GL.tab=tab;if($('winGoal').style.display!=='block')toggleWin('winGoal');else refreshGoal()}
function bnRefresh(){const w=$('winGoal');if(w&&w.style.display==='block')refreshGoal()}
function refreshGoal(){
  const w=$('winGoal');if(!w||w.style.display!=='block'||!P||!P.dx)return;bnInit();let body='';
  if(GL.tab==='goal'){
    const L=guideList();
    body=`<div class="small" style="margin-bottom:6px">สิ่งที่ควรทำตอนนี้ เรียงตามความสำคัญ (อันบนสุดคือแนะนำที่สุด)</div>`+L.slice(0,8).map((g,i)=>`<div class="eqr${i===0?' cur':''}"><span class="gi">${g.ic}</span><div class="nm">${g.t}</div><button onclick="${g.fn};refreshGoal()">${g.btn}</button></div>`).join('');
  }else{
    body=`<div class="small" style="margin-bottom:6px">ประกาศล่าค่าหัว 3 ช่อง สุ่มตามเลเวลคุณ ทำเสร็จแล้วได้ช่องใหม่ทันที ไม่มีวันหมด • เปลี่ยนค่าหัวเสีย ${(P.lv*150).toLocaleString()} Zeny • ส่งแล้ว ${P.st.bn||0} ครั้ง</div>`+
      P.dx.bounty.map((b,i)=>{const done=bnDone(b);
        return`<div class="qr${done?' done':''}"><div class="qd"><b>${b.t==='boss'?'👑 ':b.t==='elite'?'⭐ ':'🎯 '}${bnName(b)}</b> <span class="small">${b.p}/${b.c}</span><div class="qb"><i style="width:${Math.min(100,b.p/b.c*100)}%"></i></div><span class="rw">รางวัล: ${bnRewardText(b)}</span></div>`+
          `<div style="display:flex;flex-direction:column;gap:4px">${done?`<button onclick="bnClaim(${i})">รับรางวัล</button>`:`<button onclick="bnGo(${i});toggleWin('winGoal')">ไปล่า</button><button onclick="bnReroll(${i})" style="background:linear-gradient(#5a6078,#343a50);border-color:#8a90a8">เปลี่ยน</button>`}</div></div>`}).join('');
  }
  w.innerHTML=`<h3><span>🎯 เป้าหมายและค่าหัว</span><button class="x" onclick="toggleWin('winGoal')">✕</button></h3>
    <div class="tabs2">${[['goal','ควรทำอะไรต่อ'],['bounty','ค่าหัว']].map(([k,n])=>`<button class="${GL.tab===k?'on':''}" onclick="GL.tab='${k}';refreshGoal()">${n}</button>`).join('')}</div><div class="winbody">${body}</div>`;
}
WINX.winGoal=refreshGoal;
(function(){const b=$('bGoal');if(b)b.onclick=()=>toggleWin('winGoal')})();
addEventListener('keydown',e=>{if(P&&keyName(e)==='o')toggleWin('winGoal')});

// แถวเป้าหมายบนแถบภารกิจ
const _updateTrackerG=updateTracker;
let goalTxt='';
updateTracker=function(){
  _updateTrackerG();
  const e=$('tracker');if(!e||!P||!P.dx)return;
  try{
    bnInit();const L=guideList(),g=L[0],hd=e.querySelector('.hd');
    let rows=`<div class="tr gl" style="border-color:#c9a24b" onclick="${g.fn}">🎯 <b>แนะนำ:</b> ${g.t}</div>`;
    P.dx.bounty.forEach((b,i)=>{if(!bnDone(b))rows+=`<div class="tr${AUTO.focusRef==='b:'+i?' on':''}" onclick="bnGo(${i})">🎯 ${bnName(b)} <b>${b.p}/${b.c}</b></div>`});
    if(hd)hd.insertAdjacentHTML('afterend',rows);else e.insertAdjacentHTML('afterbegin',rows);
    e.style.display='block';goalTxt=g.t;
  }catch(err){}
};
let gT=0;
REG.tick.push((dt)=>{
  if(!P||!P.dx)return;gT-=dt;if(gT>0)return;gT=4;
  bnInit();
  try{const t=guideList()[0].t;if(t!==goalTxt)updateTracker()}catch(e){}
  const b=$('bGoal');if(b)b.classList.toggle('badge',guideList().some(g=>g.pr<=1));
});
const _anpG=afterNewPlayer;
afterNewPlayer=function(){_anpG();bnInit()};
