# Platform Speed Optimizer

Your app is slow and you're not entirely sure why. You don't want to rewrite it. You just want it faster.

This is an AI agent skill that does the digging for you. Point your agent at your project and it will
scan the whole platform, measure a real baseline, and hand you a ranked list of bottlenecks — each
with the evidence behind it and an honest estimate of how many milliseconds it will save. Then it fixes
the safe wins behind feature flags, with tests, benchmarks and a rollback.

It isn't tied to any stack. Laravel, Next.js, Rails, Django, Go, a static site — it finds the bottleneck
by measuring your app, not by assuming a framework is the problem.

You can read the full instructions in [`SKILL.md`](./SKILL.md).

---

## Use it

Copy this into Claude Code, Cursor, Codex, OpenCode, or whichever agent you use:

```
Pull the platform-speed-optimizer skill from
https://github.com/davepartner/platform-speed-optimizer, read SKILL.md, and speed up this project.

Start by scanning the platform and writing a Platform Map: stack, pages, APIs, database, assets,
hosting, third-party scripts, background jobs, and uploads.

Then measure a real baseline — Core Web Vitals, TTFB, the p50/p95/p99 of our hottest APIs, and the
slowest database queries. Don't guess; show me the numbers.

Then give me the ranked list of bottlenecks. For each one: the evidence, the fix, a predicted saving in
milliseconds as a range with a confidence level, the effort, and the risk. Rank them by what's worth
doing first.

Wait for me to approve before you change any code. When I approve, implement the safe wins behind
feature flags with contract tests, before/after benchmarks, and a one-line rollback. Do not change any
API response shapes and do not change the UI.
```

That's it. The skill handles the rest.

---

## What it does

It runs the same loop a good performance engineer runs:

1. **Scan** — map the stack, pages, endpoints, database, build, hosting, SDKs, queues and uploads.
2. **Measure** — get a baseline before touching anything. No number, no optimization.
3. **Diagnose** — find where the time actually goes.
4. **Estimate** — predict the saving as a range, with a stated basis and a confidence level.
5. **Prioritize** — put the cheap, high-confidence wins first and push risky rewrites down.
6. **Report** — the ranked audit, with evidence and a way to verify each item.
7. **Implement** — the safe wins, behind flags, with tests and benchmarks.
8. **Verify** — re-measure, confirm the gain, and confirm nothing broke.

## What it looks for

- **Page load** — the LCP image, render-blocking JS and CSS, fonts, bundles, long tasks that hurt INP,
  layout shift, caching, compression, CDN and HTTP/2–3.
- **APIs** — N+1 queries, missing endpoints, missing caching, fat payloads, no pagination, slow
  external calls sitting in the request path.
- **Database** — missing indexes, queries that can't use an index, `SELECT *`, deep `OFFSET`
  pagination, connection pooling.
- **Background work and uploads** — cron-only processing that silently fails, no retries or dead-letter
  queue, video transcoded on the request, no fallback when processing fails.
- **Page reloads** — forms and filters that refresh the whole page when they shouldn't, with a
  progressive-enhancement path so nothing breaks without JS.
- **Frameworks and SDKs** — when a framework swap is genuinely worth it, and when it's just fashion.

## Why you can trust it not to break things

Speed work is risky precisely because it touches everything. The skill treats that as the main
constraint:

- It never changes existing API response shapes. Keys, types, status codes and pagination stay put, and
  contract tests prove it before and after.
- Risky changes ship behind a feature flag and roll out gradually, with a one-line rollback.
- The UI stays the same. If a visual change is intended, it's A/B tested and respects reduced motion.
- The no-JS path still works.
- Caches never get user-specific data, and always have an invalidation story.
- Old bugs the scan turns up get fixed separately, with their own tests.

## Honest by design

Performance estimates are easy to fake. This skill makes them traceable instead:

- Predictions are ranges, with a confidence level and a stated basis (bytes removed, requests removed,
  cache hit rate, query plan).
- Page-load and responsiveness predictions use the real decompositions: LCP is TTFB plus resource load
  delay plus load time plus render delay; INP is input delay plus processing plus presentation.
- Gains on the same metric are combined with a max, not a sum.
- If it can't estimate something confidently, it says "needs measurement" instead of inventing a number.

## The tools it ships with

Everything is plain Node, no runtime dependencies:

- `examples/scan.mjs` — measure TTFB, total time, bytes and cache headers for a list of URLs.
- `examples/estimate.mjs` — the estimation model, LCP/INP decomposition, and the priority score.
- `examples/report.mjs` — turn findings into the ranked markdown report.
- `examples/queue.mjs` — a reference job queue with retries, backoff, dead-letter and idempotency, for
  the async and upload patterns.
- `examples/contract.mjs` — snapshot and assert JSON response shapes so you don't break clients.
- `examples/lighthouserc.json` and `examples/k6-thresholds.js` — performance budgets for CI.

## Run the tests

```bash
npm test           # 33 tests
node scripts/lint.mjs   # frontmatter + link check
```

## What it won't do

- It won't rewrite your app because a framework is trendy. It optimizes the current stack first.
- It won't claim a saving it can't back up.
- It won't cover native mobile app performance (startup, jank, memory) — that's a separate lens.
- It won't promise a number without measuring first.

## License

MIT — see [LICENSE](./LICENSE).

---

## Search index — keywords

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
k6, load testing, observability, APM, contract testing, feature flag, canary, rollback.

AI agent skill, Claude Code skill, Claude skill, Cursor rules, AI coding rules, agent prompt, system
prompt, LLM rules, agentic development, developer skill, engineering skill, performance engineer,
platform engineer.
