import pg from "pg";
import { applySchema, seedDatabase } from "../../db/seed/index";

/** True when a DATABASE_URL is available for DB-backed integration tests. */
export const hasDatabase = () => !!process.env.DATABASE_URL;

export interface IsolatedDb {
  pool: pg.Pool;
  schemaName: string;
  destroy(): Promise<void>;
}

/**
 * Creates a throwaway Postgres schema (search_path scoped), applies the
 * canonical schema and the deterministic seed. No Docker, no fixtures —
 * anything reachable through DATABASE_URL works, including Neon.
 */
export async function createIsolatedDb(prefix: string): Promise<IsolatedDb> {
  const connectionString = process.env.DATABASE_URL!;
  const schemaName = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    .replace(/[^a-z0-9_]/gi, "_");

  const admin = new pg.Pool({ connectionString, max: 1 });
  await admin.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
  await admin.end();

  const pool = new pg.Pool({ connectionString, max: 10, options: `-c search_path=${schemaName}` });
  await applySchema(pool);
  await seedDatabase(pool);

  return {
    pool,
    schemaName,
    async destroy() {
      await pool.end();
      const cleanup = new pg.Pool({ connectionString, max: 1 });
      await cleanup.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`);
      await cleanup.end();
    },
  };
}

export interface ArticleFacts {
  id: string;
  country_slug: string;
  country_name: string;
  continent_slug: string;
  status: string;
  is_featured: boolean;
}

export const articleFacts = (pool: pg.Pool, ids: string[]) =>
  pool
    .query<ArticleFacts>(
      `SELECT a.id, c.slug AS country_slug, c.name AS country_name,
              ct.slug AS continent_slug, a.status, a.is_featured
       FROM articles a
       JOIN countries c ON c.id = a.country_id
       JOIN continents ct ON ct.id = c.continent_id
       WHERE a.id = ANY($1)
       ORDER BY a.id`,
      [ids],
    )
    .then((r) => r.rows);

export interface StopRow {
  route_id: string;
  stop_number: number;
  place: string;
  title: string;
}

export const routeStops = (pool: pg.Pool, routeIds: string[]) =>
  pool
    .query<StopRow>(
      "SELECT route_id, stop_number, place, title FROM route_stops WHERE route_id = ANY($1) ORDER BY route_id, stop_number",
      [routeIds],
    )
    .then((r) => r.rows);
