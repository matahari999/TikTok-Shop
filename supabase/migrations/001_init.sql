-- products table
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  sku text not null,
  category text not null default 'Khác',
  cost_price numeric(15,0) not null,
  selling_price numeric(15,0) not null,
  stock integer not null default 0,
  commission_rate numeric(5,4) not null default 0.125,
  created_at timestamptz default now() not null
);

alter table public.products enable row level security;

create policy "Users manage own products" on public.products
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  selling_price numeric(15,0) not null,
  cost_price numeric(15,0) not null,
  commission_rate numeric(5,4) not null default 0.125,
  profit numeric(15,0) not null,
  margin numeric(6,2) not null,
  order_date date not null default current_date,
  created_at timestamptz default now() not null
);

alter table public.orders enable row level security;

create policy "Users manage own orders" on public.orders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
