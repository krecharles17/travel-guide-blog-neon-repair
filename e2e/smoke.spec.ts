import { expect, test } from "../playwright-fixture";

test("serves the application shell and published destinations", async ({ page, request }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Wanderlust Chronicles/i);

  const response = await request.get("/api/destinations");
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as { articles: { status: string }[] };
  expect(body.articles.length).toBeGreaterThan(0);
  expect(body.articles.every((article) => article.status === "published")).toBe(true);
});
