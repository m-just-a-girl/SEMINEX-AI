import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchInspectionHistory, downloadPdfReport, downloadCsvReport } from '../api/client';
import { InspectionHistoryItem } from '../types';

interface ReportsPageProps {
  initialInspectionId?: string | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialInspectionId }) => {
  const [inspections, setInspections] = useState<InspectionHistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialInspectionId || '');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchInspectionHistory({ limit: 30 });
        setInspections(res.items);
        if (res.items.length > 0 && !selectedId) {
          setSelectedId(res.items[0].id);
        }
      } catch (err) {
        console.error('Failed to load inspections for reports:', err);
      }
    }
    load();
  }, [selectedId]);

  const handleDownloadPdf = (id: string) => {
    downloadPdfReport(id);
  };

  const handleDownloadCsv = () => {
    downloadCsvReport();
  };

  const current = inspections.find((i) => i.id === selectedId) || inspections[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 13 • Compliance & Audit Export
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inspection Reports Hub</h2>
          <p className="text-xs font-mono text-slate-400">
            Generate and download executive-level, audit-ready PDF and CSV inspection certificates
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 border border-slate-700 hover:border-cyan-500/50 text-xs font-mono font-semibold text-slate-200 hover:text-cyan-300 transition-all shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export All Records (CSV)</span>
        </button>
      </div>

      {/* Main Grid: Target Selector & Live PDF Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inspection Selector List (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold uppercase">Select Inspection Record</span>
            <span className="text-cyan-400">{inspections.length} available</span>
          </div>

          <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1 custom-scroll">
            {inspections.map((item) => {
              const active = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-mono text-left transition-all ${
                    active
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-white shadow-sm'
                      : 'bg-navy-950/60 hover:bg-navy-800/60 border border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.id}</div>
                    <div className="text-[10px] text-slate-500">
                      {item.record_id} • {item.lot_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-900/40 text-cyan-300">
                      {item.predicted_class}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {Math.round(item.confidence * 100)}% conf
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* PDF Certificate Preview & Direct Download (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {current ? (
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-6 backdrop-blur-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">
                    PDF Report Certificate
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{current.id}</h3>
                  <p className="text-xs font-mono text-slate-400">
                    Generated with ReportLab • Formatted for semiconductor fab compliance
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadPdf(current.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              {/* Certificate Mockup Box */}
              <div className="p-6 rounded-xl bg-slate-100 text-slate-900 space-y-4 shadow-lg border border-slate-300 text-xs font-sans">
                <div className="flex items-center justify-between pb-3 border-b-2 border-cyan-600">
                  <div>
                    <h4 className="text-base font-extrabold text-navy-950 tracking-wider">
                      SEMI NEX AI
                    </h4>
                    <p className="text-[10px] text-cyan-700 font-mono">
                      Semiconductor Quality Intelligence & Decision Support
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] font-bold text-slate-700 uppercase">
                      DEFECT INSPECTION REPORT
                    </span>
                    <div className="text-[9px] text-slate-500 font-mono">
                      Date: {new Date(current.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono bg-slate-50 p-3 rounded border border-slate-200">
                  <div>
                    <b>Inspection ID:</b> {current.id}
                  </div>
                  <div>
                    <b>Model Version:</b> {current.model_version}
                  </div>
                  <div>
                    <b>Target Wafer:</b> {current.record_id}
                  </div>
                  <div>
                    <b>Lot ID:</b> {current.lot_name}
                  </div>
                  <div>
                    <b>Predicted Pattern:</b> <span className="text-cyan-800 font-bold">{current.predicted_class}</span>
                  </div>
                  <div>
                    <b>Confidence:</b> {Math.round(current.confidence * 100)}%
                  </div>
                  <div>
                    <b>Failure Rate:</b>{' '}
                    {Number(current.failure_rate) <= 1
                      ? (Number(current.failure_rate) * 100).toFixed(2)
                      : Number(current.failure_rate).toFixed(2)}
                    %
                  </div>
                  <div>
                    <b>Recommendation:</b> <b>{current.recommendation}</b>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-[9px] text-slate-500 leading-relaxed font-mono">
                  <b>LEGAL NOTICE:</b> SEMI NEX AI provides evidence-based decision support. Wafer
                  topography predictions do not establish physical equipment provenance or certified
                  reliability. Human verification required before lot disposition.
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
              No inspection selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
