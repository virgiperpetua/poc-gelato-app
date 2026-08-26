import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Churn Sheet — Gelato Production Planner',
  description:
    'Mobile-first gelato production planner for stock, churn priorities, wash steps, and production plans.',
  applicationName: 'Churn Sheet',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#9b6ff3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={archivo.variable}>
      <body
        style={
          {
            ['--vp-font-heading' as string]: 'var(--font-archivo), system-ui, sans-serif',
            ['--vp-font-body' as string]: 'var(--font-archivo), system-ui, sans-serif',
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
