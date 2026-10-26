import React, { useState } from 'react';
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ScanEye,
  GitCompare,
  BrainCircuit,
  FileSearch,
  Layers,
  UserCheck,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';

interface JudgeModePageProps {
  onNavigate: (pageId: any, param?: any) => void;
}

export const JudgeModePage: React.FC<JudgeModePageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      step: 1,
      title: 'Platform Overview & Brand Vision',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'SEMI NEX AI is an AI-powered semiconductor wafer map intelligence and decision support platform based on the WM-811K dataset. It operationalizes DETECT → UNDERSTAND → PREDICT → ACT.',
      actionLabel: 'View Home Dashboard',
      actionPage: 'dashboard',
      details: [
        'Full-stack architecture: FastAPI + Scikit-Learn + React 18 + Tailwind CSS',
        'WM-811K benchmark dataset integration with 9 canonical defect topologies',
        'Strict transparency labelling conforming to semiconductor quality standards',
      ],
    },
    {
      step: 2,
      title: 'Load Authentic Wafer Example',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Explore authentic wafer-map records from the WM-811K dataset. Each record is validated into a standardized die matrix with 0=background, 1=passing die, 2=failing die.',
      actionLabel: 'Open Dataset Explorer',
      actionPage: 'intelligence',
      details: [
        'Explore 200 benchmark wafers across 8 fabrication lots (lot42000 - lot42007)',
        'Filter by category, lot number, or wafer index',
        'Inspect exact die counts and yield ratios',
      ],
    },
    {
      step: 3,
      title: 'Run Real Model Inference',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Execute the trained spatial classifier. The model extracts 74 topological, radial, and density features and evaluates class probabilities in real-time.',
      actionLabel: 'Launch AI Wafer Inspection',
      actionPage: 'inspection',
      details: [
        'Multi-stage pipeline: validation -> preprocessing -> inference -> spatial breakdown',
        'Real calibrated probabilities across all 9 classes (no hardcoding)',
        'Model weights trained and saved in models/seminex_classifier.pkl',
      ],
    },
    {
      step: 4,
      title: 'Topological Spatial Decomposition',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Inspect mathematically grounded spatial metrics: radial ring distributions (inner, middle, outer), connected-component cluster counts, and quadrant dispersion.',
      actionLabel: 'Explore Spatial Intelligence',
      actionPage: 'intelligence',
      details: [
        'Inner Core (r < 0.35 R) vs Outer Perimeter (r > 0.75 R) density',
        'Connected component labeling (8-connectivity) to isolate failure clusters',
        'Quadrant balance (Q1 - Q4) to distinguish symmetric from directional failures',
      ],
    },
    {
      step: 5,
      title: 'Smart Topographical Comparison',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Compare two wafers side-by-side with automatic difference mapping. Compute spatial Jaccard IoU, die count deltas, and pattern preservation.',
      actionLabel: 'Open Smart Comparison',
      actionPage: 'comparison',
      details: [
        'Identifies resolved defects (cyan), new defects (orange), and persistent defects (red)',
        'Calculates exact die count delta and yield difference percentage',
        'No fabricated similarity percentages; strictly evidence-grounded',
      ],
    },
    {
      step: 6,
      title: 'Explainable AI & Attribution',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Open evidence-based feature attribution. View the spatial density heatmap that explains why the model predicted a specific defect pattern.',
      actionLabel: 'Open Explainable AI',
      actionPage: 'explainable',
      details: [
        'Derived spatial density overlay visualizing model activation drivers',
        'Class probability ranking and topological factor decomposition',
        'Clear limitations disclaimer regarding physical vs optical boundaries',
      ],
    },
    {
      step: 7,
      title: 'Possible Root Cause Hypotheses',
      badge: 'POSSIBLE ROOT CAUSE / HYPOTHESIS' as const,
      desc: 'Translate spatial signatures into actionable engineering investigation directions, tool audit questions, and verification steps.',
      actionLabel: 'View Root Cause Hypotheses',
      actionPage: 'rootcause',
      details: [
        'Formulates engineering questions for etch, CMP, lithography, and thermal tools',
        'Suggested metrology steps (AFM, CD-SEM, KLA Surfscan, thermal maps)',
        'Mandatory notice: "Professional verification required."',
      ],
    },
    {
      step: 8,
      title: 'Batch Analytics & Lot Yield',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Aggregate lot-level statistics across FOUP cassettes. Track yield spread, anomaly recurrence, and lot-to-lot consistency.',
      actionLabel: 'Open Batch Analytics',
      actionPage: 'batch',
      details: [
        'Mean, minimum, and maximum yield tracking per fabrication lot',
        'Identify dominant defect morphology per batch',
        'Compare FOUP cassette consistency across processing steps',
      ],
    },
    {
      step: 9,
      title: 'Human Review & Persistent Triage',
      badge: 'HUMAN REVIEW RECOMMENDED' as const,
      desc: 'Simulate the engineering quality workflow. Confirm predictions, correct misclassifications, add reviewer notes, and persist to SQLite.',
      actionLabel: 'Open Human Review',
      actionPage: 'review',
      details: [
        'Confirm, correct, or flag predictions with reviewer notes and timestamps',
        'Audit trail stored in SQLite database (persists across sessions)',
        'Keeps original dataset labels, model predictions, and human corrections separate',
      ],
    },
    {
      step: 10,
      title: 'Audit-Ready Reports (PDF & CSV)',
      badge: 'REAL MODEL INFERENCE' as const,
      desc: 'Generate executive-level PDF inspection certificates using ReportLab and export historical datasets to standardized CSV files.',
      actionLabel: 'Generate Inspection Report',
      actionPage: 'reports',
      details: [
        'Complete inspection identifier, lot, model version, and spatial metrics in PDF',
        'Full compliance disclaimer regarding fab disposition authority',
        'Downloadable directly in browser with a single click',
      ],
    },
  ];

  const current = steps[currentStep - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 16 • Hackathon & Evaluation Tour
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Judge Mode — Guided Tour</h2>
          <p className="text-xs font-mono text-slate-400">
            10-step interactive walkthrough showcasing end-to-end semiconductor intelligence capabilities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-navy-950 border border-cyan-500/40 text-cyan-300 font-bold">
            Step {currentStep} of {steps.length}
          </span>
          <button
            disabled={currentStep === steps.length}
            onClick={() => setCurrentStep((s) => Math.min(steps.length, s + 1))}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition-colors"
            title="Next Step"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="grid grid-cols-10 gap-1.5">
        {steps.map((s) => (
          <button
            key={s.step}
            onClick={() => setCurrentStep(s.step)}
            className={`h-2 rounded-full transition-all ${
              s.step === currentStep
                ? 'bg-cyan-400 shadow-cyan-glow'
                : s.step < currentStep
                ? 'bg-emerald-500'
                : 'bg-navy-900'
            }`}
            title={`Step ${s.step}: ${s.title}`}
          />
        ))}
      </div>

      {/* Step Showcase Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/30 backdrop-blur-md space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-cyan-400">
                STEP {current.step} OF {steps.length}
              </span>
              <TransparencyBadge type={current.badge} size="sm" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">{current.title}</h3>
          </div>

          <button
            onClick={() => onNavigate(current.actionPage)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow hover:scale-[1.02]"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">{current.desc}</p>

        {/* Feature Checkpoints */}
        <div className="p-5 rounded-2xl bg-navy-950/80 border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-300">
            Key Architectural Checkpoints
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {current.details.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/60 flex items-start gap-2.5 text-xs text-slate-300"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stepper Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs font-mono">
          <button
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            className="text-slate-400 hover:text-white disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Demonstration Step</span>
          </button>

          <button
            disabled={currentStep === steps.length}
            onClick={() => setCurrentStep((s) => Math.min(steps.length, s + 1))}
            className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 flex items-center gap-1 font-bold"
          >
            <span>Next Demonstration Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
