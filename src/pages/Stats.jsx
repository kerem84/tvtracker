import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getUserShows, getWatchedEpisodes } from '../services/supabase'
import { getShowDetails } from '../services/tmdb'
import { WATCH_STATUS, STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import { getUserRank, formatDuration, GENRE_COLORS } from '../utils/userUtils'

export default function Stats() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalShows: 0,
    totalEpisodes: 0,
    totalMinutes: 0,
    completionRate: 0,
    topGenre: 'N/A',
    statusCounts: {},
    genreCounts: {},
    genreNames: {},
    rank: null
  })

  useEffect(() => {
    const fetchDetailedStats = async () => {
      if (!user) return

      try {
        // 1. Fetch basic user data
        const [userShows, watchedEpisodes] = await Promise.all([
          getUserShows(user.id),
          getWatchedEpisodes(user.id)
        ])

        // 2. Initialize counters
        let totalMinutes = 0
        const genreCounts = {}
        const statusCounts = {
          [WATCH_STATUS.WATCHING]: 0,
          [WATCH_STATUS.COMPLETED]: 0,
          [WATCH_STATUS.DROPPED]: 0,
          [WATCH_STATUS.PLAN_TO_WATCH]: 0,
        }

        // 3. Fetch details for each show (Parallel)
        const showDetailsPromises = userShows.map(show => getShowDetails(show.tmdb_show_id))
        const showsDetails = await Promise.all(showDetailsPromises)

        // 4. Process data
        const newGenreNames = {}
        userShows.forEach((userShow, index) => {
          const details = showsDetails[index]

          // Status counts
          if (statusCounts[userShow.status] !== undefined) {
            statusCounts[userShow.status]++
          }

          // Genre counts
          details.genres?.forEach(genre => {
            genreCounts[genre.id] = (genreCounts[genre.id] || 0) + 1
            if (!newGenreNames[genre.id]) {
              newGenreNames[genre.id] = genre.name
            }
          })

          // Calculate watch time for this show
          // Find how many episodes of THIS show are watched
          const showWatchedCount = watchedEpisodes.filter(
            we => we.tmdb_show_id === userShow.tmdb_show_id
          ).length

          // Average runtime
          const avgRuntime = details.episode_run_time?.length > 0
            ? details.episode_run_time.reduce((a, b) => a + b, 0) / details.episode_run_time.length
            : (details.last_episode_to_air?.runtime || 45) // Fallback

          totalMinutes += showWatchedCount * avgRuntime
        })

        // 5. Calculate derivatives
        const totalShows = userShows.length
        const totalEpisodes = watchedEpisodes.length

        // Top Genre
        let topGenreId = null
        let maxGenreCount = 0
        Object.entries(genreCounts).forEach(([id, count]) => {
          if (count > maxGenreCount) {
            maxGenreCount = count
            topGenreId = id
          }
        })
        const topGenreName = topGenreId
          ? showsDetails.find(s => s.genres.some(g => g.id.toString() === topGenreId))
            ?.genres.find(g => g.id.toString() === topGenreId)?.name
          : 'Belirsiz'

        // Completion Rate (Completed / (Watching + Completed + Dropped)) * 100
        const activeShows = statusCounts[WATCH_STATUS.WATCHING] + statusCounts[WATCH_STATUS.COMPLETED] + statusCounts[WATCH_STATUS.DROPPED]
        const completionRate = activeShows > 0
          ? (statusCounts[WATCH_STATUS.COMPLETED] / activeShows) * 100
          : 0

        setStats({
          totalShows,
          totalEpisodes,
          totalMinutes: Math.round(totalMinutes),
          completionRate,
          topGenre: topGenreName,
          statusCounts,
          genreCounts,
          genreNames: { ...stats.genreNames, ...newGenreNames },
          rank: getUserRank(totalMinutes)
        })

      } catch (error) {
        console.error('Stats calculation error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDetailedStats()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-2 border-b-2 border-purple-500 animate-ping opacity-30"></div>
        </div>
      </div>
    )
  }

  // Helper for SVG Donut Chart
  const renderGenreChart = () => {
    const total = Object.values(stats.genreCounts).reduce((a, b) => a + b, 0)
    let cumulativePercent = 0
    const genres = Object.entries(stats.genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5 only

    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
          {genres.map(([id, count], i) => {
            const percent = count / total
            const dashArray = percent * 314 // 2 * PI * R (R=50) -> but mostly ~314 for full circle
            const offset = cumulativePercent * 314
            cumulativePercent += percent

            return (
              <circle
                key={id}
                r="40"
                cx="50"
                cy="50"
                fill="transparent"
                stroke={GENRE_COLORS[id] || '#cbd5e1'}
                strokeWidth="12"
                strokeDasharray={`${dashArray * 0.8} 314`} // 0.8 to create gaps
                strokeDashoffset={-offset * 0.8}
                className="transition-all duration-1000 ease-out hover:opacity-80"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-white">{Object.keys(stats.genreCounts).length}</span>
          <span className="text-xs text-slate-400">Tür</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400">
          Medya Analizi
        </h1>
        <p className="text-slate-400">İzleme alışkanlıklarınızın detaylı dökümü</p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'İzleme Süresi', value: formatDuration(stats.totalMinutes), icon: '⏱️', color: 'text-blue-400' },
          { label: 'İzlenen Bölüm', value: stats.totalEpisodes, icon: '🎬', color: 'text-purple-400' },
          { label: 'Tamamlama', value: `%${Math.round(stats.completionRate)}`, icon: '✅', color: 'text-green-400' },
          { label: 'Favori Tür', value: stats.topGenre, icon: '❤️', color: 'text-pink-400' },
        ].map((stat, idx) => (
          <div key={idx} className="card-glass p-6 flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
            <span className="text-3xl mb-2 filter drop-shadow-lg group-hover:scale-110 transition-transform">{stat.icon}</span>
            <span className={`text-2xl font-bold ${stat.color} filter drop-shadow-glow`}>{stat.value}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Rank Card */}
        <div className="lg:col-span-2 card-glass p-8 relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stats.rank.color}`}></div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${stats.rank.color} flex items-center justify-center text-6xl shadow-2xl shadow-indigo-500/20 animate-float`}>
              {stats.rank.icon}
            </div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="text-slate-400 font-medium text-sm uppercase tracking-widest">Mevcut Rütbe</h3>
                <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stats.rank.color}`}>
                  {stats.rank.title}
                </h2>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>İlerleme</span>
                  <span>{stats.rank.nextRank} seviyesine kalan: {formatDuration(stats.rank.remaining * 60)}</span>
                </div>
                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full bg-gradient-to-r ${stats.rank.color} transition-all duration-1000 ease-out relative`}
                    style={{ width: `${stats.rank.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="card-glass p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold mb-6 text-slate-300">Tür Dağılımı</h3>
          {renderGenreChart()}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {Object.entries(stats.genreCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([id]) => (
                <span key={id} className="text-xs px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 text-slate-400" style={{ borderLeftColor: GENRE_COLORS[id], borderLeftWidth: '2px' }}>
                  {GENRE_COLORS[id] ? '●' : ''} {stats.genreNames[id] || 'Diğer'}
                </span>
              ))}
          </div>
        </div>

      </div>

      {/* Status Breakdown */}
      <div className="card-glass p-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
          Kütüphane Durumu
        </h3>
        <div className="space-y-6">
          {Object.entries(WATCH_STATUS).map(([key, value]) => {
            const count = stats.statusCounts[value] || 0
            const percentage = stats.totalShows > 0 ? (count / stats.totalShows) * 100 : 0
            const colorClass = STATUS_COLORS[value].replace('bg-', '') // Extract color name

            return (
              <div key={key} className="group">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{STATUS_LABELS[value]}</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white mr-1">{count}</span>
                    <span className="text-xs text-slate-500">Dizi</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${STATUS_COLORS[value]} rounded-full relative transition-all duration-1000`}
                    style={{ width: `${percentage}%` }}
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
