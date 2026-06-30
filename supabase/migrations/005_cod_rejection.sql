-- Phase 3: COD 거부/배송실패 손실 자동 반영
-- order_status: 주문 상태 (completed/cod_rejected/refunded/failed_delivery/cancelled)
-- loss_amount: COD거부/배송실패로 인한 손실액 (원가 + 배송비 기준)

do $$ begin
  if not exists (select 1 from pg_type where typname = 'order_status_type') then
    create type order_status_type as enum ('completed', 'cod_rejected', 'refunded', 'failed_delivery', 'cancelled');
  end if;
end $$;

alter table public.orders
  add column if not exists order_status order_status_type not null default 'completed',
  add column if not exists loss_amount numeric(15,0) not null default 0;

-- 기존 is_refund=true인 주문은 order_status='refunded'로 마이그레이션
update public.orders
  set order_status = 'refunded'
  where is_refund = true and order_status = 'completed';

-- order_status 인덱스
create index if not exists orders_status_idx on public.orders (user_id, order_status);
