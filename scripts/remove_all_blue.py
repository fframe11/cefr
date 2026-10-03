import os, re

# Replacements map
HEX_MAP = {
    '#3B82F6': '#FA5D5D',
    '#3b82f6': '#FA5D5D',
    '#2563EB': '#E84C4C',
    '#2563eb': '#E84C4C',
    '#1D4ED8': '#D93B3B',
    '#1d4ed8': '#D93B3B',
    '#60A5FA': '#FFA0A0',
    '#60a5fa': '#FFA0A0',
    '#93C5FD': '#FFBA38',
    '#93c5fd': '#FFBA38',
    '#38BDF8': '#FFBA38',
    '#38bdf8': '#FFBA38',
    '#0284C7': '#FA5D5D',
    '#0284c7': '#FA5D5D',
    '#0EA5E9': '#FA5D5D',
    '#0ea5e9': '#FA5D5D',
    '#2155E6': '#FA5D5D',
    '#2155e6': '#FA5D5D',
}

TAILWIND_REPLACEMENTS = [
    # text colors
    (r'\btext-blue-([0-9]{2,3})\b', 'text-[#FA5D5D]'),
    (r'\btext-sky-([0-9]{2,3})\b', 'text-amber-500'),
    (r'\btext-indigo-([0-9]{2,3})\b', 'text-[#FA5D5D]'),
    (r'\bdark:text-blue-([0-9]{2,3})\b', 'dark:text-rose-400'),
    (r'\bdark:text-sky-([0-9]{2,3})\b', 'dark:text-amber-400'),
    (r'\bdark:text-indigo-([0-9]{2,3})\b', 'dark:text-rose-400'),

    # bg colors
    (r'\bbg-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'bg-[#FA5D5D]/\2'),
    (r'\bbg-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'bg-amber-500/\2'),
    (r'\bbg-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'bg-[#FA5D5D]/\2'),
    (r'\bbg-blue-([0-9]{2,3})\b', 'bg-[#FA5D5D]'),
    (r'\bbg-sky-([0-9]{2,3})\b', 'bg-amber-500'),
    (r'\bbg-indigo-([0-9]{2,3})\b', 'bg-[#FA5D5D]'),
    (r'\bdark:bg-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:bg-[#FA5D5D]/\2'),
    (r'\bdark:bg-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:bg-amber-500/\2'),
    (r'\bdark:bg-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:bg-[#FA5D5D]/\2'),

    # border colors
    (r'\bborder-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'border-[#FA5D5D]/\2'),
    (r'\bborder-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'border-amber-500/\2'),
    (r'\bborder-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'border-[#FA5D5D]/\2'),
    (r'\bborder-blue-([0-9]{2,3})\b', 'border-[#FA5D5D]'),
    (r'\bborder-sky-([0-9]{2,3})\b', 'border-amber-500'),
    (r'\bborder-indigo-([0-9]{2,3})\b', 'border-[#FA5D5D]'),
    (r'\bdark:border-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:border-[#FA5D5D]/\2'),
    (r'\bdark:border-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:border-amber-500/\2'),
    (r'\bdark:border-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'dark:border-[#FA5D5D]/\2'),

    # gradients
    (r'\bfrom-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'from-[#FA5D5D]/\2'),
    (r'\bfrom-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'from-amber-500/\2'),
    (r'\bfrom-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'from-[#FA5D5D]/\2'),
    (r'\bfrom-blue-([0-9]{2,3})\b', 'from-[#FA5D5D]'),
    (r'\bfrom-sky-([0-9]{2,3})\b', 'from-amber-500'),
    (r'\bfrom-indigo-([0-9]{2,3})\b', 'from-[#FA5D5D]'),

    (r'\bto-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'to-amber-500/\2'),
    (r'\bto-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'to-amber-500/\2'),
    (r'\bto-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'to-purple-500/\2'),
    (r'\bto-blue-([0-9]{2,3})\b', 'to-amber-500'),
    (r'\bto-sky-([0-9]{2,3})\b', 'to-amber-500'),
    (r'\bto-indigo-([0-9]{2,3})\b', 'to-purple-500'),

    (r'\bvia-blue-([0-9]{2,3})\b', 'via-[#FA5D5D]'),
    (r'\bvia-sky-([0-9]{2,3})\b', 'via-amber-500'),
    (r'\bvia-indigo-([0-9]{2,3})\b', 'via-purple-500'),

    # rings and focus
    (r'\bring-blue-([0-9]{2,3})\/([0-9]{1,3})\b', r'ring-[#FA5D5D]/\2'),
    (r'\bring-sky-([0-9]{2,3})\/([0-9]{1,3})\b', r'ring-amber-500/\2'),
    (r'\bring-indigo-([0-9]{2,3})\/([0-9]{1,3})\b', r'ring-[#FA5D5D]/\2'),
    (r'\bfocus:ring-indigo-500\b', 'focus:ring-[#FA5D5D]'),
    (r'\bfocus:ring-blue-500\b', 'focus:ring-[#FA5D5D]'),
    (r'\bfocus:ring-sky-500\b', 'focus:ring-amber-500'),

    # hover
    (r'\bhover:bg-blue-([0-9]{2,3})\b', 'hover:bg-[#E84C4C]'),
    (r'\bhover:bg-indigo-([0-9]{2,3})\b', 'hover:bg-[#E84C4C]'),
    (r'\bhover:bg-sky-([0-9]{2,3})\b', 'hover:bg-amber-600'),
    (r'\bhover:text-blue-([0-9]{2,3})\b', 'hover:text-[#FA5D5D]'),
    (r'\bhover:text-indigo-([0-9]{2,3})\b', 'hover:text-[#FA5D5D]'),
]

total_files_modified = 0

for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['node_modules', '.next', '.git', '.open-next', 'dist', 'coverage', 'scripts']):
        continue
    for f in files:
        if f.endswith(('.tsx', '.ts', '.css')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fl:
                content = fl.read()

            original = content
            # 1. Hex replacements
            for old_hex, new_hex in HEX_MAP.items():
                content = content.replace(old_hex, new_hex)

            # 2. Tailwind replacements
            for pattern, repl in TAILWIND_REPLACEMENTS:
                content = re.sub(pattern, repl, content)

            if content != original:
                with open(path, 'w', encoding='utf-8') as fl:
                    fl.write(content)
                total_files_modified += 1
                print(f"Updated: {path}")

print(f"\nDone! Modified {total_files_modified} files to remove all blue colors.")
