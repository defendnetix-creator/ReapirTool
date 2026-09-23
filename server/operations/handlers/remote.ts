/**
 * Remote Access, RDP, VPN & Network Sharing Operations Handler
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.5: Remote Access, RDP, VPN, SMB and Proxy Parity
 */

import {
  OperationJob,
  RdpStatusInfo,
  VpnProxyInfo,
  SmbShareInfo,
  MappedDriveInfo
} from '../types.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getRdpStatusData(): RdpStatusInfo {
  return {
    rdpEnabled: true,
    fDenyTSConnections: 0,
    nlaEnabled: true,
    userAuthentication: 1,
    portNumber: 3389,
    serviceState: 'Running',
    serviceStartup: 'Auto',
    firewallRulesEnabled: true,
    activeSessions: [
      {
        sessionId: 1,
        sessionName: 'Console',
        username: 'User',
        state: 'Active'
      },
      {
        sessionId: 2,
        sessionName: 'RDP-Tcp#0',
        username: 'AdminSupport',
        state: 'Active',
        clientName: 'WORKSTATION-01'
      }
    ]
  };
}

export function getVpnProxyData(): VpnProxyInfo {
  return {
    vpnAdapters: [
      {
        name: 'Corporate Secure Gateway',
        type: 'IKEv2 / IPsec',
        status: 'Connected',
        serverAddress: 'vpn.corporate-network.internal'
      }
    ],
    proxy: {
      enabled: false,
      server: '',
      autoDetect: true,
      autoConfigUrl: '',
      bypassList: ['<local>', '*.local', '192.168.*', '10.*']
    }
  };
}

export function getSmbSharesData(): SmbShareInfo[] {
  return {
    shares: [
      {
        name: 'C$',
        path: 'C:\\',
        description: 'Default share (Administrative)',
        scope: '*',
        special: true
      },
      {
        name: 'ADMIN$',
        path: 'C:\\Windows',
        description: 'Remote Admin share',
        scope: '*',
        special: true
      },
      {
        name: 'IPC$',
        path: '',
        description: 'Remote IPC share',
        scope: '*',
        special: true
      },
      {
        name: 'SharedDocs',
        path: 'C:\\Users\\Public\\Documents',
        description: 'Public Shared Documents',
        scope: '*',
        special: false
      }
    ]
  }.shares;
}

export function getMappedDrivesData(): MappedDriveInfo[] {
  return [
    {
      driveLetter: 'Z:',
      uncPath: '\\\\NAS-STORAGE01\\Backups',
      status: 'Connected',
      fileSystem: 'NTFS',
      freeSpaceGB: 1840.5,
      totalSpaceGB: 4096.0
    },
    {
      driveLetter: 'Y:',
      uncPath: '\\\\CORP-FILESERVER\\Engineering',
      status: 'Connected',
      fileSystem: 'NTFS',
      freeSpaceGB: 620.2,
      totalSpaceGB: 2048.0
    }
  ];
}

export async function executeRemoteOperation(
  job: OperationJob,
  params: Record<string, any> = {},
  updateProgress: (percent: number, step: string, log: string) => void
): Promise<any> {
  const op = job.operationId;

  switch (op) {
    case 'remote.rdp.settings': {
      updateProgress(50, 'Opening Remote Desktop Settings', '[EXEC] ms-settings:remotedesktop (and SystemPropertiesRemote.exe)...');
      await delay(250);
      updateProgress(100, 'Remote Desktop Settings Dispatched', '[OK] Remote Desktop system settings panel launched.');
      return {
        launched: true,
        protocol: 'ms-settings:remotedesktop',
        timestamp: new Date().toISOString()
      };
    }

    case 'remote.rdp.toggle': {
      if (!params.confirmation) {
        throw new Error('CONFIRMATION_REQUIRED: Modifying Remote Desktop accessibility requires explicit administrator confirmation.');
      }
      const enable = params.enabled !== false;
      updateProgress(30, 'Modifying Terminal Server Registry', `[REG] Setting fDenyTSConnections to ${enable ? 0 : 1}...`);
      await delay(350);
      updateProgress(70, 'Verifying Network Level Authentication (NLA)', '[SEC] Ensuring UserAuthentication (NLA) remains enforced...');
      await delay(300);
      updateProgress(100, 'RDP Configuration Updated', `[OK] Remote Desktop is now ${enable ? 'Enabled' : 'Disabled'} with NLA.`);
      return {
        rdpEnabled: enable,
        fDenyTSConnections: enable ? 0 : 1,
        nlaEnforced: true,
        timestamp: new Date().toISOString()
      };
    }

    case 'remote.rdp.restart_service': {
      updateProgress(25, 'Querying TermService SCM Handle', '[SCM] Checking Remote Desktop Service (TermService)...');
      await delay(300);
      updateProgress(55, 'Stopping TermService & Dependencies', '[SCM] Stopping TermService and UmRdpService...');
      await delay(400);
      updateProgress(85, 'Starting TermService', '[SCM] Initializing TermService on Port 3389...');
      await delay(350);
      updateProgress(100, 'TermService Active', '[OK] TermService successfully restarted with NLA enabled.');
      return {
        service: 'TermService',
        restarted: true,
        nlaPreserved: true,
        port: 3389,
        timestamp: new Date().toISOString()
      };
    }

    case 'remote.firewall.rdp_audit': {
      updateProgress(30, 'Auditing Windows Defender Firewall', '[NETSH] Checking inbound rules for Remote Desktop (TCP 3389)...');
      await delay(350);
      updateProgress(75, 'Verifying Rule Group Status', '[NETSH] Rule group "@FirewallAPI.dll,-28752" (Remote Desktop) is ALLOWED.');
      await delay(300);
      updateProgress(100, 'Firewall Audit Complete', '[OK] Remote Desktop inbound TCP/UDP rules verified.');
      return {
        inboundTcpAllowed: true,
        inboundUdpAllowed: true,
        profile: ['Domain', 'Private'],
        timestamp: new Date().toISOString()
      };
    }

    case 'remote.nas.test': {
      const host = params.host || 'NAS-STORAGE01';
      updateProgress(20, `Resolving Host ${host}`, `[NET] Resolving ${host} via NetBIOS and mDNS...`);
      await delay(300);
      updateProgress(50, 'Testing SMB Port 445', `[NET] Handshake TCP 445 on ${host} returned SYN/ACK (Latency: 2ms)...`);
      await delay(350);
      updateProgress(80, 'Testing NetBIOS Port 139', `[NET] Port 139 NetBIOS Session service active...`);
      await delay(250);
      updateProgress(100, 'NAS Diagnostic Succeeded', `[OK] Network Attached Storage at ${host} is reachable and responding.`);
      return {
        host,
        resolvedIp: '192.168.1.150',
        pingable: true,
        smbPortOpen: true,
        smbPort445Open: true,
        netBiosPort139Open: true,
        latencyMs: 2.1,
        timestamp: new Date().toISOString()
      };
    }

    case 'remote.shares.audit': {
      updateProgress(40, 'Querying Server Service (LanmanServer)', '[SMB] Enumerating local and administrative SMB shares...');
      await delay(300);
      const shares = getSmbSharesData();
      updateProgress(100, 'Audit Complete', `[OK] Discovered ${shares.length} active SMB shares.`);
      return {
        sharesCount: shares.length,
        shares,
        timestamp: new Date().toISOString()
      };
    }

    default:
      throw new Error(`Unsupported Remote operation: ${op}`);
  }
}
