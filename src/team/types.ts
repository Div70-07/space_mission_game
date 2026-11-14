import type { Role, Design } from '@/shared/types'

export interface Player {
  id: string
  name: string
  role: Role | null
  joinedAt: number
}

export interface RoomState {
  code: string
  design: Design
  players: Record<string, Player>
  status: 'lobby' | 'building' | 'complete'
}

export interface RoomBackend {
  createRoom: (hostName: string, initialDesign: Design) => Promise<{ code: string; playerId: string }>
  joinRoom: (code: string, playerName: string) => Promise<{ playerId: string; roomState: RoomState }>
  claimRole: (code: string, playerId: string, role: Role) => Promise<boolean>
  releaseRole: (code: string, playerId: string) => Promise<boolean>
  leaveRoom: (code: string, playerId: string) => Promise<void>
  subscribe: (code: string, callback: (state: RoomState) => void) => () => void
  writeDesign: (code: string, design: Design, byPlayerId: string) => Promise<void>
}
