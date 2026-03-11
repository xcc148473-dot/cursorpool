# Dev Skills Plan

## Goal
Make OpenClaw strong at code/repo/dev-agent workflows without blindly installing a huge number of third-party skills.

## Current approach
1. Keep the existing local development-oriented skills active.
2. Add missing runtimes/CLIs that unlock those skills.
3. Use ClawHub only for selective, vetted installs.
4. Capture stable setup notes in this folder.

## Candidate external areas from awesome-openclaw-skills
- Coding Agents & IDEs
- Git & GitHub
- AI & LLMs
- Web & Frontend Development
- DevOps & Cloud

## Selection rule
Install only when a skill offers clear value beyond the current local stack and has understandable source/risk.

## Current findings
- Added `code-development-local` as a new local skill to unify repo/code/dev workflows.
- `clawhub` CLI is now installed and usable.
- Attempted third-party install of `github-cli`, but ClawHub flagged it as suspicious and blocked non-interactive install without `--force`.
- Reviewed `read-github`: useful repo-reading workflow via external `gitmcp.io` + `npx mcp-remote`, but it also gets flagged as suspicious and is blocked without `--force`.
- Reviewed `github-mcp`: powerful GitHub automation via MCP plus `GITHUB_PERSONAL_ACCESS_TOKEN`, but it is also flagged as suspicious and blocked without `--force`.
- Current safe default remains: prefer the existing local development skills unless a third-party skill is reviewed and clearly worth it.
