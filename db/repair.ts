/**
 * Applies the evidence-driven repair for the faulty editorial migration to
 * the database at DATABASE_URL. Transactional and idempotent — safe to re-run.
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

await applyArtifact("./repairs/20260903172000_repair_faulty_editorial_migration.sql", { schema });
console.log("[db:repair] repair migration applied.");

const pool = new pg.Pool({ connectionString, max: 1, options: `-c search_path=${schema}` });
try {
  const report = await verifyIntegrity(pool);
  console.log(`[db:repair] verifier: ${report.ok ? "PASS" : "FAIL"}`);
  for (const v of report.violations) {
    console.log(`  - ${v.rule} ×${v.count}`);
    console.log(`    ${v.detail}`);
  }
  if (!report.ok) process.exitCode = 1;
} finally {
  await pool.end();
}
