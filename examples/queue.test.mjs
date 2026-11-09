import test from 'node:test';
import assert from 'node:assert/strict';
import { JobQueue } from './queue.mjs';

test('enqueue → process → done', async () => {
  const q = new JobQueue({ now: () => 1000, jitter: () => 0 });
  const job = q.enqueue({ type: 'resize', payload: { id: 1 } });
  const report = await q.process(async () => {});
  assert.equal(report.done, 1);
  assert.equal(q.jobs.get(job.id).status, 'done');
});

test('a failing job is retried with backoff (runAt in the future)', async () => {
  let now = 1000;
  const q = new JobQueue({ now: () => now, jitter: () => 0, baseDelayMs: 1000 });
  const job = q.enqueue({ type: 'transcode' });
  const report = await q.process(async () => { throw new Error('boom'); }, { now: 1000 });
  assert.equal(report.retried, 1);
  assert.equal(job.status, 'queued');
  assert.ok(job.runAt > 1000);
});

test('exceeding maxAttempts moves the job to the DLQ', async () => {
  let now = 1000;
  const q = new JobQueue({ now: () => now, jitter: () => 0, maxAttempts: 2, baseDelayMs: 10 });
  const job = q.enqueue({ type: 'x' });
  await q.process(async () => { throw new Error('1'); }, { now: 1000 });
  now = job.runAt + 1;
  await q.process(async () => { throw new Error('2'); }, { now });
  assert.equal(job.status, 'dead');
  assert.equal(q.dlq.length, 1);
});

test('idempotency key prevents duplicate work after completion', async () => {
  const q = new JobQueue({ now: () => 1000 });
  q.enqueue({ type: 'email', idempotencyKey: 'welcome:u1' });
  await q.process(async () => {});
  const dup = q.enqueue({ type: 'email', idempotencyKey: 'welcome:u1' });
  assert.equal(dup, null);
});

test('health reports stale when the worker has never run', () => {
  const q = new JobQueue({ now: () => 1000 });
  assert.equal(q.health().stale, true);
});

test('health clears stale after a run and reports queue depth', async () => {
  const q = new JobQueue({ now: () => 1000 });
  q.enqueue({ type: 'x', delayMs: 999999 });
  await q.process(async () => {});
  const h = q.health({ now: 1000 });
  assert.equal(h.stale, false);
  assert.equal(h.queueDepth, 0);
});
