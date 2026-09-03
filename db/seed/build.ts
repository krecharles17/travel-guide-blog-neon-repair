import { createHash } from "node:crypto";
import { continents, type CountrySpec } from "./destinations";

/** Deterministic UUIDv5 (fixed namespace) so every seed run produces identical ids. */
const NS_HEX = "6ba7b8109dad11d180b400c04fd430c8"; // RFC 4122 "DNS" namespace
export function uuidv5(name: string): string {
  const hash = createHash("sha1")
    .update(Buffer.from(NS_HEX, "hex"))
    .update(name, "utf8")
    .digest();
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  const hex = hash.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const AUTHORS = [
  "Mara Ellison", "Diego Fontaine", "Priya Raman", "Tomás Herrera", "Lena Vogel",
  "Aiko Tanaka", "Sam Whitfield", "Noor Haddad", "Isabel Rocha", "Kwame Boateng",
  "Freya Lindqvist", "Ravi Menon",
];

const EDITORS = ["editor-camille", "editor-jonas", "editor-yuki", "editor-amara", "editor-liam", "editor-sofia"];

const COMMENT_AUTHORS = [
  "WandererJane", "Marco P.", "sunsetsam", "Elena T.", "BackpackBob", "Ines L.", "Kofi A.", "trailmixer",
  "Hannah W.", "Pedro S.", "Mika R.", "GlobetrotterGus", "Fatima K.", "Liam O.", "riverside_rachel",
  "Jonas B.", "Amara N.", "tomas.travels", "Yuki F.", "Claire D.", "Nikhil V.", "salty_sofia", "Owen G.",
  "Paula M.", "kenji walks", "Rosa V.", "Dmitri K.", "lunaonthemove", "Grace H.", "Baptiste L.", "Nina Z.",
  "ferngully", "Oscar Q.", "Talia R.", "mattwalksfar", "Chiara B.",
];

const COMMENT_BODIES = [
  "Did this route last spring and your tips about {region} are spot on. The early mornings make all the difference!",
  "We spent three days in {region} and somehow missed half of this — clearly a reason to go back.",
  "Bookmarking for my {country} trip in {month}. The packing advice alone is gold.",
  "As someone who grew up in {country}: this is a respectful, thoughtful writeup. Thank you for getting the details right.",
  "The bit about talking to locals in {capital} changed our whole trip. Everyone we met pointed us somewhere better.",
  "Great read! Would add that weekdays are much quieter in {region}, especially outside high season.",
  "This matched our experience almost exactly, down to the little bakery in {region}.",
  "Adding {region} to the list — the way you describe the light there sold me.",
  "We traveled {country} with kids and this is exactly the pace I'd recommend. Slow and curious wins.",
  "Any update for this year? Curious whether the {region} trail permits still sell out.",
  "Photos don't do {country} justice but your words come close.",
  "Did the food tour version of this in {capital} — highest recommendation. Come hungry.",
  "This is the kind of practical, no-hype guide I wish I'd found before our first visit.",
  "The {phraseOriginal} tip is real — people's faces lit up when we tried it. {phraseTranslation} indeed!",
  "Spent a rainy week around {region} and still loved it. Don't let weather scare you off.",
  "Excellent as always. Your {country} series is my first stop whenever I'm planning.",
  "We took the slow option you suggested and it was the best decision of the trip.",
  "One correction: the market in {region} now opens an hour earlier in summer. Still wonderful.",
  "Reading this on the bus to {capital} right now — perfect timing.",
  "Sent this to three friends. Two have already booked flights to {country}.",
  "The budget breakdown is refreshingly honest. More of this please.",
  "Used this guide almost verbatim for our honeymoon in {country} and it delivered.",
  "That hidden viewpoint near {region} is magic at dawn. Worth every alarm clock.",
  "Long-time reader, first-time commenter: your {country} coverage is consistently superb.",
];

const OPENERS = [
  "There is a moment, usually just after sunrise, when {region} feels like it belongs entirely to you — and in {country}, that moment comes with the smell of fresh bread and the sound of a city waking up.",
  "We arrived in {region} with no plan and left with a notebook full of reasons to return to {country}.",
  "Every traveler eventually finds their own version of {country}. Ours started in {region}, with a wrong turn and a shared plate of something unforgettable.",
  "{month} in {region} is a local secret: the crowds thin, the light softens, and {country} shows you its unhurried side.",
  "If you only know {country} through postcards, {region} will rearrange your expectations within an hour of arrival.",
  "The best advice we got before visiting {country} was simple: slow down. We tested it in {region} and it worked.",
  "{region} is where {country} keeps its everyday magic — markets, doorways, diagonals of afternoon light, and conversations that outlast the coffee.",
  "Some places you photograph. {region}, in {country}, is a place you keep talking about years later.",
];

const CULTURE_PARAS = [
  "Culture here is not performed for visitors; it is simply lived. In {region} we watched elders trade stories over strong coffee, teenagers practice a local tradition badly and joyfully, and shopkeepers pause mid-transaction to greet friends.",
  "Ask anyone in {region} about their neighborhood and you'll get a ten-minute answer. {country} wears its identity locally — dialect, dishes, festivals — and the quickest way in is simply to ask.",
  "We planned one museum day in {capital} and spent the rest of the week in smaller, stranger places: a workshop that has run for three generations, a chapel nobody photographs, a square where {country}'s whole history is visible in four buildings.",
  "Traditions in {region} have layers. Watch long enough and you notice which parts are for family, which are for neighbors, and which — warmly — are for travelers willing to learn a few words of {language}.",
  "The great lie about {country} is that you need weeks to touch its culture. A day in {region}, done slowly, will teach you more than a checklist itinerary ever could.",
  "Every evening in {region} follows the same gentle arc: work stops, benches fill, and the day is reviewed out loud. We started joining. Nobody minded.",
];

const FOOD_PARAS = [
  "Come hungry. {region}'s kitchens cook the way {country} cooks at home — seasonal, opinionated, and generous. Order what the table next to you ordered.",
  "The dish you'll remember from {country} won't be the famous one. It will be the unremarkable-looking plate in {region} that the cook refuses to write down the recipe for.",
  "Eat where the menus are short. In {region}, a short menu means everything is made that morning, and in {country} that morning standard is non-negotiable.",
  "We asked a vendor in {region} what she eats on her day off. She laughed, fed us, and drew us a map. That map was the best guidebook we had in {country}.",
  "Say {phraseOriginal} ({phraseTranslation}) before you order and watch the room warm up. Food in {country} starts with greeting, not with the menu.",
  "{region} does one thing with ingredients that the rest of {country} quietly envies: it lets them taste like themselves.",
];

const NATURE_PARAS = [
  "Give yourself one long day outdoors around {region}. Trails here are signed just enough, and the views arrive in installments rather than all at once — better that way.",
  "Nature in {country} is a neighbor, not an attraction. Around {region} we shared paths with schoolkids, farmers, and one extremely confident dog.",
  "Go early, bring layers, and let {region} do the rest. The landscapes of {country} reward patience more than fitness.",
  "The light in {region} changes everything about the landscape, sometimes within minutes. Locals in {country} plan their days around it. You should too.",
  "Water defines this part of {country} — where it runs, pools, and falls shapes every trail and every town around {region}.",
  "We walked out of {region} expecting exercise and got perspective instead. {country} has that effect on people who pay attention.",
];

const CLOSERS = [
  "Go before everyone else does, and go slowly — {region} is best at walking pace.",
  "We left {country} with a shorter list than we arrived with: fewer must-sees, more reasons to return.",
  "If this guide helps one person linger an extra day in {region}, it has done its job.",
  "Pack light, ask questions, and let {country} set the tempo. It knows what it's doing.",
  "Until next time, {region} — we'll be the ones at the bakery, practicing our {phraseOriginal}.",
];

const EXCERPTS = [
  "A field-tested guide to {region}, {country} — what to see, what to skip, and when to go.",
  "{region} rewards the slow traveler. Here's how we spent a week getting it right.",
  "Everything we wish we'd known before visiting {region}, {country}.",
  "Markets, trails, tables and doorways: a local's-eye tour of {region}.",
  "The unhurried way to experience {region} — one morning, one market, one viewpoint at a time.",
  "We asked locals in {region} what visitors always miss. Their answers became this guide.",
  "From dawn light to late dinner: a day-by-day plan for {region}, {country}.",
  "A practical, opinionated companion for your first (or fifth) trip to {region}.",
];

const TITLE_BUILDERS = [
  (c: CountrySpec) => `${c.regions[0]} Travel Guide: The Best of ${c.name}`,
  (c: CountrySpec) => `Eating Our Way Through ${c.regions[1]}: A ${c.name} Food Diary`,
  (c: CountrySpec) => `Wild ${c.name}: Nature Escapes Around ${c.regions[2]}`,
  (c: CountrySpec) => `48 Hours in ${c.capital}: A City Break That Works`,
  (c: CountrySpec) => `${c.name} on a Budget: ${c.regions[2]} Without Breaking the Bank`,
  (c: CountrySpec) => `${c.regions[1]} With Kids: A Family Field Guide to ${c.name}`,
];
const TITLE_CATEGORIES = ["Culture", "Food", "Nature", "Cities", "Budget", "Family"];

const ROUTE_THEMES = [
  "Grand Tour", "Coastal Escape", "Mountain Traverse", "Rail Odyssey",
  "Food Trail", "Slow Travel Loop", "Island Hopper", "Desert & Steppe",
];
const ROUTE_DURATIONS = [12, 14, 18, 21, 24, 28, 35];
const ROUTE_DIFFICULTIES = ["Easy", "Moderate", "Challenging"] as const;
const ROUTE_BUDGETS = [
  "Under $1,500 per person", "$1,500–$2,500 per person",
  "$2,500–$4,000 per person", "Over $4,000 per person",
];
const ROUTE_SEASONS: Record<string, string> = {
  europe: "May–September",
  asia: "November–February",
  africa: "June–October",
  "north-america": "May–October",
  "south-america": "October–April",
  oceania: "October–April",
};

const PRODUCT_TEMPLATES = [
  (c: CountrySpec) => ({ name: `${c.name} Travel Guide: 2026 Edition`, pages: 320 }),
  (c: CountrySpec) => ({ name: `Field Notes: ${c.name} Off the Beaten Path`, pages: 240 }),
  (c: CountrySpec) => ({ name: `${c.capital} & Beyond: A ${c.name} City and Region Companion`, pages: 280 }),
  (c: CountrySpec) => ({ name: `The ${c.name} Cookbook: 60 Recipes from ${c.language} Kitchens`, pages: 200 }),
  (c: CountrySpec) => ({ name: `${c.language} Phrasebook & Travel Journal`, pages: 160 }),
  (c: CountrySpec) => ({ name: `Slow Travel ${c.name}: ${c.regions[0]} and ${c.regions[1]} by Bus, Boat and Boot`, pages: 260 }),
  (c: CountrySpec) => ({ name: `${c.name} with Kids: Family Itineraries for ${c.regions[0]}, ${c.regions[1]} and ${c.regions[2]}`, pages: 220 }),
];
const PRODUCT_FORMATS = ["eBook (EPUB)", "eBook (PDF)", "Paperback + eBook", "Audiobook"];
const PRODUCT_FEATURES = [
  (c: CountrySpec) => `Neighborhood-by-neighborhood maps of ${c.capital}`,
  (c: CountrySpec) => `Region deep-dives: ${c.regions.join(", ")}`,
  (c: CountrySpec) => `Phrase starter pack with pronunciation for ${c.language}`,
  (c: CountrySpec) => `Seasonal calendar highlighting ${MONTHS[(c.bestMonths[0] ?? 1) - 1]} as the sweet spot`,
  (c: CountrySpec) => `Budget planner with realistic daily costs for ${c.name}`,
  (c: CountrySpec) => `Offline-ready itineraries from 48 hours to 3 weeks`,
];
const PRODUCT_CONTENTS = [
  (c: CountrySpec) => `Introduction: Why ${c.name} Now`,
  (c: CountrySpec) => `Getting There and Getting Around ${c.name}`,
  (c: CountrySpec) => `${c.capital}: The Perfect First Weekend`,
  (c: CountrySpec) => `Into the Regions: ${c.regions.join(" · ")}`,
  (c: CountrySpec) => `Eat Like a Local: A ${c.name} Field Guide`,
  (c: CountrySpec) => `Talking with People: ${c.language} Essentials`,
];

const IMAGES = [
  "/france.jpg", "/iceland.jpg", "/northern-lights.jpg", "/asia-temple.jpg",
  "/africa-lion.jpg", "/world-map.jpg", "/hero-desert.jpg", "/hero-greece.jpg",
  "/hero-camping.jpg", "/morocco.jpg", "/travel-books.jpg", "/bloggers.jpg",
];

const FEATURED_SLUGS = ["france", "japan", "morocco", "united-states", "peru", "australia"];

/** Articles that receive a legitimate second editorial revision (same-continent move). */
export const REV2_ARTICLE_IDS = continents.flatMap((continent, ci) =>
  [1, 6].map((countryIdx) => {
    const from = continent.countries[countryIdx];
    return { articleId: `art-${from.code}-003`, continentSlug: continent.slug, seedContinentIndex: ci };
  }),
);

export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export interface SeedRow { [key: string]: unknown }

export function buildSeedData(): Record<string, SeedRow[]> {
  const continentRows: SeedRow[] = [];
  const countryRows: SeedRow[] = [];
  const articleRows: SeedRow[] = [];
  const revisionRows: SeedRow[] = [];
  const commentRows: SeedRow[] = [];
  const likeRows: SeedRow[] = [];
  const routeRows: SeedRow[] = [];
  const stopRows: SeedRow[] = [];
  const stopHistoryRows: SeedRow[] = [];
  const productRows: SeedRow[] = [];
  const subscriberRows: SeedRow[] = [];
  const auditRows: SeedRow[] = [];

  // --- geography -----------------------------------------------------------
  continents.forEach((continent, ci) => {
    const continentId = uuidv5(`continent:${continent.slug}`);
    continentRows.push({
      id: continentId,
      name: continent.name,
      slug: continent.slug,
      hero_image: continent.heroImage,
      introduction: continent.introduction,
      sort_order: ci + 1,
      created_at: "2026-01-05T09:00:00Z",
    });

    continent.countries.forEach((country, ki) => {
      const countryId = uuidv5(`country:${country.slug}`);
      countryRows.push({
        id: countryId,
        continent_id: continentId,
        name: country.name,
        slug: country.slug,
        flag: country.flag,
        hero_image: IMAGES[(ci * 10 + ki) % IMAGES.length],
        about: country.about,
        best_months: country.bestMonths,
        categories: country.categories,
        regions: country.regions,
        phrases: country.phrases.map((p) => ({ ...p, language: country.language })),
        sort_order: ci * 10 + ki + 1,
        created_at: "2026-01-05T09:00:00Z",
      });
    });
  });

  const countryIdBySlug = new Map(countryRows.map((r) => [r.slug as string, r.id as string]));
  const countryByCode = new Map<string, CountrySpec & { continentSlug: string }>();
  continents.forEach((continent) => {
    continent.countries.forEach((country) => countryByCode.set(country.code, { ...country, continentSlug: continent.slug }));
  });

  // --- articles + revisions + engagement -----------------------------------
  let globalIndex = 0;
  continents.forEach((continent, ci) => {
    continent.countries.forEach((country, ki) => {
      const countryId = countryIdBySlug.get(country.slug)!;
      for (let j = 0; j < 6; j++) {
        const id = `art-${country.code}-${String(j + 1).padStart(3, "0")}`;
        const region = country.regions[j % 3];
        const isFeatured = FEATURED_SLUGS.includes(country.slug) && j === 0;
        const isDraft = j === 5 && ci % 3 === 0;
        const isArchived = !isFeatured && !isDraft && j === 0 && ci % 2 === 0 && globalIndex % 3 === 0;
        const status = isDraft ? "draft" : isArchived ? "archived" : "published";
        const publishedAt = isDraft
          ? addDays("2026-10-06", (ci + j) % 50)
          : addDays("2023-01-09", globalIndex * 3);
        const hash = (ci * 137 + ki * 53 + j * 911) % 10000;
        const viewCount = isDraft ? 0 : isFeatured ? 6000 + (hash % 3000) : 40 + (hash % 3600);
        const slots: Record<string, string> = {
          region,
          country: country.name,
          capital: country.capital,
          language: country.language,
          month: MONTHS[(country.bestMonths[0] ?? 1) - 1],
          phraseOriginal: country.phrases[0].original,
          phraseTranslation: country.phrases[0].translation,
        };
        const fill = (tpl: string) => tpl.replace(/\{(\w+)\}/g, (_, k: string) => slots[k] ?? `{${k}}`);
        const content = [
          fill(OPENERS[(ci * 3 + j) % OPENERS.length]),
          fill(CULTURE_PARAS[(ci + j) % CULTURE_PARAS.length]),
          fill(FOOD_PARAS[(ci * 2 + j) % FOOD_PARAS.length]),
          fill(NATURE_PARAS[(ci + j * 2) % NATURE_PARAS.length]),
          fill(CLOSERS[(ci + j) % CLOSERS.length]),
        ];
        const excerpt = fill(EXCERPTS[(ci * 5 + j) % EXCERPTS.length]);

        articleRows.push({
          id,
          country_id: countryId,
          title: TITLE_BUILDERS[j](country),
          excerpt,
          image: IMAGES[(ci * 10 + ki * 3 + j) % IMAGES.length],
          category: TITLE_CATEGORIES[j],
          author: AUTHORS[(ci * 10 + ki + j) % AUTHORS.length],
          published_at: publishedAt,
          content,
          status,
          is_featured: isFeatured,
          like_count: 0,
          view_count: viewCount,
          created_at: `${publishedAt}T08:00:00Z`,
        });

        revisionRows.push({
          id: uuidv5(`revision:${id}:1`),
          article_id: id,
          revision_no: 1,
          country_id: countryId,
          status,
          is_featured: isFeatured,
          title: TITLE_BUILDERS[j](country),
          editor: EDITORS[(ci + j) % EDITORS.length],
          note: "Initial editorial assignment",
          created_at: `${addDays(publishedAt, -7)}T14:00:00Z`,
        });

        // engagement only for non-scheduled articles
        if (!isDraft) {
          const commentCount = (ci * 7 + ki * 3 + j * 2) % 7;
          for (let l = 0; l < commentCount; l++) {
            commentRows.push({
              article_id: id,
              author_name: COMMENT_AUTHORS[(ci * 11 + ki * 5 + j * 3 + l) % COMMENT_AUTHORS.length],
              body: fill(COMMENT_BODIES[(ci * 5 + ki * 3 + j * 7 + l) % COMMENT_BODIES.length]),
              created_at: `${addDays(publishedAt, ((l + j) % 45) + 1)}T${String(9 + ((l * 3) % 12)).padStart(2, "0")}:30:00Z`,
            });
          }
          const likeCount = (ci * 31 + ki * 17 + j * 7) % 36;
          for (let l = 0; l < likeCount; l++) {
            likeRows.push({
              article_id: id,
              visitor_id: `seed-visitor-${String((ci * 97 + ki * 41 + j * 13 + l * 29) % 800).padStart(4, "0")}`,
              created_at: `${addDays(publishedAt, ((l * 3 + ki) % 60) + 1)}T12:00:00Z`,
            });
          }
        }
        globalIndex++;
      }
    });
  });

  // legitimate second revisions: move article to a neighbouring country (same continent)
  for (const rev2 of REV2_ARTICLE_IDS) {
    const article = articleRows.find((a) => a.id === rev2.articleId)!;
    const continent = continents.find((c) => c.slug === (countryByCode.get(article.id.slice(4, 6))?.continentSlug ?? ""))!;
    const currentIndex = continent.countries.findIndex((c) => `art-${c.code}-003` === rev2.articleId);
    const target = continent.countries[(currentIndex + 1) % continent.countries.length];
    const targetId = countryIdBySlug.get(target.slug)!;
    article.country_id = targetId;
    revisionRows.push({
      id: uuidv5(`revision:${rev2.articleId}:2`),
      article_id: rev2.articleId,
      revision_no: 2,
      country_id: targetId,
      status: article.status,
      is_featured: article.is_featured,
      title: article.title,
      editor: EDITORS[(currentIndex + 2) % EDITORS.length],
      note: "Coverage re-scoped per Q3 editorial plan (approved reassignment)",
      created_at: "2026-08-20T10:00:00Z",
    });
  }

  // --- travel routes + stops + history -------------------------------------
  for (let i = 0; i < 40; i++) {
    const routeId = `rt-${String(i + 1).padStart(4, "0")}`;
    const continent = continents[i % 6];
    const theme = ROUTE_THEMES[i % ROUTE_THEMES.length];
    const durationDays = ROUTE_DURATIONS[i % ROUTE_DURATIONS.length];
    const stopCount = 4 + (i % 3);
    const startIdx = (i * 3 + 2) % 10;
    const stops = Array.from({ length: stopCount }, (_, k) => continent.countries[(startIdx + k) % 10]);
    const first = stops[0];
    const last = stops[stopCount - 1];
    const daysPerStop = Math.max(2, Math.floor(durationDays / stopCount));

    routeRows.push({
      id: routeId,
      title: `${theme}: ${first.name} to ${last.name}`,
      subtitle: `${stopCount} countries · ${durationDays} days · ${continent.name}`,
      description: `A ${durationDays}-day ${theme.toLowerCase()} across ${continent.name}, linking ${stops
        .map((s) => s.name)
        .join(", ")}. Built from reader reports and updated every season.`,
      duration: `${durationDays} days`,
      image: IMAGES[i % IMAGES.length],
      countries: stops.map((s) => s.name),
      difficulty: ROUTE_DIFFICULTIES[i % 3],
      best_season: ROUTE_SEASONS[continent.slug] ?? "Year-round",
      budget: ROUTE_BUDGETS[i % ROUTE_BUDGETS.length],
      highlights: [
        `Dawn over ${stops[0].regions[0]}, ${stops[0].name}`,
        `Local markets and kitchens in ${stops[1 % stopCount].regions[1 % 3]}`,
        `A full free day in ${stops[(stopCount - 2 + stopCount) % stopCount].name}`,
        `Farewell dinner in ${last.capital}`,
      ],
      itinerary: stops.map((s, k) => ({
        day: `Days ${k * daysPerStop + 1}–${(k + 1) * daysPerStop}`,
        title: `${s.regions[k % 3]}, ${s.name}`,
        description: `Base yourself in ${s.regions[k % 3]} and explore at half-speed: one big sight each morning, one long lunch, and evenings left unplanned.`,
      })),
      tips: [
        `Book ${first.name}–${stops[1].name} transport early; it sells out in high season.`,
        `Carry cash — smaller towns between ${stops[1].name} and ${last.name} are card-averse.`,
        `Learn ${stops[0].phrases[0].original} (${stops[0].phrases[0].translation}) — it opens doors everywhere on this route.`,
      ],
      sort_order: i + 1,
    });

    stops.forEach((s, k) => {
      const stopId = uuidv5(`route-stop:${routeId}:${k + 1}`);
      stopRows.push({
        id: stopId,
        route_id: routeId,
        stop_number: k + 1,
        country_id: countryIdBySlug.get(s.slug)!,
        place: s.regions[k % 3],
        title: `${s.regions[k % 3]}, ${s.name}`,
        description: `Overnight base with day trips; arrival overland from ${k === 0 ? first.capital : stops[k - 1].name}.`,
        day_label: `Days ${k * daysPerStop + 1}–${(k + 1) * daysPerStop}`,
      });
      stopHistoryRows.push({
        id: uuidv5(`stop-history:${routeId}:${k + 1}:1`),
        route_id: routeId,
        stop_id: stopId,
        previous_stop_number: null,
        new_stop_number: k + 1,
        changed_by: "seed-pipeline",
        reason: "Initial route publication",
        created_at: "2026-08-31T12:00:00Z",
      });
    });
  }

  // --- products -------------------------------------------------------------
  for (let i = 0; i < 100; i++) {
    const country = countryByCode.get(continents[i % 6].countries[Math.floor(i / 6) % 10].code)!;
    const tpl = PRODUCT_TEMPLATES[i % PRODUCT_TEMPLATES.length](country);
    productRows.push({
      id: `bk-${String(i + 1).padStart(3, "0")}`,
      name: tpl.name,
      price: Math.round((9.99 + ((i * 7.31) % 28)) * 100) / 100,
      rating: Math.min(5, Math.round((4 + ((i * 13) % 10) / 10) * 10) / 10),
      image: IMAGES[(i + 4) % IMAGES.length],
      description: `A field-tested ${country.name} companion written by our editorial team and updated after every research trip. Covers ${country.regions.join(", ")} with maps, phrase help and honest budgets.`,
      features: PRODUCT_FEATURES.slice(0, 4).map((f) => f(country)),
      pages: tpl.pages,
      format: PRODUCT_FORMATS[i % PRODUCT_FORMATS.length],
      contents: PRODUCT_CONTENTS.map((c) => c(country)),
      sort_order: i + 1,
    });
  }

  // --- newsletter -----------------------------------------------------------
  const SUB_NAMES = ["Ava", "Ben", "Chiara", "Dev", "Elif", "Franz", "Grace", "Hugo", "Iris", "Jonas"];
  for (let i = 0; i < 150; i++) {
    subscriberRows.push({
      email: `reader${String(i + 1).padStart(3, "0")}@example.com`,
      name: i % 3 === 0 ? `${SUB_NAMES[i % SUB_NAMES.length]} ${String.fromCharCode(65 + (i % 26))}.` : null,
      source: ["inline", "hero", "split"][i % 3],
      created_at: `2026-07-${String((i % 28) + 1).padStart(2, "0")}T10:${String((i * 7) % 60).padStart(2, "0")}:00Z`,
    });
  }

  // --- baseline migration audit ---------------------------------------------
  auditRows.push(
    {
      id: uuidv5("audit:20260101000000_wanderlust_baseline.sql"),
      migration_name: "20260101000000_wanderlust_baseline.sql",
      description: "Initial schema: continents, countries, articles, engagement, shop tables",
      applied_by: "platform-team",
      status: "applied",
      details: {},
      applied_at: "2026-01-05T09:00:00Z",
    },
    {
      id: uuidv5("audit:20260215090000_editorial_governance.sql"),
      migration_name: "20260215090000_editorial_governance.sql",
      description: "Add editorial_revisions, route_stops, route_stop_history, migration_audit",
      applied_by: "editorial-platform",
      status: "applied",
      details: {},
      applied_at: "2026-02-15T09:00:00Z",
    },
    {
      id: uuidv5("audit:20260831120000_editorial_seed_2026.sql"),
      migration_name: "20260831120000_editorial_seed_2026.sql",
      description: "Deterministic 2026 content seed (destinations, articles, routes, products, engagement)",
      applied_by: "seed-pipeline",
      status: "applied",
      details: {
        countries: countryRows.length,
        articles: articleRows.length,
        routes: routeRows.length,
        products: productRows.length,
      },
      applied_at: "2026-08-31T12:00:00Z",
    },
  );

  return {
    continents: continentRows,
    countries: countryRows,
    articles: articleRows,
    editorial_revisions: revisionRows,
    article_comments: commentRows,
    article_likes: likeRows,
    travel_routes: routeRows,
    route_stops: stopRows,
    route_stop_history: stopHistoryRows,
    products: productRows,
    newsletter_subscribers: subscriberRows,
    migration_audit: auditRows,
  };
}
