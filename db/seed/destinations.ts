/**
 * Curated, deterministic destination dataset for the Wanderlust seed.
 * 6 continents × 10 countries = 60 countries. Everything here is
 * hand-written; generators in ./build.ts only combine it.
 */

export interface ContinentSpec {
  slug: string;
  name: string;
  heroImage: string;
  introduction: string;
  countries: CountrySpec[];
}

export interface CountrySpec {
  slug: string;
  name: string;
  code: string;
  flag: string;
  language: string;
  capital: string;
  regions: string[];
  bestMonths: number[];
  categories: string[];
  phrases: { original: string; translation: string }[];
  about: string;
}

export const continents: ContinentSpec[] = [
  {
    slug: "europe",
    name: "Europe",
    heroImage: "/hero-greece.jpg",
    introduction:
      "From Mediterranean fishing villages to Alpine passes and Nordic fjords, Europe packs a lifetime of travel into a compact map. Distances are short, rail lines are glorious, and every border crossing brings a new language, a new cuisine, and a new way of slowing down.",
    countries: [
      {
        slug: "france",
        name: "France",
        code: "fr",
        flag: "🇫🇷",
        language: "French",
        capital: "Paris",
        regions: ["Provence", "Normandy", "Alsace"],
        bestMonths: [4, 5, 6, 9, 10],
        categories: ["Food", "Culture", "Cities"],
        phrases: [
          { original: "Bonjour", translation: "Hello" },
          { original: "Merci beaucoup", translation: "Thank you very much" },
        ],
        about:
          "France rewards the slow traveler: morning markets in Provence, tide-fed cheese dairies in Normandy, and half-timbered villages in Alsace that look drawn from a storybook.",
      },
      {
        slug: "italy",
        name: "Italy",
        code: "it",
        flag: "🇮🇹",
        language: "Italian",
        capital: "Rome",
        regions: ["Tuscany", "Puglia", "Lombardy"],
        bestMonths: [4, 5, 6, 9, 10],
        categories: ["Food", "History", "Culture"],
        phrases: [
          { original: "Buongiorno", translation: "Good morning" },
          { original: "Grazie mille", translation: "Thanks a thousand" },
        ],
        about:
          "Italy is a country of hyper-local obsessions — every valley has its own pasta shape, its own wine, and a strong opinion about how you should enjoy both.",
      },
      {
        slug: "spain",
        name: "Spain",
        code: "es",
        flag: "🇪🇸",
        language: "Spanish",
        capital: "Madrid",
        regions: ["Andalusia", "Catalonia", "Galicia"],
        bestMonths: [3, 4, 5, 10, 11],
        categories: ["Food", "Beaches", "Culture"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Spain lives loudly in the evenings: tapas crawls through Andalusian patios, late dinners in Barcelona, and Atlantic seafood feasts in Galicia.",
      },
      {
        slug: "portugal",
        name: "Portugal",
        code: "pt",
        flag: "🇵🇹",
        language: "Portuguese",
        capital: "Lisbon",
        regions: ["Algarve", "Douro Valley", "Madeira"],
        bestMonths: [3, 4, 5, 9, 10],
        categories: ["Coastlines", "Food", "Cities"],
        phrases: [
          { original: "Bom dia", translation: "Good morning" },
          { original: "Obrigado", translation: "Thank you" },
        ],
        about:
          "Portugal bends toward the sea: azulejo-tiled lanes in Lisbon, port lodges along the Douro, and volcanic levada walks on Madeira.",
      },
      {
        slug: "greece",
        name: "Greece",
        code: "gr",
        flag: "🇬🇷",
        language: "Greek",
        capital: "Athens",
        regions: ["Peloponnese", "Crete", "Cyclades"],
        bestMonths: [5, 6, 9, 10],
        categories: ["Islands", "History", "Beaches"],
        phrases: [
          { original: "Yassas", translation: "Hello" },
          { original: "Efharistó", translation: "Thank you" },
        ],
        about:
          "Greece layers three thousand years of ruins over some of Europe's clearest water — and both are best reached on foot, by ferry, or on a rented scooter.",
      },
      {
        slug: "iceland",
        name: "Iceland",
        code: "is",
        flag: "🇮🇸",
        language: "Icelandic",
        capital: "Reykjavík",
        regions: ["South Coast", "Westfjords", "Reykjavík"],
        bestMonths: [6, 7, 8, 9],
        categories: ["Nature", "Adventure", "Road Trips"],
        phrases: [
          { original: "Halló", translation: "Hello" },
          { original: "Takk fyrir", translation: "Thank you" },
        ],
        about:
          "Iceland is geology in fast-forward: waterfalls you can walk behind, black-sand deserts, and hot springs that make a road trip feel like a spa day.",
      },
      {
        slug: "norway",
        name: "Norway",
        code: "no",
        flag: "🇳🇴",
        language: "Norwegian",
        capital: "Oslo",
        regions: ["Lofoten", "Fjord Norway", "Tromsø"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Nature", "Road Trips", "Northern Lights"],
        phrases: [
          { original: "Hei", translation: "Hi" },
          { original: "Takk", translation: "Thanks" },
        ],
        about:
          "Norway's fjords and Arctic islands turn every drive and ferry crossing into the best part of the trip, especially under the midnight sun.",
      },
      {
        slug: "croatia",
        name: "Croatia",
        code: "hr",
        flag: "🇭🇷",
        language: "Croatian",
        capital: "Zagreb",
        regions: ["Dalmatia", "Istria", "Plitvice"],
        bestMonths: [5, 6, 9, 10],
        categories: ["Beaches", "Islands", "History"],
        phrases: [
          { original: "Dobar dan", translation: "Good day" },
          { original: "Hvala", translation: "Thank you" },
        ],
        about:
          "Croatia's Adriatic coast strings together walled towns, limestone islands, and placid coves, with Roman ruins hiding inland among the hills.",
      },
      {
        slug: "austria",
        name: "Austria",
        code: "at",
        flag: "🇦🇹",
        language: "German",
        capital: "Vienna",
        regions: ["Tyrol", "Salzkammergut", "Vienna"],
        bestMonths: [5, 6, 9, 12],
        categories: ["Mountains", "Cities", "Culture"],
        phrases: [
          { original: "Grüß Gott", translation: "Hello (formal greeting)" },
          { original: "Danke schön", translation: "Thank you kindly" },
        ],
        about:
          "Austria balances imperial ballrooms in Vienna with lakeside villages and cable cars in the Alps — often within a two-hour train ride.",
      },
      {
        slug: "united-kingdom",
        name: "United Kingdom",
        code: "gb",
        flag: "🇬🇧",
        language: "English",
        capital: "London",
        regions: ["Scottish Highlands", "Cornwall", "Yorkshire Dales"],
        bestMonths: [5, 6, 7, 9],
        categories: ["Road Trips", "History", "Nature"],
        phrases: [
          { original: "Cheers", translation: "Thanks / goodbye" },
          { original: "Fancy a cuppa?", translation: "Would you like a cup of tea?" },
        ],
        about:
          "The United Kingdom squeezes ancient stone circles, single-track Highland roads, and seaside fish-and-chip towns onto a delightfully drivable island.",
      },
    ],
  },
  {
    slug: "asia",
    name: "Asia",
    heroImage: "/asia-temple.jpg",
    introduction:
      "Asia is less a destination than a spectrum: neon megacities and silent monasteries, street food that ruins you for home cooking, and mountain roads that climb above the clouds. Budgets stretch far and patience pays double.",
    countries: [
      {
        slug: "japan",
        name: "Japan",
        code: "jp",
        flag: "🇯🇵",
        language: "Japanese",
        capital: "Tokyo",
        regions: ["Kyoto", "Tokyo", "Hokkaido"],
        bestMonths: [3, 4, 10, 11],
        categories: ["Culture", "Food", "Cities"],
        phrases: [
          { original: "Konnichiwa", translation: "Hello / good afternoon" },
          { original: "Arigatō gozaimasu", translation: "Thank you (polite)" },
        ],
        about:
          "Japan runs on precision and ritual — temple gardens in Kyoto, standing sushi bars in Tokyo, and onsen towns where the evening is measured in baths and sake.",
      },
      {
        slug: "thailand",
        name: "Thailand",
        code: "th",
        flag: "🇹🇭",
        language: "Thai",
        capital: "Bangkok",
        regions: ["Chiang Mai", "Krabi", "Bangkok"],
        bestMonths: [11, 12, 1, 2],
        categories: ["Food", "Islands", "Beaches"],
        phrases: [
          { original: "Sawasdee", translation: "Hello" },
          { original: "Khop khun", translation: "Thank you" },
        ],
        about:
          "Thailand delivers an entire travel career in one country: night markets and gilded temples in Bangkok, mountain villages around Chiang Mai, limestone islands off Krabi.",
      },
      {
        slug: "vietnam",
        name: "Vietnam",
        code: "vn",
        flag: "🇻🇳",
        language: "Vietnamese",
        capital: "Hanoi",
        regions: ["Hoi An", "Hanoi", "Ha Long Bay"],
        bestMonths: [2, 3, 4, 10, 11],
        categories: ["Food", "History", "Road Trips"],
        phrases: [
          { original: "Xin chào", translation: "Hello" },
          { original: "Cảm ơn", translation: "Thank you" },
        ],
        about:
          "Vietnam rewards early risers: pho stalls before dawn in Hanoi, lantern-lit mornings in Hoi An, and limestone karsts mirrored in Ha Long Bay.",
      },
      {
        slug: "india",
        name: "India",
        code: "in",
        flag: "🇮🇳",
        language: "Hindi",
        capital: "New Delhi",
        regions: ["Rajasthan", "Kerala", "Ladakh"],
        bestMonths: [10, 11, 12, 1, 2],
        categories: ["Culture", "Food", "Mountains"],
        phrases: [
          { original: "Namaste", translation: "Hello / greetings" },
          { original: "Dhanyavaad", translation: "Thank you" },
        ],
        about:
          "India is intensity itself — fort cities across Rajasthan, backwater houseboats in Kerala, and high-altitude monasteries in Ladakh, all at once overwhelming and magnetic.",
      },
      {
        slug: "nepal",
        name: "Nepal",
        code: "np",
        flag: "🇳🇵",
        language: "Nepali",
        capital: "Kathmandu",
        regions: ["Everest Region", "Annapurna", "Kathmandu Valley"],
        bestMonths: [3, 4, 10, 11],
        categories: ["Mountains", "Adventure", "Culture"],
        phrases: [
          { original: "Namaste", translation: "Hello / greetings" },
          { original: "Dhanyabād", translation: "Thank you" },
        ],
        about:
          "Nepal puts eight-thousand-meter peaks within reach of a good pair of boots, with teahouse treks linking Sherpa villages beneath the world's highest skyline.",
      },
      {
        slug: "indonesia",
        name: "Indonesia",
        code: "id",
        flag: "🇮🇩",
        language: "Indonesian",
        capital: "Jakarta",
        regions: ["Bali", "Yogyakarta", "Komodo"],
        bestMonths: [4, 5, 6, 9, 10],
        categories: ["Islands", "Volcanoes", "Beaches"],
        phrases: [
          { original: "Selamat pagi", translation: "Good morning" },
          { original: "Terima kasih", translation: "Thank you" },
        ],
        about:
          "Indonesia is seventeen thousand islands of volcano rims, rice terraces, and coral walls — from Bali's temples to dragons basking on Komodo.",
      },
      {
        slug: "south-korea",
        name: "South Korea",
        code: "kr",
        flag: "🇰🇷",
        language: "Korean",
        capital: "Seoul",
        regions: ["Seoul", "Busan", "Jeju Island"],
        bestMonths: [4, 5, 9, 10],
        categories: ["Cities", "Food", "Hiking"],
        phrases: [
          { original: "Annyeonghaseyo", translation: "Hello" },
          { original: "Gamsahamnida", translation: "Thank you" },
        ],
        about:
          "South Korea pairs round-the-clock city energy with Buddhist temple stays and volcanic trails, all stitched together by blazing-fast trains.",
      },
      {
        slug: "sri-lanka",
        name: "Sri Lanka",
        code: "lk",
        flag: "🇱🇰",
        language: "Sinhala",
        capital: "Colombo",
        regions: ["Hill Country", "Galle Coast", "Cultural Triangle"],
        bestMonths: [1, 2, 7, 8],
        categories: ["Beaches", "Wildlife", "Tea Country"],
        phrases: [
          { original: "Āyubōvan", translation: "Hello / may you live long" },
          { original: "Sthūtiyī", translation: "Thank you" },
        ],
        about:
          "Sri Lanka compresses a continent into a teardrop: leopards in the scrub, blue trains through tea country, and Dutch forts facing the Indian Ocean.",
      },
      {
        slug: "mongolia",
        name: "Mongolia",
        code: "mn",
        flag: "🇲🇳",
        language: "Mongolian",
        capital: "Ulaanbaatar",
        regions: ["Gobi Desert", "Khövsgöl Lake", "Central Steppe"],
        bestMonths: [6, 7, 8],
        categories: ["Adventure", "Road Trips", "Culture"],
        phrases: [
          { original: "Sain bainuu", translation: "Hello / how are you" },
          { original: "Bayarlalaa", translation: "Thank you" },
        ],
        about:
          "Mongolia is the horizon made real: ger camps on the steppe, camel trains across the Gobi, and star fields so bright they feel artificial.",
      },
      {
        slug: "uzbekistan",
        name: "Uzbekistan",
        code: "uz",
        flag: "🇺🇿",
        language: "Uzbek",
        capital: "Tashkent",
        regions: ["Samarkand", "Bukhara", "Khiva"],
        bestMonths: [4, 5, 9, 10],
        categories: ["History", "Silk Road", "Architecture"],
        phrases: [
          { original: "Salom", translation: "Hello" },
          { original: "Rahmat", translation: "Thank you" },
        ],
        about:
          "Uzbekistan preserves the Silk Road at its most dazzling — turquoise madrasas of Samarkand, mud-brick alleys of Khiva, and tea houses where travelers have rested for a millennium.",
      },
    ],
  },
  {
    slug: "africa",
    name: "Africa",
    heroImage: "/africa-lion.jpg",
    introduction:
      "Africa rewards travelers who go deep rather than wide: one country, one savanna, one coastline at a time. Expect wildlife encounters that reorganize your priorities and hospitality that follows you home.",
    countries: [
      {
        slug: "morocco",
        name: "Morocco",
        code: "ma",
        flag: "🇲🇦",
        language: "Arabic",
        capital: "Rabat",
        regions: ["Marrakech", "Sahara", "Chefchaouen"],
        bestMonths: [3, 4, 10, 11],
        categories: ["Desert", "Culture", "Food"],
        phrases: [
          { original: "As-salāmu ʿalaykum", translation: "Peace be upon you" },
          { original: "Shukran", translation: "Thank you" },
        ],
        about:
          "Morocco stacks sensory worlds on top of each other — mint tea on rooftops in Marrakech, dunes at dawn in the Sahara, and blue alleys winding up the Rif mountains.",
      },
      {
        slug: "egypt",
        name: "Egypt",
        code: "eg",
        flag: "🇪🇬",
        language: "Arabic",
        capital: "Cairo",
        regions: ["Luxor", "Cairo", "Red Sea"],
        bestMonths: [10, 11, 12, 3],
        categories: ["History", "Diving", "Desert"],
        phrases: [
          { original: "As-salāmu ʿalaykum", translation: "Peace be upon you" },
          { original: "Shukran", translation: "Thank you" },
        ],
        about:
          "Egypt's monuments need no introduction, but its Red Sea reefs and slow felucca evenings on the Nile are the quiet masterpieces.",
      },
      {
        slug: "kenya",
        name: "Kenya",
        code: "ke",
        flag: "🇰🇪",
        language: "Swahili",
        capital: "Nairobi",
        regions: ["Maasai Mara", "Amboseli", "Diani Beach"],
        bestMonths: [1, 2, 6, 7, 9],
        categories: ["Wildlife", "Safari", "Beaches"],
        phrases: [
          { original: "Jambo", translation: "Hello" },
          { original: "Asante", translation: "Thank you" },
        ],
        about:
          "Kenya is safari distilled: the Great Migration thundering across the Mara, elephants framed by Kilimanjaro, and white-sand Swahili coast to decompress after.",
      },
      {
        slug: "tanzania",
        name: "Tanzania",
        code: "tz",
        flag: "🇹🇿",
        language: "Swahili",
        capital: "Dodoma",
        regions: ["Serengeti", "Zanzibar", "Ngorongoro"],
        bestMonths: [6, 7, 8, 9, 1],
        categories: ["Wildlife", "Beaches", "Adventure"],
        phrases: [
          { original: "Jambo", translation: "Hello" },
          { original: "Asante sana", translation: "Thank you very much" },
        ],
        about:
          "Tanzania climbs from the Ngorongoro Crater floor to Kilimanjaro's summit and finishes barefoot on Zanzibar's spice-scented shores.",
      },
      {
        slug: "south-africa",
        name: "South Africa",
        code: "za",
        flag: "🇿🇦",
        language: "Afrikaans",
        capital: "Pretoria",
        regions: ["Cape Town", "Garden Route", "Kruger"],
        bestMonths: [3, 4, 10, 11],
        categories: ["Wine", "Wildlife", "Road Trips"],
        phrases: [
          { original: "Hallo", translation: "Hello" },
          { original: "Dankie", translation: "Thank you" },
        ],
        about:
          "South Africa folds a world into one country — Table Mountain sunsets, Big Five dawns in Kruger, and vineyard lunches along the Garden Route.",
      },
      {
        slug: "namibia",
        name: "Namibia",
        code: "na",
        flag: "🇳🇦",
        language: "Afrikaans",
        capital: "Windhoek",
        regions: ["Sossusvlei", "Etosha", "Skeleton Coast"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Desert", "Road Trips", "Wildlife"],
        phrases: [
          { original: "Hallo", translation: "Hello" },
          { original: "Dankie", translation: "Thank you" },
        ],
        about:
          "Namibia is emptiness in the best sense: apricot dunes at Sossusvlei, desert-adapted lions on the Skeleton Coast, and roads that go straight for hours.",
      },
      {
        slug: "ethiopia",
        name: "Ethiopia",
        code: "et",
        flag: "🇪🇹",
        language: "Amharic",
        capital: "Addis Ababa",
        regions: ["Simien Mountains", "Lalibela", "Danakil"],
        bestMonths: [10, 11, 12, 1],
        categories: ["History", "Hiking", "Culture"],
        phrases: [
          { original: "Selam", translation: "Hello / peace" },
          { original: "Ameseginalehu", translation: "Thank you" },
        ],
        about:
          "Ethiopia keeps its own calendar and its own wonders — rock-hewn churches of Lalibela, viewpoints over the Rift Valley, and a coffee ceremony that takes an afternoon and deserves it.",
      },
      {
        slug: "ghana",
        name: "Ghana",
        code: "gh",
        flag: "🇬🇭",
        language: "Twi",
        capital: "Accra",
        regions: ["Accra", "Kumasi", "Cape Coast"],
        bestMonths: [11, 12, 1, 2],
        categories: ["Culture", "Beaches", "History"],
        phrases: [
          { original: "Akwaaba", translation: "Welcome" },
          { original: "Medaase", translation: "Thank you" },
        ],
        about:
          "Ghana greets you by name: highlife drumming in Accra, Ashanti craft traditions in Kumasi, and palm-lined forts along the Cape Coast that hold difficult history with dignity.",
      },
      {
        slug: "madagascar",
        name: "Madagascar",
        code: "mg",
        flag: "🇲🇬",
        language: "Malagasy",
        capital: "Antananarivo",
        regions: ["Avenue of the Baobabs", "Andasibe", "Nosy Be"],
        bestMonths: [4, 5, 9, 10, 11],
        categories: ["Wildlife", "Nature", "Beaches"],
        phrases: [
          { original: "Salama", translation: "Hello" },
          { original: "Misaotra", translation: "Thank you" },
        ],
        about:
          "Madagascar evolved alone for 88 million years, so nearly everything here — lemurs, baobabs, chameleons — exists nowhere else on Earth.",
      },
      {
        slug: "botswana",
        name: "Botswana",
        code: "bw",
        flag: "🇧🇼",
        language: "Setswana",
        capital: "Gaborone",
        regions: ["Okavango Delta", "Chobe", "Makgadikgadi"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Wildlife", "Safari", "Adventure"],
        phrases: [
          { original: "Dumela", translation: "Hello" },
          { original: "Ke a leboga", translation: "Thank you" },
        ],
        about:
          "Botswana does safaris at a whisper: mokoro canals through the Okavango, elephant herds along the Chobe River, and salt pans that shimmer to the horizon.",
      },
    ],
  },
  {
    slug: "north-america",
    name: "North America",
    heroImage: "/hero-camping.jpg",
    introduction:
      "North America runs on big landscapes and bigger road trips: deserts that glow at dusk, coastlines that take weeks to drive, and national parks that make you plan your life around them.",
    countries: [
      {
        slug: "united-states",
        name: "United States",
        code: "us",
        flag: "🇺🇸",
        language: "English",
        capital: "Washington, D.C.",
        regions: ["Southwest", "Pacific Northwest", "New England"],
        bestMonths: [4, 5, 6, 9, 10],
        categories: ["Road Trips", "National Parks", "Cities"],
        phrases: [
          { original: "How's it going?", translation: "Hello / casual greeting" },
          { original: "Thanks a bunch", translation: "Thank you" },
        ],
        about:
          "The United States rewards the long view: canyon country in the Southwest, rainforests in the Pacific Northwest, and fall foliage that sets New England on fire.",
      },
      {
        slug: "canada",
        name: "Canada",
        code: "ca",
        flag: "🇨🇦",
        language: "English",
        capital: "Ottawa",
        regions: ["Canadian Rockies", "Maritimes", "Yukon"],
        bestMonths: [6, 7, 8, 9],
        categories: ["Nature", "Road Trips", "Wildlife"],
        phrases: [
          { original: "How's it going, eh?", translation: "Friendly hello" },
          { original: "Thanks a million", translation: "Thank you" },
        ],
        about:
          "Canada's scale is the point — turquoise lakes stacked in the Rockies, lighthouse roads through the Maritimes, and midnight-sun gravel in the Yukon.",
      },
      {
        slug: "mexico",
        name: "Mexico",
        code: "mx",
        flag: "🇲🇽",
        language: "Spanish",
        capital: "Mexico City",
        regions: ["Oaxaca", "Yucatán", "Baja California"],
        bestMonths: [11, 12, 1, 2, 3],
        categories: ["Food", "Beaches", "History"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Mexico eats, swims, and builds in color: mole kitchens in Oaxaca, cenotes beneath the Yucatán, and whale-watching lagoons down the Baja peninsula.",
      },
      {
        slug: "costa-rica",
        name: "Costa Rica",
        code: "cr",
        flag: "🇨🇷",
        language: "Spanish",
        capital: "San José",
        regions: ["Arenal", "Manuel Antonio", "Monteverde"],
        bestMonths: [12, 1, 2, 3],
        categories: ["Wildlife", "Adventure", "Rainforests"],
        phrases: [
          { original: "Pura vida", translation: "Hello / pure life (all-purpose phrase)" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Costa Rica's pura vida philosophy is backed by real biodiversity: hanging bridges through cloud forest, sloths over the trailhead, and surf at sunset on two coasts.",
      },
      {
        slug: "guatemala",
        name: "Guatemala",
        code: "gt",
        flag: "🇬🇹",
        language: "Spanish",
        capital: "Guatemala City",
        regions: ["Lake Atitlán", "Antigua", "Tikal"],
        bestMonths: [11, 12, 1, 2, 3],
        categories: ["Culture", "Volcanoes", "History"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Muchas gracias", translation: "Thank you very much" },
        ],
        about:
          "Guatemala layers Maya heritage over volcanic drama — sunrise temples at Tikal, kayaks on Lake Atitlán, and cobblestone Antigua framed by smoking cones.",
      },
      {
        slug: "cuba",
        name: "Cuba",
        code: "cu",
        flag: "🇨🇺",
        language: "Spanish",
        capital: "Havana",
        regions: ["Havana", "Viñales", "Trinidad"],
        bestMonths: [11, 12, 1, 2, 3],
        categories: ["Culture", "Music", "Road Trips"],
        phrases: [
          { original: "¿Qué bolá?", translation: "What's up? (Cuban greeting)" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Cuba moves to its own tempo: vintage Chevrolets through Havana, tobacco farms in the Viñales valley, and son cubano spilling out of Trinidad's doorways.",
      },
      {
        slug: "panama",
        name: "Panama",
        code: "pa",
        flag: "🇵🇦",
        language: "Spanish",
        capital: "Panama City",
        regions: ["Boquete", "San Blas", "Bocas del Toro"],
        bestMonths: [12, 1, 2, 3],
        categories: ["Islands", "Adventure", "Culture"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Panama connects two oceans and two centuries — the canal's container ballet, Guna Yala's island constellation, and cloud-forest coffee farms in Boquete.",
      },
      {
        slug: "belize",
        name: "Belize",
        code: "bz",
        flag: "🇧🇿",
        language: "English",
        capital: "Belmopan",
        regions: ["Ambergris Caye", "Cayo District", "Placencia"],
        bestMonths: [11, 12, 1, 2, 3, 4],
        categories: ["Diving", "Maya Ruins", "Islands"],
        phrases: [
          { original: "Weh di gwaan?", translation: "What's going on? (Belizean Creole)" },
          { original: "Thank you", translation: "Thank you" },
        ],
        about:
          "Belize is English-speaking, reef-fringed, and jungle-hearted — the hemisphere's second-largest barrier reef out front, Maya caves and temples out back.",
      },
      {
        slug: "jamaica",
        name: "Jamaica",
        code: "jm",
        flag: "🇯🇲",
        language: "English",
        capital: "Kingston",
        regions: ["Negril", "Blue Mountains", "Port Antonio"],
        bestMonths: [11, 12, 1, 2, 3],
        categories: ["Beaches", "Music", "Food"],
        phrases: [
          { original: "Wa gwaan", translation: "What's going on? (greeting)" },
          { original: "Give thanks", translation: "Thank you" },
        ],
        about:
          "Jamaica pours rhythm into everything — seven-mile sunsets in Negril, blue-mountain coffee farms at dawn, and jerk smoke drifting through Portland's fishing beaches.",
      },
      {
        slug: "honduras",
        name: "Honduras",
        code: "hn",
        flag: "🇭🇳",
        language: "Spanish",
        capital: "Tegucigalpa",
        regions: ["Bay Islands", "Copán", "La Ceiba"],
        bestMonths: [12, 1, 2, 3],
        categories: ["Diving", "Maya Ruins", "Rainforests"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Honduras pairs the cheapest place to learn diving in the Caribbean with the carved stelae of Copán and cloud-forest national parks inland.",
      },
    ],
  },
  {
    slug: "south-america",
    name: "South America",
    heroImage: "/hero-desert.jpg",
    introduction:
      "South America is a continent of superlatives: the driest desert, the largest rainforest, the longest mountain range. Between them sit cities that dance, deserts that bloom, and salt flats that mirror the sky.",
    countries: [
      {
        slug: "peru",
        name: "Peru",
        code: "pe",
        flag: "🇵🇪",
        language: "Spanish",
        capital: "Lima",
        regions: ["Cusco", "Sacred Valley", "Arequipa"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["History", "Hiking", "Food"],
        phrases: [
          { original: "Allillanchu", translation: "How are you? (Quechua)" },
          { original: "Sulpayki", translation: "Thank you (Quechua)" },
        ],
        about:
          "Peru stacks wonders at altitude: Inca terraces in the Sacred Valley, condors over Colca Canyon, and one of the world's great food capitals in Lima.",
      },
      {
        slug: "chile",
        name: "Chile",
        code: "cl",
        flag: "🇨🇱",
        language: "Spanish",
        capital: "Santiago",
        regions: ["Atacama", "Patagonia", "Valle Central"],
        bestMonths: [10, 11, 12, 3],
        categories: ["Desert", "Mountains", "Wine"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Chile is 4,300 kilometers of extremes — stargazing deserts in Atacama, granite towers in Patagonia, and Carménère vineyards between the Andes and the sea.",
      },
      {
        slug: "argentina",
        name: "Argentina",
        code: "ar",
        flag: "🇦🇷",
        language: "Spanish",
        capital: "Buenos Aires",
        regions: ["Patagonia", "Mendoza", "Buenos Aires"],
        bestMonths: [10, 11, 12, 3],
        categories: ["Food", "Mountains", "Road Trips"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Argentina savors everything slowly: Malbec afternoons in Mendoza, glacier-blue mornings near El Calafate, and late-night tango in Buenos Aires.",
      },
      {
        slug: "brazil",
        name: "Brazil",
        code: "br",
        flag: "🇧🇷",
        language: "Portuguese",
        capital: "Brasília",
        regions: ["Rio de Janeiro", "Amazon", "Bahia"],
        bestMonths: [4, 5, 9, 10],
        categories: ["Beaches", "Rainforests", "Culture"],
        phrases: [
          { original: "Olá", translation: "Hello" },
          { original: "Obrigado", translation: "Thank you" },
        ],
        about:
          "Brazil is joy at continental scale — samba echo in Rio's hills, pink river dolphins in the Amazon, and Afro-Brazilian drums rolling through Bahia.",
      },
      {
        slug: "colombia",
        name: "Colombia",
        code: "co",
        flag: "🇨🇴",
        language: "Spanish",
        capital: "Bogotá",
        regions: ["Medellín", "Cartagena", "Coffee Triangle"],
        bestMonths: [12, 1, 2, 7, 8],
        categories: ["Culture", "Coffee", "Beaches"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Muchas gracias", translation: "Thank you very much" },
        ],
        about:
          "Colombia has rewritten its story: cable cars over Medellín's comunas, wax-palm valleys in the Coffee Triangle, and Caribbean battlements around old Cartagena.",
      },
      {
        slug: "ecuador",
        name: "Ecuador",
        code: "ec",
        flag: "🇪🇨",
        language: "Spanish",
        capital: "Quito",
        regions: ["Galápagos", "Quito", "Avenue of Volcanoes"],
        bestMonths: [6, 7, 8, 9],
        categories: ["Wildlife", "Volcanoes", "Markets"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Ecuador fits the impossible into one trip: blue-footed boobies in the Galápagos, colonial Quito at 2,850 meters, and volcano-lined avenues south of the capital.",
      },
      {
        slug: "bolivia",
        name: "Bolivia",
        code: "bo",
        flag: "🇧🇴",
        language: "Spanish",
        capital: "Sucre",
        regions: ["Salar de Uyuni", "La Paz", "Lake Titicaca"],
        bestMonths: [5, 6, 7, 8],
        categories: ["Adventure", "Salt Flats", "Culture"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Bolivia is raw and riveting: the mirror world of Salar de Uyuni, cable cars above La Paz, and Aymara islands scattered across Lake Titicaca.",
      },
      {
        slug: "uruguay",
        name: "Uruguay",
        code: "uy",
        flag: "🇺🇾",
        language: "Spanish",
        capital: "Montevideo",
        regions: ["Colonia del Sacramento", "Punta del Este", "Cabo Polonio"],
        bestMonths: [12, 1, 2, 3],
        categories: ["Beaches", "Slow Travel", "Food"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Uruguay is South America at a stroll — candlelit cobblestones in Colonia, dune-buggy dunes in Cabo Polonio, and mate thermoses everywhere in between.",
      },
      {
        slug: "paraguay",
        name: "Paraguay",
        code: "py",
        flag: "🇵🇾",
        language: "Spanish",
        capital: "Asunción",
        regions: ["Jesuit Missions", "Asunción", "Chaco"],
        bestMonths: [5, 6, 7, 8],
        categories: ["History", "Offbeat", "Nature"],
        phrases: [
          { original: "Mba'éichapa", translation: "Hello (Guaraní)" },
          { original: "Aguyje", translation: "Thank you (Guaraní)" },
        ],
        about:
          "Paraguay surprises everyone: Guaraní spoken beside Spanish, UNESCO Jesuit missions rising from red-earth towns, and the roadless wilds of the Chaco.",
      },
      {
        slug: "venezuela",
        name: "Venezuela",
        code: "ve",
        flag: "🇻🇪",
        language: "Spanish",
        capital: "Caracas",
        regions: ["Angel Falls", "Los Roques", "Mérida"],
        bestMonths: [12, 1, 2, 3],
        categories: ["Adventure", "Islands", "Nature"],
        phrases: [
          { original: "Hola", translation: "Hello" },
          { original: "Gracias", translation: "Thank you" },
        ],
        about:
          "Venezuela keeps world records quietly — the tallest waterfall on Earth, sky-blue archipelagos in Los Roques, and Andean páramo high above Mérida.",
      },
    ],
  },
  {
    slug: "oceania",
    name: "Oceania",
    heroImage: "/northern-lights.jpg",
    introduction:
      "Oceania spreads across the planet's largest ocean: continent-sized deserts, volcanic islands ringed by coral, and cultures whose navigators read the stars long before charts existed.",
    countries: [
      {
        slug: "australia",
        name: "Australia",
        code: "au",
        flag: "🇦🇺",
        language: "English",
        capital: "Canberra",
        regions: ["Great Barrier Reef", "Red Centre", "Great Ocean Road"],
        bestMonths: [3, 4, 9, 10, 11],
        categories: ["Beaches", "Road Trips", "Wildlife"],
        phrases: [
          { original: "G'day", translation: "Hello" },
          { original: "Cheers, mate", translation: "Thanks, friend" },
        ],
        about:
          "Australia runs on distance and light: coral cays off Queensland, ochre monoliths in the Red Centre, and cliff-hugging asphalt along the Great Ocean Road.",
      },
      {
        slug: "new-zealand",
        name: "New Zealand",
        code: "nz",
        flag: "🇳🇿",
        language: "English",
        capital: "Wellington",
        regions: ["Fiordland", "Rotorua", "Queenstown"],
        bestMonths: [11, 12, 1, 2, 3],
        categories: ["Adventure", "Nature", "Road Trips"],
        phrases: [
          { original: "Kia ora", translation: "Hello (Māori)" },
          { original: "Ngā mihi", translation: "Thanks / greetings (Māori)" },
        ],
        about:
          "New Zealand compresses fjords, geysers, and vineyards into two islands, and invented bungee jumping purely because the scenery demanded it.",
      },
      {
        slug: "fiji",
        name: "Fiji",
        code: "fj",
        flag: "🇫🇯",
        language: "Fijian",
        capital: "Suva",
        regions: ["Mamanuca Islands", "Yasawa Islands", "Viti Levu"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Islands", "Diving", "Culture"],
        phrases: [
          { original: "Bula", translation: "Hello / welcome / life" },
          { original: "Vinaka", translation: "Thank you" },
        ],
        about:
          "Fiji greets you with one word and means it: bula. Behind it lie 333 islands of soft-coral diving, kava ceremonies, and villages where guests are family.",
      },
      {
        slug: "papua-new-guinea",
        name: "Papua New Guinea",
        code: "pg",
        flag: "🇵🇬",
        language: "English",
        capital: "Port Moresby",
        regions: ["Highlands", "Sepik River", "New Britain"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Culture", "Diving", "Adventure"],
        phrases: [
          { original: "Gud de", translation: "Good day (Tok Pisin)" },
          { original: "Tenkyu tru", translation: "Thank you very much (Tok Pisin)" },
        ],
        about:
          "Papua New Guinea hosts a thousand living languages: sing-sing festivals in the Highlands, spirit houses along the Sepik, and WWII wrecks off New Britain.",
      },
      {
        slug: "samoa",
        name: "Samoa",
        code: "ws",
        flag: "🇼🇸",
        language: "Samoan",
        capital: "Apia",
        regions: ["Upolu", "Savai'i", "Lalomanu"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Beaches", "Culture", "Slow Travel"],
        phrases: [
          { original: "Talofa", translation: "Hello" },
          { original: "Fa'afetai", translation: "Thank you" },
        ],
        about:
          "Samoa keeps island time beautifully — to-sua swimming holes, Sunday 'āiga family feasts, and beach fale huts steps from the warmest water you'll ever swim.",
      },
      {
        slug: "vanuatu",
        name: "Vanuatu",
        code: "vu",
        flag: "🇻🇺",
        language: "English",
        capital: "Port Vila",
        regions: ["Tanna", "Espiritu Santo", "Éfaté"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Volcanoes", "Diving", "Culture"],
        phrases: [
          { original: "Halo", translation: "Hello (Bislama)" },
          { original: "Tangkyu tumas", translation: "Thank you very much (Bislama)" },
        ],
        about:
          "Vanuatu glows at both ends: Mount Yasur's lava fireworks on Tanna and the wreck of the SS President Coolidge on the reefs of Espiritu Santo.",
      },
      {
        slug: "tonga",
        name: "Tonga",
        code: "to",
        flag: "🇹🇴",
        language: "Tongan",
        capital: "Nukuʻalofa",
        regions: ["Vavaʻu", "Tongatapu", "Haʻapai"],
        bestMonths: [7, 8, 9, 10],
        categories: ["Whales", "Islands", "Culture"],
        phrases: [
          { original: "Mālō e lelei", translation: "Hello" },
          { original: "Mālō", translation: "Thank you" },
        ],
        about:
          "Tonga is one of the only places on Earth where you can swim with humpback whales — after a Sunday where, by law, everything rests.",
      },
      {
        slug: "palau",
        name: "Palau",
        code: "pw",
        flag: "🇵🇼",
        language: "English",
        capital: "Ngerulmud",
        regions: ["Rock Islands", "Ngarchelong", "Peleliu"],
        bestMonths: [2, 3, 4, 5],
        categories: ["Diving", "Nature", "Islands"],
        phrases: [
          { original: "Alii", translation: "Hello (Palauan)" },
          { original: "Sulang", translation: "Thank you (Palauan)" },
        ],
        about:
          "Palau guards the ocean like nowhere else: jellyfish lakes you can swim in, a shark sanctuary the size of France, and mushroom islets rising from a gin-clear lagoon.",
      },
      {
        slug: "french-polynesia",
        name: "French Polynesia",
        code: "pf",
        flag: "🇵🇫",
        language: "French",
        capital: "Papeete",
        regions: ["Bora Bora", "Moorea", "Rangiroa"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Islands", "Diving", "Honeymoon"],
        phrases: [
          { original: "Ia ora na", translation: "Hello (Tahitian)" },
          { original: "Māuruuru", translation: "Thank you (Tahitian)" },
        ],
        about:
          "French Polynesia is the postcard and then some: overwater bungalows on Bora Bora, dolphin lagoons in Moorea, and a turquoise lane through Rangiroa's atoll.",
      },
      {
        slug: "solomon-islands",
        name: "Solomon Islands",
        code: "sb",
        flag: "🇸🇧",
        language: "English",
        capital: "Honiara",
        regions: ["Gizo", "Marovo Lagoon", "Guadalcanal"],
        bestMonths: [5, 6, 7, 8, 9],
        categories: ["Diving", "WWII History", "Islands"],
        phrases: [
          { original: "Halo", translation: "Hello (Solomon Pijin)" },
          { original: "Tagio tumas", translation: "Thank you very much (Solomon Pijin)" },
        ],
        about:
          "The Solomon Islands reward expedition-minded travelers: the coral walls of Marovo Lagoon, WWII wrecks off Guadalcanal, and villages reachable only by canoe.",
      },
    ],
  },
];

export const continentBySlug = new Map(continents.map((c) => [c.slug, c]));
export const allCountries: (CountrySpec & { continentSlug: string })[] = continents.flatMap((continent) =>
  continent.countries.map((country) => ({ ...country, continentSlug: continent.slug })),
);
export const countryBySlug = new Map(allCountries.map((c) => [c.slug, c]));
