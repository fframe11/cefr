import json
import os
import urllib.request
import tarfile
from typing import Dict, Any, List

DATASET_URL = "https://openslr.elda.org/resources/101/speechocean762_scores.tar.gz"
LOCAL_DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "speechocean762")

def download_and_extract_speechocean762(target_dir: str = LOCAL_DATA_DIR) -> str:
    """
    Downloads and extracts SpeechOcean762 annotations and audio samples.
    """
    os.makedirs(target_dir, exist_ok=True)
    tar_path = os.path.join(target_dir, "speechocean762_scores.tar.gz")

    if not os.path.exists(tar_path):
        print(f"[*] Downloading SpeechOcean762 annotations to {tar_path}...")
        try:
            urllib.request.urlretrieve(DATASET_URL, tar_path)
            print("[+] Download complete.")
        except Exception as e:
            print(f"[-] Could not download from remote URL: {e}")
            return target_dir

    if os.path.exists(tar_path):
        print("[*] Extracting dataset archive...")
        with tarfile.open(tar_path, "r:gz") as tar:
            tar.extractall(path=target_dir)
        print("[+] Extraction finished.")

    return target_dir

def load_dataset_split(split_name: str = "test", data_dir: str = LOCAL_DATA_DIR) -> List[Dict[str, Any]]:
    """
    Loads parsed SpeechOcean762 records for a given split (train/validation/test).
    Each sample contains:
    - id: utterance id
    - text: reference text
    - speaker: speaker id
    - human_sentence_score: average human score (0-10 scale)
    - human_accuracy_score: phoneme accuracy score
    """
    split_file = os.path.join(data_dir, f"{split_name}.json")
    if not os.path.exists(split_file):
        # Generate mock test split for initial pipeline development if raw data is offline
        samples = [
            {
                "id": "utt_001",
                "speaker": "spk_101",
                "text": "I enjoy studying English because it helps me communicate globally.",
                "human_sentence_score": 8.2,
                "human_accuracy_score": 1.72,
            },
            {
                "id": "utt_002",
                "speaker": "spk_102",
                "text": "Every morning I wake up early and prepare breakfast.",
                "human_sentence_score": 6.8,
                "human_accuracy_score": 1.34,
            },
            {
                "id": "utt_003",
                "speaker": "spk_103",
                "text": "In my free time I love reading books and listening to music.",
                "human_sentence_score": 7.5,
                "human_accuracy_score": 1.55,
            },
            {
                "id": "utt_004",
                "speaker": "spk_104",
                "text": "Integrating artificial intelligence requires rigorous oversight.",
                "human_sentence_score": 9.1,
                "human_accuracy_score": 1.88,
            },
            {
                "id": "utt_005",
                "speaker": "spk_105",
                "text": "He decided to visit the local market yesterday.",
                "human_sentence_score": 5.4,
                "human_accuracy_score": 1.05,
            },
        ]
        return samples

    with open(split_file, "r", encoding="utf-8") as f:
        return json.load(f)

if __name__ == "__main__":
    download_and_extract_speechocean762()
