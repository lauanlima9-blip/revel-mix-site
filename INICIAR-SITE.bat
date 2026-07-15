@echo off
cd /d "%~dp0"
echo Iniciando Revel Mix com Docker...
docker compose up --build -d
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar. Veja o erro acima e confirme que o Docker Desktop esta aberto.
  pause
  exit /b 1
)

echo.
echo Aguardando o site ficar pronto...
set /a tentativas=0
:aguardar
set /a tentativas+=1
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 http://localhost:3000; if ($r.StatusCode -ge 200) { exit 0 } } catch {}; exit 1" >nul 2>&1
if not errorlevel 1 goto pronto
if %tentativas% GEQ 60 goto demorou
timeout /t 3 /nobreak >nul
goto aguardar

:pronto
echo.
echo Site iniciado com sucesso.
echo Site: http://localhost:3000
echo Painel: http://localhost:3000/admin
echo API: http://localhost:4000/api/health
echo.
echo Login: admin@revelmix.com.br
echo Senha: TroqueEstaSenha123!
start http://localhost:3000
pause
exit /b 0

:demorou
echo.
echo Os containers foram iniciados, mas o site ainda nao respondeu.
echo Execute: docker compose logs --tail=100
pause
