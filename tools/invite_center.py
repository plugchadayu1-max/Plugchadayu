# คำชวนเข้าปาร์ตี้: เด้งกลางหน้าจอ บอกชื่อผู้ชวน (เลเวล) ให้เลือก ตกลง/ปฏิเสธ + นับถอยหลัง 30 วินาที
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

s = rd('f_social.js')
if 'invCount' in s: raise SystemExit('already applied')
s = rep(s, "#socInv{position:fixed;z-index:41;left:50%;top:18%;transform:translateX(-50%);display:none;flex-direction:column;gap:8px;width:min(320px,92vw);padding:12px 14px;text-align:center;color:#eef3ff;font-size:14px;background:linear-gradient(#1b2d5c,#0f1a3a);border:2px solid #d4af37;border-radius:12px;box-shadow:0 8px 26px rgba(0,0,0,.65)}",
           "#socInv{position:fixed;z-index:60;left:50%;top:50%;transform:translate(-50%,-50%);display:none;flex-direction:column;gap:10px;width:min(360px,92vw);padding:18px 18px 16px;text-align:center;color:#eef3ff;font-size:15px;background:linear-gradient(#1b2d5c,#0f1a3a);border:3px solid #d4af37;border-radius:14px;box-shadow:0 0 0 100vmax rgba(4,8,24,.55),0 10px 34px rgba(0,0,0,.7)}\n#socInv .tt{font-size:17px;font-weight:bold;color:#ffe28a}#socInv .who{font-size:18px}#socInv .cd{font-size:12px;color:#9fb0d8}")
s = rep(s, "    d.innerHTML=`<div>👥 <b style=\"color:#ffe28a\">${nm}</b> ชวนคุณเข้าปาร์ตี้</div>",
           "    const lvT=p.lv?` <span style=\"color:#9fb0d8;font-size:13px\">Lv ${esc(String(+p.lv||''))}</span>`:'';\n    d.innerHTML=`<div class=\"tt\">👥 คำชวนเข้าปาร์ตี้</div><div class=\"who\"><b style=\"color:#9ff0a0\">${nm}</b>${lvT}<br>ชวนคุณเข้าร่วมปาร์ตี้</div>")
s = rep(s, "<div class=\"row\"><button onclick=\"partyAnswer(false)\">ปฏิเสธ</button><button class=\"go\" onclick=\"partyAnswer(true)\">รับ</button></div>`;",
           "<div class=\"row\"><button onclick=\"partyAnswer(false)\">✖ ปฏิเสธ</button><button class=\"go\" onclick=\"partyAnswer(true)\">✔ ตกลง</button></div><div class=\"cd\" id=\"invCount\">ตอบภายใน 30 วินาที</div>`;")
s = rep(s, "    clearTimeout(SOC.invT);SOC.invT=setTimeout(()=>{if(SOC.invite===p)partyAnswer(false)},30000);",
"""    clearTimeout(SOC.invT);SOC.invT=setTimeout(()=>{if(SOC.invite===p)partyAnswer(false)},30000);
    clearInterval(SOC.invI);let left=30;SOC.invI=setInterval(()=>{left--;const c=$('invCount');if(c)c.textContent='ตอบภายใน '+Math.max(0,left)+' วินาที';if(left<=0||SOC.invite!==p)clearInterval(SOC.invI)},1000);
    try{if(typeof toast==='function')toast('👥 '+cleanName2(p.name)+' ชวนคุณเข้าปาร์ตี้')}catch(e){}""")
s = rep(s, "function partyAnswer(ok){\n  const p=SOC.invite;", "function partyAnswer(ok){\n  clearInterval(SOC.invI);const p=SOC.invite;")
wr('f_social.js', s)
h = rd('index.html')
h = re.sub(r"f_social\.js\?v=(\d+)", lambda m: "f_social.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)
print('ok')
