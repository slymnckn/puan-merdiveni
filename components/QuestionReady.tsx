"use client"

import type { GameState } from "@/types/game"
import AudioControls from "@/components/AudioControls"
import PublisherLogoBadge from "@/components/PublisherLogoBadge"
import { getAssetPath } from "@/lib/asset-path"

interface QuestionReadyProps {
  gameState: GameState
  onShowQuestion: () => void
  currentTurn: "A" | "B"
  publisherLogo?: string | null
  onOpenSettings?: () => void
}

export default function QuestionReady({ gameState, onShowQuestion, currentTurn, publisherLogo, onOpenSettings }: QuestionReadyProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${getAssetPath("/assets/background.png")})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="relative z-10 h-full">
        {/* Top Section - Question Counter and Timer */}
  <div className="absolute top-0 left-0 right-0 flex items-start justify-between w-full pl-8 pr-16 md:pr-20 pt-6 z-20 pointer-events-none">
          {/* Question Counter Banner */}
          <div className="relative flex flex-col items-start gap-3">
            <div className="relative">
              <img src={getAssetPath("/assets/soru-sayac-banneri.png")} alt="Question Banner" className="h-16 w-auto" />
              <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '0px' }}>
                <span className="text-amber-900 font-bold text-lg drop-shadow-sm">
                  Soru {gameState.currentQuestion}/{gameState.settings.questionCount}
                </span>
              </div>
            </div>
            {publisherLogo && <PublisherLogoBadge logoUrl={publisherLogo} size="sm" />}
          </div>

          {/* Timer */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="relative">
              <img src={getAssetPath("/assets/sure.png")} alt="Timer" className="h-14 w-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-amber-900 font-bold text-xl drop-shadow-sm">---</span>
              </div>
            </div>
            <AudioControls orientation="vertical" className="mt-1" />
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center justify-center rounded-full bg-transparent p-2 text-white transition-transform hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                aria-label="Ayarlar"
                title="Ayarlar"
              >
                <img src={getAssetPath("/assets/settings.png")} alt="Ayarlar" className="w-[52px] h-[52px] drop-shadow-md" />
              </button>
            )}
          </div>
        </div>

        {/* Team Banners - Sol tarafta dikey */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
          {/* Team A */}
          <div className={`relative ${currentTurn === "A" ? "animate-gentle-bounce" : ""}`}>
            <img 
              src={getAssetPath(currentTurn === "A" ? "/assets/correct-button.png" : "/assets/genel-buton.png")} 
              alt="Team A Score" 
              className={`h-20 w-auto min-w-[200px] transition-all ${currentTurn === "A" ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" : ""}`}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <img
                src={getAssetPath(gameState.teams[0].character?.image || "/assets/hero-2.png")}
                alt="Team A Character"
                className="h-10 w-10"
              />
              <span className="text-white font-bold text-sm drop-shadow-lg">TAKIM A</span>
              <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[0].ladderPosition}</span>
            </div>
          </div>

          {/* Team B */}
          <div className={`relative ${currentTurn === "B" ? "animate-gentle-bounce" : ""}`}>
            <img 
              src={getAssetPath(currentTurn === "B" ? "/assets/correct-button.png" : "/assets/genel-buton.png")} 
              alt="Team B Score" 
              className={`h-20 w-auto min-w-[200px] transition-all ${currentTurn === "B" ? "drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]" : ""}`}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <img
                src={getAssetPath(gameState.teams[1].character?.image || "/assets/hero-1.png")}
                alt="Team B Character"
                className="h-10 w-10"
              />
              <span className="text-white font-bold text-sm drop-shadow-lg">TAKIM B</span>
              <span className="text-white font-bold text-lg drop-shadow-lg">{gameState.teams[1].ladderPosition}</span>
            </div>
          </div>
        </div>

        {/* Center - Show Question Button */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-[52%] -translate-y-1/2 w-full max-w-7xl px-4" style={{ paddingLeft: '260px', paddingRight: '160px' }}>
          <div className="relative w-full">
            <img src={getAssetPath("/assets/soru-arkasi.png")} alt="Question Background" className="w-full h-auto" style={{ transform: 'scale(1.15)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
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
      </div>
    </div>
  )
}
