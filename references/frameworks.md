# Frameworks & SDKs — swap with evidence, not fashion

**Default: optimize the current stack.** A framework rewrite is the highest-risk, highest-cost "fix"
and rarely the fastest path to speed. Recommend it only with data.

## When to *consider* a swap

- **Heavy client JS** is the measurable cause of poor LCP/INP and can't be fixed by splitting (e.g.
  full CSR app that needs SSR/SSG).
- The current framework **blocks** the optimizations you need (no SSR, no code-splitting, no build).
- The ecosystem is **dead/unmaintained** and security/performance updates have stopped.
- **SEO** requires server rendering and the current stack can't provide it.
- Maintenance cost is dominated by the framework itself.

## Decide with a matrix

| Factor | Weight | Current stack | Candidate |
|--------|--------|---------------|-----------|
| Predicted p75 LCP/INP gain (measured) | high | | |
| Migration cost (routes/team/time) | high | | |
| Risk of regressions | high | | |
| Time-to-value | medium | | |
| Ecosystem/maintenance | medium | | |

If the candidate doesn't clearly win on **measured** gain vs cost/risk → **don't**.

## If you do migrate

- **Strangler pattern:** move route-by-route behind a reverse proxy; keep both running.
- **Partial hydration / islands** (Astro, Qwik, RSC) to ship less JS.
- Keep **API contracts stable** (this skill's safety contract).
- **Feature-flag** the new routes, A/B, measure field metrics, roll back per-route.
- Never "big-bang" a rewrite for speed.

## SDKs

- **Load third-party SDKs lazily** and only where needed (not in `<head>` on every page).
- Prefer **async/deferred** tags; self-host or proxy critical ones (with consent) to cut DNS/TLS.
- Audit third-party **bytes** in the network waterfall; drop what doesn't earn its weight.
- Watch for SDKs that block the main thread (chat widgets, tag managers, A/B tools).

## Anti-patterns

- "Rewrite in X because X is fast" with no measurement.
- Migrating the whole app to fix one slow page.
- Adding a heavy client framework to a content site that only needs HTML + a little JS.
