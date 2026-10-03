import json

with open("data/reading-passages.json", "r", encoding="utf-8") as f:
    passages = json.load(f)

key_counts = {}
for p in passages:
    pid = p.get("id")
    lvl = p.get("cefr_level")
    qs = p.get("questions", [])
    print(f"Passage {pid} ({lvl}): {len(qs)} questions")
    for q in qs:
        c_ans = q.get("correct_answer")
        keys = [opt["key"] for opt in q.get("options", []) if opt.get("text") == c_ans]
        key = keys[0] if keys else "NONE"
        key_counts[key] = key_counts.get(key, 0) + 1
        print(f"  Q {q.get('id')}: ans={c_ans!r} -> matched key={key}")

print("\nKey counts:", key_counts)
