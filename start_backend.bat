@echo off
setlocal
echo [INFO] Starting Backend Server...

set "PROJECT_DIR=%~dp0backend"
if not exist "%PROJECT_DIR%" (
    echo [ERROR] Backend directory not found: %PROJECT_DIR%
    pause
    exit /b 1
)

cd /d "%PROJECT_DIR%"
echo [INFO] Current Directory: %cd%

echo [INFO] Running Clean and bootRun...
call gradlew.bat clean bootRun --info --stacktrace

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend failed to start.
    pause
)
endlocal
