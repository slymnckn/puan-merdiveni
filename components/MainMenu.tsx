"use client"

import AudioControls from "@/components/AudioControls"

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: "url(/giris-ekrani.png)",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-8 pt-4 pb-12">
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <AudioControls />
        </div>

        {/* Game Title - Yukarıda */}
        <div className="relative mt-0">
          <img src="/assets/soru-sayac-banneri.png" alt="Game Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-20px' }}>
            <span className="text-amber-900 font-bold text-3xl drop-shadow-sm">Puan Merdiveni</span>
          </div>
        </div>

        {/* Start Game Button - Aşağıda */}
        <button onClick={onStartGame} className="relative group transition-transform hover:scale-105 mb-1">
          <img src="/assets/genel-buton.png" alt="Start Game" className="h-20 w-auto min-w-[280px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-2xl drop-shadow-lg">OYUNA BAŞLA</span>
          </div>
        </button>
      </div>
    </div>
  )
}
