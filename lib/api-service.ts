import type { ApiQuestion, Advertisement, PublisherLogo, GameQuestion, ApiConfig } from '@/types/api'

const sanitizeBaseUrl = (value?: string | null): string => {
  if (!value) return 'https://etkinlik.app/api'
  const trimmed = value.trim()
  if (!trimmed) return 'https://etkinlik.app/api'
  const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
  return normalized
}

const isAbsoluteUrl = (value: string): boolean => /^https?:\/\//i.test(value)

const stripLeadingSlash = (value: string): string => (value.startsWith('/') ? value.slice(1) : value)

class ApiService {
  private config: ApiConfig = {
    baseUrl: sanitizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'WebGame/1.0'
    },
    retryLimit: 3,
    retryDelay: 1000
  }
  private lastQuestionSource: 'remote' | 'fallback' = 'fallback'

  setBaseUrl(baseUrl?: string | null) {
    const sanitized = sanitizeBaseUrl(baseUrl)
    this.config.baseUrl = sanitized
  }

  getBaseUrl() {
    return this.config.baseUrl
  }

  private buildUrl(pathOrUrl: string, fallbackPath: string): string {
    if (!pathOrUrl) {
      return `${this.config.baseUrl}/${stripLeadingSlash(fallbackPath)}`
    }

    const trimmed = pathOrUrl.trim()

    if (isAbsoluteUrl(trimmed)) {
      return trimmed
    }

    if (trimmed.startsWith('/')) {
      return `${this.config.baseUrl}/${stripLeadingSlash(trimmed)}`
    }

    if (trimmed.includes('/')) {
      return `${this.config.baseUrl}/${stripLeadingSlash(trimmed)}`
    }

    return `${this.config.baseUrl}/${stripLeadingSlash(fallbackPath.replace('{code}', trimmed))}`
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
      const url = this.buildUrl(code, 'unity/question-groups/code/{code}')
      const response = await this.fetchWithRetry(url)
      const payload = await response.json()

      const apiQuestions = this.extractQuestionsFromPayload(payload)

      if (apiQuestions.length === 0) {
        console.warn('Question response did not contain any usable questions.', {
          code,
          payloadSummary: this.getPayloadSummary(payload)
        })
        this.lastQuestionSource = 'fallback'
        return this.getFallbackQuestions()
      }

      this.lastQuestionSource = 'remote'
      return this.convertQuestionsToGameFormat(apiQuestions)
    } catch (error) {
      console.error('Failed to fetch questions from API:', error)
      this.lastQuestionSource = 'fallback'
      return this.getFallbackQuestions()
    }
  }

  getLastQuestionSource() {
    return this.lastQuestionSource
  }

  private getPayloadSummary(payload: unknown) {
    if (!payload || typeof payload !== 'object') {
      return payload
    }

    const entries = Object.entries(payload as Record<string, unknown>)
      .slice(0, 8)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}: [${value.length}]`
        }
        if (value && typeof value === 'object') {
          return `${key}: {${Object.keys(value as Record<string, unknown>).slice(0, 5).join(', ')}}`
        }
        return `${key}: ${value}`
      })

    return `{ ${entries.join(', ')} }`
  }

  private extractQuestionsFromPayload(payload: unknown): ApiQuestion[] {
    const queue: { data: unknown; groupLogo?: string; availableLogos?: string[] }[] = [{ data: payload }]
    const visited = new WeakSet<object>()
    const results: ApiQuestion[] = []

    // İlk payload'dan group-level logo bilgisini çıkar
    let groupLogoUrl: string | undefined
    let groupAvailableLogos: string[] | undefined

    if (payload && typeof payload === 'object') {
      const rootObj = payload as Record<string, unknown>
      groupLogoUrl = this.toString(rootObj.logo_url ?? rootObj.publisher_logo_url)
      const rawLogos = rootObj.available_logos ?? rootObj.availableLogos
      if (Array.isArray(rawLogos)) {
        groupAvailableLogos = rawLogos.filter((l): l is string => typeof l === 'string' && l.trim().length > 0)
      }
    }

    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) {
        continue
      }

      const { data: current, groupLogo = groupLogoUrl, availableLogos = groupAvailableLogos } = item

      if (!current) {
        continue
      }

      if (Array.isArray(current)) {
        for (const arrayItem of current) {
          if (!arrayItem) {
            continue
          }

          if (this.isApiQuestion(arrayItem)) {
            // Soruya group logo bilgisini ekle
            const questionWithLogo = {
              ...arrayItem,
              logo_url: arrayItem.logo_url ?? groupLogo,
              available_logos: arrayItem.available_logos ?? availableLogos
            }
            results.push(questionWithLogo)
            continue
          }

          if (typeof arrayItem === 'object') {
            queue.push({ data: arrayItem, groupLogo, availableLogos })
          }
        }
        continue
      }

      if (typeof current !== 'object') {
        continue
      }

      const obj = current as Record<string, unknown>

      if (visited.has(obj)) {
        continue
      }

      visited.add(obj)

      if (this.isApiQuestion(obj)) {
        // Soruya group logo bilgisini ekle
        const questionWithLogo = {
          ...obj,
          logo_url: obj.logo_url ?? groupLogo,
          available_logos: obj.available_logos ?? availableLogos
        }
        results.push(questionWithLogo)
        continue
      }

      const candidateKeys = [
        'questions',
        'question_list',
        'items',
        'results',
        'data',
        'questionGroup',
        'question_group',
        'question_group_items',
        'questionGroupQuestions',
        'question_group_questions',
        'questionItems',
        'question_items',
        'questionData',
        'question_data',
        'records',
        'values',
        'content'
      ]

      for (const key of candidateKeys) {
        if (key in obj) {
          queue.push({ data: obj[key], groupLogo, availableLogos })
        }
      }

      if ('question' in obj) {
        queue.push({ data: obj['question'], groupLogo, availableLogos })
      }
    }

    return results
  }

  private isApiQuestion(value: unknown): value is ApiQuestion {
    if (!value || typeof value !== 'object') {
      return false
    }

    const candidate = value as Partial<ApiQuestion>

    const answerCandidates = [
      candidate.answers,
      (candidate as unknown as { answer_list?: unknown }).answer_list,
      (candidate as unknown as { choices?: unknown }).choices,
      (candidate as unknown as { options?: unknown }).options,
      (candidate as unknown as { options_list?: unknown }).options_list
    ]

    const hasArrayAnswers = answerCandidates.some((entry) => Array.isArray(entry))
    const hasObjectOptions = answerCandidates.some((entry) => entry && typeof entry === 'object')

    return (
      typeof candidate.question_text === 'string' &&
      (hasArrayAnswers || hasObjectOptions || typeof (candidate as { correct_answer?: unknown }).correct_answer === 'string')
    )

    return (
      typeof candidate.question_text === 'string' &&
      Array.isArray(candidate.answers)
    )
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
    return apiQuestions.map((question, index) => {
  const questionRecord = this.ensureRecord(question)
  const answerList = this.extractAnswerList(questionRecord)

      const correctAnswerId = this.toNumber(questionRecord.correctAnswerId ?? questionRecord.correct_answer_id)
      const correctAnswerIndexRaw = this.toNumber(questionRecord.correctAnswerIndex ?? questionRecord.correct_answer_index)
      const zeroBasedCorrectIndex = correctAnswerIndexRaw !== null
        ? Math.max(0, correctAnswerIndexRaw >= 1 ? correctAnswerIndexRaw - 1 : correctAnswerIndexRaw)
        : null

      const normalizedAnswers = answerList.map((rawAnswer, answerIndex) => {
        const answerRecord = this.ensureRecord(rawAnswer)
        const fallbackLabel = answerIndex === 0 ? 'Doğru' : answerIndex === 1 ? 'Yanlış' : ''
        const text = this.toString(
          answerRecord.answer_text ??
          answerRecord.text ??
          answerRecord.answer ??
          answerRecord.label ??
          fallbackLabel
        )

        const explicitCorrect = this.toBoolean(
          answerRecord.is_correct ??
          answerRecord.isCorrect ??
          answerRecord.correct ??
          answerRecord.is_true
        )

        const answerId = this.toNumber(answerRecord.id ?? answerRecord.answer_id ?? answerRecord.answerId)
        const derivedCorrectFromId = correctAnswerId !== null && answerId !== null
          ? correctAnswerId === answerId
          : false

        return {
          text,
          isCorrect: explicitCorrect ?? derivedCorrectFromId,
        }
      })

      const baseOptions: Record<'A' | 'B' | 'C' | 'D', string> = {
        A: '',
        B: '',
        C: '',
        D: ''
      }
      const optionKeys = ['A', 'B', 'C', 'D'] as const

      let questionType: 'multiple_choice' | 'true_false' | 'classic' = 'multiple_choice'
      let correctAnswer: 'A' | 'B' | 'C' | 'D' | 'true' | 'false' = 'A'

      const explicitType = this.toString(questionRecord.type ?? questionRecord.question_type).toLowerCase()

      if (explicitType === 'classic') {
        questionType = 'classic'
        baseOptions.A = normalizedAnswers[0]?.text ?? ''
        correctAnswer = 'A'
      } else if (explicitType === 'true_false' || normalizedAnswers.length === 2) {
        questionType = 'true_false'

        baseOptions.A = normalizedAnswers[0]?.text || 'Doğru'
        baseOptions.B = normalizedAnswers[1]?.text || 'Yanlış'

        const trueIsCorrect = normalizedAnswers[0]?.isCorrect ?? false
        const falseIsCorrect = normalizedAnswers[1]?.isCorrect ?? false

        if (trueIsCorrect && !falseIsCorrect) {
          correctAnswer = 'true'
        } else if (!trueIsCorrect && falseIsCorrect) {
          correctAnswer = 'false'
        } else if (zeroBasedCorrectIndex === 1) {
          correctAnswer = 'false'
        } else {
          correctAnswer = 'true'
        }
      } else if (normalizedAnswers.length === 0) {
        questionType = 'classic'
        baseOptions.A = ''
        correctAnswer = 'A'
      } else {
        normalizedAnswers.forEach((answer, answerIndex) => {
          if (answerIndex < optionKeys.length) {
            const key = optionKeys[answerIndex]
            baseOptions[key] = answer.text
            if (answer.isCorrect) {
              correctAnswer = key
            }
          }
        })

        if (!normalizedAnswers.some((answer) => answer.isCorrect) && zeroBasedCorrectIndex !== null) {
          const boundedIndex = Math.max(0, Math.min(normalizedAnswers.length - 1, zeroBasedCorrectIndex))
          correctAnswer = optionKeys[boundedIndex] ?? 'A'
        }
      }

      const imageUrl = this.toString(
        questionRecord.image_url ??
        questionRecord.image ??
        questionRecord.imagePath ??
        questionRecord.image_path ??
        ''
      ) || undefined

      const rawAvailableLogos = questionRecord.available_logos ?? questionRecord.availableLogos
      let publisherLogoUrl = this.toString(
        questionRecord.logo_url ??
        questionRecord.publisher_logo_url ??
        this.ensureRecord(questionRecord.publisher).logo_url ??
        ''
      )

      if (!publisherLogoUrl && Array.isArray(rawAvailableLogos)) {
        const firstLogo = rawAvailableLogos.find((entry) => typeof entry === 'string' && entry.trim().length > 0)
        if (typeof firstLogo === 'string') {
          publisherLogoUrl = this.toString(firstLogo)
        }
      }

      const publisherId = this.toNumber(questionRecord.publisher_id) ?? 0

      const identifier = this.toNumber(questionRecord.id) ?? index + 1

      return {
        id: identifier,
        type: questionType,
        question_text: this.toString(
          questionRecord.question_text ??
          questionRecord.questionText ??
          questionRecord.text ??
          ''
        ),
        options: baseOptions,
        correct_answer: correctAnswer,
        publisher_id: publisherId,
        image_url: imageUrl,
        publisher_logo_url: publisherLogoUrl || undefined
      }
    })
  }

  private ensureRecord(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object') {
      return value as Record<string, unknown>
    }
    return {}
  }

  private toString(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
      return value
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    return fallback
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }
    return null
  }

  private toBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase()
      if (['1', 'true', 'yes', 'correct'].includes(normalized)) {
        return true
      }
      if (['0', 'false', 'no', 'wrong'].includes(normalized)) {
        return false
      }
    }
    return null
  }

  private extractAnswerList(questionRecord: Record<string, unknown>): unknown[] {
    const possibleArrays = [
      questionRecord.answers,
      questionRecord.answer_list,
      questionRecord.answerList,
      questionRecord.choices,
      questionRecord.options,
      questionRecord.options_list,
      questionRecord.optionsList,
      questionRecord.variants
    ]

    for (const entry of possibleArrays) {
      if (Array.isArray(entry)) {
        return entry
      }

      if (entry && typeof entry === 'object') {
        const values = Object.values(entry as Record<string, unknown>)
        if (values.length > 0) {
          return values
        }
      }
    }

    return []
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