# Frontend — page load & Core Web Vitals

Targets: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1** (p75). TTFB is the floor of LCP — fix the server too.

## The two decompositions (use these to *predict*)

To predict page-load and responsiveness gains, decompose them (see `references/estimation.md`):

- **LCP** = `TTFB` + `resource load delay` + `resource load time` + `render delay`.
  Fix the biggest phase first; estimate each or mark "needs measurement."
- **INP** = `input delay` + `processing` + `presentation`.
  Usually dominated by main-thread JS; measure with a throttled DevTools run.

## LCP (loading)

- **Server first:** reduce TTFB (caching, CDN, SSR/SSG). TTFB 800ms ⇒ LCP floor 800ms.
- **LCP image:** serve **AVIF/WebP**, correct size via `srcset`, `fetchpriority="high"` on the hero,
  **do not lazy-load the LCP element**, and **preload** it.
- **Preconnect** to critical origins; remove render-blocking JS/CSS from the critical path.
- **Inline critical CSS**, defer the rest; avoid `@import` in CSS.

## INP (responsiveness)

- **Break long tasks** (<50ms chunks), yield to the main thread, defer non-critical JS.
- **Cut third-party JS** (chat widgets, tag managers) — load on interaction or defer.
- Split bundles, tree-shake, remove unused polyfills; virtualize long lists.
- Keep handlers small; debounce expensive work; avoid layout thrash.
- Show **immediate visual feedback** even when work continues.

## CLS (stability)

- Set explicit `width`/`height` (or aspect-ratio) on images/video/iframes/ads.
- Reserve space for fonts (`font-display: swap` + preload the WOFF2); avoid injecting banners above
  content; animate only `transform`/`opacity`.

## Images & fonts

- Next-gen formats, responsive `srcset`/`sizes`, lazy-load **below the fold only**, CDN delivery.
- Self-host fonts, **WOFF2**, subset, `font-display: swap`, preload the one used above the fold.

## Caching, compression, protocol, CDN

- **Cache-Control** with **content-hashed** filenames (`max-age=31536000, immutable`) for static assets;
  short/revalidate for HTML.
- **Brotli** (or gzip) compression.
- **HTTP/2/3** + CDN/edge for static and cacheable HTML.
- **Service worker** only if it adds real value and is safely versioned.

## JS/CSS delivery

- Code-split by route; load only what the page needs.
- `defer`/`async` non-critical scripts; avoid synchronous third-party tags.
- Purge unused CSS; keep a performance budget (e.g., JS < 200KB gz per route).

## Anti-patterns

- Giant single bundle; sync analytics/chat in `<head>`; lazy-loading the hero image; unknown
  image dimensions; render-blocking CSS; no compression; no CDN; font swap causing reflow with no
  preload.
