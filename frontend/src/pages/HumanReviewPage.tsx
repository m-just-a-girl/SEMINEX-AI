import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Flag,
  Save,
  Clock,
  Search,
  Check,
  RotateCw,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { fetchInspectionHistory, fetchInspectionDetail, submitHumanReview } from '../api/client';
import { InspectionHistoryItem, DefectCategory } from '../types';

export const HumanReviewPage: React.FC = () => {
  const [inspections, setInspections] = useState<InspectionHistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [decision, setDecision] = useState<'confirmed' | 'corrected' | 'flagged'>('confirmed');
  const [correctedCategory, setCorrectedCategory] = useState<string>('Center');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const categories: DefectCategory[] = [
    'none', 'Center', 'Donut', 'Edge-Loc', 'Edge-Ring',
    'Loc', 'Random', 'Near-full', 'Scratch'
  ];

  const loadHistory = async () => {
    try {
      const res = await fetchInspectionHistory({ limit: 40 });
      setInspections(res.items);
      if (res.items.length > 0 && !selectedItem) {
        const detail = await fetchInspectionDetail(res.items[0].id);
        setSelectedItem(detail);
        setReviewerNotes(detail.reviewer_notes || '');
      }
    } catch (err) {
      console.error('Failed to load review items:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSelectItem = async (id: string) => {
    try {
      const detail = await fetchInspectionDetail(id);
      setSelectedItem(detail);
      setReviewerNotes(detail.reviewer_notes || '');
      setDecision(detail.review_status === 'pending' ? 'confirmed' : detail.review_status);
      setSuccessMsg(null);
    } catch (err) {
      console.error('Failed to load item detail:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await submitHumanReview(selectedItem.id, {
        decision,
        corrected_category: decision === 'corrected' ? correctedCategory : undefined,
        notes: reviewerNotes,
        reviewer_id: 'Quality Engineer (Lead)',
      });
      setSuccessMsg(`Review successfully recorded for ${selectedItem.id}`);
      await loadHistory();
      const updated = await fetchInspectionDetail(selectedItem.id);
      setSelectedItem(updated);
    } catch (err) {
      console.error('Review submit failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Stage 10 • Quality Assurance & Governance
            </span>
            <TransparencyBadge type="HUMAN REVIEW RECOMMENDED" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Human Quality Review</h2>
          <p className="text-xs font-mono text-slate-400">
            Confirm, correct, or flag automated classifications with persistent engineering audit logs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Inspection Queue (4 cols) */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold uppercase">Inspection Review Queue</span>
            <span className="text-cyan-400">{inspections.length} recorded</span>
          </div>

          <div className="max-h-[460px] overflow-y-auto space-y-2 pr-1 custom-scroll">
            {inspections.map((item) => {
              const isSel = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectItem(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-mono text-left transition-all ${
                    isSel
                      ? 'bg-cyan-950/80 border border-cyan-500/50 text-white shadow-sm'
                      : 'bg-navy-950/60 hover:bg-navy-800/60 border border-slate-800/60 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{item.id}</div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.review_status === 'confirmed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : item.review_status === 'corrected'
                          ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                          : item.review_status === 'flagged'
                          ? 'bg-red-950 text-red-400 border border-red-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.review_status}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-bold">
                      {item.predicted_class}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Review Action Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {selectedItem ? (
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Reviewing Target: {selectedItem.id}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">
                    AI Prediction: <span className="text-cyan-400">{selectedItem.predicted_class}</span>
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    Confidence: {Math.round(selectedItem.confidence * 100)}% • Model:{' '}
                    {selectedItem.model_version}
                  </p>
                </div>

                <div className="text-right text-xs font-mono">
                  <span className="text-slate-400">Dataset Label:</span>
                  <div className="text-slate-200 font-bold">
                    {selectedItem.original_label || 'Unlabelled'}
                  </div>
                </div>
              </div>

              {/* Decision Choice Buttons */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                  Select Engineering Disposition Decision:
                </label>
                <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                  <button
                    onClick={() => setDecision('confirmed')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      decision === 'confirmed'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-sm'
                        : 'bg-navy-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Confirm AI</span>
                  </button>

                  <button
                    onClick={() => setDecision('corrected')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      decision === 'corrected'
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-navy-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-cyan-400" />
                    <span>Correct Class</span>
                  </button>

                  <button
                    onClick={() => setDecision('flagged')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                      decision === 'flagged'
                        ? 'bg-red-950/80 text-red-300 border-red-500/50 shadow-sm'
                        : 'bg-navy-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Flag className="w-4 h-4 text-red-400" />
                    <span>Flag Uncertain</span>
                  </button>
                </div>
              </div>

              {/* If Corrected -> Dropdown */}
              {decision === 'corrected' && (
                <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2 text-xs font-mono">
                  <label className="text-slate-300 font-semibold block">
                    Select Ground Truth Correction:
                  </label>
                  <select
                    value={correctedCategory}
                    onChange={(e) => setCorrectedCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-navy-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reviewer Notes */}
              <div className="space-y-2 text-xs font-mono">
                <label className="text-slate-300 font-semibold block">
                  Engineer Review Notes & Audit Remarks:
                </label>
                <textarea
                  rows={3}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Record observations, SEM verification findings, or lot disposition justification..."
                  className="w-full p-3 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <div className="flex justify-end pt-2">
                <button
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow"
                >
                  {submitting ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Saving Audit...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Persist Review Decision</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
              Select an item from the queue to conduct human quality review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
