import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { canEdit, useCanEdit } from '../roles'
import { generateRoomCode, LocalBackend } from '../localBackend'
import { FirebaseBackend } from '../firebaseBackend'
import { firebaseAvailable } from '../firebase'
import { useTeamStore } from '../teamStore'
import { emptyDesign, useDesignStore } from '@/shared/designStore'
import { computeTotals, checkPowerBudget } from '@/engine'
import { gameData } from '@/data'
import { ROLES } from '@/shared/constants'

describe('canEdit Authorization Matrix', () => {
  it('correctly grants permissions matching the subsystem mapping', () => {
    // Planner
    expect(canEdit('planner', 'planner')).toBe(true)
    expect(canEdit('planner', 'mission')).toBe(true)
    expect(canEdit('planner', 'orbit')).toBe(true)
    expect(canEdit('planner', 'lifetime')).toBe(true)
    expect(canEdit('planner', 'power')).toBe(false)
    expect(canEdit('planner', 'instruments')).toBe(false)

    // Engineer
    expect(canEdit('engineer', 'engineer')).toBe(true)
    expect(canEdit('engineer', 'power')).toBe(true)
    expect(canEdit('engineer', 'structure')).toBe(true)
    expect(canEdit('engineer', 'rocket')).toBe(true)
    expect(canEdit('engineer', 'fuel')).toBe(true)
    expect(canEdit('engineer', 'instruments')).toBe(false)
    expect(canEdit('engineer', 'antenna')).toBe(false)

    // Science Lead
    expect(canEdit('science', 'science')).toBe(true)
    expect(canEdit('science', 'instruments')).toBe(true)
    expect(canEdit('science', 'payload')).toBe(true)
    expect(canEdit('science', 'power')).toBe(false)
    expect(canEdit('science', 'orbit')).toBe(false)

    // Comms Officer
    expect(canEdit('comms', 'comms')).toBe(true)
    expect(canEdit('comms', 'antenna')).toBe(true)
    expect(canEdit('comms', 'downlink')).toBe(true)
    expect(canEdit('comms', 'structure')).toBe(false)
    expect(canEdit('comms', 'lifetime')).toBe(false)
  })

  it('rejects invalid or missing role/section inputs gracefully', () => {
    expect(canEdit('' as any, 'science')).toBe(false)
    expect(canEdit('science', '')).toBe(false)
    expect(canEdit('invalid' as any, 'science')).toBe(false)
  })
})

describe('Room Code Generation', () => {
  it('generates 4-letter alphanumeric uppercase strings', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateRoomCode()
      expect(code).toHaveLength(4)
      expect(code).toBe(code.toUpperCase())
    }
  })

  it('does not contain confusing characters (I, O, 0, 1, L)', () => {
    const forbidden = ['I', 'O', '0', '1', 'L']
    for (let i = 0; i < 100; i++) {
      const code = generateRoomCode()
      for (const char of forbidden) {
        expect(code).not.toContain(char)
      }
    }
  })
})

describe('LocalBackend Role Claiming & Atomicity', () => {
  let backend: LocalBackend

  beforeEach(() => {
    backend = new LocalBackend()
  })

  it('allows a player to claim an open role and rejects duplicate claims', async () => {
    const { code, playerId: hostId } = await backend.createRoom('Commander', emptyDesign)
    const { playerId: client2Id } = await backend.joinRoom(code, 'Specialist 2')

    // Host claims 'science'
    const claim1 = await backend.claimRole(code, hostId, 'science')
    expect(claim1).toBe(true)

    // Client 2 attempts to claim 'science' -> rejected
    const claimDuplicate = await backend.claimRole(code, client2Id, 'science')
    expect(claimDuplicate).toBe(false)

    // Client 2 claims 'engineer' -> accepted
    const claimEngineer = await backend.claimRole(code, client2Id, 'engineer')
    expect(claimEngineer).toBe(true)

    // Host releases 'science'
    await backend.releaseRole(code, hostId)

    // Client 2 can now claim 'science'
    const claimReleased = await backend.claimRole(code, client2Id, 'science')
    expect(claimReleased).toBe(true)
  })

  it('enforces room capacity limit of 4 players', async () => {
    const { code } = await backend.createRoom('Player 1', emptyDesign)
    await backend.joinRoom(code, 'Player 2')
    await backend.joinRoom(code, 'Player 3')
    await backend.joinRoom(code, 'Player 4')

    // 5th player should be rejected
    await expect(backend.joinRoom(code, 'Player 5')).rejects.toThrow(/full/i)
  })

  it('enforces custom room capacity limits of 2 and 3 players', async () => {
    // Capacity 2
    const { code: code2 } = await backend.createRoom('Host', emptyDesign, 2)
    await backend.joinRoom(code2, 'Guest 1')
    await expect(backend.joinRoom(code2, 'Guest 2')).rejects.toThrow(/full/i)

    // Capacity 3
    const { code: code3 } = await backend.createRoom('Host', emptyDesign, 3)
    await backend.joinRoom(code3, 'Guest 1')
    await backend.joinRoom(code3, 'Guest 2')
    await expect(backend.joinRoom(code3, 'Guest 3')).rejects.toThrow(/full/i)
  })

  it('ensures joining players receive the exact same mission configuration as the host', async () => {
    const hostDesign = {
      ...emptyDesign,
      missionId: 'mars-sample-return',
      lifetimeMonths: 36,
      powerSystemId: 'solar-panel-std',
    }
    const { code } = await backend.createRoom('Commander', hostDesign, 4)
    const { roomState } = await backend.joinRoom(code, 'Flight Engineer')

    expect(roomState.design.missionId).toBe('mars-sample-return')
    expect(roomState.design.lifetimeMonths).toBe(36)
    expect(roomState.design.powerSystemId).toBe('solar-panel-std')
  })
})

describe('TeamStore Actions & Pass-the-Laptop Cycle', () => {
  beforeEach(() => {
    useTeamStore.getState().leaveSession()
  })

  it('cycles local roles in pass-the-laptop mode', () => {
    const store = useTeamStore.getState()
    expect(store.myRole).toBeNull()

    const role1 = store.cycleLocalRole()
    expect(role1).toBe('planner')
    expect(useTeamStore.getState().myRole).toBe('planner')

    const role2 = store.cycleLocalRole()
    expect(role2).toBe('engineer')

    const role3 = store.cycleLocalRole()
    expect(role3).toBe('science')

    const role4 = store.cycleLocalRole()
    expect(role4).toBe('comms')

    const role5 = store.cycleLocalRole()
    expect(role5).toBe('planner')
  })
})

describe('Session Persistence (sessionStorage)', () => {
  let mockStorage: Record<string, string> = {}

  beforeEach(() => {
    mockStorage = {}
    ;(globalThis as any).sessionStorage = {
      getItem: (key: string) => mockStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        mockStorage = {}
      },
    }
    useTeamStore.getState().leaveSession()
  })

  afterEach(() => {
    delete (globalThis as any).sessionStorage
  })

  it('saves session data on setRoomSession and restores mode/code', () => {
    useTeamStore.getState().setMode('online')
    useTeamStore.getState().setRoomSession('ABCD', 'player_123', {})

    const saved = JSON.parse(mockStorage['space_mission_team_session'] || '{}')
    expect(saved.roomCode).toBe('ABCD')
    expect(saved.playerId).toBe('player_123')
    expect(saved.mode).toBe('online')
  })

  it('updates session data on cycleLocalRole', () => {
    useTeamStore.getState().cycleLocalRole()
    const saved = JSON.parse(mockStorage['space_mission_team_session'] || '{}')
    expect(saved.mode).toBe('local')
    expect(saved.myRole).toBe('planner')
  })

  it('clears sessionStorage on leaveSession', () => {
    useTeamStore.getState().setRoomSession('ABCD', 'player_123', {})
    expect(mockStorage['space_mission_team_session']).toBeDefined()

    useTeamStore.getState().leaveSession()
    expect(mockStorage['space_mission_team_session']).toBeUndefined()
    expect(useTeamStore.getState().roomCode).toBeNull()
    expect(useTeamStore.getState().mode).toBe('solo')
  })
})

describe('LocalBackend Room Cleanup and Subscribers', () => {
  let backend: LocalBackend
  let mockLocalStorage: Record<string, string> = {}

  beforeEach(() => {
    mockLocalStorage = {}
    ;(globalThis as any).localStorage = {
      getItem: (key: string) => mockLocalStorage[key] ?? null,
      setItem: (key: string, val: string) => {
        mockLocalStorage[key] = val
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key]
      },
      clear: () => {
        mockLocalStorage = {}
      },
    }
    backend = new LocalBackend()
  })

  afterEach(() => {
    delete (globalThis as any).localStorage
  })

  it('cleans up stored room when last player leaves', async () => {
    const { code, playerId } = await backend.createRoom('Solo Host', emptyDesign)
    expect(mockLocalStorage[`space_room_${code}`]).toBeDefined()

    await backend.leaveRoom(code, playerId)
    expect(mockLocalStorage[`space_room_${code}`]).toBeUndefined()
  })

  it('keeps room alive if other players remain', async () => {
    const { code, playerId: hostId } = await backend.createRoom('Host', emptyDesign)
    const { playerId: guestId } = await backend.joinRoom(code, 'Guest')

    await backend.leaveRoom(code, hostId)
    const stored = JSON.parse(mockLocalStorage[`space_room_${code}`] || '{}')
    expect(stored.players[guestId]).toBeDefined()
    expect(stored.players[hostId]).toBeUndefined()

    await backend.leaveRoom(code, guestId)
    expect(mockLocalStorage[`space_room_${code}`]).toBeUndefined()
  })
})

describe('LocalBackend Field-Level Design Merge', () => {
  let backend: LocalBackend

  beforeEach(() => {
    backend = new LocalBackend()
  })

  it('merges individual subsystem modifications without overwriting other keys', async () => {
    const initial = {
      ...emptyDesign,
      missionId: 'earth-obs-1',
      powerSystemId: 'solar-1',
      antennaId: 'antenna-omni',
    }
    const { code, playerId } = await backend.createRoom('Engineer', initial)

    // Science updates instruments only
    await backend.writeDesign(code, { ...initial, instrumentIds: ['inst-radar'] }, playerId)

    // Comms updates antenna only
    await backend.writeDesign(code, { ...initial, instrumentIds: ['inst-radar'], antennaId: 'antenna-hga' }, playerId)

    // Subscribe to verify state
    let finalDesign = initial
    backend.subscribe(code, (state) => {
      finalDesign = state.design
    })

    expect(finalDesign.missionId).toBe('earth-obs-1')
    expect(finalDesign.powerSystemId).toBe('solar-1')
    expect(finalDesign.instrumentIds).toEqual(['inst-radar'])
    expect(finalDesign.antennaId).toBe('antenna-hga')
  })
})

describe('ApproveGate & Consensus Logic', () => {
  beforeEach(() => {
    useDesignStore.getState().reset()
    useTeamStore.getState().leaveSession()
  })

  it('tracks approvals and respects resetApprovals', () => {
    const store = useDesignStore.getState()
    expect(store.design.approvedBy).toEqual([])

    store.approve('planner')
    expect(useDesignStore.getState().design.approvedBy).toContain('planner')

    store.approve('engineer')
    expect(useDesignStore.getState().design.approvedBy).toEqual(['planner', 'engineer'])

    // Re-approving does not duplicate
    store.approve('engineer')
    expect(useDesignStore.getState().design.approvedBy).toEqual(['planner', 'engineer'])

    // Reset clears all
    store.resetApprovals()
    expect(useDesignStore.getState().design.approvedBy).toEqual([])
  })

  it('confirms consensus requires all 4 roles', () => {
    const store = useDesignStore.getState()
    ROLES.forEach((r) => store.approve(r))

    const approvals = useDesignStore.getState().design.approvedBy
    expect(approvals).toHaveLength(4)
    expect(ROLES.every((r) => approvals.includes(r))).toBe(true)
  })
})

describe('Antenna Selection and Downlink Bandwidth', () => {
  it('computes 0 downlink when no antenna is mounted', () => {
    const design = { ...emptyDesign, antennaId: '' }
    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(0)
  })

  it('computes correct downlink for antenna-omni (350 MB/day)', () => {
    const design = { ...emptyDesign, antennaId: 'antenna-omni' }
    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(350)
  })

  it('computes correct downlink for antenna-mga (750 MB/day)', () => {
    const design = { ...emptyDesign, antennaId: 'antenna-mga' }
    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(750)
  })

  it('computes correct downlink for antenna-hga (1000 MB/day)', () => {
    const design = { ...emptyDesign, antennaId: 'antenna-hga' }
    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(1000)
  })

  it('computes correct downlink for antenna-ka (2500 MB/day)', () => {
    const design = { ...emptyDesign, antennaId: 'antenna-ka' }
    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(2500)
  })
})

describe('Solo and Team Mode Permissions (useCanEdit)', () => {
  beforeEach(() => {
    useTeamStore.getState().leaveSession()
  })

  it('grants full editing permissions for all subsystems in solo mode', () => {
    useTeamStore.getState().setMode('solo')
    expect(useCanEdit('science')).toBe(true)
    expect(useCanEdit('engineer')).toBe(true)
    expect(useCanEdit('comms')).toBe(true)
    expect(useCanEdit('planner')).toBe(true)
    expect(useCanEdit('power')).toBe(true)
    expect(useCanEdit('antenna')).toBe(true)
  })

  it('restricts editing in team mode when no role is claimed', () => {
    useTeamStore.getState().setMode('local')
    useTeamStore.setState({ myRole: null })
    expect(useCanEdit('science')).toBe(false)
    expect(useCanEdit('engineer')).toBe(false)
  })

  it('grants editing only to authorized subsystems for assigned role in team mode', () => {
    useTeamStore.getState().setMode('local')
    useTeamStore.setState({ myRole: 'comms' })
    expect(useCanEdit('comms')).toBe(true)
    expect(useCanEdit('antenna')).toBe(true)
    expect(useCanEdit('downlink')).toBe(true)
    expect(useCanEdit('power')).toBe(false)
    expect(useCanEdit('instruments')).toBe(false)
  })

  it('enforces Orbit & Rocket subsystem permissions by role', () => {
    // Planner: controls orbit, restricted from rocket and fuel
    useTeamStore.getState().setMode('local')
    useTeamStore.setState({ myRole: 'planner' })
    expect(useCanEdit('orbit')).toBe(true)
    expect(useCanEdit('lifetime')).toBe(true)
    expect(useCanEdit('rocket')).toBe(false)
    expect(useCanEdit('fuel')).toBe(false)

    // Engineer: controls rocket and fuel, restricted from orbit
    useTeamStore.setState({ myRole: 'engineer' })
    expect(useCanEdit('rocket')).toBe(true)
    expect(useCanEdit('fuel')).toBe(true)
    expect(useCanEdit('power')).toBe(true)
    expect(useCanEdit('orbit')).toBe(false)

    // Science Lead: restricted from orbit, rocket, and fuel
    useTeamStore.setState({ myRole: 'science' })
    expect(useCanEdit('orbit')).toBe(false)
    expect(useCanEdit('rocket')).toBe(false)
    expect(useCanEdit('fuel')).toBe(false)

    // Comms Officer: restricted from orbit, rocket, and fuel
    useTeamStore.setState({ myRole: 'comms' })
    expect(useCanEdit('orbit')).toBe(false)
    expect(useCanEdit('rocket')).toBe(false)
    expect(useCanEdit('fuel')).toBe(false)

    // Solo Mode: unrestricted across orbit, rocket, and fuel
    useTeamStore.getState().setMode('solo')
    useTeamStore.setState({ myRole: null })
    expect(useCanEdit('orbit')).toBe(true)
    expect(useCanEdit('rocket')).toBe(true)
    expect(useCanEdit('fuel')).toBe(true)
  })
})

describe('Antenna Power Consumption and Power Balance', () => {
  it('includes antenna power consumption in total spacecraft power demand', () => {
    // No antenna mounted: power should only be base avionics (30W) + instruments (0)
    const noAntenna = { ...emptyDesign, antennaId: '' }
    const totalsNoAntenna = computeTotals(noAntenna, gameData)
    expect(totalsNoAntenna.power).toBe(30)

    // antenna-omni: 15W power consumption
    const withOmni = { ...emptyDesign, antennaId: 'antenna-omni' }
    const totalsOmni = computeTotals(withOmni, gameData)
    expect(totalsOmni.power).toBe(30 + 15) // 45W

    // antenna-ka: 85W power consumption
    const withKa = { ...emptyDesign, antennaId: 'antenna-ka' }
    const totalsKa = computeTotals(withKa, gameData)
    expect(totalsKa.power).toBe(30 + 85) // 115W

    // antenna-ka (85W) + instrument (e.g. inst-cam-1 = 35W)
    const inst = gameData.instruments[0]
    const withBoth = { ...emptyDesign, antennaId: 'antenna-ka', instrumentIds: [inst.id] }
    const totalsBoth = computeTotals(withBoth, gameData)
    expect(totalsBoth.power).toBe(30 + inst.power + 85)
  })

  it('reflects antenna power draw in checkPowerBudget calculations', () => {
    const powerSystem = gameData.parts.find((p) => p.kind === 'power') // solar-panel-std = 300W
    const orbit = gameData.orbits[0] // LEO, solarFactor = 1.0

    // Design with solar array + antenna-ka (85W)
    const design = { ...emptyDesign, powerSystemId: powerSystem?.id || '', antennaId: 'antenna-ka' }
    const totals = computeTotals(design, gameData)

    const budgetResult = checkPowerBudget(totals, orbit, powerSystem)
    // Gross generation = 300W; Total consumption = 30 + 85 = 115W; Net = 185W
    expect(budgetResult.ok).toBe(true)
    expect(budgetResult.netPowerWatts).toBe(300 - 115)
  })
})

describe('Concurrent Field-Level Design Synchronization', () => {
  let backend: LocalBackend

  beforeEach(() => {
    backend = new LocalBackend()
  })

  it('preserves independent concurrent field updates from different players', async () => {
    const initial = {
      ...emptyDesign,
      missionId: 'earth-obs-1',
      orbitId: 'orbit-leo',
      powerSystemId: 'solar-panel-std',
    }
    const { code, playerId: hostId } = await backend.createRoom('Host', initial)
    const { playerId: client2Id } = await backend.joinRoom(code, 'Specialist 2')

    // Science updates instrumentIds only (patch)
    await backend.writeDesign(code, { instrumentIds: ['inst-radar'], approvedBy: [] }, hostId)

    // Comms updates antennaId only (patch) concurrently without knowing about client 1's instrument
    await backend.writeDesign(code, { antennaId: 'antenna-hga', approvedBy: [] }, client2Id)

    // Planner updates orbitId only (patch)
    await backend.writeDesign(code, { orbitId: 'orbit-geo', approvedBy: [] }, hostId)

    // Verify all independent field changes were merged and preserved
    let finalDesign = initial
    backend.subscribe(code, (state) => {
      finalDesign = state.design
    })

    expect(finalDesign.missionId).toBe('earth-obs-1')
    expect(finalDesign.powerSystemId).toBe('solar-panel-std')
    expect(finalDesign.instrumentIds).toEqual(['inst-radar'])
    expect(finalDesign.antennaId).toBe('antenna-hga')
    expect(finalDesign.orbitId).toBe('orbit-geo')
  })

  it('resolves conflicting updates to the same field via Last-Write-Wins', async () => {
    const initial = { ...emptyDesign, fuelKg: 100 }
    const { code, playerId } = await backend.createRoom('Host', initial)

    await backend.writeDesign(code, { fuelKg: 250 }, playerId)
    await backend.writeDesign(code, { fuelKg: 500 }, playerId)

    let finalDesign = initial
    backend.subscribe(code, (state) => {
      finalDesign = state.design
    })

    expect(finalDesign.fuelKg).toBe(500)
  })

  it('replaces array fields atomically when a patch modifies them', async () => {
    const initial = { ...emptyDesign, instrumentIds: ['inst-cam-1'] }
    const { code, playerId } = await backend.createRoom('Host', initial)

    // Replacing array with new instrument selection
    await backend.writeDesign(code, { instrumentIds: ['inst-radar', 'inst-spectro'] }, playerId)

    let finalDesign = initial
    backend.subscribe(code, (state) => {
      finalDesign = state.design
    })

    expect(finalDesign.instrumentIds).toEqual(['inst-radar', 'inst-spectro'])
  })
})

describe('Mission Selection and Lobby Navigation Flow', () => {
  beforeEach(() => {
    useDesignStore.getState().reset()
    useTeamStore.getState().leaveSession()
  })

  it('preserves the selected mission when transitioning to the lobby', () => {
    // Mission selection updates designStore
    useDesignStore.getState().patchDesign({
      missionId: 'earth-obs-1',
      lifetimeMonths: 18,
    })

    const design = useDesignStore.getState().design
    expect(design.missionId).toBe('earth-obs-1')
    expect(design.lifetimeMonths).toBe(18)
  })

  it('configures Solo Architect mode cleanly from the lobby', () => {
    useDesignStore.getState().patchDesign({ missionId: 'earth-obs-1' })
    useTeamStore.getState().setMode('solo')
    useTeamStore.getState().setMyRole(null)

    const teamState = useTeamStore.getState()
    expect(teamState.mode).toBe('solo')
    expect(teamState.myRole).toBeNull()
    expect(teamState.roomCode).toBeNull()

    // Solo mode permits all subsystem edits
    expect(useCanEdit('science')).toBe(true)
    expect(useCanEdit('planner')).toBe(true)
    expect(useCanEdit('engineer')).toBe(true)
    expect(useCanEdit('comms')).toBe(true)
  })
})

describe('FirebaseBackend Graceful Fallback', () => {
  it('throws descriptive error when database credentials are not provisioned', async () => {
    // When db is null, createRoom and joinRoom fail immediately
    const backend = new FirebaseBackend()
    if (!firebaseAvailable) {
      await expect(backend.createRoom('Host', emptyDesign, 4)).rejects.toThrow(/Firebase Database not initialized/i)
      await expect(backend.joinRoom('TEST', 'Guest')).rejects.toThrow(/Firebase Database not initialized/i)
    } else {
      // In live Firebase environment, ensure invalid room joining throws descriptive error
      await expect(backend.joinRoom('NONEXISTENT_ROOM_XYZ', 'Guest')).rejects.toThrow(/not found on Firebase/i)
    }
  })
})

import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase, ref, set } from 'firebase/database'

describe('FirebaseBackend Role Concurrency & Exclusivity', () => {
  it('ensures exactly one claimant succeeds when two clients claim the same role concurrently', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHost_' + Date.now())
    const appPeer = initializeApp(firebaseConfig, 'testAppPeer_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const peerBackend = new FirebaseBackend(getDatabase(appPeer), getAuth(appPeer))

    let roomCode = ''
    let hostPlayerId = ''
    let peerPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const peerRes = await peerBackend.joinRoom(roomCode, 'Specialist Peer')
      peerPlayerId = peerRes.playerId

      // Simulate genuinely concurrent role claims for 'planner'
      const [hostClaimed, peerClaimed] = await Promise.all([
        hostBackend.claimRole(roomCode, hostPlayerId, 'planner'),
        peerBackend.claimRole(roomCode, peerPlayerId, 'planner'),
      ])

      // Exactly one client must succeed
      expect(hostClaimed !== peerClaimed).toBe(true)
      expect(Number(hostClaimed) + Number(peerClaimed)).toBe(1)
    } finally {
      if (roomCode) {
        if (peerPlayerId) await peerBackend.leaveRoom(roomCode, peerPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appPeer)
    }
  }, 15000)

  it('allows clients to claim different roles concurrently without conflict', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHostDiff_' + Date.now())
    const appPeer = initializeApp(firebaseConfig, 'testAppPeerDiff_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const peerBackend = new FirebaseBackend(getDatabase(appPeer), getAuth(appPeer))

    let roomCode = ''
    let hostPlayerId = ''
    let peerPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const peerRes = await peerBackend.joinRoom(roomCode, 'Specialist Peer')
      peerPlayerId = peerRes.playerId

      // Concurrently claim different roles
      const [hostClaimed, peerClaimed] = await Promise.all([
        hostBackend.claimRole(roomCode, hostPlayerId, 'planner'),
        peerBackend.claimRole(roomCode, peerPlayerId, 'engineer'),
      ])

      expect(hostClaimed).toBe(true)
      expect(peerClaimed).toBe(true)
    } finally {
      if (roomCode) {
        if (peerPlayerId) await peerBackend.leaveRoom(roomCode, peerPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appPeer)
    }
  }, 15000)

  it('prevents a third client from overwriting an existing role claim', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHost3rd_' + Date.now())
    const appThird = initializeApp(firebaseConfig, 'testAppThird_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const thirdBackend = new FirebaseBackend(getDatabase(appThird), getAuth(appThird))

    let roomCode = ''
    let hostPlayerId = ''
    let thirdPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const thirdRes = await thirdBackend.joinRoom(roomCode, 'Specialist 3')
      thirdPlayerId = thirdRes.playerId

      // Host claims 'science'
      const hostClaimed = await hostBackend.claimRole(roomCode, hostPlayerId, 'science')
      expect(hostClaimed).toBe(true)

      // Third client attempts to claim 'science'
      const thirdClaimed = await thirdBackend.claimRole(roomCode, thirdPlayerId, 'science')
      expect(thirdClaimed).toBe(false)
    } finally {
      if (roomCode) {
        if (thirdPlayerId) await thirdBackend.leaveRoom(roomCode, thirdPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appThird)
    }
  }, 15000)

  it('prevents a player from releasing another player role', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHostRel_' + Date.now())
    const appPeer = initializeApp(firebaseConfig, 'testAppPeerRel_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const peerBackend = new FirebaseBackend(getDatabase(appPeer), getAuth(appPeer))

    let roomCode = ''
    let hostPlayerId = ''
    let peerPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const peerRes = await peerBackend.joinRoom(roomCode, 'Specialist Peer')
      peerPlayerId = peerRes.playerId

      // Host claims 'comms'
      await hostBackend.claimRole(roomCode, hostPlayerId, 'comms')

      // Peer attempts to release host's role via method
      await peerBackend.releaseRole(roomCode, hostPlayerId)

      // Peer also attempts direct unauthorized deletion at the database node level
      let directDeleteSucceeded = false
      try {
        const directRoleRef = ref(getDatabase(appPeer), `rooms/${roomCode}/roleClaims/comms`)
        await set(directRoleRef, null)
        directDeleteSucceeded = true
      } catch {
        directDeleteSucceeded = false
      }
      expect(directDeleteSucceeded).toBe(false)

      // Peer tries to claim 'comms' (must still be occupied by host)
      const peerClaimed = await peerBackend.claimRole(roomCode, peerPlayerId, 'comms')
      expect(peerClaimed).toBe(false)
    } finally {
      if (roomCode) {
        if (peerPlayerId) await peerBackend.leaveRoom(roomCode, peerPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appPeer)
    }
  }, 15000)

  it('allows a released role to be claimed by another player', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHostAvail_' + Date.now())
    const appPeer = initializeApp(firebaseConfig, 'testAppPeerAvail_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const peerBackend = new FirebaseBackend(getDatabase(appPeer), getAuth(appPeer))

    let roomCode = ''
    let hostPlayerId = ''
    let peerPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const peerRes = await peerBackend.joinRoom(roomCode, 'Specialist Peer')
      peerPlayerId = peerRes.playerId

      // Host claims 'planner'
      const hostClaimed = await hostBackend.claimRole(roomCode, hostPlayerId, 'planner')
      expect(hostClaimed).toBe(true)

      // Host releases 'planner'
      const hostReleased = await hostBackend.releaseRole(roomCode, hostPlayerId)
      expect(hostReleased).toBe(true)

      // Peer now claims the freed 'planner' role
      const peerClaimed = await peerBackend.claimRole(roomCode, peerPlayerId, 'planner')
      expect(peerClaimed).toBe(true)
    } finally {
      if (roomCode) {
        if (peerPlayerId) await peerBackend.leaveRoom(roomCode, peerPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appPeer)
    }
  }, 15000)

  it('synchronizes real-time role updates across multiple client subscribers', async () => {
    if (!firebaseAvailable) return

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    }

    const appHost = initializeApp(firebaseConfig, 'testAppHostSub_' + Date.now())
    const appPeer = initializeApp(firebaseConfig, 'testAppPeerSub_' + Date.now())

    const hostBackend = new FirebaseBackend(getDatabase(appHost), getAuth(appHost))
    const peerBackend = new FirebaseBackend(getDatabase(appPeer), getAuth(appPeer))

    let roomCode = ''
    let hostPlayerId = ''
    let peerPlayerId = ''

    try {
      const hostRes = await hostBackend.createRoom('Commander Host', emptyDesign, 4)
      roomCode = hostRes.code
      hostPlayerId = hostRes.playerId

      const peerRes = await peerBackend.joinRoom(roomCode, 'Specialist Peer')
      peerPlayerId = peerRes.playerId

      // Listen on peer side for updates
      let lastObservedRoleOnPeer: string | null = null
      const unsub = peerBackend.subscribe(roomCode, (state) => {
        if (state.players && state.players[hostPlayerId]) {
          lastObservedRoleOnPeer = state.players[hostPlayerId].role
        }
      })

      // Host claims 'engineer'
      await hostBackend.claimRole(roomCode, hostPlayerId, 'engineer')

      // Wait up to 3 seconds for peer listener to observe the claim
      const start = Date.now()
      while (lastObservedRoleOnPeer !== 'engineer' && Date.now() - start < 3000) {
        await new Promise((r) => setTimeout(r, 100))
      }

      unsub()
      expect(lastObservedRoleOnPeer).toBe('engineer')
    } finally {
      if (roomCode) {
        if (peerPlayerId) await peerBackend.leaveRoom(roomCode, peerPlayerId)
        if (hostPlayerId) await hostBackend.leaveRoom(roomCode, hostPlayerId)
      }
      await deleteApp(appHost)
      await deleteApp(appPeer)
    }
  }, 15000)
})
