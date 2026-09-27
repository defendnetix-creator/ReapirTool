param(
    [ValidateSet('SoftwareDistribution','Catroot2')][string]$Action,
    [ValidateSet('Success','RenameFailure','RestartFailure','Reparse','Missing')][string]$Scenario
)
$ErrorActionPreference = 'Stop'
$global:cacheScenario = $Scenario
$global:cacheCalls = [Collections.Generic.List[string]]::new()
$global:cacheServices = @{}
foreach ($name in @('wuauserv','bits','cryptSvc')) {
    $service = [PSCustomObject]@{ Name = $name; Status = 'Running'; DependentServices = @() }
    $service | Add-Member ScriptMethod WaitForStatus { param($expected, $timeout) if ($this.Status -ne $expected) { throw 'Fixture status mismatch.' } }
    $global:cacheServices[$name] = $service
}
$global:cacheServices['bits'].Status = 'Stopped'
function global:Get-Service {
    [CmdletBinding()]param([string]$Name)
    if (-not $global:cacheServices.ContainsKey($Name)) { throw 'Fixture forbids other services.' }
    $global:cacheServices[$Name]
}
function global:Stop-Service {
    [CmdletBinding()]param($InputObject)
    $global:cacheCalls.Add("Stop:$($InputObject.Name)")
    $InputObject.Status = 'Stopped'
}
function global:Start-Service {
    [CmdletBinding()]param($InputObject)
    $global:cacheCalls.Add("Start:$($InputObject.Name)")
    if ($global:cacheScenario -eq 'RestartFailure') { throw 'Injected restart failure.' }
    $InputObject.Status = 'Running'
}
function global:Rename-Item {
    [CmdletBinding()]param([string]$LiteralPath, [string]$NewName)
    if ($global:cacheScenario -eq 'RenameFailure') { throw 'Injected locked directory.' }
    Microsoft.PowerShell.Management\Rename-Item -LiteralPath $LiteralPath -NewName $NewName -ErrorAction Stop
}
function global:Get-Item {
    [CmdletBinding()]param([string]$LiteralPath, [switch]$Force)
    if ($global:cacheScenario -eq 'Reparse') {
        return [PSCustomObject]@{ PSIsContainer = $true; Attributes = [IO.FileAttributes]::ReparsePoint; Parent = $null }
    }
    Microsoft.PowerShell.Management\Get-Item -LiteralPath $LiteralPath -Force -ErrorAction Stop
}
$testParent = [IO.Path]::GetFullPath([IO.Path]::GetTempPath())
$fixtureRoot = Join-Path $testParent ('akshigo-cache-fixture-' + [Guid]::NewGuid().ToString('N'))
$previousRoot = $env:SystemRoot
try {
    $cachePath = if ($Action -eq 'SoftwareDistribution') { Join-Path $fixtureRoot 'SoftwareDistribution' } else { Join-Path $fixtureRoot 'System32\catroot2' }
    [IO.Directory]::CreateDirectory($cachePath) | Out-Null
    if ($Scenario -eq 'Missing') { [IO.Directory]::Delete($cachePath) }
    else { [IO.File]::WriteAllText((Join-Path $cachePath 'fixture.txt'), 'fixture bytes must survive') }
    # Child process only: provider paths resolve into this private temporary fixture.
    $env:SystemRoot = $fixtureRoot
    $global:LASTEXITCODE = 0
    $output = & (Join-Path $PSScriptRoot '..\server\operations\windows\update-cache.ps1') -Action $Action
    $providerExitCode = $LASTEXITCODE
    $data = $output | ConvertFrom-Json
    $preserved = if ($data.cacheRenamed) { [IO.File]::ReadAllText((Join-Path $data.backupPath 'fixture.txt')) } elseif ($Scenario -ne 'Missing') { [IO.File]::ReadAllText((Join-Path $cachePath 'fixture.txt')) } else { $null }
    $states = @{}
    foreach ($name in $global:cacheServices.Keys) { $states[$name] = $global:cacheServices[$name].Status }
    @{ providerExitCode = $providerExitCode; result = $data; preserved = $preserved; calls = @($global:cacheCalls.ToArray()); states = $states } | ConvertTo-Json -Depth 8 -Compress
} finally {
    $env:SystemRoot = $previousRoot
    # Exact generated fixture only, verified to remain beneath the temporary directory.
    $resolved = [IO.Path]::GetFullPath($fixtureRoot)
    if ([IO.Path]::GetDirectoryName($resolved).TrimEnd('\') -ne $testParent.TrimEnd('\') -or [IO.Path]::GetFileName($resolved) -notmatch '^akshigo-cache-fixture-[a-f0-9]{32}$') { throw 'Unsafe fixture cleanup path.' }
    if ([IO.Directory]::Exists($resolved)) { [IO.Directory]::Delete($resolved, $true) }
}
exit 0
