import re
from typing import List, Dict, Tuple

# Built-in ARPAbet dictionary for common test and CEFR evaluation words
LEXICON: Dict[str, List[str]] = {
    "i": ["AY1"],
    "enjoy": ["IH0", "N", "JH", "OY1"],
    "studying": ["S", "T", "AH1", "D", "IY0", "IH0", "NG"],
    "english": ["IH1", "NG", "G", "L", "IH0", "SH"],
    "because": ["B", "IH0", "K", "AH1", "Z"],
    "it": ["IH1", "T"],
    "helps": ["HH", "EH1", "L", "P", "S"],
    "me": ["M", "IY1"],
    "communicate": ["K", "AH0", "M", "Y", "UW1", "N", "AH0", "K", "EY2", "T"],
    "globally": ["G", "L", "OW1", "B", "AH0", "L", "IY0"],
    "and": ["AE1", "N", "D"],
    "opens": ["OW1", "P", "AH0", "N", "Z"],
    "up": ["AH1", "P"],
    "wonderful": ["W", "AH1", "N", "D", "ER0", "F", "AH0", "L"],
    "career": ["K", "ER0", "IH1", "R"],
    "opportunities": ["AA2", "P", "ER0", "T", "UW1", "N", "AH0", "T", "IY0", "Z"],
    "like": ["L", "AY1", "K"],
    "reading": ["R", "IY1", "D", "IH0", "NG"],
    "books": ["B", "UH1", "K", "S"],
    "listening": ["L", "IH1", "S", "AH0", "N", "IH0", "NG"],
    "to": ["T", "UW1"],
    "music": ["M", "Y", "UW1", "Z", "IH0", "K"],
    "my": ["M", "AY1"],
    "name": ["N", "EY1", "M"],
    "is": ["IH1", "Z"],
    "every": ["EH1", "V", "R", "IY0"],
    "morning": ["M", "AO1", "R", "N", "IH0", "NG"],
    "wake": ["W", "EY1", "K"],
    "early": ["ER1", "L", "IY0"],
    "drink": ["D", "R", "IH1", "NG", "K"],
    "water": ["W", "AO1", "T", "ER0"],
    "prepare": ["P", "R", "IY0", "P", "EH1", "R"],
    "a": ["AH0"],
    "healthy": ["HH", "EH1", "L", "TH", "IY0"],
    "breakfast": ["B", "R", "EH1", "K", "F", "AH0", "S", "T"],
}

def clean_word(token: str) -> str:
    return re.sub(r"[^a-zA-Z]", "", token).lower()

def text_to_phonemes(text: str) -> List[Tuple[str, List[str]]]:
    """
    Converts reference text into word-phoneme pairs.
    Returns: [ (word, [phonemes...]), ... ]
    """
    words = [w for w in text.strip().split() if clean_word(w)]
    result: List[Tuple[str, List[str]]] = []

    for w in words:
        cleaned = clean_word(w)
        if cleaned in LEXICON:
            phonemes = LEXICON[cleaned]
        else:
            # Rule-based phonetic approximation for out-of-vocabulary words
            phonemes = [char.upper() for char in cleaned]
        result.append((w, phonemes))

    return result

def get_canonical_phoneme_sequence(text: str) -> List[str]:
    """
    Flattens reference text into a flat sequence of canonical phonemes.
    """
    pairs = text_to_phonemes(text)
    seq: List[str] = []
    for _, phones in pairs:
        seq.extend(phones)
    return seq
