import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Wrench,
  ShieldAlert,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { fetchDatasetSamples, runInspection } from '../api/client';
import { InspectionResult, DefectCategory } from '../types';

interface RootCausePageProps {
  initialResult?: InspectionResult | null;
}

export const RootCausePage: React.FC<RootCausePageProps> = ({ initialResult }) => {
  const [result, setResult] = useState<InspectionResult | null>(initialResult || null);
  const [selectedPattern, setSelectedPattern] = useState<DefectCategory>(
    initialResult?.prediction.predicted_class || 'Center'
  );

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      setSelectedPattern(initialResult.prediction.predicted_class);
    }
  }, [initialResult]);

  useEffect(() => {
    async function loadSample() {
      if (!result) {
        try {
          const res = await fetchDatasetSamples({ limit: 1 });
          if (res.items.length > 0) {
            const insp = await runInspection({
              record_id: res.items[0].id,
              wafer_map: res.items[0].wafer_map,
              lot_name: res.items[0].lot_name,
            });
            setResult(insp);
            setSelectedPattern(insp.prediction.predicted_class);
          }
        } catch (err) {
          console.error('Error loading default root cause sample:', err);
        }
      }
    }
    loadSample();
  }, [result]);

  const hypo = result?.root_cause_hypothesis;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              Stage 6 • Engineering Investigation Directions
            </span>
            <TransparencyBadge type="POSSIBLE ROOT CAUSE / HYPOTHESIS" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Possible Root Cause / Hypothesis</h2>
          <p className="text-xs font-mono text-slate-400">
            Spatial pattern signatures suggest engineering investigation directions — not definitive diagnoses
          </p>
        </div>

        <TransparencyBadge type="NOT A SUBSTITUTE FOR PROFESSIONAL INSPECTION" size="sm" />
      </div>

      {result && hypo ? (
        <div className="space-y-6">
          {/* Main Working Hypothesis Card */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-purple-500/30 backdrop-blur-md">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400">
                  Observed Spatial Signature
                </span>
                <h3 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
                  <span>Pattern:</span>
                  <span className="text-purple-400 font-mono">{result.prediction.predicted_class}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    ({Math.round(result.prediction.confidence * 100)}% model confidence)
                  </span>
                </h3>
                <p className="text-sm font-semibold text-slate-200 mt-2">{hypo.title}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  {hypo.spatial_evidence}
                </p>
              </div>

              <div className="shrink-0 p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs font-mono">
                <div className="text-slate-400">Inspection Target:</div>
                <div className="text-slate-200 font-bold">{result.inspection_id}</div>
                <div className="text-slate-400 mt-1">Failing Die Count:</div>
                <div className="text-red-400 font-bold">
                  {result.spatial_metrics.failing_die_count} dies ({result.spatial_metrics.failure_rate <= 1 ? (result.spatial_metrics.failure_rate * 100).toFixed(2) : Number(result.spatial_metrics.failure_rate).toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Mandatory Semiconductor Disclaimer Notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-300">
                <span className="font-bold text-purple-300 uppercase tracking-wide font-mono mr-1">
                  Professional Verification Required:
                </span>
                The observed spatial pattern may warrant review of related fab process conditions. The
                wafer map alone cannot establish the physical cause, equipment fault, or electrical
                consequence of a defect.
              </div>
            </div>
          </div>

          {/* Three-Column Engineering Guidance Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Investigation Directions */}
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  1. Possible Investigation Directions
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {hypo.investigation_directions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. Questions for an Engineer */}
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  2. Questions for an Engineer
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {hypo.engineer_questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Suggested Verification Steps */}
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  3. Suggested Verification Steps
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {hypo.verification_steps.map((v, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
          Loading root-cause hypothesis telemetry...
        </div>
      )}
    </div>
  );
};
