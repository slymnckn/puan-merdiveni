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
            <span className="text-amber-900 font-bold text-base drop-shadow-sm">TAKIM & KARAKTER SEÇİMİ</span>
          </div>
        </div>

        {/* Team Selection Panels */}
        <div className="flex gap-6 mb-6 max-w-6xl">
          {localTeams.map((team) => (
            <div key={team.id} className="relative flex-1">
              <img src="/assets/soru-arkasi.png" alt={`Team ${team.id} Panel`} className="w-full h-auto" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8" style={{ paddingTop: '90px', paddingBottom: '40px' }}>
                {/* Team Name Input */}
                <div className="relative mb-2">
                  <img src="/assets/genel-buton.png" alt="Name Input" className="h-10 w-44" />
                  <input
                    type="text"
                    value={team.name}
                    onChange={(e) => updateTeamName(team.id, e.target.value)}
                    placeholder={`TAKIM ${team.id}`}
                    className="absolute inset-0 bg-transparent text-white font-bold text-center text-xs placeholder-white/70 outline-none"
                    maxLength={15}
                  />
                </div>

                {/* Character Selection Grid - 3 columns x 2 rows for 6 characters */}
                <div className="grid grid-cols-3 gap-x-20 gap-y-4 justify-items-center mb-8">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => updateTeamCharacter(team.id, character)}
                      className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${
                        team.character?.id === character.id
                          ? "border-yellow-400 ring-2 ring-yellow-300 scale-105"
                          : "border-white/50 hover:border-yellow-300"
                      }`}
                      title={character.name}
                    >
                      <img
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                      {team.character?.id === character.id && <div className="absolute inset-0 bg-yellow-400/20"></div>}
                    </button>
                  ))}
                </div>

                {/* Selected Character Name */}
                <div className="h-6 flex items-center justify-center">
                  {team.character && (
                    <span className="text-yellow-300 font-semibold text-xs drop-shadow-lg text-center px-2">
                      {team.character.name}
                    </span>
                  )}
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
