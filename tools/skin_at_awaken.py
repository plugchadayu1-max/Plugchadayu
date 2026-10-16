# สกิน -> เลือกตอนตื่นรู้ Lv50 (1 ใน 2 สาย) + สถานะทุกค่า +100 • ออร่า -> เลือกสายสีตอน Lv30 แล้วเหลือเฉพาะสายนั้น 5 แบบ
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

# ---------- index.html: โบนัสสถานะ +100 ตอนตื่นรู้ (คำนวณจากสถานะอาชีพ ไม่แตะ P.stats จึงไม่ชนกฎกันโกงแต้มสถานะ) ----------
h = rd('index.html')
if 'const SBN=' in h: raise SystemExit('already applied')
h = rep(h, "const maxHp=()=>Math.round((60+P.stats.vit*10+P.lv*8+P.gs.hp)*bm().hp);",
"// ตื่นรู้ (Lv50) = สถานะทุกค่า +100 (STR/AGI/VIT/INT) — บวกตอนคำนวณ ไม่เก็บใน P.stats\nconst SBN=()=>P&&P.job&&P.job.t===2?100:0;\nconst maxHp=()=>Math.round((60+(P.stats.vit+SBN())*10+P.lv*8+P.gs.hp)*bm().hp);")
h = rep(h, "const maxSp=()=>Math.round((20+P.stats.int*5+P.lv*3+P.gs.sp)*bm().sp);", "const maxSp=()=>Math.round((20+(P.stats.int+SBN())*5+P.lv*3+P.gs.sp)*bm().sp);")
h = rep(h, "const atkPow=()=>Math.round((4+P.stats[CLASSES[P.cls].main]*2+P.lv+Math.floor(P.stats.str*.3)+P.gs.atk)*bm().atk);",
           "const atkPow=()=>Math.round((4+(P.stats[CLASSES[P.cls].main]+SBN())*2+P.lv+Math.floor((P.stats.str+SBN())*.3)+P.gs.atk)*bm().atk);")
h = rep(h, "1000-P.stats.agi*14-P.lv*3)/1000;", "1000-(P.stats.agi+SBN())*14-P.lv*3)/1000;")
h = rep(h, "150+(P.lv-1)*5+P.stats.agi*1.5+P.gs.spd)", "150+(P.lv-1)*5+(P.stats.agi+SBN())*1.5+P.gs.spd)")
h = rep(h, "Math.random()<.08+P.stats.agi*.005+P.gs.crit/100", "Math.random()<.08+(P.stats.agi+SBN())*.005+P.gs.crit/100")
h = rep(h, "(1+P.stats.vit*.5+P.lv*.4)*f);P.sp=Math.min(maxSp(),P.sp+(1+P.stats.int*.4+P.lv*.3)*f)",
           "(1+(P.stats.vit+SBN())*.5+P.lv*.4)*f);P.sp=Math.min(maxSp(),P.sp+(1+(P.stats.int+SBN())*.4+P.lv*.3)*f)")
h = rep(h, "-P.stats.vit*.45-P.gs.def*.6)", "-(P.stats.vit+SBN())*.45-P.gs.def*.6)")
h = rep(h, "crit:(8+P.stats.agi*.5+P.gs.crit),def:Math.round(P.stats.vit*.45+P.gs.def*.6)",
           "crit:(8+(P.stats.agi+SBN())*.5+P.gs.crit),def:Math.round((P.stats.vit+SBN())*.45+P.gs.def*.6)")
h = rep(h, "<span class=\"sv\">${S[k]}${PEND[k]?` <span class=\"g\">+${PEND[k]}</span>`:''}</span>",
           "<span class=\"sv\">${S[k]}${SBN()?` <span class=\"g\" title=\"โบนัสตื่นรู้\">(+${SBN()})</span>`:''}${PEND[k]?` <span class=\"g\">+${PEND[k]}</span>`:''}</span>")
wr('index.html', h)

a = rd('f_audio_combat.js')
a = rep(a, "-P.stats.vit*.3-P.gs.def*.4", "-(P.stats.vit+SBN())*.3-P.gs.def*.4")
wr('f_audio_combat.js', a)

# ---------- f_progress.js: ตื่นรู้ = เลือกสกินสาย 1/2 ----------
p = rd('f_progress.js')
old = p[p.index("function awakenJob(){"):p.index("const BN={hp:'HP'")]
new = """function awakenJob(){
  if(!P.job||P.job.t!==1||P.lv<JOB2.lv||P.zeny<JOB2.cost)return;const d=jobDef();
  const fin=skin=>{
    P.zeny-=JOB2.cost;P.job.t=2;if(skin&&window.skinGrant)skinGrant(skin);
    refreshJobState();sfx('levelup');toast(`${d.ic} ตื่นรู้: ${d.n2}!`);
    ring(P.x,P.y,160,'#ffd04a',1);burst(P.x,P.y-50,'#ffd04a',30);say(`ตื่นรู้เป็น ${d.n2} — สถานะทุกค่า +100 • โบนัสและท่าไม้ตายแรงขึ้น`,'#ffe28a');refreshJob();
  };
  if(window.skinPickModal&&window.skinCount&&skinCount(P.cls)>0){
    skinPickModal(P.cls,{cost:JOB2.cost,name:d.n2},fin);return;
  }
  if(!confirm(`ตื่นรู้เป็น "${d.n2}" ?\\nค่าธรรมเนียม ${JOB2.cost.toLocaleString()} Zeny • สถานะทุกค่า +100`))return;
  fin(null);
}
"""
p = p.replace(old, new)
wr('f_progress.js', p)

# ---------- f_skin.js ----------
s = rd('f_skin.js')
# เป็นเจ้าของสกิน: ที่เคยซื้อไว้ หรือที่เลือกตอนตื่นรู้
s = rep(s, "const owns=id=>!!(P&&P.sty&&P.sty.own&&P.sty.own['outfit:'+id]);",
"const owns=id=>!!(P&&((P.sty&&P.sty.own&&P.sty.own['outfit:'+id])||(P.job&&P.job.skin===id)));\nwindow.skinCount=cls=>(SKINS[cls]||[]).length;\n// เลือกสกินตอนตื่นรู้: บันทึกเป็นของผู้เล่นและสวมให้ทันที\nwindow.skinGrant=id=>{if(!P.job)return;P.job.skin=id;const t=sty();t.own['outfit:'+id]=1;t.outfit=id;try{save&&save(false)}catch(e){}};")
# ออร่า: สายที่เลือก
s = rep(s, "const auraSel=()=>{const a=P&&P.sty&&P.sty.aura;return a&&a!=='none'?a:null};",
"""const auraSel=()=>{const a=P&&P.sty&&P.sty.aura;return a&&a!=='none'?a:null};
// สายออร่า (ธีมสี) เลือกครั้งเดียวที่ Lv30 • เซฟเก่าที่ใส่ออร่าไว้แล้ว = ถือว่าเลือกสายของออร่านั้น
const AURA_LV=30;
function auraTheme(){
  if(!P||!P.sty)return null;if(P.sty.auraTheme)return P.sty.auraTheme;
  const a=P.sty.aura&&P.sty.aura!=='none'&&auraOf(P.sty.aura);if(a){P.sty.auraTheme=a.theme;return a.theme}
  return null;
}
function pickAuraTheme(id){
  if(!P||P.lv<AURA_LV||auraTheme())return;const AM=auraMeta(),t=AM&&AM.themes.find(x=>x.id===id);if(!t)return;
  if(!confirm(`เลือกสายออร่า "${t.n}" ?\\nเลือกแล้วเปลี่ยนสายไม่ได้ — จะเลือกได้เฉพาะ 5 แบบของสายนี้`))return;
  sty().auraTheme=id;sfx('levelup');toast(`✨ เลือกสายออร่า ${t.n}`);save&&save(false);refresh();
}
window.skinAuraTheme=pickAuraTheme;""")
s = rep(s, "function setAura(id){\n  if(id!=='none'&&!aOwn(id)){",
           "function setAura(id){\n  if(id!=='none'){const a=auraOf(id);if(!a||a.theme!==auraTheme()){say('ต้องเลือกสายออร่าตอน Lv30 ก่อน','#ff9d9a');return}}\n  if(id!=='none'&&!aOwn(id)){")
# UI: ออร่า
a0 = s.index("  const auraHTML=`<div class=\"sk-aura\">")
a1 = s.index("  w.innerHTML=`<h3><span>🎭 สกินและออร่า</span>")
auraUI = """  const th0=auraTheme(),AM2=AM;
  let auraBody;
  if(!AM)auraBody='<div class="small">กำลังโหลดออร่า...</div>';
  else if(!th0&&P.lv<AURA_LV)auraBody=`<div class="small">🔒 ปลดล็อกที่เลเวล ${AURA_LV} — เลือก 1 สายสีออร่า (เลือกแล้วเปลี่ยนไม่ได้) ตอนนี้ Lv ${P.lv}</div>`;
  else if(!th0)auraBody=`<div class="small" style="margin-bottom:6px">เลือก <b>1 สายออร่า</b> — เลือกแล้วเปลี่ยนไม่ได้ และจะใช้ได้เฉพาะ 5 แบบของสายนั้น</div>
      <div class="sk-chips">${AM.themes.map(t=>`<button onclick="skinAuraTheme('${t.id}')">${t.n}</button>`).join('')}</div>`;
  else{const tn=AM.themes.find(t=>t.id===th0);
    auraBody=`<div class="small">สายที่เลือก: <b style="color:#ffe28a">${tn?tn.n:th0}</b> • เลือกได้ 5 แบบ</div>
      <div class="sk-chips"><button class="${selA==='none'?'on':''}" onclick="skinAura('none')">ปิดออร่า</button></div>
      <div class="sk-grid">${AM.list.filter(a=>a.theme===th0).map(a=>
        `<button class="${selA===a.id?'on':''}" title="${a.n}" onclick="skinAura('${a.id}')"><canvas data-au="${a.id}" width="72" height="72"></canvas><span>${AM.styles[a.idx]}</span></button>`).join('')}</div>`}
  const auraHTML=`<div class="sk-aura"><b>✨ ออร่า</b> <span class="small">เลือกสายตอน Lv${AURA_LV}</span>${auraBody}</div>`;
"""
s = s[:a0] + auraUI + s[a1:]
# UI: สกิน (ไม่มีซื้อ)
k0 = s.index("  w.innerHTML=`<h3><span>🎭 สกินและออร่า</span>")
k1 = s.index("  list.forEach(s=>ensureLoad(s.id));loadAuras();")
skinUI = """  const mine=list.filter(x=>owns(x.id)),awakened=P.job&&P.job.t===2,canPick=awakened&&list.length&&!mine.length;
  let skHTML;
  if(!list.length)skHTML='<div class="small">อาชีพนี้ยังไม่มีสกิน (ได้สถานะ +100 จากการตื่นรู้เท่านั้น)</div>';
  else if(mine.length)skHTML=mine.map(x=>{const on=cur===x.id;
      return`<div class="sk-card${on?' on':''}"><canvas data-sk="${x.id}" width="128" height="128"></canvas>
        <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div>
        <div class="sk-price">${on?'✔ กำลังใส่':'สายที่เลือกตอนตื่นรู้'}</div>${on?`<button onclick="skinEquip('none')">ถอดสกิน</button>`:`<button onclick="skinEquip('${x.id}')">ใส่</button>`}</div></div>`}).join('');
  else if(canPick)skHTML=`<div class="small" style="margin-bottom:6px">ตื่นรู้แล้ว — เลือกสายสกินได้ 1 จาก ${list.length} (เลือกแล้วเปลี่ยนไม่ได้)</div><button class="cbtn ok" onclick="skinChoose()">เลือกสายสกิน</button>`;
  else skHTML=`<div class="small">🔒 สกินปลดล็อกตอนตื่นรู้ (Lv50) — เลือกได้ 1 จาก ${list.length} สาย พร้อมสถานะทุกค่า +100</div>
      <div class="sk-chips">${list.map(x=>`<span class="small">${x.ic} ${x.n}</span>`).join(' • ')}</div>`;
  w.innerHTML=`<h3><span>🎭 สกินและออร่า</span><button class="x" onclick="toggleWin('winSkin')">✕</button></h3>
    <div class="small" style="margin-bottom:8px">สกินของ<b>${CLASSES[P.cls].name}</b> — ได้จากการตื่นรู้ที่ Lv50 • ออร่าเลือกสายที่ Lv30</div>
    <div class="sk-list">${skHTML}</div>${auraHTML}`;
"""
s = s[:k0] + skinUI + s[k1:]
# ฟังก์ชันโมดัลเลือกสกินตอนตื่นรู้ + เลือกสายสกินย้อนหลังสำหรับคนที่ตื่นรู้ไปแล้ว
s = rep(s, "WINX.winSkin=refresh;\n", """WINX.winSkin=refresh;
/* ---------- โมดัลเลือกสายสกินตอนตื่นรู้ ---------- */
window.skinPickModal=function(cls,info,done){
  const list=SKINS[cls]||[];if(!list.length){done(null);return}
  list.forEach(x=>ensureLoad(x.id));
  const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:50;background:rgba(5,8,20,.78);display:flex;align-items:center;justify-content:center';
  const costTxt=info&&info.cost?` • ค่าธรรมเนียม ${info.cost.toLocaleString()} Zeny`:'';
  o.innerHTML=`<div class="win panel sm" style="display:block;position:relative;width:min(560px,96vw);max-height:92vh;overflow:auto;padding:12px">
    <h3 style="margin:0 0 6px"><span>🌟 ตื่นรู้${info&&info.name?' เป็น '+info.name:''}</span></h3>
    <div class="small" style="margin-bottom:8px">เลือกสายสกิน <b>1 จาก ${list.length}</b> (เลือกแล้วเปลี่ยนไม่ได้) • สถานะทุกค่า <b style="color:#7fe07f">+100</b>${costTxt}</div>
    <div class="sk-list">${list.map(x=>`<div class="sk-card"><canvas data-pk="${x.id}" width="128" height="128"></canvas>
      <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div><button data-pick="${x.id}">เลือกสายนี้</button></div></div>`).join('')}</div>
    <div style="text-align:right;margin-top:8px"><button data-cancel="1">ยกเลิก</button></div></div>`;
  document.body.appendChild(o);
  const tick=setInterval(()=>{const t=Math.floor(performance.now()/180);
    o.querySelectorAll('canvas[data-pk]').forEach(c=>{const def=find(cls,c.dataset.pk),S=def&&SHEETS[def.key],g=c.getContext('2d');g.clearRect(0,0,128,128);
      if(!S){g.fillStyle='#fff';g.font='14px Tahoma';g.textAlign='center';g.fillText('กำลังโหลด...',64,68);return}
      const fr=S.anims.idle.front,idx=fr[t%fr.length];g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      g.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,0,0,128,128)})},150);
  const close=()=>{clearInterval(tick);o.remove()};
  o.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.cancel){close();return}
    if(b.dataset.pick){const id=b.dataset.pick,def=find(cls,id);if(!confirm(`เลือกสายสกิน "${def.n}" ?\\nเลือกแล้วเปลี่ยนไม่ได้`))return;close();done(id)}});
};
// คนที่ตื่นรู้ไปแล้วแต่ยังไม่ได้เลือกสกิน
window.skinChoose=function(){
  if(!P||!P.job||P.job.t!==2||P.job.skin)return;
  skinPickModal(P.cls,{name:P.name},id=>{window.skinGrant(id);toast('เลือกสายสกินแล้ว!');refresh()});
};
""")
wr('f_skin.js', s)

# ---------- แจ้งเตือนตอน Lv30 ----------
t = rd('f_skin.js')
t = rep(t, "addEventListener('keydown',e=>{if(!P)return;const t=e.target&&e.target.tagName;",
"""let _auraHint=0;
setInterval(()=>{if(!P||P.lv<AURA_LV||auraTheme()||_auraHint===P.name+P.lv)return;_auraHint=P.name+P.lv;
  toast('✨ ถึง Lv30 — เลือกสายออร่าได้แล้ว (เมนู สกิน/ออร่า V)');say('✨ เลือกสายออร่าได้ที่เมนู สกิน/ออร่า (V) — เลือกแล้วเปลี่ยนไม่ได้','#ffe28a')},4000);
addEventListener('keydown',e=>{if(!P)return;const t=e.target&&e.target.tagName;""")
wr('f_skin.js', t)
print('ok')
