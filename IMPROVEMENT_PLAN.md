# TV Tracker - Geliştirme Planı

## 📊 Genel Değerlendirme

**Proje Durumu:** İyi yapılandırılmış MVP (Minimum Viable Product)

**Güçlü Yönler:**
- ⭐ Modern React best practices kullanımı
- ⭐ Temiz kod organizasyonu ve mimari
- ⭐ Mükemmel UI/UX tasarımı
- ⭐ İyi yapılandırılmış veritabanı (RLS, triggers)
- ⭐ Etkili state management (Zustand)

**İyileştirme Gereken Alanlar:**
- 🔴 Kritik güvenlik sorunları
- 🟡 Performans optimizasyonları
- 🟡 Test altyapısının eksikliği
- 🟡 Dokümantasyon eksiklikleri

---

## 🚨 KRİTİK ÖNCELİKLER (Hemen Düzeltilmeli)

### 1. Güvenlik: API Key Koruması
**Sorun:** TMDB API anahtarı client-side kodda görünür durumda
- Tarayıcıda API anahtarı kolayca çıkarılabilir
- API kötüye kullanım riski var

**Çözüm Seçenekleri:**

**Seçenek A: Supabase Edge Function (Önerilen)**
```javascript
// supabase/functions/tmdb-proxy/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const endpoint = url.searchParams.get('endpoint')

  const response = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: { 'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}` }
  })

  return new Response(await response.text(), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

**Seçenek B: Vercel Serverless Function**
```javascript
// api/tmdb.js
export default async function handler(req, res) {
  const { endpoint } = req.query
  const response = await fetch(`https://api.themoviedb.org/3${endpoint}`, {
    headers: { 'Authorization': `Bearer ${process.env.TMDB_API_KEY}` }
  })
  const data = await response.json()
  res.status(200).json(data)
}
```

**Eylem Adımları:**
1. ✅ Supabase Edge Function veya Vercel API route oluştur
2. ✅ `tmdb.js` service dosyasını proxy kullanacak şekilde güncelle
3. ✅ `.env` dosyasından `VITE_TMDB_API_KEY`'i kaldır
4. ✅ API anahtarını backend'e taşı
5. ✅ Test et ve deploy et

**Tahmini Süre:** 2-3 saat

---

### 2. Güvenlik: .env Dosyası Koruması
**Sorun:** `.env` dosyası Git'e commit edilmiş durumda

**Çözüm:**
```bash
# .gitignore dosyasına ekle
.env
.env.local
.env.production
```

**Eylem Adımları:**
1. ✅ `.gitignore` dosyasını güncelle
2. ✅ `.env.example` dosyası oluştur (hassas bilgiler olmadan)
3. ✅ Git history'den `.env` dosyasını kaldır:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from version control"
   ```
4. ✅ Tüm API anahtarlarını rotate et (GitHub'da paylaşıldı)
5. ✅ README'ye environment setup talimatları ekle

**Tahmini Süre:** 30 dakika

---

### 3. Güvenlik: XSS Koruması
**Sorun:** Kullanıcı tarafından oluşturulan içerik (notlar, kullanıcı adları) sanitize edilmeden render ediliyor

**Çözüm:**
```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```javascript
// utils/sanitize.js
import DOMPurify from 'dompurify'

export const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  })
}

// Ya da sadece text kullan:
export const sanitizeText = (text) => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
```

**Eylem Adımları:**
1. ✅ DOMPurify kütüphanesini ekle
2. ✅ Kullanıcı notlarını sanitize et
3. ✅ Kullanıcı adlarını doğrula (regex ile)
4. ✅ Tüm user-generated content'i incele

**Tahmini Süre:** 2 saat

---

## 🔥 YÜKSEK ÖNCELİKLER

### 4. Dokümantasyon: README.md Oluşturma
**Sorun:** Projenin README dosyası yok

**Çözüm:** Kapsamlı README oluştur

**İçerik:**
```markdown
# TV Tracker

## Özellikler
- Dizi takibi ve bölüm işaretleme
- TMDB entegrasyonu
- Takvim görünümü
- İstatistikler ve analizler

## Teknolojiler
- React 18 + Vite
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Zustand

## Kurulum
1. Clone repository
2. npm install
3. .env.example'ı .env'ye kopyala
4. Supabase projesini ayarla
5. npm run dev

## Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Deployment
Vercel'e otomatik deploy

## Lisans
MIT
```

**Eylem Adımları:**
1. ✅ README.md oluştur
2. ✅ Screenshot'lar ekle
3. ✅ Kurulum adımlarını detaylandır
4. ✅ API dokümantasyonu ekle
5. ✅ Contributing guidelines ekle

**Tahmini Süre:** 3-4 saat

---

### 5. Test Altyapısı Kurulumu
**Sorun:** Hiç test yok

**Çözüm:** Vitest + React Testing Library + Playwright

**Kurulum:**
```bash
# Unit/Integration Tests
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

# E2E Tests
npm install -D @playwright/test
```

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

**Test Hedefleri:**
1. **Unit Tests** (Utility Functions)
   - `userUtils.js` fonksiyonları
   - `constants.js` değerleri

2. **Component Tests** (Kritik Componentler)
   - `ShowCard.jsx` - render ve interaksiyon
   - `Navbar.jsx` - navigasyon ve auth state
   - `Login.jsx` / `Register.jsx` - form validation

3. **Integration Tests** (Kullanıcı Akışları)
   - Login flow
   - Dizi ekleme flow
   - Bölüm işaretleme flow

4. **E2E Tests** (Kritik Yollar)
   - Kullanıcı kaydı ve login
   - Dizi arama ve ekleme
   - Bölüm işaretleme
   - Profil güncelleme

**Eylem Adımları:**
1. ✅ Test framework'lerini kur
2. ✅ Test setup dosyalarını oluştur
3. ✅ İlk utility test'lerini yaz (kolay başlangıç)
4. ✅ Component test'leri ekle
5. ✅ E2E test'leri ekle
6. ✅ CI/CD'ye entegre et (GitHub Actions)

**Hedef Coverage:** %60+

**Tahmini Süre:** 8-10 saat

---

### 6. Performans: Settings Sayfası Hard Refresh Sorunu
**Sorun:** `src/pages/Settings.jsx:64` - `window.location.reload()` kullanılıyor
- SPA deneyimini bozuyor
- Gereksiz sayfa yenileme

**Mevcut Kod:**
```javascript
await updateUserProfile(user.id, username, avatarStyle)
toast.success('Profile updated successfully!')
setTimeout(() => {
  window.location.reload()
}, 1500)
```

**Çözüm:** Supabase auth state listener kullan

```javascript
// store/authStore.js'de
const useAuthStore = create((set) => ({
  user: null,
  userProfile: null,

  refreshUserProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      set({ user, userProfile: profile })
    }
  }
}))

// Settings.jsx'de
const handleUpdateProfile = async () => {
  await updateUserProfile(user.id, username, avatarStyle)
  await refreshUserProfile() // Hard refresh yerine
  toast.success('Profile updated successfully!')
}
```

**Eylem Adımları:**
1. ✅ `authStore.js`'e `refreshUserProfile` fonksiyonu ekle
2. ✅ Settings sayfasını güncelle
3. ✅ `window.location.reload()` kaldır
4. ✅ Navbar'ın otomatik güncellenmesini test et

**Tahmini Süre:** 1 saat

---

### 7. Error Boundary Ekleme
**Sorun:** Global error handling yok, hatalar sadece console'a yazılıyor

**Çözüm:** React Error Boundary

```javascript
// components/common/ErrorBoundary.jsx
import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // TODO: Send to error reporting service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
            <p className="text-gray-400 mb-4">Something went wrong</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
```

**App.jsx'de kullan:**
```javascript
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

**Eylem Adımları:**
1. ✅ ErrorBoundary component'i oluştur
2. ✅ App.jsx'e entegre et
3. ✅ Error logging service ekle (opsiyonel - Sentry)
4. ✅ User-friendly error mesajları tasarla

**Tahmini Süre:** 2 saat

---

### 8. Performans: Calendar Sayfası Optimizasyonu
**Sorun:** `src/pages/Calendar.jsx:42-96` - Sequential API çağrıları
- Her dizi için ayrı ayrı API çağrısı yapılıyor
- Sezonlar sırayla fetch ediliyor
- Büyük kütüphanelerde yavaşlık

**Mevcut Kod:**
```javascript
for (const userShow of userShows) {
  const showDetails = await getShowDetails(userShow.show_id) // Sırayla
  for (const season of showDetails.seasons) {
    const seasonDetails = await getSeasonDetails(userShow.show_id, season.season_number) // Sırayla
  }
}
```

**Çözüm 1: Paralel Fetch**
```javascript
const showDetailsPromises = userShows.map(userShow =>
  getShowDetails(userShow.show_id)
)
const allShowDetails = await Promise.all(showDetailsPromises)

// Her show için sezonları paralel fetch et
const seasonPromises = allShowDetails.flatMap(show =>
  show.seasons.map(season =>
    getSeasonDetails(show.id, season.season_number)
  )
)
const allSeasons = await Promise.all(seasonPromises)
```

**Çözüm 2: React Query ile Caching (Daha İyi)**
```javascript
import { useQuery } from '@tanstack/react-query'

const { data: showDetails } = useQuery({
  queryKey: ['show', showId],
  queryFn: () => getShowDetails(showId),
  staleTime: 5 * 60 * 1000, // 5 dakika cache
})
```

**Eylem Adımları:**
1. ✅ React Query kur (`npm install @tanstack/react-query`)
2. ✅ QueryClient setup yap
3. ✅ Calendar.jsx'i React Query kullanacak şekilde refactor et
4. ✅ Diğer sayfalara da uygula (Discovery, MyShows, etc.)
5. ✅ Loading states ve error handling ekle

**Tahmini Süre:** 4-6 saat

---

## 🟡 ORTA ÖNCELİKLER

### 9. Code Splitting / Lazy Loading
**Sorun:** Tüm sayfalar upfront yükleniyor, bundle size büyük

**Çözüm:**
```javascript
// App.jsx
import { lazy, Suspense } from 'react'
import Loader from './components/common/Loader'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Discovery = lazy(() => import('./pages/Discovery'))
const MyShows = lazy(() => import('./pages/MyShows'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Statistics = lazy(() => import('./pages/Statistics'))
const ShowDetails = lazy(() => import('./pages/ShowDetails'))
const Settings = lazy(() => import('./pages/Settings'))

// Router'da
{
  path: '/dashboard',
  element: (
    <Suspense fallback={<Loader />}>
      <Dashboard />
    </Suspense>
  )
}
```

**Eylem Adımları:**
1. ✅ React.lazy() ile route-based code splitting ekle
2. ✅ Suspense fallback component'leri tasarla
3. ✅ Bundle size analizi yap (`vite build --mode analyze`)
4. ✅ Chunk sizes'ı optimize et

**Beklenen İyileşme:** Initial bundle size %40-50 azalma

**Tahmini Süre:** 2-3 saat

---

### 10. Form Validation
**Sorun:** Client-side validation minimal, sadece HTML5 validation

**Çözüm:** Zod + React Hook Form

```bash
npm install zod react-hook-form @hookform/resolvers
```

```javascript
// utils/validationSchemas.js
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalı')
    .max(20, 'Kullanıcı adı en fazla 20 karakter olabilir')
    .regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve alt çizgi kullanabilirsiniz'),
  email: z.string().email('Geçerli bir email girin'),
  password: z.string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(/[A-Z]/, 'En az bir büyük harf içermeli')
    .regex(/[a-z]/, 'En az bir küçük harf içermeli')
    .regex(/[0-9]/, 'En az bir rakam içermeli'),
})

// Login.jsx'de kullanım
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema)
})

const onSubmit = async (data) => {
  // Validated data
}

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <span className="text-red-500">{errors.email.message}</span>}
</form>
```

**Eylem Adımları:**
1. ✅ Zod ve React Hook Form kur
2. ✅ Validation schema'ları oluştur
3. ✅ Login/Register formlarını güncelle
4. ✅ Settings formunu güncelle
5. ✅ Error mesajlarını Türkçeleştir

**Tahmini Süre:** 3-4 saat

---

### 11. Accessibility İyileştirmeleri
**Sorun:** ARIA labels eksik, keyboard navigation test edilmemiş

**Çözüm:**

**ARIA Labels:**
```javascript
// ShowCard.jsx
<button
  aria-label={`Add ${show.name} to favorites`}
  onClick={handleFavorite}
>
  <Heart />
</button>

// Navbar.jsx
<nav aria-label="Main navigation">
  <ul role="list">
    <li role="listitem">
      <Link to="/dashboard" aria-current={isActive ? 'page' : undefined}>
        Dashboard
      </Link>
    </li>
  </ul>
</nav>
```

**Keyboard Navigation:**
```javascript
// Modal component için
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={(e) => {
    if (e.key === 'Escape') handleClose()
  }}
>
```

**Focus Management:**
```javascript
import { useEffect, useRef } from 'react'

const Modal = ({ isOpen }) => {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
    }
  }, [isOpen])
}
```

**Eylem Adımları:**
1. ✅ Tüm interactive elementlere aria-label ekle
2. ✅ Keyboard navigation test et ve düzelt
3. ✅ Focus management ekle (modals, dropdowns)
4. ✅ Screen reader test yap
5. ✅ Color contrast kontrol et (WCAG AA uyumlu)
6. ✅ axe DevTools ile otomatik test yap

**Tahmini Süre:** 4-5 saat

---

### 12. TMDB Cache Implementasyonu
**Sorun:** `show_cache` tablosu var ama kullanılmıyor

**Çözüm:** Cache layer ekle

```javascript
// services/cache.js
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 gün

export const getCachedShow = async (showId) => {
  const { data } = await supabase
    .from('show_cache')
    .select('*')
    .eq('show_id', showId)
    .single()

  if (data && new Date(data.cached_at) > new Date(Date.now() - CACHE_DURATION)) {
    return data.show_data
  }

  return null
}

export const setCachedShow = async (showId, showData) => {
  await supabase
    .from('show_cache')
    .upsert({
      show_id: showId,
      show_data: showData,
      cached_at: new Date().toISOString()
    })
}

// tmdb.js'de kullanım
export const getShowDetails = async (id) => {
  // Önce cache'e bak
  const cached = await getCachedShow(id)
  if (cached) return cached

  // Yoksa API'den çek
  const response = await fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`)
  const data = await response.json()

  // Cache'e kaydet
  await setCachedShow(id, data)

  return data
}
```

**Eylem Adımları:**
1. ✅ Cache service oluştur
2. ✅ TMDB service'e entegre et
3. ✅ Cache invalidation stratejisi belirle
4. ✅ Eski cache'leri temizleme job'ı ekle (Supabase cron)

**Tahmini Süre:** 3-4 saat

---

### 13. .env.example Oluşturma
**Sorun:** Yeni developerlar hangi env variable'ların gerektiğini bilmiyor

**Çözüm:**
```bash
# .env.example
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# TMDB API (Not needed after backend proxy implementation)
# Get your key from: https://www.themoviedb.org/settings/api
VITE_TMDB_API_KEY=your_tmdb_api_key_here
```

**README'de kurulum:**
```markdown
## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual values:
   - Get Supabase credentials from your project settings
   - Get TMDB API key from https://www.themoviedb.org/settings/api

3. Never commit your `.env` file!
```

**Eylem Adımları:**
1. ✅ `.env.example` oluştur
2. ✅ README'ye kurulum talimatları ekle
3. ✅ Contribution guide'da belirt

**Tahmini Süre:** 15 dakika

---

## 🟢 DÜŞÜK ÖNCELİKLER

### 14. TypeScript Migration
**Faydalar:**
- Type safety
- Better IDE support
- Refactoring kolaylığı
- Runtime error'ları compile-time'a taşıma

**Migrasyon Stratejisi:**
```bash
npm install -D typescript @types/react @types/react-dom
```

**Aşamalı Migrasyon:**
1. `tsconfig.json` oluştur
2. `.jsx` → `.tsx` (component by component)
3. Type definitions ekle (interfaces, types)
4. `any` kullanımını minimize et

**Başlangıç için:**
```typescript
// types/index.ts
export interface Show {
  id: number
  name: string
  poster_path: string | null
  vote_average: number
  first_air_date: string
}

export interface UserShow {
  id: string
  user_id: string
  show_id: number
  status: WatchStatus
  rating: number | null
  notes: string | null
  is_favorite: boolean
  created_at: string
}

export type WatchStatus = 'watching' | 'completed' | 'dropped' | 'plan_to_watch'
```

**Tahmini Süre:** 20-30 saat (tüm proje)

---

### 15. Virtual Scrolling (Uzun Listeler İçin)
**Ne Zaman Gerekli:** 100+ dizi olduğunda

**Çözüm:**
```bash
npm install react-window
```

```javascript
import { FixedSizeList } from 'react-window'

const MyShowsList = ({ shows }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ShowCard show={shows[index]} />
    </div>
  )

  return (
    <FixedSizeList
      height={800}
      itemCount={shows.length}
      itemSize={350}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  )
}
```

**Tahmini Süre:** 2-3 saat

---

### 16. PWA Support (v2.0 Planında Var)
**Özellikler:**
- Offline çalışma
- Install prompt
- Push notifications
- Background sync

**Kurulum:**
```bash
npm install -D vite-plugin-pwa
```

**vite.config.js:**
```javascript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TV Tracker',
        short_name: 'TV Tracker',
        description: 'Track your favorite TV shows',
        theme_color: '#1a1a2e',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
```

**Tahmini Süre:** 6-8 saat

---

### 17. CI/CD Pipeline
**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Tahmini Süre:** 2-3 saat

---

### 18. Component Documentation (Storybook)
**Faydalar:**
- Component gallery
- Isolated development
- Visual testing
- Documentation

```bash
npx storybook init
```

**Örnek Story:**
```javascript
// ShowCard.stories.jsx
import ShowCard from './ShowCard'

export default {
  title: 'Components/ShowCard',
  component: ShowCard,
}

export const Default = {
  args: {
    show: {
      id: 1,
      name: 'Breaking Bad',
      poster_path: '/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
      vote_average: 9.3,
    }
  }
}

export const NoImage = {
  args: {
    show: {
      id: 2,
      name: 'Show Without Poster',
      poster_path: null,
      vote_average: 7.5,
    }
  }
}
```

**Tahmini Süre:** 8-10 saat

---

## 📈 PERFORMANS ÖLÇÜMLERİ

### Mevcut Performans
```bash
npm run build
npm install -g lighthouse
lighthouse http://localhost:4173 --view
```

**Hedefler:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

### Bundle Size Analizi
```bash
npm install -D rollup-plugin-visualizer
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
})
```

---

## 🎯 İMPLEMENTASYON SIRASI ÖNERİSİ

### Sprint 1: Güvenlik ve Kritik Düzeltmeler (1 hafta)
1. ✅ API key güvenliği (Edge Function/Serverless)
2. ✅ .env koruması ve .gitignore
3. ✅ XSS koruması
4. ✅ Settings hard refresh düzeltme
5. ✅ Error Boundary ekleme

**Toplam: ~12-15 saat**

---

### Sprint 2: Test ve Dokümantasyon (1 hafta)
1. ✅ README.md oluşturma
2. ✅ .env.example oluşturma
3. ✅ Test framework kurulumu
4. ✅ İlk unit testler
5. ✅ İlk component testler

**Toplam: ~15-18 saat**

---

### Sprint 3: Performans Optimizasyonları (1 hafta)
1. ✅ React Query entegrasyonu
2. ✅ Calendar sayfası optimizasyonu
3. ✅ Code splitting/lazy loading
4. ✅ TMDB cache implementasyonu
5. ✅ Bundle size optimizasyonu

**Toplam: ~15-20 saat**

---

### Sprint 4: Kalite İyileştirmeleri (1 hafta)
1. ✅ Form validation (Zod)
2. ✅ Accessibility iyileştirmeleri
3. ✅ E2E testler
4. ✅ CI/CD pipeline
5. ✅ Performans ölçümleri

**Toplam: ~15-18 saat**

---

### Sprint 5: İleri Seviye Özellikler (Opsiyonel)
1. ✅ TypeScript migration (aşamalı)
2. ✅ PWA support
3. ✅ Virtual scrolling
4. ✅ Storybook
5. ✅ Advanced analytics

**Toplam: ~40-50 saat**

---

## 📊 ÖNCELİK MATRİSİ

| Özellik | Etki | Effort | Öncelik | Kategori |
|---------|------|--------|---------|----------|
| API Key Güvenliği | 🔴 Yüksek | Orta | 1 | Güvenlik |
| .env Koruması | 🔴 Yüksek | Düşük | 1 | Güvenlik |
| XSS Koruması | 🔴 Yüksek | Orta | 1 | Güvenlik |
| Error Boundary | 🟡 Orta | Düşük | 2 | Stabilite |
| Settings Refresh Fix | 🟡 Orta | Düşük | 2 | UX |
| Calendar Optimization | 🟡 Orta | Orta | 2 | Performans |
| README | 🟡 Orta | Orta | 2 | Dokümantasyon |
| Test Setup | 🟢 Yüksek | Yüksek | 3 | Kalite |
| React Query | 🟢 Orta | Orta | 3 | Performans |
| Code Splitting | 🟢 Orta | Düşük | 3 | Performans |
| Form Validation | 🟢 Orta | Orta | 3 | UX |
| Accessibility | 🟢 Orta | Orta | 3 | UX |
| TMDB Cache | 🟢 Düşük | Orta | 4 | Performans |
| TypeScript | 🟢 Orta | Yüksek | 5 | Kalite |
| PWA | 🟢 Düşük | Orta | 5 | Özellik |
| Virtual Scrolling | 🟢 Düşük | Düşük | 5 | Performans |

---

## 🔍 CODE REVIEW CHECKLİST

Her PR için kontrol edilmesi gerekenler:

### Güvenlik
- [ ] Kullanıcı input'ları sanitize edilmiş mi?
- [ ] API keys/secrets exposed değil mi?
- [ ] SQL injection riski var mı? (Supabase client kullanıldı mı?)
- [ ] XSS açığı var mı?

### Performans
- [ ] Gereksiz re-render var mı?
- [ ] useCallback/useMemo kullanılmalı mı?
- [ ] API çağrıları optimize mi?
- [ ] Images lazy load olarak yükleniyor mu?

### Kod Kalitesi
- [ ] ESLint hataları var mı?
- [ ] Console.log temizlendi mi?
- [ ] Değişken isimleri anlamlı mı?
- [ ] Magic number'lar constants'a taşındı mı?

### Test
- [ ] Yeni kod test edildi mi?
- [ ] Edge case'ler düşünüldü mü?
- [ ] Error handling var mı?

### Accessibility
- [ ] ARIA labels eklenmiş mi?
- [ ] Keyboard navigation çalışıyor mu?
- [ ] Color contrast yeterli mi?

### Dokümantasyon
- [ ] Karmaşık logic comment'lendi mi?
- [ ] README güncellendi mi? (gerekirse)
- [ ] PropTypes/TypeScript tanımları var mı?

---

## 📚 KAYNAKLAR VE ARAÇLAR

### Önerilen Kütüphaneler
- **State Management:** Zustand ✅ (mevcut), React Query (cache için)
- **Form Management:** React Hook Form + Zod
- **Testing:** Vitest + React Testing Library + Playwright
- **Error Tracking:** Sentry
- **Analytics:** Plausible (privacy-friendly) veya Google Analytics
- **Performance:** Lighthouse, Web Vitals

### Geliştirme Araçları
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Error Lens
  - GitLens

### Öğrenme Kaynakları
- [React Best Practices 2024](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Web Accessibility (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Query Docs](https://tanstack.com/query/latest)

---

## 🎉 SONUÇ

Bu plan, TV Tracker projesini production-ready hale getirmek için gereken tüm adımları içermektedir.

**Tavsiye Edilen Yaklaşım:**
1. Önce kritik güvenlik sorunlarını çöz (Sprint 1)
2. Test altyapısını kur ve dokümantasyon ekle (Sprint 2)
3. Performans optimizasyonlarını yap (Sprint 3)
4. Kalite iyileştirmelerini tamamla (Sprint 4)
5. İleri seviye özellikleri ihtiyaca göre ekle (Sprint 5)

**Toplam Tahmini Süre:**
- Minimum (Kritik + Yüksek öncelikler): 40-50 saat
- Full implementation: 100-120 saat

**Not:** Bu süre tahminleri deneyimli bir developer için geçerlidir. Projeye yeni başlayanlar için %30-50 daha fazla süre ayrılmalıdır.

Herhangi bir sorun veya soru için GitHub Issues kullanabilirsiniz!
