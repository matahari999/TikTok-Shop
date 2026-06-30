-- Phase 2: 신규 셀러 프로베이션 진행률 트래커
-- shop_profile: 셀러의 샵 시작일, 샵명 등 프로베이션 관련 정보

create table if not exists public.shop_profile (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  shop_name text,
  shop_start_date date,
  created_at timestamptz default now() not null
);

alter table public.shop_profile enable row level security;

create policy "Users manage own shop_profile" on public.shop_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 인덱스
create index if not exists shop_profile_user_idx on public.shop_profile (user_id);
