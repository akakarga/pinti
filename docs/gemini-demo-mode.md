# Gemini Demo Modu

Pinti, Gemini olmadan da tam demo akışıyla çalışır. Gemini demo modu yalnızca AI
Aksiyon Merkezi çıktısı için kısa, Türkçe ve ikincil bir açıklama üretmek üzere
eklenmiştir.

## Nasıl kullanılır?

1. Local backend'i çalıştır:

```bash
npm run dev:backend
```

2. Frontend'i çalıştır:

```bash
npm run dev
```

3. Uygulamada demo hesabıyla giriş yap.
4. Veri Merkezi'nde demo veriyi seç ve analizi başlat.
5. AI Aksiyon Merkezi'nde **Gemini API bağla** düğmesini aç.
6. Geçici Gemini API anahtarını yapıştır.
7. İstersen **Bağlantıyı test et** düğmesine bas.
8. **Bu oturumda kullan** düğmesiyle anahtarı tarayıcı oturumuna kaydet.
9. **Gemini ile yorumu üret** düğmesine bas.

Gemini otomatik çağrılmaz. Sadece kullanıcı düğmeye bastığında local backend
üzerinden Gemini isteği yapılır.

## Anahtar nerede saklanır?

Varsayılan saklama yeri:

- `sessionStorage`

Kullanıcı **Bu cihazda hatırla** seçeneğini işaretlerse:

- `localStorage`

Anahtar source code içine, dokümantasyona, testlere, örnek dosyalara veya repoya
yazılmaz. Backend anahtarı dosyaya kaydetmez; yalnızca gelen istek için Gemini
endpoint'ine gönderir.

## Anahtar nasıl temizlenir?

AI Aksiyon Merkezi'ndeki Gemini panelinde **Anahtarı temizle** düğmesine bas.
Bu işlem hem `sessionStorage` hem de `localStorage` içindeki Gemini demo anahtarını
temizler.

## Kota biterse veya anahtar geçersizse ne olur?

Pinti sakin bir hata mesajı gösterir:

> Gemini yanıtı alınamadı. Pinti’nin mevcut aksiyonları kullanılabilir.

Mevcut dashboard, modüller, AI Aksiyon Merkezi ve ilk 3 aksiyon çalışmaya devam
eder. Gemini çıktısı Pinti'nin hesaplanan aksiyonlarının yerine geçmez.

## Bu neden production secret management değildir?

Bu yapı hackathon demosu içindir. API anahtarı kullanıcı tarafından runtime'da
tarayıcıya girilir ve local backend yalnızca proxy görevi görür. Production
ortamda kullanıcı anahtarı tarayıcı storage alanlarında tutulmamalıdır.

Production yaklaşımı şunları gerektirir:

- Sunucu tarafı secret management
- Kullanıcı ve tenant izolasyonu
- Rate limiting
- Audit logging
- Güvenli key rotation
- Yetki ve kullanım kotası kontrolleri

## Sınırlar

- Gemini opsiyoneldir.
- API anahtarı repoya yazılmaz.
- Anahtar yoksa Pinti kural tabanlı AI Aksiyon Merkezi ile çalışır.
- Her Gemini denemesi kullanıcının kendi kullanım hakkını harcayabilir.
- Pinti tavsiye vermez; mevcut veriye göre karar desteği sunar.
