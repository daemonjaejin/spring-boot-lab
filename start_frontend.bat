@echo off
echo Starting frontend setup...
cd frontend
echo Skipping npm install (manual installation performed)...
rem call "C:\Program Files\nodejs\npm.cmd" install
echo Running npm run dev...
call "C:\Program Files\nodejs\npm.cmd" run dev
if %ERRORLEVEL% NEQ 0 (
    echo Npm failed with code %ERRORLEVEL%
    pause
)
