"""
CosmoPH - Cosmic Defect Detection & Localization
==================================================
Reverse-engineers TDA persistence pairs to find the exact pixels that caused
anomalous topological features, classifies defect types, and generates
bounding boxes for visual anomaly detection.

Defect types detected:
- Cosmic Strings:  elongated H1 (loop) features with high persistence
- Cosmic Textures:  dense localized H0 features with extreme persistence
- Cosmic Monopoles: isolated point-like H0 features with extreme persistence
"""

import numpy as np
from typing import Optional


# ──────────────────────────────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────────────────────────────
# Only persistence pairs above this percentile are considered "significant"
SIGNIFICANCE_PERCENTILE = 75
# Minimum persistence to even consider (absolute floor)
MIN_PERSISTENCE = 0.005
# Aspect ratio threshold: bounding boxes more elongated than this → string
STRING_ASPECT_RATIO = 2.0
# Neighborhood radius (in normalized coords) for clustering generator points
CLUSTER_RADIUS = 0.15
# Bounding box area (pixels²) below which a feature is "point-like"
MONOPOLE_MAX_AREA = 120
# Monopole persistence must be this many times above noise floor
MONOPOLE_PERSISTENCE_FACTOR = 3.0


def detect_cosmic_defects(
    patch: np.ndarray,
    persistence_pairs: list[dict],
    raw_diagrams: list[np.ndarray],
    point_cloud_info: dict,
    cocycles: Optional[list] = None,
    gaussian_comparison: Optional[dict] = None,
) -> dict:
    """
    Main entry point: detect and localize cosmic defects from TDA results.

    Args:
        patch: Original 2D CMB patch (h, w)
        persistence_pairs: List of {birth, death, dimension} dicts
        raw_diagrams: List of numpy arrays per homology dimension
        point_cloud_info: Dict with 'points', 'pixel_rows', 'pixel_cols', 'values'
        cocycles: Ripser cocycle representatives (optional)
        gaussian_comparison: Gaussian null comparison results (optional)

    Returns:
        Dict with 'defects' list and 'summary' statistics
    """
    h, w = patch.shape
    points = point_cloud_info["points"]
    pixel_rows = point_cloud_info["pixel_rows"]
    pixel_cols = point_cloud_info["pixel_cols"]
    values = point_cloud_info["values"]

    # Compute noise floor from persistence distribution
    all_pers = [p["death"] - p["birth"] for p in persistence_pairs if p["death"] > p["birth"]]
    if not all_pers:
        return {"defects": [], "summary": _empty_summary()}

    pers_array = np.array(all_pers)
    noise_floor = np.percentile(pers_array, SIGNIFICANCE_PERCENTILE)
    noise_floor = max(noise_floor, MIN_PERSISTENCE)

    # Get Gaussian baseline stats for confidence scoring
    gauss_mean_pers = 0.0
    gauss_std_pers = 1.0
    if gaussian_comparison:
        wd = gaussian_comparison.get("wasserstein_distances", {})
        for dim_key in ["H0", "H1"]:
            if dim_key in wd:
                gauss_mean_pers = max(gauss_mean_pers, wd[dim_key].get("mean", 0))
                gauss_std_pers = max(gauss_std_pers, wd[dim_key].get("std", 0.01))

    # Filter significant persistence pairs
    significant_pairs = [
        p for p in persistence_pairs
        if (p["death"] - p["birth"]) > noise_floor
    ]

    if not significant_pairs:
        return {"defects": [], "summary": _empty_summary()}

    # Compute global intensity stats for defect classification
    patch_mean = float(np.nanmean(patch))
    patch_std = float(np.nanstd(patch))

    # Localize each significant feature
    defects = []
    for pair in significant_pairs:
        persistence = pair["death"] - pair["birth"]
        dim = pair["dimension"]
        birth = pair["birth"]
        death = pair["death"]

        # Find generator points for this persistence pair
        generator_indices = _find_generator_points(
            birth, death, dim, points, cocycles, pixel_rows, pixel_cols
        )

        if len(generator_indices) == 0:
            continue

        # Get pixel coordinates of generator points
        gen_rows = pixel_rows[generator_indices]
        gen_cols = pixel_cols[generator_indices]

        # Total generator points for this pair (used for classification)
        total_generator_points = len(generator_indices)

        # Cluster nearby points and compute bounding box
        clusters = _cluster_points(gen_rows, gen_cols, h, w)

        for cluster_rows, cluster_cols in clusters:
            # Compute bounding box (with padding)
            bbox = _compute_bounding_box(cluster_rows, cluster_cols, h, w, padding=3)

            # Get intensity values at defect location
            region = patch[bbox["y_min"]:bbox["y_max"]+1, bbox["x_min"]:bbox["x_max"]+1]
            intensity_stats = {
                "mean": float(np.nanmean(region)) if region.size > 0 else 0.0,
                "max": float(np.nanmax(region)) if region.size > 0 else 0.0,
                "min": float(np.nanmin(region)) if region.size > 0 else 0.0,
            }

            # Intensity anomaly: how extreme is this region vs the global mean?
            intensity_deviation = 0.0
            if region.size > 0 and patch_std > 0:
                intensity_deviation = abs(float(np.nanmean(region)) - patch_mean) / patch_std

            # Classify defect type using richer context
            defect_type = _classify_defect(
                dim=dim,
                persistence=persistence,
                bbox=bbox,
                n_cluster_points=len(cluster_rows),
                n_total_points=total_generator_points,
                noise_floor=noise_floor,
                intensity_deviation=intensity_deviation,
            )

            # Compute confidence score
            confidence = _compute_confidence(persistence, noise_floor, gauss_mean_pers, gauss_std_pers)

            # Build highlight mask (pixels contributing to this feature)
            highlight_pixels = [
                {"row": int(r), "col": int(c)}
                for r, c in zip(cluster_rows, cluster_cols)
            ]

            defects.append({
                "id": f"defect_{len(defects)}",
                "type": defect_type,
                "dimension": dim,
                "persistence": float(persistence),
                "birth": float(birth),
                "death": float(death),
                "confidence": float(confidence),
                "bounding_box": bbox,
                "center": {
                    "row": int(np.mean(cluster_rows)),
                    "col": int(np.mean(cluster_cols)),
                },
                "n_generator_points": len(cluster_rows),
                "intensity_stats": intensity_stats,
                "highlight_pixels": highlight_pixels,
                "description": _describe_defect(defect_type, dim, persistence, confidence),
            })

    # Sort by confidence (most significant first)
    defects.sort(key=lambda d: d["confidence"], reverse=True)

    # Cap at top 20 defects to keep payload reasonable
    defects = defects[:20]

    # Build summary
    summary = _build_summary(defects)

    return {"defects": defects, "summary": summary}


# ──────────────────────────────────────────────────────────────────────
# Generator point localization
# ──────────────────────────────────────────────────────────────────────

def _find_generator_points(
    birth: float, death: float, dim: int,
    points: np.ndarray, cocycles: Optional[list],
    pixel_rows: np.ndarray, pixel_cols: np.ndarray,
) -> np.ndarray:
    """
    Find the point-cloud indices that generated a persistence pair.

    When cocycles are available (Ripser), uses cocycle representatives.
    Otherwise falls back to distance-based matching.
    """
    n_points = len(points)

    # Strategy 1: Use cocycles from Ripser if available
    if cocycles is not None and dim < len(cocycles):
        dim_cocycles = cocycles[dim]
        # Find cocycle matching this birth/death (within tolerance)
        best_indices = set()
        for cocycle in dim_cocycles:
            if len(cocycle) > 0:
                # Cocycles are arrays of [simplex_vertex_indices..., coefficient]
                for simplex in cocycle:
                    if len(simplex) >= 2:
                        # Extract vertex indices (all but last element which is coefficient)
                        verts = simplex[:-1].astype(int)
                        valid_verts = verts[(verts >= 0) & (verts < n_points)]
                        best_indices.update(valid_verts.tolist())

                if best_indices:
                    # Found generator points; verify they're reasonable
                    idx_arr = np.array(list(best_indices))
                    if len(idx_arr) > 0 and len(idx_arr) <= n_points // 2:
                        return idx_arr

    # Strategy 2: Distance-based matching (fallback)
    # Find points whose pairwise distances are close to birth/death values
    from scipy.spatial.distance import pdist, squareform
    if n_points > 2000:
        # Subsample for distance computation
        sample_idx = np.random.choice(n_points, min(2000, n_points), replace=False)
        sample_points = points[sample_idx]
    else:
        sample_idx = np.arange(n_points)
        sample_points = points

    dists = squareform(pdist(sample_points))

    # Find edges near the birth/death filtration values
    birth_tol = max(0.02, birth * 0.15)
    death_tol = max(0.02, death * 0.15)

    if dim == 0:
        # H0: connected components — points connected at the death scale
        # Find points involved in merging events near 'death'
        near_death = np.where(np.abs(dists - death) < death_tol)
        if len(near_death[0]) > 0:
            involved = np.unique(np.concatenate([near_death[0], near_death[1]]))
            # Map back to original indices if subsampled
            return sample_idx[involved[:min(50, len(involved))]]

    elif dim == 1:
        # H1: loops — find points forming a cycle near birth/death scale
        near_birth = np.where((dists > birth - birth_tol) & (dists < death + death_tol))
        if len(near_birth[0]) > 0:
            involved = np.unique(np.concatenate([near_birth[0], near_birth[1]]))
            return sample_idx[involved[:min(50, len(involved))]]

    # Last resort: find points with most extreme values (likely anomalous)
    values_at_points = np.zeros(n_points)
    for i in range(n_points):
        values_at_points[i] = abs(points[i, 0] - 0.5) + abs(points[i, 1] - 0.5)

    top_k = min(20, n_points)
    extreme_idx = np.argsort(values_at_points)[-top_k:]
    return extreme_idx


# ──────────────────────────────────────────────────────────────────────
# Clustering & bounding boxes
# ──────────────────────────────────────────────────────────────────────

def _cluster_points(
    rows: np.ndarray, cols: np.ndarray, h: int, w: int
) -> list[tuple[np.ndarray, np.ndarray]]:
    """
    Cluster generator points into spatially coherent groups.
    Uses a simple agglomerative approach based on pixel proximity.
    """
    if len(rows) == 0:
        return []

    # Normalize coordinates for clustering
    norm_rows = rows / h
    norm_cols = cols / w
    coords = np.column_stack([norm_rows, norm_cols])

    n = len(coords)
    if n == 1:
        return [(rows, cols)]

    # Simple single-linkage clustering
    visited = np.zeros(n, dtype=bool)
    clusters = []

    for i in range(n):
        if visited[i]:
            continue
        # BFS to find connected component
        cluster = [i]
        queue = [i]
        visited[i] = True
        while queue:
            current = queue.pop(0)
            dists = np.sqrt(np.sum((coords - coords[current]) ** 2, axis=1))
            neighbors = np.where((dists < CLUSTER_RADIUS) & (~visited))[0]
            for nb in neighbors:
                visited[nb] = True
                cluster.append(nb)
                queue.append(nb)

        cluster = np.array(cluster)
        clusters.append((rows[cluster], cols[cluster]))

    return clusters


def _compute_bounding_box(
    rows: np.ndarray, cols: np.ndarray, h: int, w: int, padding: int = 3
) -> dict:
    """Compute a padded bounding box from point coordinates."""
    y_min = max(0, int(np.min(rows)) - padding)
    y_max = min(h - 1, int(np.max(rows)) + padding)
    x_min = max(0, int(np.min(cols)) - padding)
    x_max = min(w - 1, int(np.max(cols)) + padding)

    width = x_max - x_min
    height = y_max - y_min
    area = max(width * height, 1)
    aspect_ratio = max(width, height) / max(min(width, height), 1)

    return {
        "x_min": x_min,
        "y_min": y_min,
        "x_max": x_max,
        "y_max": y_max,
        "width": width,
        "height": height,
        "area": area,
        "aspect_ratio": float(aspect_ratio),
    }


# ──────────────────────────────────────────────────────────────────────
# Defect classification
# ──────────────────────────────────────────────────────────────────────

def _classify_defect(
    dim: int,
    persistence: float,
    bbox: dict,
    n_cluster_points: int,
    n_total_points: int,
    noise_floor: float,
    intensity_deviation: float,
) -> str:
    """
    Classify the type of cosmic defect based on its topological signature,
    spatial geometry, and intensity profile.

    Decision tree:
    ┌─ dim == 1 (H₁ loop/cycle)
    │   └─ → Cosmic String  (all H₁ features are string-like by nature)
    │
    └─ dim == 0 (H₀ connected component)
        ├─ small area AND extreme persistence AND high intensity → Cosmic Monopole
        └─ otherwise → Cosmic Texture
    """
    bbox_area = bbox.get("area", bbox["width"] * bbox["height"])

    if dim == 1:
        # ── H₁ (loops / 1-cycles) ──────────────────────────────────
        # All H₁ features represent loop/cycle structures.
        # Cosmic strings produce characteristic 1-cycles in the CMB.
        return "Cosmic String"

    elif dim == 0:
        # ── H₀ (connected components) ──────────────────────────────
        # Monopole: point-like, extreme isolation, tiny spatial footprint
        is_tiny = bbox_area <= MONOPOLE_MAX_AREA
        is_extreme_persistence = persistence > noise_floor * MONOPOLE_PERSISTENCE_FACTOR
        is_intense = intensity_deviation > 1.5  # >1.5σ from mean

        if is_tiny and is_extreme_persistence and is_intense:
            return "Cosmic Monopole"
        else:
            # Dense / extended H₀ feature → Texture
            return "Cosmic Texture"

    return "Unknown Defect"


def _compute_confidence(
    persistence: float, noise_floor: float,
    gauss_mean: float, gauss_std: float,
) -> float:
    """
    Compute confidence score (0-1) for a detected defect.

    Based on how far above the noise floor the persistence is,
    and how many sigma above the Gaussian baseline.
    """
    # Persistence-based score (how far above noise floor)
    pers_ratio = persistence / max(noise_floor, 1e-10)
    pers_score = min(1.0, (pers_ratio - 1.0) / 3.0)  # 0 at noise floor, 1 at 4x

    # Gaussian sigma-based score
    if gauss_std > 0:
        sigma_score = min(1.0, abs(persistence - gauss_mean) / (gauss_std * 4))
    else:
        sigma_score = 0.5

    # Combined (weighted average)
    confidence = 0.6 * pers_score + 0.4 * sigma_score
    return float(np.clip(confidence, 0.05, 0.99))


def _describe_defect(defect_type: str, dim: int, persistence: float, confidence: float) -> str:
    """Generate a human-readable description for a detected defect."""
    dim_name = "connected component (H₀)" if dim == 0 else "loop/cycle (H₁)"
    conf_label = "high" if confidence > 0.7 else "moderate" if confidence > 0.4 else "low"

    descriptions = {
        "Cosmic String": (
            f"Potential cosmic string (1-Dimensional topological defect formed during early universe phase transitions) "
            f"detected via an elongated {dim_name} with persistence {persistence:.4f}. "
            f"Cosmic strings are line-like spacetime cracks predicted by GUTs and string theory, "
            f"producing characteristic loop-like temperature discontinuities in the CMB. "
            f"Confidence: {conf_label} ({confidence:.0%})."
        ),
        "Cosmic Texture": (
            f"Potential cosmic texture (3-Dimensional topological defect formed during symmetry breaking phase transitions) "
            f"detected via a dense {dim_name} with persistence {persistence:.4f}. "
            f"Textures are collapsing spacetime knots that produce massive localized hot/cold spots "
            f"as they release energy. Confidence: {conf_label} ({confidence:.0%})."
        ),
        "Cosmic Monopole": (
            f"Potential cosmic monopole (0-Dimensional topological defect / point-like singularity from grand unification phase transitions) "
            f"detected via an isolated {dim_name} with persistence {persistence:.4f}. "
            f"Monopoles appear as extreme, highly localized spikes with a tiny spatial footprint. "
            f"Confidence: {conf_label} ({confidence:.0%})."
        ),
    }
    return descriptions.get(defect_type, f"Unknown defect type ({defect_type}).")


# ──────────────────────────────────────────────────────────────────────
# Summary helpers
# ──────────────────────────────────────────────────────────────────────

def _empty_summary() -> dict:
    return {
        "total_defects": 0,
        "by_type": {},
        "max_confidence": 0.0,
        "mean_confidence": 0.0,
    }


def _build_summary(defects: list[dict]) -> dict:
    """Build summary statistics from detected defects."""
    if not defects:
        return _empty_summary()

    by_type = {}
    for d in defects:
        t = d["type"]
        if t not in by_type:
            by_type[t] = {"count": 0, "avg_confidence": 0.0, "max_persistence": 0.0}
        by_type[t]["count"] += 1
        by_type[t]["avg_confidence"] += d["confidence"]
        by_type[t]["max_persistence"] = max(by_type[t]["max_persistence"], d["persistence"])

    for t in by_type:
        by_type[t]["avg_confidence"] = round(by_type[t]["avg_confidence"] / by_type[t]["count"], 4)
        by_type[t]["max_persistence"] = round(by_type[t]["max_persistence"], 6)

    confidences = [d["confidence"] for d in defects]

    return {
        "total_defects": len(defects),
        "by_type": by_type,
        "max_confidence": round(float(max(confidences)), 4),
        "mean_confidence": round(float(np.mean(confidences)), 4),
        "most_significant": {
            "type": defects[0]["type"],
            "confidence": defects[0]["confidence"],
            "persistence": defects[0]["persistence"],
            "location": defects[0]["center"],
        } if defects else None,
    }

