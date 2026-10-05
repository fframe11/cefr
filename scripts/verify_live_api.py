import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

base_url = 'https://cefr-platform.fframew01-36b.workers.dev'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

words_to_verify = [
    'about', 'general', 'common', 'animal', 'contract', 'dog', 'cat',
    'bridge', 'hardly', 'broad', 'begin', 'tell', 'tree', 'steak', 'cancer'
]

print("=== VERIFYING LIVE CLOUDFLARE WORKER VOCABULARY API ===")
for w in words_to_verify:
    query = urllib.parse.quote(w)
    url = f"{base_url}/api/content/vocabulary?search={query}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.load(resp)
            inner = data.get('data', {})
            items = inner.get('items', []) if isinstance(inner, dict) else inner
            exact = next((x for x in items if x['word'].lower() == w), None)
            if exact:
                print(f"[{exact['cefr_level']}] {exact['word']} ({exact['part_of_speech']})")
                print(f"  TH: {exact['meaning_th']}")
                print(f"  EN: {exact['meaning_en'][:60]}")
                print(f"  EX: {exact['example_sentence_en'][:60]}")
                print(f"  EX_TH: {exact['example_sentence_th'][:60]}")
            else:
                print(f"NOT FOUND: {w}")
    except Exception as e:
        print(f"ERROR querying {w}: {e}")
    print("-" * 50)
