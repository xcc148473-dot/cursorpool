# AutoHotkey patterns

## Preferred structure
1. `#Requires AutoHotkey v2.0`
2. activate target window
3. wait for active state
4. focus target control if available
5. send text / click control
6. verify expected state

## Prefer
- `WinExist`
- `WinActivate`
- `WinWaitActive`
- `ControlFocus`
- `ControlSetText`
- `ControlClick`
- `SendText`

## Avoid when possible
- hardcoded coordinates
- long blind sleeps
- assumptions about foreground focus surviving interruptions
