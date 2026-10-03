#!/usr/bin/env python3
"""
setup_argos_en_th.py
Downloads and installs the EN->TH language model for Argos Translate
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import argostranslate.package
import argostranslate.translate

print("Fetching available packages from Argos package index...")
argostranslate.package.update_package_index()
available_packages = argostranslate.package.get_available_packages()

print(f"Total available packages: {len(available_packages)}")

# Find EN->TH package
en_th_pkg = None
for pkg in available_packages:
    if pkg.from_code == "en" and pkg.to_code == "th":
        en_th_pkg = pkg
        print(f"Found EN->TH package: {pkg}")
        break

if not en_th_pkg:
    print("\nEN->TH package NOT found. Available packages:")
    for pkg in available_packages:
        print(f"  {pkg.from_code} -> {pkg.to_code}")
    sys.exit(1)

print(f"\nDownloading EN->TH model (may take a few minutes)...")
download_path = en_th_pkg.download()
print(f"Downloaded to: {download_path}")

print("Installing package...")
argostranslate.package.install_from_path(download_path)
print("EN->TH package installed successfully!")

# Quick verification test
print("\nRunning translation tests...")
installed = argostranslate.translate.get_installed_languages()
print(f"Installed languages: {[lang.code for lang in installed]}")

test_pairs = [
    ("Hello, how are you?", "greeting"),
    ("schedule", "single word"),
    ("environmental protection", "phrase"),
    ("The student borrowed a book from the library.", "sentence"),
    ("camping in the forest", "phrase"),
]

for text, desc in test_pairs:
    result = argostranslate.translate.translate(text, "en", "th")
    print(f"  [{desc}] '{text}' -> '{result}'")

print("\n✓ Setup complete! Ready to run translation pipeline.")
print("Next: python scripts/libretranslate_pipeline.py --dry-run")
