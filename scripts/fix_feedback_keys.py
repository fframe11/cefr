import re

with open('scripts/expand_reading_and_listening.py', 'r', encoding='utf-8') as f:
    c = f.read()

c = re.sub(r'(?<!["\'])feedbackTh:', '"feedbackTh":', c)

with open('scripts/expand_reading_and_listening.py', 'w', encoding='utf-8') as f:
    f.write(c)

print('Regex successfully fixed all feedbackTh occurrences.')
