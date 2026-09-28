[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $root
try {
    $env:DOTNET_CLI_HOME = Join-Path $root '.tools/dotnet-home'
    $env:NUGET_PACKAGES = Join-Path $root '.tools/nuget'
    $env:DOTNET_CLI_TELEMETRY_OPTOUT = '1'
    $env:DOTNET_GENERATE_ASPNET_CERTIFICATE = 'false'
    $env:AKSHIGO_TEST_BUILD = '1'
    & .tools/dotnet/dotnet.exe publish host/Akshigo.Host.csproj -c Release -o release/Akshigo-8.0.0-test.1-win-x64 --nologo
    if ($LASTEXITCODE -ne 0) { throw 'Host compilation failed.' }
    & node node_modules/vite/bin/vite.js build
    if ($LASTEXITCODE -ne 0) { throw 'React build failed.' }
    & node node_modules/esbuild/bin/esbuild server.ts --bundle --platform=node --format=cjs --external:vite --outfile=build/desktop-server.cjs --metafile=build/desktop-meta.json
    if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
    & node scripts/package_test_build.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Portable packaging failed.' }
    Write-Output 'Real test EXE created. This is not a validated release candidate.'
} finally {
    Remove-Item Env:AKSHIGO_TEST_BUILD -ErrorAction SilentlyContinue
    Pop-Location
}
