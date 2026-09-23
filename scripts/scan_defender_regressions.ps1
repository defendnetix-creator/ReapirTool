<#
.SYNOPSIS
    Automated Windows Defender & Security Heuristics Scanner for Akshigo Release Pipeline
.DESCRIPTION
    Scans source trees, scripts, manifests, and build artifacts for known anti-patterns,
    dropper behaviors, obfuscation patterns, hardcoded secrets, and Defender trigger signatures.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$ScanPath = ".",

    [Parameter(Mandatory=$false)]
    [switch]$FailOnWarning
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Akshigo Security & Windows Defender Regression Scanner" -ForegroundColor Cyan
Write-Host " Target Scan Path: $ScanPath" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$Violations = @()

# 1. Patterns to scan
$DangerousPatterns = @(
    @{ Pattern = "Invoke-Expression\s*\(?Invoke-WebRequest"; Name = "Unsafe Remote Download Cradle"; Severity = "CRITICAL" },
    @{ Pattern = "IEX\s*\(?New-Object\s+Net\.WebClient"; Name = "Unsafe WebClient Download Cradle"; Severity = "CRITICAL" },
    @{ Pattern = "FromBase64String.*\(iex\b"; Name = "Base64 Obfuscated Execution"; Severity = "CRITICAL" },
    @{ Pattern = "-EncodedCommand\s+[A-Za-z0-9+/=]{20,}"; Name = "Obfuscated Encoded PowerShell Command"; Severity = "HIGH" },
    @{ Pattern = "Set-MpPreference\s+-DisableRealtimeMonitoring\s+\$true"; Name = "Direct Defender Disablement Pattern"; Severity = "CRITICAL" },
    @{ Pattern = "-----BEGIN RSA PRIVATE KEY-----"; Name = "Hardcoded Private Key Leakage"; Severity = "CRITICAL" },
    @{ Pattern = "v8\.0\.0-dev"; Name = "Development Version String in Release Artifacts"; Severity = "MEDIUM" }
)

$Extensions = @("*.ps1", "*.cs", "*.ts", "*.tsx", "*.iss", "*.json", "*.bat", "*.cmd")
$Files = Get-ChildItem -Path $ScanPath -Include $Extensions -Recurse -Exclude "node_modules", "dist", ".git", "bin", "obj"

Write-Host "Scanning $($Files.Count) source files across repository..." -ForegroundColor Yellow

foreach ($file in $Files) {
    # Skip scanner script itself to avoid self-match
    if ($file.Name -eq "scan_defender_regressions.ps1") { continue }

    $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }

    foreach ($rule in $DangerousPatterns) {
        if ($content -match $rule.Pattern) {
            $Violations += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path, "")
                Rule = $rule.Name
                Severity = $rule.Severity
            }
        }
    }
}

Write-Host "`nScan Results:" -ForegroundColor Cyan
if ($Violations.Count -eq 0) {
    Write-Host "✓ ZERO SECURITY REGRESSIONS DETECTED. Repository passed all Defender heuristics checks." -ForegroundColor Green
} else {
    Write-Host "Found $($Violations.Count) potential security flags:" -ForegroundColor Red
    $Violations | Format-Table -AutoSize
    if ($FailOnWarning) {
        throw "Security regression check failed! Fix the violations before producing a RELEASE package."
    }
}
