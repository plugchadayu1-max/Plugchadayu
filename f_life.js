/* ============ เรื่องราว • NPC ในเมือง • ตกปลา/ทำอาหาร • พ่อค้าเร่ ============
   ต้องโหลดหลัง f_depth.js (ใช้ P.dx, BUFFS, addBuff, giveCard) */

/* ---------- เนื้อเรื่องหลัก ---------- */
const STORY=[
  {t:'เสียงเรียกจากทุ่งหญ้า',lv:1,who:'ผู้ใหญ่สมชัย',talk:['ยินดีต้อนรับนักผจญภัย! หมู่บ้านเรามีปัญหาใหญ่เลยล่ะ','สไลม์ในป่ามรกตเพิ่มจำนวนผิดปกติ ราวกับมีอะไรสักอย่างปลุกพวกมันขึ้นมา','ช่วยกำจัดสัก 15 ตัวที เดี๋ยวฉันจะตอบแทนให้อย่างงาม'],obj:{t:'kill',k:'cp_slime',c:15,txt:'กำจัดสไลม์เขียว'},r:{xp:.8,zeny:250,pot:[5,2]}},
  {t:'รากเหง้าแห่งความมืด',lv:5,who:'ปราชญ์ลูน่า',talk:['เธอกำจัดสไลม์ได้เร็วมาก... แต่ฉันรู้สึกถึงพลังมืดที่ปลายป่า','พวกมันไม่ได้เกิดเอง มีผนึกโบราณกำลังอ่อนแรง','ลองล่าสัตว์ร้ายทั่วไปดู 40 ตัว ฉันจะดูว่าพลังมืดมาจากทางไหน'],obj:{t:'killAny',c:40,txt:'ล่ามอนสเตอร์ใดก็ได้'},r:{xp:.6,zeny:500,item:1,card:'cp_slime'}},
  {t:'เงาหมาป่า',lv:11,who:'ผู้ใหญ่สมชัย',talk:['พวกหมาป่าเงาเริ่มลงมาใกล้หมู่บ้านแล้ว!','ฝูงนี้ไม่ใช่สัตว์ป่าธรรมดา ตาของมันแดงก่ำเหมือนถูกควบคุม','ปราบสัก 20 ตัวเพื่อปกป้องชาวบ้านด้วยนะ'],obj:{t:'kill',k:'cp_wolf',c:20,txt:'ปราบหมาป่าเงา'},r:{xp:.6,zeny:900,pot:[0,6]}},
  {t:'ราชาโทรลล์ป่า',lv:18,who:'ปราชญ์ลูน่า',talk:['เจอแล้ว! ต้นเหตุคือราชาโทรลล์ มันถูกผนึกมืดครอบงำ','ผนึกโบราณหนึ่งในสามแตกร้าวเพราะมัน','เธอเท่านั้นที่พอสู้ได้ — ระวังวงสีแดงบนพื้นให้ดี แล้วโค่นมันซะ!'],obj:{t:'boss',k:'trollKing',c:1,txt:'โค่นราชาโทรลล์ป่า'},r:{xp:.8,zeny:3000,item:2,card:'trollKing'},title:{a:'s_4',n:'ผู้พิชิตทุ่งหญ้า',b:{atk:.02,hp:.02}}},
  {t:'ลมร้อนแห่งทะเลทราย',lv:22,who:'ผู้ใหญ่สมชัย',talk:['ข่าวร้ายจากพ่อค้าคาราวาน... ทะเลทรายทางตะวันตกเต็มไปด้วยแมงป่อง','ผนึกที่สองอยู่ใต้ผืนทราย พวกมันคือยามเฝ้าของมัน','ไปเถอะ แต่พกยาไปเยอะๆ นะ'],obj:{t:'kill',k:'cp_scorp',c:25,txt:'ล่าแมงป่องทราย'},r:{xp:.6,zeny:2500,gem:2}},
  {t:'ผนึกที่แตกร้าว',lv:30,who:'ปราชญ์ลูน่า',talk:['ร่องรอยพลังมืดนำไปสู่ดันเจี้ยนปีศาจในเมือง!','ประตูสีชมพูนั่นคือรอยแตกของผนึก','เข้าไปและผ่านดันเจี้ยนให้สำเร็จหนึ่งครั้ง — ฉันเชื่อว่าเธอทำได้'],obj:{t:'dg',c:1,txt:'ผ่านดันเจี้ยนปีศาจ 1 ครั้ง'},r:{xp:.8,zeny:4000,item:3,gem:2}},
  {t:'จินน์ผู้หลับใหล',lv:38,who:'ผู้ใหญ่สมชัย',talk:['เสียงหัวเราะดังก้องใต้ทะเลทราย... จินน์ตนนั้นตื่นแล้ว','มันถือผนึกที่สองไว้ ถ้าไม่หยุดมัน ทะเลทรายจะกลืนทุ่งหญ้า','ขอให้โชคดี วีรบุรุษ!'],obj:{t:'boss',k:'jinnLord',c:1,txt:'ปราบจินน์แห่งทะเลทราย'},r:{xp:.9,zeny:8000,item:3,card:'jinnLord'},title:{a:'s_7',n:'ผู้ปลุกจินน์',b:{crit:2,atk:.02}}},
  {t:'บันทึกสัตว์ร้าย',lv:44,who:'ปราชญ์ลูน่า',talk:['ก่อนจะข้ามไปดินแดนน้ำแข็งเลือด เธอต้องฝึกฝนให้มากกว่านี้','ศัตรูทางเหนือแข็งแกร่งกว่าที่เธอเคยเจอ','ล่ามอนสเตอร์ให้ได้ 80 ตัว แล้วฉันจะมอบของพิเศษให้'],obj:{t:'killAny',c:80,txt:'ล่ามอนสเตอร์ใดก็ได้ 80 ตัว'},r:{xp:.7,zeny:6000,gem:4}},
  {t:'ดินแดนน้ำแข็งเลือด',lv:58,who:'ผู้ใหญ่สมชัย',talk:['อัศวินมรณะปรากฏตัวทางเหนือ... พวกมันคือทหารของราชันย์กระดูก','หนาวและอันตรายกว่าทุกที่ที่เธอเคยไป','ปราบพวกมัน 30 ตัวเพื่อเปิดทางไปหาราชันย์'],obj:{t:'kill',k:'cp_reaper',c:30,txt:'ปราบอัศวินมรณะ'},r:{xp:.6,zeny:15000,gem:3,item:3}},
  {t:'ราชันย์กระดูก',lv:68,who:'ปราชญ์ลูน่า',talk:['ผนึกที่สามอยู่ในมือราชันย์กระดูก','มันมีสามเฟส ทุกครั้งที่โกรธจะเรียกสมุนและวงอันตรายถี่ขึ้น','เตรียมอุปกรณ์และสกิลให้พร้อม แล้วไปจบมัน'],obj:{t:'boss',k:'boss',c:1,txt:'โค่นราชันย์กระดูก'},r:{xp:1,zeny:30000,item:3,card:'boss'},title:{a:'s_10',n:'ผู้โค่นราชันย์',b:{atk:.04,hp:.04}}},
  {t:'ผู้ต้านเปลวไฟสุดท้าย',lv:84,who:'ผู้ใหญ่สมชัย',talk:['ท้องฟ้าเปลี่ยนเป็นสีม่วง... มังกรมาแล้ว','พวกลูกมังกรกำลังรวมตัวก่อนที่ราชาของพวกมันจะตื่น','อีกนิดเดียวแล้ว สู้ต่อไป!'],obj:{t:'kill',k:'cp_dragon',c:10,txt:'ปราบมังกรม่วง'},r:{xp:.7,zeny:40000,gem:6,item:3}},
  {t:'มังกรแห่งหายนะ',lv:98,who:'ปราชญ์ลูน่า',talk:['นี่คือการต่อสู้ครั้งสุดท้าย','ผนึกทั้งสามกำลังจะแตก และมังกรแห่งหายนะจะตื่นเต็มตัว','ทุกอย่างที่เธอสะสมมา — สกิล อุปกรณ์ — ใช้ให้หมด! โค่นมันซะ!'],obj:{t:'boss',k:'dragonLord',c:1,txt:'โค่นมังกรแห่งหายนะ'},r:{xp:1,zeny:100000,item:3,gem:10,card:'dragonLord'},title:{a:'s_12',n:'ผู้กอบกู้ทุ่งหญ้า',b:{atk:.08,hp:.08,exp:.05}}}
];
for(const c of STORY)if(c.title&&!TITLES.some(t=>t.a===c.title.a))TITLES.push({a:c.title.a,n:c.title.n,b:c.title.b});

function storyProg(){
  const S=P.dx.story,c=STORY[S.ch];if(!c)return 0;const o=c.obj;
  if(o.t==='cards')return Object.keys(P.dx.cards).filter(k=>MOBS[k]).length;
  if(o.t==='dg')return P.dx.stat.dg-(S.base||0);
  if(o.t==='lv')return P.lv;
  return S.p||0;
}
function storyCheck(){
  if(!P||!P.dx)return;const S=P.dx.story,c=STORY[S.ch];if(!c||S.st!==1)return;
  if(storyProg()>=c.obj.c){S.st=2;sfx('quest');toast(`📖 บทสำเร็จ: ${c.t}`);say('กลับไปรายงานผู้ใหญ่บ้าน/ปราชญ์ในเมือง หรือกด N เพื่อรับรางวัล','#9be58a');
    if(AUTO.focusRef&&AUTO.focusRef[0]==='s'){AUTO.focus=AUTO.focusRef=null;AUTO.chkT=0}
    updateTracker();refreshStory()}
}
function storyAccept(){
  const S=P.dx.story,c=STORY[S.ch];if(!c||S.st!==0)return;
  S.st=1;S.p=0;S.base=P.dx.stat.dg;sfx('quest');toast(`📖 รับบท: ${c.t}`);storyCheck();updateTracker();refreshStory();
}
function storyClaim(){
  const S=P.dx.story,c=STORY[S.ch];if(!c||S.st!==2)return;
  giveReward(c.r,`บท "${c.t}"`);if(c.r.card)giveCard(c.r.card);
  if(c.title){P.ach[c.title.a]=1;say(`ได้ฉายา "${c.title.n}" — ตั้งที่ปุ่มอาชีพ (Y) → ฉายา`,'#ffd27a')}
  S.ch++;S.st=0;S.p=0;sfx('levelup');toast('📖 จบบท!');recalcGear();updateTracker();refreshStory();
}
function storyGo(){
  const S=P.dx.story,c=STORY[S.ch];if(!c||S.st!==1){openStory();return}
  const o=c.obj;
  if(o.t==='kill'||o.t==='boss'){
    AUTO.focus=o.k;AUTO.focusRef='s:'+S.ch;AUTO.mode='hunt';AUTO.chkT=0;
    if(!AUTO.on)setAuto(true);else AUTO.anchor=defaultAnchor();
    AUTO.focus=o.k;AUTO.focusRef='s:'+S.ch;
    const nm=MOBS[o.k].name;if(MOBS[o.k].lv>P.lv+5)say(`⚠ ${nm} Lv ${MOBS[o.k].lv} สูงกว่าคุณมาก ระวังตัว!`,'#ff9d9a');
    say(`ออโต้: ไปล่า ${nm} ตามเนื้อเรื่อง "${c.t}"`,'#9be58a');updateTracker();
  }else if(o.t==='killAny'){AUTO.focus=AUTO.focusRef=null;if(!AUTO.on)setAuto(true);say('ออโต้: ล่ามอนสเตอร์ตามเลเวล','#9be58a')}
  else if(o.t==='dg'){if($('winDg').style.display!=='block')toggleWin('winDg')}
  else if(o.t==='cards'){DP.tab='card';if($('winDepth').style.display!=='block')toggleWin('winDepth');else refreshDepth()}
  else openStory();
}
REG.kill.push(m=>{
  if(!P||!P.dx)return;const S=P.dx.story,c=STORY[S.ch];if(!c||S.st!==1)return;const o=c.obj;
  if(o.t==='kill'&&m.k===o.k)S.p=Math.min(o.c,(S.p||0)+1);
  else if(o.t==='killAny')S.p=Math.min(o.c,(S.p||0)+1);
  else if(o.t==='boss'&&m.k===o.k&&!m.add)S.p=1;
  else return;
  storyCheck();updateTracker();refreshStory();
});
const _focusCheck=focusCheck;
focusCheck=function(){
  if(AUTO.focusRef&&AUTO.focusRef[0]==='s'){const S=P.dx.story;if(!(S.st===1&&+AUTO.focusRef.slice(2)===S.ch)){AUTO.focus=AUTO.focusRef=null;AUTO.chkT=0}return}
  _focusCheck();
};
const _updateTracker=updateTracker;
updateTracker=function(){
  _updateTracker();
  const e=$('tracker');if(!e||!P||!P.dx)return;const S=P.dx.story,c=STORY[S.ch];if(!c)return;
  let row='';
  if(S.st===1){const p=Math.min(c.obj.c,storyProg());row=`<div class="tr${AUTO.focusRef==='s:'+S.ch?' on':''}" onclick="storyGo()">📖 ${c.t}: ${c.obj.txt} <b>${p}/${c.obj.c}</b></div>`}
  else if(S.st===2)row=`<div class="tr" onclick="openStory()"><span class="ok">✔</span> 📖 ${c.t} — แตะรับรางวัล</div>`;
  else if(P.lv>=c.lv)row=`<div class="tr" onclick="openStory()">📖 บทใหม่: ${c.t} <b>!</b></div>`;
  if(!row)return;
  const hd=e.querySelector('.hd');if(hd)hd.insertAdjacentHTML('afterend',row);else e.insertAdjacentHTML('afterbegin',row);
  e.style.display='block';
};
REG.tick.push((dt)=>{
  if(!P||!P.dx)return;P.storyT=(P.storyT||0)-dt;if(P.storyT>0)return;P.storyT=1.5;
  const S=P.dx.story,c=STORY[S.ch];if(c&&S.st===1)storyCheck();
  if(c&&S.st===0){const k=S.ch+':'+(P.lv>=c.lv);if(P.dx.seen.sn!==k){P.dx.seen.sn=k;updateTracker()}}
  const b=$('bStory');if(b)b.classList.toggle('badge',!!c&&(S.st===2||(S.st===0&&P.lv>=c.lv)));
});
const SW={};
(function(){
  const d=document.createElement('div');d.id='winStory';d.className='win panel sm';d.style.cssText='z-index:5;width:min(520px,96vw)';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`#winStory .bub{margin:6px 0;padding:7px 10px;background:#10142a;border:2px solid #0b0d18;box-shadow:inset 0 0 0 2px #39406a;font-size:13px;line-height:1.5}
#winStory .bub b{color:#ffd27a}#winStory .obj{margin:8px 0;padding:7px 10px;background:#1f2a1a;border:2px solid #7cc85e;font-size:13px}
#winStory .chs{display:flex;gap:3px;flex-wrap:wrap;margin-bottom:6px}#winStory .chs i{width:18px;height:18px;font-style:normal;font-size:10px;line-height:18px;text-align:center;background:#161c38;border:1px solid #39406a;color:#9aa3c8}
#winStory .chs i.d{background:#3a7a4a;color:#fff}#winStory .chs i.c{background:#c9a24b;color:#000;font-weight:bold}`;
  document.head.appendChild(s);
})();
function openStory(){if($('winStory').style.display!=='block')toggleWin('winStory');else refreshStory()}
function refreshStory(){
  const w=$('winStory');if(!w||w.style.display!=='block'||!P||!P.dx)return;
  const S=P.dx.story,c=STORY[S.ch];let body='';
  const chs=`<div class="chs">${STORY.map((q,i)=>`<i class="${i<S.ch?'d':i===S.ch?'c':''}" title="${q.t}">${i+1}</i>`).join('')}</div>`;
  if(!c)body=chs+`<div class="bub"><b>ปราชญ์ลูน่า</b><br>ผนึกทั้งสามกลับมาสงบแล้ว ทุ่งหญ้ากลับมาเป็นสุขอีกครั้ง ขอบคุณเธอ วีรบุรุษแห่งทุ่งหญ้า 🌾</div><div class="small">เรื่องราวหลักจบแล้ว — ยังมีดันเจี้ยน การ์ด ตกปลา และบอสโลกรอเธออยู่!</div>`;
  else{
    const p=Math.min(c.obj.c,storyProg());
    body=chs+`<div style="font-size:16px;color:#ffe28a;font-weight:bold">บทที่ ${S.ch+1}: ${c.t}</div><div class="small">แนะนำ Lv ${c.lv}${P.lv<c.lv?' <span style="color:#ff9d9a">(ยังไม่ถึง)</span>':''}</div>`+
      c.talk.map(t=>`<div class="bub"><b>${c.who}</b><br>${t}</div>`).join('')+
      `<div class="obj">🎯 ${c.obj.txt} <b>${S.st>=1?p:0}/${c.obj.c}</b></div><div class="small">รางวัล: ${rewardText(c.r)}${c.title?` • ฉายา "${c.title.n}"`:''}</div>`+
      `<div style="text-align:center;margin-top:8px">${S.st===0?`<button class="bgreen" onclick="storyAccept()">รับภารกิจ</button>`:S.st===1?`<button onclick="storyGo();toggleWin('winStory')">ไปทำภารกิจ (ออโต้)</button>`:`<button onclick="storyClaim()" style="font-size:15px;padding:8px 20px">รับรางวัล</button>`}</div>`;
  }
  w.innerHTML=`<h3><span>📖 เรื่องราวแห่งทุ่งหญ้า</span><button class="x" onclick="toggleWin('winStory')">✕</button></h3><div class="winbody">${body}</div>`;
}
WINX.winStory=refreshStory;
(function(){const b=$('bStory');if(b)b.onclick=()=>toggleWin('winStory')})();
addEventListener('keydown',e=>{if(P&&keyName(e)==='n')toggleWin('winStory')});

/* ---------- ตกปลา / ทำอาหาร / พ่อค้าเร่ ---------- */
const FISH=[
  {id:'f1',n:'ปลาซิว',t:0,v:8},{id:'f2',n:'ปลาดุก',t:0,v:15},{id:'f3',n:'ปลาสร้อย',t:0,v:12},
  {id:'f4',n:'ปลาช่อน',t:1,v:60},{id:'f5',n:'ปลานิล',t:1,v:80},
  {id:'f6',n:'ปลาทอง',t:2,v:300},{id:'f7',n:'ปลาเทวดา',t:2,v:420},
  {id:'f8',n:'ปลาหลาบมังกร',t:3,v:1500}];
const TIERN=['ธรรมดา','ดี','หายาก','ตำนาน'],TIERC=['#cfd6e8','#9be58a','#c58aff','#ffd27a'];
const ROD_COST=[0,800,2500,6000,12000];   // ค่าอัปเบ็ดไปเลเวล 2..5
// เหยื่อตกปลา 6 ชนิด (ภาพจาก art2_assets.js): ยิ่งแพงยิ่งเจอปลาหายากง่ายขึ้น (บวกเพิ่มในค่าโอกาสปลาเกรดสูง)
const BAITS=[{n:'ไส้เดือน',cost:15,b:0},{n:'หนอนไม้',cost:40,b:.03},{n:'ตั๊กแตน',cost:90,b:.06},{n:'เหยื่อปลอมปลาซิว',cost:250,b:.1},{n:'สปินเนอร์ทอง',cost:700,b:.16},{n:'เหยื่อปลอมกบมรกต',cost:1800,b:.25}];
const baitCur=()=>BAITS[Math.min(BAITS.length-1,Math.max(0,(P.dx&&P.dx.bait)|0))];
function baitPick(i){P.dx.bait=i;refreshLife()}
function rollFish(){
  const L=(P.dx.rod-1)*.04+baitCur().b,r=Math.random(),t3=.02+L*.3,t2=.11+L*.7,t1=.25+L*.5;
  const t=r<t3?3:r<t3+t2?2:r<t3+t2+t1?1:0,pool=FISH.filter(f=>f.t===t);return pool[Math.random()*pool.length|0];
}
const fishCount=(minT)=>FISH.filter(f=>f.t>=minT).reduce((s,f)=>s+(P.dx.fish[f.id]||0),0);
function takeFish(minT,n){   // ใช้ปลาเกรดต่ำที่สุดที่เข้าเงื่อนไขก่อน
  for(const f of FISH.filter(q=>q.t>=minT).sort((a,b)=>a.t-b.t)){while(n>0&&(P.dx.fish[f.id]||0)>0){P.dx.fish[f.id]--;n--}}
}
const HERBN={g:['🌿','ใบสมุนไพรป่า'],d:['🌵','ดอกทะเลทราย'],i:['🧊','ผลน้ำแข็ง']};
const RECIPES=[
  {id:'soup',n:'ซุปปลาสมุนไพร',ic:'🍲',fish:[0,2],herb:{g:2},cost:50,mins:20,def:{n:'ซุปปลา',ic:'🍲',g:'food',b:{atk:.08}},d:'ATK +8% (20 นาที)'},
  {id:'grill',n:'ปลาย่างเกลือ',ic:'🐟',fish:[1,1],herb:{g:1},cost:120,mins:20,def:{n:'ปลาย่าง',ic:'🐟',g:'food',b:{hp:.15,def:3}},d:'HP +15% • DEF +3 (20 นาที)'},
  {id:'tomyum',n:'ต้มยำทะเลทราย',ic:'🥘',fish:[0,2],herb:{d:3},cost:200,mins:20,def:{n:'ต้มยำ',ic:'🥘',g:'food',b:{exp:.2}},d:'EXP +20% (20 นาที)'},
  {id:'sashimi',n:'ซาชิมิน้ำแข็ง',ic:'🍣',fish:[2,1],herb:{i:3},cost:500,mins:20,def:{n:'ซาชิมิ',ic:'🍣',g:'food',b:{crit:6},x:{dmg:.1}},d:'คริติคอล +6 • ดาเมจ +10% (20 นาที)'},
  {id:'feast',n:'งานเลี้ยงมังกร',ic:'🍖',fish:[3,1],herb:{g:2,d:2,i:2},cost:2000,mins:30,def:{n:'งานเลี้ยง',ic:'🍖',g:'food',b:{atk:.12,exp:.2,hp:.15}},d:'ATK +12% • EXP +20% • HP +15% (30 นาที)'}
];
for(const r of RECIPES)BUFFS['food_'+r.id]=r.def;
// ข้อมูลอาหารสำหรับกระเป๋า (index.html: bagList / eatFood)
window.foodInfo=id=>{const r=RECIPES.find(q=>q.id===id);return r?{n:r.n,ic:r.ic,d:r.d,mins:r.mins}:null};

const slotNow=()=>Math.floor(Date.now()/600000);
const OFFERS=[
  {id:'sExp',n:'ม้วน EXP',ic:'📜',d:'EXP +30% นาน 20 นาที',price:()=>3000+P.lv*30,go:()=>addBuff('scrollExp',20)},
  {id:'sAtk',n:'ม้วนพลัง',ic:'📕',d:'ATK +15% นาน 20 นาที',price:()=>3000+P.lv*30,go:()=>addBuff('scrollAtk',20)},
  {id:'sDef',n:'ม้วนเกราะ',ic:'📘',d:'HP +15% • DEF +8 นาน 20 นาที',price:()=>2500+P.lv*25,go:()=>addBuff('scrollDef',20)},
  {id:'potH',n:'ยา HP x15',ic:'🍷',d:'ยาฟื้นเลือด 15 ขวด',price:()=>1500,go:()=>{P.pot.hp+=15}},
  {id:'potS',n:'ยา SP x10',ic:'🧪',d:'ยาฟื้น SP 10 ขวด',price:()=>1200,go:()=>{P.pot.sp+=10}},
  {id:'gem',n:'หินเวท x2',ic:'💎',d:'วัตถุดิบตีบวก/เปลี่ยนธาตุอาวุธ',price:()=>5000+P.lv*50,go:()=>addMat('gem',2)},
  {id:'ore',n:'แร่ x10',ic:'⛏️',d:'วัตถุดิบตีบวก',price:()=>1200+P.lv*10,go:()=>addMat('ore',10)}
];
function cardPick(){
  const pool=ROSTER.filter(r=>!(r[4]&&r[4].boss)&&Math.abs(r[3]-P.lv)<=18).map(r=>r[0]);
  const ks=pool.length?pool:ROSTER.filter(r=>!(r[4]&&r[4].boss)).map(r=>r[0]);return ks[Math.random()*ks.length|0];
}
function shopStock(){
  const sl=slotNow(),R=seeded(sl*977+13),pool=OFFERS.slice(),out=[];
  while(out.length<5&&pool.length){out.push(pool.splice(Math.floor(R()*pool.length),1)[0])}
  return out;
}
function buyOffer(id){
  const sl=slotNow();P.dx.seen.shop=(P.dx.seen.shop&&P.dx.seen.shop.s===sl)?P.dx.seen.shop:{s:sl,b:{}};
  const o=OFFERS.find(q=>q.id===id);if(!o||P.dx.seen.shop.b[id])return;const c=o.price();
  if(P.zeny<c){say('Zeny ไม่พอ','#ff9d9a');return}
  P.zeny-=c;P.dx.seen.shop.b[id]=1;o.go();sfx('coin');toast(`ซื้อ ${o.n} แล้ว`);refreshLife();refreshBag&&refreshBag();
}
const LF={tab:'fish',ph:'idle',pos:0,dir:1,zs:.4,zw:.25,fish:null,spd:1,raf:0,msg:''};
(function(){
  const d=document.createElement('div');d.id='winLife';d.className='win panel sm';d.style.cssText='z-index:5;width:min(540px,96vw)';document.body.appendChild(d);
  const s=document.createElement('style');s.textContent=`#winLife .fbar{position:relative;height:26px;margin:8px 0;background:#0b0d18;border:2px solid #39406a}
#winLife .fbar .z{position:absolute;top:0;bottom:0;background:rgba(124,200,94,.65);border-left:2px solid #9be58a;border-right:2px solid #9be58a}
#winLife .fbar .m{position:absolute;top:-3px;bottom:-3px;width:6px;background:#ffe28a;box-shadow:0 0 6px #ffe28a}
#winLife .fv{display:flex;gap:6px;flex-wrap:wrap}#winLife .fv span{padding:3px 7px;background:#10142a;border:1px solid #39406a;font-size:12px}`;
  document.head.appendChild(s);
})();
function fishCast(){
  if(LF.ph!=='idle')return;if(P.zeny<baitCur().cost){say(`ต้องมีเหยื่อ ${baitCur().cost} Zeny`,'#ff9d9a');return}
  P.zeny-=baitCur().cost;LF.ph='wait';LF.msg='รอปลากินเบ็ด...';refreshLife();
  setTimeout(()=>{if(LF.ph!=='wait')return;
    const f=rollFish();LF.fish=f;LF.ph='bar';LF.pos=0;LF.dir=1;
    LF.zw=Math.max(.1,(.18+.04*P.dx.rod)*[1,.85,.7,.55][f.t]);LF.zs=rnd(.1,.9-LF.zw);LF.spd=.9+f.t*.28;LF.msg='ปลากินเบ็ดแล้ว! กด "ดึง!" ตอนขีดอยู่ในโซนเขียว';sfx('alert');refreshLife();fishLoop()
  },rnd(900,2600));
}
function fishLoop(){
  cancelAnimationFrame(LF.raf);let last=performance.now();
  const step=t=>{
    if(LF.ph!=='bar')return;const dt=Math.min(.05,(t-last)/1000);last=t;
    LF.pos+=LF.dir*LF.spd*dt;if(LF.pos>=1){LF.pos=1;LF.dir=-1}else if(LF.pos<=0){LF.pos=0;LF.dir=1}
    const m=$('fMk');if(m)m.style.left=`calc(${LF.pos*100}% - 3px)`;LF.raf=requestAnimationFrame(step);
  };LF.raf=requestAnimationFrame(step);
}
function fishPull(){
  if(LF.ph!=='bar')return;const f=LF.fish,ok=LF.pos>=LF.zs&&LF.pos<=LF.zs+LF.zw;LF.ph='idle';
  if(ok){P.dx.fish[f.id]=(P.dx.fish[f.id]||0)+1;P.dx.stat.fish++;LF.msg=`🎣 ได้ ${f.n} (${TIERN[f.t]})!`;sfx('loot',f.t>=2?3:1);if(f.t>=2)toast(`🎣 ได้ ${f.n}!`)}
  else{LF.msg='ปลาหลุดไปแล้ว...';sfx('hit')}
  refreshLife();
}
function sellFish(all){
  let g=0;for(const f of FISH){const n=P.dx.fish[f.id]||0;if(!n)continue;if(!all&&f.t>=2)continue;g+=n*f.v;P.dx.fish[f.id]=0}
  if(!g){say('ไม่มีปลาให้ขาย','#ccc');return}P.zeny+=g;sfx('coin');toast(`ขายปลา +${g.toLocaleString()} Zeny`);refreshLife();
}
function rodUp(){
  const c=ROD_COST[P.dx.rod];if(!c||P.dx.rod>=5)return;if(P.zeny<c){say('Zeny ไม่พอ','#ff9d9a');return}
  P.zeny-=c;P.dx.rod++;sfx('levelup');toast(`เบ็ดเลเวล ${P.dx.rod}`);refreshLife();
}
function canCook(r){
  if(P.zeny<r.cost||fishCount(r.fish[0])<r.fish[1])return false;
  for(const h in r.herb)if((P.dx.herb[h]||0)<r.herb[h])return false;return true;
}
function cook(id){
  const r=RECIPES.find(q=>q.id===id);if(!r||!canCook(r))return;
  P.zeny-=r.cost;takeFish(r.fish[0],r.fish[1]);for(const h in r.herb)P.dx.herb[h]-=r.herb[h];
  P.dx.stat.cook++;P.dx.food=P.dx.food||{};P.dx.food[r.id]=(P.dx.food[r.id]||0)+1;   // เข้ากระเป๋าอัตโนมัติ (แท็บ ใช้)
  sfx('levelup');toast(`${r.ic} ทำ${r.n}สำเร็จ! เก็บเข้ากระเป๋าแล้ว`);say(`${r.ic} ${r.n} อยู่ในกระเป๋า (แท็บ ใช้) กดกินเมื่อต้องการ`,'#ffd27a');refreshLife();try{if($('winBag').style.display==='block')refreshBag()}catch(e){}
}
function refreshLife(){
  const w=$('winLife');if(!w||w.style.display!=='block'||!P||!P.dx)return;let body='';
  const herbs=Object.keys(HERBN).map(h=>`<span>${HERBN[h][0]} ${HERBN[h][1]} ${P.dx.herb[h]||0}</span>`).join('');
  if(LF.tab==='fish'){
    const inv=FISH.filter(f=>P.dx.fish[f.id]).map(f=>`<span style="color:${TIERC[f.t]}">${f.n} x${P.dx.fish[f.id]}</span>`).join('')||'<span>ยังไม่มีปลา</span>';
    const nextRod=P.dx.rod<5?ROD_COST[P.dx.rod]:0;
    let area='';
    if(LF.ph==='idle')area=`<button onclick="fishCast()" style="font-size:15px;padding:8px 22px">🎣 ลงเบ็ด (${baitCur().cost}z)</button>`;
    else if(LF.ph==='wait')area='<div class="small">... รอปลากินเบ็ด ...</div>';
    else area=`<div class="fbar"><div class="z" style="left:${LF.zs*100}%;width:${LF.zw*100}%"></div><div class="m" id="fMk" style="left:calc(${LF.pos*100}% - 3px)"></div></div><button onclick="fishPull()" style="font-size:16px;padding:9px 30px">ดึง!</button>`;
    const bi=baitCur(),baitRow=BAITS.map((q,i)=>`<div onclick="baitPick(${i})" title="${q.n} ${q.cost}z • ปลาหายาก +${Math.round(q.b*100)}%" style="cursor:pointer;text-align:center;padding:3px;border:2px solid ${q===bi?'#ffd04a':'#39406a'};background:#10142a;width:64px;font-size:10px">${window.ART2&&ART2['bait'+i]?`<img src="${ART2['bait'+i]}" style="width:36px;height:36px;object-fit:contain">`:'🪱'}<br>${q.n}<br><span style="color:#ffe28a">${q.cost}z</span></div>`).join('');
    body=`<img src="art2/pond.webp" alt="" style="width:100%;height:120px;object-fit:cover;border-radius:6px;border:2px solid #39406a;display:block;margin-bottom:6px"><div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:center;margin-bottom:6px">${baitRow}</div><div class="small" style="margin-bottom:4px">เหยื่อ: <b>${bi.n}</b> (โอกาสปลาหายาก +${Math.round(bi.b*100)}%)</div><div class="small" style="margin-bottom:4px">ตกปลาจับจังหวะ — เบ็ดดีขึ้นโซนกว้างขึ้นและเจอปลาหายากง่ายขึ้น ปลาใช้ทำอาหารบัฟ หรือขายเอาเงิน</div>
      <div class="mat"><span>🎣 เบ็ดเลเวล ${P.dx.rod}/5</span><span>ตกแล้ว ${P.dx.stat.fish} ตัว</span>${nextRod?`<button onclick="rodUp()" style="margin-left:auto">อัปเบ็ด ${nextRod.toLocaleString()}z</button>`:''}</div>
      <div style="text-align:center;margin:6px 0">${area}<div class="small" style="margin-top:4px;min-height:16px;color:#ffe28a">${LF.msg}</div></div>
      <div class="fv">${inv}</div>
      <div style="margin-top:6px;text-align:right"><button onclick="sellFish(false)">ขายปลาธรรมดา-ดี</button> <button onclick="sellFish(true)">ขายทั้งหมด</button></div>`;
  }else if(LF.tab==='cook'){
    body=`<div class="small" style="margin-bottom:4px">สมุนไพรได้จากมอนสเตอร์ในแต่ละแมพ (ป่า/ทะเลทราย/น้ำแข็ง) • ปลาได้จากการตกปลา • อาหารให้บัฟ ทำใหม่แทนที่ของเก่า</div>
      <div class="fv">${herbs}</div>`+RECIPES.map(r=>{
      const need=[`ปลา${TIERN[r.fish[0]]}ขึ้นไป ${fishCount(r.fish[0])}/${r.fish[1]}`,...Object.keys(r.herb).map(h=>`${HERBN[h][1]} ${P.dx.herb[h]||0}/${r.herb[h]}`),`${r.cost}z`];
      return`<div class="eqr"><span style="font-size:24px">${r.ic}</span><div class="nm"><b>${r.n}</b> <span class="small">${r.d}</span><br><span class="small">${need.join(' • ')}</span></div><button ${canCook(r)?'':'disabled'} onclick="cook('${r.id}')">ทำ</button></div>`}).join('');
  }else{
    const sl=slotNow(),seen=P.dx.seen.shop&&P.dx.seen.shop.s===sl?P.dx.seen.shop:{s:sl,b:{}},left=600-Math.floor((Date.now()/1000)%600);
    P.dx.seen.shopSeen=sl;
    body=`<div class="small" style="margin-bottom:4px">🛒 พ่อค้าเร่ ฮันส์ — สินค้าเปลี่ยนทุก 10 นาที (เหลือ ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}) ซื้อได้ชิ้นละครั้ง</div>`+
      shopStock().map(o=>{const bought=seen.b[o.id];return`<div class="eqr"><span style="font-size:24px">${o.ic}</span><div class="nm"><b>${o.n}</b><br><span class="small">${o.d} • ${o.price().toLocaleString()}z</span></div><button ${bought||P.zeny<o.price()?'disabled':''} onclick="buyOffer('${o.id}')">${bought?'ซื้อแล้ว':'ซื้อ'}</button></div>`}).join('');
  }
  w.innerHTML=`<h3><span>🎣 ชีวิตชาวบ้าน</span><button class="x" onclick="LF.ph==='bar'&&(LF.ph='idle');toggleWin('winLife')">✕</button></h3>
    <div class="tabs2">${[['fish','ตกปลา'],['cook','ทำอาหาร'],['shop','พ่อค้าเร่']].map(([k,n])=>`<button class="${LF.tab===k?'on':''}" onclick="LF.tab='${k}';refreshLife()">${n}</button>`).join('')}</div><div class="winbody">${body}</div>`;
}
WINX.winLife=refreshLife;
(function(){const b=$('bLife');if(b)b.onclick=()=>toggleWin('winLife')})();
addEventListener('keydown',e=>{if(P&&keyName(e)==='g')toggleWin('winLife')});

/* ---------- NPC ที่เดินอยู่ในเมือง ---------- */
const NPCS=[
  {id:'elder',n:'ผู้ใหญ่สมชัย',cls:'warrior',sty:{shirt:'white',hair:'silver',skin:'tan',hat:'straw'},act:'story'},
  {id:'sage',n:'ปราชญ์ลูน่า',cls:'mage',sty:{dye:'purple',hat:'halo'},act:'story'},
  {id:'fisher',n:'ลุงปลา',cls:'warrior',img:'fisher',sty:{shirt:'blue',hair:'brown',skin:'brown',hat:'straw',dye:'teal'},act:'fish'},
  {id:'cook',n:'ป้าใบ',cls:'rogue',sty:{dye:'green',hair:'black',hat:'flowers'},act:'cook'},
  {id:'merchant',n:'พ่อค้าเร่ ฮันนา',cls:'rogue',img:'merchant',sty:{dye:'orange',hair:'brown',hat:'tophat',back:'capeR'},act:'shop'},
  {id:'rebirth',n:'เทพีเอลิน (จุติ)',cls:'mage',img:'goddess',sty:{dye:'orange',hair:'silver',hat:'halo'},act:'rebirth'},
  {id:'smith',n:'ช่างตีเหล็กบอร์ก',cls:'warrior',img:'smith',act:'smith'},
  {id:'guide',n:'นักสำรวจเอลซ่า',cls:'rogue',img:'guide',act:'quest'}
];
const NP=[];let npMap='';
function npcSpawn(){
  NP.length=0;npMap=MAPID;if(MAP.dungeon||!TOWN)return;
  for(const d of NPCS){
    const C=CLASSES[d.cls];if(!SHEETS[C.sprite])continue;
    let x=0,y=0;const sl=TOWN.slots&&TOWN.slots.npc&&TOWN.slots.npc[d.id];
    if(sl){x=sl.x;y=sl.y}else for(let t=0;t<60;t++){x=rnd(TOWN.x0+110,TOWN.x1-110);y=rnd(TOWN.y0+150,TOWN.y1-70);if(walkable(x,y))break}
    const a=makeActor(C.sprite),sh=d.img?null:styledSheet(d.cls,d.sty);if(sh)a.sh=sh;
    NP.push({d,x,y,hx:x,hy:y,wx:x,wy:y,wt:rnd(0,3),actor:a});
  }
}
REG.tick.push((dt)=>{
  if(!P)return;if(npMap!==MAPID)npcSpawn();
  for(const n of NP){
    n.wt-=dt;if(n.wt<=0){n.wt=rnd(3,8);if(Math.random()<.7){n.wx=n.hx+rnd(-60,60);n.wy=n.hy+rnd(-30,30)}}
    const dx=n.wx-n.x,dy=n.wy-n.y,d=Math.hypot(dx,dy);
    if(d>6){if(tryMove(n,dx/d*26*dt,dy/d*26*dt)){n.actor.ang=Math.atan2(dy,dx);loopAnim(n.actor,'walk',.5)}else{n.wx=n.x;n.wy=n.y;loopAnim(n.actor,'idle')}}
    else loopAnim(n.actor,'idle');
    tickActor(n.actor,dt);
  }
  // เดินไปถึง NPC ที่คลิกไว้ -> เปิดหน้าต่าง
  if(P.npcx){
    const n=P.npcx;
    if(Math.hypot(P.x-n.x,P.y-n.y)<120){P.npcx=null;P.dest=null;n.actor.ang=Math.atan2(P.y-n.y,P.x-n.x);npcOpen(n.d)}
    else if(!P.dest)P.npcx=null;
  }
});
function npcOpen(d){
  if(d.act==='story'){openStory();return}
  if(d.act==='rebirth'){rbOpen();return}
  if(d.act==='smith'){if(typeof inTown==='function'&&!inTown(P.x,P.y)){say('ต้องอยู่ในเมืองก่อน','#ffe28a');return}if($('winSmith').style.display!=='block')toggleWin('winSmith');return}
  if(d.act==='quest'){if($('winQuest').style.display!=='block')toggleWin('winQuest');return}
  LF.tab=d.act;if($('winLife').style.display!=='block')toggleWin('winLife');else refreshLife();
}
addEventListener('pointerdown',e=>{
  if(!P||e.target!==cv||P.hp<=0||P.dying>0||!NP.length||!e.isPrimary)return;
  const w=worldPos(e);
  for(const n of NP){
    const h=n.d.img?114:CLASSES[n.d.cls].h;
    if(Math.abs(w.x-n.x)<h*.35+10&&n.y-w.y>-14&&n.y-w.y<h+14){
      e.stopPropagation();e.preventDefault();P.target=null;P.dest={x:n.x,y:n.y+54};P.npcx=n;return}
  }
},true);
REG.draw.push((Ls,iv)=>{
  for(const n of NP){
    if(!iv(n.x,n.y,100,160))continue;
    Ls.push({y:n.y,f:()=>{
      lx.globalAlpha=.28;pxEllipse(sxL(n.x),syL(n.y),9,3,'#000',true);lx.globalAlpha=1;
      const im=n.d.img&&window.ART2_IM&&ART2_IM['npc_'+n.d.img+'_1'];
      if(im){   // NPC ภาพใหม่ (art2): เดินหันตามทิศ + ขยับขึ้นลงเบาๆ
        const hh=38,ww=im.width*hh/im.height,bob=Math.abs(Math.sin(time*(n.actor.anim==='walk'?7:2.2)))*(n.actor.anim==='walk'?1.6:.7),fl=Math.cos(n.actor.ang)<-.2;
        lx.save();lx.imageSmoothingEnabled=true;lx.imageSmoothingQuality='high';lx.translate(sxL(n.x),syL(n.y)-bob);if(fl)lx.scale(-1,1);
        lx.drawImage(im,-ww/2,-hh+1,ww,hh);lx.restore();return}
      drawStyleWorld(n.actor,n.x,n.y,'back',n.d.sty);drawActor(n.actor,n.x,n.y,{sc:UNIT_SCALE});drawStyleWorld(n.actor,n.x,n.y,'front',n.d.sty);
    }});
  }
});
function npcMark(n){
  const S=P.dx.story,c=STORY[S.ch];
  if(n.d.act==='story')return c&&(S.st===2?'✔':(S.st===0&&P.lv>=c.lv)?'❗':S.st===1?'…':'');
  if(n.d.act==='shop')return P.dx.seen.shopSeen!==slotNow()?'❗':'';
  if(n.d.act==='rebirth')return rbMark();
  return '';
}
REG.names.push((TX,sc)=>{
  if(!P||!P.dx)return;
  for(const n of NP){
    const hL=n.d.img?38:Math.round(CLASSES[n.d.cls].h/A),x=sxL(n.x),y=syL(n.y)-hL-(n.d.img?6:(n.d.sty.hat&&n.d.sty.hat!=='none'?22:10));if(x<-60||x>LW+60||y<-30||y>LH+30)continue;
    const mk=npcMark(n),ic={story:'📖',fish:'🎣',cook:'🍲',shop:'🛒',rebirth:'🌟',smith:'⚒',quest:'📜'}[n.d.act];
    TX(x*sc,y*sc,`${ic} ${n.d.n}${mk?' '+mk:''}`,mk==='❗'||mk==='✔'?'#ffe28a':'#e8f0ff',11);
  }
});
