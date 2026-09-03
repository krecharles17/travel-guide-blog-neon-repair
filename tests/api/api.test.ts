// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { createApp } from "../../server/app";
import type { DbClient } from "../../server/db";
import { createIsolatedDb, hasDatabase, type IsolatedDb } from "../helpers/db";

describe.skipIf(!hasDatabase())("server API (isolated database)", () => {
  let db: IsolatedDb;
  let baseUrl: string;
  let server: http.Server;

  beforeAll(async () => {
    db = await createIsolatedDb("wt_api_test");
    const client: DbClient = {
      query: (sql, params) => db.pool.query(sql, params as never[]),
      close: () => db.pool.end(),
    };
    server = http.createServer(createApp(client));
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  }, 120_000);

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db?.destroy();
  });

  const getJson = async <T>(path: string): Promise<{ status: number; body: T }> => {
    const res = await fetch(`${baseUrl}${path}`);
    return { status: res.status, body: (await res.json()) as T };
  };

  it("reports health", async () => {
    const { status, body } = await getJson<{ ok: boolean }>("/api/health");
    expect(status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("serves the full destination tree", async () => {
    const { status, body } = await getJson<{
      continents: { id: string; slug: string; countries: never[] }[];
      countries: { id: string; continent_id: string }[];
      articles: { id: string; country_id: string }[];
    }>("/api/destinations");
    expect(status).toBe(200);
    expect(body.continents).toHaveLength(6);
    expect(body.countries).toHaveLength(60);
    // 360 articles minus the 6 featured ones that stay out of the tree
    expect(body.articles).toHaveLength(354);
    const europe = body.continents.find((c) => c.slug === "europe");
    expect(europe).toBeDefined();
  });

  it("serves featured and popular article lists", async () => {
    const featured = await getJson<{ articles: { id: string; is_featured: boolean }[] }>(
      "/api/articles?filter=featured",
    );
    expect(featured.status).toBe(200);
    expect(featured.body.articles).toHaveLength(6);
    expect(featured.body.articles.every((a) => a.is_featured)).toBe(true);

    const popular = await getJson<{ articles: { id: string; view_count: number }[] }>(
      "/api/articles?filter=popular&limit=4",
    );
    expect(popular.body.articles).toHaveLength(4);
    const counts = popular.body.articles.map((a) => a.view_count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  it("serves a single article with body content", async () => {
    const { status, body } = await getJson<{
      article: { id: string; content: string[] } | null;
    }>("/api/articles/art-fr-001");
    expect(status).toBe(200);
    expect(body.article?.id).toBe("art-fr-001");
    expect(body.article?.content.length).toBeGreaterThan(3);
  });

  it("returns null for unknown articles", async () => {
    const { body } = await getJson<{ article: unknown }>("/api/articles/art-does-not-exist");
    expect(body.article).toBeNull();
  });

  it("tracks article views", async () => {
    const before = await getJson<{ article: { view_count: number } }>(
      "/api/articles/art-jp-001",
    );
    const res = await fetch(`${baseUrl}/api/articles/art-jp-001/views`, { method: "POST" });
    expect(res.status).toBe(200);
    const after = await getJson<{ article: { view_count: number } }>("/api/articles/art-jp-001");
    expect(after.body.article.view_count).toBe(before.body.article.view_count + 1);
  });

  it("likes, unlikes and reports like state per visitor", async () => {
    const path = "/api/articles/art-it-001/likes";
    const visitor = { visitorId: "api-test-visitor" };

    const before = await getJson<{ count: number; liked: boolean }>(
      `${path}?visitorId=${visitor.visitorId}`,
    );

    const liked = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor),
    });
    expect(liked.status).toBe(201);
    const likedBody = (await liked.json()) as { liked: boolean; count: number };
    expect(likedBody.liked).toBe(true);
    expect(likedBody.count).toBe(before.body.count + 1);

    const unliked = await fetch(`${baseUrl}${path}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(visitor),
    });
    const unlikedBody = (await unliked.json()) as { liked: boolean; count: number };
    expect(unlikedBody.liked).toBe(false);
    expect(unlikedBody.count).toBe(before.body.count);
  });

  it("lists comments newest-first and accepts new ones", async () => {
    const list1 = await getJson<{ comments: { id: string; created_at: string }[] }>(
      "/api/articles/art-gr-001/comments",
    );
    expect(list1.body.comments.length).toBeGreaterThan(0);
    const times = list1.body.comments.map((c) => c.created_at);
    expect([...times].sort().reverse()).toEqual(times);

    const res = await fetch(`${baseUrl}/api/articles/art-gr-001/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: "API Tester", body: "A comment from the automated test." }),
    });
    expect(res.status).toBe(201);
    const list2 = await getJson<{ comments: { author_name: string }[] }>(
      "/api/articles/art-gr-001/comments",
    );
    expect(list2.body.comments[0].author_name).toBe("API Tester");
  });

  it("rejects invalid comments", async () => {
    const res = await fetch(`${baseUrl}/api/articles/art-gr-001/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorName: "x", body: "y" }),
    });
    expect(res.status).toBe(400);
  });

  it("subscribes new readers and flags duplicates with the Postgres unique code", async () => {
    const res1 = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "fresh-reader@example.com", name: "Fresh", source: "inline" }),
    });
    expect(res1.status).toBe(201);

    const res2 = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "fresh-reader@example.com", source: "inline" }),
    });
    expect(res2.status).toBe(409);
    expect(await res2.json()).toMatchObject({ code: "23505" });

    const res3 = await fetch(`${baseUrl}/api/newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    expect(res3.status).toBe(400);
  });

  it("serves routes with itinerary data", async () => {
    const { status, body } = await getJson<{
      routes: { id: string; itinerary: unknown[] }[];
    }>("/api/routes");
    expect(status).toBe(200);
    expect(body.routes).toHaveLength(40);
    expect(body.routes[0].itinerary.length).toBeGreaterThan(2);
  });

  it("serves the product catalog", async () => {
    const { status, body } = await getJson<{ products: { id: string; price: number }[] }>(
      "/api/products",
    );
    expect(status).toBe(200);
    expect(body.products).toHaveLength(100);
  });

  it("returns 404 JSON for unknown API paths", async () => {
    const { status } = await getJson("/api/nope");
    expect(status).toBe(404);
  });
});
