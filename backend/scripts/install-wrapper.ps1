Param()

$ErrorActionPreference = 'Stop'
$base = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$targetDir = Join-Path $base "..\gradle\wrapper"
if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }

$jarUrl = 'https://raw.githubusercontent.com/gradle/gradle/v8.4.0/gradle/wrapper/gradle-wrapper.jar'
$jarPath = Join-Path $targetDir 'gradle-wrapper.jar'

Write-Host "Downloading gradle-wrapper.jar from $jarUrl to $jarPath"
Invoke-WebRequest -Uri $jarUrl -OutFile $jarPath -UseBasicParsing
Write-Host "Downloaded gradle-wrapper.jar"

Write-Host "You can now run .\gradlew.bat bootRun (Windows) or ./gradlew bootRun (UNIX) in the backend folder."
