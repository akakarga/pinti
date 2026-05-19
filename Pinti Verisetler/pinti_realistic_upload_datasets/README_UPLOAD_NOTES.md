# Pinti Upload Demo Datasets

Bu paket Pinti'nin veri yükleme akışını göstermek için hazırlanmış **gerçekçi sentetik** e-ticaret veri setleri içerir. Gerçek müşteri, gerçek şirket veya gizli ticari veri içermez.

## Önerilen hızlı demo
1. Pinti > Veri Merkezi sayfasını aç.
2. JSON veri yükleme alanından `pinti_upload_luna_ev_yasam.json` veya `pinti_upload_nova_aksesuar.json` dosyasını seç.
3. Veri doğrulama uyarılarını kontrol et.
4. `Analizi Başlat` butonuna bas.
5. Dashboard ve AI Aksiyon Merkezi'nde ilk 3 aksiyonu göster.

## Dosyalar
- `pinti_upload_luna_ev_yasam.json`: kargo/iade/mutabakat etkileri daha belirgin ev & yaşam satıcısı.
- `pinti_upload_nova_aksesuar.json`: reklam, kampanya ve fiyat baskısı daha belirgin aksesuar satıcısı.
- `csv_luna_ev_yasam/`: aynı verinin CSV parçaları.
- `csv_nova_aksesuar/`: aynı verinin CSV parçaları.

## JSON şeması
Her JSON dosyası şu alanları içerir:
- companyProfile
- products
- orders
- returns
- customers
- paymentDisputes
- campaigns
- campaignPerformance
- settlements
- bankTransactions
- campaignSimulationScenarios

## Not
Eğer Pinti'deki upload parser bazı field isimlerini farklı bekliyorsa, bu dosyalar güvenli temel veri olarak kullanılabilir; field isimleri kolayca uyarlanabilir.
