"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAudio } from "@/components/AudioProvider"
import { useFullscreen } from "@/hooks/use-fullscreen"
import { getAssetPath } from "@/lib/asset-path"

type AudioControlsProps = {
  orientation?: "vertical" | "horizontal" | "grid"
  className?: string
  compact?: boolean
  showFullscreen?: boolean
  fullscreenTarget?: () => HTMLElement | null
  showSettings?: boolean
  onSettingsClick?: () => void
}

const baseButtonStyles =
  "inline-flex items-center justify-center rounded-full bg-transparent p-1 text-white transition-transform hover:scale-[1.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"

export default function AudioControls({
  orientation = "vertical",
  className,
  compact = false,
  showFullscreen = true,
  fullscreenTarget,
  showSettings = false,
  onSettingsClick,
}: AudioControlsProps) {
  const { musicEnabled, sfxEnabled, toggleMusic, toggleSfx } = useAudio()
  const { isFullscreen, toggleFullscreen } = useFullscreen({ target: fullscreenTarget })

  const sizeStyles = compact ? "p-1" : "p-2"
  const iconSize = compact ? 40 : 52

  // Grid layout (2x2)
  if (orientation === "grid") {
    return (
      <div className={cn("grid grid-cols-2 gap-2", className)}>
        {/* Üst satır: Müzik ve FX */}
        <button
          type="button"
          onClick={toggleMusic}
          aria-pressed={musicEnabled}
          aria-label={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
          title={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
          className={cn(baseButtonStyles, sizeStyles)}
        >
          <Image
            src={getAssetPath(musicEnabled ? "/assets/music-on.png" : "/assets/music-off.png")}
            alt={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
            width={iconSize}
            height={iconSize}
            className="drop-shadow-md"
            priority={false}
          />
        </button>
        <button
          type="button"
          onClick={toggleSfx}
          aria-pressed={sfxEnabled}
          aria-label={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
          title={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
          className={cn(baseButtonStyles, sizeStyles)}
        >
          <Image
            src={getAssetPath(sfxEnabled ? "/assets/fx-on.png" : "/assets/fx-off.png")}
            alt={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
            width={iconSize}
            height={iconSize}
            className="drop-shadow-md"
            priority={false}
          />
        </button>
        
        {/* Alt satır: Tam Ekran ve Ayarlar */}
        {showFullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
            title={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
            className={cn(baseButtonStyles, sizeStyles)}
          >
            <Image
              src={getAssetPath(isFullscreen ? "/assets/tam-ekran-off.png" : "/assets/tam-ekran-on.png")}
              alt={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
              width={iconSize}
              height={iconSize}
              className="drop-shadow-md"
              priority={false}
            />
          </button>
        )}
        {showSettings && onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            aria-label="Ayarlar"
            title="Ayarlar"
            className={cn(baseButtonStyles, sizeStyles)}
          >
            <Image
              src={getAssetPath("/assets/settings.png")}
              alt="Ayarlar"
              width={iconSize}
              height={iconSize}
              className="drop-shadow-md"
              priority={false}
            />
          </button>
        )}
      </div>
    )
  }

  // Existing vertical/horizontal layouts
  const layoutClass = orientation === "vertical" ? "flex-col" : "flex-row"

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className={cn("flex gap-2", layoutClass)}>
        <button
          type="button"
          onClick={toggleMusic}
          aria-pressed={musicEnabled}
          aria-label={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
          title={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
          className={cn(baseButtonStyles, sizeStyles)}
        >
          <Image
            src={getAssetPath(musicEnabled ? "/assets/music-on.png" : "/assets/music-off.png")}
            alt={musicEnabled ? "Müzik açık" : "Müzik kapalı"}
            width={iconSize}
            height={iconSize}
            className="drop-shadow-md"
            priority={false}
          />
        </button>
        <button
          type="button"
          onClick={toggleSfx}
          aria-pressed={sfxEnabled}
          aria-label={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
          title={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
          className={cn(baseButtonStyles, sizeStyles)}
        >
          <Image
            src={getAssetPath(sfxEnabled ? "/assets/fx-on.png" : "/assets/fx-off.png")}
            alt={sfxEnabled ? "Efektler açık" : "Efektler kapalı"}
            width={iconSize}
            height={iconSize}
            className="drop-shadow-md"
            priority={false}
          />
        </button>
      </div>
      {showFullscreen && (
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
          title={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
          className={cn(baseButtonStyles, compact ? "p-1" : "p-2")}
        >
          <Image
            src={getAssetPath(isFullscreen ? "/assets/tam-ekran-off.png" : "/assets/tam-ekran-on.png")}
            alt={isFullscreen ? "Tam ekrandan çık" : "Tam ekrana geç"}
            width={iconSize}
            height={iconSize}
            className="drop-shadow-md"
            priority={false}
          />
        </button>
      )}
    </div>
  )
}
