/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"DM Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#0a0a0f',
          surface: '#13131a',
          surface2: '#1c1c26',
          border: 'rgba(255,255,255,0.08)',
          accent: '#c8f55a',
          accent2: '#ff6b6b',
          accent3: '#6bc5ff',
          muted: '#6b6b7a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease',
        'slide-up': 'slideUp 0.35s ease',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
