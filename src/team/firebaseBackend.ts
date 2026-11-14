import { ref, set, get, onValue, off, runTransaction, onDisconnect } from 'firebase/database'
import type { Role, Design } from '@/shared/types'
import { db } from './firebase'
import type { RoomBackend, RoomState, Player } from './types'
import { generateRoomCode } from './localBackend'

export class FirebaseBackend implements RoomBackend {
  async createRoom(hostName: string, initialDesign: Design): Promise<{ code: string; playerId: string }> {
    if (!db) throw new Error('Firebase Database not initialized')
    const code = generateRoomCode()
    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`

    const player: Player = {
      id: playerId,
      name: hostName || 'Commander',
      role: null,
      joinedAt: Date.now(),
    }

    const roomState: RoomState = {
      code,
      design: initialDesign,
      players: { [playerId]: player },
      status: 'lobby',
    }

    const roomRef = ref(db, `rooms/${code}`)
    await set(roomRef, roomState)

    // Setup disconnect cleanup
    try {
      const playerRef = ref(db, `rooms/${code}/players/${playerId}`)
      onDisconnect(playerRef).remove()
    } catch {
      // Ignore disconnect setup failure
    }

    return { code, playerId }
  }

  async joinRoom(code: string, playerName: string): Promise<{ playerId: string; roomState: RoomState }> {
    if (!db) throw new Error('Firebase Database not initialized')
    const cleanCode = code.trim().toUpperCase()
    const roomRef = ref(db, `rooms/${cleanCode}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      throw new Error(`Room "${cleanCode}" not found on Firebase. Check code.`)
    }

    const room = snapshot.val() as RoomState
    const currentPlayers = Object.values(room.players || {})
    if (currentPlayers.length >= 4) {
      throw new Error(`Room "${cleanCode}" is full (maximum 4 crew specialists).`)
    }

    const playerId = `player_${Math.random().toString(36).substring(2, 9)}`
    const player: Player = {
      id: playerId,
      name: playerName || `Specialist ${currentPlayers.length + 1}`,
      role: null,
      joinedAt: Date.now(),
    }

    await set(ref(db, `rooms/${cleanCode}/players/${playerId}`), player)

    try {
      onDisconnect(ref(db, `rooms/${cleanCode}/players/${playerId}`)).remove()
    } catch {
      // Ignore
    }

    room.players = { ...(room.players || {}), [playerId]: player }
    return { playerId, roomState: room }
  }

  async claimRole(code: string, playerId: string, role: Role): Promise<boolean> {
    if (!db) return false
    const playersRef = ref(db, `rooms/${code}/players`)
    const result = await runTransaction(playersRef, (players: Record<string, Player> | null) => {
      if (!players) return players

      // Check if role is claimed
      const isTaken = Object.values(players).some((p) => p.role === role && p.id !== playerId)
      if (isTaken) {
        return // Abort transaction
      }

      if (players[playerId]) {
        players[playerId].role = role
      }
      return players
    })

    return result.committed
  }

  async releaseRole(code: string, playerId: string): Promise<boolean> {
    if (!db) return false
    const playerRoleRef = ref(db, `rooms/${code}/players/${playerId}/role`)
    await set(playerRoleRef, null)
    return true
  }

  async leaveRoom(code: string, playerId: string): Promise<void> {
    if (!db) return
    const playerRef = ref(db, `rooms/${code}/players/${playerId}`)
    await set(playerRef, null)
  }

  subscribe(code: string, callback: (state: RoomState) => void): () => void {
    if (!db) return () => {}
    const roomRef = ref(db, `rooms/${code}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as RoomState)
      }
    })
    return () => off(roomRef, 'value', unsubscribe)
  }

  async writeDesign(code: string, design: Design, _byPlayerId: string): Promise<void> {
    if (!db) return
    const designRef = ref(db, `rooms/${code}/design`)
    await set(designRef, design)
  }
}
