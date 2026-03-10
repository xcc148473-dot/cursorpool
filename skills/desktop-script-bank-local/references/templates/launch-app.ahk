#Requires AutoHotkey v2.0
; Purpose: launch an app and wait for its main window.
appPath := "C:\\Path\\To\\App.exe"
windowTitle := "App Title"
Run appPath
if !WinWait(windowTitle, , 10)
    throw Error("Window did not appear: " windowTitle)
WinActivate windowTitle
WinWaitActive windowTitle, , 5
