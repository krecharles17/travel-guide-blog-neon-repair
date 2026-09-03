

# Wanderlust — Editorial Travel Blog & Digital Shop Template

## Suggested Template Name & Slug
- **Template Name**: Wanderlust — Editorial Travel Blog & Destination Guide
- **URL Slug**: `wanderlust`

---

## 1. UI/UX Features & Components

### Actually Used Components (15 custom + Layout system)

| Component | Location | Purpose |
|-----------|----------|---------|
| `Header` | Global via Layout | Sticky nav with mega-menu, search overlay, mobile drawer |
| `Footer` | Global via Layout | 4-column footer with social links, product cards |
| `Layout` | Wrapper | Scroll-to-top on route change, sticky header/footer structure |
| `ArticleCard` | Index, ContinentPage, CountryPage, ArticlePage | Reusable blog card with category badge, image, excerpt, CTA |
| `NewsletterSignup` | 3 variants used across all pages | Inline, hero (image bg), and split (2-col image+form) |
| `CookieConsent` | Global modal | Animated GDPR cookie consent modal with localStorage persistence |
| `NavLink` | Header nav | Navigation link component |

### Interactive Elements
- **Hero Image Carousel** (Index): Auto-advances every 6s with crossfade opacity transitions; 3 slides
- **Mega Menu** (Header): Hover-triggered dropdown showing all 7 continents with country sub-links; `AnimatePresence` for enter/exit
- **Search Overlay** (Header): Expandable search bar with animated height transition
- **Mobile Drawer** (Header): Right-slide panel (`spring` transition, damping: 25, stiffness: 200) with full navigation tree
- **Category Filter** (CountryPage): Clickable icon circles that toggle article filtering by category
- **Pagination** (CountryPage): Numbered page buttons, 6 articles per page
- **Social Share Buttons** (ArticlePage): Facebook, Twitter, generic share icons
- **Cookie Consent Modal** (Global): Full-screen backdrop blur overlay, accept/reject with localStorage

### Layout Systems
- **CSS Grid**: 1→2→3 col responsive grids for articles; 1→2→4 col for shop products; 2-col for content+image sections
- **Flexbox**: Navigation, pill/tag groups, month selectors, footer columns
- **Max-width containers**: `max-w-7xl` (1280px) primary, `max-w-6xl`, `max-w-5xl`, `max-w-4xl`, `max-w-3xl` for content

### Navigation Patterns
- **Sticky header** with backdrop blur (`bg-card/95 backdrop-blur-sm`)
- **Breadcrumbs** on Destinations, Continent, Country, and Article pages (custom `›` separator)
- **Mega menu** with 7-column continent/country grid
- **Pill-based navigation**: Country flags + names as rounded pills; region pills; month selector pills; continent tag pills
- **Back links**: `← Back to [parent]` on detail pages
- **"Also in [Continent]"** cross-navigation section on country pages
- **"More travel routes"** / **"You might also like"** related content sections

### Visual Effects
- **Framer Motion animations**: `fade-in` with `y` offset on scroll (`whileInView`), horizontal slide (`x`) for alternating layouts, scale transitions for images
- **Image hover zoom**: `group-hover:scale-105 transition-transform duration-500` on all card images
- **Gradient overlays**: Multiple gradient styles on hero images (`from-foreground/40 via-foreground/20 to-foreground/50`)
- **Wavy SVG dividers**: Custom SVG wave paths separating hero sections from content
- **Mountain silhouette SVG**: Layered SVG mountain range on Destinations and Continent hero sections
- **Stamp badge**: Circular rotating badge element (`transform: rotate(-15deg)`, `border-radius: 50%`)
- **Backdrop blur**: Used on search overlay, cookie consent, mobile menu, breadcrumb bar
- **Button hover transitions**: Pill buttons transition from outline to filled on hover (`hover:bg-primary hover:text-primary-foreground`)
- **Link gap animation**: Back links animate gap on hover (`hover:gap-3 transition-all`)

### Form Elements
- **Newsletter signup** (3 variants): Email input, name+email inputs, submit buttons
- **Search input**: Full-width with icon prefix
- **Hero search**: Card-style input with `Search` icon and backdrop blur

---

## 2. Typography & Design System

### Fonts
- **Display**: `Cormorant Garamond` (Google Fonts) — serif, italic style for headings
  - Weights: 400, 500, 600, 700 (regular), 400, 500 (italic)
  - Applied via CSS `font-family` rule on all `h1-h6` elements and `.font-display` utility
- **Body**: `DM Sans` (Google Fonts) — geometric sans-serif
  - Weights: 300, 400, 500, 600, 700
  - Applied as default `font-sans` via Tailwind config

### Typography Hierarchy
- **Page titles (h1)**: `text-4xl md:text-5xl lg:text-7xl font-bold italic tracking-tight` (Cormorant Garamond)
- **Section headings (h2)**: `text-3xl md:text-4xl font-bold italic` or `text-2xl md:text-3xl`
- **Card titles (h3)**: `text-xl font-bold` or `text-lg font-bold`
- **Kickers/labels**: `text-[10px] uppercase tracking-[0.3em] font-medium` (DM Sans) — used extensively as section pre-headers
- **Body text**: `text-sm` or `text-base md:text-lg` with `leading-relaxed`
- **Category badges**: `text-[10px] uppercase tracking-[0.15em] font-semibold`
- **Meta text**: `text-xs text-muted-foreground`

### Type Scale
- Fixed Tailwind rem values: `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px), `text-2xl`–`text-7xl`
- Responsive scaling with Tailwind breakpoints (e.g., `text-4xl md:text-5xl lg:text-7xl`)

### Letter-spacing
- Section kickers: `tracking-[0.3em]`, `tracking-[0.4em]`
- Category labels: `tracking-[0.15em]`, `tracking-[0.2em]`, `tracking-[0.25em]`
- Navigation: `tracking-wide`
- Headings: `tracking-tight`

---

## 3. Color System

### CSS Custom Properties (HSL format)

**Light Mode:**
| Token | HSL | Approximate Hex | Usage |
|-------|-----|-----------------|-------|
| `--background` | `40 33% 96%` | `#F5F0E8` | Page background (warm sand) |
| `--foreground` | `30 10% 15%` | `#262220` | Primary text (dark brown) |
| `--primary` | `55 30% 42%` | `#6B7B3A` | Olive green — CTAs, links, accents |
| `--primary-foreground` | `40 33% 96%` | `#F5F0E8` | Text on primary |
| `--secondary` | `40 20% 80%` | `#D4C9B8` | Warm beige — star ratings |
| `--muted` | `40 25% 91%` | `#EDE6D9` | Muted backgrounds |
| `--muted-foreground` | `30 8% 45%` | `#787068` | Secondary text |
| `--card` | `40 30% 98%` | `#FCF9F4` | Card surfaces |
| `--border` | `40 20% 85%` | `#DDD4C5` | Borders |
| `--destructive` | `0 84% 60%` | `#EF4444` | Error states |

**Earth palette (custom tokens):**
| Token | HSL | Usage |
|-------|-----|-------|
| `--earth-dark` | `30 15% 22%` | Footer, dark hero overlays |
| `--earth-olive` | `55 30% 42%` | Stamp badges, accent borders |
| `--earth-sand` | `40 33% 96%` | Same as background |
| `--earth-cream` | `40 35% 92%` | Section alternating backgrounds |
| `--earth-warm` | `30 40% 60%` | Warm accent color |

**Dark Mode:** Full dark mode color scheme defined with inverted values (`--background: 30 15% 8%`, `--primary: 55 35% 50%`, etc.). Dark mode is defined but not actively toggled in the UI (no theme switcher implemented).

---

## 4. Spacing & Layout System

### Spacing
- Standard Tailwind scale used throughout
- Section padding: `py-16 md:py-20` or `py-16 md:py-24` (vertical rhythm)
- Container horizontal padding: `px-4 md:px-8` or `px-6 md:px-16`
- Card internal padding: `p-5`, `p-6`, `p-8`
- Grid gaps: `gap-8` (articles), `gap-12` (content sections), `gap-6` (icon grids)
- Pill/tag gaps: `gap-2`, `gap-3`

### Border Radius
- `--radius: 0.5rem` (8px) base
- Cards: `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px)
- Pills: `rounded-full`
- Inputs: `rounded-md` (6px)

### Shadows
- Card hover: `hover:shadow-xl transition-shadow`
- Cards: `shadow-md`, `shadow-lg`
- Mobile menu: `shadow-2xl`
- Cookie modal: `shadow-2xl`

### Container Max-widths
- Primary content: `max-w-7xl` (1280px)
- Narrow content: `max-w-4xl`, `max-w-3xl`
- Article prose: `max-w-4xl`
- Newsletter: `max-w-3xl` centered

---

## 5. Responsive Design & Mobile

### Breakpoints
- Standard Tailwind: `sm` (640px), `md` (768px), `lg` (1024px), `2xl` (1400px container)

### Mobile-Specific Features
- **Hamburger menu** → right-side slide drawer with full navigation tree (springs animation)
- **Stamp badge** hidden on mobile (`hidden md:flex`)
- **Grid collapse**: 3-col → 2-col → 1-col article grids; 4-col → 2-col → 1-col shop grid
- **Hero height**: `h-[90vh] min-h-[600px]` on index, `h-[50vh] min-h-[350px]` on country pages
- **Newsletter form**: Vertical stack on mobile (`flex-col sm:flex-row`)
- **Mega menu**: Hidden on mobile, replaced by drawer navigation
- **Breadcrumbs**: `flex-wrap` for narrow screens
- **Font scaling**: All headings scale responsively (e.g., `text-4xl md:text-5xl lg:text-7xl`)

---

## 6. Performance & Optimization

- **Lazy loading images**: `loading="lazy"` on all non-hero card images
- **Code splitting**: React `lazy()` + `Suspense` for all page routes except Index (eagerly loaded)
- **Loading spinner**: Centered spinning border animation as Suspense fallback
- **Framer Motion `viewport: { once: true }`**: Scroll animations fire only once
- **Staggered animation delays**: `transition={{ delay: i * 0.1 }}` to avoid paint storms
- **Image optimization**: Static JPG assets in `src/assets/` (12 images), bundled via Vite

---

## 7. Accessibility Features

- **ARIA labels**: `aria-label` on Search, Cart, Menu, and social share buttons
- **Semantic HTML**: `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>` used correctly
- **Keyboard-accessible buttons**: All interactive elements are `<button>` or `<a>` elements
- **Focus styles**: `focus:outline-none focus:ring-2 focus:ring-ring` on inputs; `focus-visible:ring-2` on buttons
- **Alt text**: All images have descriptive `alt` attributes
- **Color contrast**: Dark text on light backgrounds; light text on dark overlays

---

## 8. SEO & Discoverability

- **Title tag**: "Wanderlust Chronicles - Travel Blog & Destination Guides"
- **Meta description**: Full descriptive content tag
- **Open Graph tags**: `og:type`, `og:title`, `og:description`, `og:image` (with hosted preview image)
- **Twitter Card tags**: `summary_large_image` card type with `twitter:site`, `twitter:title`, `twitter:description`, `twitter:image`
- **Favicon**: `/favicon.ico` configured
- **robots.txt**: Present in `/public/robots.txt`
- **SPA limitation**: Client-side routing — no SSR/SSG, no sitemap.xml, no structured data/JSON-LD

---

## 9. Content Features

### Content Types
- **Articles/Blog Posts**: ~100+ articles across 26 countries with full multi-paragraph content, author attribution, category, date
- **Country Guides**: 26 countries across 7 continents with hero images, about text, best-visit-months, local phrases, categories, regions
- **Continent Pages**: 7 continents with introduction text, country listings
- **Travel Routes/Itineraries**: 5 detailed multi-week routes with day-by-day itinerary, highlights, tips, difficulty, budget, season
- **Digital Products**: 4 travel guide ebooks with pricing, ratings, features, table of contents
- **Featured Articles**: 3 standalone featured articles on the homepage

### Content Organization
- **Geographic hierarchy**: Continent → Country → Article (3 levels)
- **Category filtering**: Per-country category icon filters (Culture, Nature, Food, Islands, etc.)
- **Region pills**: Sub-destination navigation within countries
- **Country flag emoji pills**: Visual country navigation with flag emojis
- **Month-based travel planning**: Interactive month selector highlighting best-visit periods

### Content Discovery
- **Related articles**: Random selection of 3 articles on article detail pages
- **"Also in [Continent]"**: Sibling country navigation on country pages
- **"More travel routes"**: Related route suggestions on route detail pages
- **"You might also like"**: Cross-sell products on product detail pages
- **Featured articles grid**: Curated 3-article grid on homepage
- **Popular destinations by continent**: 4-continent summary cards on homepage

---

## 10. Theming & Customization

- **Dark mode CSS defined** but **no toggle UI** — dark class variables are set in CSS but no theme switcher component exists
- **CSS custom properties**: All colors use HSL CSS variables, making theme changes trivial
- **Tailwind config**: Fully extended with custom color tokens (`earth.*`), font families, animations, border radius

---

## 11. Integration & Extension Points

- **No active backend integrations** — all data is static TypeScript files
- **No Lovable Cloud** — no Supabase, no edge functions, no database
- **No authentication** — no login/signup
- **No payment processing** — cart/shop buttons are UI-only (no checkout flow)
- **No analytics** — no Google Analytics, Plausible, or tracking
- **Newsletter forms** — UI only, no email service connected
- **Social links** — placeholder `href="#"` links
- **Spotify link** — external link to `open.spotify.com`
- **Cookie consent** — uses `localStorage` only, no actual cookie management

### Ready for Integration
- Shop/cart UI is built and ready for Stripe or similar
- Newsletter forms are structured and ready for Mailchimp/ConvertKit/Supabase
- Social share buttons ready for actual share URLs

---

## 12. Developer Experience

### Tech Stack
- **React 18.3** with **TypeScript 5.8**
- **Vite 5.4** (SWC plugin for fast compilation)
- **Tailwind CSS 3.4** with `tailwindcss-animate` plugin
- **Framer Motion 12** for animations
- **React Router DOM 6.30** for client-side routing
- **TanStack React Query 5.83** (configured but not actively used for data fetching)
- **Shadcn/UI** component library (Radix UI primitives) — ~50 component files present, most unused
- **Lucide React** icon library
- **ESLint 9** with React Hooks and React Refresh plugins
- **Vitest 3.2** + Testing Library + Playwright for testing
- **class-variance-authority** + **tailwind-merge** + **clsx** for className utilities

### Code Quality
- Full TypeScript with strict interfaces for all data types (`Article`, `Country`, `Continent`, `TravelRoute`, `Product`)
- Consistent component patterns (functional components, named exports for pages)
- Clean separation: data layer (`src/data/`), pages (`src/pages/`), shared components (`src/components/`)

---

## 13. Page Inventory (10 pages, 10 routes)

| Route | Page | Key Features |
|-------|------|-------------|
| `/` | Index | Hero carousel, featured articles, world map section, continent cards, month selector, newsletter |
| `/destinations` | Destinations | Mountain hero, continent list with country flag pills |
| `/destinations/:continent` | ContinentPage | Mountain hero, breadcrumbs, flag pills, article grid, per-country nav cards |
| `/destinations/:continent/:country` | CountryPage | Photo hero, category filters, about, region pills, paginated articles, phrases, best months, Spotify, sibling nav |
| `/article/:articleId` | ArticlePage | Photo hero, breadcrumbs, meta bar, share buttons, prose content, related articles |
| `/routes` | Routes | Alternating image/text cards for 5 itineraries |
| `/routes/:routeId` | RouteDetailPage | Hero, quick-info bar, highlights, timeline itinerary, tips, related routes |
| `/shop` | Shop | Product grid (4 products), star ratings, add-to-cart buttons |
| `/shop/:productId` | ProductDetailPage | Product image, details, pricing card, features checklist, table of contents, related products |
| `*` | NotFound | 404 page with home link |

---

## Content Volume
- **7 continents**, **26 countries**, **~100+ articles** with full multi-paragraph content
- **5 travel routes** with detailed day-by-day itineraries (18–45 day trips)
- **4 digital products** with pricing, ratings, and chapter descriptions
- **3 featured articles** on homepage
- **12 static photography assets** (JPG)

