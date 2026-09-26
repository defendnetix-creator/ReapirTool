[CmdletBinding()]
param([string]$ScanPath = '.', [switch]$FailOnWarning, [switch]$IncludeLegacy)
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ScanPath).Path
$rules = @(
    @{ Name = 'Encoded PowerShell'; Pattern = '(?i)-EncodedCommand\s+[A-Za-z0-9+/=]{20,}' },
    @{ Name = 'Defender disablement'; Pattern = '(?i)Set-MpPreference\s+-DisableRealtimeMonitoring\s+\$true' },
    @{ Name = 'Defender exclusion modification'; Pattern = '(?i)(?:Add|Set)-MpPreference\s+-Exclusion(?:Path|Process|Extension)' },
    @{ Name = 'Remote download and execution'; Pattern = '(?i)(?:iex|Invoke-Expression)\s*\(?\s*(?:Invoke-WebRequest|New-Object\s+Net\.WebClient)' },
    @{ Name = 'Private key embedded in source'; Pattern = '-----BEGIN (?:RSA )?PRIVATE KEY-----' }
)
$extensions = @('.ps1','.cs','.ts','.tsx','.iss','.json','.bat','.cmd','.mjs')
$excluded = @('node_modules','.git','.npm-cache','dist','build','bin','obj','publish','release')
if (-not $IncludeLegacy) { $excluded += 'legacy-original' }
function Get-SourceFiles([string]$directory) {
    foreach ($entry in Get-ChildItem -LiteralPath $directory -Force) {
        if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) { continue }
        if ($entry.PSIsContainer) {
            if ($entry.Name -notin $excluded) { Get-SourceFiles $entry.FullName }
        } elseif ($entry.Extension -in $extensions -and $entry.Name -ne 'scan_defender_regressions.ps1') {
            $entry
        }
    }
}
$files = @(Get-SourceFiles $root)
$findings = @()
foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    foreach ($rule in $rules) {
        if ($content -match $rule.Pattern) { $findings += [PSCustomObject]@{ File = $file.FullName; Rule = $rule.Name } }
    }
}
Write-Output "Static source check: $($files.Count) files, $($findings.Count) pattern matches. This is not a Microsoft Defender scan or a malware/reputation verdict."
$findings | Format-Table -AutoSize
if ($findings.Count -gt 0 -and $FailOnWarning) { throw 'Source pattern check requires review.' }
