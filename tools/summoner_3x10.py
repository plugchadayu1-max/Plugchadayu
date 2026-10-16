# นักอัญเชิญ: เรียกโครงกระดูกครั้งละ 3 ตัว อยู่ 10 วินาทีแล้วหายไป (ทั้งสกิล 1 และอัลติเมททั้งสองสาย)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:100])
    return t.replace(a, b, 1)

h = rd('index.html')
h = rep(h, "mult:1.2,range:420,life:18,maxMinions:4,count:2,r:170,", "mult:1.2,range:420,life:10,maxMinions:6,count:3,r:170,")
wr('index.html', h)

p = rd('f_progress.js')
p = rep(p, "แล้วเรียกกองทัพโครงกระดูก 4 ตนช่วยสู้ 22 วิ ทุกตนดูดเลือดให้คุณ +15%", "แล้วเรียกโครงกระดูก 3 ตนช่วยสู้ 10 วินาทีก่อนสลายไป ทุกตนดูดเลือดให้คุณ +15%")
p = rep(p, "range:420,life:22,maxMinions:6,count:4,ls:.15,r:290,", "range:420,life:10,maxMinions:6,count:3,ls:.15,r:290,")
p = rep(p, "แล้วกระดูกผุดเป็นโครงกระดูก 3 ตนที่แรงกว่า 22 วิ ทุกตนดูดเลือดให้คุณ +15%", "แล้วกระดูกผุดเป็นโครงกระดูก 3 ตนที่แรงกว่า อยู่ 10 วินาทีก่อนสลายไป ทุกตนดูดเลือดให้คุณ +15%")
p = rep(p, "range:420,life:22,maxMinions:5,count:3,ls:.15,r:230,", "range:420,life:10,maxMinions:6,count:3,ls:.15,r:230,")
wr('f_progress.js', p)

h = rd('index.html')
h = re.sub(r"f_progress\.js\?v=(\d+)", lambda m: "f_progress.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
