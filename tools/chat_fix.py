# 1) ข้อความแชท/แจ้งเตือน (#log) ย้ายไปกลางล่างของจอ (ตามวงสีแดง)  2) แก้แชทส่งไม่ได้ของตัวละครช่อง 3-4 (char_names จำกัดช่อง 1-2)
import os, re
G = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def rd(f): return open(os.path.join(G, f), encoding='utf-8-sig').read()
def wr(f, t): open(os.path.join(G, f), 'w', encoding='utf-8').write(t)
def rep(t, a, b):
    if a not in t: raise SystemExit('missing: ' + a[:90])
    return t.replace(a, b, 1)

h = rd('index.html')
if 'z-index:3;left:50%' in h: raise SystemExit('already applied')
h = rep(h, "#log{position:fixed;left:10px;bottom:196px;width:min(340px,38vw);font-size:12px;",
           "#log{position:fixed;z-index:3;left:50%;transform:translateX(-50%);bottom:6px;width:min(430px,26vw);min-width:260px;font-size:12px;")
h = re.sub(r"f_chat\.js\?v=(\d+)", lambda m: "f_chat.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
h = re.sub(r"f_social\.js\?v=(\d+)", lambda m: "f_social.js?v=%d" % (int(m.group(1)) + 1), h, count=1)
wr('index.html', h)

# ---- SQL ติดตั้งใหม่ ----
q = rd('tools/supabase_setup.sql')
q = rep(q, "  slot int not null check (slot between 1 and 2),\n  name text not null,\n  name_key text not null,",
           "  slot int not null check (slot between 1 and 4),\n  name text not null,\n  name_key text not null,")
q = rep(q, """  if not exists (select 1 from public.char_names where player_id = new.player_id and name = split_part(new.name, '·', 1))
    then raise exception 'chat: name not owned'; end if;""",
"""  -- ห้ามใช้ชื่อที่ผู้เล่นคนอื่นจองไว้ (กันปลอมชื่อ) — ชื่อของตัวเองไม่ว่าช่องไหน/ยังไม่ได้จอง ส่งได้หมด
  if exists (select 1 from public.char_names where player_id <> new.player_id and name = split_part(new.name, '·', 1))
    then raise exception 'chat: name not owned'; end if;""")
wr('tools/supabase_setup.sql', q)

# ---- SQL ย้ายข้อมูล (รันครั้งเดียวกับฐานข้อมูลที่ติดตั้งไว้แล้ว) ----
mig = """-- แก้แชทส่งไม่ได้ของตัวละครช่อง 3-4 / ตัวละครสำรอง: รันไฟล์นี้ใน Supabase → SQL Editor ครั้งเดียว
-- 1) ให้ตาราง char_names รับช่อง 1-4 (เดิมจำกัด 1-2 จึงจองชื่อช่อง 3-4 ไม่ได้ -> แชทขึ้น "name not owned")
alter table public.char_names drop constraint if exists char_names_slot_check;
alter table public.char_names add constraint char_names_slot_check check (slot between 1 and 4);

-- 2) แชท: ห้ามใช้เฉพาะชื่อที่ผู้เล่น "คนอื่น" จองไว้ (ของตัวเอง/ยังไม่ได้จอง ส่งได้)
create or replace function public.check_chat() returns trigger language plpgsql as $$
begin
  new.msg := btrim(new.msg); new.name := btrim(new.name);
  if length(new.msg) < 1 or length(new.msg) > 120 then raise exception 'chat: bad length'; end if;
  if length(new.name) < 1 or length(new.name) > 24 then raise exception 'chat: bad name'; end if;
  if exists (select 1 from public.char_names where player_id <> new.player_id and name = split_part(new.name, '·', 1))
    then raise exception 'chat: name not owned'; end if;
  if exists (select 1 from public.chat_messages where player_id = new.player_id and created_at > now() - interval '1500 milliseconds')
    then raise exception 'chat: too fast'; end if;
  delete from public.chat_messages where created_at < now() - interval '3 days';
  return new;
end $$;
"""
wr('tools/fix_chat_slots.sql', mig)

# ---- ฝั่งเกม: ข้อความชัดเจนเมื่อฐานข้อมูลยังเป็นแบบเก่า + ลองส่งซ้ำอัตโนมัติ 1 ครั้ง ----
c = rd('f_chat.js')
c = rep(c, "  if(/name not owned/.test(m)){if(typeof nameEnsure==='function')nameEnsure();return 'กำลังลงทะเบียนชื่อตัวละคร ลองส่งอีกครั้ง'}",
           "  if(/name not owned/.test(m)){if(typeof nameEnsure==='function')nameEnsure();return 'ชื่อนี้เป็นของผู้เล่นคนอื่น (หรือฐานข้อมูลยังเป็นแบบเก่า) — เปลี่ยนชื่อตัวละคร หรือให้ผู้ดูแลรัน tools/fix_chat_slots.sql'}")
c = rep(c, "  }catch(e){$('chErr').textContent=chErrMsg(e);el.value=t}\n}",
"""  }catch(e){
    $('chErr').textContent=chErrMsg(e);el.value=t;
    // ชื่อยังไม่ถูกจอง: จองแล้วลองส่งซ้ำอัตโนมัติ 1 ครั้ง
    if(!chSend._retry&&/name not owned/.test((e&&(e.raw&&(e.raw.message||e.raw.hint)||e.msg))||'')&&typeof nameCheck==='function'&&P.dx.nick){
      chSend._retry=1;try{await nameCheck(P.dx.nick)}catch(x){}
      CHT.lastSend=0;setTimeout(()=>{chSend._retry=0;chSend()},300);
    }
  }
}""")
wr('f_chat.js', c)
print('ok')
