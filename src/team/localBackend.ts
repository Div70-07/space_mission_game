import type { Role, Design } from '@/shared/types'
import type { RoomBackend, RoomState, Player } from './types'

// Memory cache fallback for environments without localStorage
const memoryStore = new Map<string, RoomState>()

function getStoredRoom(code: string): RoomState | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(`space_room_${code}`)
      return data ? JSON.parse(data) : null
    }
  } catch {
    // Ignore local storage error
  }
  return memoryStore.get(code) || null
}

function saveStoredRoom(state: RoomState): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`space_room_${state.code}`, JSON.stringify(state))
    }
  } catch {
    // Ignore
  }
  memoryStore.set(state.code, state)
}

export class LocalBackend implements RoomBackend {
  private channel: BroadcastChannel | null = null
  private subscribers = new Map<string, Set<(state: RoomState) => void>>()

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('space_mission_local_sync')
        this.channel.onmessage = (event) => {
          const { type, roomState } = event.data || {}
          if (type === 'ROOM_UPDATE' && roomState && roomState.code) {
            saveStoredRoom(roomState)
            const subs = this.subscribers.get(roomState.code)
            if (subs) {
              subs.forEach((cb) => cb(roomState))
            }
          }
        }
      } catch {
        this.channel = null
      }
    }
  }

  private broadcast(state: RoomState) {
    saveStoredRoom(state)
    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'ROOM_UPDATE', roomState: state })
      } catch {
        // Broadcast failed
      }
    }
    const subs = this.subscribers.get(state.code)
    if (subs) {
      subs.forEach((cb) => cb(state))
    }
  }

  async createRoom(hostName: string, initialDesign: Design): Promise<{ code: string; playerId: string }> {
    const code = generateRoomCode()
    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`

    const player: Player = {
      id: playerId,
      name: hostName || 'Commander',
      role: null,
      joinedAt: Date.now(),
    }

    const state: RoomState = {
      code,
      design: initialDesign,
      players: { [playerId]: player },
      status: 'lobby',
    }

    this.broadcast(state)
    return { code, playerId }
  }

  async joinRoom(code: string, playerName: string): Promise<{ playerId: string; roomState: RoomState }> {
    const cleanCode = code.trim().toUpperCase()
    const room = getStoredRoom(cleanCode)

    if (!room) {
      throw new Error(`Room "${cleanCode}" not found. Please verify the 4-letter code.`)
    }

    const playersList = Object.values(room.players)
    if (playersList.length >= 4) {
      throw new Error(`Room "${cleanCode}" is full (maximum 4 crew specialists).`)
    }

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`
    const player: Player = {
      id: playerId,
      name: playerName || `Specialist ${playersList.length + 1}`,
      role: null,
      joinedAt: Date.now(),
    }

    room.players[playerId] = player
    this.broadcast(room)
    return { playerId, roomState: room }
  }

  async claimRole(code: string, playerId: string, role: Role): Promise<boolean> {
    const room = getStoredRoom(code)
    if (!room || !room.players[playerId]) return false

    // Check if role is already claimed by another player
    const existing = Object.values(room.players).find((p) => p.role === role && p.id !== playerId)
    if (existing) {
      return false
    }

    room.players[playerId].role = role
    this.broadcast(room)
    return true
  }

  async releaseRole(code: string, playerId: string): Promise<boolean> {
    const room = getStoredRoom(code)
    if (!room || !room.players[playerId]) return false

    room.players[playerId].role = null
    this.broadcast(room)
    return true
  }

  async leaveRoom(code: string, playerId: string): Promise<void> {
    const room = getStoredRoom(code)
    if (!room) return

    delete room.players[playerId]
    this.broadcast(room)
  }

  subscribe(code: string, callback: (state: RoomState) => void): () => void {
    if (!this.subscribers.has(code)) {
      this.subscribers.set(code, new Set())
    }
    this.subscribers.get(code)!.add(callback)

    // Immediate initial sync if room is cached
    const current = getStoredRoom(code)
    if (current) {
      callback(current)
    }

    return () => {
      const subs = this.subscribers.get(code)
      if (subs) {
        subs.delete(callback)
      }
    }
  }

  async writeDesign(code: string, design: Design, _byPlayerId: string): Promise<void> {
    const room = getStoredRoom(code)
    if (!room) return

    room.design = design
    this.broadcast(room)
  }
}

// 4-letter room code generator with unambiguous characters (no I, O, 0, 1, L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function generateRoomCode(): string {
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length))
  }
  return code
}
