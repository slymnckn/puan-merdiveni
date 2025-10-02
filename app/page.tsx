"use client"

import { useState, useEffect } from "react"
import type { GameState, GameScreen, Team, GameSettingsType, SurpriseChoice } from "@/types/game"
import type { Advertisement, GameQuestion } from "@/types/api"
import MainMenu from "@/components/MainMenu"
import TeamSelection from "@/components/TeamSelection"
import GameSettingsComponent from "@/components/GameSettings"
import QuestionReady from "@/components/QuestionReady"
import LadderProgress from "@/components/LadderProgress"
import SurpriseEvent from "@/components/SurpriseEvent"
import GameResults from "@/components/GameResults"
import QuestionDisplay from "@/components/QuestionDisplay"
import AdvertisementScreen from "@/components/AdvertisementScreen"
import PublisherLogo from "@/components/PublisherLogo"
import { apiService } from "@/lib/api-service"
import { 
  getLadderTarget, 
  calculateStepsForTimedMode, 
  calculateStepsForUntimedMode,
  applySurpriseEffect,
  determineWinner,
  selectSurpriseChoice,
  convertGameQuestionToQuestion
} from "@/lib/game-utils"
import { questions } from "@/data/questions"
import { placeholderQuestions } from "@/data/placeholder-questions"

export default function GameApp() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
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
    questions: [],
    advertisements: [],
    currentAdvertisement: null,
    advertisementTimeLeft: 0,
  })

  const [lastCorrectTeam, setLastCorrectTeam] = useState<"A" | "B">("A")
  const [stepsGained, setStepsGained] = useState(3)

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
      // Fetch advertisements first
      const ads = await apiService.fetchAdvertisements()
      setAdvertisements(ads)
      
      // Set initial screen based on whether we have ads
      if (ads.length > 0) {
        setGameState(prev => ({ 
          ...prev, 
          currentScreen: "advertisement",
          advertisements: ads,
          currentAdvertisement: ads[0],
          advertisementTimeLeft: ads[0]?.duration_seconds || 0
        }))
      } else {
        setGameState(prev => ({ 
          ...prev, 
          currentScreen: "main-menu"
        }))
      }
      
      // Fetch questions (can be done in parallel)
      const questions = await apiService.fetchQuestions(gameState.settings.gameCode || 'default')
      console.log('Loaded questions:', questions.length)
      setGameQuestions(questions)
    }
    
    initializeGame()
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
    }))
  }

  const handleAdComplete = () => {
    setGameState(prev => ({ ...prev, currentScreen: "main-menu" }))
  }

  const handleAdSkip = () => {
    setGameState(prev => ({ ...prev, currentScreen: "main-menu" }))
  }

  const loadNextQuestion = () => {
    const questionsToUse = gameQuestions.length > 0 ? gameQuestions : questions
    const questionIndex = gameState.currentQuestion - 1
    const nextQuestion = questionsToUse[questionIndex] || questionsToUse[0] // Fallback
    
    console.log('Loading question:', {
      questionIndex,
      currentQuestion: gameState.currentQuestion,
      availableQuestions: questionsToUse.length,
      nextQuestion
    })
    
    if (nextQuestion) {
      setGameState((prev) => ({
        ...prev,
        currentQuestionData: nextQuestion,
        correctAnswer: nextQuestion.correct_answer,
      }))
    } else {
      console.error('No question found at index:', questionIndex)
    }
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
      // Check for surprise event (every 3 questions)
      if (gameState.settings.surpriseSystem && gameState.currentQuestion % 3 === 0) {
        setGameState((prev) => ({
          ...prev,
          currentScreen: "surprise-event",
          surpriseData: {
            luckyNumber: Math.floor(Math.random() * 6) + 1, // 1-6 dice roll
            availableChoices: [],
            selectedChoice: undefined
          }
        }))
      } else {
        const questionsToUse = gameQuestions.length > 0 ? gameQuestions : questions
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
      const questionsToUse = gameQuestions.length > 0 ? gameQuestions : questions
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
    setGameState({
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
      questions: [],
      advertisements: [],
      currentAdvertisement: null,
      advertisementTimeLeft: 0,
    })
  }

  // Timer countdown for question screen
  useEffect(() => {
    if (
      gameState.currentScreen === "question-active" &&
      gameState.settings.gameMode === "timed" &&
      gameState.timeLeft > 0
    ) {
      const timer = setTimeout(() => setGameState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 })), 1000)
      return () => clearTimeout(timer)
    }
  }, [gameState.currentScreen, gameState.timeLeft, gameState.settings.gameMode])

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
      return <QuestionReady gameState={gameState} onShowQuestion={handleShowQuestion} />

    case "ladder-progress":
      return (
        <LadderProgress
          gameState={gameState}
          onContinue={handleContinueFromLadder}
          stepsGained={stepsGained}
          correctTeam={lastCorrectTeam}
        />
      )

    case "surprise-event":
      return <SurpriseEvent gameState={gameState} onSurpriseComplete={handleSurpriseComplete} />

    case "game-results":
      return <GameResults gameState={gameState} onPlayAgain={handlePlayAgain} />

    case "question-active":
      return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: "url(/assets/background.png)",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          ></div>

          <div className="relative z-10 h-full">
            {/* Top Section - Question Counter and Timer */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-between w-full px-8 pt-6 z-20">
              {/* Question Counter Banner */}
              <div className="relative">
                <img src="/assets/soru-sayac-banneri.png" alt="Question Banner" className="h-16 w-auto" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-15px' }}>
                  <span className="text-amber-900 font-bold text-lg drop-shadow-sm">
                    Soru {gameState.currentQuestion}/{gameState.settings.questionCount}
                  </span>
                </div>
              </div>

              {/* Timer */}
              <div className="relative">
                <img src="/assets/sure.png" alt="Timer" className="h-14 w-auto" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-900 font-bold text-xl drop-shadow-sm">
                    {gameState.settings.gameMode === "timed" ? gameState.timeLeft : "---"}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[60%] w-full max-w-4xl px-8">
              <div className="relative w-full">
                <img src="/assets/soru-arkasi.png" alt="Question Background" className="w-full h-auto" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  {gameState.currentQuestionData && (
                    <div className="w-full text-center">
                      <h2 className="text-white text-2xl font-bold mb-6 drop-shadow-lg">
                        Soru: {gameState.currentQuestionData.question_text}
                      </h2>
                      
                      {/* Render different UI based on question type */}
                      {gameState.currentQuestionData.type === "true_false" ? (
                        <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
                          {["true", "false"].map((option) => {
                            const key = option === "true" ? "A" : "B"
                            const text = option === "true" ? "Doğru" : "Yanlış"
                            
                            let buttonImage = "/assets/genel-buton.png"
                            
                            if (gameState.answerResult && gameState.selectedAnswer) {
                              // Seçilen buton
                              if (key === gameState.selectedAnswer) {
                                buttonImage = gameState.answerResult === "correct" ? "/assets/correct-button.png" : "/assets/wrong-button.png"
                              } 
                              // Doğru cevabı göster (yanlış seçildiğinde)
                              else if (gameState.answerResult === "wrong") {
                                // correctAnswer "true" veya "false" string olarak geliyor
                                const correctKey = gameState.correctAnswer === "true" ? "A" : "B"
                                if (key === correctKey) {
                                  buttonImage = "/assets/correct-button.png"
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
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white font-bold text-base drop-shadow-lg">
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
                              <img src="/assets/genel-buton.png" alt="Show Answer Button" className="w-56 h-auto" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-base drop-shadow-lg">
                                  Cevabı Göster
                                </span>
                              </div>
                            </button>
                          ) : !gameState.answerResult ? (
                            // İkinci aşama: Cevap gösterildi, şimdi Doğru/Yanlış bilme butonları
                            <div className="space-y-4">
                              {/* Cevabı göster */}
                              <div className="bg-purple-900/80 backdrop-blur-sm rounded-lg px-6 py-4 border-2 border-yellow-400">
                                <p className="text-yellow-300 font-semibold text-sm mb-2">CEVAP:</p>
                                <p className="text-white text-lg font-bold">
                                  {gameState.currentQuestionData.options?.A || "Cevap yükleniyor..."}
                                </p>
                              </div>
                              
                              {/* Doğru / Yanlış bilme butonları */}
                              <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                                <button
                                  onClick={() => handleAnswerClick("correct")}
                                  className="relative group transition-transform hover:scale-105 cursor-pointer"
                                >
                                  <img src="/assets/correct-button.png" alt="Correct Button" className="w-full h-auto" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-base drop-shadow-lg">
                                      ✅ Doğru Bildi
                                    </span>
                                  </div>
                                </button>
                                
                                <button
                                  onClick={() => handleAnswerClick("wrong")}
                                  className="relative group transition-transform hover:scale-105 cursor-pointer"
                                >
                                  <img src="/assets/wrong-button.png" alt="Wrong Button" className="w-full h-auto" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-white font-bold text-base drop-shadow-lg">
                                      ❌ Yanlış Bildi
                                    </span>
                                  </div>
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 w-full max-w-xl mx-auto">
                          {gameState.currentQuestionData.options && Object.entries(gameState.currentQuestionData.options).map(([key, text]) => {
                            if (!text) return null
                            
                            let buttonImage = "/assets/genel-buton.png"
                            
                            if (gameState.answerResult && gameState.selectedAnswer) {
                              if (key === gameState.selectedAnswer) {
                                buttonImage = gameState.answerResult === "correct" ? "/assets/correct-button.png" : "/assets/wrong-button.png"
                              } else if (key === gameState.correctAnswer && gameState.answerResult === "wrong") {
                                buttonImage = "/assets/correct-button.png"
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
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white font-bold text-base drop-shadow-lg">
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
                    src="/assets/devam-et.png" 
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

            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-8 px-8 pb-12 z-20">
              {/* Team A */}
              <div className="relative">
                <img src="/assets/genel-buton.png" alt="Team A Score" className="h-20 w-auto min-w-[240px]" />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
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
              <div className="relative">
                <img src="/assets/genel-buton.png" alt="Team B Score" className="h-20 w-auto min-w-[240px]" />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
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
          </div>
        </div>
      )

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
