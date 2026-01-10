import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Auth functions
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  })

  if (error) throw error

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        username: username,
      })

    if (profileError) throw profileError
  }

  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Database functions
export const addUserShow = async (userId, tmdbShowId, status = 'plan_to_watch') => {
  const { data, error } = await supabase
    .from('user_shows')
    .upsert({
      user_id: userId,
      tmdb_show_id: tmdbShowId,
      status,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,tmdb_show_id'
    })

  if (error) throw error
  return data
}

export const updateUserShow = async (userId, tmdbShowId, updates) => {
  const { data, error } = await supabase
    .from('user_shows')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('tmdb_show_id', tmdbShowId)

  if (error) throw error
  return data
}

export const getUserShows = async (userId) => {
  const { data, error } = await supabase
    .from('user_shows')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export const deleteUserShow = async (userId, tmdbShowId) => {
  const { error } = await supabase
    .from('user_shows')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_show_id', tmdbShowId)

  if (error) throw error
}

export const addWatchedEpisode = async (userId, tmdbShowId, seasonNumber, episodeNumber) => {
  // Ensure session is active before operation
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('No active session. Please log in again.')
  }

  const { data, error } = await supabase
    .from('watched_episodes')
    .upsert({
      user_id: userId,
      tmdb_show_id: tmdbShowId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      watched_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,tmdb_show_id,season_number,episode_number'
    })

  if (error) throw error
  return data
}

export const removeWatchedEpisode = async (userId, tmdbShowId, seasonNumber, episodeNumber) => {
  const { error } = await supabase
    .from('watched_episodes')
    .delete()
    .eq('user_id', userId)
    .eq('tmdb_show_id', tmdbShowId)
    .eq('season_number', seasonNumber)
    .eq('episode_number', episodeNumber)

  if (error) throw error
}

export const getWatchedEpisodes = async (userId, tmdbShowId = null) => {
  const query = supabase
    .from('watched_episodes')
    .select('*')
    .eq('user_id', userId)

  if (tmdbShowId) {
    query.eq('tmdb_show_id', tmdbShowId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export const getUserStats = async (userId) => {
  const { data, error } = await supabase
    .from('user_shows')
    .select('status')

  if (error) throw error

  const stats = {
    total: data.length,
    watching: data.filter(s => s.status === 'watching').length,
    completed: data.filter(s => s.status === 'completed').length,
    dropped: data.filter(s => s.status === 'dropped').length,
    planToWatch: data.filter(s => s.status === 'plan_to_watch').length,
  }

  return stats
}

export const updateProfile = async (userId, updates) => {
  // 1. Update auth metadata (if username changed)
  if (updates.username) {
    const { error: authError } = await supabase.auth.updateUser({
      data: { username: updates.username }
    })
    if (authError) throw authError
  }

  // 2. Update users table
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()

  if (error) throw error
  return data
}
