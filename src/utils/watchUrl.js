/**
 * Watch URL Utilities
 * Generates watch URLs from configurable patterns
 */

// Turkish character map for slugification
const TURKISH_CHAR_MAP = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'I': 'I',
    'İ': 'I', 'i': 'i',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U',
}

/**
 * Convert a string to URL-safe slug
 * Handles Turkish characters and special symbols
 * @param {string} text - Text to slugify
 * @returns {string} URL-safe slug
 */
export function slugify(text) {
    if (!text) return ''

    let slug = text.toLowerCase()

    // Replace Turkish characters
    for (const [turkishChar, latinChar] of Object.entries(TURKISH_CHAR_MAP)) {
        slug = slug.replace(new RegExp(turkishChar, 'g'), latinChar.toLowerCase())
    }

    // Remove special characters and replace spaces with hyphens
    slug = slug
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Replace multiple hyphens with single
        .replace(/^-|-$/g, '')         // Trim hyphens from start/end

    return slug
}

/**
 * Generate a watch URL from a pattern and parameters
 * @param {string} baseUrl - Base URL (e.g., "https://dizipal1984.com/dizi")
 * @param {string} pattern - URL pattern with placeholders (e.g., "%dizi_adi%/%sezon%-sezon/%bolum%-bolum")
 * @param {Object} params - Parameters to replace placeholders
 * @param {string} params.showName - Name of the show (used if no customSlug provided)
 * @param {number} params.season - Season number
 * @param {number} params.episode - Episode number
 * @param {string} [params.customSlug] - Optional custom slug to use instead of auto-generated
 * @returns {string|null} Generated URL or null if configuration is incomplete
 */
export function generateWatchUrl(baseUrl, pattern, params) {
    if (!baseUrl || !pattern) return null

    const { showName, season, episode, customSlug } = params
    if (season === undefined || episode === undefined) return null
    if (!customSlug && !showName) return null

    // Use custom slug if provided, otherwise auto-generate from show name
    const showSlug = customSlug || slugify(showName)

    let url = pattern
        .replace(/%dizi_adi%/g, showSlug)
        .replace(/%sezon%/g, String(season))
        .replace(/%bolum%/g, String(episode))

    // Ensure baseUrl doesn't end with slash and pattern doesn't start with slash
    const cleanBase = baseUrl.replace(/\/+$/, '')
    const cleanPattern = url.replace(/^\/+/, '')

    return `${cleanBase}/${cleanPattern}`
}

// LocalStorage keys for watch URL settings
export const WATCH_URL_STORAGE_KEYS = {
    BASE_URL: 'watchUrl_baseUrl',
    PATTERN: 'watchUrl_pattern',
    CUSTOM_SLUGS: 'watchUrl_customSlugs',
}

/**
 * Get watch URL settings from localStorage
 * @returns {Object} Settings object with baseUrl and pattern
 */
export function getWatchUrlSettings() {
    return {
        baseUrl: localStorage.getItem(WATCH_URL_STORAGE_KEYS.BASE_URL) || 'https://dizipal1984.com/dizi',
        pattern: localStorage.getItem(WATCH_URL_STORAGE_KEYS.PATTERN) || '%dizi_adi%/%sezon%-sezon/%bolum%-bolum',
    }
}

/**
 * Save watch URL settings to localStorage
 * @param {string} baseUrl - Base URL
 * @param {string} pattern - URL pattern
 */
export function saveWatchUrlSettings(baseUrl, pattern) {
    localStorage.setItem(WATCH_URL_STORAGE_KEYS.BASE_URL, baseUrl)
    localStorage.setItem(WATCH_URL_STORAGE_KEYS.PATTERN, pattern)
}

/**
 * Get custom watch slug for a specific show
 * @param {number|string} showId - TMDB show ID
 * @returns {string|null} Custom slug or null if not set
 */
export function getCustomWatchSlug(showId) {
    try {
        const slugsJson = localStorage.getItem(WATCH_URL_STORAGE_KEYS.CUSTOM_SLUGS)
        if (!slugsJson) return null
        const slugs = JSON.parse(slugsJson)
        return slugs[String(showId)] || null
    } catch {
        return null
    }
}

/**
 * Save custom watch slug for a specific show
 * @param {number|string} showId - TMDB show ID
 * @param {string} slug - Custom slug (empty string to remove)
 */
export function setCustomWatchSlug(showId, slug) {
    try {
        const slugsJson = localStorage.getItem(WATCH_URL_STORAGE_KEYS.CUSTOM_SLUGS)
        const slugs = slugsJson ? JSON.parse(slugsJson) : {}

        if (slug && slug.trim()) {
            slugs[String(showId)] = slug.trim()
        } else {
            delete slugs[String(showId)]
        }

        localStorage.setItem(WATCH_URL_STORAGE_KEYS.CUSTOM_SLUGS, JSON.stringify(slugs))
    } catch (error) {
        console.error('Error saving custom watch slug:', error)
    }
}
