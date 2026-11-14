import { create } from 'zustand'
import type { Role } from '@/shared/types'
import type { Player, RoomState } from './types'

export type TeamMode = 'solo' | 'online' | 'local'

interface TeamStore {
  mode: TeamMode
  roomCode: string | null
  playerId: string | null
  playerName: string
  myRole: Role | null
  players: Record<string, Player>
  roomStatus: RoomState['status']
  maxPlayers: number
  connected: boolean
  error: string | null

  // Actions
  setMode: (mode: TeamMode) => void
  setPlayerName: (name: string) => void
  setMyRole: (role: Role | null) => void
  setRoomSession: (code: string, playerId: string, players: Record<string, Player>, maxPlayers?: number) => void
  syncRoomState: (state: RoomState) => void
  setError: (error: string | null) => void
  leaveSession: () => void
  cycleLocalRole: () => Role
}

const LOCAL_ROLES: Role[] = ['planner', 'engineer', 'science', 'comms']
const SESSION_KEY = 'space_mission_team_session'

interface StoredSession {
  mode: TeamMode
  roomCode: string | null
  playerId: string | null
  playerName: string
  myRole: Role | null
}

function loadSession(): Partial<StoredSession> {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) return JSON.parse(raw)
    }
  } catch {
    // Ignore storage parse errors
  }
  return {}
}

function saveSession(data: Partial<StoredSession>) {
  try {
    if (typeof sessionStorage !== 'undefined') {
      const current = loadSession()
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...current, ...data }))
    }
  } catch {
    // Ignore storage quota/security errors
  }
}

function clearSession() {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY)
    }
  } catch {
    // Ignore
  }
}

const initialSession = loadSession()

export const useTeamStore = create<TeamStore>((set, get) => ({
  mode: initialSession.mode ?? 'solo',
  roomCode: initialSession.roomCode ?? null,
  playerId: initialSession.playerId ?? null,
  playerName: initialSession.playerName ?? 'Engineer 1',
  myRole: initialSession.myRole ?? null,
  players: {},
  roomStatus: 'lobby',
  maxPlayers: 4,
  connected: Boolean(initialSession.roomCode),
  error: null,

  setMode: (mode) => {
    set({ mode })
    saveSession({ mode })
  },
  setPlayerName: (name) => {
    set({ playerName: name })
    saveSession({ playerName: name })
  },
  setMyRole: (role) => {
    set({ myRole: role })
    saveSession({ myRole: role })
  },

  setRoomSession: (code, playerId, players, maxPlayers = 4) => {
    set({
      roomCode: code,
      playerId,
      players,
      maxPlayers,
      connected: true,
      error: null,
    })
    saveSession({ roomCode: code, playerId, mode: get().mode })
  },

  syncRoomState: (state) => {
    const currentPid = get().playerId

    // If authoritative roleClaims registry exists in state, compute synchronized players
    let resolvedPlayers = state.players
    if (state.roleClaims) {
      const claims = state.roleClaims
      resolvedPlayers = { ...state.players }
      // Invert claims map: uid -> role
      const uidToRole: Record<string, Role> = {}
      for (const [r, uid] of Object.entries(claims)) {
        if (uid) uidToRole[uid] = r as Role
      }
      for (const [pid, player] of Object.entries(resolvedPlayers)) {
        const claimRole = uidToRole[pid] ?? null
        if (player.role !== claimRole) {
          resolvedPlayers[pid] = { ...player, role: claimRole }
        }
      }
    }

    const myPlayer = currentPid ? resolvedPlayers[currentPid] : null
    const updatedRole = myPlayer ? myPlayer.role : get().myRole
    set({
      roomCode: state.code,
      players: resolvedPlayers,
      roomStatus: state.status,
      maxPlayers: state.maxPlayers || 4,
      connected: true,
      myRole: updatedRole,
    })
    saveSession({ roomCode: state.code, myRole: updatedRole })
  },

  setError: (error) => set({ error }),

  leaveSession: () => {
    clearSession()
    set({
      mode: 'solo',
      roomCode: null,
      playerId: null,
      myRole: null,
      players: {},
      roomStatus: 'lobby',
      maxPlayers: 4,
      connected: false,
      error: null,
    })
  },

  cycleLocalRole: () => {
    const current = get().myRole
    const nextIdx = current ? (LOCAL_ROLES.indexOf(current) + 1) % LOCAL_ROLES.length : 0
    const nextRole = LOCAL_ROLES[nextIdx]
    set({ myRole: nextRole, mode: 'local' })
    saveSession({ myRole: nextRole, mode: 'local' })
    return nextRole
  },
}))
