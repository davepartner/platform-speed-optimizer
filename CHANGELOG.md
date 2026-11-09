# Changelog

## [1.0.0] — 2026-11-09
- Initial release: platform- and language-agnostic speed optimization skill.
  - Pipeline: Scan → Measure → Diagnose → Estimate → Prioritize → Report → Implement → Verify.
  - References for frontend (Core Web Vitals), API, database, async/uploads (cron caveat), navigation/
    forms, frameworks, estimation, safety, and the report template.
  - Safety contract: no API shape changes, flags, tests, benchmarks, rollback, UX preserved.
  - Honest estimation calculator (`examples/estimate.mjs`) + tests; sample audit report.
  - CI runs the tests on every push.
