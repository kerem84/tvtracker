import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/layout/Navbar'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import Discover from './pages/Discover'
import MyShows from './pages/MyShows'
import ShowDetail from './pages/ShowDetail'
import SeasonDetail from './pages/SeasonDetail'
import Calendar from './pages/Calendar'
import Stats from './pages/Stats'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-shows"
            element={
              <ProtectedRoute>
                <MyShows />
              </ProtectedRoute>
            }
          />
          <Route
            path="/show/:id"
            element={
              <ProtectedRoute>
                <ShowDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/show/:id/season/:num"
            element={
              <ProtectedRoute>
                <SeasonDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
