import type { GameQuestion } from "@/types/api"

// Placeholder sorular - API başarısız olursa veya soru sayısı yetersizse kullanılır
export const placeholderQuestions: GameQuestion[] = [
  // Multiple Choice Sorular
  {
    id: 1,
    type: 'multiple_choice',
    question_text: 'Türkiye\'nin başkenti neresidir?',
    options: {
      A: 'İstanbul',
      B: 'Ankara',
      C: 'İzmir',
      D: 'Bursa'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 2,
    type: 'multiple_choice',
    question_text: 'Dünyanın en büyük okyanusu hangisidir?',
    options: {
      A: 'Atlantik Okyanusu',
      B: 'Pasifik Okyanusu',
      C: 'Hint Okyanusu',
      D: 'Arktik Okyanusu'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 3,
    type: 'multiple_choice',
    question_text: 'Hangi gezegen Güneş Sistemi\'nin en büyüğüdür?',
    options: {
      A: 'Mars',
      B: 'Satürn',
      C: 'Jüpiter',
      D: 'Neptün'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 4,
    type: 'multiple_choice',
    question_text: 'İnsan vücudunda kaç kemik vardır?',
    options: {
      A: '186',
      B: '206',
      C: '226',
      D: '246'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 5,
    type: 'multiple_choice',
    question_text: 'Hangi element periyodik tabloda Au sembolü ile gösterilir?',
    options: {
      A: 'Gümüş',
      B: 'Altın',
      C: 'Alüminyum',
      D: 'Argon'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 6,
    type: 'multiple_choice',
    question_text: 'Dünya\'nın en yüksek dağı hangisidir?',
    options: {
      A: 'K2',
      B: 'Kilimanjaro',
      C: 'Everest',
      D: 'Mont Blanc'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 7,
    type: 'multiple_choice',
    question_text: 'Hangi yıl Cumhuriyet ilan edilmiştir?',
    options: {
      A: '1919',
      B: '1920',
      C: '1922',
      D: '1923'
    },
    correct_answer: 'D',
    publisher_id: 0,
  },
  {
    id: 8,
    type: 'multiple_choice',
    question_text: 'Elektriği kim keşfetmiştir?',
    options: {
      A: 'Thomas Edison',
      B: 'Benjamin Franklin',
      C: 'Nikola Tesla',
      D: 'Alessandro Volta'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 9,
    type: 'multiple_choice',
    question_text: 'Hangi gezegen "Kırmızı Gezegen" olarak bilinir?',
    options: {
      A: 'Venüs',
      B: 'Mars',
      C: 'Merkür',
      D: 'Satürn'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 10,
    type: 'multiple_choice',
    question_text: 'Fotosintez hangi organel içinde gerçekleşir?',
    options: {
      A: 'Mitokondri',
      B: 'Kloroplast',
      C: 'Ribozom',
      D: 'Çekirdek'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },

  // True/False Sorular
  {
    id: 11,
    type: 'true_false',
    question_text: 'Dünya düzdür.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'false',
    publisher_id: 0,
  },
  {
    id: 12,
    type: 'true_false',
    question_text: 'Su 100 derecede kaynar.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'true',
    publisher_id: 0,
  },
  {
    id: 13,
    type: 'true_false',
    question_text: 'Güneş bir gezegen değil, bir yıldızdır.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'true',
    publisher_id: 0,
  },
  {
    id: 14,
    type: 'true_false',
    question_text: 'İnsanlar ay\'da yürümüştür.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'true',
    publisher_id: 0,
  },
  {
    id: 15,
    type: 'true_false',
    question_text: 'Türkiye Avrupa kıtasında yer alır.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'false',
    publisher_id: 0,
  },

  // Classic Sorular
  {
    id: 16,
    type: 'classic',
    question_text: 'Newton\'un ünlü hareket yasaları hangi kitapta yayımlandı?',
    options: {
      A: 'Principia Mathematica'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 17,
    type: 'classic',
    question_text: 'İlk bilgisayarın adı nedir?',
    options: {
      A: 'ENIAC'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 18,
    type: 'classic',
    question_text: 'DNA\'nın yapısını kim keşfetti?',
    options: {
      A: 'Watson ve Crick'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 19,
    type: 'classic',
    question_text: 'Rönesans hangi ülkede başlamıştır?',
    options: {
      A: 'İtalya'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 20,
    type: 'classic',
    question_text: 'Atom bombasını kim icat etmiştir?',
    options: {
      A: 'Robert Oppenheimer'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },

  // Daha fazla Multiple Choice sorular
  {
    id: 21,
    type: 'multiple_choice',
    question_text: 'Hangi ülkenin başkenti Paris\'tir?',
    options: {
      A: 'İtalya',
      B: 'İspanya',
      C: 'Fransa',
      D: 'Almanya'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 22,
    type: 'multiple_choice',
    question_text: 'Hangi organimiz vücutta kan pompalar?',
    options: {
      A: 'Karaciğer',
      B: 'Kalp',
      C: 'Akciğer',
      D: 'Böbrek'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 23,
    type: 'multiple_choice',
    question_text: 'İnternet\'in icadı hangi yıla dayanır?',
    options: {
      A: '1969',
      B: '1979',
      C: '1989',
      D: '1999'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 24,
    type: 'multiple_choice',
    question_text: 'Hangi vitamin C vitaminini içerir?',
    options: {
      A: 'A Vitamini',
      B: 'B Vitamini',
      C: 'C Vitamini',
      D: 'D Vitamini'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 25,
    type: 'multiple_choice',
    question_text: 'Mona Lisa tablosunu kim yapmıştır?',
    options: {
      A: 'Michelangelo',
      B: 'Leonardo da Vinci',
      C: 'Raphael',
      D: 'Donatello'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 26,
    type: 'true_false',
    question_text: 'Penguen uçabilen bir kuştur.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'false',
    publisher_id: 0,
  },
  {
    id: 27,
    type: 'true_false',
    question_text: 'Işık sesten daha hızlıdır.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'true',
    publisher_id: 0,
  },
  {
    id: 28,
    type: 'multiple_choice',
    question_text: 'Hangi hayvan en hızlı koşandır?',
    options: {
      A: 'Aslan',
      B: 'Çita',
      C: 'Leopar',
      D: 'Kaplan'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 29,
    type: 'multiple_choice',
    question_text: 'Hangi renk birincil renk değildir?',
    options: {
      A: 'Kırmızı',
      B: 'Mavi',
      C: 'Yeşil',
      D: 'Sarı'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 30,
    type: 'multiple_choice',
    question_text: 'Matematik\'te pi sayısının yaklaşık değeri nedir?',
    options: {
      A: '3.14',
      B: '2.71',
      C: '1.61',
      D: '4.20'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 31,
    type: 'true_false',
    question_text: 'Piramitler Mısır\'da bulunur.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'true',
    publisher_id: 0,
  },
  {
    id: 32,
    type: 'classic',
    question_text: 'İlk insanın Ay\'a ayak bastığı yıl hangisidir?',
    options: {
      A: '1969'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 33,
    type: 'multiple_choice',
    question_text: 'Hangi gezegen halkalarıyla ünlüdür?',
    options: {
      A: 'Mars',
      B: 'Satürn',
      C: 'Uranüs',
      D: 'Neptün'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 34,
    type: 'multiple_choice',
    question_text: 'Bir yılda kaç mevsim vardır?',
    options: {
      A: '2',
      B: '3',
      C: '4',
      D: '5'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
  {
    id: 35,
    type: 'true_false',
    question_text: 'Dinozorlar hala yaşamaktadır.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'false',
    publisher_id: 0,
  },
  {
    id: 36,
    type: 'multiple_choice',
    question_text: 'Hangi ülke en fazla nüfusa sahiptir?',
    options: {
      A: 'Hindistan',
      B: 'Çin',
      C: 'ABD',
      D: 'Endonezya'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 37,
    type: 'classic',
    question_text: 'Atatürk\'ün doğum yılı nedir?',
    options: {
      A: '1881'
    },
    correct_answer: 'A',
    publisher_id: 0,
  },
  {
    id: 38,
    type: 'multiple_choice',
    question_text: 'Hangi organ vücutta oksijeni alır?',
    options: {
      A: 'Kalp',
      B: 'Akciğer',
      C: 'Karaciğer',
      D: 'Böbrek'
    },
    correct_answer: 'B',
    publisher_id: 0,
  },
  {
    id: 39,
    type: 'true_false',
    question_text: 'Elektrik Thomas Edison tarafından icat edilmiştir.',
    options: {
      A: 'Doğru',
      B: 'Yanlış'
    },
    correct_answer: 'false',
    publisher_id: 0,
  },
  {
    id: 40,
    type: 'multiple_choice',
    question_text: 'Hangi okyanus en büyüktür?',
    options: {
      A: 'Atlantik',
      B: 'Hint',
      C: 'Pasifik',
      D: 'Arktik'
    },
    correct_answer: 'C',
    publisher_id: 0,
  },
]
