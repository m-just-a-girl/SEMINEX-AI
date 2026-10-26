import React, { useState, useEffect } from 'react';
import { Boxes, Cpu, Layers, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchDatasetSamples, fetchWaferDetail } from '../api/client';
import { WaferSample } from '../types';

export const DigitalTwinPage: React.FC = () => {
  const [samples, setSamples] = useState<WaferSample[]>([]);
  const [selectedWafer, setSelectedWafer] = useState<WaferSample | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchDatasetSamples({ limit: 25 });
        setSamples(res.items);
        if (res.items.length > 0) {
          const detail = await fetchWaferDetail(res.items[0].id);
          setSelectedWafer(detail);
        }
      } catch (err) {
        console.error('Error loading digital twin sample:', err);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 14 • Spatial Virtual Representation
            </span>
            <TransparencyBadge type="DEMONSTRATION DATA" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Batch Digital Twin</h2>
          <p className="text-xs font-mono text-slate-400">
            Lightweight digital state modeling of fabrication lot cassettes and wafer slots
          </p>
        </div>
      </div>

      {selectedWafer && (
        <div className="space-y-6">
          {/* Virtual FOUP Cassette Slot Grid (25 Wafers per standard semiconductor FOUP) */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  FOUP Cassette Lot: {selectedWafer.lot_name} (25 Wafer Slots)
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Select a slot position to inspect spatial state and die telemetry
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">Standard 300mm FOUP</span>
            </div>

            {/* 25 Wafer Slot Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-12 md:grid-cols-25 gap-1.5 pt-2">
              {Array.from({ length: 25 }, (_, i) => i + 1).map((slotNum) => {
                const isSelected = selectedWafer.wafer_index === slotNum;
                return (
                  <button
                    key={slotNum}
                    onClick={() => {
                      const found = samples.find(
                        (s) => s.lot_name === selectedWafer.lot_name && s.wafer_index === slotNum
                      );
                      if (found) setSelectedWafer(found);
                    }}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center font-mono text-[10px] transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold border border-cyan-300 shadow-cyan-glow scale-105'
                        : 'bg-navy-950/80 hover:bg-navy-800 border border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>#{slotNum}</span>
                    <span className="text-[8px] opacity-70">W-{slotNum}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Selected Wafer Digital Twin View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-navy-900/70 border border-slate-800 flex flex-col items-center">
              <WaferMapCanvas
                matrix={selectedWafer.wafer_map}
                size={300}
                title={`Digital Twin State: ${selectedWafer.id}`}
                subtitle={`Lot ${selectedWafer.lot_name} • Slot #${selectedWafer.wafer_index}`}
              />
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
                <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-white">
                  Virtual Wafer State Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400">Total Represented Dies:</span>
                    <div className="text-lg font-bold text-white mt-1">
                      {selectedWafer.die_size} dies
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400">Die Grid Dimensions:</span>
                    <div className="text-lg font-bold text-cyan-400 mt-1">
                      {selectedWafer.wafer_map.length} x {selectedWafer.wafer_map[0]?.length || 0}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400">Cataloged Signature:</span>
                    <div className="text-lg font-bold text-purple-400 mt-1">
                      {selectedWafer.original_label || 'Unlabelled'}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800">
                    <span className="text-slate-400">Twin Sync State:</span>
                    <div className="text-lg font-bold text-emerald-400 mt-1">SIMULATED OK</div>
                  </div>
                </div>
              </div>

              {/* Digital Twin Limitations Box */}
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="text-cyan-400 font-mono font-semibold text-[11px]">
                  * DIGITAL REPRESENTATION BOUNDARY
                </div>
                <p className="text-[11px] leading-relaxed">
                  This interface provides a virtual representation of semiconductor wafer and lot states
                  based on historical map arrays. It does not interface with live factory SCADA or
                  automated material handling systems (AMHS).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
