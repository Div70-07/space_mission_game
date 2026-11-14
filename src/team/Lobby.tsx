import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Role, Mission } from '@/shared/types'
import { ROLES } from '@/shared/constants'
import { gameData } from '@/data'
import { useDesignStore } from '@/shared/designStore'
import { useTeamStore } from './teamStore'
import { createRoom, joinRoom, claimRole, releaseRole, isOnlineMode } from './rooms'
import { ROLE_INFO } from './roles'

export function Lobby() {
  const navigate = useNavigate()
  const { design } = useDesignStore()

  const roomCode = useTeamStore((s) => s.roomCode)
  const playerId = useTeamStore((s) => s.playerId)
  const playerName = useTeamStore((s) => s.playerName)
  const myRole = useTeamStore((s) => s.myRole)
  const players = useTeamStore((s) => s.players)
  const roomMaxPlayers = useTeamStore((s) => s.maxPlayers)
  const error = useTeamStore((s) => s.error)

  const setMode = useTeamStore((s) => s.setMode)
  const setPlayerName = useTeamStore((s) => s.setPlayerName)
  const setMyRole = useTeamStore((s) => s.setMyRole)
  const setRoomSession = useTeamStore((s) => s.setRoomSession)
  const setError = useTeamStore((s) => s.setError)
  const leaveSession = useTeamStore((s) => s.leaveSession)

  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState<number>(4)

  // Resolve currently active target flight mission
  const currentMission: Mission | undefined = useMemo(() => {
    return gameData.missions.find((m) => m.id === design.missionId)
  }, [design.missionId])

  // Handle Solo Mode
  const handlePlaySolo = () => {
    if (!currentMission) {
      setError('Please select a target flight mission from the catalog first.')
      return
    }
    setMode('solo')
    setMyRole(null)
    navigate('/build')
  }

  // Handle Create Online / Local Room
  const handleCreateRoom = async () => {
    if (!currentMission) {
      setError('Please select a target flight mission from the catalog before creating a team room.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await createRoom(playerName, design, maxPlayers)
      setMode(isOnlineMode ? 'online' : 'local')
      setRoomSession(
        res.code,
        res.playerId,
        {
          [res.playerId]: {
            id: res.playerId,
            name: playerName,
            role: null,
            joinedAt: Date.now(),
          },
        },
        maxPlayers
      )
    } catch (err: any) {
      setError(err?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  // Handle Join Room with Code
  const handleJoinRoom = async () => {
    if (!inputCode.trim()) {
      setError('Please enter a 4-letter room code')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await joinRoom(inputCode.trim().toUpperCase(), playerName)
      setMode(isOnlineMode ? 'online' : 'local')
      // Sync local design store with host's mission and spacecraft parameters
      if (res.roomState.design) {
        useDesignStore.getState().setDesign(res.roomState.design)
      }
      setRoomSession(
        inputCode.trim().toUpperCase(),
        res.playerId,
        res.roomState.players,
        res.roomState.maxPlayers || 4
      )
    } catch (err: any) {
      setError(err?.message || 'Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  // Handle Claiming Role
  const handleRoleSelect = async (role: Role) => {
    if (!roomCode || !playerId) return
    if (myRole === role) {
      await releaseRole(roomCode, playerId)
      setMyRole(null)
      return
    }
    const success = await claimRole(roomCode, playerId, role)
    if (success) {
      setMyRole(role)
    } else {
      setError(`Role "${ROLE_INFO[role].label}" is already taken by another specialist.`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 font-sans">
      {/* Backend Status Banner */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 px-4 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOnlineMode ? 'bg-emerald-400 animate-pulse' : 'bg-teal-400'
            }`}
          />
          <span className="text-slate-300">
            {isOnlineMode
              ? 'Multiplayer Engine: Online (Firebase Realtime Database)'
              : 'Multiplayer Engine: Local test mode (tabs in this browser via BroadcastChannel)'}
          </span>
        </div>
        <span className="text-slate-500 hidden sm:inline">NASA Space Apps 2026</span>
      </div>

      {/* Target Mission Baseline Banner */}
      {currentMission ? (
        <div className="bg-slate-900/90 border border-teal-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-inner">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/50">
                ACTIVE FLIGHT MISSION
              </span>
              <span className="text-[10px] text-slate-400">LEVEL {currentMission.level}</span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{currentMission.name}</h3>
            <p className="text-xs text-slate-400 max-w-xl truncate mt-0.5">{currentMission.goal}</p>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Budget Limit</span>
              <span className="text-sm font-bold text-teal-300">${currentMission.budget}M</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg border border-slate-700 transition-colors"
            >
              Change Mission
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl flex items-center justify-between text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠</span>
            <span>No flight mission selected. Please select a target mission profile to begin.</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            ← Select Mission Profile
          </button>
        </div>
      )}

      {/* Main Lobby View */}
      {!roomCode ? (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-slate-100">
              MISSION CONTROL CREW LOBBY
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Configure session mode before proceeding to the spacecraft assembly workstation.
            </p>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 px-4 py-3 rounded-lg text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          {/* Player Name Input */}
          <div className="max-w-md space-y-1.5">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Callsign / Specialist Name:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Commander Sarah"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-teal-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 1. Solo Mode */}
            <div className="border border-slate-800 hover:border-slate-700 bg-slate-900/50 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                  SINGLE PLAYER
                </span>
                <h2 className="text-lg font-bold font-mono text-slate-200 mt-2">
                  Solo Mission
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Design the complete spacecraft on your own with full authority over all subsystems.
                </p>
              </div>
              <button
                type="button"
                disabled={!currentMission}
                onClick={handlePlaySolo}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                Launch Solo Mission →
              </button>
            </div>

            {/* 2. Create Room */}
            <div className="border border-teal-900/50 hover:border-teal-700 bg-slate-900/50 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  HOST CREW
                </span>
                <h2 className="text-lg font-bold font-mono text-slate-200 mt-2">
                  Create Team Room
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Host an online session for {currentMission ? `"${currentMission.name}"` : 'your mission'}.
                </p>

                {/* Capacity Selector: 2, 3, or 4 players */}
                <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Max Player Capacity:
                  </span>
                  <div className="flex gap-2">
                    {[2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMaxPlayers(num)}
                        className={`flex-1 py-1 text-xs font-mono rounded border transition-all cursor-pointer ${
                          maxPlayers === num
                            ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {num} Crew
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={loading || !currentMission}
                onClick={handleCreateRoom}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Generating Code...' : 'Create Room Code →'}
              </button>
            </div>

            {/* 3. Join Room */}
            <div className="border border-slate-800 hover:border-slate-700 bg-slate-900/50 p-5 rounded-xl space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  JOIN CREW
                </span>
                <h2 className="text-lg font-bold font-mono text-slate-200 mt-2">
                  Join Team Room
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter an existing 4-letter room code to collaborate with your team over the internet.
                </p>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={4}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="4-LETTER CODE"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-sm font-mono tracking-widest uppercase text-teal-300 focus:outline-none focus:border-teal-400"
                />
                <button
                  type="button"
                  disabled={loading || inputCode.trim().length !== 4}
                  onClick={handleJoinRoom}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Join Crew Room →'}
                </button>
              </div>
            </div>
          </div>

          {/* Pass-the-laptop link */}
          <div className="text-center pt-2">
            <button
              type="button"
              disabled={!currentMission}
              onClick={() => {
                setMode('local')
                useTeamStore.getState().cycleLocalRole()
                navigate('/build')
              }}
              className="text-xs font-mono text-slate-400 hover:text-teal-400 underline cursor-pointer disabled:opacity-50"
            >
              Single device? Switch to Local Pass-the-Laptop Mode →
            </button>
          </div>
        </div>
      ) : (
        /* Inside Active Room Lobby */
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Room Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-teal-400 bg-teal-950/60 px-2 py-0.5 rounded border border-teal-800/40">
                ACTIVE FLIGHT SQUADRON
              </span>
              <h1 className="text-2xl font-bold font-mono text-slate-100 mt-1">
                CREW BRIEFING ROOM
              </h1>
              {currentMission && (
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Mission Target: <strong>{currentMission.name}</strong> (${currentMission.budget}M Budget)
                </p>
              )}
            </div>

            <div className="bg-slate-900 border border-teal-500/40 px-5 py-2.5 rounded-xl flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">ROOM CODE:</span>
              <span className="text-2xl font-mono font-bold tracking-widest text-teal-300">
                {roomCode}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 px-4 py-2.5 rounded-lg text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          {/* Occupied and Available Player Slots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="uppercase text-slate-400">
                Connected Crew ({Object.keys(players).length}/{roomMaxPlayers} Filled):
              </span>
              <span className="text-slate-500 text-[11px]">
                {Object.keys(players).length >= roomMaxPlayers
                  ? 'Squadron Full'
                  : `${roomMaxPlayers - Object.keys(players).length} Open Slot(s)`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
              {Array.from({ length: roomMaxPlayers }).map((_, idx) => {
                const playerList = Object.values(players)
                const player = playerList[idx]
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      player
                        ? 'bg-slate-900/90 border-teal-900/60 text-slate-200'
                        : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-400 uppercase">Slot #{idx + 1}</span>
                      {player && <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />}
                    </div>
                    <div className="font-semibold truncate">
                      {player ? player.name : 'Open Seat'}
                    </div>
                    <div className="text-[10px] mt-1 text-teal-300/80 uppercase">
                      {player ? (player.role ? player.role : 'Choosing role...') : 'Awaiting crewmate'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Specialist Role Claim Section */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-mono uppercase tracking-wider text-slate-300">
              Claim Your Subsystem Specialty:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {ROLES.map((role) => {
                const info = ROLE_INFO[role]
                const claimedByPlayer = Object.values(players).find((p) => p.role === role)
                const isClaimedByMe = myRole === role
                const isClaimedByOther = claimedByPlayer && claimedByPlayer.id !== playerId

                return (
                  <button
                    key={role}
                    type="button"
                    disabled={Boolean(isClaimedByOther)}
                    onClick={() => handleRoleSelect(role)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isClaimedByMe
                        ? 'border-teal-400 bg-teal-950/40 shadow-md shadow-teal-950/50'
                        : isClaimedByOther
                        ? 'border-slate-800/50 bg-slate-900/30 opacity-60 cursor-not-allowed'
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-slate-100">
                          {info.label}
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 bg-teal-950/80 px-1.5 py-0.5 rounded border border-teal-800/40">
                          {info.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-teal-300/80 font-mono mb-2">
                        {info.subtitle}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {info.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">
                        Controls: {info.sections.slice(1).join(', ')}
                      </span>
                      {isClaimedByMe ? (
                        <span className="text-teal-400 font-bold">✓ ASSIGNED TO YOU</span>
                      ) : isClaimedByOther ? (
                        <span className="text-amber-400">
                          Claimed by {claimedByPlayer?.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 hover:text-teal-300">
                          [Click to Claim]
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={leaveSession}
              className="text-xs font-mono text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              ← Leave Room
            </button>

            <button
              type="button"
              disabled={!myRole}
              onClick={() => navigate('/build')}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-mono font-bold text-xs px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-teal-950/50 disabled:opacity-50 cursor-pointer"
            >
              Continue to Spacecraft Builder →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
