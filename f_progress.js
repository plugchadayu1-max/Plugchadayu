'use strict';
/* ===== f_progress.js — เลื่อนขั้นอาชีพ (ท่าไม้ตายปุ่มที่ 4), สัตว์เลี้ยง, ชุดเซ็ต, ฉายา, อันดับ + ผู้เล่นปลอมในเมือง, ป้ายแจ้งเตือน, เมนูพับ ===== */

/* ---------- อาชีพขั้นสูง ---------- */
// p = โบนัสตั้งต้น (ขั้น 2 ตื่นรู้ = x1.8)   u = ท่าไม้ตายปุ่ม 4
const JOBS={
  warrior:{
    A:{n:'อัศวินโล่เหล็ก',n2:'จอมพลโล่เหล็ก',ic:'🛡️',d:'ถึกที่สุด รับดาเมจแทนทีม',p:{hp:.2,def:6},ud:'กำแพงเหล็กกระแทกรอบตัว ศัตรูมึน 2.5 วิ',
      u:{n:'Iron Fortress',ic:'🛡️',sp:30,cd:14,type:'aoe',mult:3.2,r:170,col:'#9fd0ff',vfx:'war5',vfx2:'war4',stun:2.5}},
    B:{n:'นักรบคลั่ง',n2:'ราชันย์คลั่ง',ic:'🔥',d:'ดาเมจสูง เน้นคริติคอล',p:{atk:.15,crit:6},ud:'ปลดปล่อยพลังคลั่งฟันรอบตัวแรงมาก',
      u:{n:'Blood Rage',ic:'🔥',sp:34,cd:16,type:'aoe',mult:4.4,r:150,col:'#ff4a3a',vfx:'war4',vfx2:'war2'}}},
  mage:{
    A:{n:'ราชาวิญญาณ',n2:'จักรพรรดิวิญญาณ',ic:'👻',d:'SP เยอะ คุมสนามด้วยวิญญาณและกองทัพโครงกระดูก',p:{sp:.25,hp:.1},ud:'กรีดร้องวิญญาณรอบตัว ศัตรูมึน 3 วิ แล้วเรียกโครงกระดูก 3 ตนช่วยสู้ 10 วินาทีก่อนสลายไป ทุกตนดูดเลือดให้คุณ +15%',
      u:{n:'Banshee Wail',ic:'👻',sp:48,cd:5,type:'summon',anim:'skill3',dur:1.0,hitAt:.5,mult:2.4,amult:3.2,range:420,life:10,maxMinions:6,count:3,ls:.15,r:290,nova:12,col:'#b98cff',vfx:'war5',tint:'hue-rotate(255deg)',stun:3,shake:7}},
    B:{n:'จอมอสูรกระดูก',n2:'ราชันย์อสูรกระดูก',ic:'💀',d:'พลังอัญเชิญระเบิด ดาเมจเป้าเดียวสูง และกองทัพกระดูก',p:{atk:.22,sp:.1},ud:'กะโหลกมหึมาหล่นถล่มวงกว้าง ศัตรูช้า แล้วกระดูกผุดเป็นโครงกระดูก 3 ตนที่แรงกว่า อยู่ 10 วินาทีก่อนสลายไป ทุกตนดูดเลือดให้คุณ +15%',
      u:{n:'Skull Meteor',ic:'💀',sp:50,cd:5,type:'summon',anim:'skill3',dur:1.0,hitAt:.5,mult:3.4,amult:6,range:420,life:10,maxMinions:6,count:3,ls:.15,r:230,nova:10,col:'#c58aff',vfx:'war5',tint:'hue-rotate(255deg)',slow:3.5,shake:8}}},
  archer:{
    A:{n:'ผู้เรียกพายุ',n2:'จอมพายุสายฟ้า',ic:'🌧️',d:'ฟาดสายฟ้ากวาดทั้งสนาม',p:{crit:8,atk:.08},ud:'ฝนสายฟ้า 14 ครั้งใส่ศัตรูรอบตัว',
      u:{n:'Lightning Rain',ic:'🌧️',sp:40,cd:16,type:'storm',mult:2.6,r:280,strikes:14,col:'#ffe86a',vfx:'lit3'}},
    B:{n:'พลซุ่มยิง',n2:'เทพพลซุ่มยิง',ic:'🎯',d:'ยิงไกล แม่นยำ ดาเมจทะลุ',p:{atk:.18,crit:4},ud:'ลูกศรทะลวงไกล ทะลุทุกตัวในแนว',
      u:{n:'Piercing Shot',ic:'🎯',sp:34,cd:13,type:'beam',mult:6.5,range:460,col:'#9fd0ff',vfx:'lit2'}}},
  rogue:{
    A:{n:'พลซุ่มปืนทมิฬ',n2:'ราชานักล่าเงา',ic:'🎯',d:'คริติคอลสูง ยิงสังหารเป้าเดียวในพริบตา',p:{crit:12,atk:.08},ud:'ยิงสังหาร 3 นัดติดใส่เป้าหมาย',
      u:{n:'Dead Eye',ic:'🎯',sp:30,cd:12,type:'single',mult:2.6,hits:3,range:380,col:'#ffd24a',vfx:'war1',tint:'hue-rotate(20deg) saturate(1.6)'}},
    B:{n:'จอมระเบิด',n2:'ราชันย์พิโรธเพลิง',ic:'💣',d:'ว่องไว ถึกขึ้น ระเบิดวงกว้างทำให้ศัตรูช้า',p:{hp:.15,spd:14,atk:.06},ud:'ระเบิดวงกว้าง ศัตรูช้า 4 วิ',
      u:{n:'Grenade Storm',ic:'💣',sp:36,cd:15,type:'aoe',mult:3,r:210,col:'#ff8a3d',vfx:'war5',tint:'hue-rotate(-20deg) saturate(1.6)',slow:4}}},
  boxer:{
    A:{n:'ยอดมวยพยัคฆ์ทมิฬ',n2:'ราชามวยพยัคฆ์',ic:'🐯',d:'ดาเมจและคริติคอลสูง จบไวด้วยมวยพยัคฆ์',p:{atk:.2,crit:8},ud:'ตั้งท่าไหว้ครูบนวงเวทย์ยันต์ทอง อัญเชิญพญาวานรเพลิงทองสี่กรด้านหลัง แล้วปล่อยหมัดนวอาวุธระเบิดคลื่นแสงทองวงกว้างมาก ศัตรูมึน 2.5 วินาที',
      u:{n:'มหาเวทย์นวอาวุธพญาวานรเพลิงทอง',ic:'👹',sp:40,cd:14,type:'aoe',anim:'skill4',dur:1.1,hitAt:.55,mult:5.2,r:260,col:'#ffd24a',vfx:'war5',vfx2:'war4',nova:12,stun:2.5,shake:8}},
    B:{n:'มวยเพลิงสวรรค์',n2:'ราชันย์มวยสวรรค์',ic:'🔥',d:'ถึกและต่อเนื่อง ลูกไฟรัวทั่วสนาม',p:{hp:.2,def:6,atk:.1},ud:'อัญเชิญพญาวานรเพลิงทองสี่กร ประสานพลังต่อยลูกไฟทองรัว 12 ลูกใส่ศัตรูหลายตัวพร้อมกัน',
      u:{n:'นวอาวุธพญาวานร: ห่าลูกไฟทอง',ic:'🔥',sp:38,cd:12,type:'multi',kind:'orb',anim:'skill4',dur:1.1,hitAt:.6,mult:1.3,arrows:12,range:480,col:'#ffcf5a'}}}
};
if(window.SKILL_ICONS){const I=SKILL_ICONS,U=I['อสูรเพลิงแปดกร'];
  I['มหาเวทย์นวอาวุธพญาวานรเพลิงทอง']=U;I['นวอาวุธพญาวานร: ห่าลูกไฟทอง']=U;
  I['หมัดพายุเพลิงโลกันตร์']=I['หมัดไฟสะเก็ดดาว'];I['จระเข้ฟาดหางวายุอัคคี']=I['เตะหมุนอัคคี'];I['เข่าลอยและศอกพยัคฆ์เพลิง']=I['เข่าพยัคฆ์เพลิง']}
const JOB1={lv:20,cost:3000},JOB2={lv:50,cost:20000};
/* ---------- อาชีพ/คลาสพิเศษ (Lv100): เทพสายฟ้า (จากนักยิงปืน) • อัญเชิญสายฟ้า / อัญเชิญความมืด (จากนักอัญเชิญ) ---------- */
const SPECIAL_LV=100,THUNDER_LV=SPECIAL_LV;
const SPECIALS={
  thunder:{from:'rogue',fromName:'นักยิงปืน',ic:'⚡',col:'#7ae8ff',bonus:'พลังโจมตี <b style="color:#ffd04a">x1.5</b> เหนืออาชีพปกติ • สกิลสายฟ้าวงกว้างอลังการ 4 สกิล (ท่าที่ 4 = อัลติเมท)',bestStat:true,say:'⚡ เทพสายฟ้า — พลังโจมตี x1.5 และสกิลสายฟ้าวงกว้าง 4 สกิล (ปุ่ม 1-4)'},
  sumthunder:{from:'mage',fromName:'นักอัญเชิญ',ic:'🐺',col:'#7ae8ff',bonus:'อัญเชิญหมาป่าดาราอัสนี 3 ตน • โซ่ตรวนพันธนาการดวงดาว • วิหคเทพดาราพิทักษ์ • มหาเวทย์อัญเชิญราชันย์เทพดารา (อัลติเมท) — สายฟ้าวงกว้าง',say:'🐺 อัญเชิญสายฟ้า — สกิลใหม่ 4 สกิล (ปุ่ม 1-4)'},
  sumdark:{from:'mage',fromName:'นักอัญเชิญ',ic:'😈',col:'#c58aff',bonus:'อัญเชิญอสูรหมาป่าทมิฬ 3 ตน (ดูดเลือด) • โซ่ตรวนและหัตถ์เงาอเวจี • ปีกพญาอีกาอเวจี • มหาเวทย์อัญเชิญจอมมารอเวจี (อัลติเมท) — ความมืดวงกว้าง',say:'😈 อัญเชิญความมืด — สกิลใหม่ 4 สกิล (ปุ่ม 1-4)'}
};
Object.assign(SKILL_DESC,{'ทัณฑ์อัสนีฟากฟ้า':'ชูคทาเหนือศีรษะเปิดวงเวทย์บนฟ้า แล้วปล่อยสายฟ้าฟาดลงมารอบตัวเป็นวงกว้าง',
  'ก้าวพริบตาอัสนีคู่':'แปลงร่างเป็นกระแสสายฟ้าพุ่งวาร์ปเข้าหาศัตรู แล้วระเบิดสายฟ้าจากฝ่ามือทั้งสองพร้อมกัน',
  'วายุอัสนีคลั่ง':'ลอยตัวด้วยกระแสลมไฟฟ้า หมุนตัวสร้างพายุสายฟ้าโอบล้อมกาย โจมตีรอบทิศหลายจังหวะ',
  'มหาเวทย์มังกรอัสนีพิโรธ':'เปิดวงเวทย์ใต้เท้าและวงแหวนรูน อัญเชิญมังกรสายฟ้าสีฟ้า-ทองพันรอบกาย คำรามระเบิดคลื่นอัสนี 3 ระลอก',
  'หมัดพายุเพลิงโลกันตร์':'ตั้งการ์ดมวยไทยปลุกเปลวไฟขึ้นที่หมัดคาดเชือก พุ่งชกหมัดตรงอัดคลื่นไฟ รัวหมัดเพลิงความเร็วสูง และปิดท้ายด้วยหมัดเสยอัปเปอร์คัตระเบิดเสาเพลิงขึ้นฟ้า',
  'จระเข้ฟาดหางวายุอัคคี':'ย่อตัวรวบรวมไฟที่ข้อเท้า ก่อนตวัดขาเตะก้านคอและหมุนตัวฟาดแข้ง 360 องศา สร้างกงล้อคลื่นไฟสีทอง-แดงกวาดศัตรูรอบตัว',
  'เข่าลอยและศอกพยัคฆ์เพลิง':'เปิดยันต์สีทองใต้เท้าแล้วกระโดดพุ่งแทงเข่าลอยกลางอากาศพร้อมออร่าพยัคฆ์เพลิงคำราม ก่อนทิ้งตัวสับศอกลงพื้นสร้างคลื่นกระแทกเพลิง',
  'มหาเวทย์นวอาวุธพญาวานรเพลิงทอง':'ตั้งท่าไหว้ครูมวยไทยบนวงเวทย์ยันต์สีทอง อัญเชิญร่างอวตารพญาวานรสีทองสี่กรปรากฏขึ้นด้านหลัง แล้วประสานพลังปล่อยหมัดนวอาวุธระเบิดคลื่นแสงสีทองทำลายล้าง',
  'นวอาวุธพญาวานร: ห่าลูกไฟทอง':'อัญเชิญร่างอวตารพญาวานรสีทองสี่กรด้านหลัง แล้วประสานพลังต่อยลูกไฟทองรัว 12 ลูกใส่ศัตรูหลายตัวพร้อมกัน',
  'อัญเชิญหมาป่าดาราอัสนี':'ชูคฑาเปิดประตูมิติสีฟ้า-ทอง อัญเชิญจิตวิญญาณภูตหมาป่าดาราอัสนี 3 ตนกระโจนออกมาขย้ำและฟาดกรงเล็บสายฟ้าใส่ศัตรูเบื้องหน้า',
  'โซ่ตรวนพันธนาการดวงดาว':'กระแทกคฑาเปิดวงเวทย์ดาราจักรใต้พื้น เรียกโซ่เวทย์สีทองและอักขระโบราณพุ่งขึ้นมาพันธนาการรอบทิศทาง ก่อนระเบิดเสาแสงดาราทำลายล้าง',
  'วิหคเทพดาราพิทักษ์':'อัญเชิญพลังวิหคเทพดาราเป็นปีกแสงสีฟ้า-ทองด้านหลัง ลอยตัวขึ้นกลางอากาศพร้อมสะบัดปีกยิงพายุขนนกแสงเวทย์ไปด้านหน้า',
  'มหาเวทย์อัญเชิญราชันย์เทพดารา':'เปิดประตูมิติมหาอาคมขนาดใหญ่ด้านหลัง อัญเชิญร่างอวตารราชันย์เทพเกราะทองสี่ปีกประสานพลังกับผู้ร่าย แล้วปลดปล่อยลำแสงดาราจักรพิพากษาอย่างรุนแรง',
  'อัญเชิญอสูรหมาป่าทมิฬ':'เปิดประตูมิติความมืดสีม่วงดำ อัญเชิญอสูรหมาป่าเงาเพลิงทมิฬดวงตาสีเลือด 3 ตนกระโจนออกมาขย้ำและฟาดกรงเล็บเงาใส่ศัตรู ดูดเลือด 10%',
  'โซ่ตรวนและหัตถ์เงาอเวจี':'กระแทกคฑาเปิดวงเวทย์คำสาป เรียกมือเงาอเวจีและโซ่ตรวนทมิฬผุดจากพื้นรัดตรึง ก่อนระเบิดหนามคริสตัลความมืดพุ่งแทงรอบตัว',
  'ปีกพญาอีกาอเวจี':'อัญเชิญจิตวิญญาณพญาอีกาแห่งความมืดกางปีกเงาดำ-ม่วงด้านหลัง ลอยตัวขึ้นพร้อมสะบัดปีกซัดพายุขนนกคมมีดทมิฬและสายฟ้ามืด',
  'มหาเวทย์อัญเชิญจอมมารอเวจี':'เปิดประตูมิติหลุมดำสุริยคราส อัญเชิญร่างอวตารจอมมารเกราะทมิฬเขาโค้งพร้อมปีกปีศาจด้านหลัง แล้วประสานพลังยิงลำแสงหลุมดำและสายฟ้าสีเลือดทำลายล้าง'});
if(window.SKILL_ICONS){const I=SKILL_ICONS;
  [['หมาป่าสายฟ้า','อัญเชิญหมาป่าดาราอัสนี'],['โซ่อัสนีผนึก','โซ่ตรวนพันธนาการดวงดาว'],['ปีกสายฟ้าพิโรธ','วิหคเทพดาราพิทักษ์'],['เทพพิทักษ์อัสนี','มหาเวทย์อัญเชิญราชันย์เทพดารา'],
   ['หมาป่าอสูรมืด','อัญเชิญอสูรหมาป่าทมิฬ'],['โซ่รูนมืดผนึก','โซ่ตรวนและหัตถ์เงาอเวจี'],['ปีกอีกามรณะ','ปีกพญาอีกาอเวจี'],['อัศวินอสูรมืด','มหาเวทย์อัญเชิญจอมมารอเวจี']].forEach(([a,b])=>{if(I[a])I[b]=I[a]})}
function specialCard(key,active){
  const C=CLASSES[key],S=SPECIALS[key];if(!C||!S)return '';
  const okCls=P.cls===S.from,can=!active&&okCls&&P.lv>=SPECIAL_LV;
  const sk=C.skills.map(s=>`<div class="small">${window.SKILL_ICONS&&SKILL_ICONS[s.n]?`<img src="${SKILL_ICONS[s.n]}" style="width:22px;height:22px;vertical-align:middle;border-radius:4px"> `:s.ic+' '}<b>${s.n}</b> — ${SKILL_DESC[s.n]||''}</div>`).join('');
  return `<div class="eqr${active?' cur':''}" style="align-items:flex-start;flex-wrap:wrap;margin-top:8px;border-color:#ffd04a">
    <canvas data-jp="${C.sprite}" data-col="${S.col}" data-gold="1" width="96" height="96" style="flex:none;width:96px;height:96px;background:#0b0d18;border:2px solid #ffd04a;margin-right:8px"></canvas>
    <div class="nm" style="flex:1;min-width:200px"><span class="big">${S.ic} <b>${C.name}</b></span> <span class="small">(คลาสพิเศษ)</span><br>
      <span class="small">${S.bonus}<br>เปลี่ยนได้เฉพาะ <b>${S.fromName}</b> ที่ Lv ${SPECIAL_LV} ขึ้นไป • เลือกได้ 1 คลาส เปลี่ยนแล้วย้อนกลับไม่ได้${S.from==='mage'?' (มี 2 คลาสให้เลือก)':''}</span></div>
    ${active?'<div class="small" style="color:#ffd27a;align-self:center">★ คืออาชีพของคุณ</div>':`<button ${can?'':'disabled'} onclick="changeToSpecial('${key}')">${can?'เลือกคลาสนี้':okCls?'Lv '+SPECIAL_LV:'เฉพาะ'+S.fromName}</button>`}
    <div style="flex:1 1 100%;margin-top:6px">${sk}</div></div>`;
}
function changeToSpecial(key){
  const S=SPECIALS[key],C=CLASSES[key];
  if(!S||P.cls!==S.from||P.lv<SPECIAL_LV)return;
  if(!confirm(`เปลี่ยนเป็นคลาสพิเศษ "${C.name}" ?\n• สกิลใหม่ 4 สกิล${key==='thunder'?' • พลังโจมตี x1.5':''}\n• เปลี่ยนแล้วย้อนกลับไม่ได้ (ค่าสถานะ อุปกรณ์ Zeny ยังอยู่ครบ)`))return;
  const old=P.cls;
  if(S.bestStat){const best=['str','agi','int'].sort((a,b)=>P.stats[b]-P.stats[a])[0];P.tm=best;C.main=best}
  const fix=it=>{if(it&&it.slot==='weapon'){const on=(WEAPON[it.cls||old]||{}).n;it.cls=key;if(on&&it.name&&it.name.startsWith(on))it.name=WEAPON[key].n+it.name.slice(on.length)}};
  Object.values(P.eq||{}).forEach(fix);(P.bag||[]).forEach(fix);
  P.cls=key;if(P.job)P.job={t:P.job.t,b:null,skin:P.job.skin};
  P.skLv=[1,1,1,1];P.skCd=[0,0,0,0];P.name=C.name;P.target=null;P.dest=null;
  if(P.sty)P.sty.outfit='none';
  P.actor=makeActor(C.sprite);P.actor.ang=Math.PI/2;
  recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());
  try{buildActions();updateActions();refreshSkills();refreshChar()}catch(e){}
  sfx('levelup');toast(`${S.ic} เปลี่ยนอาชีพเป็น${C.name}!`);
  try{ring(P.x,P.y,200,S.col,1);ring(P.x,P.y,120,'#ffe86a',.8);burst(P.x,P.y-50,S.col,30)}catch(e){}
  say(S.say,'#9ff0ff');
  try{save(false)}catch(e){}refreshJob();
}
const thunderCard=a=>specialCard('thunder',a),changeToThunder=()=>changeToSpecial('thunder');
for(const c in JOBS)for(const b in JOBS[c])SKILL_DESC[JOBS[c][b].u.n]=JOBS[c][b].ud;
const jobDef=()=>P.job&&JOBS[P.cls]?JOBS[P.cls][P.job.b]:null;
function jobBonus(){const d=jobDef();if(!d)return null;const f=P.job.t===2?1.8:1,o={};for(const k in d.p)o[k]=d.p[k]*f;return o}
function jobSkill(){const d=jobDef();if(!d)return null;const s=Object.assign({},d.u);if(P.job.t===2){s.mult*=1.35;s.n=d.u.n}return s}
function jobName(){const d=jobDef();return d?(P.job.t===2?d.n2:d.n):CLASSES[P.cls].name}
function injectJob(){if(CLASSES[P.cls]&&CLASSES[P.cls].special)return;   // คลาสพิเศษ: มี 4 สกิลของตัวเองอยู่แล้ว
  const C=CLASSES[P.cls];C.skills.length=3;const s=jobSkill();if(s){C.skills.push(s);if(!P.skLv[3])P.skLv[3]=1}}
function refreshJobState(){injectJob();recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());P.name=jobName();buildActions();updateActions();refreshSkills();refreshChar()}
function changeJob(b){
  if(P.job||P.lv<JOB1.lv||P.zeny<JOB1.cost)return;const d=JOBS[P.cls][b];
  if(!confirm(`เลื่อนขั้นเป็น "${d.n}" ?\nค่าธรรมเนียม ${JOB1.cost.toLocaleString()} Zeny — เลือกแล้วเปลี่ยนสายไม่ได้`))return;
  P.zeny-=JOB1.cost;P.job={t:1,b};refreshJobState();sfx('levelup');toast(`${d.ic} เลื่อนขั้นเป็น ${d.n}!`);
  ring(P.x,P.y,120,'#ffe28a',.9);burst(P.x,P.y-50,'#ffe28a',24);say(`เลื่อนขั้นอาชีพ: ${d.n} — ได้ท่าไม้ตาย ${d.u.n} (ปุ่ม 4)`,'#ffe28a');refreshJob();
}
function awakenJob(){
  if(!P.job||P.job.t!==1||P.lv<JOB2.lv||P.zeny<JOB2.cost)return;const d=jobDef();
  const fin=skin=>{
    P.zeny-=JOB2.cost;P.job.t=2;if(skin&&window.skinGrant)skinGrant(skin);
    refreshJobState();sfx('levelup');toast(`${d.ic} ตื่นรู้: ${d.n2}!`);
    ring(P.x,P.y,160,'#ffd04a',1);burst(P.x,P.y-50,'#ffd04a',30);say(`ตื่นรู้เป็น ${d.n2} — สถานะทุกค่า +100 • โบนัสและท่าไม้ตายแรงขึ้น`,'#ffe28a');refreshJob();
  };
  if(window.skinPickModal&&window.skinCount&&skinCount(P.cls)>0){
    skinPickModal(P.cls,{cost:JOB2.cost,name:d.n2},fin);return;
  }
  if(!confirm(`ตื่นรู้เป็น "${d.n2}" ?\nค่าธรรมเนียม ${JOB2.cost.toLocaleString()} Zeny • สถานะทุกค่า +100`))return;
  fin(null);
}
const BN={hp:'HP',sp:'SP',atk:'พลังโจมตี',exp:'EXP',zeny:'Zeny'};
function bonusText(p,f=1){return Object.entries(p).map(([k,v])=>{v*=f;return BN[k]?`${BN[k]} +${Math.round(v*100)}%`:k==='crit'?`คริติคอล +${Math.round(v)}%`:k==='def'?`ป้องกัน +${Math.round(v)}`:k==='spd'?`ความเร็ว +${Math.round(v)}`:''}).filter(Boolean).join(' • ')}

/* ---------- สัตว์เลี้ยง ---------- */
const PET_PRICE=50000000;   // ซื้อที่ร้านค้า ตัวละ 50 ล้าน Zeny • เก็บความเป็นเจ้าของใน P.pets เป็น 'b:<id>'
const PETS=[
  {id:'dog',n:'หมาน้อย',ic:'🐶',spr:'pet_dog',b:{},px:1.2,back:46,side:-14},
  {id:'cat',n:'แมวส้ม',ic:'🐱',spr:'pet_cat',b:{},px:1.2,back:46,side:14},
  {id:'eagle',n:'นกอินทรี',ic:'🦅',spr:'pet_eagle',b:{},px:1.1,fly:1,ox:34,oy:-6,z:30},
  {id:'pdragon',n:'มังกรเขียว',ic:'🐲',spr:'pet_dragon',b:{},px:1.1,fly:1,ox:34,oy:-6,z:30},
  {id:'fairy',n:'ภูติใบไม้',ic:'🧚',spr:'pet_fairy',b:{},px:1.1,fly:1,ox:34,oy:-6,z:32}];
const petOwned=id=>!!(P&&P.pets&&P.pets.includes('b:'+id));
window.petActive=()=>!!(P&&P.pet&&petOwned(P.pet));   // ใช้คำนวณสถานะ +100 (SBN ใน index.html)
const petOf=id=>PETS.find(p=>p.id===id);
const petBonus=()=>null;   // โบนัสของสัตว์เลี้ยง = สถานะทุกค่า +100 (ดู SBN)
const PT={x:0,y:0,actor:null,id:null,map:''};
function petInit(){const d=P.pet&&petOf(P.pet);PT.id=P.pet;PT.actor=d&&SHEETS[d.spr]?makeActor(d.spr,d.px||1):null;PT.d=d;PT.fly=!!(d&&d.fly);PT.zz=d&&d.fly?d.z:0;PT.x=P.x;PT.y=P.y}
function setPet(id){if(!petOwned(id))return;P.pet=P.pet===id?null:id;petInit();recalcGear();P.hp=Math.min(P.hp,maxHp());refreshJob()}
function giveEgg(){}   // ยกเลิกระบบไข่: สัตว์เลี้ยงซื้อที่ร้านค้าเท่านั้น
function buyPet(id){
  const d=petOf(id);if(!d||petOwned(id))return;
  if(P.zeny<PET_PRICE){say(`Zeny ไม่พอ (ต้องใช้ ${PET_PRICE.toLocaleString()})`,'#ff9d9a');return}
  P.zeny-=PET_PRICE;P.pets.push('b:'+id);if(!P.pet){P.pet=id;petInit()}
  sfx('loot',3);toast(`${d.ic} ได้ ${d.n} เป็นเพื่อนร่วมทาง! สถานะทุกค่า +100`);try{ring(P.x,P.y,80,'#ffe28a',.7);burst(P.x,P.y-40,'#ffe28a',18)}catch(e){}
  recalcGear();refreshShop();refreshJob();try{save(false)}catch(e){}
}
REG.tick.push((dt)=>{
  if(!P||!PT.actor)return;const a=PT.actor;
  if(PT.map!==MAPID){PT.map=MAPID;PT.x=P.x;PT.y=P.y}
  const pd=PT.d||{};
  if(PT.fly){   // ลอยตามด้านบนขวา โบยบินเบาๆ
    PT.t=(PT.t||0)+dt;const tx=P.x+pd.ox*A+Math.sin(PT.t*.9)*6,ty=P.y+pd.oy*A*.5,dx=tx-PT.x,dy=ty-PT.y,k=Math.min(1,dt*3.2);
    if(Math.hypot(dx,dy)>900){PT.x=tx;PT.y=ty}else{PT.x+=dx*k;PT.y+=dy*k}
    PT.zz=pd.z+Math.sin(PT.t*2.2)*3;a.ang=Math.cos(P.actor.ang)<-.3?Math.PI:0;loopAnim(a,'walk',1.4);tickActor(a,dt);return}
  const ang=P.actor.ang+Math.PI,tx=P.x+Math.cos(ang)*(pd.back||46)+Math.cos(ang+Math.PI/2)*(pd.side||0),ty=P.y+Math.sin(ang)*20+Math.sin(ang+Math.PI/2)*(pd.side||0)*.45+8,dx=tx-PT.x,dy=ty-PT.y,d=Math.hypot(dx,dy);
  if(d>700){PT.x=tx;PT.y=ty}
  else if(d>12){const sp=Math.min(300,d*4+40);PT.stuck=(tryMove(PT,dx/d*sp*dt,dy/d*sp*dt)?0:(PT.stuck||0)+dt);if(PT.stuck>1.2){PT.x=P.x;PT.y=P.y;PT.stuck=0}a.ang=Math.atan2(dy,dx);loopAnim(a,'walk',1.3)}
  else loopAnim(a,'idle');
  tickActor(a,dt);
});
REG.draw.push((Ls,iv)=>{
  if(!PT.actor||!iv(PT.x,PT.y,100,100))return;
  Ls.push({y:PT.y,f:()=>{lx.globalAlpha=.25;pxEllipse(sxL(PT.x),syL(PT.y),6,2,'#000',true);lx.globalAlpha=1;drawActor(PT.actor,PT.x,PT.y-(PT.fly?PT.zz*A:0),{sc:UNIT_SCALE})}});
});

/* ---------- ชุดเซ็ต (อุปกรณ์ระดับเดียวกันหลายชิ้น) ---------- */
const itemTier=it=>Math.max(0,TIER.findIndex(t=>(it.lv||1)<=t[0]));
const SETB=[null,null,{atk:.05},{atk:.05},{atk:.08,hp:.1,def:5},{atk:.08,hp:.1,def:5},{atk:.12,hp:.15,def:10,crit:5},{atk:.12,hp:.15,def:10,crit:5},{atk:.12,hp:.15,def:10,crit:5}];
function setInfo(){
  const cnt={};for(const it of Object.values(P.eq||{}))if(it){const t=itemTier(it);cnt[t]=(cnt[t]||0)+1}
  let best=-1,bn=0;for(const t in cnt)if(cnt[t]>bn||cnt[t]===bn&&+t>best){bn=cnt[t];best=+t}
  return{cnt,best,n:bn,bonus:bn>=2?SETB[bn]:null};
}
const setBonus=()=>P&&P.eq?setInfo().bonus:null;

/* ---------- ฉายา (ปลดล็อกจากความสำเร็จ) ---------- */
const TITLES=[
  {a:'a_k100',n:'นักล่า',b:{exp:.01}},{a:'a_k500',n:'ผู้ไม่ยอมแพ้',b:{exp:.02}},{a:'a_k2000',n:'ตำนานนักล่า',b:{exp:.04,zeny:.04}},
  {a:'a_boss1',n:'ผู้ท้าบอส',b:{atk:.01}},{a:'a_boss5',n:'ผู้พิชิตบอส',b:{atk:.03}},{a:'a_elite5',n:'นักล่าผู้นำ',b:{crit:2}},
  {a:'a_lv20',n:'วีรบุรุษ',b:{hp:.03}},{a:'a_lv40',n:'ผู้พิชิตทะเลทราย',b:{hp:.04,atk:.02}},{a:'a_lv70',n:'ยอดฝีมือ',b:{atk:.04,hp:.04}},
  {a:'a_lv100',n:'ตำนานแห่งทุ่งหญ้า',b:{atk:.06,hp:.06,exp:.05}},{a:'a_map',n:'นักสำรวจ',b:{spd:6}},{a:'a_ev3',n:'ผู้พิทักษ์',b:{hp:.03,def:3}},
  {a:'a_enh5',n:'ช่างฝีมือ',b:{atk:.02}},{a:'a_plus5',n:'เจ้าของของวิเศษ',b:{atk:.02,crit:2}},{a:'a_epic',n:'ผู้ถือตำนาน',b:{crit:3,atk:.02}},{a:'a_q5',n:'ผู้รับใช้ชาวบ้าน',b:{zeny:.05}}];
const titleDef=()=>P.title&&TITLES.find(t=>t.a===P.title);
const titleBonus=()=>{const t=titleDef();return t&&P.ach&&P.ach[t.a]?t.b:null};
function setTitle(a){P.title=P.title===a?null:a;recalcGear();P.hp=Math.min(P.hp,maxHp());refreshJob()}

/* ---------- รวมโบนัสทั้งหมด ---------- */
function bonusMods(){
  const b={hp:1,sp:1,atk:1,exp:1,zeny:1,crit:0,def:0,spd:0};
  if(!P)return b;
  for(const o of [jobBonus(),setBonus(),petBonus(),titleBonus()])if(o)for(const k in o)b[k]+=o[k];
  return b;
}
function afterNewPlayer(){
  if(P.cls==='thunder'&&CLASSES.thunder)CLASSES.thunder.main=P.tm||'int';
  P.job=P.job||null;P.pets=(P.pets||[]).filter(x=>PETS.some(q=>'b:'+q.id===x));P.pet=P.pet&&P.pets.includes('b:'+P.pet)?P.pet:null;P.title=P.title||null;P.dg=P.dg||{day:0,used:0};
  injectJob();recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());P.name=jobName();petInit();
}

/* ---------- หน้าต่าง: อาชีพ / สัตว์เลี้ยง / ฉายา / เซ็ต ---------- */
const JB={tab:'job'};
function sheetIcon(cv,key){
  const S=SHEETS[key];if(!S)return;const a=makeActor(key);a.ang=0;const idx=actorFrame(a),c=cv.getContext('2d');
  cv.width=cv.height=44;c.imageSmoothingEnabled=false;const sc=Math.min(40/S.cw,40/S.ch);
  c.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,22-S.cw*sc/2,42-S.ch*sc,S.cw*sc,S.ch*sc);
}
// ภาพตัวละครอาชีพ: ตัวละครหน้าตรงบนแสงสีของท่าไม้ตาย (gold = ตื่นรู้)
function jobPreview(cv,key,col,gold){
  const S=SHEETS[key],c=cv.getContext('2d'),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);
  const gr=c.createRadialGradient(W/2,H*.62,2,W/2,H*.62,W*.55);gr.addColorStop(0,(gold?'#ffd04a':col||'#9fd0ff')+'cc');gr.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=gr;c.fillRect(0,0,W,H);
  if(!S){c.fillStyle='#fff';c.font='11px Tahoma';c.textAlign='center';c.fillText('...',W/2,H/2);return}
  const a=makeActor(key);a.ang=Math.PI/2;a.anim='idle';const idx=actorFrame(a);
  const sc=Math.min((H-6)/S.ch,(W-6)/S.cw)*1.0;
  c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,W/2-S.cw*sc/2,H-3-S.ch*S.foot*sc-(S.ch*(1-S.foot))*sc*0,S.cw*sc,S.ch*sc);
  if(gold){c.strokeStyle='#ffd04a';c.lineWidth=2;c.strokeRect(1,1,W-2,H-2)}
}
function refreshJob(){
  const w=$('winJob');if(!w||w.style.display!=='block')return;let body='';
  if(JB.tab==='job'){
    const J=JOBS[P.cls],d=jobDef();
    if(CLASSES[P.cls].special){body=specialCard(P.cls,true)}
    else if(!d){
      body=`<div class="small" style="margin-bottom:6px">เลื่อนขั้นอาชีพได้ที่ <b>Lv ${JOB1.lv}</b> ค่าธรรมเนียม ${JOB1.cost.toLocaleString()} Zeny — ได้โบนัสถาวร + <b>ท่าไม้ตายปุ่มที่ 4</b> (เลือกแล้วเปลี่ยนสายไม่ได้)</div>`+
        ['A','B'].map(b=>{const j=J[b],ok=P.lv>=JOB1.lv&&P.zeny>=JOB1.cost;
          return `<div class="eqr" style="align-items:center"><canvas data-jp="${CLASSES[P.cls].sprite}" data-col="${j.u.col}" data-gold="0" width="84" height="84" style="flex:none;width:84px;height:84px;background:#0b0d18;border:2px solid #39406a;margin-right:8px"></canvas><div class="nm"><span class="big">${j.ic} <b>${j.n}</b></span><br><span class="small">${j.d}<br>โบนัส: ${bonusText(j.p)}<br>ท่าไม้ตาย: <b>${j.u.n}</b> — ${j.ud}</span></div><button ${ok?'':'disabled'} onclick="changeJob('${b}')">เลือก</button></div>`}).join('')+
        `<div class="small">${P.lv<JOB1.lv?`<span style="color:#ff9d9a">ยังไม่ถึง Lv ${JOB1.lv}</span>`:P.zeny<JOB1.cost?'<span style="color:#ff9d9a">Zeny ไม่พอ</span>':'<span style="color:#9be58a">พร้อมเลื่อนขั้น!</span>'}</div>`;
    }else{
      const t2=P.job.t===2,f=t2?1.8:1,can=!t2&&P.lv>=JOB2.lv&&P.zeny>=JOB2.cost;
      body=`<div class="eqr cur" style="align-items:center"><canvas ${P.job.skin?`data-skp="${P.job.skin}"`:`data-jp="${CLASSES[P.cls].sprite}"`} data-col="${d.u.col}" data-gold="${t2?1:0}" width="84" height="84" style="flex:none;width:84px;height:84px;background:#0b0d18;border:2px solid #39406a;margin-right:8px"></canvas><div class="nm"><span class="big">${d.ic} <b>${jobName()}</b></span> <span class="small">(${t2?'ขั้น 2 ตื่นรู้':'ขั้น 1'})</span><br><span class="small">${d.d}<br>โบนัสตอนนี้: ${bonusText(d.p,f)}<br>ท่าไม้ตาย (ปุ่ม 4): <b>${d.u.n}</b> — ${d.ud}${t2?' (แรงขึ้น 35%)':''}</span></div></div>`+
        (t2?'<div class="small" style="color:#ffd27a">★ ตื่นรู้ครบแล้ว</div>':`<div class="eqr" style="align-items:center;flex-wrap:wrap"><div class="nm" style="flex:1 1 100%"><b>ตื่นรู้เป็น ${d.n2}</b><br><span class="small">ต้อง Lv ${JOB2.lv} • ${JOB2.cost.toLocaleString()} Zeny — โบนัสแรงขึ้นเป็น 1.8 เท่า (${bonusText(d.p,1.8)}) ท่าไม้ตายแรงขึ้น • <b style="color:#7fe07f">สถานะทุกค่า +100</b>${(window.skinsOf&&skinsOf(P.cls).length)?' • เลือกสายสกิน 1 จาก 2':''}</span></div>`+
          (window.skinsOf&&skinsOf(P.cls).length?`<div style="display:flex;gap:8px;flex:1 1 100%;margin:6px 0">${skinsOf(P.cls).map(x=>`<div style="flex:1;text-align:center;font-size:11px"><canvas data-skp="${x.id}" width="112" height="112" style="width:100%;max-width:112px;background:linear-gradient(#27406a,#3c6a45 72%,#2d4a26);border:2px solid #ffd04a"></canvas><br><b>${x.ic} ${x.n}</b></div>`).join('')}</div>`
            :`<canvas data-jp="${CLASSES[P.cls].sprite}" data-col="${d.u.col}" data-gold="1" width="84" height="84" style="flex:none;width:84px;height:84px;background:#0b0d18;border:2px solid #ffd04a;margin:6px 8px 6px 0"></canvas>`)+
          `<button ${can?'':'disabled'} onclick="awakenJob()" style="margin-left:auto">ตื่นรู้</button></div>`);
    }
    for(const k in SPECIALS)if(SPECIALS[k].from===P.cls&&!CLASSES[P.cls].special)body+=specialCard(k,false);   // เห็นการ์ดเฉพาะอาชีพต้นทาง (นักยิงปืน→เทพสายฟ้า, นักอัญเชิญ→คลาสพิเศษ 2 แบบ)
  }else if(JB.tab==='pet'){
    body=`<div class="small" style="margin-bottom:6px">ซื้อสัตว์เลี้ยงได้ที่ <b>ร้านค้า (B)</b> ตัวละ ${PET_PRICE.toLocaleString()} Zeny • พาไปได้ทีละ 1 ตัว • ขณะพาไป <b style="color:#7fe07f">สถานะทุกค่า +100</b> (มี ${P.pets.length}/${PETS.length})</div>`+
      PETS.map(p=>{const own=petOwned(p.id);
        return `<div class="eqr${P.pet===p.id?' cur':''}"><div class="pet"><canvas data-sp="${own?p.spr:''}" width="44" height="44"></canvas><div class="nm">${own?`<b>${p.n}</b>`:`<b>${p.ic} ${p.n}</b>`}<br><span class="small">${own?'สถานะทุกค่า +100':'ยังไม่ได้ซื้อ'}</span></div></div>${own?`<button onclick="setPet('${p.id}')">${P.pet===p.id?'เก็บ':'พาไป'}</button>`:''}</div>`}).join('');
  }else if(JB.tab==='title'){
    body=`<div class="small" style="margin-bottom:6px">ฉายาปลดล็อกจากความสำเร็จ (ดูที่เควสต์ → ความสำเร็จ) แสดงใต้ชื่อและให้โบนัส</div>`+
      TITLES.map(t=>{const own=P.ach&&P.ach[t.a];
        return `<div class="eqr${P.title===t.a?' cur':''}" style="${own?'':'opacity:.5'}"><div class="nm">${own?'🏅':'🔒'} <b>${t.n}</b><br><span class="small">${bonusText(t.b)}</span></div>${own?`<button onclick="setTitle('${t.a}')">${P.title===t.a?'ถอด':'ใช้'}</button>`:''}</div>`}).join('');
  }else{
    const s=setInfo();
    body=`<div class="small" style="margin-bottom:6px">สวมอุปกรณ์ <b>ระดับเดียวกัน</b> (ฝึกหัด/เหล็ก/เงิน/ทองคำ ฯลฯ) หลายชิ้นเพื่อรับโบนัสเซ็ต</div>
      <table class="rk"><tr><td>2-3 ชิ้น</td><td>${bonusText(SETB[2])}</td></tr><tr><td>4-5 ชิ้น</td><td>${bonusText(SETB[4])}</td></tr><tr><td>6-8 ชิ้น</td><td>${bonusText(SETB[6])}</td></tr></table>
      <div style="margin-top:8px"><b>ที่สวมอยู่:</b> ${Object.entries(s.cnt).map(([t,n])=>`${TIER[t][1]} ${n} ชิ้น`).join(' • ')||'ไม่มี'}</div>
      <div style="margin-top:4px">${s.bonus?`<span style="color:#9be58a">✔ เซ็ต "${TIER[s.best][1]}" ${s.n} ชิ้น: ${bonusText(s.bonus)}</span>`:'<span class="small">ยังไม่ครบ 2 ชิ้นระดับเดียวกัน</span>'}</div>`;
  }
  w.innerHTML=`<h3><span>🎖 อาชีพ • สัตว์เลี้ยง • ฉายา • เซ็ต</span><button class="x" onclick="toggleWin('winJob')">✕</button></h3>
    <div class="tabs2">${[['job','อาชีพ'],['pet','สัตว์เลี้ยง'],['title','ฉายา'],['set','เซ็ตอุปกรณ์']].map(([k,n])=>`<button class="${JB.tab===k?'on':''}" onclick="JB.tab='${k}';refreshJob()">${n}</button>`).join('')}</div><div class="winbody">${body}</div>`;
  w.querySelectorAll('canvas[data-sp]').forEach(c=>{if(c.dataset.sp)sheetIcon(c,c.dataset.sp)});
  w.querySelectorAll('canvas[data-jp]').forEach(c=>jobPreview(c,c.dataset.jp,c.dataset.col,c.dataset.gold==='1'));
  w.querySelectorAll('canvas[data-skp]').forEach(c=>window.skinDraw&&skinDraw(c,c.dataset.skp));
  clearInterval(refreshJob._t);   // สกินเคลื่อนไหว/โหลดเสร็จแล้ววาดใหม่ทุก 180 ms ขณะหน้าต่างเปิด
  if(w.querySelector('canvas[data-skp]'))refreshJob._t=setInterval(()=>{const ww=$('winJob');if(!ww||ww.style.display!=='block'){clearInterval(refreshJob._t);return}
    ww.querySelectorAll('canvas[data-skp]').forEach(c=>window.skinDraw&&skinDraw(c,c.dataset.skp))},180);
}
WINX.winJob=refreshJob;$('bJob').onclick=()=>toggleWin('winJob');

/* ---------- แสงเรืองตามรูปร่างอาวุธ (ตีบวก) ----------
   อาวุธฝังอยู่ในภาพตัวละคร จึงหาพิกเซลของอาวุธจากสี (+ระยะห่างจากกลางตัว) แล้ววาดเส้นขอบเรืองแสงรอบเฉพาะอาวุธ
   คำนวณครั้งเดียวต่อเฟรมแล้วเก็บแคช */
const WPRED={
  lpc_archer:(r,g,b,dx)=>(r>=150&&g>=r*.55&&g<=r*.92&&b<=r*.75&&r-b>=55)||(dx>=8&&r>=220&&g>=220&&b>=185),
  kk_rogue:(r,g,b,dx)=>dx>=9&&Math.min(r,g,b)>=130&&Math.max(r,g,b)-Math.min(r,g,b)<=60,
  kk_mage:(r,g,b,dx)=>dx>=9&&((g>=r+40&&g>=b+20)||(r>=120&&g>=70&&b<=80&&r>=g*1.2)||(r>=60&&r<=130&&r>g&&g>=b&&r-b>=14&&b<60)||(r>=230&&g>=230&&b>=230)),
  px_devil:(r,g,b,dx)=>dx>=10&&r>=55&&r<=95&&g>=30&&g<=55&&b>=25&&b<=50,   // ด้ามหอกน้ำตาล
  lpc_mage:(r,g,b,dx)=>dx>=8&&Math.min(r,g,b)>=110&&Math.max(r,g,b)-Math.min(r,g,b)<=40,   // ไม้เท้าเงิน
  lpc_warrior:(r,g,b,dx)=>dx>=7&&((r>=200&&g>=150&&b<=130)||(Math.min(r,g,b)>=150&&Math.max(r,g,b)-Math.min(r,g,b)<=45))
};
const WSRC={},WMASK={};
function wSrc(key){
  if(WSRC[key])return WSRC[key];const S=SHEETS[key],cv=document.createElement('canvas');cv.width=S.im.width;cv.height=S.im.height;
  const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(S.im,0,0);return WSRC[key]=g.getImageData(0,0,cv.width,cv.height);
}
function weaponGlowImg(key,idx,t){
  const ck=key+'|'+idx+'|'+t;if(ck in WMASK)return WMASK[ck];
  const S=SHEETS[key],pred=WPRED[key];if(!S||!pred)return WMASK[ck]=null;
  const D=wSrc(key),ox=(idx%S.cols)*S.cw,oy=Math.floor(idx/S.cols)*S.ch,cw=S.cw,ch=S.ch,m=new Uint8Array(cw*ch);let n=0,sx=0,sy=0;
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){const p=((oy+y)*D.width+ox+x)*4;
    if(D.data[p+3]>=128&&pred(D.data[p],D.data[p+1],D.data[p+2],Math.abs(x-cw*S.cx))){m[y*cw+x]=1;n++;sx+=x;sy+=y}}
  if(n<10)return WMASK[ck]=null;
  const c1=PG_COL[t],[R,G,B]=hexRGB(c1),out=document.createElement('canvas');out.width=cw;out.height=ch;const o=out.getContext('2d'),id=o.createImageData(cw,ch),O=id.data;
  const put=(x,y,a)=>{if(x<0||y<0||x>=cw||y>=ch)return;const i=(y*cw+x)*4;if(O[i+3]<a){O[i]=R;O[i+1]=G;O[i+2]=B;O[i+3]=a}};
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++){
    if(m[y*cw+x]){put(x,y,0);continue}
    let near1=false,near2=false;
    for(let dy=-2;dy<=2&&!near1;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=cw||yy>=ch||!m[yy*cw+xx])continue;
      if(Math.max(Math.abs(dx),Math.abs(dy))<=1){near1=true;break}near2=true}
    if(near1)put(x,y,200);else if(near2)put(x,y,50)}
  // ตัวอาวุธเองสว่างขึ้นเล็กน้อย (ขาวโปร่ง)
  for(let i=0;i<m.length;i++)if(m[i]){const j=i*4;O[j]=255;O[j+1]=255;O[j+2]=255;O[j+3]=45}
  o.putImageData(id,0,0);
  return WMASK[ck]={img:out,cx:sx/n,cy:sy/n,n};
}
function drawWeaponGlow(al){
  const w=P.eq&&P.eq.weapon,t=plusTier(w);if(!t||al<=0)return;
  const a=P.actor,S=a.sh;if(!S)return;
  const idx=actorFrame(a),W=weaponGlowImg(P.cls===undefined?'':CLASSES[P.cls].sprite,idx,t);
  const k=a.px||1,dx=sxL(P.x)-Math.round(S.cx*S.cw*k),dy=syL(P.y)-Math.round(S.foot*S.ch*k);
  const pu=.7+.3*Math.sin(time*(t>=4?9:5));
  if(W){
    lx.save();lx.globalAlpha=al*pu*.9;lx.globalCompositeOperation='lighter';lx.drawImage(W.img,dx,dy);lx.restore();
    // ประกายลอยจากอาวุธ (+4 ขึ้นไป)
    if(t>=2){const c=PG_COL[t],n=1+t;for(let i=0;i<n;i++){const ph=(time*1.2+i/n)%1,ang=i*2.3+time*2;
      lx.globalAlpha=(1-ph)*al;px(Math.round(dx+W.cx+Math.cos(ang)*5),Math.round(dy+W.cy-ph*14+Math.sin(ang)*3),1,1,i%2?c:'#ffffff')}lx.globalAlpha=1}
  }else{   // เฟรมที่มองไม่เห็นอาวุธ (เช่น หันหลัง): ประกายเล็กๆ ข้างตัว ไม่ใช่ดวงใหญ่
    const c=PG_COL[t],x=dx+S.cw*S.cx+8,y=dy+S.ch*S.foot-S.body*.5;
    for(let i=0;i<2+t;i++){const ph=(time*1.2+i/(2+t))%1;lx.globalAlpha=(1-ph)*al*pu;px(Math.round(x+Math.cos(i*2.1)*4),Math.round(y-ph*10),1,1,i%2?c:'#ffffff')}lx.globalAlpha=1;
  }
}

/* ---------- ผู้เล่นปลอมในเมือง + แชทโลก + อันดับ ---------- */
const FAKES=[{n:'Kaito',c:'warrior',lv:96},{n:'ไรเดอร์',c:'rogue',lv:84},{n:'Luna',c:'mage',lv:72},{n:'พี่บอย',c:'archer',lv:63},{n:'Nova',c:'warrior',lv:55},
  {n:'น้องมะลิ',c:'mage',lv:46},{n:'สายฟ้า',c:'archer',lv:38},{n:'Ryu',c:'rogue',lv:29},{n:'เจ้าหนู',c:'warrior',lv:19},{n:'Mimi',c:'mage',lv:9}];
const CHAT=['ใครไปล่าบอสป่าไหม','ตีบวก +7 แตกอีกแล้ว ฮือ','ขายหมวกเหล็กถูกๆ','ดันเจี้ยนวันนี้ได้ของดีมาก!','มินิบอสโผล่แถวป่า ใครว่างบ้าง','ออโต้ฟาร์มทั้งคืนเลยเรา','มีใครเลเวล 30 บ้าง','หินเวทหายากจัง','ได้สัตว์เลี้ยงแล้ว น่ารักมาก','ฝูงบุกมาอีกแล้ว ระวังตัวด้วย','ไปทะเลทรายกัน มีหีบเยอะ','อัศวินมรณะแรงมากกกก','เซ็ตเหล็กครบแล้ว!','ขอยาแดงหน่อยย','ใครมีไข่สัตว์เลี้ยงเหลือไหม'];
function fakePower(i){const day=dayKey(),R=seeded(day*31+i*7)(),base=700*Math.pow(1.52,9-i);return Math.round(base*(.92+R*.16))}
const FP=[];let fpMap='',chatT=20;
function fpSpawn(){
  FP.length=0;fpMap=MAPID;if(MAP.dungeon||!TOWN)return;
  const pick=[];   // ปิดผู้เล่นจำลอง: ไม่มีบอทในเมือง
  for(const f of pick){const C=CLASSES[f.c];if(!SHEETS[C.sprite])continue;
    FP.push({f,x:rnd(TOWN.x0+80,TOWN.x1-80),y:rnd(TOWN.y0+120,TOWN.y1-60),tx:0,ty:0,wt:0,actor:makeActor(C.sprite)})}
}
REG.tick.push((dt)=>{
  if(!P)return;if(fpMap!==MAPID)fpSpawn();
  for(const n of FP){n.wt-=dt;
    if(n.wt<=0){n.wt=rnd(3,8);n.tx=clamp(n.x+rnd(-140,140),TOWN.x0+60,TOWN.x1-60);n.ty=clamp(n.y+rnd(-100,100),TOWN.y0+100,TOWN.y1-40)}
    const dx=n.tx-n.x,dy=n.ty-n.y,d=Math.hypot(dx,dy);
    if(d>6){n.x+=dx/d*70*dt;n.y+=dy/d*70*dt;n.actor.ang=Math.atan2(dy,dx);loopAnim(n.actor,'walk',.8)}else loopAnim(n.actor,'idle');
    tickActor(n.actor,dt)}
  // ข้อความแชทจำลอง: ใช้เฉพาะตอนเล่นแบบไม่ล็อกอิน (ล็อกอินแล้วมีแชทจริง ไม่ปนข้อความปลอม)
  chatT-=dt;if(false&&chatT<=0&&!MAP.dungeon&&!(typeof SESS!=='undefined'&&SESS)){chatT=rnd(35,80);const f=FAKES[Math.random()*FAKES.length|0];say(`[โลก] ${f.n}: ${CHAT[Math.random()*CHAT.length|0]}`,'#9fd0ff')}
});
REG.draw.push((Ls,iv)=>{
  for(const n of FP){if(!iv(n.x,n.y,100,100))continue;
    Ls.push({y:n.y,f:()=>{lx.globalAlpha=.28;pxEllipse(sxL(n.x),syL(n.y),9,3,'#000',true);lx.globalAlpha=1;drawActor(n.actor,n.x,n.y,{sc:UNIT_SCALE})}})}
});
REG.names.push((TX,sc)=>{
  for(const n of FP){const x=sxL(n.x),y=syL(n.y)-Math.round(CLASSES[n.f.c].h/A)-4;if(x<-40||x>LW+40||y<-10||y>LH+10)continue;
    TX(x*sc,y*sc,`${n.f.n} Lv${n.f.lv}`,'#bfe0ff',11)}
  const t=titleDef();if(t&&P.ach&&P.ach[t.a])TX(sxL(P.x)*sc,(syL(P.y)+14)*sc+14,`《 ${t.n} 》`,'#ffd27a',11);
});
function refreshRank(){
  const w=$('winRank');if(!w||w.style.display!=='block')return;
  // ผู้เล่นจริงทุกคนที่เคยสมัคร/เข้าเล่น (ดึงจากตาราง leaderboard บนคลาวด์ ไม่จำกัดเฉพาะคนออนไลน์) • ไม่มีบอท
  const me=power(),myId=(typeof SESS!=='undefined'&&SESS)?SESS.user.id:null;
  const rows=(window.LB_ROWS||[]).filter(r=>!(myId&&r.player_id===myId&&r.slot===SLOT)).map(r=>({n:esc(r.name),c:(CLASSES[r.cls]||{}).name||'',lv:r.lv,p:r.power}));
  rows.push({n:`${esc(pName())} (คุณ)`,c:P.name,lv:P.lv,p:me,me:1});
  rows.sort((a,b)=>b.p-a.p);const rk=rows.findIndex(r=>r.me)+1,nxt=rows[rk-2];
  if(window.lbFetch&&!window._lbBusy&&Date.now()-(window._lbAt||0)>300000)window.lbFetch().then(refreshRank);
  w.innerHTML=`<h3><span>🏆 อันดับพลังรบ</span><button class="x" onclick="toggleWin('winRank')">✕</button></h3>
    <div class="small" style="margin-bottom:6px">คุณอยู่อันดับ <b style="color:#ffe28a">${rk}</b> จาก ${rows.length}${nxt?` • ต้องการอีก <b>${(nxt.p-me+1).toLocaleString()}</b> พลังรบเพื่อแซง ${nxt.n}`:' • 👑 อันดับ 1 ของเซิร์ฟเวอร์!'}</div>
    <div class="winbody"><table class="rk">${rows.map((r,i)=>`<tr class="${r.me?'me':''}"><td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td><td>${r.n}</td><td class="small">${r.c} Lv${r.lv}</td><td style="text-align:right">${r.p.toLocaleString()}</td></tr>`).join('')}</table></div>
    <div class="small" style="margin-top:6px">พลังรบคำนวณจาก ATK/HP/SP/ป้องกัน/คริติคอล/เลเวล • แสดงผู้เล่นทุกคนที่เคยสมัครหรือเข้าเล่น (ไม่ต้องออนไลน์อยู่) • อัปเดตอัตโนมัติทุก 5 นาที${window._lbAt?` • ล่าสุด ${new Date(window._lbAt).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`:''}</div>`;
}
WINX.winRank=refreshRank;$('bRank').onclick=()=>toggleWin('winRank');

/* ---------- ป้ายแจ้งเตือน + เมนูพับบนจอเล็ก ---------- */
let badgeT=0;
REG.tick.push((dt)=>{
  badgeT-=dt;if(badgeT>0||!P)return;badgeT=1;
  const q=QUESTS.some(x=>{const s=P.qs[x.id];return s&&s.s===1&&s.p>=x.c})||P.daily.list.some(x=>!x.d&&x.p>=x.c);
  $('bQuest').classList.toggle('badge',q);
  $('bJob').classList.toggle('badge',(!P.job&&P.lv>=JOB1.lv&&P.zeny>=JOB1.cost)||(P.job&&P.job.t===1&&P.lv>=JOB2.lv&&P.zeny>=JOB2.cost));
});
$('bMenu').onclick=()=>$('top').classList.toggle('open');
$('top').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.id!=='bMenu'&&b.id!=='bSnd')$('top').classList.remove('open')});

/* ---------- ร้านค้า: สัตว์เลี้ยง 5 ชนิด ---------- */
const _refreshShopBase=refreshShop;
refreshShop=function(){
  _refreshShopBase();
  const w=$('winShop');if(!w||w.style.display!=='block'||!P)return;
  w.innerHTML+=`<div class="sep"></div><div class="small"><b>🐾 สัตว์เลี้ยง</b> — ตัวละ ${PET_PRICE.toLocaleString()} Zeny • พาไปได้ทีละ 1 ตัว (เมนู Y) • ขณะพาไป <b style="color:#7fe07f">สถานะทุกค่า +100</b></div>`+
    PETS.map(p=>{const own=petOwned(p.id);
      return `<div class="st"><span>${p.ic} ${p.n}</span><span>${own?'<span class="small">✔ มีแล้ว</span>':`<button onclick="buyPet('${p.id}')" ${P.zeny>=PET_PRICE?'':'disabled'}>ซื้อ ${PET_PRICE/1000000}M</button>`}</span></div>`}).join('');
};

/* ---------- คูลดาวน์สกิลทุกอาชีพ: สกิลทั่วไป 3 วินาที • อัลติเมท (สกิลที่ 4 / ท่าไม้ตายอาชีพ) 5 วินาที ---------- */
const SKILL_CD_NORMAL=3,SKILL_CD_ULT=5;
(function(){
  for(const k in CLASSES)CLASSES[k].skills.forEach((s,i)=>{s.cd=i>=3?SKILL_CD_ULT:SKILL_CD_NORMAL});
  for(const c in JOBS)for(const b in JOBS[c])JOBS[c][b].u.cd=SKILL_CD_ULT;
  try{injectJob()}catch(e){}
})();
