export interface TravelRoute {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  image: string;
  countries: string[];
  difficulty: "Easy" | "Moderate" | "Challenging";
  bestSeason: string;
  budget: string;
  highlights: string[];
  itinerary: { day: string; title: string; description: string }[];
  tips: string[];
}
