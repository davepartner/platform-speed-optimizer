# Report Template — the speed audit deliverable

This is the artifact the agent produces. Keep it decision-ready: a busy engineer should see the top
wins in 30 seconds.

---

# Speed Audit — <platform> — <date>

## 1. Executive summary

- **Top 5 wins** (with predicted ms) and **total predicted gain**.
- **Biggest risk / what not to touch**.
- **Baseline vs target** for Core Web Vitals + key endpoints.

## 2. Platform map

Paste the Platform Map from `references/scan.md`.

## 3. Baseline metrics

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| LCP (p75, mobile) | | ≤2.5s | |
| INP (p75) | | ≤200ms | |
| CLS (p75) | | ≤0.1 | |
| TTFB (p75) | | ≤800ms | |
| /api/<hot> p95 | | ≤200ms | |
| JS transferred | | budget | |

## 4. Bottleneck register (ranked)

| ID | Area | Finding (evidence) | Fix | Predicted gain | Confidence | Effort | Risk |
|----|------|--------------------|-----|----------------|------------|--------|------|
| B1 | frontend | LCP image 1.2MB, lazy-loaded (evidence: waterfall) | AVIF + preload + fetchpriority | ≈0.8s (0.6–1.0s) | medium | S | low |
| B2 | api | /api/search p95 1.4s, seq scan (EXPLAIN) | composite index + 60s cache | ≈1.2s (1.0–1.3s) | high | S | low |
| B3 | async | image resize inline on upload (400–2000ms requests) | presigned upload + queue | ≈1.5s/request | high | M | med |
| B4 | nav | filters do full reload | fetch + partial update (progressive) | ≈0.4s/interaction | medium | M | med |

Sort by predicted gain ÷ effort. Separate **safe quick wins** from **needs-care**.

## 5. Detail per item

For each:
- **Evidence** — metric/lab/EXPLAIN/waterfall.
- **Exact change** — files/endpoints/config; what stays the same (API shape).
- **Predicted gain** — number + range + confidence + basis.
- **Risk & mitigation** — flag, canary, rollback.
- **Verification** — the metric + test that proves it.

## 6. What we deliberately won't change

Items considered and rejected (framework swap, etc.) with the reason (cost/risk > measured gain).

## 7. Safety & rollout plan

`references/safety.md` checklist + rollout order + rollback.

## 8. Verification (fill after shipping)

| Metric | Before | After | Delta | Predicted? |
|--------|--------|-------|-------|------------|
| | | | | |

---

## Quality bar

- Every item has **evidence**, a **fix**, a **predicted ms range with confidence**, and a
  **verification** method.
- No item claims precision it can't back up.
- API contracts explicitly preserved.
- Quick wins clearly separated from risky rewrites.
