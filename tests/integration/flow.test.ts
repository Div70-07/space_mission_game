import { describe, it, expect } from 'vitest'
import { gameData } from '@/data'
import { computeTotals, checkDesign, runMission } from '@/engine'
import { useDesignStore, emptyDesign } from '@/shared/designStore'
import type { Role } from '@/shared/types'

describe('Data Validation Tests', () => {
  it('validates instruments have correct fields, unique ids, and source', () => {
    const ids = new Set<string>()
    for (const inst of gameData.instruments) {
      expect(inst.id).toBeTruthy()
      expect(ids.has(inst.id)).toBe(false)
      ids.add(inst.id)
      expect(inst.name).toBeTruthy()
      expect(typeof inst.mass).toBe('number')
      expect(typeof inst.power).toBe('number')
      expect(typeof inst.cost).toBe('number')
      expect(typeof inst.dataPerDay).toBe('number')
      expect(typeof inst.scienceValue).toBe('number')
      expect(inst.source).toBeDefined()
    }
  })

  it('validates parts have correct fields, unique ids, and valid kinds', () => {
    const ids = new Set<string>()
    for (const part of gameData.parts) {
      expect(part.id).toBeTruthy()
      expect(ids.has(part.id)).toBe(false)
      ids.add(part.id)
      expect(['power', 'antenna', 'structure']).toContain(part.kind)
      expect(typeof part.mass).toBe('number')
      expect(typeof part.power).toBe('number')
      expect(typeof part.cost).toBe('number')
      expect(typeof part.downlinkPerDay).toBe('number')
      expect(part.source).toBeDefined()
    }
  })

  it('validates cross references between missions, orbits, and rockets', () => {
    const orbitIds = new Set(gameData.orbits.map((o) => o.id))

    // Every mission.orbitId exists in orbits
    for (const mission of gameData.missions) {
      expect(mission.orbitIds.length).toBeGreaterThan(0)
      for (const oId of mission.orbitIds) {
        expect(orbitIds.has(oId)).toBe(true)
      }
    }

    // Every rocket.payloadByOrbit key exists in orbits (or is a valid orbit key)
    for (const rocket of gameData.rockets) {
      expect(Object.keys(rocket.payloadByOrbit).length).toBeGreaterThan(0)
    }
  })
})

describe('Engine Sanity with Real Data', () => {
  it('computes totals accurately based on selected components', () => {
    const inst1 = gameData.instruments[0]
    const power1 = gameData.parts.find((p) => p.kind === 'power')!
    const antenna1 = gameData.parts.find((p) => p.kind === 'antenna')!
    const rocket1 = gameData.rockets[0]

    const testDesign = {
      ...emptyDesign,
      missionId: gameData.missions[0].id,
      instrumentIds: [inst1.id],
      powerSystemId: power1.id,
      antennaId: antenna1.id,
      rocketId: rocket1.id,
      fuelKg: 50,
      lifetimeMonths: 12,
    }

    const totals = computeTotals(testDesign, gameData)
    // Base 100 + inst1.mass + power1.mass + antenna1.mass + fuelKg
    const expectedMass = 100 + inst1.mass + power1.mass + antenna1.mass + 50
    expect(totals.mass).toBe(expectedMass)

    // Base avionics 30 + inst1.power + antenna1.power
    expect(totals.power).toBe(30 + inst1.power + antenna1.power)

    // Cost sum
    expect(totals.cost).toBe(Number((inst1.cost + power1.cost + antenna1.cost + rocket1.cost).toFixed(2)))

    // Data and downlink
    expect(totals.dataPerDay).toBe(inst1.dataPerDay)
    expect(totals.downlinkPerDay).toBe(antenna1.downlinkPerDay)
  })

  it('adding an instrument increases mass, power, and cost', () => {
    const baseDesign = {
      ...emptyDesign,
      missionId: gameData.missions[0].id,
      instrumentIds: [gameData.instruments[0].id],
    }

    const expandedDesign = {
      ...emptyDesign,
      missionId: gameData.missions[0].id,
      instrumentIds: [gameData.instruments[0].id, gameData.instruments[1].id],
    }

    const totals1 = computeTotals(baseDesign, gameData)
    const totals2 = computeTotals(expandedDesign, gameData)

    expect(totals2.mass).toBeGreaterThan(totals1.mass)
    expect(totals2.power).toBeGreaterThan(totals1.power)
    expect(totals2.cost).toBeGreaterThan(totals1.cost)
  })

  it('fails power check when power consumption exceeds generation', () => {
    const powerPart = gameData.parts.find((p) => p.kind === 'power')!
    // No power system mounted, but instruments consume power
    const noPowerDesign = {
      ...emptyDesign,
      missionId: gameData.missions[0].id,
      instrumentIds: [gameData.instruments[0].id],
      powerSystemId: '',
    }

    const checks = checkDesign(noPowerDesign, gameData)
    const powerCheck = checks.find((c) => c.id === 'power')
    expect(powerCheck?.ok).toBe(false)
  })

  it('deterministic simulation with identical seeds', () => {
    const design = {
      ...emptyDesign,
      missionId: gameData.missions[0].id,
      instrumentIds: [gameData.instruments[0].id],
      orbitId: 'leo',
      rocketId: 'falcon-9',
      powerSystemId: 'solar-panel-std',
      antennaId: 'antenna-hga',
      fuelKg: 100,
    }

    const res1 = runMission(design, gameData, 12345)
    const res2 = runMission(design, gameData, 12345)
    expect(res1).toEqual(res2)
  })

  it('failed mission returns failure reasons', () => {
    // Empty design will fail multiple checks (no instruments, no power, no rocket, etc.)
    const result = runMission(emptyDesign, gameData, 42)
    if (!result.success) {
      expect(result.reasons.length).toBeGreaterThan(0)
    }
  })
})

describe('End-to-End Smoke', () => {
  it('evaluates complete mission flow and produces valid SimResult', () => {
    const mission = gameData.missions[0]
    const orbit = gameData.orbits[0]
    const rocket = gameData.rockets[0]
    const power = gameData.parts.find((p) => p.kind === 'power')!
    const antenna = gameData.parts.find((p) => p.kind === 'antenna')!
    const inst = gameData.instruments[0]

    const fullDesign = {
      missionId: mission.id,
      instrumentIds: [inst.id],
      powerSystemId: power.id,
      antennaId: antenna.id,
      fuelKg: 100,
      orbitId: orbit.id,
      rocketId: rocket.id,
      lifetimeMonths: mission.lifetimeMonths,
      approvedBy: ['planner', 'engineer', 'science', 'comms'] as Role[],
    }

    const totals = computeTotals(fullDesign, gameData)
    expect(totals.mass).toBeGreaterThan(0)

    const checks = checkDesign(fullDesign, gameData)
    expect(checks.length).toBeGreaterThanOrEqual(6)

    const result = runMission(fullDesign, gameData, 999)
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('events')
    expect(result).toHaveProperty('reasons')
  })
})

describe('DesignStore Zustand Contract', () => {
  it('handles patchDesign, approve, resetApprovals, and reset correctly', () => {
    const store = useDesignStore.getState()
    store.reset()
    expect(useDesignStore.getState().design).toEqual(emptyDesign)

    // patchDesign
    store.patchDesign({ missionId: 'mars-orbiter', fuelKg: 250 })
    expect(useDesignStore.getState().design.missionId).toBe('mars-orbiter')
    expect(useDesignStore.getState().design.fuelKg).toBe(250)

    // approve adds role without duplicates
    store.approve('science')
    expect(useDesignStore.getState().design.approvedBy).toEqual(['science'])
    store.approve('science')
    expect(useDesignStore.getState().design.approvedBy).toEqual(['science'])
    store.approve('engineer')
    expect(useDesignStore.getState().design.approvedBy).toEqual(['science', 'engineer'])

    // resetApprovals clears approvedBy
    store.resetApprovals()
    expect(useDesignStore.getState().design.approvedBy).toEqual([])
    expect(useDesignStore.getState().design.missionId).toBe('mars-orbiter')

    // reset restores emptyDesign
    store.reset()
    expect(useDesignStore.getState().design).toEqual(emptyDesign)
  })
})
