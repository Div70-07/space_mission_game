import { ref, set, get, update, onValue, off, onDisconnect, runTransaction, type Database } from 'firebase/database'
import { signInAnonymously, type Auth } from 'firebase/auth'
import type { Role, Design } from '@/shared/types'
import { db, getOrCreateAnonymousUser } from './firebase'
import type { RoomBackend, RoomState, Player } from './types'
import { generateRoomCode } from './localBackend'

export class FirebaseBackend implements RoomBackend {
  private customDb?: Database
  private customAuth?: Auth

  constructor(customDb?: Database, customAuth?: Auth) {
    this.customDb = customDb
    this.customAuth = customAuth
  }

  private get db() {
    return this.customDb || db
  }

  private async getAuthUser() {
    if (this.customAuth) {
      if (this.customAuth.currentUser) return this.customAuth.currentUser
      const cred = await signInAnonymously(this.customAuth)
      return cred.user
    }
    return getOrCreateAnonymousUser()
  }

  async createRoom(hostName: string, initialDesign: Design, maxPlayers: number = 4): Promise<{ code: string; playerId: string }> {
    const activeDb = this.db
    if (!activeDb) throw new Error('Firebase Database not initialized')
    const user = await this.getAuthUser()
    const playerId = user ? user.uid : `player_${Math.random().toString(36).substring(2, 9)}`
    const code = generateRoomCode()

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
      maxPlayers: Math.max(2, Math.min(4, maxPlayers)),
      hostId: playerId,
      createdAt: Date.now(),
    }

    const roomRef = ref(activeDb, `rooms/${code}`)
    await set(roomRef, roomState)

    // Setup disconnect cleanup
    try {
      const playerRef = ref(activeDb, `rooms/${code}/players/${playerId}`)
      onDisconnect(playerRef).remove()
    } catch {
      // Ignore disconnect setup failure
    }

    return { code, playerId }
  }

  async joinRoom(code: string, playerName: string): Promise<{ playerId: string; roomState: RoomState }> {
    const activeDb = this.db
    if (!activeDb) throw new Error('Firebase Database not initialized')
    const user = await this.getAuthUser()
    const playerId = user ? user.uid : `player_${Math.random().toString(36).substring(2, 9)}`

    const cleanCode = code.trim().toUpperCase()
    const roomRef = ref(activeDb, `rooms/${cleanCode}`)
    const snapshot = await get(roomRef)

    if (!snapshot.exists()) {
      throw new Error(`Room "${cleanCode}" not found on Firebase. Check code.`)
    }

    const room = snapshot.val() as RoomState
    const currentPlayers = Object.values(room.players || {})
    const limit = room.maxPlayers || 4
    if (currentPlayers.length >= limit) {
      throw new Error(`Room "${cleanCode}" is full (maximum ${limit} crew specialists).`)
    }

    const player: Player = {
      id: playerId,
      name: playerName || `Specialist ${currentPlayers.length + 1}`,
      role: null,
      joinedAt: Date.now(),
    }

    await set(ref(activeDb, `rooms/${cleanCode}/players/${playerId}`), player)

    try {
      onDisconnect(ref(activeDb, `rooms/${cleanCode}/players/${playerId}`)).remove()
    } catch {
      // Ignore
    }

    room.players = { ...(room.players || {}), [playerId]: player }
    return { playerId, roomState: room }
  }

  async claimRole(code: string, playerId: string, role: Role): Promise<boolean> {
    const activeDb = this.db
    if (!activeDb) return false
    const cleanCode = code.trim().toUpperCase()

    try {
      const roleClaimRef = ref(activeDb, `rooms/${cleanCode}/roleClaims/${role}`)
      const txResult = await runTransaction(roleClaimRef, (currentOwner) => {
        // If unoccupied (null/undefined), claim for current playerId
        if (currentOwner === null || currentOwner === undefined) {
          return playerId
        }
        // If already owned by this player, keep ownership
        if (currentOwner === playerId) {
          return playerId
        }
        // Already owned by another player: abort transaction
        return undefined
      })

      // If transaction failed or was aborted because someone else owns it
      if (!txResult.committed || txResult.snapshot.val() !== playerId) {
        return false
      }

      // 2. Set up onDisconnect cleanup on this role claim so disconnects free the role
      try {
        onDisconnect(roleClaimRef).remove()
      } catch {
        // Ignore disconnect handler setup failure
      }

      // 3. Mirror the role onto the player's personal record for local fast UI reflection
      try {
        const playerRef = ref(activeDb, `rooms/${cleanCode}/players/${playerId}`)
        await update(playerRef, { role })
      } catch {
        // Even if player record mirror fails, roleClaims is authoritative
      }

      return true
    } catch (err) {
      console.error('Failed to claim role on Firebase:', err)
      return false
    }
  }

  async releaseRole(code: string, playerId: string): Promise<boolean> {
    const activeDb = this.db
    if (!activeDb) return false
    const cleanCode = code.trim().toUpperCase()

    // Enforce that a caller can only release their own role (matching their auth.uid)
    const user = await this.getAuthUser()
    const callerUid = user ? user.uid : playerId
    if (callerUid !== playerId) {
      console.warn(`[releaseRole] Security rejection: caller ${callerUid} cannot release role for ${playerId}`)
      return false
    }

    try {
      // 1. Identify which role this player currently holds by checking roleClaims
      const roleClaimsRef = ref(activeDb, `rooms/${cleanCode}/roleClaims`)
      const claimsSnap = await get(roleClaimsRef)
      let claimedRole: Role | null = null

      if (claimsSnap.exists()) {
        const claims = claimsSnap.val() as Record<string, string>
        for (const [r, uid] of Object.entries(claims)) {
          if (uid === playerId) {
            claimedRole = r as Role
            break
          }
        }
      }

      // If no role claim found in registry, check player's record as fallback
      if (!claimedRole) {
        const playerSnap = await get(ref(activeDb, `rooms/${cleanCode}/players/${playerId}/role`))
        if (playerSnap.exists()) {
          claimedRole = playerSnap.val() as Role
        }
      }

      if (claimedRole) {
        const roleRef = ref(activeDb, `rooms/${cleanCode}/roleClaims/${claimedRole}`)
        // Check server state via runTransaction with null handling
        await runTransaction(roleRef, (currentOwner) => {
          // If already released/null, nothing to do
          if (currentOwner === null || currentOwner === undefined) {
            return null
          }
          if (currentOwner === playerId) {
            return null // Remove claim
          }
          return undefined // Abort if owned by another
        })

        try {
          onDisconnect(roleRef).cancel()
        } catch {
          // Ignore
        }
      }

      // Clear player's mirrored role
      try {
        const playerRef = ref(activeDb, `rooms/${cleanCode}/players/${playerId}`)
        await update(playerRef, { role: null })
      } catch {
        // Ignore
      }

      return true
    } catch (err) {
      console.error('Failed to release role on Firebase:', err)
      return false
    }
  }

  async leaveRoom(code: string, playerId: string): Promise<void> {
    const activeDb = this.db
    if (!activeDb) return
    const cleanCode = code.trim().toUpperCase()

    // 1. Release any claimed role first
    await this.releaseRole(cleanCode, playerId)

    // 2. Remove player record
    const playerRef = ref(activeDb, `rooms/${cleanCode}/players/${playerId}`)
    await set(playerRef, null)

    try {
      const roomPlayersRef = ref(activeDb, `rooms/${cleanCode}/players`)
      const snapshot = await get(roomPlayersRef)
      if (!snapshot.exists() || !snapshot.val() || Object.keys(snapshot.val()).length === 0) {
        await set(ref(activeDb, `rooms/${cleanCode}`), null)
      }
    } catch {
      // Ignore cleanup error
    }
  }

  subscribe(code: string, callback: (state: RoomState) => void): () => void {
    const activeDb = this.db
    if (!activeDb) return () => {}
    const roomRef = ref(activeDb, `rooms/${code}`)
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as RoomState)
      }
    })
    return () => off(roomRef, 'value', unsubscribe)
  }

  async writeDesign(code: string, patch: Partial<Design>, _byPlayerId: string): Promise<void> {
    const activeDb = this.db
    if (!activeDb) return
    const designRef = ref(activeDb, `rooms/${code}/design`)
    try {
      await update(designRef, patch)
    } catch {
      const snapshot = await get(designRef)
      const existing = snapshot.exists() ? (snapshot.val() as Design) : {}
      await set(designRef, { ...existing, ...patch })
    }
  }
}
