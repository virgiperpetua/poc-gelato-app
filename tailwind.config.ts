import type { Config } from 'tailwindcss';

// Colors map to Virginia Perpetua tokens (--vp-*) vendored in src/styles/tokens.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fg: {
          DEFAULT: 'var(--vp-color-text)',
          muted: 'var(--vp-color-text-muted)',
        },
        bg: {
          DEFAULT: 'var(--vp-color-bg)',
          surface: 'var(--vp-color-surface)',
        },
        accent: {
          DEFAULT: 'var(--vp-color-accent)',
          strong: 'var(--vp-color-accent-strong)',
          on: 'var(--vp-color-on-accent)',
        },
        line: 'var(--vp-color-divider)',
      },
      fontFamily: {
        heading: 'var(--vp-font-heading)',
        body: 'var(--vp-font-body)',
        mono: 'var(--vp-font-mono)',
      },
      borderRadius: {
        sm: 'var(--vp-radius-sm)',
        md: 'var(--vp-radius-md)',
        lg: 'var(--vp-radius-lg)',
      },
      maxWidth: {
        content: 'var(--vp-content-max)',
        reading: 'var(--vp-content-reading)',
      },
      boxShadow: {
        sm: 'var(--vp-shadow-sm)',
        md: 'var(--vp-shadow-md)',
        lg: 'var(--vp-shadow-lg)',
      },
    },
  },
  plugins: [],
};

export default config;
