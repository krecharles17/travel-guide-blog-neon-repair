/**
 * Applies the intentionally-corrupting editorial migration to the database
 * at DATABASE_URL (demo/QA tooling). Pair with `npm run db:repair`.
 */
import pg from "pg";
import { applyArtifact } from "./artifact";
import { verifyIntegrity } from "./verify";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and configure it first.");
  process.exit(1);
}
const schema = process.env.DB_SCHEMA || "public";

await applyArtifact("./corruption/20260903171000_faulty_editorial_migration.sql", { schema });
console.log("[db:corrupt] faulty editorial migration applied.");

const pool = new pg.Pool({ connectionString, max: 1, options: `-c search_path=${schema}` });
try {
  const report = await verifyIntegrity(pool);
  console.log(`[db:corrupt] verifier: ${report.ok ? "PASS (unexpected!)" : "FAIL (expected — dataset is corrupted)"}`);
  for (const v of report.violations) {
    console.log(`  - ${v.rule} ×${v.count}`);
  }
} finally {
  await pool.end();
}
