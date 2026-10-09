const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE = 'https://api.themoviedb.org/3'
export const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

export async function searchMovies(query) {
  if (!query.trim()) return []
  const url = `${BASE}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('TMDB search failed')
  const data = await res.json()
  return data.results ?? []
}

export function posterUrl(posterPath) {
  return posterPath ? `${IMAGE_BASE}${posterPath}` : null
}