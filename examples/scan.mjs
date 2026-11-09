// Minimal URL scanner: measure TTFB, total time, bytes, status, and cache headers.
// Usage: node examples/scan.mjs <url> [url...]
// (For richer data use Lighthouse/WebPageTest/RUM — see references/measurement.md.)

import { performance } from 'node:perf_hooks';
import { pathToFileURL } from 'node:url';

export async function scanUrl(url, { fetchImpl = fetch } = {}) {
  const started = performance.now();
  const res = await fetchImpl(url, { redirect: 'follow', headers: { 'accept-encoding': 'gzip, br' } });
  const ttfbMs = performance.now() - started;
  const buf = Buffer.from(await res.arrayBuffer());
  const totalMs = performance.now() - started;

  return {
    url,
    status: res.status,
    ok: res.ok,
    ttfbMs: Math.round(ttfbMs),
    totalMs: Math.round(totalMs),
    bytes: buf.length,
    contentType: res.headers.get('content-type') || '',
    cacheControl: res.headers.get('cache-control') || '',
    serverTiming: res.headers.get('server-timing') || '',
  };
}

export async function scan(urls, opts = {}) {
  const results = [];
  for (const url of urls) {
    try {
      results.push(await scanUrl(url, opts));
    } catch (err) {
      results.push({ url, error: String(err) });
    }
  }
  return results;
}

export function toMarkdownTable(results) {
  const rows = results.map((r) => {
    if (r.error) return `| ${r.url} | ERROR | — | — | — | ${r.error} |`;
    return `| ${r.url} | ${r.status} | ${r.ttfbMs} | ${r.totalMs} | ${r.bytes} | ${r.cacheControl || '—'} |`;
  });
  return [
    '| URL | Status | TTFB (ms) | Total (ms) | Bytes | Cache-Control |',
    '|-----|--------|-----------|------------|-------|---------------|',
    ...rows,
  ].join('\n');
}

async function main() {
  const urls = process.argv.slice(2);
  if (!urls.length) {
    console.error('Usage: node examples/scan.mjs <url> [url...]');
    process.exit(1);
  }
  const results = await scan(urls);
  console.log(toMarkdownTable(results));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main();
}
