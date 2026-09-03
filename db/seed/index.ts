import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeedData } from "./build";

export { uuidv5, REV2_ARTICLE_IDS } from "./build";
export { continents, allCountries } from "./destinations";

const here = path.dirname(fileURLToPath(import.meta.url));
export const SCHEMA_SQL_PATH = path.resolve(here, "../sql/schema.sql");

export async function readSchemaSql(): Promise<string> {
  return readFile(SCHEMA_SQL_PATH, "utf8");
}

export interface SqlExecutor {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

/** Applies db/sql/schema.sql using the executor's current search_path. */
export async function applySchema(db: SqlExecutor): Promise<void> {
  await db.query(await readSchemaSql());
}

const SEED_ORDER = [
  "continents",
  "countries",
  "articles",
  "editorial_revisions",
  "article_comments",
  "article_likes",
  "travel_routes",
  "route_stops",
  "route_stop_history",
  "products",
  "newsletter_subscribers",
  "migration_audit",
] as const;

// jsonb_populate_recordset does not apply column defaults for fields missing
// from the JSON, so tables that rely on gen_random_uuid() get explicit column
// lists (with the PK omitted) instead of SELECT *.
const INSERT_COLUMNS: Partial<Record<(typeof SEED_ORDER)[number], string>> = {
  article_comments: "article_id, author_name, body, created_at",
  article_likes: "article_id, visitor_id, created_at",
  newsletter_subscribers: "email, name, source, created_at",
};

/**
 * Deterministically inserts the full synthetic dataset.
 * Assumes the schema exists and tables are empty.
 */
export async function seedDatabase(db: SqlExecutor): Promise<Record<string, number>> {
  const data = buildSeedData();
  const counts: Record<string, number> = {};
  for (const table of SEED_ORDER) {
    const rows = data[table] ?? [];
    counts[table] = rows.length;
    if (rows.length === 0) continue;
    const columns = INSERT_COLUMNS[table];
    const selectList = columns ?? "*";
    await db.query(
      `INSERT INTO ${table} ${columns ? `(${columns})` : ""} SELECT ${selectList} FROM jsonb_populate_recordset(null::${table}, $1::jsonb)`,
      [JSON.stringify(rows)],
    );
  }
  return counts;
}

export { buildSeedData };
