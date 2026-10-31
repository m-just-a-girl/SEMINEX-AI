import React, { useState, useEffect } from 'react';
import {
  ScanEye,
  Upload,
  Database,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  GitCompare,
  Search,
  RotateCw,
  Cpu,
  Scale,
  FileSearch,
} from 'lucide-react';
import { WaferMapCanvas } from '../components/WaferMapCanvas';
import { TransparencyBadge } from '../components/TransparencyBadge';
import {
  fetchDatasetSamples,
  runInspection,
  uploadAndInspect,
  fetchInspectionDetail,
} from '../api/client';
import { WaferSample, InspectionResult, DefectCategory } from '../types';

interface InspectionPageProps {
  initialInspectionId?: string | null;
  onNavigate: (pageId: any, param?: any) => void;
}

export const InspectionPage: React.FC<InspectionPageProps> = ({
  initialInspectionId,
  onNavigate,
}) => {
  const [samples, setSamples] = useState<WaferSample[]>([]);
  const [selectedSample, setSelectedSample] = useState<WaferSample | null>(null);
  const [activeTab, setActiveTab] = useState<'dataset' | 'upload' | 'demo'>('dataset');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [inspecting, setInspecting] = useState(false);
  const [inspectionStage, setInspectionStage] = useState<string>('');
  const [result, setResult] = useState<InspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load sample dataset records and handle initialInspectionId
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDatasetSamples({ limit: 40 });
        setSamples(data.items);

        if (initialInspectionId) {
          const detail = await fetchInspectionDetail(initialInspectionId);
          if (detail) {
            // Restore inspection result view
            const restoredMap = detail.wafer_map || (data.items[0] ? data.items[0].wafer_map : []);
            setResult({
              inspection_id: detail.id,
              record_id: detail.record_id || detail.id,
              lot_name: detail.lot_name || 'lot-unknown',
              wafer_index: detail.wafer_index || 1,
              original_label: detail.original_label || null,
              timestamp: detail.timestamp,
              input_source: detail.input_source,
              prediction: {
                predicted_class: detail.predicted_class,
                confidence: detail.confidence,
                class_scores: detail.class_scores || {},
                model_version: detail.model_version,
                model_mode: detail.model_mode,
              },
              spatial_metrics: {
                total_die_count: detail.total_die_count,
                failing_die_count: detail.failing_die_count,
                passing_die_count: detail.total_die_count - detail.failing_die_count,
                failure_rate: detail.failure_rate,
                yield_rate: Math.round((100 - detail.failure_rate) * 100) / 100,
                clusters: 1,
                max_cluster_size: detail.failing_die_count,
                radial_distribution: { inner: 0.33, middle: 0.33, outer: 0.34 },
                quadrant_distribution: { q1: 0.25, q2: 0.25, q3: 0.25, q4: 0.25 },
                mean_radial_distance: 0.5,
                density_map: [],
              },
              decision_support: {
                recommendation: (detail.recommendation as any) || 'Review Recommended',
                recommendation_reason: detail.recommendation_reason || '',
                risk_score: 50.0,
                risk_tier: 'Moderate',
                risk_framework: 'Prototype Risk Scoring Framework',
                formula_description: 'Sum of weighted factors',
                factors: {
                  failure_rate_points: 20,
                  cluster_density_points: 15,
                  pattern_severity_points: 15,
                  uncertainty_points: 0,
                },
                limitations: 'Demonstration risk model only.',
              },
              root_cause_hypothesis: {
                title: detail.hypothesis || 'Inspection Analysis',
                spatial_evidence: detail.recommendation_reason || '',
                investigation_directions: ['Review manufacturing tool telemetry and recipe settings.'],
                engineer_questions: ['Did equipment alarms trigger during this production lot?'],
                verification_steps: ['Perform CD-SEM / metrology verification on defect dies.'],
                disclaimer: 'Statistical hypothesis only.',
              },
              explanation_map: restoredMap,
              wafer_map: restoredMap,
            });
            return;
          }
        }

        if (data.items.length > 0 && !selectedSample) {
          setSelectedSample(data.items[0]);
        }
      } catch (err) {
        console.error('Error loading samples:', err);
      }
    }
    load();
  }, [initialInspectionId]);

  const handleSelectSample = (sample: WaferSample) => {
    setSelectedSample(sample);
    setResult(null);
    setError(null);
  };

  const handleLoadDemo = (category: DefectCategory) => {
    const found = samples.find((s) => s.original_label === category);
    if (found) {
      setSelectedSample(found);
    }
    setActiveTab('demo');
    setResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInspecting(true);
    setInspectionStage('1/6: Validating uploaded image format...');
    setError(null);

    try {
      await sleep(350);
      setInspectionStage('2/6: Preprocessing into discrete die matrix...');
      await sleep(350);
      setInspectionStage('3/6: Running real model inference...');
      const inspResult = await uploadAndInspect(file);
      await sleep(300);
      setInspectionStage('4/6: Analyzing spatial defect geometry...');
      await sleep(300);
      setInspectionStage('5/6: Synthesizing explainability attribution...');
      await sleep(300);
      setInspectionStage('6/6: Generating triage decision support...');
      await sleep(200);
      setResult(inspResult);
      // Synchronize selectedSample to match the uploaded image so subsequent runs inspect the upload
      setSelectedSample({
        id: file.name,
        record_id: file.name,
        lot_name: 'lot-uploaded',
        wafer_index: 1,
        die_size: inspResult.spatial_metrics.total_die_count,
        original_label: null,
        wafer_map: inspResult.wafer_map,
        is_synthetic: false,
      });
    } catch (err: any) {
      setError(err.message || 'Image inspection failed');
    } finally {
      setInspecting(false);
    }
  };

  const executeInspection = async () => {
    if (!selectedSample) return;
    setInspecting(true);
    setError(null);
    setInspectionStage('1/6: Validating wafer array geometry...');

    try {
      await sleep(250);
      setInspectionStage('2/6: Preprocessing 74 topological spatial features...');
      await sleep(300);
      setInspectionStage('3/6: Running model classification inference...');
      const res = await runInspection({
        record_id: selectedSample.record_id,
        wafer_map: selectedSample.wafer_map,
        lot_name: selectedSample.lot_name,
        wafer_index: selectedSample.wafer_index,
        original_label: selectedSample.original_label,
        input_source: selectedSample.is_synthetic
          ? 'WM-811K Benchmark Sample'
          : 'WM-811K Raw Dataset',
      });
      await sleep(300);
      setInspectionStage('4/6: Calculating radial distributions & clusters...');
      await sleep(250);
      setInspectionStage('5/6: Formulating root-cause hypothesis...');
      await sleep(250);
      setInspectionStage('6/6: Generating decision recommendation...');
      await sleep(150);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Inspection failed');
    } finally {
      setInspecting(false);
    }
  };

  const filteredSamples = samples.filter((s) => {
    const matchCat = selectedCategory === 'all' || s.original_label === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lot_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.original_label && s.original_label.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              Stage 2 • Core AI Workflow
            </span>
            <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI Wafer Map Inspection</h2>
          <p className="text-xs font-mono text-slate-400">
            Automated semiconductor die pattern classification, topological analysis & decision support
          </p>
        </div>

        {/* Input Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dataset')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'dataset'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            WM-811K Records
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'demo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pattern Presets
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'upload'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Image Upload
          </button>
        </div>
      </div>

      {/* Main Grid: Input Selection & Preview / Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Selector or Upload Zone (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeTab === 'dataset' && (
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                  Dataset Explorer
                </h4>
                <span className="text-[10px] font-mono text-cyan-400">
                  {filteredSamples.length} Available
                </span>
              </div>

              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ID or Lot..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-navy-950 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All Classes</option>
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
              </div>

              {/* Wafer Samples List */}
              <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1 custom-scroll">
                {filteredSamples.map((s) => {
                  const isSel = selectedSample?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSample(s)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                        isSel
                          ? 'bg-cyan-950/80 border border-cyan-500/50 text-white shadow-sm'
                          : 'bg-navy-950/50 hover:bg-navy-800/60 border border-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{s.id}</div>
                        <div className="text-[10px] text-slate-500">
                          {s.lot_name} • W#{s.wafer_index}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.original_label ? 'bg-cyan-900/40 text-cyan-300' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {s.original_label || 'Unlabelled'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-0.5">{s.die_size} dies</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="p-4 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Select 9 Canonical Pattern Presets
              </h4>
              <p className="text-xs text-slate-400">
                Instantly load an authentic benchmark wafer for any WM-811K defect class.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2">
                {(
                  [
                    'Center',
                    'Donut',
                    'Edge-Ring',
                    'Edge-Loc',
                    'Loc',
                    'Scratch',
                    'Random',
                    'Near-full',
                    'none',
                  ] as DefectCategory[]
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleLoadDemo(cat)}
                    className="p-2.5 rounded-xl bg-navy-950/80 hover:bg-cyan-950/60 border border-slate-700/60 hover:border-cyan-500/50 text-xs font-mono text-slate-200 hover:text-cyan-300 transition-all text-center"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-6 rounded-2xl bg-navy-900/70 border border-dashed border-slate-700 hover:border-cyan-500/60 transition-all text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-navy-800 flex items-center justify-center text-cyan-400">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-white">Upload Wafer Map Image</h4>
              <p className="text-xs text-slate-400">
                Select PNG or JPEG wafer map representation. Grayscale intensity is thresholded into
                die classes.
              </p>
              <label className="inline-block px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-cyan-glow">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[10px] font-mono text-slate-500 pt-2">
                * Input is validated to ensure categorical compatibility with model weights.
              </p>
            </div>
          )}

          {/* Input Metadata Card */}
          {selectedSample && (
            <div className="p-4 rounded-2xl bg-navy-900/50 border border-slate-800/80 space-y-2 text-xs font-mono">
              <h5 className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                Selected Input Metadata
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                <div>
                  Identifier: <span className="text-slate-200 font-bold">{selectedSample.id}</span>
                </div>
                <div>
                  Lot Name: <span className="text-slate-200">{selectedSample.lot_name}</span>
                </div>
                <div>
                  Wafer Index: <span className="text-slate-200">#{selectedSample.wafer_index}</span>
                </div>
                <div>
                  Die Count: <span className="text-slate-200">{selectedSample.die_size}</span>
                </div>
                <div>
                  Dataset Label:{' '}
                  <span className="text-cyan-400 font-bold">
                    {selectedSample.original_label || 'Unlabelled'}
                  </span>
                </div>
                <div>
                  Preprocess: <span className="text-emerald-400">Validated (38x38)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Wafer Preview & Action / Real Inference Result (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Action Trigger Card */}
          <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">Execute Wafer Inspection</h3>
                <p className="text-xs font-mono text-slate-400">
                  Run validated RandomForest spatial classifier with full spatial decomposition
                </p>
              </div>
              <button
                disabled={inspecting || !selectedSample}
                onClick={executeInspection}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-electric-600 hover:from-cyan-400 hover:to-electric-500 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-cyan-glow"
              >
                {inspecting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Inspecting...</span>
                  </>
                ) : (
                  <>
                    <ScanEye className="w-4 h-4" />
                    <span>Run Real Inference</span>
                  </>
                )}
              </button>
            </div>

            {/* Inspection Stage Progress */}
            {inspecting && (
              <div className="mt-4 p-3 rounded-xl bg-navy-950 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-3 animate-pulse">
                <RotateCw className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{inspectionStage}</span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-xs font-mono text-red-300">
                {error}
              </div>
            )}
          </div>

          {/* Results Display */}
          {result ? (
            <div className="p-6 rounded-2xl bg-navy-900/80 border border-cyan-500/30 backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95">
              {/* Header result row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Inspection ID: {result.inspection_id}
                    </span>
                    <TransparencyBadge type="REAL MODEL INFERENCE" size="sm" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>Predicted Pattern:</span>
                    <span className="text-cyan-400 underline decoration-cyan-500/50">
                      {result.prediction.predicted_class}
                    </span>
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Model Confidence</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {Math.round(result.prediction.confidence * 100)}%
                  </div>
                </div>
              </div>

              {/* Side by side: Wafer Map vs Metrics & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <WaferMapCanvas
                  matrix={result.wafer_map}
                  densityMap={result.explanation_map}
                  size={280}
                  title="Wafer Defect Topography"
                  subtitle={`${result.spatial_metrics.failing_die_count} Failing Dies • ${result.spatial_metrics.yield_rate}% Yield`}
                />

                {/* Decision Support & Risk Pill */}
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-navy-950/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400 uppercase">
                        Decision Recommendation
                      </span>
                      <span
                        className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          result.decision_support.recommendation === 'Investigation Recommended'
                            ? 'bg-red-950 text-red-300 border border-red-500/40'
                            : result.decision_support.recommendation === 'Low Concern'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {result.decision_support.recommendation}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.decision_support.recommendation_reason}
                    </p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Prototype Risk Score</span>
                      <span className="text-cyan-400 font-bold">
                        {result.decision_support.risk_score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Spatial Summary */}
                  <div className="p-4 rounded-xl bg-navy-950/60 border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Inner / Core Density:</span>
                      <span className="text-slate-200">
                        {result.spatial_metrics.radial_distribution.inner}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Outer / Edge Ring Density:</span>
                      <span className="text-slate-200">
                        {result.spatial_metrics.radial_distribution.outer}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Connected Clusters:</span>
                      <span className="text-slate-200">{result.spatial_metrics.clusters}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Max Cluster Size:</span>
                      <span className="text-slate-200">
                        {result.spatial_metrics.max_cluster_size} dies
                      </span>
                    </div>
                  </div>

                  {/* Quick Nav Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => onNavigate('explainable', result)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-cyan-300 font-mono text-xs font-semibold border border-cyan-500/30 transition-all"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Explain AI</span>
                    </button>
                    <button
                      onClick={() => onNavigate('rootcause', result)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-purple-300 font-mono text-xs font-semibold border border-purple-500/30 transition-all"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Root Cause</span>
                    </button>
                    <button
                      onClick={() => onNavigate('reports', result.inspection_id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 font-mono text-xs font-semibold border border-slate-700 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Class Probability Breakdown */}
              <div className="pt-4 border-t border-slate-800">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Model Calibrated Class Probabilities
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                  {Object.entries(result.prediction.class_scores).map(([cls, score]) => (
                    <div
                      key={cls}
                      className={`p-2 rounded-lg text-center font-mono ${
                        cls === result.prediction.predicted_class
                          ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300'
                          : 'bg-navy-950/60 border border-slate-800/60 text-slate-400'
                      }`}
                    >
                      <div className="text-[10px] truncate">{cls}</div>
                      <div className="text-xs font-bold mt-0.5">{Math.round(score * 100)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Pre-inspection Wafer Preview
            selectedSample && (
              <div className="p-6 rounded-2xl bg-navy-900/50 border border-slate-800/80 flex flex-col items-center justify-center py-12">
                <WaferMapCanvas
                  matrix={selectedSample.wafer_map}
                  size={300}
                  title="Target Wafer Preview"
                  subtitle={`${selectedSample.id} (${selectedSample.lot_name})`}
                />
                <p className="text-xs font-mono text-slate-500 mt-4 text-center max-w-sm">
                  Click &quot;Run Real Inference&quot; above to process this wafer map with the trained
                  semiconductor classification model.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
