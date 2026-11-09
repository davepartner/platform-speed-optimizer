---
name: platform-speed-optimizer
description: >-
  Scan an entire platform and find its speed bottlenecks, then produce a measured, prioritized plan to
  fix them — without breaking APIs, UX, or creating bugs — with honest predicted millisecond savings
  for each change. Covers page load (Core Web Vitals), API latency, database, caching, SDKs/frameworks,
  async jobs & uploads (cron reliability), and removing unnecessary page reloads. Use when asked to make
  an app or website faster, improve Core Web Vitals, reduce API latency, or run a performance audit.
  Triggers: "make it faster", "speed up the app", "improve page load", "Core Web Vitals", "reduce
  latency", "optimize performance", "why is it slow", "performance audit", "speed bottleneck".
---

# Platform Speed Optimizer

Make any platform faster **without breaking it**. This skill scans the whole system, finds the real
bottlenecks, quantifies each one, and produces a **prioritized, measured plan** with predicted
millisecond savings — then implements the safe wins behind flags, with benchmarks and rollback.

It is **platform- and language-agnostic**: it works for PHP/Laravel, Node/Next, Rails, Django, Go,
Java, static sites, SPAs, and monoliths alike. Find the bottleneck by *measuring*, not by guessing a
framework.

**Scope:** web frontends + HTTP APIs + backend/data + infra/network (incl. serverless cold starts).
Mobile *native* app performance (startup, jank, memory) needs a separate lens.

> **Prime directive:** improve speed **without** changing API response shapes, breaking the UI/UX, or
> introducing bugs. Every change is measured before and after, behind a flag, and reversible.

---

## The pipeline

```
Scan ─▶ Measure ─▶ Diagnose ─▶ Estimate ─▶ Prioritize ─▶ Report ─▶ Implement ─▶ Verify
```

0. **Scan** the platform — stack, routes/pages, APIs, DB, assets, build, hosting/CDN, SDKs, queues/cron,
   uploads, caches. Output a **Platform Map** (`references/scan.md`).
1. **Measure** a baseline — field + lab metrics: Core Web Vitals, TTFB, page weight, API p50/p95/p99,
   DB query time, error rate, queue lag (`references/metrics.md`). **Never optimize unmeasured.**
2. **Diagnose** the bottlenecks by category (`references/frontend.md`, `backend-api.md`, `database.md`,
   `async-uploads.md`, `navigation-forms.md`, `frameworks.md`).
3. **Estimate** the savings honestly — ranges, not false precision (`references/estimation.md` +
   `examples/estimate.mjs`).
4. **Prioritize** by impact × effort × risk, separating "quick safe wins" from "needs care."
5. **Report** using `references/report-template.md` — every item with evidence, fix, predicted ms, risk,
   confidence, and how it will be verified.
6. **Implement** the safe wins under a feature flag, with tests + benchmarks + rollback
   (`references/safety.md`).
7. **Verify** — re-measure; confirm the predicted gain and **no regressions**. Update the report.

---

## Safety contract (non-negotiable)

1. **Never change API response shapes.** Additive/backward-compatible only. Run **contract tests** on
   every affected endpoint before and after.
2. **Measure first, measure after.** No "it feels faster." A change is done when the metric moves and
   the test suite is green.
3. **Feature-flag every risky change** and roll out gradually (canary → %). Keep a one-line rollback.
4. **Preserve UI/UX.** No visual change unless explicitly requested; if intended, A/B it and respect
   `prefers-reduced-motion`.
5. **Progressive enhancement** — a no-JS or old-browser path must still work for navigation/forms.
6. **Cache correctly.** Never cache user-specific/private data in a shared cache; always define
   invalidation. A wrong cache is a correctness bug, not a speed win.
7. **Fix old bugs separately** — if the scan finds a bug, fix it with its own test, not smuggled into a
   perf PR.

---

## Bottleneck taxonomy (what to look for)

| Area | Typical bottlenecks | Reference |
|------|---------------------|-----------|
| **Page load / frontend** | render-blocking JS/CSS, unoptimized LCP image, fonts, huge bundles, long tasks (INP), layout shift (CLS), no CDN/compression | `references/frontend.md` |
| **API** | slow/over-fetching responses, N+1 in the request path, no caching, stringly JSON bloat, sync external calls, no compression | `references/backend-api.md` |
| **Database** | missing indexes, non-sargable queries, N+1, `SELECT *`, offset pagination, no pooling | `references/database.md` |
| **Async / uploads** | cron-only processing that silently fails, no retries/DLQ, uploads through the app server, no transcoding/fallback | `references/async-uploads.md` |
| **Navigation / forms** | full-page reloads for every action, no fetch/partial update, no optimistic UI | `references/navigation-forms.md` |
| **Framework / SDK** | heavy client JS, dead ecosystem, SDKs loaded synchronously | `references/frameworks.md` |

---

## Estimating predicted improvements (honest)

- Express savings as a **range** with **confidence** (high/medium/low) and a **basis** (bytes saved,
  requests removed, cache hit-rate, p95 delta).
- Use the model in `examples/estimate.mjs`: RTT-aware transfer, **LCP/INP decomposition**, cache blend,
  and `combineOverlapping` (**never sum gains on the same metric**).
- Rank with `prioritize()` — `predictedMs × confidence × risk ÷ effort`.
- Prefer **field data (RUM/CrUX)** over lab (Lighthouse) for impact; use lab for diagnosis.
- Anything you can't estimate confidently → **"needs measurement,"** not a fake number.

## Tools (executable & tested)

- `examples/scan.mjs` — measure TTFB/total/bytes/headers for a list of URLs.
- `examples/estimate.mjs` — the estimation model (RTT transfer, LCP/INP decomposition, ranges,
  `combineOverlapping`, `prioritize`).
- `examples/report.mjs` — render the ranked audit markdown from your findings.
- `examples/queue.mjs` — reference job queue (backoff, DLQ, idempotency, health) for async/uploads.
- `examples/contract.mjs` — snapshot/assert JSON response shapes (no API breakage).
- `examples/lighthouserc.json` + `examples/k6-thresholds.js` — CI performance budgets.
- `npm test` runs the suite; `node scripts/lint.mjs` checks docs + frontmatter.

## Standards this skill follows

- **Core Web Vitals** (p75, 28-day): **LCP ≤ 2.5s**, **INP ≤ 200ms**, **CLS ≤ 0.1**; TTFB is the floor
  of LCP.
- **Latency budgets** per endpoint (p95/p99), measured under realistic load.
- **At-least-once** background delivery → **idempotent** handlers, exponential backoff + jitter,
  **dead-letter queue**, retry caps (cron alone does not retry and can be silently missed).
- **Progressive enhancement** for navigation/forms (the page still works without JS).

---

## References

- `references/scan.md` — the Platform Map: what to inventory and how.
- `references/measurement.md` — bootstrap measurement (even with no instrumentation) + tools.
- `references/metrics.md` — metrics, thresholds, and the tools to get them.
- `references/frontend.md` — page load, Core Web Vitals, LCP/INP decomposition, images, JS/CSS, CDN.
- `references/backend-api.md` — API latency, caching, payloads, pagination, compression, HTTP/2-3.
- `references/database.md` — indexes, EXPLAIN, N+1, pooling, pagination.
- `references/async-uploads.md` — queues vs cron, reliability, image/video uploads.
- `references/job-queue.md` — the queue/DLQ/idempotency pattern (with `examples/queue.mjs`).
- `references/navigation-forms.md` — avoid unnecessary reloads (progressive enhancement).
- `references/frameworks.md` — runtime config first; when a framework swap is (and isn't) worth it.
- `references/infra-network.md` — server, network, CDN/HTTP, serverless cold starts.
- `references/security-perf.md` — cache/compression/CDN security guardrails.
- `references/contract-testing.md` — shape-snapshot contract tests (with `examples/contract.mjs`).
- `references/rollout.md` — flags, canary, budgets, rollback, stop conditions.
- `references/estimation.md` — how to predict ms honestly.
- `references/safety.md` — the non-disruption + verification checklist.
- `references/report-template.md` — the audit report format (the main deliverable).
- `examples/audit-report.md` — a filled sample.
- `examples/report.mjs` — renders the ranked report (`renderReport`).
- Run `npm install && npm test` (33 tests) and `node scripts/lint.mjs`.
