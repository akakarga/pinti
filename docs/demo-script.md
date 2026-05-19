# Pinti Demo Script

## 30 Saniyelik Anlatım

Pinti, küçük e-ticaret satıcılarının satıştan gerçekten ne kadar kazandığını
anlamasını sağlayan yapay zekâ destekli finansal kontrol merkezidir. Satıcılar
çoğu zaman ciroyu görür; ancak komisyon, kargo, reklam, iade, kampanya ve
hakediş farkları sonrası gerçek kâr değişir. Pinti bu verileri tek panelde
analiz eder ve satıcıya öncelikli aksiyonları gösterir.

## 60 Saniyelik Anlatım

Küçük ve orta ölçekli e-ticaret satıcıları için en büyük sorunlardan biri,
satışın gerçekten kâra dönüşüp dönüşmediğini görememektir. Pazaryeri komisyonu,
kargo maliyeti, reklam harcaması, iade kaybı, kampanya indirimi ve hakediş
farkı ayrı ayrı takip edilir. Bu yüzden satıcı ciroyu görür ama cebinde kalan
gerçek net kârı kaçırabilir.

Pinti bu problemi tek panelde çözer. KârPusula ürün bazlı gerçek net kârı,
ReklamMerkezi ROAS sonrası net kârı, İadeKalkan iade kaybını, Mutabakat hakediş
farklarını, FiyatKoruma minimum sağlıklı fiyatı ve KampanyaSim kampanya sonrası
kâr etkisini gösterir. AI Aksiyon Merkezi ise tüm sinyalleri birleştirir ve
"bugün ilk bakılacak 3 şey" listesini üretir.

Kısaca Pinti ciroyu değil, satıcının gerçekten cebinde kalan parayı görünür hale
getirir.

## 3 Dakikalık Demo Akışı

1. **Landing**
   - "Satış var, kâr nerede?" mesajıyla başlayın.
   - Pinti'nin e-ticaret satıcıları için finansal kontrol merkezi olduğunu söyleyin.

2. **Dashboard: analiz bekleniyor**
   - Seçili demo şirketi ve "Analizi Başlat" CTA'sını gösterin.
   - Pinti'nin sonuçları otomatik yığmadığını, aktif veriyle çalıştığını vurgulayın.

3. **Veri Merkezi**
   - Dört demo şirketten birini seçin.
   - JSON upload ve CSV upload simülasyonu alanlarını gösterin.
   - Veri doğrulama panelindeki sayıları ve ilişki uyarılarını anlatın.

4. **Analizi Başlat**
   - Analizi başlatın ve kısa loading durumunu gösterin.
   - Dashboard metriklerinin aktif dataset üzerinden açıldığını belirtin.

5. **KârPusula**
   - Ürün bazlı gerçek net kârı gösterin.
   - Çok satan ama net marjı düşük ürün örneğini anlatın.
   - Komisyon veya kargo varsayımını değiştirip yeniden analiz edilebildiğini gösterin.

6. **ReklamMerkezi**
   - ROAS'ın tek başına yeterli olmadığını gösterin.
   - ROAS iyi görünse bile reklam sonrası net kârı zayıf kampanyayı açın.

7. **İadeKalkan**
   - İade oranı yüksek ürünü ve manuel kontrol gerektiren iade kaydını gösterin.
   - Pinti'nin kesin fraud tespiti yapmadığını, sadece risk sinyali verdiğini belirtin.

8. **Mutabakat**
   - Hakediş ve banka ödemesi arasındaki açıklanamayan farkı gösterin.
   - Pazaryerine gönderilebilecek nötr mesaj taslağını gösterin.

9. **FiyatKoruma**
   - Minimum sağlıklı fiyat altında kalan ürünü anlatın.
   - Hedef net marj varsayımının demo amaçlı değiştirilebildiğini gösterin.
   - Fiyat kararı değil, karar desteği sunduğunu vurgulayın.

10. **KampanyaSim**
   - İndirim veya ücretsiz kargo sonrası birim net kârın nasıl değiştiğini gösterin.
   - Aynı toplam kârı korumak için gereken satış artışını anlatın.

11. **AI Aksiyon Merkezi**
   - Final sahne olarak açın.
   - Pinti sağlık skoru, kritik aksiyon sayısı, tahmini etki tutarı ve modül
     durum kartlarını gösterin.
   - "Bugün ilk bakılacak 3 şey" listesini jüriye okuyun.

## Problem

E-ticaret satıcısı ciroyu, reklam performansını, iadeleri, hakedişi ve kampanyayı
çoğu zaman farklı ekranlarda takip eder. Bu veriler birleşmediği için gerçek net
kâr ve öncelikli riskler geç fark edilir.

## Çözüm

Pinti tüm finansal sinyalleri tek panelde birleştirir. Her modül kendi alanında
hesaplama yapar; AI Aksiyon Merkezi ise bu sonuçları önceliklendirerek satıcıya
hangi konulara önce bakması gerektiğini gösterir.

## Teknoloji

- React + Vite
- TypeScript
- Tailwind CSS
- Recharts
- Mock data
- Rule-based AI action service

## Etki

Pinti, satıcının ciroya bakıp rahatlaması yerine gerçek net kârı, riskleri ve
aksiyon sırasını görmesini sağlar. Bu sayede ürün, reklam, iade, hakediş, fiyat
ve kampanya kararları daha görünür bir finansal bağlama oturur.

## Kapanış Cümlesi

Pinti satıcıya "satış yaptın" demekle yetinmez; "bu satıştan cebinde ne kaldı ve
bugün önce neyi kontrol etmelisin?" sorusuna cevap verir.

## Güvenli Konumlandırma

Pinti finansal, hukuki, muhasebesel, reklam veya fiyatlandırma tavsiyesi vermez.
Bu MVP, mevcut demo verisine göre karar destek sistemi olarak çalışır.
