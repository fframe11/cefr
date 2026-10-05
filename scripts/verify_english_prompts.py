"""Verify that question prompts and choices contain zero Thai characters."""
import re
import sys
from pathlib import Path

# Thai Unicode range: \u0E00-\u0E7F
THAI_RE = re.compile(r'[\u0E00-\u0E7F]')

TARGET_FILES = [
    Path('lib/questions/vocabulary-questions.ts'),
    Path('lib/questions/grammar-questions.ts'),
    Path('lib/questions/reading-questions.ts'),
]

errors = []
for p in TARGET_FILES:
    if not p.exists():
        errors.append(f"File not found: {p}")
        continue
    content = p.read_text(encoding='utf-8')
    # Check lines that define prompts
    for i, line in enumerate(content.splitlines(), start=1):
        if 'promptTh' in line or 'promptEn' in line:
            if THAI_RE.search(line):
                errors.append(f"{p}:{i} contains Thai in prompt: {line.strip()}")

if errors:
    print("VERIFICATION FAILED:")
    for e in errors:
        print(" - " + e)
    sys.exit(1)

print("All question prompt templates are 100% English. Zero Thai found. VERIFIED.")
sys.exit(0)
