"use client"

import { useEffect, useState } from "react"
import type { GameState } from "@/types/game"

interface LadderProgressProps {
  gameState: GameState
  onContinue: () => void
  stepsGained: number
  correctTeam: "A" | "B"
}

export default function LadderProgress({ gameState, onContinue, stepsGained, correctTeam }: LadderProgressProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    setShowAnimation(true)
  }, [])

  // Ladder step configuration - dynamically generated
  const LADDER_STEPS = [1, 2, 3, 5, 6, 8, 9, 10, 16, 20]
  
  // Calculate vertical position for each step (0-100%)
  const getStepPosition = (stepIndex: number): { bottom: number; left: number; right: number } => {
    const totalSteps = LADDER_STEPS.length
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

  // Render a single step cloud
  const renderStepCloud = (stepValue: number, stepIndex: number, team: "A" | "B") => {
    const position = getStepPosition(stepIndex)
    const teamPosition = getTeamPosition(team)
    const isActiveStep = teamPosition === stepValue
    
    // Team colors with proper brightness
    const teamFilter = team === "A" 
      ? "hue-rotate(200deg) saturate(1.8) brightness(1.1)" 
      : "hue-rotate(320deg) saturate(1.8) brightness(1.1)"
    
    const positionStyle = team === "A" 
      ? { bottom: `${position.bottom}%`, left: `${position.left}%` }
      : { bottom: `${position.bottom}%`, right: `${position.right}%` }

    // Scale active steps slightly larger
    const scaleClass = isActiveStep ? 'scale-110' : 'scale-100'

    return (
      <div
        key={`${team}-${stepValue}`}
        className={`absolute z-10 transition-all duration-1000 ${scaleClass}`}
        style={positionStyle}
      >
        <div className="relative w-24 h-16 md:w-28 md:h-18">
          <img 
            src="/assets/step.png" 
            alt={`Step ${stepValue}`} 
            className="w-full h-full object-contain drop-shadow-2xl" 
            style={{ filter: teamFilter }}
          />
          <span 
            className="absolute inset-0 flex items-center justify-center text-white font-bold text-base md:text-lg drop-shadow-lg" 
            style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.9)' }}
          >
            {stepValue}
          </span>
        </div>
      </div>
    )
  }

  // Render team character
  const renderTeamCharacter = (team: "A" | "B") => {
    const teamPosition = getTeamPosition(team)
    const character = getTeamCharacter(team)
    
    if (!character || teamPosition <= 0) return null

    // Find current step index
    const stepIndex = LADDER_STEPS.findIndex(step => step === teamPosition)
    if (stepIndex === -1) return null

    const position = getStepPosition(stepIndex)
    const positionStyle = team === "A" 
      ? { bottom: `${position.bottom + 1}%`, left: `${position.left + 2}%` }
      : { bottom: `${position.bottom + 1}%`, right: `${position.right + 2}%` }

    return (
      <div
        className={`absolute z-20 transition-all duration-1000 ${showAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
        style={positionStyle}
      >
        <div className={`relative rounded-full border-4 ${
          team === "A" ? 'border-blue-500 bg-blue-100' : 'border-pink-500 bg-pink-100'
        } shadow-2xl p-1`}>
          <img 
            src={character.image} 
            alt={character.name}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
          />
          {/* Team indicator */}
          <div className={`absolute -top-2 -right-2 w-6 h-6 md:w-7 md:h-7 rounded-full ${
            team === "A" ? 'bg-blue-600' : 'bg-pink-600'
          } border-2 border-white flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-xs md:text-sm">{team}</span>
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

      {/* Ladder Steps - Team A (Left side) */}
      <div className="absolute inset-0">
        {LADDER_STEPS.map((stepValue, index) => renderStepCloud(stepValue, index, "A"))}
      </div>

      {/* Ladder Steps - Team B (Right side) */}
      <div className="absolute inset-0">
        {LADDER_STEPS.map((stepValue, index) => renderStepCloud(stepValue, index, "B"))}
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
          <span className="absolute top-[28%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-sm md:text-base lg:text-lg drop-shadow-lg whitespace-nowrap">
            SORU {gameState.currentQuestion}/{gameState.totalQuestions}
          </span>
        </div>
      </div>

      {/* Score Panel */}
      <div className="absolute top-4 right-4 z-30">
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
              <div className="flex items-center justify-between gap-2 bg-white/10 rounded-lg px-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-500 flex items-center justify-center border-2 border-blue-300 shadow-lg">
                    <span className="text-white font-bold text-xs md:text-sm">A</span>
                  </div>
                  <span className="text-amber-900 font-bold text-sm md:text-base">
                    {gameState.teams.find(t => t.id === "A")?.name || "TAKIM A"}
                  </span>
                </div>
                <span className="text-amber-900 font-bold text-base md:text-lg bg-amber-100/80 px-2 py-0.5 rounded">
                  {getTeamPosition("A")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white/10 rounded-lg px-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-pink-500 flex items-center justify-center border-2 border-pink-300 shadow-lg">
                    <span className="text-white font-bold text-xs md:text-sm">B</span>
                  </div>
                  <span className="text-amber-900 font-bold text-sm md:text-base">
                    {gameState.teams.find(t => t.id === "B")?.name || "TAKIM B"}
                  </span>
                </div>
                <span className="text-amber-900 font-bold text-base md:text-lg bg-amber-100/80 px-2 py-0.5 rounded">
                  {getTeamPosition("B")}
                </span>
              </div>
            </div>
          </div>
          
          {/* Target Score - positioned at the bottom in the yellow banner */}
          <div className="absolute bottom-[8%] left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-1 bg-amber-100/60 px-3 py-1 rounded-full">
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
        <div className="absolute top-1/4 md:top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="relative inline-block animate-pulse">
            <img 
              src="/golden-banner.png" 
              alt="Congratulations Banner"
              className="w-80 md:w-96 lg:w-[28rem] h-auto object-contain drop-shadow-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6">
              <h1 className="text-sm md:text-base lg:text-lg font-bold text-white text-center drop-shadow-lg">
                TEBRİKLER! +{stepsGained} BASAMAK KAZANDINIZ!
              </h1>
            </div>
          </div>
        </div>
      )}

      {/* Correct Answer Notification */}
      {correctTeam && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 animate-bounce">
          <div className="relative inline-block">
            <img 
              src="/assets/correct-button.png" 
              alt="Correct Answer"
              className="w-48 md:w-64 lg:w-80 h-auto object-contain drop-shadow-2xl"
            />
            <p className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs md:text-sm lg:text-base drop-shadow-lg px-2 md:px-4">
              TAKIM {correctTeam} DOĞRU CEVAP VERDİ!
            </p>
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