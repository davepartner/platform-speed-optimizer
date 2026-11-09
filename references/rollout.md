# Rollout & rollback — ship speed safely

A speed change isn't done when it's merged; it's done when it's verified in production without
regressions.

## Feature flags

- Put risky changes behind a flag (caching, async, navigation, DB writes).
- Default **off** in production until canaried.

## Canary → gradual

1. **1–5%** of traffic → watch error rate, latency, business metric.
2. **25% → 50% → 100%** if healthy.
3. Keep the old path available for instant rollback.

## Stop conditions (revert if any trip)

- Error rate up beyond a threshold; p95 latency worse; the target metric (LCP/INP/p95) didn't improve.
- Business metric regression (conversion, signups) beyond noise.
- Any contract test failure or new Sentry error class.

## Rollback

- Flip the flag off, or redeploy the previous build.
- Document the one-line rollback for each change in the report.
- Verify rollback restores the baseline metric.

## Performance budgets in CI

- **Lighthouse CI** — `.lighthouserc.json` (example in `examples/lighthouserc.json`): assert performance
  score, LCP, CLS on every PR.
- **k6** — `examples/k6-thresholds.js`: p95/p99 latency + error rate thresholds under load.
- Fail the build on budget regressions; treat them like test failures.

## Verification table (fill after shipping)

| Metric | Before | After | Delta | Predicted? |
|--------|--------|-------|-------|------------|
| | | | | |

If the predicted gain didn't materialise, investigate — don't quietly drop it.

## Checklist

- [ ] Flag + canary plan documented.
- [ ] Stop conditions + rollback written.
- [ ] Budgets (Lighthouse/k6) in CI.
- [ ] Before/after recorded; rollback tested.
