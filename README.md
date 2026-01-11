# 📺 TV Tracker

Modern, kullanıcı dostu bir dizi takip uygulaması. Sevdiğiniz dizileri takip edin, bölümleri işaretleyin, istatistiklerinizi görüntüleyin.

## ✨ Özellikler

### 🔐 Kullanıcı Yönetimi
- Email/şifre ile kayıt ve giriş
- Güvenli kimlik doğrulama (Supabase Auth)
- Özelleştirilebilir profil (kullanıcı adı ve avatar)
- 13 farklı avatar stili

### 📊 Dizi Takibi
- TMDB API ile geniş dizi veritabanı
- Dizi arama ve keşfet
- Kişisel dizi kütüphanesi
- 4 farklı izleme durumu:
  - 📺 İzleniyor
  - ✅ Tamamlandı
  - ❌ Bırakıldı
  - 📋 İzlenecek

### 🎯 Bölüm İşaretleme
- Sezon ve bölüm bazında detaylı takip
- Tek tıkla bölüm işaretleme
- "Tümünü izlendi olarak işaretle" özelliği
- İzleme ilerlemesi gösterimi

### 📅 Takvim Görünümü
- Bugün yayınlanan bölümler
- İzlemediğiniz bölümlerin listesi
- Dizi bazında gruplama
- Hızlı bölüm işaretleme

### 📈 İstatistikler
- Toplam izlenen bölüm sayısı
- Toplam izleme süresi
- Tamamlama oranı
- Kullanıcı sıralaması ve rozetler
- Favori tür analizi
- Tür dağılımı grafiği

### 🎨 Keşfet
- Popüler diziler
- Trend diziler
- Şu anda yayında olanlar
- 18+ farklı türe göre filtreleme
- Sonsuz scroll

### ⭐ Diğer Özellikler
- Dizi değerlendirme (1-10 puan)
- Kişisel notlar ekleme
- Favori dizileri işaretleme
- Responsive tasarım (mobil uyumlu)
- Modern dark tema
- Smooth animasyonlar

## 🛠️ Teknolojiler

### Frontend
- **React 18.3.1** - Modern UI framework
- **Vite 6.0.1** - Lightning fast build tool
- **React Router 6.28.0** - SPA routing
- **Tailwind CSS 3.4.15** - Utility-first CSS framework
- **Zustand 5.0.1** - Lightweight state management

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Real-time subscriptions
- **TMDB API** - The Movie Database API
  - Dizi bilgileri ve görseller
  - Secure serverless proxy

### Deployment
- **Vercel** - Serverless deployment platform

## 🚀 Kurulum

### Gereksinimler

- Node.js 18+ ve npm
- Supabase hesabı ([supabase.com](https://supabase.com))
- TMDB API anahtarı ([themoviedb.org](https://www.themoviedb.org/settings/api))
- Vercel hesabı (deployment için - opsiyonel)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/yourusername/tvtracker.git
cd tvtracker
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Projesini Kurun

1. [Supabase Dashboard](https://app.supabase.com)'a gidin
2. Yeni proje oluşturun
3. SQL Editor'de `supabase-schema.sql` dosyasını çalıştırın
4. Project Settings > API'den URL ve anon key'i alın

### 4. Environment Variables Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Not:** TMDB API key client-side'da değil, server-side'da saklanır (güvenlik için).

### 5. Development Server'ı Başlatın

**Önemli:** TMDB API proxy'nin çalışması için Vercel CLI kullanın:

```bash
# Vercel CLI'yi yükleyin (global)
npm install -g vercel

# Projeyi Vercel'e link edin
vercel link

# Environment variables'ı çekin
vercel env pull

# Development server'ı başlatın
vercel dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

**Alternatif (API olmadan):**

```bash
npm run dev
```

Bu durumda API proxy çalışmayacaktır. Sadece UI geliştirme için kullanılabilir.

## 📦 Production Build

```bash
npm run build
```

Build dosyaları `dist/` klasörüne oluşturulur.

Preview için:

```bash
npm run preview
```

## 🚢 Deployment (Vercel)

### İlk Deployment

1. Vercel hesabınıza giriş yapın
2. GitHub repository'nizi import edin
3. Environment Variables ekleyin:
   - `TMDB_API_KEY` - TMDB API anahtarınız (server-side)
4. Deploy!

### Environment Variables (Vercel)

Vercel Dashboard > Settings > Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `TMDB_API_KEY` | Your TMDB API key | Production, Preview, Development |

**Not:** `VITE_SUPABASE_URL` ve `VITE_SUPABASE_ANON_KEY` otomatik olarak `.env` dosyasından alınır (build sırasında).

Detaylı deployment rehberi için `VERCEL_SETUP.md` dosyasına bakın.

## 🔒 Güvenlik

### API Key Koruması

- ✅ TMDB API key server-side'da saklanır (Vercel serverless function)
- ✅ Client-side kodda API key yok
- ✅ Tüm TMDB istekleri `/api/tmdb` proxy'si üzerinden yapılır
- ✅ `.env` dosyası git'e commit edilmez

### Database Güvenliği

- ✅ Row Level Security (RLS) policies
- ✅ Kullanıcılar sadece kendi verilerini görebilir
- ✅ SQL injection koruması (Supabase client)
- ✅ Güvenli authentication (Supabase Auth)

### Supabase Anon Key

`VITE_SUPABASE_ANON_KEY` public olarak paylaşılabilir. Güvenlik, database seviyesinde RLS (Row Level Security) politikalarıyla sağlanır. Bu key client-side'da olması beklenir ve bir güvenlik riski oluşturmaz.

## 🗂️ Proje Yapısı

```
tvtracker/
├── api/                    # Vercel serverless functions
│   └── tmdb.js            # TMDB API proxy (güvenli)
├── src/
│   ├── components/        # React components
│   │   ├── common/       # Reusable components
│   │   │   ├── ShowCard.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── Loader.jsx
│   │   └── layout/       # Layout components
│   │       └── Navbar.jsx
│   ├── pages/            # Route components
│   │   ├── Dashboard.jsx
│   │   ├── Discovery.jsx
│   │   ├── MyShows.jsx
│   │   ├── Calendar.jsx
│   │   ├── Statistics.jsx
│   │   ├── ShowDetails.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/         # API services
│   │   ├── supabase.js  # Supabase client
│   │   └── tmdb.js      # TMDB service
│   ├── store/           # State management (Zustand)
│   │   ├── authStore.js
│   │   └── showStore.js
│   ├── hooks/           # Custom React hooks
│   │   └── useAuth.js
│   ├── utils/           # Helper functions
│   │   ├── constants.js
│   │   └── userUtils.js
│   └── App.jsx          # Main app component
├── supabase-schema.sql   # Database schema
├── .env.example         # Environment variables template
├── VERCEL_SETUP.md      # Deployment guide
├── IMPROVEMENT_PLAN.md  # Development roadmap
└── README.md           # This file
```

## 🎨 UI/UX Tasarımı

### Renk Paleti

```css
--primary: #6C63FF      /* Ana mor renk */
--primary-dark: #5B52E8 /* Koyu mor */
--secondary: #4ECDC4    /* Turkuaz */
--accent: #FFD93D       /* Sarı */
--success: #6BCF7F      /* Yeşil */
--error: #FF6B6B        /* Kırmızı */
--dark-bg: #16213E      /* Koyu mavi arka plan */
--dark-card: #1A1A2E    /* Kart arka planı */
```

### Typography

- Font: System fonts (sans-serif)
- Headings: Bold, büyük
- Body: Normal weight, okunabilir boyut

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

**Not:** Test altyapısı henüz kurulmadı. Roadmap'te var.

Planlanmış:
- Unit tests (Vitest + React Testing Library)
- E2E tests (Playwright)
- %60+ code coverage

## 📝 Contributing

Katkıda bulunmak isterseniz:

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit'leyin (`git commit -m 'Add some amazing feature'`)
4. Push'layın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 🐛 Bug Reports & Feature Requests

GitHub Issues kullanarak:
- 🐛 Bug report
- 💡 Feature request
- 📝 Documentation improvements

## 📄 Lisans

MIT License - Detaylar için `LICENSE` dosyasına bakın.

## 🙏 Teşekkürler

- [TMDB](https://www.themoviedb.org/) - Dizi veritabanı ve görseller
- [Supabase](https://supabase.com/) - Backend infrastructure
- [Vercel](https://vercel.com/) - Deployment platform
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [DiceBear](https://dicebear.com/) - Avatar API

## 📞 İletişim

Sorularınız için GitHub Issues kullanabilirsiniz.

---

**⚠️ Güvenlik Uyarısı**

Bu uygulama production'da kullanılmadan önce:
1. ✅ TMDB API key'ini rotate edin (exposed oldu)
2. ✅ Tüm environment variables'ları Vercel'de ayarlayın
3. ⏳ XSS koruması ekleyin (roadmap'te)
4. ⏳ Test suite'i kurun (roadmap'te)

Detaylı improvement plan için `IMPROVEMENT_PLAN.md` dosyasına bakın.

---

Made with ❤️ for TV show lovers
