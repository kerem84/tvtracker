import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import {
    searchShows,
    getShowDetails,
    getSeasonDetails,
    getPopularShows,
    getAiringToday,
    getOnTheAir,
    getTrendingShows,
    getShowsByGenre,
    getGenres,
    getSimilarShows,
    getRecommendedShows,
    getShowImages,
} from '../services/tmdb'

// Query keys factory
export const queryKeys = {
    shows: {
        all: ['shows'],
        details: (id) => ['shows', 'details', id],
        season: (showId, seasonNumber) => ['shows', 'season', showId, seasonNumber],
        similar: (id) => ['shows', 'similar', id],
        recommended: (id) => ['shows', 'recommended', id],
        images: (id) => ['shows', 'images', id],
    },
    discover: {
        popular: (page) => ['discover', 'popular', page],
        trending: (timeWindow, page) => ['discover', 'trending', timeWindow, page],
        airingToday: (page) => ['discover', 'airingToday', page],
        onTheAir: (page) => ['discover', 'onTheAir', page],
        byGenre: (genreId, page) => ['discover', 'genre', genreId, page],
    },
    genres: ['genres'],
    search: (query, page) => ['search', query, page],
}

// Show hooks
export const useShowDetails = (showId, options = {}) => {
    return useQuery({
        queryKey: queryKeys.shows.details(showId),
        queryFn: () => getShowDetails(showId),
        enabled: !!showId,
        ...options,
    })
}

export const useSeasonDetails = (showId, seasonNumber, options = {}) => {
    return useQuery({
        queryKey: queryKeys.shows.season(showId, seasonNumber),
        queryFn: () => getSeasonDetails(showId, seasonNumber),
        enabled: !!showId && !!seasonNumber,
        ...options,
    })
}

export const useSimilarShows = (showId, options = {}) => {
    return useQuery({
        queryKey: queryKeys.shows.similar(showId),
        queryFn: () => getSimilarShows(showId),
        enabled: !!showId,
        ...options,
    })
}

export const useRecommendedShows = (showId, options = {}) => {
    return useQuery({
        queryKey: queryKeys.shows.recommended(showId),
        queryFn: () => getRecommendedShows(showId),
        enabled: !!showId,
        ...options,
    })
}

export const useShowImages = (showId, options = {}) => {
    return useQuery({
        queryKey: queryKeys.shows.images(showId),
        queryFn: () => getShowImages(showId),
        enabled: !!showId,
        ...options,
    })
}

// Discover hooks
export const usePopularShows = (page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.discover.popular(page),
        queryFn: () => getPopularShows(page),
        ...options,
    })
}

export const useInfinitePopularShows = (options = {}) => {
    return useInfiniteQuery({
        queryKey: ['discover', 'popular', 'infinite'],
        queryFn: ({ pageParam = 1 }) => getPopularShows(pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
            return undefined
        },
        initialPageParam: 1,
        ...options,
    })
}

export const useTrendingShows = (timeWindow = 'week', page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.discover.trending(timeWindow, page),
        queryFn: () => getTrendingShows(timeWindow, page),
        ...options,
    })
}

export const useInfiniteTrendingShows = (timeWindow = 'week', options = {}) => {
    return useInfiniteQuery({
        queryKey: ['discover', 'trending', timeWindow, 'infinite'],
        queryFn: ({ pageParam = 1 }) => getTrendingShows(timeWindow, pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
            return undefined
        },
        initialPageParam: 1,
        ...options,
    })
}

export const useAiringToday = (page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.discover.airingToday(page),
        queryFn: () => getAiringToday(page),
        ...options,
    })
}

export const useOnTheAir = (page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.discover.onTheAir(page),
        queryFn: () => getOnTheAir(page),
        ...options,
    })
}

export const useInfiniteOnTheAir = (options = {}) => {
    return useInfiniteQuery({
        queryKey: ['discover', 'onTheAir', 'infinite'],
        queryFn: ({ pageParam = 1 }) => getOnTheAir(pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
            return undefined
        },
        initialPageParam: 1,
        ...options,
    })
}

export const useShowsByGenre = (genreId, page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.discover.byGenre(genreId, page),
        queryFn: () => getShowsByGenre(genreId, page),
        enabled: !!genreId,
        ...options,
    })
}

export const useInfiniteShowsByGenre = (genreId, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['discover', 'genre', genreId, 'infinite'],
        queryFn: ({ pageParam = 1 }) => getShowsByGenre(genreId, pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
            return undefined
        },
        initialPageParam: 1,
        enabled: !!genreId,
        ...options,
    })
}

// Genre hook
export const useGenres = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.genres,
        queryFn: getGenres,
        staleTime: 24 * 60 * 60 * 1000, // Genres rarely change, cache for 24 hours
        ...options,
    })
}

// Search hook
export const useSearchShows = (query, page = 1, options = {}) => {
    return useQuery({
        queryKey: queryKeys.search(query, page),
        queryFn: () => searchShows(query, page),
        enabled: !!query && query.trim().length > 0,
        ...options,
    })
}

export const useInfiniteSearchShows = (query, options = {}) => {
    return useInfiniteQuery({
        queryKey: ['search', query, 'infinite'],
        queryFn: ({ pageParam = 1 }) => searchShows(query, pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.total_pages) return lastPage.page + 1
            return undefined
        },
        initialPageParam: 1,
        enabled: !!query && query.trim().length > 0,
        ...options,
    })
}
