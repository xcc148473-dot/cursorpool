---
name: autohotkey-local
description: Use AutoHotkey v2 as the primary fallback for Windows desktop GUI automation when browser relay and shell commands are insufficient. Use when automating native Windows apps, dialogs, shortcuts, repetitive keyboard/mouse actions, or simple window/control manipulation on this machine.
---

# AutoHotkey Local

Use AutoHotkey v2 as the default Windows GUI fallback.

## When to use

Use this skill when the task requires:
- interacting with native Windows applications
- handling file picker or save dialogs
- sending shortcuts to desktop apps
- activating windows and typing into them
- lightweight repetitive GUI tasks

Do not use AHK first if the task can be done via browser relay, `agent-browser`, or shell commands.

## Workflow

1. Check whether AutoHotkey v2 is installed.
2. If missing, install or document the missing dependency.
3. Create small task-specific scripts instead of giant general scripts.
4. Prefer:
   - `WinActivate`
   - `WinWaitActive`
   - `ControlFocus`
   - `ControlSetText`
   - `ControlClick`
   - `SendText`
5. Verify the app reached the intended state.
6. Save reusable scripts under `references/` or a future `scripts/` folder when a workflow repeats.

## Rules

- Prefer window/control targeting over screen coordinates.
- Prefer deterministic shortcuts over image matching.
- Add explicit waits for app readiness.
- Keep scripts short and explain assumptions.
- Treat destructive desktop actions as confirmation-worthy.

Read `references/install.md` before first-time setup.
Read `references/patterns.md` when drafting a script.
Read `references/examples.md` for common Windows automation examples.
