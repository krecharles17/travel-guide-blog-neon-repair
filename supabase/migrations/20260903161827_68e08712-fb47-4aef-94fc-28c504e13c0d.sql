
CREATE TABLE public.continents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  hero_image text NOT NULL DEFAULT '',
  introduction text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id uuid NOT NULL REFERENCES public.continents(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  flag text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  about text NOT NULL DEFAULT '',
  best_months int[] NOT NULL DEFAULT '{}',
  categories text[] NOT NULL DEFAULT '{}',
  regions text[] NOT NULL DEFAULT '{}',
  phrases jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (continent_id, slug)
);

CREATE TABLE public.articles (
  id text PRIMARY KEY,
  country_id uuid REFERENCES public.countries(id) ON DELETE CASCADE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  author text,
  published_at date NOT NULL DEFAULT current_date,
  content text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  like_count int NOT NULL DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX articles_country_idx ON public.articles(country_id);

CREATE TABLE public.travel_routes (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  countries text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'Easy',
  best_season text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  tips text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 5,
  image text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  features text[] NOT NULL DEFAULT '{}',
  pages int NOT NULL DEFAULT 0,
  format text NOT NULL DEFAULT '',
  contents text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE public.article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, visitor_id)
);

CREATE TABLE public.article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX article_comments_article_idx ON public.article_comments(article_id, created_at DESC);

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.continents TO anon, authenticated;
GRANT SELECT ON public.countries TO anon, authenticated;
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT SELECT ON public.travel_routes TO anon, authenticated;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.article_likes TO anon, authenticated;
GRANT SELECT, INSERT ON public.article_comments TO anon, authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.continents, public.countries, public.articles, public.travel_routes,
  public.products, public.article_likes, public.article_comments, public.newsletter_subscribers TO service_role;

ALTER TABLE public.continents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read continents" ON public.continents FOR SELECT USING (true);
CREATE POLICY "Public can read countries" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public can read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Public can read routes" ON public.travel_routes FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON public.products FOR SELECT USING (true);

CREATE POLICY "Public can read likes" ON public.article_likes FOR SELECT USING (true);
CREATE POLICY "Public can like" ON public.article_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can unlike" ON public.article_likes FOR DELETE USING (true);

CREATE POLICY "Public can read comments" ON public.article_comments FOR SELECT USING (true);
CREATE POLICY "Public can post comments" ON public.article_comments FOR INSERT
  WITH CHECK (length(trim(author_name)) BETWEEN 1 AND 60 AND length(trim(body)) BETWEEN 2 AND 2000);

CREATE POLICY "Public can subscribe" ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (position('@' in email) > 1 AND length(email) <= 200);

CREATE OR REPLACE FUNCTION public.sync_article_like_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles SET like_count = like_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER article_likes_sync
AFTER INSERT OR DELETE ON public.article_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_article_like_count();

CREATE OR REPLACE FUNCTION public.increment_article_view(_article_id text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles SET view_count = view_count + 1 WHERE id = _article_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_view(text) TO anon, authenticated;
