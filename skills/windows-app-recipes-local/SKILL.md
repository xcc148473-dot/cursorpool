---
name: windows-app-recipes-local
description: Use reusable recipes for automating common Windows desktop app tasks such as opening apps, switching windows, saving/exporting files, handling dialogs, and driving app shortcuts. Use when the user asks for practical desktop-app automation rather than generic GUI guidance.
---

# Windows App Recipes Local

Use recipe-style execution for native Windows apps.

## Recipe families

1. **Launch and focus an app**
   - Start the app via shell, Run dialog, shortcut, or executable path.
   - Confirm the target window is active.

2. **Navigate menus or shortcuts**
   - Prefer documented keyboard shortcuts.
   - Prefer app commands over raw clicking.

3. **Open / Save / Export**
   - Trigger the action.
   - Detect the native dialog.
   - Use the file-dialog workflow.

4. **Clipboard handoff**
   - Use clipboard only when there is no cleaner structured path.
   - Avoid leaving sensitive content in clipboard longer than needed.

5. **Repeatable task**
   - Convert the recipe into a task-specific AHK script if it repeats.

## Execution rule

- Prefer shell launch + shortcut navigation.
- Prefer deterministic window targeting.
- Fall back to mouse only when keyboard/control targeting is unavailable.

Read `references/recipes.md` before automating a Windows desktop app.
