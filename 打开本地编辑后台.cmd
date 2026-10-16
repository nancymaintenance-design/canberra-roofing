@echo off
cd /d "%~dp0"
echo Local website editor: http://127.0.0.1:4198/__editor/
echo Keep this window open while editing. Closing it stops the local editor.
call npm run editor
pause
