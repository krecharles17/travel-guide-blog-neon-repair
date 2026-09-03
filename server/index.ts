import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { createDb } from "./db";
import { createApp } from "./app";

const here = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(here, "../dist");

const db = await createDb();
const app = createApp(db, { staticDir: fs.existsSync(distDir) ? distDir : undefined });

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  console.log(`[server] API listening on http://localhost:${port} (serving dist: ${fs.existsSync(distDir)})`);
});

const shutdown = async () => {
  await db.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
