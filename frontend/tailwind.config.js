/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B17',
          900: '#0B1528',
          850: '#0F1D38',
          800: '#142548',
          700: '#1E3563',
          600: '#2A4B8C',
        },
        cyan: {
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#06B6D4',
          600: '#0891B2',
          900: '#164E63',
        },
        electric: {
          500: '#00F0FF',
          600: '#00B4D8',
        },
        wafer: {
          bg: '#050a14',
          pass: '#10B981',
          fail: '#EF4444',
          blank: '#1e293b',
          grid: '#334155'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -5px rgba(6, 182, 212, 0.4)',
        'electric-glow': '0 0 25px -4px rgba(0, 240, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
