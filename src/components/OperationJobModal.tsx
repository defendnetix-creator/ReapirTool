import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Terminal,
  RotateCw,
  ShieldCheck,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { OperationJob, operationsClient } from '../api/operationsClient';

interface OperationJobModalProps {
  jobId: string | null;
  onClose: () => void;
  onJobCompleted?: (job: OperationJob) => void;
}

export const OperationJobModal: React.FC<OperationJobModalProps> = ({
  jobId,
  onClose,
  onJobCompleted
}) => {
  const [job, setJob] = useState<OperationJob | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await operationsClient.getJob(jobId);
        if (isMounted) {
          setJob(data);
          if (data.status !== 'RUNNING') {
            clearInterval(interval);
            onJobCompleted?.(data);
          }
        }
      } catch (err) {
        console.error('Failed to poll job status:', err);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [jobId]);

  useEffect(() => {
    if (!isMinimized) {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [job?.logs, isMinimized]);

  if (!jobId) return null;

  const handleCancel = async () => {
    if (!jobId || job?.status !== 'RUNNING') return;
    setIsCancelling(true);
    try {
      await operationsClient.cancelJob(jobId);
    } catch (err) {
      console.error('Failed to cancel job:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isMinimized && job) {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[#0e1320] border border-cyan-500/40 rounded-xl p-3 shadow-2xl shadow-cyan-950/80 flex items-center gap-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {job.status === 'RUNNING' && (
            <RotateCw className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
          {job.status === 'SUCCESS' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          {job.status === 'FAILED' && (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          {job.status === 'CANCELLED' && (
            <XCircle className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-xs font-mono font-bold text-white max-w-[180px] truncate">
            {job.operationId}
          </span>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            {job.progressPercent}%
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(false)}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          title="Restore window"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-[#0b0e17] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#0e1322]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white font-mono">
                  {job?.operationId || 'Executing Autonomous Operation'}
                </h2>
                {job?.requiresAdmin && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30">
                    ELEVATED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Category: {job?.category || 'Windows Servicing Engine'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors"
              title="Minimize to floating pill"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status & Progress Bar */}
        <div className="px-6 py-4 bg-[#0a0d14] border-b border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Status:</span>
              {job?.status === 'RUNNING' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/30 animate-pulse">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  RUNNING
                </span>
              )}
              {job?.status === 'SUCCESS' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  SUCCESS (EXIT 0)
                </span>
              )}
              {job?.status === 'FAILED' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-500/30">
                  <AlertCircle className="w-3 h-3" />
                  FAILED
                </span>
              )}
              {job?.status === 'CANCELLED' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-500/30">
                  <XCircle className="w-3 h-3" />
                  CANCELLED
                </span>
              )}
            </div>

            <span className="text-xs font-mono font-bold text-cyan-400">
              {job?.progressPercent || 0}%
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-900/80 rounded-full h-2 overflow-hidden border border-white/[0.05]">
            <div
              className={`h-full transition-all duration-300 ${
                job?.status === 'FAILED'
                  ? 'bg-rose-500'
                  : job?.status === 'CANCELLED'
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
              }`}
              style={{ width: `${job?.progressPercent || 0}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="truncate max-w-[400px]">
              {job?.currentStep || 'Initializing execution engine...'}
            </span>
            <span className="text-slate-500">
              Job ID: {job?.jobId.substring(0, 16)}...
            </span>
          </div>
        </div>

        {/* Live Terminal Log Stream */}
        <div className="flex-1 p-4 bg-[#05070c] font-mono text-xs overflow-y-auto max-h-[320px] space-y-1.5 border-b border-white/[0.06]">
          {job?.logs && job.logs.length > 0 ? (
            job.logs.map((line, idx) => (
              <div
                key={idx}
                className={`leading-relaxed whitespace-pre-wrap ${
                  line.includes('[ERROR]')
                    ? 'text-rose-400'
                    : line.includes('[SUCCESS]') || line.includes('completed')
                    ? 'text-emerald-300'
                    : line.includes('[SFC]') || line.includes('[DISM]')
                    ? 'text-cyan-300'
                    : line.includes('[NET') || line.includes('[PING')
                    ? 'text-blue-300'
                    : line.includes('[PRINTER') || line.includes('[SPOOLER')
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic">Waiting for command stream...</div>
          )}
          <div ref={logEndRef} />
        </div>

        {/* Structured Result Display (if available) */}
        {job?.result && (
          <div className="px-6 py-3 bg-[#0d121f] border-b border-white/[0.06] text-xs font-mono text-slate-300">
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
              Execution Result Payload
            </div>
            <pre className="text-[11px] text-cyan-300 overflow-x-auto bg-[#07090e] p-2 rounded border border-white/[0.04]">
              {JSON.stringify(job.result, null, 2)}
            </pre>
          </div>
        )}

        {/* Actions Footer */}
        <div className="px-6 py-4 bg-[#0a0d14] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Started: {job?.startTime ? new Date(job.startTime).toLocaleTimeString() : '--'}</span>
          </div>

          <div className="flex items-center gap-2.5">
            {job?.status === 'RUNNING' && job?.canCancel && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-4 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 text-xs font-mono font-bold transition-all disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Operation'}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-mono font-bold transition-all"
            >
              {job?.status === 'RUNNING' ? 'Minimize' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
