import { useState, useMemo } from 'react'
import ShowCard from '../components/common/ShowCard'
import { ShowCardSkeleton } from '../components/common/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { useShowStore } from '../store/showStore'
import {
  useInfinitePopularShows,
  useInfiniteTrendingShows,
  useInfiniteOnTheAir,
  useGenres,
  useInfiniteShowsByGenre
} from '../hooks/useQueries'
import { addUserShow } from '../services/supabase'
import { WATCH_STATUS } from '../utils/constants'
import { useToast } from '../components/common/Toast'

export default function Discover() {
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [activeTab, setActiveTab] = useState('trending')
  const [addingId, setAddingId] = useState(null)

  const { user } = useAuth()
  const { userShows, addShow } = useShowStore()
  const toast = useToast()

  // Infinite Query hooks
  const {
    data: popularData,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasNextPopular,
    isFetchingNextPage: fetchingNextPopular,
    isLoading: popularLoading
  } = useInfinitePopularShows()

  const {
    data: trendingData,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasNextTrending,
    isFetchingNextPage: fetchingNextTrending,
    isLoading: trendingLoading
  } = useInfiniteTrendingShows('week')

  const {
    data: onTheAirData,
    fetchNextPage: fetchNextOnTheAir,
    hasNextPage: hasNextOnTheAir,
    isFetchingNextPage: fetchingNextOnTheAir,
    isLoading: onTheAirLoading
  } = useInfiniteOnTheAir()

  const { data: genresData } = useGenres()

  const {
    data: genreShowsData,
    fetchNextPage: fetchNextGenre,
    hasNextPage: hasNextGenre,
    isFetchingNextPage: fetchingNextGenre,
    isLoading: genreLoading
  } = useInfiniteShowsByGenre(selectedGenre?.id)

  const popular = useMemo(() => popularData?.pages.flatMap(page => page.results) || [], [popularData])
  const trending = useMemo(() => trendingData?.pages.flatMap(page => page.results) || [], [trendingData])
  const onTheAir = useMemo(() => onTheAirData?.pages.flatMap(page => page.results) || [], [onTheAirData])
  const genres = genresData?.genres || []
  const genreShows = useMemo(() => genreShowsData?.pages.flatMap(page => page.results) || [], [genreShowsData])

  const loading = selectedGenre
    ? genreLoading
    : activeTab === 'trending'
      ? trendingLoading
      : activeTab === 'popular'
        ? popularLoading
        : onTheAirLoading

  const handleFetchNextPage = () => {
    if (selectedGenre) fetchNextGenre()
    else if (activeTab === 'trending') fetchNextTrending()
    else if (activeTab === 'popular') fetchNextPopular()
    else if (activeTab === 'onTheAir') fetchNextOnTheAir()
  }

  const hasNextPage = selectedGenre
    ? hasNextGenre
    : activeTab === 'trending'
      ? hasNextTrending
      : activeTab === 'popular'
        ? hasNextPopular
        : hasNextOnTheAir

  const isFetchingNextPage = selectedGenre
    ? fetchingNextGenre
    : activeTab === 'trending'
      ? fetchingNextTrending
      : activeTab === 'popular'
        ? fetchingNextPopular
        : fetchingNextOnTheAir

  const handleAddToList = async (tmdbShowId) => {
    if (!user) {
      toast.warning('Listeye eklemek için giriş yapmalısınız')
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
      toast.success('Dizi listenize eklendi!')
    } catch (error) {
      console.error('Error adding show to list:', error)
      toast.error('Dizi eklenirken hata oluştu')
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
    <div className="space-y-10 animate-fade-in pb-12">
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

      {/* Tabs Menu */}
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
      <div className="space-y-6">
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
                <div key={`${selectedGenre ? 'genre' : activeTab}-${show.id}-${idx}`} className="animate-slide-up" style={{ animationDelay: `${idx % 20 * 30}ms` }}>
                  <ShowCard
                    show={show}
                    userShow={userShows.find(s => s.tmdb_show_id === show.id)}
                    onAdd={handleAddToList}
                    isAdding={addingId === show.id}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleFetchNextPage}
                  disabled={isFetchingNextPage}
                  className="group relative px-12 py-4 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl font-black text-slate-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-xl"
                >
                  {isFetchingNextPage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Daha Fazla Göster</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
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

