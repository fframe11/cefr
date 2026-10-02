import re

files = [
    'components/views/GrammarView.tsx',
    'components/views/ListeningView.tsx',
    'components/views/ReadingView.tsx',
    'components/views/WritingView.tsx',
    'components/views/SpeakingView.tsx',
    'components/views/MockExamView.tsx',
    'components/common/ProfileModal.tsx',
    'components/common/Header.tsx',
    'components/common/Sidebar.tsx',
    'components/common/MobileBottomNav.tsx'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    buttons = list(re.finditer(r'<button\b([^>]*?)>', content))
    missing = []
    for b in buttons:
        attrs = b.group(1).replace('\n', ' ')
        has_click = 'onClick' in attrs or 'onclick' in attrs
        has_submit = 'type="submit"' in attrs or "type='submit'" in attrs
        if not has_click and not has_submit:
            missing.append(attrs.strip()[:100])
    print(f'{fpath}: {len(buttons)} buttons, {len(missing)} missing')
    for m in missing:
        print(f'   MISSING: {m}')
