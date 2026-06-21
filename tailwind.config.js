/** @type {import('tailwindcss').Config} */

// Tokens de cor baseados em CSS variables — permitem trocar o tema por modo
// (Mansão / Praia) apenas alterando as variáveis no elemento raiz.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: token('--c-app'),
        surface: token('--c-surface'),
        surface2: token('--c-surface2'),
        line: token('--c-line'),
        ink: token('--c-ink'),
        sub: token('--c-sub'),
        muted: token('--c-muted'),
        accent: token('--c-accent'),
      },
      fontFamily: {
        display: ['"Playfair Display Variable"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
