@echo off
cd /d "%~dp0"
docker compose down
echo Site parado. Os dados do banco foram preservados.
pause
