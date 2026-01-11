export const TMDB_CONFIG = {
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  POSTER_SIZES: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
  BACKDROP_SIZES: ['w300', 'w780', 'w1280', 'original'],
}

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return 'https://placehold.co/500x750?text=Resim+Yok'
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return null
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

export const WATCH_STATUS = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  PLAN_TO_WATCH: 'plan_to_watch',
}

export const STATUS_LABELS = {
  [WATCH_STATUS.WATCHING]: 'İzleniyor',
  [WATCH_STATUS.COMPLETED]: 'Tamamlandı',
  [WATCH_STATUS.DROPPED]: 'Bırakıldı',
  [WATCH_STATUS.PLAN_TO_WATCH]: 'İzlenecek',
}

export const STATUS_COLORS = {
  [WATCH_STATUS.WATCHING]: 'bg-success',
  [WATCH_STATUS.COMPLETED]: 'bg-blue-500',
  [WATCH_STATUS.DROPPED]: 'bg-error',
  [WATCH_STATUS.PLAN_TO_WATCH]: 'bg-accent',
}
