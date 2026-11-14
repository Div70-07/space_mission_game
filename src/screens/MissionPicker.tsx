// Owner: B. Mission selection dashboard screen.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Mission } from '@/shared/types'
import { gameData } from '@/data'
import { useDesignStore } from '@/shared/designStore'

export function MissionPicker() {
  const navigate = useNavigate()
  const { design, patchDesign, resetApprovals } = useDesignStore()
  const [selectedId, setSelectedId] = useState<string>(design.missionId || '')

  const missions: Mission[] = gameData.missions ?? []

  const handleSelectMission = (mission: Mission) => {
    setSelectedId(mission.id)
    patchDesign({
      missionId: mission.id,
      lifetimeMonths: mission.lifetimeMonths,
      orbitId: '', // Reset target orbit when switching mission
    })
    resetApprovals()
  }

  const handleConfirmAndProceed = () => {
    if (!selectedId) return
    navigate('/build')
  }

  const getDifficultyBadge = (level: Mission['level']) => {
    switch (level) {
      case 1:
        return {
          label: 'Level 1 // Earth-Moon',
          color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
        }
      case 2:
        return {
          label: 'Level 2 // Inner Planets',
          color: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
        }
      case 3:
        return {
          label: 'Level 3 // Deep Space',
          color: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
        }
      default:
        return {
          label: `Level ${level}`,
          color: 'bg-slate-800 text-slate-300 border-slate-700',
        }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header & Context */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-teal-400 uppercase">
              FLIGHT OPERATIONS // PHASE 01
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-mono">
            SELECT YOUR MISSION
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Establish your primary science objectives, operational flight constraints, and capital budget.
            All downstream engineering tradeoffs will evaluate against this flight baseline.
          </p>
        </div>

        {selectedId && (
          <button
            type="button"
            onClick={handleConfirmAndProceed}
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-lg shadow-teal-950/50 transition-all duration-150 cursor-pointer font-mono text-sm self-start md:self-auto"
          >
            <span>Proceed to Spacecraft Builder</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Mission Grid */}
      {missions.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-slate-400 font-mono text-sm">
            NO MISSIONS CURRENTLY LOGGED IN MISSION ARCHIVES.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => {
            const isSelected = selectedId === mission.id
            const diff = getDifficultyBadge(mission.level)

            // Resolve target orbits names from gameData.orbits
            const availableOrbits = (mission.orbitIds || [])
              .map((id) => gameData.orbits?.find((o) => o.id === id)?.name || id)

            return (
              <div
                key={mission.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => handleSelectMission(mission)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleSelectMission(mission)
                  }
                }}
                className={`relative rounded-xl p-6 transition-all duration-200 cursor-pointer border flex flex-col justify-between
                  ${isSelected
                    ? 'bg-slate-900/90 border-teal-400 shadow-xl shadow-teal-950/60 ring-1 ring-teal-400/50'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                  }
                `}
              >
                <div>
                  {/* Top Row: Difficulty & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${diff.color}`}>
                      {diff.label}
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-mono text-teal-300 font-semibold">
                        <svg className="w-4 h-4 text-teal-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                        </svg>
                        SELECTED
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">READY</span>
                    )}
                  </div>

                  {/* Mission Title */}
                  <h2 className="text-xl font-bold text-slate-100 mb-2 font-mono tracking-tight">
                    {mission.name}
                  </h2>

                  {/* Objective Description */}
                  <p className="text-xs text-slate-300 leading-relaxed mb-6">
                    {mission.goal}
                  </p>

                  {/* Flight Parameters Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-4">
                    {/* Budget */}
                    <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                      <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Budget Limit</span>
                      <span className="text-sm font-bold text-teal-300">${mission.budget}M</span>
                    </div>

                    {/* Lifetime */}
                    <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80">
                      <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Duration</span>
                      <span className="text-sm font-bold text-slate-200">{mission.lifetimeMonths} mo</span>
                    </div>

                    {/* Minimum Science */}
                    <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800/80 col-span-2 flex items-center justify-between">
                      <span className="text-[10px] uppercase text-purple-300">Min Science Yield</span>
                      <span className="text-sm font-bold text-purple-300">{mission.minScience} pts</span>
                    </div>
                  </div>

                  {/* Available Target Orbits */}
                  {availableOrbits.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono block mb-1.5">
                        Target Orbit Trajectories:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {availableOrbits.map((orbitName) => (
                          <span
                            key={orbitName}
                            className="text-[10px] font-mono bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {orbitName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono">
                    {isSelected ? 'Configuration Active' : 'Click to select'}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium px-3 py-1 rounded transition-colors
                      ${isSelected
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }
                    `}
                  >
                    {isSelected ? 'Active' : 'Choose'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bottom Floating Bar when a mission is chosen */}
      {selectedId && (
        <div className="bg-slate-950/95 border border-teal-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-mono text-sm font-bold">
              ✓
            </div>
            <div>
              <span className="text-xs font-mono text-teal-400 block uppercase tracking-wider">Mission Locked</span>
              <span className="text-sm font-semibold text-slate-100 font-mono">
                {missions.find((m) => m.id === selectedId)?.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmAndProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 py-2.5 rounded-lg shadow-md transition-all font-mono text-sm cursor-pointer"
          >
            <span>Proceed to Spacecraft Builder</span>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
