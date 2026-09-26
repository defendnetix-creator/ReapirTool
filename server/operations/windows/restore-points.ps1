[CmdletBinding()]
param(
    [ValidateSet('List','Create')][string]$Action = 'List',
    [ValidateLength(1,128)][string]$Description
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

function Read-Points {
    @(Get-ComputerRestorePoint -ErrorAction Stop | ForEach-Object {
        [PSCustomObject]@{
            sequenceNumber = [int]$_.SequenceNumber
            description = [string]$_.Description
            creationTime = [Management.ManagementDateTimeConverter]::ToDateTime($_.CreationTime).ToUniversalTime().ToString('o')
            restorePointType = [string]$_.RestorePointType
            eventType = [string]$_.EventType
        }
    } | Sort-Object sequenceNumber -Descending)
}

try {
    $before = @(Read-Points)
    if ($Action -eq 'List') {
        @{ restorePoints = $before } | ConvertTo-Json -Depth 5 -Compress
        exit 0
    }
    if ([string]::IsNullOrWhiteSpace($Description) -or $Description -match '[\x00-\x1f]') { throw 'A restore point description is required.' }
    # Respect Windows protection settings and checkpoint throttling. Do not rewrite
    # SystemRestorePointCreationFrequency, enable protection, or claim a skipped point exists.
    Checkpoint-Computer -Description $Description -RestorePointType MODIFY_SETTINGS -WarningAction Stop
    $after = @(Read-Points)
    $newPoint = $after | Where-Object { $_.sequenceNumber -notin @($before.sequenceNumber) -and $_.description -eq $Description } | Select-Object -First 1
    if (-not $newPoint) { throw 'Windows did not expose a newly created restore point. Check System Protection and checkpoint frequency limits.' }
    @{ restorePoint = $newPoint; restorePoints = $after; sequenceNumber = $newPoint.sequenceNumber; description = $newPoint.description } | ConvertTo-Json -Depth 5 -Compress
} catch {
    Write-Error "Restore point operation failed: $($_.Exception.Message)" -ErrorAction Continue
    exit 1
}
