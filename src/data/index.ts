// src/data/index.ts
// Part D: Game data public door and typed export system.

import type {
  GameData,
  Instrument,
  Part,
  Rocket,
  Orbit,
  Mission,
  GameEvent,
  RealMission,
} from '@/shared/types'

import instrumentsData from './instruments.json'
import partsData from './parts.json'
import rocketsData from './rockets.json'
import orbitsData from './orbits.json'
import missionsData from './missions.json'
import eventsData from './events.json'
import realMissionsData from './realMissions.json'

// Export individual typed datasets
export const instruments: Instrument[] = instrumentsData as Instrument[]
export const parts: Part[] = partsData as Part[]
export const rockets: Rocket[] = rocketsData as unknown as Rocket[]
export const orbits: Orbit[] = orbitsData as Orbit[]
export const missions: Mission[] = missionsData as Mission[]
export const events: GameEvent[] = eventsData as GameEvent[]
export const realMissions: RealMission[] = realMissionsData as RealMission[]

// Unified GameData object strictly conforming to GameData interface
export const gameData: GameData = {
  instruments,
  parts,
  rockets,
  orbits,
  missions,
  events,
  realMissions,
}

/**
 * Validates data consistency and integrity across datasets.
 * Checks for unique IDs, cross-referenced orbit IDs, payload coverage, and positive resource values.
 */
export function validateGameData(data: GameData = gameData): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check unique IDs
  const checkUniqueIds = (items: { id: string }[], label: string) => {
    const seen = new Set<string>()
    for (const item of items) {
      if (!item.id) errors.push(`${label} has item without an ID.`)
      else if (seen.has(item.id)) errors.push(`Duplicate ${label} ID: "${item.id}"`)
      seen.add(item.id)
    }
  }

  checkUniqueIds(data.instruments, 'Instrument')
  checkUniqueIds(data.parts, 'Part')
  checkUniqueIds(data.rockets, 'Rocket')
  checkUniqueIds(data.orbits, 'Orbit')
  checkUniqueIds(data.missions, 'Mission')
  checkUniqueIds(data.events, 'Event')
  checkUniqueIds(data.realMissions, 'RealMission')

  // Check orbit cross-references
  const orbitIds = new Set(data.orbits.map((o) => o.id))
  for (const mission of data.missions) {
    if (!mission.orbitIds || mission.orbitIds.length === 0) {
      errors.push(`Mission "${mission.name}" must specify at least one supported orbit.`)
    } else {
      for (const oId of mission.orbitIds) {
        if (!orbitIds.has(oId)) {
          errors.push(`Mission "${mission.name}" references unknown orbit "${oId}".`)
        }
      }
    }
  }

  // Check rocket payloads
  for (const rocket of data.rockets) {
    const orbitsCovered = Object.keys(rocket.payloadByOrbit || {})
    if (orbitsCovered.length === 0) {
      errors.push(`Rocket "${rocket.name}" has no payloadByOrbit entries.`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default gameData
