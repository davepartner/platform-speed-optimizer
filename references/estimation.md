# Estimation — predicting ms honestly

Predictions must be **traceable**. Show the basis, give a **range** from **confidence**, and verify after.

## The three-part estimate

1. **Basis** — why it saves time (bytes, requests, cache hit-rate, query plan, a removed render-blocking
   resource, a removed page reload).
2. **Calculation** — a formula (below) or a measured identical change elsewhere.
3. **Confidence** — `high` (measured on this system) / `medium` (formula on real inputs) / `low`
   (heuristic → needs measurement).

Report as `≈ X ms (range A–B, confidence C)`.

## The model (`examples/estimate.mjs`)

- **Transfer (lower bound):** `transferMs({ bytes, bandwidthMbps, rttMs, setupRtts })` — download +
  RTT setup. It ignores TCP slow-start/congestion, so it's a floor.
- **Bytes saved:** `bytesSavedMs({ currentBytes, optimizedBytes, bandwidthMbps })`.
- **Requests saved (upper bound):** `requestsSavedMs({ requests, rttMs })` — HTTP/2 multiplexes, so
  removing requests saves fewer RTTs in reality.
- **LCP decomposition:** `lcpMs({ ttfbMs, resourceLoadDelayMs, resourceLoadMs, renderDelayMs })`.
- **INP decomposition:** `inpMs({ inputDelayMs, processingMs, presentationMs })`.
- **Cache:** `cacheExpectedMs({ originMs, cacheHitMs, hitRate })` (means; pass p95 inputs for tail).
- **Combine:** `combineOverlapping([...])` for savings on the **same** metric (take the max);
  `sumIndependent([...])` only for truly independent metrics.
- **Range:** `rangeFor(ms, confidence)` (high ±10%, medium ±30%, low ±60%).
- **Priority:** `prioritize(items)` — `predictedMs × confidenceWeight × riskWeight ÷ effortWeight`.

## Worked example

Hero image 1.2 MB → 180 KB AVIF on a 10 Mbps link with a 100 ms RTT:
`bytesSavedMs → ≈816 ms` (lower bound). Report `≈0.8s (0.6–1.0s, medium)` and verify with field LCP.

## Predicting LCP and INP (do it in parts)

- **LCP** is a critical path: `TTFB + resource load delay + resource load time + render delay`. Estimate
  each; if you can't, write **"needs measurement"** — don't fabricate it.
- **INP** is main-thread work: `input delay + processing + presentation`. JS exec time is device- and
  code-dependent — measure in a throttled DevTools run.

## Don't double-count

- Several fixes may move the **same** metric (image + TTFB both help LCP). Use `combineOverlapping`
  (max), not a sum.
- Sum only across **different** metrics or genuinely independent requests.

## Caveats

- Networks, CPU, concurrency, and caching vary — always a range.
- Lab (Lighthouse) ≠ field (RUM). Prefer field for impact.
- A faster backend doesn't help if the client waits on JS.

## After shipping

Put before/after in the verification table (`references/report-template.md`). If the prediction didn't
materialise, investigate — don't quietly drop it.
