"use client"

import { useEffect, useState } from "react"
import type { MouseEvent } from "react"
import AudioControls from "@/components/AudioControls"
import PublisherLogoBadge from "@/components/PublisherLogoBadge"
import { getAssetPath } from "@/lib/asset-path"
import type { Advertisement } from "@/types/game"

interface MainMenuProps {
  onStartGame: () => void
  publisherLogo?: string | null
  advertisement?: Advertisement | null
  showAdvertisement?: boolean
  onCloseAdvertisement?: () => void
}

export default function MainMenu({
  onStartGame,
  publisherLogo,
  advertisement,
  showAdvertisement = false,
  onCloseAdvertisement,
}: MainMenuProps) {
  const DEFAULT_AD_DURATION = 5
  const shouldShowAdvertisement = showAdvertisement && !!advertisement
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [canClose, setCanClose] = useState(false)

  useEffect(() => {
    if (!shouldShowAdvertisement || !advertisement) {
      setTimeLeft(null)
      setCanClose(false)
      return
    }

    const rawDuration = Math.floor(advertisement.duration_seconds ?? 0)
    const initialDuration = rawDuration > 0 ? rawDuration : DEFAULT_AD_DURATION
    setTimeLeft(initialDuration)
    setCanClose(initialDuration <= 0)
  }, [advertisement, shouldShowAdvertisement])

  useEffect(() => {
    if (!shouldShowAdvertisement || !advertisement) return
    if (timeLeft === null) return

    if (timeLeft <= 0) {
      setCanClose(true)
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => (prev === null ? null : Math.max(prev - 1, 0)))
    }, 1000)

    return () => clearTimeout(timer)
  }, [shouldShowAdvertisement, advertisement, timeLeft])

  const handleAdvertisementClick = () => {
    if (advertisement?.link_url) {
      window.open(advertisement.link_url, "_blank")
    }
  }

  const handleAdvertisementClose = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!canClose) return
    onCloseAdvertisement?.()
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${getAssetPath("/giris-ekrani.png")})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between px-8 pt-4 pb-12">
        {publisherLogo && (
          <div className="absolute top-4 left-4">
            <PublisherLogoBadge logoUrl={publisherLogo} size="sm" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <AudioControls />
        </div>

        {/* Game Title - Yukarıda */}
        <div className="relative mt-0">
          <img src={getAssetPath("/assets/soru-sayac-banneri.png")} alt="Game Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-20px' }}>
            <span className="text-amber-900 font-bold text-3xl drop-shadow-sm">Puan Merdiveni</span>
          </div>
        </div>

        {/* Start Game Button - Aşağıda */}
        <button onClick={onStartGame} className="relative group transition-transform hover:scale-105 mb-1">
          <img src={getAssetPath("/assets/genel-buton.png")} alt="Start Game" className="h-20 w-auto min-w-[280px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-2xl drop-shadow-lg">OYUNA BAŞLA</span>
          </div>
        </button>
      </div>

      {shouldShowAdvertisement && advertisement && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/50 via-black/40 to-black/50 backdrop-blur-md p-4 md:p-8 lg:p-12">
          <div
            className="relative max-w-5xl w-full cursor-pointer group"
            onClick={handleAdvertisementClick}
          >
            {/* Modern Card Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20">
              {/* Image */}
              <div className="relative">
                <img
                  src={advertisement.file_url}
                  alt={advertisement.name}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement
                    target.src = getAssetPath("/placeholder.svg")
                  }}
                />
                
                {/* Gradient Overlay for Controls */}
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Top Right Timer / Close Button */}
              <div className="absolute top-5 right-5 z-20">
                {canClose ? (
                  <button
                    onClick={handleAdvertisementClose}
                    className="group/btn relative overflow-hidden bg-white/90 hover:bg-white text-gray-900 w-12 h-12 rounded-full font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                    aria-label="Reklamı kapat"
                  >
                    <svg 
                      className="w-5 h-5 transition-transform group-hover/btn:rotate-90 duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <div className="bg-gradient-to-br from-blue-500/95 to-indigo-600/95 backdrop-blur-sm text-white px-6 py-3 rounded-full font-medium shadow-lg border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-medium text-white/70 uppercase tracking-wider leading-none">Reklam</span>
                        <span className="text-lg font-bold leading-none mt-0.5">{timeLeft ?? DEFAULT_AD_DURATION}s</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect Indicator */}
              {advertisement.link_url && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="bg-white/95 backdrop-blur-sm text-gray-900 px-5 py-2 rounded-full text-sm font-medium shadow-lg flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Detaylar için tıklayın</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
