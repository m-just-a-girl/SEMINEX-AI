import React, { useState, useEffect } from 'react';
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
  Globe,
  Radio,
} from 'lucide-react';
import { TransparencyBadge } from '../components/TransparencyBadge';
import { getBaseUrl, setCustomApiUrl, checkServerAvailability } from '../api/client';

export const SettingsPage: React.FC = () => {
  const [datasetPath, setDatasetPath] = useState(() => localStorage.getItem('seminex_dataset_path') || 'data/raw/LSWMD.pkl');
  const [modelWeightsPath, setModelWeightsPath] = useState(() => localStorage.getItem('seminex_model_weights_path') || 'models/seminex_classifier.pkl');
  const [maxUploadMb, setMaxUploadMb] = useState(() => Number(localStorage.getItem('seminex_max_upload_mb')) || 15);
  const [cloudApiUrl, setCloudApiUrlState] = useState('');
  const [connStatus, setConnStatus] = useState<'checking' | 'connected' | 'offline' | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    setCloudApiUrlState(getBaseUrl());
  }, []);

  const handleTestConnection = async () => {
    setConnStatus('checking');
    setCustomApiUrl(cloudApiUrl);
    const ok = await checkServerAvailability();
    setConnStatus(ok ? 'connected' : 'offline');
  };

  const handleSave = () => {
    const clampedUpload = Math.min(50, Math.max(1, maxUploadMb || 15));
    setMaxUploadMb(clampedUpload);
    setCustomApiUrl(cloudApiUrl);
    try {
      localStorage.setItem('seminex_dataset_path', datasetPath.trim());
      localStorage.setItem('seminex_model_weights_path', modelWeightsPath.trim());
      localStorage.setItem('seminex_max_upload_mb', String(clampedUpload));
    } catch {}
    setSaveMsg('Configuration and preferences saved successfully.');
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

      {/* Live API Server Connection Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900/90 to-navy-950 border border-cyan-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Live Python / FastAPI Backend Server URL</h3>
              <p className="text-xs font-mono text-slate-400">
                Connect your GitHub Pages frontend to your deployed Render, Railway, or local FastAPI server
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connStatus === 'checking' && (
              <span className="text-xs font-mono text-amber-400 animate-pulse">Checking connection...</span>
            )}
            {connStatus === 'connected' && (
              <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Connected to Live Backend
              </span>
            )}
            {connStatus === 'offline' && (
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-400">
                Fallback: Browser Engine Active
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-9">
            <input
              type="text"
              placeholder="e.g. https://seminex-ai-backend.onrender.com (or leave empty for standalone browser mode)"
              value={cloudApiUrl}
              onChange={(e) => setCloudApiUrlState(e.target.value)}
              className="w-full p-3 rounded-xl bg-navy-950 border border-slate-700 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div className="md:col-span-3 flex gap-2">
            <button
              onClick={handleTestConnection}
              className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-navy-800 hover:bg-navy-700 border border-slate-700 text-xs font-mono font-semibold text-slate-200 transition-all"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Test Ping</span>
            </button>
          </div>
        </div>
        <p className="text-[11px] font-mono text-slate-500">
          💡 If you deploy the backend on Render, Railway, or Hugging Face, paste your public URL here. All 19 pages will automatically execute inference against your real cloud PyTorch / Scikit-Learn models!
        </p>
      </div>

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
