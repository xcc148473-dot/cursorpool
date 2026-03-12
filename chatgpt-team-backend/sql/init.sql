create table if not exists public.team_products (
  id text primary key,
  title text not null,
  description text not null,
  price_usd numeric(10,2) not null,
  payment_plan_id text not null,
  payment_method text not null default 'fiat',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_orders (
  id bigserial primary key,
  order_id text unique not null,
  product_id text not null,
  customer_name text,
  email text not null,
  contact text,
  payment_plan_id text not null,
  payment_method text not null default 'fiat',
  amount_usd numeric(10,2) not null,
  status text not null default 'pending_payment',
  fulfillment_status text not null default 'pending',
  delivery_message text,
  payment_provider text,
  payment_url text,
  return_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists team_orders_order_id_idx on public.team_orders (order_id);
create index if not exists team_orders_email_idx on public.team_orders (email);

create table if not exists public.team_messages (
  id bigserial primary key,
  order_id text not null,
  email text not null,
  sender text not null default 'customer',
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists team_messages_order_id_idx on public.team_messages (order_id);
create index if not exists team_messages_email_idx on public.team_messages (email);

insert into public.team_products (id, title, description, price_usd, payment_plan_id, payment_method)
values (
  'gpt_team_30d',
  'ChatGPT Business Team Shared Seat',
  'Shared seat in a ChatGPT Business team workspace. You use your own email/account, and we add you to the active workspace after payment.',
  10,
  'gpt_team_30d',
  'fiat'
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price_usd = excluded.price_usd,
  payment_plan_id = excluded.payment_plan_id,
  payment_method = excluded.payment_method;
