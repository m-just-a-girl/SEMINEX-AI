import React, { useState, useEffect } from 'react';
import { Layers, Database, Filter, BarChart3, TrendingUp, Cpu } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchBatchAnalytics } from '../api/client';

export const BatchAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchBatchAnalytics();
        setData(res);
      } catch (err) {
        console.error('Failed to load batch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const lotSummaries = data?.lot_summaries || [];
  const filteredLots =
    selectedLot === 'all'
      ? lotSummaries
      : lotSummaries.filter((l: any) => l.lot_name === selectedLot);

  const yieldData = filteredLots.map((l: any) => ({
    lot: l.lot_name,
    meanYield: l.mean_yield,
    minYield: l.min_yield,
    maxYield: l.max_yield,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 8 • Batch & Lot Level Metrics
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Batch & Lot Analytics</h2>
          <p className="text-xs font-mono text-slate-400">
            Yield spread, defect pattern recurrence, and lot-to-lot consistency analysis
          </p>
        </div>

        {/* Lot Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Filter Lot:</span>
          <select
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            className="p-2 rounded-xl bg-navy-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Fabrication Lots</option>
            {lotSummaries.map((l: any) => (
              <option key={l.lot_name} value={l.lot_name}>
                {l.lot_name} ({l.wafer_count} wafers)
              </option>
            ))}
          </select>
        </div>
      </div>

      {data ? (
        <div className="space-y-6">
          {/* Top Bar Chart: Yield per lot */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Fabrication Lot Yield Performance</h3>
                <p className="text-xs font-mono text-slate-400">
                  Mean, Minimum, and Maximum wafer yield across analyzed FOUP lots
                </p>
              </div>
              <span className="text-xs font-mono text-cyan-400">
                {filteredLots.length} Lots Displayed
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yieldData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                  <XAxis dataKey="lot" stroke="#94A3B8" fontSize={11} />
                  <YAxis domain={[80, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1528',
                      borderColor: '#06B6D4',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="meanYield" name="Mean Yield (%)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minYield" name="Min Yield (%)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxYield" name="Max Yield (%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lot Detailed Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.map((lot: any) => (
              <div
                key={lot.lot_name}
                className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">{lot.lot_name}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {lot.wafer_count} wafers
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400">Mean Lot Yield:</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {lot.mean_yield}%
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Yield Spread:</span>
                    <span className="text-slate-300">
                      [{lot.min_yield}% - {lot.max_yield}%]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Top Detected Anomaly:</span>
                    <span className="text-cyan-300 font-semibold">
                      {getTopDefectInLot(lot.pattern_distribution)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
          Loading batch analytics...
        </div>
      )}
    </div>
  );
};

function getTopDefectInLot(dist: Record<string, number>): string {
  if (!dist) return 'none';
  const entries = Object.entries(dist).filter(([k]) => k !== 'none');
  if (entries.length === 0) return 'Nominal (none)';
  entries.sort((a, b) => b[1] - a[1]);
  return `${entries[0][0]} (${entries[0][1]}x)`;
}
