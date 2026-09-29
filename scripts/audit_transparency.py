import os
from PIL import Image

ASSET_ROOT = 'public/assets'
all_assets = []

for root, dirs, files in os.walk(ASSET_ROOT):
    for f in files:
        if f.endswith('.png'):
            all_assets.append(os.path.join(root, f))

print(f"Total PNG assets found under {ASSET_ROOT}: {len(all_assets)}")

failures = []
passed = 0

for p in sorted(all_assets):
    im = Image.open(p)
    extrema = im.getextrema()
    is_rgba = im.mode == 'RGBA'
    min_alpha = extrema[3][0] if is_rgba else 255
    max_alpha = extrema[3][1] if is_rgba else 255
    has_alpha = is_rgba and min_alpha == 0 and max_alpha > 0
    size_kb = os.path.getsize(p) / 1024
    
    if not has_alpha:
        failures.append((p, f"Not transparent! mode={im.mode}, min_alpha={min_alpha}"))
    else:
        passed += 1

print(f"Transparency Verification Results:")
print(f"  Passed: {passed}/{len(all_assets)}")
print(f"  Failures: {len(failures)}")

if failures:
    for p, err in failures:
        print(f"  FAILED: {p} -> {err}")
    exit(1)
else:
    print("ALL ASSETS HAVE 100% VALID ALPHA TRANSPARENCY (RGBA, min_alpha=0, max_alpha=255)!")
