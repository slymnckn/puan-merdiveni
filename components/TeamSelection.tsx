"use client"

import { useState } from "react"
import { characters } from "@/data/characters"
import type { Team, Character } from "@/types/game"

interface TeamSelectionProps {
  teams: Team[]
  onTeamsUpdate: (teams: Team[]) => void
  onContinue: () => void
}

export default function TeamSelection({ teams, onTeamsUpdate, onContinue }: TeamSelectionProps) {
  const [localTeams, setLocalTeams] = useState<Team[]>(teams)

  const updateTeamName = (teamId: "A" | "B", name: string) => {
    const updatedTeams = localTeams.map((team) => (team.id === teamId ? { ...team, name } : team))
    setLocalTeams(updatedTeams)
    onTeamsUpdate(updatedTeams)
  }

  const updateTeamCharacter = (teamId: "A" | "B", character: Character) => {
    const updatedTeams = localTeams.map((team) => (team.id === teamId ? { ...team, character } : team))
    setLocalTeams(updatedTeams)
    onTeamsUpdate(updatedTeams)
  }

  const canContinue = localTeams.every((team) => team.name.trim() && team.character)

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

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-8">
        {/* Title */}
        <div className="relative mb-6">
          <img src="/assets/soru-sayac-banneri.png" alt="Team Selection Title" className="h-20 w-auto" />
          <div className="absolute inset-0 flex items-center justify-center" style={{ marginTop: '-12px' }}>
            <span className="text-amber-900 font-bold text-xl drop-shadow-sm">TAKIM & KARAKTER SEÇİMİ</span>
          </div>
        </div>

        {/* Team Selection Panels */}
        <div className="flex gap-8 mb-6 max-w-7xl">
          {localTeams.map((team) => (
            <div key={team.id} className="relative flex-1">
              <img src="/assets/soru-arkasi.png" alt={`Team ${team.id} Panel`} className="w-full h-auto scale-105" />
              <div className="absolute inset-0 flex flex-col items-center px-8 pt-[80px] pb-[65px] scale-105">
                {/* Team Name Input */}
                <div className="relative mb-2 flex-shrink-0">
                  <img src="/assets/genel-buton.png" alt="Name Input" className="h-8 w-38" />
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    placeholder={`TAKIM ${team.id}`}
                    className="absolute inset-0 bg-transparent text-white font-bold text-center text-[11px] placeholder-white/70 outline-none"
                    maxLength={15}
                  />
                </div>

                {/* Character Selection Grid - 3 columns x 2 rows for 6 characters */}
                <div className="grid grid-cols-3 gap-x-16 gap-y-6 mb-3 flex-shrink-0">
                  {characters.map((character) => (
                    <div key={character.id} className="flex flex-col items-center gap-2">
                      <div className="w-[68px] h-[68px]">
                        <button
                          onClick={() => updateTeamCharacter(team.id, character)}
                          className={`relative w-full h-full rounded-full overflow-hidden transition-colors ${
                            team.character?.id === character.id
                              ? "outline outline-[3px] outline-yellow-400 outline-offset-2"
                              : "outline outline-[1.5px] outline-white/50 outline-offset-0 hover:outline-yellow-300 hover:outline-offset-1"
                          }`}
                          style={team.character?.id === character.id ? {
                            filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.5)) drop-shadow(0 0 12px rgba(250, 204, 21, 0.3))'
                          } : {}}
                          title={character.name}
                        >
                          <img
                            src={character.image || "/placeholder.svg"}
                            alt={character.name}
                            className="w-full h-full object-contain p-1"
                          />
                          {team.character?.id === character.id && (
                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full pointer-events-none"></div>
                          )}
                        </button>
                      </div>
                      {/* Her karakterin kendi ismi altında */}
                      <span className="text-yellow-300 font-semibold text-[11px] drop-shadow-lg text-center leading-tight">
                        {character.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          disabled={!canContinue}
          className={`relative group transition-all ${
            canContinue ? "hover:scale-105" : "opacity-50 cursor-not-allowed"
          }`}
        >
          <img src="/assets/genel-buton.png" alt="Continue" className="h-14 w-auto min-w-[180px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-base drop-shadow-lg">OYUNA BAŞLA</span>
          </div>
        </button>
      </div>
    </div>
  )
}
