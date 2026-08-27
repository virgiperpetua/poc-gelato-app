# poc-gelato-app

> **Primary:** GitHub (`virgiperpetua/poc-gelato-app`). GitLab (`virginia-perpetua/poc-gelato-app`) is a mirror.

Mobile-first **gelato production planner** (Churn Sheet) — FE PoC ported from the Claude artifact at `gelato/main/gelato-planner.html`.

## Stack

Same FE stack family as [poc-plattform-kit](https://github.com/singleton-sd/poc-plattform-kit) web:

| Layer | Choice |
| --- | --- |
| App | Next.js 14 static SPA export |
| UI | React 18 + Tailwind 3 |
| Tokens | Virginia Perpetua `--vp-*` (vendored from [`tokens`](https://github.com/virgiperpetua/tokens)) |
| Validation | Zod (ready for DTO/API shapes) |
| Data | `GelatoRepository` → **localStorage** today; `NEXT_PUBLIC_GELATO_DATA_MODE=api` reserved |

No backend in this PoC. Persistence is local to the browser, with a repository boundary so swapping to an HTTP/OpenAPI client later does not touch feature screens.

## Features

- Role entry: manager / churner / staff
- Today overview + priority queue
- Production plan generate/approve
- Wash-safe churn sequence
- Bake-ahead checklist
- Stock count, bladder delivery, expiry alerts
- Flavours / specials / wash groups
- Lightweight reports from local history

## Quick start

```sh
pnpm install
pnpm dev
```

```sh
pnpm build   # static export → out/
pnpm typecheck
```

### Hosting base path

GitHub Pages serves this repo under `/poc-gelato-app`, so the build bakes that
prefix into every asset URL. Override it for other hosts:

```sh
NEXT_PUBLIC_BASE_PATH= pnpm build          # root domain
NEXT_PUBLIC_BASE_PATH=/custom pnpm build   # other subpath
```

Live: https://virgiperpetua.github.io/poc-gelato-app/

## Data snapshots

Manager role → the download button in the top bar opens **Data**, which can:

- **Download JSON** — the whole dataset as `churn-sheet-snapshot-<timestamp>.json`
- **Copy to clipboard** — same payload, for pasting into another device
- **Import** — file picker or paste; validated before it replaces anything
- **Reset to seed** — wipe the device and rebuild the demo catalogue

Because localStorage is per-origin and per-browser, exporting is the only way to
move real shop-floor data off a device — do it before switching phones, clearing
site data, or moving the app to a custom domain.

### Snapshot format

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-08-27T01:00:00.000Z",
  "appVersion": "0.1.0",
  "data": { "flavours": [], "stock": {}, "production-plans": {} }
}
```

`data` is keyed by storage key, and each key is one future API resource
collection, so a snapshot doubles as the **production seed payload**: have the
API accept this file (or read it in a seed script) and the first real deployment
starts with the catalogue, PAR levels, and wash groups already tuned on the floor.
Bump `SNAPSHOT_SCHEMA_VERSION` in `src/domain/snapshot.ts` whenever a stored
shape changes; imports from a newer version are refused rather than half-applied.

## API transition

1. Keep calling `createGelatoDataClient()` from features/providers only.
2. Implement `createHttpGelatoRepository` in `src/data/` against your OpenAPI client.
3. Set `NEXT_PUBLIC_GELATO_DATA_MODE=api` and `NEXT_PUBLIC_API_BASE_URL=…`.
4. Seed the new backend with a snapshot exported from the Data screen.

See `src/data/gelato-repository.ts`.

## Marketing

Product site: [`poc-gelato-marketing`](https://github.com/virgiperpetua/poc-gelato-marketing).
