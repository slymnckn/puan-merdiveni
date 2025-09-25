export type GameScreen =
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

export type QuestionType = "text" | "image" | "mixed"

export type Question = {
  id: string
  type: QuestionType
  text: string
  image?: string
  imageAlt?: string
  answers: Array<{
    id: string
    text: string
  }>
  correctAnswer: string
}

export type GameSettingsType = {
  questionCount: 10 | 20 | 30 | 40
  gameMode: "timed" | "untimed"
  surpriseSystem: boolean
}

export type GameState = {
  currentScreen: GameScreen
  teams: Team[]
  settings: GameSettingsType
  currentQuestion: number
  timeLeft: number
  selectedAnswer: string | null
  answerResult: "correct" | "wrong" | null
  correctAnswer: string | null
  currentQuestionData: Question | null
  surpriseData: {
    luckyNumber: number
    options: Array<{
      team: "A" | "B"
      action: "gain" | "lose"
      amount: number
    }>
  } | null
}
