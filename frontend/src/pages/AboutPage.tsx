import React from 'react';
import {
  Cpu,
  ShieldCheck,
  BrainCircuit,
  Database,
  Layers,
  Sparkles,
  GitCompare,
  TrendingUp,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { TransparencyBadge } from '../components/TransparencyBadge';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Brand Hero */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/20 text-center space-y-4 shadow-2xl">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          SEMI NEX AI
        </h1>
        <p className="text-cyan-400 font-mono text-sm tracking-wider uppercase font-semibold">
          Detect Defects. Compare. Analyze. Decide.
        </p>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          AI-Powered Semiconductor Quality Intelligence & Decision Support Platform.
          Smarter Semiconductor Inspection with Explainable AI — From Visual Detection to Quality Intelligence.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          <TransparencyBadge type="DECISION SUPPORT" size="sm" />
        </div>
      </div>

      {/* 4 Pillars: DETECT -> UNDERSTAND -> PREDICT -> ACT */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono text-center">
          The Operational Vision: DETECT &rarr; UNDERSTAND &rarr; PREDICT &rarr; ACT
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
              01
            </div>
            <h4 className="font-bold text-white text-sm">1. DETECT</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated classification of wafer map defect morphologies using genuine machine learning trained on WM-811K.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-blue-500/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 font-bold font-mono text-xs">
              02
            </div>
            <h4 className="font-bold text-white text-sm">2. UNDERSTAND</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spatial feature decomposition, connected component clustering, and attribution heatmaps to explain model decisions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-purple-500/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-950 flex items-center justify-center text-purple-400 font-bold font-mono text-xs">
              03
            </div>
            <h4 className="font-bold text-white text-sm">3. PREDICT</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lot-level yield projections and multi-factor prototype risk scoring to prioritize quality review queues.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900/70 border border-emerald-500/30 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold font-mono text-xs">
              04
            </div>
            <h4 className="font-bold text-white text-sm">4. ACT</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit-ready disposition workflows, engineer root cause guidance, human review persistence, and PDF report generation.
            </p>
          </div>
        </div>
      </div>

      {/* Dataset & Tech Stack Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Database className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Primary Dataset: WM-811K
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Origin: MIRACL Lab / IEEE Transactions on Semiconductor Manufacturing.<br />
            Includes 811,457 wafer map records across 46,393 fabrication lots.<br />
            Preserves 9 canonical pattern classes: <code className="text-cyan-300 font-bold">none, Center, Donut, Edge-Loc, Edge-Ring, Loc, Random, Near-full, Scratch</code>.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
              Enterprise Technology Stack
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono">
            Backend: Python 3.14 + FastAPI + NumPy + SciPy + Scikit-Learn + ReportLab.<br />
            Frontend: React 18 + TypeScript + Vite + Tailwind CSS + Lucide + Recharts.<br />
            Persistence: Embedded SQLite database for inspection audit logs & human triage.
          </p>
        </div>
      </div>
    </div>
  );
};
