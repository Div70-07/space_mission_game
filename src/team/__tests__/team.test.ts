import { describe, it, expect, beforeEach } from 'vitest'
import { canEdit } from '../roles'
import { generateRoomCode, LocalBackend } from '../localBackend'
import { useTeamStore } from '../teamStore'
import { emptyDesign } from '@/shared/designStore'

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
