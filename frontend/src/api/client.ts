import { SystemStatus, DatasetInfo, WaferSample, InspectionResult, InspectionHistoryItem } from '../types';

const BASE_URL = '';

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const res = await fetch(`${BASE_URL}/api/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function fetchDatasetInfo(): Promise<DatasetInfo> {
  const res = await fetch(`${BASE_URL}/api/dataset/info`);
  if (!res.ok) throw new Error('Failed to fetch dataset info');
  return res.json();
}

export async function fetchDatasetSamples(params: {
  limit?: number;
  offset?: number;
  category?: string;
  lot?: string;
  search?: string;
}): Promise<{ total: number; items: WaferSample[]; limit: number; offset: number }> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));
  if (params.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params.lot && params.lot !== 'all') searchParams.set('lot', params.lot);
  if (params.search) searchParams.set('search', params.search);

  const res = await fetch(`${BASE_URL}/api/dataset/samples?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch samples');
  return res.json();
}

export async function fetchWaferDetail(waferId: string): Promise<WaferSample> {
  const res = await fetch(`${BASE_URL}/api/dataset/wafer/${waferId}`);
  if (!res.ok) throw new Error('Failed to fetch wafer detail');
  return res.json();
}

export async function runInspection(payload: {
  record_id?: string;
  wafer_map?: number[][];
  lot_name?: string;
  wafer_index?: number;
  original_label?: string | null;
  input_source?: string;
}): Promise<InspectionResult> {
  const res = await fetch(`${BASE_URL}/api/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Inspection failed' }));
    throw new Error(err.detail || 'Inspection failed');
  }
  return res.json();
}

export async function uploadAndInspect(file: File): Promise<InspectionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/api/inspect/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload and inspect');
  return res.json();
}

export async function runComparison(payload: {
  reference_map: number[][];
  comparison_map: number[][];
  reference_id?: string;
  comparison_id?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Comparison failed');
  return res.json();
}

export async function fetchInspectionHistory(params: {
  limit?: number;
  offset?: number;
  search?: string;
  status?: string;
  category?: string;
}): Promise<{ total: number; items: InspectionHistoryItem[] }> {
  const searchParams = new URLSearchParams();
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.offset) searchParams.set('offset', String(params.offset));
  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.category) searchParams.set('category', params.category);

  const res = await fetch(`${BASE_URL}/api/history?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchInspectionDetail(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/history/${id}`);
  if (!res.ok) throw new Error('Failed to fetch inspection detail');
  return res.json();
}

export async function submitHumanReview(id: string, payload: {
  decision: string;
  corrected_category?: string;
  notes?: string;
  reviewer_id?: string;
}): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/reviews/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return res.json();
}

export async function askCopilot(query: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/copilot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error('Copilot query failed');
  return res.json();
}

export async function fetchForecast(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/forecast`);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

export async function fetchBatchAnalytics(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/batch-analytics`);
  if (!res.ok) throw new Error('Failed to fetch batch analytics');
  return res.json();
}

export async function generateSyntheticWafer(category: string, size: number = 38): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/synthetic/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, size }),
  });
  if (!res.ok) throw new Error('Failed to generate synthetic wafer');
  return res.json();
}

export async function triggerModelTraining(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/model/train`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Model training failed');
  return res.json();
}

export async function fetchModelInfo(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/model/info`);
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}
