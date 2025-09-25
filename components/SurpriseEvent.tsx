"use client"

import { useState, useEffect } from "react"
import type { GameState, SurpriseChoice } from "@/types/game"
import { selectSurpriseChoice } from "@/lib/game-utils"

interface SurpriseEventProps {
  gameState: GameState
  onSurpriseComplete: (selectedChoice: SurpriseChoice) => void
}

export default function SurpriseEvent({ gameState, onSurpriseComplete }: SurpriseEventProps) {
  const [selectedChoice, setSelectedChoice] = useState<SurpriseChoice | null>(null)
  const [availableChoices, setAvailableChoices] = useState<SurpriseChoice[]>([])

  useEffect(() => {
    if (!gameState.surpriseData) return
    
    // Generate 3 random choices for the player to pick from
    const choices: SurpriseChoice[] = []
    for (let i = 0; i < 3; i++) {
      choices.push(selectSurpriseChoice())
    }
    setAvailableChoices(choices)
  }, [gameState.surpriseData])

  if (!gameState.surpriseData) return null

  const handleChoiceSelect = (choice: SurpriseChoice) => {
    setSelectedChoice(choice)
    setTimeout(() => {
      onSurpriseComplete(choice)
    }, 2000) // Show selection for 2 seconds before proceeding
  }

  const getChoiceColor = (choice: SurpriseChoice) => {
    if (choice.effect.type === 'gain' && choice.effect.target === 'self') {
      return 'text-green-300'
    }
    if (choice.effect.type === 'lose' && choice.effect.target === 'opponent') {
      return 'text-red-300'
    }
    return 'text-yellow-300'
  }

  const getChoiceIcon = (choice: SurpriseChoice) => {
    if (choice.effect.type === 'gain') {
      return '⬆️'
    }
    if (choice.effect.type === 'lose') {
      return '⬇️'
    }
    return '⏭️'
  }

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

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-8">
        {/* Title */}
        <div className="relative mb-8">
          <img src="/assets/soru-sayac-banneri.png" alt="Surprise Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-900 font-bold text-lg drop-shadow-sm">🎲 SÜRPRİZ ZAMANI! 🎲</span>
          </div>
        </div>

        {/* Current Turn Indicator */}
        <div className="text-white text-center mb-6">
          <h3 className="text-xl font-bold drop-shadow-lg">
            {gameState.currentTurn === 'A' ? 'Takım A' : 'Takım B'} sürpriz seçimi yapıyor
          </h3>
          <p className="text-white/80 mt-2">Şanslı sayı: {gameState.surpriseData.luckyNumber}</p>
        </div>

        {/* Choice Panel */}
        <div className="relative w-full max-w-3xl">
          <img src="/assets/soru-arkasi.png" alt="Surprise Background" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            
            {selectedChoice ? (
              /* Selected Choice Display */
              <div className="text-center">
                <div className="text-white text-2xl font-bold mb-4">
                  <span className="text-4xl mr-2">{getChoiceIcon(selectedChoice)}</span>
                  Seçilen: {selectedChoice.choice}
                </div>
                <div className="text-white/80 mb-6">
                  Seçim uygulanıyor...
                </div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
              </div>
            ) : (
              /* Choice Selection */
              <div className="w-full max-w-lg">
                <h2 className="text-white text-xl font-bold text-center drop-shadow-lg mb-6">
                  Bir seçenek seçin:
                </h2>
                
                <div className="space-y-4">
                  {availableChoices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => handleChoiceSelect(choice)}
                      className="relative group transition-all hover:scale-105 w-full"
                    >
                      <img src="/assets/genel-buton.png" alt="Choice Button" className="w-full h-auto" />
                      <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="text-center">
                          <span className="text-2xl mr-2">{getChoiceIcon(choice)}</span>
                          <span className={`font-bold text-base drop-shadow-lg ${getChoiceColor(choice)}`}>
                            {choice.choice}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8 px-8">
          {/* Team A */}
          <div className="relative">
            <img src="/assets/genel-buton.png" alt="Team A" className="h-16 w-auto min-w-[200px]" />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <img
                src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
                alt="Team A Character"
                className="h-10 w-10"
              />
              <span className="text-white font-bold text-sm drop-shadow-lg">
                TAKIM A: {gameState.teams[0].ladderPosition} / {gameState.ladderTarget}
              </span>
            </div>
          </div>

          {/* Team B */}
          <div className="relative">
            <img src="/assets/genel-buton.png" alt="Team B" className="h-16 w-auto min-w-[200px]" />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <img
                src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
                alt="Team B Character"
                className="h-10 w-10"
              />
              <span className="text-white font-bold text-sm drop-shadow-lg">
                TAKIM B: {gameState.teams[1].ladderPosition} / {gameState.ladderTarget}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}