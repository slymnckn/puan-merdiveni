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
    
    const luckyNumber = gameState.surpriseData.luckyNumber
    
    // Her zaman sadece 2 seçenek: "+X kendi takımına" ve "-X rakip takıma"
    const choices: SurpriseChoice[] = [
      {
        choice: `+${luckyNumber} kendi takımına`,
        probability: 1,
        effect: { type: 'gain', target: 'self', amount: luckyNumber }
      },
      {
        choice: `-${luckyNumber} rakip takıma`,
        probability: 1,
        effect: { type: 'lose', target: 'opponent', amount: luckyNumber }
      }
    ]
    
    setAvailableChoices(choices)
  }, [gameState.surpriseData])

  if (!gameState.surpriseData) return null

  const handleChoiceSelect = (choice: SurpriseChoice) => {
    setSelectedChoice(choice)
    setTimeout(() => {
      onSurpriseComplete(choice)
    }, 2000)
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

      <div className="relative z-10 h-full flex flex-col items-center justify-between py-4 px-4">
        
        {/* Top Section - Fixed */}
        <div className="w-full flex flex-col items-center gap-4 flex-shrink-0">
          <div className="relative">
            <img 
              src="/golden-banner.png" 
              alt="Surprise Title" 
              className="h-16 w-auto object-contain drop-shadow-xl max-w-[350px]" 
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-8px' }}>
              <span className="text-purple-900 font-bold text-xl drop-shadow-md">
                🎉 SÜRPRİZ ZAMANI! 🎉
              </span>
            </div>
          </div>

          <div className="bg-purple-900/90 backdrop-blur-sm rounded-lg px-8 py-4 border-2 border-yellow-400 shadow-lg">
            <h3 className="text-xl font-bold text-white text-center">
              {gameState.currentTurn === 'A' ? 'Takım A' : 'Takım B'} seçim yapıyor
            </h3>
            <p className="text-yellow-300 font-semibold text-lg text-center">
              Şanslı sayı: {gameState.surpriseData.luckyNumber}
            </p>
          </div>
        </div>

        {/* Middle Section - Choices - Flexible but no scroll */}
        <div className="w-full max-w-md flex-1 flex items-center justify-center px-2 py-2">
          {selectedChoice ? (
            <div className="text-center bg-purple-900/80 backdrop-blur-sm rounded-xl px-10 py-8 border-2 border-yellow-400 shadow-xl max-w-lg">
              <div className="text-white text-2xl font-bold mb-6">
                <span className="text-5xl mr-2">{getChoiceIcon(selectedChoice)}</span>
                <br />
                <span className="text-xl mt-2 inline-block">{selectedChoice.choice}</span>
              </div>
              <div className="text-yellow-300 font-semibold text-xl mb-6">
                Seçim uygulanıyor...
              </div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto"></div>
            </div>
          ) : (
            <div className="w-full">
              <h2 className="text-white text-2xl font-bold text-center mb-6 bg-purple-900/70 backdrop-blur-sm py-4 px-8 rounded-lg border-2 border-yellow-400 mx-auto max-w-fit">
                Bir seçenek seçin:
              </h2>
              
              <div className="space-y-6 max-w-2xl mx-auto">
                {availableChoices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleChoiceSelect(choice)}
                    className="relative group transition-all hover:scale-[1.02] active:scale-95 w-full"
                  >
                    <img 
                      src="/assets/genel-buton.png" 
                      alt="Choice Button" 
                      className="w-full h-auto object-contain drop-shadow-lg" 
                      style={{ height: '100px' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center px-8">
                      <span className="text-3xl mr-4">{getChoiceIcon(choice)}</span>
                      <span className={`font-bold text-2xl drop-shadow-md ${getChoiceColor(choice)} text-center leading-tight`}>
                        {choice.choice}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section - Team Status - Fixed */}
        <div className="w-full flex justify-center items-center gap-6 flex-shrink-0 mt-4">
          <div className="relative">
            <img 
              src="/assets/genel-buton.png" 
              alt="Team A" 
              className="h-16 w-auto object-contain drop-shadow-lg" 
              style={{ minWidth: '200px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
              <img
                src={gameState.teams[0].character?.image || "/assets/hero-2.png"}
                alt="Team A"
                className="h-10 w-10 rounded-full border-2 border-blue-400"
              />
              <span className="text-white font-bold text-lg drop-shadow-md whitespace-nowrap">
                A: {gameState.teams[0].ladderPosition}/{gameState.ladderTarget}
              </span>
            </div>
          </div>

          <div className="relative">
            <img 
              src="/assets/genel-buton.png" 
              alt="Team B" 
              className="h-16 w-auto object-contain drop-shadow-lg" 
              style={{ minWidth: '200px' }}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
              <img
                src={gameState.teams[1].character?.image || "/assets/hero-1.png"}
                alt="Team B"
                className="h-10 w-10 rounded-full border-2 border-pink-400"
              />
              <span className="text-white font-bold text-lg drop-shadow-md whitespace-nowrap">
                B: {gameState.teams[1].ladderPosition}/{gameState.ladderTarget}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
