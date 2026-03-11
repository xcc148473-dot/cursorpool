# GitHub workflows

## Current machine state
- Portable GitHub CLI path: `C:\Users\Administrator\.openclaw\workspace\tools\gh\bin\gh.exe`
- GitHub auth may still be incomplete on this machine.

## Preferred sequence
1. Check local git status first.
2. Use portable `gh.exe` for GitHub-specific operations when auth exists.
3. If auth is missing, do local repo prep first and stop at the GitHub boundary.

## Common commands
```powershell
& 'C:\Users\Administrator\.openclaw\workspace\tools\gh\bin\gh.exe' repo view
& 'C:\Users\Administrator\.openclaw\workspace\tools\gh\bin\gh.exe' issue list
& 'C:\Users\Administrator\.openclaw\workspace\tools\gh\bin\gh.exe' pr list
& 'C:\Users\Administrator\.openclaw\workspace\tools\gh\bin\gh.exe' run list
```

## Safe guidance
- Avoid force-installing third-party GitHub skills unless explicitly approved.
- Prefer local `github-local` plus direct CLI over extra abstraction layers when possible.
