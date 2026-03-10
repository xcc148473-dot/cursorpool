---
name: desktop-script-bank-local
description: Provide reusable local script templates for desktop automation on Windows, especially AutoHotkey-based helpers for launching apps, focusing windows, sending shortcuts, and handling file dialogs. Use when a task repeats often enough to justify storing a script template.
---

# Desktop Script Bank Local

Store small reusable templates instead of rewriting the same automation every time.

## Template categories

1. Launch app
2. Focus window
3. Send shortcut
4. Type text
5. Handle file dialog
6. Wait for window and verify

## Rules

- Keep scripts task-scoped.
- Parameterize obvious inputs like app path, window title, target file.
- Prefer readable scripts over clever ones.
- Add a short comment at the top describing purpose and assumptions.

Read `references/templates.md` to choose a template.
Read the actual files under `references/templates/` when creating a concrete script.
