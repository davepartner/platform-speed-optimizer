// Honest estimation helpers for the platform-speed-optimizer skill.
// Zero deps. Everything here is an ESTIMATE — always report a range + confidence.
//
// Key assumptions (read them):
//  - `transferMs` is a LOWER BOUND: it models download bytes / bandwidth + RTT setup,
//    not TCP slow-start, congestion, or HTTP overhead.
//  - `requestsSavedMs` is an UPPER BOUND: HTTP/2 multiplexes requests, so removing requests
//    saves fewer RTTs in practice.
//  - `lcpMs`/`inpMs` are the web.dev decompositions — estimate each part, or mark
//    "needs measurement"; do not fabricate sub-parts.

export const CONFIDENCE_VARIANCE = { high: 0.1, medium: 0.3, low: 0.6 };
export const CONFIDENCE_WEIGHT = { high: 1, medium: 0.7, low: 0.4 };
export const EFFORT_WEIGHT = { S: 1, M: 3, L: 6 };
export const RISK_WEIGHT = { low: 1, medium: 0.8, high: 0.4 };

/** Lower-bound network transfer time (ms): setup RTTs + bytes/bandwidth. */
export function transferMs({ bytes, bandwidthMbps, rttMs = 0, setupRtts = 0 }) {
  if (!(bandwidthMbps > 0)) throw new Error('bandwidthMbps must be > 0');
  const download = (Math.max(0, bytes) * 8) / (bandwidthMbps * 1_000_000) * 1000;
  const setup = Math.max(0, rttMs) * Math.max(0, setupRtts);
  return setup + download;
}

/** ms saved by removing bytes (RTT unchanged unless you also remove requests). */
export function bytesSavedMs({ currentBytes, optimizedBytes, bandwidthMbps }) {
  if (!(bandwidthMbps > 0)) throw new Error('bandwidthMbps must be > 0');
  const bytesSaved = Math.max(0, currentBytes - optimizedBytes);
  return { bytesSaved, msSaved: (bytesSaved * 8) / (bandwidthMbps * 1_000_000) * 1000 };
}

/** Upper-bound ms saved by removing requests (each ≈ one RTT; HTTP/2 overlaps them). */
export function requestsSavedMs({ requests, rttMs }) {
  return Math.max(0, requests) * Math.max(0, rttMs);
}

/** LCP decomposition (web.dev): TTFB + resource load delay + load time + render delay. */
export function lcpMs({ ttfbMs, resourceLoadDelayMs = 0, resourceLoadMs = 0, renderDelayMs = 0 }) {
  return (
    Math.max(0, ttfbMs) +
    Math.max(0, resourceLoadDelayMs) +
    Math.max(0, resourceLoadMs) +
    Math.max(0, renderDelayMs)
  );
}

/** INP decomposition: input delay + processing + presentation. */
export function inpMs({ inputDelayMs = 0, processingMs = 0, presentationMs = 0 }) {
  return Math.max(0, inputDelayMs) + Math.max(0, processingMs) + Math.max(0, presentationMs);
}

/** Cache expected latency (means). For tail behavior, pass p95 inputs. */
export function cacheExpectedMs({ originMs, cacheHitMs, hitRate }) {
  const r = Math.min(1, Math.max(0, hitRate));
  return originMs * (1 - r) + cacheHitMs * r;
}

/**
 * Combine savings that affect the SAME metric (they overlap) — take the MAX, not the sum.
 * e.g. an image fix and a TTFB fix both move LCP; don't add them.
 */
export function combineOverlapping(items) {
  return Math.max(0, ...items.map((i) => Number(i.msSaved) || 0));
}

/** Sum savings on DIFFERENT metrics / independent requests. Use with care. */
export function sumIndependent(items) {
  return items.reduce((total, item) => total + (Number(item.msSaved) || 0), 0);
}

/** A predicted range from a central estimate + confidence (high/medium/low). */
export function rangeFor(ms, confidence = 'medium') {
  const v = CONFIDENCE_VARIANCE[(confidence || 'medium').toLowerCase()] ?? 0.3;
  return { low: Math.round(ms * (1 - v)), high: Math.round(ms * (1 + v)) };
}

/**
 * Priority score: predictedMs × confidenceWeight × riskWeight ÷ effortWeight.
 * Higher = better quick win. High-risk items are pushed down, not hidden.
 */
export function priorityOf(item) {
  const ms = Math.max(0, Number(item.predictedMs) || 0);
  const confidence = (item.confidence || 'medium').toLowerCase();
  const effort = (item.effort || 'M').toUpperCase();
  const risk = (item.risk || 'low').toLowerCase();
  const score =
    (ms * (CONFIDENCE_WEIGHT[confidence] ?? 0.7) * (RISK_WEIGHT[risk] ?? 1)) /
    (EFFORT_WEIGHT[effort] ?? 3);
  return score;
}

/** Sort items by priority score (desc), tie-break by predictedMs (desc). Non-mutating. */
export function prioritize(items) {
  return [...items]
    .map((item) => ({ item, score: priorityOf(item) }))
    .sort((a, b) => b.score - a.score || (b.item.predictedMs || 0) - (a.item.predictedMs || 0))
    .map((x) => x.item);
}
