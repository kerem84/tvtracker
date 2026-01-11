# 🔒 Security Guide

## ⚠️ Kritik Güvenlik Bildirimi

**TMDB API Key Exposed!**

`.env` dosyası Git history'de commit edildiği için TMDB API key exposed olmuştur. Bu key'i **mutlaka** rotate etmeniz gerekmektedir.

### Exposed API Key
```
OLD KEY (EXPOSED - KULLANMAYIN): e066d74d08816243e87e8c8da17a5897
```

## 🔄 API Key Rotation Rehberi

### 1. TMDB API Key Rotation

#### Adım 1: TMDB'ye Giriş Yapın

1. [TMDB](https://www.themoviedb.org/) adresine gidin
2. Hesabınıza giriş yapın

#### Adım 2: Yeni API Key Oluşturun

1. Settings > API'ye gidin: https://www.themoviedb.org/settings/api
2. "Generate New API Key (v3)" veya "Request an API Key" butonuna tıklayın
3. Formu doldurun:
   - **Type of Use:** Website
   - **Application Name:** TV Tracker
   - **Application URL:** Your production URL (örn: https://tvtracker.vercel.app)
   - **Application Summary:** A TV show tracking application
4. API key'inizi alın

#### Adım 3: Eski Key'i Devre Dışı Bırakın

1. TMDB Settings > API sayfasında
2. Eski API key'in yanındaki "Delete" veya "Revoke" butonuna tıklayın
3. Onaylayın

#### Adım 4: Yeni Key'i Vercel'e Ekleyin

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. Projenizi seçin
3. Settings > Environment Variables'a gidin
4. `TMDB_API_KEY` variable'ını bulun ve "Edit" tıklayın
5. Yeni API key'inizi yapıştırın
6. Save

#### Adım 5: Redeploy

1. Vercel Dashboard'da Deployments sekmesine gidin
2. En son deployment'ın yanındaki "..." menüsünden "Redeploy" seçin
3. Deploy tamamlanana kadar bekleyin

#### Adım 6: Test Edin

```bash
# Production URL'nizi test edin
curl "https://your-app.vercel.app/api/tmdb?endpoint=/tv/popular&page=1"
```

Başarılı bir response almalısınız.

### 2. Local Development Setup

Yeni API key'i local development için de ayarlayın:

#### Vercel CLI ile (Önerilen)

```bash
# Vercel'den environment variables'ları çekin
vercel env pull

# Development server'ı başlatın
vercel dev
```

Bu, Vercel'deki `TMDB_API_KEY`'i otomatik olarak `.env` dosyanıza ekler.

#### Manuel Setup

Eğer Vercel CLI kullanmak istemiyorsanız:

1. `.env` dosyası oluşturun (zaten var)
2. TMDB API key'inizi eklemek için **Vercel serverless function'ı local test etmeniz gerekir**

**Not:** `VITE_TMDB_API_KEY` artık kullanılmıyor. API key sadece server-side'da (Vercel'de) olmalı.

## 🛡️ Güvenlik Best Practices

### Environment Variables

#### ✅ DO:
- API key'leri server-side environment variables'da saklayın
- `.env` dosyasını `.gitignore`'a ekleyin
- `.env.example` ile şablon sağlayın
- Production'da Vercel environment variables kullanın
- Hassas bilgileri asla commit etmeyin

#### ❌ DON'T:
- API key'leri client-side kodda kullanmayın
- `.env` dosyasını Git'e commit etmeyin
- API key'leri kod yorumlarında bırakmayın
- Hassas bilgileri log'lamayın

### Exposed Secrets Checklist

Eğer bir secret exposed olduysa:

- [ ] Secret'ı hemen rotate edin (yeni oluşturun)
- [ ] Eski secret'ı devre dışı bırakın/revoke edin
- [ ] Git history'den kaldırmayı düşünün (BFG Repo-Cleaner)
- [ ] Vercel/production environment variables'ları güncelleyin
- [ ] Redeploy yapın
- [ ] Test edin
- [ ] Gelecekte tekrar olmaması için önlem alın

### Git History'den Sensitive Data Kaldırma (İleri Seviye)

**Uyarı:** Bu işlem repository history'sini yeniden yazar. Dikkatli olun!

```bash
# BFG Repo-Cleaner kullanarak
# 1. BFG'yi indirin: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Repository'nin bir backup'ını alın
git clone --mirror git@github.com:yourusername/tvtracker.git

# 3. .env dosyasını history'den kaldırın
java -jar bfg.jar --delete-files .env tvtracker.git

# 4. Cleanup
cd tvtracker.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# 5. Push (force)
git push --force

# NOT: Tüm collaborators'ların repo'yu yeniden clone etmesi gerekir!
```

**Daha Basit Alternatif:** Sadece key'i rotate edin. Git history'yi temizlemeye gerek yoktur çünkü eski key artık geçersiz olacak.

## 🔐 Supabase Security

### Anon Key Public mi?

**Evet!** `VITE_SUPABASE_ANON_KEY` public olarak paylaşılabilir.

Supabase anon key client-side'da kullanılmak için tasarlanmıştır. Güvenlik:
- ✅ Row Level Security (RLS) policies ile sağlanır
- ✅ Her kullanıcı sadece kendi verilerini görebilir
- ✅ Database seviyesinde güvenlik

**Rotate etmeye gerek YOK.**

### Service Role Key

`service_role_key` **asla** client-side'da kullanılmamalıdır. Bu key tüm RLS policies'i bypass eder.

- ❌ Client-side kodda kullanmayın
- ❌ Git'e commit etmeyin
- ✅ Sadece backend/serverless functions'ta kullanın

Bu projede service role key kullanılmıyor. ✅

## 📋 Security Checklist

### Completed ✅

- [x] TMDB API key server-side'a taşındı
- [x] `.env` dosyası `.gitignore`'a eklendi
- [x] `.env` dosyası Git'ten kaldırıldı
- [x] `.env.example` şablon oluşturuldu
- [x] Secure API proxy implementasyonu (/api/tmdb)
- [x] Row Level Security (RLS) aktif
- [x] Supabase authentication kuruldu

### Pending ⏳

- [ ] TMDB API key rotation (Manuel - kullanıcı tarafından)
- [ ] XSS koruması implementasyonu
- [ ] CSRF token implementasyonu (opsiyonel)
- [ ] Rate limiting (API proxy için)
- [ ] Input validation (form validation)
- [ ] Security headers (Vercel config)

### Future Considerations 🔮

- [ ] 2FA (Two-Factor Authentication)
- [ ] Email verification
- [ ] Password strength requirements
- [ ] Session management improvements
- [ ] Audit logging
- [ ] Security scanning (Dependabot, Snyk)

## 🚨 Reporting Security Issues

Güvenlik açığı bulursanız:

1. **Public issue açmayın!**
2. Email ile bildirin: [your-email]
3. Detaylı açıklama sağlayın
4. Proof of concept ekleyin (opsiyonel)

Sorumlu açıklama (responsible disclosure) yapılmasını rica ederiz.

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Security](https://vercel.com/docs/security)
- [TMDB API Terms](https://www.themoviedb.org/documentation/api/terms-of-use)

---

**Son Güncelleme:** 2026-01-11

**Durum:** ⚠️ TMDB API key rotation bekleniyor
