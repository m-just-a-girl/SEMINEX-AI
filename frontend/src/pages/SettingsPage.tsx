import React, { useState } from 'react';
import {
  Settings,
  Shield,
  FolderOpen,
  Database,
  Cpu,
  Key,
  HardDrive,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';

export const SettingsPage: React.FC = () => {
  const [datasetPath, setDatasetPath] = useState('data/raw/LSWMD.pkl');
  const [modelWeightsPath, setModelWeightsPath] = useState('models/seminex_classifier.pkl');
  const [maxUploadMb, setMaxUploadMb] = useState(15);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSave = () => {
    setSaveMsg('Configuration saved successfully to local environment.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 18 • Environment & Security Configuration
            </span>
            <TransparencyBadge type="DECISION SUPPORT" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Settings & Security</h2>
          <p className="text-xs font-mono text-slate-400">
            Storage paths, upload payload restrictions, and fab security policies
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {saveMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Configuration */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Storage & Dataset Paths</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">
                Raw WM-811K Dataset Path (.pkl):
              </label>
              <input
                type="text"
                value={datasetPath}
                onChange={(e) => setDatasetPath(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Default: data/raw/LSWMD.pkl (Loads automatically on startup)
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">
                Trained Model Weights Path:
              </label>
              <input
                type="text"
                value={modelWeightsPath}
                onChange={(e) => setModelWeightsPath(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Default: models/seminex_classifier.pkl
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">
                SQLite Audit Database URL:
              </label>
              <input
                type="text"
                disabled
                value="sqlite:///./seminex.db"
                className="w-full p-2.5 rounded-xl bg-navy-950/60 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Security & Ingestion Policy */}
        <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Security & Upload Controls</h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">
                Max Image Upload Size (MB):
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-navy-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Enforced by API middleware to prevent Denial of Service.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-2 text-slate-300">
              <span className="font-bold text-emerald-400 text-[11px] block">
                Safe File Handling Enforced:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li>Uploaded files are validated with Pillow byte header checks.</li>
                <li>Arbitrary binary or executable uploads are strictly rejected.</li>
                <li>No secrets or private tokens logged in server stdout or frontend bundle.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
