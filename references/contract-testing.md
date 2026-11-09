# Contract testing — change speed, not the API

Before optimizing any endpoint, capture its **response shape**; after, assert it's unchanged. Values may
change; keys and types must not.

## Snapshot the shape

Use `examples/contract.mjs`:

```js
import { assertShape, keepsShape } from './examples/contract.mjs';

const before = { id: 1, name: 'A', items: [{ sku: 'x', qty: 2 }] };
const after  = { id: 2, name: 'B', items: [{ sku: 'y', qty: 5 }] };

assertShape(after, before); // passes — same shape, different values
```

If you remove a key, change a type, or drop an array element's fields, it throws. Run this as a test for
every endpoint you touch.

## Rules

- **Additive only** — adding a field is safe; removing/renaming/typing is a breaking change.
- Keep **status codes**, error envelope, and pagination semantics identical.
- If you must break, **version** the endpoint and keep the old until clients migrate.
- Snapshot a **representative** sample (empty, one item, many) — not just one.

## In CI

- Store the expected shape per endpoint (a JSON snapshot); diff it on every PR that touches the API.
- Pair with consumer-driven contracts (Pact) if you have multiple clients.
- Also add **schema validation** (JSON Schema/OpenAPI) for stronger guarantees.

## Checklist

- [ ] Shape snapshot captured for every touched endpoint.
- [ ] `assertShape` (or equivalent) runs in CI.
- [ ] No keys/types/status/pagination changed.
- [ ] Breaking changes versioned, old kept.
