import sys
import os
import unittest
import numpy as np

# Add services/pronunciation and experiments to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "services", "pronunciation")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "experiments")))

from audio import check_audio_quality, convert_to_mono_16k
from phonemes import text_to_phonemes, get_canonical_phoneme_sequence
from scoring import build_pronunciation_response, calibrate_phoneme_to_100
from metrics import regression_metrics, bootstrap_confidence_interval

class TestPronunciationService(unittest.TestCase):

    def test_audio_quality_abstains_on_silence(self):
        # Silent audio (zeros)
        silent_audio = np.zeros(16000 * 3, dtype=np.float32)
        quality = check_audio_quality(silent_audio, sr=16000)

        self.assertFalse(quality["eligible"])
        self.assertTrue("silence" in quality["reason"].lower() or "too low" in quality["reason"].lower())

    def test_audio_quality_abstains_on_short_duration(self):
        # 0.5s audio (< 1.0s limit)
        short_audio = np.random.uniform(-0.1, 0.1, 8000).astype(np.float32)
        quality = check_audio_quality(short_audio, sr=16000)

        self.assertFalse(quality["eligible"])
        self.assertTrue("short" in quality["reason"].lower())

    def test_audio_quality_passes_on_valid_speech(self):
        # Normal volume audio of 3.5s
        t = np.linspace(0, 3.5, int(16000 * 3.5))
        valid_audio = 0.2 * np.sin(2 * np.pi * 440 * t).astype(np.float32)
        quality = check_audio_quality(valid_audio, sr=16000)

        self.assertTrue(quality["eligible"])
        self.assertGreaterEqual(quality["duration_sec"], 3.0)

    def test_phoneme_decomposition(self):
        text = "I enjoy reading books"
        pairs = text_to_phonemes(text)
        canonical = get_canonical_phoneme_sequence(text)

        self.assertEqual(len(pairs), 4)
        self.assertEqual(pairs[0][0], "I")
        self.assertIn("AY1", pairs[0][1])
        self.assertGreaterEqual(len(canonical), 4)

    def test_abstention_gate_builds_correct_contract(self):
        # Bad quality -> must return status: abstained, pronunciationScore: None
        bad_quality = {"eligible": False, "reason": "Severe background noise"}
        model_inference = {"ready": True, "scores": [1.5, 1.8]}
        pairs = [("enjoy", ["IH0", "N", "JH", "OY1"])]

        resp = build_pronunciation_response(bad_quality, model_inference, pairs)
        self.assertEqual(resp["status"], "abstained")
        self.assertIsNone(resp["pronunciationScore"])
        self.assertEqual(resp["reason"], "Severe background noise")

    def test_unready_model_gate_builds_not_ready_contract(self):
        # Model not calibrated -> must return status: not_ready, pronunciationScore: None
        good_quality = {"eligible": True, "reason": "Passed audio quality gate"}
        unready_inference = {"ready": False, "reason": "Model weights benchmark calibration pending"}
        pairs = [("enjoy", ["IH0", "N", "JH", "OY1"])]

        resp = build_pronunciation_response(good_quality, unready_inference, pairs)
        self.assertEqual(resp["status"], "not_ready")
        self.assertIsNone(resp["pronunciationScore"])

    def test_metrics_calculation_and_bootstrap(self):
        ref = [5.0, 7.0, 8.0, 9.0, 6.0]
        pred = [5.2, 6.9, 7.8, 9.1, 5.9]

        metrics = regression_metrics(ref, pred)
        self.assertLess(metrics["mae"], 0.3)
        self.assertGreater(metrics["spearman_rho"], 0.95)

        ci = bootstrap_confidence_interval(ref, pred, num_bootstraps=100)
        self.assertIn("spearman_rho", ci)
        self.assertIn("mae", ci)

if __name__ == "__main__":
    unittest.main()
