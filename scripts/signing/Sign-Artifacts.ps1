<#
.SYNOPSIS
    Authenticode Code Signing Pipeline for Akshigo PC Toolkit Pro
.DESCRIPTION
    Applies SHA-256 Authenticode digital signatures with RFC 3161 timestamping
    to all executables, DLLs, installer packages, and PowerShell scripts.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("NONE", "LOCAL_CERTIFICATE", "MANAGED_SIGNING", "STORE")]
    [string]$SigningProvider = "NONE",

    [Parameter(Mandatory=$false)]
    [string]$CertificatePath = "",

    [Parameter(Mandatory=$false)]
    [string]$CertificatePassword = "",

    [Parameter(Mandatory=$false)]
    [string]$CertificateThumbprint = "",

    [Parameter(Mandatory=$false)]
    [string]$TimestampServer = "http://timestamp.digicert.com",

    [Parameter(Mandatory=$false)]
    [string]$Description = "Akshigo PC Toolkit Pro",

    [Parameter(Mandatory=$false)]
    [string]$Url = "https://akshigo.tech",

    [Parameter(Mandatory=$false)]
    [string[]]$TargetFiles = @()
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " Akshigo Authenticode Signing Pipeline" -ForegroundColor Cyan
Write-Host " Provider Mode: $SigningProvider" -ForegroundColor Cyan
Write-Host " Digest Algorithm: SHA-256 (RFC 3161 Timestamp)" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

if ($SigningProvider -eq "NONE") {
    Write-Host "Signing mode is set to 'NONE' (Development / Unsigned Build)." -ForegroundColor Yellow
    Write-Host "Skipping Authenticode signature generation." -ForegroundColor Yellow
    return
}

# Locate signtool.exe
$SignToolPath = $null
$WindowsKitsPaths = @(
    "C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64\signtool.exe",
    "C:\Program Files (x86)\Windows Kits\10\bin\10.0.19041.0\x64\signtool.exe",
    "C:\Program Files (x86)\Windows Kits\10\bin\x64\signtool.exe"
)

foreach ($path in $WindowsKitsPaths) {
    if (Test-Path $path) {
        $SignToolPath = $path
        break
    }
}

if (-not $SignToolPath) {
    $CommandSignTool = Get-Command "signtool.exe" -ErrorAction SilentlyContinue
    if ($CommandSignTool) {
        $SignToolPath = $CommandSignTool.Source
    }
}

if (-not $SignToolPath) {
    Write-Warning "signtool.exe not found in standard Windows SDK paths. Please ensure Windows SDK is installed."
    return
}

Write-Host "Using SignTool: $SignToolPath" -ForegroundColor Green

foreach ($file in $TargetFiles) {
    if (-not (Test-Path $file)) {
        Write-Warning "Target file does not exist: $file"
        continue
    }

    Write-Host "Signing: $file" -ForegroundColor Cyan

    $Arguments = @("sign", "/fd", "SHA256", "/tr", $TimestampServer, "/td", "SHA256", "/d", $Description, "/du", $Url)

    if ($SigningProvider -eq "LOCAL_CERTIFICATE") {
        if ($CertificatePath) {
            $Arguments += @("/f", $CertificatePath)
            if ($CertificatePassword) {
                $Arguments += @("/p", $CertificatePassword)
            }
        } elseif ($CertificateThumbprint) {
            $Arguments += @("/sha1", $CertificateThumbprint)
        }
    }

    $Arguments += $file

    # Attempt signing with primary timestamp authority
    $Process = Start-Process -FilePath $SignToolPath -ArgumentList $Arguments -Wait -NoNewWindow -PassThru
    if ($Process.ExitCode -ne 0) {
        Write-Warning "Primary timestamp server ($TimestampServer) failed. Retrying with fallback timestamp server..."
        $FallbackTimestamp = "http://timestamp.sectigo.com"
        $Arguments[4] = $FallbackTimestamp
        $Process = Start-Process -FilePath $SignToolPath -ArgumentList $Arguments -Wait -NoNewWindow -PassThru
        if ($Process.ExitCode -ne 0) {
            throw "Failed to sign $file (Exit Code: $($Process.ExitCode))"
        }
    }

    Write-Host "✓ Successfully signed $file" -ForegroundColor Green
}
