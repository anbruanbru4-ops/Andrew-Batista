@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel% equ 0 (
  node preview-local.mjs
) else (
  if exist "C:\Program Files\nodejs\node.exe" (
    "C:\Program Files\nodejs\node.exe" preview-local.mjs
  ) else (
    echo No se encuentra Node.js. Instale Node.js LTS desde https://nodejs.org
  )
)
pause
