"use client"

import type { GameState } from "@/types/game"

interface QuestionReadyProps {
  gameState: GameState
  onShowQuestion: () => void
}

export default function QuestionReady({ gameState, onShowQuestion }: QuestionReadyProps) {
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
              <span className="text-amber-900 font-bold text-xl drop-shadow-sm">---</span>
            </div>
          </div>
        </div>

        {/* Center - Show Question Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-8">
          <div className="relative w-full">
            <img src="/assets/soru-arkasi.png" alt="Question Background" className="w-full h-auto" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Show Question Button */}
              <button onClick={onShowQuestion} className="relative group transition-all hover:scale-110 animate-pulse">
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl border-4 border-yellow-300">
                  <span className="text-white font-bold text-xl drop-shadow-lg text-center">
                    SORUYU
                    <br />
                    GÖSTER
                  </span>
                </div>
                <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Team Scores */}
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
              <span className="text-white font-bold text-sm drop-shadow-lg">TAKIM A: {gameState.teams[0].name}</span>
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
              <span className="text-white font-bold text-sm drop-shadow-lg">TAKIM B: {gameState.teams[1].name}</span>
              <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[1].score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
