from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from audio import decode_audio_bytes, convert_to_mono_16k, check_audio_quality
from phonemes import text_to_phonemes, get_canonical_phoneme_sequence
from model import E2EGOPModelWrapper
from scoring import build_pronunciation_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pronunciation-service")

app = FastAPI(
    title="CEFR Pronunciation Assessment Service",
    description="E2E-GOP and SpeechOcean762 Pronunciation Scoring Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model wrapper instance
model_wrapper = E2EGOPModelWrapper()

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing Pronunciation Evaluation Engine...")
    model_wrapper.load_model()

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model_loaded": model_wrapper.is_loaded,
        "device": model_wrapper.device,
        "model_name": model_wrapper.model_name,
    }

@app.post("/v1/assess")
async def assess_pronunciation(
    audio: UploadFile = File(...),
    reference_text: str = Form(""),
):
    if not reference_text.strip():
        raise HTTPException(
            status_code=400,
            detail="reference_text is required for pronunciation assessment",
        )

    # 1. Read binary audio
    raw_bytes = await audio.read()
    if len(raw_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty audio file received")

    # 2. Decode & convert to Mono 16 kHz
    audio_data, orig_sr = decode_audio_bytes(raw_bytes, audio.content_type or "")
    audio_16k = convert_to_mono_16k(audio_data, orig_sr)

    # 3. Quality & Abstention Check
    quality_report = check_audio_quality(audio_16k, sr=16000)

    # 4. Phoneme decomposition
    word_phoneme_pairs = text_to_phonemes(reference_text)
    canonical_phones = get_canonical_phoneme_sequence(reference_text)

    # 5. Run Model Inference
    if quality_report["eligible"]:
        model_result = model_wrapper.predict_phoneme_scores(audio_16k, canonical_phones)
    else:
        model_result = {"ready": False, "scores": []}

    # 6. Apply Calibrated Quality Gate
    response = build_pronunciation_response(
        quality_report=quality_report,
        model_inference=model_result,
        word_phoneme_pairs=word_phoneme_pairs,
        model_version=model_wrapper.model_name,
        validation_version="v1.0-e2e-gop"
    )

    return response

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
