import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://virgiperpetua.github.io';
const metadataBase = new URL(siteUrl);
const title = 'Churn Sheet | Gelato Production Planner';
const description =
  'Plan churns, track stock, sequence wash steps, and manage daily gelato production from one mobile-first workspace.';
const iconPath = `${basePath}/logo-mark.svg`;
const appleIconPath = `${basePath}/apple-touch-icon.png`;
const canonicalPath = basePath || '/';

export const metadata: Metadata = {
  metadataBase,
  title,
  description,
  applicationName: 'Churn Sheet',
  keywords: ['gelato', 'production planner', 'kitchen operations', 'stock planning', 'churn sheet'],
  category: 'business',
  alternates: {
    canonical: canonicalPath,
  },
  openGraph: {
    url: canonicalPath,
    title,
    description,
    type: 'website',
    siteName: 'Churn Sheet',
    images: [{ url: iconPath, width: 512, height: 512, alt: 'Churn Sheet logo' }],
  },
  twitter: {
    card: 'summary',
    title,
    description,
    images: [iconPath],
  },
  icons: {
    icon: iconPath,
    shortcut: iconPath,
    apple: { url: appleIconPath, sizes: '180x180', type: 'image/png' },
  },
  manifest: `${basePath}/manifest.webmanifest`,
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
