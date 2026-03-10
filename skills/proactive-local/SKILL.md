---
name: proactive-local
description: Run lightweight proactive assistant workflows locally using HEARTBEAT.md, memory notes, and cron/reminder patterns. Use when setting reminders, designing periodic checks, deciding between heartbeat and cron, or creating proactive routines without depending on third-party proactive-agent packages.
---

# Proactive Local

Use local primitives first: `HEARTBEAT.md`, workspace memory files, and `cron`.

## Pattern selection

- Use `cron` for exact reminders and one-shot timed notifications.
- Use `HEARTBEAT.md` for batched, low-urgency recurring checks.
- Use daily memory notes for state that should persist between sessions.

## Common tasks

### One-shot reminder
1. Create a cron reminder.
2. Make the reminder text read naturally when it fires.
3. Include enough context to be useful later.

### Periodic check workflow
1. Add a short checklist to `HEARTBEAT.md`.
2. Keep it brief and action-oriented.
3. Avoid duplicate or stale tasks.

### Proactive maintenance
- Review recent memory notes.
- Promote durable lessons into long-term docs when appropriate.
- Prefer small, low-noise interventions.

See `references/patterns.md` for recommended local patterns.
