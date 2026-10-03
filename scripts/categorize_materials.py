import os
import sys
import io
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
files = sorted(os.listdir(target_dir))

categorized = {
    'OOPT_Format_and_Strategy': [],
    'Part1_Focus_on_Form_Grammar': [],
    'Part1_Collocations_Phrasal_Verbs': [],
    'Part2_Focus_on_Meaning_Dialogue': [],
    'Part3_Open_Cloze_Texts': [],
    'Listening_Comprehension': [],
    'Reading_Comprehension': [],
    'Pretest_A2_Diagnostic': [],
    'Reference_Cheat_Sheets': [],
}

for f in files:
    fl = f.lower()
    if 'intro' in fl or 'oopt' in fl and 'listening' not in fl and 'part' not in fl and 'test' not in fl:
        categorized['OOPT_Format_and_Strategy'].append(f)
    elif 'listening' in fl:
        categorized['Listening_Comprehension'].append(f)
    elif 'reading' in fl:
        categorized['Reading_Comprehension'].append(f)
    elif 'part 2' in fl or 'meaning' in fl:
        categorized['Part2_Focus_on_Meaning_Dialogue'].append(f)
    elif 'part 3' in fl or 'cloze' in fl:
        categorized['Part3_Open_Cloze_Texts'].append(f)
    elif 'collocation' in fl or 'phrasal' in fl:
        categorized['Part1_Collocations_Phrasal_Verbs'].append(f)
    elif 'pretest' in fl or 'a2' in fl and 'pretest' in fl:
        categorized['Pretest_A2_Diagnostic'].append(f)
    elif 'สรุป' in fl or 'in-on-at' in fl or 'play-do-go' in fl or 'do, make' in fl:
        categorized['Reference_Cheat_Sheets'].append(f)
    elif 'verb' in fl or 'adj' in fl or 'noun' in fl or 'form' in fl or 'part 1' in fl:
        categorized['Part1_Focus_on_Form_Grammar'].append(f)
    else:
        categorized['OOPT_Format_and_Strategy'].append(f)

print("=== CATEGORIZED GUIDELINE FILES ===")
for cat, flist in categorized.items():
    print(f"\n[{cat}] ({len(flist)} files):")
    for fname in flist:
        print(f"  - {fname}")
