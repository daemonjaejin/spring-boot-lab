$jobs = 1..5 | % {Start-Job -ScriptBlock { Invoke-RestMethod -Uri "http://localhost:8080/api/async/test" }}
Wait-Job $jobs | Out-Null
$results = Receive-Job $jobs
$results | Select-Object threadName, timestamp, message | Format-Table -AutoSize
