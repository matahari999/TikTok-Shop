-- Stage 1-5 upgrade: category fees, ad spend, affiliate tracking, orders expansion

-- ─── Extend orders table ───────────────────────────────────────────────────────
alter table public.orders
  add column if not exists order_number   text,
  add column if not exists category       text not null default 'Khác',
  add column if not exists is_refund      boolean not null default false,
  add column if not exists settlement_amount numeric(15,0) not null default 0,
  add column if not exists affiliate_rate numeric(5,4) not null default 0,
  add column if not exists affiliate_fee  numeric(15,0) not null default 0;

-- ─── Category fee rules (admin-seeded, user-readable) ─────────────────────────
create table if not exists public.fee_rules (
  id              uuid default gen_random_uuid() primary key,
  category        text not null unique,
  referral_rate   numeric(5,4) not null default 0.125,
  transaction_rate numeric(5,4) not null default 0.06,
  processing_fee  integer not null default 3000,
  notes           text,
  updated_at      timestamptz default now() not null
);

-- Seed 9 categories — referral_rate varies, transaction & processing fixed
insert into public.fee_rules (category, referral_rate, transaction_rate, processing_fee, notes) values
  ('Thời trang',    0.125, 0.06, 3000, 'Fashion & apparel'),
  ('Mỹ phẩm',      0.125, 0.06, 3000, 'Beauty & cosmetics'),
  ('Điện tử',      0.080, 0.06, 3000, 'Electronics'),
  ('Gia dụng',     0.100, 0.06, 3000, 'Home & kitchen'),
  ('Thực phẩm',    0.050, 0.06, 3000, 'Food & beverages'),
  ('Sức khỏe',     0.100, 0.06, 3000, 'Health & wellness'),
  ('Thể thao',     0.100, 0.06, 3000, 'Sports & outdoors'),
  ('Đồ chơi',      0.100, 0.06, 3000, 'Toys & hobbies'),
  ('Khác',         0.125, 0.06, 3000, 'Other / uncategorised')
on conflict (category) do nothing;

-- No RLS on fee_rules — it is public read-only config data
-- Users can select but not insert/update/delete via anon key
alter table public.fee_rules enable row level security;
create policy "Public read fee_rules" on public.fee_rules
  for select using (true);

-- ─── Ad spend tracking ────────────────────────────────────────────────────────
create table if not exists public.ad_spend (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  spend_date      date not null default current_date,
  campaign_name   text not null default 'Quảng cáo chung',
  amount          numeric(15,0) not null,
  note            text,
  created_at      timestamptz default now() not null
);

alter table public.ad_spend enable row level security;

create policy "Users manage own ad_spend" on public.ad_spend
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Index for date-range queries on ad_spend
create index if not exists ad_spend_user_date_idx on public.ad_spend (user_id, spend_date desc);

-- Index for date-range queries on orders
create index if not exists orders_user_date_idx on public.orders (user_id, order_date desc);
