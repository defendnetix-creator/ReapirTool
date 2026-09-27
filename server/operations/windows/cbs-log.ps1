[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
try {
    $logPath = Join-Path $env:SystemRoot 'Logs\CBS\CBS.log'
    # Bound the displayed excerpt; the original full log remains available at logPath.
    $lines = @(Get-Content -LiteralPath $logPath -Tail 200 -ErrorAction Stop)
    @{ logPath = $logPath; lines = $lines; excerpt = $true; maximumLines = 200 } | ConvertTo-Json -Depth 3 -Compress
} catch {
    Write-Error "CBS log could not be read: $($_.Exception.Message)" -ErrorAction Continue
    exit 1
}
