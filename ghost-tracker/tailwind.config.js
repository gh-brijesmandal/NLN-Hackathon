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
        border: '#1e2730',
        muted: '#3a4554',
        ghost: '#5b7fa6',
        accent: '#4fffb0',
        warn: '#ffb347',
        danger: '#ff4f6a',
        text: {
          primary: '#e8f0f8',
          secondary: '#8fa3bb',
          muted: '#4a6073',
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
