import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, RefreshCw, WifiOff, ArrowRight } from 'lucide-react';
import { LicenseClientState } from '../licensing/types';

interface ExpiringBannerProps {
  licenseState: LicenseClientState;
  onOpenSubscription: () => void;
  onOpenActivation: () => void;
}

export const ExpiringBanner: React.FC<ExpiringBannerProps> = ({
  licenseState,
  onOpenSubscription,
  onOpenActivation
}) => {
  const { status, daysRemaining, offlineGraceRemainingDays } = licenseState;

  if (status === 'ACTIVE') return null;

  if (status === 'EXPIRING_SOON') {
    return (
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-200">
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Subscription Notice:</strong> Your commercial license expires in{' '}
            <strong className="text-amber-300">{daysRemaining} days</strong>. Renew now to avoid interruption to Pro tools.
          </span>
        </div>
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-200 text-xs font-medium transition-colors"
        >
          <span>Renew Subscription</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (status === 'OFFLINE_GRACE') {
    return (
      <div className="bg-gradient-to-r from-blue-500/15 via-blue-600/10 to-transparent border-b border-blue-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-blue-200">
        <div className="flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Offline License Active:</strong> {offlineGraceRemainingDays} days remaining in offline grace window. Reconnect to refresh token.
          </span>
        </div>
        <button
          onClick={onOpenSubscription}
          className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-200 text-xs font-medium transition-colors"
        >
          <span>License Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (status === 'EXPIRED' || status === 'REVOKED' || status === 'SUSPENDED') {
    return (
      <div className="bg-gradient-to-r from-rose-500/20 via-rose-600/15 to-transparent border-b border-rose-500/40 px-6 py-2.5 flex items-center justify-between text-xs text-rose-200">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>
            <strong>
              {status === 'EXPIRED'
                ? 'Subscription Expired:'
                : status === 'REVOKED'
                ? 'License Revoked:'
                : 'Subscription Suspended:'}
            </strong>{' '}
            Pro repair and automation tools are locked. Historical logs and diagnostics remain viewable.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenActivation}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-200 text-xs font-medium transition-colors"
          >
            Enter Key
          </button>
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/30 hover:bg-rose-500/40 border border-rose-500/50 rounded-lg text-rose-200 text-xs font-medium transition-colors"
          >
            <span>Renew Plan</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
