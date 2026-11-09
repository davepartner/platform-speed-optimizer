# Infrastructure & network

Page/API speed is often decided before your code runs. Check the platform underneath.

## Server & runtime

- **Sizing:** CPU is often the bottleneck for PHP/Node/Ruby; scale up or out before micro-optimizing.
- **Persistent workers / warm runtime:** opcache + JIT (PHP), persistent workers (Node cluster,
  Gunicorn/Uvicorn workers, Puma), connection reuse — avoid rebuilding the world per request.
- **Keep-alive** to upstreams; avoid new TLS handshakes per call.
- **Auto-scaling + load balancer:** handle bursts; health checks; no single 2-vCPU box for peak traffic.

## Serverless / cold starts (big for Next/Vercel/Lambda)

- **Cold starts add hundreds of ms.** Reduce function bundle size, lazy-load heavy deps, avoid
  top-level work, use **provisioned concurrency** / warm pools for hot paths.
- Prefer **edge** for static/cacheable HTML; keep database work close to the data.
- Watch per-invocation init: SDK clients, DB pools, and config parsing at module load.

## Containers

- Small images, few layers, fast startup; don't run migrations on boot; warm caches after deploy.

## Network

- **HTTP/2 or HTTP/3 (QUIC)** — fewer round-trips, multiplexing.
- **TLS 1.3**, session resumption, OCSP stapling.
- **CDN / edge** for static assets and cacheable HTML; **Brotli** compression.
- **DNS:** fast, authoritative, low TTL for changing records; `preconnect`/`dns-prefetch` to critical
  origins (don't overdo it).
- **Geographic distance:** users far from the origin pay RTT; edge caching fixes most of it.

## Caching layers

- Browser → CDN/edge → app cache (Redis) → DB. Each layer must have an **invalidation** story.
- Cache **static, hashed assets** aggressively; **HTML** short/revalidate; **private data never** in a
  shared cache.

## Checklist

- [ ] RTT measured from the users' regions (not just the server's).
- [ ] HTTP/2+ enabled; TLS 1.3; Brotli.
- [ ] Static + cacheable HTML on a CDN/edge.
- [ ] Serverless: cold-start budget defined; hot paths warm.
- [ ] Runtime: opcache/JIT/persistent workers on; no per-request bootstrap.
