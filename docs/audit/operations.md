# Operation implementation audit

These are source-level findings, not Windows runtime certification. PARTIAL_EQUIVALENT does not mean release-ready.

| Operation | Classification | Baseline handler evidence | Finding |
|---|---|---|---|
| repair.sfc.scannow | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:42 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.sfc.verifyonly | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:62 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.sfc.scanfile | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:71 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.dism.checkhealth | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:79 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.dism.scanhealth | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:86 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.dism.restorehealth | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:95 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.dism.source_wim | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:108 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.dism.clean_store | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:118 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.sfc_dism.full | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:127 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.cbs_log.view | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:142 | No native Windows execution. Former simulation is blocked. |
| repair.wu.reset_services | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:158 | No native Windows execution. Former simulation is blocked. |
| repair.wu.softwaredist_reset | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:169 | No native Windows execution. Former simulation is blocked. |
| repair.wu.catroot2_reset | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:180 | No native Windows execution. Former simulation is blocked. |
| repair.wu.diagnostics | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:189 | No native Windows execution. Former simulation is blocked. |
| repair.wu.status | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:203 | No native Windows execution. Former simulation is blocked. |
| repair.explorer.restart | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:213 | No native Windows execution. Former simulation is blocked. |
| repair.startmenu.troubleshoot | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:222 | No native Windows execution. Former simulation is blocked. |
| repair.store.wsreset | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:231 | No native Windows execution. Former simulation is blocked. |
| repair.store.reregister | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:238 | No native Windows execution. Former simulation is blocked. |
| repair.msi.repair | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:247 | No native Windows execution. Former simulation is blocked. |
| repair.service.spooler_wuauserv | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:254 | No native Windows execution. Former simulation is blocked. |
| repair.time.sync | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:261 | No native Windows execution. Former simulation is blocked. |
| repair.recovery.create_restore_point | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:270 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.recovery.list_restore_points | PARTIAL_EQUIVALENT | server/operations/handlers/repair.ts:288 | Native command plan restored; Windows outcome/UI integration not validated. |
| repair.recovery.open_options | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:293 | No native Windows execution. Former simulation is blocked. |
| network.dns.flush | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:75 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.ip.renew | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:84 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.ip.release | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:93 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.winsock.reset | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:100 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.tcpip.reset | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:109 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.adapters.restart | MISSING_BEHAVIOR | server/operations/handlers/network.ts:118 | No native Windows execution. Former simulation is blocked. |
| network.proxy.status | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:128 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.proxy.reset | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:133 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.connectivity.test | MISSING_BEHAVIOR | server/operations/handlers/network.ts:142 | No native Windows execution. Former simulation is blocked. |
| network.ping.test | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:178 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.dns.lookup | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:194 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.traceroute | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:203 | Native command plan restored; Windows outcome/UI integration not validated. |
| network.apipa.detect | MISSING_BEHAVIOR | server/operations/handlers/network.ts:223 | No native Windows execution. Former simulation is blocked. |
| network.workflow.common_repair | MISSING_BEHAVIOR | server/operations/handlers/network.ts:231 | No native Windows execution. Former simulation is blocked. |
| network.netstat.sockets | PARTIAL_EQUIVALENT | server/operations/handlers/network.ts:246 | Native command plan restored; Windows outcome/UI integration not validated. |
| printer.inventory.get | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:77 | No native Windows execution. Former simulation is blocked. |
| printer.spooler.restart | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:82 | No native Windows execution. Former simulation is blocked. |
| printer.spooler.stop | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:99 | No native Windows execution. Former simulation is blocked. |
| printer.spooler.start | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:107 | No native Windows execution. Former simulation is blocked. |
| printer.queue.purge | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:115 | No native Windows execution. Former simulation is blocked. |
| printer.diagnostics.run | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:130 | No native Windows execution. Former simulation is blocked. |
| printer.offline.fix | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:147 | No native Windows execution. Former simulation is blocked. |
| printer.sharing.diagnose | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:161 | No native Windows execution. Former simulation is blocked. |
| printer.rpc_smb.check | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:174 | No native Windows execution. Former simulation is blocked. |
| printer.fix_0x0000011b | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:181 | No native Windows execution. Former simulation is blocked. |
| printer.fix_0x00000709 | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:198 | No native Windows execution. Former simulation is blocked. |
| printer.drivers.list | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:211 | No native Windows execution. Former simulation is blocked. |
| printer.subsystem.cleanup | MISSING_BEHAVIOR | server/operations/handlers/printer.ts:222 | No native Windows execution. Former simulation is blocked. |
| hardware.system.info | MISSING_BEHAVIOR | server/operations/handlers/hardware.ts:143 | No native Windows execution. Former simulation is blocked. |
| hardware.devices.problematic | MISSING_BEHAVIOR | server/operations/handlers/hardware.ts:159 | No native Windows execution. Former simulation is blocked. |
| hardware.battery.health | MISSING_BEHAVIOR | server/operations/handlers/hardware.ts:178 | No native Windows execution. Former simulation is blocked. |
| hardware.battery.report | MISSING_BEHAVIOR | server/operations/handlers/hardware.ts:194 | No native Windows execution. Former simulation is blocked. |
| hardware.thermal.info | MISSING_BEHAVIOR | server/operations/handlers/hardware.ts:215 | No native Windows execution. Former simulation is blocked. |
| driver.list | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:198 | No native Windows execution. Former simulation is blocked. |
| driver.problematic | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:218 | No native Windows execution. Former simulation is blocked. |
| driver.backup | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:235 | No native Windows execution. Former simulation is blocked. |
| driver.restore | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:280 | No native Windows execution. Former simulation is blocked. |
| driver.install.inf | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:319 | No native Windows execution. Former simulation is blocked. |
| driver.pnputil.enum | PARTIAL_EQUIVALENT | server/operations/handlers/driver.ts:357 | Native command plan restored; Windows outcome/UI integration not validated. |
| driver.wu.scan | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:374 | No native Windows execution. Former simulation is blocked. |
| driver.report | MISSING_BEHAVIOR | server/operations/handlers/driver.ts:397 | No native Windows execution. Former simulation is blocked. |
| storage.disks | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:137 | No native Windows execution. Former simulation is blocked. |
| storage.smart | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:156 | No native Windows execution. Former simulation is blocked. |
| storage.volumes | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:175 | No native Windows execution. Former simulation is blocked. |
| storage.chkdsk.scan | PARTIAL_EQUIVALENT | server/operations/handlers/storage.ts:194 | Native command plan restored; Windows outcome/UI integration not validated. |
| storage.chkdsk.repair | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:226 | No native Windows execution. Former simulation is blocked. |
| storage.optimize.status | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:256 | No native Windows execution. Former simulation is blocked. |
| storage.benchmark | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:280 | No native Windows execution. Former simulation is blocked. |
| storage.cleanup.analyze | MISSING_BEHAVIOR | server/operations/handlers/storage.ts:310 | No native Windows execution. Former simulation is blocked. |
| reports.system_inventory.generate | MISSING_BEHAVIOR | server/operations/handlers/reports.ts:103 | No native Windows execution. Former simulation is blocked. |
| reports.battery.generate | MISSING_BEHAVIOR | server/operations/handlers/reports.ts:137 | No native Windows execution. Former simulation is blocked. |
| reports.driver.generate | MISSING_BEHAVIOR | server/operations/handlers/reports.ts:167 | No native Windows execution. Former simulation is blocked. |
| reports.storage.generate | MISSING_BEHAVIOR | server/operations/handlers/reports.ts:198 | No native Windows execution. Former simulation is blocked. |
| backup.restore_point.create | PARTIAL_EQUIVALENT | server/operations/handlers/backup.ts:107 | Native command plan restored; Windows outcome/UI integration not validated. |
| backup.restore_points.list | PARTIAL_EQUIVALENT | server/operations/handlers/backup.ts:148 | Native command plan restored; Windows outcome/UI integration not validated. |
| backup.system_restore.launch | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:176 | No native Windows execution. Former simulation is blocked. |
| backup.files.create | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:187 | No native Windows execution. Former simulation is blocked. |
| backup.files.restore | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:228 | No native Windows execution. Former simulation is blocked. |
| backup.registry.export | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:254 | No native Windows execution. Former simulation is blocked. |
| backup.registry.restore | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:289 | No native Windows execution. Former simulation is blocked. |
| backup.recovery_options.launch | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:313 | No native Windows execution. Former simulation is blocked. |
| backup.winre.status | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:323 | No native Windows execution. Former simulation is blocked. |
| backup.system_image.launch | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:331 | No native Windows execution. Former simulation is blocked. |
| backup.vss.manage | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:157 | No native Windows execution. Former simulation is blocked. |
| backup.history.list | MISSING_BEHAVIOR | server/operations/handlers/backup.ts:341 | No native Windows execution. Former simulation is blocked. |
| services.inventory.list | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:300 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.critical.detect | MISSING_BEHAVIOR | server/operations/handlers/services.ts:310 | No native Windows execution. Former simulation is blocked. |
| services.start | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:327 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.stop | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:348 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.restart | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:374 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.startup_type.set | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:397 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.optional_features.dism | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:423 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.optional_features.launch | MISSING_BEHAVIOR | server/operations/handlers/services.ts:433 | No native Windows execution. Former simulation is blocked. |
| services.hyperv.status | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:443 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.wsl.status | PARTIAL_EQUIVALENT | server/operations/handlers/services.ts:451 | Native command plan restored; Windows outcome/UI integration not validated. |
| services.dotnet.status | MISSING_BEHAVIOR | server/operations/handlers/services.ts:459 | No native Windows execution. Former simulation is blocked. |
| logs.eventlog.query | MISSING_BEHAVIOR | server/operations/handlers/eventlogs.ts:209 | No native Windows execution. Former simulation is blocked. |
| logs.eventlog.issues | MISSING_BEHAVIOR | server/operations/handlers/eventlogs.ts:233 | No native Windows execution. Former simulation is blocked. |
| logs.eventlog.export | MISSING_BEHAVIOR | server/operations/handlers/eventlogs.ts:245 | No native Windows execution. Former simulation is blocked. |
| logs.eventviewer.launch | MISSING_BEHAVIOR | server/operations/handlers/eventlogs.ts:266 | No native Windows execution. Former simulation is blocked. |
| reports.event_log.generate | MISSING_BEHAVIOR | server/operations/handlers/eventlogs.ts:276 | No native Windows execution. Former simulation is blocked. |
| sys.process.list | PARTIAL_EQUIVALENT | server/operations/handlers/system.ts:231 | Native command plan restored; Windows outcome/UI integration not validated. |
| sys.process.terminate | MISSING_BEHAVIOR | server/operations/handlers/system.ts:241 | No native Windows execution. Former simulation is blocked. |
| sys.startup.list | MISSING_BEHAVIOR | server/operations/handlers/system.ts:277 | No native Windows execution. Former simulation is blocked. |
| sys.startup.toggle | MISSING_BEHAVIOR | server/operations/handlers/system.ts:287 | No native Windows execution. Former simulation is blocked. |
| sys.tasks.list | PARTIAL_EQUIVALENT | server/operations/handlers/system.ts:309 | Native command plan restored; Windows outcome/UI integration not validated. |
| sys.admin.env_vars | MISSING_BEHAVIOR | server/operations/handlers/system.ts:319 | No native Windows execution. Former simulation is blocked. |
| sys.admin.sysdm_cpl | MISSING_BEHAVIOR | server/operations/handlers/system.ts:327 | No native Windows execution. Former simulation is blocked. |
| sys.admin.msinfo32 | MISSING_BEHAVIOR | server/operations/handlers/system.ts:334 | No native Windows execution. Former simulation is blocked. |
| sys.admin.compmgmt | MISSING_BEHAVIOR | server/operations/handlers/system.ts:340 | No native Windows execution. Former simulation is blocked. |
| sys.admin.taskmgr | MISSING_BEHAVIOR | server/operations/handlers/system.ts:346 | No native Windows execution. Former simulation is blocked. |
| sys.admin.services_msc | MISSING_BEHAVIOR | server/operations/handlers/system.ts:352 | No native Windows execution. Former simulation is blocked. |
| sys.admin.msconfig.launch | MISSING_BEHAVIOR | server/operations/handlers/system.ts:358 | No native Windows execution. Former simulation is blocked. |
| sys.admin.regedit | MISSING_BEHAVIOR | server/operations/handlers/system.ts:364 | No native Windows execution. Former simulation is blocked. |
| sys.admin.sched_tasks | MISSING_BEHAVIOR | server/operations/handlers/system.ts:370 | No native Windows execution. Former simulation is blocked. |
| sys.admin.godmode | MISSING_BEHAVIOR | server/operations/handlers/system.ts:424 | No native Windows execution. Former simulation is blocked. |
| user.accounts.list | MISSING_BEHAVIOR | server/operations/handlers/accounts.ts:124 | No native Windows execution. Former simulation is blocked. |
| user.admin_account.enable | MISSING_BEHAVIOR | server/operations/handlers/accounts.ts:139 | No native Windows execution. Former simulation is blocked. |
| user.account_settings.launch | MISSING_BEHAVIOR | server/operations/handlers/accounts.ts:166 | No native Windows execution. Former simulation is blocked. |
| user.netplwiz.launch | MISSING_BEHAVIOR | server/operations/handlers/accounts.ts:175 | No native Windows execution. Former simulation is blocked. |
| user.lusrmgr.console | MISSING_BEHAVIOR | server/operations/handlers/accounts.ts:184 | No native Windows execution. Former simulation is blocked. |
| policy.gpupdate.force | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:90 | No native Windows execution. Former simulation is blocked. |
| policy.gpresult.run | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:104 | No native Windows execution. Former simulation is blocked. |
| policy.gpedit.launch | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:119 | No native Windows execution. Former simulation is blocked. |
| policy.report.generate | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:147 | No native Windows execution. Former simulation is blocked. |
| policy.secpol.launch | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:128 | No native Windows execution. Former simulation is blocked. |
| policy.wu.diagnose | MISSING_BEHAVIOR | server/operations/handlers/policy.ts:137 | No native Windows execution. Former simulation is blocked. |
| office.outlook.safemode | MISSING_BEHAVIOR | server/operations/handlers/office.ts:78 | No native Windows execution. Former simulation is blocked. |
| office.outlook.profiles | MISSING_BEHAVIOR | server/operations/handlers/office.ts:91 | No native Windows execution. Former simulation is blocked. |
| office.outlook.resetnavpane | MISSING_BEHAVIOR | server/operations/handlers/office.ts:102 | No native Windows execution. Former simulation is blocked. |
| office.outlook.scanpst | MISSING_BEHAVIOR | server/operations/handlers/office.ts:115 | No native Windows execution. Former simulation is blocked. |
| office.repair.quick | MISSING_BEHAVIOR | server/operations/handlers/office.ts:129 | No native Windows execution. Former simulation is blocked. |
| office.repair.online | MISSING_BEHAVIOR | server/operations/handlers/office.ts:142 | No native Windows execution. Former simulation is blocked. |
| office.onedrive.reset | MISSING_BEHAVIOR | server/operations/handlers/office.ts:155 | No native Windows execution. Former simulation is blocked. |
| office.teams.cleancache | MISSING_BEHAVIOR | server/operations/handlers/office.ts:171 | No native Windows execution. Former simulation is blocked. |
| office.zoom.cleancache | MISSING_BEHAVIOR | server/operations/handlers/office.ts:185 | No native Windows execution. Former simulation is blocked. |
| remote.rdp.settings | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:131 | No native Windows execution. Former simulation is blocked. |
| remote.rdp.toggle | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:142 | No native Windows execution. Former simulation is blocked. |
| remote.rdp.restart_service | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:160 | No native Windows execution. Former simulation is blocked. |
| remote.firewall.rdp_audit | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:177 | No native Windows execution. Former simulation is blocked. |
| remote.nas.test | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:191 | No native Windows execution. Former simulation is blocked. |
| remote.shares.audit | MISSING_BEHAVIOR | server/operations/handlers/remote.ts:212 | No native Windows execution. Former simulation is blocked. |
| boot.recovery.launch | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:56 | No native Windows execution. Former simulation is blocked. |
| boot.advanced.startup | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:67 | No native Windows execution. Former simulation is blocked. |
| boot.bcd.backup | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:84 | No native Windows execution. Former simulation is blocked. |
| boot.bootrec.scan | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:98 | No native Windows execution. Former simulation is blocked. |
| boot.bootrec.rebuild | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:119 | No native Windows execution. Former simulation is blocked. |
| boot.reagentc.enable | MISSING_BEHAVIOR | server/operations/handlers/boot.ts:137 | No native Windows execution. Former simulation is blocked. |
| software.install | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2267 | No native Windows execution. Former simulation is blocked. |
| software.upgrade | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2330 | No native Windows execution. Former simulation is blocked. |
| software.upgrade.all | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2375 | No native Windows execution. Former simulation is blocked. |
| software.uninstall | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2401 | No native Windows execution. Former simulation is blocked. |
| software.bundle.install | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2446 | No native Windows execution. Former simulation is blocked. |
| software.bundle.custom.save | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2533 | No native Windows execution. Former simulation is blocked. |
| portable.launch | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2544 | No native Windows execution. Former simulation is blocked. |
| deployment.runtime.install | MISSING_BEHAVIOR | No handler case found | No native Windows execution. Former simulation is blocked. |
| deployment.store.repair | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2584 | No native Windows execution. Former simulation is blocked. |
| deployment.winget.health | MISSING_BEHAVIOR | server/operations/handlers/software.ts:2603 | No native Windows execution. Former simulation is blocked. |
| repair.super.full_pipeline | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:298 | No native Windows execution. Former simulation is blocked. |
| repair.autofix.plan_execute | MISSING_BEHAVIOR | server/operations/handlers/repair.ts:339 | No native Windows execution. Former simulation is blocked. |
| system.selfheal.run | MISSING_BEHAVIOR | server/operations/handlers/system.ts:433 | No native Windows execution. Former simulation is blocked. |
| perf.analysis.run | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:179 | No native Windows execution. Former simulation is blocked. |
| perf.optimizer.execute | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:221 | No native Windows execution. Former simulation is blocked. |
| perf.temp.analyze | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:257 | No native Windows execution. Former simulation is blocked. |
| perf.temp.clean | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:265 | No native Windows execution. Former simulation is blocked. |
| perf.power.info | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:293 | No native Windows execution. Former simulation is blocked. |
| perf.power.switch | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:301 | No native Windows execution. Former simulation is blocked. |
| perf.power.energy_report | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:332 | No native Windows execution. Former simulation is blocked. |
| perf.boot.report | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:351 | No native Windows execution. Former simulation is blocked. |
| perf.storage_sense.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:372 | No native Windows execution. Former simulation is blocked. |
| perf.storage_sense.toggle | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:384 | No native Windows execution. Former simulation is blocked. |
| perf.visual_settings.launch | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:395 | No native Windows execution. Former simulation is blocked. |
| perf.disk_cleanup.launch | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:401 | No native Windows execution. Former simulation is blocked. |
| perf.drive.trim | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:407 | No native Windows execution. Former simulation is blocked. |
| perf.indexing.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:418 | No native Windows execution. Former simulation is blocked. |
| sys.admin.devmgmt | MISSING_BEHAVIOR | server/operations/handlers/system.ts:376 | No native Windows execution. Former simulation is blocked. |
| sys.admin.diskmgmt | MISSING_BEHAVIOR | server/operations/handlers/system.ts:382 | No native Windows execution. Former simulation is blocked. |
| sys.admin.eventvwr | MISSING_BEHAVIOR | server/operations/handlers/system.ts:388 | No native Windows execution. Former simulation is blocked. |
| sys.admin.control | MISSING_BEHAVIOR | server/operations/handlers/system.ts:394 | No native Windows execution. Former simulation is blocked. |
| sys.admin.settings | MISSING_BEHAVIOR | server/operations/handlers/system.ts:400 | No native Windows execution. Former simulation is blocked. |
| sys.admin.resmon | MISSING_BEHAVIOR | server/operations/handlers/system.ts:406 | No native Windows execution. Former simulation is blocked. |
| sys.admin.perfmon | MISSING_BEHAVIOR | server/operations/handlers/system.ts:412 | No native Windows execution. Former simulation is blocked. |
| sys.admin.terminal | MISSING_BEHAVIOR | server/operations/handlers/system.ts:418 | No native Windows execution. Former simulation is blocked. |
| dev.environment.info | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:429 | No native Windows execution. Former simulation is blocked. |
| dev.wsl.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:439 | No native Windows execution. Former simulation is blocked. |
| dev.hyperv.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:446 | No native Windows execution. Former simulation is blocked. |
| dev.sandbox.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:453 | No native Windows execution. Former simulation is blocked. |
| dev.developermode.status | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:460 | No native Windows execution. Former simulation is blocked. |
| dev.runtimes.inventory | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:467 | No native Windows execution. Former simulation is blocked. |
| power.wsl.install | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:474 | No native Windows execution. Former simulation is blocked. |
| power.hyperv.toggle | MISSING_BEHAVIOR | server/operations/handlers/performance.ts:494 | No native Windows execution. Former simulation is blocked. |
