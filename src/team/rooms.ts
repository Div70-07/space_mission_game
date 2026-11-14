// Owner: C. Room management and matchmaking.
export interface Room {
  id: string
  hostId: string
  players: Record<string, { role: string; ready: boolean }>
}

export function createRoom(): Room {
  return { id: 'room-1', hostId: 'player-1', players: {} }
}
