# หน้าต่างสกิน/ออร่า: แสดงภาพตัวอย่างออร่า + สกิน • หน้าต่างอาชีพ: แสดงภาพตัวละครของอาชีพที่จะเปลี่ยน
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

# ---------------- f_skin.js ----------------
s = rd('f_skin.js')
if 'previewRows' in s: raise SystemExit('already applied')
s = rep(s, "  const th0=auraTheme(),AM2=AM;\n  let auraBody;",
"""  const th0=auraTheme();
  // แถวตัวอย่างออร่า: ทุกสาย สายละ 5 แบบ (pick=true แสดงปุ่มเลือกสาย)
  const previewRows=pick=>AM.themes.map(t=>`<div class="sk-th">${t.n}${pick?` <button class="cbtn ok" style="margin-left:6px;padding:2px 10px" onclick="skinAuraTheme('${t.id}')">เลือกสายนี้</button>`:''}</div>
    <div class="sk-grid">${AM.list.filter(a=>a.theme===t.id).map(a=>`<button disabled style="opacity:1;cursor:default"><canvas data-au="${a.id}" width="72" height="72"></canvas><span>${AM.styles[a.idx]}</span></button>`).join('')}</div>`).join('');
  let auraBody;""")
s = rep(s, "auraBody=`<div class=\"small\">🔒 ปลดล็อกที่เลเวล ${AURA_LV} — เลือก 1 สายสีออร่า (เลือกแล้วเปลี่ยนไม่ได้) ตอนนี้ Lv ${P.lv}</div>`;",
           "auraBody=`<div class=\"small\">🔒 ปลดล็อกที่เลเวล ${AURA_LV} — เลือก 1 สายสีออร่า (เลือกแล้วเปลี่ยนไม่ได้) ตอนนี้ Lv ${P.lv}<br>ตัวอย่างออร่าแต่ละสาย:</div>`+previewRows(false);")
s = rep(s, "      <div class=\"sk-chips\">${AM.themes.map(t=>`<button onclick=\"skinAuraTheme('${t.id}')\">${t.n}</button>`).join('')}</div>`;",
           "      `+previewRows(true);")
# สกินที่ยังล็อก: แสดงรูปทั้งสองสาย
s = rep(s, "      <div class=\"sk-chips\">${list.map(x=>`<span class=\"small\">${x.ic} ${x.n}</span>`).join(' • ')}</div>`;",
"""      ${list.map(x=>`<div class="sk-card"><canvas data-sk="${x.id}" width="128" height="128"></canvas>
        <div class="sk-info"><b>${x.ic} ${x.n}</b><div class="small">${x.d}</div></div></div>`).join('')}`;""")
wr('f_skin.js', s)

# ---------------- f_progress.js ----------------
p = rd('f_progress.js')
p = rep(p, "function refreshJob(){",
"""// ภาพตัวละครอาชีพ: ตัวละครหน้าตรงบนแสงสีของท่าไม้ตาย (gold = ตื่นรู้)
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
function refreshJob(){""")
cv = lambda col, gold: f"<canvas data-jp=\"${{CLASSES[P.cls].sprite}}\" data-col=\"{col}\" data-gold=\"{gold}\" width=\"84\" height=\"84\" style=\"flex:none;width:84px;height:84px;background:#0b0d18;border:2px solid #39406a;margin-right:8px\"></canvas>"
p = rep(p, "return `<div class=\"eqr\"><div class=\"nm\"><span class=\"big\">${j.ic} <b>${j.n}</b></span><br><span class=\"small\">${j.d}<br>โบนัส:",
           "return `<div class=\"eqr\" style=\"align-items:center\">" + cv("${j.u.col}", "0") + "<div class=\"nm\"><span class=\"big\">${j.ic} <b>${j.n}</b></span><br><span class=\"small\">${j.d}<br>โบนัส:")
p = rep(p, "body=`<div class=\"eqr cur\"><div class=\"nm\"><span class=\"big\">${d.ic} <b>${jobName()}</b></span>",
           "body=`<div class=\"eqr cur\" style=\"align-items:center\">" + cv("${d.u.col}", "${t2?1:0}") + "<div class=\"nm\"><span class=\"big\">${d.ic} <b>${jobName()}</b></span>")
p = rep(p, "`<div class=\"eqr\"><div class=\"nm\"><b>ตื่นรู้เป็น ${d.n2}</b>",
           "`<div class=\"eqr\" style=\"align-items:center\">" + cv("${d.u.col}", "1") + "<div class=\"nm\"><b>ตื่นรู้เป็น ${d.n2}</b>")
p = rep(p, "  w.querySelectorAll('canvas[data-sp]').forEach(c=>{if(c.dataset.sp)sheetIcon(c,c.dataset.sp)});\n}",
           "  w.querySelectorAll('canvas[data-sp]').forEach(c=>{if(c.dataset.sp)sheetIcon(c,c.dataset.sp)});\n  w.querySelectorAll('canvas[data-jp]').forEach(c=>jobPreview(c,c.dataset.jp,c.dataset.col,c.dataset.gold==='1'));\n}")
wr('f_progress.js', p)

h = rd('index.html')
h = re.sub(r"f_skin\.js\?v=(\d+)", lambda m: "f_skin.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
