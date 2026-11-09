# Platform Speed Optimizer — AI Agent Skill

> **Ask your AI agent to scan and speed up your platform — without breaking APIs, UX, or creating bugs.**
> It scans the whole app, lists every bottleneck with **predicted millisecond savings**, then fixes the
> safe wins behind flags, with benchmarks and rollback.

**Copy this prompt into your AI agent:**

```
Use the platform-speed-optimizer skill to audit and speed up this platform. Scan it first, measure the
baseline (Core Web Vitals, API p95, DB queries), then list every bottleneck with evidence, a fix,
predicted ms savings (range + confidence), effort and risk. Then implement the safe wins behind flags,
with tests, benchmarks and a rollback — without changing API response shapes or the UI/UX.
```

---

## What it does

A **platform- and language-agnostic** performance audit + safe-fix skill. It works the same for
Laravel, Node/Next, Rails, Django, Go, Java, SPAs, and static sites — it finds bottlenecks by
**measuring**, not by guessing a framework.

```
Scan ─▶ Measure ─▶ Diagnose ─▶ Estimate ─▶ Prioritize ─▶ Report ─▶ Implement ─▶ Verify
```

| Phase | Output |
|-------|--------|
| **Scan** | a Platform Map (stack, pages, APIs, DB, assets, infra, SDKs, queues, uploads) |
| **Measure** | baseline: Core Web Vitals, TTFB, API p50/p95/p99, DB, queue lag |
| **Diagnose** | bottlenecks by area (frontend, API, DB, async, navigation, frameworks) |
| **Estimate** | predicted **ms savings** as a range + confidence + basis |
| **Prioritize** | impact × effort × risk (quick wins vs needs-care) |
| **Report** | the ranked audit (the deliverable) |
| **Implement** | safe wins behind flags, with tests + benchmarks + rollback |
| **Verify** | re-measure; confirm the gain and no regressions |

---

## What it finds

- **Page load** — LCP image, render-blocking JS/CSS, fonts, bundles, INP long tasks, CLS, caching,
  compression, CDN/HTTP-2-3.
- **API** — N+1, missing indexes, no cache, payload bloat, no pagination, sync external calls.
- **Database** — missing/incorrect indexes, non-sargable queries, N+1, offset pagination, pooling.
- **Async & uploads** — cron-only processing that silently fails, no retries/DLQ, uploads through the
  app server, video transcoding.
- **Navigation & forms** — full-page reloads that should be fetch/partial updates (progressive
  enhancement).
- **Frameworks/SDKs** — heavy client JS; when a framework swap is — and isn't — worth it.

---

## Safety contract (non-negotiable)

1. **Never change API response shapes** — additive only; contract tests before/after.
2. **Measure first, measure after** — no "feels faster."
3. **Feature-flag + gradual rollout + rollback.**
4. **Preserve UI/UX** (A/B any intended visual change; respect reduced motion).
5. **Progressive enhancement** — the no-JS path still works.
6. **Cache correctly** — never share private data; always define invalidation.
7. **Fix old bugs separately** — with their own tests.

---

## Honest estimation

Predicted gains are **ranges with confidence and a basis** (bytes removed, requests removed, cache
hit-rate, EXPLAIN, TTFB). The calculator (`examples/estimate.mjs`) does bytes→ms, cache blending, and
ranges. No false precision — anything uncertain is marked "needs measurement."

**Standards followed:** Core Web Vitals at p75 — **LCP ≤2.5s · INP ≤200ms · CLS ≤0.1**; TTFB as the LCP
floor; per-endpoint **p95/p99 latency budgets**; **at-least-once** jobs → idempotency + backoff + DLQ
(cron alone doesn't retry); progressive-enhancement navigation.

---

## Structure

```
SKILL.md                              # the skill: pipeline, safety contract, taxonomy
references/
├── scan.md                           # the Platform Map
├── metrics.md                        # metrics, thresholds, tools
├── frontend.md                       # page load / Core Web Vitals
├── backend-api.md                    # API latency, caching, payloads
├── database.md                       # indexes, EXPLAIN, N+1, pooling
├── async-uploads.md                  # queues vs cron, uploads, transcoding
├── navigation-forms.md               # avoid reloads (progressive enhancement)
├── frameworks.md                     # when (not) to swap frameworks
├── estimation.md                     # honest predicted savings
├── safety.md                         # non-disruption + verification checklist
└── report-template.md                # the audit report format
examples/
├── audit-report.md                   # a filled sample audit
├── estimate.mjs                      # estimation calculator
└── estimate.test.mjs                 # tests
.github/workflows/test.yml            # CI
package.json                          # `npm test`
```

Run the tests with `npm test` (or `node --test examples/*.test.mjs`). CI runs them on every push.

---

## Pull it & start using

Copy this prompt into your agent (Claude Code, Codex, Cursor, OpenCode, …):

```
Pull the platform-speed-optimizer skill from
https://github.com/davepartner/platform-speed-optimizer (pin it by tag or commit), read SKILL.md, and
speed up this platform:

1. SCAN it and produce a Platform Map (stack, pages, APIs, DB, assets, infra, SDKs, queues, uploads).
2. MEASURE the baseline (Core Web Vitals, TTFB, API p50/p95/p99, DB, queue lag). Show me the numbers.
3. DIAGNOSE every bottleneck with evidence (waterfall/EXPLAIN/p95), a fix, predicted ms savings (range +
   confidence), effort, and risk.
4. PRIORITIZE and show me the report + the safe quick wins. WAIT for my approval before changing code.
5. IMPLEMENT the approved wins behind flags, with contract tests, benchmarks and a rollback — without
   changing API response shapes or the UI/UX.
6. VERIFY with a before/after table and confirm no regressions.
```

---

## Strengths & limitations

**Strengths**
- **Measured, not guessed** — every item carries evidence + predicted range + confidence.
- **Platform/language-agnostic** — finds the bottleneck regardless of stack.
- **Safe by contract** — APIs/UX preserved, flags, tests, rollback, old bugs separated.
- **Covers the whole stack** — frontend, API, DB, async/uploads (with the cron caveat), navigation.
- **Honest about frameworks** — optimize first; swap only with data.

**Limitations**
- **Needs instrumentation** — without RUM/APM/logs, baselines are lab-only and estimates are lower
  confidence.
- **Predictions are ranges** — networks/devices/caches vary; verify after shipping.
- **No silver bullet** — a rewrite of a genuinely slow architecture may be needed; the skill will say so
  rather than hide it.
- **Third-party/black-box** — you can't optimize a vendor's server; you can only defer/cache around it.

## Versioning

Pin by commit hash or tag. See `CHANGELOG.md`.

## License

MIT — see [LICENSE](./LICENSE).

---

## Search index — keywords

*Findable by AI agents and humans searching for performance audits and optimization:*

Look for `SKILL.md` in the repo; the skill `name` and `description` are the trigger.

Performance audit, speed optimization, make it faster, speed up app, platform performance, Core Web
Vitals, LCP, INP, CLS, TTFB, page load speed, web performance, frontend performance, backend
performance, API latency, p95, p99, reduce latency, slow API, N+1 query, database index, missing index,
query optimization, EXPLAIN, caching, cache invalidation, HTTP caching, ETag, CDN, edge caching,
compression, Brotli, HTTP/3, image optimization, AVIF, WebP, responsive images, lazy loading, font
optimization, code splitting, tree shaking, bundle size, render blocking, INP long tasks, layout shift,
framework migration, framework rewrite, SDK optimization, third party scripts, background jobs, job
queue, cron reliability, retries, dead letter queue, idempotency, async processing, image upload,
video upload, transcoding, presigned URL, resumable upload, progressive enhancement, view transitions,
AJAX form, partial page update, avoid page reload, performance budget, RUM, Lighthouse, WebPageTest,
k6, load testing, observability, APM.

AI agent skill, Claude Code skill, Claude skill, Cursor rules, AI coding rules, agent prompt, system
prompt, LLM rules, agentic development, developer skill, engineering skill, performance engineer,
platform engineer.
