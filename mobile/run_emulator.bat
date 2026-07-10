@echo off
if exist "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" (
  echo Starting Android Emulator: Pixel_7_Pro...
  start "" "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_7_Pro
) else (
  echo Android SDK emulator.exe not found.
)
