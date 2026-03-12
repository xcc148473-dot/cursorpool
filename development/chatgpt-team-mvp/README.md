# ChatGPT Team MVP

Zero-dependency Node MVP for a **ChatGPT Business team shared seat** offer.

## Includes
- Landing page with English product wording
- Price shown as **$10**
- Simple checkout form
- Public order tracking using `orderNo + email`
- Customer ↔ admin message thread per order
- Admin dashboard to update payment + delivery status
- Payment webhook stub at `POST /api/webhooks/payment`

## Product wording used
> Shared seat in a ChatGPT Business team workspace. You use your own email/account and we add you to the active workspace after payment.

## Run
```bash
node server.js
```

Open: `http://127.0.0.1:3000`

## Admin
Default admin key in this MVP:
- `admin123`

Change it with environment variable:
```bash
set ADMIN_KEY=your-secret-key
node server.js
```

## Demo order
- Order: `ORD-DEMO-1001`
- Email: `demo@example.com`

## Main routes
- `/`
- `/checkout`
- `/track`
- `/admin`
- `POST /api/webhooks/payment`
- `GET /api/order?orderNo=...&email=...`

## Storage
Data is stored in:
- `data/db.json`

Good enough for an MVP demo, not enough for production.
