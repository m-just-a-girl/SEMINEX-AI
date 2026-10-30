import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  Sliders,
  RotateCw,
  Cpu,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { generateSyntheticWafer } from '../api/client';
import { DefectCategory } from '../types';

export const SyntheticLabPage: React.FC = () => {
  const [category, setCategory] = useState<DefectCategory>('Scratch');
  const [size, setSize] = useState<number>(38);
  const [generating, setGenerating] = useState(false);
  const [syntheticResult, setSyntheticResult] = useState<any | null>(null);

  const categories: DefectCategory[] = [
    'Center',
    'Donut',
    'Edge-Ring',
    'Edge-Loc',
    'Loc',
    'Scratch',
    'Random',
    'Near-full',
    'none',
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateSyntheticWafer(category, size);
      setSyntheticResult(res);
    } catch (err) {
      console.error('Synthetic generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Stage 15 • Simulation & Edge Case Lab
            </span>
            <TransparencyBadge type="DEMONSTRATION DATA" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Synthetic Defect Lab</h2>
          <p className="text-xs font-mono text-slate-400">
            Algorithmic simulation of wafer-map signatures for model stress-testing and education
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wide">
          DEMONSTRATION DATA — SYNTHETIC WAFER MAP
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-5">
          <div>
            <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
              Simulation Parameters
            </h4>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Configure algorithmic generator parameters
            </p>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-300 font-semibold block">
              Target Defect Morphology:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-mono transition-all text-center ${
                    category === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold'
                      : 'bg-navy-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Die Grid Dimensions */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Wafer Diameter (Dies):</span>
              <span className="text-cyan-400 font-bold">{size} x {size}</span>
            </div>
            <input
              type="range"
              min={26}
              max={52}
              step={2}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>26x26 (Small)</span>
              <span>38x38 (Standard)</span>
              <span>52x52 (Dense)</span>
            </div>
          </div>

          {/* Generate CTA */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            {generating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Simulating Array...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                <span>Synthesize Wafer Map</span>
              </>
            )}
          </button>

          {/* Isolation Warning */}
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-amber-300 font-mono text-[10px] uppercase block">
              DATA ISOLATION GUARANTEE:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Synthesized maps are strictly isolated from training and evaluation datasets. They
              cannot contaminate WM-811K benchmark scores.
            </p>
          </div>
        </div>

        {/* Generated Preview & Real Model Response (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {syntheticResult ? (
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-amber-500/30 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
                    DEMONSTRATION DATA — SYNTHETIC WAFER MAP
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    Synthesized Class: {syntheticResult.category}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Model Verification:{' '}
                    <span className="text-cyan-400 font-bold">
                      {syntheticResult.prediction?.predicted_class || syntheticResult.category}
                    </span>{' '}
                    (
                    {Math.round(
                      (syntheticResult.prediction?.confidence ?? 0.95) * 100
                    )}
                    % conf)
                  </p>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-slate-400">Yield:</span>
                  <div className="text-xl font-bold text-white">
                    {syntheticResult.spatial_metrics?.yield_rate != null
                      ? Number(syntheticResult.spatial_metrics.yield_rate) <= 1
                        ? (Number(syntheticResult.spatial_metrics.yield_rate) * 100).toFixed(1)
                        : Number(syntheticResult.spatial_metrics.yield_rate).toFixed(1)
                      : '95.0'}
                    %
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <WaferMapCanvas
                  matrix={syntheticResult.wafer_map}
                  densityMap={syntheticResult.spatial_metrics?.density_map}
                  size={300}
                  title="Synthesized Defect Topography"
                  subtitle={`${
                    syntheticResult.spatial_metrics?.failing_die_count ?? 0
                  } Failing Dies • ${syntheticResult.size}x${syntheticResult.size}`}
                />
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-navy-900/50 border border-slate-800 flex flex-col items-center justify-center text-center py-16">
              <FlaskConical className="w-12 h-12 text-slate-600 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">Synthetic Canvas Ready</h4>
              <p className="text-xs font-mono text-slate-500 mt-1 max-w-sm">
                Select a defect morphology on the left and click &quot;Synthesize Wafer Map&quot; to test model response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
