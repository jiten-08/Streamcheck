import type { Genre, Movie } from "@/features/movies/types"

export const featuredMovie: Movie = {
  id: 1,
  slug: "eclipse-protocol",
  title: "Eclipse Protocol",
  tagline: "The signal was never meant for us.",
  description: "When a deep-space transmission reaches Earth, a brilliant cryptographer discovers a warning hidden inside—and only 48 hours remain to decode it.",
  year: 2026,
  rating: 8.8,
  maturity: "U/A 16+",
  duration: "2h 14m",
  genres: ["Sci-Fi", "Thriller"],
  accent: "#6366F1",
  match: 98,
  isNew: true,
}

const catalog: Movie[] = [
  featuredMovie,
  { id: 2, slug: "neon-horizon", title: "Neon Horizon", tagline: "Run beyond the light.", description: "A courier uncovers a city-wide conspiracy.", year: 2026, rating: 8.4, maturity: "U/A 13+", duration: "1h 58m", genres: ["Action", "Sci-Fi"], accent: "#EC4899", match: 96 },
  { id: 3, slug: "the-last-signal", title: "The Last Signal", tagline: "Some messages never fade.", description: "A radio operator hears a voice from the past.", year: 2025, rating: 8.1, maturity: "U/A 16+", duration: "2h 6m", genres: ["Mystery", "Drama"], accent: "#06B6D4", match: 94 },
  { id: 4, slug: "arcadia", title: "Arcadia", tagline: "Paradise has a price.", description: "A perfect virtual world begins to fracture.", year: 2026, rating: 7.9, maturity: "U/A 13+", duration: "1h 51m", genres: ["Sci-Fi", "Drama"], accent: "#22C55E", match: 91 },
  { id: 5, slug: "zero-hour", title: "Zero Hour", tagline: "Every second is borrowed.", description: "An agent races to prevent a global blackout.", year: 2025, rating: 8.3, maturity: "U/A 16+", duration: "2h 2m", genres: ["Action", "Thriller"], accent: "#EF4444", match: 95 },
  { id: 6, slug: "velvet-night", title: "Velvet Night", tagline: "The city keeps its secrets.", description: "A detective enters a glamorous underworld.", year: 2025, rating: 7.8, maturity: "A", duration: "1h 47m", genres: ["Crime", "Mystery"], accent: "#A855F7", match: 89 },
  { id: 7, slug: "afterlight", title: "Afterlight", tagline: "Hope survives the dark.", description: "Strangers cross a transformed continent.", year: 2026, rating: 8.6, maturity: "U/A 13+", duration: "2h 9m", genres: ["Adventure", "Drama"], accent: "#F59E0B", match: 97, isNew: true },
  { id: 8, slug: "static-dreams", title: "Static Dreams", tagline: "Reality is only a frequency.", description: "A musician learns to tune into parallel lives.", year: 2025, rating: 7.7, maturity: "U/A 13+", duration: "1h 44m", genres: ["Fantasy", "Romance"], accent: "#8B5CF6", match: 88 },
  { id: 9, slug: "northstar", title: "Northstar", tagline: "Find your way home.", description: "An explorer faces the unforgiving Arctic.", year: 2026, rating: 8.2, maturity: "U", duration: "1h 55m", genres: ["Adventure", "Drama"], accent: "#3B82F6", match: 93, isNew: true },
  { id: 10, slug: "redline", title: "Redline", tagline: "Speed is the only truth.", description: "Underground racers compete for one last prize.", year: 2025, rating: 7.6, maturity: "U/A 16+", duration: "1h 49m", genres: ["Action", "Sport"], accent: "#F43F5E", match: 87 },
  { id: 11, slug: "echo-lake", title: "Echo Lake", tagline: "The water remembers.", description: "A family retreat reveals a buried secret.", year: 2026, rating: 8.0, maturity: "U/A 16+", duration: "1h 53m", genres: ["Horror", "Mystery"], accent: "#14B8A6", match: 92 },
  { id: 12, slug: "paper-kingdom", title: "Paper Kingdom", tagline: "Every story needs a hero.", description: "A young artist draws a world into existence.", year: 2025, rating: 8.5, maturity: "U", duration: "1h 42m", genres: ["Animation", "Family"], accent: "#F97316", match: 96 },
  { id: 13, slug: "black-tides", title: "Black Tides", tagline: "Nothing stays buried.", description: "A salvage team finds more than a wreck.", year: 2026, rating: 7.9, maturity: "U/A 16+", duration: "2h 1m", genres: ["Thriller", "Adventure"], accent: "#0EA5E9", match: 90, isNew: true },
  { id: 14, slug: "golden-state", title: "Golden State", tagline: "Dreams have consequences.", description: "Three artists chase fame in modern Los Angeles.", year: 2025, rating: 7.8, maturity: "U/A 13+", duration: "1h 56m", genres: ["Drama", "Music"], accent: "#EAB308", match: 89 },
]

export const trendingMovies = catalog.slice(1, 7).map((movie, index) => ({ ...movie, rank: index + 1 }))
export const continueWatching = [
  { ...catalog[8], progress: 68 },
  { ...catalog[3], progress: 34 },
  { ...catalog[5], progress: 82 },
  { ...catalog[11], progress: 21 },
]
export const popularMovies = [catalog[6], catalog[4], catalog[10], catalog[2], catalog[9], catalog[13]]
export const recommendedMovies = [catalog[7], catalog[11], catalog[3], catalog[12], catalog[5], catalog[8]]
export const latestReleases = catalog.filter((movie) => movie.isNew)

export const genres: Genre[] = [
  { name: "Action", count: 148, accent: "#EF4444" },
  { name: "Sci-Fi", count: 96, accent: "#6366F1" },
  { name: "Drama", count: 214, accent: "#F59E0B" },
  { name: "Comedy", count: 173, accent: "#22C55E" },
  { name: "Thriller", count: 121, accent: "#06B6D4" },
  { name: "Animation", count: 84, accent: "#EC4899" },
]
