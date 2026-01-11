/**
 * TMDB API Service
 * 
 * In production, requests are routed through our serverless proxy (/api/tmdb)
 * to keep the API key secure. In development, it falls back to direct requests
 * if the proxy is not available.
 */

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const fetchFromTMDB = async (endpoint, params = {}) => {
  // In development, we might want to use direct fetch if not using vercel dev
  const isDev = import.meta.env.DEV

  // Rule: If we have an API key and we are in dev, use direct fetch for convenience
  // unless we want to test the proxy.
  if (isDev && API_KEY) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    url.searchParams.append('api_key', API_KEY)
    url.searchParams.append('language', 'tr-TR')

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value)
      }
    })

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.statusText}`)
    }
    return response.json()
  }

  // Production or Proxy fallback
  const url = new URL('/api/tmdb', window.location.origin)
  url.searchParams.append('endpoint', endpoint)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value)
    }
  })

  const response = await fetch(url)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `TMDB API Error: ${response.statusText}`)
  }

  return response.json()
}

// Search
export const searchShows = async (query, page = 1) => {
  return fetchFromTMDB('/search/tv', { query, page })
}

// Show details
export const getShowDetails = async (showId) => {
  return fetchFromTMDB(`/tv/${showId}`)
}

export const getSeasonDetails = async (showId, seasonNumber) => {
  return fetchFromTMDB(`/tv/${showId}/season/${seasonNumber}`)
}

// Discover
export const getPopularShows = async (page = 1) => {
  return fetchFromTMDB('/tv/popular', { page })
}

export const getAiringToday = async (page = 1) => {
  return fetchFromTMDB('/tv/airing_today', { page })
}

export const getOnTheAir = async (page = 1) => {
  return fetchFromTMDB('/tv/on_the_air', { page })
}

export const getTrendingShows = async (timeWindow = 'week', page = 1) => {
  return fetchFromTMDB(`/trending/tv/${timeWindow}`, { page })
}

export const getShowsByGenre = async (genreId, page = 1) => {
  return fetchFromTMDB('/discover/tv', { with_genres: genreId, page })
}

// Genres
export const getGenres = async () => {
  return fetchFromTMDB('/genre/tv/list')
}

// Recommendations
export const getSimilarShows = async (showId) => {
  return fetchFromTMDB(`/tv/${showId}/similar`)
}

export const getRecommendedShows = async (showId) => {
  return fetchFromTMDB(`/tv/${showId}/recommendations`)
}

// Images
export const getShowImages = async (showId) => {
  return fetchFromTMDB(`/tv/${showId}/images`)
}
