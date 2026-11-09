# Backend / API — latency

Target: set a **p95/p99 latency budget per endpoint** and hold it. Measure, don't guess.

## Measure

- p50/p95/p99 per endpoint under realistic load (k6/Artillery/Locust).
- Trace the request: network → app → DB → external calls → serialization.
- APM/profiling (OpenTelemetry, Blackfire, XHProf, Scout) to find the hot path.

## Common wins (in rough order of impact)

1. **Eliminate N+1** — eager-load relations, batch with `WHERE id IN (...)`, or aggregate in SQL.
2. **Add the missing index** (see `database.md`) — often the single biggest win.
3. **Cache** — HTTP (`ETag`, `Cache-Control`, `304`) and app-level (Redis cache-aside).
   Use **per-key TTL + jitter** to avoid stampedes; define **invalidation** (tags/keys).
4. **Offload slow work** to a queue (emails, exports, media, third-party calls).
5. **Trim payloads** — paginate, field-select, avoid over-fetching, compress (gzip/br).
6. **Connection pooling** and **read replicas** for read-heavy traffic.
7. **Batch/bulk endpoints** instead of chatty per-item calls.
8. **Avoid synchronous external calls** in the request path (timeouts, circuit breakers, cache).
9. **HTTP/2 / keep-alive**, CDN/edge cache for cacheable `GET`s.
10. **Keyset (cursor) pagination** instead of large `OFFSET`.

## Caching rules (correctness first)

- **Never** cache user-specific/private data in a shared cache without a private key.
- Define **invalidation** before adding a cache — a wrong cache is a bug.
- Cache **read-heavy, slow, stable** data; don't cache cheap queries.
- Add hit-ratio metrics; a cache with 10% hit rate is overhead.

## Contract safety (do not break clients)

- **Never change response shapes** to "optimize." Additive fields only; keep existing keys/types.
- If you must version, add a new version and keep the old until clients migrate.
- Add **contract tests** on every endpoint you touch (snapshot the shape; assert unchanged).
- Preserve status codes, pagination semantics, and error envelopes.

## Anti-patterns

- `SELECT *` returning huge rows; returning the whole object graph on list endpoints; chatty APIs; no
  compression; cache without invalidation; blocking on a third-party API per request; retries without
  backoff.
