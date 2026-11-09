# Estimation — predicting ms honestly

Predicted gains must be **traceable**, not invented. Show the basis, give a **range**, and state
**confidence**. Then verify after shipping.

## The three-part estimate

1. **Basis** — why this change saves time (bytes removed, requests removed, cache hit-rate, query
   plan, render-blocking elimination).
2. **Calculation** — apply a formula (below) or a measured identical change elsewhere.
3. **Confidence** — `high` (measured on this system), `medium` (formula on real inputs), `low`
   (heuristic / needs measurement).

Express as `≈ X ms (range A–B, confidence C)`.

## Formulas (use `examples/estimate.mjs`)

- **Transfer time** from bytes at effective bandwidth (Mbps):
  `ms = bytes × 8 / (Mbps × 1e6) × 1000`
- **Bytes saved:** `msSaved = transferMs(bytesRemoved, Mbps)`
- **Cache expected latency:** `origin × (1 − hitRate) + cacheHit × hitRate`
- **Requests removed:** each round-trip ≈ one RTT (`requestsSaved × latencyPerRequest`) — network
  dependent.
- **Server/TTFB:** use the measured before/after of the actual change (cache hit, CDN, query fix).
- **Query:** `EXPLAIN ANALYZE` execution time before vs after, at realistic data volume.
- **Render-blocking JS/CSS:** measure with Lighthouse/WebPageTest — parse/exec time is device-dependent;
  don't fabricate it.

## Worked example

Hero image 1.2 MB → 180 KB AVIF on a 10 Mbps mobile link:
`(1_200_000 − 180_000) × 8 / (10e6) × 1000 ≈ 816 ms` transferred. On mobile radio the perceived gain is
often larger; report `≈ 0.8 s (0.6–1.0 s, medium)` and verify with field LCP.

## Caveats

- Networks, CPU, concurrency, and caching vary wildly — always a **range**.
- Improvements can overlap (an image and a TTFB fix both move LCP; don't double-count).
- A faster backend doesn't help if the client waits on JS.
- Lab (Lighthouse) ≠ field (RUM). Prefer field for impact.

## After shipping

Put before/after in the report's verification table (`references/report-template.md`). If the predicted
gain didn't materialise, investigate — don't quietly drop it.
