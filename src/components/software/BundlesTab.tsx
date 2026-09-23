/**
 * Bundles Tab (Predefined & Custom Software Bundles)
 * Akshigo PC Toolkit Pro v8.0.0-rc.1
 * Phase 8.6: Software Deployment, 100 Apps & Portable Tools Parity
 */

import React, { useState } from 'react';
import {
  Layers,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Info,
  Check,
  Trash2,
  X
} from 'lucide-react';

interface BundlesTabProps {
  bundles: { predefined: any[]; custom: any[] };
  catalog: any[];
  onDeployBundle: (bundleName: string, appIds: string[]) => void;
  onSaveCustomBundle: (name: string, description: string, appIds: string[]) => Promise<void>;
  loading: boolean;
}

export const BundlesTab: React.FC<BundlesTabProps> = ({
  bundles,
  catalog,
  onDeployBundle,
  onSaveCustomBundle,
  loading
}) => {
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [modalSearch, setModalSearch] = useState<string>('');

  const handleSave = async () => {
    if (!customName.trim() || selectedAppIds.length === 0) return;
    try {
      setSaving(true);
      await onSaveCustomBundle(customName.trim(), customDescription.trim(), selectedAppIds);
      setShowCustomModal(false);
      setCustomName('');
      setCustomDescription('');
      setSelectedAppIds([]);
    } catch (err: any) {
      alert(`Error saving bundle: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleModalApp = (id: string) => {
    if (selectedAppIds.includes(id)) {
      setSelectedAppIds(selectedAppIds.filter((a) => a !== id));
    } else {
      setSelectedAppIds([...selectedAppIds, id]);
    }
  };

  const getAppName = (id: string): string => {
    const found = catalog.find((a) => a.id.toLowerCase() === id.toLowerCase());
    return found ? found.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Custom Bundle Button */}
      <div className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            1-Click Multi-App Software Bundles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pre-assembled technician software profiles designed for swift client onboarding, clean OS installs, and developer staging.
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Custom Bundle</span>
        </button>
      </div>

      {/* Predefined Bundles Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Curated Baseline Profiles ({bundles.predefined?.length || 0})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.predefined?.map((bundle) => {
            const appsInBundle = bundle.appIds.map((id: string) => getAppName(id));
            return (
              <div
                key={bundle.id}
                className="p-5 rounded-xl bg-[#0e121c] border border-white/[0.07] hover:border-white/[0.14] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{bundle.name}</h4>
                      <span className="text-[10px] font-mono text-cyan-400 mt-0.5 inline-block">
                        {bundle.category}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-slate-500" />
                      {bundle.estimatedTime}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                    {bundle.description}
                  </p>

                  {/* App Chips */}
                  <div className="mt-3.5 space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                      Includes {bundle.appIds.length} Packages:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {appsInBundle.map((name: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] text-slate-300 border border-white/[0.05]"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span>Silent Deploy</span>
                  </div>

                  <button
                    onClick={() => onDeployBundle(bundle.name, bundle.appIds)}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Deploy Bundle</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Bundles Section */}
      {bundles.custom && bundles.custom.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            User-Defined Custom Bundles ({bundles.custom.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bundles.custom.map((bundle) => {
              const appsInBundle = bundle.appIds.map((id: string) => getAppName(id));
              return (
                <div
                  key={bundle.id}
                  className="p-5 rounded-xl bg-[#0e121c] border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">{bundle.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                        CUSTOM
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {bundle.description || 'Custom technician selection.'}
                    </p>

                    <div className="mt-3.5 space-y-1.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                        Includes {bundle.appIds.length} Packages:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {appsInBundle.map((name: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/30 text-cyan-200 border border-cyan-500/20"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">
                      Saved: {new Date(bundle.updatedAt || bundle.createdAt).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => onDeployBundle(bundle.name, bundle.appIds)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Deploy Bundle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Custom Bundle Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0e17] border border-white/[0.12] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  Create Custom Software Bundle
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select applications to bundle together for automated one-click silent installation.
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Bundle Name *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., Senior Tech Remote Toolkit"
                  className="w-full bg-[#07090f] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Description</label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="e.g., Chrome, VS Code, Git, 7-Zip, and PuTTY"
                  className="w-full bg-[#07090f] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300">
                    Select Applications ({selectedAppIds.length} Selected)
                  </label>
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    placeholder="Filter apps..."
                    className="w-48 bg-[#07090f] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white placeholder-slate-500"
                  />
                </div>

                <div className="border border-white/[0.06] rounded-lg max-h-64 overflow-y-auto p-2 space-y-1 bg-[#07090f]">
                  {catalog
                    .filter(
                      (app) =>
                        modalSearch.trim() === '' ||
                        app.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        app.category.toLowerCase().includes(modalSearch.toLowerCase())
                    )
                    .map((app) => {
                      const isChecked = selectedAppIds.includes(app.id);
                      return (
                        <div
                          key={app.id}
                          onClick={() => toggleModalApp(app.id)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            isChecked ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-white/[0.03] text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                                  : 'border-slate-600 bg-black/40'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-sans font-bold text-xs">{app.name}</span>
                            <span className="text-[10px] text-slate-500">({app.category})</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{app.id}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-[#080b12]">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customName.trim() || selectedAppIds.length === 0 || saving}
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save & Persist Bundle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
