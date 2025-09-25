"use client"

import { characters } from "@/data/characters"

interface MainMenuProps {
  onStartGame: () => void
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
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
        {/* Game Title */}
        <div className="relative mb-8">
          <img src="/assets/soru-sayac-banneri.png" alt="Game Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-amber-900 font-bold text-xl drop-shadow-sm">Puan Merdiveni</span>
            <span className="text-amber-800 font-semibold text-sm drop-shadow-sm">Dijital Bilgi Yarışması</span>
          </div>
        </div>

        {/* Character Selection Panel */}
        <div className="relative mb-8">
          <img src="/assets/soru-arkasi.png" alt="Character Panel" className="w-full max-w-2xl h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {characters.map((character) => (
                <div key={character.id} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-400 mb-2">
                    <img
                      src={character.image || "/placeholder.svg"}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-white text-xs font-semibold text-center drop-shadow-lg">{character.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <button onClick={onStartGame} className="relative group transition-transform hover:scale-105">
          <img src="/assets/genel-buton.png" alt="Start Game" className="h-16 w-auto min-w-[200px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg drop-shadow-lg">OYUNA BAŞLA</span>
          </div>
        </button>
      </div>
    </div>
  )
}
