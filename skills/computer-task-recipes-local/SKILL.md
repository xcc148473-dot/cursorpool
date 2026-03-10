---
name: computer-task-recipes-local
description: Execute common local computer automation recipes such as browser-driven config, file moves, app launching, downloads, install flows, and cross-app handoffs. Use when the user asks for end-to-end practical computer tasks rather than abstract tool selection.
---

# Computer Task Recipes Local

When automating a real task, classify it into one of these recipe families:

## Recipe families

1. **Configure a website/service**
   - Use browser relay or `agent-browser`.
   - Capture the exact page, fields, and final success condition.

2. **Set up a local tool**
   - Use shell commands first.
   - Verify version, config path, and working state.

3. **Move data between tools**
   - Prefer export/import, files, or clipboard-safe intermediate steps.
   - Avoid manual retyping if structured data exists.

4. **Automate a desktop app**
   - Prefer shortcuts, menus, and app-native automation hooks.
   - Fall back to GUI automation only when needed.

5. **Repeatable routine**
   - Convert ad-hoc steps into script + notes + validation.

## Output structure
- Goal
- Chosen automation layer
- Exact steps
- Validation step
- Risks / confirmation points

Read `references/examples.md` for reusable patterns.
