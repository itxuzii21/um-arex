@echo off
title UM-Arex Admin Panel
color 0A

echo.
echo  ==========================================
echo    UM-Arex Admin Panel
echo  ==========================================
echo.
echo  Starting admin server...
echo  Browser will open automatically.
echo.
echo  When done: press Ctrl+C to stop.
echo  Deploy:    drag the  out\  folder to Netlify
echo.
echo  ==========================================
echo.

cd /d "%~dp0"
node admin-server.js

echo.
echo  Server stopped.
pause
