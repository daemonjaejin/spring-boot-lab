@echo off
echo Starting backend setup... > c:\developer\workspace\test\20260213\backend_run_v3.log
cd backend
echo Running gradlew... >> c:\developer\workspace\test\20260213\backend_run_v3.log
call gradlew.bat bootRun >> c:\developer\workspace\test\20260213\backend_run_v3.log 2>&1
if %ERRORLEVEL% NEQ 0 echo Gradlew failed with code %ERRORLEVEL% >> c:\developer\workspace\test\20260213\backend_run_v3.log
