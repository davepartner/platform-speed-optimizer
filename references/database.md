# Database — queries & indexes

The fastest query is the one you don't run; the second fastest is the one that hits an index.

## Find the problem

- **Slow-query log** + `EXPLAIN ANALYZE` on the top queries.
- Look for `Seq Scan`/full table scans on big tables, high `rows`, sorts, and nested loops.
- Count N+1s (one query per row in a list).

## Indexes

- **Single-column** for frequent `WHERE`/`JOIN`/`ORDER BY`.
- **Composite** — order matters: equality columns first, then range/sort (e.g. `(user_id, created_at)`).
- **Covering** index when the query needs only indexed columns (avoids table lookups).
- **Partial** index for hot subsets (`WHERE status = 'active'`).
- Balance writes: every index slows inserts/updates; drop unused ones.

## Query hygiene

- **Sargable predicates** — don't wrap indexed columns in functions
  (`WHERE DATE(created_at) = ...` kills the index; use a range or a generated column).
- **Avoid `SELECT *`** — select only needed columns.
- **Avoid N+1** — eager-load relations or batch with `WHERE id IN (...)`; aggregate in SQL when possible.
- **Keyset pagination** (`WHERE id > :last ORDER BY id LIMIT n`) instead of deep `OFFSET`.
- Keep **transactions short**; don't hold locks across external calls.

## Infrastructure

- **Connection pooling** (PgBouncer, HikariCP, etc.) — avoid per-request connections.
- **Read replicas** for read-heavy traffic; route writes to the primary.
- **Denormalize / materialized views** for expensive aggregates; refresh on a schedule or trigger.
- **Batching** for bulk inserts/updates.
- Keep **statistics fresh** (`ANALYZE`), and maintain/vacuum regularly.
- **Partition** very large tables by time if range queries dominate.
- Consider a **generated column** (e.g. `year_month`) when the schema splits a date.

## Anti-patterns

- Missing index on a FK used in joins; `LIKE '%term%'` on large text; `ORDER BY` without index on big
  sets; counting with `SELECT COUNT(*)` on huge tables in hot paths (cache it); storing JSON blobs you
  filter on without an index; unbounded lists.
