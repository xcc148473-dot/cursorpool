---
name: code-development-local
description: Coordinate local code development workflows across repositories, files, Git/GitHub, docs, repo context, and coding agents on this Windows OpenClaw machine. Use when the user wants to develop code, inspect a repo, make changes safely, review implementation options, prepare commits/PRs, organize coding context, or choose between local dev skills such as github-local, byterover-local, filesystem-local, document-rag-local, mcp-client-local, agents-manager-local, and agent-builder-local.
---

# Code Development Local

Use this skill as the main entry point for software development work on this machine.

## Workflow
1. Identify the repo or project path.
2. Inspect local files and current git state before changing code.
3. Choose the narrowest useful tool path:
   - `filesystem-local` for file inspection/organization
   - `github-local` for repo/issue/PR/Actions work
   - `byterover-local` for durable repo context and coding continuity
   - `document-rag-local` for local docs/spec retrieval
   - `mcp-client-local` only when MCP adds clear value
   - `agents-manager-local` / `agent-builder-local` for multi-agent coding setups
4. Prefer local tools and workspace notes over risky third-party skills.
5. Summarize progress briefly and keep durable dev context in files.

## Local defaults
- Prefer existing local skills before third-party ClawHub installs.
- Treat suspicious/force-install third-party coding skills as opt-in only.
- Prefer `workspace/tools/gh/bin/gh.exe` for GitHub CLI work.
- If GitHub auth is missing, continue with local git/file work and note the auth gap.

## Read when needed
- GitHub workflows: `references/github-workflows.md`
- Repo execution checklist: `references/repo-checklist.md`
