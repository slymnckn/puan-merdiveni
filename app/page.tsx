"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import type { GameState, GameScreen, Team, GameSettingsType, SurpriseChoice } from "@/types/game"
import type { Advertisement, GameQuestion } from "@/types/api"
import MainMenu from "@/components/MainMenu"
import TeamSelection from "@/components/TeamSelection"
import GameSettingsComponent from "@/components/GameSettings"
import QuestionReady from "@/components/QuestionReady"
import LadderProgress from "@/components/LadderProgress"
import SurpriseEvent from "@/components/SurpriseEvent"
import GameResults from "@/components/GameResults"
import AdvertisementScreen from "@/components/AdvertisementScreen"
import AudioControls from "@/components/AudioControls"
import { getAssetPath } from "@/lib/asset-path"
import { apiService } from "@/lib/api-service"
import { 
  getLadderTarget, 
  applySurpriseEffect,
  determineWinner,
  convertGameQuestionToQuestion,
  evaluateSurpriseTrigger
} from "@/lib/game-utils"
import { placeholderQuestions } from "@/data/placeholder-questions"
import { useAudio } from "@/components/AudioProvider"

const QUESTION_SOURCE_PARAM_KEYS = ["questionsUrl", "questionUrl", "questions_url", "question_url", "questionSource", "question_source"]
const GAME_CODE_PARAM_KEYS = ["gameCode", "game_code", "code"]
const API_BASE_PARAM_KEYS = ["apiBaseUrl", "api_base_url", "apiBase", "api_base", "api"]

const getFirstParamValue = (params: URLSearchParams, keys: string[]) => {
  for (const key of keys) {
    const value = params.get(key)
    if (value) {
      return value
    }
  }
  return null
}

const extractGameCode = (input: string | null | undefined): string | undefined => {
  if (!input) return undefined
  const value = input.trim()
  if (!value) return undefined

  const tryResolve = (target: string) => {
    const segments = target.split("/").filter(Boolean)
    for (let i = 0; i < segments.length; i++) {
      if (segments[i - 1] === "code") {
        return segments[i]
      }
    }
    return segments[segments.length - 1]
  }

  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value)
      return tryResolve(url.pathname)
    }
  } catch {
    // Ignore URL parsing errors and fallback to string parsing
  }

  return tryResolve(value)
}

export default function GameApp() {
  const { playMusic, stopMusic, playSfx } = useAudio()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [currentAdIndex] = useState(0)
  const [gameQuestions, setGameQuestions] = useState<GameQuestion[]>([])
  const [gameState, setGameState] = useState<GameState>({
    currentScreen: "main-menu",
    teams: [
      { id: "A", name: "TAKIM A", character: null, score: 0, ladderPosition: 0 },
      { id: "B", name: "TAKIM B", character: null, score: 0, ladderPosition: 0 },
    ],
    settings: {
      questionCount: 20,
      gameMode: "timed",
      surpriseSystem: true,
    },
    currentQuestion: 1,
    totalQuestions: 20,
    timeLeft: 30,
    selectedAnswer: null,
    answerResult: null,
    correctAnswer: "B",
    currentQuestionData: null,
    ladderTarget: getLadderTarget(20),
    currentTurn: "A",
    gameStartTime: Date.now(),
    publisherLogo: null,
    surpriseData: null,
    surpriseTracker: {
      lastTriggeredQuestion: null,
      teamCounts: { A: 0, B: 0 }
    },
    questions: [],
    advertisements: [],
    currentAdvertisement: null,
    advertisementTimeLeft: 0,
  })

  const [lastCorrectTeam, setLastCorrectTeam] = useState<"A" | "B">("A")
  const [stepsGained, setStepsGained] = useState(3)

  const initialGameCodeRef = useRef(gameState.settings.gameCode || "default")

  const lobbyScreens = useMemo(() => new Set<GameScreen>(["main-menu", "team-selection", "game-settings"]), [])
  const inGameScreens = useMemo(
    () => new Set<GameScreen>(["question-ready", "question-active", "ladder-progress", "surprise-event"]),
    []
  )

  useEffect(() => {
    const currentScreen = gameState.currentScreen
    if (lobbyScreens.has(currentScreen)) {
      playMusic("lobby")
      return
    }

    if (inGameScreens.has(currentScreen)) {
      playMusic("game")
      return
    }

    if (currentScreen === "game-results") {
      stopMusic()
      return
    }

    // Default fallback: stop any ongoing music
    stopMusic()
  }, [gameState.currentScreen, inGameScreens, lobbyScreens, playMusic, stopMusic])

  // Soru havuzunu genişlet - yeterli soru yoksa placeholder'lardan ekle
  const ensureSufficientQuestions = (requiredCount: number): GameQuestion[] => {
    let availableQuestions = gameQuestions.length > 0 ? [...gameQuestions] : []
    
    // Yeterli soru yoksa placeholder'lardan ekle
    if (availableQuestions.length < requiredCount) {
      console.log(`Insufficient questions (${availableQuestions.length}/${requiredCount}). Adding placeholders...`)
      
      // Placeholder'ları karıştır
      const shuffledPlaceholders = [...placeholderQuestions].sort(() => Math.random() - 0.5)
      
      // Eksik sayı kadar placeholder ekle
      const neededCount = requiredCount - availableQuestions.length
      const additionalQuestions = shuffledPlaceholders.slice(0, neededCount)
      
      availableQuestions = [...availableQuestions, ...additionalQuestions]
      console.log(`Added ${additionalQuestions.length} placeholder questions. Total: ${availableQuestions.length}`)
    }
    
    return availableQuestions
  }

  // Initialize game data on mount
  useEffect(() => {
    const initializeGame = async () => {
      let questionSource = initialGameCodeRef.current || "default"

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const baseUrlParam = getFirstParamValue(params, API_BASE_PARAM_KEYS)
        const questionSourceParam = getFirstParamValue(params, QUESTION_SOURCE_PARAM_KEYS)
        const gameCodeParam = getFirstParamValue(params, GAME_CODE_PARAM_KEYS)

        if (baseUrlParam) {
          apiService.setBaseUrl(decodeURIComponent(baseUrlParam))
        }

        const providedSource = questionSourceParam ?? gameCodeParam

        if (providedSource) {
          questionSource = decodeURIComponent(providedSource)
          initialGameCodeRef.current = questionSource
        }
      }

      if (!initialGameCodeRef.current) {
        initialGameCodeRef.current = questionSource
      }

      const resolvedGameCode = extractGameCode(initialGameCodeRef.current) ?? "default"

      const [ads, fetchedQuestions] = await Promise.all([
        apiService.fetchAdvertisements(),
        apiService.fetchQuestions(initialGameCodeRef.current || "default")
      ])

      setAdvertisements(ads)
      setGameQuestions(fetchedQuestions)

      setGameState((prev) => ({
        ...prev,
        currentScreen: ads.length > 0 ? "advertisement" : "main-menu",
        advertisements: ads,
        currentAdvertisement: ads[0] ?? null,
        advertisementTimeLeft: ads[0]?.duration_seconds ?? 0,
        settings: {
          ...prev.settings,
          gameCode: resolvedGameCode
        }
      }))

      console.log("Loaded questions:", fetchedQuestions.length, "source:", initialGameCodeRef.current)
    }

    initializeGame().catch((error) => {
      console.error("Failed to initialize game:", error)
    })
  }, [])

  // Log when gameQuestions changes for debugging
  useEffect(() => {
    console.log('gameQuestions updated:', gameQuestions.length, 'questions available')
  }, [gameQuestions])

  const navigateToScreen = (screen: GameScreen) => {
    setGameState((prev) => ({ ...prev, currentScreen: screen }))
  }

  const handleAdvertisementClose = () => {
    setGameState((prev) => ({ 
      ...prev, 
      currentScreen: "main-menu",
      currentAdvertisement: null,
      advertisementTimeLeft: 0
    }))
  }

  const handleStartGame = () => {
    navigateToScreen("team-selection")
  }

  const handleTeamsUpdate = (updatedTeams: Team[]) => {
    setGameState((prev) => ({ ...prev, teams: updatedTeams }))
  }

  const handleContinueFromTeamSelection = () => {
    navigateToScreen("game-settings")
  }

  const handleSettingsUpdate = (updatedSettings: GameSettingsType) => {
    setGameState((prev) => ({ ...prev, settings: updatedSettings }))
  }

  const handleStartFromSettings = () => {
    // Yeterli soru olduğundan emin ol
    const requiredQuestionCount = gameState.settings.questionCount
    const questionsToUse = ensureSufficientQuestions(requiredQuestionCount)
    
    console.log('Starting game with:', {
      requiredQuestions: requiredQuestionCount,
      availableQuestions: questionsToUse.length,
      fromAPI: gameQuestions.length,
      fromPlaceholder: questionsToUse.length - gameQuestions.length
    })
    
    if (questionsToUse.length === 0) {
      console.error('No questions available at all! This should not happen.')
      return
    }
    
    const rawQuestion = questionsToUse[0]
    console.log('First question:', rawQuestion)
    
    if (!rawQuestion) {
      console.error('First question is null!')
      return
    }
    
    const firstQuestion = convertGameQuestionToQuestion(rawQuestion)
    console.log('Converted first question:', firstQuestion)
    
    // Genişletilmiş soru havuzunu state'e kaydet
    setGameQuestions(questionsToUse)
    
    setGameState((prev) => ({
      ...prev,
      currentScreen: "question-ready",
      currentQuestionData: firstQuestion,
      correctAnswer: firstQuestion.correct_answer,
      totalQuestions: prev.settings.questionCount,
      ladderTarget: getLadderTarget(prev.settings.questionCount),
      gameStartTime: Date.now(),
      surpriseTracker: {
        lastTriggeredQuestion: null,
        teamCounts: { A: 0, B: 0 }
      }
    }))
  }

  const handleAdComplete = () => {
    setGameState(prev => ({ ...prev, currentScreen: "main-menu" }))
  }

  const handleAdSkip = () => {
    setGameState(prev => ({ ...prev, currentScreen: "main-menu" }))
  }

  const handleShowQuestion = () => {
    setGameState((prev) => ({
      ...prev,
      currentScreen: "question-active",
      timeLeft: 30,
      selectedAnswer: null,
      answerResult: null,
    }))
  }

  const calculateStepsGained = (timeLeft: number, gameMode: "timed" | "untimed") => {
    if (gameMode === "untimed") return 1

    if (timeLeft >= 20) return 3 // 0-10 seconds used
    if (timeLeft >= 10) return 2 // 11-20 seconds used
    return 1 // 21-30 seconds used
  }

  const handleAnswerClick = (answer: string) => {
    // Cevap durumunu kontrol et
    let isCorrect = false
    
    // Classic soru tipi için özel kontrol
    if (gameState.currentQuestionData?.type === "classic") {
      // answer "correct" veya "wrong" olarak geliyor (manuel seçim)
      isCorrect = answer === "correct"
    }
    // True/False sorular için özel kontrol
    else if (gameState.currentQuestionData?.type === "true_false") {
      // answer "A" veya "B" olarak geliyor
      // correctAnswer "true" veya "false" olarak API'den geliyor
      const selectedValue = answer === "A" ? "true" : "false"
      isCorrect = selectedValue === gameState.correctAnswer
    } else {
      // Multiple choice ve diğer tipler için normal karşılaştırma
      isCorrect = answer === gameState.correctAnswer
    }
    
    const currentTeam = gameState.currentQuestion % 2 === 1 ? "A" : "B" // Alternate teams

    // Cevap durumunu state'e kaydet
    setGameState((prev) => ({ 
      ...prev, 
      selectedAnswer: answer,
      answerResult: isCorrect ? "correct" : "wrong"
    }))

    if (isCorrect) {
      playSfx("correct")
      const steps = calculateStepsGained(gameState.timeLeft, gameState.settings.gameMode)
      setStepsGained(steps)
      setLastCorrectTeam(currentTeam)

      setGameState((prev) => ({
        ...prev,
        teams: prev.teams.map((team) =>
          team.id === currentTeam
            ? { ...team, ladderPosition: team.ladderPosition + steps, score: team.score + 1 }
            : team,
        ),
      }))
    } else {
      // Yanlış cevap durumunda stepsGained'i 0'a set et
      playSfx("wrong")
      setStepsGained(0)
    }

    // Artık otomatik geçmiyor, kullanıcı "Devam Et" butonuna basacak
  }

  const handleContinueToLadder = () => {
    navigateToScreen("ladder-progress")
  }

  const handleContinueFromLadder = () => {
    // Check if game should end using the utility function
    const winner = determineWinner(gameState.teams, gameState.ladderTarget)
    const questionsExhausted = gameState.currentQuestion >= gameState.settings.questionCount
    
    // Oyun sadece birisi hedefe ulaştıysa VEYA sorular bittiyse biter
    const shouldEndGame = (winner !== 'tie') || questionsExhausted

    if (shouldEndGame) {
      navigateToScreen("game-results")
    } else {
      const surpriseDecision = gameState.settings.surpriseSystem
        ? evaluateSurpriseTrigger({
            tracker: gameState.surpriseTracker,
            currentQuestion: gameState.currentQuestion,
            currentTurn: gameState.currentTurn
          })
        : null

      if (surpriseDecision?.triggered) {
        setGameState((prev) => ({
          ...prev,
          currentScreen: "surprise-event",
          surpriseData: {
            luckyNumber: Math.floor(Math.random() * 6) + 1,
            availableChoices: [],
            selectedChoice: undefined
          },
          surpriseTracker: surpriseDecision.tracker
        }))
      } else {
  const questionsToUse = gameQuestions.length > 0 ? gameQuestions : placeholderQuestions
        const nextQuestionIndex = gameState.currentQuestion // currentQuestion is already the next index
        const rawQuestion = questionsToUse[nextQuestionIndex]
        
        console.log('Loading next question:', nextQuestionIndex, rawQuestion, questionsToUse.length)
        
        if (!rawQuestion) {
          // No more questions, end game
          navigateToScreen("game-results")
          return
        }
        
        const nextQuestion = convertGameQuestionToQuestion(rawQuestion)
        
        setGameState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          currentScreen: "question-ready",
          currentQuestionData: nextQuestion,
          correctAnswer: nextQuestion.correct_answer,
          currentTurn: prev.currentTurn === "A" ? "B" : "A", // Switch turns
          surpriseTracker: surpriseDecision ? surpriseDecision.tracker : prev.surpriseTracker,
        }))
      }
    }
  }

  const handleSurpriseComplete = (selectedChoice: SurpriseChoice) => {
    setGameState((prev) => {
      // Apply surprise effect using utility function
      const updatedTeams = applySurpriseEffect(prev.teams, selectedChoice, prev.currentTurn)
      
      // Check for game end conditions
      const winner = determineWinner(updatedTeams, prev.ladderTarget)
      const questionsExhausted = prev.currentQuestion >= prev.totalQuestions
      
      // Oyun sadece birisi hedefe ulaştıysa VEYA sorular bittiyse biter
      const shouldEndGame = (winner !== 'tie') || questionsExhausted
      
      if (shouldEndGame) {
        // Send game end callback
        apiService.sendCallback({
          event_type: 'game_end',
          game_code: prev.settings.gameCode,
          team_scores: { 
            teamA: updatedTeams[0].ladderPosition, 
            teamB: updatedTeams[1].ladderPosition 
          },
          winner: winner,
          question_count: prev.currentQuestion - 1,
          total_time: Math.round((Date.now() - prev.gameStartTime) / 1000)
        })
        
        return {
          ...prev,
          teams: updatedTeams,
          currentScreen: "game-results"
        }
      }
      
      // Continue game - load next question
  const questionsToUse = gameQuestions.length > 0 ? gameQuestions : placeholderQuestions
      const nextQuestionIndex = prev.currentQuestion
      const rawQuestion = questionsToUse[nextQuestionIndex]
      
      if (!rawQuestion) {
        // No more questions, end game
        return {
          ...prev,
          teams: updatedTeams,
          currentScreen: "game-results"
        }
      }
      
      const nextQuestion = convertGameQuestionToQuestion(rawQuestion)
      
      return {
        ...prev,
        teams: updatedTeams,
        currentQuestion: prev.currentQuestion + 1,
        currentScreen: "question-ready",
        currentQuestionData: nextQuestion,
        correctAnswer: nextQuestion.correct_answer,
        currentTurn: prev.currentTurn === "A" ? "B" : "A", // Switch turns
        surpriseData: null
      }
    })
  }

  const handlePlayAgain = () => {
    setGameState((prev) => ({
      currentScreen: "main-menu",
      teams: [
        { id: "A", name: "TAKIM A", character: null, score: 0, ladderPosition: 0 },
        { id: "B", name: "TAKIM B", character: null, score: 0, ladderPosition: 0 },
      ],
      settings: {
        questionCount: 20,
        gameMode: "timed",
        surpriseSystem: true,
        gameCode: prev.settings.gameCode,
      },
      currentQuestion: 1,
      totalQuestions: 20,
      timeLeft: 30,
      selectedAnswer: null,
      answerResult: null,
      correctAnswer: "B",
      currentQuestionData: null,
      ladderTarget: getLadderTarget(20),
      currentTurn: "A",
      gameStartTime: Date.now(),
      publisherLogo: null,
      surpriseData: null,
      surpriseTracker: {
        lastTriggeredQuestion: null,
        teamCounts: { A: 0, B: 0 }
      },
      questions: [],
      advertisements: [],
      currentAdvertisement: null,
      advertisementTimeLeft: 0,
    }))
  }

  // Timer countdown for question screen
  useEffect(() => {
    if (
      gameState.currentScreen === "question-active" &&
      gameState.settings.gameMode === "timed" &&
      gameState.timeLeft > 0 &&
      !gameState.selectedAnswer // Timer sadece cevap seçilmediğinde çalışır
    ) {
      const timer = setTimeout(() => setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 })), 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState.currentScreen, gameState.timeLeft, gameState.settings.gameMode, gameState.selectedAnswer])

  // Render current screen
  switch (gameState.currentScreen) {
    case "advertisement":
      if (advertisements.length > 0 && currentAdIndex < advertisements.length) {
        return (
          <AdvertisementScreen
            advertisement={advertisements[currentAdIndex]}
            onAdComplete={handleAdComplete}
            onAdSkip={handleAdSkip}
          />
        )
      }
      return <MainMenu onStartGame={handleStartGame} />
      
    case "main-menu":
      return <MainMenu onStartGame={handleStartGame} />

    case "team-selection":
      return (
        <TeamSelection
          teams={gameState.teams}
          onTeamsUpdate={handleTeamsUpdate}
          onContinue={handleContinueFromTeamSelection}
        />
      )

    case "game-settings":
      return (
        <GameSettingsComponent
          settings={gameState.settings}
          onSettingsUpdate={handleSettingsUpdate}
          onStartGame={handleStartFromSettings}
        />
      )

    case "question-ready":
      return <QuestionReady gameState={gameState} onShowQuestion={handleShowQuestion} currentTurn={gameState.currentTurn} />

    case "ladder-progress":
      console.log('📊 Rendering LadderProgress:', { 
        stepsGained, 
        lastCorrectTeam, 
        correctTeam: stepsGained > 0 ? lastCorrectTeam : null,
        currentQuestion: gameState.currentQuestion 
      })
      return (
        <LadderProgress
          key={`ladder-${gameState.currentQuestion}`} // Her soru için yeni component instance
          gameState={gameState}
          onContinue={handleContinueFromLadder}
          stepsGained={stepsGained}
          correctTeam={stepsGained > 0 ? lastCorrectTeam : null}
        />
      )

    case "surprise-event":
      return <SurpriseEvent gameState={gameState} onSurpriseComplete={handleSurpriseComplete} />

    case "game-results":
      return <GameResults gameState={gameState} onPlayAgain={handlePlayAgain} />

    case "question-active": {
      const backgroundImage = getAssetPath("/assets/background.png")
      const questionCounterBanner = getAssetPath("/assets/soru-sayac-banneri.png")
      const timerAsset = getAssetPath("/assets/sure.png")
      const questionCardAsset = getAssetPath("/assets/soru-arkasi.png")
      const defaultButtonAsset = getAssetPath("/assets/genel-buton.png")
      const correctButtonAsset = getAssetPath("/assets/correct-button.png")
      const wrongButtonAsset = getAssetPath("/assets/wrong-button.png")
      const continueButtonAsset = getAssetPath("/assets/devam-et.png")
      const teamAButtonAsset = gameState.currentTurn === "A" ? correctButtonAsset : defaultButtonAsset
      const teamBButtonAsset = gameState.currentTurn === "B" ? correctButtonAsset : defaultButtonAsset
      const teamACharacterAsset = getAssetPath(gameState.teams[0].character?.image || "/assets/hero-2.png")
      const teamBCharacterAsset = getAssetPath(gameState.teams[1].character?.image || "/assets/hero-1.png")
      const questionImageAsset = gameState.currentQuestionData?.image_url
        ? getAssetPath(gameState.currentQuestionData.image_url)
        : null

      return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="relative z-10 h-full">
            {/* Top Section - Question Counter and Timer */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-between w-full pl-8 pr-16 md:pr-20 pt-6 z-20">
              {/* Question Counter Banner */}
              <div className="relative">
                <img src={questionCounterBanner} alt="Question Banner" className="h-16 w-auto" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-15px' }}>
                  <span className="text-amber-900 font-bold text-lg drop-shadow-sm">
                    Soru {gameState.currentQuestion}/{gameState.settings.questionCount}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="flex flex-col items-end gap-2">
                <div className="relative">
                  <img src={timerAsset} alt="Timer" className="h-14 w-auto" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-900 font-bold text-xl drop-shadow-sm">
                      Süre: {gameState.settings.gameMode === "timed" ? gameState.timeLeft : "---"}
                    </span>
                  </div>
                </div>
                <AudioControls orientation="vertical" className="mt-1" />
              </div>
            </div>

            {/* Team Banners - Sol tarafta dikey */}
            <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
              {/* Team A */}
              <div className={`relative ${gameState.currentTurn === 'A' ? 'animate-gentle-bounce' : ''}`}>
                <img 
                  src={teamAButtonAsset} 
                  alt="Team A Score" 
                  className={`h-20 w-auto min-w-[200px] transition-all ${gameState.currentTurn === 'A' ? 'drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]' : ''}`}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={teamACharacterAsset}
                    alt="Team A Character"
                    className="h-10 w-10"
                  />
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    TAKIM A
                  </span>
                  <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[0].ladderPosition}</span>
                </div>
              </div>

              {/* Team B */}
              <div className={`relative ${gameState.currentTurn === 'B' ? 'animate-gentle-bounce' : ''}`}>
                <img 
                  src={teamBButtonAsset} 
                  alt="Team B Score" 
                  className={`h-20 w-auto min-w-[200px] transition-all ${gameState.currentTurn === 'B' ? 'drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]' : ''}`}
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={teamBCharacterAsset}
                    alt="Team B Character"
                    className="h-10 w-10"
                  />
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    TAKIM B
                  </span>
                  <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[1].ladderPosition}</span>
                </div>
              </div>
            </div>

            {/* Soru Banner - Büyütülmüş ve merkezde */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-[52%] -translate-y-1/2 w-full max-w-7xl px-4" style={{ paddingLeft: '260px', paddingRight: '160px' }}>
              <div className="relative w-full">
                <img src={questionCardAsset} alt="Question Background" className="w-full h-auto" style={{ transform: 'scale(1.15)' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-10" style={{ paddingTop: '75px' }}>
                  {gameState.currentQuestionData && (
                    <div className="w-full">
                      {/* Görselli soru için yatay layout */}
                      {gameState.currentQuestionData.image_url ? (
                        <div className="flex items-start gap-8">
                          {/* Sol taraf - Görsel */}
                          <div className="flex-shrink-0" style={{ marginLeft: '-30px', marginTop: '20px' }}>
                            <div className="bg-white p-3 rounded-lg shadow-lg" style={{ width: '220px' }}>
                              <img
                                src={questionImageAsset ?? ""}
                                alt="Soru görseli"
                                className="w-full h-auto rounded"
                                style={{ maxHeight: '220px', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                          
                          {/* Sağ taraf - Soru ve Şıklar */}
                          <div className="flex-1" style={{ paddingRight: '0px', marginTop: '5px' }}>
                            <h2 className="text-white text-2xl font-bold mb-6 drop-shadow-lg text-left">
                              Soru: {gameState.currentQuestionData.question_text}
                            </h2>
                            
                            {/* Şıklar için render */}
                            {gameState.currentQuestionData.type === "true_false" ? (
                              <div className="grid grid-cols-2 gap-3 w-full" style={{ maxWidth: '650px' }}>
                          {["true", "false"].map((option) => {
                            const key = option === "true" ? "A" : "B"
                            const text = option === "true" ? "Doğru" : "Yanlış"
                            
                            let buttonImage = defaultButtonAsset
                            
                            if (gameState.answerResult && gameState.selectedAnswer) {
                              // Seçilen buton
                              if (key === gameState.selectedAnswer) {
                                buttonImage = gameState.answerResult === "correct" ? correctButtonAsset : wrongButtonAsset
                              } 
                              // Doğru cevabı göster (yanlış seçildiğinde)
                              else if (gameState.answerResult === "wrong") {
                                // correctAnswer "true" veya "false" string olarak geliyor
                                const correctKey = gameState.correctAnswer === "true" ? "A" : "B"
                                if (key === correctKey) {
                                  buttonImage = correctButtonAsset
                                }
                              }
                            }
                            
                            return (
                              <button
                                key={key}
                                onClick={() => !gameState.answerResult && handleAnswerClick(key)}
                                disabled={!!gameState.answerResult}
                                className={`relative group transition-transform hover:scale-105 ${
                                  gameState.selectedAnswer === key ? "scale-105" : ""
                                } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                                <div className="absolute inset-0 flex items-center justify-center px-4">
                                  <span className="text-white font-bold text-lg drop-shadow-lg text-center truncate max-w-full">
                                    {key}) {text}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      ) : gameState.currentQuestionData.type === "classic" ? (
                        <div className="text-center space-y-4">
                          {!gameState.selectedAnswer ? (
                            // İlk aşama: Cevabı Göster butonu
                            <button
                              onClick={() => {
                                setGameState((prev) => ({ 
                                  ...prev, 
                                  selectedAnswer: "show_answer" 
                                }))
                              }}
                              className="relative group transition-transform hover:scale-105 cursor-pointer"
                            >
                              <img src={defaultButtonAsset} alt="Show Answer Button" className="w-64 h-auto" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-xl drop-shadow-lg">
                                  Cevabı Göster
                                </span>
                              </div>
                            </button>
                          ) : (
                            // İkinci aşama: Cevap gösterildi
                            <div className="space-y-6">
                              {/* Cevabı göster - Sade format */}
                              <div className="text-center">
                                <p className="text-yellow-300 font-bold text-2xl mb-4">CEVAP:</p>
                                <p className="text-white text-3xl font-bold drop-shadow-lg">
                                  {gameState.currentQuestionData.options?.A || "Cevap yükleniyor..."}
                                </p>
                              </div>
                              
                              {/* Doğru / Yanlış bilme butonları - Sadece cevap verilmemişse göster */}
                              {!gameState.answerResult && (
                                <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
                                  <button
                                    onClick={() => handleAnswerClick("correct")}
                                    className="relative group transition-transform hover:scale-105 cursor-pointer"
                                  >
                                    <img src={correctButtonAsset} alt="Correct Button" className="w-full h-auto" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-bold text-xl drop-shadow-lg">
                                        ✅ Doğru Bildi
                                      </span>
                                    </div>
                                  </button>
                                  
                                  <button
                                    onClick={() => handleAnswerClick("wrong")}
                                    className="relative group transition-transform hover:scale-105 cursor-pointer"
                                  >
                                    <img src={wrongButtonAsset} alt="Wrong Button" className="w-full h-auto" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-white font-bold text-xl drop-shadow-lg">
                                        ❌ Yanlış Bildi
                                      </span>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 w-full" style={{ maxWidth: '650px' }}>
                          {gameState.currentQuestionData.options && Object.entries(gameState.currentQuestionData.options).map(([key, text]) => {
                            if (!text) return null
                            
                            let buttonImage = defaultButtonAsset
                            
                            if (gameState.answerResult && gameState.selectedAnswer) {
                              if (key === gameState.selectedAnswer) {
                                buttonImage = gameState.answerResult === "correct" ? correctButtonAsset : wrongButtonAsset
                              } else if (key === gameState.correctAnswer && gameState.answerResult === "wrong") {
                                buttonImage = correctButtonAsset
                              }
                            }

                            return (
                              <button
                                key={key}
                                onClick={() => !gameState.answerResult && handleAnswerClick(key)}
                                disabled={!!gameState.answerResult}
                                className={`relative group transition-transform hover:scale-105 ${
                                  gameState.selectedAnswer === key ? "scale-105" : ""
                                } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                                <div className="absolute inset-0 flex items-center justify-center px-4">
                                  <span className="text-white font-bold text-lg drop-shadow-lg text-center line-clamp-2 max-w-full overflow-hidden">
                                    {key}) {text}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                          </div>
                        </div>
                      ) : (
                        // Görselsiz soru için normal merkezi layout
                        <div className="text-center">
                          <h2 className="text-white text-3xl font-bold mb-8 drop-shadow-lg">
                            Soru: {gameState.currentQuestionData.question_text}
                          </h2>
                          
                          {gameState.currentQuestionData.type === "true_false" ? (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                              {["true", "false"].map((option) => {
                                const key = option === "true" ? "A" : "B"
                                const text = option === "true" ? "Doğru" : "Yanlış"
                                
                                let buttonImage = defaultButtonAsset
                                
                                if (gameState.answerResult && gameState.selectedAnswer) {
                                  if (key === gameState.selectedAnswer) {
                                    buttonImage = gameState.answerResult === "correct" ? correctButtonAsset : wrongButtonAsset
                                  } else if (gameState.answerResult === "wrong") {
                                    const correctKey = gameState.correctAnswer === "true" ? "A" : "B"
                                    if (key === correctKey) {
                                      buttonImage = correctButtonAsset
                                    }
                                  }
                                }
                                
                                return (
                                  <button
                                    key={key}
                                    onClick={() => !gameState.answerResult && handleAnswerClick(key)}
                                    disabled={!!gameState.answerResult}
                                    className={`relative group transition-transform hover:scale-105 ${
                                      gameState.selectedAnswer === key ? "scale-105" : ""
                                    } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                                    <div className="absolute inset-0 flex items-center justify-center px-4">
                                      <span className="text-white font-bold text-xl drop-shadow-lg text-center truncate max-w-full">
                                        {key}) {text}
                                      </span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          ) : gameState.currentQuestionData.type === "classic" ? (
                            <div className="text-center space-y-4">
                              {!gameState.selectedAnswer ? (
                                <button
                                  onClick={() => {
                                    setGameState((prev) => ({ 
                                      ...prev, 
                                      selectedAnswer: "show_answer" 
                                    }))
                                  }}
                                  className="relative group transition-transform hover:scale-105 cursor-pointer"
                                >
                                  <img src={defaultButtonAsset} alt="Show Answer Button" className="w-64 h-auto" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-xl drop-shadow-lg">
                                      Cevabı Göster
                                    </span>
                                  </div>
                                </button>
                              ) : (
                                <div className="space-y-6">
                                  <div className="text-center">
                                    <p className="text-yellow-300 font-bold text-2xl mb-4">CEVAP:</p>
                                    <p className="text-white text-3xl font-bold drop-shadow-lg">
                                      {gameState.currentQuestionData.options?.A || "Cevap yükleniyor..."}
                                    </p>
                                  </div>
                                  
                                  {!gameState.answerResult && (
                                    <div className="grid grid-cols-2 gap-5 max-w-2xl mx-auto">
                                      <button
                                        onClick={() => handleAnswerClick("correct")}
                                        className="relative group transition-transform hover:scale-105 cursor-pointer"
                                      >
                                        <img src={correctButtonAsset} alt="Correct Button" className="w-full h-auto" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-white font-bold text-xl drop-shadow-lg">
                                            ✅ Doğru Bildi
                                          </span>
                                        </div>
                                      </button>
                                      
                                      <button
                                        onClick={() => handleAnswerClick("wrong")}
                                        className="relative group transition-transform hover:scale-105 cursor-pointer"
                                      >
                                        <img src={wrongButtonAsset} alt="Wrong Button" className="w-full h-auto" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                          <span className="text-white font-bold text-xl drop-shadow-lg">
                                            ❌ Yanlış Bildi
                                          </span>
                                        </div>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl mx-auto">
                              {gameState.currentQuestionData.options && Object.entries(gameState.currentQuestionData.options).map(([key, text]) => {
                                if (!text) return null
                                
                                let buttonImage = defaultButtonAsset
                                
                                if (gameState.answerResult && gameState.selectedAnswer) {
                                  if (key === gameState.selectedAnswer) {
                                    buttonImage = gameState.answerResult === "correct" ? correctButtonAsset : wrongButtonAsset
                                  } else if (key === gameState.correctAnswer && gameState.answerResult === "wrong") {
                                    buttonImage = correctButtonAsset
                                  }
                                }

                                return (
                                  <button
                                    key={key}
                                    onClick={() => !gameState.answerResult && handleAnswerClick(key)}
                                    disabled={!!gameState.answerResult}
                                    className={`relative group transition-transform hover:scale-105 ${
                                      gameState.selectedAnswer === key ? "scale-105" : ""
                                    } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                                    <div className="absolute inset-0 flex items-center justify-center px-4">
                                      <span className="text-white font-bold text-xl drop-shadow-lg text-center line-clamp-2 max-w-full overflow-hidden">
                                        {key}) {text}
                                      </span>
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Devam Et Butonu - Ekranın sağ tarafında sabit pozisyon */}
            {gameState.answerResult && (
              <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-30">
                <button
                  onClick={handleContinueToLadder}
                  className="relative group transition-transform hover:scale-110 cursor-pointer"
                >
                  <img 
                    src={continueButtonAsset} 
                    alt="Devam Et" 
                    className="h-50 w-auto object-contain drop-shadow-2xl" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xl drop-shadow-lg">
                      DEVAM ET
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      )

    }
    case "advertisement":
      if (gameState.currentAdvertisement) {
        return (
          <AdvertisementScreen 
            advertisement={gameState.currentAdvertisement}
            onAdComplete={handleAdvertisementClose}
            onAdSkip={handleAdvertisementClose}
          />
        )
      }
      return <MainMenu onStartGame={handleStartGame} />

    default:
      return <MainMenu onStartGame={handleStartGame} />
  }
}
