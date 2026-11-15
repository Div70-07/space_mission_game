import { useEffect, useRef } from 'react'
import type { Design } from '@/shared/types'
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

  // Track the latest synced baseline design to compute outbound patches
  const lastSyncedDesign = useRef<Design>(design)
  // Track the latest design received from remote to prevent echo updates
  const lastRemoteDesignStr = useRef<string>('')
  const debounceTimer = useRef<number | null>(null)

  // 1. Subscribe to backend updates
  useEffect(() => {
    if (mode === 'solo' || !roomCode) return

    const unsubscribe = backend.subscribe(roomCode, (state) => {
      syncRoomState(state)

      const remoteStr = JSON.stringify(state.design)
      const currentLocal = useDesignStore.getState().design
      const localStr = JSON.stringify(currentLocal)

      if (remoteStr !== localStr && remoteStr !== lastRemoteDesignStr.current) {
        lastRemoteDesignStr.current = remoteStr
        lastSyncedDesign.current = state.design
        setDesign(state.design)
      }
    })

    return () => unsubscribe()
  }, [mode, roomCode, syncRoomState, setDesign])

  // 2. Debounced patch write to backend on local design changes
  useEffect(() => {
    if (mode === 'solo' || !roomCode || !playerId) return

    const currentLocalStr = JSON.stringify(design)
    // If the local design originated from remote, don't echo back
    if (currentLocalStr === lastRemoteDesignStr.current) {
      lastSyncedDesign.current = design
      return
    }

    // Compute field-level diff between last synced baseline and current local design
    const patch: Partial<Design> = {}
    let hasChanges = false
    const prev = lastSyncedDesign.current
    const keys = Object.keys(design) as (keyof Design)[]

    for (const key of keys) {
      if (JSON.stringify(prev[key]) !== JSON.stringify(design[key])) {
        patch[key] = design[key] as any
        hasChanges = true
      }
    }

    if (!hasChanges) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = window.setTimeout(async () => {
      try {
        lastSyncedDesign.current = design
        await backend.writeDesign(roomCode, patch, playerId)
      } catch {
        // Failed to sync design patch
      }
    }, 150)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [design, mode, roomCode, playerId])
}
