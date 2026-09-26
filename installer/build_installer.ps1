[CmdletBinding()]
param(
    [ValidatePattern('^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$')]
    [string]$Version = '8.0.0-rc.1',
    [string]$Configuration = 'Release',
    [string]$InnoSetupCompilerPath = 'C:\Program Files (x86)\Inno Setup 6\ISCC.exe'
)
$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not (Test-Path -LiteralPath $InnoSetupCompilerPath)) {
    throw 'Installer blocked: Inno Setup compiler is missing. No simulated installer will be generated.'
}
# Existing ISS still describes an unimplemented host/runtime layout. Do not emit an
# installable package until the desktop integration and its runtime payload are tested.
throw 'Installer blocked: current React/WebView2 host and validated runtime payload are missing. See docs/source-audit.md.'
