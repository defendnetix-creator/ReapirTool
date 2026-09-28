AKSHIGO PC TOOLKIT PRO — WINDOWS TEST BUILD 8.0.0-test.1

1. Extract the entire ZIP to a folder.
2. Open Akshigo-PC-Toolkit-Pro.exe inside that folder.
3. Keep the runtime, backend, dist and server folders beside the EXE.

This is a real Windows x64 WebView2 application, not a release candidate.
The .NET and Node runtimes are included. Microsoft WebView2 Evergreen Runtime
must be installed. It is already present on the development PC.
Official WebView2 download: https://developer.microsoft.com/microsoft-edge/webview2/

The application opens in preview mode. To test implemented repairs, select
"Enable repairs as administrator" in the top bar and approve Windows UAC.
No repairs run automatically. Each administrative repair also asks for confirmation.
Close the job only after it finishes; Windows servicing cannot safely be cancelled.

45 native operations are implemented; 151 registered operations remain unavailable.
Full original-behavior parity is not complete. Super Repair is disabled.
Some dashboard sections still contain prominently labelled demonstration values.
The test build does not require a purchase or issue a paid license.
Purchases, license issuance, automatic updates and external browser popups are disabled.

This EXE is unsigned. Do not disable Defender or add exclusions to run it.
If Windows reports a detection, retain its exact report for investigation.
Repair operations can change Windows services, network configuration and system files.
Use an appropriate test machine with backups. Destructive repair validation and
clean-machine installation tests have not been completed.

Logs: %LOCALAPPDATA%\Akshigo\TestBuild\host.log
WebView profile: %LOCALAPPDATA%\Akshigo\TestBuild\WebView2
If the backend crashes, the application displays an error. Close and reopen it.
There is no automatic retry of failed repairs.

Bundled component notices are in licenses/. SHA256SUMS.txt covers the package files.
