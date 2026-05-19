# Pinti

**Satış var, kâr nerede?**

Pinti, küçük ve orta ölçekli e-ticaret satıcılarının kâr, reklam, iade, hakediş, fiyat ve kampanya verilerini tek panelde analiz eden yapay zekâ destekli karar destek aracıdır.

> Hackathon MVP'sidir. Gerçek finansal, hukuki veya yatırım tavsiyesi vermez.

---

## Problem

Küçük e-ticaret satıcıları satış yaptığını görür — ama gerçekte ne kazandığını bilemez.

Komisyon, kargo, reklam harcaması, iade kaybı, hakediş farkı, kampanya etkisi… Bunların hepsini aynı anda görmek, farklı Excel'ler, pazaryeri panelleri ve banka ekstrelerini elle birleştirmek demektir. Çoğu satıcı bunu yapmaz; ciroyu kâr zanneder, sorunları fark ettiğinde iş işten geçmiş olur.

## Çözüm

Pinti, satıcının verilerini tek bir panele toplar ve her finansal soruyu ayrı bir modülde cevaplar. Sonuçları birleştirip "bugün ilk bakılacak 3 şey" önerisini sunar. Böylece satıcı hangi ürünün zarar ettirdiğini, hangi reklamın kâra dönmediğini, hangi hakedişin eksik yattığını bir bakışta görür.

Pinti karar verir mi? Hayır. Satıcıya bakmasi gereken yerleri gösterir.

---

## Özellikler

| Modül | Ne Yapar |
|-------|----------|
| **KârPusula** | Ürün bazlı gerçek net kârı, komisyonu, kargoyu, reklam ve iade etkisini hesaplar. |
| **ReklamMerkezi** | Reklam kampanyalarını sadece ROAS'a değil, reklam sonrası gerçek net kâra göre değerlendirir. |
| **İadeKalkan** | Ürün bazlı iade oranlarını, iade kaybını ve risk sinyallerini görünür hale getirir. |
| **Mutabakat** | Satış, hakediş ve banka ödeme kayıtlarını karşılaştırarak açıklanamayan farkları gösterir. |
| **FiyatKoruma** | Ürünlerin minimum sağlıklı fiyatını, hedef net marjını ve fiyat riskini hesaplar. |
| **KampanyaSim** | İndirim, kupon ve ücretsiz kargo kampanyalarının net kâra etkisini simüle eder. |
| **AI Aksiyon Merkezi** | Tüm modüllerden gelen sinyalleri birleştirir ve bugünün ilk 3 önceliğini üretir. |

---

## Teknoloji

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4, Recharts |
| Backend (opsiyonel) | Express 5, Zod, TypeScript, yerel dosya sistemi |
| AI (opsiyonel) | Google Gemini API (yalnızca runtime'da kullanıcı tarafından girilen API key ile) |
| Veri | Çoklu demo şirket dataset'i (JSON), CSV upload simülasyonu |
| Auth | Frontend-only demo auth (localStorage, gerçek şifre saklanmaz) |

---

## Hızlı Başlangıç

### Sadece Frontend (Önerilen)

```bash
npm install
npm run dev
```

Tarayıcıda Vite'in verdiği `localhost` adresi açılır. Uygulama landing page ile başlar; **"Demo hesabıyla başla"** butonu demo giriş akışını açar.

> Demo giriş/kayıt tamamen frontend tarafındadır. Oturum bilgisi `localStorage` içinde tutulur; backend, veritabanı veya ücretli servis kullanılmaz.

### Frontend + Opsiyonel Local API

Backend zorunlu değildir. Frontend tek başına tam demo modunda çalışır. Local API; dataset doğrulama, upload ve analiz çalıştırma gibi işlemleri göstermek içindir.

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm --prefix server install
npm --prefix server run dev
```

Veya her ikisini tek komutla:

```bash
npm run dev:full
```

### Gemini Demo Modu (Opsiyonel)

AI Aksiyon Merkezi, varsayılan olarak kural tabanlı analiz motoru ile çalışır — Gemini **gerekmez**. İsteğe bağlı olarak uygulama arayüzünden geçici API key girilerek Gemini demo modu etkinleştirilebilir.

- API key repoya yazılmaz ve kaynak kodda tutulmaz.
- Gemini kullanılmasa da Pinti çalışmaya devam eder.
- Her Gemini çağrısı kullanıcının kendi kotasını kullanır.

Detay: [`docs/gemini-demo-mode.md`](docs/gemini-demo-mode.md)

---

## Demo Akışı

Hackathon jüri demosu için önerilen sıra:

1. **Landing:** "Satış var, kâr nerede?" mesajı ve ürün konseptini göster.
2. **Veri Merkezi:** Demo hesabıyla giriş yap → Luna, Nova, Pera veya Mira demo şirketlerinden birini seç.
3. **Analiz:** Frontend servisleri aktif dataset üzerinden analizi çalıştırır.
4. **Dashboard:** Genel finansal sağlık özeti ekranı.
5. **Modüller:** KârPusula → ReklamMerkezi → İadeKalkan → Mutabakat → FiyatKoruma → KampanyaSim arasında satıcının hikâyesini anlat.
6. **AI Aksiyon Merkezi:** Pinti tüm sinyalleri birleştirip bugünün ilk 3 önceliğini verir.

> Pinti ciroyu değil, satıştan geriye gerçekten ne kaldığını görünür hale getirir.

---

## MVP Sınırları

Bu proje bir hackathon MVP'sidir. Aşağıdaki sınırlamalar bilinçli tercihlerdir:

- ❌ Gerçek pazaryeri, banka veya reklam API entegrasyonu yok
- ❌ Production backend auth ve veritabanı yok
- ❌ Gerçek kullanıcı hesabı, şifre yönetimi yok
- ❌ Ücretli servis, cloud altyapı yok
- ✅ Çoklu demo şirket dataset'i (Luna, Nova, Pera, Mira)
- ✅ Frontend-only JSON ve CSV upload
- ✅ Frontend-only demo auth
- ✅ Opsiyonel zero-budget local Express API
- ✅ Opsiyonel Gemini demo modu (kullanıcının kendi API key'i ile)
- ✅ Kural tabanlı AI Aksiyon Merkezi
- ✅ Manuel varsayım alanları (demo amaçlı, veriyi kalıcı değiştirmez)

---

## Gelecek Aşamalar

- Gerçek pazaryeri, reklam platformu ve banka veri entegrasyonları
- CSV import ve otomatik veri eşleştirme akışı
- Production veritabanı, auth ve güvenli çoklu workspace yapısı
- Gelişmiş AI özetleme ve aksiyon üretimi
- Modül bazlı uyarı geçmişi ve görev takibi

---

## Proje Yapısı

```text
src/
  api/              # Gemini ve Pinti API istemcileri
  components/
    ai/             # AI Aksiyon Merkezi bileşenleri
    brand/          # Logo, marka bileşenleri
    cards/          # Tekrar kullanılabilir kart bileşenleri
    dashboard/      # Dashboard grafik ve özet bileşenleri
    data/           # Veri yükleme ve seçim bileşenleri
    layout/         # Sayfa düzeni (sidebar, header)
    modules/        # Modül ortak bileşenleri (hero, section)
    ui/             # Genel UI bileşenleri
  context/          # React context (DataWorkspace, DemoAuth)
  data/             # Mock data ve demo dataset'ler
  hooks/            # Özel React hook'lar
  pages/            # Sayfa bileşenleri (Landing, Dashboard, modüller)
  services/         # İş mantığı (KârPusula, ReklamMerkezi, vs.)
  types/            # TypeScript tip tanımları
  utils/            # Yardımcı fonksiyonlar (formatlama vs.)

server/             # Opsiyonel local Express API
  src/
    routes/         # API endpoint'leri
    schemas/        # Zod doğrulama şemaları
    services/       # Backend servis mantığı
    data/           # uploads/ ve analyses/ (runtime, .gitkeep)

Pinti Verisetler/   # Örnek upload dataset'leri (Luna, Nova, CSV)
docs/               # Teknik dokümantasyon
```

---

## Build ve Kontrol Komutları

```bash
npm run build                       # Frontend TypeScript + Vite production build
npm run lint                        # ESLint
npm --prefix server run build       # Backend esbuild bundle
npm --prefix server run typecheck   # Backend TypeScript doğrulama
```

---

## Sorumluluk Notu

Pinti finansal, hukuki, muhasebesel, reklam, yatırım veya fiyatlandırma tavsiyesi vermez. Gösterilen sonuçlar mevcut demo verilerine göre karar destek amacı taşır. Gerçek iş kararları için profesyonel danışmanlık alınmalıdır.

---

## Dokümantasyon

- [Local API Dokümantasyonu](docs/backend-local-api.md)
- [Gemini Demo Modu](docs/gemini-demo-mode.md)

---

## Lisans

Bu proje hackathon değerlendirmesi amacıyla paylaşılmaktadır.
