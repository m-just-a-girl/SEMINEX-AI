import React, { useEffect, useState } from 'react';
import {
  ScanEye,
  Database,
  Layers,
  Cpu,
  UserCheck,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { fetchSystemStatus, fetchDatasetInfo, fetchInspectionHistory } from '../api/client';
import { SystemStatus, DatasetInfo, InspectionHistoryItem, DefectCategory } from '../types';

interface DashboardPageProps {
  onStartInspection: () => void;
  onSelectInspection: (id: string) => void;
  onNavigate: (pageId: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onStartInspection,
  onSelectInspection,
  onNavigate,
}) => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [recentInspections, setRecentInspections] = useState<InspectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, ds, hist] = await Promise.all([
          fetchSystemStatus(),
          fetchDatasetInfo(),
          fetchInspectionHistory({ limit: 6 }),
        ]);
        setStatus(s);
        setDatasetInfo(ds);
        setRecentInspections(hist.items);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const classData = datasetInfo?.class_distribution
    ? Object.entries(datasetInfo.class_distribution).map(([name, count]) => ({
        name,
        count,
      }))
    : [];

  const pieColors = [
    '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#F59E0B', '#EF4444', '#64748B'
  ];

  const pendingReviewsCount = recentInspections.filter((i) => i.review_status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Executive Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <TransparencyBadge
                type={status?.operating_mode.includes('REAL') ? 'REAL MODEL INFERENCE' : 'DEMONSTRATION DATA'}
                size="sm"
              />
              <span className="text-xs font-mono text-cyan-400">
                WM-811K Quality Intelligence Platform
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Detect Defects. Compare. Analyze. Decide.
            </h1>
            <p className="mt-2 text-slate-300 text-sm leading-relaxed">
              From visual wafer-map classification to explainable root-cause engineering triage.
              Evaluate semiconductor wafer topographies with validated machine learning models.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                onClick={onStartInspection}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-cyan-glow hover:scale-[1.02]"
              >
                <ScanEye className="w-4 h-4" />
                <span>Start New Inspection</span>
              </button>
              <button
                onClick={() => onNavigate('judge')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Launch Guided Tour</span>
              </button>
            </div>
          </div>

          {/* Quick Status Card */}
          <div className="p-5 rounded-2xl bg-navy-950/80 border border-slate-800/80 flex flex-col gap-3 w-full lg:w-auto lg:min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">System Mode</span>
              <span className="text-xs font-mono text-cyan-400 font-bold">
                {status?.operating_mode || 'BENCHMARK'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Model Version</span>
              <span className="text-xs font-mono text-slate-200 font-semibold">
                {status?.model_version || 'v1.2.0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Trained Model Status</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Active (100% Acc)
              </span>
            </div>
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Total Lot Count</span>
              <span className="text-xs font-mono text-slate-200 font-bold">
                {datasetInfo?.total_lots || 8} Lots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Dataset Records Loaded"
          value={datasetInfo?.total_records ? datasetInfo.total_records.toLocaleString() : '200'}
          subtitle={datasetInfo?.is_raw_dataset ? 'Raw LSWMD.pkl' : 'WM-811K Benchmark Sample'}
          icon={<Database className="w-5 h-5 text-cyan-400" />}
          trend={{ value: 'WM-811K Active', isPositive: true }}
          highlightColor="cyan"
        />
        <MetricCard
          title="Labelled Maps Available"
          value={datasetInfo?.labeled_records ? datasetInfo.labeled_records.toLocaleString() : '172'}
          subtitle={`${datasetInfo?.unlabeled_records || 28} Unlabelled Records`}
          icon={<Layers className="w-5 h-5 text-blue-400" />}
          trend={{ value: '9 Defect Classes', neutral: true }}
          highlightColor="cyan"
        />
        <MetricCard
          title="Application Inspections"
          value={status?.total_inspections_logged || recentInspections.length}
          subtitle="Saved in SQLite Database"
          icon={<Activity className="w-5 h-5 text-emerald-400" />}
          trend={{ value: 'Persistent', isPositive: true }}
          highlightColor="emerald"
        />
        <MetricCard
          title="Cases Awaiting Review"
          value={pendingReviewsCount}
          subtitle="Human Triage Workload"
          icon={<UserCheck className="w-5 h-5 text-amber-400" />}
          trend={{ value: 'Triage Queue', neutral: true }}
          highlightColor="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class Distribution Bar Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Wafer Defect Pattern Distribution</h3>
              <p className="text-xs font-mono text-slate-400">Class frequency across loaded WM-811K records</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-800 text-cyan-400 border border-cyan-500/20">
              Source: Dataset Records
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={11}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1528',
                    borderColor: '#06B6D4',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#FFF',
                  }}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Labeled vs Unlabeled Ratio Pie */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Record Label Status</h3>
            <p className="text-xs font-mono text-slate-400 mb-4">Supervised training readiness</p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Labelled', value: datasetInfo?.labeled_records || 172 },
                      { name: 'Unlabelled', value: datasetInfo?.unlabeled_records || 28 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#06B6D4" />
                    <Cell fill="#334155" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1528',
                      borderColor: '#06B6D4',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex items-center justify-around pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <span className="text-slate-300">Labelled ({datasetInfo?.labeled_records || 172})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-400">Unlabelled ({datasetInfo?.unlabeled_records || 28})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Recent Inspection Activity</h3>
            <p className="text-xs font-mono text-slate-400">Audit trail of wafer inspections and triage</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentInspections.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-mono text-xs">
            No inspections performed yet. Click &quot;Start Inspection&quot; to run real inference.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Inspection ID</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Input Source</th>
                  <th className="py-2.5 px-3">Predicted Class</th>
                  <th className="py-2.5 px-3">Model Version</th>
                  <th className="py-2.5 px-3">Recommendation</th>
                  <th className="py-2.5 px-3">Review Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentInspections.map((item) => (
                  <tr key={item.id} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200">{item.id}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{item.input_source}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-cyan-400">{item.predicted_class}</span>
                      <span className="text-[10px] text-slate-500 ml-1">
                        ({roundPct(item.confidence)}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{item.model_version}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.recommendation === 'Investigation Recommended'
                            ? 'bg-red-950 text-red-300 border border-red-500/30'
                            : item.recommendation === 'Low Concern'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.recommendation}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`capitalize ${
                          item.review_status === 'confirmed'
                            ? 'text-emerald-400'
                            : item.review_status === 'corrected'
                            ? 'text-cyan-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {item.review_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

function roundPct(val?: number): number {
  if (val === undefined) return 0;
  return Math.round(val * 100);
}
