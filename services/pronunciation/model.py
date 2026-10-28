import os
import logging
from typing import List, Dict, Any, Optional
import numpy as np

logger = logging.getLogger(__name__)

class E2EGOPModelWrapper:
    """
    Wrapper for E2E-GOP (SpeechOcean762) End-to-End Goodness of Pronunciation Model.
    Designed for CPU execution.
    """
    def __init__(
        self,
        model_name: str = "anonym-coling2027/E2E-GOP-SpeechOcean762",
        device: str = "cpu"
    ):
        self.model_name = model_name
        self.device = device
        self.model = None
        self.processor = None
        self.is_loaded = False
        self.load_error: Optional[str] = None

    def load_model(self) -> bool:
        """
        Attempts to load model weights and processor from Hugging Face or local cache.
        """
        try:
            import torch
            from transformers import AutoModel, AutoProcessor

            logger.info(f"Loading E2E-GOP model from {self.model_name} on {self.device}...")
            # Note: E2E-GOP-SpeechOcean762 requires trust_remote_code=True for custom architecture
            try:
                self.processor = AutoProcessor.from_pretrained(self.model_name, trust_remote_code=True)
            except Exception:
                from transformers import AutoFeatureExtractor, AutoTokenizer, Wav2Vec2Processor
                fe = AutoFeatureExtractor.from_pretrained(self.model_name)
                tok = AutoTokenizer.from_pretrained(self.model_name)
                self.processor = Wav2Vec2Processor(feature_extractor=fe, tokenizer=tok)

            self.model = AutoModel.from_pretrained(self.model_name, trust_remote_code=True).to(self.device)
            self.model.eval()
            self.is_loaded = True
            logger.info("E2E-GOP model successfully loaded.")
            return True
        except Exception as e:
            self.load_error = str(e)
            logger.warning(f"Could not load E2E-GOP model ({e}). Service will operate in benchmark/validation mode.")
            self.is_loaded = False
            return False

    def predict_phoneme_scores(
        self,
        audio_16k: np.ndarray,
        canonical_phonemes: List[str]
    ) -> Dict[str, Any]:
        """
        Infers phoneme-level pronunciation scores (0-2 scale).
        """
        if not self.is_loaded or self.model is None:
            return {
                "ready": False,
                "reason": f"Model weights not loaded: {self.load_error or 'Weights pending download'}",
                "scores": [],
            }

        try:
            import torch

            # 1. Prepare inputs via processor
            inputs = self.processor(
                audio_16k,
                sampling_rate=16000,
                return_tensors="pt",
                return_attention_mask=True
            ).to(self.device)

            # 2. Tokenize canonical phonemes
            # Assumes processor has phone-to-id mapping
            phone_ids = [self.processor.tokenizer.convert_tokens_to_ids(p) for p in canonical_phonemes]
            canonical_ids = torch.tensor([phone_ids], dtype=torch.long, device=self.device)
            token_lengths = torch.tensor([len(phone_ids)], dtype=torch.long, device=self.device)
            token_mask = torch.ones_like(canonical_ids, dtype=torch.bool, device=self.device)

            with torch.inference_mode():
                output = self.model(
                    **inputs,
                    canonical_token_ids=canonical_ids,
                    token_lengths=token_lengths,
                    token_mask=token_mask
                )

            # Logits are in 0-2 scale per SpeechOcean762 target
            raw_scores = output.logits[0][token_mask[0]].tolist()

            return {
                "ready": True,
                "reason": None,
                "scores": raw_scores,
            }
        except Exception as e:
            return {
                "ready": False,
                "reason": f"Inference execution failed: {str(e)}",
                "scores": [],
            }
