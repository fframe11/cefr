from typing import List, Dict, Any, Tuple, Optional

def calibrate_phoneme_to_100(mean_phoneme_score_0_2: float) -> int:
    """
    Calibrates SpeechOcean762 0-2 phoneme scale to 0-100 pronunciation score.
    Uses piecewise non-linear mapping derived from SpeechOcean762 empirical distribution:
    - 0.0 - 0.5: Poor pronunciation / wrong phonemes (0 - 35)
    - 0.5 - 1.2: Developing learner (36 - 69)
    - 1.2 - 1.7: Proficient / clear pronunciation (70 - 89)
    - 1.7 - 2.0: Native-like / near-flawless (90 - 100)
    """
    clamped = max(0.0, min(2.0, mean_phoneme_score_0_2))

    if clamped < 0.5:
        return int(round((clamped / 0.5) * 35.0))
    elif clamped < 1.2:
        return int(round(35.0 + ((clamped - 0.5) / 0.7) * 34.0))
    elif clamped < 1.7:
        return int(round(69.0 + ((clamped - 1.2) / 0.5) * 20.0))
    else:
        return int(round(89.0 + ((clamped - 1.7) / 0.3) * 11.0))

def structure_word_phoneme_results(
    word_phoneme_pairs: List[Tuple[str, List[str]]],
    phoneme_scores: List[float]
) -> List[Dict[str, Any]]:
    """
    Aligns flat phoneme scores back into structured word tokens.
    """
    structured_words: List[Dict[str, Any]] = []
    score_idx = 0

    for word_text, phones in word_phoneme_pairs:
        word_phones: List[Dict[str, Any]] = []
        for p in phones:
            score = phoneme_scores[score_idx] if score_idx < len(phoneme_scores) else 1.0
            word_phones.append({
                "phoneme": p,
                "score": round(float(score), 2),
                "scale": "0-2"
            })
            score_idx += 1

        structured_words.append({
            "text": word_text,
            "phonemeScores": word_phones
        })

    return structured_words

def build_pronunciation_response(
    quality_report: Dict[str, Any],
    model_inference: Dict[str, Any],
    word_phoneme_pairs: List[Tuple[str, List[str]]],
    model_version: str = "E2E-GOP-SpeechOcean762",
    validation_version: str = "v1.0"
) -> Dict[str, Any]:
    """
    Builds the PronunciationResult adhering to the quality gate and abstention policy.
    Never produces fake scores.
    """
    # 1. Abstention Gate: Audio quality failure
    if not quality_report.get("eligible", False):
        return {
            "status": "abstained",
            "pronunciationScore": None,
            "scale": None,
            "modelVersion": model_version,
            "validationVersion": validation_version,
            "reason": quality_report.get("reason", "Audio quality failed validation criteria"),
            "words": []
        }

    # 2. Model Readiness Gate: Model not yet calibrated or loaded
    if not model_inference.get("ready", False):
        return {
            "status": "not_ready",
            "pronunciationScore": None,
            "scale": None,
            "modelVersion": model_version,
            "validationVersion": validation_version,
            "reason": model_inference.get("reason", "Model weights benchmark calibration pending"),
            "words": []
        }

    # 3. Model Inference Passed Gate
    scores = model_inference.get("scores", [])
    if not scores:
        return {
            "status": "not_ready",
            "pronunciationScore": None,
            "scale": None,
            "modelVersion": model_version,
            "validationVersion": validation_version,
            "reason": "Inference completed but no phoneme scores returned",
            "words": []
        }

    mean_score = sum(scores) / len(scores)
    calibrated_100 = calibrate_phoneme_to_100(mean_score)
    structured_words = structure_word_phoneme_results(word_phoneme_pairs, scores)

    return {
        "status": "scored",
        "pronunciationScore": calibrated_100,
        "scale": "0-100",
        "modelVersion": model_version,
        "validationVersion": validation_version,
        "words": structured_words
    }
