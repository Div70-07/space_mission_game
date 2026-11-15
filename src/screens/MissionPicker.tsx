// Owner: B. Mission selection and mission control home screen.
// PROJECT DEEPSKY: Cinematic Space Mission Control Homepage (Refinement V2)
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Mission } from '@/shared/types'
import { gameData } from '@/data'
import { useDesignStore } from '@/shared/designStore'

export function MissionPicker() {
  const navigate = useNavigate()
  const { design, patchDesign, resetApprovals } = useDesignStore()

  const missions: Mission[] = gameData.missions ?? []

  // Default to stored design missionId, or the first available mission
  const [selectedId, setSelectedId] = useState<string>(() => {
    if (design.missionId && missions.some((m) => m.id === design.missionId)) {
      return design.missionId
    }
    return missions[0]?.id || ''
  })

  // Selected mission object
  const activeMission = useMemo(() => {
    return missions.find((m) => m.id === selectedId) || missions[0]
  }, [missions, selectedId])

  // Resolve currently configured components from gameData
  const selectedOrbit = useMemo(() => {
    return gameData.orbits?.find((o) => o.id === design.orbitId)
  }, [design.orbitId])

  const selectedRocket = useMemo(() => {
    return gameData.rockets?.find((r) => r.id === design.rocketId)
  }, [design.rocketId])

  const selectedPower = useMemo(() => {
    return gameData.parts?.find((p) => p.id === design.powerSystemId)
  }, [design.powerSystemId])

  const selectedAntenna = useMemo(() => {
    return gameData.parts?.find((p) => p.id === design.antennaId)
  }, [design.antennaId])

  const handleSelectMission = (mission: Mission) => {
    setSelectedId(mission.id)
    patchDesign({
      missionId: mission.id,
      lifetimeMonths: mission.lifetimeMonths,
      orbitId: '', // Reset target orbit when switching mission
    })
    resetApprovals()
  }

  const handleStartMission = () => {
    if (activeMission) {
      navigate('/lobby')
    } else {
      const manifestEl = document.getElementById('manifest-section')
      manifestEl?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Difficulty badge configuration
  const getDifficultyBadge = (level: Mission['level']) => {
    switch (level) {
      case 1:
        return {
          label: 'CLASS-A',
          sub: 'Earth-Moon Baseline',
          badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
        }
      case 2:
        return {
          label: 'CLASS-B',
          sub: 'Lunar Exploration',
          badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-800/60',
        }
      case 3:
        return {
          label: 'CLASS-C',
          sub: 'Interplanetary Deep Space',
          badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
        }
      default:
        return {
          label: `LVL ${level}`,
          sub: 'Expedition',
          badgeClass: 'bg-slate-900 text-slate-300 border-slate-800',
        }
    }
  }

  const diff = activeMission ? getDifficultyBadge(activeMission.level) : getDifficultyBadge(1)

  return (
    <div className="max-w-[1440px] mx-auto space-y-10 pb-20 font-sans text-slate-100">
      {/* ========================================================================= */}
      {/* 1. CINEMATIC HERO SECTION                                                 */}
      {/* ========================================================================= */}
      <section className="relative rounded-2xl overflow-hidden min-h-[520px] md:min-h-[580px] flex items-center shadow-2xl bg-[#030611]">
        {/* Background Artwork: 60-70% visual area showcasing astronaut, Earth, and rocket launchpad */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/images/mission-control-hero.jpg"
            alt="Spacecraft observation deck overlooking Earth and rocket launchpad"
            className="w-full h-full object-cover object-right md:object-center"
          />
          {/* Subtle directional gradient to ensure high typography contrast on the left */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030611] via-[#030611]/85 to-transparent md:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030611] via-transparent to-black/30" />
        </div>

        {/* Hero Content Grid: Left Title & Actions (45%), Right Compact Mission Summary (40%) */}
        <div className="relative z-10 w-full p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Powerful Title, Description & Direct Actions */}
          <div className="lg:col-span-7 space-y-6 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-[#334155] text-xs font-sans font-medium text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>NASA Space Apps · Flight Operations</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight text-white leading-tight">
                COSMO<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-blue-200">CRAFT</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-xl">
                Design, build, and simulate NASA space exploration missions within real physical and fiscal constraints. Assemble custom satellites, plan orbital insertions, and execute spaceflights.
              </p>
            </div>

            {/* Clear Primary & Secondary Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={handleStartMission}
                className="px-6 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold font-sans text-sm tracking-normal transition-all duration-150 shadow-none flex items-center gap-2 cursor-pointer border border-blue-500"
              >
                <span>Start Mission</span>
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => navigate('/tutorial')}
                className="px-6 py-3.5 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 active:scale-[0.99] backdrop-blur-md text-slate-200 border border-slate-700/70 hover:border-slate-500 font-semibold font-sans text-sm tracking-normal transition-all duration-150 flex items-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
                <span>Tutorial Academy</span>
              </button>
            </div>
          </div>

          {/* Right Column: Compact Visual Mission Summary (No long database tables) */}
          <div className="lg:col-span-5">
            <div className="bg-slate-950/80 backdrop-blur-xl p-5 sm:p-6 rounded-xl border border-slate-800/80 shadow-2xl space-y-4 max-w-md ml-auto">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">Active Mission Profile</span>
                  <div className="text-base font-bold font-mono text-slate-100 truncate max-w-[200px]" title={activeMission?.name}>
                    {activeMission?.name || 'Select a Mission'}
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${diff.badgeClass}`}>
                  {diff.label}
                </span>
              </div>

              {/* Compact 2x2 Metric Tiles */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase font-sans">Budget Cap</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">
                    ${activeMission ? activeMission.budget : 0}M USD
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase">Target Orbit</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5" title={selectedOrbit?.name}>
                    {selectedOrbit?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase">Launch Vehicle</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block mt-0.5" title={selectedRocket?.name}>
                    {selectedRocket?.name || 'Unassigned'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50">
                  <span className="text-[10px] text-slate-400 block uppercase">Crew Approvals</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {design.approvedBy.length}/4 Roles
                  </span>
                </div>
              </div>

              {/* Subsystems Mounted Pill */}
              <div className="pt-1 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Subsystems:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[210px]">
                  {design.instrumentIds.length} Sensors · {selectedPower ? 'Power OK' : 'No Power'} · {selectedAntenna ? 'Comms OK' : 'No Comms'}
                </span>
              </div>

              {/* Quick Builder Shortcut */}
              <button
                type="button"
                onClick={() => navigate('/build')}
                className="w-full py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-800 hover:border-slate-700 text-xs font-sans font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Configure Spacecraft in Builder</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MISSION MANIFEST — REALISTIC PLANETARY DESTINATIONS                    */}
      {/* ========================================================================= */}
      <section id="manifest-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-sans uppercase tracking-normal text-blue-400 font-semibold mb-1">
              EXPEDITION MANIFEST
            </div>
            <h2 className="text-2xl font-bold font-sans tracking-tight text-white">
              Select Exploration Target
            </h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md font-sans leading-relaxed">
            Choose a NASA flight charter to initialize vehicle staging requirements, capital limits, and orbital mission constraints.
          </p>
        </div>

        {/* 3 Destination Cards Grid with Realistic Planetary Imagery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {missions.map((mission) => {
            const isSelected = activeMission?.id === mission.id
            const isMars = mission.id.includes('mars')
            const isMoon = mission.id.includes('moon')
            const missionDiff = getDifficultyBadge(mission.level)

            // Realistic orbital destination imagery
            const imageSrc = isMars
              ? '/images/mars_planet_view.jpg'
              : isMoon
                ? '/images/moon_planet_view.jpg'
                : '/images/earth_planet_view.jpg'

            const destLabel = isMars ? 'Mars · Sol-IV' : isMoon ? 'Moon · Luna-I' : 'Earth · Sol-III'

            return (
              <div
                key={mission.id}
                onClick={() => handleSelectMission(mission)}
                className={`rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-pointer text-left relative group
                  ${isSelected
                    ? 'bg-[#1E293B] border-2 border-blue-400 shadow-none'
                    : 'bg-[#1E293B] border border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60'
                  }
                `}
              >
                {/* Planetary Image Header */}
                <div className="h-48 w-full relative overflow-hidden bg-slate-950">
                  <img
                    src={imageSrc}
                    alt={mission.name}
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/30 to-black/30" />

                  {/* Destination Tag & Difficulty Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs font-sans px-2.5 py-1 rounded-md font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10 uppercase">
                      {destLabel}
                    </span>
                    <span className={`text-xs font-sans font-semibold px-2 py-0.5 rounded border ${missionDiff.badgeClass}`}>
                      {missionDiff.label}
                    </span>
                  </div>

                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded bg-blue-600 text-white uppercase shadow-none">
                        Active Profile
                      </span>
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className={`text-lg font-bold font-sans leading-tight mb-2 ${isSelected ? 'text-blue-300' : 'text-slate-100'}`}>
                      {mission.name}
                    </h3>
                    <p className="text-sm text-slate-300 font-sans leading-relaxed line-clamp-3">
                      {mission.goal}
                    </p>
                  </div>

                  {/* Mission Constraint Metrics */}
                  <div className="space-y-2 pt-3 border-t border-[#334155] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Budget Limit:</span>
                      <span className="font-bold text-blue-400 font-mono">
                        ${mission.budget}M USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Operational Life:</span>
                      <span className="text-slate-200 font-mono">{mission.lifetimeMonths} Months</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Min Science Yield:</span>
                      <span className="text-purple-300 font-semibold font-mono">≥ {mission.minScience} pts</span>
                    </div>
                  </div>

                  {/* Card Action Trigger */}
                  <div className="pt-2">
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate('/lobby')
                        }}
                        className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold font-sans text-sm tracking-normal transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-none border border-blue-500"
                      >
                        <span>Profile Selected · Proceed to Lobby</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSelectMission(mission)}
                        className="w-full py-2.5 px-3 rounded-lg bg-[#273449] hover:bg-[#334155] text-slate-200 hover:text-white border border-[#334155] text-sm font-sans font-semibold transition-colors text-center cursor-pointer"
                      >
                        Select Mission Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FLIGHT WORKSTATION QUICK ACCESS                                        */}
      {/* ========================================================================= */}
      <section className="space-y-4 pt-2">
        <div className="border-b border-[#334155] pb-2">
          <span className="text-xs font-sans uppercase tracking-normal text-slate-400 font-semibold">
            ENGINEERING WORKSTATIONS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Build Spacecraft */}
          <div
            onClick={() => navigate('/build')}
            className="p-5 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#273449] group-hover:bg-blue-950/40 text-blue-400 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                Build Spacecraft
              </h4>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Configure science payloads, solar array wings, and high-gain antennas on the central satellite bus.
              </p>
            </div>
            <div className="pt-3 text-sm font-sans text-blue-400 flex items-center gap-1 font-semibold">
              <span>Enter Builder</span>
              <span>→</span>
            </div>
          </div>

          {/* 2. Plan Orbit & Rocket */}
          <div
            onClick={() => navigate('/orbit-rocket')}
            className="p-5 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#273449] group-hover:bg-blue-950/40 text-blue-400 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </div>
              <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                Plan Orbit & Rocket
              </h4>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Select launch vehicles, balance staging delta-V, and confirm Flight Readiness Review.
              </p>
            </div>
            <div className="pt-3 text-sm font-sans text-blue-400 flex items-center gap-1 font-semibold">
              <span>Plan Trajectory</span>
              <span>→</span>
            </div>
          </div>

          {/* 3. Mission Reports */}
          <div
            onClick={() => navigate('/report')}
            className="p-5 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#273449] group-hover:bg-blue-950/40 text-blue-400 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4 4a1 1 0 10-2 0v2a1 1 0 102 0v-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                Mission Reports
              </h4>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Review flight debrief telemetry, anomaly event logs, and final scientific performance scores.
              </p>
            </div>
            <div className="pt-3 text-sm font-sans text-blue-400 flex items-center gap-1 font-semibold">
              <span>View Debriefs</span>
              <span>→</span>
            </div>
          </div>

          {/* 4. Tutorial Academy */}
          <div
            onClick={() => navigate('/tutorial')}
            className="p-5 rounded-xl bg-[#1E293B] border border-[#334155] hover:border-[#475569] hover:bg-[#273449]/60 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-[#273449] group-hover:bg-blue-950/40 text-blue-400 flex items-center justify-center mb-3 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h4 className="text-base font-bold font-sans text-slate-100 group-hover:text-blue-300 transition-colors mb-1">
                Tutorial Academy
              </h4>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Step-by-step aerospace flight director academy covering budget, delta-V, and comms.
              </p>
            </div>
            <div className="pt-3 text-sm font-sans text-blue-400 flex items-center gap-1 font-semibold">
              <span>Enter Academy</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
