import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, ShieldCheck, AlertTriangle, CheckCircle, Laptop, RefreshCw, X, ArrowRight, Sparkles } from 'lucide-react';
import { licenseClient } from '../licensing/licenseClient';
import { LicenseClientState } from '../licensing/types';
import { ENV } from '../config/environment';
import { BRAND } from '../config/brand';

interface ActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseState: LicenseClientState;
}

const SAMPLE_KEYS = [
  { label: 'Professional (2 Seats)', key: 'AKSG-PRO-7K2D-93MX-8QPL', desc: 'Full Pro repair engine + AI Copilot' },
  { label: 'Technician (5 Seats)', key: 'AKSG-TECH-9938-1120-4491', desc: 'White-label PDF, 14d offline, USB mode' },
  { label: 'Business (25 Seats)', key: 'AKSG-BIZ-5501-8832-7714', desc: 'Fleet telemetry, policy sync, mass automation' },
  { label: 'Expired Test Key', key: 'AKSG-EXP-9999-0000-1111', desc: 'Simulate lapsed subscription' },
  { label: 'Revoked Test Key', key: 'AKSG-REV-4444-5555-6666', desc: 'Simulate chargeback/revoked key' }
];

export const ActivationModal: React.FC<ActivationModalProps> = ({ isOpen, onClose, licenseState }) => {
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleFormatKey = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
    let chunks: string[] = [];
    for (let i = 0; i < clean.length && i < 20; i += 4) {
      chunks.push(clean.substring(i, i + 4));
    }
    setLicenseKeyInput(chunks.join('-'));
  };

  const handleActivate = async (keyToUse?: string) => {
    const key = keyToUse || licenseKeyInput;
    if (!key || key.trim().length < 8) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid 20-character license key.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const result = await licenseClient.activateLicenseKey(key);
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="relative w-full max-w-xl bg-[#0c0e17] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-100">Activate {BRAND.PRODUCT_NAME}</h3>
                <p className="text-xs text-slate-400">Enter your commercial license key to unlock your workstation seat.</p>
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
          <div className="p-6 space-y-6">
            {/* Input form */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Commercial License Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="AKSG-PRO-7K2D-93MX-8QPL"
                  value={licenseKeyInput}
                  onChange={(e) => handleFormatKey(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm tracking-wider focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all"
                />
              </div>
            </div>

            {/* Status alerts */}
            {statusMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{statusMessage.text}</span>
              </motion.div>
            )}

            {/* Test Keys / Fast Presets (DEBUG / QA Mode Only) */}
            {ENV.showEvaluationKeys && (
              <div className="space-y-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Test Keys (Evaluation & QA Mode):</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_KEYS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setLicenseKeyInput(item.key);
                        handleActivate(item.key);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-colors group"
                    >
                      <div>
                        <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {item.label}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.key} — {item.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
              <span>Cryptographic RSA signature verified</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoading || !licenseKeyInput}
                onClick={() => handleActivate()}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-xl shadow-lg shadow-cyan-950/40 transition-all"
              >
                {isLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Activate Workstation</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
