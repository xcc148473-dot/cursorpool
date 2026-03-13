# cursorpool

A lightweight Vercel serverless tool for selling and delivering Cursor-related digital products.

## What it does
- create checkout links
- handle Chain2Pay payment callbacks
- poll order/payment status
- store order data in Supabase
- support customer messages
- provide admin fulfillment and reply endpoints

## Structure
- `api/` — serverless API routes
- `lib/` — payment, Supabase, fulfillment, mail, and utility helpers
- `public/` — static pages for buy / order status / query
- `sql/` — database setup and migration SQL
- `legacy/` — older compatibility flow kept for reference

## Deploy
Deploy this repository to Vercel.

### Required environment variables
- `CHAIN2PAY_MERCHANT_WALLET`
- `CHAIN2PAY_CALLBACK_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL`
- `ADMIN_SECRET`

Optional / compatibility:
- `CHAIN2PAY_PROVIDER`
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

## Main endpoints
- `POST /api/checkout`
- `GET /api/chain2pay-callback`
- `GET /api/check-order-status`
- `GET/POST /api/support`
- `POST /api/admin/fulfill`
- `GET /api/admin/orders`
- `POST /api/admin/support-reply`

## Database
For a fresh database, run:
- `sql/create_orders_table.sql`
- `sql/create_support_messages_table.sql`

For migration from an older setup, also review:
- `sql/migrate_to_chain2pay.sql`
- `sql/alter_orders_add_delivery_message.sql`

## Notes
This repository is intended to be shared as the standalone cursorpool tool, not as a mixed workspace dump.
