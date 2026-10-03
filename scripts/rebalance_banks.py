import os
import re
import sys

KEYS = ['A', 'B', 'C', 'D']

def parse_options_block(block_text):
    options = []
    depth = 0
    start = -1
    for i, ch in enumerate(block_text):
        if ch == '{':
            if depth == 0:
                start = i
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0 and start != -1:
                options.append(block_text[start:i+1])
                start = -1
    return options

def rebalance_options_in_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content_parts = []
    last_idx = 0
    pattern = re.compile(r'([\'"]?options[\'"]?\s*:\s*\[)')

    block_index = 0
    for match in pattern.finditer(content):
        # Everything before the opening bracket '['
        new_content_parts.append(content[last_idx:match.end()])
        start_bracket = match.end()

        # Find matching ']'
        depth = 1
        idx = start_bracket
        while idx < len(content) and depth > 0:
            if content[idx] == '[':
                depth += 1
            elif content[idx] == ']':
                depth -= 1
            idx += 1

        inner = content[start_bracket:idx-1]
        last_idx = idx - 1  # Position of closing ']'

        opts = parse_options_block(inner)
        if len(opts) < 2:
            new_content_parts.append(inner)
            continue

        num_opts = len(opts)
        target_idx = block_index % num_opts
        block_index += 1

        # Identify correct option index
        correct_idx = -1
        for i, opt_str in enumerate(opts):
            if re.search(r'[\'"]?is_?Correct[\'"]?\s*:\s*true', opt_str):
                correct_idx = i
                break

        if correct_idx == -1:
            for i, opt_str in enumerate(opts):
                if 'ถูกต้อง' in opt_str or 'Correct!' in opt_str:
                    correct_idx = i
                    break

        if correct_idx == -1:
            print(f"  [WARN] No correct option found in block {block_index-1} in {filepath}")
            new_content_parts.append(inner)
            continue

        # Swap to target_idx
        if correct_idx != target_idx:
            opts[target_idx], opts[correct_idx] = opts[correct_idx], opts[target_idx]

        new_opts = []
        for i, opt_str in enumerate(opts):
            new_key = KEYS[i] if i < len(KEYS) else chr(65 + i)
            updated = re.sub(
                r'([\'"]?key[\'"]?\s*:\s*[\'"])[A-Za-z0-9]([\'"])',
                r'\g<1>' + new_key + r'\g<2>',
                opt_str
            )
            is_this_target = (i == target_idx)
            if re.search(r'[\'"]?is_?Correct[\'"]?\s*:\s*(true|false)', updated):
                updated = re.sub(
                    r'([\'"]?is_?Correct[\'"]?\s*:\s*)(true|false)',
                    r'\g<1>' + ('true' if is_this_target else 'false'),
                    updated
                )
            new_opts.append(updated)

        leading_space = "          "
        first_opt_match = re.search(r'\n([ \t]*)\{', inner)
        if first_opt_match:
            leading_space = first_opt_match.group(1)

        new_inner = "\n" + (",\n").join(leading_space + opt.strip() for opt in new_opts) + "\n" + leading_space[:-2]
        new_content_parts.append(new_inner)

    new_content_parts.append(content[last_idx:])
    full_new = "".join(new_content_parts)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_new)

    print(f"Rebalanced {block_index} blocks in {filepath}")

def main():
    print("=== Rebalancing CEFR Question Banks (Bracket-Aware) ===")
    files = [
        'data/grammarBank.ts',
        'src/data/grammarBank.ts',
        'data/readingBank.ts',
        'src/data/readingBank.ts',
        'data/listeningBank.ts',
        'src/data/listeningBank.ts',
        'data/quickCheckQuestions.ts',
        'data/diagnosticAssessment.ts',
        'src/data/diagnosticAssessment.ts',
        'data/mockExams.ts',
        'src/data/mockExams.ts',
        'data/a2DiagnosticRules.ts',
    ]

    for fp in files:
        rebalance_options_in_file(fp)

if __name__ == '__main__':
    main()
