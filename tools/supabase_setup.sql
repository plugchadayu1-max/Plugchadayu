-- ===== Meadow Quest: ตั้งค่า Supabase (รันใน SQL Editor ได้ซ้ำหลายครั้งโดยไม่พัง) =====

-- 0) ตัวละคร 2 ช่องต่อบัญชี: เพิ่มคอลัมน์ slot (1-2) และเปลี่ยนคีย์จาก player_id เป็น player_id+slot
--    เซฟเดิมทั้งหมดจะกลายเป็นช่องที่ 1 อัตโนมัติ
alter table public.game_saves add column if not exists slot int not null default 1;
do $$
declare c record;
begin
  -- ลบคีย์/ข้อห้ามซ้ำแบบเดิมที่ใช้ player_id คอลัมน์เดียว (ชื่อไม่แน่นอน เลยค้นจากระบบ)
  for c in
    select con.conname from pg_constraint con
    where con.conrelid = 'public.game_saves'::regclass and con.contype in ('p','u')
      and (select array_agg(a.attname::text) from unnest(con.conkey) k join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k) = array['player_id']
  loop
    execute format('alter table public.game_saves drop constraint %I', c.conname);
  end loop;
  for c in
    select i.relname from pg_index x join pg_class i on i.oid = x.indexrelid
    where x.indrelid = 'public.game_saves'::regclass and x.indisunique and x.indnkeyatts = 1
      and (select attname from pg_attribute where attrelid = x.indrelid and attnum = x.indkey[0]) = 'player_id'
  loop
    execute format('drop index if exists public.%I', c.relname);
  end loop;
  -- ถ้าคีย์หลักเดิมคือ player_id (ถูกลบไปแล้ว) -> ตั้งคีย์หลักใหม่เป็น player_id+slot
  if not exists (select 1 from pg_constraint where conrelid = 'public.game_saves'::regclass and contype = 'p') then
    alter table public.game_saves add constraint game_saves_pkey primary key (player_id, slot);
  end if;
end $$;
create unique index if not exists game_saves_player_slot on public.game_saves (player_id, slot);
alter table public.game_saves drop constraint if exists game_saves_slot_range;
alter table public.game_saves add constraint game_saves_slot_range check (slot between 1 and 4);   -- สูงสุด 4 ตัวละครต่อบัญชี

-- 1) เซฟตัวละคร: RLS + policy (อ่าน/สร้าง/แก้/ลบ เฉพาะแถวของตัวเอง)
alter table public.game_saves add column if not exists updated_at timestamptz default now();
alter table public.game_saves enable row level security;
drop policy if exists "อ่านเซฟตัวเอง" on public.game_saves;
drop policy if exists "สร้างเซฟตัวเอง" on public.game_saves;
drop policy if exists "แก้เซฟตัวเอง" on public.game_saves;
drop policy if exists "ลบเซฟตัวเอง" on public.game_saves;
create policy "อ่านเซฟตัวเอง" on public.game_saves for select using (auth.uid()::text = player_id);
create policy "สร้างเซฟตัวเอง" on public.game_saves for insert with check (auth.uid()::text = player_id);
create policy "แก้เซฟตัวเอง" on public.game_saves for update using (auth.uid()::text = player_id) with check (auth.uid()::text = player_id);
create policy "ลบเซฟตัวเอง" on public.game_saves for delete using (auth.uid()::text = player_id);

-- 2) กันโกงฝั่งเซิร์ฟเวอร์: ตรวจความสมเหตุสมผลทุกครั้งที่เซฟ (ผู้เล่นแก้ไขข้ามกฎไม่ได้ แม้ยิง API เอง)
create or replace function public.check_game_save() returns trigger language plpgsql as $$
declare
  s jsonb := new.save_data; o jsonb;
  el numeric; nlv int; olv int; nz numeric; oz numeric; ssum numeric;
begin
  if auth.uid() is null then return new; end if;                       -- แอดมิน/แดชบอร์ดผ่านได้
  if new.player_id <> auth.uid()::text then raise exception 'cheat: forbidden'; end if;
  if tg_op = 'UPDATE' and new.slot <> old.slot then raise exception 'cheat: slot'; end if;   -- ย้ายเซฟข้ามช่องไม่ได้
  nlv := coalesce((s->>'lv')::int, 1);
  nz  := coalesce((s->>'zeny')::numeric, 0);
  ssum := coalesce((s#>>'{stats,str}')::numeric,0) + coalesce((s#>>'{stats,agi}')::numeric,0)
        + coalesce((s#>>'{stats,vit}')::numeric,0) + coalesce((s#>>'{stats,int}')::numeric,0) + coalesce((s->>'pts')::numeric,0);
  if nlv < 1 or nlv > 200 then raise exception 'cheat: level'; end if;
  if nz < 0 then raise exception 'cheat: zeny'; end if;
  if ssum > 20 + 3*(nlv + 200*least(coalesce((s->>'rb')::int,0),50)) then raise exception 'cheat: stats'; end if;     -- แต้มสถานะรวมเกินที่เลเวลนี้ควรมี
  if tg_op = 'INSERT' then
    if exists (select 1 from public.game_saves where player_id = new.player_id and slot = new.slot) then
      new.updated_at := now(); return new;                              -- upsert ของแถวเดิม -> ไปตรวจที่ขั้น UPDATE
    end if;
    if nlv > 99 or nz > 1000000000 then raise exception 'cheat: new save too strong'; end if;
    if coalesce((s->>'rb')::int,0) > 0 then raise exception 'cheat: new save rebirth'; end if;   -- ตัวละครใหม่เริ่มที่ Lv 99 + 999 ล้าน Zeny (+เผื่อรางวัลความสำเร็จเลเวลที่ปลดทันที)
  else
    o := old.save_data;
    olv := coalesce((o->>'lv')::int, 1); oz := coalesce((o->>'zeny')::numeric, 0);
    el := greatest(1, extract(epoch from (now() - coalesce(old.updated_at, old.created_at))));
    if nlv > olv + 3 + el/3600*12 then raise exception 'cheat: level jump'; end if;                -- เลเวลขึ้นเร็วเกินจริง
    if nz > oz + 5000 + el*(30 + nlv*12) then raise exception 'cheat: zeny jump'; end if;          -- เงินเพิ่มเร็วเกินจริง
    if coalesce((s->>'kills')::numeric,0) < coalesce((o->>'kills')::numeric,0) then raise exception 'cheat: kills'; end if;
    if coalesce((s->>'rb')::int,0) > coalesce((o->>'rb')::int,0) + 1 then raise exception 'cheat: rebirth'; end if;   -- จุติได้ทีละครั้ง
    if coalesce((s->>'rb')::int,0) < coalesce((o->>'rb')::int,0) then raise exception 'cheat: rebirth down'; end if;
    if coalesce((s->>'rb')::int,0) > coalesce((o->>'rb')::int,0) and olv < 200 then raise exception 'cheat: rebirth lv'; end if;   -- จุติได้เมื่อเซฟก่อนหน้าอยู่ Lv200
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists trg_check_game_save on public.game_saves;
create trigger trg_check_game_save before insert or update on public.game_saves for each row execute function public.check_game_save();

-- 3) แชทโลก
create table if not exists public.chat_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  player_id text not null,
  name text not null,
  msg text not null,
  channel text not null default 'world'
);
create index if not exists chat_created on public.chat_messages (created_at);
create index if not exists chat_player on public.chat_messages (player_id, created_at desc);
alter table public.chat_messages enable row level security;
drop policy if exists "อ่านแชท" on public.chat_messages;
drop policy if exists "ส่งแชทของตัวเอง" on public.chat_messages;
create policy "อ่านแชท" on public.chat_messages for select to authenticated using (true);
create policy "ส่งแชทของตัวเอง" on public.chat_messages for insert to authenticated with check (auth.uid()::text = player_id);

-- 4) ชื่อตัวละครห้ามซ้ำ (ทั้งเซิร์ฟเวอร์ ไม่สนตัวพิมพ์เล็ก/ใหญ่) • 1 แถวต่อช่องตัวละคร
create table if not exists public.char_names (
  player_id text not null,
  slot int not null check (slot between 1 and 4),
  name text not null,
  name_key text not null,
  created_at timestamptz not null default now(),
  primary key (player_id, slot)
);
create unique index if not exists char_names_key on public.char_names (name_key);
alter table public.char_names enable row level security;
drop policy if exists "อ่านชื่อ" on public.char_names;
drop policy if exists "จองชื่อตัวเอง" on public.char_names;
drop policy if exists "เปลี่ยนชื่อตัวเอง" on public.char_names;
drop policy if exists "คืนชื่อตัวเอง" on public.char_names;
create policy "อ่านชื่อ" on public.char_names for select to authenticated using (true);
create policy "จองชื่อตัวเอง" on public.char_names for insert to authenticated with check (auth.uid()::text = player_id);
create policy "เปลี่ยนชื่อตัวเอง" on public.char_names for update to authenticated using (auth.uid()::text = player_id) with check (auth.uid()::text = player_id);
create policy "คืนชื่อตัวเอง" on public.char_names for delete to authenticated using (auth.uid()::text = player_id);
create or replace function public.check_char_name() returns trigger language plpgsql as $$
begin
  new.name := regexp_replace(btrim(new.name), '\s+', ' ', 'g');
  if length(new.name) < 2 or length(new.name) > 12 or new.name !~ '^[฀-๿A-Za-z0-9_ ]+$' then raise exception 'name: invalid'; end if;
  new.name_key := lower(new.name);
  return new;
end $$;
drop trigger if exists trg_check_char_name on public.char_names;
create trigger trg_check_char_name before insert or update on public.char_names for each row execute function public.check_char_name();

-- แชท: ชื่อผู้ส่งต้องเป็นชื่อตัวละครที่จองไว้จริง (กันปลอมชื่อคนอื่น)  รูปแบบ "ชื่อ·LvNN"
create or replace function public.check_chat() returns trigger language plpgsql as $$
begin
  new.msg := btrim(new.msg); new.name := btrim(new.name);
  if length(new.msg) < 1 or length(new.msg) > 120 then raise exception 'chat: bad length'; end if;
  if length(new.name) < 1 or length(new.name) > 24 then raise exception 'chat: bad name'; end if;
  -- ห้ามใช้ชื่อที่ผู้เล่นคนอื่นจองไว้ (กันปลอมชื่อ) — ชื่อของตัวเองไม่ว่าช่องไหน/ยังไม่ได้จอง ส่งได้หมด
  if exists (select 1 from public.char_names where player_id <> new.player_id and name = split_part(new.name, '·', 1))
    then raise exception 'chat: name not owned'; end if;
  if exists (select 1 from public.chat_messages where player_id = new.player_id and created_at > now() - interval '1500 milliseconds')
    then raise exception 'chat: too fast'; end if;                                                     -- ส่งถี่เกิน (สแปม)
  delete from public.chat_messages where created_at < now() - interval '3 days';                      -- เก็บแชทแค่ 3 วัน
  return new;
end $$;
drop trigger if exists trg_check_chat on public.chat_messages;
create trigger trg_check_chat before insert on public.chat_messages for each row execute function public.check_chat();

-- 5) รายงานแชท: ผู้เล่นส่งได้อย่างเดียว (อ่านได้เฉพาะแอดมินในแดชบอร์ด) • จำกัด 10 ครั้ง/ชั่วโมง
create table if not exists public.chat_reports (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  reporter text not null,
  target text not null,
  msg_id bigint,
  name text,
  msg text,
  reason text
);
alter table public.chat_reports enable row level security;
drop policy if exists "ส่งรายงาน" on public.chat_reports;
create policy "ส่งรายงาน" on public.chat_reports for insert to authenticated with check (auth.uid()::text = reporter);
create or replace function public.check_report() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.chat_reports where reporter = new.reporter and created_at > now() - interval '1 hour') >= 10
    then raise exception 'report: too many'; end if;
  new.msg := left(new.msg, 200); new.name := left(new.name, 30); new.reason := left(new.reason, 60);
  return new;
end $$;
drop trigger if exists trg_check_report on public.chat_reports;
create trigger trg_check_report before insert on public.chat_reports for each row execute function public.check_report();

-- 6) ใครออนไลน์อยู่: เกมส่งสัญญาณทุก ~60 วินาที (1 แถวต่อบัญชี) • นับคนออนไลน์ = ส่งสัญญาณภายใน 2 นาที
create table if not exists public.presence (
  player_id text primary key,
  name text,
  lv int,
  cls text,
  map text,
  seen_at timestamptz not null default now(),
  first_seen timestamptz not null default now(),
  play_sec bigint not null default 0
);
alter table public.presence enable row level security;
drop policy if exists "ดูคนออนไลน์" on public.presence;
drop policy if exists "ส่งสัญญาณตัวเอง" on public.presence;
drop policy if exists "อัปเดตสัญญาณตัวเอง" on public.presence;
create policy "ดูคนออนไลน์" on public.presence for select to authenticated using (true);
create policy "ส่งสัญญาณตัวเอง" on public.presence for insert to authenticated with check (auth.uid()::text = player_id);
create policy "อัปเดตสัญญาณตัวเอง" on public.presence for update to authenticated using (auth.uid()::text = player_id) with check (auth.uid()::text = player_id);
-- เวลาเล่นสะสม: บวกเฉพาะช่วงที่ส่งสัญญาณต่อเนื่อง (ห่างกันไม่เกิน 3 นาที) — ผู้เล่นแก้เองไม่ได้
create or replace function public.touch_presence() returns trigger language plpgsql as $$
begin
  new.name := left(new.name, 12); new.cls := left(new.cls, 12); new.map := left(new.map, 16);
  if tg_op = 'UPDATE' then
    new.first_seen := old.first_seen;
    new.play_sec := old.play_sec + case when now() - old.seen_at < interval '3 minutes' then extract(epoch from now() - old.seen_at)::bigint else 0 end;
  else
    new.first_seen := now(); new.play_sec := 0;
  end if;
  new.seen_at := now();
  return new;
end $$;
drop trigger if exists trg_touch_presence on public.presence;
create trigger trg_touch_presence before insert or update on public.presence for each row execute function public.touch_presence();


-- 7) อันดับพลังรบ: เฉพาะผู้เล่นจริง (เกมอัปเดตแถวของตัวเองตอนบันทึกขึ้นคลาวด์) • ทุกคนที่ล็อกอินอ่านได้
create table if not exists public.leaderboard (
  player_id text not null,
  slot int not null check (slot between 1 and 4),
  name text,
  cls text,
  lv int,
  power bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (player_id, slot)
);
alter table public.leaderboard enable row level security;
drop policy if exists "ดูอันดับ" on public.leaderboard;
drop policy if exists "ใส่อันดับตัวเอง" on public.leaderboard;
drop policy if exists "แก้อันดับตัวเอง" on public.leaderboard;
create policy "ดูอันดับ" on public.leaderboard for select to authenticated using (true);
create policy "ใส่อันดับตัวเอง" on public.leaderboard for insert to authenticated with check (auth.uid()::text = player_id);
create policy "แก้อันดับตัวเอง" on public.leaderboard for update to authenticated using (auth.uid()::text = player_id) with check (auth.uid()::text = player_id);
