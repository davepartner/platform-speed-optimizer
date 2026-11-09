import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bytesSavedMs,
  cacheExpectedMs,
  range,
  requestsSavedMs,
  sumMs,
  transferMs,
} from './estimate.mjs';

test('transferMs: 1 MB at 10 Mbps ≈ 800 ms', () => {
  assert.equal(Math.round(transferMs(1_000_000, 10)), 800);
});

test('bytesSavedMs removes bytes and converts to ms', () => {
  const r = bytesSavedMs({ currentBytes: 500_000, optimizedBytes: 0, bandwidthMbps: 10 });
  assert.equal(r.bytesSaved, 500_000);
  assert.equal(Math.round(r.msSaved), 400);
});

test('bytesSavedMs never returns a negative saving', () => {
  const r = bytesSavedMs({ currentBytes: 100, optimizedBytes: 500, bandwidthMbps: 10 });
  assert.equal(r.bytesSaved, 0);
  assert.equal(r.msSaved, 0);
});

test('cacheExpectedMs blends origin and cache by hit rate', () => {
  assert.equal(Math.round(cacheExpectedMs({ originMs: 800, cacheHitMs: 50, hitRate: 0.8 })), 200);
});

test('cacheExpectedMs clamps hitRate to [0,1]', () => {
  assert.equal(cacheExpectedMs({ originMs: 100, cacheHitMs: 10, hitRate: 2 }), 10);
  assert.equal(cacheExpectedMs({ originMs: 100, cacheHitMs: 10, hitRate: -1 }), 100);
});

test('requestsSavedMs multiplies requests by per-request latency', () => {
  assert.equal(requestsSavedMs(5, 100), 500);
  assert.equal(requestsSavedMs(-3, 100), 0);
});

test('range returns a sane low/high band', () => {
  assert.deepEqual(range(100), { low: 70, high: 130 });
});

test('sumMs totals predicted savings', () => {
  assert.equal(sumMs([{ msSaved: 100 }, { msSaved: 50 }, {}]), 150);
});

test('transferMs rejects non-positive bandwidth', () => {
  assert.throws(() => transferMs(1000, 0), /bandwidthMbps/);
});
