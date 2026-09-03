/**
 * CLI: runs the integrity verifier against DATABASE_URL and reports
 * violations. Importable module lives in db/verify.ts.
 */
import pg from "pg";
import { verifyIntegrity } from "./verify";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env and configure it first.");
  process.exit(1);
}
const schema = process.env.DB_SCHEMA || "public";

const pool = new pg.Pool({ connectionString, max: 1, options: `-c search_path=${schema}` });
try {
  const report = await verifyIntegrity(pool);
  console.log(`[db:verify] schema "${schema}": ${report.ok ? "PASS — dataset is healthy" : "FAIL — violations found"}`);
  for (const v of report.violations) {
    console.log(`  - ${v.rule} ×${v.count}`);
    console.log(`    ${v.detail}`);
  }
  if (!report.ok) process.exitCode = 1;
} finally {
  await pool.end();
}
