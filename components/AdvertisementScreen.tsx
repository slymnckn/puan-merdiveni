"use client"

import { useState, useEffect } from "react"
import type { Advertisement } from "@/types/api"
import { getAssetPath } from "@/lib/asset-path"

interface AdvertisementScreenProps {
  advertisement: Advertisement
  onAdComplete: () => void
}

export default function AdvertisementScreen({ 
  advertisement, 
  onAdComplete
}: AdvertisementScreenProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor(advertisement.duration_seconds ?? 0)))
  const [canClose, setCanClose] = useState(advertisement.duration_seconds <= 0)

  useEffect(() => {
    const initialDuration = Math.max(0, Math.floor(advertisement.duration_seconds ?? 0))
    setTimeLeft(initialDuration)
    setCanClose(initialDuration <= 0)
  }, [advertisement])

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanClose(true)
      return
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleAdClick = () => {
    if (advertisement.link_url) {
      window.open(advertisement.link_url, '_blank')
    }
  }

  const handleClose = () => {
    if (canClose) {
      onAdComplete()
    }
  }

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black/40 flex items-center justify-center z-50 p-8 md:p-12">
      {/* Advertisement Popup Modal */}
      <div 
        className="relative max-w-5xl w-full cursor-pointer rounded-xl overflow-hidden shadow-2xl"
        onClick={handleAdClick}
      >
        {/* Advertisement Image/Video - Natural size in popup */}
        <img
          src={advertisement.file_url}
          alt={advertisement.name}
          className="w-full h-auto"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement
            target.src = getAssetPath("/placeholder.svg")
          }}
        />

        {/* Top Right Counter / Close Button */}
        <div className="absolute top-4 right-4 z-20">
          {canClose ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              className="bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-full font-bold transition-all duration-200 flex items-center justify-center shadow-lg"
              aria-label="Reklamı kapat"
            >
              <span className="text-lg">✕</span>
            </button>
          ) : (
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg font-bold min-w-[96px] text-center shadow-lg">
              {timeLeft}s
            </div>
          )}
        </div>
      </div>
    </div>
  )
}