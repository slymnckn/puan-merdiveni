"use client"

import { useState } from "react"
import type { GameSettingsType } from "@/types/game"

interface GameSettingsProps {
  settings: GameSettingsType
  onSettingsUpdate: (settings: GameSettingsType) => void
  onStartGame: () => void
}

export default function GameSettings({ settings, onSettingsUpdate, onStartGame }: GameSettingsProps) {
  const [localSettings, setLocalSettings] = useState<GameSettingsType>(settings)

  const questionCounts = [10, 20, 30, 40] as const

  const updateSetting = <K extends keyof GameSettingsType>(key: K, value: GameSettingsType[K]) => {
    const updatedSettings = { ...localSettings, [key]: value }
    setLocalSettings(updatedSettings)
    onSettingsUpdate(updatedSettings)
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
        <div className="relative mb-6">
          <img src="/assets/soru-sayac-banneri.png" alt="Game Settings Title" className="h-16 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-900 font-bold text-base drop-shadow-sm">OYUN AYARLARI</span>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="relative mb-6">
          <img src="/assets/soru-arkasi.png" alt="Settings Panel" className="w-full max-w-3xl h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-8">
            {/* Question Count Selection */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">SORU SAYISI</h3>
              <div className="flex gap-4 justify-center">
                {questionCounts.map((count) => (
                  <button
                    key={count}
                    onClick={() => updateSetting("questionCount", count)}
                    className={`relative transition-all hover:scale-110 ${
                      localSettings.questionCount === count ? "scale-110" : ""
                    }`}
                  >
                    <img 
                      src={localSettings.questionCount === count ? "/assets/open-açık-butonu.png" : "/assets/soru-sayısı-butonu.png"} 
                      alt={`${count} Questions`} 
                      className="w-14 h-14 object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-bold text-base drop-shadow-lg">{count}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Game Mode Selection */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">OYUN MODU</h3>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => updateSetting("gameMode", "timed")}
                  className={`relative transition-transform hover:scale-105 ${
                    localSettings.gameMode === "timed" ? "scale-105" : ""
                  }`}
                >
                  <img 
                    src={localSettings.gameMode === "timed" ? "/assets/selected-süre.png" : "/assets/süreli-süresiz-butonu.png"} 
                    alt="Timed Mode" 
                    className="h-10 w-auto min-w-[100px]" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-900 font-bold text-xs drop-shadow-lg">SÜRELİ</span>
                  </div>
                </button>

                <button
                  onClick={() => updateSetting("gameMode", "untimed")}
                  className={`relative transition-transform hover:scale-105 ${
                    localSettings.gameMode === "untimed" ? "scale-105" : ""
                  }`}
                >
                  <img 
                    src={localSettings.gameMode === "untimed" ? "/assets/selected-süre.png" : "/assets/süreli-süresiz-butonu.png"} 
                    alt="Untimed Mode" 
                    className="h-10 w-auto min-w-[100px]" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-amber-900 font-bold text-xs drop-shadow-lg">SÜRESİZ</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Surprise System Toggle */}
            <div className="flex flex-col items-center space-y-4">
              <h3 className="text-white font-bold text-lg drop-shadow-lg">SÜRPRİZ SİSTEMİ</h3>
              <div className="flex gap-6 justify-center">
                <button
                  onClick={() => updateSetting("surpriseSystem", true)}
                  className={`relative transition-all hover:scale-110 ${
                    localSettings.surpriseSystem ? "scale-110" : ""
                  }`}
                >
                  <img 
                    src={localSettings.surpriseSystem ? "/assets/open-açık-butonu.png" : "/assets/soru-sayısı-butonu.png"} 
                    alt="Surprise System On" 
                    className="w-14 h-14 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs drop-shadow-lg">AÇIK</span>
                  </div>
                </button>

                <button
                  onClick={() => updateSetting("surpriseSystem", false)}
                  className={`relative transition-all hover:scale-110 ${
                    !localSettings.surpriseSystem ? "scale-110" : ""
                  }`}
                >
                  <img 
                    src={!localSettings.surpriseSystem ? "/assets/open-açık-butonu.png" : "/assets/soru-sayısı-butonu.png"} 
                    alt="Surprise System Off" 
                    className="w-14 h-14 object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold text-xs drop-shadow-lg">KAPALI</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button onClick={onStartGame} className="relative group transition-transform hover:scale-105 mt-4">
          <img src="/assets/correct-button.png" alt="Start Game" className="h-16 w-auto min-w-[180px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-base drop-shadow-lg">OYUNA BAŞLA</span>
          </div>
        </button>
      </div>
    </div>
  )
}
