import os
import re

all_missing = []

for root_dir in ['components', 'app']:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find all <button ...> tags properly handling JSX expressions
            pos = 0
            while True:
                idx = content.find('<button', pos)
                if idx == -1:
                    break
                # Find matching closing '>' for the opening tag, taking into account {...} expressions
                in_curly = 0
                end_idx = -1
                for i in range(idx + 7, len(content)):
                    char = content[i]
                    if char == '{':
                        in_curly += 1
                    elif char == '}':
                        in_curly = max(0, in_curly - 1)
                    elif char == '>' and in_curly == 0:
                        end_idx = i
                        break
                
                if end_idx == -1:
                    break

                tag_content = content[idx:end_idx+1]
                line_no = content[:idx].count('\n') + 1

                has_click = 'onClick' in tag_content or 'onclick' in tag_content
                has_submit = 'type="submit"' in tag_content or "type='submit'" in tag_content
                
                if not has_click and not has_submit:
                    all_missing.append((filepath, line_no, tag_content.replace('\n', ' ')[:120]))
                
                pos = end_idx + 1

print(f"STRICT VERIFIED BUTTONS WITHOUT ONCLICK OR TYPE=SUBMIT: {len(all_missing)}")
for p, l, t in all_missing:
    print(f"{p}:{l} -> {t}")
