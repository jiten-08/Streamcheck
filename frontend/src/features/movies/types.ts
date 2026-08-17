export interface Movie {
  id: number
  slug: string
  title: string
  tagline: string
  description: string
  year: number
  rating: number
  maturity: string
  duration: string
  genres: string[]
  accent: string
  match: number
  progress?: number
  rank?: number
  isNew?: boolean
}

export interface Genre {
  name: string
  count: number
  accent: string
}
