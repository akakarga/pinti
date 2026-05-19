# Pinti UI/UX Audit Report

Tarih: 16 Mayis 2026  
Audit rolu: Frontend QA lead, UI/UX auditor, product designer, design systems reviewer, accessibility reviewer, hackathon jury advisor  
Test URL: `http://127.0.0.1:5175/`  
Browser yolu: Browser plugin yoktu, Playwright Chromium gecici `/tmp/pinti-audit-pw` kurulumu ile kullanildi.  
Kapsam: Landing, Dashboard, Veri Merkezi, tum analiz modulleri, AI Aksiyon Merkezi, upload/validation, manual override, desktop ve mobil responsive kontrol.

## 1. Yonetici Ozeti

Pinti, mevcut haliyle hackathon jurisine gosterilebilecek seviyede calisan ve urun hikayesi net olan bir frontend MVP. Ana deger onerisi, "Satis var, kar nerede?", landing ve dashboard seviyesinde hizli anlasiliyor. Dark fintech command center hissi genel olarak basarili: renk sistemi tutarli, moduller ayni tasarim ailesinden geliyor, veri akisi frontend-only MVP sinirlarini saklamadan anlatiyor.

En buyuk riskler kod mantiginda degil, sunum kalitesinde. SPA route gecislerinde scroll pozisyonu sifirlanmadigi icin desktop ve ozellikle mobilde yeni sayfa ortadan acilabiliyor. Mobilde sticky nav bu durumda icerigi kapatiyor. Ikinci buyuk risk, global `a { color: inherit; }` kuralinin link uzerindeki Tailwind text color siniflarini etkisiz birakmasi. Bu yuzden emerald arka planli anchor CTA'larda metin beyaz kaliyor ve kontrast dusuyor.

Critical issue bulunmadi. High priority seviyesinde 3 konu var: CTA kontrasti, SPA scroll restoration, keyboard-accessible olmayan yatay tablo bolgeleri. Bunlar kucuk ve dusuk riskli frontend polish fixleriyle cozulebilir.

## 2. Genel Puan Tablosu

| Kriter | Puan | Kisa gerekce | En buyuk sorun | En hizli duzeltme |
|---|---:|---|---|---|
| Ilk izlenim | 8.5/10 | Premium dark fintech algisi guclu, ilk viewport markayi ve problemi tasiyor. | Emerald CTA link kontrasti dusuk. | Global anchor color override'i kaldir veya link CTA'lara daha spesifik renk ver. |
| Urun anlasilabilirligi | 9/10 | Slogan, urun cumlesi ve modul sorulari net. | Bazi teknik terimler urun diline kaciyor. | "dataset/upload/manualOverrides" metinlerini kullanici diline cevir. |
| Gorsel kalite | 8/10 | Panel, border, glow ve icon dili tutarli. | Bazi ekranlar fazla kart/panel tekrarina giriyor. | Ana karar panellerinde kart yogunlugunu azalt, onem sirasi yarat. |
| Tasarim tutarliligi | 8.5/10 | Sidebar, module hero, metric card, table shell ayni aileden. | Anchor CTA renkleri sistemden kopuyor. | Link/button CTA tokenlarini standartlastir. |
| Simetri, hizalama, spacing | 8/10 | Desktop gridler genel olarak dengeli. | SPA gecislerinde scroll ortada kalinca sayfa kompozisyonu bozuluyor. | Route degisiminde `scrollTo(0, 0)` uygulayan component ekle. |
| Kullanici akisi | 8.5/10 | Landing -> Dashboard -> Veri Merkezi -> Analiz -> Moduller -> AI akisi anlasilir. | Kullanici sayfa degistirince yeni ekran ustten baslamayabiliyor. | Scroll restoration fix. |
| Veri yukleme akisi | 8/10 | Demo sirket secimi, JSON hatasi ve CSV satir sayisi anlasilir. | JSON/CSV alanlari biraz teknik ve demo hissini acik ediyor. | Basliklari "JSON veri yukleme", "CSV dosyalari" gibi yerlilestir. |
| Modul anlasilabilirligi | 8.5/10 | Her modul kendi sorusunu iyi cevapliyor. | Manual override paneli bazi modullerde sonuc hikayesinin onune gecebilir. | Override panelini collapsed veya "varsayimlari duzenle" sekmesine al. |
| AI Aksiyon Merkezi etkisi | 8/10 | Top 3 aksiyon, oncelik ve etki mantigi guclu. | 0/100 saglik skoru aciklama olmadan "bozuk" algisi yaratabilir. | Skor altina net durum cumlesi ve neden ozeti ekle. |
| Mobil deneyim | 7/10 | Sayfa genisligi tasmiyor, tablolar container icinde. | Sticky nav + korunmus scroll pozisyonu mobilde icerigi kapatiyor. | Scroll restoration ve mobil nav yuksekligi icin offset kontrolu. |
| Erisilebilirlik | 7/10 | Semantik buton/link kullanimi iyi, focus temel olarak var, isimsiz control bulunmadi. | Axe ciddi kontrast ve scrollable-region-focusable uyarilari verdi. | CTA kontrasti, `tabIndex=0` + `aria-label` tablo scrollerlari. |
| Juri demo uygunlugu | 8.5/10 | 3 dakikalik hikaye cok guclu, calisan state akisi var. | Mobil veya scroll bug'i demoda kalite algisini dusurebilir. | Demo oncesi high priority 3 fix uygulanmali. |

## 3. En Guclu Taraflar

1. Urun hikayesi cok net: satis, kar, reklam, iade, hak edis, fiyat ve kampanya tek finansal kontrol hikayesine baglaniyor.
2. Moduller tek tek iyi konumlanmis: her modul bir soru soruyor ve sonuc ekranlari bu soruya hizmet ediyor.
3. Veri Merkezi urunlesme hissini artirmis: demo sirket, JSON, CSV, validation ve analiz baslatma akisi MVP'yi statik mockup olmaktan cikariyor.
4. AI Aksiyon Merkezi final ekran olarak iyi calisiyor: "Bugun ilk bakilacak 3 sey" juri anlatimi icin guclu.
5. Build, lint ve browser smoke test temiz: console error/warning bulunmadi, route ve temel interactionlar calisti.

## 4. Kritik / High Priority Sorunlar

### Issue ID: PINTI-AUD-001

Baslik: Emerald anchor CTA metinleri beyaz kaliyor, kontrast dusuyor  
Severity: High  
Sayfa: Landing, Dashboard, link tabanli primary CTA'lar  
Viewport: Desktop ve mobile  
Aciklama: Axe, emerald arka planli link CTA'larda foreground `#ffffff`, background `#5ee9b5`, contrast `1.52:1` olctu. Linklerde `text-slate-950` class'i var ama `src/index.css` icindeki global `a { color: inherit; }` kuralinin unlayered CSS olarak Tailwind utility renklerini ezdigi goruldu.  
Neden onemli: Primary CTA, urunun en onemli aksiyonudur. Dusuk kontrast hem WCAG AA'yi kacirir hem de profesyonel kalite algisini dusurur.  
Onerilen cozum: `src/index.css` icindeki `a { color: inherit; }` kuralini kaldir veya sadece reset ihtiyaci icin Tailwind layer icine alin. Alternatif olarak primary link CTA'lara component-level daha spesifik class veya CSS token ver.  
Tahmini dosyalar: `src/index.css`, `src/pages/LandingPage.tsx`, `src/pages/DashboardPage.tsx`  
Risk: Dusuk. Gorsel renk davranisi linklerde degisecegi icin tum link CTA'lar hizli smoke test edilmeli.  
Oncelik: 1

### Issue ID: PINTI-AUD-002

Baslik: SPA route gecislerinde scroll pozisyonu sifirlanmiyor  
Severity: High  
Sayfa: Tum app route'lari  
Viewport: Ozellikle mobile, desktop'ta da goruldu  
Aciklama: Veri Merkezi'nde asagi scroll ettikten sonra Genel Bakis'a gecilince desktop'ta scroll `850 -> 388`, mobilde `850 -> 850` kaldi. Mobil screenshotlarda sticky nav yeni sayfanin icerigini kapatiyor.  
Neden onemli: Juri veya kullanici moduller arasi gezerken yeni sayfa ustten baslamazsa sayfa "yarim acildi" veya "bozuk" hissi verir. Mobilde bu durum daha sert, cunku nav icerigin ustune biniyor.  
Onerilen cozum: React Router location degisiminde `window.scrollTo({ top: 0, left: 0 })` calistiran kucuk `ScrollToTop` component'i ekle. Reduced motion icin `behavior: 'auto'` yeterli.  
Tahmini dosyalar: `src/App.tsx` veya yeni `src/components/layout/ScrollToTop.tsx`  
Risk: Dusuk. Sadece navigation davranisini etkiler.  
Oncelik: 2

### Issue ID: PINTI-AUD-003

Baslik: Yatay scroll tablolar keyboard ile focus alamiyor  
Severity: High  
Sayfa: Veri Merkezi, Dashboard mobile, tablo kullanan moduller  
Viewport: Desktop ve mobile  
Aciklama: Axe `scrollable-region-focusable` uyarisi verdi. `overflow-x-auto` tablo wrapper'lari keyboard kullanicisi icin focusable degil.  
Neden onemli: Mobil ve dar viewportlarda tablo verisinin bir kismi yatay scroll arkasinda. Klavye veya assistive tech kullanan kullanici bu bolgeyi rahat kesfedemeyebilir.  
Onerilen cozum: Tablo scroller wrapper'larina `tabIndex={0}`, acik `aria-label`, `focus-visible` ring ve gerekirse sag/sol gradient scroll cue ekle. Ortak `DataTableShell` kullanilan yerlerde fix merkezi olabilir; sayfa icindeki inline tablolar da kapsanmali.  
Tahmini dosyalar: `src/components/ui/DataTableShell.tsx`, `src/pages/DemoDataPage.tsx`, tablo section'lari olan modul sayfalari  
Risk: Dusuk-orta. Focus stilleri ve tab order kontrol edilmeli.  
Oncelik: 3

## 5. Medium / Low Priority Sorunlar

### Issue ID: PINTI-AUD-004

Baslik: Teknik urun dili kullanici diline karisiyor  
Severity: Medium  
Sayfa: Veri Merkezi, Manual Override panelleri  
Viewport: Tum viewportlar  
Aciklama: "JSON dataset upload", "CSV upload simulasyonu", "manualOverrides" gibi terimler teknik olarak dogru ama juri disi son kullanici icin fazla developer odakli.  
Neden onemli: Urun finansal kontrol merkezi gibi konumlanirken teknik copy guven hissini hafif dusuruyor.  
Onerilen cozum: "JSON veri yukleme", "CSV dosyalari", "Manuel varsayimlar gecici olarak uygulanir" gibi daha dogal Turkceye cek.  
Tahmini dosyalar: `src/components/data/FileUploadPanel.tsx`, `src/components/data/ManualOverridePanel.tsx`, `src/pages/DemoDataPage.tsx`  
Risk: Dusuk  
Oncelik: 4

### Issue ID: PINTI-AUD-005

Baslik: Mobil nav discoverability sinirli  
Severity: Medium  
Sayfa: Tum app sayfalari  
Viewport: 390x844, 360x740  
Aciklama: Mobil nav yatay scroll ile calisiyor ve sayfa genisligi tasmiyor. Ancak sadece ilk iki nav item tam gorunuyor, sonraki item ikon gibi kirpilmis gorunebiliyor. "Kaydir" ipucu var ama final ekranin nerede oldugu yeterince guclu degil.  
Neden onemli: 3 dakikalik demo mobilde yapilirsa AI Aksiyon Merkezi gibi kritik route kesfedilmekte zorlanabilir.  
Onerilen cozum: Mobilde ilk iki item yerine compact segmented nav + "Diger moduller" menu veya AI Aksiyon Merkezi icin sabit kisa yol ekle. Daha kucuk fix olarak nav sonunda gradient fade ve daha belirgin scroll hint kullan.  
Tahmini dosyalar: `src/components/layout/Sidebar.tsx`  
Risk: Orta. Nav davranisi etkilenir.  
Oncelik: 5

### Issue ID: PINTI-AUD-006

Baslik: Dusuk kontrastli meta label renkleri var  
Severity: Medium  
Sayfa: Landing preview kartlari ve bazi tablo/meta label'lar  
Viewport: Tum viewportlar  
Aciklama: Axe landing'de `text-slate-500` meta label'larda `3.83:1` kontrast olctu. Kucuk uppercase metinlerde bu daha zor okunuyor.  
Neden onemli: Finansal dashboardlarda meta label'lar veri anlamini tasir. Kucuk ve soluk label, hizli taramayi zayiflatir.  
Onerilen cozum: Kritik label'larda `text-slate-400` veya token bazli daha yuksek kontrast kullan. En soluk rengi sadece dekoratif veya ikincil metinde birak.  
Tahmini dosyalar: `src/pages/LandingPage.tsx`, `src/index.css`, paylasilan card/table componentleri  
Risk: Dusuk  
Oncelik: 6

### Issue ID: PINTI-AUD-007

Baslik: AI saglik skoru 0/100 aciklama olmadan bozuk algisi yaratabilir  
Severity: Medium  
Sayfa: AI Aksiyon Merkezi, Dashboard dataset varyantlari  
Viewport: Tum viewportlar  
Aciklama: Pera dataset'i sonrasi AI Aksiyon Merkezi'nde `0/100` gorulebiliyor. Bu finansal sinyallerin sonucu olabilir, ancak juri ekraninda aciklama yoksa "hesaplama patladi" algisi dogabilir.  
Neden onemli: Final ekran guven vermeli. Sifir skor dramatik ama nedenleri acik degilse urun etkisi yerine hata hissi verir.  
Onerilen cozum: Skor kartina "Kritik sinyal yogunlugu nedeniyle skor sifira indi" gibi kisa neden, veya skor bandi/etiketi ekle.  
Tahmini dosyalar: `src/pages/AIAksiyonPage.tsx`, gerekirse `src/utils/workspaceAnalysis.ts` sadece display aciklamasi icin  
Risk: Dusuk, hesaplama mantigina dokunmadan copy/display cozulmeli.  
Oncelik: 7

### Issue ID: PINTI-AUD-008

Baslik: Kart ve panel radius/density biraz fazla yumusak  
Severity: Low  
Sayfa: Tum app  
Viewport: Desktop  
Aciklama: UI tutarli ama `rounded-[1.5rem]` ve `rounded-[1.75rem]` yogun kullanimi fintech command center sertligini bir miktar yumusatiyor.  
Neden onemli: Daha keskin radius, ciddi finansal arac hissini guclendirebilir.  
Onerilen cozum: Kritik dashboard/panel radius'larini 16px civarina cekmeyi degerlendir. Bu bir redesign degil, polish karari olarak alinmali.  
Tahmini dosyalar: Tum component class'lari veya tasarim tokenlari  
Risk: Orta, gorsel sistem genelini etkiler.  
Oncelik: 8

### Issue ID: PINTI-AUD-009

Baslik: Filter chip satirlari mobilde kirpiliyor, scroll affordance zayif  
Severity: Low  
Sayfa: Moduller, AI Aksiyon Merkezi, Mutabakat mobile  
Viewport: Mobile  
Aciklama: Filter satirlari yatay scroll icinde calisiyor ama scrollbar gizli. Heavy table mobile screenshot'ta chip metinleri kesiliyor.  
Neden onemli: Kullanici daha fazla filtre oldugunu fark etmeyebilir.  
Onerilen cozum: Sag fade, "kaydir" cue, veya filter chips icin wrap-on-mobile davranisi.  
Tahmini dosyalar: `src/components/ui/FilterTabs.tsx`, modul sayfalarindaki inline filter bolumleri  
Risk: Dusuk  
Oncelik: 9

### Issue ID: PINTI-AUD-010

Baslik: Focus state temel olarak var ama tasarim sistemi seviyesinde degil  
Severity: Low  
Sayfa: Tum app  
Viewport: Desktop ve mobile  
Aciklama: Keyboard probe'da focus gorunuyor, ama browser default outline gibi duruyor. Product UI icin branded `focus-visible` ring daha profesyonel olur.  
Neden onemli: Erisilebilirlik ve polish algisi artar.  
Onerilen cozum: `:focus-visible` icin emerald/cyan ring token'i ekle; button, link, input, select icin ortak stil ver.  
Tahmini dosyalar: `src/index.css`, form/control componentleri  
Risk: Dusuk  
Oncelik: 10

## 6. Sayfa Sayfa Degerlendirme

### Landing

Ne iyi: Ilk 5 saniyede urun anlasiliyor. Slogan guclu, hero preview gercek dashboard hissi veriyor, CTA yerlesimi net.  
Ne zayif: Primary link CTA kontrasti dusuk. Meta label'larin bir kismi fazla soluk.  
Ne duzeltilmeli: Anchor color override, meta label kontrasti.  
Onerilen fix: `a { color: inherit; }` kaldir, CTA text rengini `slate-950` olarak gercekten uygulat.

### Dashboard

Ne iyi: Analiz bekleniyor state'i guclu. Analiz sonrasi kontrol paneli, metrikler ve AI yonlendirmesi juri demosu icin etkili.  
Ne zayif: Scroll restoration yoksa dashboard ortadan acilabiliyor. Link CTA kontrasti dusuk.  
Ne duzeltilmeli: Route degisiminde sayfa ustten baslamali.  
Onerilen fix: `ScrollToTop` component'i, anchor CTA contrast fix.

### Veri Merkezi

Ne iyi: Aktif veri kaynagi, demo sirket secimi, upload, validation ve analiz akisi iyi ayrilmis.  
Ne zayif: Copy biraz teknik. Yatay tablolar keyboard focus alamiyor.  
Ne duzeltilmeli: Kullanici dili, table scroller a11y.  
Onerilen fix: "dataset/upload" dilini yerlilestir, `overflow-x-auto` wrapper'lara `tabIndex` ve label ekle.

### Karpusula

Ne iyi: Urun bazli kar kartlari, filtreler ve manual varsayimlar calisiyor. "Urun gercekten kar ettiriyor mu?" sorusu net.  
Ne zayif: Scroll bug nedeniyle module geciste hero yerine orta bolum gorulebiliyor. Manual panel sonuc akisindan once dikkat cekebilir.  
Ne duzeltilmeli: Scroll restoration, manual panel hiyerarsisi.  
Onerilen fix: Scroll fix sonrasi manual paneli collapsed/secondary hale getirmeyi degerlendir.

### ReklamMerkezi

Ne iyi: ROAS yerine reklam sonrasi net kar mesaji guclu. Metrikler ve risk dili dogru.  
Ne zayif: Manual override paneli cok erken ve teknik gorunuyor.  
Ne duzeltilmeli: Demo sirasinda once sonuc, sonra varsayim duzenleme daha iyi olabilir.  
Onerilen fix: Manual override panelini "Varsayimlari duzenle" accordion'una alma.

### IadeKalkan

Ne iyi: Iade kaybi, manuel kontrol ve risk sinyali dili guvenli. Musteriyi suclayan dil yok.  
Ne zayif: Kart yogunlugu ve risk listeleri uzun ekranlarda biraz agirlasabilir.  
Ne duzeltilmeli: Ustte 1 ana risk + 2 destek sinyali daha belirgin hale getirilebilir.  
Onerilen fix: Ilk ekran icin "en riskli iade nedeni" mini summary.

### Mutabakat

Ne iyi: Hak edis, banka odemesi ve fark tipi cok iyi urunlesmis. Pazaryeri mesaj taslagi juri icin guclu demo ani.  
Ne zayif: En yogun tablo mobilde yatay scroll'a cok bagimli. Scrollable region focusable degil.  
Ne duzeltilmeli: Table a11y, mobile table cue.  
Onerilen fix: `tabIndex=0`, sticky first column veya mobile summary cards.

### FiyatKoruma

Ne iyi: "Fiyati rakibe gore degil, cebinde kalana gore belirle" mesajina iyi hizmet ediyor.  
Ne zayif: Hedef marj ve minimum fiyat metrikleri finans disi kullanici icin biraz yogun olabilir.  
Ne duzeltilmeli: En onde "fiyat guvenli mi?" cevabi daha buyuk/verbal olabilir.  
Onerilen fix: Hero altina tek cumlelik karar sonucu.

### KampanyaSim

Ne iyi: Kampanya sonrasi kar, break-even ve gerekli satis artisi iyi ayrilmis.  
Ne zayif: Cok sayida rakam ve alternatif oneriler ilk bakista yogun.  
Ne duzeltilmeli: En riskli kampanya senaryosu daha fazla one cikmali.  
Onerilen fix: "Bu kampanya neden riskli?" tek karar karti.

### AI Aksiyon Merkezi

Ne iyi: Final ekran olarak guclu. Top 3 aksiyon, filtreler ve modul ozetleri urunun vaadini kapatiyor. Axe desktop temiz cikti.  
Ne zayif: 0/100 skor aciklama olmadan sert. Scroll bug nedeniyle ekran ortadan acilabiliyor.  
Ne duzeltilmeli: Skor aciklamasi, route scroll fix.  
Onerilen fix: Saglik skoru kartina band etiketi ve neden ozeti.

### Demo Verisi

Not: Route path hala `/app/demo-verisi`, UI etiketi Veri Merkezi. Bu dogru ve geriye uyumlu. Degerlendirme Veri Merkezi basligi altindadir.

## 7. Mobil Degerlendirme

Test edilen viewportlar:

- Desktop: 1440x900
- Laptop: 1280x800
- Tablet: 768x1024
- Mobile: 390x844
- Small mobile: 360x740

Sonuclar:

- Sayfa seviyesinde horizontal overflow bulunmadi. Olculen tum viewportlarda document scrollWidth clientWidth ile uyumlu.
- Mobil nav calisiyor ve yatay scroll container icinde kaliyor.
- Ancak route degisiminde scroll pozisyonu korununca mobil sticky nav icerigi kapatiyor. Bu juri demosunda en gorunur mobil risk.
- Heavy table mobile kullanilabilir ama filtre chipleri ve tablo kolonlari yatay scroll arkasinda. Bu kabul edilebilir MVP davranisi, fakat focus ve scroll cue eksik.
- Kartlar mobilde okunabilir, fakat uzun ekranlar olusuyor. AI Aksiyon Merkezi ve Veri Merkezi mobilde islevsel ama cok dikey.

## 8. Accessibility Notlari

Pozitif:

- Semantik `button`, `a`, `input`, `select` kullanimi genel olarak iyi.
- Icon-only kontrol icin spot check'te isimsiz interactive control bulunmadi.
- Klavye focus temel seviyede gorunuyor.
- `prefers-reduced-motion` kuralina saygi var.

Sorunlar:

- Axe `color-contrast` uyarisi verdi: emerald anchor CTA'larda beyaz metin 1.52:1 kontrastta kaliyor.
- Axe `scrollable-region-focusable` uyarisi verdi: yatay tablo wrapper'lari focus alamiyor.
- Kucuk uppercase meta label'larda `text-slate-500` bazi yerlerde 4.5:1 altinda.
- Focus state default browser outline seviyesinde. Tasarim sistemi seviyesinde `focus-visible` ring eklenmeli.

## 9. Copy / Dil Notlari

Guclu:

- Finansal tavsiye, hukuki tavsiye, garanti kar veya suclayici musteri dili kullanilmiyor.
- "Mevcut demo verisine gore", "manuel kontrol", "karar destegi" dili dogru.
- Modul sorulari akilda kalici.

Iyilestirilecek:

- "JSON dataset upload" -> "JSON veri yukleme"
- "CSV upload simulasyonu" -> "CSV dosya yukleme simulasyonu"
- "`manualOverrides` icinde tutulur" -> "Gecici varsayim olarak saklanir"
- "Uploaded dataset" -> "Yuklenen veri seti"

## 10. Demo Juri Uygunlugu

Guc:

- 3 dakikalik demo akisi net: Landing, Dashboard, Veri Merkezi, Analiz Baslat, Moduller, AI Aksiyon Merkezi.
- Veri Merkezi juriye "bu sadece statik mockup degil" mesajini veriyor.
- AI Aksiyon Merkezi finalde urunun tum parcalarini birlestiriyor.
- Guvenli MVP sinirlari acikca yazilmis, bu juri guveni icin iyi.

Risk:

- Scroll bug'i sunum sirasinda sayfayi ortadan acarsa tasarim bozuk gibi algilanabilir.
- Primary link CTA kontrast hatasi "premium" hissi kirar.
- Mobil demo yapilacaksa nav ve scroll davranisi onceden duzeltilmeli.

Demo onerisi:

Desktop demo tercih edilmeli. Mobil sadece responsive kanit olarak gosterilecekse once scroll restoration fix uygulanmali.

## 11. Oncelikli Fix Plani

### 0-2 saatlik hizli fixler

1. `src/index.css` icindeki global `a { color: inherit; }` davranisini duzelt. CTA kontrastini tekrar axe ile kontrol et.
2. React Router icin `ScrollToTop` component'i ekle. Tum app route degisimlerinde scroll top olsun.
3. Tablo `overflow-x-auto` wrapper'larina `tabIndex={0}`, `aria-label` ve `focus-visible` ring ekle.
4. `text-slate-500` kullanan kritik meta label'lari `text-slate-400` seviyesine cek.
5. "manualOverrides", "dataset upload", "Uploaded dataset" gibi teknik copyleri yerlilestir.

### 1 gunluk polish

1. Mobil nav icin daha guclu discoverability: gradient edge, daha kisa label seti veya "Diger" menu.
2. Manual override panellerini accordion/collapsible hale getir.
3. AI saglik skoru icin band etiketi ve neden ozeti ekle.
4. Tablo mobile deneyiminde sticky first column veya row-card alternatifini degerlendir.
5. Focus-visible ring tokenlarini tasarim sistemine ekle.

### Hackathon sonrasi gelistirmeler

1. CSV import icin schema mapping ve field matching ekrani.
2. Kullanici/workspace modeli ve backend persistence.
3. Gercek AI ozetleme entegrasyonu.
4. Uyari gecmisi, aksiyon task takibi, raporlama.
5. Full design token sistemi: radius, color, focus, table, badge ve CTA varyantlari.

## 12. Screenshot Listesi

Istenen ana screenshotlar:

- `output/audit/landing-desktop.png`
- `output/audit/dashboard-desktop.png`
- `output/audit/veri-merkezi-desktop.png`
- `output/audit/karpusula-desktop.png`
- `output/audit/reklammerkezi-desktop.png`
- `output/audit/iadekalkan-desktop.png`
- `output/audit/mutabakat-desktop.png`
- `output/audit/fiyatkoruma-desktop.png`
- `output/audit/kampanyasim-desktop.png`
- `output/audit/ai-aksiyon-desktop.png`
- `output/audit/dashboard-mobile.png`
- `output/audit/veri-merkezi-mobile.png`
- `output/audit/ai-aksiyon-mobile.png`
- `output/audit/heavy-table-mobile.png`

Ek responsive/empty-state screenshotlari:

- `output/audit/dashboard-empty-desktop.png`
- `output/audit/veri-merkezi-empty-desktop.png`
- `output/audit/landing-laptop-check.png`
- `output/audit/dashboard-tablet-check.png`
- `output/audit/veri-merkezi-small-mobile-check.png`

Ek otomasyon ciktisi:

- `output/audit/audit-results.json`

## Test Sonuclari

- `npm run build`: basarili
- `npm run lint`: basarili
- Browser smoke test: temel akislarda basarili
- Console error/warning: bulunmadi
- Axe: Landing desktop 1 violation, Veri Merkezi desktop 1 violation, Dashboard desktop 1 violation, Dashboard mobile 2 violation, AI Aksiyon desktop 0 violation
- Horizontal page overflow: test edilen viewportlarda bulunmadi

