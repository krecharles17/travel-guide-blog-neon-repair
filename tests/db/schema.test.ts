// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { createIsolatedDb, hasDatabase, type IsolatedDb } from "../helpers/db";
import { verifyIntegrity } from "../../db/verify";

describe.skipIf(!hasDatabase())("schema (isolated database)", () => {
  let db: IsolatedDb;

  beforeAll(async () => {
    db = await createIsolatedDb("wt_schema_test");
  }, 120_000);

  afterAll(async () => {
    await db?.destroy();
  });

  const insertMinimalWorld = async (pool: pg.Pool) => {
    await pool.query(
      `INSERT INTO continents (id, name, slug) VALUES ('11111111-1111-1111-1111-111111111111', 'Test Continent', 'test-continent')`,
    );
    await pool.query(
      `INSERT INTO countries (id, continent_id, name, slug) VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Test Country', 'test-country')`,
    );
    await pool.query(
      `INSERT INTO articles (id, country_id, title) VALUES ('art-test-001', '22222222-2222-2222-2222-222222222222', 'A Test Article')`,
    );
  };

  it("passes its own integrity verification on the canonical seed", async () => {
    const { pool } = db;
    const report = await verifyIntegrity(pool);
    expect(report.violations).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it("keeps like_count in sync with article_likes via trigger", async () => {
    const { pool } = db;
    await insertMinimalWorld(pool);

    await pool.query(
      "INSERT INTO article_likes (article_id, visitor_id) VALUES ('art-test-001', 'visitor-a')",
    );
    await pool.query(
      "INSERT INTO article_likes (article_id, visitor_id) VALUES ('art-test-001', 'visitor-b')",
    );
    let row = await pool.query<{ like_count: number }>(
      "SELECT like_count FROM articles WHERE id = 'art-test-001'",
    );
    expect(row.rows[0].like_count).toBe(2);

    await pool.query(
      "DELETE FROM article_likes WHERE article_id = 'art-test-001' AND visitor_id = 'visitor-b'",
    );
    row = await pool.query("SELECT like_count FROM articles WHERE id = 'art-test-001'");
    expect(row.rows[0].like_count).toBe(1);
  });

  it("enforces one like per (article, visitor)", async () => {
    const { pool } = db;
    await expect(
      pool.query(
        "INSERT INTO article_likes (article_id, visitor_id) VALUES ('art-test-001', 'visitor-a')",
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("increments views atomically", async () => {
    const { pool } = db;
    await pool.query("SELECT increment_article_view('art-test-001')");
    await pool.query("SELECT increment_article_view('art-test-001')");
    const row = await pool.query<{ view_count: number }>(
      "SELECT view_count FROM articles WHERE id = 'art-test-001'",
    );
    expect(row.rows[0].view_count).toBe(2);
  });

  it("validates publication status", async () => {
    const { pool } = db;
    await expect(
      pool.query(
        "INSERT INTO articles (id, country_id, title, status) VALUES ('art-test-002', '22222222-2222-2222-2222-222222222222', 'Bad Status', 'sneaky')",
      ),
    ).rejects.toMatchObject({ code: "23514" });
  });

  it("enforces unique route stop numbering per route", async () => {
    const { pool } = db;
    await pool.query(
      `INSERT INTO travel_routes (id, title) VALUES ('rt-test-001', 'Test Route')`,
    );
    await pool.query(
      `INSERT INTO route_stops (route_id, stop_number, place) VALUES ('rt-test-001', 1, 'Place A')`,
    );
    await expect(
      pool.query(
        `INSERT INTO route_stops (route_id, stop_number, place) VALUES ('rt-test-001', 1, 'Place A again')`,
      ),
    ).rejects.toMatchObject({ code: "23505" });
  });

  it("cascades engagement cleanup when an article is deleted", async () => {
    const { pool } = db;
    await pool.query(
      "INSERT INTO article_comments (article_id, author_name, body) VALUES ('art-test-001', 'Testy', 'A body that is long enough')",
    );
    await pool.query("DELETE FROM articles WHERE id = 'art-test-001'");
    const likes = await pool.query(
      "SELECT * FROM article_likes WHERE article_id = 'art-test-001'",
    );
    const comments = await pool.query(
      "SELECT * FROM article_comments WHERE article_id = 'art-test-001'",
    );
    expect(likes.rows).toHaveLength(0);
    expect(comments.rows).toHaveLength(0);
  });
});
