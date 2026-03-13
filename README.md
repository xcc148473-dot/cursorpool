# chatgpt-team workspace

This repository contains the working codebase for the ChatGPT Team / GPTTeam project and related storefront tooling.

## Projects

### `chatgpt-team-frontend/`
Frontend storefront for the ChatGPT Team site.

Responsibilities:
- landing page
- checkout page
- order lookup page
- support message UI
- admin pages UI

### `chatgpt-team-backend/`
Business backend for storefront data and admin/support operations.

Responsibilities:
- order records
- support messages
- admin replies
- business APIs
- integration bridge to payment backend

### `cursor-pro--main/`
Cursor-related payment/delivery tool packaged into this workspace.

Key pieces:
- Vercel serverless API routes
- Chain2Pay checkout/callback flow
- order status polling
- support messaging endpoints
- admin fulfillment endpoints
- SQL setup/migration files

## Notes
- Local-only files such as `.env.local` are ignored.
- Editor/runtime metadata such as `.trae/` is ignored.
- Nested `.git/` directories from imported projects are ignored at the workspace repo level.

## Deployment
Each subproject keeps its own README for environment variables and deployment details.
