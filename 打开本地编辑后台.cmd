@echo off
cd /d "%~dp0"
echo Starting local editor. The correct address will appear after startup.
echo Keep this window open while editing. Closing it stops the local editor.
call npm.cmd run editor -- --open
pause
