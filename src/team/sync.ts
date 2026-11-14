import { useEffect, useRef } from 'react'
import { useDesignStore } from '@/shared/designStore'
import { useTeamStore } from './teamStore'
import { backend } from './rooms'

export function useRoomSync() {
  const mode = useTeamStore((s) => s.mode)
  const roomCode = useTeamStore((s) => s.roomCode)
  const playerId = useTeamStore((s) => s.playerId)
  const syncRoomState = useTeamStore((s) => s.syncRoomState)

  const design = useDesignStore((s) => s.design)
  const setDesign = useDesignStore((s) => s.setDesign)

  // Track the latest design received from remote to prevent echo updates
  const lastRemoteDesignStr = useRef<string>('')
  const debounceTimer = useRef<number | null>(null)

  // 1. Subscribe to backend updates
  useEffect(() => {
    if (mode === 'solo' || !roomCode) return

    const unsubscribe = backend.subscribe(roomCode, (state) => {
      syncRoomState(state)

      const remoteStr = JSON.stringify(state.design)
      const localStr = JSON.stringify(design)

      if (remoteStr !== localStr && remoteStr !== lastRemoteDesignStr.current) {
        lastRemoteDesignStr.current = remoteStr
        setDesign(state.design)
      }
    })

    return () => unsubscribe()
  }, [mode, roomCode, syncRoomState, setDesign])

  // 2. Debounced write to backend on local design changes
  useEffect(() => {
    if (mode === 'solo' || !roomCode || !playerId) return

    const currentLocalStr = JSON.stringify(design)
    // If the local design originated from remote, don't echo back
    if (currentLocalStr === lastRemoteDesignStr.current) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = window.setTimeout(async () => {
      try {
        await backend.writeDesign(roomCode, design, playerId)
      } catch {
        // Failed to sync design
      }
    }, 150)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [design, mode, roomCode, playerId])
}
