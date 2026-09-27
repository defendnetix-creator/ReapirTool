[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
try {
    $printers = @(Get-CimInstance Win32_Printer -ErrorAction Stop | ForEach-Object {
        $printer = $_
        $queueCount = $null
        $notes = 'Windows-reported inventory; device reachability has not been tested.'
        try { $queueCount = @(Get-PrintJob -PrinterName $printer.Name -ErrorAction Stop).Count }
        catch { $notes += " Queue unavailable: $($_.Exception.Message)" }
        [PSCustomObject]@{
            id = $printer.DeviceID; name = $printer.Name; isDefault = $printer.Default
            status = if ($printer.WorkOffline -eq $true) { 'Offline' } else { 'Unknown' }
            queueCount = $queueCount; port = $printer.PortName; driverName = $printer.DriverName
            driverVersion = $null; isShared = $printer.Shared; shareName = $printer.ShareName
            location = $printer.Location; colorSupported = $null; duplexSupported = $null; diagnosticNotes = $notes
        }
    })
    $total = if (@($printers | Where-Object { $null -eq $_.queueCount }).Count) { $null } else { ($printers | Measure-Object queueCount -Sum).Sum }
    if ($printers.Count -eq 0) { $total = 0 }
    $default = @($printers | Where-Object isDefault | Select-Object -ExpandProperty name)
    @{ printers = $printers; spoolerStatus = [string](Get-Service Spooler -ErrorAction Stop).Status;
       totalQueuedJobs = $total; defaultPrinter = if ($default.Count) { $default[0] } else { $null } } | ConvertTo-Json -Depth 6 -Compress
} catch {
    Write-Error "Printer inventory unavailable: $($_.Exception.Message)" -ErrorAction Continue
    exit 1
}
