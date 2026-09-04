/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['GeistMono', 'JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Domain Color Tokens (Minimal, Human-Crafted)
        signal: {
          DEFAULT: '#f04f23',
          hover: '#d9421a',
          active: '#c23814',
          subtle: '#fff3ef',
          'dark-subtle': '#24120c',
        },
        live: {
          DEFAULT: '#10b981',
          subtle: '#ecfdf5',
          'dark-subtle': '#06281e',
        },
        route: {
          DEFAULT: '#0284c7',
          subtle: '#f0f9ff',
          'dark-subtle': '#082136',
        },
        warning: {
          DEFAULT: '#f59e0b',
          subtle: '#fffbeb',
          'dark-subtle': '#2a1a04',
        },
        // Pitch-black charcoal shades for backward compatibility
        charcoal: {
          base: '#000000',
          card: '#0c0d10',
          elevated: '#16181d',
          border: '#23262d',
          ink: '#f4f4f6',
          muted: '#8b8f9a',
        },
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        modal: '16px',
        card: '12px',
        btn: '8px',
        hud: '6px',
      },
    },
  },
  plugins: [],
}

