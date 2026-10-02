import os
import re

components_dir = 'components'
app_dir = 'app'

custom_button_issues = []
clickable_divs_without_handler = []

for root_dir in [components_dir, app_dir]:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check GlovaButton, GlovaIconButton, TactileButton without onClick
            for btn_name in ['GlovaButton', 'GlovaIconButton', 'TactileButton']:
                pattern = re.compile(rf'<{btn_name}\b([^>]*?)>', re.DOTALL)
                for m in pattern.finditer(content):
                    attrs = m.group(1)
                    line_no = content[:m.start()].count('\n') + 1
                    if 'onClick' not in attrs and 'onclick' not in attrs and 'type="submit"' not in attrs and 'href' not in attrs:
                        custom_button_issues.append((filepath, line_no, btn_name, attrs.strip().replace('\n', ' ')[:80]))

            # Check for divs or spans with cursor-pointer but without onClick
            div_pattern = re.compile(r'<(div|span|article)\b([^>]*?cursor-pointer[^>]*?)>', re.DOTALL)
            for m in div_pattern.finditer(content):
                tag = m.group(1)
                attrs = m.group(2)
                line_no = content[:m.start()].count('\n') + 1
                if 'onClick' not in attrs and 'onclick' not in attrs:
                    # check if wrapped in Link
                    clickable_divs_without_handler.append((filepath, line_no, tag, attrs.strip().replace('\n', ' ')[:80]))

print("=== CUSTOM BUTTONS WITHOUT ONCLICK ===")
for path, line, name, attrs in custom_button_issues:
    print(f"{path}:{line}: <{name}> {attrs}")

print(f"\nTotal custom buttons without onClick: {len(custom_button_issues)}")

print("\n=== CLICKABLE DIVS/SPANS WITHOUT ONCLICK ===")
for path, line, tag, attrs in clickable_divs_without_handler[:30]:
    print(f"{path}:{line}: <{tag}> {attrs}")

print(f"\nTotal clickable divs without onClick: {len(clickable_divs_without_handler)}")
