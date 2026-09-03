-- ============================================================================
-- verify_integrity.sql — human-readable SQL twin of db/verify.ts
-- ============================================================================
-- Run each query against the Wanderlust schema. Every result set must be
-- EMPTY for the dataset to be considered healthy.
--
--   psql "$DATABASE_URL" -f db/verify/verify_integrity.sql
--
-- The TS verifier (db/verify.ts, used by the automated repair test) applies
-- the same checks plus non-empty table sanity.
-- ============================================================================

-- 1. Articles whose country/status/featured state disagrees with the latest
--    editorial revision (canonical assignment evidence).
SELECT a.id, a.country_id AS actual_country, a.status AS actual_status,
       a.is_featured AS actual_featured,
       lr.country_id AS expected_country, lr.status AS expected_status,
       lr.is_featured AS expected_featured
FROM articles a
JOIN LATERAL (
  SELECT er.country_id, er.status, er.is_featured
  FROM editorial_revisions er
  WHERE er.article_id = a.id
  ORDER BY er.revision_no DESC, er.created_at DESC
  LIMIT 1
) lr ON true
WHERE a.country_id IS DISTINCT FROM lr.country_id
   OR a.status IS DISTINCT FROM lr.status
   OR a.is_featured IS DISTINCT FROM lr.is_featured;

-- 2. Route stops whose position disagrees with route_stop_history (the journal
--    of legitimate reorderings).
SELECT rs.route_id, rs.place, rs.stop_number AS actual, cs.new_stop_number AS expected
FROM route_stops rs
JOIN LATERAL (
  SELECT h.new_stop_number
  FROM route_stop_history h
  WHERE h.stop_id = rs.id
  ORDER BY h.created_at DESC, h.id DESC
  LIMIT 1
) cs ON true
WHERE rs.stop_number <> cs.new_stop_number;

-- 3. Routes whose stop numbers are not a contiguous 1..N sequence.
SELECT route_id, COUNT(*)::int AS stops, MIN(stop_number) AS min_no,
       MAX(stop_number) AS max_no, COUNT(DISTINCT stop_number)::int AS distinct_no
FROM route_stops
GROUP BY route_id
HAVING MIN(stop_number) <> 1
    OR MAX(stop_number) <> COUNT(*)
    OR COUNT(DISTINCT stop_number) <> COUNT(*);

-- 4. Denormalized like_count drift vs the actual like rows.
SELECT a.id, a.like_count AS stored, COALESCE(l.actual, 0) AS actual
FROM articles a
LEFT JOIN (
  SELECT article_id, COUNT(*)::int AS actual
  FROM article_likes
  GROUP BY article_id
) l ON l.article_id = a.id
WHERE a.like_count <> COALESCE(l.actual, 0);

-- 5. Migration audit health: every applied migration accounted for, faulty
--    ones flagged. (Informational — returns rows, not violations.)
SELECT migration_name, status, applied_by, applied_at
FROM migration_audit
ORDER BY applied_at;
