"use client"

import { useState, useEffect } from "react"
import type { GameState, GameScreen, Team, GameSettingsType } from "@/types/game"
import MainMenu from "@/components/MainMenu"
import TeamSelection from "@/components/TeamSelection"
import GameSettingsComponent from "@/components/GameSettings"
import QuestionReady from "@/components/QuestionReady"
import LadderProgress from "@/components/LadderProgress"
import SurpriseEvent from "@/components/SurpriseEvent"
import GameResults from "@/components/GameResults"
import QuestionDisplay from "@/components/QuestionDisplay"
import { questions } from "@/data/questions"

export default function GameApp() {
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
    timeLeft: 30,
    selectedAnswer: null,
    answerResult: null,
    correctAnswer: "B", // Doğru cevap: Ankara
    currentQuestionData: null,
    surpriseData: null,
  })

  const [lastCorrectTeam, setLastCorrectTeam] = useState<"A" | "B">("A")
  const [stepsGained, setStepsGained] = useState(3)

  const navigateToScreen = (screen: GameScreen) => {
    setGameState((prev) => ({ ...prev, currentScreen: screen }))
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
    // İlk soruyu yükle
    const firstQuestion = questions[0]
    setGameState((prev) => ({
      ...prev,
      currentScreen: "question-ready",
      currentQuestionData: firstQuestion,
      correctAnswer: firstQuestion.correctAnswer,
    }))
  }

  const loadNextQuestion = () => {
    const questionIndex = gameState.currentQuestion - 1
    const nextQuestion = questions[questionIndex] || questions[0] // Fallback
    
    setGameState((prev) => ({
      ...prev,
      currentQuestionData: nextQuestion,
      correctAnswer: nextQuestion.correctAnswer,
    }))
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
    const isCorrect = answer === gameState.correctAnswer
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

    setTimeout(() => {
      navigateToScreen("ladder-progress")
    }, 2000) // 2 saniye bekle ki butonlar görünsün
  }

  const handleContinueFromLadder = () => {
    // Check if game should end
    const targetSteps =
      gameState.settings.questionCount === 10
        ? 25
        : gameState.settings.questionCount === 20
          ? 50
          : gameState.settings.questionCount === 30
            ? 75
            : 100

    const winner = gameState.teams.find((team) => team.ladderPosition >= targetSteps)

    if (winner || gameState.currentQuestion >= gameState.settings.questionCount) {
      navigateToScreen("game-results")
    } else {
      // Check for surprise event (every 3 questions)
      if (gameState.settings.surpriseSystem && gameState.currentQuestion % 3 === 0) {
        navigateToScreen("surprise-event")
      } else {
        const nextQuestionIndex = gameState.currentQuestion
        const nextQuestion = questions[nextQuestionIndex] || questions[0]
        
        setGameState((prev) => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1,
          currentScreen: "question-ready",
          currentQuestionData: nextQuestion,
          correctAnswer: nextQuestion.correctAnswer,
        }))
      }
    }
  }

  const handleSurpriseComplete = (selectedOption: { team: "A" | "B"; action: "gain" | "lose"; amount: number }) => {
    // Apply surprise effect
    setGameState((prev) => ({
      ...prev,
      teams: prev.teams.map((team) =>
        team.id === selectedOption.team
          ? {
              ...team,
              ladderPosition: Math.max(
                0,
                selectedOption.action === "gain"
                  ? team.ladderPosition + selectedOption.amount
                  : team.ladderPosition - selectedOption.amount,
              ),
            }
          : team,
      ),
      currentQuestion: prev.currentQuestion + 1,
      currentScreen: "question-ready",
    }))
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
      timeLeft: 30,
      selectedAnswer: null,
      answerResult: null,
      correctAnswer: "B",
      currentQuestionData: null,
      surpriseData: null,
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
                <div className="absolute inset-0 flex items-center justify-center">
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

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-8">
              <div className="relative w-full">
                <img src="/assets/soru-arkasi.png" alt="Question Background" className="w-full h-auto" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  {/* Content Area - Different layout for visual questions */}
                  {gameState.currentQuestionData && gameState.currentQuestionData.type !== "text" ? (
                    <div className="w-full max-w-4xl ml-8">
                      {/* Question Title - aligned to left */}
                      <h2 className="text-white text-2xl font-bold text-left drop-shadow-lg mb-4 ml-4">
                        Soru: {gameState.currentQuestionData.text}
                      </h2>
                      
                      <div className="flex items-center justify-start gap-6">
                        {/* Image on the left */}
                        {gameState.currentQuestionData.image && (
                          <div className="flex-shrink-0 ml-4">
                            <div className="bg-white p-2 rounded-lg shadow-lg w-48">
                              <img
                                src={gameState.currentQuestionData.image}
                                alt={gameState.currentQuestionData.imageAlt || "Soru görseli"}
                                className="w-full h-auto max-h-32 object-contain rounded"
                              />
                            </div>
                          </div>
                        )}
                      
                        {/* Answer Options on the right - smaller */}
                        <div className="grid grid-cols-2 gap-2 flex-1 max-w-md mr-4">
                          {gameState.currentQuestionData.answers.map((answer) => {
                            // Buton durumunu belirle
                            let buttonImage = "/assets/genel-buton.png"
                            
                            if (gameState.answerResult && gameState.selectedAnswer) {
                              if (answer.id === gameState.selectedAnswer) {
                                // Seçilen cevap
                                buttonImage = gameState.answerResult === "correct" ? "/assets/correct-button.png" : "/assets/wrong-button.png"
                              } else if (answer.id === gameState.correctAnswer && gameState.answerResult === "wrong") {
                                // Doğru cevap (yanlış seçim yapılmışsa göster)
                                buttonImage = "/assets/correct-button.png"
                              }
                            }

                            return (
                              <button
                                key={answer.id}
                                onClick={() => !gameState.answerResult && handleAnswerClick(answer.id)}
                                disabled={!!gameState.answerResult}
                                className={`relative group transition-transform hover:scale-105 ${
                                  gameState.selectedAnswer === answer.id ? "scale-105" : ""
                                } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-white font-bold text-sm drop-shadow-lg">
                                    {answer.id}) {answer.text}
                                  </span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Text questions - normal layout */
                    <div>
                      {/* Question Title for text questions */}
                      <h2 className="text-white text-2xl font-bold text-center drop-shadow-lg mb-4">
                        Soru: {gameState.currentQuestionData?.text}
                      </h2>
                      
                      <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                        {gameState.currentQuestionData?.answers.map((answer) => {
                          // Buton durumunu belirle
                          let buttonImage = "/assets/genel-buton.png"
                          
                          if (gameState.answerResult && gameState.selectedAnswer) {
                            if (answer.id === gameState.selectedAnswer) {
                              // Seçilen cevap
                              buttonImage = gameState.answerResult === "correct" ? "/assets/correct-button.png" : "/assets/wrong-button.png"
                            } else if (answer.id === gameState.correctAnswer && gameState.answerResult === "wrong") {
                              // Doğru cevap (yanlış seçim yapılmışsa göster)
                              buttonImage = "/assets/correct-button.png"
                            }
                          }

                          return (
                            <button
                              key={answer.id}
                              onClick={() => !gameState.answerResult && handleAnswerClick(answer.id)}
                              disabled={!!gameState.answerResult}
                              className={`relative group transition-transform hover:scale-105 ${
                                gameState.selectedAnswer === answer.id ? "scale-105" : ""
                              } ${gameState.answerResult ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              <img src={buttonImage} alt="Answer Button" className="w-full h-auto" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-white font-bold text-base drop-shadow-lg">
                                  {answer.id}) {answer.text}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-8 px-8 pb-6 z-20">
              {/* Team A */}
              <div className="relative">
                <img src="/assets/genel-buton.png" alt="Team A Score" className="h-16 w-auto min-w-[200px]" />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
                    alt="Team A Character"
                    className="h-10 w-10"
                  />
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    TAKIM A: {gameState.teams[0].name}
                  </span>
                  <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[0].score}</span>
                </div>
              </div>

              {/* Team B */}
              <div className="relative">
                <img src="/assets/genel-buton.png" alt="Team B Score" className="h-16 w-auto min-w-[200px]" />
                <div className="absolute inset-0 flex items-center justify-center gap-2">
                  <img
                    src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
                    alt="Team B Character"
                    className="h-10 w-10"
                  />
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    TAKIM B: {gameState.teams[1].name}
                  </span>
                  <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[1].score}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )

    default:
      return <MainMenu onStartGame={handleStartGame} />
  }
}
