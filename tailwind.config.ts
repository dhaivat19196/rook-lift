import type { Config } from 'tailwindcss';

const c = (v: string) => `rgb(var(--${v}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        subtle: c('subtle'),
        border: c('border'),
        text: c('text'),
        muted: c('muted'),
        accent: c('accent'),
        'accent-fg': c('accent-fg'),
        danger: c('danger'),
        warn: c('warn'),
      },
      fontFamily: {
        sans: ['ui-sans-serif', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: { xl2: '1.25rem' },
    },
  },
  plugins: [],
};
export default config;
