---
name: file-dialog-local
description: Handle Windows native file picker, open, save, and upload dialogs as part of desktop or browser automation. Use when an automation flow reaches a file chooser, save dialog, import/export picker, or attachment window on Windows.
---

# File Dialog Local

Use a dedicated workflow for Windows file dialogs.

## Preferred approach

1. Detect the dialog window.
2. Target the filename/path field if available.
3. Enter the full path directly.
4. Confirm with Enter or the primary action button.
5. Verify the app/browser reflects the chosen file.

## Prefer
- full absolute paths
- control focus / control text set
- deterministic dialog titles when available

## Avoid when possible
- manually browsing deep folder trees
- coordinate clicks inside the dialog
- assuming dialog focus without verification

## Common cases
- browser upload dialogs
- Save As dialogs
- Open dialogs
- Import/export pickers

Read `references/patterns.md` for common dialog strategies.
