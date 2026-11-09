import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { scan, scanUrl, toMarkdownTable } from './scan.mjs';

async function withServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    return await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('scanUrl measures status, TTFB, total, bytes and headers', async () => {
  await withServer(
    (req, res) => {
      res.setHeader('content-type', 'text/plain');
      res.setHeader('cache-control', 'public, max-age=60');
      res.end('hello world');
    },
    async (base) => {
      const r = await scanUrl(`${base}/`);
      assert.equal(r.status, 200);
      assert.equal(r.ok, true);
      assert.equal(r.bytes, 11);
      assert.equal(r.cacheControl, 'public, max-age=60');
      assert.ok(r.ttfbMs >= 0);
      assert.ok(r.totalMs >= r.ttfbMs);
    },
  );
});

test('scan records an error per failing URL without throwing', async () => {
  const results = await scan(['http://127.0.0.1:1/nope']);
  assert.equal(results.length, 1);
  assert.ok(results[0].error);
});

test('toMarkdownTable renders a row per result', async () => {
  await withServer(
    (req, res) => res.end('ok'),
    async (base) => {
      const results = await scan([`${base}/a`, `${base}/b`]);
      const md = toMarkdownTable(results);
      assert.ok(md.includes(`${base}/a`));
      assert.ok(md.includes(`${base}/b`));
      assert.ok(md.startsWith('| URL |'));
    },
  );
});
