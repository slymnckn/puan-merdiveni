import { useCallback, useEffect, useState } from "react"

type UseFullscreenOptions = {
  target?: () => HTMLElement | null
}

type FullscreenApi = {
  requestFullscreen?: () => Promise<void> | void
  webkitRequestFullscreen?: () => Promise<void> | void
  mozRequestFullScreen?: () => Promise<void> | void
  msRequestFullscreen?: () => Promise<void> | void
}

type FullscreenDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void
  mozCancelFullScreen?: () => Promise<void> | void
  msExitFullscreen?: () => Promise<void> | void
  webkitFullscreenElement?: Element | null
  mozFullScreenElement?: Element | null
  msFullscreenElement?: Element | null
}

const fullscreenChangeEvents = [
  "fullscreenchange",
  "webkitfullscreenchange",
  "mozfullscreenchange",
  "MSFullscreenChange",
]

export function useFullscreen({ target }: UseFullscreenOptions = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getTargetElement = useCallback(() => {
    if (typeof document === "undefined") return null
    const resolvedTarget = target?.()
    return resolvedTarget ?? document.documentElement
  }, [target])

  const readFullscreenState = useCallback(() => {
    if (typeof document === "undefined") return false
    const doc = document as FullscreenDocument
    const fullscreenElement =
      doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement
    return Boolean(fullscreenElement)
  }, [])

  useEffect(() => {
    if (typeof document === "undefined") return

    const handleChange = () => {
      setIsFullscreen(readFullscreenState())
    }

    handleChange()

    fullscreenChangeEvents.forEach((event) => document.addEventListener(event, handleChange))
    return () => {
      fullscreenChangeEvents.forEach((event) => document.removeEventListener(event, handleChange))
    }
  }, [readFullscreenState])

  const enterFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return
    const element = getTargetElement()
    if (!element) return

    const api = element as FullscreenApi

    try {
      if (api.requestFullscreen) {
        await api.requestFullscreen()
        return
      }
      if (api.webkitRequestFullscreen) {
        await api.webkitRequestFullscreen()
        return
      }
      if (api.mozRequestFullScreen) {
        await api.mozRequestFullScreen()
        return
      }
      if (api.msRequestFullscreen) {
        await api.msRequestFullscreen()
      }
    } catch (error) {
      console.warn("Fullscreen entry failed", error)
    }
  }, [getTargetElement])

  const exitFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return
    const doc = document as FullscreenDocument

    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen()
        return
      }
      if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
        return
      }
      if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen()
        return
      }
      if (doc.msExitFullscreen) {
        await doc.msExitFullscreen()
        return
      }
    } catch (error) {
      console.warn("Fullscreen exit failed", error)
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (readFullscreenState()) {
      void exitFullscreen()
    } else {
      void enterFullscreen()
    }
  }, [enterFullscreen, exitFullscreen, readFullscreenState])

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
