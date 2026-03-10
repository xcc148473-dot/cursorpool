---
name: api-gateway-local
description: Plan and use multi-service API gateway style integrations when the user needs OAuth-backed access to external SaaS tools such as Google Workspace, Microsoft 365, GitHub, Slack, Airtable, or HubSpot. Use when evaluating or preparing API gateway style connectivity on this machine.
---

# API Gateway Local

Treat API gateway integrations as auth-heavy setup work.

## Workflow
1. Identify the target SaaS.
2. Check whether a direct CLI/integration already exists locally.
3. Prefer direct first-party integrations when available.
4. If a gateway approach is required, document required OAuth scopes, tokens, and callback flow.

Read `references/services.md`.
