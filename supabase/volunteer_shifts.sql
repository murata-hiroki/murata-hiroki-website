-- /volunteer フォームの保存先テーブル。
-- このリポジトリにマイグレーションの仕組みは無いため、Supabase の SQL Editor で実行する。
-- 命名・型は既存の voices / supporters テーブルに合わせている。

create table if not exists public.volunteer_shifts (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null,
  tel        text not null,
  email      text,
  type       text not null check (type in ('volunteer', 'speaker')),
  -- 役割はフォームで聞かない（事務所側で決める）。
  -- 誰に何をお願いしたかの正は動員マスター名簿の「②ボラ役割」列。
  -- 例: [{"date":"2026-08-09","slot":"08-11"}, ...]
  shifts     jsonb  not null default '[]'::jsonb,
  -- 先生（type='speaker'）が「スポット以外もお手伝いできる」と申し出たか。
  -- 何をお願いするかはフォームに並べず、この印を頼りに個別にご相談する。
  wants_help boolean not null default false,
  note       text,
  source     text
);

-- RLS を有効化し、ポリシーは作らない。
-- => anon / authenticated キーからは一切読み書きできず、
--    service_role キー（/api/volunteer 内でのみ使用）だけが書き込める。
alter table public.volunteer_shifts enable row level security;

-- 「8/9 の 8-11 枠に誰がいるか」を引くための索引
create index if not exists volunteer_shifts_shifts_gin
  on public.volunteer_shifts using gin (shifts jsonb_path_ops);

create index if not exists volunteer_shifts_created_at_idx
  on public.volunteer_shifts (created_at desc);

-- 運用時のクエリ例 --------------------------------------------------

-- ある枠に来られる人（例: 8/9 の 8:00〜11:00）→ ここから役割を割り当てる
--   select name, tel, type, note
--   from public.volunteer_shifts
--   where shifts @> '[{"date":"2026-08-09","slot":"08-11"}]'::jsonb
--   order by created_at;

-- 枠ごとの人数を一覧（28マスの埋まり具合）
--   select s->>'date' as date, s->>'slot' as slot, count(*) as people
--   from public.volunteer_shifts, jsonb_array_elements(shifts) as s
--   group by 1, 2
--   order by 1, 2;

-- お手伝いの方の一覧（→ ウグイス・運転手をここから当てていく）
--   select name, tel, shifts, note
--   from public.volunteer_shifts
--   where type = 'volunteer'
--   order by created_at;

-- スポット以外もお手伝いできると申し出た先生（→ 個別に電話してご相談する）
--   select name, tel, shifts, note
--   from public.volunteer_shifts
--   where type = 'speaker' and wants_help
--   order by created_at;
