// API Response Types
export interface ApiQuestion {
  id: number
  question_text: string
  answers: Array<{
    answer_text: string
    is_correct: boolean
  }>
  correctAnswerId: number
  publisher_id: number
  image_url?: string
}

export interface Advertisement {
  id: number
  name: string
  file_url: string
  link_url: string
  duration_seconds: number
}

export interface PublisherLogo {
  logo_url: string
  publisher_id: number
  name: string
}

// Game Question Format (converted from API)
export interface GameQuestion {
  id: number
  type: 'multiple_choice' | 'true_false' | 'classic'
  question_text: string
  options?: {
    A: string
    B: string
    C?: string
    D?: string
  }
  correct_answer: 'A' | 'B' | 'C' | 'D' | 'true' | 'false'
  publisher_id: number
  image_url?: string
}

// API Service Configuration
export interface ApiConfig {
  baseUrl: string
  headers: {
    Accept: string
    'User-Agent': string
    Authorization?: string
  }
  retryLimit: number
  retryDelay: number
}