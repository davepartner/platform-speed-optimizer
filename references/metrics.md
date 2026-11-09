# Metrics — measure before and after

**No optimization without a baseline.** Record every metric before a change and after; a change is only
"done" when the number moves and tests are green.

## Field vs lab vs server

- **Field (RUM / CrUX):** real users — use for **impact** and success.
- **Lab (Lighthouse / WebPageTest):** controlled — use for **diagnosis**.
- **Server/APM:** backend latency, DB, queue, errors.

Don't treat a lab score as the user's experience, and don't ship on lab numbers alone.

## Web — Core Web Vitals (measured at p75, 28-day rolling)

| Metric | Good | Needs improvement | Poor | Measures |
|--------|------|-------------------|------|----------|
| **LCP** | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s | loading — largest content element |
| **INP** | ≤ 200 ms | 200–500 ms | > 500 ms | responsiveness — worst interaction |
| **CLS** | ≤ 0.1 | 0.1–0.25 | > 0.25 | visual stability |

Also track: **TTFB** (the floor of LCP — if TTFB is 800ms, LCP can't beat 800ms), FCP, page weight,
request count, JS/CSS bytes, third-party bytes, image bytes, cache hit ratio.

## API / backend

- **p50 / p95 / p99** latency **per endpoint** — never averages alone.
- Throughput (RPS), error rate, timeout rate.
- DB query time, slow-query count, N+1 count.
- Cache hit ratio.
- **Queue lag** and failed-job count.
- Set **latency budgets** per endpoint (e.g., search p95 < 200ms; reporting p95 < 2s).

## Tools (examples, pick what you have)

- **Browser:** Lighthouse, PageSpeed Insights, WebPageTest, DevTools Performance/Network, `web-vitals`.
- **RUM:** CrUX, your analytics, Sentry Performance, Datadog RUM, SpeedCurve.
- **APM:** OpenTelemetry, New Relic, Datadog, Scout, Blackfire, XHProf.
- **DB:** `EXPLAIN ANALYZE`, slow-query log, provider insights.
- **Load:** k6, Artillery, Locust, JMeter — realistic patterns, bursts, concurrency.
- **Queue:** provider dashboards, queue depth, DLQ size.

## Baseline table (copy into the report)

```
| Metric              | Before | After | Delta | Notes                     |
|---------------------|--------|-------|-------|---------------------------|
| LCP (p75, mobile)   | 4.2 s  | 1.9 s | -2.3s | hero image + TTFB        |
| TTFB (p75)          | 820 ms | 210 ms| -610ms| edge cache               |
| /api/search p95     | 1.4 s  | 180 ms| -1.22s| index + cache            |
| JS transferred      | 900 KB | 320 KB| -580KB| code-splitting           |
```
