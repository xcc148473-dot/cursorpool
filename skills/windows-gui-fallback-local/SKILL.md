---
name: windows-gui-fallback-local
description: Design fallback automation for Windows desktop applications when browser relay and shell commands are not enough. Use when the task requires clicking native app windows, typing into desktop apps, handling dialogs, or automating GUI-only workflows on Windows.
---

# Windows GUI Fallback Local

Use this only when browser/shell approaches are insufficient.

## Preferred fallback path

1. Check whether the app has a CLI, URL scheme, COM API, or import/export feature.
2. If not, prefer accessibility-based automation.
3. If accessibility is weak, use AutoHotkey v2.
4. Use coordinates or image matching only as last resort.

## For AutoHotkey-based automations

- Prefer targeting windows by title/class/process.
- Prefer controls and shortcuts over raw mouse coordinates.
- Add waits for app readiness.
- Keep scripts small and task-specific.
- Store reusable scripts under a future `scripts/` directory if needed.

## Use cases
- file picker dialogs
- save/open confirmations
- legacy Windows applications
- installer dialogs
- apps with no browser/API surface

Read `references/ahk-patterns.md` when drafting an AutoHotkey approach.
