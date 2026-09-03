/**
 * Deterministic seed CLI.
 *
 *   npm run db:seed
 *
 * DROPS the Wanderlust tables in the target schema (default: public) and
 * recreates + reseeds them from the deterministic generator. Never run it
 * against a database you care about without checking DATABASE_URL first.
 */
import pg from "pg";
import { applySchema, seedDatabase } from "./seed/index";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and configure it first.");
  process.exit(1);
}

const schema = process.env.DB_SCHEMA || "public";
const pool = new pg.Pool({ connectionString, max: 4, options: `-c search_path=${schema}` });

const TABLES = [
  "route_stop_history", "route_stops", "editorial_revisions", "migration_audit",
  "article_likes", "article_comments", "newsletter_subscribers",
  "products", "travel_routes", "articles", "countries", "continents",
];

try {
  console.log(`[db:seed] resetting schema "${schema}"...`);
  await pool.query(`DROP TABLE IF EXISTS ${TABLES.join(", ")} CASCADE`);
  await applySchema(pool);
  const counts = await seedDatabase(pool);
  console.log(`[db:seed] done (schema: ${schema})`);
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(24)} ${String(count).padStart(6)} rows`);
  }
} catch (err) {
  console.error("[db:seed] failed:", err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
