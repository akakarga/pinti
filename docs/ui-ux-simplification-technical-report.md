# Pinti UX Simplification Technical Report

Tarih: 17 Mayis 2026  
Kapsam: UX simplification ve information architecture pass  
Hedef: Pinti'yi 3 dakikalik juri demosunda daha kolay anlasilan, daha rehberli ve daha az modül-agir bir SaaS deneyimine cekmek.

## 1. Yonetici Ozeti

Bu pass'te Pinti'nin mevcut calisan yapisi korunarak urun deneyimi yeniden hiyerarsilendi. Is mantigi, servis hesaplamalari, veri setleri, route path'leri, analiz calistirma mantigi, manual override mantigi ve AI aksiyon uretimi degistirilmedi.

Ana urun akisi su hale getirildi:

1. Veri sec veya yukle
2. Analizi baslat
3. Ilk 3 aksiyonu gor
4. Gerekirse modul detayina in

Bu akisi desteklemek icin Landing, navigation, Veri Merkezi, Dashboard ve AI Aksiyon Merkezi yeniden sadeleştirildi. Moduller korunmaya devam ediyor, ancak artik ana urun deneyiminin merkezi degil; detay inceleme sayfalari gibi konumlandirildi.

## 2. Degistirilmeyen Alanlar

Aşağıdaki alanlara islevsel degisiklik yapilmadi:

- `src/services/*`
- `src/data/*`
- `src/types/*`
- Hesaplama formulleri
- Demo dataset icerigi ve dataset uretim mantigi
- Dataset secme mantigi
- Analiz baslatma ve analiz tamamlanma mantigi
- Manual override update/reset mantigi
- AI action generation mantigi
- Route path'leri

Not: `quickStartDemo`, `startAnalysis`, `selectDemoDataset`, `calculateWorkspaceResults` ve manual override updater fonksiyonlari mevcut sekilleriyle kullanildi. Yeni is kurali eklenmedi.

## 3. Degisen Dosyalar

| Dosya | Degisiklik tipi | Teknik ozet |
|---|---|---|
| `src/pages/LandingPage.tsx` | Sayfa sadeleştirme | Landing ilk viewport sadeleştirildi, primary CTA Veri Merkezi'ne alindi, hizli demo butonu mevcut `quickStartDemo` ile baglandi. |
| `src/components/layout/Sidebar.tsx` | IA/navigation | Navigation `Ana akış` ve `Analiz Detayları` olarak yeniden siralandi. AI Aksiyon Merkezi ana akisa tasindi. |
| `src/pages/DemoDataPage.tsx` | Baslangic akisi | Veri Merkezi guided start screen haline getirildi. Upload, validation ve preview tablolar collapsed bolgelere tasindi. |
| `src/components/data/DataSourceSelector.tsx` | Secim UI sadeleştirme | Demo sirket kartlari kisaldi: sektor, risk profili, 2 ana modul ve secim butonu gosteriliyor. |
| `src/pages/DashboardPage.tsx` | Dashboard sadeleştirme | Dashboard ilk viewport 5 metrik, ilk 3 aksiyon preview'i ve AI CTA odagina indirildi. Tablolar/grafikler collapsed detaylara tasindi. |
| `src/pages/AIAksiyonPage.tsx` | Final karar ekrani | Ilk viewport top 3 aksiyon kartlarini gosterir hale getirildi. Backlog, modul durumlari ve mesaj taslagi collapsed detaylara alindi. |
| `src/components/data/ManualOverridePanel.tsx` | Progressive disclosure | Manual override paneli tum modullerde varsayilan kapali `Varsayımları düzenle` alanina donusturuldu. |
| `src/components/ui/ModuleHero.tsx` | Copy/density | Modül hero disclaimer'i buyuk uyari kutusundan sakin metne indirildi. |
| `src/components/ui/CollapsibleSection.tsx` | Yeni ortak UI | Ikincil/detay icerikleri kapali bolgelere almak icin reusable `details` tabanli component eklendi. |

## 4. Yeni Ortak Bilesen: CollapsibleSection

Yeni dosya:

`src/components/ui/CollapsibleSection.tsx`

Amaç:

- Sayfaların ilk viewport'unda sadece ana görevleri göstermek.
- Tablolar, uzun açıklamalar, validation detayları, backlog listeleri ve demo rotası gibi ikincil bilgileri kapalı tutmak.
- Yeni dependency eklemeden native `details/summary` davranışıyla progressive disclosure sağlamak.

Teknik özellikler:

- Props:
  - `title`
  - `description`
  - `eyebrow`
  - `defaultOpen`
  - `children`
- Varsayılan olarak kapalı gelir.
- `summary` focus-visible ring ile klavye erişilebilir kalır.
- `ChevronDown` ikonuyla açık/kapalı durum görsel olarak anlaşılır.

Kullanıldığı ana yerler:

- Veri Merkezi: upload, validation, veri önizleme
- Dashboard: grafikler ve tablolar, demo rotası
- AI Aksiyon Merkezi: tüm aksiyon listesi, modül durumları, Pinti yorumu ve mesaj taslağı

## 5. Landing Sadeleştirmesi

Dosya:

`src/pages/LandingPage.tsx`

### Önceki Durum

Landing ilk ekranda daha fazla panel, mock metrik, dashboard preview ve modül anlatımı taşıyordu. Bu, ürünün ana hikayesini güçlü anlatsa da 5 saniyelik ilk kavrama için fazla yoğun kalıyordu.

### Yeni Yapı

İlk viewport artık sadece şu parçaları gösteriyor:

- Headline: `Satış var, kâr nerede?`
- Kısa ürün tanımı
- Primary CTA: `Veri seç ve başla`
- Secondary CTA: `Hızlı demo başlat`
- 3 sinyal preview:
  - `Net kâr baskısı`
  - `ROAS iyi ama kâr zayıf`
  - `Açıklanamayan hakediş farkı`
- Kısa güvenli disclaimer:
  - `Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.`

### CTA Davranışı

Primary CTA:

- Label: `Veri seç ve başla`
- Route: `/app/demo-verisi`

Secondary CTA:

- Label: `Hızlı demo başlat`
- Davranış:
  - mevcut `quickStartDemo()` çağrılır
  - analiz tamamlandıktan sonra `/app/overview` route'una gidilir

Bu yeni özellik değil; zaten var olan context fonksiyonunun Landing'den çağrılmasıdır.

### Modül Kartları

Modül kartları sayfanın altına indirildi ve kompakt hale getirildi. Kartlarda sadece:

- modül adı
- kısa sinyal etiketi
- tek soru

gösteriliyor. Modül açıklamaları ve uzun anlatımlar kaldırılarak Landing'in "modül duvarı" gibi görünmesi azaltıldı.

## 6. Navigation / Information Architecture

Dosya:

`src/components/layout/Sidebar.tsx`

### Önceki Durum

Navigation, modülleri ana ürün deneyimine çok yakın gösteriyordu. Kullanıcı ilk bakışta "hangi modüle girmeliyim?" sorusuyla karşılaşıyordu.

### Yeni Hiyerarşi

Navigation iki gruba ayrıldı:

Ana akış:

- Genel Bakış
- Veri Merkezi
- AI Aksiyon Merkezi

Analiz Detayları:

- KârPusula
- ReklamMerkezi
- İadeKalkan
- Mutabakat
- FiyatKoruma
- KampanyaSim

### Teknik Not

Route path'leri değişmedi. Sadece `navGroups` sıralaması ve grup isimleri değiştirildi.

### Mobil Öncelik

Mobil horizontal nav artık önce ana akışı gösterir. Modüller aynı yatay nav içinde daha sonra gelir. Bu, mobil kullanıcıya önce doğru akışı verir:

`Genel Bakış -> Veri Merkezi -> AI Aksiyon Merkezi -> Modül detayları`

## 7. Veri Merkezi Sadeleştirmesi

Dosya:

`src/pages/DemoDataPage.tsx`

### Yeni Rol

Veri Merkezi artık bir data dump değil, ürünün başlangıç ekranıdır.

Yeni ilk ekran yapısı:

1. Page header
2. Aktif veri durumu
3. Demo şirket seçimi
4. Analizi Başlat
5. Gelişmiş/collapsed detaylar

### Page Header

Başlık:

`Veri Merkezi`

Subtitle:

`Bir demo şirket seç, analizi başlat ve Pinti’nin ilk finansal öncelikleri çıkarmasını izle.`

### Aktif Veri Durumu

İlk viewport'ta dört bilgi gösteriliyor:

- Şirket
- Kaynak
- Analiz durumu
- Son analiz

Bu alan kullanıcıya "neredeyim, hangi veri seçili, analiz çalıştı mı?" sorularının hızlı yanıtını verir.

### Demo Şirket Seçimi

`DataSourceSelector` sadeleştirildi.

Her kart artık sadece şunları gösteriyor:

- şirket adı
- sektör
- ana risk profili
- en güçlü 2 modül
- `Bu şirketi seç` butonu

Uzun açıklama ve fazla bağlam kaldırıldı.

### Ana CTA

`AnalysisControlBar` ana akışın hemen altında tutuldu. `Analizi Başlat` artık Veri Merkezi'nin en güçlü aksiyonu olarak çalışıyor.

### Collapsed Alanlar

Şu alanlar varsayılan olarak kapalı:

- `Gelişmiş: Kendi veri dosyanı yükle`
- `Gelişmiş: Veri doğrulama detayları`
- `Gelişmiş: Veri önizleme`

Taşınan içerikler:

- JSON upload
- CSV upload
- validation detayları
- kayıt sayıları
- ürün/fiyat girdileri tablosu
- sipariş/iade örnekleri tablosu

## 8. Dashboard Sadeleştirmesi

Dosya:

`src/pages/DashboardPage.tsx`

### Önceki Durum

Dashboard; metrikler, story grid, AI insights panel, demo flow, modül shortcuts, grafikler ve tabloları aynı akışta gösteriyordu. Bu, kontrol paneli hissi verse de juri demosunda fazla bilgi yükü yaratıyordu.

### Yeni Rol

Dashboard artık 3 işi yapıyor:

1. Seçilen şirket ve analiz durumunu göstermek
2. Beş ana metriği göstermek
3. Kullanıcıyı AI Aksiyon Merkezi'ne yönlendirmek

### Analiz Tamamlandıktan Sonra İlk Viewport

Görünen parçalar:

- `Pinti kontrol paneli`
- `Bu analiz [Şirket Adı] verisine göre oluşturuldu.`
- CTA: `Tüm öncelikleri gör`
- 5 ana metrik:
  - Toplam satış
  - Gerçek net kâr
  - Reklam sonrası net kâr
  - İade kaybı
  - Hakediş farkı
- `Bugün ilk bakılacak 3 şey` preview
- kompakt modül detay linkleri

### Kaldırılan / Aşağı Alınan Yoğunluk

Şu alanlar ilk viewport'tan çıkarıldı:

- demo story grid
- AI insights büyük paneli
- demo flow
- trend chart
- product risk table
- campaign table
- uzun açıklama blokları

Şu collapsed alanlara taşındı:

- `Detay: Grafikler ve tablolar`
- `Detay: Demo rotası`

### Teknik Not

Dashboard yine `calculateWorkspaceResults(activeDataset)` üzerinden aynı sonuçları okur. Sadece gösterim sırası ve yoğunluğu değişti.

## 9. AI Aksiyon Merkezi Final Ekran Haline Getirildi

Dosya:

`src/pages/AIAksiyonPage.tsx`

### Önceki Durum

AI ekranında hero, sağlık skoru grid'i, top 3 bölüm, full backlog, modül grid'i, yorum ve mesaj taslağı aynı sayfa akışında daha erken görünüyordu.

### Yeni Rol

AI Aksiyon Merkezi artık final karar ekranıdır.

İlk viewport şunlara odaklanır:

- Page title: `Bugün ilk bakılacak 3 şey`
- Kısa açıklama
- Standart disclaimer
- Top 3 action cards

### Top 3 Action Card Yapısı

Her kartta:

- sıra numarası
- modül etiketi
- priority badge
- başlık
- kısa neden
- tahmini etki
- ilgili modüle route butonu

### Sağlık Özeti

Top 3 aksiyondan sonra kompakt sağlık özeti gösteriliyor:

- Pinti sağlık skoru
- Kritik aksiyon
- En riskli modül
- Tahmini etki

`0/100` gibi çok düşük skor açıklaması korunuyor. Hesaplama değişmedi.

### Collapsed Alanlar

Şu alanlar detay seviyesine taşındı:

- `Detay: Tüm aksiyon listesi`
- `Detay: Modül durumları`
- `Detay: Pinti yorumu ve mesaj taslağı`

Bu sayede final ekranı ilk bakışta "neye bakmalıyım?" sorusunu cevaplıyor.

## 10. Modül İlk Ekranları ve Manual Override

Dosya:

`src/components/data/ManualOverridePanel.tsx`

### Önceki Durum

Manual override paneli modül sayfalarında üst kısımda açık görünüyordu. Bu, teknik/demo hissini artırıyor ve kullanıcının modülün ana sonucunu görmeden varsayım formlarıyla karşılaşmasına neden oluyordu.

### Yeni Davranış

Manual override paneli artık varsayılan kapalı:

`Varsayımları düzenle`

Açılınca mevcut kontroller aynı şekilde çalışır.

### Teknik Not

Manual override state ve updater fonksiyonları değişmedi:

- `updateProductOverride`
- `updateCampaignOverride`
- `updateReturnOverride`
- `updateReconciliationOverrides`
- `updateCampaignSimulationOverride`
- `resetManualOverrides`

Sadece UI wrapper `details/summary` yapısına alındı.

### ModuleHero Yoğunluğu

Dosya:

`src/components/ui/ModuleHero.tsx`

Modül hero disclaimer'ı büyük amber panelden sakin bir metne indirildi. Bu, ilk viewport'taki "uyarı kutusu yoğunluğu"nu azaltır. Standart mesaj çizgisi korundu:

`Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.`

## 11. Progressive Disclosure ile Aşağı Taşınan İçerikler

Varsayılan kapalı hale getirilen veya alt seviyeye taşınan içerikler:

- JSON upload
- CSV upload
- validation detayları
- raw data preview tabloları
- ürün/sipariş/iade veri tabloları
- Dashboard trend chart
- Dashboard product risk table
- Dashboard campaign table
- Dashboard demo flow
- AI full action backlog
- AI module status grid
- AI marketplace message preview
- Manual override formları

Bu içerikler kaldırılmadı. Sadece ana ürün akışından ayrılıp "gerektiğinde aç" modeline alındı.

## 12. Test ve Doğrulama

### Build

Komut:

```bash
npm run build
```

Sonuç:

- Başarılı.
- TypeScript build geçti.
- Vite production build tamamlandı.

### Lint

Komut:

```bash
npm run lint
```

Sonuç:

- Başarılı.
- ESLint error yok.

### Playwright Smoke Test

Browser plugin mevcut olmadığı için Playwright fallback kullanıldı. Geçici test ortamı `/tmp/pinti-audit-pw` altındaydı; repo dependency'lerine yeni paket eklenmedi.

Test edilen akış:

1. Landing açılıyor.
2. Landing hero 3 sinyal gösteriyor.
3. `Veri seç ve başla` Veri Merkezi'ne gidiyor.
4. Veri Merkezi başlığı ve guided copy görünüyor.
5. Gelişmiş bölümler varsayılan kapalı.
6. Demo şirket seçilebiliyor.
7. `Analizi Başlat` çalışıyor.
8. Dashboard başlığı görünüyor.
9. Dashboard ilk 3 aksiyon preview'i gösteriyor.
10. Dashboard 5 ana metriği gösteriyor.
11. Dashboard ilk viewport'ta tablo göstermiyor.
12. AI final başlığı görünüyor.
13. AI ilk viewport top 3 aksiyon gösteriyor.
14. AI backlog varsayılan kapalı.
15. Tüm modül sayfaları açılıyor.
16. Manual override tüm modüllerde kapalı.
17. Modül ilk viewport'larında tablo görünmüyor.
18. Mobil Veri Merkezi anlaşılır.
19. Mobil Dashboard anlaşılır.
20. Mobil AI anlaşılır.
21. Console error/warning yok.

Sonuç:

- Smoke test başarılı.
- Console temiz.

## 13. Kabul Kriterleri Durumu

| Kabul kriteri | Durum | Not |
|---|---|---|
| Landing 5 saniyede anlaşılır olmalı | Tamamlandı | İlk viewport slogan, kısa tanım, 2 CTA ve 3 sinyale indirildi. |
| Primary CTA Veri Merkezi'ne gitmeli | Tamamlandı | `/app/demo-verisi`. |
| Hızlı demo mümkünse analiz başlatmalı | Tamamlandı | Mevcut `quickStartDemo()` kullanıldı ve Dashboard'a gidiyor. |
| Navigation ana akış etrafında sıralanmalı | Tamamlandı | Ana akış + Analiz Detayları ayrımı yapıldı. |
| Veri Merkezi başlangıç ekranı olmalı | Tamamlandı | Aktif durum, şirket seçimi ve analiz CTA öne alındı. |
| Upload/validation/tables varsayılan görünmemeli | Tamamlandı | Collapsible detaylara taşındı. |
| Dashboard 5 metrik + top 3 preview odaklı olmalı | Tamamlandı | İlk viewport bu yapıya indirildi. |
| AI final karar ekranı olmalı | Tamamlandı | İlk viewport top 3 action cards. |
| Modüller detay sayfası gibi hissettirmeli | Tamamlandı | Nav ikincil, manual override kapalı, tablolar fold altı. |
| Manual override kapalı gelmeli | Tamamlandı | `Varsayımları düzenle`. |
| Build/lint geçmeli | Tamamlandı | İkisi de başarılı. |
| Smoke test geçmeli | Tamamlandı | Playwright akışı başarılı. |

## 14. Teknik Riskler ve Notlar

### Düşük Riskler

- `details/summary` native browser davranışı kullanıldı. Bu erişilebilirlik açısından iyi bir temel sağlar, ancak görsel varyasyonlar için ileride daha özel bir accordion component düşünülebilir.
- Landing `Hızlı demo başlat` butonu `quickStartDemo()` tamamlandıktan sonra Dashboard'a yönlendirir. Bu mevcut analiz simülasyon süresini korur.
- Dashboard mobilde kullanıcı eğer henüz analiz yapmamışsa `Analiz bekleniyor` state'ini görür. Analiz tamamlandıktan sonra aynı sade dashboard yapısı çalışır.

### Orta Vadeli İyileştirme Fırsatları

- Modül sayfalarında filtre kartları ve detay tabloları daha da ayrıştırılıp her modül için kendi "Detayları aç" yapısına alınabilir.
- `CollapsibleSection` ileride `id`, analytics hook veya controlled open state destekleyebilir.
- AI top 3 action card yapısı ileride shared component'e çıkarılabilir.

## 15. Sonuç

Bu pass sonunda Pinti'nin ana ürün deneyimi daha net ve juri demosuna daha uygun hale geldi. Kullanıcı artık uygulamayı modül listesi olarak değil, tek bir rehberli finansal kontrol akışı olarak okur:

`Veri seç -> Analizi başlat -> İlk 3 aksiyonu gör -> Gerekirse modül detayına in`

Son durum:

- Build: Başarılı
- Lint: Başarılı
- Smoke test: Başarılı
- Console: Error/warning yok
- İş mantığı: Korundu
- Route path'leri: Korundu
- Servis/dataset/type dosyaları: Değiştirilmedi

