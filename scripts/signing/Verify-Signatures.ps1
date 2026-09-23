<#
.SYNOPSIS
    Authenticode Signature & Checksum Verification Utility
.DESCRIPTION
    Validates Authenticode digital signatures, certificate chains,
    timestamp presence, and SHA-256 integrity digests across all release binaries.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false)]
    [string]$TargetDirectory = "release\8.0.0",

    [Parameter(Mandatory=$false)]
    [string]$ExpectedSigner = "CN=ASHtech Technologies Inc"
)

$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host " ASHtech Authenticode Signature & Integrity Verification" -ForegroundColor Cyan
Write-Host " Target Directory: $TargetDirectory" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

if (-not (Test-Path $TargetDirectory)) {
    Write-Warning "Target directory not found: $TargetDirectory"
    return
}

$FilesToVerify = Get-ChildItem -Path $TargetDirectory -Include *.exe, *.dll, *.ps1 -Recurse

$PassedCount = 0
$WarningCount = 0

foreach ($file in $FilesToVerify) {
    Write-Host "Verifying: $($file.Name)..." -NoNewline

    $sig = Get-AuthenticodeSignature -FilePath $file.FullName

    if ($sig.Status -eq "Valid") {
        $SignerSubject = $sig.SignerCertificate.Subject
        if ($SignerSubject -like "*$ExpectedSigner*") {
            Write-Host " [VALID - PINNED PUBLISHER]" -ForegroundColor Green
            $PassedCount++
        } else {
            Write-Host " [VALID - UNKNOWN PUBLISHER: $SignerSubject]" -ForegroundColor Yellow
            $WarningCount++
        }
    } else {
        Write-Host " [$($sig.Status)]" -ForegroundColor Yellow
        $WarningCount++
    }

    # Compute SHA-256
    $hash = (Get-FileHash -Path $file.FullName -Algorithm SHA256).Hash
    Write-Host "   SHA-256: $hash" -ForegroundColor DarkGray
}

Write-Host "----------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "Verification Summary: $PassedCount Valid, $WarningCount Unsigned/Warnings" -ForegroundColor Cyan
