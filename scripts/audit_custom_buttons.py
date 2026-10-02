import os
import re

custom_missing = []

components_to_check = ['GlovaButton', 'GlovaIconButton', 'TactileButton', 'TactileSecondaryButton']

for root_dir in ['components', 'app']:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            for comp in components_to_check:
                # Find <CompName ... /> or <CompName ...>...</CompName>
                pattern = re.compile(rf'<{comp}\b(.*?)(?:/>|>)', re.DOTALL)
                for m in pattern.finditer(content):
                    tag_attrs = m.group(1)
                    line_no = content[:m.start()].count('\n') + 1
                    
                    has_click = 'onClick' in tag_attrs or 'onclick' in tag_attrs
                    has_submit = 'type="submit"' in tag_attrs or "type='submit'" in tag_attrs
                    has_href = 'href' in tag_attrs or 'to=' in tag_attrs
                    
                    if not has_click and not has_submit and not has_href:
                        custom_missing.append((filepath, line_no, comp, tag_attrs.replace('\n', ' ')[:100]))

print(f"TOTAL CUSTOM BUTTONS WITHOUT HANDLER/SUBMIT/HREF: {len(custom_missing)}")
for p, l, c, a in custom_missing:
    print(f"{p}:{l} <{c}> -> {a}")
