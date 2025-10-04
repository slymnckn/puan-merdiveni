# 🎮 Puan Merdiveni - Oyun Uygulaması

İki takımın sırayla soruları cevaplayarak dijital bir merdivende yukarı tırmandığı interaktif bilgi yarışması oyunu.

---

## ⚠️ ÖNEMLİ: PROMPT.MD GÜNCELLEMESİ

**HER DEĞİŞİKLİKTE `prompt.md` DOSYASINI GÜNCELLE!**

Bu proje özel bir dokümantasyon politikası kullanır:

### 📋 Kural
`prompt.md` dosyası, uygulamanın **tam ve güncel** spesifikasyonudur. Her kod değişikliğinde bu dosya da güncellenmelidir.

### 🎯 Amaç
`prompt.md` ile uygulamayı **tek seferde sıfırdan** yeniden oluşturabilmek.

### 📚 Detaylı Talimatlar
- `.copilot-instructions.md` dosyasına bakın
- `prompt.md` başlığındaki uyarıyı okuyun

---

## 🚀 Teknoloji Stack

- **Next.js 14** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Shadcn/ui** komponentleri
- **Baloo 2** Google Font
- **Prettier** - Code formatting (esbenp.prettier-vscode)

---

## 📁 Proje Yapısı

```
quiz-game/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Ana oyun sayfası
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global stiller
├── components/              # React bileşenleri
│   ├── AdvertisementScreen.tsx
│   ├── MainMenu.tsx
│   ├── TeamSelection.tsx
│   ├── GameSettings.tsx
│   ├── QuestionReady.tsx
│   ├── QuestionDisplay.tsx
│   ├── LadderProgress.tsx
│   ├── SurpriseEvent.tsx
│   ├── GameResults.tsx
│   └── PublisherLogo.tsx
├── types/                   # TypeScript tipleri
│   ├── game.ts
│   └── api.ts
├── lib/                     # Yardımcı fonksiyonlar
│   ├── api-service.ts
│   ├── game-utils.ts
│   └── utils.ts
├── data/                    # Veri dosyaları
│   ├── characters.ts
│   ├── questions.ts
│   └── placeholder-questions.ts
├── public/                  # Statik dosyalar
│   └── assets/             # Oyun görselleri
├── prompt.md               # 🔴 GÜNCEL SPESIFIKASYON
├── .copilot-instructions.md # GitHub Copilot talimatları
└── README.md               # Bu dosya
```

---

## 🎮 Oyun Özellikleri

### Ekranlar
1. **Reklam Ekranı** - Oyun öncesi reklam gösterimi
2. **Ana Menü** - Oyuna başlama
3. **Takım Seçimi** - 2 takım, 6 karakter seçimi (3x2 grid)
4. **Oyun Ayarları** - Soru sayısı (10/20/30/40), Mod (Süreli/Süresiz), Sürpriz sistemi
5. **Soru Hazır** - Soruyu göster butonu
6. **Soru Aktif** - 3 soru tipi: Multiple Choice, True/False, Classic
7. **Merdiven İlerlemesi** - Sliding window sistem, renk tier'ları
8. **Sürpriz Olayı** - Her 3 soruda, zar + seçenekler
9. **Oyun Sonu** - Podium, skor, confetti

### Oyun Mekanikleri
- **Süreli Mod:** 30 saniye, süreye göre +1/+2/+3 basamak
- **Süresiz Mod:** Her doğru cevap +1 basamak
- **Sürpriz Sistemi:** Her 3 soruda zar (1-6) + özel seçenekler
- **Merdiven:** Sliding window (10 basamak görünür), her 10 basamakta renk değişimi
- **Hedef:** 10 soru→25, 20→50, 30→75, 40→100 basamak

---

## 🔌 API Entegrasyonu

### Endpoints
```
GET  /api/unity/question-groups/code/{CODE}    # Sorular
GET  /api/unity/advertisements                  # Reklamlar
GET  /api/publishers/{publisherId}              # Publisher logo
POST /api/jenkins/callback                      # Callback
```

### Fallback
- API başarısız → Placeholder sorular
- Yetersiz soru → Placeholder eklenir

---

## 🎨 Tasarım

### Font
- **Baloo 2** (400, 500, 600, 700, 800)
- Oyun ve çocuk uygulamaları için özel

### Renkler
#### Takım A Merdiven Renkleri
1. Mor (1-10): `#5B21B6 → #8B5CF6`
2. Mavi (11-20): `#1E40AF → #3B82F6`
3. Turkuaz (21-30): `#0F766E → #14B8A6`
4. Yeşil (31-40): `#15803D → #22C55E`
5. Sarı (41-50): `#CA8A04 → #EAB308`
6. Altın (51+): `#B45309 → #F59E0B`

#### Takım B Merdiven Renkleri
1. Pembe (1-10): `#C026D3 → #E879F9`
2. Pembe-Kırmızı (11-20): `#BE123C → #FB7185`
3. Turuncu (21-30): `#C2410C → #FB923C`
4. Turuncu-Sarı (31-40): `#CA8A04 → #FBBF24`
5. Sarı (41-50): `#A16207 → #FDE047`
6. Altın (51+): `#B45309 → #F59E0B`

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- pnpm (önerilir) veya npm

### Kurulum
```bash
# Bağımlılıkları yükle
pnpm install

# Geliştirme sunucusunu başlat
pnpm dev

# Tarayıcıda aç
http://localhost:3000
```

### Build
```bash
# Production build
pnpm build

# Build'i çalıştır
pnpm start
```

---

## 📖 Dokümantasyon

### Ana Spesifikasyon
👉 **`prompt.md`** - Uygulamanın tam ve güncel spesifikasyonu

### Geliştirici Kılavuzu
👉 **`.copilot-instructions.md`** - GitHub Copilot talimatları ve güncelleme kuralları

### Bölümler (prompt.md)
1. Teknoloji Stack
2. API Entegrasyonu
3. Veri Yapıları
4. Ekranlar ve Boyutlar (9 ekran detaylı)
5. Oyun Akışı ve Mantık
6. Dosya Yapısı
7. Önemli Notlar ve Kod Örnekleri
8. Tasarım Prensipleri
9. Test Senaryoları
10. Kontrol Listesi

---

## 🧪 Test

### Test Senaryoları
1. **Normal Akış:** Reklam → Takım seçimi → 20 soru → Kazanan
2. **API Başarısız:** Placeholder sorular devreye girer
3. **Yetersiz Soru:** API + placeholder karışımı
4. **Beraberlik:** Eşit skor
5. **Timeout:** Süreli modda süre bitmesi

---

## 🤝 Katkıda Bulunma

### Önemli Kurallar

1. **Her değişiklikte `prompt.md` güncelle**
2. Kod formatını koru (TypeScript, Tailwind)
3. Bileşenleri modüler tut
4. Type safety'yi koru
5. Commit mesajlarını açıklayıcı yaz

### Güncelleme Checklist
- [ ] Kod değişikliği yaptım
- [ ] `prompt.md` ilgili bölümünü güncelledim
- [ ] Boyutlar/renkler/pozisyonlar detaylı
- [ ] Kod örnekleri ekledim (gerekirse)
- [ ] Test senaryolarını kontrol ettim

---

## 📄 Lisans

Bu proje özel bir projedir.

---

## 📞 İletişim

Sorularınız için proje yöneticisi ile iletişime geçin.

---

## 🎯 Roadmap

- [x] Temel oyun mekanikleri
- [x] 9 ekran implementasyonu
- [x] API entegrasyonu
- [x] Sliding window merdiven sistemi
- [x] Sürpriz olayı sistemi
- [ ] Ses efektleri
- [ ] Animasyon iyileştirmeleri
- [ ] Çoklu dil desteği
- [ ] Leaderboard sistemi

---

**Not:** Bu proje `prompt.md` dosyasını "single source of truth" olarak kullanır. Tüm spesifikasyon detayları orada mevcuttur.
