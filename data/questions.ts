import type { Question } from "@/types/game"

export const questions: Question[] = [
  // Metin sorusu
  {
    id: "q1",
    type: "text",
    text: "Türkiye'nin başkenti neresidir? Türkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidir?",
    answers: [
      { id: "A", text: "İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul " },
      { id: "B", text: "Ankara" },
      { id: "C", text: "İzmir" },
      { id: "D", text: "Bursa" },
    ],
    correctAnswer: "B",
  },
  
  // Görsel soru (örnek olarak placeholder kullanıyoruz)
  {
    id: "q2",
    type: "image",
    text: "Bu görseldeki hayvan hangisidir?",
    image: "/placeholder.svg",
    imageAlt: "Hayvan görseli",
    answers: [
      { id: "A", text: "Kedi" },
      { id: "B", text: "Köpek" },
      { id: "C", text: "Kuş" },
      { id: "D", text: "Balık" },
    ],
    correctAnswer: "A",
  },

  // Karma soru (metin + görsel)
  {
    id: "q3",
    type: "mixed",
    text: "Görselde gördüğünüz bu yapı hangi şehirdedir?",
    image: "/placeholder.svg",
    imageAlt: "Tarihi yapı görseli",
    answers: [
      { id: "A", text: "İstanbul" },
      { id: "B", text: "Ankara" },
      { id: "C", text: "İzmir" },
      { id: "D", text: "Antalya" },
    ],
    correctAnswer: "A",
  },

  // Başka bir metin sorusu
  {
    id: "q4",
    type: "text",
    text: "Dünyanın en büyük okyanusu hangisidir?",
    answers: [
      { id: "A", text: "Atlantik Okyanusu" },
      { id: "B", text: "Pasifik Okyanusu" },
      { id: "C", text: "Hint Okyanusu" },
      { id: "D", text: "Arktik Okyanusu" },
    ],
    correctAnswer: "B",
  },

  // Görsel matematik sorusu
  {
    id: "q5",
    type: "mixed",
    text: "Görseldeki şekillerin toplam sayısı kaçtır?",
    image: "/placeholder.svg",
    imageAlt: "Geometrik şekiller",
    answers: [
      { id: "A", text: "8" },
      { id: "B", text: "10" },
      { id: "C", text: "12" },
      { id: "D", text: "14" },
    ],
    correctAnswer: "C",
  },
]