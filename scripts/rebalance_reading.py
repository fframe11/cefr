import json

with open("data/reading-passages.json", "r", encoding="utf-8") as f:
    passages = json.load(f)

target_keys = ["A", "B", "C", "D"]
global_q_idx = 0
rebalanced_counts = {"A": 0, "B": 0, "C": 0, "D": 0}

for p in passages:
    for q in p.get("questions", []):
        c_text = q.get("correct_answer")
        opts = q.get("options", [])
        
        # Find index of correct option
        correct_opt_idx = -1
        for i, opt in enumerate(opts):
            if opt.get("text") == c_text:
                correct_opt_idx = i
                break
        
        if correct_opt_idx == -1:
            # Fallback if text didn't match exactly
            correct_opt_idx = 0
            c_text = opts[0].get("text")
        
        target_pos = global_q_idx % 4
        target_key = target_keys[target_pos]
        rebalanced_counts[target_key] += 1
        global_q_idx += 1
        
        # Swap correct option into target_pos
        correct_opt = opts[correct_opt_idx]
        other_opts = [o for i, o in enumerate(opts) if i != correct_opt_idx]
        
        new_opts_list = []
        other_ptr = 0
        for pos in range(len(opts)):
            if pos == target_pos:
                new_opts_list.append(correct_opt)
            else:
                new_opts_list.append(other_opts[other_ptr])
                other_ptr += 1
        
        # Re-assign keys A, B, C, D and explicit isCorrect
        final_opts = []
        for pos, opt in enumerate(new_opts_list):
            k = target_keys[pos] if pos < 4 else chr(ord('A') + pos)
            is_c = (pos == target_pos)
            fb_th = (
                f"ถูกต้อง! ({q.get('explanation_th', '')})"
                if is_c
                else f"ยังไม่ถูกต้อง ตัวเลือกที่ถูกต้องคือ {target_key}: \"{c_text}\""
            )
            final_opts.append({
                "key": k,
                "text": opt.get("text"),
                "isCorrect": is_c,
                "is_correct": is_c,
                "feedbackTh": fb_th
            })
            
        q["options"] = final_opts
        q["correct_answer"] = c_text
        q["correctAnswer"] = target_key
        q["correct_option_key"] = target_key

with open("data/reading-passages.json", "w", encoding="utf-8") as f:
    json.dump(passages, f, ensure_ascii=False, indent=2)

print(f"Successfully rebalanced reading-passages.json! Distribution: {rebalanced_counts}")
