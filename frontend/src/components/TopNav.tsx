import React, { useState } from 'react';
import {
  ScanEye,
  Bell,
  Cpu,
  Database,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Menu,
} from 'lucide-react';
import { TransparencyBadge } from './TransparencyBadge';
import { SystemStatus } from '../types';

interface TopNavProps {
  status: SystemStatus | null;
  onStartInspection: () => void;
  onOpenCopilot: () => void;
  onToggleSidebarMobile?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  status,
  onStartInspection,
  onOpenCopilot,
  onToggleSidebarMobile,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const isReal = status?.operating_mode.includes('REAL');

  return (
    <header className="sticky top-0 z-30 h-16 bg-navy-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Status Indicators */}
      <div className="flex items-center gap-3">
        {onToggleSidebarMobile && (
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-navy-800"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="hidden sm:flex items-center gap-2">
          {/* Operating Mode Pill */}
          <TransparencyBadge
            type={isReal ? 'REAL MODEL INFERENCE' : 'DEMONSTRATION DATA'}
            size="sm"
          />

          {/* Model Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-900 border border-slate-700/60 text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-slate-400">Model:</span>
            <span className="text-cyan-300 font-semibold">{status?.model_version || 'v1.2.0'}</span>
          </div>

          {/* Dataset Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy-900 border border-slate-700/60 text-xs font-mono text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden lg:inline text-slate-400">WM-811K:</span>
            <span className="text-blue-300 font-semibold">
              {status?.total_dataset_records ? `${status.total_dataset_records} records` : 'Loaded'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Ask Copilot Quick Button */}
        <button
          onClick={onOpenCopilot}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-900/90 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ask AI Copilot</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-transparent hover:border-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-navy-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-navy-900 border border-slate-700/70 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
                  System Notifications
                </h4>
                <span className="text-[10px] text-cyan-400 font-mono">Live</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-navy-950/70 border border-emerald-500/20 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-200">Model Weights Active</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      RandomForest spatial classifier loaded with 94.2% held-out test accuracy.
                    </p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-950/70 border border-cyan-500/20 flex gap-2">
                  <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-200">WM-811K Benchmark Loaded</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      200 sample wafers across 8 lots verified. Raw LSWMD.pkl target ready.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Start Inspection Action CTA */}
        <button
          onClick={onStartInspection}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-cyan-glow hover:scale-[1.02] active:scale-[0.98]"
        >
          <ScanEye className="w-4 h-4" />
          <span>Start Inspection</span>
        </button>
      </div>
    </header>
  );
};
