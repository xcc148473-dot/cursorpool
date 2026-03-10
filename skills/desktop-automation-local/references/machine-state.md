# Machine state for desktop automation

## Confirmed working now
- OpenClaw browser relay is working with profile `chrome`
- Attached Chrome tab listing works through `openclaw browser --browser-profile chrome tabs`
- `agent-browser` CLI is installed globally
- `agent-browser` version verified: `0.17.1`
- `agent-browser install --with-deps` completed successfully
- Minimal smoke test passed:
  - open https://example.com
  - get title
  - get url
  - snapshot -i

## Known caveats
- PowerShell execution policy may block `.ps1` shims; prefer `.cmd` wrappers when needed
- Third-party ClawHub browser skills may be flagged suspicious even when the upstream CLI is legitimate; review before force-installing
- Browser relay control can act as the logged-in user in attached tabs

## Recommended operating model
- Browser tasks: use browser relay first
- Browser CLI tasks: use `agent-browser.cmd`
- File/system tasks: use PowerShell/CLI
- Native GUI-only tasks: design AutoHotkey fallback if needed
