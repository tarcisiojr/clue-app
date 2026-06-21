/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta inspirada no cartão de papel (tons de ardósia/azul)
        mansao: {
          DEFAULT: '#5b6b8c',
          dark: '#3f4d6b',
        },
      },
    },
  },
  plugins: [],
}
