export type DefectCategory =
  | 'none'
  | 'Center'
  | 'Donut'
  | 'Edge-Loc'
  | 'Edge-Ring'
  | 'Loc'
  | 'Random'
  | 'Near-full'
  | 'Scratch';

export interface SpatialMetrics {
  total_die_count: number;
  failing_die_count: number;
  passing_die_count: number;
  failure_rate: number;
  yield_rate: number;
  mean_radial_distance: number;
  radial_distribution: {
    inner: number;
    middle: number;
    outer: number;
  };
  quadrant_distribution: {
    q1: number;
    q2: number;
    q3: number;
    q4: number;
  };
  clusters: number;
  max_cluster_size: number;
  density_map: number[][];
}

export interface SystemStatus {
  status: string;
  app_name: string;
  tagline: string;
  operating_mode: string;
  is_model_trained: boolean;
  model_version: string;
  model_architecture: string;
  dataset_mode: string;
  is_raw_dataset_loaded: boolean;
  total_dataset_records: number;
  labeled_records: number;
  database_status: string;
  total_inspections_logged: number;
  server_time_utc: string;
}

export interface DatasetInfo {
  mode: string;
  is_raw_dataset: boolean;
  raw_dataset_path: string;
  total_records: number;
  labeled_records: number;
  unlabeled_records: number;
  class_distribution: Record<string, number>;
  supported_classes: string[];
  total_lots: number;
  lot_names: string[];
  provenance: string;
  license: string;
}

export interface WaferSample {
  id: string;
  record_id: string;
  lot_name: string;
  wafer_index: number;
  die_size: number;
  original_label: string | null;
  wafer_map: number[][];
  is_synthetic: boolean;
  spatial_metrics?: SpatialMetrics;
}

export interface InspectionResult {
  inspection_id: string;
  timestamp: string;
  input_source: string;
  record_id: string;
  lot_name: string;
  wafer_index: number;
  original_label: string | null;
  prediction: {
    predicted_class: DefectCategory;
    confidence: number;
    class_scores: Record<string, number>;
    model_version: string;
    model_mode: string;
  };
  spatial_metrics: SpatialMetrics;
  decision_support: {
    recommendation: 'Low Concern' | 'Review Recommended' | 'Investigation Recommended' | 'Insufficient Evidence';
    recommendation_reason: string;
    risk_score: number;
    risk_tier: string;
    risk_framework: string;
    formula_description: string;
    factors: {
      failure_rate_points: number;
      cluster_density_points: number;
      pattern_severity_points: number;
      uncertainty_points: number;
    };
    limitations: string;
  };
  root_cause_hypothesis: {
    title: string;
    spatial_evidence: string;
    investigation_directions: string[];
    engineer_questions: string[];
    verification_steps: string[];
    disclaimer: string;
  };
  explanation_map: number[][];
  wafer_map: number[][];
}

export interface InspectionHistoryItem {
  id: string;
  timestamp: string;
  input_source: string;
  record_id: string;
  lot_name: string;
  wafer_index: number;
  original_label: string | null;
  predicted_class: DefectCategory;
  confidence: number;
  model_version: string;
  model_mode: string;
  failing_die_count: number;
  total_die_count: number;
  failure_rate: number;
  recommendation: string;
  review_status: 'pending' | 'confirmed' | 'corrected' | 'flagged';
  reviewed_category?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  class_scores?: Record<string, number>;
  wafer_map?: number[][];
}
