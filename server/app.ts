import path from "node:path";
import express from "express";
import type { DbClient } from "./db";

type Row = Record<string, unknown>;

const ARTICLE_LIST_COLUMNS =
  "id, country_id, title, excerpt, image, category, author, published_at, is_featured, like_count, view_count";

const badRequest = (res: express.Response, message: string) => res.status(400).json({ error: message });

/** Wraps an async handler so rejections become 500 JSON responses. */
const h =
  (fn: (req: express.Request, res: express.Response) => Promise<unknown>) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    fn(req, res).catch(next);
  };

export const createApp = (db: DbClient, options: { staticDir?: string } = {}) => {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  // Static SPA bundle (production) — must be registered before the 404 handler.
  if (options.staticDir) {
    app.use(express.static(options.staticDir));
  }

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.get(
    "/api/destinations",
    h(async (_req, res) => {
      const [continents, countries, articles] = await Promise.all([
        db.query<Row>("SELECT * FROM continents ORDER BY sort_order, name"),
        db.query<Row>("SELECT * FROM countries ORDER BY sort_order, name"),
        db.query<Row>(
          `SELECT ${ARTICLE_LIST_COLUMNS} FROM articles WHERE is_featured = false ORDER BY published_at DESC`,
        ),
      ]);
      res.json({ continents: continents.rows, countries: countries.rows, articles: articles.rows });
    }),
  );

  app.get(
    "/api/articles",
    h(async (req, res) => {
      const filter = req.query.filter;
      if (filter === "featured") {
        const result = await db.query<Row>(
          `SELECT ${ARTICLE_LIST_COLUMNS} FROM articles WHERE is_featured = true ORDER BY published_at DESC`,
        );
        res.json({ articles: result.rows });
        return;
      }
      if (filter === "popular") {
        const limitRaw = req.query.limit;
        const parsed = typeof limitRaw === "string" ? Number.parseInt(limitRaw, 10) : NaN;
        const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 24) : 4;
        const result = await db.query<Row>(
          `SELECT ${ARTICLE_LIST_COLUMNS} FROM articles ORDER BY view_count DESC, id LIMIT $1`,
          [limit],
        );
        res.json({ articles: result.rows });
        return;
      }
      badRequest(res, "Unknown article filter. Use ?filter=featured or ?filter=popular.");
    }),
  );

  app.get(
    "/api/articles/:id",
    h(async (req, res) => {
      const result = await db.query<Row>("SELECT * FROM articles WHERE id = $1", [req.params.id]);
      res.json({ article: result.rows[0] ?? null });
    }),
  );

  app.post(
    "/api/articles/:id/views",
    h(async (req, res) => {
      const result = await db.query<Row>(
        "UPDATE articles SET view_count = view_count + 1 WHERE id = $1 RETURNING view_count",
        [req.params.id],
      );
      if (!result.rows[0]) {
        res.status(404).json({ error: "Article not found" });
        return;
      }
      res.json({ view_count: result.rows[0].view_count });
    }),
  );

  app.get(
    "/api/articles/:id/likes",
    h(async (req, res) => {
      const articleId = req.params.id;
      const visitorId = typeof req.query.visitorId === "string" ? req.query.visitorId : "";
      const countResult = await db.query<{ count: number }>(
        "SELECT COUNT(*)::int AS count FROM article_likes WHERE article_id = $1",
        [articleId],
      );
      let liked = false;
      if (visitorId) {
        const mine = await db.query<Row>(
          "SELECT 1 FROM article_likes WHERE article_id = $1 AND visitor_id = $2 LIMIT 1",
          [articleId, visitorId],
        );
        liked = mine.rows.length > 0;
      }
      res.json({ count: countResult.rows[0]?.count ?? 0, liked });
    }),
  );

  app.post(
    "/api/articles/:id/likes",
    h(async (req, res) => {
      const articleId = req.params.id;
      const visitorId = typeof req.body?.visitorId === "string" ? req.body.visitorId.trim() : "";
      if (!visitorId || visitorId.length > 100) return badRequest(res, "visitorId is required");
      const exists = await db.query<Row>("SELECT 1 FROM articles WHERE id = $1", [articleId]);
      if (!exists.rows[0]) return res.status(404).json({ error: "Article not found" });
      await db.query(
        "INSERT INTO article_likes (article_id, visitor_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [articleId, visitorId],
      );
      const countResult = await db.query<{ count: number }>(
        "SELECT COUNT(*)::int AS count FROM article_likes WHERE article_id = $1",
        [articleId],
      );
      res.status(201).json({ liked: true, count: countResult.rows[0]?.count ?? 0 });
    }),
  );

  app.delete(
    "/api/articles/:id/likes",
    h(async (req, res) => {
      const articleId = req.params.id;
      const visitorId = typeof req.body?.visitorId === "string" ? req.body.visitorId.trim() : "";
      if (!visitorId) return badRequest(res, "visitorId is required");
      await db.query("DELETE FROM article_likes WHERE article_id = $1 AND visitor_id = $2", [
        articleId,
        visitorId,
      ]);
      const countResult = await db.query<{ count: number }>(
        "SELECT COUNT(*)::int AS count FROM article_likes WHERE article_id = $1",
        [articleId],
      );
      res.json({ liked: false, count: countResult.rows[0]?.count ?? 0 });
    }),
  );

  app.get(
    "/api/articles/:id/comments",
    h(async (req, res) => {
      const result = await db.query<Row>(
        "SELECT id, author_name, body, created_at FROM article_comments WHERE article_id = $1 ORDER BY created_at DESC, id DESC",
        [req.params.id],
      );
      res.json({ comments: result.rows });
    }),
  );

  app.post(
    "/api/articles/:id/comments",
    h(async (req, res) => {
      const articleId = req.params.id;
      const authorName = typeof req.body?.authorName === "string" ? req.body.authorName.trim() : "";
      const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";
      if (authorName.length < 1 || authorName.length > 60) return badRequest(res, "Name must be 1-60 characters");
      if (body.length < 2 || body.length > 2000) return badRequest(res, "Comment must be 2-2000 characters");
      const exists = await db.query<Row>("SELECT 1 FROM articles WHERE id = $1", [articleId]);
      if (!exists.rows[0]) return res.status(404).json({ error: "Article not found" });
      const inserted = await db.query<Row>(
        "INSERT INTO article_comments (article_id, author_name, body) VALUES ($1, $2, $3) RETURNING id, author_name, body, created_at",
        [articleId, authorName, body],
      );
      res.status(201).json({ comment: inserted.rows[0] });
    }),
  );

  app.post(
    "/api/newsletter",
    h(async (req, res) => {
      const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      const source = typeof req.body?.source === "string" ? req.body.source.trim() : "";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
        return badRequest(res, "A valid email address is required");
      }
      try {
        await db.query("INSERT INTO newsletter_subscribers (email, name, source) VALUES ($1, $2, $3)", [
          email,
          name || null,
          source || null,
        ]);
      } catch (err) {
        if ((err as { code?: string }).code === "23505") {
          res.status(409).json({ error: "That email address is already on our list.", code: "23505" });
          return;
        }
        throw err;
      }
      res.status(201).json({ ok: true });
    }),
  );

  app.get(
    "/api/routes",
    h(async (_req, res) => {
      const result = await db.query<Row>("SELECT * FROM travel_routes ORDER BY sort_order, id");
      res.json({ routes: result.rows });
    }),
  );

  app.get(
    "/api/products",
    h(async (_req, res) => {
      const result = await db.query<Row>("SELECT * FROM products ORDER BY sort_order, id");
      res.json({ products: result.rows });
    }),
  );

  // SPA fallback for client-side routes (only when serving the built bundle).
  if (options.staticDir) {
    app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(path.join(options.staticDir!, "index.html")));
  }

  app.use((_req, res) => res.status(404).json({ error: "Not found" }));

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("[api] unexpected error:", err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};
