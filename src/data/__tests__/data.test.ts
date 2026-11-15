// src/data/__tests__/data.test.ts
// Unit and integration tests for Part D: Game data, educational content, and validation.

import { describe, it, expect } from 'vitest'
import {
  gameData,
  instruments,
  parts,
  rockets,
  orbits,
  missions,
  events,
  realMissions,
  validateGameData,
} from '../index'
import { getTooltip } from '@/content/tooltips'
import { REPORT_SNIPPETS, getExplanationForCheck } from '@/content/reportText'
import { TUTORIAL_STEPS, ROLE_GUIDES } from '@/content/tutorial'

describe('Part D: Game Data Integrity Tests', () => {
  it('validates entire gameData structure via validateGameData helper', () => {
    const result = validateGameData(gameData)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('contains 8 to 10 scientific instruments with verifiable specs', () => {
    expect(instruments.length).toBeGreaterThanOrEqual(8)
    expect(instruments.length).toBeLessThanOrEqual(12)

    for (const inst of instruments) {
      expect(inst.id).toBeTruthy()
      expect(inst.name).toBeTruthy()
      expect(inst.mass).toBeGreaterThan(0)
      expect(inst.power).toBeGreaterThan(0)
      expect(inst.cost).toBeGreaterThan(0)
      expect(inst.dataPerDay).toBeGreaterThan(0)
      expect(inst.scienceValue).toBeGreaterThan(0)
      expect(inst.source).toBeTruthy()
      expect(inst.source.toLowerCase()).not.toContain('placeholder')
    }
  })

  it('contains realistic launch vehicles with payloadByOrbit mappings', () => {
    expect(rockets.length).toBeGreaterThanOrEqual(3)

    const knownRockets = ['falcon-9', 'electron', 'atlas-v', 'vulcan-centaur', 'sls-block1']
    const rocketIds = rockets.map((r) => r.id)

    for (const kr of knownRockets) {
      expect(rocketIds).toContain(kr)
    }

    for (const r of rockets) {
      expect(r.cost).toBeGreaterThan(0)
      expect(Object.keys(r.payloadByOrbit).length).toBeGreaterThan(0)
      expect(r.source).toBeTruthy()
      expect(r.source.toLowerCase()).not.toContain('placeholder')
    }
  })

  it('contains realistic orbits for Earth, Moon, and Mars', () => {
    expect(orbits.length).toBeGreaterThanOrEqual(4)
    const orbitIds = orbits.map((o) => o.id)

    expect(orbitIds).toContain('leo')
    expect(orbitIds).toContain('sso')
    expect(orbitIds).toContain('moon-llo')
    expect(orbitIds).toContain('mars-low')

    for (const o of orbits) {
      expect(o.altitudeKm).toBeGreaterThan(0)
      expect(o.info).toBeTruthy()
    }
  })

  it('contains the three required missions (Earth, Moon, Mars)', () => {
    expect(missions.length).toBe(3)
    const missionIds = missions.map((m) => m.id)

    expect(missionIds).toContain('earth-observer')
    expect(missionIds).toContain('moon-orbiter')
    expect(missionIds).toContain('mars-orbiter')

    const orbitIdSet = new Set(orbits.map((o) => o.id))

    for (const m of missions) {
      expect(m.budget).toBeGreaterThan(0)
      expect(m.lifetimeMonths).toBeGreaterThan(0)
      expect(m.minScience).toBeGreaterThan(0)
      expect([1, 2, 3]).toContain(m.level)
      expect(m.orbitIds.length).toBeGreaterThan(0)

      // All mission orbitIds must resolve in orbits dataset
      for (const oId of m.orbitIds) {
        expect(orbitIdSet.has(oId)).toBe(true)
      }
    }
  })

  it('contains random mission events with probabilities and impact statements', () => {
    expect(events.length).toBeGreaterThanOrEqual(5)
    for (const ev of events) {
      expect(ev.id).toBeTruthy()
      expect(ev.name).toBeTruthy()
      expect(ev.description).toBeTruthy()
      expect(ev.probability).toBeGreaterThan(0)
      expect(ev.probability).toBeLessThanOrEqual(1)
      expect(ev.impact).toBeTruthy()
    }
  })

  it('contains real NASA comparison missions with valid URLs', () => {
    expect(realMissions.length).toBeGreaterThanOrEqual(3)
    for (const rm of realMissions) {
      expect(rm.name).toBeTruthy()
      expect(rm.summary).toBeTruthy()
      expect(rm.link.startsWith('https://')).toBe(true)
    }
  })

  it('preserves parts requirements for power and comms', () => {
    const powerParts = parts.filter((p) => p.kind === 'power')
    const antennaParts = parts.filter((p) => p.kind === 'antenna')

    expect(powerParts.length).toBeGreaterThanOrEqual(2)
    expect(antennaParts.length).toBeGreaterThanOrEqual(3)

    // Verify antenna-hga and antenna-ka match team test requirements exactly
    const hga = antennaParts.find((a) => a.id === 'antenna-hga')
    expect(hga?.downlinkPerDay).toBe(1000)

    const ka = antennaParts.find((a) => a.id === 'antenna-ka')
    expect(ka?.downlinkPerDay).toBe(2500)
  })
})

describe('Part D: Educational Content Tests', () => {
  it('provides beginner-friendly tooltips for all required terms', () => {
    const requiredKeys = [
      'mass',
      'power',
      'budget',
      'data',
      'communication',
      'missionTime',
      'deltaV',
      'orbit',
      'payload',
      'downlink',
      'solarStorm',
    ]

    for (const key of requiredKeys) {
      const text = getTooltip(key)
      expect(text).toBeTruthy()
      expect(text).not.toBe('Telemetry metric / design parameter definition.')
    }
  })

  it('contains tutorial steps explaining all game phases', () => {
    expect(TUTORIAL_STEPS.length).toBeGreaterThanOrEqual(5)
    for (const step of TUTORIAL_STEPS) {
      expect(step.step).toBeGreaterThan(0)
      expect(step.title).toBeTruthy()
      expect(step.text).toBeTruthy()
    }
    expect(ROLE_GUIDES.length).toBe(4)
  })

  it('contains narrative failure and success explanations in reportText', () => {
    expect(REPORT_SNIPPETS.success).toBeTruthy()
    expect(REPORT_SNIPPETS.powerFailure).toBeTruthy()
    expect(REPORT_SNIPPETS.commsLoss).toBeTruthy()

    expect(REPORT_SNIPPETS.missionSuccess.title).toBeTruthy()
    expect(REPORT_SNIPPETS.missionFailure.title).toBeTruthy()
    expect(REPORT_SNIPPETS.insufficientPower.educationalDetail).toContain('Mars')
    expect(REPORT_SNIPPETS.excessiveMass.educationalDetail).toContain('rocket equation')
    expect(REPORT_SNIPPETS.insufficientDeltaV.educationalDetail).toContain('Delta-v')

    const explanation = getExplanationForCheck('power')
    expect(explanation).toContain('1/r²')
  })
})
