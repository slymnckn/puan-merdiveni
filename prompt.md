# Puan Merdiveni - Oyun Uygulama Spesifikasyonu

> **⚠️ ÖNEMLİ: PROMPT GÜNCELLEME POLİTİKASI**
> 
> Bu dosya, uygulamanın **TAM VE GÜNCEL** spesifikasyonudur.
> 
> **KURAL:** Her kod değişikliğinde, bileşen güncellemesinde, yeni özellik eklendiğinde veya mevcut özellik değiştirildiğinde, **MUTLAKA** bu prompt.md dosyası da güncellenmelidir.
> 
> **Güncelleme Gereken Durumlar:**
> - Yeni ekran/bileşen eklendi → Bölüm 4'e ekle
> - Layout/boyut değişti → İlgili ekran bölümünü güncelle
> - Oyun mantığı değişti → Bölüm 5'i güncelle
> - API değişti → Bölüm 2'yi güncelle
> - Yeni veri yapısı → Bölüm 3'e ekle
> - Stil/renk değişti → Bölüm 8'i güncelle
> 
> **Amaç:** Bu prompt ile uygulamayı sıfırdan yeniden oluşturabilmek.

---

## Genel Bakış
İki takımın sırayla soruları cevaplayarak dijital bir merdivende yukarı tırmandığı interaktif bilgi yarışması oyunu.

---

## 1. TEKNOLOJI STACK

### Framework & Kütüphaneler
- **Next.js 14** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **Shadcn/ui** komponentleri

### Font
- **Baloo 2** (Google Fonts)
- Weights: 400, 500, 600, 700, 800
- Tüm metinlerde global olarak kullanılır

### State Yönetimi
- React useState/useEffect hooks
- Global state için Context API veya Zustand

### Code Quality & Formatting
- **Prettier** (esbenp.prettier-vscode)
- Format on save aktif
- Tüm dosya tipleri için (TS, TSX, JSON, MD)
- Tutarlı kod formatı

---

## 2. API ENTEGRASYONU

### 2.1 Soru Endpoint
```
GET https://etkinlik.app/api/unity/question-groups/code/{CODE}
```
- `{CODE}` parametresi oyuna özel benzersiz kod (kategori, zorluk, etkinlik ID vb.)
- Başarısız olursa placeholder sorular kullanılır

### 2.2 Reklam Endpoint
```
GET https://etkinlik.app/api/unity/advertisements
```
**Response Format:**
```json
[
  {
    "id": 1,
    "name": "Reklam Adı",
    "file_url": "https://...",
    "link_url": "https://...",
    "duration_seconds": 10
  }
]
```

### 2.3 Publisher Logo Endpoint
```
GET https://etkinlik.app/api/publishers/{publisherId}
```

### 2.4 Callback Endpoint
```
POST https://etkinlik.app/api/jenkins/callback
```
- Oyun bitişi, hata raporları, istatistik gönderimleri için

### 2.5 Headers
```
Accept: application/json
User-Agent: WebGame/1.0
```

---

## 3. VERI YAPILARI

### 3.1 Soru Formatı (API'den Gelen)
```typescript
{
  id: number
  type: "multiple_choice" | "true_false" | "classic"
  question_text: string
  answers: [
    { answer_text: string, is_correct: boolean }
  ]
  correctAnswerId: number
  publisher_id: number
  image_url?: string
}
```

### 3.2 Oyun İçi Soru Formatı (Dönüştürülmüş)
```typescript
{
  id: number
  type: "multiple_choice" | "true_false" | "classic"
  question_text: string
  options?: {
    A: string
    B: string
    C?: string
    D?: string
  }
  correct_answer: "A" | "B" | "C" | "D" | "true" | "false"
  publisher_id: number
  image_url?: string
}
```

### 3.3 Takım Yapısı
```typescript
{
  id: "A" | "B"
  name: string
  character: {
    id: string
    name: string
    image: string
  } | null
  score: number          // Doğru cevap sayısı
  ladderPosition: number // Merdivende kaçıncı basamakta
}
```

### 3.4 Oyun Ayarları
```typescript
{
  questionCount: 10 | 20 | 30 | 40
  gameMode: "timed" | "untimed"
  surpriseSystem: boolean
  gameCode?: string
}
```

### 3.5 Hedef Basamaklar
```
10 soru  → 25 basamak
20 soru  → 50 basamak
30 soru  → 75 basamak
40 soru  → 100 basamak
```

---

## 4. EKRANLAR VE BOYUTLAR

### 4.1 REKLAM EKRANI
**Gösterim Zamanı:** Oyun başlamadan önce bir kez

**Layout:**
- Tam ekran (fixed inset-0)
- Background: /assets/background.png (cover, center)
- Reklam görseli: API'den gelen file_url (tam ekran, object-cover)

**Bileşenler:**
- Reklam görseli (tıklanabilir → link_url yeni sekmede açılır)
- Sağ üst köşe: Geri sayım sayacı
  - Süre: API'den gelen duration_seconds
  - Süre bitince → X butonu görünür
  - X butonuna tıklayınca → Ana menü ekranı

**Boyutlar:**
- Geri sayım sayacı: w-16 h-16, bg-black/60, text-white, text-sm
- X butonu: w-10 h-10, bg-red-600, hover:bg-red-700

---

### 4.1 GİRİŞ EKRANI (MainMenu)
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: **/giris-ekrani.png** (özel giriş ekranı arkaplanı)
- İçerik: Dikey düzen (flex-col items-center justify-center)

**Bileşenler:**
1. **Oyun Başlığı**
   - Görsel: /assets/soru-sayac-banneri.png (h-20)
   - Üzerinde iki satır metin:
     - "Puan Merdiveni" (text-amber-900, font-bold, text-xl)
     - "Dijital Bilgi Yarışması" (text-amber-800, font-semibold, text-sm)
   - mb-12 (alt boşluk)

2. **Oyuna Başla Butonu**
   - Görsel: /assets/genel-buton.png (h-16, min-w-[200px])
   - Üzerinde "OYUNA BAŞLA" metni
   - hover:scale-105 efekti

3. **Ses & Fullscreen Paneli**
  - Sağ üst köşede `AudioControls` bileşeni bulunur.
  - Varsayılan dikey düzen: Önce müzik, sonra efekt butonu; altında tam ekran togglesı.
  - İkonlar: `/assets/music-on.png` ↔ `/assets/music-off.png`, `/assets/fx-on.png` ↔ `/assets/fx-off.png`, `/assets/tam-ekran-on.png` ↔ `/assets/tam-ekran-off.png`.
  - Hover: `scale-[1.05]`, tüm butonlar yuvarlak ve drop-shadow'lu.
  - Tam ekran togglesı `use-fullscreen` hook'u ile body'yi tam ekrana alır, durum `isFullscreen` ile takip edilir.

---

### 4.3 TAKIM SEÇİMİ EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png
- İçerik: Dikey düzen (flex-col items-center justify-center)

**Bileşenler:**
1. **Başlık Banner**
   - Görsel: /assets/soru-sayac-banneri.png
   - h-20 w-auto
   - Üzerinde "TAKIM & KARAKTER SEÇİMİ" (text-amber-900, font-bold, text-xl)
   - marginTop: -12px (fine-tune positioning)

- **Ses & Fullscreen Paneli**
  - Sağ üstte sabitlenen `AudioControls` bileşeni.
  - Dikey düzen: müzik ve efekt butonları üst üste, altında tam ekran togglesı.
  - Panel `gap-2` ile dizilir, `AudioControls` default props kullanır (`showFullscreen=true`).
  - Bu ekran tam ekran olmadan açıldığında tam ekran togglesı ile oyun sahnesi genişletilebilir.

2. **Takım Panelleri (2 adet yan yana)**
   - Panel görseli: /assets/soru-arkasi.png
   - flex gap-8, max-w-7xl
   - **Scale: 1.05x** (tüm panel %5 büyütüldü - oranı korundu)
   - Her panel:
     - **Banner Scale:** scale-105
     - **Content Container:**
       - absolute inset-0 (panel üzerine yerleşir)
       - flex flex-col items-center (dikey düzen, ortala)
       - pt-[80px] pb-[65px] px-8 (optimize edilmiş padding)
       - **scale-105** (banner ile aynı oranda)
       - **ÖNEMLİ:** justify-center YOK - Yukarı kayma önlenir
     - Takım isim girişi:
       - Görsel: /assets/genel-buton.png (h-8 w-38)
       - Input: maxLength 15, text-center, text-[11px]
       - mb-2 (alt boşluk)
       - flex-shrink-0
     - Karakter grid:
       - **3 sütun x 2 satır** (6 karakter)
       - gap-x-16 gap-y-6 (yatay 64px, dikey 24px)
       - mb-3 (alt boşluk)
       - flex-shrink-0
       - **Her karakter container:** 
         - `flex flex-col items-center gap-2` (dikey düzen)
         - İçinde: buton (w-[68px] h-[68px]) + isim
       - Karakter butonu: 
         - w-[68px] h-[68px] (68x68px)
         - rounded-full
         - overflow-visible (outline için)
         - object-contain p-1 (padding ile kesilme önlenir)
         - **Glow Efekti:** Seçili karakterde hafif sarı glow
           - filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5))
           - İkinci katman: drop-shadow(0 0 12px rgba(250, 204, 21, 0.3))
       - **Karakter ismi:**
         - **Her karakterin direkt altında** kendi ismi var
         - gap-2 ile butondan ayrılmış
         - text-yellow-300, font-semibold, text-[11px], drop-shadow-lg
         - text-center, leading-tight
         - Her karakter için her zaman görünür
       - **Outline (Layout Etkilemez):**
         - Seçili: outline outline-[3px] outline-yellow-400 outline-offset-2
         - Seçili değil: outline outline-[1.5px] outline-white/50 outline-offset-0
         - Hover: outline-yellow-300 outline-offset-1
       - **Overlay:**
         - Seçili: bg-yellow-400/30 rounded-full
       - **ÖNEMLİ:** 
         - Border YOK - Boyut değişikliğine sebep olur
         - Shadow YOK - Layout kaymasına sebep olur
         - Scale YOK (butonlarda) - Pozisyon kaymasına sebep olur
         - Sadece OUTLINE kullan - Layout'a etki etmez
         - Parent'ta justify-center YOK - İçerik değişince kayma olmaz
       - Transition: transition-colors (sadece renk)

3. **Devam Et Butonu**
   - Görsel: /assets/genel-buton.png (w-40 h-12)
   - Aktif olma koşulu: Her iki takım da isim ve karakter seçmiş olmalı

**Karakterler (6 adet):**
- Zeka Ustası (/hero/zeka-ustasi.png)
- Hızlı Kedi (/hero/hizli-kedi.png)
- Sihirbaz (/hero/sihirbaz.png)
- Tekno Robot (/hero/tekno-robot.png)
- Uzay Kaşifi (/hero/uzay-kasifi.png)
- Minik Dinazor (/hero/minik-dinazor.png)

---

### 4.4 OYUN AYARLARI EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png
- İçerik: Dikey ortalanmış

**Bileşenler:**
1. **Başlık Banner**
   - Görsel: /assets/soru-sayac-banneri.png (h-18)
   - Üzerinde "OYUN AYARLARI"

- **Ses & Fullscreen Paneli**
  - Sağ üst köşede yer alır, `AudioControls` bileşeni default dikey düzenle kullanılır.
  - `gap-2` ile butonlar ayrılır; müzik/sfx ikonları 52px, fullscreen togglesı 48px.
  - `hover:scale-[1.05]` animasyonu ile kullanıcı geri bildirimi sağlar.

2. **Ayarlar Paneli**
   - Panel görseli: /assets/soru-arkasi.png
   - max-w-3xl
   - İçerik: space-y-5

   **a) Soru Sayısı Seçimi**
   - Başlık: "SORU SAYISI" (text-white, font-bold, text-base)
   - 4 buton: 10, 20, 30, 40
   - Buton görselleri:
     - Seçili: /assets/open-açık-butonu.png
     - Seçili değil: /assets/soru-sayısı-butonu.png
   - Boyut: w-16 h-16
   - Hover: scale-110

   **b) Oyun Modu**
   - Başlık: "OYUN MODU"
   - 2 buton: Süreli / Süresiz
   - Buton görselleri:
     - Seçili: /assets/selected-süre.png
     - Seçili değil: /assets/süreli-süresiz-butonu.png
   - Boyut: h-12, min-w-[120px]
   - Üzerinde metin: text-amber-900, font-bold, text-sm

   **c) Sürpriz Sistemi**
   - Başlık: "SÜRPRİZ SİSTEMİ"
   - Toggle checkbox
   - Açıklama metni: text-white/80, text-xs

3. **Oyunu Başlat Butonu**
   - Görsel: /assets/genel-buton.png (w-48 h-14)
   - Üzerinde "OYUNU BAŞLAT"

---

### 4.5 SORU HAZIR EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png

**Bileşenler:**
1. **Üst Bar**
  - Absolute olarak ekranın üstünde `flex items-start justify-between` düzeninde yerleşir.
  - Sol taraf: `/assets/soru-sayac-banneri.png` (h-16) üzerinde `Soru {current}/{questionCount}` metni, text-amber-900, font-bold, drop-shadow.
  - Sağ taraf: `/assets/sure.png` (h-14) görseli, metin `---` (hazır ekranda süre çalışmaz).
  - Timer panelinin hemen altında `AudioControls orientation="vertical"` yer alır; müzik/sfx butonları ve tam ekran togglesı üst üste dizilir.
  - Panel `gap-2` ile ayrılır, `className="mt-1"` ile küçük boşluk bırakılır.

2. **Takım Banner Kolonu**
  - Sol kenarda `absolute left-8 top-1/2 -translate-y-1/2` ile dikey olarak hizalanır, `gap-4` kullanır.
  - Her takım için `/assets/correct-button.png` (aktif) veya `/assets/genel-buton.png` (pasif) gösterilir; aktif olanda `animate-gentle-bounce` ve yeşil glow (`drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]`).
  - İçerik: Karakter görseli (h-10 w-10), takım adı (`TAKIM A/B`) ve mevcut basamak (`ladderPosition`).

3. **Merkez Panel**
  - `absolute top-1/2 left-1/2` konumlu, `transform -translate-x-[52%] -translate-y-1/2` ile ortalanır.
  - Arkaplan: `/assets/soru-arkasi.png`, `scale(1.15)` uygulaması.
  - İçinde büyük "SORUYU GÖSTER" butonu: 48x48 px, dairesel, sarı→turuncu gradient, `animate-pulse` ve `animate-ping` efektleriyle çift katmanlı glow.
  - Buton metni iki satır, text-white, font-bold, drop-shadow.

---

### 4.6 SORU AKTİF EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png
- Üç kolonlu düzen:
  - Sol: Takım A bilgisi (flex-1)
  - Orta: Soru ve cevaplar (flex-[2])
  - Sağ: Takım B bilgisi (flex-1)

**Bileşenler:**

1. **Üst Kısım**
   - Publisher logo
   - Soru sayacı banner
   - **Süre sayacı (süreli modda):**
     - Görsel: /assets/sure.png (h-14)
     - Position: Sağ üst
     - Text üzerinde: "Süre: XX" (XX = kalan saniye)
       - Süreli modda: Gerçek sayı (30'dan geriye sayar)
       - Süresiz modda: "---" gösterilir
     - Font: text-amber-900, font-bold, text-xl, drop-shadow-sm
     - **ÖNEMLİ:** Cevap seçildiğinde süre DURUR
    - Timer panelinin hemen altında `AudioControls orientation="vertical" className="mt-1"`; müzik/sfx butonları ve tam ekran togglesı üst üste dizilir.

2. **Soru Alanı (Orta)**
   - Soru panel: /assets/soru-arkasi.png
   - Soru metni:
     - text-white, text-lg (18px)
     - font-bold, text-center
     - paddingTop: 80px (yukarıdan boşluk)
   - Soru görseli (opsiyonel): max-h-32, w-48

3. **Cevap Butonları**
   
   **Multiple Choice (4 şık):**
   - Grid: 2x2 düzen (grid-cols-2)
   - gap-4
   - Her buton:
     - Görsel: /assets/genel-buton.png (h-14, min-w-[200px])
     - Seçili doğru: /assets/correct-button.png
     - Seçili yanlış: /assets/wrong-button.png
     - Hover: scale-105
     - Üzerinde şık metni: text-sm

   **True/False (2 şık):**
   - Dikey düzen (flex-col)
   - gap-4
   - Buton boyutları aynı

   **Classic (Manuel değerlendirme):**
   - İlk aşama: "CEVABI GÖSTER" butonu
   - İkinci aşama (cevap gösterildi):
     - **Cevap başlığı:**
       - "CEVAP:" (text-xl, font-bold, text-yellow-300, mb-3)
       - Ortalanmış, üstte
     - **Cevap metni:**
       - text-2xl, font-bold, text-white
       - drop-shadow-lg
       - Direkt soru altında, banner/kutu YOK
       - **ÖNEMLİ:** Cevap butona basıldıktan sonra da KALIR
     - **Değerlendirme butonları (sadece cevap verilmeden önce):**
       - 2 buton: "✅ Doğru Bildi" / "❌ Yanlış Bildi"
       - Grid: 2 sütun, gap-4
       - Görsel: /assets/correct-button.png ve /assets/wrong-button.png
       - Butona basıldıktan sonra butonlar gizlenir ama cevap görünür kalır
     - Spacing: space-y-6 (cevap ve butonlar arası)

4. **DEVAM ET Butonu**
   - Cevap verildikten SONRA görünür
   - Sağ tarafta sabit pozisyon (fixed right-8)
   - Görsel: /assets/devam-et.png
   - Küçük boyut: w-24 h-10
   - Hover: scale-110, parlama efekti
   - **ÖNEMLİ:** Otomatik geçiş YOK, kullanıcı bu butona basmalı

5. **Alt Paneller (Takım Bilgileri)**
   - Ekranın altında, 2 takım yan yana
   - Her takım banner:
     - h-20, min-w-[240px]
     - **Sırası olan takım:** 
       - /assets/correct-button.png (yeşil)
       - Çok hafif bounce animasyonu: `animate-gentle-bounce`
         - Custom keyframe: translateY(0) → translateY(-5px) → translateY(0)
         - Duration: 2s, ease-in-out, infinite
       - Yeşil glow efekti: `drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]`
     - **Sırası olmayan takım:** /assets/genel-buton.png (mor)
     - Dinamik: currentTurn === 'A' ? yeşil + efektler : mor
   - İçerik: Karakter görseli (h-10 w-10) + Takım adı + Basamak sayısı
   - Gap: gap-8

**Önemli Notlar:**
- True/False sorularda correct_answer "true" veya "false" string olarak gelir
- Cevap kontrolü: answer seçimi === correct_answer

---

### 4.7 MERDİVEN İLERLEME EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png
- İki bağımsız merdiven: Sol (Takım A), Sağ (Takım B)

**Z-Index Hiyerarşisi (Önden Arkaya):**
1. **z-50:** Karakterler ve Devam Et Butonu (en önde)
2. **z-40:** Tebrikler Banner'ı
3. **z-30:** Soru Sayacı ve Skor Paneli
4. **z-10:** Basamaklar (arka planda)

**Sliding Window Sistemi:**
- **Ekranda görünen basamak sayısı:** 10 (sabit)
- **Başlangıç:** 1-10 arası basamaklar gösterilir
- **İlerleme:** Karakter ilerledikçe window kayar
  - Örnek: Karakter 15. basamaktaysa → 12-21 arası gösterilir
  - Window start = max(1, position - 3)

**Basamak Boyutları:**
- Width: 180px + (stepIndex * 8) → 180px başlangıç, her adımda +8px
- Height: 45px (sabit)
- Border-radius: 12px 32px 32px 12px (sol köşeler hafif, sağ köşeler daha yuvarlak)
- **Görsel:** `/steps/level-{n}.png` dosyaları doğrudan kullanılır, üzerine ek border/gradient uygulanmaz
- Drop-shadow: Filtre ile uygulanır (aktif basamakta takım renginin light tonu, diğer durumlarda nötr siyah ton)
- **Z-Index:** z-10 (Basamaklar arka planda, karakterlerin altında)

**Basamak Görsel Eşleşmesi:**
- 1–9 → `/steps/level-1.png`
- 10–19 → `/steps/level-2.png`
- 20–29 → `/steps/level-3.png`
- 30–39 → `/steps/level-4.png`
- 40–49 → `/steps/level-5.png`
- 50+ → `/steps/level-6.png`
- Her iki takım da aynı görselleri kullanır; fark sadece drop-shadow tonlarında yansır

**Üst Katman Bileşenleri:**
- **AudioControls:** `absolute top-4 right-4`, dikeyde `gap-2`, `z-30`; müzik ve efekt sesleri için toggle butonları içerir.
- **Soru Sayacı Bannerı:** `absolute top-4 left-4 z-30`; görsel `/assets/soru-sayac-banneri.png`, boyut `h-14 md:h-16 lg:h-20`; metin `SORU X/Y` olarak merkezde `text-white font-bold`.
- **Skor Parşömen Paneli:** `absolute bottom-32 md:bottom-36 left-1/2 -translate-x-1/2 z-30`; görsel `/score-scroll.png`, genişlik `w-72 md:w-80 lg:w-96`. İçeride:
  - Başlık "SKOR" (`text-amber-900`, `text-base md:text-lg lg:text-xl`).
  - Takımlar liderlik durumuna göre sıralanır; lider takım satırında 👑 emojisi görünür.
  - Satır stili: `flex items-center justify-between gap-2 bg-white/10 rounded-lg px-2 py-1`, takım avatarı `w-8 h-8` dairesel çerçeveyle gösterilir.
  - Alt kısımda hedef gösterimi: `🎯 HEDEF: {ladderTarget}` metni (`text-amber-900 font-bold text-xs md:text-sm`).
- **Tebrik Bannerı:** Doğru cevapta görünür, `absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-40`; görsel `/golden-banner.png`, genişlik `w-80 md:w-96 lg:w-[28rem]`; metin `TEBRİKLER! +{stepsGained} BASAMAK KAZANDINIZ!`.
- **Devam Et Butonu:** `absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50`; görsel `/assets/genel-buton.png` (`w-40 md:w-48 lg:w-56`); hover'da `scale-110` ve `brightness-110`, aktif durumda `scale-95`; metin "SONRAKI SORU".

**Renk Paletleri (Her 10 basamakta bir değişir):** _(Drop-shadow ve glow tonları için kullanılır)_

**Takım A:**
1. Mor (1-10): #5B21B6 → #8B5CF6
2. Mavi (11-20): #1E40AF → #3B82F6
3. Turkuaz (21-30): #0F766E → #14B8A6
4. Yeşil (31-40): #15803D → #22C55E
5. Sarı (41-50): #CA8A04 → #EAB308
6. Altın (51+): #B45309 → #F59E0B

**Takım B:**
1. Pembe (1-10): #C026D3 → #E879F9
2. Pembe-Kırmızı (11-20): #BE123C → #FB7185
3. Turuncu (21-30): #C2410C → #FB923C
4. Turuncu-Sarı (31-40): #CA8A04 → #FBBF24
5. Sarı (41-50): #A16207 → #FDE047
6. Altın (51+): #B45309 → #F59E0B

**Opacity Kontrolleri:**
- Aktif basamak (karakter üzerinde): 1 (100%)
- Geçilmiş basamaklar: 0.9 (90%)
- Henüz gelinmemiş: 0.3 (30%)

**Karakter Gösterimi:**
- Aktif basamak üzerinde karakter görseli
- Rounded-full, border
- Her zaman görünür
- Aktif basamakta yıldız efektleri (✨⭐)
- **Z-Index:** z-50 (Tebrikler banner'ının üstünde olmalı - banner z-40)
- **Animasyon (doğru cevap veren takım):**
  - **Yanlış cevap durumu:** 
    - stepsGained = 0 ise HİÇ animasyon yapılmaz
    - correctTeam = null gönderilir (page.tsx'te: stepsGained > 0 ? lastCorrectTeam : null)
    - Her iki karakter de kendi pozisyonunda SABİT durur
    - animatedSteps başlangıçta stepsGained'e eşit olur (0)
  - **Doğru cevap durumu:** 
    - stepsGained > 0 ve correctTeam = "A" | "B" gönderilir
    - Sadece doğru cevap veren takımın karakteri animasyon yapar
    - Diğer takım sabit durur
  - **Adım adım zıplama sistemi:**
    - Karakter başlangıç pozisyonundan başlar
    - Her basamağı teker teker zıplayarak çıkar
    - Örnek: 3 basamak kazandıysa → 3 kez zıplar
    - Her zıplama arası: 500ms bekleme
    - Her zıplama süresi: 300ms
  - **Frame animasyonu (Hızlı Kedi için):**
    - 3 frame'li sprite animasyon
    - Frame görselleri: /hero/animation/hizli-kedi/1.png ~ 3.png
    - Frame süreleri: 
      * Frame 1: 100ms
      * Frame 2: 150ms (daha uzun - zıplamanın tepesi)
      * Frame 3: 100ms
    - Toplam süre: 350ms
    - Frame sırası: 1 → 2 → 3 → tekrar 1
    - Sadece zıplarken aktif (isJumping=true)
    - Diğer zamanlarda normal görsel gösterilir
  - **Zıplama animasyonu (`animate-ladder-jump`):**
    - 3 kademeli zıplama: 20px → 15px → 10px
    - Her zıplamada hafif scale efekti (1.1 → 1.08 → 1.05)
    - Duration: 1.5s, ease-out, forwards
  - **State yönetimi:**
    - `animatedSteps`: Kaç basamak animasyon tamamlandı
      * Yanlış cevap (stepsGained = 0): animatedSteps = 0 → pozisyon sabit
      * Doğru cevap (stepsGained > 0 && correctTeam): animatedSteps = 0'dan başla → animasyon yap
      * Doğru cevap yoksa: animatedSteps = stepsGained → pozisyon sabit (animasyon yok)
    - `isJumping`: Zıplama animasyonu aktif mi?
    - `jumpFrame`: Şu anki frame numarası (1-3)
    - Position hesaplaması: 
      * Animasyon yoksa: displayPosition = basePosition
      * Animasyon varsa: displayPosition = basePosition - stepsGained + animatedSteps
  - **Animasyon kontrolü:**
    - useEffect sadece ilk mount'ta çalışır (dependency: [])
    - stepsGained > 0 && correctTeam kontrolü
    - Her frame tamamlandığında animatedSteps artırılır
  - **Karakter görünürlüğü:**
    - Karakter her zaman görünür (baseTeamPosition > 0 ise)
    - **Yanlış cevap:** Her iki karakter de kendi pozisyonunda sabit
    - **Doğru cevap, animasyon bitti:** baseTeamPosition'da sabit
    - **Doğru cevap, animasyon devam ediyor:** Başlangıçtan (basePosition - stepsGained) adım adım çıkar
  - **Pozisyon hesaplama:**
    - Yanlış cevap veya diğer takım: `displayPosition = baseTeamPosition`
    - Animasyon devam ediyor: `displayPosition = baseTeamPosition - stepsGained + animatedSteps`
    - Animasyon bitti: `displayPosition = baseTeamPosition`
  - Diğer takımın karakteri statik

**Karakter Boyutları:**
- Mobil: w-16 h-16 (64px)
- Desktop: w-20 h-20 (80px)
- object-contain p-1 (padding ile kesilme önlenir)
- Glow efekti: drop-shadow beyaz tonda
- Rozet: w-6 h-6 (mobil), w-7 h-7 (desktop)

**Dikey Pozisyon:**
- Bottom: 10% ile 75% arası eşit dağıtılmış
- Her basamak arası spacing: 65 / 9 ≈ 7.2%

**Yatay Pozisyon:**
- Takım A: left başlangıç 8%, her basamakta +3% merkeze doğru
- Takım B: right başlangıç 8%, her basamakta +3% merkeze doğru

**Soru Sayacı (Sol üst):**
- Görsel: /assets/soru-sayac-banneri.png (h-14~20)
- Position: top-4 left-4
- **Z-Index:** z-30
- Text: "SORU X/Y"
  - Position: top-[35%] (aşağı indirildi)
  - Font: text-base~xl (büyütüldü), font-bold, text-white
  - drop-shadow-lg

**Tebrikler Banner'ı (Üstte, ortada):**
- Görsel: /golden-banner.png
- Position: top-4, ortalanmış
- **Z-Index:** z-40
- Animasyon: animate-pulse
- Text: "TEBRİKLER! +X BASAMAK KAZANDINIZ!"
  - marginTop: -8px (yukarı taşındı)
  - Font: text-sm~lg, font-bold, text-white
  - Sadece stepsGained > 0 ise gösterilir

**Skor Paneli (Ortada):**
- Görsel: /score-scroll.png (pergel şeklinde)
- Position: bottom-32, ortalanmış
- **Z-Index:** z-30
- **Başlık:** "SKOR" (top-[2%], text-amber-900, font-bold)
- **İçerik (top-[30%]):**
  - 2 takım satırı (space-y-2)
  - **Sıralama:** Lider üstte! (pozisyona göre dinamik sıralama)
  - Her satır:
    - Karakter görseli (w-8 h-8, rounded-full) - A/B harfi yerine ✅
    - Takım adı (text-amber-900, font-bold, text-sm)
    - Taç emoji (👑) - Sadece lider varsa (beraberlikte yok) ✅
    - Puan (text-amber-900, font-bold, bg-amber-100/80)
  - bg-white/10, rounded-lg, px-2 py-1
- **Hedef (bottom-[8%]):**
  - "🎯 HEDEF: X" (text-amber-900, font-bold)
  - Banner YOK - Sadece text ✅
  - Ortalanmış

**Devam Et Butonu:**
- Alt kısımda ortalanmış
- **Z-Index:** z-50 (En üstte, tüm elementlerin önünde)
- w-40 h-12
- 2 saniye sonra otomatik tıklanabilir

---

### 4.8 SÜRPRİZ OLAYI EKRANI
**Tetiklenme:** Her 3 soruda bir (3, 6, 9, 12...)

**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png

**Bileşenler:**

1. **Başlık**
   - Görsel: /assets/soru-sayac-banneri.png (h-16, max-w-[350px])
   - Üzerinde "🎉 SÜRPRİZ ZAMANI! 🎉" (text-xl, font-bold, text-purple-900)
   - marginTop: -8px (text yukarı kaydırıldı)

2. **Takım ve Şanslı Sayı Bilgisi**
   - Container: bg-purple-900/90, rounded-lg, px-8 py-4
   - Border: border-2 border-yellow-400
   - Başlık: "[Takım A/B] seçim yapıyor" (text-xl, font-bold, text-white)
   - Alt: "Şanslı sayı: X" (text-lg, font-semibold, text-yellow-300)

3. **"Bir seçenek seçin:" Başlığı**
   - text-2xl, font-bold, text-white
   - bg-purple-900/70, backdrop-blur-sm
   - py-4 px-8, rounded-lg
   - border-2 border-yellow-400
   - mb-6

4. **Seçenek Butonları**
   - **Her zaman sadece 2 seçenek:**
     1. "+X kendi takımına" (text-green-300, ⬆️ ikonu)
     2. "-X rakip takıma" (text-red-300, ⬇️ ikonu)
   - X = şanslı sayı
   - Görsel: /assets/genel-buton.png
   - Height: 100px
   - Gap: space-y-6
   - Icon boyutu: text-3xl (mr-4)
   - Text boyutu: text-2xl, font-bold
   - Hover: scale-[1.02]

5. **Seçim Yapıldıktan Sonra (Loading State)**
   - Container: max-w-lg, px-10 py-8
   - Icon: text-5xl (seçilen icon)
   - Choice text: text-xl, mt-2
   - "Seçim uygulanıyor...": text-xl, text-yellow-300
   - Spinner: h-16 w-16, border-4

6. **Alt Kısım: Takım Durumu**
   - 2 buton yan yana, gap-6
   - Her buton:
     - Görsel: /assets/genel-buton.png
     - h-16, min-width: 200px
     - İçerik: Karakter avatarı (h-10 w-10) + Takım durumu
     - Text: text-lg, font-bold, text-white
     - Avatar border: border-2 (blue-400/pink-400)
     - Gap: gap-3

**Seçenek Oluşturma Mantığı:**
```javascript
luckyNumber = rastgele(1-6)

// Her zaman sabit 2 seçenek:
choices = [
  {
    choice: `+${luckyNumber} kendi takımına`,
    effect: { type: 'gain', target: 'self', amount: luckyNumber }
  },
  {
    choice: `-${luckyNumber} rakip takıma`,
    effect: { type: 'lose', target: 'opponent', amount: luckyNumber }
  }
]
```

**Seçenek Butonları:**
- Görsel: /assets/genel-buton.png
- Renk:
  - "+X kendi takımına": text-green-300
  - "-X rakip takıma": text-red-300
- Icon: ⬆️ (kazanç), ⬇️ (kayıp)
- Seçilince: 2 saniye animasyon → efekt uygulanır → devam

**Örnek:**
```
Şanslı sayı: 2
Seçenekler:
  1. +2 kendi takımına
  2. -2 rakip takıma
```

---

### 4.9 OYUN SONU EKRANI
**Layout:**
- Fixed inset-0, h-screen, w-screen
- Background: /assets/background.png
- Confetti animasyonu (40 parça, farklı renkler, sürekli düşüş) - SADECE kazanan durumunda
- Sağ üst köşede `AudioControls` (dikey düzen, confetti üstünde z-30) müzik/efekt/fullscreen kontrolü sağlar.

**Bileşenler:**

1. **Üst Kısım: OYUN BİTTİ Banner**
   - Görsel: /golden-banner.png
   - h-20, max-width: 500px
   - Üzerinde "🎮 OYUN BİTTİ! 🎮" (text-white, font-bold, text-xl)

2. **Orta Kısım: İki Panel Yan Yana**

   **Sol Panel: Kazanan Gösterimi**
   - Panel görseli: /assets/soru-arkasi.png
   - max-w-xl, maxHeight: 480px
   
   - **KAZANAN DURUMUNDA - Podium:**
     
     **1. Sıra (Kazanan):**
     - **Glow Efekti:** 
       - Radial gradient (altın sarısı → transparent)
       - width/height: 120px, rounded-full
       - blur-2xl, opacity-60
       - Pulse animasyonu (scale 1 ↔ 1.15, 2s)
       - Merkezde konumlandırılmış (translate -50%, -50%)
     - Karakter görseli: w-24 h-24, object-contain
       - Pulse animasyonu (büyüyüp küçülme, 2s)
       - Çember YOK, border YOK, taç YOK
     - Kupa emoji: 🏆 (text-3xl, sağ alt köşede, z-20)
     - Podium: w-20 h-20, gradient (yellow-600 → yellow-300), rounded-t-lg
     - Üzerinde "1" (text-amber-900, text-2xl, font-bold)
     
     **2. Sıra (Kaybeden):**
     - **Glow Efekti:**
       - Radial gradient (gri → transparent)
       - width/height: 80px, rounded-full
       - blur-xl, opacity-40
       - Statik (animasyon yok)
       - Merkezde konumlandırılmış
     - Karakter görseli: w-14 h-14, object-contain
       - Çember YOK, border YOK
     - Podium: w-16 h-14, gradient (gray-500 → gray-300)
     - Üzerinde "2" (text-white, text-lg)
     
     **3. Sıra (Boş):**
     - Podium: w-16 h-10, gradient (amber-700 → amber-500)
     - Üzerinde "3" (text-white, text-base)

   - **BERABERLIK DURUMUNDA:**
     - Başlık: "BERABERLIK!" (text-4xl, text-yellow-400, font-bold, mb-12)
     - İki karakter yan yana:
       - Takım A: w-32 h-32, object-contain
       - Takım adı altında: bg-blue-600, rounded-full, px-4 py-2
       - Ortada: 🤝 emoji (text-5xl, animate-bounce, ml-8)
       - Takım B: w-32 h-32, object-contain
       - Takım adı altında: bg-pink-600, rounded-full, px-4 py-2

   **Sağ Panel: Final Skor**
   - Panel görseli: /score-scroll.png
   - max-w-lg, maxHeight: 580px
   
   - Başlık: "FİNAL SKOR" (text-amber-900, font-bold, text-2xl, üstte)
   
   - **Her Takım Satırı:**
     - Karakter görseli: w-10 h-10, rounded-full, border-2
     - Takım adı: text-amber-900, font-bold, text-base
     - Basamak bilgisi: text-amber-800, font-semibold, text-sm
     - Kazanan: 👑 emoji solda (index === 0 && !isTie)
     - Sıralama: ladderPosition'a göre büyükten küçüğe

3. **Alt Kısım: Tekrar Oyna Butonu**
   - Görsel: /assets/genel-buton.png
   - h-14, min-width: 220px
   - Üzerinde "TEKRAR OYNA" (text-white, font-bold, text-lg)
   - Hover: scale-105, Active: scale-95

**Kazanan Belirleme Mantığı:**
```typescript
// İki fonksiyon kullanılır:
1. determineWinner(teams, target): Hedefe ulaşan varsa kazananı döner
   - Biri hedefe ulaştıysa → O takım kazanır
   - Kimse ulaşmadıysa → 'tie' (oyun devam eder)

2. determineFinalWinner(teams): Final pozisyonlara göre kazanan
   - teamA.ladderPosition > teamB → 'A' kazanır
   - teamB.ladderPosition > teamA → 'B' kazanır
   - Eşitse → 'tie'

// GameResults'ta:
const targetWinner = determineWinner(teams, target)
if (targetWinner !== 'tie') return targetWinner
return determineFinalWinner(teams) // Sorular bittiyse
```

**CSS Animasyonlar:**
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes glow {
  0%, 100% { 
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.15);
  }
}
```

**Önemli Notlar:**
- Oyun istatistikleri KALDIRILDI
- Karakterler çembersiz, doğal halleriyle görünür
- Glow efektleri radial gradient ile doğal, yumuşak
- Kazanan karakterde altın glow + pulse animasyonu
- 2. karakterde gri glow (statik)
- Beraberlikte her iki karakter eşit büyüklükte, ortada 🤝 ikonu

---

## 5. OYUN AKIŞI VE MANTIK

### 5.1 Oyun Başlangıcı
```
1. Uygulama açılır
2. API'den reklamlar çekilir
   - Reklam varsa → Reklam ekranı (duration_seconds süresince)
   - Reklam yoksa → Doğrudan ana menü
3. Ana menü ekranı
4. "BAŞLA" butonuna tıklanır
5. Takım seçimi ekranı
   - Her iki takım isim girer
   - Her iki takım karakter seçer
   - "DEVAM ET" aktif olur
6. Oyun ayarları ekranı
   - Soru sayısı seçilir (10/20/30/40)
   - Oyun modu seçilir (Süreli/Süresiz)
   - Sürpriz sistemi açılır/kapatılır
7. "OYUNU BAŞLAT" butonuna tıklanır
8. API'den sorular çekilir
   - Yeterli soru varsa → API soruları kullanılır
   - Yetersizse → Placeholder sorulardan eklenir
9. İlk soru için "Soru Hazır" ekranı gösterilir
```

### 5.2 Soru Döngüsü
```
1. "SORUYU GÖSTER" butonuna tıklanır (veya sayaç biter)
2. Soru aktif ekranı gösterilir
   - Süreli modda: 30 saniye geri sayım başlar
   - Süresiz modda: Sayaç yok
3. Kullanıcı cevap seçer
   - Multiple Choice: A/B/C/D butonlarından biri
   - True/False: Doğru/Yanlış butonlarından biri
   - Classic: "Cevabı Göster" → Cevap gösterilir → "Doğru Bildi"/"Yanlış Bildi"
   - **ÖNEMLİ:** Cevap seçildiği anda süre DURUR (süreli modda)
4. Cevap kontrol edilir
   - Doğruysa:
     - Süreli modda: Kalan süreye göre +1/+2/+3 basamak
     - Süresiz modda: +1 basamak
     - Score +1
   - Yanlışsa: Puan değişmez
5. "DEVAM ET" butonu görünür (sağ tarafta)
6. Kullanıcı "DEVAM ET"e tıklar
7. Merdiven ilerlemesi ekranı gösterilir
   - Animasyon ile basamak yükselişi
   - Her iki takımın merdivenlerinde sliding window güncellenir
8. **Sıra değişimi:** currentTurn A ↔ B değişir
9. Sıra kontrolü yapılır
   - currentQuestion % 3 === 0 VE surpriseSystem aktif
     → Sürpriz olayı ekranı
   - Değilse → Sonraki soru veya oyun sonu kontrolü
10. Oyun sonu kontrolü:
   - Birisi hedefe ulaştı mı? (ladderPosition >= ladderTarget)
     → Oyun biter
   - Sorular bitti mi? (currentQuestion >= totalQuestions)
     → Oyun biter
```
```
1. "SORUYU GÖSTER" butonuna tıklanır (veya sayaç biter)
2. Soru aktif ekranı gösterilir
   - Süreli modda: 30 saniye geri sayım başlar
   - Süresiz modda: Sayaç yok
3. Kullanıcı cevap seçer
   - Multiple Choice: A/B/C/D butonlarından biri
   - True/False: Doğru/Yanlış butonlarından biri
   - Classic: "Cevabı Göster" → Cevap gösterilir → "Doğru Bildi"/"Yanlış Bildi"
4. Cevap kontrol edilir
   - Doğruysa:
     - Süreli modda: Kalan süreye göre +1/+2/+3 basamak
     - Süresiz modda: +1 basamak
     - Score +1
   - Yanlışsa: Puan değişmez
5. "DEVAM ET" butonu görünür (sağ tarafta)
6. Kullanıcı "DEVAM ET"e tıklar
7. Merdiven ilerlemesi ekranı gösterilir
   - Animasyon ile basamak yükselişi
   - Her iki takımın merdivenlerinde sliding window güncellenir
8. Sıra kontrolü yapılır
   - currentQuestion % 3 === 0 VE surpriseSystem aktif
     → Sürpriz olayı ekranı
   - Değilse → Sonraki soru veya oyun sonu kontrolü
9. Oyun sonu kontrolü:
   - Birisi hedefe ulaştı mı? (ladderPosition >= ladderTarget)
     → Oyun biter
   - Sorular bitti mi? (currentQuestion >= totalQuestions)
     → Oyun biter
   - Hayırsa → currentQuestion++, sıra değişir (A ↔ B), döngü tekrar
```

### 5.3 Sürpriz Olayı
```
1. Her 3. soruda (3, 6, 9, 12...) tetiklenir
2. Rastgele zar atılır (1-6) → Şanslı sayı belirlenir
3. **Her zaman 2 seçenek sunulur:**
   - "+X kendi takımına" (X = şanslı sayı)
   - "-X rakip takıma" (X = şanslı sayı)
4. Sıradaki takım seçim yapar
5. Efekt uygulanır:
   - "+X kendi takımına" → Kendi takımına +X basamak
   - "-X rakip takıma" → Rakip takıma -X basamak
6. Merdiven pozisyonları güncellenir
7. Oyun sonu kontrolü yapılır
8. Devam edilirse → Sonraki soru

Örnek:
- Şanslı sayı 2 çıkarsa:
  - Seçenek 1: "+2 kendi takımına"
  - Seçenek 2: "-2 rakip takıma"
```

### 5.4 Oyun Bitişi Koşulları
```
Oyun BİTER:
1. Bir takımın ladderPosition >= ladderTarget (Hedefe ulaştı)
   VEYA
2. currentQuestion >= totalQuestions (Tüm sorular bitti)

Kazanan Belirleme (İki Aşamalı):

1. determineWinner(teams, target) - Oyun sırasında kontrol
   - Bir takım hedefe ulaştıysa → O takım kazanır
   - İki takım da hedefe ulaştıysa → Daha yüksek pozisyonda olan kazanır
   - Kimse hedefe ulaşmadıysa → 'tie' döner (oyun devam eder)

2. determineFinalWinner(teams) - Sorular bittiğinde
   - teamA.ladderPosition > teamB.ladderPosition → 'A' kazanır
   - teamB.ladderPosition > teamA.ladderPosition → 'B' kazanır
   - Eşitse → 'tie' (beraberlik)

GameResults ekranında:
const targetWinner = determineWinner(teams, target)
if (targetWinner !== 'tie') return targetWinner
return determineFinalWinner(teams) // Sorular bitti, pozisyona bak

ÖNEMLİ: handleContinueFromLadder'da oyun bitişi kontrolü:
const winner = determineWinner(gameState.teams, gameState.ladderTarget)
const questionsExhausted = gameState.currentQuestion >= gameState.settings.questionCount
const shouldEndGame = (winner !== 'tie') || questionsExhausted
```

### 5.5 Puan Hesaplama (Süreli Mod)
```
Cevap doğruysa:
- 0-10 saniye kullanıldıysa (timeLeft >= 20) → +3 basamak
- 11-20 saniye kullanıldıysa (timeLeft >= 10) → +2 basamak
- 21-30 saniye kullanıldıysa (timeLeft < 10) → +1 basamak

Süre bittiyse (timeout):
- Cevap verilmemiş kabul edilir → Puan yok
```

### 5.6 Puan Hesaplama (Süresiz Mod)
```
Cevap doğruysa:
- +1 basamak (süre farketmez)
```

---

## 6. DOSYA YAPISI

```
/app
  page.tsx                 # Ana oyun sayfası, state yönetimi
  layout.tsx               # Root layout, font tanımları
  globals.css              # Global stiller, Baloo 2 import

/components
  AdvertisementScreen.tsx  # Reklam ekranı
  AudioControls.tsx        # Müzik/SFX toggle + fullscreen kontrol paneli
  AudioProvider.tsx        # Ses context'i, müzik ve efekt state yönetimi
  MainMenu.tsx             # Ana menü
  TeamSelection.tsx        # Takım ve karakter seçimi
  GameSettings.tsx         # Oyun ayarları
  QuestionReady.tsx        # Soru hazır ekranı
  QuestionDisplay.tsx      # Soru gösterimi (aktif)
  LadderProgress.tsx       # Merdiven ilerlemesi (sliding window)
  SurpriseEvent.tsx        # Sürpriz olayı
  GameResults.tsx          # Oyun sonu ekranı
  PublisherLogo.tsx        # Publisher logo bileşeni

/types
  game.ts                  # Oyun type tanımları
  api.ts                   # API type tanımları

/lib
  api-service.ts           # API çağrıları (fetch wrappers)
  game-utils.ts            # Oyun mantığı fonksiyonları
  asset-path.ts            # Statik asset yollarını base path ile normalize eder
  utils.ts                 # Genel yardımcı fonksiyonlar

/data
  characters.ts            # 6 karakter tanımları
  questions.ts             # Fallback sorular (API sorularını kullan)
  placeholder-questions.ts # Placeholder sorular (API yoksa)

/public
  /assets
    background.png
    soru-arkasi.png
    soru-sayac-banneri.png
    genel-buton.png
    correct-button.png
    wrong-button.png
    devam-et.png
    open-açık-butonu.png
    soru-sayısı-butonu.png
    selected-süre.png
    süreli-süresiz-butonu.png
    sure.png
    music-on.png
    music-off.png
    fx-on.png
    fx-off.png
    tam-ekran-on.png
    tam-ekran-off.png
    fullscreen-enter.svg
    fullscreen-exit.svg
    step-1.png
    step-2.png
    /characters
      (6 karakter görseli)
    /audio
      fx/
      music/
    /hero
      ...

  /steps
    level-1.png
    level-2.png
    level-3.png
    level-4.png
    level-5.png
    level-6.png
  giris-ekrani.png
  score-scroll.png
  golden-banner.png
  placeholder-logo.png

/.vscode
  settings.json            # VS Code workspace ayarları

.prettierrc                # Prettier yapılandırması
.prettierignore            # Prettier ignore dosyası
.copilot-instructions.md   # GitHub Copilot talimatları
prompt.md                  # 🔴 GÜNCEL SPESIFIKASYON
README.md                  # Proje dokümantasyonu
```

---

## 7. ÖNEMLİ NOTLAR

### 7.1 API Fallback Sistemi
- API başarısızsa placeholder sorular devreye girer
- Yetersiz soru varsa placeholder'lardan eklenir
- Asla oyun sorulardan dolayı durmamalı

### 7.2 Soru Dönüşümü
```typescript
// API formatından oyun formatına dönüştürme
function convertGameQuestionToQuestion(gq: GameQuestion): Question {
  if (gq.type === "true_false") {
    return {
      ...gq,
      options: {
        A: "Doğru",
        B: "Yanlış"
      },
      correct_answer: gq.answers.find(a => a.is_correct)?.answer_text === "Doğru" 
        ? "true" 
        : "false"
    }
  }
  
  if (gq.type === "multiple_choice") {
    return {
      ...gq,
      options: {
        A: gq.answers[0].answer_text,
        B: gq.answers[1].answer_text,
        C: gq.answers[2]?.answer_text,
        D: gq.answers[3]?.answer_text
      },
      correct_answer: ["A", "B", "C", "D"][
        gq.answers.findIndex(a => a.is_correct)
      ]
    }
  }
  
  // Classic tipi için özel işlem
}
```

### 7.5 Statik Asset Base Path Yönetimi
- Uygulama, Jenkins pipeline'ı üzerinden bir alt klasörde (ör. `/puan-merdiveni`) servis edildiğinde tüm statik dosya yollarının bu base path'i dikkate alması gerekir.
- `lib/asset-path.ts` içindeki `getAssetPath(path)` fonksiyonu, verilen relatif yolu `NEXT_PUBLIC_BASE_PATH` ile birleştirir (örn. `NEXT_PUBLIC_BASE_PATH=/puan-merdiveni`).
- Fonksiyon, `http://`, `https://` veya `//` ile başlayan tam URL'leri olduğu gibi döndürür; bu sayede uzak CDN/HTTP içerikleri bozulmaz.
- Tüm bileşenler yerel görseller, ikonlar, ses dosyaları ve arka plan görselleri için `getAssetPath` ile normalize edilmiş yolları kullanmalıdır. Bu kullanım hem `<img>` hem de `next/image` ve inline `backgroundImage` stillerinde uygulanır.
- Ses dosyaları da aynı fonksiyon üzerinden bağlanır; `AudioProvider` tüm kaynakları `getAssetPath` ile tanımlar.
- `next.config.mjs`, build sırasında aynı ortam değişkenini okuyarak `basePath`, `assetPrefix` ve `trailingSlash` ayarlarını set eder; bu sayede `/_next/*` betikleri ve stilleri de alt dizine göre otomatik yönlendirilir.

### 7.3 True/False Cevap Kontrolü
```typescript
// True/False sorularda dikkat!
if (question.type === "true_false") {
  const selectedValue = answer === "A" ? "true" : "false"
  const isCorrect = selectedValue === question.correct_answer
}
```

### 7.4 Merdiven Pozisyon Kontrolü
```typescript
// Negatif pozisyona izin verilmez
team.ladderPosition = Math.max(0, team.ladderPosition + steps)

// Hedefi aşma kontrolü (opsiyonel)
team.ladderPosition = Math.min(ladderTarget, team.ladderPosition)
```

### 7.5 Sürpriz Efekt Uygulama
```typescript
function applySurpriseEffect(
  teams: Team[], 
  currentTurn: "A" | "B", 
  choice: SurpriseChoice
): Team[] {
  return teams.map(team => {
    if (choice.effect.target === 'self' && team.id === currentTurn) {
      return {
        ...team,
        ladderPosition: Math.max(0, team.ladderPosition + (choice.effect.amount || 0))
      }
    }
    if (choice.effect.target === 'opponent' && team.id !== currentTurn) {
      return {
        ...team,
        ladderPosition: Math.max(0, team.ladderPosition - (choice.effect.amount || 0))
      }
    }
    return team
  })
}
```

### 7.6 Kazanan Belirleme
```typescript
function determineWinner(teams: Team[], target: number): "A" | "B" | "tie" {
  const teamA = teams.find(t => t.id === "A")!
  const teamB = teams.find(t => t.id === "B")!
  
  // Hedefe ulaşan varsa
  if (teamA.ladderPosition >= target && teamB.ladderPosition >= target) {
    return teamA.ladderPosition > teamB.ladderPosition ? "A" : 
           teamB.ladderPosition > teamA.ladderPosition ? "B" : "tie"
  }
  if (teamA.ladderPosition >= target) return "A"
  if (teamB.ladderPosition >= target) return "B"
  
  // Sorular bittiyse pozisyona göre
  if (teamA.ladderPosition > teamB.ladderPosition) return "A"
  if (teamB.ladderPosition > teamA.ladderPosition) return "B"
  return "tie"
}
```

---

## 8. TASARIM PRENSİPLERİ

### 8.1 Renk Paleti
- **Ana arka plan:** Özel arka plan görseli (/assets/background.png)
- **Paneller:** Oyun temalı dekoratif görseller
- **Butonlar:** Görsel asset'ler (hover: scale-105)
- **Metin:**
  - Başlıklar: text-white, font-bold
  - Alt başlıklar: text-amber-900 (banner üzerinde)
  - Vurgu: text-yellow-300/400
  - Bilgi: text-white/80

### 8.2 Tipografi
- **Font:** Baloo 2 (global)
- **Başlıklar:** text-xl ~ text-2xl, font-bold
- **Sorular:** text-lg (18px), font-bold
- **Buton metinleri:** text-base ~ text-sm, font-bold
- **Bilgi metinleri:** text-xs ~ text-sm

### 8.3 Spacing & Sizing
- **Ekran padding:** px-4 ~ px-8, py-4 ~ py-8
- **Component gap:** gap-4 ~ gap-8
- **Buton boyutları:**
  - Küçük: w-24 h-10
  - Orta: w-40 h-12
  - Büyük: w-48 h-14
  - Ekstra büyük: w-64 h-16

### 8.4 Animasyonlar
- **Geçişler:** transition-all duration-300
- **Hover:** scale-105, transform
- **Pulse:** animation: pulse 2s infinite (kazanan için)
- **Bounce:** animation: bounce 1s infinite (taç için)
- **Confetti:** sürekli düşüş animasyonu (oyun sonu)

### 8.5 Responsive (Opsiyonel)
- Birincil hedef: Desktop (1920x1080)
- İkincil hedef: Tablet landscape (1024x768)

### 8.6 Ses & Fullscreen Kontrolleri
- `AudioControls` bileşeni tüm ana ekranların sağ üstünde görünür (Ana Menü, Takım Seçimi, Oyun Ayarları, Soru Hazır, Soru Aktif, Merdiven, Oyun Sonu).
- Varsayılan düzen dikeydir; müzik ve efekt butonları üst üste, tam ekran togglesı en altta yer alır.
- Butonlar yuvarlak, şeffaf arka planlı, `hover:scale-[1.05]` ile büyür, `drop-shadow-md` ile ayrışır.
- İkonlar:
  - Müzik: `/assets/music-on.png` ↔ `/assets/music-off.png`
  - Efekt: `/assets/fx-on.png` ↔ `/assets/fx-off.png`
  - Tam ekran: `/assets/tam-ekran-on.png` ↔ `/assets/tam-ekran-off.png`
- `compact` prop'u ikonları 40px boyutuna indirger (şu an kullanılmıyor, ileride mobilde kullanılabilir).
- `showFullscreen` prop'u tam ekran togglesını isteğe göre gizler (varsayılan: true).
- `use-fullscreen` hook'u ile `<body>` hedef alınır; `isFullscreen` state'i ikon ve ARIA etiketlerini günceller.
- Mobil: Desteklenmeyebilir (oyun karmaşık)

---

## 9. TEST SENARYOLARı

### 9.1 Normal Oyun Akışı
```
1. Reklam gösterilir (varsa)
2. Takımlar oluşturulur
3. 20 soru, süreli mod, sürpriz açık seçilir
4. 20 soru cevaplanır
5. 3, 6, 9, 12, 15, 18. sorularda sürpriz tetiklenir
6. Birisi 50 basamağa ulaşır veya 20 soru biter
7. Kazanan gösterilir
```

### 9.2 API Başarısız
```
1. API timeout/404 döner
2. Placeholder sorular devreye girer
3. Oyun normal şekilde devam eder
```

### 9.3 Yetersiz Soru
```
1. API'den 15 soru gelir
2. Kullanıcı 20 soru seçer
3. 15 API sorusu + 5 placeholder sorusu kullanılır
4. Oyun normal şekilde devam eder
```

### 9.4 Beraberlik
```
1. 10 soru oynanır
2. Her iki takım da 12 basamakta
3. Sorular biter
4. "BERABERE!" mesajı gösterilir
```

### 9.5 Süreli Mod Timeout
```
1. Soru gösterilir
2. 30 saniye geçer
3. Cevap verilmemiş sayılır
4. Puan eklenmez
5. Sonraki soruya geçilir
```

---

## 10. SON KONTROL LİSTESİ

### API
- [ ] Soru endpoint entegrasyonu
- [ ] Reklam endpoint entegrasyonu
- [ ] Publisher logo endpoint entegrasyonu
- [ ] Callback endpoint entegrasyonu
- [ ] Hata yönetimi ve fallback

### Ekranlar
- [ ] Reklam ekranı (süre sayacı, X butonu)
- [ ] Ana menü
- [ ] Takım seçimi (3x2 grid, 6 karakter)
- [ ] Oyun ayarları (4 soru sayısı, 2 mod, toggle)
- [ ] Soru hazır (sayaç, süre)
- [ ] Soru aktif (3 tip soru, DEVAM ET butonu)
- [ ] Merdiven (sliding window, renk tiers, animasyon)
- [ ] Sürpriz olayı (zar, seçenekler)
- [ ] Oyun sonu (podium, skor, confetti)

### Oyun Mantığı
- [ ] Soru döngüsü
- [ ] Sıra değişimi (A ↔ B)
- [ ] Puan hesaplama (süreli/süresiz)
- [ ] Merdiven ilerlemesi
- [ ] Sürpriz sistemi (her 3 soruda)
- [ ] Oyun bitişi (hedef veya soru bitişi)
- [ ] Kazanan belirleme

### Veri Yönetimi
- [ ] API soru dönüşümü (GameQuestion → Question)
- [ ] Placeholder soru ekleme
- [ ] True/False cevap kontrolü
- [ ] Classic soru manuel değerlendirme
- [ ] State yönetimi (GameState)

### Görsel & Animasyon
- [ ] Tüm asset'ler yerinde
- [ ] Hover efektleri
- [ ] Geçiş animasyonları
- [ ] Merdiven sliding window
- [ ] Confetti efekti
- [ ] Karakter görselleri

### Font & Tipografi
- [ ] Baloo 2 global import
- [ ] Doğru font boyutları
- [ ] Okunabilirlik

---

## 11. BUILD & DAĞITIM

- Next.js `output: "export"` modunda çalışır; `pnpm build` komutu çalıştırıldığında otomatik olarak statik HTML çıktı üretir.
- Build script'i, `NEXT_PUBLIC_BASE_PATH` tanımlı değilse otomatik olarak `/puan-merdiveni` değerini atar. Gerekirse aşağıdaki seçeneklerle değiştirilebilir:
  - Farklı path: `NEXT_PUBLIC_BASE_PATH=/farkli-path pnpm build` veya `BUILD_BASE_PATH=/farkli-path pnpm build`
  - Base path'siz paket: `DISABLE_BASE_PATH=true pnpm build`
- Çıktı klasörü kökte `out/` olarak oluşur ve içinde `index.html` ile tüm sayfalar bulunur (merdiven ekranı vb. alt sayfalar static olarak erişilir).
- Statik çıktıyı yerelde görüntülemek için:
  - `pnpm build` → `out/` klasörü oluşur.
  - `pnpm dlx serve out` komutu ile klasörü basit bir HTTP sunucusunda barındırabilirsiniz.
- `output: "export"` nedeniyle `next start` kullanılmaz; dağıtım statik dosyaların herhangi bir CDN veya statik hosting hizmetine yüklenmesiyle yapılır.
- `images.unoptimized = true` olduğu için tüm `<img>` etiketleri doğrudan `/public` altındaki varlıklara referans verir; ek optimize aşaması gerekmiyor.

---

## 12. SON GÜNCELLEMELER (04.01.2025)

### Merdiven Animasyon Sistemi

#### Frame Animasyon
- **Desteklenen Karakterler:** hizli-kedi, minik-dinazor, sihirbaz, tekno-robot, uzay-kasifi, zeka-ustasi
- **Frame Yapısı:** Her karakter için 3 frame (`1.png`, `2.png`, `3.png`)
- **Klasör Yapısı:** `/public/hero/animation/[karakter-id]/`
- **Frame Timing:**
  - Frame 1: 100ms
  - Frame 2: 150ms
  - Frame 3: 100ms
  - Toplam: 350ms per basamak
- **Adımlar Arası:** 150ms bekleme

#### Animasyon Akışı
1. **Başlangıç:** Karakter fade-in (500ms)
2. **500ms Bekleme:** Karakter tam görünür
3. **Adım 1:** Pozisyon 1'e atla + 3 frame animasyon
4. **150ms ara**
5. **Adım 2:** Pozisyon 2'ye atla + 3 frame animasyon
6. **150ms ara**
7. **Adım 3:** Pozisyon 3'e atla + 3 frame animasyon
8. **Bitti**

#### Takım B Yansıtma
- **Parent Container:** `transform: scaleX(-1)` (Takım B için)
- **Badge:** `transform: scaleX(-1)` (Tekrar ters çevir, text düz görünsün)
- **Sonuç:** Karakter sola bakar, badge düz

#### Karakter Özellikleri
- **Boyut:** `w-20 h-20` (küçük ekran), `w-24 h-24` (büyük ekran)
- **80px × 80px** (küçük), **96px × 96px** (büyük)
- **object-contain:** Karakterler kesilmeden gösterilir
- **Glow Efekti:** Doğal renkli glow (mavi/pembe)

#### Aktif Karakter Bounce
- **Aktif Takım:** `currentQuestion % 2 === 1 ? "A" : "B"`
- **Bounce Animasyon:** 8px yukarı-aşağı, 1.5s döngü, infinite
- **CSS:** `animate-idle-bounce`
- **Durum:** Basamak çıkma animasyonu yokken aktif

#### Yanlış Cevap Bug Fix
- **Sorun:** `stepsGained` state'i yanlış cevap durumunda 0'a set edilmiyordu
- **Çözüm:** `else { setStepsGained(0) }` eklendi (`page.tsx` line 286-288)
- **Component Cleanup:** useRef ile timeout'lar takip edilip temizleniyor
- **React Strict Mode:** Çift mount desteği (cleanup ile)

### Beraberlik Ekranı

#### Layout
```
┌──────────────────────────┐
│                          │
│      BERABERLIK!         │  ← Başlık (yukarıda)
│                          │
│   🧙‍♂️    🤝    🧙‍♂️        │  ← Karakterler + İkon
│  TAKIM A      TAKIM B    │
│                          │
└──────────────────────────┘
```

#### Özellikler
- **Başlık:** "BERABERLIK!" (text-4xl, yellow-400)
- **Container marginTop:** 20px
- **Başlık margin-bottom:** 12 (mb-12)
- **Karakterler marginTop:** -20px
- **Karakterler arası gap:** 16 (gap-16)
- **🤝 İkon:** text-5xl, mb-16, animate-bounce
- **Karakter Boyutu:** w-32 h-32 (128px × 128px)
- **Çember Yok:** object-contain, border yok
- **Skor Bilgisi Yok:** Sadece karakterler ve takım isimleri

#### Final Skor Paneli (Beraberlik)
- **Başlık:** "FİNAL SKOR" (her durumda)
- **👑 İkonu:** Beraberlikte görünmez
- **Tüm Skorlar:** Her iki takım eşit şekilde listelenir

#### Winner Durumu
- **Sol Panel:** Podyum + Taç + Kupa
- **Sağ Panel:** 👑 ikonu kazanan takımda
- **Confetti:** Sadece kazanan durumunda

### Kod Yapısı

#### LadderProgress.tsx
```typescript
// State
const timeoutsRef = useRef<NodeJS.Timeout[]>([]) // Timeout tracking
const [animatedSteps, setAnimatedSteps] = useState(
  stepsGained === 0 || !correctTeam ? stepsGained : 0
)
const [isJumping, setIsJumping] = useState(false)
const [jumpFrame, setJumpFrame] = useState(1)

// useEffect - 500ms delay before animation
useEffect(() => {
  setShowAnimation(true)
  if (stepsGained === 0 || !correctTeam) return
  
  const initialDelay = setTimeout(() => {
    performJump(1)
  }, 500)
  
  timeoutsRef.current.push(initialDelay)
  
  return () => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }
}, [])

// Frame animasyon için karakter kontrolü
(character.id === 'hizli-kedi' || character.id === 'minik-dinazor' || 
 character.id === 'sihirbaz' || character.id === 'tekno-robot' ||
 character.id === 'uzay-kasifi' || character.id === 'zeka-ustasi')
  ? `/hero/animation/${character.id}/${jumpFrame}.png`
  : character.image

// Basamak görseli seçimi (ortak kullanım)
const getStepAsset = (stepValue: number) => {
  if (stepValue >= 50) return "/steps/level-6.png"
  if (stepValue >= 40) return "/steps/level-5.png"
  if (stepValue >= 30) return "/steps/level-4.png"
  if (stepValue >= 20) return "/steps/level-3.png"
  if (stepValue >= 10) return "/steps/level-2.png"
  return "/steps/level-1.png"
}

const stepImageSrc = getStepAsset(stepValue)
const stepImageFilter = isActiveStep
  ? `brightness(1.1) drop-shadow(0 12px 22px ${lightColor}66)`
  : isPassed
    ? 'brightness(0.95) drop-shadow(0 8px 16px rgba(0,0,0,0.35))'
    : 'brightness(0.85) drop-shadow(0 6px 12px rgba(0,0,0,0.25))'
```

#### GameResults.tsx
```typescript
// Beraberlik kontrolü
const winnerResult = determineWinner(gameState.teams, gameState.ladderTarget)
const isTie = winnerResult === 'tie'
const winner = !isTie ? gameState.teams.find(team => team.id === winnerResult) : null

// Takımlar
const teamA = gameState.teams.find(t => t.id === "A")
const teamB = gameState.teams.find(t => t.id === "B")

// Confetti sadece kazanan durumunda
{showCelebration && !isTie && (
  <div className="confetti">...</div>
)}
```

#### page.tsx
```typescript
// Yanlış cevap fix
if (isCorrect) {
  const steps = calculateStepsGained(gameState.timeLeft, gameState.settings.gameMode)
  setStepsGained(steps)
  setLastCorrectTeam(currentTeam)
} else {
  setStepsGained(0) // ← YENİ: Yanlış cevap = 0 basamak
}

// LadderProgress key prop (force remount)
<LadderProgress
  key={`ladder-${gameState.currentQuestion}`}
  gameState={gameState}
  onContinue={handleContinueFromLadder}
  stepsGained={stepsGained}
  correctTeam={stepsGained > 0 ? lastCorrectTeam : null}
/>
```

### CSS Animasyonlar (globals.css)

```css
/* Merdiven basamak çıkma */
@keyframes ladder-jump {
  0% { transform: translateY(0) scale(1); }
  15% { transform: translateY(-20px) scale(1.1); }
  30% { transform: translateY(0) scale(1); }
  45% { transform: translateY(-15px) scale(1.08); }
  60% { transform: translateY(0) scale(1); }
  75% { transform: translateY(-10px) scale(1.05); }
  90% { transform: translateY(0) scale(1); }
  100% { transform: translateY(0) scale(1); }
}

.animate-ladder-jump {
  animation: ladder-jump 1.5s ease-out forwards;
}

/* Aktif karakter bounce */
@keyframes idle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-idle-bounce {
  animation: idle-bounce 1.5s ease-in-out infinite;
}
```

### Bilinen Sorunlar ve Çözümler

#### 1. React Strict Mode Çift Mount
- **Sorun:** Development'ta component iki kere mount oluyor
- **Çözüm:** useEffect cleanup fonksiyonu ile timeout'ları temizleme
- **Kod:** `useRef` + `return () => clearTimeout`

#### 2. Yanlış Cevap Animasyon Tekrarı
- **Sorun:** Yanlış cevap durumunda eski animasyon tekrarlıyordu
- **Kök Neden:** `stepsGained` state'i güncellenmiyordu
- **Çözüm:** `else { setStepsGained(0) }`

#### 3. Son Basamak Tek Frame
- **Sorun:** Son basamakta sadece 1 frame gösteriliyordu
- **Kök Neden:** `setAnimatedSteps(currentStep)` çok erken çağrılıyordu
- **Çözüm:** `setAnimatedSteps`'i performJump başında çağır

#### 4. İlk Basamak Animasyon Yok
- **Sorun:** İlk basamakta animasyon yoktu (özel durum kodu vardı)
- **Çözüm:** 500ms bekleme eklendi, özel durum kaldırıldı

#### 5. Takım B Badge Ters
- **Sorun:** Karakter yansıtılınca badge de ters dönüyordu
- **Çözüm:** Badge'e de `scaleX(-1)` (çift negatif = pozitif)

---

## 12. SONUÇ

Bu spesifikasyon, "Puan Merdiveni" oyununu sıfırdan inşa etmek için gereken TÜM bilgileri içerir. Tüm ekranlar, boyutlar, renkler, animasyonlar, API entegrasyonları, oyun mantığı ve veri yapıları detaylı olarak tanımlanmıştır.

**Bu prompt ile uygulama tek seferde oluşturulabilir.**
