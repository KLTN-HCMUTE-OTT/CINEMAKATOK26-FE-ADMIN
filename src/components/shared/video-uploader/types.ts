export interface VideoMetadata {
  type: 'MOVIE' | 'TVSERIES'
  title: string
  description: string
  releaseDate: string
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17' | 'TV-Y' | 'TV-PG' | 'TV-14' | 'TV-MA'
  thumbnail: string
  banner: string
  trailer: string
  imdbRating: number
  avgRating: number
  categories: Array<{ id: string; categoryName: string }>
  tags: Array<{ id: string; tagName: string }>
  actors: Array<{ id: string; name: string }>
  directors: Array<{ id: string; name: string }>
}
