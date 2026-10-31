import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Cpu, Layers, HelpCircle, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchForecast } from '../api/client';

export const PredictiveQualityPage: React.FC = () => {
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchForecast();
        setForecastData(res);
      } catch (err) {
        console.error('Failed to load forecast:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Merge historical and forecast for combined chart
  const combinedSeries = [];
  if (forecastData) {
    for (const h of forecastData.historical_series) {
      combinedSeries.push({
        lot: h.lot_name,
        actualYield: h.mean_yield,
        baseline: forecastData.baseline_moving_avg,
        type: 'Historical',
      });
    }
    for (const f of forecastData.forecast_series) {
      combinedSeries.push({
        lot: f.forecast_lot,
        projectedYield: f.projected_yield,
        lowerBound: f.uncertainty_lower,
        upperBound: f.uncertainty_upper,
        baseline: forecastData.baseline_moving_avg,
        type: 'Forecast',
      });
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              Stage 7 • Yield Forecasting
            </span>
            <TransparencyBadge type="PROTOTYPE DATA-DRIVEN FORECAST" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Predictive Quality Forecasting</h2>
          <p className="text-xs font-mono text-slate-400">
            Batch-level trend projections, moving-average baseline & uncertainty boundaries
          </p>
        </div>
      </div>

      {forecastData ? (
        <div className="space-y-6">
          {/* Main Forecast Chart Card */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Lot Yield Trajectory & Upcoming Horizon
                </h3>
                <p className="text-xs font-mono text-slate-400">
                  Autoregressive trend line with 3-lot forward projection & uncertainty bounds
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-full bg-navy-950 border border-slate-700 text-slate-300">
                  Moving Avg Baseline: {forecastData.baseline_moving_avg}%
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedSeries} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                  <XAxis dataKey="lot" stroke="#94A3B8" fontSize={11} />
                  <YAxis domain={[90, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1528',
                      borderColor: '#06B6D4',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actualYield"
                    name="Observed Lot Yield"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10B981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectedYield"
                    name="Projected Yield (Horizon)"
                    stroke="#00F0FF"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#00F0FF' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    name="Baseline Moving Avg"
                    stroke="#64748B"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3-Lot Horizon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecastData.forecast_series.map((item: any, idx: number) => (
              <div
                key={item.forecast_lot}
                className="p-5 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    Step +{idx + 1} • {item.forecast_lot}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      item.alert_status === 'Stable'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.alert_status}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400">Projected Yield Rate:</div>
                  <div className="text-2xl font-bold font-mono text-white mt-0.5">
                    {item.projected_yield}%
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Uncertainty Range:</span>
                    <span className="text-slate-200">
                      [{item.uncertainty_lower}% - {item.uncertainty_upper}%]
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baseline Difference:</span>
                    <span
                      className={
                        item.projected_yield >= item.baseline_comparison
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      }
                    >
                      {roundDelta(item.projected_yield - item.baseline_comparison)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Limitations and Methodology Box */}
          <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 font-mono font-semibold text-[11px]">
              <HelpCircle className="w-4 h-4" />
              <span>FORECASTING METHODOLOGY & DATA LIMITATIONS</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              {forecastData.limitations}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
          Computing batch yield forecasts...
        </div>
      )}
    </div>
  );
};

function roundDelta(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r >= 0 ? `+${r}` : `${r}`;
}
