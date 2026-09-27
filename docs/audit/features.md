# Feature mapping audit

Original IMPLEMENTED_WORKING labels are not trusted. A declared operation mapping is not proof of parity. REMOVED_SECURITY rows retain the original policy decision but require individual review; no unsafe feature has been reinstated.

| Feature | Original reference | Declared operation | Source verdict |
|---|---|---|---|
| sys.admin.taskmgr | Toolkit.bat / task_process / taskmgr | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| sys.admin.services_msc | Toolkit.bat / services.msc / menu_services_features | Invoke-SpoolerRestart | MISSING_BEHAVIOR — no matching native operation mapping |
| sys.admin.regedit | Toolkit.bat / regedit.exe | none | MISSING_BEHAVIOR — no matching native operation mapping |
| sys.admin.dxdiag | Toolkit.bat / dxdiag.exe | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| sys.admin.msinfo32 | Toolkit.bat / msinfo32.exe | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| sys.admin.compmgmt | Toolkit.bat / compmgmt.msc | sys.admin.compmgmt | MISSING_BEHAVIOR |
| sys.admin.godmode | Toolkit.bat / godmode_create | sys.admin.godmode | MISSING_BEHAVIOR |
| sys.admin.env_vars | Toolkit.bat / env_vars / sysdm.cpl | sys.admin.env_vars | MISSING_BEHAVIOR |
| sys.admin.sched_tasks | Toolkit.bat / sched_tasks / taskschd.msc | Set-StartupState | MISSING_BEHAVIOR — no matching native operation mapping |
| net.dns.flush | Toolkit.bat / ipconfig /flushdns | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| net.winsock.reset | Toolkit.bat / netsh winsock reset | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| net.ip.renew | Toolkit.bat / ipconfig /release & ipconfig /renew | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| net.adapter.restart | Toolkit.bat / adapter_reset / Restart-NetAdapter | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| net.arp.clear | Toolkit.bat / netsh interface ip delete arpcache | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| net.wifi.dump_cleartext | Toolkit.bat / netsh wlan show profile key=clear | Get-NetAdapterTelemetry | REMOVED_SECURITY — prior decision, review pending |
| net.speed.ping_latency | Toolkit.bat / ping_test / Test-Connection | Test-NetConnection | MISSING_BEHAVIOR — no matching native operation mapping |
| net.firewall.gui | Toolkit.bat / wf.msc | Get-NetFirewallProfile | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.sfc_scannow | Toolkit.bat / sfc_dism / sfc /scannow | Invoke-SfcScan | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.sfc_verifyonly | Toolkit.bat / sfc /verifyonly | Invoke-SfcScan | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.dism_checkhealth | Toolkit.bat / DISM /Online /Cleanup-Image /CheckHealth | Invoke-DismRestore | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.dism_scanhealth | Toolkit.bat / DISM /Online /Cleanup-Image /ScanHealth | Invoke-DismRestore | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.dism_restorehealth | Toolkit.bat / DISM /Online /Cleanup-Image /RestoreHealth | Invoke-DismRestore | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.dism_clean_store | Toolkit.bat / DISM /Online /Cleanup-Image /StartComponentCleanup | Invoke-DismRestore | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.catroot2_reset | Toolkit.bat / catroot2_reset | Invoke-WURepair | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.softwaredistribution_reset | Toolkit.bat / softwaredistribution_reset | Invoke-WURepair | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.windows.bootrec | Toolkit.bat / boot_repair / bootrec | boot.bootrec.rebuild | MISSING_BEHAVIOR |
| repair.windows.chkdsk_scan | Toolkit.bat / chkdsk C: /scan | Invoke-DismRestore | MISSING_BEHAVIOR — no matching native operation mapping |
| sec.defender.quick_scan | Toolkit.bat / defender_quick_scan / Start-MpScan -ScanType QuickScan | Start-MpQuickScan | MISSING_BEHAVIOR — no matching native operation mapping |
| sec.defender.update_signatures | Toolkit.bat / defender_update / Update-MpSignature | Invoke-DefenderUpdate | MISSING_BEHAVIOR — no matching native operation mapping |
| sec.defender.disable_realtime | Toolkit.bat / Set-MpPreference -DisableRealtimeMonitoring $true | Get-MpPreference | REMOVED_SECURITY — prior decision, review pending |
| sec.defender.add_exclusion | Toolkit.bat / Add-MpPreference -ExclusionPath | none | REMOVED_SECURITY — prior decision, review pending |
| sec.firewall.disable_all | Toolkit.bat / netsh advfirewall set allprofiles state off | Get-NetFirewallProfile | REMOVED_SECURITY — prior decision, review pending |
| sec.defender.pua_protection | Toolkit.bat / Set-MpPreference -PUAProtection Enabled | Invoke-DefenderUpdate | MISSING_BEHAVIOR — no matching native operation mapping |
| sec.uac.verify_level | Toolkit.bat / uac_verify / EnableLUA | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.temp.cleanup | Toolkit.bat / cleanmgr / prune_temp | Invoke-PruneTempFiles | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.ram.flush | Toolkit.bat / rammap -empty / Clear-StandbyList | Invoke-PerfOptimize | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.power.ultimate | Toolkit.bat / powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 | Invoke-PerfOptimize | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.startup.manage | Toolkit.bat / startup_mgr / Get-CimInstance Win32_StartupCommand | Set-StartupState | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.visual_effects.tune | Toolkit.bat / visual_fx / VisualFXSetting | perf.visual_effects.tune | MISSING_BEHAVIOR — no matching native operation mapping |
| storage.smart.inspect | Toolkit.bat / smart_disk / Get-PhysicalDisk | Get-DriveHealth | MISSING_BEHAVIOR — no matching native operation mapping |
| storage.trim.optimize | Toolkit.bat / defrag C: /O /U | Invoke-PerfOptimize | MISSING_BEHAVIOR — no matching native operation mapping |
| storage.diskpart.gui | Toolkit.bat / diskmgmt.msc | storage.diskmgmt.launch | MISSING_BEHAVIOR — no matching native operation mapping |
| storage.storagesense.toggle | Toolkit.bat / storagesense_toggle | storage.storagesense.toggle | MISSING_BEHAVIOR — no matching native operation mapping |
| user.accounts.list | Toolkit.bat / net user / Get-LocalUser | user.accounts.list | MISSING_BEHAVIOR |
| user.admin_account.enable | Toolkit.bat / net user Administrator /active:yes | user.admin_account.enable | MISSING_BEHAVIOR |
| user.lusrmgr.console | Toolkit.bat / lusrmgr.msc | user.lusrmgr.console | MISSING_BEHAVIOR |
| backup.restore_point.create | Toolkit.bat / Checkpoint-Computer / sysrestore_create | Invoke-FullHealing | MISSING_BEHAVIOR — no matching native operation mapping |
| backup.registry.export | Toolkit.bat / reg export HKLM reg_backup.reg | backup.registry.export | MISSING_BEHAVIOR |
| backup.vss.manage | Toolkit.bat / vssadmin list shadows | backup.vss.manage | MISSING_BEHAVIOR |
| driver.inventory.pnp | Toolkit.bat / driver_audit / Win32_PnPSignedDriver | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| driver.export.dism | Toolkit.bat / dism /online /export-driver | driver.backup | MISSING_BEHAVIOR |
| driver.devmgmt.launch | Toolkit.bat / devmgmt.msc | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| update.wu.service_reset | Toolkit.bat / wu_reset / wuauserv | Invoke-WURepair | MISSING_BEHAVIOR — no matching native operation mapping |
| update.activation.slmgr_check | Modules/CheckActivation.cmd / slmgr.vbs /xpr /dli | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| office.outlook.safe_mode | Toolkit.bat / outlook.exe /safe | office.outlook.safemode | MISSING_BEHAVIOR |
| office.outlook.reset_navpane | Toolkit.bat / outlook.exe /resetnavpane | office.outlook.resetnavpane | MISSING_BEHAVIOR |
| office.c2r.quick_repair | Toolkit.bat / OfficeClickToRun.exe scenario=Repair | office.repair.quick | MISSING_BEHAVIOR |
| printer.spooler.restart | Toolkit.bat / spooler_restart / net stop spooler | Invoke-SpoolerRestart | MISSING_BEHAVIOR — no matching native operation mapping |
| printer.queue.purge | Toolkit.bat / del /Q /F %systemroot%\System32\spool\PRINTERS\* | Invoke-QueuePurge | MISSING_BEHAVIOR — no matching native operation mapping |
| printer.analyzer.full_diagnose | Printer_Analyzer_Pro.cs / PrinterAnalyzer.DiagnoseAll() | printer.diagnostics.run | MISSING_BEHAVIOR |
| printer.offline.fix | Printer_Analyzer_Pro.cs / Set-Printer -WorkOffline $false | printer.offline.fix | MISSING_BEHAVIOR |
| printer.fix_0x0000011b | Printer_Analyzer_Pro.cs / RpcAuthnLevelPrivacyEnabled remediation | printer.fix_0x0000011b | MISSING_BEHAVIOR |
| printer.fix_0x00000709 | Printer_Analyzer_Pro.cs / PointAndPrint default printer pointer fix | printer.fix_0x00000709 | MISSING_BEHAVIOR |
| printer.subsystem.cleanup | Printer_Analyzer_Pro.cs / SubsystemCleanup without driver deletion | printer.subsystem.cleanup | MISSING_BEHAVIOR |
| printer.inventory.get | Printer_Analyzer_Pro.cs / Get-Printer / WMI Win32_Printer | printer.inventory.get | PARTIAL_EQUIVALENT |
| repair.sfc.scanfile | Toolkit.bat / sfc /scanfile | repair.sfc.scanfile | PARTIAL_EQUIVALENT |
| repair.dism.source_wim | Toolkit.bat / DISM /RestoreHealth /Source:WIM /LimitAccess | repair.dism.source_wim | PARTIAL_EQUIVALENT |
| repair.sfc_dism.full | OneClickSuperRepair.ps1 / OneClickSuperRepair.ps1 -FullPipeline | repair.sfc_dism.full | PARTIAL_EQUIVALENT |
| repair.cbs_log.view | Toolkit.bat / type %windir%\Logs\CBS\CBS.log | repair.cbs_log.view | PARTIAL_EQUIVALENT |
| repair.wu.reset_services | Toolkit.bat / net stop wuauserv & bits & cryptsvc | repair.wu.reset_services | PARTIAL_EQUIVALENT |
| repair.wu.diagnostics | OneClickSuperRepair.ps1 / Get-WUDiagnostics | repair.wu.diagnostics | MISSING_BEHAVIOR |
| repair.explorer.restart | Toolkit.bat / taskkill /f /im explorer.exe & start explorer.exe | repair.explorer.restart | MISSING_BEHAVIOR |
| repair.startmenu.troubleshoot | OneClickSuperRepair.ps1 / Repair-StartMenuExperience | repair.startmenu.troubleshoot | MISSING_BEHAVIOR |
| repair.store.wsreset | Toolkit.bat / wsreset.exe | repair.store.wsreset | MISSING_BEHAVIOR |
| repair.store.reregister | OneClickSuperRepair.ps1 / Add-AppxPackage -DisableDevelopmentMode -Register | repair.store.reregister | MISSING_BEHAVIOR |
| repair.msi.repair | Toolkit.bat / msiexec /unregister & msiexec /regserver | repair.msi.repair | MISSING_BEHAVIOR |
| repair.time.sync | Toolkit.bat / w32tm /resync /rediscover | repair.time.sync | MISSING_BEHAVIOR |
| repair.recovery.create_restore_point | OneClickSuperRepair.ps1 / Checkpoint-Computer | repair.recovery.create_restore_point | PARTIAL_EQUIVALENT |
| repair.recovery.open_options | Toolkit.bat / systempropertiesprotection.exe | repair.recovery.open_options | MISSING_BEHAVIOR |
| network.tcpip.reset | Toolkit.bat / netsh int ip reset | network.tcpip.reset | PARTIAL_EQUIVALENT |
| network.proxy.reset | Toolkit.bat / netsh winhttp reset proxy | network.proxy.reset | PARTIAL_EQUIVALENT |
| network.connectivity.test | Toolkit.bat / WiFiDiagnostics.cmd | network.connectivity.test | MISSING_BEHAVIOR |
| network.netstat.sockets | Toolkit.bat / netstat -ano / Get-NetTCPConnection | network.netstat.sockets | PARTIAL_EQUIVALENT |
| network.workflow.common_repair | OneClickSuperRepair.ps1 / OneClickSuperRepair.ps1 -NetworkSuite | network.workflow.common_repair | PARTIAL_EQUIVALENT |
| remote.rdp.enable_disable | Toolkit.bat / rdp_toggle / Terminal Server | remote.rdp.settings | MISSING_BEHAVIOR |
| remote.rdp.firewall_rule | Toolkit.bat / netsh advfirewall firewall set rule group="remote desktop" new enable=Yes | remote.firewall.rdp_audit | MISSING_BEHAVIOR |
| boot.uefi.reboot_fw | Toolkit.bat / shutdown /r /fw /t 0 | boot.advanced.startup | MISSING_BEHAVIOR |
| boot.tpm.verify | Toolkit.bat / tpm.msc / Confirm-SecureBootUEFI | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| policy.gpupdate.force | Toolkit.bat / gpupdate /force | none | MISSING_BEHAVIOR — no matching native operation mapping |
| policy.gpedit.launch | Toolkit.bat / gpedit.msc | policy.gpedit.launch | MISSING_BEHAVIOR |
| services.optional_features.dism | Toolkit.bat / dism /online /get-features | services.optional_features.dism | PARTIAL_EQUIVALENT |
| monitor.telemetry.live | Modules/WebBridgeServer.ps1 / /api/metrics / Get-HardwareTelemetry | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| logs.eventviewer.launch | Toolkit.bat / eventvwr.msc | Export-AuditLogs | MISSING_BEHAVIOR — no matching native operation mapping |
| logs.audit.failed_logins | Toolkit.bat / Get-WinEvent -FilterHashtable @{LogName="Security";Id=4625} | Export-AuditLogs | MISSING_BEHAVIOR — no matching native operation mapping |
| quick.control_panel.launch | Toolkit.bat / control.exe / appwiz.cpl | none | MISSING_BEHAVIOR — no matching native operation mapping |
| power.wsl.install | Toolkit.bat / wsl --install | power.wsl.install | MISSING_BEHAVIOR |
| power.hyperv.toggle | Toolkit.bat / Enable-WindowsOptionalFeature -FeatureName Microsoft-Hyper-V | power.hyperv.toggle | MISSING_BEHAVIOR |
| ai.copilot.troubleshooter | Modules/WebBridgeServer.ps1 / /api/chat / ai_assistant_center | Invoke-AIInference | MISSING_BEHAVIOR — no matching native operation mapping |
| auto.perf.boost | Toolkit.bat / auto_perf / Invoke-PerfOptimize | Invoke-PerfOptimize | MISSING_BEHAVIOR — no matching native operation mapping |
| auto.net.repair | Modules/WiFiDiagnostics.cmd / auto_network / Invoke-NetReset | Invoke-NetReset | MISSING_BEHAVIOR — no matching native operation mapping |
| cloud.telemetry.bridge | Modules/WebBridgeServer.ps1 / /api/status / /api/v1/updates | Get-Status | MISSING_BEHAVIOR — no matching native operation mapping |
| deploy.winget.install | Toolkit.bat / winget install --silent | Invoke-WinGetInstall | MISSING_BEHAVIOR — no matching native operation mapping |
| cyber.portscan.local | Toolkit.bat / netstat -ano / Get-NetTCPConnection | Get-NetTCPConnection | MISSING_BEHAVIOR — no matching native operation mapping |
| cyber.usb.history_audit | Config/tools.catalog / usbdrivelog.exe / Get-ItemProperty Enum\USBSTOR | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| software.mass_installer.catalog | Config/custom_winget_apps.bundle / menu_mass_installer | Invoke-WinGetInstall | MISSING_BEHAVIOR — no matching native operation mapping |
| dash.main.view | dashboard.html / pg-dash | Get-HardwareTelemetry | MISSING_BEHAVIOR — no matching native operation mapping |
| settings.theme.preferences | Config/gui_settings.cfg / menu_settings_themes | Save-Preferences | MISSING_BEHAVIOR — no matching native operation mapping |
| about.toolkit.metadata | Toolkit.bat / menu_about_toolkit | none | MISSING_BEHAVIOR — no matching native operation mapping |
| search.smart.command_palette | Modules/SmartMenuSearch.ps1 / menu_search | none | MISSING_BEHAVIOR — no matching native operation mapping |
| problem.master.guided_triage | Toolkit.bat / problem_master_hub | Invoke-FullHealing | MISSING_BEHAVIOR — no matching native operation mapping |
| driver.auto.oem_center | Toolkit.bat / driver_auto_center | driver.wu.scan | MISSING_BEHAVIOR |
| vault.cmd.reference_10k | Toolkit.bat / cmd_vault | none | MISSING_BEHAVIOR — no matching native operation mapping |
| vault.mega.native_consoles | Toolkit.bat / missing_mega_vault_launcher | none | MISSING_BEHAVIOR — no matching native operation mapping |
| portable.tools.bluescreenview | Config/tools.catalog / BlueScreenView.exe | Export-AuditLogs | MISSING_BEHAVIOR — no matching native operation mapping |
| portable.tools.hdsentinel | Config/tools.catalog / Hard Disk Sentinel.exe | Get-DriveHealth | MISSING_BEHAVIOR — no matching native operation mapping |
| portable.tools.wscc | Config/tools.catalog / Windows System Control Center.exe | none | MISSING_BEHAVIOR — no matching native operation mapping |
| portable.tools.ipscanner | Config/tools.catalog / ipscan.exe | Get-NetTCPConnection | MISSING_BEHAVIOR — no matching native operation mapping |
| apps.100.bundle_install | Toolkit.bat / menu_1click_100_apps | Invoke-WinGetInstall | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.oneclick.super_repair | Modules/OneClickSuperRepair.ps1 / Invoke-FullHealing | Invoke-FullHealing | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.inventory.system_report | Modules/SystemInventoryReport.ps1 / Invoke-GenerateReport | Invoke-GenerateReport | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.battery.report | Modules/BatteryReport.cmd / powercfg /batteryreport | Invoke-BatteryReport | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.report_center.audit_logs | Modules/ToolkitReportCenter.ps1 / Export-AuditLogs | Export-AuditLogs | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.watchdog.selfheal | Modules/SelfHeal-Watchdog.ps1 / SelfHealWatchdog | Get-Status | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.gui_repair.selfrepair | Modules/GUI-SelfRepair.ps1 / GUI-SelfRepair | none | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.debloat.win11 | Modules/Win11Debloat.ps1 / Invoke-SafeDebloat | Invoke-SafeDebloat | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.favorites.bundle | Config/favorites.bundle / favorites_bundle | none | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.install_history.tracking | Config/custom_bundle.txt / install_history | Get-InstalledSoftware | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.winget.custom_bundles | Config/custom_winget_apps.bundle / custom_winget_bundle | Invoke-WinGetInstall | MISSING_BEHAVIOR — no matching native operation mapping |
| standalone.tools.catalog_registry | Config/tools.catalog / tools_catalog | none | MISSING_BEHAVIOR — no matching native operation mapping |
| office.outlook.scanpst | Toolkit.bat / scanpst.exe | office.outlook.scanpst | MISSING_BEHAVIOR |
| office.c2r.online_repair | Toolkit.bat / OfficeClickToRun.exe RepairType=FullRepair | office.repair.online | MISSING_BEHAVIOR |
| office.onedrive.reset | Toolkit.bat / onedrive.exe /reset | office.onedrive.reset | MISSING_BEHAVIOR |
| office.teams.cleancache | Toolkit.bat / clean_teams_cache | office.teams.cleancache | MISSING_BEHAVIOR |
| remote.nas.test | Toolkit.bat / test_nas_connectivity | remote.nas.test | MISSING_BEHAVIOR |
| boot.bcd.backup | Toolkit.bat / bcdedit /export | boot.bcd.backup | MISSING_BEHAVIOR |
| policy.secpol.launch | Toolkit.bat / secpol.msc | policy.secpol.launch | MISSING_BEHAVIOR |
| policy.wu.diagnose | Toolkit.bat / diagnose_wu_policy | policy.wu.diagnose | MISSING_BEHAVIOR |
| software.winget.catalog | custom_winget_apps.bundle / Toolkit.bat / 100_apps_catalog | software.install | MISSING_BEHAVIOR |
| software.bundle.install | custom_winget_apps.bundle / batch_software_deploy | software.bundle.install | MISSING_BEHAVIOR |
| software.bundle.custom | custom_winget_apps.bundle / custom_bundle_builder | software.bundle.custom.save | MISSING_BEHAVIOR |
| software.portable.launcher | tools.catalog / Toolkit.bat / portable_tools_catalog | portable.launch | MISSING_BEHAVIOR |
| deployment.runtimes.manager | Toolkit.bat / runtimes_deployment_helpers | deployment.runtime.install | MISSING_BEHAVIOR |
| deployment.store.repair | Toolkit.bat / wsreset_store_repair | deployment.store.repair | MISSING_BEHAVIOR |
| software.history.audit | Toolkit.bat / software_install_history | none | MISSING_BEHAVIOR — no matching native operation mapping |
| hub.problem_master | ProblemMaster.ps1 / problem_master_hub | repair.autofix.plan_execute | MISSING_BEHAVIOR |
| hub.issue_library | IssueLibrary.json / issue_library | none | MISSING_BEHAVIOR — no matching native operation mapping |
| search.smart_center | SmartSearch.ps1 / smart_search_center | none | MISSING_BEHAVIOR — no matching native operation mapping |
| repair.one_click_super | OneClickSuperRepair.ps1 / one_click_super_repair | repair.super.full_pipeline | MISSING_BEHAVIOR |
| ai.smart_autofix | AICopilot.ps1 / ai_smart_auto_fix | repair.autofix.plan_execute | MISSING_BEHAVIOR |
| system.selfheal_watchdog | ToolkitWatchdog.ps1 / selfheal_watchdog | system.selfheal.run | MISSING_BEHAVIOR |
| quick.favorites_recent | QuickAccess.json / favorites_recent_operations | none | MISSING_BEHAVIOR — no matching native operation mapping |
| cmd.vault.catalog | CMDVault.json / cmd_vault_knowledge_base | none | MISSING_BEHAVIOR — no matching native operation mapping |
| cmd.vault.runner | MegaCommandVault.ps1 / mega_command_runner | server/operations/registry.ts | MISSING_BEHAVIOR — no matching native operation mapping |
| perf.optimizer.wizard | PerformanceOptimization.ps1 / safe_performance_optimizer | perf.optimizer.execute | MISSING_BEHAVIOR |
| perf.temp.cleanup | DiskCleaner.bat / temp_cleanup_storage_sense | perf.temp.clean | MISSING_BEHAVIOR |
| perf.power.manager | PowerManagement.bat / powercfg_energy_battery | perf.power.switch | MISSING_BEHAVIOR |
| sys.admin.quick_utilities | AdminTools.bat / quick_admin_msc_consoles | sys.admin.* | MISSING_BEHAVIOR — no matching native operation mapping |
| dev.tools.suite | DevTools.ps1 / wsl_hyperv_runtimes_audit | dev.environment.info | MISSING_BEHAVIOR |
