# Puan Merdiveni — Üretim Promptu

> **Bu dosya oyunun tek kaynağıdır.** Kod, tasarım veya mantıkta yaptığın her değişiklikten sonra burayı güncelle ki başka bir yapay zekâ bu promptu tek seferde alıp oyunu sıfırdan oluşturabilsin.

---

## 0. Tek Kaynak Politikası
- `prompt.md` güncel değilse geliştirme yapılmış sayılmaz.
- Yeni ekran/bileşen → Bölüm 8'e ekle, dosya yapısına Bölüm 3'te değin.
- Mantık/akış → Bölüm 9-10'da güncelle.
- Veri modeli → Bölüm 5'i güncelle.
- Stil/asset → Bölüm 6 ve ilgili ekran açıklamalarına ekle.
- API → Bölüm 7'yi güncelle.

---

## 1. Amaç & Genel Bakış
İki takımın sırayla soruları cevaplayıp dijital bir merdivende basamak çıkmaya çalıştığı interaktif bilgi yarışması. Oyun, büyük ekran (1920×1080) deneyimi için tasarlandı ve tüm akışı tek sayfalık bir Next.js uygulaması (`app/page.tsx`) yönetiyor.

Ana akış: Reklam → Ana Menü → Takım & karakter seçimi → Oyun ayarları → “Soru hazır” → Aktif soru → Merdiven ilerlemesi → (opsiyonel) Sürpriz olayı → Sonuçlar → Tekrar.

---

## 2. Teknoloji & Araçlar
- **Next.js 14.2.16** (App Router, `output: "export"`).
- **React 18.x** (`use client` bileşenleri yoğun).
- **TypeScript 5.x**.
- **Tailwind CSS 4** + `tw-animate-css`.
- **shadcn/ui** bileşen kütüphanesi (tüm `components/ui/**` hazır fakat oyunda sınırlı kullanılıyor).
- **Baloo 2** Google Font (400–800 ağırlıkları, `--font-sans`).
- **Audio**: Standart `HTMLAudioElement` kontrollü `AudioProvider` ile.
- **Yardımcı kütüphaneler**: `clsx`, `tailwind-merge`, `next-themes`, `@vercel/analytics`, `react-hook-form` (şu an yalnızca altyapı), `zod` (şu an kullanılmıyor ama hazır), `lucide-react` (ikon seti hazır).

---

## 3. Proje Yapısı
```
app/
  layout.tsx        # Font, AudioProvider, Analytics
  page.tsx          # Tüm oyun akışı ve ekran geçişleri
  globals.css       # Tailwind, animasyon tanımları
components/
  AdvertisementScreen.tsx
  AudioControls.tsx
  AudioProvider.tsx
  GameResults.tsx
  GameSettings.tsx
  LadderProgress.tsx
  MainMenu.tsx
  PublisherLogoBadge.tsx
  QuestionDisplay.tsx
  QuestionReady.tsx
  SurpriseEvent.tsx
  TeamSelection.tsx
  theme-provider.tsx
  ui/**             # shadcn scaffold
ci/pipeline.groovy   # Jenkins dağıtım pipeline'ı
scripts/
  build.cjs          # Base path aware Next build
  optimize-images.mjs
lib/
  api-service.ts
  asset-path.ts
  game-utils.ts
  local-question-pack.ts
  utils.ts (Tailwind sınıf birleştirme)
data/
  characters.ts
  placeholder-questions.ts
  questions.ts (örnek, prod’da kullanılmıyor)
hooks/
  use-fullscreen.ts
  use-mobile.ts
  use-toast.ts
public/
  assets/** (UI görselleri)
  audio/** (music & sfx)
  hero/**  (karakter görselleri + animasyon frame'leri)
README.md
prompt.md (bu dosya)
```

---

## 4. Build & Çalıştırma
- Node.js 18+ ve `pnpm` önerilir (`pnpm install`, `pnpm dev`).
- `scripts/build.cjs`, `NEXT_PUBLIC_BASE_PATH` çevresel değişkenini otomatik belirler (varsayılan `/puan-merdiveni`). `DISABLE_BASE_PATH=true pnpm build` ile kökten yayınlanabilir.
- `next.config.mjs`: `output:'export'`, `images.unoptimized`, `trailingSlash:true`. Base path varsa `assetPrefix` eşleşir.
- `pnpm optimize:images` lossless PNG/JPEG sıkıştırması yapar.
- Kod formatı: Prettier (VS Code format on save), ESLint build sırasında pas geçiliyor fakat lokalde `pnpm lint` çalıştırılabilir.

---

## 5. Veri Modelleri
### 5.1 Oyun Tipleri (`types/game.ts`)
```ts
export type GameScreen =
  | "advertisement"
  | "main-menu"
  | "team-selection"
  | "game-settings"
  | "question-ready"
  | "question-active"
  | "ladder-progress"
  | "surprise-event"
  | "game-results"

export type Character = { id: string; name: string; image: string }

export type Team = {
  id: "A" | "B"
  name: string
  character: Character | null
  score: number
  ladderPosition: number
}

export type QuestionType = "multiple_choice" | "true_false" | "classic"

export type Question = {
  id: number
  type: QuestionType
  question_text: string
  options?: { A: string; B: string; C?: string; D?: string }
  correct_answer: "A" | "B" | "C" | "D" | "true" | "false"
  publisher_id: number
  image_url?: string
  publisher_logo_url?: string
}

export type GameSettingsType = {
  questionCount: 10 | 20 | 30 | 40
  gameMode: "timed" | "untimed"
  surpriseSystem: boolean
  gameCode?: string
}

export type SurpriseChoice = {
  choice: string
  probability: number
  effect: { type: "gain" | "lose" | "skip"; target: "self" | "opponent"; amount?: number }
}

export type SurpriseTracker = {
  lastTriggeredQuestion: number | null
  teamCounts: { A: number; B: number }
}

export type Advertisement = {
  id: number
  name: string
  type: "image" | "video"
  file_path: string
  file_url: string
  link_url: string
  duration_seconds: number
}

type SurpriseData = {
  luckyNumber: number
  availableChoices: SurpriseChoice[]
  selectedChoice?: SurpriseChoice
}

export type GameState = {
  currentScreen: GameScreen
  teams: Team[]
  settings: GameSettingsType
  currentQuestion: number
  totalQuestions: number
  timeLeft: number
  selectedAnswer: string | null
  answerResult: "correct" | "wrong" | null
  correctAnswer: string | null
  currentQuestionData: Question | null
  ladderTarget: number
  currentTurn: "A" | "B"
  gameStartTime: number
  publisherLogo: string | null
  publisherId: number | null
  surpriseData: SurpriseData | null
  surpriseTracker: SurpriseTracker
  questions: Question[]
  advertisements: Advertisement[]
  currentAdvertisement: Advertisement | null
  advertisementTimeLeft: number
}
```

### 5.2 API Tipleri (`types/api.ts`)
```ts
export interface ApiQuestionGroup {
  id: number
  code: string
  name: string
  question_type: "multiple_choice" | "true_false" | "classic"
  publisher: string
  logo_url?: string | null
  image_path?: string | null
  storage_url?: string | null
  available_logos?: string[]
  questions: ApiQuestion[]
}

export interface ApiQuestion {
  id: number
  question_text: string
  question_type: "multiple_choice" | "true_false" | "classic"
  image_path?: string | null
  category_id?: number | null
  answers: ApiAnswer[]
}

export interface ApiAnswer {
  answer_text: string
  is_correct: boolean
  image_path?: string | null
}

export interface GameQuestion {
  id: number
  type: "multiple_choice" | "true_false" | "classic"
  question_text: string
  options?: { A: string; B: string; C?: string; D?: string }
  correct_answer: "A" | "B" | "C" | "D" | "true" | "false"
  publisher_id: number
  image_url?: string
  publisher_logo_url?: string
}
```

### 5.3 Veri Doğrulama & Şema Kuralları
- Tüm API cevapları `zod` şemaları ile doğrulanır; build-time değil runtime validasyon hedeflenir. Minimal örnek:
  ```ts
  const apiAnswerSchema = z.object({
    answer_text: z.string().min(1),
    is_correct: z.boolean(),
    image_path: z.string().nullable().optional(),
  })

  const apiQuestionSchema = z.object({
    id: z.number().int().nonnegative(),
    question_text: z.string().min(1),
    question_type: z.enum(["multiple_choice", "true_false", "classic"]),
    image_path: z.string().nullable().optional(),
    category_id: z.number().int().nullable().optional(),
    answers: z.array(apiAnswerSchema).min(2),
  })
  ```
- Uygulamanın beklediği veri yapıları için JSON Schema referansı (AI tekrar üretimi için):
  ```json
  {
    "$id": "https://puan-merdiveni.dev/schemas/question.json",
    "type": "object",
    "required": [
      "id",
      "code",
      "name",
      "question_type",
      "publisher",
      "questions"
    ],
    "properties": {
      "id": { "type": "integer", "minimum": 0 },
      "code": { "type": "string", "minLength": 1 },
      "name": { "type": "string", "minLength": 1 },
      "question_type": { "enum": ["multiple_choice", "true_false", "classic"] },
      "publisher": { "type": "string", "minLength": 1 },
      "logo_url": { "type": ["string", "null"], "format": "uri" },
      "image_path": { "type": ["string", "null"] },
      "storage_url": { "type": ["string", "null"], "format": "uri" },
      "available_logos": {
        "type": "array",
        "items": { "type": "string" }
      },
      "questions": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "required": ["id", "question_text", "question_type", "answers"],
          "properties": {
            "id": { "type": "integer", "minimum": 0 },
            "question_text": { "type": "string", "minLength": 1 },
            "question_type": {
              "enum": ["multiple_choice", "true_false", "classic"]
            },
            "image_path": { "type": ["string", "null"] },
            "category_id": { "type": ["integer", "null"] },
            "answers": {
              "type": "array",
              "minItems": 2,
              "items": {
                "type": "object",
                "required": ["answer_text", "is_correct"],
                "properties": {
                  "answer_text": { "type": "string", "minLength": 1 },
                  "is_correct": { "type": "boolean" },
                  "image_path": { "type": ["string", "null"] }
                },
                "additionalProperties": false
              }
            }
          },
          "additionalProperties": false
        }
      }
    },
    "additionalProperties": false
  }
  ```
- Her yeni veri modeli için aynı formatta JSON Schema hazırlanmalı ve prompt'un bu bölümüne eklenmelidir.
- Validasyon hatalarında kullanıcıya gösterilmeyen, `console.warn` seviyesinde log üretilir ve placeholder veriye otomatik geçiş yapılır (Bölüm 7'deki hata yönetimi ile uyumlu).

---

## 6. Asset & Görsel Politikası
- Arkaplan: `public/assets/background.png` (tüm oyun ekranları).
- Ana menü: `giris-ekrani.png`, başlık bandı `assets/soru-sayac-banneri.png`, buton `assets/genel-buton.png`.
- Takım panelleri: `assets/soru-arkasi.png`, giriş butonları `assets/genel-buton.png`.
- Soru kartı: `assets/soru-arkasi.png`, doğru/yanlış cevap görselleri `assets/correct-button.png`, `assets/wrong-button.png`, devam `assets/devam-et.png`.
- Merdiven: basamak görselleri `public/steps/level-1.png` … `level-6.png`, skor bandı `score-scroll.png`, kutlama bandı `golden-banner.png`.
- Karakterler: `public/hero/*.png`, animasyon frameleri `hero/animation/{characterId}/{1..3}.png`.
- Publisher rozet: `assets/logo-banner.png`.
- Audio: `public/audio/music/{lobby-music.ogg, game-music.ogg}`, fx `public/audio/fx/*.mp3|wav`.
- **Asset bulunamazsa**: Yapay zekâ eksik olduğunu tespit edip uygun aksiyonu almak zorunda. Tercihler sırayla: (1) Gerekli SVG/PNG’leri kodla üret, (2) Güvenilir kaynaktan telifsiz eşdeğer indir, (3) Kullanıcıdan temin etmesini iste. Amaç, ekranların görsel uyumunu bozmadan tamamlamak.

---

## 7. API & Veri Tedariki
- Varsayılan base URL: `https://etkinlik.app/api`. `apiService.setBaseUrl()` ile `apiBaseUrl`, `api_base_url`, `apiBase`, `api` query parametreleri üzerinden override edilir.
- Soru kaynağı parametreleri: `questionsUrl`, `questionUrl`, `questions_url`, `question_url`, `questionSource`, `question_source`, `gameCode`, `code`. `extractGameCode` URL/slug içinden kodu çıkarır.
- Endpointler:
  - `GET /unity/question-groups/code/{CODE}` → soru grubu (nested JSON’lardan `ApiQuestion` çıkarılır).
  - `GET /unity/advertisements` → reklam listesi.
  - `GET /publishers/{publisherId}` → logo.
  - `POST /jenkins/callback` → oyun bitişi/istatistik.
- Headers: `Accept: application/json`, `User-Agent: WebGame/1.0`.
- `api-service.ts` özellikleri:
  - `fetchWithRetry`: 3 deneme, artan bekleme.
  - `extractQuestionsFromPayload`: derin arama, grup logo mirası.
  - `convertQuestionsToGameFormat`: doğru şık, true/false haritalaması, görseller.
  - Fallback: `getFallbackQuestions()` + `data/placeholder-questions.ts` ile eksik soru tamamlar.
  - `sendCallback` hata alsa bile oyunu durdurmaz.
- Yerel soru paketi (`lib/local-question-pack.ts`): tarayıcıda `./questions/question.json` vs dosyaları arar, isteğe bağlı logo belirler. API fallback olduğunda veya query parametre sağlanmadığında yerel paket öncelik alabilir.
- `ensureSufficientQuestions(requiredCount)`: API’den gelen listeyi karıştırılmış placeholder’larla tamamlar.
- Örnek istek/yanıt (soru grubu):
  ```http
  GET /api/unity/question-groups/code/Qg4pkUTF HTTP/1.1
  Host: etkinlik.app
  Accept: application/json
  User-Agent: WebGame/1.0
  ```
  ```json
  {
    "id": 415,
    "code": "Qg4pkUTF",
    "name": "aaaaaaaaaaaa - Puan Merdiveni - Çoktan Seçmeli",
    "question_type": "multiple_choice",
    "publisher": "ARI Yayıncılık",
    "logo_url": "https://etkinlik.app/storage/publisher-logos/publisher_logo_NKYAR8wA9oDCbS6rGejq_1749735283.png",
    "image_path": null,
    "storage_url": null,
    "available_logos": [
      "publisher-logos/publisher_logo_HAggkZ5RPZiPTAqU4W7v_1750072086aaa.png",
      "publisher-logos/publisher_logo_JFm4EJI7hv58cEiNsjA8_1749725674.jpg",
      "publisher-logos/publisher_logo_NKYAR8wA9oDCbS6rGejq_1749735283.png"
    ],
    "questions": [
      {
        "id": 2876,
        "question_text": "What is the English word for 'kedi'?",
        "question_type": "multiple_choice",
        "image_path": null,
        "category_id": 75,
        "answers": [
          { "answer_text": "dog", "is_correct": false, "image_path": null },
          { "answer_text": "cat", "is_correct": true, "image_path": null }
        ]
      }
    ]
  }
  ```
- Örnek istek/yanıt (reklam listesi):
  ```http
  GET /api/unity/advertisements HTTP/1.1
  Host: etkinlik.app
  Accept: application/json
  User-Agent: WebGame/1.0
  ```
  ```json
  [
    {
      "id": 17,
      "name": "aaa",
      "type": "image",
      "file_path": "advertisements/z559IZCu9hrZPXtIFJfvNOZIPc1HMRY29hENJtaG.jpg",
      "file_url": "https://etkinlik.app/storage/advertisements/z559IZCu9hrZPXtIFJfvNOZIPc1HMRY29hENJtaG.jpg",
      "is_active": true,
      "created_at": "2025-10-07T10:55:20.000000Z",
      "updated_at": "2025-10-07T10:55:20.000000Z",
      "grade": "2.Sınıf",
      "subject": "İngilizce",
      "start_date": "2025-10-07",
      "end_date": "2025-10-09",
      "duration": 5
    }
  ]
  ```
- Hata yönetimi kontratı:
  - Her ağ çağrısı `fetchWithRetry` ile yapılır (`maxAttempts:3`, bekleme: 0.5s → 1s → 2s).
  - 3 deneme başarısızsa ilgili fonksiyon `ApiError` (custom) döndürmez, yerine placeholder içeriğe yumuşak geçiş yapar ve `console.error` loglar.
  - Başarısız API çağrıları için kullanıcıya modal gösterilmez; ekran akışı durmamalıdır.
  - `sendCallback` hata verirse loglanır ve `Promise.resolve()` ile swallow edilir; yarışma sonunda kullanıcıya mesaj göstermeyiz.
- Performans ipuçları:
  - `Promise.allSettled` kullanarak reklamlar ve soruları paralel çek; `fulfilled` olmayan sonuçlar fallback tetikler.
  - Her istek `AbortController` ile 12s timeout’a sahiptir. Süre aşımında retry devreye girer (örn. internet kesintisi).
  - Logo indirme (`fetchPublisherLogo`) sırasında `available_logos` listesinden ilk çalışan URL tercih edilir, CDN timeout’larında sıradaki logoya geç.
  - API'den dönen `available_logos` değerleri relative path olabilir; `asset-path.ts` bu path'leri `https://etkinlik.app/storage/` öneki ile normalize eder.
  - Reklam yanıtındaki `duration` saniye cinsindedir; uygulama bunu `duration_seconds` alanına map'ler ve `link_url` alanı sağlanmadıysa `file_url` kullanılır.

---

## 8. Ekranlar & UI Detayları
Tüm ekranlar `fixed inset-0`, tam ekran `background.png`, ana katmanlar `relative z-10`.

### 8.1 Reklam (`AdvertisementScreen`)
- Tam ekran reklam görseli (`object-cover`).
- Üst sağ sayaç: `bg-black/70`, `w-16 h-16` (sayacı gösterir), süre bitince “Kapat” butonu (aynı boyut, kırmızı ton, hover koyulaşır).
- Alt sol bilgi paneli: `bg-black/70`, başlık + “daha fazla bilgi” metni.
- Kullanıcı reklamı tıkladığında `link_url` yeni sekmede açılır.

### 8.2 Ana Menü (`MainMenu`)
- Arkaplan: `giris-ekrani.png`.
- Üst sol: varsa publisher logosu küçük rozet (`PublisherLogoBadge size="sm"`).
- Üst sağ: `AudioControls` (dikey, 52px ikonlar).
- Orta: `soru-sayac-banneri.png` üzerinde “Puan Merdiveni”.
- Alt: “OYUNA BAŞLA” butonu `genel-buton.png`, `h-20`, hover `scale-105`.

### 8.3 Takım Seçimi (`TeamSelection`)
- 2 panel `flex gap-8`, her panel `soru-arkasi.png` + `scale-105`.
- Panel içi: `pt-[80px] pb-[65px] px-8`, merkezde giriş alanı (`genel-buton.png`, `h-8`), üstüne input absolute (15 karakter limit, `text-[11px]`).
- Karakter grid: 3 sütun × 2 satır, `gap-x-16 gap-y-6`, her buton `w-h 68px`, seçilince sarı outline + glow, altındaki isim `text-yellow-300 font-semibold text-[11px] drop-shadow`.
- Devam butonu `genel-buton.png` (w-40 h-12), her iki takım isim+karakter seçmeden aktif olmaz.

### 8.4 Oyun Ayarları (`GameSettings`)
- Başlık bandı `h-18`.
- Panel `max-w-3xl`, `space-y-5`.
- Soru sayısı butonları: `w-h 16`, seçili `open-açık-butonu.png`, seçim `hover:scale-110`.
- Mod butonları: `selected-süre.png` / `süreli-süresiz-butonu.png`, `h-12 min-w-120`. Metin `text-amber-900`.
- Sürpriz sistemi: aynı 16×16 butonlarla Açık/Kapalı.
- Alt: “OYUNA BAŞLA” butonu `correct-button.png`, `h-14`.

### 8.5 “Soru Hazır” (`QuestionReady`)
- Üst bar: solda soru sayacı (`soru-sayac-banneri.png` + `Soru X/Y`), altında publisher logosu. Sağda süre paneli `sure.png` (süre göstermez, `---`) ve dikey `AudioControls`.
- Sol orta: Takım A/B butonları (aktif takım `correct-button.png` + `animate-gentle-bounce`, drop shadow yeşil) ve mevcut basamak.
- Merkez panel: `soru-arkasi.png` `scale(1.15)`, ortada `w-48 h-48` dairesel sarı degrade “SORUYU GÖSTER” butonu (`animate-pulse` + `animate-ping`).

### 8.6 Aktif Soru (`question-active`)
- Üst bar `QuestionReady` ile aynı, fakat süreli modda `Süre: {timeLeft}`.
- Sol kenar: Takım panelleri (aktif olan `correct-button`), karakter avatarı, basamak sayısı.
- Merkez kart: `soru-arkasi.png`, 116% scale, padding `p-10`. İç içerik durumuna göre:
  - **Görselli soru**: Sol `max-w 220px` beyaz kartta görsel, sağda soru metni + seçenekler.
  - **True/False**: 2 kolon grid, A=Doğru, B=Yanlış. Doğru cevap `correct-button`, yanlış seçilirse doğru cevap da yeşile döner.
  - **Classic**: Önce “Cevabı Göster” butonu; sonra cevap açıklandığında `✅ Doğru Bildi` / `❌ Yanlış Bildi` butonları (kullanıcı manuel seçer).
  - **Çoktan seçmeli**: 2×2 grid, `genel-buton`, seçili/sonuç durumuna göre `correct` veya `wrong` görselleri.
- Sağ orta: Cevap verilince beliren “DEVAM ET” dikey buton (`devam-et.png`, `hover:scale-110`).

### 8.7 Merdiven (`LadderProgress`)
- Arkaplan `background.png`, AudioControls üst sağ.
- Basamaklar: Takım başına ayrı sliding window (10 görünür basamak). Basamak görseli `steps/level-{1..6}.png`, `width` basamağa göre artar, aktif basamak `scale-110`, glow.
- Karakter animasyonu: Doğru cevapta frame sırası (1→3) ile `animate-ladder-jump`. Karakter B aynalanır (`scaleX(-1)`).
- Üst sol: soru sayacı bandı + publisher logo.
- Orta alt: `score-scroll.png` üzerinde skor tablosu, lider takıma `👑`.
- Üst merkez (doğru cevapta): `golden-banner.png` + “+{steps} basamak kazandınız”.
- Alt merkez: “SONRAKİ SORU” butonu `genel-buton.png`.

### 8.8 Sürpriz Olayı (`SurpriseEvent`)
- Üstte `golden-banner` + “Sürpriz zamanı”, altında `bg-purple-900/90` bilgi kutusu.
- Ortada iki seçenekli butonlar (`genel-buton.png`), metinler `text-green-300` (kendi +), `text-red-300` (rakip -), ikonlar ⬆️/⬇️.
- Seçim sonrası 2sn bekleme + “Seçim uygulanıyor” spinner.
- Alt panel: İki takımın durumunu `genel-buton` üstünde gösterir.

### 8.9 Oyun Sonu (`GameResults`)
- Eğer kazanan varsa: orta solda podyum, kazanan karakter glow + 🏆, kaybeden 2. sırada. Beraberlikte iki karakter ve 🤝.
- Orta sağ: `score-scroll.png` içinde final skorları büyükten küçüğe, liderde `👑`.
- Üstte `golden-banner` “OYUN BİTTİ”, arkaplanda random konumlu konfeti animasyonu.
- Alt: “TEKRAR OYNA” butonu `genel-buton`.

---

## 9. Çekirdek Oyun Mantığı (`app/page.tsx`)
- Tüm state `useState<GameState>` ile tutulur; ekranlar `switch (currentScreen)`.
- **Başlangıç:** Reklam varsa gösterilir, yoksa Ana Menü.
- **Audio:** `useAudio` ile ekran setlerine göre (lobi vs oyun) otomatik müzik seçer, sonuç ekranında muzik durur.
- **Soru yükleme:** `initializeGame()` paralel olarak reklam + soruları + yerel paketi çeker. Yerel paket varsa ve query param yoksa ona geçer. Publisher logosu ilk sorudan alınır, faviconlar runtime güncellenir.
- **ensureSufficientQuestions:** eksik kalan soruları `placeholderQuestions` ile tamamlar.
- **Soru gösterimi:** “Soru hazır” → `handleShowQuestion` ile `question-active`, süreli modda sayaç 30’dan geri sayar (cevap seçilene kadar).
- **Cevaplama:** `handleAnswerClick` ile klasik/true-false/multi mantıkları ayrılır. Doğruysa `calculateStepsGained(timeLeft, mode)` (timed: >=20s → +3, >=10s → +2, aksi +1; untimed hep +1). Yanlışsa 0. `stepsGained` state’i Ladder ekranında animasyon için saklanır.
- **Takım sırası:** İlk soru Takım A (`currentTurn:"A"`), her soru sonrası `currentTurn` toggle edilir.
- **Merdiven:** `handleContinueToLadder` Ladder ekranına geçer; `handleContinueFromLadder` oyunun bitip bitmediğini kontrol eder. `determineWinner` hedefe ulaşımı inceler; ya da tüm sorular bitince `determineFinalWinner` devreye girer.
- **Sürpriz tetikleme:** `evaluateSurpriseTrigger` (Bölüm 10) ile Ladder sonrası karar verilir, tetiklenirse `SurpriseEvent` ekranı açılır ve `applySurpriseEffect` takımlara uygular.
- **Oyun sonu callback:** `apiService.sendCallback` kazanan, skor, süre bilgisi ile tetiklenir (hata fırlatmaz).
- **Tekrar:** `handlePlayAgain` state’i resetler, publisher bilgisi korunur.

### 9.1 Örnek Mantık Akış Kodları
- `initializeGame` özet akışı:
  ```ts
  const initializeGame = async () => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    const controller = new AbortController()

    try {
      const [questionsResult, adsResult] = await Promise.allSettled([
        apiService.fetchQuestions(requiredCount, controller.signal),
        apiService.fetchAdvertisements(controller.signal),
      ])

      const questions =
        questionsResult.status === "fulfilled"
          ? ensureSufficientQuestions(requiredCount, questionsResult.value)
          : getFallbackQuestions(requiredCount)

      const advertisements =
        adsResult.status === "fulfilled" ? adsResult.value : []

      setGameState(prev => ({
        ...prev,
        questions,
        advertisements,
        currentScreen: advertisements.length ? "advertisement" : "main-menu",
        publisherLogo: selectPublisherLogo(questions),
      }))
    } catch (error) {
      console.error("initializeGame failed", error)
      setGameState(prev => ({
        ...prev,
        questions: getFallbackQuestions(requiredCount),
        advertisements: [],
        currentScreen: "main-menu",
      }))
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }))
    }
  }
  ```
- `handleAnswerClick` karar tablosu:
  ```ts
  const handleAnswerClick = (answer: string) => {
    setGameState(prev => {
      if (!prev.currentQuestionData || prev.answerResult) return prev

      const { currentQuestionData: question } = prev
      const isCorrect = evaluateAnswer(question, answer)
      const steps = isCorrect
        ? calculateStepsGained(prev.timeLeft, prev.settings.gameMode)
        : 0

      return {
        ...prev,
        selectedAnswer: answer,
        answerResult: isCorrect ? "correct" : "wrong",
        correctAnswer: question.correct_answer,
        timeLeft: Math.max(prev.timeLeft, 0),
        teams: applyScore(prev.teams, prev.currentTurn, steps, isCorrect),
        stepsGained: steps,
        lastCorrectTeam: isCorrect ? prev.currentTurn : null,
      }
    })
  }
  ```
- Skor hesaplama yardımcıları:
  ```ts
  export const calculateStepsGained = (timeLeft: number, mode: GameSettingsType["gameMode"]) => {
    if (mode === "untimed") return 1
    if (timeLeft >= 20) return 3
    if (timeLeft >= 10) return 2
    return 1
  }

  const applyScore = (teams: Team[], currentTurn: Team["id"], steps: number, isCorrect: boolean) =>
    teams.map(team =>
      team.id === currentTurn
        ? {
            ...team,
            score: isCorrect ? team.score + 1 : team.score,
            ladderPosition: Math.max(0, team.ladderPosition + steps),
          }
        : team,
    )
  ```
- Sayaç davranışı: süreli modda `useEffect` içerisindeki interval, `selectedAnswer` set edildiği anda temizlenir ve Ladder ekranına geçerken tekrar başlatılmaz.

---

## 10. Sürpriz Sistemi Ayrıntıları
- Konfigürasyon (`game-utils.ts`):
  - `baseProbability: 0.3`, her sürprizsiz soru için `+pityIncrement 0.12`.
  - `cooldownQuestions: 1` → art arda tetiklenmez.
  - Takım eşitsizliği `fairnessGapThreshold: 2`; geride olan takım için olasılık artar, önde olan için azalır.
  - Fark ≤ -2 ise otomatik tetiklenir; ≥ +2 ise engellenir.
  - Random sayı `Math.random()` ile kıyaslanır.
- Sürpriz ekranında `luckyNumber` 1–6 arası, her zaman iki seçenek sunulur:
  - `+{luckyNumber} kendi takımına` → `effect: {type:'gain', target:'self'}`.
  - `-{luckyNumber} rakip takıma` → `effect: {type:'lose', target:'opponent'}`.
- Seçim sonrası 2 saniye içinde Ladder ya da Sonuç ekranına geri dönülür.
- Algoritma (pseudo-code):
  ```ts
  export const evaluateSurpriseTrigger = ({
    currentQuestion,
    settings,
    surpriseTracker,
    teams,
  }: SurpriseTriggerInput) => {
    if (!settings.surpriseSystem) return { triggered: false }
    if (currentQuestion === 0) return { triggered: false }
    if (surpriseTracker.lastTriggeredQuestion && currentQuestion - surpriseTracker.lastTriggeredQuestion <= cooldownQuestions) {
      return { triggered: false }
    }

    const scoreGap = teams[0].ladderPosition - teams[1].ladderPosition
    if (scoreGap >= fairnessGapThreshold) return { triggered: false }
    if (scoreGap <= -fairnessGapThreshold) {
      return { triggered: true, reason: "forced-comeback" }
    }

    const pityBoost = surpriseTracker.teamCounts[teams[0].id] + surpriseTracker.teamCounts[teams[1].id]
    const probability = baseProbability + pityIncrement * pityBoost

    return { triggered: Math.random() < probability, reason: "random-roll" }
  }
  ```
- `applySurpriseEffect` adımları:
  1. Seçilen etki `targetTeam` üzerinde uygulanır, `amount` yoksa varsayılan 1’dir.
  2. `ladderPosition` her zaman `Math.max(0, value)` ile sınırlandırılır.
  3. Etki sonucu negatif basamak indirimi gerçekleşirse `SurpriseTracker.teamCounts` artar (şanslı sayı daha sık gelsin diye).
  4. Uygulama tamamlandığında `lastTriggeredQuestion` güncellenir ve Ladder ekranına dönülür.
- Kenar durumları:
  - `luckyNumber` 0 olamaz; generator tekrar çekene kadar döngüde kalır.
  - Takımlar hedef basamakta ise sürpriz tetiklenmez (oyun bitmek üzereyken rasgelelik kaldırılır).
  - Classic sorularda sürpriz mantığı aynıdır; yalnızca Ladder’a geçiş onayı, manuel değerlendirme sonrası yapılır.

---

## 11. Ses Sistemi & Kontroller
- `AudioProvider`: Müzik (`lobby`, `game`) ve efekt (`button`, `correct`, `wrong`, `surprise`, `end-game`, `step-1/2/3`). Ses tercihlerı `localStorage` (`quiz-game-audio`) ile kalıcı.
- `AudioControls`:
  - Varsayılan dikey, ikon boyutu 52px (`Image` bileşeni). `orientation="horizontal"` opsiyonu mevcut.
  - Müzik/SFX toggle, durum ikonla değişir (`music-on/off.png`, `fx-on/off.png`).
  - Opsiyonel tam ekran butonu (`tam-ekran-on/off.png`), `useFullscreen` hook ile `<html>` ya da özel target’ı tam ekran yapar.
- SFX: global `document click` dinleyicisi ile bütün butonlarda `button` efekti çalar (disabled hariç).

---

## 12. Yardımcı Modüller
- `lib/asset-path.ts`: Base path normalize eder; harici URL'leri olduğu gibi bırakır.
- `hooks/use-fullscreen.ts`: Tarayıcı vendor prefix’li fullscreen API sarmalayıcısı.
- `lib/local-question-pack.ts`: JSON soru paketlerini normalize eder, görsel yollarını `URL` tabanlı çözer.
- `lib/game-utils.ts`: Merdiven hedefleri (`{10:25, 20:50, 30:75, 40:100}`), skor hesaplama, sürpriz tetikleme, kazanan belirleme yardımcıları.
- `lib/api-service.ts`: Tüm ağ istekleri, fallback sorular, callback gönderimi.
- `hooks/use-mobile.ts`: 768px altını mobil sayar (şu an kritik değil ama hazır).

---

## 13. Dağıtım & Pipeline
- Jenkins pipeline (`ci/pipeline.groovy`):
  1. Global lock dosyasıyla seri çalışır.
  2. `GAME_ID` parametresi ile build dizinleri belirlenir (puan-merdiveni = 6).
  3. Build dizini doğrulanır, `webGameDataDownloader.js` ile soru/asset indirilir.
  4. `pnpm build` sonrası `out/` içeriği zip'lenip ilgili `public_html/{gameType}` dizinine kopyalanır.
  5. Başarılı/başarısız durumlarında `CALLBACK_URL`’e JSON gönderir.
- `scripts/build.cjs`: `NEXT_PUBLIC_BASE_PATH` seçimini otomatik yapar (`/puan-merdiveni` fallback), `DISABLE_BASE_PATH` desteği.
- Statik dağıtım: `pnpm build` → `out/`, `pnpm start` kullanılmaz (export modu). Önizleme için `pnpm dlx serve out`.
- Pipeline ayrıntıları:
  - Ortam değişkenleri: `NODE_VERSION`, `PNPM_VERSION`, `GAME_ID`, `NEXT_PUBLIC_BASE_PATH`, `CALLBACK_URL`, `API_BASE_URL`.
  - Her adımda `pnpm install --frozen-lockfile` kullanılır; cache bozulursa pipeline başarısız olmalı (fail fast).
  - `webGameDataDownloader.js`, indirilen paketlerin checksum’unu doğrular; eksik asset varsa pipeline kırmızıya dönerek yöneticiyi bilgilendirir.
  - Dağıtım klasörü örneği: `/var/www/public_html/puan-merdiveni`. Altında yeni release için `release-{timestamp}` klasörü oluşturulur, symlink ile `current` güncellenir.
  - Rollback: `previous` symlink'i korunur; başarısız dağıtımda `ln -sfn previous current` çalıştırılır, `CALLBACK_URL`’e `status:"rolled_back"` gönderilir.
- Azure/Cloud dağıtımlarında tavsiyeler:
  - Statik barındırma için Azure Static Web Apps veya Netlify eşdeğer; base path gereksinimi varsa `next.config.mjs` değerleri ortam değişkeniyle eşleşmeli.
  - CDN önbelleği yayın sonrası temizlenmeli (`/assets/*`, `/audio/*` varyasyonları). Jenkins adımlarına opsiyonel `purgeCdn()` eklenebilir.
  - Monitoring: `Application Insights` / `Sentry` entegrasyonu için `NEXT_PUBLIC_SENTRY_DSN` ortam değişkeni ile conditional import yapılabilir.
- Güvenlik ve uyumluluk:
  - Pipeline loglarında API token’ları maskelenir (`withCredentials` bloğu).
  - `robots.txt` içeriği export sonrası doğrulanır; arama motoru indekslemesini istemiyorsak `Disallow: /`.
  - `pnpm audit --prod` raporu build aşamasında tetiklenir; yüksek seviye açık bulunursa dağıtım durdurulur.

---

## 14. Test & Kalite Senaryoları
1. **Temel akış:** Reklam → Menü → Takım seçimi → 20 soru (timed) → kazanma.
2. **API hatası:** Sorular yüklenemez → placeholder + yerel paket devreye girer.
3. **Yetersiz soru:** 5 API sorusu + placeholder ile 10 soruluk oyun.
4. **Süreli mod:** Sayaç 0’a iner, cevap verilmez → yanlış kabul edilir, Ladder 0 adım.
5. **Classic soru:** Cevap gösterme + manuel doğru/yanlış seçimi.
6. **Sürpriz tetikleme:** Art arda tetiklenmez, geride olan takım için zorunlu tetik kontrolü.
7. **Beraberlik:** Her iki takım aynı basamakta bitirir, sonuç ekranı birlikte gösterir.
8. **Tam ekran & ses:** Audio togglesı, fullscreen giriş/çıkış.
9. **Publisher logosu hata zinciri:** İlk URL 404 döner → `available_logos` içerisinden sıradaki logoya geçilir → fallback placeholder gösterilmez.
10. **Reklam süresi doğrulama:** Reklam süresi 0 veya negatif gelirse reklam ekranı bypass edilir, log yazılır.
11. **Surprise forced comeback:** Fark -3 olduğunda sürpriz otomatik tetiklenir ve losing takım +luckyNumber adım alır.
12. **Asset eksikliği senaryosu:** `background.png` bulunamıyor → AI yeni degrade arka plan SVG üretip `public/assets/background.svg` olarak kaydeder; prompt Bölüm 6 güncellenir.
13. **Offline modu:** Tüm fetch’ler başarısız → yerel paket + placeholder sorularla 10 soruluk oyun tamamlanır.
14. **Accessibility check:** Audio kapalıyken tüm kritik aksiyonlarda görsel feedback (banner, glow) devam eder.
15. **Performance smoke:** 40 soruluk timed oyun; React Profiler ile Ladder transition’ları 16ms altında kalır.

---

## 15. Uygulama Rehberi
- Tailwind sınıflarını mevcut stile sadık kullan (`hover:scale`, `drop-shadow`, `animate-*`). Gereksiz layout oynaması yapma.
- Tüm görseller `getAssetPath` üzerinden çağrılmalı ki base path doğru çalışsın.
- Bileşenler `"use client"` ile başlar; server bileşenleri (örn. layout) sade tutulur.
- State değişikliklerinde fonksiyonel `setGameState` kullan (önceki state’e bağımlı).
- Audio ve fetch işlemlerinde tarayıcı guard'ları (`typeof window !== "undefined"`) hazır.
- Asset eksikliği tespit edildiğinde (ör. yeni ekran için ikon yok) Bölüm 6’daki politika gereği çözüm üret.
- Her değişiklik sonrası `prompt.md`’yi elindeki bilgiyle güncelle; ekran detaylarını piksel seviyesinde, renkleri hex olarak ver.
- Kod yorumları ve dokümantasyon:
  - Public fonksiyonların tümü için JSDoc ekleyin; parametre, dönüş tipi ve edge-case davranışı açıklansın.
  - Karmaşık React effect’lerinde (örn. sayaç, sürpriz tetikleyici) “neden” bilgisini açıklayan yorum bırakın, “ne” değil.
  - Prompt güncellemeleri için stil kılavuzu: bölüm başlıkları `##`, alt başlıklar `###`, kod blokları ` ```ts` veya ` ```json` ile etiketlenir, tablo gerekiyorsa Markdown table kullanılır.
- Logging & monitoring:
  - Kullanıcıya gösterilemeyen hatalar `console.error` ile kaydedilir ve `window.dispatchEvent(new CustomEvent('quiz:error', { detail }))` yayınlanarak harici izleme sistemine yönlendirilebilir.
  - Performans ölçümü için `reportWebVitals` (Next.js default) `lib/vitals-reporter.ts` üzerinden Sentry/Azure’a gönderilebilir.
- Performans optimizasyonları:
  - Ladder ekranında `useMemo` ile hesaplanan `visibleSteps` dizisi tekrar hesaplanmasını önler.
  - Ses dosyaları `preload="auto"` yerine kullanıcı etkileşimi sonrası yüklenir; mobil tarayıcılarda ilk tıklamada `AudioProvider.enable()` çağrısı yapılır.
  - Büyük asset’ler (arka plan, banner) için `.webp` alternatifleri hazırlanır; build script’i yoksa prompt’a not düş.
- Kod stili:
  - ESLint kuralları: `@next/next`, `@typescript-eslint/recommended`, `react-hooks`. Lint hatası toleranslı değil; CI’da “warning == fail”.
  - `clsx` + `tailwind-merge` kombinasyonu çift class sorunlarını engeller; yeni bileşenlerde aynı pattern kullan.
  - `React.StrictMode` varsayılan; yan etkili kodların (interval, timeout) cleanup’ı zorunlu.
- Dokümantasyon paylaşımı:
  - README’deki kurulum adımları değişirse bu prompt’ta da güncelleme yap.
  - Yeni API endpoint’i eklendiğinde Bölüm 7, şema güncellendiğinde Bölüm 5 editlenmeli.
  - Tasarım değişikliklerinde Figma/Zeplin referansı varsa linki prompt’a “Kaynak” notu olarak ekle (telif içermiyorsa).

---

Bu prompt başka bir yapay zekâya eksiksiz verildiğinde, burada tanımlanan ekranlar, mantık, veri akışı, ses sistemi ve dağıtım davranışıyla aynı Puan Merdiveni oyununu oluşturabilmelidir. Eksik asset veya veri varsa tespit edip telafi etmek (üretmek, istemek ya da yer tutucu oluşturmak) zorunludur.
