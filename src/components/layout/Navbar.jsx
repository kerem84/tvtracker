import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { path: '/', label: 'Dashboard', icon: '🏠' },
  { path: '/search', label: 'Ara', icon: '🔍' },
  { path: '/discover', label: 'Keşfet', icon: '🎬' },
  { path: '/my-shows', label: 'Kütüphanem', icon: '📚' },
  { path: '/calendar', label: 'Takvim', icon: '📅' },
  { path: '/stats', label: 'İstatistik', icon: '📊' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Çıkış hatası:', error)
    }
  }

  return (
    <nav className="bg-[#0A0D20] backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/logo.png"
              alt="TV Tracker Logo"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${isActive
                    ? 'bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800/70'
                    }`}
                >
                  <span className={isActive ? 'scale-110' : ''}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* User menu */}
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                <Link
                  to="/settings"
                  className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-white/5 transition-colors group border border-transparent hover:border-white/10"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden ring-2 ring-indigo-500/50 group-hover:ring-indigo-500 shadow-lg shadow-indigo-500/20 transition-all">
                    <img
                      src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.email}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors hidden sm:block">
                    {user.user_metadata?.username || user.email}
                  </span>
                </Link>

                <div className="w-px h-6 bg-slate-700/50"></div>

                <button
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-red-400 transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  Çıkış
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden flex justify-around py-2 border-t border-slate-700/50">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-300 ${isActive
                  ? 'text-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

