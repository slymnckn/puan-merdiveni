"use client"

import { useEffect, useState } from "react"
import type { GameState } from "@/types/game"

interface LadderProgressProps {
  gameState: GameState
  onContinue: () => void
  stepsGained: number
  correctTeam: "A" | "B"
}

export default function LadderProgress({ gameState, onContinue, stepsGained, correctTeam }: LadderProgressProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setShowAnimation(true)
  }, [])

  // Merdiven basamakları (alttan üste doğru sıralı)
  const stepNumbers = [20, 16, 10, 55, 9, 8, 6, 5, 3, 2, 1]
  const maxStep = 55

  const getPositionPercent = (currentStep: number) => {
    if (currentStep <= 0) return 2 // En alt başlangıç
    
    // Basamak indeksini bul
    const stepIndex = stepNumbers.indexOf(currentStep)
    if (stepIndex !== -1) {
      // Basamağın konumunu yüzde olarak hesapla (tam ekran yüksekliğine göre)
      return 5 + (stepIndex * 9.5) // Basamaklarla aynı hesaplama
    }
    
    // Eğer tam basamak değilse, en yakın basamaklar arasında interpolasyon yap
    let lowerStep = 1
    let upperStep = 20
    let lowerIndex = stepNumbers.length - 1
    let upperIndex = 0
    
    for (let i = 0; i < stepNumbers.length; i++) {
      if (stepNumbers[i] <= currentStep && stepNumbers[i] > lowerStep) {
        lowerStep = stepNumbers[i]
        lowerIndex = i
      }
      if (stepNumbers[i] >= currentStep && stepNumbers[i] < upperStep) {
        upperStep = stepNumbers[i]
        upperIndex = i
      }
    }
    
    const ratio = (currentStep - lowerStep) / (upperStep - lowerStep)
    const lowerPos = 5 + (lowerIndex * 9.5)
    const upperPos = 5 + (upperIndex * 9.5)
    
    return Math.min(lowerPos + (upperPos - lowerPos) * ratio, 90.5) // Maksimum %90.5
  }

  const getTargetSteps = (questionCount: number) => {
    switch (questionCount) {
      case 10:
        return 25
      case 20:
        return 50
      case 30:
        return 75
      case 40:
        return 100
      default:
        return 50
    }
  }

  const targetSteps = getTargetSteps(gameState.settings.questionCount)

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
        {/* Center - Ladder */}
        <div className="flex-1 flex items-stretch justify-center h-screen pl-80">
          <div className="relative h-full flex items-stretch justify-center max-w-md">
            <img
              src="/purple-heart-ladder.png"
              alt="Purple Heart Ladder"
              className="object-contain"
              style={{
                height: "100vh",
                width: "auto",
                maxWidth: "1920px",
              }}
            />

            <div className="absolute inset-0 w-full h-full">
              
              {/* Basamak 20 - En üst */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "98%", left: "50%", transform: "translateX(-50%)", width: "108px" }}>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>20</span>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>20</span>
              </div>

              {/* Basamak 16 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "93%", left: "50%", transform: "translateX(-50%)", width: "110px" }}>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>16</span>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>16</span>
              </div>

              {/* Basamak 10 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "87%", left: "50%", transform: "translateX(-50%)", width: "113px" }}>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>10</span>
                <span className="text-white font-bold text-sm drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>10</span>
              </div>

              {/* Basamak 55 - Yeni eklenen */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "81%", left: "50%", transform: "translateX(-50%)", width: "125px" }}>
                <span className="text-white font-bold text-base drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>55</span>
                <span className="text-white font-bold text-base drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>55</span>
              </div>

              {/* Basamak 9 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "73%", left: "50%", transform: "translateX(-50%)", width: "136px" }}>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>9</span>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>9</span>
              </div>

              {/* Basamak 8 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "65%", left: "50%", transform: "translateX(-50%)", width: "150px" }}>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>8</span>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>8</span>
              </div>

              {/* Basamak 6 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "56%", left: "50%", transform: "translateX(-50%)", width: "170px" }}>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>6</span>
                <span className="text-white font-bold text-lg drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>6</span>
              </div>

              {/* Basamak 5 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "45%", left: "50%", transform: "translateX(-50%)", width: "190px" }}>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>5</span>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>5</span>
              </div>

              {/* Basamak 3 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "34%", left: "50%", transform: "translateX(-50%)", width: "216px" }}>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>3</span>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>3</span>
              </div>

              {/* Basamak 2 */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "21%", left: "50%", transform: "translateX(-50%)", width: "240px" }}>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>2</span>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>2</span>
              </div>

              {/* Basamak 1 - En alt */}
              <div className="absolute flex justify-between items-center z-10" style={{ bottom: "6%", left: "49%", transform: "translateX(-50%)", width: "270px" }}>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>1</span>
                <span className="text-white font-bold text-xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>1</span>
              </div>

            </div>

            <div className="absolute inset-0 w-full h-full">
              {/* Team A Character - Left side */}
              {gameState.teams[0].ladderPosition > 0 && (
                <div
                  className="absolute w-16 h-16 transition-all duration-1000 ease-in-out z-20"
                  style={{
                    left: "50%",
                    bottom: `${getPositionPercent(gameState.teams[0].ladderPosition)}%`,
                    transform: "translateX(-170%) translateY(25%)", // Sol tarafa kaydır
                  }}
                >
                  <div className="relative">
                    <img
                      src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
                      alt="Team A"
                      className="w-full h-full object-cover rounded-full border-3 border-white shadow-xl"
                    />
                    {correctTeam === "A" && showAnimation && (
                      <div className="absolute inset-0 rounded-full border-3 border-yellow-300 animate-pulse shadow-lg shadow-yellow-300/50"></div>
                    )}
                  </div>
                </div>
              )}

              {/* Team B Character - Right side */}
              {gameState.teams[1].ladderPosition > 0 && (
                <div
                  className="absolute w-16 h-16 transition-all duration-1000 ease-in-out z-20"
                  style={{
                    left: "50%",
                    bottom: `${getPositionPercent(gameState.teams[1].ladderPosition)}%`,
                    transform: "translateX(70%) translateY(25%)", // Sağ tarafa kaydır
                  }}
                >
                  <div className="relative">
                    <img
                      src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
                      alt="Team B"
                      className="w-full h-full object-cover rounded-full border-3 border-white shadow-xl"
                    />
                    {correctTeam === "B" && showAnimation && (
                      <div className="absolute inset-0 rounded-full border-3 border-yellow-300 animate-pulse shadow-lg shadow-yellow-300/50"></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Score Panel and Messages */}
        <div className="w-80 flex flex-col items-center justify-center p-4 flex-shrink-0">
          <div className="relative mb-8">
            <div className="relative">
              <img src="/score-scroll.png" alt="Score Scroll" className="w-80 h-48 object-contain" />

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                  <h3 className="text-amber-900 font-bold text-lg drop-shadow-lg">SCORE</h3>
                </div>

                <div className="mt-10 space-y-2 px-6 w-full">
                  <div className="flex items-center gap-2">
                    <img
                      src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
                      alt="Team A"
                      className="w-6 h-6 rounded-full border-2 border-amber-600"
                    />
                    <span className="text-amber-900 font-bold text-xs">
                      TAKIM A: {gameState.teams[0].name.toUpperCase()} - BASAMAK {gameState.teams[0].ladderPosition}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <img
                      src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
                      alt="Team B"
                      className="w-6 h-6 rounded-full border-2 border-amber-600"
                    />
                    <span className="text-amber-900 font-bold text-xs">
                      TAKIM B - {gameState.teams[1].name.toUpperCase()} {gameState.teams[1].ladderPosition} / HEDEF{" "}
                      {targetSteps}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showAnimation && (
            <div className="relative mb-6 animate-bounce">
              <div className="relative">
                <img src="/golden-banner.png" alt="Golden Banner" className="w-96 h-20 object-contain" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-900 font-bold text-lg drop-shadow-sm text-center px-4">
                    TEBRİKLER! +{stepsGained} BASAMAK KAZAVINIZ!
                  </span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-white font-bold text-base drop-shadow-lg bg-black/20 px-4 py-1 rounded-lg backdrop-blur-sm">
                  TAKIM {correctTeam} DOĞRU CEVAP VERDİ!
                </span>
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button onClick={onContinue} className="relative group transition-transform hover:scale-105 mt-8">
            <div className="bg-gradient-to-b from-purple-500 to-purple-700 px-8 py-4 rounded-full border-4 border-purple-400 shadow-2xl">
              <span className="text-white font-bold text-xl drop-shadow-lg">SONRAKİ SORU</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}