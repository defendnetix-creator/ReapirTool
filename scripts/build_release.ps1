[CmdletBinding()]
param(
    [ValidatePattern('^[0-9]+\.[0-9]+\.[0-9]+(-[A-Za-z0-9.]+)?$')]
    [string]$Version = '8.0.0-rc.1',
    [ValidateSet('DEBUG','STAGING','RELEASE')][string]$BuildMode = 'STAGING'
)
$ErrorActionPreference = 'Stop'
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$HostProject = Join-Path $ProjectRoot 'host\Akshigo.Host.csproj'
# Never package the legacy launcher: it does not host this React/Node application.
if (-not (Test-Path -LiteralPath $HostProject)) {
    throw 'Release blocked: current Akshigo React/WebView2 host project is missing. No EXE or installer was generated.'
}
$SdkVersions = & dotnet --list-sdks
if ($LASTEXITCODE -ne 0 -or -not $SdkVersions) { throw 'Release blocked: .NET SDK is missing.' }
throw 'Release blocked: native feature parity, desktop session integration, Windows VM validation and packaging must be completed. See docs/source-audit.md.'
