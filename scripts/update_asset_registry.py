import json

with open('data/asset-registry.json', 'r', encoding='utf-8') as f:
    registry = json.load(f)

for item in registry:
    cat = item.get('category')
    meta = item.get('metadata', {})
    
    if cat == 'RANK_EMBLEM':
        tier = meta.get('tier', '').lower()
        if tier:
            item['assetUrl'] = f"/assets/ranks/rank-{tier}.png"
            item['svgUrl'] = f"/assets/ranks/rank-{tier}.svg"
            item['transparentPngUrl'] = f"/assets/ranks/rank-{tier}.png"
            
    elif cat == 'PROFILE_FRAME':
        theme = meta.get('theme')
        rank = meta.get('rankTier')
        if theme and rank:
            item['assetUrl'] = f"/assets/frames/frame-{theme}-{rank}.png"
            item['svgUrl'] = f"/assets/frames/frame-{theme}-{rank}.svg"
            item['transparentPngUrl'] = f"/assets/frames/frame-{theme}-{rank}.png"

# Append Achievement Badges if not already present
achievement_keys = {item.get('assetKey') for item in registry}

achievements_to_add = [
    {
        "id": "ast_achieve_first_step",
        "assetKey": "achievement.badge.first_step",
        "category": "ACHIEVEMENT_BADGE",
        "provider": "Glova Native Design",
        "sourceUrl": "https://glova.app/assets/achievements/first-step",
        "assetUrl": "/assets/achievements/achievement-first-step.png",
        "transparentPngUrl": "/assets/achievements/achievement-first-step.png",
        "license": "Proprietary / Glova Platform Asset",
        "attributionRequired": False,
        "commercialUseAllowed": True,
        "modificationAllowed": True,
        "status": "VERIFIED",
        "version": "1.0.0",
        "metadata": {
            "nameEn": "First Footprint",
            "nameTh": "ก้าวแรกสู่การเรียนรู้",
            "category": "learning"
        }
    },
    {
        "id": "ast_achieve_vocab_master",
        "assetKey": "achievement.badge.vocab_master",
        "category": "ACHIEVEMENT_BADGE",
        "provider": "Glova Native Design",
        "sourceUrl": "https://glova.app/assets/achievements/vocab-master",
        "assetUrl": "/assets/achievements/achievement-vocab-master.png",
        "transparentPngUrl": "/assets/achievements/achievement-vocab-master.png",
        "license": "Proprietary / Glova Platform Asset",
        "attributionRequired": False,
        "commercialUseAllowed": True,
        "modificationAllowed": True,
        "status": "VERIFIED",
        "version": "1.0.0",
        "metadata": {
            "nameEn": "Lexical Scholar",
            "nameTh": "ปราชญ์แห่งคลังคำศัพท์",
            "category": "learning"
        }
    },
    {
        "id": "ast_achieve_streak_fire",
        "assetKey": "achievement.badge.streak_fire",
        "category": "ACHIEVEMENT_BADGE",
        "provider": "Glova Native Design",
        "sourceUrl": "https://glova.app/assets/achievements/streak-fire",
        "assetUrl": "/assets/achievements/achievement-streak-fire.png",
        "transparentPngUrl": "/assets/achievements/achievement-streak-fire.png",
        "license": "Proprietary / Glova Platform Asset",
        "attributionRequired": False,
        "commercialUseAllowed": True,
        "modificationAllowed": True,
        "status": "VERIFIED",
        "version": "1.0.0",
        "metadata": {
            "nameEn": "Unstoppable Momentum",
            "nameTh": "เพลิงแห่งความมุ่งมั่น",
            "category": "streak"
        }
    },
    {
        "id": "ast_achieve_arena_conqueror",
        "assetKey": "achievement.badge.arena_conqueror",
        "category": "ACHIEVEMENT_BADGE",
        "provider": "Glova Native Design",
        "sourceUrl": "https://glova.app/assets/achievements/arena-conqueror",
        "assetUrl": "/assets/achievements/achievement-arena-conqueror.png",
        "transparentPngUrl": "/assets/achievements/achievement-arena-conqueror.png",
        "license": "Proprietary / Glova Platform Asset",
        "attributionRequired": False,
        "commercialUseAllowed": True,
        "modificationAllowed": True,
        "status": "VERIFIED",
        "version": "1.0.0",
        "metadata": {
            "nameEn": "Arena Conqueror",
            "nameTh": "ผู้พิชิตสมรภูมิประลอง",
            "category": "competition"
        }
    }
]

for ach in achievements_to_add:
    if ach['assetKey'] not in achievement_keys:
        registry.append(ach)

with open('data/asset-registry.json', 'w', encoding='utf-8') as f:
    json.dump(registry, f, indent=2, ensure_ascii=False)

print(f"Updated data/asset-registry.json with transparent PNG asset references! Total entries: {len(registry)}")
