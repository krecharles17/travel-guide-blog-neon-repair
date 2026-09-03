import { Pool as PgPool } from "pg";

export type DbQueryResult<T> = { rows: T[] };

export interface DbClient {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<DbQueryResult<T>>;
  close(): Promise<void>;
}

/**
 * DATABASE_URL must only ever be read here, on the server.
 * It is never prefixed with VITE_, so Vite cannot leak it into the browser bundle.
 */
export function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure a PostgreSQL/Neon connection string. This value is server-side only.",
    );
  }
  return url;
}

const NEON_HOST = /\.neon\.(tech|build)$/i;

/**
 * Picks the right Postgres driver:
 *  - Neon databases (host like *.neon.tech) use the official Neon serverless HTTP driver.
 *  - Any other Postgres (local dev, CI, self-hosted) uses node-postgres.
 * DB_DRIVER=neon-http|pg overrides auto-detection.
 */
export async function createDb(): Promise<DbClient> {
  const connectionString = requireDatabaseUrl();
  const driver = process.env.DB_DRIVER || (NEON_HOST.test(new URL(connectionString).hostname) ? "neon-http" : "pg");

  if (driver === "neon-http") {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(connectionString);
    return {
      async query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
        const rows = (await sql.query(text, params ?? [])) as T[];
        return { rows };
      },
      async close() {},
    };
  }

  const pool = new PgPool({ connectionString, max: 10 });
  return {
    query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
      return pool.query<T>(text, params as never[]);
    },
    close: () => pool.end(),
  };
}
