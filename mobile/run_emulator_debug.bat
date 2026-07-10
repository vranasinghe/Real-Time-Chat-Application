@echo off
if exist "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" (
  "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -avd Pixel_7_Pro
) else (
  echo emulator.exe not found.
)
