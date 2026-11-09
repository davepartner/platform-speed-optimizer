// Reference job queue: retries with exponential backoff + jitter, dead-letter queue,
// idempotency keys, and a health/heartbeat check. Reliability patterns for
// references/job-queue.md and references/async-uploads.md.
// Zero deps. Illustrative — swap the in-memory maps for your DB/queue.

let seq = 0;
const makeId = () => `job_${++seq}_${Math.random().toString(36).slice(2, 8)}`;

export class JobQueue {
  constructor({
    maxAttempts = 3,
    baseDelayMs = 1000,
    maxDelayMs = 60_000,
    now = () => Date.now(),
    jitter = () => 0.5, // 0..1
  } = {}) {
    this.jobs = new Map();
    this.dlq = [];
    this.doneKeys = new Set();
    this.lastRunAt = null;
    Object.assign(this, { maxAttempts, baseDelayMs, maxDelayMs, now, jitter });
  }

  enqueue({ type, payload = {}, idempotencyKey = null, delayMs = 0 }) {
    if (idempotencyKey && this.doneKeys.has(idempotencyKey)) return null; // already processed
    const job = {
      id: makeId(),
      type,
      payload,
      idempotencyKey,
      attempts: 0,
      status: 'queued',
      runAt: this.now() + Math.max(0, delayMs),
      error: null,
    };
    this.jobs.set(job.id, job);
    return job;
  }

  dueJobs(now = this.now()) {
    return [...this.jobs.values()].filter((j) => j.status === 'queued' && j.runAt <= now);
  }

  claim(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'queued') return false;
    job.status = 'running';
    return true;
  }

  complete(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.status = 'done';
    if (job.idempotencyKey) this.doneKeys.add(job.idempotencyKey);
  }

  fail(jobId, error) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.attempts += 1;
    job.error = String(error);
    if (job.attempts >= this.maxAttempts) {
      job.status = 'dead';
      this.dlq.push(job);
      return;
    }
    const backoff = Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** (job.attempts - 1));
    const jitterMs = Math.floor(backoff * 0.5 * Math.max(0, Math.min(1, this.jitter())));
    job.status = 'queued';
    job.runAt = this.now() + backoff + jitterMs;
  }

  /** Run all due jobs with `handler`; returns a small report. */
  async process(handler, { now = this.now() } = {}) {
    const report = { done: 0, retried: 0, dead: 0 };
    for (const job of this.dueJobs(now)) {
      if (!this.claim(job.id)) continue;
      try {
        await handler(job);
        this.complete(job.id);
        report.done += 1;
      } catch (err) {
        this.fail(job.id, err);
        if (job.status === 'dead') report.dead += 1;
        else report.retried += 1;
      }
    }
    this.lastRunAt = this.now();
    return report;
  }

  /** Health check: is the worker stale? how deep is the queue? any DLQ? */
  health({ staleAfterMs = 5 * 60 * 1000, now = this.now() } = {}) {
    return {
      stale: this.lastRunAt == null || now - this.lastRunAt > staleAfterMs,
      lastRunAt: this.lastRunAt,
      queueDepth: this.dueJobs(now).length,
      dlq: this.dlq.length,
    };
  }
}
