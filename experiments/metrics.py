import numpy as np
from scipy.stats import pearsonr, spearmanr
from sklearn.metrics import mean_absolute_error
from typing import Dict, Any, List, Optional

def regression_metrics(
    reference: List[float],
    predicted: List[float],
    total_evaluated: Optional[int] = None,
    total_abstained: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Computes rigorous evaluation metrics:
    - n: number of valid samples
    - MAE: Mean Absolute Error
    - Pearson r: linear correlation
    - Spearman rho: rank correlation
    - Bias: mean(predicted - reference)
    - Coverage: % of samples scored vs total
    - Abstention rate: % of samples abstained
    """
    y = np.asarray(reference, dtype=float)
    p = np.asarray(predicted, dtype=float)
    valid = np.isfinite(y) & np.isfinite(p)
    y, p = y[valid], p[valid]

    if len(y) < 3:
        raise ValueError("Need at least 3 valid samples to compute correlation metrics")

    n = len(y)
    mae = float(mean_absolute_error(y, p))
    r_val = float(pearsonr(y, p).statistic)
    rho_val = float(spearmanr(y, p).statistic)
    bias = float(np.mean(p - y))

    total = (total_evaluated or n)
    abstain = (total_abstained or 0)
    coverage = float(n / total) if total > 0 else 1.0
    abstention_rate = float(abstain / total) if total > 0 else 0.0

    return {
        "n": int(n),
        "mae": round(mae, 4),
        "pearson_r": round(r_val, 4),
        "spearman_rho": round(rho_val, 4),
        "bias": round(bias, 4),
        "coverage": round(coverage, 4),
        "abstention_rate": round(abstention_rate, 4),
    }

def bootstrap_confidence_interval(
    reference: List[float],
    predicted: List[float],
    num_bootstraps: int = 1000,
    confidence_level: float = 0.95
) -> Dict[str, Dict[str, float]]:
    """
    Computes 95% Confidence Interval via non-parametric bootstrapping.
    """
    y = np.asarray(reference, dtype=float)
    p = np.asarray(predicted, dtype=float)
    n = len(y)

    r_bootstraps: List[float] = []
    rho_bootstraps: List[float] = []
    mae_bootstraps: List[float] = []

    rng = np.random.default_rng(seed=42)

    for _ in range(num_bootstraps):
        indices = rng.integers(0, n, size=n)
        sample_y, sample_p = y[indices], p[indices]
        if np.std(sample_y) > 1e-6 and np.std(sample_p) > 1e-6:
            r_bootstraps.append(pearsonr(sample_y, sample_p).statistic)
            rho_bootstraps.append(spearmanr(sample_y, sample_p).statistic)
            mae_bootstraps.append(mean_absolute_error(sample_y, sample_p))

    alpha = (1.0 - confidence_level) / 2.0
    lower_pct = alpha * 100
    upper_pct = (1.0 - alpha) * 100

    return {
        "pearson_r": {
            "lower_95": round(float(np.percentile(r_bootstraps, lower_pct)), 4),
            "upper_95": round(float(np.percentile(r_bootstraps, upper_pct)), 4),
        },
        "spearman_rho": {
            "lower_95": round(float(np.percentile(rho_bootstraps, lower_pct)), 4),
            "upper_95": round(float(np.percentile(rho_bootstraps, upper_pct)), 4),
        },
        "mae": {
            "lower_95": round(float(np.percentile(mae_bootstraps, lower_pct)), 4),
            "upper_95": round(float(np.percentile(mae_bootstraps, upper_pct)), 4),
        },
    }
