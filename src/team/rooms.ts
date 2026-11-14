import type { RoomBackend } from './types'
import { LocalBackend } from './localBackend'
import { FirebaseBackend } from './firebaseBackend'
import { firebaseAvailable } from './firebase'
import type { Role, Design } from '@/shared/types'

const forceLocal = import.meta.env.VITE_TEAM_BACKEND === 'local'

export const backend: RoomBackend =
  firebaseAvailable && !forceLocal ? new FirebaseBackend() : new LocalBackend()

export const isOnlineMode = firebaseAvailable && !forceLocal

export async function createRoom(hostName: string, initialDesign: Design) {
  return backend.createRoom(hostName, initialDesign)
}

export async function joinRoom(code: string, playerName: string) {
  return backend.joinRoom(code, playerName)
}

export async function claimRole(code: string, playerId: string, role: Role) {
  return backend.claimRole(code, playerId, role)
}

export async function releaseRole(code: string, playerId: string) {
  return backend.releaseRole(code, playerId)
}

export async function leaveRoom(code: string, playerId: string) {
  return backend.leaveRoom(code, playerId)
}
