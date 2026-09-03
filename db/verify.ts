/**
 * Integrity verifier + fingerprinting for the Wanderlust dataset.
 * Pure module — the CLI lives in db/verify-cli.ts.
 *
 * verifyIntegrity(db) checks, using ONLY recorded evidence:
 *   1. article-revision-mismatch   article vs latest editorial_revisions row
 *   2. route-stop-history-mismatch route_stops vs latest route_stop_history row
 *   3. route-stop-sequence         every route's stops are exactly 1..N
 *   4. like-count-drift            articles.like_count == COUNT(article_likes)
 *   5. empty-table                 core content tables are non-empty
 *
 * computeFingerprints(db) returns stable sha256 digests for four data domains,
 * used by the repair test to prove unrelated data survived untouched.
 */
import { createHash } from "node:crypto";

export interface SqlExecutor {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface Violation {
  rule: string;
  detail: string;
  count: number;
}

export interface IntegrityReport {
  ok: boolean;
  violations: Violation[];
}

const LATEST_REVISION_MISMATCH = `
  SELECT a.id, a.country_id AS actual_country_id, a.status AS actual_status,
         a.is_featured AS actual_featured, lr.country_id AS expected_country_id,
         lr.status AS expected_status, lr.is_featured AS expected_featured
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
     OR a.is_featured IS DISTINCT FROM lr.is_featured
`;

const STOP_HISTORY_MISMATCH = `
  SELECT rs.route_id, rs.stop_number AS actual, cs.new_stop_number AS expected, rs.place
  FROM route_stops rs
  JOIN LATERAL (
    SELECT h.new_stop_number
    FROM route_stop_history h
    WHERE h.stop_id = rs.id
    ORDER BY h.created_at DESC, h.id DESC
    LIMIT 1
  ) cs ON true
  WHERE rs.stop_number <> cs.new_stop_number
`;

const STOP_SEQUENCE_GAPS = `
  SELECT route_id, COUNT(*)::int AS stops, MIN(stop_number) AS min_no,
         MAX(stop_number) AS max_no, COUNT(DISTINCT stop_number)::int AS distinct_no
  FROM route_stops
  GROUP BY route_id
  HAVING MIN(stop_number) <> 1
      OR MAX(stop_number) <> COUNT(*)
      OR COUNT(DISTINCT stop_number) <> COUNT(*)
`;

const LIKE_COUNT_DRIFT = `
  SELECT a.id, a.like_count AS stored, COALESCE(l.actual, 0) AS actual
  FROM articles a
  LEFT JOIN (
    SELECT article_id, COUNT(*)::int AS actual
    FROM article_likes
    GROUP BY article_id
  ) l ON l.article_id = a.id
  WHERE a.like_count <> COALESCE(l.actual, 0)
`;

export async function verifyIntegrity(db: SqlExecutor): Promise<IntegrityReport> {
  const violations: Violation[] = [];

  const [revisionMismatches, stopMismatches, sequenceGaps, likeDrift, tableCounts] = await Promise.all([
    db.query(LATEST_REVISION_MISMATCH),
    db.query(STOP_HISTORY_MISMATCH),
    db.query(STOP_SEQUENCE_GAPS),
    db.query(LIKE_COUNT_DRIFT),
    db.query<Record<string, unknown>>(`
      SELECT
        (SELECT COUNT(*) FROM continents)      AS continents,
        (SELECT COUNT(*) FROM countries)       AS countries,
        (SELECT COUNT(*) FROM articles)        AS articles,
        (SELECT COUNT(*) FROM travel_routes)   AS routes,
        (SELECT COUNT(*) FROM products)        AS products,
        (SELECT COUNT(*) FROM article_likes)   AS likes,
        (SELECT COUNT(*) FROM article_comments) AS comments,
        (SELECT COUNT(*) FROM newsletter_subscribers) AS subscribers
    `),
  ]);

  if (revisionMismatches.rows.length > 0) {
    violations.push({
      rule: "article-revision-mismatch",
      detail: `Articles whose country/status/featured state disagrees with their latest editorial revision: ${revisionMismatches.rows
        .map((r) => `${r.id} (country=${r.actual_country_id}/${r.expected_country_id}, status=${r.actual_status}/${r.expected_status}, featured=${r.actual_featured}/${r.expected_featured})`)
        .join("; ")}`,
      count: revisionMismatches.rows.length,
    });
  }

  if (stopMismatches.rows.length > 0) {
    violations.push({
      rule: "route-stop-history-mismatch",
      detail: `Route stops whose order disagrees with route_stop_history: ${stopMismatches.rows
        .map((r) => `${r.route_id}#${r.place} (at=${r.actual}, journal=${r.expected})`)
        .join("; ")}`,
      count: stopMismatches.rows.length,
    });
  }

  if (sequenceGaps.rows.length > 0) {
    violations.push({
      rule: "route-stop-sequence",
      detail: `Routes whose stop numbers are not a contiguous 1..N sequence: ${sequenceGaps.rows
        .map((r) => `${r.route_id} (stops=${r.stops}, min=${r.min_no}, max=${r.max_no}, distinct=${r.distinct_no})`)
        .join("; ")}`,
      count: sequenceGaps.rows.length,
    });
  }

  if (likeDrift.rows.length > 0) {
    violations.push({
      rule: "like-count-drift",
      detail: `Articles whose like_count disagrees with article_likes rows: ${likeDrift.rows
        .map((r) => `${r.id} (stored=${r.stored}, actual=${r.actual})`)
        .join("; ")}`,
      count: likeDrift.rows.length,
    });
  }

  const counts = tableCounts.rows[0] ?? {};
  const emptyTables = Object.entries(counts)
    .filter(([, count]) => Number(count) === 0)
    .map(([table]) => table);
  if (emptyTables.length > 0) {
    violations.push({
      rule: "empty-table",
      detail: `Core tables unexpectedly empty: ${emptyTables.join(", ")}`,
      count: emptyTables.length,
    });
  }

  return { ok: violations.length === 0, violations };
}

const hashRows = (rows: unknown[]): string =>
  createHash("sha256").update(JSON.stringify(rows)).digest("hex");

export interface Fingerprints {
  engagement: string;
  content: string;
  geography: string;
  shop: string;
}

/**
 * Domain fingerprints. During the corruption/repair cycle the test asserts:
 *   engagement + geography + shop unchanged at every step;
 *   content changed by the corruption and restored by the repair.
 */
export async function computeFingerprints(db: SqlExecutor): Promise<Fingerprints> {
  const [likes, comments, subscribers, counters, articles, routes, stops, revisions, history, continents, countries, products] =
    await Promise.all([
      db.query("SELECT * FROM article_likes ORDER BY article_id, visitor_id, created_at"),
      db.query("SELECT * FROM article_comments ORDER BY created_at, id"),
      db.query("SELECT * FROM newsletter_subscribers ORDER BY email"),
      db.query("SELECT id, view_count, like_count FROM articles ORDER BY id"),
      db.query(
        "SELECT id, country_id, status, is_featured, title, published_at, category, author FROM articles ORDER BY id",
      ),
      db.query("SELECT id, title, sort_order, countries, difficulty FROM travel_routes ORDER BY id"),
      db.query("SELECT route_id, stop_number, place, title, country_id FROM route_stops ORDER BY route_id, stop_number"),
      db.query(
        "SELECT id, article_id, revision_no, country_id, status, is_featured, title, editor, note, created_at FROM editorial_revisions ORDER BY article_id, revision_no",
      ),
      db.query("SELECT id, route_id, stop_id, previous_stop_number, new_stop_number, changed_by, reason, created_at FROM route_stop_history ORDER BY route_id, stop_id, created_at, id"),
      db.query("SELECT * FROM continents ORDER BY slug"),
      db.query("SELECT * FROM countries ORDER BY slug"),
      db.query("SELECT * FROM products ORDER BY id"),
    ]);

  return {
    engagement: hashRows([likes.rows, comments.rows, subscribers.rows, counters.rows]),
    content: hashRows([articles.rows, routes.rows, stops.rows, revisions.rows, history.rows]),
    geography: hashRows([continents.rows, countries.rows]),
    shop: hashRows([products.rows]),
  };
}
