import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ShowCard from '../components/common/ShowCard'
import { ShowCardSkeleton } from '../components/common/Skeleton'
import { useAuth } from '../hooks/useAuth'
import { useShowStore } from '../store/showStore'
import { useInfiniteSearchShows } from '../hooks/useQueries'
import { addUserShow } from '../services/supabase'
import { WATCH_STATUS } from '../utils/constants'
import { useToast } from '../components/common/Toast'

export default function Search() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [addingId, setAddingId] = useState(null)

  const { user } = useAuth()
  const { userShows, addShow } = useShowStore()
  const toast = useToast()

  // React Query hook for infinite search results
  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
    isFetched: searched
  } = useInfiniteSearchShows(searchTerm)

  const results = useMemo(() => searchData?.pages.flatMap(page => page.results) || [], [searchData])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchTerm(query.trim())
  }

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

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
      <div className="text-center space-y-6 pt-8">
        <h1 className="text-5xl font-black">
          <span className="gradient-text">Dizi Ara</span>
        </h1>
        <p className="text-slate-400 font-medium text-lg max-w-lg mx-auto">Milyonlarca dizi arasından favorilerini bul ve listene ekle.</p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
          <div className="relative group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Dizi adı girin (ör: Breaking Bad)..."
              className="w-full bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl pl-6 pr-32 py-5 text-lg text-slate-100 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-2xl group-hover:border-slate-600/50"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-8 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95 disabled:opacity-50 flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Ara</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {!loading && searched && results.length === 0 && searchTerm && (
        <div className="card-glass text-center py-20 animate-slide-up">
          <div className="text-6xl mb-6">🏜️</div>
          <h3 className="text-2xl font-bold text-slate-200 mb-2">Sonuç Bulunamadı</h3>
          <p className="text-slate-400">
            "{searchTerm}" aramasına uygun hiçbir dizi bulamadık. Lütfen farklı anahtar kelimeler deneyin.
          </p>
        </div>
      )}

      {(loading || (searched && results.length > 0)) && (
        <div className="space-y-8 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs px-4">
              {loading ? 'Aranıyor...' : `${results.length} Sonuç Bulundu`}
            </p>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {loading ? (
              [...Array(10)].map((_, i) => <ShowCardSkeleton key={i} />)
            ) : (
              results.map((show, idx) => (
                <div key={`${show.id}-${idx}`} className="animate-slide-up" style={{ animationDelay: `${idx % 20 * 30}ms` }}>
                  <ShowCard
                    show={show}
                    userShow={userShows.find(s => s.tmdb_show_id === show.id)}
                    onAdd={handleAddToList}
                    isAdding={addingId === show.id}
                  />
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {hasNextPage && !loading && (
            <div className="flex justify-center pt-12">
              <button
                onClick={() => fetchNextPage()}
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
      )}

      {!searchTerm && (
        <div className="grid md:grid-cols-3 gap-6 pt-12 animate-slide-up">
          {[
            { icon: '🎬', title: 'Geniş Arşiv', desc: 'Binlerce popüler ve güncel dizi verisi.' },
            { icon: '📊', title: 'Puanlar', desc: 'Dünya çapındaki eleştirmen ve izleyici puanları.' },
            { icon: '📅', title: 'Güncel Takvim', desc: 'Yeni bölümleri asla kaçırmayın.' }
          ].map((feature, i) => (
            <div key={i} className="card-glass p-8 text-center space-y-4 hover:border-indigo-500/30 transition-colors group">
              <div className="text-4xl group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h4 className="font-bold text-slate-100">{feature.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

