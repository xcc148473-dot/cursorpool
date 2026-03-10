---
name: desktop-runner-local
description: Execute end-to-end local computer tasks by choosing and combining browser relay, agent-browser, shell commands, and Windows GUI fallback. Use when the user wants the agent to actually carry out a computer task rather than merely plan it.
---

# Desktop Runner Local

This skill turns automation plans into execution.

## Execution ladder

1. **Browser relay** for attached Chrome tabs
2. **`agent-browser`** for browser CLI tasks
3. **Shell/PowerShell** for local deterministic work
4. **AutoHotkey / GUI fallback** for native Windows UI-only tasks

## Runbook

1. Restate the concrete task goal.
2. Choose the lowest-fragility layer that can complete it.
3. Inspect current state first.
4. Execute in small checkpoints.
5. Validate success after each checkpoint.
6. If the chosen layer fails, step down the ladder only as needed.
7. Record reusable lessons in the relevant local file.

## Execution templates

### Browser-first task
- list tabs or inspect current page
- navigate/open target
- snapshot or read visible state
- act
- verify result

### Shell-first task
- check version/path/state
- run command
- inspect output
- retry with minimal changes
- verify end state

### GUI fallback task
- identify app/window title
- activate window
- target controls or shortcuts
- verify visible state change

Read `references/checkpoints.md` for checkpoint strategy.
Read `references/task-types.md` for layer selection.
