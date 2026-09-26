[CmdletBinding()]
param(
    [ValidateSet('List','Start','Stop','Restart','SetStartup')][string]$Action = 'List',
    [ValidatePattern('^[A-Za-z0-9_.-]{1,128}$')][string]$ServiceName,
    [ValidateSet('Automatic','Manual','Disabled','Automatic (Delayed)')][string]$StartType
)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$controllable = @('spooler','wuauserv','bits','sysmain','wsearch','trustedinstaller','msiserver')
$protected = @('rpcss','rpceptmapper','dcomlaunch','plugplay','eventlog','samss','lsm','bfe','mpssvc','windefend','wdnissvc','securityhealthservice','wscsvc')

function Get-Inventory {
    $controllers = @{}
    Get-Service | ForEach-Object { $controllers[$_.Name] = $_ }
    @(Get-CimInstance Win32_Service | ForEach-Object {
        $service = $_
        $controller = $controllers[$service.Name]
        $startup = switch ($service.StartMode) { 'Auto' { if ($service.DelayedAutoStart) { 'Automatic (Delayed)' } else { 'Automatic' } } 'Manual' { 'Manual' } 'Disabled' { 'Disabled' } default { [string]$service.StartMode } }
        [PSCustomObject]@{
            name = $service.Name; displayName = $service.DisplayName
            status = if ($service.State -in @('Running','Stopped','Paused')) { $service.State } else { 'Pending' }
            startType = $startup; account = $service.StartName; pid = $service.ProcessId
            dependencies = @($controller.ServicesDependedOn | ForEach-Object { $_.Name })
            isCritical = $service.Name.ToLowerInvariant() -in $protected
            canControl = $service.Name.ToLowerInvariant() -in $controllable
            category = if ($service.Name.ToLowerInvariant() -in $protected) { 'System' } else { 'Other' }
        }
    } | Sort-Object name)
}

try {
    if ($Action -eq 'List') {
        $items = @(Get-Inventory)
        @{ services = $items; count = $items.Count } | ConvertTo-Json -Depth 6 -Compress
        exit 0
    }
    if (-not $ServiceName -or $ServiceName.ToLowerInvariant() -notin $controllable) { throw 'Service is outside the audited control allowlist.' }
    $service = Get-Service -Name $ServiceName
    if ($Action -in @('Stop','Restart')) {
        if (@($service.DependentServices | Where-Object Status -ne 'Stopped').Count) { throw 'Running dependent services must be handled separately; no forced cascade is allowed.' }
    }
    switch ($Action) {
        'Start' {
            Start-Service -InputObject $service
            $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        }
        'Stop' {
            Stop-Service -InputObject $service
            $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
        }
        'Restart' {
            if ($service.Status -ne 'Stopped') {
                Stop-Service -InputObject $service
                $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
            }
            Start-Service -InputObject $service
            $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        }
        'SetStartup' {
            if (-not $StartType) { throw 'Startup type is required.' }
            if ($StartType -eq 'Disabled' -and $ServiceName.ToLowerInvariant() -in @('wuauserv','bits','trustedinstaller','msiserver')) { throw 'Disabling Windows servicing/update infrastructure is not supported.' }
            $mode = @{ 'Automatic' = 'auto'; 'Manual' = 'demand'; 'Disabled' = 'disabled'; 'Automatic (Delayed)' = 'delayed-auto' }[$StartType]
            & "$env:SystemRoot\System32\sc.exe" config $ServiceName 'start=' $mode | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "Service configuration failed with exit code $LASTEXITCODE." }
        }
    }
    $actual = Get-Inventory | Where-Object name -eq $ServiceName
    if (-not $actual) { throw 'Service disappeared before verification.' }
    if ($Action -eq 'SetStartup' -and $actual.startType -ne $StartType) { throw 'Windows did not report the requested startup type.' }
    @{ serviceName = $actual.name; status = $actual.status; startType = $actual.startType; service = $actual } | ConvertTo-Json -Depth 6 -Compress
} catch {
    Write-Error "Service operation failed; changes, if any, were not rolled back: $($_.Exception.Message)" -ErrorAction Continue
    exit 1
}
