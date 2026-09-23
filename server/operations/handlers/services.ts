/**
 * Windows Services & Optional Features Operations Handler
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.4: Service Inventory, Control, Critical State Detection, and DISM Features
 */

import {
  OperationJob,
  ServiceItem,
  CriticalServiceStatus,
  OptionalFeatureInfo
} from '../types.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Critical services that should NEVER be stopped or disabled arbitrarily
const CRITICAL_SERVICE_NAMES = new Set([
  'rpcss',
  'dcomlaunch',
  'wuauserv',
  'bits',
  'cryptsvc',
  'spooler',
  'msiserver',
  'w32time',
  'wsearch',
  'bthserv',
  'audiosrv',
  'dhcp',
  'dnscache',
  'windefend',
  'mpssvc',
  'eventlog'
]);

// Deterministic in-memory services inventory
let servicesState: ServiceItem[] = [
  {
    name: 'wuauserv',
    displayName: 'Windows Update',
    status: 'Running',
    startType: 'Manual',
    account: 'LocalSystem',
    pid: 1048,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'System'
  },
  {
    name: 'bits',
    displayName: 'Background Intelligent Transfer Service',
    status: 'Running',
    startType: 'Automatic (Delayed)',
    account: 'LocalSystem',
    pid: 1412,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'Network'
  },
  {
    name: 'cryptsvc',
    displayName: 'Cryptographic Services',
    status: 'Running',
    startType: 'Automatic',
    account: 'NetworkService',
    pid: 884,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'Security'
  },
  {
    name: 'spooler',
    displayName: 'Print Spooler',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalSystem',
    pid: 1920,
    dependencies: ['http', 'rpcss'],
    isCritical: true,
    category: 'Hardware'
  },
  {
    name: 'msiserver',
    displayName: 'Windows Installer',
    status: 'Stopped',
    startType: 'Manual',
    account: 'LocalSystem',
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'System'
  },
  {
    name: 'w32time',
    displayName: 'Windows Time',
    status: 'Running',
    startType: 'Manual',
    account: 'LocalService',
    pid: 2110,
    dependencies: [],
    isCritical: true,
    category: 'System'
  },
  {
    name: 'wsearch',
    displayName: 'Windows Search',
    status: 'Running',
    startType: 'Automatic (Delayed)',
    account: 'LocalSystem',
    pid: 3044,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'System'
  },
  {
    name: 'bthserv',
    displayName: 'Bluetooth Support Service',
    status: 'Running',
    startType: 'Manual',
    account: 'LocalService',
    pid: 1840,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'Hardware'
  },
  {
    name: 'audiosrv',
    displayName: 'Windows Audio',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalService',
    pid: 1228,
    dependencies: ['audioendpointbuilder', 'rpcss'],
    isCritical: true,
    category: 'Audio/Visual'
  },
  {
    name: 'dhcp',
    displayName: 'DHCP Client',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalService',
    pid: 912,
    dependencies: ['nsi', 'tdx'],
    isCritical: true,
    category: 'Network'
  },
  {
    name: 'dnscache',
    displayName: 'DNS Client',
    status: 'Running',
    startType: 'Automatic',
    account: 'NetworkService',
    pid: 928,
    dependencies: ['nsi', 'tdx'],
    isCritical: true,
    category: 'Network'
  },
  {
    name: 'windefend',
    displayName: 'Microsoft Defender Antivirus Service',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalSystem',
    pid: 4128,
    dependencies: ['rpcss'],
    isCritical: true,
    category: 'Security'
  },
  {
    name: 'sysmain',
    displayName: 'SysMain (Superfetch)',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalSystem',
    pid: 2410,
    dependencies: ['rpcss'],
    isCritical: false,
    category: 'System'
  },
  {
    name: 'diagtrack',
    displayName: 'Connected User Experiences and Telemetry',
    status: 'Running',
    startType: 'Automatic',
    account: 'LocalSystem',
    pid: 2980,
    dependencies: ['rpcss'],
    isCritical: false,
    category: 'System'
  }
];

let optionalFeaturesState: OptionalFeatureInfo[] = [
  {
    featureName: 'Microsoft-Hyper-V-All',
    state: 'Enabled',
    restartRequired: false,
    category: 'Virtualization',
    description: 'Provides services and management tools for creating and running virtual machines.'
  },
  {
    featureName: 'Microsoft-Windows-Subsystem-Linux',
    state: 'Enabled',
    restartRequired: false,
    category: 'Developer',
    description: 'Provides a platform to run native Linux ELF64 binaries on Windows.'
  },
  {
    featureName: 'VirtualMachinePlatform',
    state: 'Enabled',
    restartRequired: false,
    category: 'Virtualization',
    description: 'Enables platform support for virtual machines and WSL 2 virtualization backend.'
  },
  {
    featureName: 'NetFx3',
    state: 'Enabled',
    restartRequired: false,
    category: 'Developer',
    description: '.NET Framework 3.5 (includes .NET 2.0 and 3.0) runtime engine.'
  },
  {
    featureName: 'NetFx4-AdvSrvs',
    state: 'Enabled',
    restartRequired: false,
    category: 'Developer',
    description: '.NET Framework 4.8 Advanced Services (WCF Services, TCP Port Sharing).'
  },
  {
    featureName: 'Windows-Defender-ApplicationGuard',
    state: 'Disabled',
    restartRequired: false,
    category: 'Security',
    description: 'Hardware isolation for untrusted Microsoft Edge browser sessions.'
  },
  {
    featureName: 'TelnetClient',
    state: 'Disabled',
    restartRequired: false,
    category: 'Legacy',
    description: 'Legacy character-based terminal client for connecting to remote Telnet servers.'
  },
  {
    featureName: 'TFTP',
    state: 'Disabled',
    restartRequired: false,
    category: 'Legacy',
    description: 'Trivial File Transfer Protocol client for network device boot transfers.'
  }
];

export function getServicesInventoryData(): ServiceItem[] {
  return [...servicesState];
}

export function getCriticalServicesStatusData(): CriticalServiceStatus[] {
  const criticalMap: Record<string, string> = {
    wuauserv: 'Windows Update',
    bits: 'Background Intelligent Transfer Service',
    cryptsvc: 'Cryptographic Services',
    spooler: 'Print Spooler',
    msiserver: 'Windows Installer',
    w32time: 'Windows Time',
    wsearch: 'Windows Search',
    bthserv: 'Bluetooth Support Service',
    audiosrv: 'Windows Audio',
    dhcp: 'DHCP Client',
    dnscache: 'DNS Client'
  };

  return Object.entries(criticalMap).map(([sName, dName]) => {
    const s = servicesState.find((x) => x.name.toLowerCase() === sName.toLowerCase());
    const isRunning = s?.status === 'Running';
    return {
      serviceName: sName,
      displayName: dName,
      expectedStatus: 'Running',
      currentStatus: isRunning ? 'Running' : 'Stopped',
      isCompliant: isRunning || sName === 'msiserver', // msiserver is demand-start
      remediationAvailable: !isRunning,
      description: `Essential Windows subsystem component (${sName}).`
    };
  });
}

export function getOptionalFeaturesData(): OptionalFeatureInfo[] {
  return [...optionalFeaturesState];
}

export async function executeServicesOperation(
  job: OperationJob,
  params: Record<string, any> = {},
  updateProgress: (percent: number, step: string, log: string) => void
): Promise<any> {
  const op = job.operationId;

  switch (op) {
    case 'services.inventory.list': {
      updateProgress(30, 'Querying Service Control Manager', '[SCM] Enumerating Win32_Service instances via CIM...');
      await delay(350);
      updateProgress(100, 'Inventory Complete', `[SCM] Retrieved ${servicesState.length} service entries.`);
      return {
        count: servicesState.length,
        services: servicesState
      };
    }

    case 'services.critical.detect': {
      updateProgress(30, 'Scanning Critical Subsystem Services', '[SCM] Inspecting Windows Update, BITS, Spooler, CryptSvc, and DHCP...');
      await delay(400);
      const critical = getCriticalServicesStatusData();
      const stoppedCount = critical.filter((c) => !c.isCompliant).length;
      updateProgress(
        100,
        'Critical Audit Complete',
        `[SCM] Evaluated ${critical.length} critical services. ${stoppedCount} need remediation.`
      );
      return {
        totalCritical: critical.length,
        stoppedCount,
        critical
      };
    }

    case 'services.start': {
      const serviceName = params.serviceName?.trim()?.toLowerCase();
      if (!serviceName) {
        throw new Error('Missing serviceName parameter.');
      }

      updateProgress(30, `Starting Service: ${serviceName}`, `[SCM] Sending start command to ${serviceName}...`);
      await delay(400);

      const target = servicesState.find((s) => s.name.toLowerCase() === serviceName);
      if (target) {
        target.status = 'Running';
      }

      updateProgress(100, 'Service Started', `[SCM] Service "${serviceName}" is now Running.`);
      return {
        serviceName,
        status: 'Running'
      };
    }

    case 'services.stop': {
      const serviceName = params.serviceName?.trim()?.toLowerCase();
      if (!serviceName) {
        throw new Error('Missing serviceName parameter.');
      }

      // Safety rule: do not stop security or critical services
      if (CRITICAL_SERVICE_NAMES.has(serviceName)) {
        throw new Error(`Safety Protection: Stopping critical system service "${serviceName}" is blocked to prevent system instability.`);
      }

      updateProgress(30, `Stopping Service: ${serviceName}`, `[SCM] Requesting stop for ${serviceName}...`);
      await delay(400);

      const target = servicesState.find((s) => s.name.toLowerCase() === serviceName);
      if (target) {
        target.status = 'Stopped';
      }

      updateProgress(100, 'Service Stopped', `[SCM] Service "${serviceName}" is now Stopped.`);
      return {
        serviceName,
        status: 'Stopped'
      };
    }

    case 'services.restart': {
      const serviceName = params.serviceName?.trim()?.toLowerCase();
      if (!serviceName) {
        throw new Error('Missing serviceName parameter.');
      }

      updateProgress(20, `Stopping Service: ${serviceName}`, `[SCM] Sending stop signal to ${serviceName}...`);
      await delay(400);
      updateProgress(60, `Starting Service: ${serviceName}`, `[SCM] Sending start signal to ${serviceName}...`);
      await delay(500);

      const target = servicesState.find((s) => s.name.toLowerCase() === serviceName);
      if (target) {
        target.status = 'Running';
      }

      updateProgress(100, 'Service Restarted', `[SCM] Service "${serviceName}" restarted successfully.`);
      return {
        serviceName,
        status: 'Running'
      };
    }

    case 'services.startup_type.set': {
      const serviceName = params.serviceName?.trim()?.toLowerCase();
      const startType = params.startType;
      if (!serviceName || !startType) {
        throw new Error('Missing serviceName or startType parameter.');
      }

      if (CRITICAL_SERVICE_NAMES.has(serviceName) && startType === 'Disabled') {
        throw new Error(`Safety Protection: Disabling critical system service "${serviceName}" is forbidden.`);
      }

      updateProgress(50, 'Setting Service Start Type', `[SCM] Setting startup type of ${serviceName} to ${startType}...`);
      await delay(400);

      const target = servicesState.find((s) => s.name.toLowerCase() === serviceName);
      if (target) {
        target.startType = startType;
      }

      updateProgress(100, 'Startup Type Updated', `[SCM] Service "${serviceName}" startup type set to ${startType}.`);
      return {
        serviceName,
        startType
      };
    }

    case 'services.optional_features.dism': {
      updateProgress(30, 'Invoking DISM Feature Engine', '[DISM] Running dism /online /get-features /format:table...');
      await delay(500);
      updateProgress(100, 'Features Enumerated', `[DISM] Retrieved ${optionalFeaturesState.length} optional features.`);
      return {
        count: optionalFeaturesState.length,
        features: optionalFeaturesState
      };
    }

    case 'services.optional_features.launch': {
      updateProgress(50, 'Launching Windows Features Dialog', '[EXEC] Launching optionalfeatures.exe...');
      await delay(300);
      updateProgress(100, 'Launched', '[EXEC] Windows Features (Turn Windows features on or off) launched.');
      return {
        launched: true,
        executable: 'optionalfeatures.exe'
      };
    }

    case 'services.hyperv.status': {
      const hyperv = optionalFeaturesState.find((f) => f.featureName.includes('Hyper-V'));
      return {
        feature: 'Hyper-V',
        state: hyperv ? hyperv.state : 'Unknown'
      };
    }

    case 'services.wsl.status': {
      const wsl = optionalFeaturesState.find((f) => f.featureName.includes('Subsystem-Linux'));
      return {
        feature: 'Windows Subsystem for Linux (WSL)',
        state: wsl ? wsl.state : 'Unknown'
      };
    }

    case 'services.dotnet.status': {
      const dotnet = optionalFeaturesState.filter((f) => f.featureName.includes('NetFx'));
      return {
        feature: '.NET Framework Runtimes',
        frameworks: dotnet
      };
    }

    default:
      throw new Error(`Unsupported service operation: ${op}`);
  }
}
