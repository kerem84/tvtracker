/**
 * Calculates the user's rank based on total minutes watched.
 * @param {number} totalMinutes - Total minutes watched
 * @returns {object} Rank object with title, color, and next rank details
 */
export const getUserRank = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)

    if (hours < 10) {
        return {
            title: 'Acemi Gözlemci',
            color: 'from-slate-400 to-slate-500',
            icon: '🌱',
            nextRank: 'Dizi Tutkunu',
            progress: (hours / 10) * 100,
            remaining: 10 - hours
        }
    } else if (hours < 100) {
        return {
            title: 'Dizi Tutkunu',
            color: 'from-blue-400 to-indigo-500',
            icon: '📺',
            nextRank: 'Binge Master',
            progress: ((hours - 10) / 90) * 100,
            remaining: 100 - hours
        }
    } else if (hours < 500) {
        return {
            title: 'Binge Master',
            color: 'from-purple-400 to-pink-500',
            icon: '👑',
            nextRank: 'Time Lord',
            progress: ((hours - 100) / 400) * 100,
            remaining: 500 - hours
        }
    } else {
        return {
            title: 'Time Lord',
            color: 'from-amber-300 to-orange-500',
            icon: '⏳',
            nextRank: 'Max Level',
            progress: 100,
            remaining: 0
        }
    }
}

/**
 * Formats minutes into a readable string (Days + Hours or Hours + Minutes)
 * @param {number} totalMinutes 
 * @returns {string} Formatted string
 */
export const formatDuration = (totalMinutes) => {
    const days = Math.floor(totalMinutes / (24 * 60))
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60)
    const minutes = totalMinutes % 60

    if (days > 0) {
        return `${days} Gün ${hours} Saat`
    } else if (hours > 0) {
        return `${hours} Sa ${minutes} Dk`
    } else {
        return `${minutes} Dk`
    }
}

export const GENRE_COLORS = {
    10759: '#ef4444', // Action & Adventure
    16: '#f59e0b',    // Animation
    35: '#eab308',    // Comedy
    80: '#dc2626',    // Crime
    99: '#64748b',    // Documentary
    18: '#3b82f6',    // Drama
    10751: '#8b5cf6', // Family
    10762: '#06b6d4', // Kids
    9648: '#6366f1',  // Mystery
    10763: '#14b8a6', // News
    10764: '#f43f5e', // Reality
    10765: '#8b5cf6', // Sci-Fi & Fantasy
    10766: '#ec4899', // Soap
    10767: '#84cc16', // Talk
    10768: '#d946ef', // War & Politics
    37: '#78350f',    // Western
}
