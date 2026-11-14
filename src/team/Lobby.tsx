import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Role } from '@/shared/types'
import { ROLES } from '@/shared/constants'
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
  const error = useTeamStore((s) => s.error)

  const setMode = useTeamStore((s) => s.setMode)
  const setPlayerName = useTeamStore((s) => s.setPlayerName)
  const setMyRole = useTeamStore((s) => s.setMyRole)
  const setRoomSession = useTeamStore((s) => s.setRoomSession)
  const setError = useTeamStore((s) => s.setError)
  const leaveSession = useTeamStore((s) => s.leaveSession)

  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)

  // Handle Solo Mode
  const handlePlaySolo = () => {
    setMode('solo')
    setMyRole(null)
    navigate('/build')
  }

  // Handle Create Online / Local Room
  const handleCreateRoom = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await createRoom(playerName, design)
      setMode(isOnlineMode ? 'online' : 'local')
      setRoomSession(res.code, res.playerId, {
        [res.playerId]: {
          id: res.playerId,
          name: playerName,
          role: null,
          joinedAt: Date.now(),
        },
      })
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
      setRoomSession(inputCode.trim().toUpperCase(), res.playerId, res.roomState.players)
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

      {/* Main Lobby View */}
      {!roomCode ? (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold font-mono tracking-tight text-slate-100">
              MISSION CONTROL CREW LOBBY
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Assemble a 4-person specialist team to co-design the spacecraft in real-time.
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
                  Solo Architect
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Design the complete mission on your own with full authority over all subsystems.
                </p>
              </div>
              <button
                type="button"
                onClick={handlePlaySolo}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                Launch Solo Architect →
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
                  Generate a 4-letter mission room code and invite up to 3 crewmates to join.
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
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
                  Join with Code
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter an existing 4-letter room code shared by your mission commander.
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
              onClick={() => {
                setMode('local')
                useTeamStore.getState().cycleLocalRole()
                navigate('/build')
              }}
              className="text-xs font-mono text-slate-400 hover:text-teal-400 underline cursor-pointer"
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

          {/* Specialist Role Claim Section */}
          <div className="space-y-3">
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

          {/* Crew Members List */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-mono uppercase text-slate-400">
              Connected Crew ({Object.keys(players).length}/4):
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(players).map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span className="text-slate-200">{p.name}</span>
                  {p.role && (
                    <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 py-0.2 rounded border border-teal-800/60 uppercase">
                      {p.role}
                    </span>
                  )}
                  {p.id === playerId && (
                    <span className="text-[10px] text-slate-500">(You)</span>
                  )}
                </div>
              ))}
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
              Enter Spacecraft Workstation →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
