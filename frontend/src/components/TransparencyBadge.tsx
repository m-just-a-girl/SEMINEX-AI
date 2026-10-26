import React from 'react';
import { ShieldAlert, AlertTriangle, Cpu, CheckCircle2, FileSearch, Sparkles, Scale } from 'lucide-react';

export type TransparencyType =
  | 'DEMONSTRATION DATA'
  | 'PROTOTYPE AI INFERENCE'
  | 'REAL MODEL INFERENCE'
  | 'HUMAN REVIEW RECOMMENDED'
  | 'DECISION SUPPORT'
  | 'POSSIBLE ROOT CAUSE / HYPOTHESIS'
  | 'PROTOTYPE DATA-DRIVEN FORECAST'
  | 'NOT A SUBSTITUTE FOR PROFESSIONAL INSPECTION';

interface BadgeProps {
  type: TransparencyType;
  size?: 'sm' | 'md';
}

export const TransparencyBadge: React.FC<BadgeProps> = ({ type, size = 'sm' }) => {
  const configs: Record<TransparencyType, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    'REAL MODEL INFERENCE': {
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    },
    'PROTOTYPE AI INFERENCE': {
      bg: 'bg-cyan-950/70',
      text: 'text-cyan-300',
      border: 'border-cyan-500/40',
      icon: <Cpu className="w-3.5 h-3.5 text-cyan-400" />
    },
    'DEMONSTRATION DATA': {
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />
    },
    'HUMAN REVIEW RECOMMENDED': {
      bg: 'bg-orange-950/70',
      text: 'text-orange-300',
      border: 'border-orange-500/40',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
    },
    'DECISION SUPPORT': {
      bg: 'bg-indigo-950/70',
      text: 'text-indigo-300',
      border: 'border-indigo-500/40',
      icon: <Scale className="w-3.5 h-3.5 text-indigo-400" />
    },
    'POSSIBLE ROOT CAUSE / HYPOTHESIS': {
      bg: 'bg-purple-950/70',
      text: 'text-purple-300',
      border: 'border-purple-500/40',
      icon: <FileSearch className="w-3.5 h-3.5 text-purple-400" />
    },
    'PROTOTYPE DATA-DRIVEN FORECAST': {
      bg: 'bg-blue-950/70',
      text: 'text-blue-300',
      border: 'border-blue-500/40',
      icon: <Cpu className="w-3.5 h-3.5 text-blue-400" />
    },
    'NOT A SUBSTITUTE FOR PROFESSIONAL INSPECTION': {
      bg: 'bg-rose-950/70',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
    }
  };

  const c = configs[type] || configs['DEMONSTRATION DATA'];
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1.5' : 'text-xs px-2.5 py-1 gap-2';

  return (
    <span className={`inline-flex items-center font-mono font-medium rounded-full border tracking-wide uppercase ${c.bg} ${c.text} ${c.border} ${sizeClasses}`}>
      {c.icon}
      <span>{type}</span>
    </span>
  );
};
