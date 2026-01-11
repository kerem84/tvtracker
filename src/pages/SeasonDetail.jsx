import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getShowDetails, getSeasonDetails } from '../services/tmdb'
import { useAuth } from '../hooks/useAuth'
import { useShowStore } from '../store/showStore'
import { addWatchedEpisode, getWatchedEpisodes, removeWatchedEpisode, updateUserShow } from '../services/supabase'
import { getImageUrl, WATCH_STATUS, STATUS_LABELS } from '../utils/constants'

export default function SeasonDetail() {
  const { id, num } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { userShows, updateShow, isEpisodeWatched, addWatchedEpisode: storeAddWatched, removeWatchedEpisode: storeRemoveWatched } = useShowStore()
  const [show, setShow] = useState(null)
  const [season, setSeason] = useState(null)
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [showData, seasonData] = await Promise.all([
          getShowDetails(id),
          getSeasonDetails(id, num),
        ])

        setShow(showData)
        setSeason(seasonData)

        // Load watched episodes for this user
        if (user) {
          const watched = await getWatchedEpisodes(user.id, parseInt(id))
          useShowStore.getState().setWatchedEpisodes(parseInt(id), watched)
        }
      } catch (error) {
        console.error('Error fetching season details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, num, user])

  const handleToggleEpisode = async (episodeNumber) => {
    if (!user) {
      alert('Bölüm işaretlemek için giriş yapmalısınız')
      return
    }

    try {
      const isWatched = isEpisodeWatched(parseInt(id), parseInt(num), episodeNumber)

      if (isWatched) {
        await removeWatchedEpisode(user.id, parseInt(id), parseInt(num), episodeNumber)
        storeRemoveWatched(parseInt(id), parseInt(num), episodeNumber)
      } else {
        await addWatchedEpisode(user.id, parseInt(id), parseInt(num), episodeNumber)
        storeAddWatched(parseInt(id), parseInt(num), episodeNumber)

        // Auto-update status to "watching" if it's currently "plan_to_watch"
        const currentShow = userShows.find(s => s.tmdb_show_id === parseInt(id))
        if (currentShow && currentShow.status === WATCH_STATUS.PLAN_TO_WATCH) {
          try {
            await updateUserShow(user.id, parseInt(id), { status: WATCH_STATUS.WATCHING })
            updateShow(parseInt(id), { status: WATCH_STATUS.WATCHING })
          } catch (err) {
            console.error('Error auto-updating status:', err)
          }
        }
      }
    } catch (error) {
      console.error('Error toggling episode:', error)
    }
  }

  const handleMarkAll = async () => {
    if (!user || !season) return

    setMarkingAll(true)
    try {
      for (const episode of season.episodes || []) {
        if (!isEpisodeWatched(parseInt(id), parseInt(num), episode.episode_number)) {
          await addWatchedEpisode(user.id, parseInt(id), parseInt(num), episode.episode_number)
          storeAddWatched(parseInt(id), parseInt(num), episode.episode_number)
        }
      }

      // After marking all, check status for the whole show
      const currentShow = userShows.find(s => s.tmdb_show_id === parseInt(id))
      if (currentShow && currentShow.status === WATCH_STATUS.PLAN_TO_WATCH) {
        await updateUserShow(user.id, parseInt(id), { status: WATCH_STATUS.WATCHING })
        updateShow(parseInt(id), { status: WATCH_STATUS.WATCHING })
      }
    } catch (error) {
      console.error('Error marking all episodes:', error)
    } finally {
      setMarkingAll(false)
    }
  }

  const watchedCount = season?.episodes?.filter((ep) =>
    isEpisodeWatched(parseInt(id), parseInt(num), ep.episode_number)
  ).length || 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!season) {
    return (
      <div className="card-glass text-center py-12 animate-fade-in">
        <p className="text-slate-400">Sezon bulunamadı</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <Link
            to={`/show/${id}`}
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> {show?.name || 'Dizi'}'ye Dön
          </Link>
          <div className="relative group/dropdown">
            <select
              value={num}
              onChange={(e) => navigate(`/show/${id}/season/${e.target.value}`)}
              className="appearance-none bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl pl-6 pr-12 py-3 text-4xl font-black gradient-text cursor-pointer hover:border-indigo-500/50 transition-all outline-none"
            >
              {show?.seasons?.filter(s => s.season_number > 0).map((s) => (
                <option key={s.id} value={s.season_number} className="bg-slate-900 text-slate-100 text-lg">
                  {s.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-bold text-sm">
            <span className="flex items-center gap-1.5"><span className="text-indigo-500">📺</span> {season.episodes?.length || 0} Bölüm</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1.5"><span className="text-green-500">✅</span> {watchedCount} İzlendi</span>
          </div>
        </div>

        {user && season.episodes && watchedCount < season.episodes.length && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="btn-glow btn-primary px-8 py-3.5 rounded-2xl font-black text-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            {markingAll ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>İşaretleniyor...</span>
              </div>
            ) : (
              'Hepsini İzledim'
            )}
          </button>
        )}
      </div>

      {/* Episodes List */}
      <div className="grid gap-4 animate-slide-up">
        {season.episodes?.map((episode, idx) => {
          const isWatched = isEpisodeWatched(parseInt(id), parseInt(num), episode.episode_number)
          const stillUrl = episode.still_path
            ? getImageUrl(episode.still_path, 'w300')
            : null

          return (
            <div
              key={episode.id}
              style={{ animationDelay: `${idx * 50}ms` }}
              className={`group card-glass flex flex-col sm:flex-row gap-6 p-4 transition-all duration-300 ${isWatched ? 'border-green-500/20 bg-green-500/5' : 'hover:border-indigo-500/30'
                }`}
            >
              {stillUrl && (
                <div className="flex-shrink-0 relative overflow-hidden rounded-xl aspect-video sm:w-56">
                  <img
                    src={stillUrl}
                    alt={episode.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-widest">
                    {episode.runtime || '?'} dk
                  </span>
                  {isWatched && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-xl animate-bounce-small">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-indigo-400 font-black text-lg">E{episode.episode_number.toString().padStart(2, '0')}</span>
                      <h3 className={`font-black text-xl transition-colors ${isWatched ? 'text-slate-400' : 'text-slate-100 group-hover:text-indigo-400'}`}>
                        {episode.name}
                      </h3>
                    </div>

                    {episode.air_date && (
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(episode.air_date).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    )}

                    {episode.overview && (
                      <p className={`text-sm leading-relaxed max-w-2xl transition-colors ${isWatched ? 'text-slate-500' : 'text-slate-400'}`}>
                        {episode.overview}
                      </p>
                    )}
                  </div>

                  {user && (
                    <button
                      onClick={() => handleToggleEpisode(episode.episode_number)}
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 ${isWatched
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                        : 'bg-slate-800/50 border border-slate-700 text-slate-500 hover:border-indigo-500/50 hover:text-indigo-400 hover:bg-slate-800'
                        }`}
                      title={isWatched ? 'İzlenmedi olarak işaretle' : 'İzledi olarak işaretle'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition-transform ${isWatched ? 'scale-110' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

