import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface ArtifactOptions {
  schema?: string;
}

/** Applies a SQL artifact file (single transaction per file) against DATABASE_URL. */
export async function applyArtifact(relPath: string, opts: ArtifactOptions = {}): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set. Copy .env.example to .env and configure it first.");
    process.exit(1);
  }
  const schema = opts.schema || process.env.DB_SCHEMA || "public";
  const pool = new pg.Pool({ connectionString, max: 1, options: `-c search_path=${schema}` });
  try {
    const sql = await readFile(path.resolve(here, relPath), "utf8");
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    await pool.end();
  }
}
