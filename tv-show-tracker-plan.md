# 📺 TV Show Tracker - Proje Planı

## Proje Özeti

Kullanıcıların izledikleri TV dizilerini takip edebileceği, bölümleri işaretleyebileceği ve yeni sezonlardan haberdar olabileceği bir web uygulaması.

---

## Temel Özellikler

### 1. Dizi Yönetimi
- Dizi arama ve listeye ekleme
- İzleme durumu (İzleniyor, Tamamlandı, Bırakıldı, İzlenecek)
- Kişisel puan ve not ekleme
- Favorilere ekleme

### 2. Bölüm Takibi
- Sezon bazlı bölüm listesi
- Tek tek veya toplu bölüm işaretleme (izledim/izlemedim)
- "Tüm sezonu izledim" butonu
- Son izlenen bölümü gösterme
- Sonraki izlenecek bölüm önerisi

### 3. Yeni İçerik Bildirimleri
- Takip edilen dizilerin yeni sezon/bölüm duyuruları
- Takvim görünümü (bu hafta/ay yayınlanacaklar)
- "Bugün yayınlananlar" bölümü

### 4. Dashboard
- İzleme istatistikleri (toplam saat, bölüm sayısı, dizi sayısı)
- Devam eden diziler listesi
- Son aktiviteler
- Yaklaşan bölümler widget'ı

### 5. Keşfet
- Popüler diziler
- Trend olanlar
- Türe göre filtreleme
- Benzer dizi önerileri

---

## Tech Stack

| Katman | Teknoloji | Açıklama |
|--------|-----------|----------|
| Frontend | React + Vite | Hızlı, modern geliştirme |
| Styling | Tailwind CSS | Utility-first CSS framework |
| State Management | Zustand veya Context API | Basit ve etkili state yönetimi |
| Backend | Node.js + Express veya Supabase | API proxy + authentication |
| Database | Supabase (PostgreSQL) veya Firebase | Kolay kurulum, realtime özellikler |
| Authentication | Supabase Auth / Firebase Auth | Sosyal login desteği |

---

## Veritabanı Şeması

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### user_shows
```sql
CREATE TABLE user_shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tmdb_show_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'plan_to_watch', -- watching, completed, dropped, plan_to_watch
    user_rating DECIMAL(3,1) CHECK (user_rating >= 0 AND user_rating <= 10),
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tmdb_show_id)
);
```

### watched_episodes
```sql
CREATE TABLE watched_episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tmdb_show_id INTEGER NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    watched_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, tmdb_show_id, season_number, episode_number)
);
```

### show_cache (opsiyonel)
```sql
CREATE TABLE show_cache (
    tmdb_show_id INTEGER PRIMARY KEY,
    data JSONB NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW()
);
```

---

## Sayfa Yapısı

```
/                     → Dashboard (ana sayfa)
/search               → Dizi arama
/discover             → Keşfet (popüler, trending, türler)
/my-shows             → Kütüphanem (tüm eklenen diziler)
/show/:id             → Dizi detay sayfası
/show/:id/season/:num → Sezon detay + bölüm listesi
/calendar             → Yayın takvimi
/stats                → İzleme istatistikleri
/settings             → Kullanıcı ayarları
/login                → Giriş sayfası
/register             → Kayıt sayfası
```

---

## TMDB API Entegrasyonu

### Konfigürasyon
```javascript
const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: 'e066d74d08816243e87e8c8da17a5897',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    POSTER_SIZES: ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'],
    BACKDROP_SIZES: ['w300', 'w780', 'w1280', 'original']
};
```

### Kullanılacak Endpoint'ler

| Endpoint | Açıklama |
|----------|----------|
| `GET /search/tv?query={query}` | Dizi arama |
| `GET /tv/{id}` | Dizi detayları |
| `GET /tv/{id}/season/{season_number}` | Sezon + bölümler |
| `GET /tv/popular` | Popüler diziler |
| `GET /tv/on_the_air` | Şu an yayında olanlar |
| `GET /tv/airing_today` | Bugün yayınlananlar |
| `GET /trending/tv/week` | Haftalık trend |
| `GET /genre/tv/list` | Tür listesi |
| `GET /discover/tv?with_genres={id}` | Türe göre filtreleme |
| `GET /tv/{id}/similar` | Benzer diziler |
| `GET /tv/{id}/recommendations` | Önerilen diziler |

### Örnek API Çağrıları

```javascript
// Dizi arama
const searchShows = async (query) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/search/tv?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}&language=tr-TR`
    );
    return response.json();
};

// Dizi detayları
const getShowDetails = async (showId) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/tv/${showId}?api_key=${TMDB_CONFIG.API_KEY}&language=tr-TR`
    );
    return response.json();
};

// Sezon bilgileri
const getSeasonDetails = async (showId, seasonNumber) => {
    const response = await fetch(
        `${TMDB_CONFIG.BASE_URL}/tv/${showId}/season/${seasonNumber}?api_key=${TMDB_CONFIG.API_KEY}&language=tr-TR`
    );
    return response.json();
};
```

---

## Proje Yapısı

```
tv-show-tracker/
├── public/
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   └── images/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── Navbar.jsx
│   │   ├── show/
│   │   │   ├── ShowCard.jsx
│   │   │   ├── ShowGrid.jsx
│   │   │   ├── SeasonList.jsx
│   │   │   ├── EpisodeItem.jsx
│   │   │   └── EpisodeList.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsWidget.jsx
│   │   │   ├── ContinueWatching.jsx
│   │   │   ├── UpcomingEpisodes.jsx
│   │   │   └── RecentActivity.jsx
│   │   └── calendar/
│   │       └── CalendarView.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Search.jsx
│   │   ├── Discover.jsx
│   │   ├── MyShows.jsx
│   │   ├── ShowDetail.jsx
│   │   ├── SeasonDetail.jsx
│   │   ├── Calendar.jsx
│   │   ├── Stats.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTMDB.js
│   │   ├── useUserShows.js
│   │   └── useWatchedEpisodes.js
│   ├── services/
│   │   ├── tmdb.js
│   │   ├── supabase.js
│   │   └── auth.js
│   ├── store/
│   │   ├── authStore.js
│   │   ├── showStore.js
│   │   └── uiStore.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── formatters.js
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   ├── main.jsx
│   └── router.jsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## MVP (Minimum Viable Product) - Aşama 1

İlk sürüm için öncelikli özellikler:

- [x] Kullanıcı kaydı/girişi
- [x] Dizi arama
- [x] Dizileri listeye ekleme
- [x] Bölümleri izlendi olarak işaretleme
- [x] Basit dashboard (devam eden diziler + sonraki bölümler)

**Tahmini süre:** 2-3 hafta

---

## Geliştirme Aşamaları

| Aşama | İçerik | Süre | Durum |
|-------|--------|------|-------|
| 1 | Proje kurulumu, Auth sistemi | 2-3 gün | ⏳ |
| 2 | TMDB API entegrasyonu, Arama | 2-3 gün | ⏳ |
| 3 | Dizi detay sayfası, Sezon/Bölüm listesi | 3-4 gün | ⏳ |
| 4 | Bölüm işaretleme sistemi | 2-3 gün | ⏳ |
| 5 | Dashboard, İstatistikler | 3-4 gün | ⏳ |
| 6 | Takvim, Bildirimler | 3-4 gün | ⏳ |
| 7 | UI polish, Responsive tasarım | 2-3 gün | ⏳ |

---

## UI/UX Tasarım Notları

### Renk Paleti (Önerilen)
```css
:root {
    --primary: #6366f1;      /* Indigo */
    --primary-dark: #4f46e5;
    --secondary: #10b981;    /* Emerald */
    --background: #0f172a;   /* Slate 900 */
    --surface: #1e293b;      /* Slate 800 */
    --text-primary: #f8fafc; /* Slate 50 */
    --text-secondary: #94a3b8; /* Slate 400 */
    --accent: #f59e0b;       /* Amber */
    --error: #ef4444;        /* Red */
    --success: #22c55e;      /* Green */
}
```

### İzleme Durumu Renkleri
- **İzleniyor:** 🟢 Yeşil
- **Tamamlandı:** 🔵 Mavi
- **Bırakıldı:** 🔴 Kırmızı
- **İzlenecek:** 🟡 Sarı

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Ekstra Özellikler (Gelecek Sürümler)

### v2.0
- [ ] PWA desteği (mobilde uygulama gibi çalışsın)
- [ ] Push notifications
- [ ] Offline mode

### v3.0
- [ ] Arkadaş sistemi
- [ ] Watchlist paylaşma
- [ ] Sosyal özellikler

### v4.0
- [ ] Spoiler koruması
- [ ] Browser extension
- [ ] Dışa aktarma (CSV/JSON)
- [ ] Trakt.tv entegrasyonu

---

## Güvenlik Notları

1. **API Key Güvenliği:** TMDB API key'i frontend'de kullanılabilir ancak production'da backend proxy üzerinden çağrı yapmak daha güvenli.

2. **Environment Variables:**
   ```env
   VITE_TMDB_API_KEY=e066d74d08816243e87e8c8da17a5897
   VITE_SUPABASE_URL=https://tjmwaybhppkxchyfjxkm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbXdheWJocHBreGNoeWZqeGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjA5MTIsImV4cCI6MjA4MzUzNjkxMn0.wev_K0b66mQjxan8oLOZm45zIEvxk5b-UrP7u_gyW_0
   ```

3. **Rate Limiting:** TMDB API rate limit'lerine dikkat edilmeli, gerekirse caching uygulanmalı.

---

## Kaynaklar

- [TMDB API Dokümantasyonu](https://developer.themoviedb.org/docs)
- [React Dokümantasyonu](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [Vite](https://vitejs.dev)

---

## Notlar

- Proje geliştirme sürecinde bu doküman güncellenecektir.
- Her aşama tamamlandığında durum güncellenmeli.
- Yeni fikirler ve özellikler "Ekstra Özellikler" bölümüne eklenebilir.
