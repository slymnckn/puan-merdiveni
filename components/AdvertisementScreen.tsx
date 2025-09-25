"use client"

import { useState, useEffect } from "react"
import type { Advertisement } from "@/types/api"

interface AdvertisementScreenProps {
  advertisement: Advertisement
  onAdComplete: () => void
  onAdSkip: () => void
}

export default function AdvertisementScreen({ 
  advertisement, 
  onAdComplete, 
  onAdSkip 
}: AdvertisementScreenProps) {
  const [timeLeft, setTimeLeft] = useState(advertisement.duration_seconds)
  const [canSkip, setCanSkip] = useState(false)

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      
      return () => clearTimeout(timer)
    } else {
      setCanSkip(true)
    }
  }, [timeLeft])

  const handleAdClick = () => {
    if (advertisement.link_url) {
      window.open(advertisement.link_url, '_blank')
    }
  }

  const handleSkipOrClose = () => {
    if (canSkip) {
      onAdComplete()
    } else {
      onAdSkip()
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Advertisement Content */}
      <div 
        className="relative w-full h-full cursor-pointer"
        onClick={handleAdClick}
      >
        {/* Advertisement Image/Video */}
        <img
          src={advertisement.file_url}
          alt={advertisement.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg"
          }}
        />

        {/* Overlay Gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Top Right Counter/Skip Button */}
        <div className="absolute top-6 right-6 z-10">
          {canSkip ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleSkipOrClose()
              }}
              className="bg-black/70 hover:bg-black/90 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 flex items-center gap-2"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
              Kapat
            </button>
          ) : (
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg font-bold min-w-[80px] text-center">
              {timeLeft}s
            </div>
          )}
        </div>

        {/* Advertisement Info */}
        <div className="absolute bottom-6 left-6 right-6 z-10">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
            <h2 className="text-white text-xl font-bold mb-2">
              {advertisement.name}
            </h2>
            <p className="text-white/80 text-sm">
              {advertisement.link_url ? "Daha fazla bilgi için tıklayın" : "Reklam"}
            </p>
          </div>
        </div>
      </div>

      {/* Loading indicator for image */}
      <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Reklam yükleniyor...</p>
        </div>
      </div>
    </div>
  )
}