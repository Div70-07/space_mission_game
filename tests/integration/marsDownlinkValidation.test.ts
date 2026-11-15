import { describe, it, expect } from 'vitest'
import { gameData } from '@/data'
import { computeTotals, checkDesign, computeEffectiveDownlink, getAttenuationFactor } from '@/engine'
import type { Design } from '@/shared/types'

describe('Mars Communication & Downlink Validation (Regression Test)', () => {
  const marsMission = gameData.missions.find((m) => m.id === 'mars-orbiter')
  const marsOrbit = gameData.orbits.find((o) => o.id === 'mars-low')
  const kaAntenna = gameData.parts.find((p) => p.id === 'antenna-ka')

  it('validates test setup against official game catalog', () => {
    expect(marsMission).toBeDefined()
    expect(marsMission?.name).toBe('Mars Atmospheric Evolution & Climate Surveyor')
    expect(marsOrbit).toBeDefined()
    expect(marsOrbit?.name).toContain('Low Mars Science Orbit')
    expect(kaAntenna).toBeDefined()
    expect(kaAntenna?.name).toBe('Deep Space Optical / Ka-Band Terminal')
    expect(kaAntenna?.downlinkPerDay).toBe(2500)
  })

  it('correctly calculates deep-space attenuation factor and effective downlink for Mars', () => {
    // 0.70 attenuation (-30% deep space Friis path loss penalty)
    const factor = getAttenuationFactor(marsOrbit, marsMission)
    expect(factor).toBe(0.7)

    // Raw: 2500 MB/day -> Effective: round(2500 * 0.70) = 1750 MB/day
    const effectiveDownlink = computeEffectiveDownlink(kaAntenna!.downlinkPerDay, marsOrbit, marsMission)
    expect(effectiveDownlink).toBe(1750)
  })

  it('passes comms validation when data generation is 800 MB/day with Ka-band antenna on Mars', () => {
    // Single instrument totaling exactly 800 MB/day: camera-highres (800 MB/day)
    const camera = gameData.instruments.find((i) => i.id === 'camera-highres')!
    expect(camera.dataPerDay).toBe(800)

    const design: Design = {
      missionId: 'mars-orbiter',
      instrumentIds: ['camera-highres'],
      powerSystemId: 'rtg-mmrtg',
      antennaId: 'antenna-ka',
      fuelKg: 1200,
      orbitId: 'mars-low',
      rocketId: 'sls-block1',
      lifetimeMonths: 36,
      approvedBy: ['science', 'engineer', 'comms', 'planner'],
    }

    const totals = computeTotals(design, gameData)
    expect(totals.dataPerDay).toBe(800)
    expect(totals.downlinkPerDay).toBe(2500)

    const checks = checkDesign(design, gameData)
    const commsCheck = checks.find((c) => c.id === 'comms')

    expect(commsCheck).toBeDefined()
    expect(commsCheck?.ok).toBe(true)
    expect(commsCheck?.message).toContain('nominal')
  })

  it('fails comms validation when instrument data generation exceeds 1750 MB/day on Mars', () => {
    // Pick heavy instruments totaling > 1750 MB/day
    // e.g. camera-highres (500) x 4 (if IDs could repeat or multiple large instruments)
    // In our instruments catalog:
    // camera-highres: 500, radar-altimeter: 200, spectrometer-ir: 100, mag-plasma: 100,
    // thermal-radiometer: 150, neutron-spectrometer: 80, atmospheric-lidar: 450,
    // uv-spectrograph: 250, subsurface-radar: 75, dust-analyzer: 50
    // Sum of all 10 instruments = 1955 MB/day > 1750 MB/day
    const allInstrumentIds = gameData.instruments.map((i) => i.id)
    const totalData = gameData.instruments.reduce((sum, i) => sum + i.dataPerDay, 0)
    expect(totalData).toBeGreaterThan(1750)

    const design: Design = {
      missionId: 'mars-orbiter',
      instrumentIds: allInstrumentIds,
      powerSystemId: 'rtg-nextgen',
      antennaId: 'antenna-ka',
      fuelKg: 1200,
      orbitId: 'mars-low',
      rocketId: 'sls-block1',
      lifetimeMonths: 36,
      approvedBy: [],
    }

    const totals = computeTotals(design, gameData)
    expect(totals.dataPerDay).toBe(totalData)
    expect(totals.downlinkPerDay).toBe(2500)

    const checks = checkDesign(design, gameData)
    const commsCheck = checks.find((c) => c.id === 'comms')

    expect(commsCheck).toBeDefined()
    expect(commsCheck?.ok).toBe(false)
    expect(commsCheck?.message).toContain('Downlink bottleneck')
  })

  it('fails comms validation when no antenna is equipped', () => {
    const design: Design = {
      missionId: 'mars-orbiter',
      instrumentIds: ['camera-highres'],
      powerSystemId: 'rtg-mmrtg',
      antennaId: '',
      fuelKg: 1200,
      orbitId: 'mars-low',
      rocketId: 'sls-block1',
      lifetimeMonths: 36,
      approvedBy: [],
    }

    const totals = computeTotals(design, gameData)
    expect(totals.downlinkPerDay).toBe(0)

    const checks = checkDesign(design, gameData)
    const commsCheck = checks.find((c) => c.id === 'comms')

    expect(commsCheck).toBeDefined()
    expect(commsCheck?.ok).toBe(false)
    expect(commsCheck?.message).toContain('No antenna')
  })
})
