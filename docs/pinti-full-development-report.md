# Pinti Geliştirme Raporu

Tarih: 16 Mayıs 2026  
Proje: Pinti  
Durum: Çalışan hackathon MVP, frontend veri çalışma alanı ve demo akışı hazır

## 1. Kısa Özet

Pinti, küçük ve orta ölçekli e-ticaret satıcılarının kâr, reklam, iade,
hakediş, fiyat ve kampanya verilerini tek panelde analiz eden yapay zekâ
destekli finansal kontrol merkezi olarak geliştirildi.

Proje ilk aşamada React + Vite + TypeScript + Tailwind CSS tabanlı bir MVP
iskeleti olarak başladı. Sonrasında her finansal modül tek tek çalışan analiz
ekranına dönüştürüldü. Daha sonra arayüz baştan tasarlanarak premium dark
fintech command center hissine taşındı. Son aşamada ise uygulama statik demo
ekranı olmaktan çıkarıldı; kullanıcı demo şirket seçebilen, JSON/CSV veri
yükleyebilen, analizi başlatabilen ve manuel varsayımlarla yeniden analiz
yapabilen bir frontend çalışma alanına dönüştürüldü.

Ana slogan:

> Satış var, kâr nerede?

Ana ürün cümlesi:

> Pinti; ciroyu değil, satıcının gerçekten cebinde kalan parayı görünür hale
> getirir.

## 2. Ürün Konumlandırması

Pinti'nin odağı, e-ticaret satıcılarının çoğu zaman ayrı ayrı takip ettiği
finansal sinyalleri tek karar destek ekranında birleştirmek oldu.

Çözülen temel problem:

- Satıcı satış yaptığını görür ama gerçek net kârını göremez.
- Reklam tarafında ROAS iyi görünse bile reklam sonrası net kâr zayıf kalabilir.
- İadeler sadece operasyonel sorun gibi görünür ama finansal kayıp üretir.
- Hakediş ve banka ödemesi arasındaki farklar manuel kontrol gerektirir.
- Fiyat, komisyon, kargo, reklam ve iade etkisiyle birlikte değerlendirilmezse
  sağlıklı marj korunamayabilir.
- Kampanya/indirim satış getirse bile aynı toplam kârı korumak için gereken
  satış artışı gerçekçi olmayabilir.

Pinti bu sinyalleri modüllere ayırır ve sonunda AI Aksiyon Merkezi ile "bugün
ilk bakılacak 3 şey" listesine dönüştürür.

## 3. Teknoloji Yığını

Kullanılan ana teknolojiler:

- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- React Router
- Lucide React ikonları
- Mock data
- Frontend-only state/context yapısı
- Rule-based analiz ve aksiyon servisleri

Eklenmeyen veya bilinçli olarak kullanılmayan entegrasyonlar:

- Gerçek backend
- Gerçek Gemini/OpenAI entegrasyonu
- Supabase
- Stripe
- Google Sheets
- Gerçek pazaryeri API entegrasyonu
- Gerçek banka API entegrasyonu
- Gerçek reklam API entegrasyonu

Bu sınırlar bilinçli tutuldu; amaç hackathon MVP'sinde çalışan, güvenilir ve
sunulabilir bir frontend karar destek prototipi üretmekti.

## 4. İlk Kurulum ve Proje İskeleti

İlk aşamada proje React + Vite + TypeScript + Tailwind CSS yapısında kuruldu.
Temiz, genişletilebilir ve modüler bir dosya mimarisi hedeflendi.

Kurulan ana yapı:

```text
src/
  components/
    cards/
    dashboard/
    data/
    layout/
    modules/
    ui/
  context/
  data/
  pages/
  services/
  types/
  utils/
  App.tsx
  main.tsx
  index.css
```

İlk iskelette oluşturulan temel ekranlar:

- Landing page
- App layout
- Sidebar
- Genel dashboard
- KârPusula placeholder
- ReklamMerkezi placeholder
- İadeKalkan placeholder
- Mutabakat placeholder
- FiyatKoruma placeholder
- KampanyaSim placeholder
- AI Aksiyon Merkezi placeholder
- Demo Verisi sayfası

Routing yapısı React Router ile kuruldu:

- `/`
- `/app/overview`
- `/app/kar-pusula`
- `/app/reklam-merkezi`
- `/app/iade-kalkan`
- `/app/mutabakat`
- `/app/fiyat-koruma`
- `/app/kampanya-sim`
- `/app/ai-aksiyon-merkezi`
- `/app/demo-verisi`

## 5. İlk Mock Data Katmanı

MVP'nin gerçek backend olmadan çalışabilmesi için `src/data/mockData.ts`
dosyasında örnek veri katmanı oluşturuldu.

Başlangıç mock data alanları:

- Ürünler
- Kampanyalar
- İadeler
- Hakediş kayıtları
- Banka işlemleri
- Dashboard summary
- AI insight örnekleri

Sonraki modül geliştirmeleri sırasında bu veri yapısı zenginleştirildi ve
aşağıdaki veri grupları da kapsama alındı:

- Siparişler
- Müşteriler
- Payment dispute kayıtları
- Campaign performance kayıtları
- Campaign simulation senaryoları
- Ürün fiyatlandırma alanları

## 6. KârPusula Modülü

KârPusula ilk çalışan finansal modül olarak geliştirildi.

Amaç:

> Ürün gerçekten kâr ettiriyor mu?

Eklenen servis:

```text
src/services/karPusulaService.ts
```

Hesaplanan metrikler:

- Ciro
- Satılan adet
- Ürün maliyeti
- Komisyon maliyeti
- Kargo maliyeti
- Reklam maliyeti
- İade etkisi
- Brüt kâr
- Net kâr
- Net marj
- İade oranı
- Stok
- Ürün sağlık skoru
- Health status
- Önerilen aksiyon
- Açıklama

Öne çıkan fonksiyonlar:

- `calculateProductProfit`
- `calculateAllProductProfits`
- `calculateProductHealthScore`
- `getProductHealthStatus`
- `generateProductRecommendation`

UI tarafında eklenenler:

- Üst başlık ve karar destek uyarısı
- Özet metrik kartları
- Ürün kâr kartları
- Ürün detay tablosu
- Health status filtreleri
- "Pinti yorumu" alanı

Dil standardı:

- Kesin finansal tavsiye dili kullanılmadı.
- "Mevcut verilere göre..." ve "manuel kontrol önerilir" gibi karar destek
  ifadeleri tercih edildi.

## 7. ReklamMerkezi Modülü

ReklamMerkezi, kampanya performansını sadece ROAS ile değil reklam sonrası gerçek
net kâr ile değerlendiren modül olarak geliştirildi.

Amaç:

> Reklam gerçekten kâr getiriyor mu?

Eklenen servis:

```text
src/services/reklamMerkeziService.ts
```

Hesaplanan metrikler:

- Reklam harcaması
- Atfedilen ciro
- Atfedilen sipariş
- ROAS
- Ürün maliyeti
- Komisyon
- Kargo
- İade etkisi
- Reklam sonrası net kâr
- Reklam sonrası net marj
- Kâr bazlı ROAS
- Wasted ad spend sinyali
- Kampanya sağlık skoru
- Önerilen bütçe aksiyonu
- Bütçe kaydırma önerisi

Öne çıkan fonksiyonlar:

- `calculateCampaignProfit`
- `calculateAllCampaignProfits`
- `calculateProfitBasedROAS`
- `calculateCampaignHealthScore`
- `getCampaignHealthStatus`
- `detectWastefulAdSpend`
- `recommendBudgetAction`
- `recommendBudgetShift`

UI tarafında eklenenler:

- Kampanya özet kartları
- Kampanya kâr kartları
- Kampanya detay tablosu
- "ROAS yanıltabilir" alanı
- Bütçe kaydırma paneli
- Health status filtreleri

Ana ürün mesajı:

> Reklam satış getirir. Peki gerçekten kâr getiriyor mu?

## 8. İadeKalkan Modülü

İadeKalkan, iade oranlarını ve iade kaynaklı finansal kaybı görünür hale getiren
risk analizi modülü olarak geliştirildi.

Amaç:

> İadeler kârı nerede eritiyor?

Eklenen servis:

```text
src/services/iadeKalkanService.ts
```

Hesaplanan metrikler:

- Ürün bazlı toplam sipariş
- Ürün bazlı toplam iade
- İade oranı
- Refund tutarı
- İade kargo maliyeti
- Tahmini restocking loss
- Toplam iade kaybı
- Ana iade nedenleri
- İade risk skoru
- Risk seviyesi
- Manuel kontrol önerisi
- İade nedeni insight'ları

Öne çıkan fonksiyonlar:

- `calculateProductReturnAnalysis`
- `calculateAllProductReturnAnalysis`
- `calculateReturnLoss`
- `calculateReturnRate`
- `detectReturnRiskSignals`
- `calculateReturnRiskScore`
- `getReturnRiskLevel`
- `generateReturnRecommendation`
- `analyzeReturnReasons`
- `getManualReviewReturns`

UI tarafında eklenenler:

- Ürün bazlı iade kartları
- Riskli iade kayıtları tablosu
- İade nedenleri analizi
- Manuel kontrol filtreleri
- "Pinti yorumu" alanı

Güvenli dil sınırı:

- Pinti kesin fraud tespiti yapmaz.
- Müşteri suçlayıcı dil kullanılmaz.
- "Risk sinyali" ve "manuel kontrol" dili tercih edilir.

## 9. Mutabakat Modülü

Mutabakat modülü, satış, hakediş ve banka ödeme kayıtlarını karşılaştırarak
beklenen ve gerçekleşen ödeme arasındaki farkları analiz eder.

Amaç:

> Para hesaba doğru yatmış mı?

Eklenen servis:

```text
src/services/mutabakatService.ts
```

Hesaplanan metrikler:

- Brüt satış
- Komisyon kesintisi
- Kargo kesintisi
- İade kesintisi
- Kampanya kesintisi
- Hizmet bedeli
- Beklenen net hakediş
- Gerçekleşen banka ödemesi
- Fark
- Açıklanamayan fark
- Geciken ödeme sinyali
- Risk seviyesi
- Manuel kontrol önerisi

Öne çıkan fonksiyonlar:

- `calculateExpectedSettlement`
- `matchBankTransaction`
- `detectSettlementDifference`
- `classifyDifference`
- `calculateReconciliationRisk`
- `calculateAllReconciliationResults`
- `calculateDeductionSummary`
- `generateMarketplaceMessageDraft`
- `generateReconciliationSummary`

UI tarafında eklenenler:

- Mutabakat özet kartları
- Kesinti analizi paneli
- Mutabakat sonuç tablosu
- Riskli kayıtlar paneli
- Pazaryerine talep metni taslağı
- Filtreler

Güvenli dil sınırı:

- "Pazaryeri yanlış kesmiş" gibi kesin iddialar kullanılmadı.
- "İncelenmesini rica ederiz" tonunda profesyonel talep taslağı üretildi.

## 10. FiyatKoruma Modülü

FiyatKoruma, ürün fiyatlarının hedef net marjı koruyup korumadığını analiz eden
fiyat kontrol modülü olarak geliştirildi.

Amaç:

> Bu fiyatla satış sağlıklı mı?

Eklenen servis:

```text
src/services/fiyatKorumaService.ts
```

Hesaplanan metrikler:

- Mevcut satış fiyatı
- Ürün maliyeti
- Komisyon oranı
- Ortalama kargo maliyeti
- Beklenen reklam etkisi
- Beklenen iade etkisi
- Hedef net marj
- Mevcut net marj
- Minimum sağlıklı fiyat
- Fiyat farkı
- Fiyat risk seviyesi
- Alternatif aksiyon önerileri

Öne çıkan fonksiyonlar:

- `calculateCurrentNetMargin`
- `calculateMinimumHealthyPrice`
- `calculatePriceGap`
- `detectPriceRisk`
- `suggestPriceAlternatives`
- `generatePriceRecommendation`
- `calculateAllPriceProtection`

UI tarafında eklenenler:

- Fiyat özet kartları
- Ürün fiyat kartları
- Fiyat detay tablosu
- Alternatif öneriler paneli
- Risk filtreleri
- "Pinti yorumu" alanı

Ana ürün mesajı:

> Fiyatı rakibe göre değil, cebinde kalana göre belirle.

## 11. KampanyaSim Modülü

KampanyaSim, indirim, kupon, ücretsiz kargo ve bundle gibi kampanya kararlarının
net kâra etkisini simüle eden modül olarak geliştirildi.

Amaç:

> Kampanya yaparsam kâr kalır mı?

Eklenen servis:

```text
src/services/kampanyaSimService.ts
```

Hesaplanan metrikler:

- Mevcut birim net kâr
- Kampanya fiyatı
- Kampanya sonrası birim net kâr
- Mevcut net marj
- Kampanya net marjı
- Birim kâr düşüşü
- Break-even satış adedi
- Gerekli satış artışı
- Beklenen satış artışı
- Ücretsiz kargo etkisi
- Kampanya öncesi toplam kâr
- Kampanya sonrası tahmini toplam kâr
- Risk seviyesi
- Alternatif kampanya önerileri

Öne çıkan fonksiyonlar:

- `calculateCurrentUnitNetProfit`
- `simulateDiscountCampaign`
- `calculateBreakEvenUnits`
- `calculateRequiredSalesLift`
- `calculateFreeShippingImpact`
- `detectCampaignRisk`
- `suggestCampaignAlternatives`
- `generateCampaignSimulationRecommendation`
- `calculateAllCampaignSimulations`

UI tarafında eklenenler:

- Kampanya özet kartları
- Kampanya simülasyon kartları
- Kampanya detay tablosu
- "İndirim yanıltabilir" alanı
- Alternatif öneriler paneli
- Risk filtreleri

## 12. AI Aksiyon Merkezi

AI Aksiyon Merkezi, Pinti'nin tüm modüllerinden gelen sinyalleri birleştiren
merkezi karar ekranı olarak geliştirildi.

Amaç:

> Bugün ilk hangi 3 şeye bakmalıyım?

Eklenen servis:

```text
src/services/aiAksiyonService.ts
```

Toplanan modül sonuçları:

- KârPusula ürün kâr sonuçları
- ReklamMerkezi kampanya kâr sonuçları
- İadeKalkan iade/risk sonuçları
- Mutabakat fark ve ödeme sonuçları
- FiyatKoruma fiyat risk sonuçları
- KampanyaSim kampanya simülasyon sonuçları

Öne çıkan fonksiyonlar:

- `generateProfitActions`
- `generateAdActions`
- `generateReturnActions`
- `generateReconciliationActions`
- `generatePricingActions`
- `generateCampaignSimulationActions`
- `prioritizeUnifiedActions`
- `generateUnifiedHealthSummary`
- `generateModuleSummaries`
- `generateUnifiedAIInsight`

Önceliklendirme mantığı:

- Kritik aksiyonlar en üstte gösterilir.
- Yüksek öncelikli aksiyonlar sonra gelir.
- Tahmini etki tutarı yüksek olan sinyaller öne alınır.
- Manuel kontrol gerektiren kayıtlar daha görünür hale getirilir.
- Aynı modülden çok fazla aksiyon gelirse ilk 2-3 önemli sinyal öne çıkarılır.

UI tarafında eklenenler:

- Genel sağlık özeti
- "Bugün ilk bakılacak 3 şey"
- Tüm aksiyon listesi
- Modül durum kartları
- Pazaryeri mesaj taslağı önizlemesi
- Filtreler
- Final disclaimer

## 13. Final Polish ve Ürün Bütünlüğü

Tüm modüller çalışır hale geldikten sonra Pinti'nin dağınık ekranlar koleksiyonu
gibi görünmemesi için ürün bütünlüğü pass'i yapıldı.

Yapılan iyileştirmeler:

- Landing ürün giriş sayfası gibi yeniden düzenlendi.
- Dashboard demo hikâyesi taşıyan ana kontrol ekranına dönüştürüldü.
- Modül sayfaları aynı ürün ailesine ait olacak şekilde hizalandı.
- "Demo Akışı" bölümü eklendi.
- AI Aksiyon Merkezi final demo sahnesi gibi güçlendirildi.
- Demo Verisi sayfası tablo deposu değil, sistemin nasıl çalıştığını anlatan
  veri haritası ekranına dönüştürüldü.
- README güncellendi.
- `docs/demo-script.md` oluşturuldu.

Tasarım ilkeleri:

- Koyu fintech SaaS görünümü
- Dark navy / near-black zemin
- Emerald/teal vurgu
- Amber ve rose risk renkleri
- Hairline border
- Kontrollü glow
- Kompakt ama okunur kartlar
- Responsive layout
- Horizontal scroll destekli tablolar

## 14. Frontend Redesign

Bir sonraki aşamada mevcut frontend görünümü baştan ele alındı. Amaç, önceki
tasarıma benzeyen basit dashboard hissinden çıkıp daha premium ve ürünleşmiş bir
"dark fintech command center" görünümü elde etmekti.

Korunanlar:

- Route path'leri
- Servis hesaplama mantığı
- Mock data davranışı
- Modüllerin temel işlevleri
- Filtrelerin çalışma mantığı
- AI Aksiyon Merkezi'nin modüllerden veri toplama akışı

Yeniden tasarlananlar:

- Landing kompozisyonu
- App shell
- Sidebar ve mobil nav
- Dashboard layout'u
- Modül hero yapısı
- Metric tile sistemi
- Status badge sistemi
- Insight card yapısı
- Data table shell
- Demo flow bileşeni
- AI Aksiyon Merkezi kompozisyonu
- Demo Verisi/Veri Merkezi görsel yapısı

Yeni UI bileşenleri:

```text
src/components/ui/
  DataTableShell.tsx
  DemoFlow.tsx
  FilterTabs.tsx
  InsightCard.tsx
  MetricTile.tsx
  ModuleHero.tsx
  SectionHeader.tsx
```

Bu redesign turunda servis ve veri hesaplama katmanları bozulmadan sadece sunum
katmanı güçlendirildi.

## 15. Veri Merkezi ve Data Workspace Katmanı

Son büyük geliştirme turunda Pinti statik demo ekranı olmaktan çıkarıldı.
Uygulama artık aktif veri setiyle çalışan bir frontend workspace mantığına sahip.

Eklenen context:

```text
src/context/DataWorkspaceContext.tsx
```

DataWorkspace state alanları:

- `availableDatasets`
- `activeDatasetId`
- `activeDataset`
- `uploadedDataset`
- `uploadedDatasetName`
- `dataSourceType`
- `analysisStatus`
- `lastAnalyzedAt`
- `manualOverrides`
- `analysisRunId`
- `validationResult`

Eklenen aksiyonlar:

- Demo dataset seçme
- JSON dataset yükleme
- Global analiz başlatma
- Hızlı demo başlatma
- Product override güncelleme
- Campaign override güncelleme
- Return override güncelleme
- Reconciliation override güncelleme
- Campaign simulation override güncelleme
- Manual override resetleme

Analiz durumları:

- `idle`
- `ready`
- `running`
- `completed`
- `error`

Yeni kullanıcı akışı:

1. Kullanıcı landing'den demo paneline girer.
2. Dashboard analiz bekleniyor state'i gösterir.
3. Kullanıcı Veri Merkezi'ne gider.
4. Demo şirket seçer veya dosya yükler.
5. "Analizi Başlat" butonuna basar.
6. Modüller aktif dataset üzerinden sonuç üretir.
7. Kullanıcı manuel varsayımları değiştirip yeniden analiz yapabilir.
8. AI Aksiyon Merkezi tüm sonuçları birleştirir.

## 16. Çoklu Demo Şirket Dataset'i

Tek mock data yapısı, çoklu demo şirket veri setlerine genişletildi.

Eklenen dosya:

```text
src/data/demoDatasets.ts
```

Demo şirketler:

### 16.1 Luna Ev & Yaşam

Profil:

- Yüksek ciro
- Kargo ve iade etkisi yüksek
- KârPusula, İadeKalkan ve FiyatKoruma için güçlü demo senaryoları

### 16.2 Nova Aksesuar

Profil:

- Reklam harcaması yoğun
- ROAS yanıltıcı olabilir
- Bazı kampanyalar net kârı baskılar
- ReklamMerkezi ve KampanyaSim için güçlü demo senaryoları

### 16.3 Pera Bebek & Anne

Profil:

- Fiyat riski
- Kupon/kampanya baskısı
- Hedef marj problemi
- FiyatKoruma ve KampanyaSim için güçlü demo senaryoları

### 16.4 Mira Kozmetik

Profil:

- Mutabakat farkı
- Ödeme gecikmesi
- İade ve hakediş kontrolü
- Mutabakat ve İadeKalkan için güçlü demo senaryoları

Her demo şirket şu veri gruplarını içerir:

- Ürünler
- Siparişler
- İadeler
- Müşteriler
- Payment dispute kayıtları
- Kampanyalar
- Campaign performance
- Hakedişler
- Banka işlemleri
- Kampanya simülasyon senaryoları

## 17. Dosya Yükleme Akışı

Veri Merkezi içinde frontend-only upload akışı kuruldu.

Eklenen bileşen:

```text
src/components/data/FileUploadPanel.tsx
```

Desteklenen upload türleri:

### 17.1 JSON Dataset Upload

Tek dosyada tüm dataset yüklenebilir.

Beklenen ana alanlar:

- `companyProfile`
- `products`
- `orders`
- `returns`
- `customers`
- `paymentDisputes`
- `campaigns`
- `campaignPerformance`
- `settlements`
- `bankTransactions`
- `campaignSimulationScenarios`

Upload sonrası:

- JSON parse edilir.
- Dataset normalize edilir.
- Validation çalışır.
- Hata yoksa aktif dataset olarak atanır.
- Analiz durumu yeniden analiz gerektirecek şekilde güncellenir.

### 17.2 CSV Upload Simülasyonu

Ayrı CSV dosyaları desteklenir:

- `products.csv`
- `orders.csv`
- `returns.csv`
- `campaigns.csv`
- `settlements.csv`
- `bankTransactions.csv`

CSV parser:

```text
src/utils/csvParser.ts
```

Özellikler:

- Header row okur.
- Virgül ayrımı yapar.
- Quoted comma destekler.
- Escaped quote destekler.
- CRLF/LF satır sonlarını destekler.
- Boolean ve number parse eder.
- Header/satır uyumsuzluğu için uyarı üretir.
- Duplicate header uyarısı üretir.

Yeni dependency eklenmedi. Parser frontend içinde basit ama demo için daha
dayanıklı hale getirildi.

## 18. Veri Doğrulama

Eklenen dosya:

```text
src/utils/dataValidation.ts
```

Validation kontrol alanları:

- Ürün var mı?
- Sipariş var mı?
- Ürünlerde temel alanlar var mı?
- Siparişlerde temel alanlar var mı?
- `order.productId` ürünlerde var mı?
- `return.orderId` siparişlerde var mı?
- `return.productId` ürünlerde var mı?
- `settlement.orderId` siparişlerde var mı?
- `bankTransaction.relatedSettlementId` hakedişlerde var mı?
- Kampanya ürün ilişkileri geçerli mi?
- Kampanya simülasyon productId alanları geçerli mi?

Eklenen bileşen:

```text
src/components/data/DataValidationPanel.tsx
```

Panelde gösterilenler:

- Ürün sayısı
- Sipariş sayısı
- İade sayısı
- Müşteri sayısı
- Kampanya sayısı
- Reklam performans sayısı
- Hakediş sayısı
- Banka işlemi sayısı
- Simülasyon sayısı
- Ödeme itirazı sayısı
- Hatalar
- Uyarılar

## 19. Analiz Başlatma Akışı

Eklenen bileşen:

```text
src/components/data/AnalysisControlBar.tsx
```

Analiz davranışı:

- Veri yoksa analiz butonları disabled kalır.
- Veri seçili ama analiz yoksa "Analizi Başlat" görünür.
- Butona basılınca frontend içinde kısa running state oluşur.
- 500-900ms aralığında simüle analiz tamamlanır.
- `lastAnalyzedAt` güncellenir.
- `analysisRunId` artar.
- Dashboard ve modüller aktif dataset sonuçlarını gösterir.

Dashboard artık ilk girişte hazır sonuç yığmaz. Bunun yerine:

- Seçili demo şirketi gösterir.
- Analiz bekleniyor state'i gösterir.
- Veri Merkezi CTA'sı sunar.
- "Hızlı demo başlat" seçeneği sunar.

## 20. Manual Override Katmanı

Pinti'yi daha gerçek ürün hissine taşımak için manuel varsayım alanları eklendi.

Eklenen bileşen:

```text
src/components/data/ManualOverridePanel.tsx
```

Manual override mantığı:

- Aktif dataset doğrudan kalıcı olarak bozulmaz.
- Override değerleri context içinde tutulur.
- Derived active dataset bu override'larla hesaplanır.
- Değer değişince analiz durumu yeniden analiz gerektirecek hale gelir.

Modül bazlı manuel alanlar:

### 20.1 KârPusula

- Ürün seçimi
- Ürün maliyeti
- Komisyon oranı
- Ortalama kargo maliyeti
- Beklenen reklam etkisi

### 20.2 ReklamMerkezi

- Kampanya seçimi
- Reklam harcaması
- Atfedilen ciro
- Atfedilen sipariş

### 20.3 İadeKalkan

- İade kaydı seçimi
- Restockable true/false
- Risk seviyesi
- Manuel kontrol işareti

### 20.4 Mutabakat

- Tolerans tutarı
- Gecikme günü eşiği

Not: Bu alanlar UI/demo varsayımıdır; mevcut mutabakat servis formülleri
bozulmadı.

### 20.5 FiyatKoruma

- Hedef net marj
- Beklenen reklam etkisi
- Beklenen iade etkisi
- Ortalama kargo

### 20.6 KampanyaSim

- İndirim oranı
- Kupon tutarı
- Ücretsiz kargo açık/kapalı
- Beklenen satış artışı

## 21. Workspace Analysis Orkestrasyonu

Eklenen dosya:

```text
src/utils/workspaceAnalysis.ts
```

Bu katman mevcut servisleri değiştirmeden aktif dataset üzerinden sonuç üretir.

Çağırdığı servisler:

- `calculateAllProductProfits`
- `calculateAllCampaignProfits`
- `calculateAllProductReturnAnalysis`
- `calculateReturnRiskResults`
- `calculateAllReconciliationResults`
- `calculateDeductionSummary`
- `generateReconciliationSummary`
- `calculateAllPriceProtection`
- `calculateAllCampaignSimulations`
- `generateUnifiedAIInsight`

Bu sayede:

- Dashboard aktif dataset'e göre güncellenir.
- Modüller aktif dataset'e göre hesaplama yapar.
- AI Aksiyon Merkezi tüm aktif sonuçları birleştirir.
- Servis formülleri korunur.

## 22. Sayfa Sayfa Son Durum

### 22.1 Landing

Landing artık ürünün giriş kapısı gibi çalışır.

Gösterilenler:

- Ana slogan
- Ürün tanımı
- Demo Paneli Aç CTA
- Veri Akışını Gör CTA
- 3 adımda çalışma akışı
- Modül haritası
- AI Aksiyon Merkezi önizlemesi
- Güvenli MVP notu

### 22.2 Dashboard

Dashboard aktif dataset ve analiz durumuna duyarlı hale getirildi.

Durumlar:

- Veri/analiz bekleniyor
- Analiz çalışıyor
- Analiz tamamlandı

Analiz tamamlandığında:

- Finansal snapshot
- Pinti'nin gözüne takılanlar
- Demo flow
- Modül hızlı erişim
- Aktif dataset özetleri gösterilir.

### 22.3 Veri Merkezi

Eski Demo Verisi ekranı Veri Merkezi'ne dönüştürüldü.

Gösterilenler:

- Aktif veri kaynağı
- Demo şirket seçici
- JSON upload
- CSV upload simülasyonu
- Veri doğrulama paneli
- Veri sayıları
- Ürün/fiyat girdileri tablosu
- Sipariş/iade örnekleri tablosu

Route aynı kaldı:

```text
/app/demo-verisi
```

Sidebar etiketi değişti:

```text
Demo Verisi -> Veri Merkezi
```

### 22.4 KârPusula

Artık sadece statik mock data değil, aktif dataset üzerinden hesaplama yapar.

Eklenenler:

- Analiz kontrol barı
- Modül analiz/yeni analiz butonu
- Manual override paneli
- Analiz yapılmadan sonuç göstermeme state'i

### 22.5 ReklamMerkezi

Aktif dataset kampanyalarını analiz eder.

Eklenenler:

- Analiz kontrol barı
- Reklam varsayımı paneli
- Yeniden analiz state'i

### 22.6 İadeKalkan

Aktif dataset iade ve müşteri/dispute verilerini kullanır.

Eklenenler:

- Analiz kontrol barı
- İade varsayımı paneli
- Manual review override

### 22.7 Mutabakat

Aktif dataset hakediş ve banka hareketlerini kullanır.

Eklenenler:

- Analiz kontrol barı
- Tolerans/gecikme varsayım paneli
- Aktif dataset üzerinden pazaryeri mesaj taslağı

### 22.8 FiyatKoruma

Aktif dataset ürünlerini ve manual fiyat varsayımlarını kullanır.

Eklenenler:

- Hedef net marj override
- Reklam/iade/kargo etki override
- Yeniden analiz akışı

### 22.9 KampanyaSim

Aktif dataset kampanya simülasyon senaryolarını kullanır.

Eklenenler:

- İndirim oranı override
- Kupon tutarı override
- Ücretsiz kargo override
- Beklenen satış artışı override

### 22.10 AI Aksiyon Merkezi

Aktif dataset sonuçlarını birleştiren final karar ekranı olarak çalışır.

Eklenenler:

- Aktif şirket adı
- Analiz yapılmadıysa empty state
- Dataset değiştiğinde yeniden analiz ihtiyacı
- Aktif dataset üzerinden top 3 aksiyon
- Aktif dataset üzerinden modül durum kartları

## 23. Dokümantasyon

Güncellenen dosya:

```text
README.md
```

README içinde netleştirilenler:

- Kısa tanım
- Ana problem
- Çözüm
- Modüller
- Teknoloji
- Nasıl çalıştırılır
- Demo akışı
- MVP sınırları
- Güvenlik/sorumluluk notu
- Sonraki aşamalar

Oluşturulan demo script:

```text
docs/demo-script.md
```

İçerik:

- 30 saniyelik anlatım
- 60 saniyelik anlatım
- 3 dakikalık demo akışı
- Problem / çözüm / teknoloji / etki anlatımı
- Kapanış cümlesi

Bu dosya:

```text
docs/pinti-full-development-report.md
```

Projenin baştan sona yapılan tüm geliştirme sürecini özetleyen kapsamlı rapor
olarak oluşturuldu.

## 24. Kalite ve Test Süreci

Her büyük geliştirme turundan sonra build, lint ve browser smoke test
çalıştırıldı.

Son doğrulama sonuçları:

```text
npm run build -> başarılı
npm run lint  -> başarılı
```

Son browser smoke test kapsamında doğrulananlar:

- Landing açılıyor.
- Demo Paneli Aç butonu dashboard'a götürüyor.
- Dashboard analiz bekleniyor state'i gösteriyor.
- Veri Merkezi açılıyor.
- Demo şirket seçilebiliyor.
- Analizi Başlat butonu çalışıyor.
- Analiz sonrası Dashboard metrikleri görünüyor.
- KârPusula modülü açılıyor ve yeniden analiz çalışıyor.
- ReklamMerkezi modülü açılıyor ve yeniden analiz çalışıyor.
- İadeKalkan modülü açılıyor ve yeniden analiz çalışıyor.
- Mutabakat modülü açılıyor ve yeniden analiz çalışıyor.
- FiyatKoruma manuel hedef marj değişikliği çalışıyor.
- KampanyaSim indirim oranı değişikliği çalışıyor.
- AI Aksiyon Merkezi analiz sonrası veri gösteriyor.
- JSON dataset upload çalışıyor.
- Geçersiz JSON upload validation uyarısı gösteriyor.
- CSV upload simülasyonu çalışıyor.
- Quoted comma ve escaped quote içeren CSV alanları korunuyor.
- Desktop ve mobil görünümde yatay taşma kontrol edildi.
- Console error/warning bulunmadı.

Mobilde tespit edilip düzeltilen konu:

- Veri Merkezi'ndeki geniş tablo panelleri grid içinde sayfayı yatayda büyütüyordu.
- `pinti-panel` ve `pinti-panel-quiet` için `min-width: 0` eklenerek mobil
  overflow düzeltildi.

## 25. Güvenli Dil ve Sorumluluk Sınırları

Tüm modüllerde karar destek dili kullanıldı.

Kullanılan doğru dil örnekleri:

- "Mevcut verilere göre..."
- "Kontrol edilebilir..."
- "Manuel inceleme önerilir..."
- "Karar desteği sunar..."
- "Bu sinyal öne çıkıyor..."
- "Yeniden değerlendirilebilir..."

Bilinçli olarak kaçınılan ifadeler:

- "Kesin zarar ettiriyor."
- "Bu kampanyayı kapat."
- "Pazaryeri yanlış kesmiş."
- "Bu müşteri dolandırıcı."
- "Bu fiyatı kesin yap."
- "Garanti kâr sağlar."

Ana disclaimer:

> Pinti finansal, hukuki, muhasebesel, reklam, yatırım veya fiyatlandırma
> tavsiyesi vermez. Gösterilen sonuçlar mevcut verilere göre karar destek amacı
> taşır.

## 26. En Önemli Teknik Kararlar

### 26.1 Servisleri Korumak

Hesaplama servislerinin formülleri ve temel davranışı korunarak yeni workspace
katmanı üstten eklendi. Bu sayede ürün akışı gelişti ama finansal hesaplama
mantığı bozulmadı.

### 26.2 Context Tabanlı Aktif Dataset

Tüm uygulama aktif veri setini `DataWorkspaceContext` üzerinden okumaya başladı.
Bu karar, demo şirket seçimi, upload ve manual override akışlarını merkezi hale
getirdi.

### 26.3 Frontend-only Simülasyon

Backend eklenmeden gerçek ürün hissi vermek için analiz başlatma, upload,
validation ve manual override akışları frontend içinde simüle edildi.

### 26.4 Güvenli Ürün Dili

Pinti'nin ciddi finansal karar destek ürünü gibi görünmesi için kesin hüküm,
suçlayıcı ifade ve garanti dili kullanılmadı.

### 26.5 Premium SaaS Görsel Dil

Son redesign ile ürün, hackathon mockup hissinden çıkarılıp daha bütünlüklü ve
sunuma hazır bir SaaS arayüzüne taşındı.

## 27. Mevcut Son Durum

Pinti şu anda:

- Çalışan React + Vite + TypeScript uygulamasıdır.
- Tüm ana modülleri çalışan demo modülüdür.
- Çoklu demo şirket destekler.
- JSON dataset upload destekler.
- CSV upload simülasyonu destekler.
- Analiz başlatma akışı içerir.
- Modül bazlı yeniden analiz akışı içerir.
- Manual varsayım panelleri içerir.
- AI Aksiyon Merkezi ile tüm modül sinyallerini birleştirir.
- Landing, Dashboard, Veri Merkezi ve modül akışı jüri demosuna hazırdır.
- Build ve lint kontrolünden geçmektedir.
- Desktop ve mobil smoke testlerinden geçmiştir.

## 28. Kalan Bilinçli Sınırlar

Bu MVP'de hâlâ bilinçli olarak yapılmayanlar:

- Gerçek kullanıcı hesabı yok.
- Gerçek backend yok.
- Veriler kalıcı veritabanına yazılmıyor.
- Gerçek Gemini/OpenAI entegrasyonu yok.
- Gerçek pazaryeri API entegrasyonu yok.
- Gerçek reklam API entegrasyonu yok.
- Gerçek banka API entegrasyonu yok.
- CSV import demo seviyesindedir; üretim ortamında daha kapsamlı schema mapping
  ve robust parser gerekir.
- Manual override değerleri demo amaçlıdır; kalıcı veri yönetimi yapılmaz.

## 29. Sonraki Aşamalar İçin Öneriler

Hackathon sonrasında ürünleşme için önerilen sıra:

1. Gerçek CSV import schema mapping ekranı
2. Kullanıcı ve workspace modeli
3. Backend API
4. Kalıcı veritabanı
5. Pazaryeri sipariş/hakediş entegrasyonu
6. Reklam platformu entegrasyonu
7. Banka hareketi import/entegrasyonu
8. Gerçek AI özetleme ve aksiyon üretimi
9. Aksiyon görev takibi
10. Uyarı geçmişi ve periyodik raporlama
11. Yetkilendirme ve veri güvenliği katmanı
12. Üretim ortamı monitoring ve error tracking

## 30. Demo İçin Kısa Anlatım

30 saniyelik anlatım:

> Pinti, küçük e-ticaret satıcılarının satıştan gerçekten ne kadar kazandığını
> anlamasını sağlayan finansal kontrol merkezidir. Satıcılar çoğu zaman ciroyu
> görür; ancak komisyon, kargo, reklam, iade, kampanya ve hakediş farkları
> sonrası gerçek kâr değişir. Pinti bu verileri tek panelde analiz eder ve
> satıcıya öncelikli kontrol alanlarını gösterir.

3 dakikalık demo akışı:

1. Landing'de "Satış var, kâr nerede?" mesajı gösterilir.
2. Dashboard'da analiz bekleniyor state'i anlatılır.
3. Veri Merkezi'nde demo şirket seçilir.
4. Analizi Başlat butonuna basılır.
5. Dashboard'da finansal sağlık özeti gösterilir.
6. KârPusula'da ürün bazlı net kâr gösterilir.
7. ReklamMerkezi'nde ROAS/net kâr farkı gösterilir.
8. İadeKalkan'da iade kaybı ve manuel kontrol gösterilir.
9. Mutabakat'ta açıklanamayan fark gösterilir.
10. FiyatKoruma veya KampanyaSim'de manuel varsayım değiştirilir.
11. AI Aksiyon Merkezi'nde "bugün ilk bakılacak 3 şey" ile demo tamamlanır.

Kapanış cümlesi:

> Pinti, e-ticaret satıcısının satıştan sonra cebinde gerçekten ne kaldığını
> görünür hale getirir ve hangi finansal sinyale önce bakması gerektiğini
> gösterir.

