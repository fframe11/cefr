import os
import re

empty_handlers = []
hash_hrefs = []
unhandled_buttons = []

for root_dir in ['components', 'app']:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Find empty onClick handlers
            for m in re.finditer(r'onClick=\{\s*\(\)\s*=>\s*\{\s*\}\s*\}', content):
                line_no = content[:m.start()].count('\n') + 1
                empty_handlers.append((filepath, line_no, m.group(0)))

            # Find href="#"
            for m in re.finditer(r'href=[\"\']#[\"\']', content):
                line_no = content[:m.start()].count('\n') + 1
                hash_hrefs.append((filepath, line_no))

print(f"=== EMPTY ONCLICK HANDLERS: {len(empty_handlers)} ===")
for p, l, t in empty_handlers:
    print(f"{p}:{l} -> {t}")

print(f"\n=== HASH HREFS (href=\"#\"): {len(hash_hrefs)} ===")
for p, l in hash_hrefs:
    print(f"{p}:{l}")
