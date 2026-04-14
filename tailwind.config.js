const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "inverse-on-surface": "#283044",
        "secondary-fixed": "#e8ddff",
        "error": "#ffb4ab",
        "surface-container-high": "#222a3d",
        "on-secondary-fixed-variant": "#4f319c",
        "surface-tint": "#2fd9f4",
        "surface-variant": "#2d3449",
        "on-tertiary-fixed-variant": "#3e4852",
        "tertiary": "#bdc8d3",
        "primary-fixed-dim": "#2fd9f4",
        "on-surface": "#dae2fd",
        "inverse-surface": "#dae2fd",
        "secondary-container": "#4f319c",
        "background": "#0b1326",
        "outline-variant": "#45464d",
        "outline": "#909097",
        "error-container": "#93000a",
        "surface-container-lowest": "#060e20",
        "tertiary-fixed": "#dae3f0",
        "on-tertiary-fixed": "#131d25",
        "tertiary-container": "#0e1821",
        "on-tertiary-container": "#78828d",
        "tertiary-fixed-dim": "#bdc8d3",
        "secondary-fixed-dim": "#cebdff",
        "surface-container-highest": "#2d3449",
        "on-error-container": "#ffdad6",
        "primary-fixed": "#a2eeff",
        "on-error": "#690005",
        "primary-container": "#001b20",
        "surface-container-low": "#131b2e",
        "surface-container": "#171f33",
        "surface-bright": "#31394d",
        "surface": "#0b1326",
        "primary": "#2fd9f4",
        "on-primary": "#00363e",
        "surface-dim": "#0b1326",
        "on-tertiary": "#28313b",
        "on-secondary": "#381385",
        "on-primary-fixed": "#001f25",
        "on-surface-variant": "#c6c6cd",
        "on-secondary-container": "#bea8ff",
        "on-primary-fixed-variant": "#004e5a",
        "on-background": "#dae2fd",
        "on-secondary-fixed": "#21005e",
        "inverse-primary": "#006877",
        "secondary": "#cebdff",
        "on-primary-container": "#008ea1"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
