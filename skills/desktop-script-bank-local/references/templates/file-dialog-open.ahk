#Requires AutoHotkey v2.0
; Purpose: fill a native Open dialog with a full file path.
dialogTitle := "Open"
filePath := "C:\\Path\\To\\input.txt"
if !WinWait(dialogTitle, , 10)
    throw Error("Open dialog not found")
WinActivate dialogTitle
WinWaitActive dialogTitle, , 5
Send "!n"
Sleep 200
SendText filePath
Sleep 200
Send "{Enter}"
