# Example Speed Audit — "ShopLite" (e-commerce)

A filled example of `references/report-template.md`. Fictional but realistic.

## 1. Executive summary

- **Top wins:** LCP image (≈0.8s), hot-API index+cache (≈1.2s p95), async uploads (≈1.5s/request),
  filter fetch (≈0.4s/interaction). **Total predicted:** ≈3.9s across the top journeys.
- **Biggest risk:** the checkout SPA is fragile — do **not** rewrite it; optimize in place.
- **Baseline:** LCP 4.2s · INP 380ms · CLS 0.21 · TTFB 820ms.

## 2. Platform map

```
Stack: Laravel + MySQL, Blade + small Vue islands, Redis, Nginx + CloudFront.
Pages: / (SSR), /products (image-heavy list), /checkout (client JS), /account (Vue).
APIs: 42 endpoints; /api/search and /api/feed hottest.
DB: products(50k), orders(2M); orders lacks (user_id, created_at).
Build: Vite; JS bundle 900KB; images unoptimized.
Infra: 2-vCPU app server; CDN for static only; no API cache.
3rd-party: GA4, Intercom (sync in head), Stripe.js.
Background: cron every 5 min (no retry); image resize inline on upload.
Uploads: local disk, served by app; no CDN, no transcoding queue.
Observability: server logs only.
```

## 3. Baseline metrics

| Metric | Current | Target |
|--------|---------|--------|
| LCP (p75 mobile) | 4.2s | ≤2.5s |
| INP (p75) | 380ms | ≤200ms |
| CLS (p75) | 0.21 | ≤0.1 |
| TTFB (p75) | 820ms | ≤800ms |
| /api/search p95 | 1.4s | ≤200ms |
| JS transferred | 900KB | <300KB |

## 4. Bottleneck register (ranked)

| ID | Area | Finding (evidence) | Fix | Predicted gain | Confidence | Effort | Risk |
|----|------|--------------------|-----|----------------|------------|--------|------|
| B1 | frontend | LCP hero 1.2MB JPEG, `loading="lazy"` (waterfall) | AVIF + `srcset` + `fetchpriority=high` + preload | ≈0.8s (0.6–1.0s) | medium | S | low |
| B2 | api | `/api/search` p95 1.4s, seq scan (EXPLAIN) | composite index + 60s cache + trim payload | ≈1.2s (1.0–1.3s) | high | S | low |
| B3 | async | image resize inline on upload → 400–2000ms requests | presigned upload + queue + fallback original | ≈1.5s/request | high | M | med |
| B4 | nav | product filters do full reload | fetch + partial update (progressive enhancement) | ≈0.4s/interaction | medium | M | med |
| B5 | frontend | 3rd-party Intercom + GA4 block main thread (INP 380ms) | defer/load on interaction | ≈150ms INP | medium | S | low |
| B6 | db | `orders` missing `(user_id, created_at)` index | add index | ≈200ms p95 | high | S | low |
| B7 | frontend | images lack dimensions → CLS 0.21 | width/height + aspect-ratio | CLS → <0.05 | high | S | low |
| B8 | api | list endpoints return full objects (no pagination cap) | cursor pagination + field select | −40% payload | high | M | low |

## 5. Detail (example: B2)

- **Evidence:** `EXPLAIN ANALYZE` shows `Seq Scan on products` (50k rows) + full-text `LIKE '%q%'`;
  payload 240KB.
- **Change:** add composite index on `(status, category_id, created_at)`; add a 60s cache-aside on the
  query key with jitter; select only needed columns. **Response shape unchanged** (same JSON keys).
- **Predicted:** ≈1.2s p95 (1.0–1.3s), confidence high (formula on EXPLAIN rows + cache hit 80%).
- **Risk/mitigation:** flag the cache; invalidate on product write; contract test the shape.
- **Verify:** p95 + contract test.

## 6. What we won't change

- **No framework rewrite** (checkout SPA) — predicted gain doesn't justify risk; optimize in place.
- **No service worker** yet — not needed for the measured issues.

## 7. Safety & rollout

Flags for B2/B3/B4; canary 5% → 50% → 100%; contract tests on all touched endpoints; rollback = revert
flag/deploy. UI unchanged except image dimensions (layout-safe).

## 8. Verification (after)

| Metric | Before | After | Delta | Predicted? |
|--------|--------|-------|-------|------------|
| LCP | 4.2s | 1.9s | −2.3s | yes |
| INP | 380ms | 190ms | −190ms | yes |
| /api/search p95 | 1.4s | 180ms | −1.22s | yes |
| CLS | 0.21 | 0.04 | −0.17 | yes |
