import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ArticleCard from "@/components/ArticleCard";
import NewsletterSignup from "@/components/NewsletterSignup";
import { Eye, Heart } from "lucide-react";
import { useDestinations, useFeaturedArticles, usePopularArticles } from "@/hooks/useContent";

import heroGreece from "@/assets/hero-greece.jpg";
import heroDesert from "@/assets/hero-desert.jpg";
import heroCamping from "@/assets/hero-camping.jpg";
import worldMap from "@/assets/world-map.jpg";
import bloggers from "@/assets/bloggers.jpg";
import travelBooks from "@/assets/travel-books.jpg";

const heroSlides = [
  { image: heroGreece, alt: "Santorini Greece sunset", subtitle: "Van road trips around the world..." },
  { image: heroDesert, alt: "Desert road trip adventure", subtitle: "Discover untouched landscapes..." },
  { image: heroCamping, alt: "Coastal camping van life", subtitle: "Adventure awaits everywhere..." },
];

const continentTags = ["Africa", "Asia", "Europe", "Central America", "South America", "Oceania", "North America"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const Index = () => {
  const { continents } = useDestinations();
  const { articles: featuredArticles } = useFeaturedArticles();
  const { articles: popularArticles } = usePopularArticles(4);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/50" />

        {/* Stamp badge */}
        <div className="absolute top-8 right-8 md:top-12 md:right-16 stamp-badge text-primary-foreground border-primary-foreground/60 hidden md:flex">
          <span>We Are<br/>Travellers<br/>Est. 2013</span>
        </div>

        <div className="relative h-full flex flex-col justify-end pb-20 px-6 md:px-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary-foreground/60 text-xs uppercase tracking-[0.3em] mb-3 font-medium">We Are Travellers</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground tracking-tight mb-4 max-w-3xl italic leading-[1.1]">
              Van road trips around the world, we've got you covered
            </h1>
            <p className="text-primary-foreground/70 text-xs uppercase tracking-[0.2em] mb-6">Where do you want to go?</p>
            <div className="flex items-center max-w-sm bg-card/90 backdrop-blur rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent pl-4 pr-2 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm"
              />
              <button className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-md m-0.5 hover:bg-primary/90 transition-colors shrink-0">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Wavy bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30C240 60 480 0 720 30C960 60 1200 0 1440 30V60H0V30Z" fill="hsl(40, 33%, 96%)" />
          </svg>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">
            All the tips you need for your next trip
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">
            Discover our latest travel tips
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredArticles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <ArticleCard article={article} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Most read this month */}
      {popularArticles.length > 0 && (
        <section className="bg-earth-cream border-y border-border py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">
                  Reader favourites
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground italic">
                  Most read this month
                </h2>
              </div>
              <Link to="/destinations" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                Browse all destinations <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/article/${article.id}`} className="group block bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={article.image} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-primary mb-2 font-medium">{article.category}</p>
                      <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition">{article.title}</h3>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {(article.viewCount ?? 0).toLocaleString()}</span>
                        <span className="inline-flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {article.likeCount ?? 0}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Where to Next - World Map */}
      <section className="relative py-24 overflow-hidden">
        <img src={worldMap} alt="World map" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-earth-dark/90" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
          {/* Small stamp */}
          <div className="stamp-badge text-primary-foreground/60 border-primary-foreground/30 mx-auto mb-6 w-16 h-16 text-[8px]">
            <span>Where<br/>To Next</span>
          </div>
          <p className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.3em] mb-2">Where to next?</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-10 italic">
            Choose your adventure
          </h2>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {continentTags.map((tag) => (
              <Link
                key={tag}
                to={`/destinations/${tag.toLowerCase().replace(/ /g, "-")}`}
                className="bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground/80 px-6 py-2 rounded-full text-xs font-medium tracking-wide hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Travel Promotion */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Traveling solo together</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 italic leading-snug">
              Book your adventure trip this week and receive up to €250 discount
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              Love adventure, making friends, but want to travel solo? Explorer Tours makes it easy to book solo trips and meet amazing people along the way. Whether you're heading to Iceland or Thailand, there's a group adventure waiting for you.
            </p>
            <Link
              to="/routes"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 transition"
            >
              Explore trips <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-lg overflow-hidden shadow-md"
          >
            <img src={heroDesert} alt="Adventure trip promotion" className="w-full h-80 object-cover" />
          </motion.div>
        </div>
      </section>

      {/* About / Meet the Team */}
      <section className="bg-earth-cream">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative">
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                src={bloggers}
                alt="The We Are Travellers team"
                className="rounded-lg shadow-md w-full h-96 object-cover"
              />
              {/* Team member badges */}
              <div className="absolute -top-4 -right-4 bg-card rounded-full w-20 h-20 shadow-lg flex flex-col items-center justify-center text-center border-2 border-border">
                <span className="text-[9px] font-medium text-muted-foreground">Travel Blogger</span>
                <span className="text-xs font-bold text-foreground font-display">Michael</span>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-full w-20 h-20 shadow-lg flex flex-col items-center justify-center text-center border-2 border-border">
                <span className="text-[9px] font-medium text-muted-foreground">Founder</span>
                <span className="text-xs font-bold text-foreground font-display">Sarah</span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Meet the Team</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 italic">
                We are We Are Travellers
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                After a world journey in an old Land Cruiser through South America and exploring remote regions of Europe, we decided to share our passion for travel with fellow adventurers. Since 2013, we've been writing about our discoveries.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                Our team of travel bloggers now spans the globe — from desert road trips to Arctic adventures, we've got you covered.
              </p>
              <Link
                to="/destinations"
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Read more about us <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Travel Books */}
      <section className="bg-muted">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Our Books</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 italic">
                Want the very best travel tips?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                We've distilled years of travel experience into comprehensive guidebooks. Packed with insider tips, hidden gems, and practical advice for your next adventure.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Browse our guides <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img src={travelBooks} alt="Travel guide books" className="w-full h-80 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations by Continent */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Have you been here before?</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {continents.slice(0, 4).map((continent) => (
            <div key={continent.slug} className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-display text-2xl font-bold text-foreground mb-1 italic">{continent.name}</h3>
              <ul className="space-y-3 mt-4">
                {continent.countries.slice(0, 3).map((country) => (
                  <li key={country.slug} className="flex items-start gap-3">
                    <span className="text-primary font-display font-bold text-sm uppercase tracking-wide mt-0.5 min-w-[80px]">{country.name}</span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      {country.articles[0]?.title}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to={`/destinations/${continent.slug}`}
                className="inline-flex items-center gap-1 text-primary font-semibold text-xs mt-5 border border-primary rounded-full px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                See all in {continent.name} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* When to Travel */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">When do you want to travel?</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {months.map((month) => (
              <button
                key={month}
                className="px-5 py-2 rounded-full border border-border text-xs font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all tracking-wide"
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <NewsletterSignup />
      </section>
    </Layout>
  );
};

export default Index;