import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  BookmarkPlus
} from 'lucide-react';
import { ISSUE_LIBRARY, IssueDefinition, PROBLEM_CATEGORIES } from '../../data/issueLibrary';

interface ProblemMasterHubProps {
  onExecuteOperation?: (operationId: string, params?: Record<string, any>, requiresAdmin?: boolean) => void;
  onRequestAutoFixPlan?: (planName: string, steps: string[]) => void;
}

export const ProblemMasterHub: React.FC<ProblemMasterHubProps> = ({
  onExecuteOperation,
  onRequestAutoFixPlan
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [symptomSearch, setSymptomSearch] = useState<string>('');
  const [activeIssue, setActiveIssue] = useState<IssueDefinition | null>(null);

  const filteredIssues = ISSUE_LIBRARY.filter((issue) => {
    const matchesCat = selectedCategory === 'All' || issue.category === selectedCategory;
    const matchesSearch =
      symptomSearch === '' ||
      issue.title.toLowerCase().includes(symptomSearch.toLowerCase()) ||
      issue.description.toLowerCase().includes(symptomSearch.toLowerCase()) ||
      issue.symptoms.some((s) => s.toLowerCase().includes(symptomSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleExecuteSingle = (opId: string, requiresAdmin: boolean) => {
    if (onExecuteOperation) {
      onExecuteOperation(opId, {}, requiresAdmin);
    }
  };

  const handleApplyFullRemediation = (issue: IssueDefinition) => {
    if (onRequestAutoFixPlan) {
      onRequestAutoFixPlan(`Remediate: ${issue.title}`, issue.recommendedOperations);
    } else if (onExecuteOperation) {
      onExecuteOperation(
        'repair.autofix.plan_execute',
        { planName: issue.title, steps: issue.recommendedOperations },
        issue.requiresAdmin
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Symptom Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c101a] border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-white">
                Problem Master Hub
              </h2>
              <p className="text-[11px] text-slate-400">
                Symptom-driven guided troubleshooting mapping issues directly to certified operations.
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={symptomSearch}
            onChange={(e) => setSymptomSearch(e.target.value)}
            placeholder="Search symptoms (e.g. no internet, spooler, bsod)..."
            className="w-full bg-[#070a10] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-white/[0.06]">
        {PROBLEM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredIssues.map((issue) => (
          <div
            key={issue.id}
            className="p-5 rounded-xl bg-[#0a0d15] border border-white/[0.06] hover:border-cyan-500/30 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold">
                      {issue.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-semibold ${
                        issue.riskLevel === 'SAFE'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                          : issue.riskLevel === 'MODERATE'
                          ? 'bg-amber-950/50 text-amber-400 border-amber-500/30'
                          : 'bg-rose-950/50 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {issue.riskLevel}
                    </span>
                    {issue.requiresAdmin && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950/40 text-amber-300 border border-amber-500/20 font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs font-mono font-bold text-white">
                    {issue.title}
                  </h3>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {issue.description}
              </p>

              {/* Symptoms */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Recognized Symptoms:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {issue.symptoms.map((sym, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-300 border border-white/[0.05]"
                    >
                      • {sym}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-white/[0.05] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-cyan-400/80">
                <span>{issue.recommendedOperations.length} safe step(s) available</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleExecuteSingle(issue.diagnosticOperations[0] || issue.recommendedOperations[0], issue.requiresAdmin)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-mono transition-all"
                >
                  Run Diagnostic
                </button>
                <button
                  onClick={() => handleApplyFullRemediation(issue)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.25)] transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Auto-Remediate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
