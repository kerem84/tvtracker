/**
 * Sanitization and Validation Utilities
 *
 * Provides XSS protection for user-generated content
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content with DOMPurify
 * Allows only safe HTML tags (bold, italic, links)
 *
 * @param {string} dirty - Untrusted HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty) return ''

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize plain text (no HTML allowed)
 * Escapes all HTML characters
 *
 * @param {string} text - Untrusted text string
 * @returns {string} - Escaped text string
 */
export const sanitizeText = (text) => {
  if (!text) return ''

  // Create a temporary div to leverage browser's text encoding
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Validate and sanitize username
 * Rules:
 * - 3-20 characters
 * - Only letters, numbers, underscores, hyphens
 * - No special characters or spaces
 *
 * @param {string} username - Username to validate
 * @returns {Object} - { valid: boolean, sanitized: string, error: string }
 */
export const validateUsername = (username) => {
  if (!username) {
    return {
      valid: false,
      sanitized: '',
      error: 'Kullanıcı adı gereklidir',
    }
  }

  // Trim whitespace
  const trimmed = username.trim()

  // Length check
  if (trimmed.length < 3) {
    return {
      valid: false,
      sanitized: trimmed,
      error: 'Kullanıcı adı en az 3 karakter olmalıdır',
    }
  }

  if (trimmed.length > 20) {
    return {
      valid: false,
      sanitized: trimmed,
      error: 'Kullanıcı adı en fazla 20 karakter olabilir',
    }
  }

  // Character validation (only alphanumeric, underscore, hyphen)
  const validPattern = /^[a-zA-Z0-9_-]+$/
  if (!validPattern.test(trimmed)) {
    return {
      valid: false,
      sanitized: trimmed,
      error: 'Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve tire (-) içerebilir',
    }
  }

  // Must start with a letter or number
  const startsWithAlphanumeric = /^[a-zA-Z0-9]/
  if (!startsWithAlphanumeric.test(trimmed)) {
    return {
      valid: false,
      sanitized: trimmed,
      error: 'Kullanıcı adı harf veya rakam ile başlamalıdır',
    }
  }

  return {
    valid: true,
    sanitized: trimmed,
    error: null,
  }
}

/**
 * Sanitize note content
 * Removes all HTML and returns plain text
 *
 * @param {string} note - Note content
 * @returns {string} - Sanitized note
 */
export const sanitizeNote = (note) => {
  if (!note) return ''

  // Remove all HTML tags and return plain text
  const sanitized = DOMPurify.sanitize(note, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })

  return sanitized.trim()
}

/**
 * Validate note length
 *
 * @param {string} note - Note content
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {Object} - { valid: boolean, error: string }
 */
export const validateNote = (note, maxLength = 1000) => {
  if (!note) {
    return { valid: true, error: null }
  }

  if (note.length > maxLength) {
    return {
      valid: false,
      error: `Not en fazla ${maxLength} karakter olabilir`,
    }
  }

  return { valid: true, error: null }
}

/**
 * Escape HTML entities in a string
 * Useful for displaying user input as text
 *
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export const escapeHTML = (str) => {
  if (!str) return ''

  const htmlEntities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }

  return String(str).replace(/[&<>"'/]/g, (char) => htmlEntities[char])
}
