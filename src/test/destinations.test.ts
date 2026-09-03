import { describe, expect, it } from "vitest";
import { filterAndPaginateArticles, type Article } from "@/data/destinations";

const article = (id: string, category: string): Article => ({
  id,
  category,
  title: id,
  excerpt: "",
  image: "",
  date: "2026-01-01",
});

describe("article filtering and pagination", () => {
  const articles = [
    article("one", "Food"),
    article("two", "Nature"),
    article("three", "Food"),
    article("four", "Food"),
  ];

  it("filters before paginating", () => {
    const result = filterAndPaginateArticles(articles, "Food", 0, 2);
    expect(result.articles.map(({ id }) => id)).toEqual(["one", "three"]);
    expect(result.totalPages).toBe(2);
  });

  it("clamps a stale page after the category changes", () => {
    const result = filterAndPaginateArticles(articles, "Nature", 4, 2);
    expect(result.page).toBe(0);
    expect(result.articles.map(({ id }) => id)).toEqual(["two"]);
  });

  it("handles a category with no articles", () => {
    expect(filterAndPaginateArticles(articles, "History", 2, 2)).toEqual({
      articles: [],
      page: 0,
      totalPages: 0,
    });
  });
});
