# Async work & uploads — reliability first

Background work is where "speed" silently becomes "data loss". Get reliability right.

## Why cron alone is risky

- **Cron can be silently missed** — the process may not be installed, the server may be down, the
  admin may forget to enable it, or the platform scheduler may drift.
- **Platform crons often don't retry.** Some (e.g. Vercel) explicitly do **not** retry a failed
  invocation and are best-effort; a run can be missed or fire twice.
- A cron is a **trigger**, not a durable queue. It doesn't give you retries, backpressure, or a DLQ.

See `references/queue` patterns below before relying on cron for anything user-critical.

## Reliable background processing

- **Durable queue** (Redis/BullMQ, SQS, RabbitMQ, database-backed jobs, Temporal/Inngest/Trigger.dev)
  rather than cron-only.
- **At-least-once delivery ⇒ idempotent handlers.** Running a job twice must not double-charge or
  double-send. Use idempotency keys / "already done?" checks.
- **Exponential backoff + jitter**; **retry caps**; **dead-letter queue (DLQ)** for poison jobs; alert on
  DLQ growth.
- **Hybrid is normal:** a scheduler creates work, a queue executes it, workers scale independently.
- **Monitor** queue lag, failure rate, and DLQ size. A queue without monitoring is a silent outage.

## Uploads (images & video)

- **Don't process uploads inline** in the request. Accept the file, return fast, process async.
- **Direct-to-storage uploads:** client uploads via a **presigned URL** to object storage (S3/GCS/
  Cloudinary etc.) — offloads the app server and avoids large request bodies/timeouts.
- **Resumable / chunked uploads** for large video; set size limits; validate type.
- **Client-side optimization:** compress/resize images and pick modern formats before upload when
  possible; still validate server-side.
- **Server-side (async, queued):** image resize/convert, **video transcoding** (often via a queue or a
  managed service) → emit a webhook/event when done; store variants; serve via **CDN + signed URLs**.
- **Fallback if processing fails:** keep and serve the **original** file; retry the job; surface a clear
  status to the user. Never leave an upload in limbo because a cron didn't run.
- **Idempotent processing** — a retried transcode must not create duplicate variants or double-charge.

## The cron caveat in practice

Because an admin can forget to enable a cron and it can fail silently:
- Prefer a **job queue** for user-triggered uploads/transcodes (enqueued on upload — no cron needed).
- If you must use cron for reconciliation, make it **idempotent**, and add a **health check + alert** if
  it hasn't run (see the health-check pattern: a `last_run_at` heartbeat).
- Design for **at-least-once**: the client can poll a status endpoint, and the system self-heals on retry.

## Anti-patterns

- Resizing video/images synchronously on upload (slow requests, timeouts).
- Cron-only processing of user uploads with no retry/DLQ.
- Serving large media from the app server instead of a CDN.
- No fallback when transcoding fails; no progress/status for the user.
