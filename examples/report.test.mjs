import test from 'node:test';
import assert from 'node:assert/strict';
import { renderReport } from './report.mjs';

const items = [
  { id: 'B1', title: 'Hero image', area: 'frontend', finding: '1.2MB lazy JPEG', fix: 'AVIF + preload', predictedMs: 800, confidence: 'medium', effort: 'S', risk: 'low' },
  { id: 'B2', title: 'Search index', area: 'api', finding: 'seq scan', fix: 'composite index', predictedMs: 1200, confidence: 'high', effort: 'S', risk: 'low' },
  { id: 'B3', title: 'Rewrite checkout', area: 'framework', finding: 'SPA slow', fix: 'rewrite', predictedMs: 900, confidence: 'low', effort: 'L', risk: 'high' },
];

test('renders a title and executive summary with top wins', () => {
  const md = renderReport({ title: 'Speed Audit', platform: 'ShopLite', items });
  assert.ok(md.startsWith('# Speed Audit — ShopLite'));
  assert.ok(md.includes('Executive summary'));
  assert.ok(md.includes('**B2**'));
});

test('ranks quick wins above a heavy high-risk rewrite', () => {
  const md = renderReport({ items });
  const b2 = md.indexOf('**B2**');
  const b3 = md.indexOf('**B3**');
  assert.ok(b2 !== -1 && b3 !== -1);
  assert.ok(b2 < b3, 'B2 should rank above B3');
});

test('includes baseline table and the safety note', () => {
  const md = renderReport({
    baseline: [{ metric: 'LCP', current: '4.2s', target: '2.5s', source: 'CrUX' }],
    items,
  });
  assert.ok(md.includes('| LCP | 4.2s | 2.5s | CrUX |'));
  assert.ok(md.includes('## Safety'));
});

test('handles an empty findings list gracefully', () => {
  const md = renderReport({});
  assert.ok(md.includes('No findings yet'));
});

test('escapes pipe characters so the table stays valid', () => {
  const md = renderReport({ items: [{ ...items[0], finding: 'a | b' }] });
  assert.ok(md.includes('a \\| b'));
});
