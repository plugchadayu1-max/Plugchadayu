# ตารางอันดับ: อัปเดตอัตโนมัติทุก 5 นาที (ส่งคะแนนตัวเอง + ดึงอันดับใหม่) และแสดงเวลาอัปเดตล่าสุด
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

o = rd('f_online.js')
if 'LB_EVERY' in o: raise SystemExit('already applied')
o = rep(o, "window.lbFetch=async function(){",
"""const LB_EVERY=300000;   // อันดับอัปเดตทุก 5 นาที
function lbCycle(){
  if(typeof SESS==='undefined'||!SESS||typeof P==='undefined'||!P)return;
  lbPush();   // ส่งพลังรบล่าสุดของเรา แล้วดึงอันดับใหม่
  window.lbFetch().then(()=>{try{const w=$('winRank');if(w&&w.style.display==='block'&&typeof refreshRank==='function')refreshRank()}catch(e){}});
}
setInterval(lbCycle,LB_EVERY);
setTimeout(lbCycle,8000);   // ครั้งแรกหลังเข้าเกมไม่นาน
window.lbFetch=async function(){""")
wr('f_online.js', o)

p = rd('f_progress.js')
p = rep(p, "Date.now()-(window._lbAt||0)>15000)window.lbFetch().then(refreshRank);", "Date.now()-(window._lbAt||0)>300000)window.lbFetch().then(refreshRank);")
p = rep(p, "• อัปเดตตอนเข้าเล่นและตอนบันทึก</div>`;",
           "• อัปเดตอัตโนมัติทุก 5 นาที${window._lbAt?` • ล่าสุด ${new Date(window._lbAt).toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit'})}`:''}</div>`;")
wr('f_progress.js', p)

h = rd('index.html')
h = re.sub(r"f_online\.js\?v=(\d+)", lambda m: "f_online.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
