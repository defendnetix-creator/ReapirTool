[CmdletBinding()]
param([Parameter(Mandatory)][ValidateSet('SoftwareDistribution','Catroot2')][string]$Action)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
$original = @{}
$touched = [Collections.Generic.List[string]]::new()
$recoveryErrors = [Collections.Generic.List[string]]::new()
$failure = $null
$renamed = $false
$backupPath = $null

function Assert-OrdinaryDirectory([string]$Path) {
    $item = Get-Item -LiteralPath $Path -Force -ErrorAction Stop
    if (-not $item.PSIsContainer) { throw 'Cache path is not a directory.' }
    # Check every ancestor, including the selected folder. Never follow junctions or links.
    while ($null -ne $item) {
        if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Cache path contains a reparse point; repair is blocked.' }
        $item = $item.Parent
    }
}

try {
    $root = [IO.Path]::GetFullPath($env:SystemRoot)
    if ($root -notmatch '^[A-Za-z]:\\.+') { throw 'A local Windows system directory is required.' }
    $cachePath = if ($Action -eq 'SoftwareDistribution') { Join-Path $root 'SoftwareDistribution' } else { Join-Path $root 'System32\catroot2' }
    $services = if ($Action -eq 'SoftwareDistribution') { @('wuauserv','bits') } else { @('cryptSvc') }
    Assert-OrdinaryDirectory $cachePath
    $backupName = [IO.Path]::GetFileName($cachePath) + '.old.' + [Guid]::NewGuid().ToString('N')
    $backupPath = Join-Path ([IO.Path]::GetDirectoryName($cachePath)) $backupName
    if (Test-Path -LiteralPath $backupPath) { throw 'Backup path already exists.' }
    foreach ($name in $services) {
        $service = Get-Service -Name $name -ErrorAction Stop
        if ([string]$service.Status -notin @('Running','Stopped')) { throw "$name is not in a stable state." }
        if (@($service.DependentServices | Where-Object { [string]$_.Status -ne 'Stopped' }).Count) { throw "$name has running dependent services; no forced cascade is allowed." }
        $original[$name] = [string]$service.Status
    }
    foreach ($name in $services) {
        $service = Get-Service -Name $name -ErrorAction Stop
        $touched.Add($name)
        if ([string]$service.Status -ne 'Stopped') { Stop-Service -InputObject $service -ErrorAction Stop }
        $service.WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
    }
    # Revalidate after waiting for service shutdown. Rename within the same parent only.
    Assert-OrdinaryDirectory $cachePath
    Rename-Item -LiteralPath $cachePath -NewName $backupName -ErrorAction Stop
    $renamed = $true
    if (-not (Test-Path -LiteralPath $backupPath -PathType Container)) { throw 'Cache backup was not found after rename.' }
} catch {
    $failure = $_.Exception.Message
} finally {
    # Preserve original states, including services that the user had deliberately stopped.
    for ($index = $touched.Count - 1; $index -ge 0; $index--) {
        $name = $touched[$index]
        if ($original[$name] -ne 'Running') { continue }
        try {
            $service = Get-Service -Name $name -ErrorAction Stop
            if ([string]$service.Status -ne 'Running') { Start-Service -InputObject $service -ErrorAction Stop }
            $service.WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
        } catch { $recoveryErrors.Add("${name}: $($_.Exception.Message)") }
    }
}
@{ action = $Action; cacheRenamed = $renamed; backupPath = $backupPath; error = $failure; recoveryErrors = @($recoveryErrors.ToArray());
   note = 'Backup is retained. Windows recreates its cache when needed; update success is not assumed.' } | ConvertTo-Json -Depth 4 -Compress
if ($failure -or $recoveryErrors.Count) { exit 1 }
