-- แก้แชทส่งไม่ได้ของตัวละครช่อง 3-4 / ตัวละครสำรอง: รันไฟล์นี้ใน Supabase → SQL Editor ครั้งเดียว
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
