/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glova: {
          bg: "#E6DED2",
          surface: "#F0EAE1",
          inset: "#EDE6DD",
          track: "#DDD4C7",
          ink: "#25242A",
          muted: "#6E6870",
          subtle: "#8D8790",
          primary: "#5B5CE2",
          accent: "#E98278",
          soft: "#DCD9FF",
          softAccent: "#FBE8E6",
          gold: "#E5A83B",
          mint: "#58B993",
          border: "rgba(37, 36, 42, 0.12)",
          borderStrong: "rgba(37, 36, 42, 0.22)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        tech: ['var(--font-tech)', 'monospace'],
        grotesk: ['var(--font-grotesk)', 'sans-serif'],
      },
      keyframes: {
        'border-beam': {
          '100%': {
            'offset-distance': '100%',
          },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'shimmer': 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
