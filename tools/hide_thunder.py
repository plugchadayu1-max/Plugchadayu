# เทพสายฟ้า: อาชีพอื่นไม่เห็นการ์ด/ข้อความในคู่มือ (เห็นเฉพาะนักยิงปืน และคนที่เปลี่ยนแล้ว)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

p = rd('f_progress.js')
p = rep(p, "if(P.cls!=='thunder')body+=thunderCard(false);", "if(P.cls==='rogue')body+=thunderCard(false);   // เห็นการ์ดเฉพาะนักยิงปืน (เทพสายฟ้าแล้วเห็นการ์ดสถานะปัจจุบันด้านบน)")
wr('f_progress.js', p)

m = rd('f_manual.js')
m = rep(m, "${items.map(x=>`<li>${x}</li>`).join('')}",
           "${items.filter(x=>!/เทพสายฟ้า/.test(x)||(typeof P!=='undefined'&&P&&(P.cls==='rogue'||P.cls==='thunder'))).map(x=>`<li>${x}</li>`).join('')}")
wr('f_manual.js', m)

h = rd('index.html')
for f in ('f_progress', 'f_manual'):
    h = re.sub(f + r"\.js\?v=(\d+)", lambda x, f=f: "%s.js?v=%d" % (f, int(x.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
