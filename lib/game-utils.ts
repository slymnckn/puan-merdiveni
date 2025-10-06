import type { LadderTargets, SurpriseChoice, SurpriseTracker, Question } from "@/types/game"
import type { GameQuestion } from "@/types/api"

// Ladder target calculations based on question count
export const LADDER_TARGETS: LadderTargets = {
  10: 25,
  20: 50,
  30: 75,
  40: 100
}

// Calculate steps gained based on answer time (timed mode)
export const calculateStepsForTimedMode = (timeLeft: number, totalTime: number = 30): number => {
  const usedTime = totalTime - timeLeft
  
  if (usedTime <= 10) return 3  // 0-10 seconds used = +3 steps
  if (usedTime <= 20) return 2  // 11-20 seconds used = +2 steps
  return 1                      // 21-30 seconds used = +1 step
}

// Calculate steps for untimed mode
export const calculateStepsForUntimedMode = (): number => {
  return 1 // Always +1 step for correct answers in untimed mode
}

// Get ladder target for question count
export const getLadderTarget = (questionCount: 10 | 20 | 30 | 40): number => {
  return LADDER_TARGETS[questionCount]
}

// Check if team reached target
export const hasReachedTarget = (position: number, target: number): boolean => {
  return position >= target
}

// Surprise system choices with probabilities
export const SURPRISE_CHOICES: SurpriseChoice[] = [
  {
    choice: "+1 kendi takımına",
    probability: 0.4,
    effect: { type: 'gain', target: 'self', amount: 1 }
  },
  {
    choice: "+2 kendi takımına", 
    probability: 0.2,
    effect: { type: 'gain', target: 'self', amount: 2 }
  },
  {
    choice: "-1 rakip takıma",
    probability: 0.2,
    effect: { type: 'lose', target: 'opponent', amount: 1 }
  },
  {
    choice: "-2 rakip takıma",
    probability: 0.1,
    effect: { type: 'lose', target: 'opponent', amount: 2 }
  },
  {
    choice: "Sıra pas geç",
    probability: 0.1,
    effect: { type: 'skip', target: 'self' }
  }
]

// Select random surprise choice based on probability
export const selectSurpriseChoice = (): SurpriseChoice => {
  const random = Math.random()
  let cumulativeProbability = 0
  
  for (const choice of SURPRISE_CHOICES) {
    cumulativeProbability += choice.probability
    if (random <= cumulativeProbability) {
      return choice
    }
  }
  
  // Fallback to first choice
  return SURPRISE_CHOICES[0]
}

// Apply surprise effect to teams
export const applySurpriseEffect = <T extends { id: 'A' | 'B'; ladderPosition: number }>(
  teams: T[],
  choice: SurpriseChoice,
  currentTeam: 'A' | 'B'
): T[] => {
  const updatedTeams = teams.map(team => ({ ...team }))
  const currentTeamIndex = teams.findIndex(t => t.id === currentTeam)
  const opponentTeamIndex = teams.findIndex(t => t.id !== currentTeam)
  
  switch (choice.effect.type) {
    case 'gain':
      if (choice.effect.target === 'self') {
        updatedTeams[currentTeamIndex].ladderPosition += choice.effect.amount || 0
      }
      break
      
    case 'lose':
      if (choice.effect.target === 'opponent') {
        updatedTeams[opponentTeamIndex].ladderPosition = Math.max(
          0, 
          updatedTeams[opponentTeamIndex].ladderPosition - (choice.effect.amount || 0)
        )
      }
      break
      
    case 'skip':
      // Skip turn - handled in game logic
      break
  }
  
  return updatedTeams
}

const SURPRISE_TRIGGER_CONFIG = {
  baseProbability: 0.3,
  pityIncrement: 0.12,
  minProbability: 0.1,
  maxProbability: 0.85,
  cooldownQuestions: 1,
  fairnessGapThreshold: 2
} as const

type SurpriseTriggerParams = {
  tracker: SurpriseTracker
  currentQuestion: number
  currentTurn: 'A' | 'B'
  randomValue?: number
}

type SurpriseTriggerDecision = {
  triggered: boolean
  probability: number
  randomValue: number
  tracker: SurpriseTracker
}

export const evaluateSurpriseTrigger = ({
  tracker,
  currentQuestion,
  currentTurn,
  randomValue
}: SurpriseTriggerParams): SurpriseTriggerDecision => {
  const roll = randomValue ?? Math.random()
  const otherTeam = currentTurn === 'A' ? 'B' : 'A'

  if (
    tracker.lastTriggeredQuestion !== null &&
    currentQuestion - tracker.lastTriggeredQuestion <= SURPRISE_TRIGGER_CONFIG.cooldownQuestions
  ) {
    return {
      triggered: false,
      probability: 0,
      randomValue: roll,
      tracker: { ...tracker }
    }
  }

  const distanceSinceLast = tracker.lastTriggeredQuestion === null
    ? currentQuestion - 1
    : Math.max(0, currentQuestion - tracker.lastTriggeredQuestion - 1)

  let probability = SURPRISE_TRIGGER_CONFIG.baseProbability +
    distanceSinceLast * SURPRISE_TRIGGER_CONFIG.pityIncrement

  const currentTeamCount = tracker.teamCounts[currentTurn] ?? 0
  const otherTeamCount = tracker.teamCounts[otherTeam] ?? 0
  const difference = currentTeamCount - otherTeamCount

  if (difference < 0) {
    probability += Math.min(0.25, Math.abs(difference) * 0.15)
  } else if (difference > 0) {
    probability -= Math.min(0.2, difference * 0.1)
  }

  probability = Math.min(
    SURPRISE_TRIGGER_CONFIG.maxProbability,
    Math.max(SURPRISE_TRIGGER_CONFIG.minProbability, probability)
  )

  let triggered: boolean

  if (difference <= -SURPRISE_TRIGGER_CONFIG.fairnessGapThreshold) {
    triggered = true
  } else if (difference >= SURPRISE_TRIGGER_CONFIG.fairnessGapThreshold) {
    triggered = false
  } else {
    triggered = roll < probability
  }

  const nextTracker: SurpriseTracker = triggered
    ? {
        lastTriggeredQuestion: currentQuestion,
        teamCounts: {
          ...tracker.teamCounts,
          [currentTurn]: currentTeamCount + 1
        }
      }
    : { ...tracker }

  return {
    triggered,
    probability,
    randomValue: roll,
    tracker: nextTracker
  }
}

// Convert API GameQuestion to internal Question format
export const convertGameQuestionToQuestion = (gameQuestion: GameQuestion): Question => ({
  ...gameQuestion,
  image_url: gameQuestion.image_url || undefined,
  publisher_logo_url: gameQuestion.publisher_logo_url || undefined
})

// Determine game winner - only based on reaching target during game
export const determineWinner = <T extends { id: 'A' | 'B'; ladderPosition: number }>(
  teams: T[],
  target: number
): 'A' | 'B' | 'tie' => {
  const teamA = teams.find(t => t.id === 'A')!
  const teamB = teams.find(t => t.id === 'B')!
  
  // Check if anyone reached target
  const aReached = hasReachedTarget(teamA.ladderPosition, target)
  const bReached = hasReachedTarget(teamB.ladderPosition, target)
  
  if (aReached && bReached) {
    // Both reached - higher position wins
    if (teamA.ladderPosition > teamB.ladderPosition) return 'A'
    if (teamB.ladderPosition > teamA.ladderPosition) return 'B'
    return 'tie'
  }
  
  if (aReached) return 'A'
  if (bReached) return 'B'
  
  // No one reached target - game continues
  return 'tie'
}

// Determine final winner when game ends (all questions answered)
export const determineFinalWinner = <T extends { id: 'A' | 'B'; ladderPosition: number }>(
  teams: T[]
): 'A' | 'B' | 'tie' => {
  const teamA = teams.find(t => t.id === 'A')!
  const teamB = teams.find(t => t.id === 'B')!
  
  // Compare final positions
  if (teamA.ladderPosition > teamB.ladderPosition) return 'A'
  if (teamB.ladderPosition > teamA.ladderPosition) return 'B'
  return 'tie'
}