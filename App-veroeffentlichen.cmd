@echo off
setlocal
cd /d "%~dp0"
title Dreambuild veroeffentlichen

set "GH=%ProgramFiles%\GitHub CLI\gh.exe"
if not exist "%GH%" set "GH=gh"
set "REPO=dreambuild"

echo.
echo ==================================================
echo    Dreambuild  -  veroeffentlichen
echo ==================================================
echo.

"%GH%" --version >nul 2>&1
if errorlevel 1 goto :installiere
goto :anmelden

:installiere
echo GitHub CLI fehlt. Wird installiert...
winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements --silent
set "GH=%ProgramFiles%\GitHub CLI\gh.exe"
if not exist "%GH%" goto :fehler_gh

:anmelden
"%GH%" auth status >nul 2>&1
if not errorlevel 1 goto :angemeldet
echo.
echo   EINMALIGE ANMELDUNG BEI GITHUB
echo   ------------------------------
echo   Gleich erscheint ein 8-stelliger Code.
echo   Code merken, ENTER druecken, Browser oeffnet sich,
echo   Code einfuegen, bestaetigen. Fertig.
echo.
pause
"%GH%" auth login --web --git-protocol https
if errorlevel 1 goto :fehler_login

:angemeldet
for /f "delims=" %%u in ('"%GH%" api user --jq .login 2^>nul') do set "GHUSER=%%u"
if "%GHUSER%"=="" goto :fehler_login
echo Angemeldet als: %GHUSER%
echo.

git rev-parse --git-dir >nul 2>&1
if errorlevel 1 git init -q
git config user.name  >nul 2>&1 || git config user.name "%GHUSER%"
git config user.email >nul 2>&1 || git config user.email "%GHUSER%@users.noreply.github.com"
rem Jede Veroeffentlichung bekommt einen neuen Cache-Namen. Ohne das aendert sich
rem das Worker-Skript nicht, der Browser sieht keine neue Fassung, und die App
rem bliebe auf der alten haengen.
for /f "delims=" %%v in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmm"') do set "STAMP=%%v"
powershell -NoProfile -Command "(Get-Content -Raw 'mtb-sw.js') -replace \"var CACHE = '[^']*'\", \"var CACHE = 'dreambuild-%STAMP%'\" | Set-Content -NoNewline -Encoding UTF8 'mtb-sw.js'"
powershell -NoProfile -Command "(Get-Content -Raw -Encoding UTF8 'index.html') -replace \"const APP_VERSION = '[^']*'\", \"const APP_VERSION = '%STAMP%'\" | Set-Content -NoNewline -Encoding UTF8 'index.html'"
echo Version: %STAMP%

git add -A
git diff --cached --quiet
if not errorlevel 1 goto :kein_commit
git commit -q -m "App aktualisiert"
:kein_commit
git branch -M main

"%GH%" repo view %GHUSER%/%REPO% >nul 2>&1
if not errorlevel 1 goto :vorhanden
echo Lege Repo %REPO% an und lade hoch...
"%GH%" repo create %REPO% --public --source=. --remote=origin --push
if errorlevel 1 goto :fehler_push
goto :pages

:vorhanden
echo Repo vorhanden. Lade Aenderungen hoch...
git remote get-url origin >nul 2>&1 || git remote add origin https://github.com/%GHUSER%/%REPO%.git
git push -u origin main
if errorlevel 1 goto :fehler_push

:pages
echo Schalte GitHub Pages ein...
"%GH%" api -X POST repos/%GHUSER%/%REPO%/pages -f "source[branch]=main" -f "source[path]=/" >nul 2>&1

echo.
echo ==================================================
echo    FERTIG. Deine App liegt unter:
echo.
echo    https://%GHUSER%.github.io/%REPO%/
echo.
echo    Der erste Aufbau dauert 1-2 Minuten.
echo    Auf dem iPhone in SAFARI oeffnen,
echo    dann Teilen -^> Zum Home-Bildschirm.
echo ==================================================
echo.
start "" "https://%GHUSER%.github.io/%REPO%/"
pause
exit /b 0

:fehler_gh
echo.
echo FEHLER: GitHub CLI liess sich nicht installieren.
pause
exit /b 1

:fehler_login
echo.
echo FEHLER: Anmeldung nicht abgeschlossen. Skript nochmal starten.
pause
exit /b 1

:fehler_push
echo.
echo FEHLER: Hochladen fehlgeschlagen. Meldung oben lesen.
pause
exit /b 1
