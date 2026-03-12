-- 为已存在 orders 表增加 Chain2Pay 字段（幂等）
alter table if exists public.orders add column if not exists c2p_order_id text;
alter table if exists public.orders add column if not exists c2p_ipn_token text;
alter table if exists public.orders add column if not exists c2p_payment_url text;
alter table if exists public.orders add column if not exists c2p_provider text;
alter table if exists public.orders add column if not exists c2p_status text;
alter table if exists public.orders add column if not exists c2p_txid_out text;
alter table if exists public.orders add column if not exists c2p_value_coin numeric(18,6);
alter table if exists public.orders add column if not exists c2p_coin text;
alter table if exists public.orders add column if not exists c2p_callback_raw jsonb;
alter table if exists public.orders add column if not exists paid_at timestamptz;

create index if not exists orders_c2p_order_id_idx on public.orders (c2p_order_id);
create index if not exists orders_c2p_status_idx on public.orders (c2p_status);
