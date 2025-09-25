"use client"

import { useEffect, useState } from "react"
import type { GameState, Team } from "@/types/game"

interface GameResultsProps {
  gameState: GameState
  onPlayAgain: () => void
}

export default function GameResults({ gameState, onPlayAgain }: GameResultsProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    setShowCelebration(true)
  }, [])

  // Determine winner
  const getWinner = (): Team | null => {
    const targetSteps =
      gameState.settings.questionCount === 10
        ? 25
        : gameState.settings.questionCount === 20
          ? 50
          : gameState.settings.questionCount === 30
            ? 75
            : 100

    // Check if any team reached target
    const targetWinner = gameState.teams.find((team) => team.ladderPosition >= targetSteps)
    if (targetWinner) return targetWinner

    // If no target reached, highest position wins
    const sortedTeams = [...gameState.teams].sort((a, b) => b.ladderPosition - a.ladderPosition)
    return sortedTeams[0].ladderPosition > 0 ? sortedTeams[0] : null
  }

  const winner = getWinner()
  const loser = gameState.teams.find((team) => team.id !== winner?.id)

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

      <div className="relative z-10 h-full flex">
        {/* Left Side - Winner Celebration */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Game Over Title */}
          <div className="relative mb-8">
            <img src="/assets/soru-sayac-banneri.png" alt="Game Over" className="h-20 w-auto" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-900 font-bold text-lg drop-shadow-sm">OYUN BİTTİ!</span>
            </div>
          </div>

          {/* Winner Panel */}
          <div className="relative mb-8">
            <img src="/assets/soru-arkasi.png" alt="Winner Panel" className="w-96 h-auto" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              {winner ? (
                <>
                  <h2 className="text-white font-bold text-2xl mb-6 drop-shadow-lg animate-bounce">
                    KAZANAN
                    <br />
                    TAKIM {winner.id}!
                  </h2>

                  {/* Winner Character on Podium */}
                  <div className="relative mb-4">
                    {/* Podium */}
                    <div className="flex items-end gap-2">
                      <div className="w-12 h-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <div className="w-16 h-12 bg-gradient-to-t from-yellow-500 to-yellow-300 rounded-t-lg flex items-center justify-center relative">
                        <span className="text-amber-900 font-bold text-sm">1</span>
                        {/* Winner Character */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                          <div className="relative">
                            <img
                              src={winner.character?.image || "/assets/hero-2.png"}
                              alt="Winner"
                              className="w-12 h-12 rounded-full border-2 border-yellow-400"
                            />
                            {/* Trophy */}
                            <div className="absolute -top-2 -right-2 text-yellow-400 text-lg">🏆</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-12 h-6 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                    </div>
                  </div>

                  {showCelebration && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Confetti Effect */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="absolute animate-ping"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"][
                                Math.floor(Math.random() * 5)
                              ],
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <h2 className="text-white font-bold text-2xl mb-6 drop-shadow-lg">BERABERE!</h2>
              )}
            </div>
          </div>

          {/* Play Again Button */}
          <button onClick={onPlayAgain} className="relative group transition-transform hover:scale-105">
            <img src="/assets/genel-buton.png" alt="Play Again" className="h-16 w-auto min-w-[200px]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg drop-shadow-lg">TEKRAR OYNA</span>
            </div>
          </button>
        </div>

        {/* Right Side - Final Score Table */}
        <div className="w-80 flex flex-col items-center justify-center p-8">
          <div className="relative">
            <img src="/score-scroll.png" alt="Final Scores" className="w-full h-auto" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <span className="text-amber-900 font-bold text-sm drop-shadow-sm">FİNAL SKOR</span>
              </div>

              <div className="space-y-4 w-full mt-8">
                {gameState.teams
                  .sort((a, b) => b.ladderPosition - a.ladderPosition)
                  .map((team, index) => (
                    <div
                      key={team.id}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        index === 0 ? "bg-yellow-400/20" : "bg-white/10"
                      }`}
                    >
                      {index === 0 && <span className="text-yellow-400 text-lg">👑</span>}
                      <img
                        src={team.character?.image || "/assets/hero-2.png"}
                        alt={`Team ${team.id}`}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="text-white font-semibold text-sm">
                          TAKIM {team.id}: {team.name} - BASAMAK {team.ladderPosition}
                        </div>
                        {index === 0 && winner && (
                          <div className="text-yellow-300 font-bold text-xs">
                            TAKIM {winner.id} - {team.ladderPosition} BASAMAK (HEDEF!)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Game Stats */}
              <div className="mt-6 text-center">
                <div className="text-white/70 text-xs space-y-1">
                  <div>Toplam Soru: {gameState.currentQuestion - 1}</div>
                  <div>Oyun Modu: {gameState.settings.gameMode === "timed" ? "Süreli" : "Süresiz"}</div>
                  <div>Sürpriz Sistemi: {gameState.settings.surpriseSystem ? "Açık" : "Kapalı"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
