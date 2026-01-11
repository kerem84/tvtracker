/**
 * TMDB API Service
 *
 * All requests are routed through our serverless proxy (/api/tmdb)
 * to keep the API key secure on the server-side.
 */

const fetchFromTMDB = async (endpoint, params = {}) => {
  // Build the proxy URL
  const url = new URL('/api/tmdb', window.location.origin)
  url.searchParams.append('endpoint', endpoint)

  // Add other query parameters
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
