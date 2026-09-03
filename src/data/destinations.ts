export interface Article {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  content?: string[];
  author?: string;
  likeCount?: number;
  viewCount?: number;
  isFeatured?: boolean;
}

export interface Phrase {
  original: string;
  translation: string;
  language: string;
}

export interface Country {
  id: string;
  name: string;
  slug: string;
  flag: string;
  heroImage: string;
  about: string;
  articles: Article[];
  bestMonths: number[];
  phrases?: Phrase[];
  categories?: string[];
  regions?: string[];
}

export interface Continent {
  id: string;
  name: string;
  slug: string;
  heroImage: string;
  introduction: string;
  countries: Country[];
}

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getContinentBySlug = (continents: Continent[], slug: string) =>
  continents.find((c) => c.slug === slug);

export const getCountryBySlug = (continents: Continent[], continentSlug: string, countrySlug: string) =>
  getContinentBySlug(continents, continentSlug)?.countries.find((c) => c.slug === countrySlug);

export const getAllArticles = (continents: Continent[]): Article[] =>
  continents.flatMap((c) => c.countries.flatMap((co) => co.articles));

export const filterAndPaginateArticles = (
  articles: Article[],
  category: string | null,
  requestedPage: number,
  perPage: number,
) => {
  const filtered = category ? articles.filter((article) => article.category === category) : articles;
  const totalPages = Math.ceil(filtered.length / perPage);
  const page = Math.min(Math.max(requestedPage, 0), totalPages);
  return {
    articles: filtered.slice(page * perPage, (page + 1) * perPage),
    page,
    totalPages,
  };
};
