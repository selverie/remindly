/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    fontFamily: {
      sans: ['Nunito', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    extend: {
      colors: {
        ink:          '#e3e2dc',
        'ink-soft':   '#a8a79f',
        'ink-muted':  '#6a6960',
        'surface':    '#1e1e1e',
        'surface-soft': '#252525',
        'surface-muted': '#161616',
        'border':     '#2a2a2a',
        'border-soft': '#222222',
        'accent':     '#e3e2dc',
        'accent-blue': '#4f8ef7',
      },
      maxWidth: {
        'app': '800px',
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      }
    },
  },
  plugins: [],
}
