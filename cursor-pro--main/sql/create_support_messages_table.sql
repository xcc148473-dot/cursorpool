create table if not exists public.support_messages (
  id bigserial primary key,
  order_id text not null,
  email text not null,
  sender text not null default 'customer', -- customer | admin
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists support_messages_order_id_idx on public.support_messages (order_id);
create index if not exists support_messages_email_idx on public.support_messages (email);
