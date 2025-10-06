"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { getAssetPath } from "@/lib/asset-path"

type MusicTrack = "lobby" | "game"
type StepVariant = "step-1" | "step-2" | "step-3"
type SfxKey =
  | "button"
  | "correct"
  | "wrong"
  | "surprise"
  | "end-game"
  | StepVariant

type AudioContextValue = {
  musicEnabled: boolean
  sfxEnabled: boolean
  activeMusic: MusicTrack | null
  desiredMusic: MusicTrack | null
  playMusic: (track: MusicTrack) => void
  stopMusic: (options?: { resetDesired?: boolean }) => void
  toggleMusic: () => void
  setMusicEnabled: (enabled: boolean) => void
  playSfx: (key: SfxKey) => void
  toggleSfx: () => void
  setSfxEnabled: (enabled: boolean) => void
}

const MUSIC_SOURCES: Record<MusicTrack, string> = {
  lobby: getAssetPath("/audio/music/lobby-music.wav"),
  game: getAssetPath("/audio/music/game-music.wav"),
}

const SFX_SOURCES: Record<SfxKey, string> = {
  button: getAssetPath("/audio/fx/button.mp3"),
  correct: getAssetPath("/audio/fx/correct-answer.wav"),
  wrong: getAssetPath("/audio/fx/wrong-answer.wav"),
  surprise: getAssetPath("/audio/fx/surprise.wav"),
  "end-game": getAssetPath("/audio/fx/end-game.mp3"),
  "step-1": getAssetPath("/audio/fx/1-step.mp3"),
  "step-2": getAssetPath("/audio/fx/2-step.mp3"),
  "step-3": getAssetPath("/audio/fx/3-step.mp3"),
}

const MUSIC_VOLUME = 0.55
const SFX_VOLUME = 0.75
const LOCAL_STORAGE_KEY = "quiz-game-audio"

type PersistedSettings = {
  musicEnabled: boolean
  sfxEnabled: boolean
}

const defaultSettings: PersistedSettings = {
  musicEnabled: true,
  sfxEnabled: true,
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined)

const safePlay = (audio: HTMLAudioElement | null) => {
  if (!audio) return
  const playPromise = audio.play()
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      // Autoplay restrictions may prevent playback until user interaction.
      console.warn("Audio playback prevented:", error)
    })
  }
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const musicRefs = useRef<Record<MusicTrack, HTMLAudioElement | null>>({ lobby: null, game: null })
  const sfxTemplateRefs = useRef<Record<SfxKey, HTMLAudioElement | null>>({
    button: null,
    correct: null,
    wrong: null,
    surprise: null,
    "end-game": null,
    "step-1": null,
    "step-2": null,
    "step-3": null,
  })
  const desiredMusicRef = useRef<MusicTrack | null>(null)

  const [musicEnabled, setMusicEnabledState] = useState(defaultSettings.musicEnabled)
  const [sfxEnabled, setSfxEnabledState] = useState(defaultSettings.sfxEnabled)
  const [activeMusic, setActiveMusic] = useState<MusicTrack | null>(null)

  // Load persisted settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PersistedSettings>
        if (typeof parsed.musicEnabled === "boolean") {
          setMusicEnabledState(parsed.musicEnabled)
        }
        if (typeof parsed.sfxEnabled === "boolean") {
          setSfxEnabledState(parsed.sfxEnabled)
        }
      }
    } catch (error) {
      console.warn("Failed to parse audio settings", error)
    }
  }, [])

  // Persist settings whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return
    const payload: PersistedSettings = { musicEnabled, sfxEnabled }
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload))
  }, [musicEnabled, sfxEnabled])

  // Initialize audio elements lazily after mount
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return () => undefined
    }

    const createAudioElement = (src: string, options: { loop?: boolean; volume: number }) => {
      const element = document.createElement("audio")
      element.src = src
      element.loop = options.loop ?? false
      element.volume = options.volume
      element.preload = "auto"
      element.crossOrigin = "anonymous"
      return element
    }

    musicRefs.current.lobby = createAudioElement(MUSIC_SOURCES.lobby, { loop: true, volume: MUSIC_VOLUME })
    musicRefs.current.game = createAudioElement(MUSIC_SOURCES.game, { loop: true, volume: MUSIC_VOLUME })

    ;(Object.keys(SFX_SOURCES) as SfxKey[]).forEach((key) => {
      sfxTemplateRefs.current[key] = createAudioElement(SFX_SOURCES[key], { volume: SFX_VOLUME })
    })

    return () => {
      Object.values(musicRefs.current).forEach((audio) => {
        if (!audio) return
        audio.pause()
        audio.src = ""
      })
      musicRefs.current = { lobby: null, game: null }

      Object.values(sfxTemplateRefs.current).forEach((audio) => {
        if (!audio) return
        audio.pause()
        audio.src = ""
      })
      sfxTemplateRefs.current = {
        button: null,
        correct: null,
        wrong: null,
        surprise: null,
        "end-game": null,
        "step-1": null,
        "step-2": null,
        "step-3": null,
      }
    }
  }, [])

  const stopMusic = useCallback(
    (options?: { resetDesired?: boolean }) => {
      if (activeMusic) {
        const currentAudio = musicRefs.current[activeMusic]
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
      }
      setActiveMusic(null)
      if (options?.resetDesired ?? true) {
        desiredMusicRef.current = null
      }
    },
    [activeMusic]
  )

  const playMusic = useCallback(
    (track: MusicTrack) => {
      desiredMusicRef.current = track

      const targetAudio = musicRefs.current[track]
      if (!targetAudio) return

      if (!musicEnabled) {
        // Respect mute preference but remember desired track
        if (activeMusic) {
          const currentAudio = musicRefs.current[activeMusic]
          currentAudio?.pause()
        }
        setActiveMusic(null)
        return
      }

      if (activeMusic && activeMusic !== track) {
        const currentAudio = musicRefs.current[activeMusic]
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
      }

      if (activeMusic === track && targetAudio.paused) {
        safePlay(targetAudio)
        return
      }

      if (activeMusic !== track) {
        targetAudio.currentTime = 0
      }

      safePlay(targetAudio)
      setActiveMusic(track)
    },
    [activeMusic, musicEnabled]
  )

  // When music preference is toggled on, resume desired track if available
  useEffect(() => {
    if (!musicEnabled) {
      stopMusic({ resetDesired: false })
      return
    }

    if (desiredMusicRef.current) {
      playMusic(desiredMusicRef.current)
    }
  }, [musicEnabled, playMusic, stopMusic])

  const setMusicEnabled = useCallback(
    (enabled: boolean) => {
      setMusicEnabledState(enabled)
      if (!enabled) {
        stopMusic({ resetDesired: false })
      }
    },
    [stopMusic]
  )

  const toggleMusic = useCallback(() => {
    setMusicEnabled(!musicEnabled)
  }, [musicEnabled, setMusicEnabled])

  const playSfx = useCallback(
    (key: SfxKey) => {
      if (!sfxEnabled) return
      const template = sfxTemplateRefs.current[key]
      if (!template) return
      const instance = template.cloneNode(true) as HTMLAudioElement
      instance.volume = template.volume
      instance.playbackRate = template.playbackRate
      instance.onended = () => instance.remove()
      safePlay(instance)
    },
    [sfxEnabled]
  )

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!sfxEnabled) return
      const target = event.target as HTMLElement | null
      if (!target) return
      const button = target.closest("button") as HTMLButtonElement | null
      if (!button || button.disabled) return
      playSfx("button")
    }

    document.addEventListener("click", handleClick, true)
    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [playSfx, sfxEnabled])

  const setSfxEnabled = useCallback((enabled: boolean) => {
    setSfxEnabledState(enabled)
  }, [])

  const toggleSfx = useCallback(() => {
    setSfxEnabled(!sfxEnabled)
  }, [sfxEnabled, setSfxEnabled])

  const value = useMemo<AudioContextValue>(
    () => ({
      musicEnabled,
      sfxEnabled,
      activeMusic,
      desiredMusic: desiredMusicRef.current,
      playMusic,
      stopMusic,
      toggleMusic,
      setMusicEnabled,
      playSfx,
      toggleSfx,
      setSfxEnabled,
    }),
    [activeMusic, musicEnabled, playMusic, playSfx, setMusicEnabled, sfxEnabled, stopMusic, toggleMusic, toggleSfx, setSfxEnabled]
  )

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
