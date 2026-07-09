@echo off
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
  "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" devices
) else (
  echo adb.exe not found.
)
