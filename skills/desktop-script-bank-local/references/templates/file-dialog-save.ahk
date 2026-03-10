#Requires AutoHotkey v2.0
; Purpose: fill a native Save dialog with a full output path.
dialogTitle := "Save As"
filePath := "C:\\Path\\To\\output.txt"
if !WinWait(dialogTitle, , 10)
    throw Error("Save dialog not found")
WinActivate dialogTitle
WinWaitActive dialogTitle, , 5
Send "!n"
Sleep 200
SendText filePath
Sleep 200
Send "{Enter}"
