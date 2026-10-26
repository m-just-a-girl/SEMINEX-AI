import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    neutral?: boolean;
  };
  highlightColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'cyan',
}) => {
  const colorMap = {
    cyan: 'border-cyan-500/20 text-cyan-400 group-hover:border-cyan-500/50',
    emerald: 'border-emerald-500/20 text-emerald-400 group-hover:border-emerald-500/50',
    amber: 'border-amber-500/20 text-amber-400 group-hover:border-amber-500/50',
    rose: 'border-rose-500/20 text-rose-400 group-hover:border-rose-500/50',
    purple: 'border-purple-500/20 text-purple-400 group-hover:border-purple-500/50',
  };

  return (
    <div className={`group relative p-5 rounded-2xl bg-navy-900/70 border backdrop-blur-md transition-all duration-300 hover:shadow-cyan-glow ${colorMap[highlightColor]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1 font-sans">{value}</h3>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-navy-800/80 border border-slate-700/50 text-slate-200 group-hover:text-cyan-400 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60 text-xs">
          {trend && (
            <span
              className={`font-semibold font-mono px-1.5 py-0.5 rounded ${
                trend.neutral
                  ? 'bg-slate-800 text-slate-300'
                  : trend.isPositive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-950 text-rose-400 border border-rose-500/30'
              }`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
