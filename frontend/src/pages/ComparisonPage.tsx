import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRightLeft, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { WaferDifferenceCanvas } from '../components/WaferDifferenceCanvas';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchDatasetSamples, runComparison } from '../api/client';
import { WaferSample } from '../types';

export const ComparisonPage: React.FC = () => {
  const [samples, setSamples] = useState<WaferSample[]>([]);
  const [refWafer, setRefWafer] = useState<WaferSample | null>(null);
  const [cmpWafer, setCmpWafer] = useState<WaferSample | null>(null);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDatasetSamples({ limit: 30 });
        setSamples(res.items);
        if (res.items.length >= 2) {
          setRefWafer(res.items[0]);
          setCmpWafer(res.items[1]);
        }
      } catch (err) {
        console.error('Failed to load comparison samples:', err);
      }
    }
    load();
  }, []);

  const handleExecuteComparison = async () => {
    if (!refWafer || !cmpWafer) return;
    setComparing(true);
    try {
      const res = await runComparison({
        reference_map: refWafer.wafer_map,
        comparison_map: cmpWafer.wafer_map,
        reference_id: refWafer.id,
        comparison_id: cmpWafer.id,
      });
      setComparisonResult(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    if (refWafer && cmpWafer) {
      handleExecuteComparison();
    }
  }, [refWafer, cmpWafer]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 3 • Topographical Delta
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Smart Wafer Comparison</h2>
          <p className="text-xs font-mono text-slate-400">
            Side-by-side die delta analysis, spatial overlap (IoU), and pattern trajectory
          </p>
        </div>

        <button
          onClick={handleExecuteComparison}
          disabled={comparing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{comparing ? 'Analyzing Delta...' : 'Recalculate Delta'}</span>
        </button>
      </div>

      {/* Wafer Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reference Selector */}
        <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            Select Reference Wafer (Baseline)
          </label>
          <select
            value={refWafer?.id || ''}
            onChange={(e) => {
              const f = samples.find((s) => s.id === e.target.value);
              if (f) setRefWafer(f);
            }}
            className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} ({s.lot_name} • W#{s.wafer_index} • {s.original_label || 'Unlabelled'})
              </option>
            ))}
          </select>
        </div>

        {/* Comparison Selector */}
        <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-2">
          <label className="text-xs font-mono text-orange-400 font-bold uppercase tracking-wider block">
            Select Comparison Wafer (Target)
          </label>
          <select
            value={cmpWafer?.id || ''}
            onChange={(e) => {
              const f = samples.find((s) => s.id === e.target.value);
              if (f) setCmpWafer(f);
            }}
            className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500"
          >
            {samples.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} ({s.lot_name} • W#{s.wafer_index} • {s.original_label || 'Unlabelled'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Displays: Ref vs Cmp vs Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reference View */}
        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col items-center">
          <div className="w-full text-center pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-mono font-bold text-cyan-400">
              Reference: {refWafer?.id}
            </span>
            <div className="text-[11px] text-slate-400 font-mono">
              Class: {comparisonResult?.reference?.predicted_class || (refWafer?.original_label !== null && refWafer?.original_label !== undefined ? refWafer.original_label : 'Unlabelled')}
            </div>
          </div>
          {refWafer && (
            <WaferMapCanvas
              matrix={refWafer.wafer_map}
              size={260}
              interactive={false}
              showCoordinates={false}
            />
          )}
          <div className="w-full pt-3 mt-2 border-t border-slate-800 text-xs font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Failing Dies:</span>
              <span className="text-slate-200">
                {comparisonResult?.reference?.spatial_metrics?.failing_die_count ??
                  refWafer?.spatial_metrics?.failing_die_count ??
                  0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Failure Rate:</span>
              <span className="text-slate-200">
                {(() => {
                  const fr =
                    comparisonResult?.reference?.spatial_metrics?.failure_rate ??
                    refWafer?.spatial_metrics?.failure_rate;
                  if (fr === undefined || fr === null) return '0.00%';
                  return fr <= 1 ? `${(fr * 100).toFixed(2)}%` : `${Number(fr).toFixed(2)}%`;
                })()}
              </span>
            </div>
          </div>
        </div>

        {/* Superimposed Difference Map */}
        <div className="p-5 rounded-2xl bg-navy-900/70 border border-cyan-500/30 backdrop-blur-md flex flex-col items-center">
          <div className="w-full text-center pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Topographical Difference Map
            </span>
            <div className="text-[11px] text-cyan-300 font-mono">
              Spatial Jaccard IoU: {comparisonResult?.comparison_delta?.spatial_iou ?? 1.0}
            </div>
          </div>
          {comparisonResult?.difference_map ? (
            <WaferDifferenceCanvas differenceMap={comparisonResult.difference_map} size={260} />
          ) : (
            <div className="h-[260px] flex items-center justify-center text-xs font-mono text-slate-500">
              Computing Delta...
            </div>
          )}
          <p className="text-[10px] font-mono text-slate-400 mt-3 text-center italic">
            * Cyan = Resolved in Target, Orange = New in Target, Red = Persistent
          </p>
        </div>

        {/* Comparison Target View */}
        <div className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col items-center">
          <div className="w-full text-center pb-2 border-b border-slate-800 mb-3">
            <span className="text-xs font-mono font-bold text-orange-400">
              Target: {cmpWafer?.id}
            </span>
            <div className="text-[11px] text-slate-400 font-mono">
              Class: {comparisonResult?.comparison?.predicted_class || (cmpWafer?.original_label !== null && cmpWafer?.original_label !== undefined ? cmpWafer.original_label : 'Unlabelled')}
            </div>
          </div>
          {cmpWafer && (
            <WaferMapCanvas
              matrix={cmpWafer.wafer_map}
              size={260}
              interactive={false}
              showCoordinates={false}
            />
          )}
          <div className="w-full pt-3 mt-2 border-t border-slate-800 text-xs font-mono space-y-1 text-slate-400">
            <div className="flex justify-between">
              <span>Failing Dies:</span>
              <span className="text-slate-200">
                {comparisonResult?.comparison?.spatial_metrics?.failing_die_count ??
                  cmpWafer?.spatial_metrics?.failing_die_count ??
                  0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Failure Rate:</span>
              <span className="text-slate-200">
                {(() => {
                  const fr =
                    comparisonResult?.comparison?.spatial_metrics?.failure_rate ??
                    cmpWafer?.spatial_metrics?.failure_rate;
                  if (fr === undefined || fr === null) return '0.00%';
                  return fr <= 1 ? `${(fr * 100).toFixed(2)}%` : `${Number(fr).toFixed(2)}%`;
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Delta Metrics Summary */}
      {comparisonResult?.comparison_delta && (
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
            Comparison Delta Analysis
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Failing Die Delta:</span>
              <div
                className={`text-lg font-bold mt-1 ${
                  comparisonResult.comparison_delta.failing_die_diff > 0
                    ? 'text-red-400'
                    : 'text-emerald-400'
                }`}
              >
                {comparisonResult.comparison_delta.failing_die_diff > 0 ? '+' : ''}
                {comparisonResult.comparison_delta.failing_die_diff} dies
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Yield Delta:</span>
              <div
                className={`text-lg font-bold mt-1 ${
                  comparisonResult.comparison_delta.yield_diff >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {comparisonResult.comparison_delta.yield_diff > 0 ? '+' : ''}
                {comparisonResult.comparison_delta.yield_diff}%
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-slate-400">New Defects in Target:</span>
              <div className="text-lg font-bold text-orange-400 mt-1">
                {comparisonResult.comparison_delta.new_defect_count} dies
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-slate-400">Pattern Preservation:</span>
              <div className="text-lg font-bold text-cyan-400 mt-1">
                {comparisonResult.comparison_delta.pattern_matched ? 'IDENTICAL' : 'SHIFTED'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
