import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchDatasetSamples, runInspection } from '../api/client';
import { InspectionResult } from '../types';

interface ExplainableAIPageProps {
  initialResult?: InspectionResult | null;
}

export const ExplainableAIPage: React.FC<ExplainableAIPageProps> = ({ initialResult }) => {
  const [result, setResult] = useState<InspectionResult | null>(initialResult || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDefault() {
      if (!result) {
        try {
          const res = await fetchDatasetSamples({ limit: 1 });
          if (res.items.length > 0) {
            const insp = await runInspection({
              record_id: res.items[0].id,
              wafer_map: res.items[0].wafer_map,
              lot_name: res.items[0].lot_name,
              original_label: res.items[0].original_label,
            });
            setResult(insp);
          }
        } catch (err) {
          console.error('Error loading default inspection for explainability:', err);
        }
      }
    }
    loadDefault();
  }, [result]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 5 • Model Attribution & Transparency
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Explainable AI (XAI)</h2>
          <p className="text-xs font-mono text-slate-400">
            Topological feature importance, spatial density attribution, and prediction justification
          </p>
        </div>
      </div>

      {result ? (
        <div className="space-y-6">
          {/* Top Overview Card */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400">
                Inspection Target: {result.inspection_id} ({result.record_id})
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Predicted Class: <span className="text-cyan-400">{result.prediction.predicted_class}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                The classification model evaluated 74 topological, radial, and density features.
                Attribution shows the pattern is driven by high spatial concentration in the identified zone.
              </p>
            </div>
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs font-mono">
              <div>
                <div className="text-slate-400">Model Version</div>
                <div className="text-sm font-bold text-white">{result.prediction.model_version}</div>
              </div>
              <div>
                <div className="text-slate-400">Confidence</div>
                <div className="text-sm font-bold text-emerald-400">
                  {Math.round(result.prediction.confidence * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Spatial Attribution Heatmap & Feature Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Heatmap / Wafer View (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/70 border border-slate-800 flex flex-col items-center">
              <WaferMapCanvas
                matrix={result.wafer_map}
                densityMap={result.explanation_map}
                size={320}
                title="Spatial Attribution Map"
                subtitle="Highlighting die clusters driving model confidence"
              />
              <p className="text-[11px] font-mono text-cyan-400/80 mt-4 text-center">
                * Red zones indicate high topological feature activation for &apos;{result.prediction.predicted_class}&apos;.
              </p>
            </div>

            {/* Feature Contributions Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
                <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                  Evidence-Based Spatial Drivers
                </h4>
                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>1. Radial Ring Concentricity</span>
                      <span className="text-cyan-400">Dominant Factor</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Inner: {result.spatial_metrics.radial_distribution.inner}% • Middle:{' '}
                      {result.spatial_metrics.radial_distribution.middle}% • Outer:{' '}
                      {result.spatial_metrics.radial_distribution.outer}%.{' '}
                      {result.prediction.predicted_class === 'Center'
                        ? 'High inner core concentration specifically matches the Center defect signature.'
                        : result.prediction.predicted_class === 'Edge-Ring'
                        ? 'High outer ring concentration (>70%) matches Edge-Ring boundary failure.'
                        : 'Radial dispersion conforms to the detected defect topology.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>2. Cluster Connectedness</span>
                      <span className="text-blue-400">Contiguity Factor</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Detected {result.spatial_metrics.clusters} connected clusters with a max cluster size of{' '}
                      {result.spatial_metrics.max_cluster_size} dies. High contiguous grouping distinguishes
                      systematic process defects from random micro-particulate contamination.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-slate-300 font-semibold">
                      <span>3. Quadrant Symmetry vs. Localization</span>
                      <span className="text-purple-400">Angular Factor</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Quadrant failure distribution: Q1={result.spatial_metrics.quadrant_distribution.q1}%,
                      Q2={result.spatial_metrics.quadrant_distribution.q2}%,
                      Q3={result.spatial_metrics.quadrant_distribution.q3}%,
                      Q4={result.spatial_metrics.quadrant_distribution.q4}%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparency Notice */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-mono font-semibold text-[11px]">
                  <Info className="w-4 h-4" />
                  <span>EXPLAINABILITY LIMITATIONS & GOVERNANCE</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Attribution heatmaps visualize mathematical spatial activations across the 2D die matrix.
                  They do not measure physical film thickness, chemical contamination, or electrical shorting.
                  Engineering review is required for consequential lot disposition.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
          Loading explainability model telemetry...
        </div>
      )}
    </div>
  );
};
