/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          950: '#07070b',
          900: '#0b0b12',
          850: '#101019',
          800: '#15151f',
          700: '#1d1d2a',
          600: '#262636',
          500: '#34344a',
          400: '#4a4a63',
        },
        neon: {
          lime: '#c6ff3a',
          green: '#5cff9e',
          cyan: '#3af6ff',
          blue: '#4aa6ff',
          pink: '#ff4ad8',
          magenta: '#ff2a78',
          amber: '#ffb347',
          red: '#ff4d4d',
        },
      },
      boxShadow: {
        neon: '0 0 12px rgba(58,246,255,0.35), 0 0 32px rgba(58,246,255,0.12)',
        'neon-lime': '0 0 12px rgba(198,255,58,0.4), 0 0 32px rgba(198,255,58,0.15)',
        'neon-pink': '0 0 12px rgba(255,74,216,0.4), 0 0 32px rgba(255,74,216,0.15)',
        'neon-soft': '0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px -10px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { opacity: '1', transform: 'scale(1.03)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        'spin-slow': {
          '100%': { transform: 'rotate(360deg)' },
        },
        'drift': {
          '0%': { transform: 'translate(0,0)' },
          '50%': { transform: 'translate(20px,-20px)' },
          '100%': { transform: 'translate(0,0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-down': 'slide-down 0.4s ease-out both',
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        shake: 'shake 0.4s ease-in-out',
        'spin-slow': 'spin-slow 8s linear infinite',
        drift: 'drift 14s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
