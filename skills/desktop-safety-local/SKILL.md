---
name: desktop-safety-local
description: Apply safety boundaries to local computer automation. Use when designing or reviewing automations that control browsers, desktop apps, local files, accounts, clipboard contents, downloads, payments, or persistent scheduled tasks.
---

# Desktop Safety Local

Automation can act as the user. Treat that as high trust.

## Always classify the task

- **Low risk**: reading public pages, organizing files, local reports, opening apps
- **Medium risk**: logging into accounts, editing documents, uploading files, changing settings
- **High risk**: deleting data, sending messages/emails, payments, secrets, irreversible account changes

## Rules

1. Ask before destructive or irreversible actions.
2. Ask before sending messages, emails, or public posts.
3. Ask before payments or account security changes.
4. Explain the action plan briefly before high-impact workflows.
5. Prefer read-only inspection before write actions.
6. Avoid storing secrets in workspace files unless explicitly requested.

## Good pattern
- inspect
- summarize
- ask/confirm if needed
- execute
- report result

Read `references/checklist.md` before high-impact automation.
