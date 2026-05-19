# Pinti UI/UX QA Fix Technical Report

Tarih: 17 Mayis 2026  
Kapsam: UI/UX audit sonrasinda uygulanan odakli frontend QA fix pass  
Hedef: Buyuk redesign yapmadan; CTA kontrasti, SPA scroll davranisi, yatay tablo erisilebilirligi, teknik copy, AI saglik skoru aciklamasi ve kucuk meta label kontrastlarini duzeltmek.

## 1. Yonetici Ozeti

Bu calismada Pinti MVP uzerinde audit raporunda High priority olarak isaretlenen sunum ve erisilebilirlik riskleri giderildi. Uygulamanin is mantigi, servis hesaplamalari, demo dataset davranisi, route path yapisi ve analiz akisi degistirilmedi.

Ana teknik kazanımlar:

- Emerald primary CTA kontrasti duzeltildi. Landing hero primary CTA icin Playwright ile olculen kontrast `13.24:1`.
- React Router route gecislerinde sayfa artik otomatik olarak en uste resetleniyor.
- Yatay kaydirilabilir tablo bolgeleri klavye ile odaklanabilir hale getirildi.
- Focus state gorunurlugu icin ortak scroll region stili eklendi.
- Veri Merkezi ve ilgili veri panellerindeki teknik/developer odakli copy daha dogal Turkceye cekildi.
- AI Aksiyon Merkezi'nde `0/100` gibi cok dusuk saglik skoru artik bir hata gibi degil, bilincli risk sinyali gibi aciklaniyor.
- Landing, Dashboard, Veri Merkezi ve AI Aksiyon Merkezi axe kontrolunden `0 violation` ile gecti.

## 2. Degistirilmeyen Kritik Alanlar

Kullanici talimatina uygun olarak asagidaki alanlara islevsel degisiklik yapilmadi:

- `src/services/*`
- `src/data/*`
- `src/types/*`
- Hesaplama formulleri
- Mock dataset davranisi
- Route path'leri
- Dataset secme / analiz baslatma mantigi
- Manual override is mantigi
- AI Aksiyon Merkezi veri toplama ve skor hesaplama mantigi

Not: Bu fix pass sadece UI katmaninda, copy katmaninda ve erisilebilirlik/focus davranisinda kaldi.

## 3. Degisen Dosyalar

| Dosya | Degisiklik tipi | Teknik ozet |
|---|---|---|
| `src/index.css` | CSS reset + accessibility style | Global anchor color override kaldirildi; `.pinti-scroll-region` ve `:focus-visible` ring eklendi. |
| `src/App.tsx` | Layout behavior | `ScrollToTop` component'i route agacina baglandi. |
| `src/components/layout/ScrollToTop.tsx` | Yeni component | `useLocation()` ile `pathname` degisince `window.scrollTo({ top: 0, left: 0, behavior: "auto" })` calisir. |
| `src/components/ui/DataTableShell.tsx` | Accessibility | Ortak tablo scroller bolgesi `tabIndex={0}`, `aria-label` ve focus style alacak sekilde guncellendi. |
| `src/components/dashboard/CampaignTable.tsx` | Accessibility | Inline kampanya tablosu scroll wrapper'i keyboard focusable yapildi. |
| `src/pages/DemoDataPage.tsx` | Copy + accessibility | Veri Merkezi copy sadeleştirildi; veri onizleme tablolarina focusable scroll wrapper eklendi. |
| `src/pages/KarPusulaPage.tsx` | Accessibility | Urun kar tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/ReklamMerkeziPage.tsx` | Accessibility | Kampanya tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/IadeKalkanPage.tsx` | Accessibility | Iade tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/MutabakatPage.tsx` | Accessibility | Mutabakat tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/FiyatKorumaPage.tsx` | Accessibility | Fiyat tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/KampanyaSimPage.tsx` | Accessibility | Kampanya simulasyonu tablosu scroll bolgesi keyboard focusable yapildi. |
| `src/pages/AIAksiyonPage.tsx` | UX clarity + accessibility | Dusuk saglik skoru aciklamasi eklendi; aksiyon listesi tablosu focusable yapildi. |
| `src/components/data/FileUploadPanel.tsx` | Copy | Teknik upload/dataset ifadeleri kullanici dostu Turkceye cekildi. |
| `src/components/data/ManualOverridePanel.tsx` | Copy + label contrast | `manualOverrides` gorunen copy yerine `gecici varsayimlar` dili kullanildi; label kontrasti artirildi. |
| `src/components/data/AnalysisControlBar.tsx` | Copy + label contrast | `Uploaded dataset` / `Demo dataset` metinleri Turkcelestirildi. |
| `src/components/data/DataValidationPanel.tsx` | Label contrast | Kucuk meta label renkleri `text-slate-500` yerine daha okunur `text-slate-400` seviyesine cekildi. |
| `src/components/ui/FilterTabs.tsx` | Accessibility + label contrast | Yatay filtre tab scroll alani focusable yapildi; meta label kontrasti artirildi. |
| `src/components/ui/MetricTile.tsx` | Label contrast | Metric title label kontrasti artirildi. |
| `src/components/ui/ModuleHero.tsx` | Label contrast | Hero meta label kontrasti artirildi. |
| `src/pages/LandingPage.tsx` | Copy + label contrast | Landing flow copy sadeleştirildi; kucuk meta label kontrasti artirildi. |
| `src/pages/DashboardPage.tsx` | CTA/meta contrast | Dashboard primary CTA foreground artik dogru calisiyor; kucuk label kontrastlari iyilestirildi. |

## 4. Fix 1 - CTA Kontrast Duzeltmesi

### Problem

Audit sirasinda emerald primary anchor CTA'larda metin renginin beyaz kaldigi goruldu. CTA arka plani parlak emerald oldugu icin kontrast yaklasik `1.52:1` seviyesine dusuyordu. Bu hem WCAG AA beklentisini karsilamiyor hem de juri demosunda primary action'in okunurlugunu zayiflatiyordu.

### Kok Neden

`src/index.css` icinde global anchor reset'i su davranisi uretiyordu:

```css
a {
  color: inherit;
}
```

Bu kural unlayered/global CSS oldugu icin Tailwind utility siniflarinin beklenen color davranisini bozuyordu. Link elementleri uzerinde `text-slate-950` gibi siniflar olsa bile bazi anchor CTA'lar parent rengini inherit edip beyaz gorunebiliyordu.

### Uygulanan Cozum

`src/index.css` icinde anchor icin `color: inherit` reset'i kaldirildi. Sadece text decoration reset'i korundu:

```css
a {
  text-decoration: none;
}
```

Bu sayede Tailwind text color utility siniflari tekrar dogru calisir hale geldi. Primary emerald CTA'larda mevcut `text-slate-950` siniflari korunarak koyu foreground elde edildi.

### Dogrulama

Playwright smoke test ile Landing hero primary CTA computed style olculdu:

- Foreground: `oklch(0.129 0.042 264.695)`
- Background: `oklch(0.845 0.143 164.978)`
- Kontrast: `13.24:1`

Sonuc: Kabul kriteri olan `4.5:1` ustunde.

## 5. Fix 2 - Route Scroll Restoration

### Problem

SPA route gecislerinde browser scroll pozisyonu korunuyordu. Kullanici Veri Merkezi veya herhangi bir modulde asagi scroll ettikten sonra baska sayfaya gectiginde yeni sayfa ortadan aciliyordu. Mobilde sticky nav bu durumu daha gorunur hale getiriyor ve yeni ekranin basligini kapatabiliyordu.

### Uygulanan Cozum

Yeni component eklendi:

`src/components/layout/ScrollToTop.tsx`

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}
```

Bu component `src/App.tsx` icinde route agacina baglandi:

```tsx
<Suspense fallback={<RouteLoader />}>
  <ScrollToTop />
  <Routes>
    ...
  </Routes>
</Suspense>
```

### Tasarim Karari

- `pathname` dependency kullanildi; query/hash degisimleri icin ekstra davranis eklenmedi.
- `behavior: "auto"` kullanildi; smooth scroll tercih edilmedi. Bu, route degisiminde beklenmeyen hareket yaratmadan yeni sayfayi direkt ustten aciyor.
- Route path'leri degistirilmedi.

### Dogrulama

Playwright smoke test:

- Veri Merkezi alt kisimdan Dashboard'a gecis: `scrollY=0`
- Modul alt kisimdan AI Aksiyon Merkezi'ne gecis: `scrollY=0`
- Mobil Veri Merkezi -> Dashboard: `scrollY=0`
- Mobil modul -> AI Aksiyon Merkezi: `scrollY=0`

Sonuc: Desktop ve mobil kabul kriterleri saglandi.

## 6. Fix 3 - Yatay Tablo Erisilebilirligi

### Problem

`overflow-x-auto` ile yatay kaydirilabilen tablo wrapper'lari klavye ile focus alamiyordu. Bu, axe tarafinda `scrollable-region-focusable` tipi erisilebilirlik riski uretiyordu.

### Uygulanan Cozum

Ortak CSS utility eklendi:

```css
.pinti-scroll-region {
  border-radius: 1rem;
  outline: none;
}

.pinti-scroll-region:focus-visible {
  outline: 1px solid rgba(86, 214, 170, 0.68);
  outline-offset: 3px;
  box-shadow: 0 0 0 3px rgba(86, 214, 170, 0.2);
}
```

Ortak tablo component'i guncellendi:

```tsx
<div
  className="pinti-scroll-region overflow-x-auto"
  tabIndex={0}
  aria-label={scrollLabel ?? `${title} yatay kaydırma alanı`}
>
  {children}
</div>
```

Inline tablo wrapper'lari da ayni pattern'e cekildi.

### Erisilebilir Hale Getirilen Scroll Bolgeleri

- Veri onizleme urun tablosu
- Siparis ve iade onizleme tablosu
- Dashboard kampanya ozeti tablosu
- KarPusula urun kar tablosu
- ReklamMerkezi kampanya tablosu
- IadeKalkan iade tablosu
- Mutabakat tablosu
- FiyatKoruma fiyat tablosu
- KampanyaSim kampanya simulasyonu tablosu
- AI Aksiyon Merkezi aksiyon listesi tablosu
- Ortak `DataTableShell` kullanan diger tablo yuzeyleri
- `FilterTabs` yatay filtre scroll bolgesi

### Dogrulama

Playwright ile klavye tab sirasi test edildi:

- `Ürün kâr tablosu yatay kaydırma alanı` tab ile focus alabildi.
- Focus state computed olarak gorundu:
  - `outline=solid`
  - `box-shadow=rgba(86, 214, 170, 0.2) 0px 0px 0px 3px`

Axe sonucu:

- Landing: `0 violation`
- Dashboard: `0 violation`
- Veri Merkezi: `0 violation`
- AI Aksiyon Merkezi: `0 violation`

## 7. Fix 4 - Teknik Copy Temizligi

### Problem

Bazi gorunen metinler developer odakliydi. Ornekler:

- `JSON dataset upload`
- `CSV upload simülasyonu`
- `Uploaded dataset`
- `manualOverrides`
- `dataset`
- `upload`

Bu ifadeler MVP'nin teknik altyapisini one cikariyor, urun hissini zayiflatiyordu.

### Uygulanan Cozum

Sadece user-facing UI copy guncellendi. Kod degisken adlari ve domain model adlari korunarak is mantigi etkilenmedi.

Ornek copy degisimleri:

| Eski ifade | Yeni ifade |
|---|---|
| `JSON dataset upload` | `JSON veri yükleme` |
| `CSV upload simülasyonu` | `CSV dosya yükleme simülasyonu` |
| `Uploaded dataset` | `Yüklenen veri seti` |
| `Demo dataset` | `Demo veri seti` |
| `manualOverrides içinde tutulur` | `geçici varsayımlar içinde tutulur` |
| `aktif dataset` | `aktif veri seti` |
| `Frontend parser + validation` | `Ön kontrol ve doğrulama` |

### Dogrulama

Playwright smoke test Veri Merkezi'nde asagidaki metinleri dogruladi:

- `JSON veri yükleme`
- `CSV dosya yükleme simülasyonu`

Kod taramasinda eski user-facing teknik ifadeler temizlendi. `manualOverrides` ifadesi sadece kod degiskeni olarak kaldi; gorunen copy olarak kullanilmiyor.

## 8. Fix 5 - AI Saglik Skoru Aciklamasi

### Problem

AI Aksiyon Merkezi'nde bazi veri setlerinde saglik skoru `0/100` cikabiliyor. Hesaplama dogru olsa bile aciklama olmadan bu durum "hesaplama bozuk" algisi yaratabilir.

### Uygulanan Cozum

Hesaplama degistirilmedi. Sadece UI sunum katmaninda dusuk skor icin aciklama eklendi.

Eklenen mantik:

```tsx
const healthScore = aiInsight?.healthSummary.overallScore ?? null
const hasVeryLowHealthScore = healthScore !== null && healthScore <= 10
const healthScoreBand = hasVeryLowHealthScore
  ? 'Kritik sinyal yoğunluğu'
  : aiInsight?.healthSummary.riskLevel === 'critical'
    ? 'Öncelikli kontrol önerilir'
    : 'Düzenli takip'
```

`hasVeryLowHealthScore` true oldugunda su aciklama gosteriliyor:

> Bu skor, aynı veri setinde birden fazla yüksek/kritik sinyal öne çıktığı için düşük görünüyor.

### Tasarim Karari

- `MetricCard` yerine bu alan icin lokal bir `article` kullanildi; cunku skor bandi ve aciklama metni MetricCard'in mevcut API'sine yeni feature eklemeden daha temiz yerlestirildi.
- Skor hesaplama, action siralamasi, risk modeli ve service fonksiyonlari degistirilmedi.
- Mesaj kisa tutuldu; finansal tavsiye veya garanti diline girilmedi.

### Dogrulama

Playwright smoke test Pera Bebek & Anne senaryosunda:

- Skor: `0/100`
- Durum bandi: `Kritik sinyal yoğunluğu`
- Aciklama metni gorunur: evet

Sonuc: `0/100` artik kasitli kritik sinyal olarak okunuyor.

## 9. Fix 6 - Meta Label Kontrasti

### Problem

Bazi kucuk uppercase/meta label'lar `text-slate-500` kullaniyordu. Dark fintech zeminde bu ton fazla geri planda kalabiliyordu.

### Uygulanan Cozum

Kritik ve tekrar eden UI yuzeylerinde label rengi `text-slate-400` seviyesine cekildi.

Guncellenen alanlardan bazilari:

- Landing preview kartlari ve flow label'lari
- Dashboard data summary ve empty state label'lari
- Metric tile title label'lari
- Module hero meta label'i
- Data validation counter label'lari
- Manual override input/select label'lari
- FilterTabs meta label'i

### Tasarim Karari

Bu degisim sadece okunurluk artisi icin yapildi. UI'yi daha parlak veya gurultulu gosterecek ana renk degisikligi yapilmadi.

## 10. Test ve Dogrulama Sonuclari

### Build

Komut:

```bash
npm run build
```

Sonuc:

- Basarili.
- TypeScript build ve Vite production build tamamlandi.
- Son calisma suresi: yaklasik `15.68s`.

### Lint

Komut:

```bash
npm run lint
```

Sonuc:

- Basarili.
- ESLint error yok.

### Playwright Smoke Test

Test edilen akislardan ana bulgular:

| Test | Sonuc |
|---|---|
| Landing aciliyor | Basarili |
| Emerald primary CTA kontrasti | Basarili, `13.24:1` |
| `Demo Paneli Aç` CTA route gecisi | Basarili |
| Veri Merkezi copy dogal Turkce | Basarili |
| Veri Merkezi -> Dashboard scroll reset | Basarili, `scrollY=0` |
| Modul -> AI Aksiyon Merkezi scroll reset | Basarili, `scrollY=0` |
| AI `0/100` aciklamasi | Basarili |
| Yatay tablo keyboard focus | Basarili |
| Mobil Veri Merkezi -> Dashboard scroll reset | Basarili, `scrollY=0` |
| Mobil modul -> AI scroll reset | Basarili, `scrollY=0` |
| Console warning/error | Temiz |

### Axe Kontrolu

Playwright + `@axe-core/playwright` ile kontrol edilen sayfalar:

- Landing
- Dashboard
- Veri Merkezi
- AI Aksiyon Merkezi

Sonuc:

- Tum sayfalarda `0 violation`.

## 11. Kabul Kriterleri Durumu

| Kabul kriteri | Durum | Not |
|---|---|---|
| Emerald CTA metni okunur olmalı | Tamamlandi | Kontrast `13.24:1`. |
| Normal text linkler bozulmamali | Tamamlandi | Link stilleri mevcut Tailwind utility siniflariyla calisiyor. |
| Route degisimlerinde sayfa ustten acilmali | Tamamlandi | Desktop ve mobile smoke test `scrollY=0`. |
| Yatay tablolar keyboard focus alabilmeli | Tamamlandi | `tabIndex={0}`, `aria-label`, visible focus ring eklendi. |
| Teknik copy dogal Turkceye cekilmeli | Tamamlandi | Gorunen teknik ifadeler sadeleştirildi. |
| AI `0/100` skoru bozuk gibi gorunmemeli | Tamamlandi | Durum bandi ve neden aciklamasi eklendi. |
| Meta label kontrasti iyilestirilmeli | Tamamlandi | Kritik tekrar eden label'lar `text-slate-400`. |
| Build/lint gecmeli | Tamamlandi | Ikisi de basarili. |
| Console error/warning olmamali | Tamamlandi | Smoke testte temiz. |
| Axe ana sayfalarda temiz olmali | Tamamlandi | 4 sayfada `0 violation`. |

## 12. Teknik Risk Degerlendirmesi

### Dusuk Riskler

- `ScrollToTop` sadece `pathname` degisiminde calisir. Gelecekte query parametre veya hash ile calisan detay sayfalari eklenirse scroll davranisi yeniden degerlendirilebilir.
- `pinti-scroll-region` focus ring'i yalnizca `:focus-visible` durumunda gorunur. Mouse kullanicisini rahatsiz etmez; klavye kullanicisi icin gorunur.
- `MetricCard` yerine AI skoru icin lokal card kullanildi. Bu, yeni abstraction eklemeden en dusuk riskli cozumdu; ancak ileride MetricCard API'sine `children` veya `status` slot'u eklenirse tekrar ortaklastirilabilir.

### Orta Vadeli Bakim Notlari

- Yeni tablo eklendiginde `DataTableShell` kullanmak tercih edilmeli.
- Inline `overflow-x-auto` wrapper eklenecekse `pinti-scroll-region`, `tabIndex={0}` ve Turkce `aria-label` pattern'i korunmali.
- Primary CTA olarak link kullanilacaksa `bg-emerald-300 text-slate-950` kombinasyonu korunmali.
- Yeni user-facing copy'de `dataset`, `upload`, `manualOverrides` gibi developer terimleri gorunur metne tasinmamali.

## 13. Sonuc

Bu fix pass sonunda Pinti'nin hackathon demo kalitesini etkileyen ana UI/UX riskleri giderildi. Calisma buyuk redesign yapmadan, mevcut dark fintech command center tasarimini koruyarak tamamlandi.

Son durum:

- Build: Basarili
- Lint: Basarili
- Smoke test: Basarili
- Axe: 4 ana sayfada `0 violation`
- Console: Error/warning yok
- Critical issue: Yok
- High priority audit issue'lari: Giderildi

