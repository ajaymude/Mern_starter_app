/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary Colors - Using CSS Variables
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        // Secondary Colors - Using CSS Variables
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        // Success Colors - Using CSS Variables
        success: {
          DEFAULT: 'var(--color-success)',
          hover: 'var(--color-success-hover)',
          light: 'var(--color-success-light)',
          dark: 'var(--color-success-dark)',
        },
        // Danger Colors - Using CSS Variables
        danger: {
          DEFAULT: 'var(--color-danger)',
          hover: 'var(--color-danger-hover)',
          light: 'var(--color-danger-light)',
          dark: 'var(--color-danger-dark)',
        },
        // Warning Colors - Using CSS Variables
        warning: {
          DEFAULT: 'var(--color-warning)',
          hover: 'var(--color-warning-hover)',
          light: 'var(--color-warning-light)',
          dark: 'var(--color-warning-dark)',
        },
        // Info Colors - Using CSS Variables
        info: {
          DEFAULT: 'var(--color-info)',
          hover: 'var(--color-info-hover)',
          light: 'var(--color-info-light)',
          dark: 'var(--color-info-dark)',
        },
        // Background Colors - Using CSS Variables
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          navbar: 'var(--bg-navbar)',
          card: 'var(--bg-card)',
          input: 'var(--bg-input)',
          hover: 'var(--bg-hover)',
        },
        // Text Colors - Using CSS Variables
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          muted: 'var(--text-muted)',
          link: 'var(--text-link)',
          'link-hover': 'var(--text-link-hover)',
          error: 'var(--text-error)',
          success: 'var(--text-success)',
        },
        // Border Colors - Using CSS Variables
        border: {
          DEFAULT: 'var(--border-color)',
          light: 'var(--border-color-light)',
          dark: 'var(--border-color-dark)',
          focus: 'var(--border-color-focus)',
        },
        // Gray Scale - Using CSS Variables
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
          300: 'var(--gray-300)',
          400: 'var(--gray-400)',
          500: 'var(--gray-500)',
          600: 'var(--gray-600)',
          700: 'var(--gray-700)',
          800: 'var(--gray-800)',
          900: 'var(--gray-900)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        mono: [
          'source-code-pro',
          'Menlo',
          'Monaco',
          'Consolas',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}

