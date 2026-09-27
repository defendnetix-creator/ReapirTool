[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)

# Toolkit.bat:update_fix option 2. Preserve stop/start order, never change startup types.
$stopOrder = @('wuauserv', 'cryptSvc', 'bits', 'msiserver')
$startOrder = @('bits', 'cryptSvc', 'wuauserv', 'msiserver')
$original = @{}
$touched = [Collections.Generic.List[string]]::new()
$events = [Collections.Generic.List[object]]::new()
$recoveryErrors = [Collections.Generic.List[string]]::new()
try {
    # Complete preflight before making any changes. No forced dependent-service cascade.
    foreach ($name in $stopOrder) {
        $service = Get-Service -Name $name -ErrorAction Stop
        if ([string]$service.Status -notin @('Running', 'Stopped')) { throw "$name is not in a stable state." }
        if ([string]$service.StartType -eq 'Disabled') { throw "$name is disabled; startup policy will not be changed." }
        if (@($service.DependentServices | Where-Object { [string]$_.Status -ne 'Stopped' -and $_.Name -notin $stopOrder }).Count) {
            throw "$name has running dependents outside this repair; no forced cascade is allowed."
        }
        $original[$name] = [string]$service.Status
    }
    foreach ($name in $stopOrder) {
        $service = Get-Service -Name $name -ErrorAction Stop
        # Track before invocation: a failing command may still have changed Windows.
        $touched.Add($name)
        if ([string]$service.Status -ne 'Stopped') {
            Stop-Service -InputObject $service -ErrorAction Stop
            $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
        }
        $service.Refresh()
        if ([string]$service.Status -ne 'Stopped') { throw "$name did not stop." }
        $events.Add(@{ service = $name; action = 'Stop'; status = [string]$service.Status })
    }
    foreach ($name in $startOrder) {
        $service = Get-Service -Name $name -ErrorAction Stop
        Start-Service -InputObject $service -ErrorAction Stop
        $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        $service.Refresh()
        if ([string]$service.Status -ne 'Running') { throw "$name did not start." }
        $events.Add(@{ service = $name; action = 'Start'; status = [string]$service.Status })
    }
    @{ events = @($events.ToArray()); startupTypesChanged = $false } | ConvertTo-Json -Depth 5 -Compress
} catch {
    $failure = $_.Exception.Message
    # Restore original states as best effort; report any failure, never claim atomic rollback.
    foreach ($name in $startOrder) {
        if ($name -notin $touched -or $original[$name] -ne 'Running') { continue }
        try {
            $service = Get-Service -Name $name -ErrorAction Stop
            if ([string]$service.Status -ne 'Running') { Start-Service -InputObject $service -ErrorAction Stop }
            $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        } catch { $recoveryErrors.Add("${name}: $($_.Exception.Message)") }
    }
    foreach ($name in $stopOrder) {
        if ($name -notin $touched -or $original[$name] -ne 'Stopped') { continue }
        try {
            $service = Get-Service -Name $name -ErrorAction Stop
            if ([string]$service.Status -ne 'Stopped') { Stop-Service -InputObject $service -ErrorAction Stop }
            $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
        } catch { $recoveryErrors.Add("${name}: $($_.Exception.Message)") }
    }
    @{ error = $failure; events = @($events.ToArray()); recoveryErrors = @($recoveryErrors.ToArray()); recoveryAttempted = ($touched.Count -gt 0) } | ConvertTo-Json -Depth 5 -Compress
    exit 1
}
