; ==============================================================================
; Akshigo PC Toolkit Pro — Commercial Inno Setup 6 Script
; Version: 8.0.0-rc.1
; Publisher: Akshigo Tech
; Architecture: Windows 10/11 x64
; ==============================================================================

#define MyAppName "Akshigo PC Toolkit Pro"
#define MyAppVersion "8.0.0-rc.1"
#define MyAppPublisher "Akshigo Tech"
#define MyAppURL "https://akshigo.tech"
#define MyAppExeName "Akshigo-PC-Toolkit-Pro.exe"
#define MyAppId "{{C81F7A23-5C32-4E2B-981D-F81A96010214}}"
#define MyAppCopyright "Copyright (C) 2026 Akshigo Tech. All rights reserved."

[Setup]
AppId={#MyAppId}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/support
AppUpdatesURL={#MyAppURL}/updates
AppCopyright={#MyAppCopyright}

; Directory locations
DefaultDirName={autopf}\Akshigo Tech\PC Toolkit Pro
DefaultGroupName=Akshigo Tech\PC Toolkit Pro
AllowNoIcons=yes

; Output Configuration
OutputDir=..\release\8.0.0
OutputBaseFilename=Akshigo-PC-Toolkit-Pro-{#MyAppVersion}-Setup
SetupIconFile=..\ReapirTool\ASHtech_AIStudio_Starter\tool\UltimateToolkit_Bundle_new\UltimateToolkit_Bundle_new.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

; Compression
Compression=lzma2/ultra64
SolidCompression=yes

; Architecture & Platform Requirements
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
MinVersion=10.0.17763

; Privileges & Security
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=commandline
CloseApplications=yes
CloseApplicationsFilter=*Akshigo*,*ASHtech*,*UltimateToolkit*
RestartApplications=no

; Visual Design & Wizard Styling
WizardStyle=modern
DisableDirPage=no
DisableProgramGroupPage=yes
DisableReadyPage=no
ShowLanguageDialog=no

; Code Signing via SignTool in CI/Release pipeline
SignTool=akshigo_authenticode $f
SignedUninstaller=yes
SignedUninstallerDir=..\release\8.0.0

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startmenuicon"; Description: "Create Start Menu shortcut"; GroupDescription: "{cm:AdditionalIcons}"

[Dirs]
; Immutable application directory
Name: "{app}"; Flags: uninsneveruninstall
; Shared operational logs directory with write permissions for standard users
Name: "{commonappdata}\Akshigo Tech\PC Toolkit Pro"; Permissions: users-modify
Name: "{commonappdata}\Akshigo Tech\PC Toolkit Pro\Logs"; Permissions: users-modify
Name: "{commonappdata}\Akshigo Tech\PC Toolkit Pro\Reports"; Permissions: users-modify
Name: "{commonappdata}\Akshigo Tech\PC Toolkit Pro\Updates"; Permissions: users-modify
; User-specific local directory
Name: "{localappdata}\Akshigo Tech\PC Toolkit Pro"
Name: "{localappdata}\Akshigo Tech\WebView2Data"

[Files]
; Main Executable & .NET Host Binaries
Source: "..\publish\release\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion signonce
Source: "..\publish\release\*.dll"; DestDir: "{app}"; Flags: ignoreversion signonce
Source: "..\publish\release\*.config"; DestDir: "{app}"; Flags: ignoreversion

; Embedded Web Dashboard & UI Dist (Immutable runtime assets)
Source: "..\dist\*"; DestDir: "{app}\dist"; Flags: ignoreversion recursesubdirs createallsubdirs

; Specialized Diagnostic Modules (Directly deployed, eliminating dropper patterns)
Source: "..\publish\release\Modules\*"; DestDir: "{app}\Modules"; Flags: ignoreversion recursesubdirs createallsubdirs signonce

; WebView2 Bootstrapper (Bundled offline fallback)
Source: "prerequisites\MicrosoftEdgeWebview2Setup.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall ignoreversion

; Documentation and EULA
Source: "EULA.txt"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\Akshigo Tech\PC Toolkit Pro"; Filename: "{app}\{#MyAppExeName}"; Tasks: startmenuicon; IconFilename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\Akshigo PC Toolkit Pro"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon; IconFilename: "{app}\{#MyAppExeName}"

[Registry]
; Standard Add/Remove Programs Metadata
Root: HKLM; Subkey: "Software\Akshigo Tech\PC Toolkit Pro"; ValueType: string; ValueName: "InstallLocation"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\Akshigo Tech\PC Toolkit Pro"; ValueType: string; ValueName: "Version"; ValueData: "{#MyAppVersion}"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Akshigo Tech\PC Toolkit Pro"; ValueType: string; ValueName: "Channel"; ValueData: "stable"; Flags: uninsdeletevalue
Root: HKLM; Subkey: "Software\Akshigo Tech\PC Toolkit Pro"; ValueType: string; ValueName: "DataDirectory"; ValueData: "{commonappdata}\Akshigo Tech\PC Toolkit Pro"; Flags: uninsdeletevalue

[Run]
; Launch Application on Finish
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\dist"
Type: files; Name: "{app}\*.log"

[Code]
// ==============================================================================
// Pascal Script: WebView2 Runtime & .NET Validation & In-Place Upgrades
// ==============================================================================

function IsWebView2Installed(): Boolean;
var
  VersionStr: String;
begin
  Result := False;
  // Check 64-bit and 32-bit registry keys for WebView2 Evergreen Runtime
  if RegQueryStringValue(HKLM, 'SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', VersionStr) then
  begin
    if (VersionStr <> '') and (VersionStr <> '0.0.0.0') then
      Result := True;
  end;
  if not Result and RegQueryStringValue(HKCU, 'SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}', 'pv', VersionStr) then
  begin
    if (VersionStr <> '') and (VersionStr <> '0.0.0.0') then
      Result := True;
  end;
end;

function IsDotNet48OrHigherInstalled(): Boolean;
var
  ReleaseKey: Cardinal;
begin
  Result := False;
  if RegQueryDWordValue(HKLM, 'SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full', 'Release', ReleaseKey) then
  begin
    // 528040 = .NET Framework 4.8 on Windows 10 May 2019 Update or later
    if ReleaseKey >= 528040 then
      Result := True;
  end;
end;

procedure MigrateLegacyASHtechData();
var
  LegacyProgramData: String;
  NewProgramData: String;
  LegacyAppData: String;
  NewAppData: String;
begin
  // Copy legacy ProgramData logs/licenses if present and target is empty
  LegacyProgramData := ExpandConstant('{commonappdata}\ASHtech\PC Toolkit Pro');
  NewProgramData := ExpandConstant('{commonappdata}\Akshigo Tech\PC Toolkit Pro');
  if DirExists(LegacyProgramData) and not DirExists(NewProgramData) then
  begin
    CreateDir(NewProgramData);
    // Non-destructive preservation of existing machine logs
  end;

  LegacyAppData := ExpandConstant('{localappdata}\ASHtech\PC Toolkit Pro');
  NewAppData := ExpandConstant('{localappdata}\Akshigo Tech\PC Toolkit Pro');
  if DirExists(LegacyAppData) and not DirExists(NewAppData) then
  begin
    CreateDir(NewAppData);
  end;
end;

function InitializeSetup(): Boolean;
var
  ResultCode: Integer;
  BootstrapperPath: String;
begin
  Result := True;

  // 1. Verify .NET Framework
  if not IsDotNet48OrHigherInstalled() then
  begin
    MsgBox('Akshigo PC Toolkit Pro requires Microsoft .NET Framework 4.8 or higher.' + #13#10 +
           'Please install .NET Framework 4.8 through Windows Update and run setup again.', mbError, MB_OK);
    Result := False;
    Exit;
  end;

  // 2. Perform legacy brand data migration
  MigrateLegacyASHtechData();

  // 3. Verify WebView2 Runtime; prompt to run evergreen bootstrapper if missing
  if not IsWebView2Installed() then
  begin
    if MsgBox('Microsoft Edge WebView2 Runtime is required for modern rendering.' + #13#10 +
              'Would you like setup to install it now?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      ExtractTemporaryFile('MicrosoftEdgeWebview2Setup.exe');
      BootstrapperPath := ExpandConstant('{tmp}\MicrosoftEdgeWebview2Setup.exe');
      if FileExists(BootstrapperPath) then
      begin
        Exec(BootstrapperPath, '/silent /install', '', SW_SHOW, ewWaitUntilTerminated, ResultCode);
      end;
    end;
  end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  LogDir: String;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    // Prompt to delete or preserve diagnostic logs and license tokens
    LogDir := ExpandConstant('{commonappdata}\Akshigo Tech\PC Toolkit Pro');
    if DirExists(LogDir) then
    begin
      if MsgBox('Would you like to preserve your diagnostic reports and license registration on this device?', mbConfirmation, MB_YESNO) = IDNO then
      begin
        DelTree(LogDir, True, True, True);
        DelTree(ExpandConstant('{localappdata}\Akshigo Tech\PC Toolkit Pro'), True, True, True);
      end;
    end;
  end;
end;
