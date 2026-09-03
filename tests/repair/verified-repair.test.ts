// @vitest-environment node
//
// VERIFIED REPAIR test — two layers:
//
// 1. OFFLINE (always runs, no database, < 1 s): deterministic artifact and
//    contract checks. They pin the exact things the repair scenario depends
//    on — seed determinism, canonical facts, corruption/repair SQL shape,
//    verifier rule parity, no credentials in src/ — so drift fails even when
//    no database is reachable.
//
// 2. INTEGRATION (only when DATABASE_URL is set): proves, end to end, on a
//    real (isolated) Postgres database — Neon included — that
//      1. the canonical seeded dataset passes the integrity verifier;
//      2. the faulty editorial migration corrupts article assignments,
//         publication status and two route orderings — and the verifier FAILS;
//      3. the known-good repair restores everything from recorded evidence
//         (editorial_revisions + route_stop_history + migration_audit.details);
//      4. the verifier PASSES afterwards;
//      5. engagement data and unrelated records are fingerprint-identical at
//         every step;
//      6. the repair is transactional and idempotent.
//    Without DATABASE_URL this layer is reported as skipped — by name — and
//    does not fail the run.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createIsolatedDb, articleFacts, hasDatabase, routeStops, type IsolatedDb } from "../helpers/db";
import { computeFingerprints, verifyIntegrity, type Fingerprints } from "../../db/verify";
import { buildSeedData, REV2_ARTICLE_IDS, type SeedRow } from "../../db/seed/build";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const CORRUPTION_SQL = path.resolve(here, "../../db/corruption/20260903171000_faulty_editorial_migration.sql");
const REPAIR_SQL = path.resolve(here, "../../db/repairs/20260903172000_repair_faulty_editorial_migration.sql");

const CORRUPTED_ARTICLE_IDS = [
  "art-fr-001", "art-jp-002", "art-pe-004", "art-ke-001",
  "art-au-002", "art-mx-005", "art-is-001", "art-br-006",
];
const CORRUPTED_ROUTE_IDS = ["rt-0007", "rt-0023"];
// Canonical truths the faulty migration must have destroyed:
const EXPECTED_CANONICAL: Record<string, { country_slug: string; status: string; is_featured: boolean }> = {
  "art-fr-001": { country_slug: "france", status: "published", is_featured: true },
  "art-jp-002": { country_slug: "japan", status: "published", is_featured: false },
  "art-pe-004": { country_slug: "peru", status: "published", is_featured: false },
  "art-ke-001": { country_slug: "kenya", status: "archived", is_featured: false },
  "art-au-002": { country_slug: "australia", status: "published", is_featured: false },
  "art-mx-005": { country_slug: "mexico", status: "published", is_featured: false },
  "art-is-001": { country_slug: "iceland", status: "archived", is_featured: false },
  "art-br-006": { country_slug: "brazil", status: "published", is_featured: false },
};

// ---------------------------------------------------------------------------
// Layer 1 — offline artifact & contract checks (no database required).
// ---------------------------------------------------------------------------
const EXPECTED_SEED_COUNTS: Record<string, number> = {
  continents: 6,
  countries: 60,
  articles: 360,
  editorial_revisions: 372,
  article_likes: 5876,
  article_comments: 1010,
  travel_routes: 40,
  route_stops: 199,
  route_stop_history: 199,
  products: 100,
  newsletter_subscribers: 150,
  migration_audit: 3,
};

const VERIFIER_RULES = [
  "article-revision-mismatch",
  "route-stop-history-mismatch",
  "route-stop-sequence",
  "like-count-drift",
  "empty-table",
];

const latestRevision = (seed: Record<string, SeedRow[]>, articleId: string): SeedRow => {
  const revisions = seed.editorial_revisions.filter((r) => r.article_id === articleId);
  expect(revisions.length, `revisions for ${articleId}`).toBeGreaterThan(0);
  return revisions.reduce((latest, r) => ((r.revision_no as number) > (latest.revision_no as number) ? r : latest));
};

const parseCorruptionAuditDetails = (sql: string) => {
  const articles = sql.match(/"affected_article_ids":\s*\[([^\]]*)\]/)?.[1];
  const routes = sql.match(/"affected_route_ids":\s*\[([^\]]*)\]/)?.[1];
  expect(articles, "affected_article_ids in corruption audit").toBeDefined();
  expect(routes, "affected_route_ids in corruption audit").toBeDefined();
  return {
    articles: (articles!.match(/"[^"]+"/g) ?? []).map((s) => s.slice(1, -1)).sort(),
    routes: (routes!.match(/"[^"]+"/g) ?? []).map((s) => s.slice(1, -1)).sort(),
  };
};

describe("repair artifacts & contracts (offline, deterministic)", () => {
  let corruptionSql: string;
  let repairSql: string;
  let verifyTs: string;
  let verifySql: string;
  let seed: Record<string, SeedRow[]>;

  beforeAll(async () => {
    [corruptionSql, repairSql, verifyTs, verifySql, seed] = await Promise.all([
      readFile(CORRUPTION_SQL, "utf8"),
      readFile(REPAIR_SQL, "utf8"),
      readFile(path.join(repoRoot, "db/verify.ts"), "utf8"),
      readFile(path.join(repoRoot, "db/verify/verify_integrity.sql"), "utf8"),
      Promise.resolve(buildSeedData()),
    ]);
  });

  it("builds a byte-identical seed on every run with the documented row counts", () => {
    expect(JSON.stringify(buildSeedData())).toBe(JSON.stringify(seed));
    for (const [table, count] of Object.entries(EXPECTED_SEED_COUNTS)) {
      expect(seed[table]?.length, `seed table ${table}`).toBe(count);
    }
  });

  it("corrupted articles have exactly the documented canonical facts in the seed", () => {
    const countryIdBySlug = new Map(seed.countries.map((c) => [c.slug as string, c.id as string]));
    for (const [id, facts] of Object.entries(EXPECTED_CANONICAL)) {
      const revision = latestRevision(seed, id);
      expect(revision.country_id, `latest revision country for ${id}`).toBe(countryIdBySlug.get(facts.country_slug));
      expect(revision.status, `latest revision status for ${id}`).toBe(facts.status);
      expect(revision.is_featured, `latest revision featured for ${id}`).toBe(facts.is_featured);
    }
    // The corruption targets are never touched by legitimate rev-2 moves, so
    // their canonical facts are unambiguous.
    for (const id of CORRUPTED_ARTICLE_IDS) {
      expect(REV2_ARTICLE_IDS.some((r) => r.articleId === id), `${id} has no rev-2 move`).toBe(false);
    }
    expect(seed.articles.filter((a) => a.is_featured === true)).toHaveLength(6);
  });

  it("corruption artifact targets exactly the expected ids and stays out of engagement", () => {
    const affected = parseCorruptionAuditDetails(corruptionSql);
    expect(affected.articles).toEqual([...CORRUPTED_ARTICLE_IDS].sort());
    expect(affected.routes).toEqual([...CORRUPTED_ROUTE_IDS].sort());

    for (const id of CORRUPTED_ARTICLE_IDS) {
      expect(corruptionSql).toContain(`WHERE id = '${id}'`);
    }
    expect(corruptionSql).toMatch(/\bBEGIN;/);
    expect(corruptionSql).toMatch(/\bCOMMIT;/);
    // Engagement tables and the stop journal are never written by the fault.
    expect(corruptionSql).not.toMatch(/INSERT INTO (article_likes|article_comments|newsletter_subscribers)\b/i);
    expect(corruptionSql).not.toMatch(/UPDATE (article_likes|article_comments|newsletter_subscribers)\b/i);
    expect(corruptionSql).not.toMatch(/INSERT INTO route_stop_history\b/i);
  });

  it("repair artifact is transactional, evidence-driven, idempotent and non-destructive", () => {
    expect(repairSql).toMatch(/\bBEGIN;/);
    expect(repairSql).toMatch(/\bCOMMIT;/);
    // Derives affected rows and correct values from recorded evidence only.
    expect(repairSql).toMatch(/details->'affected_article_ids'/);
    expect(repairSql).toMatch(/details->'affected_route_ids'/);
    expect(repairSql).toMatch(/\bFROM editorial_revisions\b/);
    expect(repairSql).toMatch(/\bFROM route_stop_history\b/);
    // Audits itself and flags the faulty migration; re-runs change nothing.
    expect(repairSql).toContain("20260903171000_faulty_editorial_migration.sql");
    expect(repairSql).toContain("20260903172000_repair_faulty_editorial_migration.sql");
    expect(repairSql).toMatch(/status\s*=\s*'flagged'/);
    expect(repairSql).toMatch(/ON CONFLICT \(migration_name\) DO NOTHING/);
    // Engagement data and view counters are never touched.
    expect(repairSql).not.toMatch(/(INSERT INTO|UPDATE|DELETE FROM) (article_likes|article_comments|newsletter_subscribers)\b/i);
    expect(repairSql).not.toMatch(/view_count/);
  });

  it("verifier rules match the documented contract and its SQL twin", () => {
    for (const rule of VERIFIER_RULES) {
      expect(verifyTs, `rule ${rule} in db/verify.ts`).toContain(`rule: "${rule}"`);
    }
    expect(verifySql).toMatch(/\bFROM editorial_revisions\b/);
    expect(verifySql).toMatch(/\bFROM route_stop_history\b/);
    expect(verifySql).toMatch(/HAVING MIN\(stop_number\)/);
    expect(verifySql).toMatch(/like_count/);
    expect(verifySql).toMatch(/\bFROM migration_audit\b/);
    // The SQL twin is evidence-driven too — no hardcoded correct values.
    expect(verifySql).not.toMatch(/'art-/);
  });

  it("no credentials or database config leak into the browser-side source", async () => {
    const entries = await readdir(path.join(repoRoot, "src"), { recursive: true });
    const sources = entries.filter((f) => /\.(ts|tsx)$/.test(String(f)));
    expect(sources.length).toBeGreaterThan(10);
    for (const file of sources) {
      const content = await readFile(path.join(repoRoot, "src", String(file)), "utf8");
      expect(content, `${file} references DATABASE_URL`).not.toMatch(/DATABASE_URL/);
      expect(content, `${file} references Supabase`).not.toMatch(/supabase/i);
    }
  });
});

// ---------------------------------------------------------------------------
// Layer 2 — integration on a real database (skipped, by name, without
// DATABASE_URL).
// ---------------------------------------------------------------------------
const integrationName = hasDatabase()
  ? "VERIFIED REPAIR: faulty editorial migration (integration)"
  : "VERIFIED REPAIR integration — SKIPPED (DATABASE_URL not set)";

describe.skipIf(!hasDatabase())(integrationName, () => {
  let db: IsolatedDb;
  let canonicalFingerprints: Fingerprints;
  let canonicalArticles: Awaited<ReturnType<typeof articleFacts>>;
  let canonicalStops: Awaited<ReturnType<typeof routeStops>>;
  let affectedStopCount: number;

  const runSqlFile = async (file: string) => {
    const sql = await readFile(file, "utf8");
    await db.pool.query(sql);
  };

  const featuredCount = async () => {
    const r = await db.pool.query<{ count: number }>(
      "SELECT COUNT(*)::int AS count FROM articles WHERE is_featured = true",
    );
    return r.rows[0].count;
  };

  const repairAuditState = async () => {
    const r = await db.pool.query<{ migration_name: string; status: string }>(
      "SELECT migration_name, status FROM migration_audit WHERE migration_name IN ($1, $2) ORDER BY migration_name",
      [
        "20260903171000_faulty_editorial_migration.sql",
        "20260903172000_repair_faulty_editorial_migration.sql",
      ],
    );
    return Object.fromEntries(r.rows.map((row) => [row.migration_name, row.status]));
  };

  beforeAll(async () => {
    db = await createIsolatedDb("wt_repair_test");

    // ---------------------------------------------------------------
    // Canonical state: the verifier must pass right after seeding.
    // ---------------------------------------------------------------
    const canonical = await verifyIntegrity(db.pool);
    expect(canonical.ok).toBe(true);
    expect(canonical.violations).toEqual([]);

    canonicalFingerprints = await computeFingerprints(db.pool);
    canonicalArticles = await articleFacts(db.pool, CORRUPTED_ARTICLE_IDS);
    canonicalStops = await routeStops(db.pool, CORRUPTED_ROUTE_IDS);
    affectedStopCount = canonicalStops.length;
    expect(canonicalArticles).toHaveLength(8);
    expect(affectedStopCount).toBeGreaterThanOrEqual(8);

    for (const expected of Object.entries(EXPECTED_CANONICAL)) {
      const [id, facts] = expected;
      const row = canonicalArticles.find((a) => a.id === id);
      expect(row, `canonical facts for ${id}`).toMatchObject({
        country_slug: facts.country_slug,
        status: facts.status,
        is_featured: facts.is_featured,
      });
    }
    expect(await featuredCount()).toBe(6);
  }, 180_000);

  afterAll(async () => {
    await db?.destroy();
  });

  it("corruption breaks verifier and editorial facts, but not engagement", async () => {
    await runSqlFile(CORRUPTION_SQL);

    // 1. verifier must FAIL...
    const corrupted = await verifyIntegrity(db.pool);
    expect(corrupted.ok).toBe(false);
    const byRule = Object.fromEntries(corrupted.violations.map((v) => [v.rule, v]));
    expect(byRule["article-revision-mismatch"]?.count).toBe(8);
    expect(byRule["route-stop-history-mismatch"]?.count).toBe(affectedStopCount);

    // ...and the stop sequence check alone is not enough — the rotation keeps
    // 1..N contiguous, which is exactly why the journal check exists.
    expect(byRule["route-stop-sequence"]).toBeUndefined();
    expect(byRule["like-count-drift"]).toBeUndefined();

    // 2. articles really are on the wrong continents / wrong publication state
    const corruptedFacts = await articleFacts(db.pool, CORRUPTED_ARTICLE_IDS);
    const wrong = corruptedFacts.filter((a) => {
      const expected = EXPECTED_CANONICAL[a.id];
      return (
        a.country_slug !== expected.country_slug ||
        a.status !== expected.status ||
        a.is_featured !== expected.is_featured
      );
    });
    expect(wrong).toHaveLength(8);
    // spot-check cross-continent damage
    expect(corruptedFacts.find((a) => a.id === "art-fr-001")).toMatchObject({ continent_slug: "south-america", status: "draft" });
    expect(corruptedFacts.find((a) => a.id === "art-jp-002")).toMatchObject({ continent_slug: "africa", status: "archived" });

    // 3. route orderings really are rotated away from the journal
    const corruptedStops = await routeStops(db.pool, CORRUPTED_ROUTE_IDS);
    expect(corruptedStops.map((s) => `${s.route_id}:${s.stop_number}:${s.place}`)).not.toEqual(
      canonicalStops.map((s) => `${s.route_id}:${s.stop_number}:${s.place}`),
    );

    // 4. two articles were wrongly promoted to featured
    expect(await featuredCount()).toBe(7);

    // 5. engagement + geography + shop fingerprints are untouched
    const fingerprints = await computeFingerprints(db.pool);
    expect(fingerprints.engagement).toBe(canonicalFingerprints.engagement);
    expect(fingerprints.geography).toBe(canonicalFingerprints.geography);
    expect(fingerprints.shop).toBe(canonicalFingerprints.shop);
    expect(fingerprints.content).not.toBe(canonicalFingerprints.content);
  }, 120_000);

  it("repair restores canonical state from evidence and the verifier passes", async () => {
    await runSqlFile(REPAIR_SQL);

    const repaired = await verifyIntegrity(db.pool);
    expect(repaired.ok).toBe(true);
    expect(repaired.violations).toEqual([]);

    // articles back to canonical country/status/featured (from revisions)
    const repairedFacts = await articleFacts(db.pool, CORRUPTED_ARTICLE_IDS);
    for (const [id, facts] of Object.entries(EXPECTED_CANONICAL)) {
      expect(repairedFacts.find((a) => a.id === id), `repaired facts for ${id}`).toMatchObject({
        country_slug: facts.country_slug,
        status: facts.status,
        is_featured: facts.is_featured,
      });
    }
    expect(await featuredCount()).toBe(6);

    // route stops back to the journaled order
    const repairedStops = await routeStops(db.pool, CORRUPTED_ROUTE_IDS);
    expect(repairedStops).toEqual(canonicalStops);

    // every fingerprint domain back to canonical
    const fingerprints = await computeFingerprints(db.pool);
    expect(fingerprints).toEqual(canonicalFingerprints);

    // audit trail: faulty migration flagged, repair recorded
    expect(await repairAuditState()).toEqual({
      "20260903171000_faulty_editorial_migration.sql": "flagged",
      "20260903172000_repair_faulty_editorial_migration.sql": "applied",
    });
  }, 120_000);

  it("repair is idempotent — re-running changes nothing", async () => {
    await runSqlFile(REPAIR_SQL);
    await runSqlFile(REPAIR_SQL);

    const report = await verifyIntegrity(db.pool);
    expect(report.ok).toBe(true);
    const fingerprints = await computeFingerprints(db.pool);
    expect(fingerprints).toEqual(canonicalFingerprints);
    expect(await repairAuditState()).toEqual({
      "20260903171000_faulty_editorial_migration.sql": "flagged",
      "20260903172000_repair_faulty_editorial_migration.sql": "applied",
    });
  }, 120_000);
});
