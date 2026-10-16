# เพิ่มอาชีพพิเศษ "เทพสายฟ้า" (ปลดล็อก Lv100 • ATK x1.5 • สกิลสายฟ้าวงกว้าง 4 สกิล)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:100])
    return t.replace(a, b, 1)

h = rd('index.html')
if 'thunder:{' in h: raise SystemExit('already applied')

# --- สคริปต์สไปรต์ ---
h = rep(h, '<script src="pets_sprites.js?v=2"></script>', '<script src="pets_sprites.js?v=2"></script>\n<script src="thunder_sprites.js?v=1"></script>')

# --- CLASSES.thunder ---
h = rep(h, "  rogue:{name:'นักยิงปืน',sprite:'hd_gunner',",
"""  // เทพสายฟ้า (อาชีพพิเศษ Lv100 — เลือกได้ที่หน้าต่างอาชีพ Y, special = ไม่โผล่ตอนสร้างตัวละคร): ATK x1.5 (ดู atkPow)
  // ชีตสไปรต์จาก tools/build_thunder.py (ท่า idle walk attack skill1-4) • main = ค่าหลักสูงสุดของผู้เล่นตอนเปลี่ยนอาชีพ
  thunder:{name:'เทพสายฟ้า',sprite:'hd_thunder',special:true,shootAt:.62,desc:'อาชีพพิเศษ Lv100 — พลังโจมตี x1.5 สกิลสายฟ้าวงกว้างอลังการ',main:'int',range:400,ranged:'orb',orbCol:'#7ae8ff',
    stats:{str:2,agi:4,vit:4,int:8},
    skills:[{n:'Thunder Pillar',ic:'⚡',sp:20,cd:4,type:'aoeT',anim:'skill1',dur:.9,hitAt:.72,mult:3.4,r:300,range:480,col:'#7ae8ff',vfx:'lit3',nova:10,shake:5},
            {n:'Lightning Dash',ic:'🌩️',sp:26,cd:7,type:'beam',anim:'skill2',dur:.8,hitAt:.66,mult:4.2,range:680,w:100,col:'#9ff0ff',vfx:'lit2',hitFx:'lit6',stun:.8,shake:4},
            {n:'Storm Cyclone',ic:'🌪️',sp:34,cd:12,type:'aoe',anim:'skill3',dur:.95,hitAt:.55,mult:4,r:400,col:'#8fe8ff',vfx:'war5',nova:12,tint:'hue-rotate(160deg) saturate(1.3)',stun:1.8,slow:3,shake:6},
            {n:'Thunder Dragon',ic:'🐉',sp:60,cd:20,type:'storm',anim:'skill4',dur:1.1,hitAt:.62,mult:3.6,r:600,strikes:40,col:'#ffe86a',vfx:'lit3',shake:6}]},
  rogue:{name:'นักยิงปืน',sprite:'hd_gunner',""")
h = rep(h, "const WEAPON={warrior:{n:'ดาบ',ic:'sword'},mage:{n:'คทากะโหลก',ic:'staff'},archer:{n:'ธนู',ic:'bow'},rogue:{n:'ปืนคู่',ic:'gun'}};",
           "const WEAPON={warrior:{n:'ดาบ',ic:'sword'},mage:{n:'คทากะโหลก',ic:'staff'},archer:{n:'ธนู',ic:'bow'},rogue:{n:'ปืนคู่',ic:'gun'},thunder:{n:'ทวนสายฟ้า',ic:'staff'}};")
h = rep(h, "const REC={", "const REC={thunder:{str:.1,agi:.25,vit:.25,int:.4},")
# ATK x1.5
h = rep(h, "const atkPow=()=>Math.round((4+(P.stats[CLASSES[P.cls].main]+SBN())*2+P.lv+Math.floor((P.stats.str+SBN())*.3)+P.gs.atk)*bm().atk);",
           "const atkPow=()=>Math.round((4+(P.stats[CLASSES[P.cls].main]+SBN())*2+P.lv+Math.floor((P.stats.str+SBN())*.3)+P.gs.atk)*bm().atk*(P.cls==='thunder'?1.5:1));   // เทพสายฟ้า ATK x1.5")
# ไม่แสดงในหน้าเลือกอาชีพตอนสร้างตัวละคร
h = rep(h, "  for(const [k,C] of Object.entries(CLASSES)){\n    const d=document.createElement('div');d.className='card panel';",
           "  for(const [k,C] of Object.entries(CLASSES)){\n    if(C.special)continue;   // อาชีพพิเศษ (เทพสายฟ้า) เลือกได้ในเกมตอน Lv100\n    const d=document.createElement('div');d.className='card panel';")
# beam กว้างขึ้นได้ (s.w) + storm ใช้ท่าสกิล + aoeT มี nova
h = rep(h, "if(d<24+m.d.h*.2){hitMob(m,calcDmg(s.mult),true);afflict(m);vfx(s.hitFx||'lit6'", "if(d<(s.w||24)+m.d.h*.2){hitMob(m,calcDmg(s.mult),true);afflict(m);vfx(s.hitFx||'lit6'")
h = rep(h, "    startAnim({dur:.6,hitAt:.5,hit:()=>{\n      vfx('lit5',P.x,P.y-C.h*.5,{slow:2});", "    SA({dur:.6,hitAt:.5,hit:()=>{\n      vfx('lit5',P.x,P.y-C.h*.5,{slow:2});")
h = rep(h, "const cx=t.x,cy=t.y;vfx(s.vfx,cx,cy,{tint:s.tint});ring(cx,cy,s.r,s.col,.6);burst(cx,cy-20,s.col,14);shake=Math.max(shake,2);",
           "const cx=t.x,cy=t.y;vfx(s.vfx,cx,cy,{tint:s.tint});ring(cx,cy,s.r,s.col,.6);burst(cx,cy-20,s.col,14);shake=Math.max(shake,s.shake||2);\n      if(s.nova){ring(cx,cy,s.r*.6,s.col,.8);for(let k=0;k<s.nova;k++){const a=k/s.nova*Math.PI*2;vfx(s.vfx,cx+Math.cos(a)*s.r*.7,cy+Math.sin(a)*s.r*.45,{scale:.5,delay:.05+k*.04,tint:s.tint})}}")
h = re.sub(r"social\.js\?v=\d+", lambda m: m.group(0), h)
wr('index.html', h)

# --- f_social: เลเวลผู้เล่นอื่นเกิน 100 ---
so = rd('f_social.js')
so = rep(so, "lv:clamp(+i.lv||1,1,100)", "lv:clamp(+i.lv||1,1,200)")
wr('f_social.js', so)

# --- f_progress.js ---
p = rd('f_progress.js')
p = rep(p, "function injectJob(){const C=CLASSES[P.cls];C.skills.length=3;",
           "function injectJob(){if(P.cls==='thunder')return;   // เทพสายฟ้า: มี 4 สกิลของตัวเองอยู่แล้ว\n  const C=CLASSES[P.cls];C.skills.length=3;")
p = rep(p, "const JOB1={lv:20,cost:3000},JOB2={lv:50,cost:20000};",
"""const JOB1={lv:20,cost:3000},JOB2={lv:50,cost:20000};
/* ---------- อาชีพพิเศษ: เทพสายฟ้า (Lv100) ---------- */
const THUNDER_LV=100;
Object.assign(SKILL_DESC,{'Thunder Pillar':'เสาสายฟ้าฟาดลงวงกว้างที่เป้าหมาย กระแทกศัตรูทั้งวง',
  'Lightning Dash':'พุ่งลำสายฟ้ากว้างทะลุแนว ศัตรูในเส้นทางมึน',
  'Storm Cyclone':'พายุหมุนสายฟ้ารอบตัววงกว้างมาก ศัตรูมึนและช้า',
  'Thunder Dragon':'มังกรสายฟ้าฟาดสายฟ้าต่อเนื่อง 40 ครั้งทั่วสนาม'});
function thunderCard(active){
  const C=CLASSES.thunder,can=!active&&P.lv>=THUNDER_LV;
  const sk=C.skills.map(s=>`<div class="small">${window.SKILL_ICONS&&SKILL_ICONS[s.n]?`<img src="${SKILL_ICONS[s.n]}" style="width:22px;height:22px;vertical-align:middle;border-radius:4px"> `:s.ic+' '}<b>${s.n}</b> — ${SKILL_DESC[s.n]||''}</div>`).join('');
  return `<div class="eqr${active?' cur':''}" style="align-items:flex-start;flex-wrap:wrap;margin-top:8px;border-color:#ffd04a">
    <canvas data-jp="hd_thunder" data-col="#7ae8ff" data-gold="1" width="96" height="96" style="flex:none;width:96px;height:96px;background:#0b0d18;border:2px solid #ffd04a;margin-right:8px"></canvas>
    <div class="nm" style="flex:1;min-width:200px"><span class="big">⚡ <b>เทพสายฟ้า</b></span> <span class="small">(อาชีพพิเศษ)</span><br>
      <span class="small">พลังโจมตี <b style="color:#ffd04a">x1.5</b> เหนืออาชีพปกติ • สกิลสายฟ้าวงกว้างอลังการ 4 สกิล<br>ปลดล็อกที่ Lv ${THUNDER_LV} • ใช้ค่าสถานะหลักสูงสุดของคุณ • เปลี่ยนแล้วย้อนกลับไม่ได้</span></div>
    ${active?'<div class="small" style="color:#ffd27a;align-self:center">★ คืออาชีพของคุณ</div>':`<button ${can?'':'disabled'} onclick="changeToThunder()">${can?'เปลี่ยนอาชีพ':'Lv '+THUNDER_LV}</button>`}
    <div style="flex:1 1 100%;margin-top:6px">${sk}</div></div>`;
}
function changeToThunder(){
  if(P.cls==='thunder'||P.lv<THUNDER_LV)return;
  if(!confirm('เปลี่ยนเป็นอาชีพพิเศษ "เทพสายฟ้า" ?\\n• พลังโจมตี x1.5 • สกิลใหม่ 4 สกิล\\n• เปลี่ยนแล้วย้อนกลับไม่ได้ (ค่าสถานะ อุปกรณ์ Zeny ยังอยู่ครบ)'))return;
  const old=P.cls,best=['str','agi','int'].sort((a,b)=>P.stats[b]-P.stats[a])[0];
  P.tm=best;CLASSES.thunder.main=best;
  const fix=it=>{if(it&&it.slot==='weapon'){const on=(WEAPON[it.cls||old]||{}).n;it.cls='thunder';if(on&&it.name&&it.name.startsWith(on))it.name=WEAPON.thunder.n+it.name.slice(on.length)}};
  Object.values(P.eq||{}).forEach(fix);(P.bag||[]).forEach(fix);
  P.cls='thunder';if(P.job)P.job={t:P.job.t,b:null,skin:P.job.skin};
  P.skLv=[1,1,1,1];P.skCd=[0,0,0,0];P.name=CLASSES.thunder.name;P.target=null;P.dest=null;
  if(P.sty)P.sty.outfit='none';
  P.actor=makeActor('hd_thunder');P.actor.ang=Math.PI/2;
  recalcGear();P.hp=Math.min(P.hp,maxHp());P.sp=Math.min(P.sp,maxSp());
  try{buildActions();updateActions();refreshSkills();refreshChar()}catch(e){}
  sfx('levelup');toast('⚡ เปลี่ยนอาชีพเป็นเทพสายฟ้า!');
  try{ring(P.x,P.y,200,'#7ae8ff',1);ring(P.x,P.y,120,'#ffe86a',.8);burst(P.x,P.y-50,'#7ae8ff',30)}catch(e){}
  say('⚡ เทพสายฟ้า — พลังโจมตี x1.5 และสกิลสายฟ้าวงกว้าง 4 สกิล (ปุ่ม 1-4)','#9ff0ff');
  try{save(false)}catch(e){}refreshJob();
}""")
p = rep(p, "    const J=JOBS[P.cls],d=jobDef();\n    if(!d){", "    const J=JOBS[P.cls],d=jobDef();\n    if(P.cls==='thunder'){body=thunderCard(true)}\n    else if(!d){")
p = rep(p, "\n  }else if(JB.tab==='pet'){", "\n    if(P.cls!=='thunder')body+=thunderCard(false);\n  }else if(JB.tab==='pet'){")
p = rep(p, "  P.job=P.job||null;P.pets=", "  if(P.cls==='thunder'&&CLASSES.thunder)CLASSES.thunder.main=P.tm||'int';\n  P.job=P.job||null;P.pets=")
wr('f_progress.js', p)

h = rd('index.html')
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_social\.js\?v=(\d+)", lambda m: "f_social.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
# tm ต้องถูกเซฟ: ดูที่ปลายสคริปต์
print('ok')
