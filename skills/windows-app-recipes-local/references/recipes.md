# Windows app recipe patterns

## Launch app
- use executable path, Start-Process, or known shortcut
- wait for main window
- verify title/process

## Save / export
- trigger Ctrl+S / Ctrl+Shift+S / app menu equivalent
- switch to file dialog handling
- set path and confirm
- verify file exists

## Open file
- trigger Ctrl+O or import flow
- switch to file dialog handling
- select path
- verify app state changed

## Shortcut-first navigation
- prefer Ctrl/Alt menu shortcuts
- only click menus if shortcuts are unavailable
