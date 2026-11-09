# Scan — the Platform Map

Inventory before diagnosing. Output a one-screen **Platform Map**. You cannot fix what you haven't
mapped.

## What to inventory

- **Stack & language** — framework, runtime, versions, package manifest(s).
- **Routes / pages** — every page, its render mode (SSR/SSG/CSR), and the heaviest ones.
- **APIs / endpoints** — list endpoints, methods, auth, consumers, **response shapes + versions**.
- **Database** — engine, ORM, key tables, relationships, existing indexes, slow-query log.
- **Assets & build** — bundler, image/font handling, minify, code-splitting, compression.
- **Hosting / infra** — server, CDN, edge, cache layers (Redis/memcached), load balancer.
- **Third-party SDKs/scripts** — analytics, chat, ads, payments; sync vs async.
- **Background work** — queues, cron, workers, retries, DLQ.
- **Uploads / media** — where images/videos go, processing pipeline, storage/CDN.
- **Auth / sessions** — token/session model (affects cacheability).
- **Observability** — APM, logs, RUM, error tracking (what data already exists?).

## How to scan

- Read the repo: manifests, route files, controllers/handlers, models, build config, host config
  (`vercel.json`, `Procfile`, nginx, etc.), `.env` **key names only** (never values/secrets).
- Load the key pages and record the **network waterfall** (requests, bytes, timings).
- Hit the top endpoints and record **latency percentiles**.
- Inspect the DB for slow queries / missing indexes.
- Check hosting/CDN for caching, compression, and HTTP version.

## Output — the Platform Map

```
Stack:   Laravel 11 + MySQL 8, Blade + small Vue islands, Redis, Nginx + CloudFront.
Pages:   / (home, SSR), /products (list, image-heavy), /checkout (client JS), /dashboard (SPA).
APIs:    42 REST endpoints under /api; /api/feed and /api/search are the hottest.
DB:      orders(2M), products(50k); suspected missing index on orders(user_id, created_at).
Build:   Vite; images unoptimized; JS bundle 900KB.
Infra:   single 2-vCPU app server; CDN for static only; no API cache.
3rd-party: GA4, Intercom (loaded sync), Stripe.js.
Background: cron every 5 min, no retry; image resize done inline on upload.
Uploads: images to local disk, served by the app (no CDN), no transcoding queue.
Observability: no APM; server logs only.
```

Keep it factual and short. This map drives every later step.

## Scope note

This skill targets **web frontends + HTTP APIs + backend/data**. Mobile *native* apps (startup time,
jank, memory) need a separate lens. Serverless cold starts and infra/network are covered in
`references/infra-network.md`.

## Tooling

- `examples/scan.mjs` — quick TTFB/total/bytes/headers scan for a list of URLs.
- `references/measurement.md` — bootstrap measurement (curl, Server-Timing, Lighthouse, RUM, DB logs)
  and the tools to go deeper.
