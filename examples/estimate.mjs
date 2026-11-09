// Honest estimation helpers for the platform-speed-optimizer skill.
// Zero deps. All gains are RANGES in practice — use `range()` and report confidence.

/** Transfer time (ms) for `bytes` at an effective `bandwidthMbps`. */
export function transferMs(bytes, bandwidthMbps) {
  if (!(bandwidthMbps > 0)) throw new Error('bandwidthMbps must be > 0');
  return (bytes * 8) / (bandwidthMbps * 1_000_000) * 1000;
}

/** ms saved by removing bytes at a given bandwidth. */
export function bytesSavedMs({ currentBytes, optimizedBytes, bandwidthMbps }) {
  const bytesSaved = Math.max(0, currentBytes - optimizedBytes);
  return { bytesSaved, msSaved: transferMs(bytesSaved, bandwidthMbps) };
}

/** Expected latency with a cache: origin*(1-hitRate) + cacheHit*hitRate. */
export function cacheExpectedMs({ originMs, cacheHitMs, hitRate }) {
  const r = Math.min(1, Math.max(0, hitRate));
  return originMs * (1 - r) + cacheHitMs * r;
}

/** Time saved by removing `requests` round-trips (each ≈ latencyMsPerRequest). */
export function requestsSavedMs(requests, latencyMsPerRequest) {
  return Math.max(0, requests) * Math.max(0, latencyMsPerRequest);
}

/** A predicted range from a central estimate (default ±30%). */
export function range(ms, variancePct = 0.3) {
  return { low: Math.round(ms * (1 - variancePct)), high: Math.round(ms * (1 + variancePct)) };
}

/** Sum predicted ms across items (e.g. [{ msSaved: 100 }, ...]). */
export function sumMs(items) {
  return items.reduce((total, item) => total + (Number(item.msSaved) || 0), 0);
}
