"use client"

import { useEffect, useState, useRef } from "react"
import type { GameState } from "@/types/game"
import { useAudio } from "@/components/AudioProvider"
import AudioControls from "@/components/AudioControls"

interface LadderProgressProps {
  gameState: GameState
  onContinue: () => void
  stepsGained: number
  correctTeam: "A" | "B" | null
}

export default function LadderProgress({ gameState, onContinue, stepsGained, correctTeam }: LadderProgressProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]) // Timeout'ları takip et
  const { playSfx } = useAudio()
  const playSfxRef = useRef(playSfx)
  
  // Yanlış cevap ise animatedSteps = stepsGained (tamamlanmış), doğru cevap ise 0 (animasyon başlayacak)
  const [animatedSteps, setAnimatedSteps] = useState(
    stepsGained === 0 || !correctTeam ? stepsGained : 0
  )
  const [isJumping, setIsJumping] = useState(false)
  const [jumpFrame, setJumpFrame] = useState(1)

  useEffect(() => {
    playSfxRef.current = playSfx
  }, [playSfx])

  useEffect(() => {
    console.log('🎬 LadderProgress animasyonu hazırlanıyor:', { stepsGained, correctTeam })
    setShowAnimation(true)
    setAnimatedSteps(stepsGained === 0 || !correctTeam ? stepsGained : 0)

    // Yanlış cevap durumu: Animasyon yok
    if (stepsGained === 0 || !correctTeam) {
      console.log('❌ Yanlış cevap - animasyon yok')
      return () => undefined
    }

    // Doğru cevap durumu: Önce karakter görünsün, sonra animasyon başlasın
    const initialDelay = setTimeout(() => {
      console.log('✅ Doğru cevap - animasyon başlıyor')

      const performJump = (currentStep: number) => {
        if (currentStep > stepsGained) {
          return
        }

        setAnimatedSteps(currentStep)
        setIsJumping(true)

        const stepSoundKey = currentStep === 1 ? "step-1" : currentStep === 2 ? "step-2" : "step-3"
  playSfxRef.current?.(stepSoundKey)

        const playFrame = (frameNum: number) => {
          setJumpFrame(frameNum)
          const frameDuration = frameNum === 2 ? 150 : 100

          if (frameNum < 3) {
            const timeout = setTimeout(() => playFrame(frameNum + 1), frameDuration)
            timeoutsRef.current.push(timeout)
          } else {
            const timeout = setTimeout(() => {
              setJumpFrame(1)
              setIsJumping(false)

              if (currentStep < stepsGained) {
                const nextTimeout = setTimeout(() => performJump(currentStep + 1), 150)
                timeoutsRef.current.push(nextTimeout)
              }
            }, frameDuration)
            timeoutsRef.current.push(timeout)
          }
        }

        playFrame(1)
      }

      performJump(1)
    }, 500)

    timeoutsRef.current.push(initialDelay)

    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.current = []
    }
  }, [correctTeam, stepsGained])

  // Dinamik merdiven sistemi - Her takım için ayrı Sliding Window
  const VISIBLE_STEPS = 10 // Ekranda görünecek basamak sayısı (sabit)
  const TARGET = gameState.ladderTarget // Hedefe göre toplam basamak sayısı
  
  // Tüm basamakları oluştur (1'den hedefe kadar, her adımda +1)
  const generateAllSteps = () => {
    const steps: number[] = []
    // 1'den hedefe kadar tüm sayıları ekle
    for (let i = 1; i <= TARGET; i++) {
      steps.push(i)
    }
    return steps
  }
  
  const ALL_STEPS = generateAllSteps()
  
  // Her takım için ayrı sliding window
  const getVisibleStepsForTeam = (teamId: "A" | "B") => {
    const team = gameState.teams.find(t => t.id === teamId)
    const teamPosition = team?.ladderPosition || 1
    
    // Eğer pozisyon 10'dan küçük veya eşitse, 1-10 arası göster
    if (teamPosition <= VISIBLE_STEPS) {
      return ALL_STEPS.slice(0, VISIBLE_STEPS)
    }
    
    // Sliding window: Karakterin 3 basamak gerisinden başla
    const windowStart = Math.max(1, teamPosition - 3)
    const windowEnd = windowStart + VISIBLE_STEPS
    
    // windowStart-1 çünkü array 0-indexed ama basamaklar 1-indexed
    return ALL_STEPS.slice(windowStart - 1, Math.min(windowEnd - 1, ALL_STEPS.length))
  }
  
  // Basamak rengini belirle (her 10 basamakta bir değişir)
  const getStepColorTier = (stepValue: number): number => {
    return Math.floor((stepValue - 1) / 10)
  }
  
  // Renk paleti - her tier için farklı renk
  const getColorPalette = (tier: number, team: "A" | "B") => {
    const colorTiers = {
      A: [
        // Tier 0 (1-10): Mor
        { base: "#5B21B6", light: "#8B5CF6", name: "Mor" },
        // Tier 1 (11-20): Mavi
        { base: "#1E40AF", light: "#3B82F6", name: "Mavi" },
        // Tier 2 (21-30): Turkuaz
        { base: "#0F766E", light: "#14B8A6", name: "Turkuaz" },
        // Tier 3 (31-40): Yeşil
        { base: "#15803D", light: "#22C55E", name: "Yeşil" },
        // Tier 4 (41-50): Sarı
        { base: "#CA8A04", light: "#EAB308", name: "Sarı" },
        // Tier 5+ (51+): Altın
        { base: "#B45309", light: "#F59E0B", name: "Altın" }
      ],
      B: [
        // Tier 0 (1-10): Pembe
        { base: "#C026D3", light: "#E879F9", name: "Pembe" },
        // Tier 1 (11-20): Kırmızı-Pembe
        { base: "#BE123C", light: "#FB7185", name: "Pembe-Kırmızı" },
        // Tier 2 (21-30): Turuncu
        { base: "#C2410C", light: "#FB923C", name: "Turuncu" },
        { base: "#CA8A04", light: "#FBBF24", name: "Turuncu-Sarı" },
        // Tier 4 (41-50): Sarı
        { base: "#A16207", light: "#FDE047", name: "Sarı" },
        // Tier 5+ (51+): Altın
        { base: "#B45309", light: "#F59E0B", name: "Altın" }
      ]
    }
    
    const teamColors = colorTiers[team]
    return teamColors[Math.min(tier, teamColors.length - 1)]
  }
  
  // Calculate vertical position for each step (0-100%)
  const getStepPosition = (stepIndex: number): { bottom: number; left: number; right: number } => {
    const totalSteps = VISIBLE_STEPS // Sabit 10 basamak
    const verticalSpacing = 65 / (totalSteps - 1) // Distribution from 10% to 75%
    const bottom = 10 + (stepIndex * verticalSpacing)
    
    // Gradual diagonal movement toward center
    const horizontalOffset = stepIndex * 3 // More pronounced diagonal movement
    
    return {
      bottom,
      left: 8 + horizontalOffset,    // Team A: left to center
      right: 8 + horizontalOffset   // Team B: right to center
    }
  }

  // Get current team positions
  const getTeamPosition = (team: "A" | "B"): number => {
    const targetTeam = gameState.teams.find(t => t.id === team)
    return targetTeam?.ladderPosition || 0
  }

  // Get team character
  const getTeamCharacter = (team: "A" | "B") => {
    const targetTeam = gameState.teams.find(t => t.id === team)
    return targetTeam?.character || null
  }

  const getStepAsset = (stepValue: number): string => {
    if (stepValue >= 50) return "/steps/level-6.png"
    if (stepValue >= 40) return "/steps/level-5.png"
    if (stepValue >= 30) return "/steps/level-4.png"
    if (stepValue >= 20) return "/steps/level-3.png"
    if (stepValue >= 10) return "/steps/level-2.png"
    return "/steps/level-1.png"
  }

  // Render a single step cloud
  const renderStepCloud = (stepValue: number, stepIndex: number, team: "A" | "B") => {
    const position = getStepPosition(stepIndex)
    const teamPosition = getTeamPosition(team)
    const isActiveStep = teamPosition === stepValue
    const isPassed = teamPosition > stepValue
    
    const positionStyle = team === "A" 
      ? { bottom: `${position.bottom}%`, left: `${position.left}%` }
      : { bottom: `${position.bottom}%`, right: `${position.right}%` }

    // Scale active steps slightly larger
    const scaleClass = isActiveStep ? 'scale-110' : 'scale-100'
    
    // Basamaklı merdiven görünümü - görsel referansa göre
    // Her basamak soldan sağa doğru uzanan dikdörtgen şeklinde
    const stepWidth = 180 + (stepIndex * 8) // Her basamak gittikçe genişler
    const stepHeight = 45 // Sabit yükseklik
    
    // Tier'a göre renk al (her 10 basamakta bir değişir)
    const tier = getStepColorTier(stepValue)
    const colorPalette = getColorPalette(tier, team)
    const lightColor = colorPalette.light
    
    // Opacity kontrolü - geçilmemiş basamaklar soluk
    const opacity = isActiveStep ? 1 : isPassed ? 0.9 : 0.3
    const borderRadius = "12px 32px 32px 12px"
    const stepImageFilter = isActiveStep
      ? `brightness(1.1) drop-shadow(0 12px 22px ${lightColor}66)`
      : isPassed
        ? 'brightness(0.95) drop-shadow(0 8px 16px rgba(0,0,0,0.35))'
        : 'brightness(0.85) drop-shadow(0 6px 12px rgba(0,0,0,0.25))'
    const stepImageSrc = getStepAsset(stepValue)

    return (
      <div
        key={`${team}-${stepValue}`}
        className={`absolute z-10 transition-all duration-1000 ${scaleClass}`}
        style={{ ...positionStyle, opacity }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: `${stepWidth}px`,
            height: `${stepHeight}px`,
            transform: isActiveStep ? 'translateY(-2px)' : 'none'
          }}
        >
          <img
            src={stepImageSrc}
            alt="Basamak"
            className="absolute inset-0 w-full h-full object-fill select-none pointer-events-none"
            style={{ borderRadius, filter: stepImageFilter }}
          />

          {/* Yıldız dekorasyonları (görseldeki gibi) */}
          {isActiveStep && (
            <>
              <div className="absolute -left-3 top-1/4 text-yellow-300 text-sm animate-pulse drop-shadow-lg">✨</div>
              <div className="absolute -left-3 bottom-1/4 text-yellow-300 text-sm animate-pulse delay-100 drop-shadow-lg">✨</div>
              <div className="absolute left-1/4 -top-3 text-yellow-300 text-sm animate-pulse delay-200 drop-shadow-lg">✨</div>
              <div className="absolute right-1/4 -top-3 text-yellow-300 text-xs animate-pulse delay-300 drop-shadow-lg">⭐</div>
            </>
          )}

          <span
            className="text-white font-bold text-xl md:text-2xl drop-shadow-lg z-10"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
          >
            {stepValue}
          </span>
        </div>
      </div>
    )
  }

  // Render team character
  const renderTeamCharacter = (team: "A" | "B") => {
    const baseTeamPosition = getTeamPosition(team)
    const character = getTeamCharacter(team)
    
    if (!character || baseTeamPosition <= 0) return null

    // Pozisyon hesaplama:
    // 1. Yanlış cevap (stepsGained = 0): baseTeamPosition'da sabit dur
    // 2. Doğru cevap, animasyon bitti (animatedSteps = stepsGained): baseTeamPosition'da dur
    // 3. Doğru cevap, animasyon devam ediyor: başlangıçtan adım adım çık
    let displayPosition = baseTeamPosition
    
    // Animasyon devam ediyor MU kontrolü: 
    // - isJumping: Şu anda frame animasyonu oynatılıyor
    // - animatedSteps < stepsGained: Henüz tüm adımlar tamamlanmadı
    const isAnimating = team === correctTeam && stepsGained > 0 && 
                       (animatedSteps < stepsGained || isJumping)
    
    if (isAnimating) {
      // Animasyon devam ediyor: başlangıçtan (basePosition - stepsGained) adım adım çık
      displayPosition = baseTeamPosition - stepsGained + animatedSteps
    }
    // Aksi durumda: baseTeamPosition'da sabit dur (yanlış cevap veya animasyon bitti)

    // Her takım için ayrı visible steps al
    const teamSteps = getVisibleStepsForTeam(team)
    
    // Find current step index in team's visible steps
    const stepIndex = teamSteps.findIndex((step: number) => step === displayPosition)
    if (stepIndex === -1) return null

    const position = getStepPosition(stepIndex)
    const positionStyle = team === "A" 
      ? { bottom: `${position.bottom + 1}%`, left: `${position.left + 2}%` }
      : { bottom: `${position.bottom + 1}%`, right: `${position.right + 2}%` }

    // Doğal glow renkleri - belli belirsiz
    const glowColor = team === "A" ? 'rgba(59, 130, 246, 0.4)' : 'rgba(236, 72, 153, 0.4)'

    // Aktif sıradaki takımı belirle (Soru numarasına göre - tek = A, çift = B)
    const activeTeam = gameState.currentQuestion % 2 === 1 ? "A" : "B"
    const isActiveTeam = team === activeTeam
    
    // Zıplama animasyonu sadece doğru takımda, stepsGained > 0 ve zıplarken aktif
    const jumpClass = team === correctTeam && stepsGained > 0 && isJumping ? 'animate-ladder-jump' : ''
    
    // Aktif sıradaki karaktere hafif bounce (ama basamak çıkma animasyonu oynarken değil)
    const idleBounceClass = isActiveTeam && !isJumping ? 'animate-idle-bounce' : ''

    return (
      <div
        className="absolute z-50 transition-all duration-500"
        style={{
          ...positionStyle,
          transform: team === "B" ? 'scaleX(-1)' : undefined, // Takım B: Tüm container'ı yansıt
          opacity: showAnimation ? 1 : 0,
          scale: showAnimation ? 1 : 0
        }}
      >
        {/* Karakter görseli ve glow */}
        <div className={`relative ${jumpClass} ${idleBounceClass}`}>
          {/* Arka planda doğal glow efekti */}
          <div 
            className="absolute inset-0 -z-10 rounded-full blur-xl"
            style={{
              background: glowColor,
              transform: 'scale(1.5)',
              opacity: 0.6
            }}
          />
          
          <img 
            src={
              team === correctTeam && stepsGained > 0 && isJumping && 
              (character.id === 'hizli-kedi' || character.id === 'minik-dinazor' || 
               character.id === 'sihirbaz' || character.id === 'tekno-robot' ||
               character.id === 'uzay-kasifi' || character.id === 'zeka-ustasi')
                ? `/hero/animation/${character.id}/${jumpFrame}.png`
                : character.image
            }
            alt={character.name}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-contain p-1"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.2)) drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          />
          {/* Team indicator - Badge içeride ama ters çevrilmiş */}
          <div 
            className={`absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full ${
              team === "A" ? 'bg-blue-600' : 'bg-pink-600'
            } border-2 border-white flex items-center justify-center shadow-lg`}
            style={{
              transform: team === "B" ? 'scaleX(-1)' : undefined // Badge'i tekrar ters çevir
            }}
          >
            <span className="text-white font-bold text-[10px] md:text-xs">{team}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/assets/background.png)' }}
      />

      {/* Audio Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col items-end gap-2">
        <AudioControls />
      </div>

      {/* Ladder Steps - Team A (Left side) - Her takımın kendi basamakları */}
      <div className="absolute inset-0">
        {getVisibleStepsForTeam("A").map((stepValue: number, index: number) => renderStepCloud(stepValue, index, "A"))}
      </div>

      {/* Ladder Steps - Team B (Right side) - Her takımın kendi basamakları */}
      <div className="absolute inset-0">
        {getVisibleStepsForTeam("B").map((stepValue: number, index: number) => renderStepCloud(stepValue, index, "B"))}
      </div>

      {/* Team Characters */}
      {renderTeamCharacter("A")}
      {renderTeamCharacter("B")}

      {/* Question Counter */}
      <div className="absolute top-4 left-4 z-30">
        <div className="relative inline-block">
          <img 
            src="/assets/soru-sayac-banneri.png" 
            alt="Question Counter"
            className="h-14 md:h-16 lg:h-20 w-auto object-contain drop-shadow-xl"
          />
          <span className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-base md:text-lg lg:text-xl drop-shadow-lg whitespace-nowrap">
            SORU {gameState.currentQuestion}/{gameState.totalQuestions}
          </span>
        </div>
      </div>

      {/* Score Panel - Ortada, Sonraki Soru butonunun üstünde */}
      <div className="absolute bottom-32 md:bottom-36 left-1/2 transform -translate-x-1/2 z-30">
        <div className="relative inline-block">
          <img 
            src="/score-scroll.png" 
            alt="Score Panel"
            className="w-72 md:w-80 lg:w-96 h-auto object-contain drop-shadow-2xl"
          />
          {/* SKOR Title - positioned in the top orange banner */}
          <div className="absolute top-[2%] left-1/2 transform -translate-x-1/2">
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-amber-900 text-center" style={{ textShadow: '1px 1px 2px rgba(255,255,255,0.3)' }}>
              SKOR
            </h2>
          </div>
          
          {/* Score Content - positioned in the scroll body */}
          <div className="absolute top-[30%] left-0 right-0 flex flex-col items-center px-8 md:px-10 lg:px-12">
            <div className="space-y-2 md:space-y-3 w-full">
              {/* Sıralama: Lider üstte */}
              {(() => {
                const teamA = gameState.teams.find(t => t.id === "A")
                const teamB = gameState.teams.find(t => t.id === "B")
                const posA = getTeamPosition("A")
                const posB = getTeamPosition("B")
                const isALeader = posA > posB
                const isTie = posA === posB
                
                const teams = isALeader 
                  ? [{ team: teamA, pos: posA, id: "A" }, { team: teamB, pos: posB, id: "B" }]
                  : [{ team: teamB, pos: posB, id: "B" }, { team: teamA, pos: posA, id: "A" }]
                
                return teams.map(({ team, pos, id }, index) => {
                  const isLeader = index === 0 && !isTie
                  return (
                    <div key={id} className="flex items-center justify-between gap-2 bg-white/10 rounded-lg px-2 py-1">
                      <div className="flex items-center gap-2">
                        {/* Karakter görseli A/B harfi yerine */}
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
                          <img 
                            src={team?.character?.image || "/placeholder.svg"} 
                            alt={team?.character?.name || `Team ${id}`}
                            className="w-full h-full object-contain p-0.5"
                            style={{
                              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))'
                            }}
                          />
                        </div>
                        <span className="text-amber-900 font-bold text-sm md:text-base">
                          {team?.name || `TAKIM ${id}`}
                        </span>
                        {/* Taç - sadece lider varsa */}
                        {isLeader && (
                          <span className="text-xl md:text-2xl">👑</span>
                        )}
                      </div>
                      <span className="text-amber-900 font-bold text-base md:text-lg bg-amber-100/80 px-2 py-0.5 rounded">
                        {pos}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
          
          {/* Target Score - positioned at the bottom - sadece text, banner yok */}
          <div className="absolute bottom-[8%] left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1">
              <span className="text-lg">🎯</span>
              <span className="text-amber-900 font-bold text-xs md:text-sm whitespace-nowrap">
                HEDEF: {gameState.ladderTarget}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Congratulations Banner */}
      {stepsGained > 0 && (
        <div className="absolute top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="relative inline-block animate-pulse">
            <img 
              src="/golden-banner.png" 
              alt="Congratulations Banner"
              className="w-80 md:w-96 lg:w-[28rem] h-auto object-contain drop-shadow-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6" style={{ marginTop: '-8px' }}>
              <h1 className="text-sm md:text-base lg:text-lg font-bold text-white text-center drop-shadow-lg">
                TEBRİKLER! +{stepsGained} BASAMAK KAZANDINIZ!
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 hover:scale-110 hover:brightness-110 active:scale-95"
      >
        <div className="relative inline-block">
          <img 
            src="/assets/genel-buton.png" 
            alt="Continue Button"
            className="w-40 md:w-48 lg:w-56 h-auto object-contain drop-shadow-2xl"
          />
          <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg drop-shadow-lg px-2">
            SONRAKI SORU
          </span>
        </div>
      </button>
    </div>
  )
}