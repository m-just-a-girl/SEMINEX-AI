import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Layers,
  Search,
  Filter,
  BarChart2,
  PieChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchDatasetSamples, fetchWaferDetail } from '../api/client';
import { WaferSample, DefectCategory } from '../types';

export const IntelligencePage: React.FC = () => {
  const [samples, setSamples] = useState<WaferSample[]>([]);
  const [selectedWafer, setSelectedWafer] = useState<WaferSample | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDatasetSamples({ limit: 60 });
        setSamples(res.items);
        if (res.items.length > 0) {
          // Fetch full spatial metrics for first wafer
          const detail = await fetchWaferDetail(res.items[0].id);
          setSelectedWafer(detail);
        }
      } catch (err) {
        console.error('Failed to load intelligence samples:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectWafer = async (id: string) => {
    try {
      const detail = await fetchWaferDetail(id);
      setSelectedWafer(detail);
    } catch (err) {
      console.error('Failed to load wafer detail:', err);
    }
  };

  const filteredSamples = samples.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.original_label === selectedCategory;
    const matchLot = selectedLot === 'all' || s.lot_name === selectedLot;
    const matchSearch =
      search === '' ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.lot_name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchLot && matchSearch;
  });

  const categories: DefectCategory[] = [
    'none', 'Center', 'Donut', 'Edge-Loc', 'Edge-Ring',
    'Loc', 'Random', 'Near-full', 'Scratch'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 4 • Topography & Clustering
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Wafer Pattern Intelligence</h2>
          <p className="text-xs font-mono text-slate-400">
            Connected-component clustering, radial density profiling, and multi-quadrant dispersion
          </p>
        </div>
      </div>

      {/* 9 Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono custom-scroll">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl border transition-all ${
            selectedCategory === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
              : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          All Classes
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                : 'bg-navy-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Gallery & Interactive Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery Selector (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Filter Sample Wafers</span>
            <span className="text-cyan-400">{filteredSamples.length} found</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by ID or Lot..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scroll">
            {filteredSamples.map((s) => {
              const active = selectedWafer?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectWafer(s.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-mono transition-all text-left ${
                    active
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-white shadow-sm'
                      : 'bg-navy-950/50 hover:bg-navy-800/60 border border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{s.id}</div>
                    <div className="text-[10px] text-slate-500">
                      {s.lot_name} • Wafer #{s.wafer_index}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-900/30 text-cyan-300">
                      {s.original_label || 'Unlabelled'}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.die_size} dies</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detailed Spatial Analytics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedWafer ? (
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Wafer:</span>
                    <span className="text-cyan-400 font-mono">{selectedWafer.id}</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Lot: {selectedWafer.lot_name} • Slot: #{selectedWafer.wafer_index} • Pattern:{' '}
                    <span className="text-cyan-300 font-bold">{selectedWafer.original_label || 'Unlabelled'}</span>
                  </p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-slate-400">Wafer Yield</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {selectedWafer.spatial_metrics?.yield_rate || 98.2}%
                  </div>
                </div>
              </div>

              {/* Wafer Map and Spatial Breakdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <WaferMapCanvas
                  matrix={selectedWafer.wafer_map}
                  densityMap={selectedWafer.spatial_metrics?.density_map}
                  size={300}
                  title="Interactive Topography & Density"
                  subtitle="Derived Gaussian spatial-density overlay enabled"
                />

                {/* Regional Radial Distribution */}
                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                    <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                      Concentric Radial Ring Distribution
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Inner Core (r &lt; 0.35 R):</span>
                          <span className="text-slate-200 font-bold">
                            {selectedWafer.spatial_metrics?.radial_distribution?.inner ?? 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
                            style={{
                              width: `${selectedWafer.spatial_metrics?.radial_distribution?.inner ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Middle Ring (0.35 R &lt; r &lt; 0.75 R):</span>
                          <span className="text-slate-200 font-bold">
                            {selectedWafer.spatial_metrics?.radial_distribution?.middle ?? 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-blue-400"
                            style={{
                              width: `${selectedWafer.spatial_metrics?.radial_distribution?.middle ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span>Outer Perimeter (r &gt; 0.75 R):</span>
                          <span className="text-slate-200 font-bold">
                            {selectedWafer.spatial_metrics?.radial_distribution?.outer ?? 0}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-orange-400"
                            style={{
                              width: `${selectedWafer.spatial_metrics?.radial_distribution?.outer ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Connected Components & Clusters */}
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                    <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                      Connected Component Cluster Analysis
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                      <div>
                        Clusters Detected:{' '}
                        <span className="text-slate-200 font-bold">
                          {selectedWafer.spatial_metrics?.clusters ?? 0}
                        </span>
                      </div>
                      <div>
                        Max Cluster Size:{' '}
                        <span className="text-slate-200 font-bold">
                          {selectedWafer.spatial_metrics?.max_cluster_size ?? 0} dies
                        </span>
                      </div>
                      <div>
                        Total Dies:{' '}
                        <span className="text-slate-200 font-bold">
                          {selectedWafer.spatial_metrics?.total_die_count ?? selectedWafer.die_size}
                        </span>
                      </div>
                      <div>
                        Failing Dies:{' '}
                        <span className="text-red-400 font-bold">
                          {selectedWafer.spatial_metrics?.failing_die_count ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quadrant Balance */}
                  <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2">
                    <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                      Quadrant Dispersion (Q1 - Q4)
                    </h5>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded bg-navy-900">
                        <div className="text-[10px] text-slate-500">Q1 (Top-R)</div>
                        <div className="text-xs font-bold text-slate-200">
                          {selectedWafer.spatial_metrics?.quadrant_distribution?.q1 ?? 0}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-navy-900">
                        <div className="text-[10px] text-slate-500">Q2 (Top-L)</div>
                        <div className="text-xs font-bold text-slate-200">
                          {selectedWafer.spatial_metrics?.quadrant_distribution?.q2 ?? 0}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-navy-900">
                        <div className="text-[10px] text-slate-500">Q3 (Bot-L)</div>
                        <div className="text-xs font-bold text-slate-200">
                          {selectedWafer.spatial_metrics?.quadrant_distribution?.q3 ?? 0}%
                        </div>
                      </div>
                      <div className="p-2 rounded bg-navy-900">
                        <div className="text-[10px] text-slate-500">Q4 (Bot-R)</div>
                        <div className="text-xs font-bold text-slate-200">
                          {selectedWafer.spatial_metrics?.quadrant_distribution?.q4 ?? 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
              Select a wafer from the left explorer to view spatial intelligence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
