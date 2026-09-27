param([ValidateSet('Success','StopFailure','StartFailure','RecoveryFailure','Disabled','Dependent','Pending')][string]$Scenario)
$ErrorActionPreference = 'Stop'
$global:fixtureScenario = $Scenario
$global:fixtureCalls = [Collections.Generic.List[string]]::new()
$global:fixtureServices = @{}
$global:fixtureFailed = $false
foreach ($name in @('wuauserv','cryptSvc','bits','msiserver')) {
    $service = [PSCustomObject]@{ Name = $name; Status = 'Running'; StartType = 'Manual'; DependentServices = @() }
    $service | Add-Member -MemberType ScriptMethod -Name Refresh -Value { }
    $service | Add-Member -MemberType ScriptMethod -Name WaitForStatus -Value {
        param($expected, $timeout)
        if ($this.Status -ne $expected) { throw 'Fixture service did not reach expected state.' }
    }
    $global:fixtureServices[$name] = $service
}
$global:fixtureServices['msiserver'].Status = 'Stopped'
if ($Scenario -eq 'Disabled') { $global:fixtureServices['bits'].StartType = 'Disabled' }
if ($Scenario -eq 'Dependent') { $global:fixtureServices['cryptSvc'].DependentServices = @([PSCustomObject]@{ Name = 'OtherService'; Status = 'Running' }) }
if ($Scenario -eq 'Pending') { $global:fixtureServices['bits'].Status = 'StopPending' }

# These shadows exist only in this test child process; the production script has no test switch.
function global:Get-Service {
    [CmdletBinding()]param([string]$Name)
    if (-not $global:fixtureServices.ContainsKey($Name)) { throw 'Fixture forbids any other service.' }
    $global:fixtureServices[$Name]
}
function global:Stop-Service {
    [CmdletBinding()]param($InputObject)
    $global:fixtureCalls.Add("Stop:$($InputObject.Name)")
    $InputObject.Status = 'Stopped'
    if ($global:fixtureScenario -eq 'StopFailure' -and $InputObject.Name -eq 'cryptSvc' -and -not $global:fixtureFailed) {
        $global:fixtureFailed = $true
        throw 'Injected stop failure after state change.'
    }
}
function global:Start-Service {
    [CmdletBinding()]param($InputObject)
    $global:fixtureCalls.Add("Start:$($InputObject.Name)")
    if ($global:fixtureScenario -in @('StartFailure','RecoveryFailure') -and $InputObject.Name -eq 'cryptSvc' -and -not $global:fixtureFailed) {
        $global:fixtureFailed = $true
        throw 'Injected start failure.'
    }
    if ($global:fixtureScenario -eq 'RecoveryFailure' -and $global:fixtureFailed -and $InputObject.Name -eq 'wuauserv') { throw 'Injected recovery failure.' }
    $InputObject.Status = 'Running'
}
$global:LASTEXITCODE = 0
$output = & (Join-Path $PSScriptRoot '..\server\operations\windows\update-services.ps1')
$providerExitCode = $LASTEXITCODE
$states = @{}
foreach ($name in $global:fixtureServices.Keys) { $states[$name] = $global:fixtureServices[$name].Status }
@{ providerExitCode = $providerExitCode; result = ($output | ConvertFrom-Json); calls = @($global:fixtureCalls.ToArray()); states = $states } | ConvertTo-Json -Depth 10 -Compress
exit 0
