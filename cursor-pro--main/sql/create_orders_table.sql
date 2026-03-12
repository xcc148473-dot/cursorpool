-- file: sql/create_orders_table.sql
create table if not exists public.orders (
  id bigserial primary key,
  order_id text unique not null,
  email text not null,
  plan text not null,
  price_amount numeric(10,2) not null,
  price_currency text not null default 'usd',
  np_invoice_id text,
  np_payment_id text,
  np_status text, -- NOWPayments status (legacy compatibility)

  -- Chain2Pay fields
  c2p_order_id text,
  c2p_ipn_token text,
  c2p_payment_url text,
  c2p_provider text,
  c2p_status text, -- unpaid | paid
  c2p_txid_out text,
  c2p_value_coin numeric(18,6),
  c2p_coin text,
  c2p_callback_raw jsonb,
  paid_at timestamptz,

  license_key text,
  delivery_message text,
  key_expires_at timestamptz,
  is_delivered boolean not null default false,
  
  -- New columns for fulfillment state machine
  delivery_status text default 'pending', -- pending, purchasing, delivered, failed, system_error
  retry_count integer default 0,
  delivery_info jsonb, -- Stores vendor order ID, error messages, timestamps
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_order_id_idx on public.orders (order_id);
create index if not exists orders_email_idx on public.orders (email);

-- 可选：自动更新 updated_at 的触发器
-- create or replace function public.set_current_timestamp_updated_at()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

-- create trigger set_timestamp
-- before update on public.orders
-- for each row
-- execute procedure public.set_current_timestamp_updated_at();


