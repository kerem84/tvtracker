import { TMDB_CONFIG } from '../utils/constants'

const fetchFromTMDB = async (endpoint, params = {}) => {
  const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`)
  url.searchParams.append('api_key', TMDB_CONFIG.API_KEY)
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
