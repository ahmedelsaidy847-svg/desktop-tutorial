import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ألوان SAP Fiori Horizon
        fiori: {
          brand:       '#0070F2',
          'brand-dk':  '#0057B8',
          'brand-lt':  '#EBF5FF',
          shell:       '#354A5E',
          text:        '#32363A',
          'text-sec':  '#6E8091',
          'text-dis':  '#BCC3CA',
          border:      '#DFE3E8',
          'bg-page':   '#F5F6F7',
        },
      },
      fontFamily: {
        sans: ['Noto Kufi Arabic', 'IBM Plex Sans Arabic', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'fiori-sm': '0 1px 2px 0 rgba(0,0,0,.08)',
        'fiori-md': '0 2px 8px 0 rgba(0,0,0,.12)',
        'fiori-lg': '0 4px 16px 0 rgba(0,0,0,.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
