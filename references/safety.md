# Safety — change speed without breaking things

The promise: **faster, with no broken APIs, no new bugs, no UI/UX regressions, and old bugs fixed
separately.**

> **Companion docs:** `references/contract-testing.md` (shape tests), `references/rollout.md` (flags,
> canary, budgets, rollback), `references/security-perf.md` (cache/compression guardrails).

## 1. Protect the API contract

- **Never change existing response shapes** (keys, types, status codes, pagination, error envelope).
- Additive changes only; if unavoidable, version and keep the old until clients migrate.
- Add **contract/snapshot tests** on every endpoint you touch; run before and after.

## 2. Test before you ship

- Unit + integration + critical **E2E** tests, plus **performance budgets** in CI where possible.
- For correctness-sensitive changes (caching, async, DB), add tests for the failure modes, not just the
  happy path.

## 3. Flag and roll out gradually

- Put risky changes behind a **feature flag**; canary → small % → full.
- Keep a **one-line rollback** (revert flag / redeploy previous build).
- Watch error rate, latency, and business metrics during rollout.

## 4. Preserve UI/UX

- No visual change unless explicitly requested; if intended, **A/B** it and respect
  `prefers-reduced-motion`.
- Keep keyboard/ARIA/focus behavior; don't regress accessibility for speed.

## 5. Cache correctly (a wrong cache is a bug)

- Never cache private/user-specific data in a shared cache.
- Define **invalidation** before adding a cache (TTL, tags, purge-on-write).
- Test cold/hot cache paths and stampede behavior (TTL jitter, single-flight).

## 6. Benchmark, don't vibe

- Record before/after on the same environment and load profile.
- A change is done when the metric moved **and** tests are green.

## 7. Fix old bugs separately

- If the scan surfaces a bug, file it and fix it with its own test — don't smuggle it into a performance
  PR (it muddies rollback and attribution).

## 8. Observability

- Ensure you can see the impact: RUM, APM, DB metrics, queue lag, error tracking.
- Add alerts for the metrics you're trying to improve.

## Checklist

- [ ] Baseline recorded (field + lab + server).
- [ ] Contract tests added and green; response shapes unchanged.
- [ ] Tests cover the failure modes (cache miss/stampede, job retry, timeout).
- [ ] Feature flag + gradual rollout + rollback documented.
- [ ] UI/UX unchanged (or intentionally A/B'd); accessibility preserved.
- [ ] Cache invalidation defined; no private data shared.
- [ ] Benchmark before/after recorded under realistic load.
- [ ] Old bugs filed separately.
- [ ] Monitoring/alerts in place for the target metric.
