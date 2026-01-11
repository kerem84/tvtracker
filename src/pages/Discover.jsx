import { useEffect, useState } from 'react'
import { getPopularShows, getTrendingShows, getOnTheAir, getGenres, getShowsByGenre } from '../services/tmdb'
import ShowCard from '../components/common/ShowCard'
import { ShowCardSkeleton } from '../components/common/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { useShowStore } from '../store/showStore'
import { addUserShow } from '../services/supabase'
import { WATCH_STATUS } from '../utils/constants'

export default function Discover() {
  const [popular, setPopular] = useState([])
  const [trending, setTrending] = useState([])
  const [onTheAir, setOnTheAir] = useState([])
  const [genres, setGenres] = useState([])
  const [genreShows, setGenreShows] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeTab, setActiveTab] = useState('trending')
  const [pages, setPages] = useState({ trending: 1, popular: 1, onTheAir: 1, genre: 1 })
  const { user } = useAuth()
  const { userShows, addShow } = useShowStore()
  const [addingId, setAddingId] = useState(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true)
      try {
        const [popularData, trendingData, onTheAirData, genresData] = await Promise.all([
          getPopularShows(1),
          getTrendingShows('week'),
          getOnTheAir(1),
          getGenres(),
        ])

        setPopular(popularData.results || [])
        setTrending(trendingData.results || [])
        setOnTheAir(onTheAirData.results || [])
        setGenres(genresData.genres || [])
      } catch (error) {
        console.error('Error fetching discover data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchGenreData = async () => {
      if (!selectedGenre) return
      setLoading(true)
      try {
        const data = await getShowsByGenre(selectedGenre.id, 1)
        setGenreShows(data.results || [])
        setPages(prev => ({ ...prev, genre: 1 }))
      } catch (error) {
        console.error('Error fetching genre data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenreData()
  }, [selectedGenre])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      let newData = []
      if (selectedGenre) {
        const nextPage = pages.genre + 1
        const response = await getShowsByGenre(selectedGenre.id, nextPage)
        newData = response.results || []
        setGenreShows(prev => [...prev, ...newData])
        setPages(prev => ({ ...prev, genre: nextPage }))
      } else {
        const nextPage = pages[activeTab] + 1
        if (activeTab === 'trending') {
          const response = await getTrendingShows('week', nextPage)
          newData = response.results || []
          setTrending(prev => [...prev, ...newData])
        } else if (activeTab === 'popular') {
          const response = await getPopularShows(nextPage)
          newData = response.results || []
          setPopular(prev => [...prev, ...newData])
        } else if (activeTab === 'onTheAir') {
          const response = await getOnTheAir(nextPage)
          newData = response.results || []
          setOnTheAir(prev => [...prev, ...newData])
        }
        setPages(prev => ({ ...prev, [activeTab]: nextPage }))
      }
    } catch (error) {
      console.error('Error loading more:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleAddToList = async (tmdbShowId) => {
    if (!user) {
      alert('Listeye eklemek için giriş yapmalısınız')
      return
    }

    setAddingId(tmdbShowId)
    try {
      await addUserShow(user.id, tmdbShowId, WATCH_STATUS.PLAN_TO_WATCH)
      const newShow = {
        user_id: user.id,
        tmdb_show_id: tmdbShowId,
        status: WATCH_STATUS.PLAN_TO_WATCH,
        user_rating: 0,
        is_favorite: false,
        notes: '',
      }
      addShow(newShow)
    } catch (error) {
      console.error('Error adding show to list:', error)
    } finally {
      setAddingId(null)
    }
  }

  const handleGenreClick = (genre) => {
    if (selectedGenre?.id === genre.id) {
      setSelectedGenre(null)
    } else {
      setSelectedGenre(genre)
    }
  }

  const tabs = [
    { id: 'trending', label: 'Trend', icon: '🔥', data: trending },
    { id: 'popular', label: 'Popüler', icon: '🌟', data: popular },
    { id: 'onTheAir', label: 'Yayında', icon: '📡', data: onTheAir },
  ]

  const activeData = selectedGenre ? genreShows : (tabs.find((t) => t.id === activeTab)?.data || [])

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black">
          <span className="gradient-text">Dizi Keşfet</span>
        </h1>
        <p className="text-slate-400 font-medium tracking-wide">Dünya çapında en çok ilgi gören dizileri keşfedin</p>
      </div>

      {/* Genres - Moved to Top */}
      {genres.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-wrap justify-center gap-3 card-glass p-5">
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 active:scale-95 ${selectedGenre?.id === genre.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 glow-indigo border-indigo-400'
                  : 'bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 border border-slate-700/50'
                  }`}
              >
                {genre.name}
              </button>
            ))}
            {selectedGenre && (
              <button
                onClick={() => setSelectedGenre(null)}
                className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-sm font-black transition-all"
              >
                Temizle ×
              </button>
            )}
          </div>
        </section>
      )}

      {/* Tabs Menu - Only show if no genre is selected or as secondary filter */}
      <div className="card-glass p-2 max-w-2xl mx-auto flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSelectedGenre(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${!selectedGenre && activeTab === tab.id
              ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 active:scale-95 glow-indigo'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
        {selectedGenre && (
          <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span className="text-sm">Tür: {selectedGenre.name}</span>
          </div>
        )}
      </div>

      {/* Show grid */}
      <div className="space-y-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <ShowCardSkeleton key={i} />
            ))}
          </div>
        ) : activeData.length > 0 ? (
          <div className="space-y-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-slide-up">
              {activeData.map((show, idx) => (
                <div key={`${selectedGenre ? 'genre' : activeTab}-${show.id}`} className="animate-slide-up" style={{ animationDelay: `${idx % 12 * 50}ms` }}>
                  <ShowCard
                    show={show}
                    userShow={userShows.find(s => s.tmdb_show_id === show.id)}
                    onAdd={handleAddToList}
                    isAdding={addingId === show.id}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center pb-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-glow btn-primary min-w-[240px] h-14 rounded-2xl font-black text-lg shadow-indigo-500/20"
              >
                {loadingMore ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Yükleniyor...</span>
                  </div>
                ) : (
                  'Daha Fazla Göster'
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="card-glass text-center py-20 border-dashed animate-slide-up">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400 text-lg font-medium">Bu kategoride henüz dizi bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  )
}
