import React, { useState, useEffect } from 'react';
import {
  Users,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { operationsClient } from '../../api/operationsClient';

interface AccountsSectionProps {
  onExecuteOperation?: (
    operationId: string,
    params?: Record<string, any>,
    requiresAdmin?: boolean
  ) => void;
}

export const AccountsSection: React.FC<AccountsSectionProps> = ({ onExecuteOperation }) => {
  const [accountsData, setAccountsData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confirmAdminToggle, setConfirmAdminToggle] = useState<boolean | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await operationsClient.getUserAccounts();
      setAccountsData(data);
    } catch (err) {
      console.error('Failed to load accounts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdminToggleConfirm = (enable: boolean) => {
    if (onExecuteOperation) {
      onExecuteOperation(
        'user.admin_account.enable',
        { enable, confirmation: true },
        true
      );
    }
    setConfirmAdminToggle(null);
    setTimeout(loadData, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Launchers */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              User & Account Security Governance
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit local user accounts, administrative rights, security groups, and native user management consoles.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExecuteOperation?.('user.account_settings.launch', {}, false)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
            title="Open Windows Account Settings"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={() => onExecuteOperation?.('user.netplwiz.launch', {}, true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
            title="Open netplwiz (User Accounts)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>netplwiz</span>
          </button>
          <button
            onClick={() => onExecuteOperation?.('user.lusrmgr.console', {}, true)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1 transition-colors"
            title="Open Local Users and Groups (lusrmgr.msc - Windows Pro/Enterprise/Education only)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>lusrmgr.msc</span>
          </button>
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* lusrmgr Windows Edition Compatibility Banner */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <strong>Local Users & Groups Console (lusrmgr.msc):</strong> Native MMC snap-in supported on Windows Pro, Enterprise, and Education editions. On Windows Home editions, use netplwiz or Windows Settings.
          </span>
        </div>
      </div>

      {accountsData && (
        <>
          {/* Current User Session Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Active User Session
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
                INTERACTIVE SESSION
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Username</span>
                <span className="text-slate-100 font-bold text-sm">
                  {accountsData.currentUser.username}
                </span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Domain / Computer</span>
                <span className="text-slate-200">{accountsData.currentUser.domain}</span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Privilege Scope</span>
                <span className="text-indigo-400 font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{accountsData.currentUser.isAdmin ? 'Elevated Administrator' : 'Standard User'}</span>
                </span>
              </div>
              <div className="bg-slate-800/40 p-2.5 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Security SID</span>
                <span className="text-slate-400 text-[10px] truncate block" title={accountsData.currentUser.sid}>
                  {accountsData.currentUser.sid}
                </span>
              </div>
            </div>
          </div>

          {/* Local User Accounts List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span>Local Accounts Inventory ({accountsData.localUsers.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {accountsData.localUsers.map((user: any) => (
                <div
                  key={user.username}
                  className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs">
                          {user.username.charAt(0)}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-100">{user.username}</h5>
                          <span className="text-[10px] text-slate-400">{user.accountType}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {user.isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/60 font-semibold">
                            ADMIN
                          </span>
                        )}
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${
                            user.enabled
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                              : 'bg-slate-800 text-slate-500 border-slate-700'
                          }`}
                        >
                          {user.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                      {user.description || 'Local system user account.'}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Pass Required: {user.passwordRequired ? 'Yes' : 'No'}</span>
                    {user.username === 'Administrator' && (
                      <button
                        onClick={() => setConfirmAdminToggle(!user.enabled)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-sans font-medium"
                      >
                        {user.enabled ? 'Disable' : 'Enable'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local Security Groups */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Local Security Groups & Access Tokens
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accountsData.localGroups.map((group: any) => (
                <div
                  key={group.groupName}
                  className="bg-slate-800/40 border border-slate-800 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-100 font-mono flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{group.groupName}</span>
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {group.members.length} members
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {group.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {group.members.map((member: string) => (
                      <span
                        key={member}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/60"
                      >
                        {member}
                      </span>
                    ))}
                    {group.members.length === 0 && (
                      <span className="text-[10px] text-slate-500 italic">No assigned members</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced -> Accounts Security Governance */}
          <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Advanced Accounts Security Governance
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                ELEVATION REQUIRED
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The built-in Windows <code className="text-indigo-300 font-mono">Administrator</code> account operates with unrestricted administrative privilege without standard User Account Control (UAC) prompts. Microsoft best practice recommends leaving this account disabled unless required for offline system recovery.
            </p>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Built-In Administrator Account ({accountsData.localUsers.find((u: any) => u.username === 'Administrator')?.enabled ? 'Active' : 'Disabled'})
                </span>
                <span className="text-[11px] text-slate-400">
                  Command: <code className="text-slate-300 font-mono">net user Administrator /active:{accountsData.localUsers.find((u: any) => u.username === 'Administrator')?.enabled ? 'no' : 'yes'}</code>
                </span>
              </div>

              <button
                onClick={() => setConfirmAdminToggle(!accountsData.localUsers.find((u: any) => u.username === 'Administrator')?.enabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 ${
                  accountsData.localUsers.find((u: any) => u.username === 'Administrator')?.enabled
                    ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {accountsData.localUsers.find((u: any) => u.username === 'Administrator')?.enabled ? 'Disable Administrator' : 'Enable Administrator'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Built-in Administrator Toggle Confirmation Dialog */}
      {confirmAdminToggle !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-amber-800/80 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-100">
                {confirmAdminToggle ? 'Enable' : 'Disable'} Built-In Administrator
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                You are requesting to {confirmAdminToggle ? 'enable' : 'disable'} the built-in Windows Administrator account:
              </p>
              <div className="p-2.5 rounded bg-slate-950 font-mono text-indigo-300 border border-slate-800">
                net user Administrator /active:{confirmAdminToggle ? 'yes' : 'no'}
              </div>
              <div className="p-3 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 space-y-1">
                <p><strong>Security Warning:</strong> Enabling this account expands credential attack surface area and bypasses default UAC isolation tokens.</p>
                <p className="text-[11px] text-amber-400/90">Audit Notice: All state modifications will be permanently recorded in the Akshigo security audit log.</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setConfirmAdminToggle(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdminToggleConfirm(confirmAdminToggle)}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-sm"
              >
                Confirm State Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
