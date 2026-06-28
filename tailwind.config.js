/** @type {import('tailwindcss').Config} */

// Tokens de cor baseados em CSS variables — permitem trocar o tema por modo
// (Mansão / Praia) apenas alterando as variáveis no elemento raiz.
const token = (name) => `rgb(var(${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Roles Material Design 3 (mapeados via CSS variables por tema).
        app: token('--c-app'), // surface
        surface: token('--c-surface'), // surface-container
        surface2: token('--c-surface2'), // surface-container-high
        surface3: token('--c-surface3'), // surface-container-highest
        line: token('--c-line'), // outline-variant
        outline: token('--c-outline'), // outline
        ink: token('--c-ink'), // on-surface
        sub: token('--c-sub'), // on-surface-variant
        muted: token('--c-muted'), // on-surface (dim)
        accent: token('--c-accent'), // primary
        onAccent: token('--c-on-accent'), // on-primary
        accentC: token('--c-accent-c'), // primary-container
        onAccentC: token('--c-on-accent-c'), // on-primary-container
        error: token('--c-error'), // error
        onError: token('--c-on-error'), // on-error
      },
      fontFamily: {
        display: ['"Playfair Display Variable"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
