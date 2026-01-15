# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TV Tracker is a modern TV show tracking application built with React + Vite, using Supabase for backend services and TMDB API for show data. The app allows users to track TV shows, mark episodes as watched, view statistics, and discover new content. The UI is in Turkish.

## Development Commands

### Local Development

**Important:** For TMDB API proxy to work locally, you must use Vercel CLI:

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Link project to Vercel (first time only)
vercel link

# Pull environment variables from Vercel (includes TMDB_API_KEY)
vercel env pull

# Start development server with serverless functions
vercel dev
```

The app runs at `http://localhost:3000` when using Vercel CLI.

**Alternative (UI-only development):**
```bash
npm run dev
```
Note: TMDB API proxy won't work with this method. Use only for UI development that doesn't require API calls.

### Build & Preview

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### State Management Architecture

The app uses **Zustand** for state management with two main stores:

1. **authStore** (`src/store/authStore.js`):
   - Manages user authentication state and session
   - Handles sign in/out operations
   - Subscribes to Supabase auth state changes
   - Must call `initialize()` on app startup

2. **showStore** (`src/store/showStore.js`):
   - Manages user's show library (`userShows` array)
   - Tracks watched episodes using a `Map` structure keyed by showId
   - Provides helpers like `isEpisodeWatched(showId, seasonNumber, episodeNumber)`
   - State must be synced with Supabase manually (store is client-side only)

**Key Pattern:** Stores are UI state caches. Data persistence happens through `src/services/supabase.js` functions, then stores are updated to reflect the changes.

### Data Flow Pattern

1. **Reading Data:**
   - User action triggers query → Supabase service function fetches data → Update Zustand store → UI re-renders

2. **Writing Data:**
   - User action → Call Supabase service function (creates/updates/deletes) → If successful, update Zustand store → UI re-renders

3. **React Query Integration:**
   - TMDB API calls use React Query for caching and state management
   - Custom hooks in `src/hooks/useQueries.js` wrap TMDB service calls
   - Query keys are centralized in `queryKeys` object for consistency

### API Architecture

**TMDB API Security Model:**
- TMDB API key is stored server-side only (Vercel environment variable: `TMDB_API_KEY`)
- Client never sees the API key
- All TMDB requests route through `/api/tmdb` serverless function (`api/tmdb.js`)
- The proxy adds the API key and forwards requests to TMDB API
- In development, if `VITE_TMDB_API_KEY` exists, direct API calls are made for convenience (see `src/services/tmdb.js`)

**Supabase Architecture:**
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are client-side env vars (safe to expose)
- Security enforced by Row Level Security (RLS) policies in Postgres
- Users can only access their own data via RLS policies
- Auth state persists via Supabase session management

### Database Schema

Tables in Supabase (see `supabase-schema.sql`):

1. **users**: User profiles (id matches auth.users.id)
   - Fields: id, email, username, avatar_url, created_at, updated_at

2. **user_shows**: Shows in user's library
   - Fields: user_id, tmdb_show_id, status, user_rating, notes, is_favorite
   - Status values: 'watching', 'completed', 'dropped', 'plan_to_watch'
   - Unique constraint: (user_id, tmdb_show_id)

3. **watched_episodes**: Episode watch history
   - Fields: user_id, tmdb_show_id, season_number, episode_number, watched_at
   - Unique constraint: (user_id, tmdb_show_id, season_number, episode_number)

4. **show_cache**: Optional TMDB data cache (not currently used in app)

**Important RLS Policies:**
- All tables have RLS enabled
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- Queries automatically filtered by `auth.uid() = user_id`

### Routing & Protected Routes

- React Router v6 with `<ProtectedRoute>` wrapper component in `App.jsx`
- All routes except `/login` and `/register` require authentication
- Protected routes check `useAuth()` hook, redirect to `/login` if not authenticated
- Vercel handles SPA routing via `vercel.json` rewrites (all non-API routes → `/index.html`)

### Component Organization

- **pages/**: Route-level components (Dashboard, MyShows, ShowDetail, etc.)
- **components/common/**: Reusable UI components (ShowCard, Skeleton, Loader, Toast)
- **components/layout/**: Layout components (Navbar)
- **hooks/**: Custom React hooks (useAuth, useQueries)
- **services/**: API clients (supabase, tmdb)
- **store/**: Zustand stores (authStore, showStore)
- **utils/**: Helper functions (constants, userUtils, sanitize, watchUrl)

## Key Features & Implementation Notes

### Watch URL Generation System

The app supports configurable "watch URLs" that generate links to streaming sites for episodes. Implementation in `src/utils/watchUrl.js`:

- **Base URL + Pattern:** Users can configure a base URL and pattern in Settings
- **Pattern Placeholders:** `%dizi_adi%`, `%sezon%`, `%bolum%` are replaced with show slug, season, episode
- **Custom Slugs:** Per-show custom slugs override auto-generated slugs (from show name)
- **Turkish Character Handling:** `slugify()` function converts Turkish characters to Latin equivalents
- **Storage:** Settings stored in localStorage with keys from `WATCH_URL_STORAGE_KEYS`
- **Default:** `https://dizipal1984.com/dizi/%dizi_adi%/%sezon%-sezon/%bolum%-bolum`

When adding features that generate watch URLs:
1. Get settings via `getWatchUrlSettings()`
2. Check for custom slug via `getCustomWatchSlug(showId)`
3. Generate URL via `generateWatchUrl(baseUrl, pattern, { showName, season, episode, customSlug })`

### Episode Tracking Implementation

Episode watch state is complex due to the data structure:

1. **Store Structure:** `watchedEpisodes` is a `Map<showId, Array<episodeObj>>`
2. **Checking Status:** Use `showStore.isEpisodeWatched(showId, seasonNumber, episodeNumber)`
3. **Marking Watched:** Call `addWatchedEpisode()` in supabase service, then update store
4. **Unmarking:** Call `removeWatchedEpisode()` in supabase service, then update store
5. **Bulk Operations:** Iterate over episodes, but be mindful of rate limits and session expiry

### Avatar System

- Uses DiceBear API for generated avatars
- Avatar URL stored in both `users` table and auth metadata
- Avatar metadata (style, seed) stored in auth user metadata only
- On profile update, must update both `users` table and auth metadata (see `updateProfile()` in supabase service)

### XSS Protection

- DOMPurify is used for sanitizing user-generated content (notes, username)
- See `src/utils/sanitize.js` for sanitization helpers
- Always sanitize before rendering user input with `dangerouslySetInnerHTML`

## Environment Variables

### Client-Side (.env)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Server-Side (Vercel Dashboard)
```
TMDB_API_KEY=your_tmdb_api_key
```

**Important:** Never commit `.env` files. Use `.env.example` as template.

## Deployment

The app is deployed on Vercel with automatic deployments from Git:

1. **Build Command:** `npm run build` (Vite builds to `dist/`)
2. **Output Directory:** `dist`
3. **Serverless Functions:** `api/` directory (Node.js serverless functions)
4. **Routing:** `vercel.json` handles SPA routing and API proxy
5. **Environment Variables:** Must be set in Vercel Dashboard (especially `TMDB_API_KEY`)

See `VERCEL_SETUP.md` for detailed deployment instructions.

## Supabase Setup

To set up a new Supabase project:

1. Create project at supabase.com
2. Run `supabase-schema.sql` in SQL Editor
3. Get URL and anon key from Project Settings > API
4. Add to `.env` file locally
5. Configure RLS policies if modified

**Important:** The schema includes automatic user profile creation via trigger on `auth.users` INSERT.

## Common Patterns & Best Practices

### Adding a New Page/Route

1. Create component in `src/pages/`
2. Add route to `App.jsx` inside `<ProtectedRoute>` if auth required
3. Add navigation link in `Navbar.jsx` if needed
4. Use appropriate hooks (`useAuth`, `useShowStore`, React Query hooks)

### Adding a TMDB API Endpoint

1. Add service function in `src/services/tmdb.js` using `fetchFromTMDB()`
2. Create custom hook in `src/hooks/useQueries.js` with React Query
3. Add query key to `queryKeys` object for cache management
4. Use the hook in components

### Adding a Supabase Database Operation

1. Add function in `src/services/supabase.js`
2. Update corresponding Zustand store after successful operation
3. Handle errors and show user feedback (Toast component)
4. Ensure RLS policies allow the operation

### Working with Watched Episodes

Always use the store helpers:
```javascript
const showStore = useShowStore()

// Check if watched
const isWatched = showStore.isEpisodeWatched(showId, seasonNumber, episodeNumber)

// Mark as watched
await addWatchedEpisode(userId, showId, seasonNumber, episodeNumber)
showStore.addWatchedEpisode(showId, seasonNumber, episodeNumber)

// Unmark
await removeWatchedEpisode(userId, showId, seasonNumber, episodeNumber)
showStore.removeWatchedEpisode(showId, seasonNumber, episodeNumber)
```

### Handling Authentication State

```javascript
const { user, loading } = useAuth()

// Show loading spinner while checking auth
if (loading) return <Loader />

// User will be null if not authenticated (ProtectedRoute handles redirect)
if (!user) return null
```

### React Query Patterns

For infinite scroll: Use `useInfinite*` hooks (e.g., `useInfinitePopularShows`)
For single queries: Use regular hooks (e.g., `useShowDetails`)
For search: Enable query only when search term exists using `enabled` option

## Troubleshooting

### "No active session" errors
- Check if `authStore.initialize()` is called in app startup
- Verify Supabase auth token hasn't expired
- Check browser console for auth state change events

### TMDB API proxy not working locally
- Ensure using `vercel dev` not `npm run dev`
- Verify `TMDB_API_KEY` is set in `.env` (pulled via `vercel env pull`)
- Check `api/tmdb.js` function logs in Vercel CLI output

### Episode watch state not syncing
- Verify both Supabase service call AND store update are happening
- Check browser network tab for failed requests
- Ensure `watchedEpisodes` Map is being updated correctly
- Check for session expiry (re-login may be needed)

### Vercel deployment fails
- Verify all env vars are set in Vercel Dashboard
- Check build logs for missing dependencies
- Ensure `vercel.json` is committed to repo
- Verify Supabase URL is accessible from Vercel

## Git Workflow

Main branch: `master`

Current git status shows clean working directory. When making commits, follow existing commit message style visible in git log.
