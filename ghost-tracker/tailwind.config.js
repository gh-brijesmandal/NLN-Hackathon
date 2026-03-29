/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Cabinet Grotesk"', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
        display: ['"Clash Display"', 'sans-serif'],
      },
      colors: {
        bg: '#080c10',
        surface: '#0f1419',
        border: '#1a2332',
        muted: '#2a3a4d',
        accent: '#2dd4bf',
        warn: '#94a3b8',
        danger: '#f43f5e',
        ghost: '#64748b',
        text: {
          primary: '#e2eaf4',
          secondary: '#7a96b2',
          muted: '#3d5166',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
