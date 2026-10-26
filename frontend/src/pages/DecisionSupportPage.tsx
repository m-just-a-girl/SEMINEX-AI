import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  Sliders,
  FileCheck,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchDatasetSamples, runInspection } from '../api/client';
import { InspectionResult } from '../types';

export const DecisionSupportPage: React.FC = () => {
  const [result, setResult] = useState<InspectionResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDatasetSamples({ limit: 1 });
        if (res.items.length > 0) {
          const insp = await runInspection({
            record_id: res.items[0].id,
            wafer_map: res.items[0].wafer_map,
            lot_name: res.items[0].lot_name,
          });
          setResult(insp);
        }
      } catch (err) {
        console.error('Failed to load inspection for decision support:', err);
      }
    }
    load();
  }, []);

  const ds = result?.decision_support;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Stage 9 • Automated Triage Rules
            </span>
            <TransparencyBadge type="DECISION SUPPORT" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Decision Support Engine</h2>
          <p className="text-xs font-mono text-slate-400">
            Automated quality triage, deterministic policy thresholds, and prototype risk prioritization
          </p>
        </div>

        <TransparencyBadge type="NOT A SUBSTITUTE FOR PROFESSIONAL INSPECTION" size="sm" />
      </div>

      {result && ds ? (
        <div className="space-y-6">
          {/* Active Triage Recommendation Card */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-indigo-500/30 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Current Evaluation Target: {result.inspection_id} ({result.record_id})
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className="text-xl font-bold text-white">Recommendation:</h3>
                  <span
                    className={`px-3 py-1 rounded-xl text-sm font-bold font-mono ${
                      ds.recommendation === 'Investigation Recommended'
                        ? 'bg-red-950 text-red-300 border border-red-500/40'
                        : ds.recommendation === 'Low Concern'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {ds.recommendation}
                  </span>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-slate-400">Risk Score Tier:</span>
                <div className="text-2xl font-bold text-indigo-400">{ds.risk_score} / 100</div>
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed bg-navy-950/80 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-300 uppercase font-mono mr-1">Rule Justification:</span>
              {ds.recommendation_reason}
            </div>

            {/* Decision Disclaimer Notice */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-slate-300 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <b>Policy Notice:</b> Decision support only. Human review recommended for uncertain or
                consequential cases. Autonomous lot disposition is not authorized.
              </span>
            </div>
          </div>

          {/* Prototype Risk Scoring Breakdown */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                  {ds.risk_framework}
                </h4>
                <p className="text-xs font-mono text-slate-400">{ds.formula_description}</p>
              </div>
              <TransparencyBadge type="PROTOTYPE AI INFERENCE" size="sm" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Failure Rate Weight (40% max):</span>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {ds.factors.failure_rate_points} pts
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Based on {result.spatial_metrics.failure_rate}% failing dies
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Cluster Density Weight (30% max):</span>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {ds.factors.cluster_density_points} pts
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Max cluster: {result.spatial_metrics.max_cluster_size} dies
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Pattern Severity (20% max):</span>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {ds.factors.pattern_severity_points} pts
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Class: {result.prediction.predicted_class}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800">
                <span className="text-xs font-mono text-slate-400">Model Uncertainty (10% max):</span>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {ds.factors.uncertainty_points} pts
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Confidence: {Math.round(result.prediction.confidence * 100)}%
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-400">
              <b>Limitations:</b> {ds.limitations}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
          Loading decision engine telemetry...
        </div>
      )}
    </div>
  );
};
