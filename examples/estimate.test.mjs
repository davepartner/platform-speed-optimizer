import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bytesSavedMs,
  cacheExpectedMs,
  combineOverlapping,
  inpMs,
  lcpMs,
  prioritize,
  priorityOf,
  rangeFor,
  requestsSavedMs,
  sumIndependent,
  transferMs,
} from './estimate.mjs';

test('transferMs: 1 MB at 10 Mbps ≈ 800 ms (no RTT)', () => {
  assert.equal(Math.round(transferMs({ bytes: 1_000_000, bandwidthMbps: 10 })), 800);
});

test('transferMs adds RTT setup (DNS/TCP/TLS)', () => {
  assert.equal(transferMs({ bytes: 0, bandwidthMbps: 10, rttMs: 100, setupRtts: 3 }), 300);
});

test('transferMs rejects non-positive bandwidth', () => {
  assert.throws(() => transferMs({ bytes: 1000, bandwidthMbps: 0 }), /bandwidthMbps/);
});

test('bytesSavedMs converts removed bytes to ms', () => {
  const r = bytesSavedMs({ currentBytes: 500_000, optimizedBytes: 0, bandwidthMbps: 10 });
  assert.equal(r.bytesSaved, 500_000);
  assert.equal(Math.round(r.msSaved), 400);
});

test('bytesSavedMs never returns a negative saving', () => {
  const r = bytesSavedMs({ currentBytes: 100, optimizedBytes: 500, bandwidthMbps: 10 });
  assert.equal(r.bytesSaved, 0);
  assert.equal(r.msSaved, 0);
});

test('requestsSavedMs is an upper bound of RTTs removed', () => {
  assert.equal(requestsSavedMs({ requests: 5, rttMs: 100 }), 500);
});

test('lcpMs sums the four LCP phases', () => {
  assert.equal(
    lcpMs({ ttfbMs: 200, resourceLoadDelayMs: 100, resourceLoadMs: 800, renderDelayMs: 300 }),
    1400,
  );
});

test('inpMs sums input delay + processing + presentation', () => {
  assert.equal(inpMs({ inputDelayMs: 40, processingMs: 120, presentationMs: 20 }), 180);
});

test('cacheExpectedMs blends origin and cache by hit rate', () => {
  assert.equal(Math.round(cacheExpectedMs({ originMs: 800, cacheHitMs: 50, hitRate: 0.8 })), 200);
});

test('combineOverlapping takes the max (does NOT sum overlapping gains)', () => {
  assert.equal(combineOverlapping([{ msSaved: 100 }, { msSaved: 50 }]), 100);
});

test('sumIndependent sums independent gains', () => {
  assert.equal(sumIndependent([{ msSaved: 100 }, { msSaved: 50 }]), 150);
});

test('rangeFor widens with lower confidence', () => {
  assert.deepEqual(rangeFor(100, 'high'), { low: 90, high: 110 });
  assert.deepEqual(rangeFor(100, 'medium'), { low: 70, high: 130 });
  assert.deepEqual(rangeFor(100, 'low'), { low: 40, high: 160 });
});

test('priorityOf rewards speed + confidence, penalises effort + risk', () => {
  const quick = priorityOf({ predictedMs: 1000, confidence: 'high', effort: 'S', risk: 'low' });
  const heavy = priorityOf({ predictedMs: 1000, confidence: 'low', effort: 'L', risk: 'high' });
  assert.ok(quick > heavy);
});

test('prioritize sorts by score descending', () => {
  const ranked = prioritize([
    { id: 'slow', predictedMs: 100, confidence: 'low', effort: 'L', risk: 'high' },
    { id: 'quick', predictedMs: 300, confidence: 'high', effort: 'S', risk: 'low' },
  ]);
  assert.equal(ranked[0].id, 'quick');
});
