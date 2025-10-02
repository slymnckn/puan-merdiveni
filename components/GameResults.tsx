"use client"

import { useEffect, useState } from "react"
import type { GameState, Team } from "@/types/game"
import { determineWinner } from "@/lib/game-utils"

interface GameResultsProps {
  gameState: GameState
  onPlayAgain: () => void
}

export default function GameResults({ gameState, onPlayAgain }: GameResultsProps) {
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    setShowCelebration(true)
  }, [])

  // Determine winner using utility function
  const getWinner = (): Team | null => {
    const winnerResult = determineWinner(gameState.teams, gameState.ladderTarget)
    
    if (winnerResult === 'tie') {
      // If tie, return team with higher position, or null if both are 0
      const sortedTeams = [...gameState.teams].sort((a, b) => b.ladderPosition - a.ladderPosition)
      return sortedTeams[0].ladderPosition > 0 ? sortedTeams[0] : null
    }
    
    return gameState.teams.find(team => team.id === winnerResult) || null
  }

  const winner = getWinner()
  const loser = gameState.teams.find((team) => team.id !== winner?.id)

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url(/assets/background.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Confetti Effect - Full Screen */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ["#fbbf24", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"][
                    Math.floor(Math.random() * 6)
                  ],
                }}
              ></div>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-between py-5 px-6">
        
        {/* Top - Game Over Banner - Büyütülmüş */}
        <div className="relative flex-shrink-0">
          <img 
            src="/golden-banner.png" 
            alt="Game Over" 
            className="h-20 w-auto object-contain drop-shadow-2xl" 
            style={{ maxWidth: "500px" }}
          />
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-8px' }}>
            <span className="text-white font-bold text-xl drop-shadow-md">🎮 OYUN BİTTİ! 🎮</span>
          </div>
        </div>

        {/* Middle - Winner Panel (Left) and Final Score (Right) */}
        <div className="flex-1 flex items-center justify-center w-full max-w-6xl gap-8 py-4">
          
          {/* Left - Winner Panel */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-xl">
              <img 
                src="/assets/soru-arkasi.png" 
                alt="Winner Panel" 
                className="w-full h-auto object-contain drop-shadow-2xl" 
                style={{ maxHeight: "480px" }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center py-6 px-6">
                {winner ? (
                  <>
                    {/* Winner Podium */}
                    <div className="relative" style={{ marginTop: '50px' }}>
                      <div className="flex items-end gap-3 justify-center">
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center">
                          <div className="relative mb-2">
                            {loser && (
                              <img
                                src={loser.character?.image || "/assets/hero-1.png"}
                                alt="2nd Place"
                                className="w-14 h-14 rounded-full border-2 border-gray-400 shadow-lg"
                              />
                            )}
                          </div>
                          <div className="w-16 h-14 bg-gradient-to-t from-gray-500 to-gray-300 rounded-t-lg flex items-center justify-center shadow-lg border-2 border-gray-400">
                            <span className="text-white font-bold text-lg drop-shadow-md">2</span>
                          </div>
                        </div>

                        {/* 1st Place - Winner */}
                        <div className="flex flex-col items-center -mt-6">
                          <div className="relative mb-2">
                            <img
                              src={winner.character?.image || "/assets/hero-2.png"}
                              alt="Winner"
                              className="w-20 h-20 rounded-full border-4 border-yellow-400 shadow-2xl"
                              style={{ animation: "pulse 2s ease-in-out infinite" }}
                            />
                            {/* Crown */}
                            <div 
                              className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-4xl"
                              style={{ animation: "bounce 1s ease-in-out infinite", marginLeft: '24px' }}
                            >
                              👑
                            </div>
                            {/* Trophy */}
                            <div className="absolute -bottom-1 -right-1 text-3xl drop-shadow-lg">🏆</div>
                          </div>
                          <div className="w-20 h-20 bg-gradient-to-t from-yellow-600 to-yellow-300 rounded-t-lg flex items-center justify-center shadow-2xl border-3 border-yellow-500">
                            <span className="text-amber-900 font-bold text-2xl drop-shadow-md">1</span>
                          </div>
                        </div>

                        {/* 3rd Place - Empty */}
                        <div className="flex flex-col items-center">
                          <div className="w-14 h-14 mb-2"></div>
                          <div className="w-16 h-10 bg-gradient-to-t from-amber-700 to-amber-500 rounded-t-lg flex items-center justify-center shadow-lg border-2 border-amber-600">
                            <span className="text-white font-bold text-base drop-shadow-md">3</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <h2 className="text-white font-bold text-3xl mb-6 drop-shadow-lg">🤝 BERABERE! 🤝</h2>
                )}
              </div>
            </div>
          </div>

          {/* Right - Final Score Panel */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              <img 
                src="/score-scroll.png" 
                alt="Final Scores" 
                className="w-full h-auto object-contain drop-shadow-2xl" 
                style={{ maxHeight: "580px" }}
              />
              {/* FİNAL SKOR Title - Above the scroll */}
              <div className="absolute top-2 left-0 right-0 flex justify-center">
                <span className="text-amber-900 font-bold text-2xl drop-shadow-sm">FİNAL SKOR</span>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center px-12" style={{ paddingTop: '85px', paddingBottom: '70px' }}>
                <div className="space-y-3 w-full">
                  {gameState.teams
                    .sort((a, b) => b.ladderPosition - a.ladderPosition)
                    .map((team, index) => (
                      <div
                        key={team.id}
                        className="flex flex-col gap-1 p-2"
                      >
                        <div className="flex items-center gap-2">
                          {index === 0 && <span className="text-yellow-500 text-lg w-6">👑</span>}
                          {index !== 0 && <span className="w-6"></span>}
                          <img
                            src={team.character?.image || "/assets/hero-2.png"}
                            alt={`Team ${team.id}`}
                            className="w-10 h-10 rounded-full border-2 border-white/50"
                          />
                          <div className="text-amber-900 font-bold text-base">
                            TAKIM {team.id}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-6"></span>
                          <span className="w-10"></span>
                          <div className="text-amber-800 font-semibold text-sm">
                            BASAMAK {team.ladderPosition}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom - Play Again Button (Center) */}
        <div className="flex-shrink-0 flex justify-center">
          <button onClick={onPlayAgain} className="relative group transition-transform hover:scale-105 active:scale-95">
            <img 
              src="/assets/genel-buton.png" 
              alt="Play Again" 
              className="h-14 w-auto object-contain drop-shadow-xl" 
              style={{ minWidth: "220px" }} 
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg drop-shadow-lg">TEKRAR OYNA</span>
            </div>
          </button>
        </div>

      </div>

      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(0) rotate(0deg);
          }
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          50% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
