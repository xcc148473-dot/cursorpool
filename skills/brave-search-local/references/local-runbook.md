# Brave Search local runbook

## Current state
- Local skill scaffold exists.
- Runtime/auth not configured yet.

## Required secret
- Brave Search API key

## Minimal validation once key exists
```powershell
$headers = @{ 'X-Subscription-Token' = '<BRAVE_API_KEY>' }
Invoke-RestMethod -Uri 'https://api.search.brave.com/res/v1/web/search?q=OpenClaw' -Headers $headers
```
