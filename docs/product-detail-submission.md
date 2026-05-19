# Ürün Detay Açıklaması

> Aşağıdaki metin, hackathon başvuru formundaki "Ürününüzün Detaylarını Anlattığınız Açıklama Giriniz" alanı için hazırlanmıştır. Doğrudan kopyala-yapıştır yapılabilir.

---

Pinti, küçük ve orta ölçekli e-ticaret satıcılarının "satış yapıyorum ama gerçekte ne kazanıyorum?" sorusuna cevap veren yapay zekâ destekli bir karar destek aracıdır.

**Problem:** E-ticaret satıcıları satış rakamlarını görür, ancak komisyon, kargo, reklam harcaması, iade kaybı, hakediş farkları ve kampanya etkisi gibi gizli maliyetleri tek bir yerde takip edemez. Çoğu satıcı ciroyu kâr zanneder ve sorunları fark ettiğinde müdahale etmek için geç kalmış olur.

**Çözüm:** Pinti, satıcının ürün, sipariş, reklam, iade, hakediş, banka ve kampanya verilerini tek bir panelde toplar. Yedi analiz modülü (KârPusula, ReklamMerkezi, İadeKalkan, Mutabakat, FiyatKoruma, KampanyaSim ve AI Aksiyon Merkezi) her biri farklı bir finansal soruyu cevaplar. AI Aksiyon Merkezi ise tüm modüllerden gelen sinyalleri birleştirerek satıcıya "bugün ilk bakılacak 3 şey" öncelik listesini sunar.

**Hedef Kullanıcı:** Türkiye'deki küçük ve orta ölçekli e-ticaret satıcıları — özellikle pazaryerlerinde satan, reklam veren, iade yöneten ve ay sonu "kâr nerede?" diye soran satıcılar.

**Yapay Zekâ / Gemini Kullanımı:** Pinti'nin AI Aksiyon Merkezi varsayılan olarak kural tabanlı bir analiz motoru ile çalışır; tüm modüllerden gelen verileri birleştirir ve önceliklendirilmiş aksiyon önerileri üretir. İsteğe bağlı olarak Google Gemini API ile doğal dil tabanlı özet ve aksiyon üretimi de desteklenir. Gemini modu, yalnızca kullanıcının runtime'da kendi API key'ini girmesiyle çalışır — API key repoda veya kaynak kodda tutulmaz. Gemini kullanılmasa da Pinti tam işlevsel olarak çalışmaya devam eder.

**Teknik Mimari:** React + Vite + TypeScript + Tailwind CSS frontend, opsiyonel Express + TypeScript local backend. Sıfır bütçe, sıfır ücretli servis, sıfır cloud bağımlılığı. Tüm veriler demo dataset'ler veya kullanıcının yüklediği JSON/CSV dosyalarıdır.

**MVP Sınırları:** Bu proje bir hackathon MVP'sidir. Gerçek pazaryeri, banka veya reklam API entegrasyonu yoktur. Production auth ve veritabanı yoktur. Pinti finansal, hukuki veya yatırım tavsiyesi vermez — gösterilen sonuçlar mevcut demo verilerine göre karar destek amacı taşır.

**Fark Yaratan Nokta:** Pinti, satıcıya ciroyu değil, satıştan geriye gerçekten ne kaldığını gösterir. Her modül ayrı bir finansal görünmezliği çözer ve AI Aksiyon Merkezi bu sinyalleri tek bir öncelik listesinde birleştirir.
