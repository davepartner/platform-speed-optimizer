# Security ⇄ performance guardrails

Speed work must not open security holes. Caching and compression are the usual culprits.

## Caching

- **Never cache private/user-specific responses in a shared cache.** Use `Cache-Control: private,
  no-store` for authenticated pages; vary appropriately.
- **Cache poisoning:** don't cache responses that depend on unkeyed input (headers, query params) in a
  shared cache. Normalize and include a `Vary` where needed.
- **Cookies:** CDNs generally don't cache responses with `Set-Cookie`; design cacheable endpoints to be
  cookie-free.
- **Invalidation is part of correctness:** a stale cache serving wrong data is a bug, not a speed win.

## Compression

- **BREACH:** compressing responses that mix secrets with attacker-controlled input can leak secrets.
  Disable compression (or isolate) for such responses.
- Don't compress already-compressed media; compress text (HTML/JS/CSS/JSON) with Brotli/gzip.

## CDN / third parties

- **CORS** configured correctly; don't widen it for caching.
- **Signed URLs** for private media; short TTLs.
- **Third-party tags** (analytics, chat, ads): get **consent**, load lazily, and audit their bytes — they
  are a common performance *and* privacy cost.

## Never trade security for speed

- Don't disable TLS, weaken auth, remove CSRF, or bypass rate limits to "go faster."
- Don't add a public cache in front of admin/authenticated endpoints.

## Checklist

- [ ] Private responses are `private/no-store`; shared caches never see them.
- [ ] Cache keys account for all input that changes the response.
- [ ] No secret+attacker data in compressed responses.
- [ ] Third-party tags are consent-gated and lazy-loaded.
- [ ] No security control was weakened for a perf win.
