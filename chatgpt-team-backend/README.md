# chatgpt-team-backend

Business backend for the ChatGPT Team site.

## Responsibility
- customer support messages
- admin replies
- business order records
- payment backend integration bridge
- admin order dashboard APIs

## Does NOT own
- payment gateway checkout/callback implementation
- public frontend pages

## API
- POST /api/orders/create
- GET /api/orders/status
- GET /api/support
- POST /api/support
- GET /api/admin/orders
- POST /api/admin/support-reply
- POST /api/admin/mark-delivered

## Storage
This backend now uses Supabase tables:
- `team_products`
- `team_orders`
- `team_messages`

Run SQL:
- `sql/init.sql`

## Multi-site payment note
This backend now forwards `FRONTEND_SITE_URL` to the payment backend as `site_url`, so one shared payment backend can generate the correct success/cancel URLs for different storefronts.
"# chat-team" 
