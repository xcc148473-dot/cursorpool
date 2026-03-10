# Tavily local runbook

## Current state
- Local skill scaffold exists.
- Runtime/auth not configured yet.

## Required secret
- `TAVILY_API_KEY`

## Minimal validation once key exists
```powershell
$headers = @{ Authorization = "Bearer $env:TAVILY_API_KEY"; 'Content-Type' = 'application/json' }
$body = @{ query = 'OpenClaw' ; max_results = 3 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'https://api.tavily.com/search' -Headers $headers -Body $body
```
