# Local Whisper runbook

## Current machine toolchain
- Python: `workspace/tools/python/python.exe`
- FFmpeg: `workspace/tools/ffmpeg/ffmpeg-8.0.1-essentials_build/bin/ffmpeg.exe`

## Next practical step
Install a Whisper-compatible package into the portable Python environment, then validate on a short local audio/video file.

## Suggested commands
```powershell
& 'C:\Users\Administrator\.openclaw\workspace\tools\python\python.exe' -m pip install openai-whisper
$env:PATH = "C:\Users\Administrator\.openclaw\workspace\tools\ffmpeg\ffmpeg-8.0.1-essentials_build\bin;" + $env:PATH
& 'C:\Users\Administrator\.openclaw\workspace\tools\python\python.exe' -m whisper <input-file> --model small
```

## Notes
- Model download happens on first use.
- FFmpeg must be on PATH for media decoding.
- Prefer testing on a short file first.
