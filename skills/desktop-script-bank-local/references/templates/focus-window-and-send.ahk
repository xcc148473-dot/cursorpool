#Requires AutoHotkey v2.0
; Purpose: focus a target window and send a shortcut.
windowTitle := "Target Window"
shortcut := "^s"
if !WinExist(windowTitle)
    throw Error("Window not found: " windowTitle)
WinActivate windowTitle
WinWaitActive windowTitle, , 5
Send shortcut
