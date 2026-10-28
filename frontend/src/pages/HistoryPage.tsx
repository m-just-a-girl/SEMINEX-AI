import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  FileText,
  FileSpreadsheet,
  ArrowUpDown,
  RotateCw,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchInspectionHistory, downloadCsvReport, downloadPdfReport } from '../api/client';
import { InspectionHistoryItem } from '../types';

interface HistoryPageProps {
  onSelectInspection: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectInspection }) => {
  const [items, setItems] = useState<InspectionHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchInspectionHistory({
        limit: 100,
        search,
        category,
        status,
      });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, category, status]);

  const handleDownloadCsv = () => {
    downloadCsvReport();
  };

  const handleDownloadPdf = (id: string) => {
    downloadPdfReport(id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 12 • Audit Ledger & Telemetry
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inspection History</h2>
          <p className="text-xs font-mono text-slate-400">
            Searchable, exportable record of all semiconductor inspections stored in SQLite
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-semibold text-slate-200 hover:text-cyan-300 transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export All CSV</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search Inspection ID, Record ID, or Lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Defect Patterns</option>
          <option value="none">none</option>
          <option value="Center">Center</option>
          <option value="Donut">Donut</option>
          <option value="Edge-Loc">Edge-Loc</option>
          <option value="Edge-Ring">Edge-Ring</option>
          <option value="Loc">Loc</option>
          <option value="Random">Random</option>
          <option value="Near-full">Near-full</option>
          <option value="Scratch">Scratch</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="p-2 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="">All Review Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="corrected">Corrected</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4 text-xs font-mono text-slate-400">
          <span>{total} Total Inspections Logged</span>
          {loading && (
            <div className="flex items-center gap-1.5 text-cyan-400">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Input Target</th>
                <th className="py-2.5 px-3">Predicted Class</th>
                <th className="py-2.5 px-3">Yield Rate</th>
                <th className="py-2.5 px-3">Recommendation</th>
                <th className="py-2.5 px-3">Review Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-200">{item.id}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(item.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {item.record_id} ({item.lot_name})
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-cyan-400">{item.predicted_class}</span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({Math.round(item.confidence * 100)}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">
                    {Math.round((100 - item.failure_rate) * 10) / 10}%
                  </td>
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
                          ? 'text-emerald-400 font-bold'
                          : item.review_status === 'corrected'
                          ? 'text-cyan-400 font-bold'
                          : 'text-amber-400'
                      }`}
                    >
                      {item.review_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDownloadPdf(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-navy-800"
                        title="Download PDF Report"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onSelectInspection(item.id)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Inspect &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
