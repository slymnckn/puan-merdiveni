import type { ApiQuestion, Advertisement, PublisherLogo, GameQuestion, ApiConfig } from '@/types/api'

class ApiService {
  private config: ApiConfig = {
    baseUrl: 'https://etkinlik.app/api',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'WebGame/1.0'
    },
    retryLimit: 3,
    retryDelay: 1000
  }

  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null
    
    for (let i = 0; i < this.config.retryLimit; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.config.headers,
            ...options.headers
          }
        })

        if (response.ok) {
          return response
        }

        if (response.status >= 400 && response.status < 500) {
          // Client errors shouldn't be retried
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        throw new Error(`Server Error: ${response.status} ${response.statusText}`)
      } catch (error) {
        lastError = error as Error
        
        if (i < this.config.retryLimit - 1) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (i + 1)))
        }
      }
    }

    throw lastError || new Error('Unknown API error')
  }

  async fetchQuestions(code: string): Promise<GameQuestion[]> {
    try {
      const url = `${this.config.baseUrl}/unity/question-groups/code/${code}`
      const response = await this.fetchWithRetry(url)
      const apiQuestions: ApiQuestion[] = await response.json()

      return this.convertQuestionsToGameFormat(apiQuestions)
    } catch (error) {
      console.error('Failed to fetch questions from API:', error)
      return this.getFallbackQuestions()
    }
  }

  async fetchAdvertisements(): Promise<Advertisement[]> {
    try {
      const url = `${this.config.baseUrl}/unity/advertisements`
      const response = await this.fetchWithRetry(url)
      const ads: Advertisement[] = await response.json()

      return ads.filter(ad => ad.file_url && ad.duration_seconds > 0)
    } catch (error) {
      console.error('Failed to fetch advertisements:', error)
      return []
    }
  }

  async fetchPublisherLogo(publisherId: number): Promise<string | null> {
    try {
      const url = `${this.config.baseUrl}/publishers/${publisherId}`
      const response = await this.fetchWithRetry(url)
      const logoData: PublisherLogo = await response.json()

      return logoData.logo_url || null
    } catch (error) {
      console.error('Failed to fetch publisher logo:', error)
      return null
    }
  }

  async sendCallback(data: {
    event_type: 'game_end' | 'error' | 'statistics'
    game_code?: string
    team_scores?: { teamA: number; teamB: number }
    winner?: 'A' | 'B' | 'tie'
    question_count?: number
    total_time?: number
    error_message?: string
  }): Promise<void> {
    try {
      const url = `${this.config.baseUrl}/jenkins/callback`
      await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    } catch (error) {
      console.error('Failed to send callback:', error)
      // Callback failures shouldn't break the game
    }
  }

  private convertQuestionsToGameFormat(apiQuestions: ApiQuestion[]): GameQuestion[] {
    return apiQuestions.map(q => {
      const options = { A: '', B: '', C: '', D: '' }
      const optionKeys = ['A', 'B', 'C', 'D'] as const
      let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A'

      q.answers.forEach((answer, index) => {
        if (index < 4) {
          const key = optionKeys[index]
          options[key] = answer.answer_text
          if (answer.is_correct) {
            correctAnswer = key
          }
        }
      })

      // Determine question type based on answer count
      const answerCount = q.answers.length
      let questionType: 'multiple_choice' | 'true_false' | 'classic' = 'multiple_choice'
      
      if (answerCount === 2) {
        questionType = 'true_false'
      } else if (answerCount === 0) {
        questionType = 'classic'
      }

      return {
        id: q.id,
        type: questionType,
        question_text: q.question_text,
        options,
        correct_answer: correctAnswer,
        publisher_id: q.publisher_id,
        image_url: q.image_url
      }
    })
  }

  private getFallbackQuestions(): GameQuestion[] {
    return [
      {
        id: 1,
        type: "multiple_choice",
        question_text: "Türkiye'nin başkenti neresidir? Türkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidirTürkiye'nin başkenti neresidir",
        options: {
          A: "İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul İstanbul",
          B: "Ankara", 
          C: "İzmir",
          D: "Bursa"
        },
        correct_answer: "B",
        publisher_id: 0,
        image_url: "/wise-owl-character.jpg"
      },
      {
        id: 2,
        type: "multiple_choice",
        question_text: "Dünyanın en büyük okyanusu hangisidir?",
        options: {
          A: "Atlantik Okyanusu",
          B: "Pasifik Okyanusu",
          C: "Hint Okyanusu", 
          D: "Arktik Okyanusu"
        },
        correct_answer: "B",
        publisher_id: 0,
        image_url: undefined
      },
      {
        id: 3,
        type: "multiple_choice",
        question_text: "Hangi gezegen 'Kırmızı Gezegen' olarak bilinir?",
        options: {
          A: "Venüs",
          B: "Jüpiter",
          C: "Mars",
          D: "Satürn"
        },
        correct_answer: "C",
        publisher_id: 0,
        image_url: "/friendly-robot.png"
      },
      {
        id: 4,
        type: "multiple_choice",
        question_text: "Fotosintez hangi organellerde gerçekleşir?",
        options: {
          A: "Mitokondri",
          B: "Kloroplast",
          C: "Ribozom",
          D: "Çekirdek"
        },
        correct_answer: "B",
        publisher_id: 0,
        image_url: undefined
      },
      {
        id: 5,
        type: "multiple_choice",
        question_text: "Hangisi bir programlama dili değildir?",
        options: {
          A: "Python",
          B: "JavaScript",
          C: "Photoshop",
          D: "Java"
        },
        correct_answer: "C",
        publisher_id: 0,
        image_url: undefined
      },
      {
        id: 6,
        type: "true_false",
        question_text: "Dünya Güneş'in etrafında döner.",
        correct_answer: "true",
        publisher_id: 0
      },
      {
        id: 7,
        type: "true_false", 
        question_text: "İnsan vücudunda toplam 206 kemik vardır.",
        correct_answer: "true",
        publisher_id: 0
      },
      {
        id: 8,
        type: "classic",
        question_text: "Bu bilgi sorusudur. Devam etmek için butona tıklayın.",
        correct_answer: "A",
        publisher_id: 0
      }
    ]
  }
}

export const apiService = new ApiService()