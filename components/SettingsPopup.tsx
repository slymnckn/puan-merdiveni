"use client"

import { getAssetPath } from "@/lib/asset-path"

interface SettingsPopupProps {
  onContinue: () => void
  onReturnToMenu: () => void
}

export default function SettingsPopup({ onContinue, onReturnToMenu }: SettingsPopupProps) {
  const bannerAsset = getAssetPath("/assets/soru-arkasi.png")
  const continueButtonAsset = getAssetPath("/assets/correct-button.png")
  const menuButtonAsset = getAssetPath("/assets/blue-button.png")

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full mx-4" style={{ transform: 'scale(0.85)' }}>
        {/* Banner Background */}
        <div className="relative" style={{ transform: 'scale(1.2)' }}>
          <img 
            src={bannerAsset} 
            alt="Ayarlar" 
            className="w-full h-auto drop-shadow-2xl"
          />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-12" style={{ paddingTop: '65px' }}>
            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">AYARLAR</h2>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs">
              {/* Continue Button */}
              <button
                onClick={onContinue}
                className="relative group transition-transform hover:scale-105 active:scale-95"
              >
                <img 
                  src={continueButtonAsset} 
                  alt="Devam Et" 
                  className="w-full h-auto object-contain drop-shadow-lg" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl drop-shadow-lg">DEVAM ET</span>
                </div>
              </button>

              {/* Return to Menu Button */}
              <button
                onClick={onReturnToMenu}
                className="relative group transition-transform hover:scale-105 active:scale-95"
              >
                <img 
                  src={menuButtonAsset} 
                  alt="Ana Menüye Dön" 
                  className="w-full h-auto object-contain drop-shadow-lg" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg md:text-xl drop-shadow-lg">ANA MENÜYE DÖN</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
