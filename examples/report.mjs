// Turn structured findings into the audit markdown (references/report-template.md).
// Items are ranked with the tested priority score from estimate.mjs.

import { prioritize, rangeFor, priorityOf } from './estimate.mjs';

const cell = (v) => String(v ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');

export function renderReport({
  title = 'Speed Audit',
  platform = '',
  date = '',
  baseline = [],
  items = [],
  decidedNotTo = [],
} = {}) {
  const ranked = prioritize(items);
  const lines = [];

  lines.push(`# ${title}${platform ? ` — ${platform}` : ''}${date ? ` — ${date}` : ''}`);
  lines.push('');

  lines.push('## Executive summary');
  lines.push('');
  if (!ranked.length) {
    lines.push('_No findings yet — run the scan and fill in `items`._');
  } else {
    lines.push(`**Top ${Math.min(5, ranked.length)} wins:**`);
    lines.push('');
    for (const it of ranked.slice(0, 5)) {
      const r = rangeFor(it.predictedMs, it.confidence);
      lines.push(
        `- **${it.id}** ${it.title} — ≈${it.predictedMs}ms (${r.low}–${r.high}ms, ${it.confidence}) · ${it.area}`,
      );
    }
    lines.push('');
    lines.push(
      '> Estimates are ranges, not promises. Verify each with the metric + test noted per item.',
    );
  }
  lines.push('');

  if (baseline.length) {
    lines.push('## Baseline');
    lines.push('');
    lines.push('| Metric | Current | Target | Source |');
    lines.push('|--------|---------|--------|--------|');
    for (const b of baseline) {
      lines.push(`| ${cell(b.metric)} | ${cell(b.current)} | ${cell(b.target)} | ${cell(b.source)} |`);
    }
    lines.push('');
  }

  lines.push('## Bottlenecks (ranked by predicted gain × confidence ÷ effort, risk-weighted)');
  lines.push('');
  if (!ranked.length) {
    lines.push('_None._');
  } else {
    lines.push('| ID | Area | Finding | Fix | Predicted (ms) | Conf. | Effort | Risk | Score |');
    lines.push('|----|------|---------|-----|----------------|-------|--------|------|-------|');
    for (const it of ranked) {
      lines.push(
        `| ${cell(it.id)} | ${cell(it.area)} | ${cell(it.finding)} | ${cell(it.fix)} | ${cell(it.predictedMs)} | ${cell(it.confidence)} | ${cell(it.effort)} | ${cell(it.risk)} | ${Math.round(priorityOf(it))} |`,
      );
    }
  }
  lines.push('');

  if (decidedNotTo.length) {
    lines.push('## What we won’t change');
    lines.push('');
    for (const d of decidedNotTo) lines.push(`- ${d}`);
    lines.push('');
  }

  lines.push('## Safety');
  lines.push('');
  lines.push(
    'Every change: API response shape unchanged (contract test), behind a flag, canary rollout, ' +
      'before/after metric recorded, one-line rollback. See `references/safety.md`.',
  );
  lines.push('');

  return lines.join('\n');
}
