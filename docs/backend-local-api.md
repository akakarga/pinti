# Pinti Local API

Pinti Local API, mevcut frontend servis mantığını hafif bir yerel Express katmanı
üzerinden gösteren hackathon demo backend'idir. Üretim backend'i değildir; veri
tabanı, cloud servis, API anahtarı veya ücretli entegrasyon kullanmaz.
Demo login/register akışı frontend-only çalışır; bu local API kullanıcı
doğrulaması yapmaz ve auth endpoint'i içermez.

## Ne yapar?

- Dataset JSON doğrulaması yapar.
- Geçerli dataset'i `server/src/data/uploads/` altında JSON olarak saklar.
- Seçili dataset için analiz çalıştırır.
- Analiz sonucunu `server/src/data/analyses/` altında JSON olarak saklar.
- Dashboard metriklerini, AI Aksiyon Merkezi çıktısını ve modül sonuçlarını API
  üzerinden döndürür.

## Mevcut Pinti mantığını nasıl kullanır?

Analiz çalıştırıcı, hesaplama kaynağı olarak frontend'deki saf TypeScript
servislerini kullanır:

- `src/utils/workspaceAnalysis.ts`
- `src/services/karPusulaService.ts`
- `src/services/reklamMerkeziService.ts`
- `src/services/iadeKalkanService.ts`
- `src/services/mutabakatService.ts`
- `src/services/fiyatKorumaService.ts`
- `src/services/kampanyaSimService.ts`
- `src/services/aiAksiyonService.ts`

Frontend import sınırlarını bozmamak için server build'i esbuild ile bundle
edilir. Manuel override uygulama kısmı, frontend `DataWorkspaceContext` akışından
hackathon local backend demosu için aynalanmıştır.

## Çalıştırma

İlk kurulum:

```bash
npm install
npm --prefix server install
```

Backend geliştirme:

```bash
npm run dev:backend
```

Backend build ve start:

```bash
npm --prefix server run build
npm --prefix server run start
```

Tam yerel demo:

```bash
npm run dev:full
```

Frontend tek başına çalışmaya devam eder:

```bash
npm run dev
```

## Jüriye backend nasıl gösterilir?

Önce backend'i ayrı bir terminalde başlat:

```bash
npm run dev:backend
```

Demo dataset yolu:

```text
Pinti Verisetler/pinti_upload_nova_aksesuar.json
```

Git Bash için kopyala-çalıştır akışı:

```bash
DATASET_PATH="Pinti Verisetler/pinti_upload_nova_aksesuar.json"

curl http://localhost:8787/api/health

curl -X POST http://localhost:8787/api/datasets/validate \
  -H "Content-Type: application/json" \
  --data-binary @"$DATASET_PATH"

DATASET_ID=$(
  curl -s -X POST http://localhost:8787/api/datasets/upload \
    -H "Content-Type: application/json" \
    --data-binary @"$DATASET_PATH" |
  node -pe "JSON.parse(require('fs').readFileSync(0, 'utf8')).datasetId"
)
echo "$DATASET_ID"

ANALYSIS_ID=$(
  curl -s -X POST http://localhost:8787/api/analysis/run \
    -H "Content-Type: application/json" \
    --data "{\"datasetId\":\"$DATASET_ID\"}" |
  node -pe "JSON.parse(require('fs').readFileSync(0, 'utf8')).analysisId"
)
echo "$ANALYSIS_ID"

curl http://localhost:8787/api/analysis/$ANALYSIS_ID/dashboard

curl http://localhost:8787/api/analysis/$ANALYSIS_ID/actions
```

Windows PowerShell için kopyala-çalıştır akışı:

```powershell
$DatasetPath = "Pinti Verisetler/pinti_upload_nova_aksesuar.json"

curl.exe http://localhost:8787/api/health

curl.exe -X POST http://localhost:8787/api/datasets/validate `
  -H "Content-Type: application/json" `
  --data-binary "@$DatasetPath"

$Upload = curl.exe -s -X POST http://localhost:8787/api/datasets/upload `
  -H "Content-Type: application/json" `
  --data-binary "@$DatasetPath" | ConvertFrom-Json
$DatasetId = $Upload.datasetId
$DatasetId

$RunBody = @{ datasetId = $DatasetId } | ConvertTo-Json -Compress
$Run = curl.exe -s -X POST http://localhost:8787/api/analysis/run `
  -H "Content-Type: application/json" `
  --data $RunBody | ConvertFrom-Json
$AnalysisId = $Run.analysisId
$AnalysisId

curl.exe "http://localhost:8787/api/analysis/$AnalysisId/dashboard"

curl.exe "http://localhost:8787/api/analysis/$AnalysisId/actions"
```

Bu akış jüriye sırayla health check, dataset doğrulama, upload, analiz,
dashboard sonucu ve AI Aksiyon Merkezi/ilk 3 aksiyon çıktısını gösterir.

## Endpoint'ler

Base URL:

```text
http://localhost:8787/api
```

Endpoint listesi:

- `GET /api/health`
- `POST /api/datasets/validate`
- `POST /api/datasets/upload`
- `POST /api/analysis/run`
- `GET /api/analysis/:analysisId`
- `GET /api/analysis/:analysisId/dashboard`
- `GET /api/analysis/:analysisId/actions`
- `GET /api/analysis/:analysisId/modules/:moduleName`

Geçerli `moduleName` değerleri:

- `kar-pusula`
- `reklam-merkezi`
- `iade-kalkan`
- `mutabakat`
- `fiyat-koruma`
- `kampanya-sim`

## Dataset doğrulama örneği

```bash
curl -X POST http://localhost:8787/api/datasets/validate \
  -H "Content-Type: application/json" \
  --data @dataset.json
```

API şu kontrolleri yapar:

- Zorunlu üst seviye alanlar var mı?
- Zorunlu veri grupları dizi mi?
- Ürün, sipariş, iade, kampanya, hakediş ve banka kayıtlarında temel alanlar var mı?
- `order.productId` ürünlerde var mı?
- `return.orderId` siparişlerde var mı?
- `return.productId` ürünlerde var mı?
- `settlement.orderId` doluysa siparişlerde var mı?
- `bankTransaction.relatedSettlementId` doluysa hakedişlerde var mı?

## Upload örneği

```bash
curl -X POST http://localhost:8787/api/datasets/upload \
  -H "Content-Type: application/json" \
  --data '{"fileName":"dataset.json","dataset":{...}}'
```

Başarılı upload sonucu:

```json
{
  "ok": true,
  "datasetId": "ds-...",
  "sourceDatasetId": "luna-ev-yasam",
  "uploadedAt": "2026-05-18T...",
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "counts": {}
  }
}
```

## Analiz çalıştırma örneği

```bash
curl -X POST http://localhost:8787/api/analysis/run \
  -H "Content-Type: application/json" \
  --data '{"datasetId":"ds-..."}'
```

Manuel override gönderilebilir:

```json
{
  "datasetId": "ds-...",
  "manualOverrides": {
    "productOverrides": {
      "prod-1": {
        "targetNetMargin": 0.22
      }
    }
  }
}
```

## Sonuç alma

Dashboard:

```bash
curl http://localhost:8787/api/analysis/an-.../dashboard
```

AI Aksiyon Merkezi:

```bash
curl http://localhost:8787/api/analysis/an-.../actions
```

Modül detayı:

```bash
curl http://localhost:8787/api/analysis/an-.../modules/kar-pusula
```

## Yerel dosya saklama

Upload edilen dataset'ler:

```text
server/src/data/uploads/
```

Analiz sonuçları:

```text
server/src/data/analyses/
```

Bu dosyalar demo geliştirme içindir. Üretim ortamında kullanıcı verisi bu şekilde
saklanmamalıdır.

## Sınırlar

- Auth yok.
- Tenant izolasyonu yok.
- Gerçek veritabanı yok.
- Background job yok.
- Rate limiting yok.
- Gemini, OpenAI veya başka ücretli API yok.
- Pazaryeri, banka veya reklam platformu entegrasyonu yok.

## Üretim için sonraki adımlar

- Gerçek veritabanı
- Authentication ve kullanıcı hesapları
- Tenant izolasyonu
- Pazaryeri, banka ve reklam API entegrasyonları
- Gemini veya başka AI entegrasyonu
- Background jobs
- Rate limiting
- Production deployment
- Logging ve error monitoring
- CI/CD
