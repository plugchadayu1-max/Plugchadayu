-- รันไฟล์นี้ครั้งเดียวใน Supabase > SQL Editor เพื่ออนุญาตระบบจุติ (รีเซ็ต Lv1 แต่ค่าสถานะคงเดิม)
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

