# Measurement — getting a baseline (even with no instrumentation)

You can't optimize what you haven't measured. Start with whatever you have, then improve it.

## Fast bootstrap (works on any web app)

**Server/endpoint timing with `curl`** (TTFB, total, bytes):

```bash
curl -s -o /dev/null -w 'dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download}\n' \
  https://your.app/api/search
```

**Server-Timing headers** — ask the backend to emit `Server-Timing: db;dur=42, app;dur=15`; then read
them in DevTools → Network → Timing.

**Browser DevTools** — Network waterfall (sizes, TTFB, request count), Performance panel (long tasks,
main-thread flame chart), Lighthouse (lab diagnosis).

**Lighthouse CLI** (repeatable lab runs):

```bash
npx lighthouse https://your.app --preset=desktop --output=json --output-path=./lh.json
```

**DB slow log / EXPLAIN** — enable the slow-query log; run `EXPLAIN ANALYZE` on the top 10 queries.

**A tiny RUM snippet** (if you have none) — measure LCP/INP/CLS from real users:

```html
<script type="module">
  import { onLCP, onINP, onCLS } from 'https://unpkg.com/web-vitals?module';
  onLCP((m) => navigator.sendBeacon('/rum', JSON.stringify({ name: 'LCP', value: m.value })));
  onINP((m) => navigator.sendBeacon('/rum', JSON.stringify({ name: 'INP', value: m.value })));
  onCLS((m) => navigator.sendBeacon('/rum', JSON.stringify({ name: 'CLS', value: m.value })));
</script>
```

## The bundled scanner

`examples/scan.mjs` measures the basics for a list of URLs and prints a table:

```bash
node examples/scan.mjs https://your.app/ https://your.app/api/search
```

It records status, TTFB, total time, bytes, Cache-Control and Server-Timing. Use it for a quick
before/after; for depth use Lighthouse/WebPageTest/RUM.

## Baseline table (record it)

| Metric | Current | Target | Source |
|--------|---------|--------|--------|
| LCP (p75 mobile) | | ≤2.5s | CrUX / RUM |
| INP (p75) | | ≤200ms | RUM |
| CLS (p75) | | ≤0.1 | RUM |
| TTFB (p75) | | ≤800ms | RUM / curl |
| /api/<hot> p95 | | ≤200ms | APM / k6 |
| JS transferred | | budget | DevTools |

Use **field** data (RUM/CrUX) for impact and **lab** data (Lighthouse) for diagnosis. The same metric
must be the one you re-check after shipping.
