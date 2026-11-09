// Contract-test helper: snapshot a JSON response's SHAPE (keys + types), ignore values,
// and assert it hasn't changed. Use before/after any performance change.
// Zero deps. For real projects, pair with snapshot testing or Pact.

export function shapeOf(value) {
  if (Array.isArray(value)) return value.length ? [shapeOf(value[0])] : ['array'];
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'object') {
    const out = {};
    for (const k of Object.keys(value).sort()) out[k] = shapeOf(value[k]);
    return out;
  }
  return t; // string | number | boolean | undefined
}

/** Throws if `actual`'s shape differs from `expected`'s shape (the pre-change sample). */
export function assertShape(actual, expected, path = '$') {
  const a = JSON.stringify(shapeOf(actual));
  const e = JSON.stringify(shapeOf(expected));
  if (a !== e) {
    throw new Error(`contract mismatch at ${path}\n  expected: ${e}\n  actual:   ${a}`);
  }
  return true;
}

/** Convenience: does `actual` keep the shape of `expected`? (no throw) */
export function keepsShape(actual, expected) {
  try {
    assertShape(actual, expected);
    return true;
  } catch {
    return false;
  }
}
