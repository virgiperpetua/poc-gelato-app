import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

// GitHub Pages serves this repo from /poc-gelato-app, so assets need the
// prefix baked in at build time. Set to '' for root-domain hosting.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/poc-gelato-app';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static SPA export — same pattern as poc-plattform-kit web.
  output: 'export',
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
