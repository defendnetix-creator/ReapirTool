$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = $scriptDir
$rootDir = Split-Path -Parent (Split-Path -Parent $projectDir)
$v7Dir = Join-Path $rootDir "V7"
$stageDir = Join-Path $projectDir "temp_stage"
$zipFile = Join-Path $projectDir "StagingZip.zip"
$finalZip = Join-Path $projectDir "StagingZip"

Write-Host "Creating staging directory at $stageDir..."
if (Test-Path $stageDir) {
    Remove-Item $stageDir -Recurse -Force
}
New-Item -ItemType Directory -Path $stageDir | Out-Null

# Helper to copy directories excluding bak files
function Copy-Dir ($source, $destination) {
    if (Test-Path $source) {
        Write-Host "Copying $source to $destination..."
        New-Item -ItemType Directory -Path $destination -Force | Out-Null
        Get-ChildItem $source -Recurse | Where-Object { 
            !$_.PSIsContainer -and $_.Extension -ne ".bak" -and $_.Extension -ne ".backup" -and $_.Name -notlike "*.backup*"
        } | ForEach-Object {
            $destFile = $_.FullName.Replace($source, $destination)
            $destFileDir = Split-Path -Parent $destFile
            if (!(Test-Path $destFileDir)) {
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
            }
            Copy-Item $_.FullName $destFile -Force
        }
    } else {
        Write-Warning "Source directory not found: $source"
    }
}

# 1. Copy from V7
Copy-Dir (Join-Path $v7Dir "Assets") (Join-Path $stageDir "Assets")
Copy-Dir (Join-Path $v7Dir "Config") (Join-Path $stageDir "Config")
Copy-Dir (Join-Path $v7Dir "Modules") (Join-Path $stageDir "Modules")

$v7Files = @("Toolkit.bat", "V5.exe", "dashboard.html")
foreach ($file in $v7Files) {
    $src = Join-Path $v7Dir $file
    if (Test-Path $src) {
        Write-Host "Copying $src to $stageDir..."
        Copy-Item $src $stageDir -Force
    } else {
        Write-Warning "Required file $file not found in V7 directory!"
    }
}

# 2. Copy launcher dependencies from project directory
$projFiles = @("Printer_Analyzer_Pro.exe", "Launch-WebDashboard.cmd")
foreach ($file in $projFiles) {
    $src = Join-Path $projectDir $file
    if (Test-Path $src) {
        Write-Host "Copying $src to $stageDir..."
        Copy-Item $src $stageDir -Force
    } else {
        Write-Warning "Required launcher file $file not found in project directory!"
    }
}

Copy-Dir (Join-Path $projectDir "Docs") (Join-Path $stageDir "Docs")

# 3. Create empty/stub directories
Write-Host "Creating empty Tools and Logs directories..."
New-Item -ItemType Directory -Path (Join-Path $stageDir "Tools") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stageDir "Logs") -Force | Out-Null

# 4. Zip the stage directory
Write-Host "Zipping staged files to $zipFile..."
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
if (Test-Path $finalZip) {
    Remove-Item $finalZip -Force
}

# Use Compress-Archive
Compress-Archive -Path "$stageDir\*" -DestinationPath $zipFile -Force

# Rename to StagingZip
Write-Host "Renaming package to $finalZip..."
Rename-Item $zipFile $finalZip

# 5. Cleanup
Write-Host "Cleaning up staging folder..."
Remove-Item $stageDir -Recurse -Force

Write-Host "Payload zip successfully built at $finalZip"
