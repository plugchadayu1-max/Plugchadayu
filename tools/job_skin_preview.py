# หน้าต่างอาชีพ: ภาพ "คลาสที่จะเปลี่ยน" ตอนตื่นรู้ = ภาพสกินสาย 1/2 (แทนการซื้อสกิน)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

s = rd('f_skin.js')
if 'skinDraw' in s: raise SystemExit('already applied')
s = rep(s, "window.skinCount=cls=>(SKINS[cls]||[]).length;",
"""window.skinCount=cls=>(SKINS[cls]||[]).length;
window.skinsOf=cls=>(SKINS[cls]||[]).map(x=>({id:x.id,n:x.n,ic:x.ic,d:x.d}));
// วาดภาพสกิน (หน้าตรง ท่ายืน เคลื่อนไหว) ลงแคนวาส — ใช้ในหน้าต่างอาชีพ
window.skinDraw=function(c,id){
  const def=Object.values(SKINS).flat().find(x=>x.id===id);if(!def)return;ensureLoad(id);
  const S=SHEETS[def.key],g=c.getContext('2d'),W=c.width,H=c.height;g.clearRect(0,0,W,H);
  if(!S){g.fillStyle='#fff';g.font='11px Tahoma';g.textAlign='center';g.fillText('กำลังโหลด...',W/2,H/2);return}
  const fr=S.anims.idle.front,idx=fr[Math.floor(performance.now()/180)%fr.length];
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(S.im,(idx%S.cols)*S.cw,Math.floor(idx/S.cols)*S.ch,S.cw,S.ch,0,0,W,H);
};""")
wr('f_skin.js', s)

p = rd('f_progress.js')
# การ์ดตื่นรู้: แสดงสกินสาย 1/2 ถ้าอาชีพมีสกิน
old = p[p.index("`<div class=\"eqr\" style=\"align-items:center\"><canvas data-jp=\"${CLASSES[P.cls].sprite}\" data-col=\"${d.u.col}\" data-gold=\"1\""):]
old = old[:old.index("onclick=\"awakenJob()\">ตื่นรู้</button></div>`)") + len("onclick=\"awakenJob()\">ตื่นรู้</button></div>`)")]
new = """`<div class="eqr" style="align-items:center;flex-wrap:wrap"><div class="nm" style="flex:1 1 100%"><b>ตื่นรู้เป็น ${d.n2}</b><br><span class="small">ต้อง Lv ${JOB2.lv} • ${JOB2.cost.toLocaleString()} Zeny — โบนัสแรงขึ้นเป็น 1.8 เท่า (${bonusText(d.p,1.8)}) ท่าไม้ตายแรงขึ้น • <b style="color:#7fe07f">สถานะทุกค่า +100</b>${(window.skinsOf&&skinsOf(P.cls).length)?' • เลือกสายสกิน 1 จาก 2':''}</span></div>`+
          (window.skinsOf&&skinsOf(P.cls).length?`<div style="display:flex;gap:8px;flex:1 1 100%;margin:6px 0">${skinsOf(P.cls).map(x=>`<div style="flex:1;text-align:center;font-size:11px"><canvas data-skp="${x.id}" width="112" height="112" style="width:100%;max-width:112px;background:linear-gradient(#27406a,#3c6a45 72%,#2d4a26);border:2px solid #ffd04a"></canvas><br><b>${x.ic} ${x.n}</b></div>`).join('')}</div>`
            :`<canvas data-jp="${CLASSES[P.cls].sprite}" data-col="${d.u.col}" data-gold="1" width="84" height="84" style="flex:none;width:84px;height:84px;background:#0b0d18;border:2px solid #ffd04a;margin:6px 8px 6px 0"></canvas>`)+
          `<button ${can?'':'disabled'} onclick="awakenJob()" style="margin-left:auto">ตื่นรู้</button></div>`)"""
p = p.replace(old, new, 1)
# การ์ดอาชีพปัจจุบัน: ถ้าเลือกสกินแล้ว ใช้ภาพสกินนั้น
p = rep(p, "<canvas data-jp=\"${CLASSES[P.cls].sprite}\" data-col=\"${d.u.col}\" data-gold=\"${t2?1:0}\" width=\"84\" height=\"84\"",
           "<canvas ${P.job.skin?`data-skp=\"${P.job.skin}\"`:`data-jp=\"${CLASSES[P.cls].sprite}\"`} data-col=\"${d.u.col}\" data-gold=\"${t2?1:0}\" width=\"84\" height=\"84\"")
p = rep(p, "  w.querySelectorAll('canvas[data-jp]').forEach(c=>jobPreview(c,c.dataset.jp,c.dataset.col,c.dataset.gold==='1'));\n}",
"""  w.querySelectorAll('canvas[data-jp]').forEach(c=>jobPreview(c,c.dataset.jp,c.dataset.col,c.dataset.gold==='1'));
  w.querySelectorAll('canvas[data-skp]').forEach(c=>window.skinDraw&&skinDraw(c,c.dataset.skp));
  clearInterval(refreshJob._t);   // สกินเคลื่อนไหว/โหลดเสร็จแล้ววาดใหม่ทุก 180 ms ขณะหน้าต่างเปิด
  if(w.querySelector('canvas[data-skp]'))refreshJob._t=setInterval(()=>{const ww=$('winJob');if(!ww||ww.style.display!=='block'){clearInterval(refreshJob._t);return}
    ww.querySelectorAll('canvas[data-skp]').forEach(c=>window.skinDraw&&skinDraw(c,c.dataset.skp))},180);
}""")
wr('f_progress.js', p)

h = rd('index.html')
h = re.sub(r"f_skin\.js\?v=(\d+)", lambda m: "f_skin.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
