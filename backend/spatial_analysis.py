import numpy as np
from typing import Dict, Any, List, Tuple
from scipy.ndimage import label, center_of_mass, gaussian_filter

def analyze_wafer_spatial(matrix: np.ndarray) -> Dict[str, Any]:
    """
    Performs comprehensive, mathematically grounded spatial analysis on a 2D wafer array.
    Values: 0=background, 1=passing die, 2=failing die.
    """
    matrix = np.array(matrix, dtype=np.uint8)
    h, w = matrix.shape
    center_y, center_x = (h - 1) / 2.0, (w - 1) / 2.0
    wafer_radius = min(center_y, center_x)

    # Die counts
    die_mask = matrix > 0
    total_dies = int(np.sum(die_mask))
    if total_dies == 0:
        return {
            "total_die_count": 0,
            "failing_die_count": 0,
            "passing_die_count": 0,
            "failure_rate": 0.0,
            "yield_rate": 100.0,
            "clusters": 0,
            "max_cluster_size": 0,
            "radial_distribution": {"inner": 0.0, "middle": 0.0, "outer": 0.0},
            "quadrant_distribution": {"q1": 0.0, "q2": 0.0, "q3": 0.0, "q4": 0.0},
            "mean_radial_distance": 0.0,
            "density_map": []
        }

    fail_mask = (matrix == 2)
    failing_dies = int(np.sum(fail_mask))
    passing_dies = total_dies - failing_dies
    failure_rate = round(float((failing_dies / total_dies) * 100.0), 2)
    yield_rate = round(100.0 - failure_rate, 2)

    # Coordinates of failing dies
    fail_coords = np.argwhere(fail_mask)
    
    radial_dist = {"inner": 0.0, "middle": 0.0, "outer": 0.0}
    quadrant_dist = {"q1": 0.0, "q2": 0.0, "q3": 0.0, "q4": 0.0}
    mean_radial_norm = 0.0
    clusters_count = 0
    max_cluster_size = 0

    if failing_dies > 0:
        ys = fail_coords[:, 0]
        xs = fail_coords[:, 1]
        
        # Radial distance from center normalized to [0, 1]
        distances = np.sqrt((xs - center_x)**2 + (ys - center_y)**2) / (wafer_radius if wafer_radius > 0 else 1.0)
        mean_radial_norm = round(float(np.mean(distances)), 3)

        # Zones
        inner_count = int(np.sum(distances <= 0.35))
        middle_count = int(np.sum((distances > 0.35) & (distances <= 0.75)))
        outer_count = int(np.sum(distances > 0.75))

        radial_dist = {
            "inner": round(float((inner_count / failing_dies) * 100.0), 1),
            "middle": round(float((middle_count / failing_dies) * 100.0), 1),
            "outer": round(float((outer_count / failing_dies) * 100.0), 1)
        }

        # Quadrants (Q1: top-right, Q2: top-left, Q3: bottom-left, Q4: bottom-right)
        q1 = int(np.sum((xs >= center_x) & (ys < center_y)))
        q2 = int(np.sum((xs < center_x) & (ys < center_y)))
        q3 = int(np.sum((xs < center_x) & (ys >= center_y)))
        q4 = int(np.sum((xs >= center_x) & (ys >= center_y)))

        quadrant_dist = {
            "q1": round(float((q1 / failing_dies) * 100.0), 1),
            "q2": round(float((q2 / failing_dies) * 100.0), 1),
            "q3": round(float((q3 / failing_dies) * 100.0), 1),
            "q4": round(float((q4 / failing_dies) * 100.0), 1)
        }

        # Connected component clustering (8-connectivity)
        structure = np.ones((3, 3), dtype=int)
        labeled_array, num_features = label(fail_mask, structure=structure)
        clusters_count = int(num_features)
        if num_features > 0:
            cluster_sizes = np.bincount(labeled_array.ravel())[1:]
            max_cluster_size = int(np.max(cluster_sizes))

    # Derived spatial density overlay using 2D Gaussian filter
    density_float = gaussian_filter(fail_mask.astype(float), sigma=1.5)
    # Mask outside wafer
    density_float[~die_mask] = 0.0
    max_val = np.max(density_float)
    if max_val > 0:
        density_normalized = (density_float / max_val * 100.0).astype(int)
    else:
        density_normalized = np.zeros_like(matrix, dtype=int)

    return {
        "total_die_count": total_dies,
        "failing_die_count": failing_dies,
        "passing_die_count": passing_dies,
        "failure_rate": failure_rate,
        "yield_rate": yield_rate,
        "mean_radial_distance": mean_radial_norm,
        "radial_distribution": radial_dist,
        "quadrant_distribution": quadrant_dist,
        "clusters": clusters_count,
        "max_cluster_size": max_cluster_size,
        "density_map": density_normalized.tolist()
    }
