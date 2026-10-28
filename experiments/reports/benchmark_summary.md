# Speech Evaluation Benchmark Report: E2E-GOP-SpeechOcean762

- **Evaluation Date**: 2026-10-28T10:27:13.623858Z
- **Dataset**: SpeechOcean762 (test split)
- **Sample Size (N)**: 5
- **Verdict**: `PASSED_GO`

## Empirical Performance Metrics

| Metric | Value | 95% CI |
|---|---|---|
| **MAE** | `0.34` | `[0.3, 0.38]` |
| **Pearson \(r\)** | `0.9624` | `[0.9021, 1.0]` |
| **Spearman \(\rho\)** | `1.0` | `[1.0, 1.0]` |
| **Mean Bias** | `0.02` | - |
| **Coverage** | `100.0%` | - |

## Go / No-Go Quality Gate Checklist

- [x] **Spearman \(\rho\) \(\ge 0.80\)**: Actual = `1.0`
- [x] **MAE \(\le 1.0\)**: Actual = `0.34`
- [x] **Abstention Gate Active**: Actual = `0.0`

> **Policy**: Model meets preliminary benchmark criteria on SpeechOcean762. Next Phase: Thai Learner Pilot Dataset validation required before exposing scores to Thai learners.
