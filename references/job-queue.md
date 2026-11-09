# Job queue pattern — reliable async work

A reference for `examples/queue.mjs` and the async/upload guidance.

## Why not cron alone

- Cron can be **silently missed** (not installed, server down, admin forgot, platform drift).
- Platform crons often **don't retry** and can fire twice.
- Cron has no backpressure, retry policy, or DLQ.

**Pattern:** a scheduler creates work; a **durable queue** executes it; workers scale independently.

## Job record

```
jobs
  id                uuid
  type              varchar
  payload           jsonb
  idempotency_key   varchar, unique (nullable)
  status            queued | running | done | dead
  attempts          int
  run_at            timestamp          -- next eligible run
  error             text
  created_at, updated_at
```

## Rules

- **At-least-once delivery ⇒ idempotent handlers.** Running twice must not double-charge/send.
  Use an `idempotency_key` and skip if already done.
- **Exponential backoff + jitter:** `delay = min(max, base × 2^(attempt-1)) + random jitter`.
- **Retry cap → dead-letter queue (DLQ).** Alert on DLQ growth; inspect poison jobs.
- **Claim atomically** (`SELECT … FOR UPDATE SKIP LOCKED` or equivalent) so two workers don't run one
  job.
- **Health:** track `last_run_at`; alert if the worker is stale (the cron caveat).

## Uploads with the queue

- Accept the file → return fast → enqueue a processing job (resize/transcode).
- Prefer **direct-to-storage** (presigned URL) so the app server isn't the bottleneck.
- Keep the **original** as a fallback; serve it if processing fails; retry the job.
- Idempotent transcode (don't create duplicate variants on retry).

## Reference implementation

`examples/queue.mjs` implements enqueue → claim → complete/fail, backoff + jitter, DLQ, idempotency
keys, and a `health()` check — with tests in `examples/queue.test.mjs`.

## Checklist

- [ ] Durable queue, not cron-only, for user-critical work.
- [ ] Idempotency key on handlers.
- [ ] Backoff + jitter + retry cap + DLQ.
- [ ] Atomic claim; stuck-job reaper.
- [ ] `last_run_at` health check + alert.
- [ ] Uploads: direct-to-storage, async processing, original fallback.
