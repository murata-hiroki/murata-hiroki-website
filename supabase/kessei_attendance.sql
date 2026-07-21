-- /kessei フォーム（村田ひろき後援会 総決起大会 参加申込）の保存先テーブル。
-- このリポジトリにマイグレーションの仕組みは無いため、Supabase の SQL Editor で実行する。
-- 命名・型は既存の voices / supporters / volunteer_shifts テーブルに合わせている。

create table if not exists public.kessei_attendance (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  tel        text not null,
  email      text,
  -- 本人を含めた総ご参加人数（名簿の「連れ」集計に使う中核データ）。1 以上。
  party_size int  not null check (party_size >= 1),
  -- ご紹介者（任意）。世話人ルートの帰属に使う。
  referrer   text,
  note       text,
  source     text
);

-- RLS を有効化し、ポリシーは作らない。
-- => anon / authenticated キーからは一切読み書きできず、
--    service_role キー（/api/kessei 内でのみ使用）だけが書き込める。
alter table public.kessei_attendance enable row level security;

create index if not exists kessei_attendance_created_at_idx
  on public.kessei_attendance (created_at desc);

-- 紹介者ルート別の集計を引きやすくするための索引
create index if not exists kessei_attendance_referrer_idx
  on public.kessei_attendance (referrer);

-- 運用時のクエリ例 --------------------------------------------------

-- 申込ベースの来場見込み（party_size の合計）
--   select coalesce(sum(party_size), 0) as expected_attendees,
--          count(*)                     as submissions
--   from public.kessei_attendance;

-- 紹介者（世話人）ルート別の実績
--   select coalesce(referrer, '（紹介者なし）') as referrer,
--          count(*)          as submissions,
--          sum(party_size)   as people
--   from public.kessei_attendance
--   group by 1
--   order by people desc;

-- 直近の申込一覧（名簿の「①来場」「連れ」列と突き合わせる）
--   select created_at, name, tel, party_size, referrer, note
--   from public.kessei_attendance
--   order by created_at desc;
