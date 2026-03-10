# AutoHotkey examples

## Open Run dialog and launch app
- `Send "#r"`
- wait for Run window
- `SendText "notepad"`
- `Send "{Enter}"`

## File dialog
- activate dialog window
- focus edit field if available
- set target path
- confirm with Enter

## App shortcut flow
- activate target app
- wait active
- send known keyboard shortcut
- verify resulting window or dialog
