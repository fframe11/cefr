import os
import re

native_buttons = []
disabled_buttons = []

for root_dir in ['components', 'app']:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            pattern = re.compile(r'<button\b([^>]*?)>', re.DOTALL)
            for m in pattern.finditer(content):
                attrs = m.group(1)
                line_no = content[:m.start()].count('\n') + 1
                has_click = 'onClick' in attrs or 'onclick' in attrs
                has_submit = 'type="submit"' in attrs or "type='submit'" in attrs
                has_disabled = 'disabled' in attrs
                
                if not has_click and not has_submit:
                    if has_disabled:
                        disabled_buttons.append((filepath, line_no, attrs.strip().replace('\n', ' ')[:100]))
                    else:
                        native_buttons.append((filepath, line_no, attrs.strip().replace('\n', ' ')[:100]))

print(f"=== NATIVE BUTTONS WITHOUT ONCLICK/SUBMIT (NOT DISABLED): {len(native_buttons)} ===")
for p, l, a in native_buttons:
    print(f"{p}:{l} -> {a}")

print(f"\n=== DISABLED BUTTONS WITHOUT ONCLICK: {len(disabled_buttons)} ===")
for p, l, a in disabled_buttons:
    print(f"{p}:{l} -> {a}")
