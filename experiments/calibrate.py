import json
import os
import numpy as np
from typing import List, Dict, Any, Tuple
from scipy.optimize import curve_fit

CALIBRATION_FILE = os.path.join(os.path.dirname(__file__), "calibration_map.json")

def sigmoid(x, a, b, c, d):
    """Sigmoid curve for non-linear score calibration."""
    return a / (1.0 + np.exp(-b * (x - c))) + d

def fit_calibration_curve(
    raw_scores: List[float],
    human_scores: List[float]
) -> Dict[str, Any]:
    """
    Fits monotonic calibration curve mapping raw model scores to human 0-10 or 0-100 scale.
    """
    x = np.asarray(raw_scores, dtype=float)
    y = np.asarray(human_scores, dtype=float)

    # Initial guess: linear slope
    p0 = [max(y) - min(y), 1.0, np.mean(x), min(y)]
    try:
        popt, _ = curve_fit(sigmoid, x, y, p0=p0, maxfev=5000)
        params = [float(p) for p in popt]
        calibrated_type = "sigmoid"
    except Exception:
        # Fallback to linear regression
        slope, intercept = np.polyfit(x, y, 1)
        params = [float(slope), float(intercept)]
        calibrated_type = "linear"

    result = {
        "type": calibrated_type,
        "params": params,
        "min_raw": float(np.min(x)),
        "max_raw": float(np.max(x)),
    }

    with open(CALIBRATION_FILE, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    return result

def apply_calibration(raw_score: float) -> float:
    """
    Applies calibrated mapping if available, otherwise returns raw score.
    """
    if not os.path.exists(CALIBRATION_FILE):
        return raw_score

    try:
        with open(CALIBRATION_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        if data["type"] == "sigmoid":
            a, b, c, d = data["params"]
            return float(sigmoid(raw_score, a, b, c, d))
        elif data["type"] == "linear":
            slope, intercept = data["params"]
            return float(slope * raw_score + intercept)
    except Exception:
        pass

    return raw_score
