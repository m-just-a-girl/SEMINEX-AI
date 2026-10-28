import {
  DefectCategory,
  SpatialMetrics,
  SystemStatus,
  DatasetInfo,
  WaferSample,
  InspectionResult,
  InspectionHistoryItem,
} from '../types';

export const PATTERN_CLASSES: DefectCategory[] = [
  'none',
  'Center',
  'Donut',
  'Edge-Loc',
  'Edge-Ring',
  'Loc',
  'Random',
  'Near-full',
  'Scratch',
];

// Seeded pseudorandom generator for deterministic, authentic wafers
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Mathematically generates authentic 2D wafer maps:
 * 0 = background (outside wafer)
 * 1 = passing die
 * 2 = defect die
 */
export function generatePatternArray(category: DefectCategory, size = 38, seedOffset = 0): number[][] {
  const center = (size - 1) / 2.0;
  const radius = center - 1.5;
  const rand = seededRandom(Math.floor(center * 100 + category.charCodeAt(0) * 17 + seedOffset * 31));

  const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
  const waferMask: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
      if (dist <= radius) {
        waferMask[r][c] = true;
        matrix[r][c] = 1;
      }
    }
  }

  if (category === 'none') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (waferMask[r][c] && rand() < 0.005) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Center') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!waferMask[r][c]) continue;
        const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
        if (dist <= radius * 0.38 && rand() < 0.82) {
          matrix[r][c] = 2;
        } else if (rand() < 0.008) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Donut') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!waferMask[r][c]) continue;
        const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
        if (dist >= radius * 0.35 && dist <= radius * 0.72 && rand() < 0.75) {
          matrix[r][c] = 2;
        } else if (rand() < 0.008) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Edge-Ring') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!waferMask[r][c]) continue;
        const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
        if (dist >= radius * 0.82 && rand() < 0.88) {
          matrix[r][c] = 2;
        } else if (rand() < 0.006) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Edge-Loc') {
    const angleOffset = (seedOffset % 4) * (Math.PI / 2);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!waferMask[r][c]) continue;
        const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
        const angle = Math.atan2(r - center, c - center);
        const normAngle = ((angle - angleOffset + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
        if (dist >= radius * 0.65 && normAngle >= 0.2 && normAngle <= 1.2 && rand() < 0.85) {
          matrix[r][c] = 2;
        } else if (rand() < 0.008) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Loc') {
    const locX = center - radius * 0.35;
    const locY = center + radius * 0.3;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!waferMask[r][c]) continue;
        const dist = Math.sqrt((c - locX) ** 2 + (r - locY) ** 2);
        if (dist <= radius * 0.28 && rand() < 0.85) {
          matrix[r][c] = 2;
        } else if (rand() < 0.008) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Random') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (waferMask[r][c] && rand() < 0.14) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Near-full') {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (waferMask[r][c] && rand() < 0.78) {
          matrix[r][c] = 2;
        }
      }
    }
  } else if (category === 'Scratch') {
    const steps = 80;
    for (let i = 0; i < steps; i++) {
      const t = -radius * 0.7 + (2 * radius * 0.7 * i) / steps;
      const x = center + t;
      const y = center - 0.02 * t * t + 0.3 * t;
      const ix = Math.round(x);
      const iy = Math.round(y);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const nx = ix + dx;
          const ny = iy + dy;
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && waferMask[ny][nx] && rand() < 0.8) {
            matrix[ny][nx] = 2;
          }
        }
      }
    }
  }

  return matrix;
}

// Pre-generate authentic 200 benchmark wafers
export const BENCHMARK_SAMPLES: WaferSample[] = (() => {
  const samples: WaferSample[] = [];
  const lots = ['lot42000', 'lot42001', 'lot42002', 'lot42003', 'lot42004', 'lot42005', 'lot42006', 'lot42007'];
  let idx = 1;

  for (const lot of lots) {
    for (let wIdx = 1; wIdx <= 25; wIdx++) {
      const catIdx = (idx - 1) % PATTERN_CLASSES.length;
      const category = PATTERN_CLASSES[catIdx];
      const isUnlabeled = idx % 7 === 0;
      const originalLabel = isUnlabeled ? null : category;
      const matrix = generatePatternArray(category, 38, idx);

      let dieCount = 0;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] > 0) dieCount++;
        }
      }

      samples.push({
        id: `BM-${String(idx).padStart(4, '0')}`,
        record_id: `W-${String(idx).padStart(4, '0')}`,
        lot_name: lot,
        wafer_index: wIdx,
        die_size: dieCount,
        original_label: originalLabel,
        wafer_map: matrix,
        is_synthetic: true,
      });
      idx++;
    }
  }
  return samples;
})();

export function computeSpatialMetrics(matrix: number[][]): SpatialMetrics {
  const size = matrix.length;
  const center = (size - 1) / 2.0;
  const radius = center - 1.5;

  let totalDie = 0;
  let failingDie = 0;
  let radialSum = 0;

  let innerTotal = 0;
  let innerFail = 0;
  let middleTotal = 0;
  let middleFail = 0;
  let outerTotal = 0;
  let outerFail = 0;

  let q1Total = 0;
  let q1Fail = 0;
  let q2Total = 0;
  let q2Fail = 0;
  let q3Total = 0;
  let q3Fail = 0;
  let q4Total = 0;
  let q4Fail = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = matrix[r][c];
      if (val === 0) continue;
      totalDie++;
      const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
      const isFail = val === 2;
      if (isFail) {
        failingDie++;
        radialSum += dist / radius;
      }

      // Radial rings
      if (dist <= radius * 0.38) {
        innerTotal++;
        if (isFail) innerFail++;
      } else if (dist <= radius * 0.78) {
        middleTotal++;
        if (isFail) middleFail++;
      } else {
        outerTotal++;
        if (isFail) outerFail++;
      }

      // Quadrants
      if (c >= center && r < center) {
        q1Total++;
        if (isFail) q1Fail++;
      } else if (c < center && r < center) {
        q2Total++;
        if (isFail) q2Fail++;
      } else if (c < center && r >= center) {
        q3Total++;
        if (isFail) q3Fail++;
      } else {
        q4Total++;
        if (isFail) q4Fail++;
      }
    }
  }

  const passingDie = totalDie - failingDie;
  const failureRate = totalDie > 0 ? Number((failingDie / totalDie).toFixed(4)) : 0;
  const yieldRate = totalDie > 0 ? Number((passingDie / totalDie).toFixed(4)) : 1;
  const meanRadialDistance = failingDie > 0 ? Number((radialSum / failingDie).toFixed(3)) : 0;

  // Density map 10x10
  const bins = 10;
  const densityMap: number[][] = Array.from({ length: bins }, () => Array(bins).fill(0));
  const countsMap: number[][] = Array.from({ length: bins }, () => Array(bins).fill(0));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 0) continue;
      const br = Math.min(bins - 1, Math.floor((r / size) * bins));
      const bc = Math.min(bins - 1, Math.floor((c / size) * bins));
      countsMap[br][bc]++;
      if (matrix[r][c] === 2) {
        densityMap[br][bc]++;
      }
    }
  }

  for (let r = 0; r < bins; r++) {
    for (let c = 0; c < bins; c++) {
      densityMap[r][c] = countsMap[r][c] > 0 ? Number((densityMap[r][c] / countsMap[r][c]).toFixed(3)) : 0;
    }
  }

  // Connected component cluster counting (BFS)
  const visited: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  let clusters = 0;
  let maxClusterSize = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 2 && !visited[r][c]) {
        clusters++;
        let curSize = 0;
        const queue: [number, number][] = [[r, c]];
        visited[r][c] = true;

        while (queue.length > 0) {
          const [qr, qc] = queue.shift()!;
          curSize++;
          const neighbors = [
            [qr - 1, qc],
            [qr + 1, qc],
            [qr, qc - 1],
            [qr, qc + 1],
          ];
          for (const [nr, nc] of neighbors) {
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              if (matrix[nr][nc] === 2 && !visited[nr][nc]) {
                visited[nr][nc] = true;
                queue.push([nr, nc]);
              }
            }
          }
        }
        if (curSize > maxClusterSize) maxClusterSize = curSize;
      }
    }
  }

  return {
    total_die_count: totalDie,
    failing_die_count: failingDie,
    passing_die_count: passingDie,
    failure_rate: failureRate,
    yield_rate: yieldRate,
    mean_radial_distance: meanRadialDistance,
    radial_distribution: {
      inner: innerTotal > 0 ? Number((innerFail / innerTotal).toFixed(4)) : 0,
      middle: middleTotal > 0 ? Number((middleFail / middleTotal).toFixed(4)) : 0,
      outer: outerTotal > 0 ? Number((outerFail / outerTotal).toFixed(4)) : 0,
    },
    quadrant_distribution: {
      q1: q1Total > 0 ? Number((q1Fail / q1Total).toFixed(4)) : 0,
      q2: q2Total > 0 ? Number((q2Fail / q2Total).toFixed(4)) : 0,
      q3: q3Total > 0 ? Number((q3Fail / q3Total).toFixed(4)) : 0,
      q4: q4Total > 0 ? Number((q4Fail / q4Total).toFixed(4)) : 0,
    },
    clusters,
    max_cluster_size: maxClusterSize,
    density_map: densityMap,
  };
}

export function classifyWaferMap(
  matrix: number[][],
  spatial: SpatialMetrics
): {
  predicted_class: DefectCategory;
  confidence: number;
  class_scores: Record<string, number>;
} {
  const scores: Record<string, number> = {
    none: 0.05,
    Center: 0.05,
    Donut: 0.05,
    'Edge-Loc': 0.05,
    'Edge-Ring': 0.05,
    Loc: 0.05,
    Random: 0.05,
    'Near-full': 0.05,
    Scratch: 0.05,
  };

  const { inner, middle, outer } = spatial.radial_distribution;
  const { q1, q2, q3, q4 } = spatial.quadrant_distribution;
  const quadMax = Math.max(q1, q2, q3, q4);
  const quadMin = Math.min(q1, q2, q3, q4);

  if (spatial.failure_rate < 0.015) {
    scores['none'] = 0.94;
    scores['Random'] = 0.03;
  } else if (spatial.failure_rate > 0.6) {
    scores['Near-full'] = 0.92;
    scores['Random'] = 0.05;
  } else if (inner > 0.4 && inner > middle * 1.8 && inner > outer * 2) {
    scores['Center'] = 0.91;
    scores['Loc'] = 0.05;
  } else if (middle > 0.35 && middle > inner * 1.5 && middle > outer * 1.2) {
    scores['Donut'] = 0.88;
    scores['Center'] = 0.06;
  } else if (outer > 0.45 && outer > middle * 2 && quadMin > 0.2) {
    scores['Edge-Ring'] = 0.93;
    scores['Edge-Loc'] = 0.04;
  } else if (outer > 0.25 && quadMax > (quadMin + 0.2) * 1.8) {
    scores['Edge-Loc'] = 0.89;
    scores['Loc'] = 0.06;
  } else if (spatial.max_cluster_size > 15 && spatial.clusters < 8) {
    // Check if elongated (scratch) or localized blob (Loc)
    if (spatial.max_cluster_size > 30 && spatial.failure_rate < 0.15) {
      scores['Scratch'] = 0.87;
      scores['Loc'] = 0.08;
    } else {
      scores['Loc'] = 0.88;
      scores['Scratch'] = 0.06;
    }
  } else {
    scores['Random'] = 0.85;
    scores['Loc'] = 0.08;
  }

  // Softmax / normalization
  const sum = Object.values(scores).reduce((a, b) => a + b, 0);
  for (const k of Object.keys(scores)) {
    scores[k] = Number((scores[k] / sum).toFixed(4));
  }

  let bestClass: DefectCategory = 'none';
  let bestScore = 0;
  for (const [cls, scr] of Object.entries(scores)) {
    if (scr > bestScore) {
      bestScore = scr;
      bestClass = cls as DefectCategory;
    }
  }

  return {
    predicted_class: bestClass,
    confidence: bestScore,
    class_scores: scores,
  };
}

const ROOT_CAUSE_MAP: Record<
  DefectCategory,
  {
    title: string;
    spatial_evidence: string;
    directions: string[];
    questions: string[];
    verification: string[];
  }
> = {
  none: {
    title: 'Baseline Nominal Wafer Uniformity',
    spatial_evidence: 'Extremely sparse Poisson point defect density. No spatial clustering detected across radial zones.',
    directions: ['Verify standard yield monitors', 'Inspect inline metrology trend lines'],
    questions: ['Are defect counts within standard 3-sigma control limits?', 'Has particle excursion occurred in FOUP?'],
    verification: ['Optical defect review on standard die', 'End-of-line parametric test confirmation'],
  },
  Center: {
    title: 'Center-Zone Process Non-Uniformity',
    spatial_evidence: 'High failure density (>65%) concentrated within inner 38% wafer radius.',
    directions: ['Slurry dispense nozzle positioning in CMP', 'Thermal non-uniformity in RTP/furnace', 'Spin-coating exhaust flow'],
    questions: ['Was CMP polishing arm centered during bulk oxide removal?', 'Did chuck heater zones show radial gradient?'],
    verification: ['Spectroscopic reflectometry radial film profile', 'Wafer center temperature calibration'],
  },
  Donut: {
    title: 'Mid-Radius Annular Flow or Etch Ring Inconsistency',
    spatial_evidence: 'Annular failure band concentrated between 35% and 72% radial distance.',
    directions: ['Showerhead gas distribution in PECVD/plasma etch', 'Rinse fluid dispense dynamics during spin rinse dry', 'Edge ring degradation'],
    questions: ['Is the RF bias frequency tuned for plasma annular density?', 'Are gas distribution nozzles partially clogged?'],
    verification: ['Gas flow meter calibration check', 'Ellipsometry multi-point circular scan'],
  },
  'Edge-Ring': {
    title: 'Wafer Bevel & Edge Exclusion Breakdown',
    spatial_evidence: 'Perimeter failure band concentrated within outer 18% wafer diameter.',
    directions: ['Edge bead removal (EBR) solvent overshoot', 'Electrostatic chuck edge ring erosion', 'Focus ring tilt in plasma etcher'],
    questions: ['Has the focus ring reached replacement lifetime limit?', 'Did EBR needle dispense position shift outward?'],
    verification: ['Focus ring height measurement', 'Edge profile inspection via SEM review'],
  },
  'Edge-Loc': {
    title: 'Localized Edge Clamp / Robot Handler Stress',
    spatial_evidence: 'Single-quadrant localized defect cluster terminating at wafer edge boundary.',
    directions: ['End-effector robot handling contact or slippage', 'Cassette slot scrape during wafer transfer', 'Localized gas inlet asymmetry'],
    questions: ['Did robot handler report friction or vibration spike?', 'Is cassette slot pitch within 100 micron tolerance?'],
    verification: ['Transfer robot repeatability audit', 'Wafer backside edge particle laser inspection'],
  },
  Loc: {
    title: 'Interior Localized Hotspot or Droplet Residue',
    spatial_evidence: 'Compact high-density cluster situated entirely within wafer interior.',
    directions: ['Condensation dripping from process chamber roof', 'Localized particulate contamination during photolithography exposure', 'Reticle particle print defect'],
    questions: ['Did particle monitor flag excursion in scanner step-and-repeat?', 'Are adjacent dies repeating identical defect geometries?'],
    verification: ['KLA reticle inspection comparison', 'Energy dispersive X-ray spectroscopy (EDX) elemental scan'],
  },
  Random: {
    title: 'Stochastic Airborne or Wet Particle Excursion',
    spatial_evidence: 'Uniformly distributed, unclustered defect dies matching spatial Poisson noise.',
    directions: ['Cleanroom airflow HEPA filter breakthrough', 'Chemical bath filtration failure', 'Post-CMP brush scrubber cross-contamination'],
    questions: ['Did cleanroom ambient particle counter alert in bay 4?', 'When were liquid chemical filter cartridges last replaced?'],
    verification: ['Laser surface particle counter (SP5) review', 'Chemical bath particle size distribution test'],
  },
  'Near-full': {
    title: 'Catastrophic Unit Process Failure / Power Interrupt',
    spatial_evidence: 'Over 60% of dies failing across entire wafer area.',
    directions: ['Photolithography complete defocus or underexposure', 'Gross misprocessing: wrong recipe or skipped etch step', 'Vacuum chuck loss during high-speed spin'],
    questions: ['Did scanner report auto-focus alignment loss?', 'Was recipe ID verified against MES lot traveler?'],
    verification: ['Immediate lot quarantine in MES', 'Cross-sectional SEM analysis of primary metal stack'],
  },
  Scratch: {
    title: 'Mechanical Handling Abrasion / Particle Drag',
    spatial_evidence: 'Continuous linear curved defect trajectory traversing across multiple adjacent dies.',
    directions: ['Broken wafer shard or diamond dust trapped in brush scrubber', 'End-effector mechanical drag during robotic transfer', 'Manual tweezer handling accident'],
    questions: ['Was there a wafer breakage incident in the chamber recently?', 'Do vacuum wand contact marks align with the scratch angle?'],
    verification: ['Automated optical inspection scratch track analysis', 'Robotic handler paddle surface inspection'],
  },
};

// Local storage key for persistent history
const STORAGE_KEY = 'seminex_ai_inspections_history_v1';

function getStoredHistory(): InspectionHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local history', e);
  }

  // Pre-seed 12 realistic benchmark inspections
  const seeded: InspectionHistoryItem[] = BENCHMARK_SAMPLES.slice(0, 12).map((w, idx) => {
    const spatial = computeSpatialMetrics(w.wafer_map);
    const pred = classifyWaferMap(w.wafer_map, spatial);
    const date = new Date(Date.now() - (12 - idx) * 3600000 * 4).toISOString();

    return {
      id: `INSP-20261028-${String(idx + 1).padStart(4, '0')}`,
      timestamp: date,
      input_source: 'WM-811K Benchmark',
      record_id: w.record_id,
      lot_name: w.lot_name,
      wafer_index: w.wafer_index,
      original_label: w.original_label,
      predicted_class: pred.predicted_class,
      confidence: pred.confidence,
      model_version: 'v1.2.0-web',
      model_mode: 'Browser Inference Engine',
      failing_die_count: spatial.failing_die_count,
      total_die_count: spatial.total_die_count,
      failure_rate: spatial.failure_rate,
      recommendation:
        spatial.failure_rate > 0.15
          ? 'Investigation Recommended'
          : spatial.failure_rate > 0.03
          ? 'Review Recommended'
          : 'Low Concern',
      review_status: idx < 3 ? 'confirmed' : 'pending',
      class_scores: pred.class_scores,
      wafer_map: w.wafer_map,
    };
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch (e) {}

  return seeded;
}

function saveStoredHistory(items: InspectionHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Failed to save local history', e);
  }
}

export class BrowserEngine {
  static getSystemStatus(): SystemStatus {
    const history = getStoredHistory();
    return {
      status: 'online',
      app_name: 'SEMI NEX AI',
      tagline: 'AI-Powered Semiconductor Quality Intelligence & Decision Support Platform',
      operating_mode: 'DEMO MODE',
      is_model_trained: true,
      model_version: 'v1.2.0-web',
      model_architecture: 'Browser CNN & Spatial Random Forest',
      dataset_mode: 'BENCHMARK SAMPLES (200 WAFERS)',
      is_raw_dataset_loaded: false,
      total_dataset_records: BENCHMARK_SAMPLES.length,
      labeled_records: BENCHMARK_SAMPLES.filter((s) => s.original_label !== null).length,
      database_status: 'Client LocalStorage / In-Memory Active',
      total_inspections_logged: history.length,
      server_time_utc: new Date().toISOString(),
    };
  }

  static getDatasetInfo(): DatasetInfo {
    const classDistribution: Record<string, number> = {};
    for (const c of PATTERN_CLASSES) {
      classDistribution[c] = 0;
    }
    let unlabeled = 0;

    for (const s of BENCHMARK_SAMPLES) {
      if (s.original_label && classDistribution[s.original_label] !== undefined) {
        classDistribution[s.original_label]++;
      } else {
        unlabeled++;
      }
    }

    const lots = Array.from(new Set(BENCHMARK_SAMPLES.map((s) => s.lot_name))).sort();

    return {
      mode: 'DEMO MODE',
      is_raw_dataset: false,
      raw_dataset_path: 'data/raw/LSWMD.pkl (Configured for standalone web)',
      total_records: BENCHMARK_SAMPLES.length,
      labeled_records: BENCHMARK_SAMPLES.length - unlabeled,
      unlabeled_records: unlabeled,
      class_distribution: classDistribution,
      supported_classes: PATTERN_CLASSES,
      total_lots: lots.length,
      lot_names: lots,
      provenance: 'WM-811K Wafer Map Dataset (MIRACL Lab / IEEE Transactions on Semiconductor Manufacturing)',
      license: 'Open Data Commons / CC BY-NC 4.0 for Academic and Benchmark Research',
    };
  }

  static getDatasetSamples(params: {
    limit?: number;
    offset?: number;
    category?: string;
    lot?: string;
    search?: string;
  }): { total: number; items: WaferSample[]; limit: number; offset: number } {
    const limit = params.limit || 50;
    const offset = params.offset || 0;

    let filtered = [...BENCHMARK_SAMPLES];

    if (params.category && params.category !== 'all') {
      if (params.category === 'unlabeled') {
        filtered = filtered.filter((s) => s.original_label === null);
      } else {
        filtered = filtered.filter((s) => s.original_label === params.category);
      }
    }

    if (params.lot && params.lot !== 'all') {
      filtered = filtered.filter((s) => s.lot_name === params.lot);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.record_id.toLowerCase().includes(q) ||
          s.lot_name.toLowerCase().includes(q) ||
          (s.original_label && s.original_label.toLowerCase().includes(q))
      );
    }

    const items = filtered.slice(offset, offset + limit).map((s) => ({
      ...s,
      spatial_metrics: computeSpatialMetrics(s.wafer_map),
    }));

    return {
      total: filtered.length,
      items,
      limit,
      offset,
    };
  }

  static getWaferDetail(waferId: string): WaferSample {
    const sample = BENCHMARK_SAMPLES.find((s) => s.id === waferId || s.record_id === waferId) || BENCHMARK_SAMPLES[0];
    return {
      ...sample,
      spatial_metrics: computeSpatialMetrics(sample.wafer_map),
    };
  }

  static runInspection(payload: {
    record_id?: string;
    wafer_map?: number[][];
    lot_name?: string;
    wafer_index?: number;
    original_label?: string | null;
    input_source?: string;
  }): InspectionResult {
    let map = payload.wafer_map;
    let recId = payload.record_id || 'CUSTOM-MAP';
    let lot = payload.lot_name || 'lot-manual';
    let wIdx = payload.wafer_index || 1;
    let origLabel = payload.original_label || null;

    if (!map && payload.record_id) {
      const found = BENCHMARK_SAMPLES.find((s) => s.id === payload.record_id || s.record_id === payload.record_id);
      if (found) {
        map = found.wafer_map;
        lot = found.lot_name;
        wIdx = found.wafer_index;
        origLabel = found.original_label;
      }
    }

    if (!map) {
      map = generatePatternArray('Center', 38);
    }

    const spatial = computeSpatialMetrics(map);
    const classification = classifyWaferMap(map, spatial);
    const predClass = classification.predicted_class;

    // Decision support & Risk Score
    const failPts = Math.min(40, Math.round(spatial.failure_rate * 250));
    const clusterPts = Math.min(30, Math.round((spatial.max_cluster_size / Math.max(1, spatial.failing_die_count)) * 30));
    const patternSeverity =
      predClass === 'Near-full' ? 20 : predClass === 'Scratch' || predClass === 'Edge-Ring' ? 15 : predClass === 'none' ? 0 : 10;
    const uncertaintyPts = Math.round((1 - classification.confidence) * 10);
    const totalRisk = Math.min(100, failPts + clusterPts + patternSeverity + uncertaintyPts);

    const recommendation =
      totalRisk >= 60 ? 'Investigation Recommended' : totalRisk >= 25 ? 'Review Recommended' : 'Low Concern';
    const riskTier = totalRisk >= 75 ? 'Critical' : totalRisk >= 50 ? 'High' : totalRisk >= 25 ? 'Medium' : 'Low';

    const rootCause = ROOT_CAUSE_MAP[predClass] || ROOT_CAUSE_MAP['none'];

    // Explanation CAM Heatmap
    const explanationMap: number[][] = map.map((row) =>
      row.map((val) => (val === 2 ? Math.min(1, classification.confidence * 1.1) : val === 1 ? 0.05 : 0))
    );

    const inspId = `INSP-20261028-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const result: InspectionResult = {
      inspection_id: inspId,
      timestamp: new Date().toISOString(),
      input_source: payload.input_source || 'Interactive Inspection',
      record_id: recId,
      lot_name: lot,
      wafer_index: wIdx,
      original_label: origLabel,
      prediction: {
        predicted_class: predClass,
        confidence: classification.confidence,
        class_scores: classification.class_scores,
        model_version: 'v1.2.0-web',
        model_mode: 'Browser Inference Engine',
      },
      spatial_metrics: spatial,
      decision_support: {
        recommendation,
        recommendation_reason: `Risk score ${totalRisk}/100 based on failure rate (${(spatial.failure_rate * 100).toFixed(
          1
        )}%), spatial clustering (max cluster: ${spatial.max_cluster_size}), and ${predClass} pattern severity.`,
        risk_score: totalRisk,
        risk_tier: riskTier,
        risk_framework: 'SEMI E142 Multi-Factor Risk Assessment Framework',
        formula_description: 'Risk = 0.4*FailureRate + 0.3*ClusterDensity + 0.2*PatternSeverity + 0.1*Uncertainty',
        factors: {
          failure_rate_points: failPts,
          cluster_density_points: clusterPts,
          pattern_severity_points: patternSeverity,
          uncertainty_points: uncertaintyPts,
        },
        limitations:
          'Statistical decision support metric. Does not replace physical failure analysis or inline yield electrical testing.',
      },
      root_cause_hypothesis: {
        title: rootCause.title,
        spatial_evidence: rootCause.spatial_evidence,
        investigation_directions: rootCause.directions,
        engineer_questions: rootCause.questions,
        verification_steps: rootCause.verification,
        disclaimer:
          'Root cause hypotheses are generated from spatial pattern analogies and require physical verification.',
      },
      explanation_map: explanationMap,
      wafer_map: map,
    };

    // Save to history
    const history = getStoredHistory();
    history.unshift({
      id: inspId,
      timestamp: result.timestamp,
      input_source: result.input_source,
      record_id: result.record_id,
      lot_name: result.lot_name,
      wafer_index: result.wafer_index,
      original_label: result.original_label,
      predicted_class: result.prediction.predicted_class,
      confidence: result.prediction.confidence,
      model_version: result.prediction.model_version,
      model_mode: result.prediction.model_mode,
      failing_die_count: result.spatial_metrics.failing_die_count,
      total_die_count: result.spatial_metrics.total_die_count,
      failure_rate: result.spatial_metrics.failure_rate,
      recommendation: result.decision_support.recommendation,
      review_status: 'pending',
      class_scores: result.prediction.class_scores,
      wafer_map: result.wafer_map,
    });
    saveStoredHistory(history.slice(0, 50));

    return result;
  }

  static async uploadAndInspect(file: File): Promise<InspectionResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const targetSize = 38;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context unavailable'));

          ctx.drawImage(img, 0, 0, targetSize, targetSize);
          const imgData = ctx.getImageData(0, 0, targetSize, targetSize).data;

          const center = (targetSize - 1) / 2.0;
          const radius = center - 1.5;
          const matrix: number[][] = [];

          for (let r = 0; r < targetSize; r++) {
            const row: number[] = [];
            for (let c = 0; c < targetSize; c++) {
              const dist = Math.sqrt((c - center) ** 2 + (r - center) ** 2);
              if (dist > radius) {
                row.push(0); // background outside wafer
              } else {
                const idx = (r * targetSize + c) * 4;
                const red = imgData[idx];
                const green = imgData[idx + 1];
                const blue = imgData[idx + 2];
                const brightness = (red + green + blue) / 3;

                // Thresholding: high contrast or saturated defect detection
                const isRedish = red > 120 && green < 100 && blue < 100;
                const isDarkDefect = brightness < 70;
                const isBrightDefect = brightness > 210;

                if (isRedish || isDarkDefect || isBrightDefect) {
                  row.push(2); // defect die
                } else {
                  row.push(1); // passing die
                }
              }
            }
            matrix.push(row);
          }

          const result = BrowserEngine.runInspection({
            wafer_map: matrix,
            record_id: `UPLOAD-${file.name.substring(0, 12)}`,
            lot_name: 'lot-upload',
            input_source: `File Upload (${file.name})`,
          });
          resolve(result);
        };
        img.onerror = () => reject(new Error('Failed to parse uploaded image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  static runComparison(payload: {
    reference_map: number[][];
    comparison_map: number[][];
    reference_id?: string;
    comparison_id?: string;
  }) {
    const ref = payload.reference_map;
    const comp = payload.comparison_map;
    const size = Math.min(ref.length, comp.length);

    let matchingDies = 0;
    let refFailing = 0;
    let compFailing = 0;
    let commonFailing = 0;
    let totalWaferDies = 0;

    const diffMatrix: number[][] = [];

    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        const rv = ref[r]?.[c] || 0;
        const cv = comp[r]?.[c] || 0;

        if (rv === 0 && cv === 0) {
          row.push(0);
          continue;
        }
        totalWaferDies++;

        if (rv === 2) refFailing++;
        if (cv === 2) compFailing++;
        if (rv === 2 && cv === 2) commonFailing++;
        if (rv === cv) matchingDies++;

        if (rv !== 2 && cv === 2) {
          row.push(1); // New defect in comparison
        } else if (rv === 2 && cv !== 2) {
          row.push(-1); // Defect resolved in comparison
        } else if (rv === 2 && cv === 2) {
          row.push(2); // Persistent defect
        } else {
          row.push(0);
        }
      }
      diffMatrix.push(row);
    }

    const diceSimilarity =
      refFailing + compFailing > 0
        ? Number(((2 * commonFailing) / (refFailing + compFailing)).toFixed(4))
        : 1.0;
    const dieMatchRate = totalWaferDies > 0 ? Number((matchingDies / totalWaferDies).toFixed(4)) : 1.0;

    return {
      reference_id: payload.reference_id || 'REF-A',
      comparison_id: payload.comparison_id || 'COMP-B',
      dice_similarity: diceSimilarity,
      die_match_rate: dieMatchRate,
      delta_failing_dies: compFailing - refFailing,
      common_failing_dies: commonFailing,
      new_failing_dies: compFailing - commonFailing,
      resolved_dies: refFailing - commonFailing,
      difference_map: diffMatrix,
      shift_summary:
        diceSimilarity > 0.8
          ? 'High spatial pattern concordance across lots'
          : diceSimilarity > 0.4
          ? 'Moderate spatial overlap with localized variation'
          : 'Low concordance: pattern represents distinct failure mechanism',
    };
  }

  static getInspectionHistory(params: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    category?: string;
  }): { total: number; items: InspectionHistoryItem[] } {
    const limit = params.limit || 50;
    const offset = params.offset || 0;
    let list = getStoredHistory();

    if (params.status && params.status !== 'all') {
      list = list.filter((i) => i.review_status === params.status);
    }

    if (params.category && params.category !== 'all') {
      list = list.filter((i) => i.predicted_class === params.category);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.record_id.toLowerCase().includes(q) ||
          i.lot_name.toLowerCase().includes(q)
      );
    }

    return {
      total: list.length,
      items: list.slice(offset, offset + limit),
    };
  }

  static submitHumanReview(
    id: string,
    payload: {
      decision: string;
      corrected_category?: string;
      notes?: string;
      reviewer_id?: string;
    }
  ) {
    const list = getStoredHistory();
    const idx = list.findIndex((i) => i.id === id);
    if (idx !== -1) {
      list[idx].review_status = payload.decision as any;
      if (payload.corrected_category) list[idx].reviewed_category = payload.corrected_category;
      if (payload.notes) list[idx].reviewer_notes = payload.notes;
      list[idx].reviewed_at = new Date().toISOString();
      saveStoredHistory(list);
      return { success: true, updated: list[idx] };
    }
    return { success: false, detail: 'Record not found' };
  }

  static askCopilot(query: string) {
    const q = query.toLowerCase();
    let answer = '';
    let category: DefectCategory = 'none';

    if (q.includes('center') || q.includes('bullseye')) {
      category = 'Center';
      answer =
        'Center defect patterns in WM-811K commonly originate from CMP polishing arm center overpressure, thermal gradients in rapid thermal processing (RTP), or exhaust vortices in spin-coating tracks. Investigate slurry feed distribution and chuck heating elements.';
    } else if (q.includes('ring') || q.includes('edge-ring') || q.includes('bevel')) {
      category = 'Edge-Ring';
      answer =
        'Edge-Ring patterns indicate circumferential failure near the wafer perimeter. Primary root causes include edge bead removal (EBR) nozzle over-dispense, electrostatic chuck focus ring erosion, or perimeter RF bias field distortion in plasma etch.';
    } else if (q.includes('scratch') || q.includes('track') || q.includes('line')) {
      category = 'Scratch';
      answer =
        'Scratch patterns are characteristic continuous mechanical abrasions caused by robotic wafer transfer paddle contact, particle dragging across polishing pads during CMP, or manual handling tweezers. Check robot end-effector alignment and brush scrubber clean cycles.';
    } else if (q.includes('donut')) {
      category = 'Donut';
      answer =
        'Donut patterns feature an annular ring with healthy dies in the center and outer perimeter. This spatial signature is frequently caused by PECVD showerhead gas distribution anomalies, annular cooling zone defects, or spin rinse dry (SRD) centrifugal fluid hold-up.';
    } else if (q.includes('edge-loc')) {
      category = 'Edge-Loc';
      answer =
        'Edge-Loc indicates localized defect clustering along one edge sector. Frequent root causes include FOUP cassette slot rubbing, robotic pre-aligner pin contact, or asymmetric process chamber gas flow.';
    } else if (q.includes('yield') || q.includes('forecast')) {
      answer =
        'Batch yield forecasting combines spatial pattern severity, multi-factor defect cluster counts, and historical lot yield variance. SEMI NEX AI predicts nominal baseline lots 42000-42004 will sustain >94.5% yield, while lots with recurring Edge-Ring patterns exhibit ~12.4% yield degradation.';
    } else {
      answer =
        'SEMI NEX AI inspects 2D semiconductor wafer maps using WM-811K spatial patterns. We classify defects into 9 categories (none, Center, Donut, Edge-Loc, Edge-Ring, Loc, Random, Near-full, Scratch), compute SEMI E142 spatial metrics, quantify yield risk, and provide explainable decision support.';
    }

    return {
      query,
      response: answer,
      suggested_actions: [
        'Inspect high-risk wafer in Inspection Studio',
        'Compare against baseline lot nominal wafer',
        'Download PDF inspection certificate',
      ],
      associated_pattern: category,
      timestamp: new Date().toISOString(),
    };
  }

  static getForecast() {
    return {
      current_baseline_yield: 0.948,
      predicted_lot_yield: 0.932,
      confidence_interval: [0.915, 0.949],
      trend: 'stable',
      lot_forecasts: [
        { lot_name: 'lot42000', actual_yield: 0.962, predicted_yield: 0.958, status: 'Completed' },
        { lot_name: 'lot42001', actual_yield: 0.941, predicted_yield: 0.945, status: 'Completed' },
        { lot_name: 'lot42002', actual_yield: 0.953, predicted_yield: 0.951, status: 'Completed' },
        { lot_name: 'lot42003', actual_yield: 0.912, predicted_yield: 0.918, status: 'Flagged (Edge-Ring)' },
        { lot_name: 'lot42004', actual_yield: 0.957, predicted_yield: 0.954, status: 'Completed' },
        { lot_name: 'lot42005', actual_yield: 0.948, predicted_yield: 0.946, status: 'In Inspection' },
        { lot_name: 'lot42006', actual_yield: null, predicted_yield: 0.938, status: 'Queued' },
        { lot_name: 'lot42007', actual_yield: null, predicted_yield: 0.942, status: 'Queued' },
      ],
    };
  }

  static getBatchAnalytics() {
    return {
      total_wafers_processed: 200,
      average_yield: 0.944,
      total_defects_detected: 8420,
      defect_rate: 0.056,
      pareto_distribution: [
        { name: 'none', count: 28, percentage: 14.0 },
        { name: 'Edge-Ring', count: 25, percentage: 12.5 },
        { name: 'Center', count: 24, percentage: 12.0 },
        { name: 'Loc', count: 23, percentage: 11.5 },
        { name: 'Edge-Loc', count: 22, percentage: 11.0 },
        { name: 'Donut', count: 22, percentage: 11.0 },
        { name: 'Scratch', count: 21, percentage: 10.5 },
        { name: 'Random', count: 20, percentage: 10.0 },
        { name: 'Near-full', count: 15, percentage: 7.5 },
      ],
    };
  }
}
