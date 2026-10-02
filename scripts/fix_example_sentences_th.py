#!/usr/bin/env python3
"""
fix_example_sentences_th.py
============================
แก้ไข example_sentence_th ที่เป็น placeholder ใน vocabulary-production-3860.json

Strategy:
- example_sentence_th ควรเป็นการแปลประโยค example_sentence_en เป็นภาษาไทย
- เนื่องจากเราไม่มี MT service ที่ verified ทำให้แปลอัตโนมัติไม่ได้
  → แต่เราสามารถสร้าง "meaningful placeholder" ที่ดีขึ้นได้:
  
  Pattern ปัจจุบัน (BAD):  "ตัวอย่างประโยคแสดงการใช้งาน "word" ในบริบทจริง"
  Pattern ใหม่ (BETTER):   "ประโยคตัวอย่าง: [example_sentence_en]"
  
  หรือสำหรับ reverse_meaning questions ที่ถามว่า "คำไทย -> English word"
  ต้องการ: คำแปลไทยของประโยค ซึ่งยังต้องการ human translator

  Short-term fix:
  - Replace placeholder ด้วย meaningful description เช่น:
    "ตัวอย่าง: [en sentence] (ต้องการ: [th_word = meaning_th])"

  Note: เพื่อให้ questions ทำงานได้ถูกต้อง explanationTh ใน question engine
        ใช้ both meaning_th และ example_sentence_th ดังนั้น
        ถ้า example_sentence_th ยังเป็น placeholder → explanation จะ ugly

  การแก้แบบ production-grade ต้องการ automated MT pipeline เช่น:
  - Google Translate API (ฟรีมีจำกัด)
  - LibreTranslate (self-hosted, free)
  - Opus-MT (open source model)
  
  Script นี้จะ:
  1. แก้ placeholder ให้เป็น structured version ที่ human-readable
  2. Export รายการ sentences ที่ต้องการแปล (สำหรับ batch translation)
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def is_placeholder(th_sentence):
    return (
        th_sentence.startswith('ตัวอย่างประโยคแสดงการใช้งาน') or
        th_sentence.startswith('ตัวอย่างประโยค') or
        not th_sentence or
        len(th_sentence) < 10
    )

def make_structured_placeholder(word, meaning_th, meaning_en, example_en):
    """
    สร้าง structured placeholder ที่มีประโยชน์กว่าเดิม
    Format: "[ประโยค EN] — คำว่า '{word}' หมายความว่า '{meaning_th}'"
    """
    return f'ประโยคตัวอย่าง: "{example_en}" — คำว่า "{word}" หมายความว่า "{meaning_th}"'

def main():
    print('Loading vocabulary-production-3860.json...')
    with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
        prod = json.load(f)

    print(f'Processing {len(prod)} words...')
    
    fixed_count = 0
    translation_queue = []  # Words needing human/MT translation
    
    updated = []
    for w in prod:
        th_sentence = w.get('example_sentence_th', '')
        en_sentence = w.get('example_sentence_en', '')
        word = w['word']
        meaning_th = w.get('meaning_th', '')
        meaning_en = w.get('meaning_en', '')
        
        if is_placeholder(th_sentence) and en_sentence:
            # Create structured placeholder
            new_th = make_structured_placeholder(word, meaning_th, meaning_en, en_sentence)
            w_updated = dict(w)
            w_updated['example_sentence_th'] = new_th
            w_updated['example_sentence_th_status'] = 'NEEDS_HUMAN_TRANSLATION'
            updated.append(w_updated)
            fixed_count += 1
            translation_queue.append({
                'word': word,
                'cefr_level': w.get('cefr_level'),
                'part_of_speech': w.get('part_of_speech'),
                'meaning_th': meaning_th,
                'example_sentence_en': en_sentence,
                'example_sentence_th': ''  # To be filled
            })
        else:
            updated.append(w)
    
    print(f'Updated {fixed_count} placeholder sentences')
    print(f'Translation queue: {len(translation_queue)} sentences need human/MT translation')
    
    # Save updated production
    with open('data/vocabulary-production-3860.json', 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)
    print('Saved data/vocabulary-production-3860.json')
    
    # Save translation queue (for batch MT)
    with open('reports/example-sentences-translation-queue.json', 'w', encoding='utf-8') as f:
        json.dump(translation_queue, f, ensure_ascii=False, indent=2)
    print('Saved reports/example-sentences-translation-queue.json')
    
    # Show sample
    print('\n=== Sample updated sentences ===')
    for w in updated[:5]:
        print(f'  {w["word"]}: {w.get("example_sentence_th", "")[:100]}')

if __name__ == '__main__':
    main()
