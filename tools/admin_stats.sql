-- ===== Meadow Quest: สถิติผู้เล่นสำหรับผู้ดูแล =====
-- วิธีใช้: Supabase -> SQL Editor -> วางทั้งไฟล์ -> Run (อ่านอย่างเดียว ไม่แก้ข้อมูล)
-- รันได้หลังรัน tools/supabase_setup.sql แล้ว (ต้องมีตาราง presence / char_names / chat_reports)

-- 1) ภาพรวม: บัญชีทั้งหมด / ออนไลน์ตอนนี้ / เข้าเล่นใน 24 ชม. / 7 วัน
select
  (select count(*) from auth.users)                                                     as บัญชีทั้งหมด,
  (select count(*) from public.presence where seen_at > now() - interval '2 minutes')   as ออนไลน์ตอนนี้,
  (select count(*) from public.presence where seen_at > now() - interval '1 day')       as เล่นใน_24_ชม,
  (select count(*) from public.presence where seen_at > now() - interval '7 days')      as เล่นใน_7_วัน,
  (select count(*) from public.game_saves)                                              as ตัวละครทั้งหมด;

-- 2) ใครออนไลน์อยู่ตอนนี้
select name as ชื่อ, lv as เลเวล, cls as อาชีพ, map as แมพ, seen_at as ส่งสัญญาณล่าสุด
from public.presence where seen_at > now() - interval '2 minutes' order by lv desc;

-- 3) ผู้เล่นหยุดที่เลเวลไหน (ตัวละครที่ไม่ได้เล่นเกิน 3 วัน) — ช่วงที่คนหยุดเยอะ = ช่วงที่เกมอาจยาก/น่าเบื่อ
select ((save_data->>'lv')::int / 5) * 5 as ช่วงเลเวล, count(*) as จำนวนตัวละคร
from public.game_saves where updated_at < now() - interval '3 days'
group by 1 order by 1;

-- 4) ตัวละครแยกตามอาชีพและแมพ
select save_data->>'cls' as อาชีพ, save_data->>'map' as แมพ, count(*) as จำนวน, round(avg((save_data->>'lv')::int),1) as เลเวลเฉลี่ย
from public.game_saves group by 1,2 order by 3 desc;

-- 5) เวลาเล่นสะสม (ชั่วโมง) ต่อบัญชี — 20 อันดับแรก
select name as ชื่อ, lv as เลเวล, round(play_sec/3600.0,1) as ชั่วโมงที่เล่น, first_seen as เข้าครั้งแรก, seen_at as เข้าล่าสุด
from public.presence order by play_sec desc limit 20;

-- 6) รายงานแชทล่าสุด (ดูว่าใครโดนรายงานบ่อย)
select created_at as เวลา, name as ผู้ถูกรายงาน, msg as ข้อความ, reason as เหตุผล, target as player_id
from public.chat_reports order by created_at desc limit 50;
