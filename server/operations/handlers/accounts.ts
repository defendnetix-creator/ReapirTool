/**
 * User / Account Management Operations Handler
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.4: Safe User & Group Enumeration, Profile Discovery, and Console Launchers
 */

import {
  OperationJob,
  LocalUserInfo,
  LocalGroupInfo,
  UserAccountsData
} from '../types.js';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Deterministic in-memory account state
const localUsersData: LocalUserInfo[] = [
  {
    username: 'User',
    fullName: 'Primary Workstation User',
    enabled: true,
    isAdmin: true,
    accountType: 'Microsoft Account',
    passwordRequired: true,
    passwordExpires: false,
    lastLogon: '2026-09-19T05:00:00.000Z',
    profilePath: 'C:\\Users\\User',
    description: 'Built-in local interactive workstation owner account.'
  },
  {
    username: 'Administrator',
    fullName: '',
    enabled: false,
    isAdmin: true,
    accountType: 'Local',
    passwordRequired: true,
    passwordExpires: false,
    profilePath: 'C:\\Users\\Administrator',
    description: 'Built-in account for administering the computer/domain.'
  },
  {
    username: 'DefaultAccount',
    fullName: '',
    enabled: false,
    isAdmin: false,
    accountType: 'Local',
    passwordRequired: false,
    passwordExpires: false,
    profilePath: 'C:\\Users\\DefaultAccount',
    description: 'A user account managed by the system.'
  },
  {
    username: 'Guest',
    fullName: '',
    enabled: false,
    isAdmin: false,
    accountType: 'Local',
    passwordRequired: false,
    passwordExpires: false,
    profilePath: 'C:\\Users\\Guest',
    description: 'Built-in account for guest access to the computer/domain.'
  },
  {
    username: 'WDAGUtilityAccount',
    fullName: '',
    enabled: false,
    isAdmin: false,
    accountType: 'Local',
    passwordRequired: true,
    passwordExpires: true,
    profilePath: 'C:\\Users\\WDAGUtilityAccount',
    description: 'A user account that is managed and used by the system for Windows Defender Application Guard scenarios.'
  }
];

const localGroupsData: LocalGroupInfo[] = [
  {
    groupName: 'Administrators',
    description: 'Administrators have complete and unrestricted access to the computer/domain.',
    members: ['Administrator', 'User']
  },
  {
    groupName: 'Users',
    description: 'Users are prevented from making accidental or intentional system-wide changes.',
    members: ['Authenticated Users', 'INTERACTIVE', 'User']
  },
  {
    groupName: 'Performance Log Users',
    description: 'Members of this group may schedule logging of performance counters.',
    members: []
  },
  {
    groupName: 'Remote Desktop Users',
    description: 'Members in this group are granted the right to logon remotely.',
    members: []
  }
];

export function getUserAccountsData(): UserAccountsData {
  return {
    currentUser: {
      username: 'User',
      domain: 'DESKTOP-ASH8841',
      computerName: 'DESKTOP-ASH8841',
      isAdmin: true,
      sid: 'S-1-5-21-1920148201-381920412-1001',
      profilePath: 'C:\\Users\\User'
    },
    localUsers: [...localUsersData],
    localGroups: [...localGroupsData]
  };
}

export async function executeAccountsOperation(
  job: OperationJob,
  params: Record<string, any> = {},
  updateProgress: (percent: number, step: string, log: string) => void
): Promise<any> {
  const op = job.operationId;

  switch (op) {
    case 'user.accounts.list': {
      updateProgress(30, 'Enumerating Local User Accounts', '[NET] Calling Get-LocalUser and Win32_UserAccount...');
      await delay(350);
      updateProgress(70, 'Querying Local Security Groups', '[NET] Calling Get-LocalGroup and Get-LocalGroupMember...');
      await delay(350);

      const accounts = getUserAccountsData();
      updateProgress(
        100,
        'Accounts Discovered',
        `[NET] Found ${accounts.localUsers.length} local accounts and ${accounts.localGroups.length} security groups.`
      );
      return accounts;
    }

    case 'user.admin_account.enable': {
      const enable = Boolean(params.enable);
      const confirmation = Boolean(params.confirmation);

      if (!confirmation) {
        throw new Error('Toggling built-in Administrator status requires explicit confirmation.');
      }

      updateProgress(40, 'Updating Built-In Administrator State', `[NET] Executing net user Administrator /active:${enable ? 'yes' : 'no'}...`);
      await delay(450);

      const adminAcc = localUsersData.find((u) => u.username === 'Administrator');
      if (adminAcc) {
        adminAcc.enabled = enable;
      }

      updateProgress(
        100,
        'Account Updated',
        `[NET] Built-in Administrator account is now ${enable ? 'Active/Enabled' : 'Disabled'}.`
      );
      return {
        username: 'Administrator',
        enabled: enable
      };
    }

    case 'user.account_settings.launch': {
      updateProgress(50, 'Opening Windows Account Settings', '[EXEC] ms-settings:yourinfo...');
      await delay(250);
      return {
        launched: true,
        command: 'start ms-settings:yourinfo'
      };
    }

    case 'user.netplwiz.launch': {
      updateProgress(50, 'Opening User Accounts CPL', '[EXEC] netplwiz.exe...');
      await delay(250);
      return {
        launched: true,
        executable: 'netplwiz.exe'
      };
    }

    case 'user.lusrmgr.console': {
      updateProgress(50, 'Opening Local Users and Groups MMC', '[EXEC] lusrmgr.msc...');
      await delay(250);
      return {
        launched: true,
        executable: 'lusrmgr.msc'
      };
    }

    default:
      throw new Error(`Unsupported account operation: ${op}`);
  }
}
