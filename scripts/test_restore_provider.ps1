# Test-only fixture. Shadow both Windows cmdlets so this cannot create a real checkpoint.
[CmdletBinding()]
param([ValidateSet('Success','Throttled','NoNewPoint')][string]$Scenario)
$global:fixtureCreated = $false
$global:fixtureScenario = $Scenario
function global:Get-ComputerRestorePoint {
    [CmdletBinding()]param()
    [PSCustomObject]@{ SequenceNumber = 100; Description = 'Test checkpoint'; CreationTime = '20260926120000.000000+000'; RestorePointType = 12; EventType = 100 }
    if ($global:fixtureCreated) {
        [PSCustomObject]@{ SequenceNumber = 101; Description = 'Test checkpoint'; CreationTime = '20260926120100.000000+000'; RestorePointType = 12; EventType = 100 }
    }
}
function global:Checkpoint-Computer {
    [CmdletBinding()]param([string]$Description, [string]$RestorePointType)
    if ($global:fixtureScenario -eq 'Throttled') { Write-Warning 'Checkpoint throttled by Windows.'; return }
    if ($global:fixtureScenario -eq 'Success') { $global:fixtureCreated = $true }
}
& (Join-Path $PSScriptRoot '..\server\operations\windows\restore-points.ps1') -Action Create -Description 'Test checkpoint'
exit $LASTEXITCODE
