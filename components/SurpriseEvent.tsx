"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/types/game"

interface SurpriseEventProps {
  gameState: GameState
  onSurpriseComplete: (selectedOption: { team: "A" | "B"; action: "gain" | "lose"; amount: number }) => void
}

export default function SurpriseEvent({ gameState, onSurpriseComplete }: SurpriseEventProps) {
  const [luckyNumber, setLuckyNumber] = useState<number>(0)
  const [surpriseOptions, setSurpriseOptions] = useState<
    Array<{ team: "A" | "B"; action: "gain" | "lose"; amount: number }>
  >([])
  const [selectedOption, setSelectedOption] = useState<{
    team: "A" | "B"
    action: "gain" | "lose"
    amount: number
  } | null>(null)

  useEffect(() => {
    // Generate random lucky number (1-5)
    const randomNumber = Math.floor(Math.random() * 5) + 1
    setLuckyNumber(randomNumber)

    // Generate surprise options based on lucky number
    const options = [
      { team: "A" as const, action: "gain" as const, amount: randomNumber },
      { team: "B" as const, action: "lose" as const, amount: randomNumber },
    ]
    setSurpriseOptions(options)
  }, [])

  const handleOptionSelect = (option: { team: "A" | "B"; action: "gain" | "lose"; amount: number }) => {
    setSelectedOption(option)
    setTimeout(() => {
      onSurpriseComplete(option)
    }, 1500)
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
          <img src="/assets/soru-sayac-banneri.png" alt="Surprise Event Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-900 font-bold text-lg drop-shadow-sm">SÜRPRİZ OLAY!</span>
          </div>
        </div>

        {/* Main Panel */}
        <div className="relative mb-8">
          <img src="/assets/soru-arkasi.png" alt="Surprise Panel" className="w-full max-w-2xl h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6">
            {/* Lucky Number */}
            <div className="text-center mb-4">
              <span className="text-white font-bold text-xl drop-shadow-lg">Şanslı Sayın: {luckyNumber}!</span>
            </div>

            {/* Treasure Chest */}
            <div className="mb-6">
              <div className="relative">
                <img
                  src="/golden-treasure-chest-with-gems-and-coins.jpg"
                  alt="Treasure Chest"
                  className="w-24 h-24 animate-pulse drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-6">
              {surpriseOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={selectedOption !== null}
                  className={`relative transition-all hover:scale-105 ${
                    selectedOption === option ? "scale-110" : ""
                  } ${selectedOption && selectedOption !== option ? "opacity-50" : ""}`}
                >
                  <img src="/assets/genel-buton.png" alt="Option" className="h-20 w-48" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-white font-bold text-sm drop-shadow-lg text-center">
                      TAKIM {option.team}:
                    </span>
                    <span
                      className={`font-bold text-sm drop-shadow-lg ${
                        option.action === "gain" ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {option.action === "gain" ? "+" : "-"}
                      {option.amount} BASAMAK
                    </span>
                    <span
                      className={`font-bold text-xs drop-shadow-lg ${
                        option.action === "gain" ? "text-green-300" : "text-red-300"
                      }`}
                    >
                      {option.action === "gain" ? "KAZAN" : "KAYBETTİR"}
                    </span>
                  </div>
                  {selectedOption === option && (
                    <div className="absolute inset-0 bg-yellow-400/30 rounded-2xl animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {selectedOption && (
              <div className="text-center mt-4 animate-bounce">
                <span className="text-yellow-300 font-bold text-lg drop-shadow-lg">
                  {selectedOption.action === "gain" ? "TEBRİKLER!" : "ÜZGÜNÜZ!"} TAKIM {selectedOption.team}{" "}
                  {selectedOption.action === "gain" ? "KAZANDI" : "KAYBETTİ"}!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selection Button */}
        {!selectedOption && (
          <div className="text-center">
            <span className="text-white font-bold text-lg drop-shadow-lg">BİR SEÇENEĞİ SEÇİNİZ</span>
          </div>
        )}
      </div>
    </div>
  )
}
