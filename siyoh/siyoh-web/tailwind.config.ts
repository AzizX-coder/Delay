import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#FDFBF7',
        'paper-tint': '#F7F1E8',
        'paper-deep': '#EFE6D6',
        ink: '#1A1613',
        'ink-soft': '#3A332C',
        mute: '#6B6158',
        'mute-soft': '#A89C8E',
        orange: { DEFAULT: '#FF6A3D', deep: '#F04A1E', soft: '#FF9A5B', tint: '#FFE8DB' },
        'dark-bg': '#141110',
        'dark-card': '#1E1A17',
        'dark-elev': '#272220',
        'dark-ink': '#F5EDE0',
        'dark-mute': '#A89C8E',
      },
      fontFamily: {
        serif: ['var(--font-newsreader)', 'Charter', 'Georgia', 'serif'],
        sans: ['var(--font-geist)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { '2.5xl': '20px', '3xl': '22px', '4xl': '28px' },
      backgroundImage: {
        'orange-grad': 'linear-gradient(135deg, #FF5722 0%, #FF8A4C 100%)',
        'orange-grad-soft': 'linear-gradient(135deg, #FFE1D0 0%, #FFD0B0 100%)',
      },
      boxShadow: {
        'glow-orange': '0 8px 20px rgba(255,87,34,0.3)',
        'glow-orange-lg': '0 18px 40px rgba(255,87,34,0.25)',
      },
    },
  },
  plugins: [],
};
export default config;
