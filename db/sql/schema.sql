-- ============================================================
-- Wanderlust — canonical Neon PostgreSQL schema
-- ============================================================
-- Derived from the original Supabase migrations plus editorial
-- governance tables needed for provenance and repair:
--   editorial_revisions  — canonical per-article editorial facts
--   migration_audit      — append-only record of applied migrations
--   route_stops          — ordered stop list per travel route
--   route_stop_history   — append-only stop reordering journal
--
-- Table names are intentionally unqualified: the schema can be
-- applied to `public` (production) or to an isolated schema
-- (tests) by setting the session `search_path` first.
--
-- SECURITY: row-level security and anon-role grants from the old
-- Supabase setup are intentionally gone. The browser never talks
-- to the database; the server-side API is the security boundary.
-- ============================================================

CREATE TABLE continents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  hero_image text NOT NULL DEFAULT '',
  introduction text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  continent_id uuid NOT NULL REFERENCES continents(id) ON DELETE CASCADE,
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

-- `status` extends the original table: publication lifecycle used
-- by the editorial workflow and the repair scenario.
CREATE TABLE articles (
  id text PRIMARY KEY,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  author text,
  published_at date NOT NULL DEFAULT current_date,
  content text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  like_count int NOT NULL DEFAULT 0,
  view_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX articles_country_idx ON articles(country_id);
CREATE INDEX articles_published_idx ON articles(published_at DESC);

CREATE TABLE travel_routes (
  id text PRIMARY KEY,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  duration text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  countries text[] NOT NULL DEFAULT '{}',
  difficulty text NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Moderate', 'Challenging')),
  best_season text NOT NULL DEFAULT '',
  budget text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  itinerary jsonb NOT NULL DEFAULT '[]'::jsonb,
  tips text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE products (
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

CREATE TABLE article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, visitor_id)
);
CREATE INDEX article_likes_article_idx ON article_likes(article_id);

CREATE TABLE article_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX article_comments_article_idx ON article_comments(article_id, created_at DESC);

CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Editorial governance (provenance + repair evidence)
-- ------------------------------------------------------------

-- One row per editorial decision. The row with the highest
-- revision_no for an article is the canonical assignment
-- (country_id, status, is_featured) for that article.
CREATE TABLE editorial_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  revision_no int NOT NULL,
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  title text NOT NULL DEFAULT '',
  editor text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, revision_no)
);
CREATE INDEX editorial_revisions_article_idx ON editorial_revisions(article_id, revision_no DESC);

CREATE TABLE migration_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  applied_by text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'reverted', 'flagged')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE route_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id text NOT NULL REFERENCES travel_routes(id) ON DELETE CASCADE,
  stop_number int NOT NULL CHECK (stop_number >= 1),
  country_id uuid REFERENCES countries(id) ON DELETE SET NULL,
  place text NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  day_label text NOT NULL DEFAULT '',
  UNIQUE (route_id, stop_number)
);
CREATE INDEX route_stops_route_idx ON route_stops(route_id, stop_number);

-- Append-only journal: every legit reordering writes a row. The
-- latest row per stop is the canonical stop_number. Direct SQL
-- edits that skip this journal (like the faulty migration) are
-- therefore detectable and reversible.
CREATE TABLE route_stop_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id text NOT NULL REFERENCES travel_routes(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES route_stops(id) ON DELETE CASCADE,
  previous_stop_number int,
  new_stop_number int NOT NULL,
  changed_by text NOT NULL DEFAULT '',
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX route_stop_history_stop_idx ON route_stop_history(stop_id, created_at DESC);

-- ------------------------------------------------------------
-- Functions & triggers (schema-aware so tests can isolate)
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION sync_article_like_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    EXECUTE format('UPDATE %I.articles SET like_count = like_count + 1 WHERE id = $1', TG_TABLE_SCHEMA)
      USING NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    EXECUTE format('UPDATE %I.articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1', TG_TABLE_SCHEMA)
      USING OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER article_likes_sync
AFTER INSERT OR DELETE ON article_likes
FOR EACH ROW EXECUTE FUNCTION sync_article_like_count();

CREATE OR REPLACE FUNCTION increment_article_view(_article_id text)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE articles SET view_count = view_count + 1 WHERE id = _article_id;
$$;
