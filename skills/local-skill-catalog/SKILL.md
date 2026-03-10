---
name: local-skill-catalog
description: Discover, review, and map useful OpenClaw/ClawHub skills when the user asks for a skill for some task, wants to know what skills to install, or needs a local replacement for unavailable third-party skills. Use when browsing skill options, comparing skill roles, or deciding what to install versus rebuild locally.
---

# Local Skill Catalog

When asked to find or compare skills:

1. Check built-in skills first in the local OpenClaw install.
2. If ClawHub metadata is reachable, use it to gather slug, summary, owner, version, and notable requirements.
3. If a third-party skill cannot be installed, propose either:
   - a local replacement skill in `workspace/skills/`
   - a direct manual workflow without a skill
4. Prefer a short recommendation list with:
   - skill name
   - what it is good for
   - required API keys/auth
   - risk notes
   - whether it is built-in, third-party, or local replacement

Current locally tracked replacements and notes live in `references/catalog.md`.
Read that file when presenting options or explaining the current setup.
