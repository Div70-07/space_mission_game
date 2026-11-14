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
  connected: boolean
  error: string | null

  // Actions
  setMode: (mode: TeamMode) => void
  setPlayerName: (name: string) => void
  setMyRole: (role: Role | null) => void
  setRoomSession: (code: string, playerId: string, players: Record<string, Player>) => void
  syncRoomState: (state: RoomState) => void
  setError: (error: string | null) => void
  leaveSession: () => void
  cycleLocalRole: () => Role
}

const LOCAL_ROLES: Role[] = ['planner', 'engineer', 'science', 'comms']

export const useTeamStore = create<TeamStore>((set, get) => ({
  mode: 'solo',
  roomCode: null,
  playerId: null,
  playerName: 'Engineer 1',
  myRole: null,
  players: {},
  roomStatus: 'lobby',
  connected: false,
  error: null,

  setMode: (mode) => set({ mode }),
  setPlayerName: (name) => set({ playerName: name }),
  setMyRole: (role) => set({ myRole: role }),

  setRoomSession: (code, playerId, players) =>
    set({
      roomCode: code,
      playerId,
      players,
      connected: true,
      error: null,
    }),

  syncRoomState: (state) => {
    const currentPid = get().playerId
    const myPlayer = currentPid ? state.players[currentPid] : null
    set({
      roomCode: state.code,
      players: state.players,
      roomStatus: state.status,
      connected: true,
      myRole: myPlayer ? myPlayer.role : get().myRole,
    })
  },

  setError: (error) => set({ error }),

  leaveSession: () =>
    set({
      mode: 'solo',
      roomCode: null,
      playerId: null,
      myRole: null,
      players: {},
      roomStatus: 'lobby',
      connected: false,
      error: null,
    }),

  cycleLocalRole: () => {
    const current = get().myRole
    const nextIdx = current ? (LOCAL_ROLES.indexOf(current) + 1) % LOCAL_ROLES.length : 0
    const nextRole = LOCAL_ROLES[nextIdx]
    set({ myRole: nextRole, mode: 'local' })
    return nextRole
  },
}))
