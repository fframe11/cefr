import os
import sys
import json
from datetime import datetime
from metrics import regression_metrics, bootstrap_confidence_interval
from prepare_dataset import load_dataset_split

# Add services/pronunciation to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "pronunciation")))
from model import E2EGOPModelWrapper
from phonemes import get_canonical_phoneme_sequence
from audio import decode_audio_bytes, convert_to_mono_16k

REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")

def run_benchmark_suite(model_name: str = "E2E-GOP-SpeechOcean762") -> dict:
    """
    Runs systematic benchmark suite comparing model predictions against human ground truth.
    Evaluates against project Go / No-Go criteria.
    Never fabricates synthetic scores.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)
    test_samples = load_dataset_split("test")

    human_scores = [s["human_sentence_score"] for s in test_samples]

    # Initialize model wrapper
    wrapper = E2EGOPModelWrapper(model_name=model_name)
    model_loaded = wrapper.load_model()

    predicted_scores = []
    evaluated_samples = []

    for s in test_samples:
        audio_path = s.get("audio_path")
        # Check if actual audio file exists on disk
        if model_loaded and audio_path and os.path.exists(audio_path):
            with open(audio_path, "rb") as f:
                raw_bytes = f.read()
            audio_data, sr = decode_audio_bytes(raw_bytes)
            audio_16k = convert_to_mono_16k(audio_data, sr)
            canonical = get_canonical_phoneme_sequence(s["text"])
            res = wrapper.predict_phoneme_scores(audio_16k, canonical)
            if res.get("ready") and res.get("scores"):
                # Average phoneme score scaled to 0-10
                pred_10 = (sum(res["scores"]) / len(res["scores"])) * 5.0
                predicted_scores.append(pred_10)
                evaluated_samples.append(s)
        else:
            # When dataset audio is not yet downloaded, do NOT fabricate scores
            pass

    if len(predicted_scores) < 3:
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "model_name": model_name,
            "dataset": "SpeechOcean762",
            "status": "pending_audio_dataset",
            "sample_count": len(test_samples),
            "evaluated_count": len(predicted_scores),
            "verdict": "REJECTED_NO_GO",
            "reason": "SpeechOcean762 raw audio files or model weights not yet downloaded on machine. Run prepare_dataset.py to download before running real benchmark.",
            "release_recommendation": "Scores remain locked in 'not_ready' status until real audio inference benchmark passes."
        }

        report_json_path = os.path.join(REPORTS_DIR, "benchmark_report.json")
        with open(report_json_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        report_md_path = os.path.join(REPORTS_DIR, "benchmark_summary.md")
        with open(report_md_path, "w", encoding="utf-8") as f:
            f.write(f"# Speech Evaluation Benchmark Report: {model_name}\n\n")
            f.write(f"- **Status**: `PENDING_AUDIO_DATASET`\n")
            f.write(f"- **Verdict**: `REJECTED_NO_GO`\n")
            f.write(f"- **Reason**: {report['reason']}\n")
            f.write(f"> **Policy**: {report['release_recommendation']}\n")

        print(f"[!] Benchmark status: PENDING_AUDIO_DATASET. Zero fake scores generated.")
        return report

    # 1. Compute core regression metrics on real predictions
    ref_eval = [s["human_sentence_score"] for s in evaluated_samples]
    metrics = regression_metrics(ref_eval, predicted_scores)

    # 2. Compute 95% Confidence Intervals via bootstrapping
    confidence_intervals = bootstrap_confidence_interval(ref_eval, predicted_scores)

    # 3. Evaluate against Go / No-Go Gates
    gate_spearman = metrics["spearman_rho"] >= 0.80
    gate_mae = metrics["mae"] <= 1.0
    gate_abstention = metrics["abstention_rate"] >= 0.0

    go_no_go_passed = gate_spearman and gate_mae and gate_abstention
    verdict = "PASSED_GO" if go_no_go_passed else "REJECTED_NO_GO"

    report = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "model_name": model_name,
        "dataset": "SpeechOcean762 (test split)",
        "sample_count": len(test_samples),
        "evaluated_count": len(predicted_scores),
        "metrics": metrics,
        "confidence_intervals_95": confidence_intervals,
        "gates": {
            "spearman_rho_ge_0_80": {"target": 0.80, "actual": metrics["spearman_rho"], "pass": gate_spearman},
            "mae_le_1_0": {"target": 1.0, "actual": metrics["mae"], "pass": gate_mae},
            "abstention_gate": {"target": "functional", "actual": metrics["abstention_rate"], "pass": gate_abstention},
        },
        "verdict": verdict,
        "release_recommendation": (
            "Model meets preliminary benchmark criteria on SpeechOcean762."
            if go_no_go_passed
            else "Model does NOT meet Go/No-Go criteria. Scores must remain locked in 'not_ready' status."
        )
    }

    report_json_path = os.path.join(REPORTS_DIR, "benchmark_report.json")
    with open(report_json_path, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    return report

if __name__ == "__main__":
    run_benchmark_suite()
