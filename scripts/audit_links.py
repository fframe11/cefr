import os
import re

routes_checked = set()
invalid_links = []

# List all valid routes from app directory
valid_routes = {
    '/', '/landing', '/dashboard', '/assessment', '/vocabulary', 
    '/grammar', '/reading', '/listening', '/writing', '/speaking', 
    '/compete', '/ranking', '/social', '/achievements', '/analytics', 
    '/profile', '/login', '/signup', '/mock-exams', '/mockExam'
}

for root_dir in ['components', 'app']:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            for m in re.finditer(r'<Link\b[^>]*?\bhref=["\']([^"\']+)["\']', content):
                full_href = m.group(1)
                href = full_href.split('?')[0].split('#')[0]
                line_no = content[:m.start()].count('\n') + 1
                routes_checked.add(href)
                if not href.startswith('http') and not href.startswith('mailto:') and href not in valid_routes:
                    invalid_links.append((filepath, line_no, full_href))

print(f"Total distinct link targets: {len(routes_checked)}")
print(f"Invalid / Unmatched links: {len(invalid_links)}")
for p, l, h in invalid_links:
    print(f"{p}:{l} -> {h}")
