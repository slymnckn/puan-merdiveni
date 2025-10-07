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
  logo_url?: string
  available_logos?: string[]
}

export interface Advertisement {
  id: number
  name: string
  type?: string | null
  file_path?: string | null
  file_url: string
  link_url?: string | null
  duration_seconds: number
  grade?: string | null
  subject?: string | null
  start_date?: string | null
  end_date?: string | null
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
  publisher_logo_url?: string
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