# Vercel Deployment Setup

This guide explains how to set up environment variables in Vercel for the TMDB API proxy.

## Required Environment Variables

### On Vercel Dashboard

1. Go to your project settings: `https://vercel.com/<your-username>/tvtracker/settings/environment-variables`

2. Add the following environment variable:

   - **Name:** `TMDB_API_KEY`
   - **Value:** Your TMDB API key (get it from https://www.themoviedb.org/settings/api)
   - **Environment:** Production, Preview, Development (select all)

3. Click "Save"

4. Redeploy your application for the changes to take effect

### Environment Variables List

| Variable | Required For | Description |
|----------|--------------|-------------|
| `TMDB_API_KEY` | Serverless Function | TMDB API key (server-side only, not exposed to client) |
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous key (safe to expose) |

## Local Development

### Option 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Pull environment variables from Vercel
vercel env pull

# Run development server with Vercel
vercel dev
```

This will run your app on `http://localhost:3000` with the API routes working.

### Option 2: Manual Setup

1. Create a `.env` file (already done):
   ```bash
   cp .env.example .env
   ```

2. Add your Supabase credentials to `.env`

3. For the TMDB API proxy to work locally, you need to create a `.env` file in the root:
   ```bash
   # .env (for Vercel serverless functions)
   TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. Run with Vercel CLI:
   ```bash
   vercel dev
   ```

## Testing the API Proxy

Once deployed or running locally, test the proxy:

```bash
# Test the API proxy
curl "https://your-app.vercel.app/api/tmdb?endpoint=/tv/popular&page=1"

# Or locally
curl "http://localhost:3000/api/tmdb?endpoint=/tv/popular&page=1"
```

You should receive TMDB API response without exposing your API key to the client.

## Security Notes

- ✅ `TMDB_API_KEY` is now server-side only (in Vercel environment variables)
- ✅ `VITE_SUPABASE_ANON_KEY` is safe to expose (it's meant to be public with RLS)
- ✅ `.env` file is now in `.gitignore` and won't be committed
- ✅ API key is never sent to the browser

## Troubleshooting

### "Server configuration error" when testing API

**Problem:** The TMDB_API_KEY environment variable is not set.

**Solution:**
1. Make sure you added `TMDB_API_KEY` in Vercel dashboard
2. Redeploy your application
3. For local development, run `vercel env pull` or set it manually

### API proxy not working in development

**Problem:** `/api/tmdb` returns 404

**Solution:** Use `vercel dev` instead of `npm run dev` to run the serverless functions locally.

### "Failed to fetch" errors

**Problem:** CORS or network issues

**Solution:**
1. Check browser console for detailed error
2. Make sure you're using the correct URL (window.location.origin)
3. Check Vercel function logs for errors
