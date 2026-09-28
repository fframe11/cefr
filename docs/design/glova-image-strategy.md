# Glova Image Strategy: Visual Storytelling, Inclusivity & Layout Stability

**Document Version:** 1.0.0  
**Phase:** 6.3.1 — Foundation Only  
**Target:** Web Performance (Core Web Vitals, CLS = 0), Responsive Media  
**Author:** Creative Director & Principal Frontend Performance Engineer  

---

## 1. Visual Storytelling Philosophy

Glova connects language learning with real-world human agency. The visual language must reflect actual modern students, young professionals, and creative thinkers rather than sterile corporate stock photos or infantilizing vector cartoons.

### 1.1 Authentic Photography Invariants
- **Real People in Real Contexts:** Sincere moments of focus, curiosity, relaxed cafe conversations, study sessions, and airport journeys.
- **Natural Lighting & Editorial Warmth:** Warm ambient sunlight, balanced contrast, and shallow depth of field. Avoid harsh fluorescent studio lighting.
- **Zero AI-Generated Visual Slop:** Strictly banned from using distorted AI-generated faces with phantom fingers, glossy synthetic skin textures, or uncanny valley expressions.
- **Zero Generic Placeholders:** Never render `via.placeholder.com`, `placehold.co`, or unstyled gray empty boxes in production code.

---

## 2. Inclusivity & Representation (Women, LGBTQ+, and All Learners)

Visual representation shapes a learner's sense of belonging. Glova's imagery deliberately fosters an open, safe, and progressive atmosphere without resorting to superficial tokenism or clichéd tropes.

| Community | Dignified Representation Guidelines | Prohibited Stereotypes |
| :--- | :--- | :--- |
| **Women Learners** | Depicted as active thinkers, developers, team leads, researchers, and confident global speakers. Casual, comfortable, professional attire. | Hyper-feminized pastel aesthetic, decorative passive poses, or helpless learner tropes. |
| **LGBTQ+ Learners** | Naturally woven into everyday learning scenarios — diverse modern hair expressions, personal aesthetics, and authentic peer study groups. | Superficial rainbow gimmicks, exaggerated stereotypes, or segregated novelty tags. |
| **Male & Non-Binary** | Genuine study engagement, focused listening with headphones, relaxed collaboration with diverse peers. | Aggressive corporate grindset imagery or hyper-competitive exam tropes. |
| **Regional Diversity** | Authentic Southeast Asian, East Asian, and global students reflecting Glova's diverse learner demographic. | Monocultural Western-only models or touristy exoticized caricatures. |

---

## 3. Anti-CLS & Layout Shift Prevention Invariant (Zero-Jank Media)

Dynamic image hydration must never push learning content or buttons down the page while loading. Layout thrashing breaks reader focus and fails Core Web Vitals (Cumulative Layout Shift > 0).

### 3.1 Strict Geometry Rules
Every image element or background frame must obey three invariants:
1. **Explicit Fixed Bounding Aspect Ratio:** Containers must declare `aspect-video` (16:9), `aspect-square` (1:1), or `aspect-[4/3]`.
2. **Skeleton Fallback:** Containers render a matching `<Skeleton className="animate-pulse bg-muted/60 absolute inset-0" />` until the image `onLoad` fires.
3. **Overflow Clipping:** Wrapped in `overflow-hidden` with `object-cover` and `w-full h-full`.

```tsx
// Anti-CLS Image Container Template
export function GlovaResponsiveImage({ src, alt, aspectRatio = 'aspect-video' }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-muted/30 ${aspectRatio}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/60" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
```

---

## 4. Curated Asset Directory & Ingestion Architecture

Assets are organized systematically in `public/images/`:

```
public/images/
├── brand/
│   ├── glova-mark-radiant.svg      # Primary vector logo
│   ├── glova-mark-monochrome.svg   # High-contrast vector logo
│   └── favicon.svg                 # Optimized 32x32 SVG favicon
├── learning/
│   ├── study-cafe-focus.webp       # Deep study & reading session
│   ├── conversation-pair.webp      # Speaking & peer interaction
│   └── international-campus.webp   # Global CEFR milestones
└── avatars/
    ├── learner-01.webp             # Diverse learner avatar set
    ├── learner-02.webp
    └── mentor-ai.webp              # Intelligent assistant portrait
```

### 4.1 Asset Optimization Standards
- **Modern Formats:** `image/webp` or `image/avif` for photographs; pure SVG for icons and vector marks.
- **Resolution Capping:** Hero images capped at max `1440px` width; in-card thumbnails capped at `600px` width.
- **Compression:** Quality target 80–85%, keeping image weight under `120KB` per asset.
