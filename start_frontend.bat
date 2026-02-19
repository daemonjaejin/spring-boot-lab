@echo off
echo Starting frontend setup... > c:\developer\workspace\test\20260213\frontend_run_v2.log
cd frontend
echo Running npm install... >> c:\developer\workspace\test\20260213\frontend_run_v2.log
call "C:\Program Files\nodejs\npm.cmd" install >> c:\developer\workspace\test\20260213\frontend_run_v2.log 2>&1
echo Running npm run dev... >> c:\developer\workspace\test\20260213\frontend_run_v2.log
call "C:\Program Files\nodejs\npm.cmd" run dev >> c:\developer\workspace\test\20260213\frontend_run_v2.log 2>&1
if %ERRORLEVEL% NEQ 0 echo Npm failed with code %ERRORLEVEL% >> c:\developer\workspace\test\20260213\frontend_run_v2.log
