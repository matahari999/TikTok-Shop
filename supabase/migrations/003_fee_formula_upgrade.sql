-- Phase 1: 2026년 4월 신규 수수료 공식 반영 + 사업자 등록 여부
-- fee_rules 테이블에 tax_registered(사업자등록) / fee_formula_version(수수료공식버전) 추가
-- orders 테이블에 seller_discount(셀러할인) / shipping_fee(고객배송비) 추가

alter table public.fee_rules
  add column if not exists tax_registered boolean not null default false,
  add column if not exists fee_formula_version text not null default 'after_2026_04'
    check (fee_formula_version in ('before_2026_04', 'after_2026_04'));

-- 기존 카테고리 row에 기본값 설정 (before_2026_04는 2026.4.1 이전 신규가입자용)
update public.fee_rules set fee_formula_version = 'after_2026_04' where fee_formula_version is null;

-- orders: 셀러 할인액, 고객 부담 배송비 (after_2026_04 공식에서 사용)
alter table public.orders
  add column if not exists seller_discount numeric(15,0) not null default 0,
  add column if not exists shipping_fee numeric(15,0) not null default 0;

-- transaction_fee 컬럼 추가 (계산된 트랜잭션 수수료 저장)
alter table public.orders
  add column if not exists transaction_fee numeric(15,0) not null default 0;
