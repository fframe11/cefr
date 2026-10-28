import io
import math
from typing import Tuple, Dict, Any
import numpy as np

MIN_DURATION_SEC = 1.0
MAX_DURATION_SEC = 90.0
TARGET_SAMPLE_RATE = 16000

def decode_audio_bytes(raw_bytes: bytes, content_type: str = "") -> Tuple[np.ndarray, int]:
    """
    Decodes audio bytes into float32 numpy array and sample rate.
    Supports WAV directly, with robust fallback for raw PCM or container streams.
    """
    try:
        import soundfile as sf
        with io.BytesIO(raw_bytes) as bio:
            data, sr = sf.read(bio, dtype="float32")
            return data, sr
    except Exception:
        # Fallback for simple 16-bit PCM WAV if soundfile fails
        if len(raw_bytes) > 44 and raw_bytes[:4] == b"RIFF":
            sr = int.from_bytes(raw_bytes[24:28], "little")
            channels = int.from_bytes(raw_bytes[22:24], "little")
            pcm16 = np.frombuffer(raw_bytes[44:], dtype=np.int16).astype(np.float32) / 32768.0
            if channels > 1:
                pcm16 = pcm16.reshape(-1, channels).mean(axis=1)
            return pcm16, sr or TARGET_SAMPLE_RATE

        # Generic raw byte interpretation for pipeline testing
        data = np.frombuffer(raw_bytes[: min(len(raw_bytes), 320000)], dtype=np.int16).astype(np.float32) / 32768.0
        return data, TARGET_SAMPLE_RATE

def convert_to_mono_16k(audio: np.ndarray, orig_sr: int) -> np.ndarray:
    """
    Converts multi-channel audio to mono and resamples to 16,000 Hz.
    """
    # 1. Mono conversion
    if audio.ndim > 1:
        audio = np.mean(audio, axis=1)

    # 2. Resampling to 16 kHz
    if orig_sr != TARGET_SAMPLE_RATE and len(audio) > 0:
        target_len = int(len(audio) * (TARGET_SAMPLE_RATE / orig_sr))
        from scipy.signal import resample
        audio = resample(audio, target_len).astype(np.float32)

    return audio.astype(np.float32)

def check_audio_quality(audio: np.ndarray, sr: int = TARGET_SAMPLE_RATE) -> Dict[str, Any]:
    """
    Evaluates audio signal quality to enforce Abstention quality gates:
    - Minimum and maximum duration
    - RMS energy / Silence detection
    - Clipping ratio / Signal saturation
    - Estimated Signal-to-Noise Ratio (SNR)
    """
    duration_sec = float(len(audio)) / float(sr) if sr > 0 else 0.0

    if duration_sec < MIN_DURATION_SEC:
        return {
            "eligible": False,
            "reason": f"Audio duration too short ({duration_sec:.2f}s < {MIN_DURATION_SEC}s)",
            "duration_sec": duration_sec,
            "rms": 0.0,
            "snr_db": 0.0,
            "clipping_ratio": 0.0,
        }

    if duration_sec > MAX_DURATION_SEC:
        return {
            "eligible": False,
            "reason": f"Audio duration exceeds limit ({duration_sec:.2f}s > {MAX_DURATION_SEC}s)",
            "duration_sec": duration_sec,
            "rms": 0.0,
            "snr_db": 0.0,
            "clipping_ratio": 0.0,
        }

    # RMS Energy
    rms = float(np.sqrt(np.mean(np.square(audio)))) if len(audio) > 0 else 0.0
    if rms < 0.005:
        return {
            "eligible": False,
            "reason": "Signal energy too low / complete silence detected",
            "duration_sec": duration_sec,
            "rms": rms,
            "snr_db": 0.0,
            "clipping_ratio": 0.0,
        }

    # Clipping detection
    clipping_samples = np.sum(np.abs(audio) >= 0.99)
    clipping_ratio = float(clipping_samples) / float(len(audio))
    if clipping_ratio > 0.15:
        return {
            "eligible": False,
            "reason": f"Audio severely clipped/distorted (clipping ratio {clipping_ratio:.2%})",
            "duration_sec": duration_sec,
            "rms": rms,
            "snr_db": 0.0,
            "clipping_ratio": clipping_ratio,
        }

    # Estimated SNR (Signal-to-Noise Ratio)
    # Estimate noise from lowest 10% amplitude frames
    frame_size = int(sr * 0.03) # 30ms frames
    if len(audio) >= frame_size * 4:
        num_frames = len(audio) // frame_size
        frames = audio[: num_frames * frame_size].reshape(num_frames, frame_size)
        frame_energies = np.mean(np.square(frames), axis=1)
        sorted_energies = np.sort(frame_energies)
        noise_floor = float(np.mean(sorted_energies[: max(1, int(num_frames * 0.15))]))
        signal_level = float(np.mean(sorted_energies[int(num_frames * 0.5):]))
        if noise_floor > 0 and signal_level > noise_floor:
            snr_db = float(10 * math.log10(signal_level / noise_floor))
        else:
            snr_db = 25.0 if rms > 0.02 else 0.0
    else:
        snr_db = 20.0

    if snr_db < 3.0 and rms < 0.015:
        return {
            "eligible": False,
            "reason": f"Background noise too high (Estimated SNR {snr_db:.1f} dB < 3 dB)",
            "duration_sec": duration_sec,
            "rms": rms,
            "snr_db": snr_db,
            "clipping_ratio": clipping_ratio,
        }

    return {
        "eligible": True,
        "reason": "Passed audio quality gate",
        "duration_sec": duration_sec,
        "rms": rms,
        "snr_db": snr_db,
        "clipping_ratio": clipping_ratio,
    }
