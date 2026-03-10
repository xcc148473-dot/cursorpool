# Desktop automation stack

## Stable
- OpenClaw browser relay for attached Chrome tabs
- `agent-browser` CLI for browser automation
- PowerShell and CLI tools for file/system tasks

## Medium fragility
- App-specific CLIs
- Web UIs with dynamic selectors
- Electron apps with inspectable DOM

## High fragility
- Raw desktop GUI clicking
- OCR/image-based targeting
- Window focus dependent macros
- Coordinate-based automation

## Rule
Prefer semantic selectors and APIs over image matching or screen coordinates.
