{
  "title": "Puan Merdiveni",
  "description": "İki takımın sırayla soruları cevaplayarak dijital bir merdivende yukarı çıktığı takım yarışması.",
  "requirements": {
    "api": {
      "fetchQuestions": {
        "url": "https://etkinlik.app/api/unity/question-groups/code/{CODE}",
        "description": "{CODE}, oyuna özel benzersiz kodu temsil eder. Bu kod oyun kategorisi, zorluk seviyesi veya etkinlik ID’si olabilir."
      },
      "publisherLogo": "https://etkinlik.app/api/publishers/{publisherId}",
      "advertisements": {
        "url": "https://etkinlik.app/api/unity/advertisements",
        "responseFormat": "Ad listesi döner. Her reklam nesnesi id, name, file_url, link_url, duration (saniye cinsinden) içerir."
      },
      "callback": {
        "url": "https://etkinlik.app/api/jenkins/callback",
        "purpose": "Oyun bitişi, hata raporu ve istatistik gönderimleri için kullanılacak."
      },
      "headers": {
        "Accept": "application/json",
        "User-Agent": "WebGame/1.0"
      },
      "errorHandling": "API başarısız olursa varsayılan placeholder sorular ve logolar devreye girer.",
      "authentication": "Gerekirse Bearer Token veya API Key ile doğrulama.",
      "rateLimiting": "Dakikada maksimum X istek sınırı, retry mekanizması ile desteklenir."
    },
    "gameData": {
      "input": "/puan-merdiveni/questions/question.json",
      "questionTypes": ["multiple_choice", "true_false", "classic"],
      "questionFormatRaw": {
        "id": "number",
        "type": "multiple_choice | true_false | classic",
        "question_text": "string",
        "answers": [
          { "answer_text": "string", "is_correct": "boolean" }
        ],
        "correctAnswerId": "number",
        "publisher_id": "number",
        "image_url": "optional string"
      },
      "questionFormatGame": {
        "id": "number",
        "type": "multiple_choice | true_false | classic",
        "question_text": "string",
        "options": {
          "A": "string",
          "B": "string",
          "C": "string",
          "D": "string"
        },
        "correct_answer": "A|B|C|D|true|false",
        "publisher_id": "number",
        "image_url": "optional string"
      },
      "logo": {
        "default": "/puan-merdiveni/questions/logo.png",
        "dynamic": "API’den publisherLogo endpointi ile alınabilir"
      },
      "advertisementFormat": {
        "id": "number",
        "name": "string",
        "file_url": "string",
        "link_url": "string",
        "duration_seconds": "number"
      },
      "exampleQuestionJson": [
        {
          "id": 1,
          "type": "multiple_choice",
          "question_text": "Türkiye’nin başkenti neresidir?",
          "answers": [
            { "answer_text": "Ankara", "is_correct": true },
            { "answer_text": "İstanbul", "is_correct": false },
            { "answer_text": "İzmir", "is_correct": false },
            { "answer_text": "Bursa", "is_correct": false }
          ],
          "correctAnswerId": 1,
          "publisher_id": 101,
          "image_url": null
        },
        {
          "id": 2,
          "type": "true_false",
          "question_text": "Dünya düzdür.",
          "answers": [
            { "answer_text": "Doğru", "is_correct": false },
            { "answer_text": "Yanlış", "is_correct": true }
          ],
          "correctAnswerId": 2,
          "publisher_id": 101,
          "image_url": null
        },
        {
          "id": 3,
          "type": "classic",
          "question_text": "Newton’un ünlü hareket yasaları hangi kitapta yayımlandı?",
          "answers": [
            { "answer_text": "Principia Mathematica", "is_correct": true }
          ],
          "correctAnswerId": 1,
          "publisher_id": 101,
          "image_url": null
        }
      ]
    },
    "teams": {
      "count": 2,
      "characterSelection": true,
      "characters": [
        "Zeka Ustası",
        "Bilge Büyücü",
        "Uzay Kaşifi",
        "Hızlı Kedi",
        "Tekno Robot",
        "Minik Ejderha"
      ],
      "characterAssets": "placeholder images in /public/assets/characters",
      "characterAbilities": "YOK – sadece görsel temsil"
    },
    "settings": {
      "questionCountOptions": [10, 20, 30, 40],
      "ladderTargets": {
        "10": 25,
        "20": 50,
        "30": 75,
        "40": 100
      },
      "modes": {
        "timed": {
          "0-10": "+3",
          "11-20": "+2",
          "21-30": "+1",
          "onTimeout": "Cevaplanmamış → yanlış kabul edilir"
        },
        "untimed": {
          "correctAnswer": "+1"
        }
      },
      "surpriseSystem": {
        "enabled": true,
        "trigger": "Her 3 soruda bir tetiklenir",
        "luckyNumber": "1-6 arası rastgele zar atılır",
        "choices": "Şanslı sayıya göre dinamik oluşturulur",
        "exampleChoices": [
          "Şanslı sayı 6 ise: +6 kendi takımına, -6 rakip takıma, +3 kendi takımına, -3 rakip takıma",
          "Şanslı sayı 3 ise: +3 kendi takımına, -3 rakip takıma, +2 kendi takımına (yarısı), -2 rakip takıma",
          "Her turda rastgele 3 farklı seçenek sunulur"
        ]
      }
    },
    "ui": {
      "screens": {
        "advertisement": [
          "Tam ekran reklam görseli (file_url)",
          "Reklam süresi duration_seconds ile belirlenir",
          "Sağ üstte geri sayım sayacı",
          "Süre bitince sayaç yerine X butonu çıkar",
          "X butonuna basılınca reklam kapanır ve oyun başlar",
          "Tıklanabilir → link_url yeni sekmede açılır",
          "Reklam sadece oyun başlamadan önce bir kere gösterilir"
        ],
        "start": [
          "Placeholder logo veya publisher logoları",
          "Takım isim ve karakter seçimi",
          "Başla butonu"
        ],
        "settings": [
          "Soru sayısı dropdown",
          "Oyun modu (Süreli/Süresiz) toggle",
          "Sürpriz sistemi checkbox"
        ],
        "questionReady": [
          "Soruyu Göster butonu",
          "Süre sayacı (süreli modda aktif)"
        ],
        "questionActive": [
          "Soru metni",
          "Multiple Choice: A-D cevap butonları, seçilen cevap doğru/yanlış kontrolü yapılır",
          "True/False: Doğru/Yanlış butonları, seçilen cevap API'den gelen correct_answer ile karşılaştırılır (true/false string değerleri)",
          "Classic: İlk aşamada 'Cevabı Göster' butonu → Basılınca cevap gösterilir ve 'Doğru Bildi' / 'Yanlış Bildi' butonları çıkar",
          "Classic tipte: Doğru Bildi → puan ekle, Yanlış Bildi → puan ekleme",
          "Opsiyonel soru görseli",
          "Publisher logo üst kısımda",
          "ÖNEMLİ: True/False sorularda correct_answer 'true' veya 'false' string olarak gelir, boolean olarak değerlendirilmeli"
        ],
        "ladder": [
          "Her takım için bağımsız sliding window merdiven sistemi",
          "Ekranda her zaman 10 basamak görünür",
          "Başlangıç: 1-10 arası basamaklar gösterilir",
          "İlerleme: Karakter ilerledikçe window kayar (örn: 8-17, 15-24, vs.)",
          "Her 10 basamakta renk değişimi (tier sistemi)",
          "Takım A renkleri: Mor(1-10) → Mavi(11-20) → Turkuaz(21-30) → Yeşil(31-40) → Sarı(41-50) → Altın(51+)",
          "Takım B renkleri: Pembe(1-10) → Pembe-Kırmızı(11-20) → Turuncu(21-30) → Turuncu-Sarı(31-40) → Sarı(41-50) → Altın(51+)",
          "Her takımın karakteri her zaman görünür durumda",
          "Opacity ile geçişler: Aktif basamak (100%), Geçilmiş (90%), Henüz gelinmemiş (30%)"
        ],
        "surprise": [
          "Seçim ekranı: + veya - basamak ekle/çıkar",
          "Sıra pas geç opsiyonu"
        ],
        "end": [
          "Kazanan takım bannerı",
          "Beraberlik mesajı"
        ]
      },
      "assetFolders": {
        "backgrounds": "/public/assets/backgrounds",
        "buttons": "/public/assets/buttons",
        "icons": "/public/assets/icons",
        "characters": "/public/assets/characters",
        "ladder": "/public/assets/ladder",
        "ads": "/public/assets/ads"
      },
      "placeholders": {
        "style": "Basit ikon tarzı, tek renkli veya outline",
        "size": "256x256 px önerilir",
        "note": "Tüm görsellerde varsayılan anlaşılır placeholder’lar kullanılsın"
      }
    },
    "gameplay": {
      "flow": [
        "Reklam ekranı (duration_seconds boyunca)",
        "Giriş ekranı",
        "Ayarlar ekranı",
        "Soru hazır ekranı",
        "Soru aktif ekranı",
        "Merdiven animasyonu",
        "Sürpriz ekranı (opsiyonel)",
        "Sonraki soru",
        "Oyun sonu"
      ],
      "endConditions": [
        "Hedef basamağa ulaşma (birisi hedefe ulaşırsa oyun biter)",
        "Sorular bittiğinde en yüksekte olan kazanır",
        "Eşitse beraberlik",
        "ÖNEMLİ: Oyun SADECE şu durumlarda biter:",
        "  1. Bir takım hedef basamağa ulaştıysa (winner !== 'tie')",
        "  2. VEYA tüm sorular bittiğinde (currentQuestion >= totalQuestions)",
        "Sürpriz olayından sonra oyun sadece yukarıdaki koşullar sağlanıyorsa biter",
        "Sorular bitmeden veya hedefe ulaşılmadan oyun bitmemeli",
        "Sorular biterse ve yeterli soru yoksa, placeholder sorular eklenmeli"
      ],
      "questionHandling": [
        "API'den gelen sorular öncelikli olarak kullanılır",
        "Soru sayısı yetersizse, data/questions.ts dosyasından placeholder sorular eklenir",
        "Oyun ayarlarında seçilen soru sayısı kadar soru garanti edilmelidir",
        "Soru biterse oyun sonlandırılmaz, eksik sorular doldurulur"
      ]
    },
    "implementation": {
      "technology": "Next.js 14 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4",
      "stateManagement": "Zustand veya Context API ile GameContext",
      "errorHandling": "API, veri ve UI hatalarına karşı fallback",
      "networking": "API çağrıları fetch ile yapılır, hata durumunda retry mekanizması",
      "accessibility": {
        "standard": "WCAG 2.1 AA",
        "features": "Ekran okuyucu uyumluluğu, klavye navigasyonu, renk körlüğü desteği"
      },
      "testing": "Unit test (Jest), component test (React Testing Library), e2e test (Playwright)"
    },
    "output": {
      "buildFolder": "/puan-merdiveni",
      "readFrom": "/puan-merdiveni/questions/question.json",
      "assetsReplaceable": true
    }
  },
  "note": "Oyun asset bağımlı olmadan çalışsın. Placeholder görseller sayesinde assetler yüklenmese bile tüm UI ve oyun akışı görsel olarak anlaşılır olsun. Reklam sadece oyun başlamadan önce duration_seconds süresince gösterilsin, süre bitince X butonu ile kapanıp oyuna geçilsin."
}
