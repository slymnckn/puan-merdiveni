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

export type Character = {
  id: string
  name: string
  image: string
}

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

export type GameSettingsType = {
  questionCount: 10 | 20 | 30 | 40
  gameMode: "timed" | "untimed"
  surpriseSystem: boolean
  gameCode?: string
}

export type LadderTargets = {
  10: 25
  20: 50
  30: 75
  40: 100
}

export type SurpriseChoice = {
  choice: string
  probability: number
  effect: {
    type: 'gain' | 'lose' | 'skip'
    target: 'self' | 'opponent'
    amount?: number
  }
}

export type SurpriseTracker = {
  lastTriggeredQuestion: number | null
  teamCounts: {
    A: number
    B: number
  }
}

export type Advertisement = {
  id: number
  name: string
  file_url: string
  link_url: string
  duration_seconds: number
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
  surpriseData: {
    luckyNumber: number
    availableChoices: SurpriseChoice[]
    selectedChoice?: SurpriseChoice
  } | null
  surpriseTracker: SurpriseTracker
  questions: Question[]
  advertisements: Advertisement[]
  currentAdvertisement: Advertisement | null
  advertisementTimeLeft: number
}
