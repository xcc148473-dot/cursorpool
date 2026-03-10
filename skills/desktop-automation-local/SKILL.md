---
name: desktop-automation-local
description: Plan and execute Windows desktop automation across browser tasks, shell commands, local files, and GUI workflows. Use when the user wants the agent to operate the computer like a human, automate repetitive desktop tasks, open apps, navigate sites, move data between programs, or decide which automation layer to use for a task.
---

# Desktop Automation Local

Treat desktop automation as a stack, not a single tool.

## Choose the right layer

1. **Browser layer**
   - Use OpenClaw browser relay for existing Chrome tabs.
   - Use `agent-browser` for browser automation workflows outside the relay.
   - Prefer this for websites, web apps, dashboards, uploads, and form entry.

2. **Shell/script layer**
   - Use PowerShell, CLI tools, and scripts for deterministic local tasks.
   - Prefer this for files, services, git, package installs, downloads, conversions, and batch jobs.

3. **Desktop GUI layer**
   - Use Windows GUI automation only when browser/shell cannot do the job.
   - Typical options: AutoHotkey v2, PowerShell UIAutomation, WinAppDriver, or Playwright/Electron-specific tooling.
   - Expect more fragility than browser/shell automation.

4. **Human confirmation layer**
   - Require explicit user confirmation before destructive, irreversible, or high-risk actions.
   - Use staged plans for workflows that could touch personal accounts, payments, or sensitive local data.

## Selection rule

- If a task can be done with browser relay, use browser relay.
- If a task can be done with shell commands, use shell commands.
- Use desktop GUI automation only as the fallback.

## Build workflows in this order

1. Write the target outcome.
2. Pick the lowest-fragility layer.
3. Identify required apps, paths, credentials, and side effects.
4. Dry-run on a harmless target if possible.
5. Record exact commands and constraints for reuse.

Read `references/stack.md` before designing a new automation flow.
Read `references/windows-gui-options.md` when the task truly needs non-browser GUI control.
Read `references/machine-state.md` for the current known-good setup on this machine.
