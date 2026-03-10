# AutoHotkey patterns

## Prefer
- WinActivate
- WinWaitActive
- ControlFocus
- ControlSetText
- ControlClick
- Send / SendText

## Avoid when possible
- fixed screen coordinates
- brittle sleep-only timing
- assumptions about monitor layout

## Script shape
1. activate target window
2. wait for readiness
3. focus target control
4. send/click deterministically
5. verify expected state
