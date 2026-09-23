# ═══════════════════════════════════════════════════════════════════
# ASHtech PC Toolkit Pro — Smart Menu Search Router
# Unencoded, transparent replacement for legacy -EncodedCommand (Phase 2 Task 8)
# ═══════════════════════════════════════════════════════════════════
$q = $env:q
if ([string]::IsNullOrWhiteSpace($q)) { exit 0 }

$rules = @(
    @('problem_master_hub','(?i)problem|problems|issue|issues|allinone|all-in-one|master|fix|repair|troubleshoot|troubleshooting'),
    @('win_indexing','(?i)search|index|indexing|cortana'),
    @('menu_network_internet','(?i)network|internet|wifi|dns|proxy|vpn|ping|ip|adapter|tcp|smb|share|nas'),
    @('menu_printer_spooler','(?i)printer|spooler|print|scanner|queue'),
    @('cyber_pc_guard','(?i)hack|hacking|hacked|brute|bruteforce|brute-force|flood|attack|breach|compromise|suspicious|port|ports|failed|failedlogin|failed-login|logon|4625|4624'),
    @('menu_security_defender','(?i)security|defender|antivirus|firewall|bitlocker|malware|privacy|usb|cyber'),
    @('menu_windows_repair','(?i)repair|sfc|dism|boot|bcd|registry|dll|explorer|store|troubleshoot|issue|fix'),
    @('menu_performance_optimization','(?i)performance|slow|ram|cpu|cleanup|speed|bsod|optimize|defrag|cache|boost|minimum|lowend|low-end'),
    @('menu_storage_disk','(?i)disk|storage|chkdsk|partition|vhd|volume|drive'),
    @('menu_user_account','(?i)user|account|password|profile|credential|login|admin'),
    @('menu_backup_restore','(?i)backup|restore|recovery|restorepoint|image'),
    @('bootable_usb_creator','(?i)bootable|pendrive|iso|rufus|ventoy|winpe|media creation|usbboot|bootusb|boot-usb'),
    @('driver_auto_center','(?i)driver|drivers|hardware|device|audio|display|bluetooth|camera|gpu|usb|hp|dell|lenovo|intel|nvidia|amd|realtek|qualcomm|mediatek|oem|pnp|pnputil|inf'),
    @('menu_update_activation','(?i)update|activation|license|key|windowsupdate|wsus'),
    @('menu_office_outlook','(?i)office|outlook|teams|zoom|onedrive|cloud'),
    @('menu_remote_rdp','(?i)remote|rdp|mstsc|vpn|assistance'),
    @('menu_bios_boot','(?i)bios|uefi|boot|tpm|safemode|safe'),
    @('menu_registry_policy','(?i)gpo|policy|gpedit|registry|regedit'),
    @('menu_services_features','(?i)service|services|feature|optionalfeatures|windowsfeatures'),
    @('menu_event_logs','(?i)event|log|logs|viewer|evtx'),
    @('menu_live_monitor','(?i)monitor|health|report|dashboard|live'),
    @('menu_download_deploy','(?i)download|deploy|install|installer|mass|software|app|apps|winget|5000|catalog'),
    @('menu_quick_access','(?i)quick|tool|tools|shortcut|control panel|settings'),
    @('menu_power_user_dev','(?i)dev|developer|vscode|git|node|python|hyper|wsl'),
    @('menu_settings_themes','(?i)theme|color|about|setting|settings'),
    @('cmd_vault','(?i)cmd|command|commands|powershell|terminal|vault|run|launch|exe|script|syntax|10000'),
    @('windows_ai_controls','(?i)ai|copilot|recall|windowsai|windows-ai|bing|websearch|web-search|widgets|suggestions')
)

foreach ($r in $rules) {
    if ($q -match $r[1]) {
        [Console]::WriteLine($r[0])
        exit 0
    }
}
