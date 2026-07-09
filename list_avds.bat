@echo off
if exist "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" (
  "%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe" -list-avds
) else (
  echo Android SDK emulator.exe not found in %LOCALAPPDATA%\Android\Sdk\emulator\
)
