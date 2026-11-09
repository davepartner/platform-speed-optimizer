# Navigation & forms — remove unnecessary reloads

Full-page reloads are often the biggest *perceived* slowdown on otherwise fast sites. Removing them
improves **INP** and perceived speed — **without** breaking the app.

## The rule: progressive enhancement

Ship an enhancement that **still works if JS fails or is disabled**. The page renders, the form
submits, and the server responds as before; JS upgrades it to a partial/fetch update.

## Techniques (least → most invasive)

1. **Fetch/AJAX form submit** — intercept `submit`, POST the **same** endpoint with
   `Accept: application/json` (or a partial header), swap the result inline. Server keeps the same
   response shape for non-JS clients.
2. **Partial page updates** — HTMX, Alpine AJAX, Turbo, htmx-style attributes; update one region instead
   of reloading.
3. **View Transitions API** — smooth cross-document navigation with ~one CSS line:
   `@view-transition { navigation: auto; }`. It's **progressive enhancement** (unsupported browsers
   just do a normal load) — supported in current Chrome/Safari. Respect `prefers-reduced-motion`.
4. **Optimistic UI** — show the result immediately, reconcile on response; always offer error recovery.
5. **Prefetch on hover/intent** for likely next navigations (only fast, cacheable GETs).

## Keep it safe

- **Same endpoints, same response shapes.** Add a JSON/partial representation; do **not** remove the
  full-page one. Contract-test both.
- **Handle errors inline** with `aria-live` and focus management; keep the user's input on failure.
- **Loading + disabled states** within 100ms; never leave a frozen UI (Doherty <400ms).
- **Accessibility:** announce updates, manage focus, keep keyboard flows; don't trap focus.
- **Respect `prefers-reduced-motion`**; don't add animation that delays the user's task.
- **Measure INP** before/after; a heavy client layer can *hurt* perceived speed.

## When *not* to

- Simple marketing pages — a fast normal load is fine; don't add a JS layer for nothing.
- Complex multi-step flows where a reload is clearer and already fast.
- Anywhere the enhancement would break the no-JS path or the API contract.

## Anti-patterns

- A JS-only app with no server-rendered fallback.
- Full reloads for every filter/sort/like/form on a data-heavy screen.
- Fake transitions that add latency ("out → in" animation before showing content).
- Removing the HTML response in favor of JSON-only (breaks no-JS + SEO).
