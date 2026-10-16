# สมัคร/ล็อกอินด้วย "ชื่อผู้ใช้" แทนอีเมล (แปลงเป็นอีเมลสังเคราะห์ภายใน — ผู้ใช้ไม่ต้องมีอีเมลจริง)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(G, 'f_online.js')
t = open(p, encoding='utf-8-sig').read()
if 'AUTH_DOMAIN' in t: raise SystemExit('already applied')
def rep(a, b):
    global t
    if a not in t: raise SystemExit('missing: ' + a[:90])
    t = t.replace(a, b, 1)

rep("function sessFrom(j){",
"""// ชื่อผู้ใช้ <-> อีเมลสังเคราะห์ (Supabase Auth ต้องมีรูปแบบอีเมล) — ผู้ใช้ไม่ต้องมีอีเมลจริง ต้องปิด "Confirm email" ใน Supabase
const AUTH_DOMAIN='players.meadowquest.app';
const userToEmail=u=>u.includes('@')?u:u+'@'+AUTH_DOMAIN;           // มี @ = บัญชีเก่าที่สมัครด้วยอีเมลจริง ใช้ได้เหมือนเดิม
const emailToUser=e=>String(e||'').endsWith('@'+AUTH_DOMAIN)?e.slice(0,-(AUTH_DOMAIN.length+1)):e;
function sessFrom(j){""")
rep("${SESS.user.email}<br>", "${emailToUser(SESS.user.email)}<br>")
rep("""<div><label>อีเมล</label><input id="aEmail" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com"></div>""",
    """<div><label>ชื่อผู้ใช้ (ตัวอังกฤษ/ตัวเลข 3-20 ตัว ไม่ต้องใช้อีเมล)</label><input id="aEmail" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="40" placeholder="เช่น hero123"></div>""")
rep("const email=$('aEmail').value.trim(),pw=$('aPass').value,err=$('authErr'),btn=$('aGo');\n  if(!email||!pw){err.textContent='กรอกอีเมลและรหัสผ่านก่อน';return}",
    """const uname=$('aEmail').value.trim().toLowerCase(),pw=$('aPass').value,err=$('authErr'),btn=$('aGo');
  if(!uname||!pw){err.style.color='#ff9d9a';err.textContent='กรอกชื่อผู้ใช้และรหัสผ่านก่อน';return}
  if(AUTHMODE==='signup'&&!/^[a-z0-9_.-]{3,20}$/.test(uname)){err.style.color='#ff9d9a';err.textContent='ชื่อผู้ใช้ต้องเป็นตัวอังกฤษ ตัวเลข _ . - ยาว 3-20 ตัว (ห้ามเว้นวรรค/ภาษาไทย)';return}
  if(AUTHMODE==='login'&&!/^[a-z0-9_.@+-]{3,80}$/.test(uname)){err.style.color='#ff9d9a';err.textContent='ชื่อผู้ใช้ไม่ถูกต้อง';return}
  const email=userToEmail(uname);""")
rep("err.textContent='สมัครแล้ว! โปรดยืนยันอีเมลก่อน แล้วกลับมาเข้าสู่ระบบ (หรือให้ผู้ดูแลปิด Confirm email)'",
    "err.textContent='สมัครแล้ว แต่ระบบยังเปิดให้ยืนยันอีเมลอยู่ — ให้ผู้ดูแลปิด \"Confirm email\" ใน Supabase (Authentication → Providers → Email) แล้วลองเข้าสู่ระบบ'")
# ข้อความแปลภาษา error
rep("[/invalid login/i,'อีเมลหรือรหัสผ่านไม่ถูกต้อง'],[/already registered|already been registered/i,'อีเมลนี้สมัครไปแล้ว ลองเข้าสู่ระบบแทน'],",
    "[/invalid login/i,'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'],[/already registered|already been registered/i,'ชื่อผู้ใช้นี้มีคนใช้แล้ว ลองชื่ออื่น หรือเข้าสู่ระบบแทน'],")
rep("[/email not confirmed/i,'ยังไม่ได้ยืนยันอีเมล (เช็กกล่องจดหมาย หรือให้ผู้ดูแลปิด Confirm email)'],",
    "[/email not confirmed/i,'บัญชียังไม่ถูกเปิดใช้งาน — ให้ผู้ดูแลปิด \"Confirm email\" ใน Supabase'],")
rep("[/valid email|invalid.*email|email address.*invalid/i,'รูปแบบอีเมลไม่ถูกต้อง'],",
    "[/valid email|invalid.*email|email address.*invalid/i,'ชื่อผู้ใช้นี้ใช้ไม่ได้ ลองชื่ออื่น (ตัวอังกฤษ/ตัวเลข)'],")
rep("สมัคร/ล็อกอินด้วยอีเมล+รหัสผ่าน", "สมัคร/ล็อกอินด้วยชื่อผู้ใช้+รหัสผ่าน (ไม่ต้องใช้อีเมลจริง)")
open(p, 'w', encoding='utf-8').write(t)

h = os.path.join(G, 'index.html'); s = open(h, encoding='utf-8-sig').read()
s = re.sub(r"f_online\.js\?v=(\d+)", lambda m: "f_online.js?v=%d" % (int(m.group(1)) + 1), s, count=1)
open(h, 'w', encoding='utf-8').write(s)
print('ok')
