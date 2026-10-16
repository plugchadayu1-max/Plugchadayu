# เพิ่มอาชีพ นักมวย (เลือกตอนสร้างตัวละคร) + คลาสพิเศษ Lv100 ของนักอัญเชิญ: อัญเชิญสายฟ้า / อัญเชิญความมืด
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:100])
    return t.replace(a, b, 1)

h = rd('index.html')
if 'hd_boxer' in h: raise SystemExit('already applied')
h = rep(h, '<script src="thunder_sprites.js?v=2"></script>', '<script src="thunder_sprites.js?v=2"></script>\n<script src="newclass_sprites.js?v=1"></script>')

NEW = """  // นักมวย (มวยไทยหมัดเพลิง): ชีตสไปรต์จาก tools/build_new_classes.py (ท่า idle walk attack skill1-4) • ท่าไม้ตายปุ่ม 4 มาจากอาชีพขั้นสูง (JOBS.boxer)
  boxer:{name:'นักมวย',sprite:'hd_boxer',nativeSwing:true,desc:'มวยไทยหมัดเพลิง ประชิดตัว ดาเมจแรง เตะหมุนและเข่าพยัคฆ์',main:'str',range:70,ranged:false,
    stats:{str:6,agi:4,vit:4,int:1},hitVfx:'war2',
    skills:[{n:'เข่าพยัคฆ์เพลิง',ic:'🐯',sp:10,cd:3,type:'aoeT',anim:'skill1',dur:.8,hitAt:.55,mult:2.8,r:170,range:300,col:'#ffb030',vfx:'war5',nova:6,tint:'hue-rotate(-15deg) saturate(1.4)',stun:1,shake:4},
            {n:'เตะหมุนอัคคี',ic:'🌀',sp:16,cd:3,type:'aoe',anim:'skill2',dur:.75,hitAt:.55,mult:2.4,r:190,col:'#ff8a2a',vfx:'war4',nova:8,tint:'hue-rotate(-20deg) saturate(1.5)',shake:5},
            {n:'หมัดไฟสะเก็ดดาว',ic:'🔥',sp:22,cd:3,type:'multi',kind:'orb',anim:'skill3',dur:.8,hitAt:.6,mult:1.5,arrows:5,range:440,col:'#ff9a2a'}]},
  // คลาสพิเศษของนักอัญเชิญ (Lv100 เลือก 1 จาก 2 ที่หน้าต่างอาชีพ Y) — special = ไม่โผล่ตอนสร้างตัวละคร
  sumthunder:{name:'อัญเชิญสายฟ้า',sprite:'hd_sumthunder',special:true,shootAt:.62,desc:'คลาสพิเศษ Lv100 — อัญเชิญหมาป่าสายฟ้า เทพพิทักษ์อัสนี',main:'int',range:360,ranged:'orb',orbCol:'#7ae8ff',
    stats:{str:1,agi:2,vit:3,int:8},
    skills:[{n:'หมาป่าสายฟ้า',ic:'🐺',sp:24,cd:3,type:'summon',anim:'skill1',dur:.9,hitAt:.5,mult:2.2,range:450,life:12,maxMinions:6,count:3,spr:'cp_wolfD',r:240,amult:2.6,nova:8,vfx:'lit3',col:'#7ae8ff',stun:1,shake:5},
            {n:'โซ่อัสนีผนึก',ic:'⛓️',sp:28,cd:3,type:'aoeT',anim:'skill2',dur:.85,hitAt:.55,mult:3.4,r:280,range:460,col:'#9ff0ff',vfx:'lit3',nova:10,stun:2,slow:2,shake:5},
            {n:'ปีกสายฟ้าพิโรธ',ic:'🪽',sp:34,cd:3,type:'multi',kind:'orb',anim:'skill3',dur:.9,hitAt:.62,mult:1.5,arrows:8,range:480,col:'#7ae8ff'},
            {n:'เทพพิทักษ์อัสนี',ic:'🛡️',sp:60,cd:5,type:'dragon',anim:'skill4',dur:1.2,hitAt:.5,mult:8.5,r:600,waves:3,col:'#ffe86a',vfx:'lit3',stun:2,slow:2,shake:7}]},
  sumdark:{name:'อัญเชิญความมืด',sprite:'hd_sumdark',special:true,shootAt:.62,desc:'คลาสพิเศษ Lv100 — อัญเชิญหมาป่าอสูรมืด อัศวินอสูร',main:'int',range:360,ranged:'orb',orbCol:'#c58aff',
    stats:{str:1,agi:2,vit:3,int:8},
    skills:[{n:'หมาป่าอสูรมืด',ic:'🐺',sp:24,cd:3,type:'summon',anim:'skill1',dur:.9,hitAt:.5,mult:2.2,range:450,life:12,maxMinions:6,count:3,spr:'cp_hellh',ls:.1,r:240,amult:2.6,nova:8,vfx:'war5',tint:'hue-rotate(255deg) saturate(1.2)',col:'#c58aff',stun:1,shake:5},
            {n:'โซ่รูนมืดผนึก',ic:'⛓️',sp:28,cd:3,type:'aoeT',anim:'skill2',dur:.85,hitAt:.55,mult:3.4,r:280,range:460,col:'#c58aff',vfx:'war5',tint:'hue-rotate(255deg) saturate(1.2)',nova:10,stun:2,slow:2,shake:5},
            {n:'ปีกอีกามรณะ',ic:'🪽',sp:34,cd:3,type:'multi',kind:'orb',anim:'skill3',dur:.9,hitAt:.62,mult:1.5,arrows:8,range:480,col:'#c58aff'},
            {n:'อัศวินอสูรมืด',ic:'😈',sp:60,cd:5,type:'vortex',anim:'skill4',dur:1.2,hitAt:.4,mult:9,r:540,ticks:6,tick:.25,col:'#b070ff',vfx:'war5',tint:'hue-rotate(255deg) saturate(1.3)',stun:1,slow:3,shake:7}]},
"""
h = rep(h, "  rogue:{name:'นักยิงปืน',sprite:'hd_gunner',", NEW + "  rogue:{name:'นักยิงปืน',sprite:'hd_gunner',")
h = rep(h, "thunder:{n:'ทวนสายฟ้า',ic:'staff'}};", "thunder:{n:'ทวนสายฟ้า',ic:'staff'},boxer:{n:'นวมมวย',ic:'gloves'},sumthunder:{n:'คทาสายฟ้า',ic:'staff'},sumdark:{n:'คทามืด',ic:'staff'}};")
h = rep(h, "const REC={thunder:{str:.1,agi:.25,vit:.25,int:.4},",
           "const REC={boxer:{str:.5,agi:.2,vit:.3,int:0},sumthunder:{str:0,agi:.15,vit:.25,int:.6},sumdark:{str:0,agi:.15,vit:.25,int:.6},thunder:{str:.1,agi:.25,vit:.25,int:.4},")
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_summon\.js\?v=(\d+)", lambda m: "f_summon.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_manual\.js\?v=(\d+)", lambda m: "f_manual.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)

# ---- f_summon.js: สไปรต์ร่างอัญเชิญเลือกได้ (s.spr) ----
f = rd('f_summon.js')
f = rep(f, "  const px=(typeof MOBS==='object'&&MOBS.swarrior&&MOBS.swarrior.px)||1;",
           "  const spr=s.spr&&SHEETS[s.spr]?s.spr:SPR;\n  const pxo=typeof MOBS==='object'?Object.values(MOBS).find(d=>d.sprite===spr):null;\n  const px=(pxo&&pxo.px)||1;")
f = rep(f, "actor:makeActor(SPR,px)};", "actor:makeActor(spr,px)};")
wr('f_summon.js', f)

# ---- f_progress.js ----
p = rd('f_progress.js')
# JOBS.boxer (ใส่ต่อจาก rogue)
p = rep(p, "      u:{n:'Grenade Storm',ic:'💣',sp:36,cd:15,type:'aoe',mult:3,r:210,col:'#ff8a3d',vfx:'war5',tint:'hue-rotate(-20deg) saturate(1.6)',slow:4}}}\n};",
"""      u:{n:'Grenade Storm',ic:'💣',sp:36,cd:15,type:'aoe',mult:3,r:210,col:'#ff8a3d',vfx:'war5',tint:'hue-rotate(-20deg) saturate(1.6)',slow:4}}},
  boxer:{
    A:{n:'ยอดมวยพยัคฆ์ทมิฬ',n2:'ราชามวยพยัคฆ์',ic:'🐯',d:'ดาเมจและคริติคอลสูง จบไวด้วยมวยพยัคฆ์',p:{atk:.2,crit:8},ud:'อสูรเพลิงแปดกรปรากฏ ต่อยระเบิดวงกว้างมาก ศัตรูมึน 2.5 วินาที',
      u:{n:'Asura Fury',ic:'👹',sp:40,cd:14,type:'aoe',anim:'skill4',dur:1.1,hitAt:.55,mult:5.2,r:260,col:'#ffd24a',vfx:'war5',vfx2:'war4',nova:12,stun:2.5,shake:8}},
    B:{n:'มวยเพลิงสวรรค์',n2:'ราชันย์มวยสวรรค์',ic:'🔥',d:'ถึกและต่อเนื่อง ลูกไฟรัวทั่วสนาม',p:{hp:.2,def:6,atk:.1},ud:'แปดกรอสูรต่อยลูกไฟรัว 12 ลูกใส่ศัตรูหลายตัวพร้อมกัน',
      u:{n:'Asura Barrage',ic:'🔥',sp:38,cd:12,type:'multi',kind:'orb',anim:'skill4',dur:1.1,hitAt:.6,mult:1.3,arrows:12,range:480,col:'#ffcf5a'}}}
};
if(window.SKILL_ICONS){SKILL_ICONS['Asura Fury']=SKILL_ICONS['อสูรเพลิงแปดกร'];SKILL_ICONS['Asura Barrage']=SKILL_ICONS['อสูรเพลิงแปดกร']}""")

# คลาสพิเศษ: ทั่วไปทุกคลาส
a = p.index("/* ---------- อาชีพพิเศษ: เทพสายฟ้า (Lv100) ---------- */"); b = p.index("for(const c in JOBS)for(const b in JOBS[c])SKILL_DESC")
p = p[:a] + """/* ---------- อาชีพ/คลาสพิเศษ (Lv100): เทพสายฟ้า (จากนักยิงปืน) • อัญเชิญสายฟ้า / อัญเชิญความมืด (จากนักอัญเชิญ) ---------- */
const SPECIAL_LV=100,THUNDER_LV=SPECIAL_LV;
const SPECIALS={
  thunder:{from:'rogue',fromName:'นักยิงปืน',ic:'⚡',col:'#7ae8ff',bonus:'พลังโจมตี <b style="color:#ffd04a">x1.5</b> เหนืออาชีพปกติ • สกิลสายฟ้าวงกว้างอลังการ 4 สกิล (ท่าที่ 4 = อัลติเมท)',bestStat:true,say:'⚡ เทพสายฟ้า — พลังโจมตี x1.5 และสกิลสายฟ้าวงกว้าง 4 สกิล (ปุ่ม 1-4)'},
  sumthunder:{from:'mage',fromName:'นักอัญเชิญ',ic:'🐺',col:'#7ae8ff',bonus:'อัญเชิญหมาป่าสายฟ้า 3 ตน • โซ่อัสนีผนึก • ปีกสายฟ้าพิโรธ • เทพพิทักษ์อัสนี (อัลติเมท) — สายฟ้าวงกว้าง',say:'🐺 อัญเชิญสายฟ้า — สกิลใหม่ 4 สกิล (ปุ่ม 1-4)'},
  sumdark:{from:'mage',fromName:'นักอัญเชิญ',ic:'😈',col:'#c58aff',bonus:'อัญเชิญหมาป่าอสูรมืด 3 ตน (ดูดเลือด) • โซ่รูนมืดผนึก • ปีกอีกามรณะ • อัศวินอสูรมืด (อัลติเมท) — ความมืดวงกว้าง',say:'😈 อัญเชิญความมืด — สกิลใหม่ 4 สกิล (ปุ่ม 1-4)'}
};
Object.assign(SKILL_DESC,{'ทัณฑ์อัสนีฟากฟ้า':'ชูคทาเหนือศีรษะเปิดวงเวทย์บนฟ้า แล้วปล่อยสายฟ้าฟาดลงมารอบตัวเป็นวงกว้าง',
  'ก้าวพริบตาอัสนีคู่':'แปลงร่างเป็นกระแสสายฟ้าพุ่งวาร์ปเข้าหาศัตรู แล้วระเบิดสายฟ้าจากฝ่ามือทั้งสองพร้อมกัน',
  'วายุอัสนีคลั่ง':'ลอยตัวด้วยกระแสลมไฟฟ้า หมุนตัวสร้างพายุสายฟ้าโอบล้อมกาย โจมตีรอบทิศหลายจังหวะ',
  'มหาเวทย์มังกรอัสนีพิโรธ':'เปิดวงเวทย์ใต้เท้าและวงแหวนรูน อัญเชิญมังกรสายฟ้าสีฟ้า-ทองพันรอบกาย คำรามระเบิดคลื่นอัสนี 3 ระลอก',
  'เข่าพยัคฆ์เพลิง':'กระโดดเข่าพยัคฆ์เพลิงลงวงกว้างที่เป้าหมาย ศัตรูมึน',
  'เตะหมุนอัคคี':'หมุนตัวเตะวงเพลิงรอบตัว โดนศัตรูทุกตัวรอบกาย',
  'หมัดไฟสะเก็ดดาว':'ต่อยลูกไฟรัว 5 ลูกใส่ศัตรูในระยะ',
  'หมาป่าสายฟ้า':'อัญเชิญหมาป่าสายฟ้า 3 ตนช่วยสู้ 12 วินาที พร้อมคลื่นสายฟ้ากระแทกศัตรูรอบตัว',
  'โซ่อัสนีผนึก':'โซ่สายฟ้าผนึกวงกว้างที่เป้าหมาย ศัตรูมึนและช้า',
  'ปีกสายฟ้าพิโรธ':'กางปีกสายฟ้ายิงขนนกอัสนี 8 ดอกใส่ศัตรูในระยะ',
  'เทพพิทักษ์อัสนี':'อัญเชิญเทพพิทักษ์สายฟ้า ระเบิดคลื่นอัสนี 3 ระลอกขยายวงกว้างมาก',
  'หมาป่าอสูรมืด':'อัญเชิญหมาป่าอสูรมืด 3 ตนช่วยสู้ 12 วินาที ดูดเลือดให้คุณ 10% พร้อมคลื่นความมืดกระแทกศัตรู',
  'โซ่รูนมืดผนึก':'โซ่รูนมืดผนึกวงกว้างที่เป้าหมาย ศัตรูมึนและช้า',
  'ปีกอีกามรณะ':'กางปีกอีกามรณะยิงขนนกมืด 8 ดอกใส่ศัตรูในระยะ',
  'อัศวินอสูรมืด':'อัญเชิญอัศวินอสูรมืด กระแสความมืดหมุนวนโจมตีรอบทิศ 6 จังหวะ ศัตรูมึนและช้า'});
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
  if(!confirm(`เปลี่ยนเป็นคลาสพิเศษ "${C.name}" ?\\n• สกิลใหม่ 4 สกิล${key==='thunder'?' • พลังโจมตี x1.5':''}\\n• เปลี่ยนแล้วย้อนกลับไม่ได้ (ค่าสถานะ อุปกรณ์ Zeny ยังอยู่ครบ)`))return;
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
""" + p[b:]
p = rep(p, "function injectJob(){if(P.cls==='thunder')return;   // เทพสายฟ้า: มี 4 สกิลของตัวเองอยู่แล้ว",
           "function injectJob(){if(CLASSES[P.cls]&&CLASSES[P.cls].special)return;   // คลาสพิเศษ: มี 4 สกิลของตัวเองอยู่แล้ว")
p = rep(p, "    if(P.cls==='thunder'){body=thunderCard(true)}\n    else if(!d){", "    if(CLASSES[P.cls].special){body=specialCard(P.cls,true)}\n    else if(!d){")
p = rep(p, "    if(P.cls==='rogue')body+=thunderCard(false);   // เห็นการ์ดเฉพาะนักยิงปืน (เทพสายฟ้าแล้วเห็นการ์ดสถานะปัจจุบันด้านบน)",
           "    for(const k in SPECIALS)if(SPECIALS[k].from===P.cls&&!CLASSES[P.cls].special)body+=specialCard(k,false);   // เห็นการ์ดเฉพาะอาชีพต้นทาง (นักยิงปืน→เทพสายฟ้า, นักอัญเชิญ→คลาสพิเศษ 2 แบบ)")
wr('f_progress.js', p)

# ---- คู่มือ ----
m = rd('f_manual.js')
m = rep(m, "    'Lv100 อาชีพพิเศษ ⚡เทพสายฟ้า (Y) เฉพาะนักยิงปืน:",
           "    'Lv100 นักอัญเชิญ (Y): เลือกคลาสพิเศษ 1 จาก 2 — อัญเชิญสายฟ้า หรือ อัญเชิญความมืด (สกิลใหม่ 4 สกิล อัลติเมทวงกว้าง) เปลี่ยนแล้วย้อนกลับไม่ได้ [คลาสพิเศษนักอัญเชิญ]',\n    'Lv100 อาชีพพิเศษ ⚡เทพสายฟ้า (Y) เฉพาะนักยิงปืน:")
m = rep(m, "items.filter(x=>!/เทพสายฟ้า/.test(x)||(typeof P!=='undefined'&&P&&(P.cls==='rogue'||P.cls==='thunder')))",
           "items.filter(x=>(!/เทพสายฟ้า/.test(x)||(typeof P!=='undefined'&&P&&(P.cls==='rogue'||P.cls==='thunder')))&&(!/คลาสพิเศษนักอัญเชิญ/.test(x)||(typeof P!=='undefined'&&P&&(P.cls==='mage'||P.cls==='sumthunder'||P.cls==='sumdark'))))")
wr('f_manual.js', m)
print('ok')
