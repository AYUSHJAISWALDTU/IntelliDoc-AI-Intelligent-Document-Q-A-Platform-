import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0F',
          surface: '#141419',
          elevated: '#1C1C24',
          border: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.04)',
        },
        light: {
          bg: '#FAFAF8',
          surface: '#FFFFFF',
          elevated: '#F4F4F5',
          border: 'rgba(0,0,0,0.06)',
          hover: 'rgba(0,0,0,0.03)',
        },
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#818CF8',
        },
        secondary: {
          DEFAULT: '#10B981',
          dark: '#059669',
        },
        citation: {
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
      },
      boxShadow: {
        glow: '0 0 20px rgba(99,102,241,0.2)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 10px rgba(99,102,241,0.1)' }, '50%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' } },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0' } },
      },
    },
  },
  plugins: [],
} satisfies Config
