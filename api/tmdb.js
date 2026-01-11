/**
 * Vercel Serverless Function - TMDB API Proxy
 *
 * This proxy protects the TMDB API key by keeping it on the server-side.
 * All TMDB requests are routed through this endpoint.
 *
 * Usage: /api/tmdb?endpoint=/tv/popular&page=1
 */

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get the TMDB API key from environment variables
  const apiKey = process.env.TMDB_API_KEY

  if (!apiKey) {
    console.error('TMDB_API_KEY is not set in environment variables')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Get endpoint and other query parameters
  const { endpoint, ...params } = req.query

  if (!endpoint) {
    return res.status(400).json({ error: 'Missing endpoint parameter' })
  }

  try {
    // Build the TMDB API URL
    const url = new URL(`https://api.themoviedb.org/3${endpoint}`)

    // Add API key
    url.searchParams.append('api_key', apiKey)

    // Add language (Turkish)
    url.searchParams.append('language', 'tr-TR')

    // Add other query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value)
      }
    })

    // Fetch from TMDB
    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`TMDB API Error: ${response.status} ${errorText}`)
      return res.status(response.status).json({
        error: 'TMDB API request failed',
        status: response.status
      })
    }

    // Get the data
    const data = await response.json()

    // Set cache headers (cache for 5 minutes)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    // Return the data
    return res.status(200).json(data)

  } catch (error) {
    console.error('Proxy error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
}
