import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { Article, Continent, Country, Phrase } from "@/data/destinations";
import type { Product } from "@/data/products";
import type { TravelRoute } from "@/data/routes";

/** Stable anonymous visitor id, used so a visitor can like an article once. */
export const getVisitorId = () => {
  const key = "wt_visitor_id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

type ArticleRow = {
  id: string;
  country_id: string | null;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string | null;
  published_at: string;
  content: string[] | null;
  is_featured: boolean;
  like_count: number;
  view_count: number;
};

const toArticle = (r: ArticleRow): Article => ({
  id: r.id,
  title: r.title,
  excerpt: r.excerpt,
  image: r.image,
  category: r.category,
  date: r.published_at,
  author: r.author ?? undefined,
  content: r.content ?? undefined,
  likeCount: r.like_count,
  viewCount: r.view_count,
  isFeatured: r.is_featured,
});

const articleList = async (filter: "featured" | "popular", limit?: number) => {
  const params = new URLSearchParams({ filter: String(filter) });
  if (limit !== undefined) params.set("limit", String(limit));
  const data = await apiFetch<{ articles: ArticleRow[] }>(`/api/articles?${params}`);
  return data.articles.map(toArticle);
};

/** Whole destination tree (continents → countries → articles, without body text). */
export const useDestinations = () => {
  const query = useQuery({
    queryKey: ["destinations"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Continent[]> => {
      const data = await apiFetch<{
        continents: Record<string, unknown>[];
        countries: Record<string, unknown>[];
        articles: ArticleRow[];
      }>("/api/destinations");

      const articlesByCountry = new Map<string, Article[]>();
      for (const row of data.articles) {
        if (!row.country_id) continue;
        const list = articlesByCountry.get(row.country_id) ?? [];
        list.push(toArticle(row));
        articlesByCountry.set(row.country_id, list);
      }

      const countriesByContinent = new Map<string, Country[]>();
      for (const row of data.countries) {
        const country: Country = {
          id: row.id as string,
          name: row.name as string,
          slug: row.slug as string,
          flag: row.flag as string,
          heroImage: row.hero_image as string,
          about: row.about as string,
          bestMonths: (row.best_months as number[]) ?? [],
          categories: (row.categories as string[]) ?? [],
          regions: (row.regions as string[]) ?? [],
          phrases: (row.phrases as unknown as Phrase[]) ?? [],
          articles: articlesByCountry.get(row.id as string) ?? [],
        };
        const list = countriesByContinent.get(row.continent_id as string) ?? [];
        list.push(country);
        countriesByContinent.set(row.continent_id as string, list);
      }

      return data.continents.map((row) => ({
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
        heroImage: row.hero_image as string,
        introduction: row.introduction as string,
        countries: countriesByContinent.get(row.id as string) ?? [],
      }));
    },
  });

  return { continents: query.data ?? [], isLoading: query.isLoading, error: query.error };
};

export const useFeaturedArticles = () => {
  const query = useQuery({
    queryKey: ["featured-articles"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => articleList("featured"),
  });
  return { articles: query.data ?? [], isLoading: query.isLoading };
};

/** Most-read articles across the whole site — powered by the view counter. */
export const usePopularArticles = (limit = 4) => {
  const query = useQuery({
    queryKey: ["popular-articles", limit],
    staleTime: 60 * 1000,
    queryFn: () => articleList("popular", limit),
  });
  return { articles: query.data ?? [], isLoading: query.isLoading };
};

type ArticleDetail = ArticleRow & Record<string, unknown>;

export const useArticle = (articleId: string) => {
  const { continents, isLoading: treeLoading } = useDestinations();

  const query = useQuery({
    queryKey: ["article", articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const data = await apiFetch<{ article: ArticleDetail | null }>(`/api/articles/${encodeURIComponent(articleId)}`);
      return data.article;
    },
  });

  const row = query.data;
  let country: Country | undefined;
  let continent: Continent | undefined;
  if (row?.country_id) {
    for (const c of continents) {
      const found = c.countries.find((co) => co.id === row.country_id);
      if (found) {
        country = found;
        continent = c;
        break;
      }
    }
  }

  return {
    article: row ? toArticle(row) : undefined,
    country,
    continent,
    isLoading: query.isLoading || treeLoading,
  };
};

/** Records a page view once per mount. */
export const useTrackArticleView = (articleId?: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!articleId) return;
      await apiFetch(`/api/articles/${encodeURIComponent(articleId)}/views`, { method: "POST" });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["popular-articles"] });
    },
  });
};

export const useArticleLikes = (articleId?: string) => {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["article-likes", articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const visitorId = getVisitorId();
      const params = new URLSearchParams({ visitorId });
      const data = await apiFetch<{ count: number; liked: boolean }>(
        `/api/articles/${encodeURIComponent(articleId!)}/likes?${params}`,
      );
      return data;
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      const visitorId = getVisitorId();
      await apiFetch(`/api/articles/${encodeURIComponent(articleId!)}/likes`, {
        method: query.data?.liked ? "DELETE" : "POST",
        body: JSON.stringify({ visitorId }),
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["article-likes", articleId] });
    },
  });

  return {
    count: query.data?.count ?? 0,
    liked: query.data?.liked ?? false,
    isLoading: query.isLoading,
    toggle: () => toggle.mutate(),
    isToggling: toggle.isPending,
  };
};

export type Comment = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export const useArticleComments = (articleId?: string) => {
  const client = useQueryClient();

  const query = useQuery({
    queryKey: ["article-comments", articleId],
    enabled: !!articleId,
    queryFn: async () => {
      const data = await apiFetch<{ comments: Comment[] }>(
        `/api/articles/${encodeURIComponent(articleId!)}/comments`,
      );
      return data.comments;
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ name, body }: { name: string; body: string }) => {
      await apiFetch(`/api/articles/${encodeURIComponent(articleId!)}/comments`, {
        method: "POST",
        body: JSON.stringify({ authorName: name, body }),
      });
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["article-comments", articleId] });
    },
  });

  return { comments: query.data ?? [], isLoading: query.isLoading, addComment };
};

export const useSubscribeNewsletter = () =>
  useMutation({
    mutationFn: async ({ email, name, source }: { email: string; name?: string; source?: string }) => {
      await apiFetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, name, source }),
      });
    },
  });

export const useTravelRoutes = () => {
  const query = useQuery({
    queryKey: ["travel-routes"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<TravelRoute[]> => {
      const data = await apiFetch<{ routes: Record<string, unknown>[] }>("/api/routes");
      return data.routes.map((r) => ({
        id: r.id as string,
        title: r.title as string,
        subtitle: r.subtitle as string,
        description: r.description as string,
        duration: r.duration as string,
        image: r.image as string,
        countries: (r.countries as string[]) ?? [],
        difficulty: r.difficulty as TravelRoute["difficulty"],
        bestSeason: r.best_season as string,
        budget: r.budget as string,
        highlights: (r.highlights as string[]) ?? [],
        itinerary: (r.itinerary as unknown as TravelRoute["itinerary"]) ?? [],
        tips: (r.tips as string[]) ?? [],
      }));
    },
  });
  return { routes: query.data ?? [], isLoading: query.isLoading };
};

export const useProducts = () => {
  const query = useQuery({
    queryKey: ["products"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Product[]> => {
      const data = await apiFetch<{ products: Record<string, unknown>[] }>("/api/products");
      return data.products.map((p) => ({
        id: p.id as string,
        name: p.name as string,
        price: Number(p.price),
        rating: Number(p.rating),
        image: p.image as string,
        description: p.description as string,
        features: (p.features as string[]) ?? [],
        pages: p.pages as number,
        format: p.format as string,
        contents: (p.contents as string[]) ?? [],
      }));
    },
  });
  return { products: query.data ?? [], isLoading: query.isLoading };
};
