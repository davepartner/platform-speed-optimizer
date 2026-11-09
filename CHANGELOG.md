# Changelog

## [1.1.0] — 2026-11-09

Executed the improvement plan from the review.

### Tooling (now real, tested — 33 tests)
- **Rewrite `examples/estimate.mjs`**: RTT-aware transfer model, LCP/INP decomposition, cache blend,
  `combineOverlapping` (no naive summing), `rangeFor` from confidence, and a tested `prioritize()`.
- **`examples/scan.mjs`**: measures TTFB/total/bytes/headers for URLs (tests use a local server).
- **`examples/report.mjs`**: renders the ranked audit markdown from findings.
- **`examples/queue.mjs`**: reference job queue (retry + jitter, DLQ, idempotency, health).
- **`examples/contract.mjs`**: snapshot/assert JSON response shapes (no API breakage).
- **CI budgets**: `examples/lighthouserc.json`, `examples/k6-thresholds.js`.
- **`scripts/lint.mjs`**: frontmatter + internal-link lint; CI now runs `test` + `lint`.

### Docs
- New: `references/measurement.md` (bootstrap measurement), `infra-network.md` (server/network/
  serverless cold starts), `security-perf.md` (cache/compression guardrails), `contract-testing.md`,
  `rollout.md` (flags/canary/budgets/rollback), `job-queue.md`.
- Updated: `estimation.md` (new model), `frontend.md` (LCP/INP decomposition), `scan.md` (scope + tools),
  `frameworks.md` (runtime config first), `safety.md` (companion docs), `report-template.md`
  (metric/source/verify + priority score).
- **README rewritten** in a direct, human voice with a copy-paste prompt.
- Scope stated: web frontend + API + backend/data + infra; native mobile is a separate lens.

## [1.0.0] — 2026-11-09
- Initial release.
