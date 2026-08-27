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

## API transition

1. Keep calling `createGelatoDataClient()` from features/providers only.
2. Implement `createHttpGelatoRepository` in `src/data/` against your OpenAPI client.
3. Set `NEXT_PUBLIC_GELATO_DATA_MODE=api` and `NEXT_PUBLIC_API_BASE_URL=…`.

See `src/data/gelato-repository.ts`.

## Marketing

Product site: [`poc-gelato-marketing`](https://github.com/virgiperpetua/poc-gelato-marketing).
