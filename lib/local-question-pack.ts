import type { GameQuestion } from "@/types/api"

type LocalQuestionPack = {
  questions: GameQuestion[]
  publisherLogo: string | null
}

const QUESTION_FILE_CANDIDATES = [
  "./questions/question.json",
  "./question.json",
  "./questions/questions.json"
]

const LOGO_FILE_CANDIDATES = [
  "./questions/logo.png",
  "./questions/logo.svg",
  "./questions/logo.jpg",
  "./logo.png",
  "./logo.svg",
  "./logo.jpg"
]

const IMAGE_PROPERTY_CANDIDATES = [
  "imageUrl",
  "image_url",
  "imagePath",
  "image_path"
]

const QUESTION_ARRAY_CANDIDATE_KEYS = [
  "questions",
  "items",
  "results",
  "data"
]

type RawLocalQuestion = {
  id?: number
  questionText?: string
  question_text?: string
  question?: string
  questionType?: string
  question_type?: string
  type?: string
  answersText?: unknown
  answers?: unknown
  options?: unknown
  choices?: unknown
  correctAnswerId?: number
  correctAnswerIndex?: number
  correct_answer?: unknown
  correct_answer_id?: unknown
  correct_option?: unknown
  publisher_id?: number
  [key: string]: unknown
}

const isBrowser = () => typeof window !== "undefined"

const resolveLocalPath = (path: string, baseHref: string): string => {
  if (!path) return path

  if (/^(https?:|data:|blob:)/i.test(path)) {
    return path
  }

  try {
    const normalized = path.startsWith('/') ? path : `./${path}`
    const url = new URL(normalized, baseHref)
    return url.pathname + url.search
  } catch {
    return path
  }
}

const tryFetchJson = async (url: URL): Promise<unknown | null> => {
  try {
    const response = await fetch(url.toString(), { cache: "no-store" })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

const tryResolveExistingAsset = async (candidatePaths: string[], baseHref: string): Promise<string | null> => {
  for (const candidate of candidatePaths) {
    try {
      const url = new URL(candidate, baseHref)
      const response = await fetch(url.toString(), { method: "HEAD", cache: "no-store" })
      if (response.ok) {
        return url.pathname + url.search
      }
      // Some static servers may not support HEAD
      if (response.status === 405) {
        return url.pathname + url.search
      }
    } catch {
      // Ignore and continue with next candidate
    }
  }

  return null
}

const normalizeToArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value
  if (value && typeof value === "object") {
    for (const key of QUESTION_ARRAY_CANDIDATE_KEYS) {
      const nested = (value as Record<string, unknown>)[key]
      if (Array.isArray(nested)) {
        return nested
      }
    }
  }
  return []
}

const extractAnswerStrings = (raw: unknown): string[] => {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((entry) => {
        if (typeof entry === "string") return entry
        if (entry && typeof entry === "object") {
          const candidate = entry as Record<string, unknown>
          const text = candidate.answer_text ?? candidate.text ?? candidate.label ?? candidate.value
          return typeof text === "string" ? text : null
        }
        return null
      })
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  }

  if (raw && typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>)
      .map((value) => (typeof value === "string" ? value : null))
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
  }

  return []
}

const determineQuestionType = (raw: RawLocalQuestion, answers: string[]): "multiple_choice" | "true_false" | "classic" => {
  const explicitType = (raw.questionType ?? raw.question_type ?? raw.type)
  if (typeof explicitType === "string") {
    const normalized = explicitType.toLowerCase()
    if (normalized === "true_false" || normalized === "true-false" || normalized === "dogru_yanlis") {
      return "true_false"
    }
    if (normalized === "classic" || normalized === "klasik") {
      return "classic"
    }
  }

  if (answers.length === 2) {
    return "true_false"
  }

  return "multiple_choice"
}

const toCorrectAnswerKey = (
  type: "multiple_choice" | "true_false" | "classic",
  raw: RawLocalQuestion,
  answers: string[]
): "A" | "B" | "C" | "D" | "true" | "false" => {
  if (type === "classic") {
    return "A"
  }

  const explicit = raw.correct_answer ?? raw.correct_option
  if (typeof explicit === "string") {
    const normalized = explicit.trim().toUpperCase()
    if (["A", "B", "C", "D"].includes(normalized)) {
      return normalized as "A" | "B" | "C" | "D"
    }
    if (normalized === "TRUE" || normalized === "DOGRU") {
      return "true"
    }
    if (normalized === "FALSE" || normalized === "YANLIS" || normalized === "WRONG") {
      return "false"
    }
  }

  const correctIndexCandidate =
    typeof raw.correctAnswerIndex === "number"
      ? raw.correctAnswerIndex
      : typeof raw.correctAnswerId === "number"
      ? raw.correctAnswerId
      : typeof raw.correct_answer_id === "number"
      ? raw.correct_answer_id
      : null

  const index = correctIndexCandidate !== null ? Math.max(0, correctIndexCandidate) : 0

  if (type === "true_false") {
    const correctAnswer = answers[index] ?? ""
    const normalized = correctAnswer.trim().toLowerCase()
    if (normalized === "true" || normalized === "doğru" || normalized === "dogru") {
      return "true"
    }
    if (normalized === "false" || normalized === "yanlış" || normalized === "yanlis") {
      return "false"
    }
    return index === 0 ? "true" : "false"
  }

  const keys: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"]
  return keys[Math.min(index, keys.length - 1)]
}

const buildOptions = (answers: string[]): { A: string; B: string; C?: string; D?: string } => {
  const base: { A: string; B: string; C?: string; D?: string } = {
    A: answers[0] ?? "",
    B: answers[1] ?? ""
  }

  if (answers.length > 2) {
    base.C = answers[2] ?? ""
  }

  if (answers.length > 3) {
    base.D = answers[3] ?? ""
  }

  return base
}

const convertToGameQuestion = (
  raw: RawLocalQuestion,
  publisherLogo: string | null,
  assetBaseHref: string,
  index: number
): GameQuestion | null => {
  const id = typeof raw.id === "number" && Number.isFinite(raw.id) ? raw.id : index + 1
  const questionText =
    typeof raw.questionText === "string"
      ? raw.questionText
      : typeof raw.question_text === "string"
      ? raw.question_text
      : typeof raw.question === "string"
      ? raw.question
      : null

  if (!questionText) {
    return null
  }

  const answers = extractAnswerStrings(
    raw.answersText ?? raw.answers ?? raw.options ?? raw.choices ?? []
  )

  const type = determineQuestionType(raw, answers)
  const correctAnswer = toCorrectAnswerKey(type, raw, answers)

  const imagePathCandidate = IMAGE_PROPERTY_CANDIDATES.map((key) => raw[key])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)[0]

  const resolvedImagePath = imagePathCandidate
    ? resolveLocalPath(imagePathCandidate, assetBaseHref)
    : undefined

  const question: GameQuestion = {
    id,
    type,
    question_text: questionText,
    correct_answer: correctAnswer,
    publisher_id: typeof raw.publisher_id === "number" ? raw.publisher_id : 0,
    publisher_logo_url: publisherLogo ?? undefined,
    image_url: resolvedImagePath
  }

  if (type !== "classic") {
    const options = buildOptions(answers)
    question.options = options
  } else {
    const classicAnswer = answers[0] ?? ""
    question.options = {
      A: classicAnswer,
      B: answers[1] ?? "",
      C: answers[2] ?? "",
      D: answers[3] ?? ""
    }
  }

  return question
}

export const loadLocalQuestionPack = async (): Promise<LocalQuestionPack | null> => {
  if (!isBrowser()) {
    return null
  }

  const baseHref = window.location.href

  let questionData: unknown | null = null
  let questionDataUrl: string | null = null
  for (const candidate of QUESTION_FILE_CANDIDATES) {
    try {
      const url = new URL(candidate, baseHref)
      questionData = await tryFetchJson(url)
      if (questionData) {
        questionDataUrl = url.toString()
        break
      }
    } catch {
      // ignore and try next candidate
    }
  }

  if (!questionData) {
    return null
  }

  const rawQuestions = normalizeToArray(questionData)
  const questionsSource = rawQuestions.length > 0 ? rawQuestions : normalizeToArray((questionData as Record<string, unknown>).questions)

  const assetBaseHref = questionDataUrl ?? baseHref

  const normalizedQuestions = (questionsSource.length > 0 ? questionsSource : rawQuestions)
    .map((entry, index) => convertToGameQuestion(entry as RawLocalQuestion, null, assetBaseHref, index))
    .filter((question): question is GameQuestion => !!question)

  if (normalizedQuestions.length === 0) {
    return null
  }

  let publisherLogo = await tryResolveExistingAsset(LOGO_FILE_CANDIDATES, baseHref)

  if (!publisherLogo && questionData && typeof questionData === "object") {
    const debugPayload = (questionData as Record<string, unknown>)._debug_api_response
    if (debugPayload && typeof debugPayload === "object") {
      const rawLogo = (debugPayload as Record<string, unknown>).logo_url
      if (typeof rawLogo === "string" && rawLogo.trim().length > 0) {
        publisherLogo = resolveLocalPath(rawLogo, baseHref)
      }
    }
  }

  const enrichedQuestions = normalizedQuestions.map((question) => ({
    ...question,
    publisher_logo_url: publisherLogo ?? question.publisher_logo_url
  }))

  return {
    questions: enrichedQuestions,
    publisherLogo: publisherLogo ?? null
  }
}
