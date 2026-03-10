---
name: skill-vetter-local
description: Review third-party OpenClaw/Agent skills for safety before installing or trusting them. Use when evaluating a skill from ClawHub, GitHub, or a pasted SKILL.md, especially if it requests external APIs, shell commands, browser automation, auth tokens, cron jobs, or force-install bypasses.
---

# Skill Vetter Local

Vet a skill before recommending installation.

## Review checklist

1. Identify source
   - built-in OpenClaw skill
   - ClawHub third-party skill
   - GitHub/manual source
   - pasted local skill
2. Check trust signals
   - owner/author
   - version history / update recency
   - clear summary and scope
   - known license if available
3. Check risk signals
   - asks for `--force`
   - browser automation or remote control
   - shell commands with downloads/execution
   - exfiltration risk (webhooks, uploads, messaging)
   - broad auth/API requirements
   - self-modifying or auto-install behavior
4. Classify risk
   - Low: mostly documentation/workflow
   - Medium: external APIs, automation, scheduled actions
   - High: force-install, browser control, remote execution, unclear source
5. Give a practical recommendation
   - install as-is
   - install only after manual review
   - rebuild locally instead
   - avoid

## Current known note

- `agent-browser` should be treated as high-risk here because registry checks flagged it as suspicious and installation required force confirmation.

For reusable local guidance, read `references/checklist.md`.
