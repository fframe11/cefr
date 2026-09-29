# Glova Image Strategy: Visual Storytelling, Inclusivity & Layout Stability

**Document Version:** 2.0.0  
**Phase:** Final Visual Experience Redesign (Authentic Editorial Photography)  
**Target:** Web Performance (Core Web Vitals, CLS = 0), Responsive Media  
**Author:** Creative Director & Principal Frontend Performance Engineer  

---

## 1. Visual Storytelling & Art Direction Philosophy

Glova connects language learning with real-world human aspiration. The visual language must reflect actual modern students, young professionals, and creative thinkers in natural environments rather than sterile corporate stock photos, staged models with forced smiles, or infantilizing vector cartoons.

### 1.1 Authentic Photography Invariants
- **Natural, Candid Moments:** Sincere moments of focus, curiosity, relaxed cafe conversations, study sessions, and airport journeys.
- **Natural Lighting & Editorial Warmth:** Warm ambient sunlight, soft shadows, warm wood tones, and shallow depth of field. Avoid harsh fluorescent studio lighting.
- **Zero AI-Generated Visual Slop:** Strictly banned from using distorted AI-generated faces with phantom fingers, glossy synthetic skin textures, or uncanny valley expressions.
- **Zero Generic Placeholders:** Never render `via.placeholder.com`, `placehold.co`, or unstyled gray empty boxes in production code.

---

## 2. Editorial Photography Asset Registry (Unsplash Provenance)

| Viewport / Role | Asset URI | Photographer & Description | Intended Atmosphere |
| :--- | :--- | :--- | :--- |
| **Landing Hero** | `photo-1522202176988-66273c2fd55f` | Brooke Cagle — Young adults learning naturally in warm collaborative space | Welcoming, intelligent, aspirational |
| **Dashboard Backdrop** | `photo-1523240795612-9a054b0db644` | Priscilla Du Preez — University library study collaboration | Calm, focused, academic belonging |
| **Reading Passage** | `photo-1522071820081-009f0129c71c` | Annie Spratt — Creative team collaborating around workspace | Contextual editorial illustration |
| **Vocabulary & Exam Desk** | `photo-1434030216411-0b793f4b4173` | Green Chameleon — Clean structured study desk with stationery | Preparedness, clarity, calm |
| **Speaking & Audio** | `photo-1516321318423-f06f85e504b3` | John Schnobrich — Young person listening with headphones | Immersion, private practice |
| **Writing Studio** | `photo-1455390582262-044cdead277a` | Hannah Olinger — Creative writing journal with fountain pen | Thoughtful expression, studio focus |

---

## 3. Anti-CLS & Layout Shift Prevention Invariant (Zero-Jank Media)

Dynamic image hydration must never push learning content or buttons down the page while loading. Layout thrashing breaks reader focus and fails Core Web Vitals (Cumulative Layout Shift > 0).

### 3.1 Strict Geometry Rules
Every image element or background frame must obey three invariants:
1. **Explicit Fixed Bounding Aspect Ratio:** Containers must declare `aspect-video` (16:9), `aspect-square` (1:1), or `aspect-[4/3]`.
2. **Skeleton Fallback:** Containers render a matching `<Skeleton className="animate-pulse bg-muted/60 absolute inset-0" />` until the image `onLoad` fires.
3. **Overflow Clipping:** Wrapped in `overflow-hidden` with `object-cover` and `w-full h-full`.
4. **Explicit Width and Height Attributes:** Native HTML `<img>` elements must specify explicit `width` and `height` attributes to allow browser layout calculation before network byte arrival.
