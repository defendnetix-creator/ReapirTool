import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { LicenseClientState } from '../licensing/types';
import { ENTITLEMENT_CATALOG, getRequiredPlanForEntitlement } from '../licensing/entitlements';

interface FeatureGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: string;
  licenseState: LicenseClientState;
  onOpenSubscription: () => void;
  onOpenActivation: () => void;
}

export const FeatureGateModal: React.FC<FeatureGateModalProps> = ({
  isOpen,
  onClose,
  featureKey,
  licenseState,
  onOpenSubscription,
  onOpenActivation
}) => {
  if (!isOpen) return null;

  const meta = ENTITLEMENT_CATALOG.find((e) => e.key === featureKey);
  const requiredPlan = getRequiredPlanForEntitlement(featureKey);
  const currentPlan = licenseState.plan?.planId || 'unlicensed';
  const isExpired = licenseState.status === 'EXPIRED';
  const isRevoked = licenseState.status === 'REVOKED';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0c0e17] border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {isExpired ? 'Subscription Expired' : isRevoked ? 'License Revoked' : 'Subscription Required'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isExpired
                    ? 'Pro repairs and tools are locked pending renewal.'
                    : `Requires ${requiredPlan.toUpperCase()} tier entitlement.`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-200">{meta?.name || featureKey}</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                {meta?.description || 'This advanced capability is protected under commercial licensing.'}
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
              <div>
                <div className="text-[11px] text-slate-500">Current Workstation Tier</div>
                <div className="font-semibold text-slate-300 capitalize">
                  {licenseState.plan?.displayName || 'Unlicensed'} ({licenseState.status})
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Required Tier</div>
                <div className="font-semibold text-amber-400 capitalize">{requiredPlan} Pro</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubscription();
              }}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs rounded-xl shadow-lg shadow-amber-950/40 transition-all"
            >
              <span>Manage Subscription</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
