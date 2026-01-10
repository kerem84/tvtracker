import { Link } from 'react-router-dom'
import { getImageUrl, WATCH_STATUS, STATUS_LABELS } from '../../utils/constants'

const STATUS_COLORS = {
  [WATCH_STATUS.WATCHING]: 'bg-green-500 shadow-green-500/30',
  [WATCH_STATUS.COMPLETED]: 'bg-blue-500 shadow-blue-500/30',
  [WATCH_STATUS.DROPPED]: 'bg-red-500 shadow-red-500/30',
  [WATCH_STATUS.PLAN_TO_WATCH]: 'bg-amber-500 shadow-amber-500/30',
}

export default function ShowCard({ show, userShow = null, onAdd = null }) {
  const posterUrl = getImageUrl(show.poster_path)
  const firstAirDate = show.first_air_date
    ? new Date(show.first_air_date).getFullYear()
    : 'N/A'

  return (
    <div className="group relative">
      {/* Card Container */}
      <div className="card card-hover p-0 overflow-hidden">
        <Link to={`/show/${show.id}`} className="block">
          {/* Poster */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={posterUrl}
              alt={show.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

            {/* Bottom info overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="text-white font-medium px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm border border-white/20">
                Detaylar →
              </span>
            </div>

            {/* Status & Favorite badges */}
            {userShow && (
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
                <span className={`${STATUS_COLORS[userShow.status]} text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg backdrop-blur-sm`}>
                  {STATUS_LABELS[userShow.status]}
                </span>
                {userShow.is_favorite && (
                  <span className="bg-red-500 text-white p-1.5 rounded-full shadow-lg glow-red animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </span>
                )}
              </div>
            )}

            {/* User rating badge */}
            {userShow?.user_rating && (
              <div className="absolute bottom-3 left-3 z-10">
                <span className="bg-indigo-500/90 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
                  <span className="text-yellow-300">★</span>
                  {userShow.user_rating}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3 space-y-1">
            <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
              {show.name}
            </h3>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{firstAirDate}</span>
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="text-yellow-500">⭐</span>
                  <span>{show.vote_average.toFixed(1)}</span>
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

