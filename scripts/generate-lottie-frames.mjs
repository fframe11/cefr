// scripts/generate-lottie-frames.mjs
// Generates 4 production-grade, 100% royalty-free open-source Lottie vector animations for profile frames
import fs from 'fs';
import path from 'path';

function createLottieFrame({ name, primaryColor, secondaryColor, accentColor }) {
  // Convert hex to [r, g, b, 1] normalized (0-1)
  const hexToRgb = (hex) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return [
      ((num >> 16) & 255) / 255,
      ((num >> 8) & 255) / 255,
      (num & 255) / 255,
      1
    ];
  };

  const col1 = hexToRgb(primaryColor);
  const col2 = hexToRgb(secondaryColor);
  const col3 = hexToRgb(accentColor);

  return {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 180,
    w: 200,
    h: 200,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [
      // Layer 1: Outer Rotating Ring with dashes
      {
        ddd: 0,
        ind: 1,
        ty: 4, // Shape layer
        nm: "Outer Rotating Halo",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
              { t: 180, s: [360] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el", // Ellipse
                d: 1,
                s: { a: 0, k: [176, 176] },
                p: { a: 0, k: [0, 0] },
                nm: "Outer Circle"
              },
              {
                ty: "st", // Stroke
                c: { a: 0, k: col1 },
                o: { a: 0, k: 90 },
                w: { a: 0, k: 3.5 },
                lc: 2,
                lj: 2,
                d: [
                  { n: "d", nm: "dash", v: { a: 0, k: 18 } },
                  { n: "g", nm: "gap", v: { a: 0, k: 12 } }
                ],
                nm: "Dashed Stroke"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                nm: "Transform"
              }
            ],
            nm: "Halo Group"
          }
        ],
        ip: 0,
        op: 180,
        st: 0
      },
      // Layer 2: Reverse Rotating Inner Accent Ring
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Inner Counter-Ring",
        sr: 1,
        ks: {
          o: { a: 0, k: 80 },
          r: {
            a: 1,
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [360] },
              { t: 180, s: [0] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [162, 162] },
                p: { a: 0, k: [0, 0] },
                nm: "Inner Circle"
              },
              {
                ty: "st",
                c: { a: 0, k: col2 },
                o: { a: 0, k: 75 },
                w: { a: 0, k: 2 },
                lc: 2,
                lj: 2,
                d: [
                  { n: "d", nm: "dash", v: { a: 0, k: 30 } },
                  { n: "g", nm: "gap", v: { a: 0, k: 20 } }
                ],
                nm: "Accent Stroke"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                nm: "Transform"
              }
            ],
            nm: "Inner Group"
          }
        ],
        ip: 0,
        op: 180,
        st: 0
      },
      // Layer 3: Breathing Pulse Glow Ring
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Breathing Glow Ring",
        sr: 1,
        ks: {
          o: {
            a: 1,
            k: [
              { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [30] },
              { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 90, s: [85] },
              { t: 180, s: [30] }
            ]
          },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: {
            a: 1,
            k: [
              { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 0, s: [97, 97, 100] },
              { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] }, t: 90, s: [103, 103, 100] },
              { t: 180, s: [97, 97, 100] }
            ]
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ty: "el",
                d: 1,
                s: { a: 0, k: [170, 170] },
                p: { a: 0, k: [0, 0] },
                nm: "Pulse Circle"
              },
              {
                ty: "st",
                c: { a: 0, k: col3 },
                o: { a: 0, k: 80 },
                w: { a: 0, k: 4 },
                lc: 2,
                lj: 2,
                nm: "Glow Stroke"
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 },
                nm: "Transform"
              }
            ],
            nm: "Glow Group"
          }
        ],
        ip: 0,
        op: 180,
        st: 0
      },
      // Layer 4: 4 Cardinal Orbiting Energy Beads
      {
        ddd: 0,
        ind: 4,
        ty: 4,
        nm: "Orbiting Gems",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: {
            a: 1,
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
              { t: 180, s: [360] }
            ]
          },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          // Top Bead
          {
            ty: "gr",
            it: [
              { ty: "el", d: 1, s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, -88] }, nm: "Bead 1" },
              { ty: "fl", c: { a: 0, k: col1 }, o: { a: 0, k: 100 }, nm: "Fill 1" },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: "Tr 1" }
            ],
            nm: "G1"
          },
          // Right Bead
          {
            ty: "gr",
            it: [
              { ty: "el", d: 1, s: { a: 0, k: [8, 8] }, p: { a: 0, k: [88, 0] }, nm: "Bead 2" },
              { ty: "fl", c: { a: 0, k: col2 }, o: { a: 0, k: 100 }, nm: "Fill 2" },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: "Tr 2" }
            ],
            nm: "G2"
          },
          // Bottom Bead
          {
            ty: "gr",
            it: [
              { ty: "el", d: 1, s: { a: 0, k: [10, 10] }, p: { a: 0, k: [0, 88] }, nm: "Bead 3" },
              { ty: "fl", c: { a: 0, k: col1 }, o: { a: 0, k: 100 }, nm: "Fill 3" },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: "Tr 3" }
            ],
            nm: "G3"
          },
          // Left Bead
          {
            ty: "gr",
            it: [
              { ty: "el", d: 1, s: { a: 0, k: [8, 8] }, p: { a: 0, k: [-88, 0] }, nm: "Bead 4" },
              { ty: "fl", c: { a: 0, k: col3 }, o: { a: 0, k: 100 }, nm: "Fill 4" },
              { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: "Tr 4" }
            ],
            nm: "G4"
          }
        ],
        ip: 0,
        op: 180,
        st: 0
      }
    ]
  };
}

const frames = [
  {
    filename: 'cyber_neon.json',
    name: 'Cyber Apex Pulsar',
    primaryColor: '#00F0FF',
    secondaryColor: '#8B5CF6',
    accentColor: '#3B82F6'
  },
  {
    filename: 'solar_flame.json',
    name: 'Solar Radiance Flame',
    primaryColor: '#FFB800',
    secondaryColor: '#F97316',
    accentColor: '#FDE047'
  },
  {
    filename: 'mystic_emerald.json',
    name: 'Mystic Emerald Vortex',
    primaryColor: '#10B981',
    secondaryColor: '#06B6D4',
    accentColor: '#34D399'
  },
  {
    filename: 'sakura_starlight.json',
    name: 'Sakura Starlight Bloom',
    primaryColor: '#F43F5E',
    secondaryColor: '#EC4899',
    accentColor: '#FB7185'
  }
];

const outDir = path.resolve('public/animations/frames');
fs.mkdirSync(outDir, { recursive: true });

for (const f of frames) {
  const data = createLottieFrame(f);
  const outPath = path.join(outDir, f.filename);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Generated: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

console.log('All 4 royalty-free Lottie frame assets successfully generated.');
